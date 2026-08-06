import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import MobileBottomNav from '../components/MobileBottomNav';
import FavoriteButton from '../components/FavoriteButton';
import StatusBadge from '../components/StatusBadge';
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
  listingStatus?: string;
  latitude?: number;
  longitude?: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adsRef = collection(db, 'ads');
        const approvedQuery = query(adsRef, where('status', '==', 'approved'));
        const snapshot = await getDocs(approvedQuery);
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
        allAds.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setAds(allAds);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingAds(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categorySheetRef.current && !categorySheetRef.current.contains(e.target as Node)) {
        setShowCategorySheet(false);
      }
    };
    if (showCategorySheet) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategorySheet]);

  const getFilteredAds = () => {
    let filtered = [...ads];
    if (selectedCategory !== 'all') filtered = filtered.filter(ad => ad.mainCategory === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(ad => ad.title?.toLowerCase().includes(q) || ad.description?.toLowerCase().includes(q));
    }
    if (filterCity.trim()) filtered = filtered.filter(ad => ad.city?.toLowerCase().includes(filterCity.toLowerCase()));
    if (sortBy === 'price-asc') filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === 'price-desc') filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    else filtered.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return filtered;
  };

  const filteredAds = getFilteredAds();

  const formatPrice = (price: number, priceType: string) => {
    if (priceType === 'free') return 'مجاناً';
    if (priceType === 'negotiable') return `${price.toLocaleString('ar-SA')} ل.س`;
    if (priceType === 'monthly') return `${price.toLocaleString('ar-SA')} ل.س / شهرياً`;
    return `${price.toLocaleString('ar-SA')} ل.س`;
  };

  const formatTime = (createdAt: any) => {
    if (!createdAt?.seconds) return '';
    const diff = Date.now() / 1000 - createdAt.seconds;
    if (diff < 3600) return `قبل ${Math.floor(diff / 60)} د`;
    if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} س`;
    if (diff < 604800) return `قبل ${Math.floor(diff / 86400)} ي`;
    return `قبل ${Math.floor(diff / 604800)} أ`;
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setShowCategorySheet(false);
  };

  const selectedCategoryName = mainCategories.find(c => c.id === selectedCategory)?.name || 'كل الفئات';

  const ProfileIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );

  return (
    <div className="hp">
      <Helmet>
        <title>Bare - بيع وشراء في سوريا</title>
        <meta name="description" content="منصة للإعلانات المبوبة. اشترِ وبِع سيارات، عقارات، إلكترونيات وأكثر." />
      </Helmet>

      {/* Header */}
      <header className="hp-header">
        <Link href="/"><span className="hp-logo">Bare</span></Link>
        <div className="hp-header-action">
          {!user ? (
            <Link href="/login"><span className="hp-login-btn">تسجيل الدخول</span></Link>
          ) : (
            <Link href="/profile"><span className="hp-profile-btn"><ProfileIcon /></span></Link>
          )}
        </div>
      </header>

      {/* Search */}
      <div className="hp-search">
        <svg className="hp-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          className="hp-search-input"
          placeholder="ابحث عن أي شيء..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Selector - full width on mobile */}
      <div className="hp-cat-row">
        <button className="hp-cat-btn" onClick={() => setShowCategorySheet(!showCategorySheet)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span>{selectedCategoryName}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      {/* Category Bottom Sheet */}
      {showCategorySheet && (
        <>
          <div className="hp-overlay" onClick={() => setShowCategorySheet(false)} />
          <div className="hp-sheet" ref={categorySheetRef}>
            <div className="hp-sheet-handle" />
            <div className="hp-sheet-header">
              <h3>اختر الفئة</h3>
              <button onClick={() => setShowCategorySheet(false)} className="hp-sheet-close">✕</button>
            </div>
            <div className="hp-sheet-list">
              {mainCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`hp-sheet-item${selectedCategory === cat.id ? ' active' : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  <span className="hp-sheet-item-icon">{cat.icon}</span>
                  <span className="hp-sheet-item-name">{cat.name}</span>
                  <span className="hp-sheet-item-count">{categoryCounts[cat.id] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Filter Bar */}
      <div className="hp-filters">
        <div className="hp-filter-chip">
          <span>السعر</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="hp-filter-sel">
            <option value="newest">الأحدث</option>
            <option value="price-asc">الأقل</option>
            <option value="price-desc">الأعلى</option>
          </select>
        </div>
        <div className="hp-filter-chip">
          <span>الموقع</span>
          <input type="text" placeholder="المدينة" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="hp-filter-inp" />
        </div>
        <Link href="/map"><span className="hp-filter-chip hp-filter-map">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          <span>الخريطة</span>
        </span></Link>
      </div>

      {/* Listings */}
      <div className="hp-listings">
        <div className="hp-listings-head">
          <h2>أحدث الإعلانات</h2>
          <Link href="/category/all"><span className="hp-viewall">عرض الكل ‹</span></Link>
        </div>

        {loadingAds ? (
          <div className="hp-skeletons">
            {[1, 2, 3].map(i => (
              <div key={i} className="hp-skel">
                <div className="hp-skel-img" />
                <div className="hp-skel-body">
                  <div className="hp-skel-line w70" />
                  <div className="hp-skel-line w40" />
                  <div className="hp-skel-line w60" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="hp-empty">
            <p>لا توجد إعلانات{selectedCategory !== 'all' ? ' في هذه الفئة' : ''}</p>
          </div>
        ) : (
          <div className="hp-cards">
            {filteredAds.slice(0, 12).map(ad => {
              const hasImage = ad.images && ad.images.length > 0 && ad.images[0];
              return (
                <div key={ad.id} className="hp-card-wrap">
                  <Link href={`/ad/${ad.id}`}>
                    <span className="hp-card">
                      {/* Image - left side on mobile */}
                      <div className="hp-card-img">
                        {hasImage ? (
                          <img src={ad.images[0]} alt="" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="hp-card-placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        )}
                        {ad.isFeatured && <span className="hp-card-badge">مميز</span>}
                        {(ad.listingStatus === 'reserved' || ad.listingStatus === 'sold') && (
                          <div className="hp-card-status"><StatusBadge listingStatus={ad.listingStatus} size="sm" /></div>
                        )}
                      </div>

                      {/* Content - right side on mobile */}
                      <div className="hp-card-body">
                        <h3 className="hp-card-title">{ad.title || 'إعلان'}</h3>
                        <div className="hp-card-price">{formatPrice(ad.price || 0, ad.priceType || 'fixed')}</div>
                        <div className="hp-card-meta">
                          {ad.city && <span>📍 {ad.city}</span>}
                          {ad.createdAt && <span>⏱ {formatTime(ad.createdAt)}</span>}
                        </div>
                        <div className="hp-card-extra">
                          {ad.attributes?.condition && <span className="hp-card-cond">{ad.attributes.condition}</span>}
                          {ad.username && <span className="hp-card-seller">{ad.username}</span>}
                          {ad.views > 0 && <span className="hp-card-views">👁 {ad.views}</span>}
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
  );
}
