#!/usr/bin/env node
/**
 * Migration Script: Fix existing ads data structure
 * 
 * This script:
 * 1. Adds status: 'approved' to all ads
 * 2. Adds mainCategory (extracted from category)
 * 3. Fixes "orphan" categories (e.g., fashion → fashion-all)
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase config (from your project)
const firebaseConfig = {
  apiKey: "AIzaSyAHEaXfpS7KTlxnhqGMWqBzX2Tz9Uw0Uu0",
  authDomain: "bare-android-app.firebaseapp.com",
  projectId: "bare-android-app",
  storageBucket: "bare-android-app.firebasestorage.app",
  messagingSenderId: "1060748253346",
  appId: "1:1060748253346:web:d4e2b2e7f8e3b9c9f8e3b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Main categories list
const MAIN_CATEGORIES = [
  'fashion', 'electronics', 'vehicles', 'real-estate', 'services',
  'home-garden', 'sports', 'books', 'pets', 'jobs', 'other'
];

async function migrateAds() {
  console.log('🚀 Starting migration...\n');
  
  const adsRef = collection(db, 'ads');
  const snapshot = await getDocs(adsRef);
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const adDoc of snapshot.docs) {
    const ad = adDoc.data();
    const updates = {};
    
    try {
      // 1. Add status if missing
      if (!ad.status) {
        updates.status = 'approved';
        console.log(`  ✅ Adding status to ad: ${adDoc.id}`);
      }
      
      // 2. Extract mainCategory from category
      if (!ad.mainCategory && ad.category) {
        // Extract main category (before the dash)
        const mainCat = ad.category.split('-')[0];
        if (MAIN_CATEGORIES.includes(mainCat)) {
          updates.mainCategory = mainCat;
          console.log(`  ✅ Adding mainCategory "${mainCat}" to ad: ${adDoc.id}`);
        }
      }
      
      // 3. Fix orphan categories (e.g., fashion → fashion-all)
      if (ad.category && !ad.category.includes('-')) {
        // This is an orphan category
        if (MAIN_CATEGORIES.includes(ad.category)) {
          updates.category = `${ad.category}-all`;
          console.log(`  ✅ Fixing orphan category: ${ad.category} → ${updates.category} (ad: ${adDoc.id})`);
        }
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, 'ads', adDoc.id), updates);
        updated++;
      } else {
        skipped++;
      }
      
    } catch (error) {
      console.error(`  ❌ Error updating ad ${adDoc.id}:`, error.message);
      errors++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`  Total ads: ${snapshot.size}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped (already correct): ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log('\n✅ Migration complete!');
}

// Run migration
migrateAds().catch(console.error);
