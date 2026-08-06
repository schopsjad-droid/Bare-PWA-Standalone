import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import MobileBottomNav from '../components/MobileBottomNav';
import FavoriteButton from '../components/FavoriteButton';
import { useAuth } from '../contexts/AuthContext';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: string;
  category: string;
  mainCategory: string;
  city: string;
  images: string[];
  views: number;
  userId: string;
  username: string;
  createdAt: any;
  attributes?: Record<string, any>;
  isFeatured?: boolean;
  status: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [filterCity, setFilterCity] = useState<string>('');
  const categorySheetRef = useRef<HTMLDivElement>(null);

  // Main categories
  const mainCategories: Category[] = [
    { id: 'all', name: 'كل الفئات', icon: '📦' },
    { id: 'vehicles', name: 'السيارات', icon: '🚗' },
    { id: 'real-estate', name: 'العقارات', icon: '🏠' },
    { id: 'electronics', name: 'الإلكترونيات', icon: '📱' },
    { id: 'home-garden', name: 'المنزل والحديقة', icon: '🏡' },
    { id: 'fashion', name: 'الأزياء', icon: '👔' },
    { id: 'jobs', name: 'الوظائف', icon: '💼' },
    { id: 'services', name: 'الخدمات', icon: '🔧' },
    { id: 'pets', name: 'الحيوانات الأليفة', icon: '🐾' },
    { id: 'family-kids', name: 'عائلة وطفل', icon: '👶' },
    { id: 'leisure', name: 'هوايات', icon: '🎨' },
    { id: 'media', name: 'كتب وموسيقى', icon: '📚' },
    { id: 'give-away', name: 'للمنح', icon: '🎁' },
    { id: 'courses', name: 'دروس ودورات', icon: '📖' },
    { id: 'tickets', name: 'تذاكر', icon: '🎫' },
    { id: 'neighbors', name: 'مساعدة الجيران', icon: '🤝' },
  ];

  // Fetch category counts and ads from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const adsRef = collection(db, 'ads');
        const approvedQuery = query(adsRef, where('status', '==', 'approved'));
        const snapshot = await getDocs(approvedQuery);

        // Count by mainCategory
        const counts: Record<string, number> = { all: 0 };
        const allAds: Ad[] = [];

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          counts.all++;
          if (data.mainCategory) {
            counts[data.mainCategory] = (counts[data.mainCategory] || 0) + 1;
          }
          allAds.push({ id: doc.id, ...data } as Ad);
        });

        setCategoryCounts(counts);

        // Sort by createdAt descending
        allAds.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setAds(allAds);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingAds(false);
      }
    };

    fetchData();
  }, []);

  // Close category sheet on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categorySheetRef.current && !categorySheetRef.current.contains(e.target as Node)) {
        setShowCategorySheet(false);
      }
    };
    if (showCategorySheet) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategorySheet]);

  // Filter and sort ads
  const getFilteredAds = () => {
    let filtered = [...ads];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ad => ad.mainCategory === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(ad =>
        ad.title?.toLowerCase().includes(q) ||
        ad.description?.toLowerCase().includes(q)
      );
    }

    // City filter
    if (filterCity.trim()) {
      filtered = filtered.filter(ad =>
        ad.city?.toLowerCase().includes(filterCity.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      // newest first (default)
      filtered.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    }

    return filtered;
  };

  const filteredAds = getFilteredAds();

  // Format price
  const formatPrice = (price: number, priceType: string) => {
    if (priceType === 'free') return 'مجاناً';
    if (priceType === 'negotiable') return `${price.toLocaleString('ar-SA')} ل.س (قابل للتفاوض)`;
    if (priceType === 'monthly') return `${price.toLocaleString('ar-SA')} ل.س / شهرياً`;
    return `${price.toLocaleString('ar-SA')} ل.س`;
  };

  // Format relative time
  const formatTime = (createdAt: any) => {
    if (!createdAt?.seconds) return '';
    const now = Date.now() / 1000;
    const diff = now - createdAt.seconds;
    if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 604800) return `قبل ${Math.floor(diff / 86400)} يوم`;
    return `قبل ${Math.floor(diff / 604800)} أسبوع`;
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setShowCategorySheet(false);
  };

  const selectedCategoryName = mainCategories.find(c => c.id === selectedCategory)?.name || 'كل الفئات';

  return (
    <div className="home-page">
      <Helmet>
        <title>Bare - بيع وشراء في سوريا</title>
        <meta name="description" content="منصة للإعلانات المبوبة. اشترِ وبِع سيارات، عقارات، إلكترونيات وأكثر بسهولة وأمان." />
      </Helmet>

      {/* Header */}
      <header className="home-header">
        <div className="home-header-content">
          <Link href="/">
            <a className="home-logo">Bare</a>
          </Link>
          
          <div className="home-header-actions">
            {!user ? (
              <Link href="/login">
                <a className="home-login-btn">تسجيل الدخول</a>
              </Link>
            ) : (
              <Link href="/profile">
                <a className="home-profile-btn">
                  <span>👤</span>
                </a>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="home-search-section">
        <div className="home-search-wrapper">
          <span className="home-search-icon">🔍</span>
          <input
            type="text"
            className="home-search-input"
            placeholder="ابحث عن أي شيء..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Selector */}
      <div className="home-category-selector">
        <button
          className="home-category-btn"
          onClick={() => setShowCategorySheet(!showCategorySheet)}
        >
          <span className="home-category-btn-icon">☰</span>
          <span className="home-category-btn-text">{selectedCategoryName}</span>
          <span className="home-category-btn-arrow">▾</span>
        </button>
      </div>

      {/* Category Sheet/Dropdown */}
      {showCategorySheet && (
        <>
          {/* Backdrop for mobile */}
          <div className="home-category-backdrop" onClick={() => setShowCategorySheet(false)} />
          <div className="home-category-sheet" ref={categorySheetRef}>
            <div className="home-category-sheet-header">
              <h3>اختر الفئة</h3>
              <button onClick={() => setShowCategorySheet(false)} className="home-category-sheet-close">✕</button>
            </div>
            <div className="home-category-sheet-list">
              {mainCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`home-category-sheet-item ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  <span className="home-category-sheet-item-icon">{cat.icon}</span>
                  <span className="home-category-sheet-item-name">{cat.name}</span>
                  <span className="home-category-sheet-item-count">{categoryCounts[cat.id] || 0}</span>
                </button>
              ))}
            </div>
            <div className="home-category-sheet-footer">
              <small>الأعداد تأتي من Firestore (Live)</small>
            </div>
          </div>
        </>
      )}

      {/* Filter Bar */}
      <div className="home-filter-bar">
        <div className="home-filter-chip">
          <span>💰</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="home-filter-select"
          >
            <option value="newest">الأحدث</option>
            <option value="price-asc">السعر: الأقل</option>
            <option value="price-desc">السعر: الأعلى</option>
          </select>
        </div>

        <div className="home-filter-chip">
          <span>📍</span>
          <input
            type="text"
            placeholder="الموقع"
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="home-filter-input"
          />
        </div>

        <div className="home-filter-chip">
          <span>↕️</span>
          <span className="home-filter-label">الفرز</span>
        </div>
      </div>

      {/* Listings Section */}
      <div className="home-listings-section">
        <div className="home-listings-header">
          <h2 className="home-listings-title">أحدث الإعلانات</h2>
          <Link href="/category/all">
            <a className="home-listings-viewall">عرض الكل ‹</a>
          </Link>
        </div>

        {loadingAds ? (
          <div className="home-listings-loading">
            {/* Skeleton cards */}
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="home-listing-skeleton">
                <div className="home-listing-skeleton-image" />
                <div className="home-listing-skeleton-content">
                  <div className="home-listing-skeleton-title" />
                  <div className="home-listing-skeleton-price" />
                  <div className="home-listing-skeleton-meta" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="home-listings-empty">
            <span className="home-listings-empty-icon">📦</span>
            <p>لا توجد إعلانات{selectedCategory !== 'all' ? ' في هذه الفئة' : ''}</p>
          </div>
        ) : (
          <div className="home-listings-grid">
            {filteredAds.slice(0, 12).map(ad => (
              <div key={ad.id} className="home-listing-card-wrapper">
                <Link href={`/ad/${ad.id}`}>
                  <a className="home-listing-card">
                    {/* Image */}
                    <div className="home-listing-image-container">
                      {ad.images && ad.images.length > 0 ? (
                        <img
                          src={ad.images[0]}
                          alt={ad.title}
                          className="home-listing-image"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '';
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="home-listing-image-placeholder">📷</div>
                      )}
                      
                      {/* Featured badge */}
                      {ad.isFeatured && (
                        <span className="home-listing-badge">مميز</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="home-listing-content">
                      <h3 className="home-listing-title">{ad.title || 'إعلان بدون عنوان'}</h3>
                      <div className="home-listing-price">
                        {formatPrice(ad.price || 0, ad.priceType || 'fixed')}
                      </div>
                      <div className="home-listing-meta">
                        <span className="home-listing-meta-item">
                          <span>📍</span> {ad.city || 'غير محدد'}
                        </span>
                        {ad.createdAt && (
                          <span className="home-listing-meta-item">
                            <span>⏱</span> {formatTime(ad.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="home-listing-footer">
                        {ad.attributes?.condition && (
                          <span className="home-listing-condition">{ad.attributes.condition}</span>
                        )}
                        {ad.username && (
                          <span className="home-listing-seller">
                            <span>👤</span> {ad.username}
                          </span>
                        )}
                        {ad.views > 0 && (
                          <span className="home-listing-views">
                            <span>👁️</span> {ad.views}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                </Link>

                {/* Favorite Button */}
                <div className="home-listing-favorite">
                  <FavoriteButton adId={ad.id} size="medium" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
