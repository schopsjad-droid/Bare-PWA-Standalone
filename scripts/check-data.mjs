import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function checkAds() {
  console.log('📊 Checking ads data...\n');
  
  const adsRef = db.collection('ads');
  const snapshot = await adsRef.get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    console.log(`📌 Ad ID: ${doc.id}`);
    console.log(`   title: ${data.title}`);
    console.log(`   category: ${data.category}`);
    console.log(`   mainCategory: ${data.mainCategory}`);
    console.log(`   status: ${data.status}`);
    console.log(`   images: ${Array.isArray(data.images) ? 'Array[' + data.images.length + ']' : typeof data.images}`);
    console.log('---');
  }
}

checkAds().then(() => process.exit(0));
