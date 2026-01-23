import { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/Navbar';

const MAIN_CATEGORIES = [
  'fashion', 'electronics', 'vehicles', 'real-estate', 'services',
  'home-garden', 'sports', 'books', 'pets', 'jobs', 'other'
];

export default function AdminMigrate() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const runMigration = async () => {
    setLoading(true);
    setResult('🚀 Starting migration...\n\n');
    
    try {
      const adsRef = collection(db, 'ads');
      const snapshot = await getDocs(adsRef);
      
      let updated = 0;
      let skipped = 0;
      let errors = 0;
      const logs: string[] = [];
      
      for (const adDoc of snapshot.docs) {
        const ad = adDoc.data();
        const updates: any = {};
        
        try {
          // 1. Add status if missing
          if (!ad.status) {
            updates.status = 'approved';
            logs.push(`✅ Adding status to ad: ${adDoc.id}`);
          }
          
          // 2. Extract mainCategory from category
          if (!ad.mainCategory && ad.category) {
            const mainCat = ad.category.split('-')[0];
            if (MAIN_CATEGORIES.includes(mainCat)) {
              updates.mainCategory = mainCat;
              logs.push(`✅ Adding mainCategory "${mainCat}" to ad: ${adDoc.id}`);
            }
          }
          
          // 3. Fix orphan categories (e.g., fashion → fashion-all)
          if (ad.category && !ad.category.includes('-')) {
            if (MAIN_CATEGORIES.includes(ad.category)) {
              updates.category = `${ad.category}-all`;
              logs.push(`✅ Fixing orphan category: ${ad.category} → ${updates.category} (ad: ${adDoc.id})`);
            }
          }
          
          // Apply updates if any
          if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, 'ads', adDoc.id), updates);
            updated++;
          } else {
            skipped++;
          }
          
        } catch (error: any) {
          logs.push(`❌ Error updating ad ${adDoc.id}: ${error.message}`);
          errors++;
        }
      }
      
      const summary = `\n📊 Migration Summary:\n` +
        `  Total ads: ${snapshot.size}\n` +
        `  Updated: ${updated}\n` +
        `  Skipped (already correct): ${skipped}\n` +
        `  Errors: ${errors}\n\n` +
        `✅ Migration complete!`;
      
      setResult(logs.join('\n') + summary);
    } catch (error: any) {
      setResult(`❌ Migration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container py-8">
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="text-3xl font-bold mb-6">🔧 Admin: Data Migration</h1>
          
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-bold mb-2">⚠️ Warning</h3>
            <p className="text-sm">
              This will update all existing ads to add:
            </p>
            <ul className="list-disc list-inside text-sm mt-2">
              <li>status: 'approved'</li>
              <li>mainCategory (extracted from category)</li>
              <li>Fix orphan categories (e.g., fashion → fashion-all)</li>
            </ul>
          </div>

          <button
            onClick={runMigration}
            disabled={loading}
            className="btn btn-primary mb-6"
            style={{ width: '100%' }}
          >
            {loading ? 'Running Migration...' : 'Run Migration'}
          </button>

          {result && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
