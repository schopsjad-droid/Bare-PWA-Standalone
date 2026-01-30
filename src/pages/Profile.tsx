import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Link, useLocation } from 'wouter';

interface Ad {
  id: string;
  title: string;
  price: number;
  images: string[];
  createdAt: any;
}

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLocation('/login');
      return;
    }
    loadUserAds();
  }, [user]);

  const loadUserAds = async () => {
    if (!user) return;

    try {
      const adsRef = collection(db, 'ads');
      const q = query(adsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      
      const adsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ad[];
      
      setAds(adsData);
    } catch (error) {
      console.error('Error loading user ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Main container with proper padding */}
      <div className="w-full px-4 py-8 max-w-6xl mx-auto">
        {/* Profile Card */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">حسابي</h1>
            <Link href="/account-settings">
              <a className="btn inline-flex items-center justify-center gap-2 px-4 py-2">
                ⚙️ الإعدادات
              </a>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '1.75rem',
                fontWeight: 'bold'
              }}>
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold truncate">{user.email}</h2>
              <p className="text-gray-600">{ads.length} إعلان منشور</p>
            </div>
          </div>
        </div>

        {/* My Ads Section */}
        <h2 className="text-xl sm:text-2xl font-bold mb-4">إعلاناتي</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-3xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">لا توجد إعلانات</h3>
            <p className="text-gray-600 mb-4">لم تقم بنشر أي إعلان بعد</p>
            <Link href="/create-ad">
              <a className="btn btn-primary">
                + إضافة إعلان جديد
              </a>
            </Link>
          </div>
        ) : (
          /* Fixed Grid: 1 column on mobile, 2 on tablet, 3 on desktop */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map(ad => (
              <Link key={ad.id} href={`/ad/${ad.id}`}>
                {/* Card with full width and proper overflow handling */}
                <a className="card block w-full overflow-hidden hover:shadow-lg transition-shadow"
                   style={{ textDecoration: 'none', color: 'inherit' }}>
                  {ad.images && ad.images.length > 0 && (
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold mb-2 truncate">{ad.title}</h3>
                  <span className="text-primary font-bold">{ad.price.toLocaleString()} ل.س</span>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
