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
    <div>
      <Navbar />
      
      <div className="container py-8">
        <div className="card mb-6">
          <h1 className="text-3xl font-bold mb-4">حسابي</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center" style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              {user.email?.[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.email}</h2>
              <p className="text-gray-600">{ads.length} إعلان منشور</p>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">إعلاناتي</h2>

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
          <div className="grid grid-cols-1 grid-cols-sm-2 grid-cols-md-3">
            {ads.map(ad => (
              <Link key={ad.id} href={`/ad/${ad.id}`}>
                <a className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {ad.images && ad.images.length > 0 && (
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem'
                      }}
                    />
                  )}
                  <h3 className="font-semibold mb-2">{ad.title}</h3>
                  <span className="text-primary font-bold">{ad.price} ل.س</span>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

