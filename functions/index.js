/**
 * Firebase Cloud Functions for Bare PWA
 * 
 * This file contains Cloud Functions that run automatically
 * in response to Firebase events.
 */

const functions = require('firebase-functions/v1');
const { initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { getStorage } = require('firebase-admin/storage');
const {
  buildNotificationPayload,
  chunkTokens,
  collectTokenTargets,
  determineRecipient,
  isConfirmedDeadTokenError,
} = require('./notification-helpers');

// Initialize Firebase Admin SDK
initializeApp();
const firestore = getFirestore();
const messaging = getMessaging();
const storage = getStorage();

/**
 * Cloud Function: Clean up storage when an ad is deleted
 * 
 * Triggers: When a document is deleted from the 'ads' collection
 * Purpose: Automatically delete associated images from Firebase Storage
 * 
 * This prevents storage bloat by ensuring that when an ad is deleted,
 * all its images are also removed from storage.
 */
exports.cleanupAdImages = functions.region('europe-west1').firestore
  .document('ads/{adId}')
  .onDelete(async (snap, context) => {
    const deletedAd = snap.data();
    const adId = context.params.adId;

    console.log(`Ad deleted: ${adId}`);

    // Check if the ad has images
    if (!deletedAd.images || deletedAd.images.length === 0) {
      console.log('No images to delete');
      return null;
    }

    const bucket = storage.bucket();
    const deletePromises = [];

    // Extract file path from Firebase Storage URL
    const getFilePathFromUrl = (url) => {
      try {
        const decodedUrl = decodeURIComponent(url);
        const match = decodedUrl.match(/\/o\/(.+?)\?/);
        return match ? match[1] : null;
      } catch (error) {
        console.error('Error extracting file path:', error);
        return null;
      }
    };

    // Delete each image
    for (const imageUrl of deletedAd.images) {
      const filePath = getFilePathFromUrl(imageUrl);
      
      if (filePath) {
        console.log(`Deleting image: ${filePath}`);
        
        const file = bucket.file(filePath);
        deletePromises.push(
          file.delete()
            .then(() => {
              console.log(`Successfully deleted: ${filePath}`);
            })
            .catch((error) => {
              console.error(`Error deleting ${filePath}:`, error);
              // Don't throw - continue with other deletions
            })
        );
      }
    }

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

    console.log(`Cleanup completed for ad: ${adId}`);
    return null;
  });

/**
 * Cloud Function: Send notification when a new message is created
 * 
 * Triggers: When a new document is created in 'chats/{chatId}/messages' subcollection
 * Purpose: Send push notification to the recipient
 * 
 * Flow:
 * 1. Get message data (senderId, text)
 * 2. Get chat data to find recipient
 * 3. Get recipient's FCM tokens
 * 4. Send notification to all recipient's devices
 */
exports.sendMessageNotification = functions.region('europe-west1').firestore
  .document('chats/{chatId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const message = snap.data();
    const chatId = context.params.chatId;
    const messageId = context.params.messageId;

    try {
      const chatRef = firestore.collection('chats').doc(chatId);
      const chatDoc = await chatRef.get();
      if (!chatDoc.exists) {
        console.warn('Notification skipped because chat is missing', { chatId, messageId });
        return null;
      }

      const chatData = chatDoc.data();
      const recipient = determineRecipient(chatData, message);
      if (!recipient) {
        console.warn('Notification skipped because sender/participants are invalid', { chatId, messageId });
        return null;
      }

      const userRef = firestore.collection('users').doc(recipient.recipientId);
      const [userDoc, deviceSnapshot] = await Promise.all([
        userRef.get(),
        userRef.collection('devices').get(),
      ]);
      const legacyTokens = userDoc.exists && Array.isArray(userDoc.data().fcmTokens)
        ? userDoc.data().fcmTokens
        : [];
      const targets = collectTokenTargets(
        deviceSnapshot.docs.map(deviceDoc => ({
          data: deviceDoc.data(),
          id: deviceDoc.id,
          ref: deviceDoc.ref,
        })),
        legacyTokens,
      );
      if (targets.mobileTokens.length === 0 && targets.legacyTokens.length === 0) {
        console.log('Notification skipped because recipient has no registered tokens', { chatId, messageId });
        return null;
      }

      const payload = buildNotificationPayload({
        adId: chatData.adId,
        chatId,
        messageId,
        messageText: message.text,
        senderId: recipient.senderId,
        senderName: recipient.senderName,
      });
      const deadMobileTokens = new Set();
      const deadLegacyTokens = new Set();

      const sendBatches = async (tokens, messageForBatch, deadTokens) => {
        for (const tokenBatch of chunkTokens(tokens)) {
          let result;
          try {
            result = await messaging.sendEachForMulticast(messageForBatch(tokenBatch));
          } catch (error) {
            console.error('FCM batch delivery failed without token cleanup', {
              code: error.code || 'unknown',
              count: tokenBatch.length,
            });
            continue;
          }

          result.responses.forEach((response, index) => {
            const token = tokenBatch[index];
            if (!response.success && token && isConfirmedDeadTokenError(response.error)) {
              deadTokens.add(token);
            }
          });
        }
      };

      await sendBatches(
        targets.mobileTokens,
        tokens => ({
          android: { priority: 'high', ttl: 24 * 60 * 60 * 1000 },
          data: payload.data,
          tokens,
        }),
        deadMobileTokens,
      );
      deadMobileTokens.forEach(token => {
        if (targets.legacyTokenSet.has(token)) deadLegacyTokens.add(token);
      });
      await sendBatches(
        targets.legacyTokens,
        tokens => ({
          data: payload.data,
          notification: payload.notification,
          tokens,
          webpush: {
            fcmOptions: { link: `https://bare-syria.com/chat/${chatId}` },
            notification: { renotify: true, tag: chatId },
          },
        }),
        deadLegacyTokens,
      );

      const deadDeviceRefs = [];
      deadMobileTokens.forEach(token => {
        (targets.mobileDocumentsByToken.get(token) || []).forEach(device => deadDeviceRefs.push(device.ref));
      });
      for (let offset = 0; offset < deadDeviceRefs.length; offset += 450) {
        const batch = firestore.batch();
        deadDeviceRefs.slice(offset, offset + 450).forEach(reference => batch.delete(reference));
        try {
          await batch.commit();
        } catch (error) {
          console.error('Failed to remove confirmed dead device registrations', {
            code: error.code || 'unknown',
            count: Math.min(450, deadDeviceRefs.length - offset),
          });
        }
      }

      if (deadLegacyTokens.size > 0 && userDoc.exists) {
        try {
          await userRef.update({
            fcmTokens: FieldValue.arrayRemove(...deadLegacyTokens),
          });
        } catch (error) {
          console.error('Failed to remove confirmed dead legacy tokens', {
            code: error.code || 'unknown',
            count: deadLegacyTokens.size,
          });
        }
      }

      console.log('Message notification processing completed', {
        chatId,
        legacyTargets: targets.legacyTokens.length,
        messageId,
        mobileTargets: targets.mobileTokens.length,
      });
      return null;
    } catch (error) {
      console.error('Message notification processing failed without affecting the message', {
        chatId,
        code: error.code || 'unknown',
        messageId,
      });
      return null;
    }
  });

/**
 * Additional Cloud Functions can be added here
 * 
 * Examples:
 * - Send notification when ad is created
 * - Update user statistics
 * - Generate thumbnails for images
 * - Moderate content
 */

