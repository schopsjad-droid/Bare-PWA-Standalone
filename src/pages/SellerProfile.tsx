import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { doc, getDoc, collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import MobileBottomNav from '../components/MobileBottomNav';
import ReviewModal from '../components/ReviewModal';
import { formatPrice, type PriceType } from '../constants/categories';

interface SellerData { username: string; email?: string; ratingSum?: number; ratingCount?: number; createdAt?: any; }
interface Review { id: string; reviewerId: string; reviewerName: string; rating: number; comment: string | null; createdAt: any; }
interface Ad { id: string; title: string; price: number; priceType?: PriceType; images: string[]; city: string; createdAt: any; status?: string; }

export default function SellerProfile() {
  const { user } = useAuth();
  const [, params] = useRoute('/seller/:sellerId');
  const sellerId = params?.sellerId || '';
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ads' | 'reviews'>('ads');
  const [userExistingRating, setUserExistingRating] = useState<number | null>(null);

  useEffect(() => { if (sellerId) loadSellerData(); }, [sellerId, user]);

  const loadSellerData = async () => {
    try {
      setLoading(true);
      const sellerDoc = await getDoc(doc(db, 'users', sellerId));
      if (sellerDoc.exists()) setSeller(sellerDoc.data() as SellerData);
      const reviewsSnap = await getDocs(query(collection(db, 'users', sellerId, 'reviews'), orderBy('createdAt', 'desc')));
      const reviewsData = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Review[];
      setReviews(reviewsData);
      if (user) { const ur = reviewsData.find(r => r.reviewerId === user.uid); setUserExistingRating(ur ? ur.rating : null); }
      const adsSnap = await getDocs(query(collection(db, 'ads'), where('userId', '==', sellerId)));
      setAds(adsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((a: any) => a.status === 'approved' || !a.status).sort((a: any, b: any) => (b.createdAt?.toDate?.()?.getTime() || 0) - (a.createdAt?.toDate?.()?.getTime() || 0)) as Ad[]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const avgRating = seller?.ratingCount && seller?.ratingSum ? (seller.ratingSum / seller.ratingCount).toFixed(1) : null;

  if (loading) return <div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  if (!seller) return (
    <div className="page-wrap">
      <header className="page-header"><Link href="/"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link><h1 className="page-header-title">البائع غير موجود</h1><div className="page-header-spacer"/></header>
      <div className="empty-state"><h3>لم نتمكن من العثور على هذا البائع</h3><Link href="/"><span className="btn btn-primary">العودة للرئيسية</span></Link></div>
      <MobileBottomNav />
    </div>
  );

  return (
    <div className="page-wrap">
      <header className="page-header">
        <Link href="/"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
        <h1 className="page-header-title">ملف البائع</h1>
        <div className="page-header-spacer" />
      </header>

      <div className="page-content">
        {/* Seller Card */}
        <div className="card seller-card">
          <div className="seller-card-top">
            <div className="seller-avatar-lg">{seller.username?.charAt(0) || 'B'}</div>
            <div className="seller-card-info">
              <h1 className="seller-card-name">{seller.username}</h1>
              {avgRating && (
                <div className="seller-card-rating">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span className="seller-card-rating-num">{avgRating}</span>
                  <span className="seller-card-rating-count">({seller.ratingCount} تقييم)</span>
                </div>
              )}
              <span className="seller-card-ads-count">{ads.length} إعلان نشط</span>
            </div>
          </div>
          {user && user.uid !== sellerId && (
            userExistingRating ? (
              <div className="seller-rated-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bare-green)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg><span>تم التقييم ({userExistingRating}/5)</span></div>
            ) : (
              <button onClick={() => setShowReviewModal(true)} className="btn btn-primary btn-full">أضف تقييم</button>
            )
          )}
        </div>

        {/* Tabs */}
        <div className="tabs-bar">
          <button onClick={() => setActiveTab('ads')} className={`tab-btn${activeTab === 'ads' ? ' active' : ''}`}>الإعلانات ({ads.length})</button>
          <button onClick={() => setActiveTab('reviews')} className={`tab-btn${activeTab === 'reviews' ? ' active' : ''}`}>التقييمات ({reviews.length})</button>
        </div>

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          ads.length === 0 ? (
            <div className="empty-state"><h3>لا توجد إعلانات نشطة حالياً</h3></div>
          ) : (
            <div className="grid grid-cols-1 grid-cols-sm-2 grid-cols-md-3">
              {ads.map(ad => (
                <Link key={ad.id} href={`/ad/${ad.id}`}>
                  <span className="ad-card">
                    {ad.images?.length > 0 ? <img src={ad.images[0]} alt={ad.title} className="ad-image" loading="lazy" /> : <div className="ad-image ad-image-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--bare-text-muted)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>}
                    <div className="ad-content"><div className="ad-title">{ad.title}</div><div className="ad-price">{formatPrice({ amount: ad.price, type: ad.priceType || 'fixed' })}</div><div className="ad-location">{ad.city}</div></div>
                  </span>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          reviews.length === 0 ? (
            <div className="empty-state"><h3>لا توجد تقييمات بعد</h3></div>
          ) : (
            <div className="reviews-list">
              {reviews.map(r => (
                <div key={r.id} className="card review-card">
                  <div className="review-header">
                    <div><div className="review-name">{r.reviewerName}</div><div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div></div>
                    <span className="review-date">{r.createdAt?.toDate?.().toLocaleDateString('ar-SY')}</span>
                  </div>
                  {r.comment && <p className="review-comment">{r.comment}</p>}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <ReviewModal isOpen={showReviewModal} onClose={() => { setShowReviewModal(false); loadSellerData(); }} sellerId={sellerId} sellerName={seller.username} />
      <MobileBottomNav />
    </div>
  );
}
