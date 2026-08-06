import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'wouter';
import MobileBottomNav from '../components/MobileBottomNav';

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
    if (!user) { setLocation('/login'); return; }
    loadUserAds();
  }, [user]);

  const loadUserAds = async () => {
    if (!user) return;
    try {
      const adsRef = collection(db, 'ads');
      const q = query(adsRef, where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ad[]);
    } catch (error) {
      console.error('Error loading user ads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-wrap">
      <header className="page-header">
        <Link href="/"><span className="page-header-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </span></Link>
        <h1 className="page-header-title">حسابي</h1>
        <Link href="/account-settings"><span className="page-header-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </span></Link>
      </header>

      <div className="page-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {user.email?.[0].toUpperCase()}
          </div>
          <div className="profile-info">
            <h2 className="profile-email">{user.email}</h2>
            <p className="profile-stats">{ads.length} إعلان منشور</p>
          </div>
        </div>

        {/* My Ads */}
        <div className="profile-section">
          <div className="profile-section-head">
            <h2>إعلاناتي</h2>
            <Link href="/create-ad"><span className="btn btn-primary btn-sm">+ إضافة</span></Link>
          </div>

          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : ads.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <h3>لا توجد إعلانات</h3>
              <p>لم تقم بنشر أي إعلان بعد</p>
              <Link href="/create-ad"><span className="btn btn-primary">إضافة إعلان جديد</span></Link>
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
                          <div className="hp-card-price">{(ad.price || 0).toLocaleString('ar-SA')} ل.س</div>
                        </div>
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
