/**
 * Firebase Cloud Functions for Bare PWA
 * 
 * This file contains Cloud Functions that run automatically
 * in response to Firebase events.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

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

    const bucket = admin.storage().bucket();
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

    console.log(`New message in chat ${chatId}: ${messageId}`);

    try {
      // Get chat data to find participants
      const chatRef = admin.firestore().collection('chats').doc(chatId);
      const chatDoc = await chatRef.get();

      if (!chatDoc.exists) {
        console.error('Chat not found:', chatId);
        return null;
      }

      const chatData = chatDoc.data();
      const senderId = message.senderId;
      const senderName = message.senderName || 'مستخدم';
      const messageText = message.text || '';

      // Find recipient (the other participant)
      const recipientId = chatData.participants.find(id => id !== senderId);

      if (!recipientId) {
        console.error('Recipient not found in chat:', chatId);
        return null;
      }

      console.log(`Recipient: ${recipientId}`);

      // Get recipient's FCM tokens
      const userRef = admin.firestore().collection('users').doc(recipientId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.error('Recipient user not found:', recipientId);
        return null;
      }

      const userData = userDoc.data();
      const fcmTokens = userData.fcmTokens || [];

      if (fcmTokens.length === 0) {
        console.log('Recipient has no FCM tokens');
        return null;
      }

      console.log(`Sending notification to ${fcmTokens.length} devices`);

      // Prepare notification payload
      const payload = {
        notification: {
          title: `رسالة جديدة من ${senderName}`,
          body: messageText.length > 100 ? messageText.substring(0, 100) + '...' : messageText,
        },
        data: {
          chatId: chatId,
          senderId: senderId,
          messageId: messageId,
          url: `/chat/${chatId}`
        }
      };

      // Send notification to all tokens
      const sendPromises = fcmTokens.map(async (token) => {
        try {
          await admin.messaging().send({
            token: token,
            ...payload
          });
          console.log(`Notification sent to token: ${token.substring(0, 20)}...`);
        } catch (error) {
          console.error(`Error sending to token ${token.substring(0, 20)}:`, error);
          
          // If token is invalid, remove it from user's tokens
          if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
            console.log('Removing invalid token');
            await userRef.update({
              fcmTokens: admin.firestore.FieldValue.arrayRemove(token)
            });
          }
        }
      });

      await Promise.all(sendPromises);

      console.log(`Notification sent for message: ${messageId}`);
      return null;
    } catch (error) {
      console.error('Error sending notification:', error);
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

