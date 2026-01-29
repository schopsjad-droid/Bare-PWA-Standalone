import { useState, useEffect } from 'react';
import MobileBottomNav from '../components/MobileBottomNav';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link, useRoute } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { formatPrice, type PriceType, findCategoryById } from '../constants/categories';
import FilterModal, { type FilterState, type SortOption } from '../components/FilterModal';
import FavoriteButton from '../components/FavoriteButton';
import Footer from '../components/Footer';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType?: PriceType;
  category: string;
  city: string;
  images: string[];
  createdAt: any;
  views?: number;
}

export default function AdsList() {
  const [, params] = useRoute('/category/:categoryId');
  const categoryId = params?.categoryId || 'all';
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    city: ''
  });

  useEffect(() => {
    loadAds();
  }, [categoryId, filters.sortBy]);

  const loadAds = async () => {
    try {
      setLoading(true);
      setIndexError(null);
      const adsRef = collection(db, 'ads');
      
      // Determine orderBy based on sortBy filter
      let orderByField: string;
      let orderByDirection: 'asc' | 'desc';
      
      switch (filters.sortBy) {
        case 'price-asc':
          orderByField = 'price';
          orderByDirection = 'asc';
          break;
        case 'price-desc':
          orderByField = 'price';
          orderByDirection = 'desc';
          break;
        case 'most-viewed':
          orderByField = 'views';
          orderByDirection = 'desc';
          break;
        case 'newest':
        default:
          orderByField = 'createdAt';
          orderByDirection = 'desc';
          break;
      }
      
      let q;
      if (categoryId === 'all') {
        q = query(adsRef, orderBy(orderByField, orderByDirection));
      } else {
        // This will require a composite index: category + orderByField
        q = query(
          adsRef,
          where('category', '==', categoryId),
          orderBy(orderByField, orderByDirection)
        );
      }
      
      const snapshot = await getDocs(q);
      const adsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ad[];
      
      setAds(adsData);
    } catch (error: any) {
      console.error('Error loading ads:', error);
      
      // Check if it's a Firebase index error
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        const match = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
        if (match) {
          setIndexError(match[0]);
        } else {
          setIndexError('INDEX_REQUIRED');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      city: ''
    });
    setSearchQuery('');
  };

  const filteredAds = ads.filter(ad => {
    try {
      // Safety check: skip ads with missing critical fields
      if (!ad || !ad.id || !ad.title) return false;
      
      // Search query filter
      if (searchQuery) {
        const matchesSearch = 
          (ad.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (ad.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
      }
      
      // City filter
      if (filters.city && ad.city !== filters.city) return false;
      
      // Price range filter (with safety checks)
      const adPrice = ad.price || 0;
      const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : null;
      const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : null;
      
      if (minPrice !== null && adPrice < minPrice) return false;
      if (maxPrice !== null && adPrice > maxPrice) return false;
      
      return true;
    } catch (error) {
      console.error('Error filtering ad:', ad.id, error);
      return false; // Skip corrupted ads
    }
  });

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.sortBy !== 'newest' || searchQuery;

  // Get category name for page title
  const category = findCategoryById(categoryId);
  const categoryName = category?.name || (categoryId === 'all' ? 'جميع الفئات' : 'الإعلانات');

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <Helmet>
        <title>{categoryName} | Bare</title>
        <meta name="description" content={`تصفح ${categoryName} في Bare. اشترِ وبِع بسهولة وأمان.`} />
      </Helmet>
      {/* Top Green Accent Line */}
      <div className="top-accent"></div>

      {/* Header */}
      <div className="header">
        <div className="header-content">
          <Link href="/">
            <a style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 8px',
              textDecoration: 'none'
            }}>
              ←
            </a>
          </Link>
          <Link href="/">
            <a className="logo" style={{ textDecoration: 'none' }}>Bare</a>
          </Link>
          <input
            type="text"
            className="search-bar"
            placeholder="ابحث في الإعلانات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, maxWidth: '500px' }}
          />
          <button
            onClick={() => setShowFilterModal(true)}
            className="btn"
            style={{
              padding: '8px 16px',
              backgroundColor: hasActiveFilters ? '#22c55e' : 'var(--bg-secondary)',
              color: hasActiveFilters ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            🔍 تصفية
            {hasActiveFilters && (
              <span style={{
                backgroundColor: 'white',
                color: '#22c55e',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Firebase Index Error Alert */}
      {indexError && (
        <div style={{
          padding: '16px 20px',
          background: '#fef3c7',
          borderBottom: '2px solid #f59e0b',
          color: '#92400e'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            ⚠️ يتطلب هذا البحث إنشاء فهرس في Firebase
          </div>
          <p style={{ fontSize: '14px', marginBottom: '12px' }}>
            للبحث باستخدام هذه الفلاتر، يجب إنشاء فهرس مركب في Firestore.
          </p>
          {indexError !== 'INDEX_REQUIRED' && (
            <a
              href={indexError}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                fontSize: '14px',
                padding: '8px 16px'
              }}
            >
              إنشاء الفهرس الآن
            </a>
          )}
        </div>
      )}

      {/* Results Counter and Reset Button */}
      {!loading && (
        <div style={{
          padding: '12px 20px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--divider-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            fontWeight: '500'
          }}>
            📊 تم العثور على {filteredAds.length} إعلان
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#22c55e',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500',
                textDecoration: 'underline'
              }}
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      )}

      {/* Ads Grid */}
      <div style={{ padding: '16px' }}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="card text-center py-8">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 className="text-xl font-bold" style={{ marginBottom: '8px' }}>
              لا توجد إعلانات
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {hasActiveFilters 
                ? 'لم يتم العثور على إعلانات تطابق معايير البحث'
                : 'لم يتم العثور على إعلانات في هذه الفئة'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="btn btn-primary"
              >
                مسح الفلاتر
              </button>
            ) : (
              <Link href="/create-ad">
                <a className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  + إضافة إعلان جديد
                </a>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 grid-cols-sm-2 grid-cols-md-3 grid-cols-lg-4">
            {filteredAds.map(ad => {
              try {
                // Safety checks for legacy data
                const safeAd = {
                  id: ad.id,
                  title: ad.title || 'إعلان بدون عنوان',
                  description: ad.description || '',
                  price: ad.price || 0,
                  priceType: ad.priceType || 'fixed',
                  category: ad.category || '',
                  city: ad.city || 'غير محدد',
                  images: Array.isArray(ad.images) ? ad.images : [],
                  views: ad.views || 0,
                  createdAt: ad.createdAt
                };
                
                return (
                  <div key={safeAd.id} style={{ position: 'relative' }}>
                    <Link href={`/ad/${safeAd.id}`}>
                      <a className="ad-card" style={{ textDecoration: 'none' }}>
                        {safeAd.images.length > 0 ? (
                          <img
                            src={safeAd.images[0]}
                            alt={safeAd.title}
                            className="ad-image"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'ad-image';
                                fallback.style.display = 'flex';
                                fallback.style.alignItems = 'center';
                                fallback.style.justifyContent = 'center';
                                fallback.style.fontSize = '48px';
                                fallback.textContent = '📦';
                                parent.insertBefore(fallback, e.target);
                              }
                            }}
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
                          <div className="ad-title">{safeAd.title}</div>
                          <div className="ad-price" style={{
                            color: (safeAd.priceType === 'free') ? '#22c55e' : undefined
                          }}>
                            {formatPrice({ amount: safeAd.price, type: safeAd.priceType })}
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '4px'
                          }}>
                            <div className="ad-location">📍 {safeAd.city}</div>
                            {safeAd.views > 0 && (
                              <div style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <span>👁️</span>
                                <span>{safeAd.views}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </a>
                    </Link>
                    
                    {/* Favorite Button Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      zIndex: 10
                    }}>
                      <FavoriteButton adId={safeAd.id} size="medium" />
                    </div>
                  </div>
                );
              } catch (error) {
                console.error('Error rendering ad:', ad?.id, error);
                return null; // Skip corrupted ads silently
              }
            })}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />

      {/* Bottom Navigation */}
      <MobileBottomNav />

      <Footer />
    </div>
  );
}
