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
      
      {/* Main container with proper padding */}
      <div className="container py-8">
        {/* Profile Card */}
        <div className="card mb-4">
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>حسابي</h1>
            <Link href="/account-settings">
              <a className="btn btn-outline" style={{ 
                padding: '8px 16px', 
                display: 'inline-block',
                width: 'fit-content'
              }}>
                ⚙️ الإعدادات
              </a>
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {user.email?.[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h2 style={{ 
                fontSize: '1rem', 
                fontWeight: '600',
                wordBreak: 'break-all'
              }}>{user.email}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {ads.length} إعلان منشور
              </p>
            </div>
          </div>
        </div>

        {/* My Ads Section */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>
          إعلاناتي
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="card text-center py-8">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>
              لا توجد إعلانات
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              لم تقم بنشر أي إعلان بعد
            </p>
            <Link href="/create-ad">
              <a className="btn btn-primary">
                + إضافة إعلان جديد
              </a>
            </Link>
          </div>
        ) : (
          /* Fixed Grid: Full width cards on mobile */
          <div className="grid grid-cols-1 grid-cols-sm-2 grid-cols-md-3">
            {ads.map(ad => (
              <Link key={ad.id} href={`/ad/${ad.id}`}>
                <a className="ad-card" style={{ 
                  display: 'block', 
                  textDecoration: 'none', 
                  color: 'inherit',
                  width: '100%'
                }}>
                  {ad.images && ad.images.length > 0 ? (
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      className="ad-image"
                    />
                  ) : (
                    <div className="ad-image" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem'
                    }}>
                      📷
                    </div>
                  )}
                  <div className="ad-content">
                    <h3 className="ad-title">{ad.title}</h3>
                    <span className="ad-price">
                      {ad.price?.toLocaleString() || 0} ل.س
                    </span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
