import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'wouter';
import Navbar from '../components/Navbar';
import FavoriteButton from '../components/FavoriteButton';
import ProtectedRoute from '../components/ProtectedRoute';
import { formatPrice, type PriceType } from '../constants/categories';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType?: PriceType;
  category: string;
  city: string;
  images: string[];
  userId: string;
  username: string;
  createdAt: any;
}

export default function Favorites() {
  const { user, userProfile } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.favorites && userProfile.favorites.length > 0) {
      loadFavoriteAds();
    } else {
      setLoading(false);
    }
  }, [userProfile]);

  const loadFavoriteAds = async () => {
    try {
      const favoriteIds = userProfile?.favorites || [];
      
      if (favoriteIds.length === 0) {
        setAds([]);
        setLoading(false);
        return;
      }

      // Firestore 'in' query has a limit of 10 items
      // Split into chunks if more than 10
      const chunks: string[][] = [];
      for (let i = 0; i < favoriteIds.length; i += 10) {
        chunks.push(favoriteIds.slice(i, i + 10));
      }

      const allAds: Ad[] = [];
      
      for (const chunk of chunks) {
        const adsRef = collection(db, 'ads');
        const q = query(adsRef, where(documentId(), 'in', chunk));
        const snapshot = await getDocs(q);
        
        const chunkAds = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ad[];
        
        allAds.push(...chunkAds);
      }

      setAds(allAds);
    } catch (error) {
      console.error('Error loading favorite ads:', error);
      alert('حدث خطأ في تحميل المفضلة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
      <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
        <div className="top-accent"></div>
        <Navbar />

        <div className="container py-6">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            ❤️ المفضلة
          </h1>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : ads.length === 0 ? (
            <div className="card text-center py-12">
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>❤️</div>
              <h3 className="text-xl font-bold mb-2">لا توجد إعلانات محفوظة</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                ابدأ بحفظ الإعلانات التي تعجبك
              </p>
              <Link href="/">
                <a className="btn btn-primary">
                  تصفح الإعلانات
                </a>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {ads.map(ad => (
                <div key={ad.id} style={{ position: 'relative' }}>
                  <Link href={`/ad/${ad.id}`}>
                    <a style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="card" style={{
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        {/* Image */}
                        <div style={{
                          width: '100%',
                          height: '200px',
                          background: ad.images[0] ? `url(${ad.images[0]})` : 'var(--bg-secondary)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '8px',
                          marginBottom: '12px'
                        }}>
                          {!ad.images[0] && (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '48px'
                            }}>
                              📦
                            </div>
                          )}
                        </div>

                        {/* Title */}
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: 600,
                          marginBottom: '8px',
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {ad.title}
                        </h3>

                        {/* Price */}
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: (ad.priceType === 'free') ? '#22c55e' : '#22c55e',
                          marginBottom: '8px'
                        }}>
                          {formatPrice({ amount: ad.price, type: ad.priceType || 'fixed' })}
                        </div>

                        {/* Location */}
                        <div style={{
                          fontSize: '14px',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>📍</span>
                          <span>{ad.city}</span>
                        </div>
                      </div>
                    </a>
                  </Link>

                  {/* Favorite Button */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 10
                  }}>
                    <FavoriteButton adId={ad.id} size="medium" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '12px 0',
          zIndex: 999
        }}>
          <Link href="/">
            <a style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>🏠</span>
              <span>الرئيسية</span>
            </a>
          </Link>
          <Link href="/favorites">
            <a style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: '#dc2626',
              textDecoration: 'none',
              fontSize: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>❤️</span>
              <span>المفضلة</span>
            </a>
          </Link>
          <Link href="/create-ad">
            <a style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>➕</span>
              <span>إضافة</span>
            </a>
          </Link>
          <Link href="/messages">
            <a style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>💬</span>
              <span>الرسائل</span>
            </a>
          </Link>
          <Link href="/profile">
            <a style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>👤</span>
              <span>حسابي</span>
            </a>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
