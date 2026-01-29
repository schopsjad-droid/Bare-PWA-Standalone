import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Known main categories (without subcategory suffix)
const MAIN_CATEGORIES = [
  'fashion', 'electronics', 'vehicles', 'real-estate', 'jobs', 
  'services', 'furniture', 'sports', 'kids', 'pets', 'media', 'other'
];

function extractMainCategory(category) {
  // Check if category matches a known main category exactly
  for (const main of MAIN_CATEGORIES) {
    if (category === main || category.startsWith(main + '-')) {
      return main;
    }
  }
  // Fallback: split by first dash
  return category.split('-')[0];
}

async function fixAds() {
  console.log('🔧 Fixing ads data...\n');
  
  const adsRef = db.collection('ads');
  const snapshot = await adsRef.get();
  
  let fixed = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    
    // Fix orphan categories (main category without subcategory)
    if (data.category && MAIN_CATEGORIES.includes(data.category)) {
      updates.category = `${data.category}-all`;
      console.log(`   Fixing orphan category: ${data.category} -> ${updates.category}`);
    }
    
    // Fix incorrect mainCategory
    const correctMainCategory = extractMainCategory(updates.category || data.category);
    if (data.mainCategory !== correctMainCategory) {
      updates.mainCategory = correctMainCategory;
      console.log(`   Fixing mainCategory: ${data.mainCategory} -> ${correctMainCategory}`);
    }
    
    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      fixed++;
      console.log(`✅ Fixed ad ${doc.id}: ${data.title}`);
      console.log(`   Updates:`, updates);
      console.log('---');
    }
  }
  
  console.log(`\n========================================`);
  console.log(`✅ Fix complete! Fixed ${fixed} ads`);
  console.log(`========================================`);
}

fixAds().then(() => process.exit(0));
