import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Load service account from file
const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrateAds() {
  console.log('🚀 Starting migration...');
  
  const adsRef = db.collection('ads');
  const snapshot = await adsRef.get();
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const doc of snapshot.docs) {
    try {
      const data = doc.data();
      const updates = {};
      
      // 1. Add status if missing
      if (!data.status) {
        updates.status = 'approved';
      }
      
      // 2. Fix orphan categories (no subcategory) - check first
      if (data.category && !data.category.includes('-')) {
        updates.category = `${data.category}-all`;
        updates.mainCategory = data.category;
      }
      // 3. Extract mainCategory from category if not already set
      else if (data.category && !data.mainCategory) {
        const parts = data.category.split('-');
        updates.mainCategory = parts[0];
      }
      
      // 4. Ensure images is array (convert if it's an object/map)
      if (data.images && typeof data.images === 'object' && !Array.isArray(data.images)) {
        updates.images = Object.values(data.images);
      }
      
      if (Object.keys(updates).length > 0) {
        await doc.ref.update(updates);
        updated++;
        console.log(`✅ Updated ad ${doc.id}:`, JSON.stringify(updates));
      } else {
        skipped++;
      }
    } catch (error) {
      errors++;
      console.error(`❌ Error updating ad ${doc.id}:`, error.message);
    }
  }
  
  console.log(`\n========================================`);
  console.log(`✅ Migration complete!`);
  console.log(`   Updated: ${updated} ads`);
  console.log(`   Skipped (already OK): ${skipped} ads`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total: ${snapshot.size} ads`);
  console.log(`========================================`);
}

migrateAds().then(() => process.exit(0)).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
