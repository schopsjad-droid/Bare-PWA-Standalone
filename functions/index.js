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
exports.cleanupAdImages = functions.firestore
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
 * Additional Cloud Functions can be added here
 * 
 * Examples:
 * - Send notification when ad is created
 * - Update user statistics
 * - Generate thumbnails for images
 * - Moderate content
 */

