import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { doc, getDoc, collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ReviewModal from '../components/ReviewModal';
import { formatPrice, type PriceType } from '../constants/categories';

interface SellerData {
  username: string;
  email?: string;
  ratingSum?: number;
  ratingCount?: number;
  createdAt?: any;
}

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  createdAt: any;
}

interface Ad {
  id: string;
  title: string;
  price: number;
  priceType?: PriceType;
  images: string[];
  city: string;
  createdAt: any;
}

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

  useEffect(() => {
    if (sellerId) {
      loadSellerData();
    }
  }, [sellerId]);

  const loadSellerData = async () => {
    try {
      setLoading(true);
      
      // Load seller info
      const sellerDoc = await getDoc(doc(db, 'users', sellerId));
      if (sellerDoc.exists()) {
        setSeller(sellerDoc.data() as SellerData);
      }

      // Load reviews
      const reviewsRef = collection(db, 'users', sellerId, 'reviews');
      const reviewsQuery = query(reviewsRef, orderBy('createdAt', 'desc'));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsData);

      // Load seller's ads
      const adsRef = collection(db, 'ads');
      const adsQuery = query(
        adsRef,
        where('userId', '==', sellerId),
        orderBy('createdAt', 'desc')
      );
      const adsSnapshot = await getDocs(adsQuery);
      const adsData = adsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ad[];
      setAds(adsData);
    } catch (error) {
      console.error('Error loading seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = seller?.ratingCount && seller?.ratingSum
    ? (seller.ratingSum / seller.ratingCount).toFixed(1)
    : null;

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ fontSize: '16px' }}>
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center py-8">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div>
        <Navbar />
        <div className="container py-8">
          <div className="card text-center">
            <h2 className="text-xl font-bold mb-4">البائع غير موجود</h2>
            <Link href="/">
              <a className="btn btn-primary">العودة للرئيسية</a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="top-accent"></div>
      <Navbar />

      <div className="container py-6">
        {/* Seller Info Card */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}>
                {seller.username}
              </h1>
              {averageRating && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <span style={{ fontSize: '20px' }}>⭐</span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#f59e0b'
                  }}>
                    {averageRating}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)'
                  }}>
                    ({seller.ratingCount} تقييم)
                  </span>
                </div>
              )}
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                📦 {ads.length} إعلان نشط
              </div>
            </div>
          </div>

          {/* Add Review Button */}
          {user && user.uid !== sellerId && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              ⭐ أضف تقييم
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          borderBottom: '2px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('ads')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'ads' ? '3px solid #22c55e' : 'none',
              color: activeTab === 'ads' ? '#22c55e' : 'var(--text-secondary)',
              fontWeight: activeTab === 'ads' ? 'bold' : 'normal',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            📦 الإعلانات ({ads.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'reviews' ? '3px solid #22c55e' : 'none',
              color: activeTab === 'reviews' ? '#22c55e' : 'var(--text-secondary)',
              fontWeight: activeTab === 'reviews' ? 'bold' : 'normal',
              fontSize: '16px',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            ⭐ التقييمات ({reviews.length})
          </button>
        </div>

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          <div>
            {ads.length === 0 ? (
              <div className="card text-center py-8">
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  لا توجد إعلانات نشطة حالياً
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 grid-cols-sm-2 grid-cols-md-3">
                {ads.map(ad => (
                  <Link key={ad.id} href={`/ad/${ad.id}`}>
                    <a className="ad-card" style={{ textDecoration: 'none' }}>
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
                          fontSize: '48px'
                        }}>
                          📦
                        </div>
                      )}
                      <div className="ad-content">
                        <div className="ad-title">{ad.title}</div>
                        <div className="ad-price" style={{
                          color: (ad.priceType === 'free') ? '#22c55e' : undefined
                        }}>
                          {formatPrice({ amount: ad.price, type: ad.priceType || 'fixed' })}
                        </div>
                        <div className="ad-location">📍 {ad.city}</div>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            {reviews.length === 0 ? (
              <div className="card text-center py-8">
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  لا توجد تقييمات بعد
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reviews.map(review => (
                  <div key={review.id} className="card">
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          marginBottom: '4px'
                        }}>
                          {review.reviewerName}
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)'
                      }}>
                        {review.createdAt?.toDate?.().toLocaleDateString('ar-SY')}
                      </div>
                    </div>
                    {review.comment && (
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '14px',
                        marginTop: '8px',
                        lineHeight: '1.5'
                      }}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          loadSellerData(); // Reload to show new review
        }}
        sellerId={sellerId}
        sellerName={seller.username}
      />
    </div>
  );
}
