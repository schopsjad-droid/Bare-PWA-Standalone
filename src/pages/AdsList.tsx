import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link, useRoute } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { formatPrice, type PriceType } from '../constants/categories';
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
    sortBy: 'newest'
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
      sortBy: 'newest'
    });
    setSearchQuery('');
  };

  const filteredAds = ads.filter(ad => {
    // Search query filter
    if (searchQuery) {
      const matchesSearch = 
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }
    
    // Price range filter
    const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : null;
    const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : null;
    
    if (minPrice !== null && ad.price < minPrice) return false;
    if (maxPrice !== null && ad.price > maxPrice) return false;
    
    return true;
  });

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.sortBy !== 'newest' || searchQuery;

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
            {filteredAds.map(ad => (
              <div key={ad.id} style={{ position: 'relative' }}>
                <Link href={`/ad/${ad.id}`}>
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
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '4px'
                      }}>
                        <div className="ad-location">📍 {ad.city}</div>
                        {ad.views !== undefined && ad.views > 0 && (
                          <div style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>👁️</span>
                            <span>{ad.views}</span>
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
                  <FavoriteButton adId={ad.id} size="medium" />
                </div>
              </div>
            ))}
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
      <div className="mobile-bottom-nav" style={{
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
            color: 'var(--accent-green)',
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
            color: 'var(--text-secondary)',
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

      <Footer />
    </div>
  );
}
