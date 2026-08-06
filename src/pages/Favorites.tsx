import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'wouter';
import FavoriteButton from '../components/FavoriteButton';
import MobileBottomNav from '../components/MobileBottomNav';
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
      if (favoriteIds.length === 0) { setAds([]); setLoading(false); return; }
      const chunks: string[][] = [];
      for (let i = 0; i < favoriteIds.length; i += 10) { chunks.push(favoriteIds.slice(i, i + 10)); }
      const allAds: Ad[] = [];
      for (const chunk of chunks) {
        const adsRef = collection(db, 'ads');
        const q = query(adsRef, where(documentId(), 'in', chunk));
        const snapshot = await getDocs(q);
        const chunkAds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ad[];
        allAds.push(...chunkAds);
      }
      setAds(allAds);
    } catch (error) {
      console.error('Error loading favorite ads:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
      <div className="page-wrap">
        {/* Header */}
        <header className="page-header">
          <Link href="/"><span className="page-header-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </span></Link>
          <h1 className="page-header-title">المفضلة</h1>
          <div className="page-header-spacer" />
        </header>

        <div className="page-content">
          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : ads.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <h3>لا توجد إعلانات محفوظة</h3>
              <p>ابدأ بحفظ الإعلانات التي تعجبك لتجدها هنا لاحقاً</p>
              <Link href="/"><span className="btn btn-primary">تصفح الإعلانات</span></Link>
            </div>
          ) : (
            <div className="fav-grid">
              {ads.map(ad => {
                const hasImage = ad.images && ad.images.length > 0 && ad.images[0];
                return (
                  <div key={ad.id} className="hp-card-wrap">
                    <Link href={`/ad/${ad.id}`}>
                      <span className="hp-card">
                        <div className="hp-card-img">
                          {hasImage ? (
                            <img src={ad.images[0]} alt="" loading="lazy" />
                          ) : (
                            <div className="hp-card-placeholder">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            </div>
                          )}
                        </div>
                        <div className="hp-card-body">
                          <h3 className="hp-card-title">{ad.title || 'إعلان'}</h3>
                          <div className="hp-card-price">{formatPrice({ amount: ad.price, type: ad.priceType || 'fixed' })}</div>
                          <div className="hp-card-meta">
                            {ad.city && <span>📍 {ad.city}</span>}
                          </div>
                        </div>
                      </span>
                    </Link>
                    <div className="hp-card-fav">
                      <FavoriteButton adId={ad.id} size="small" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <MobileBottomNav />
      </div>
    </ProtectedRoute>
  );
}
