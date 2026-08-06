import { useState, useEffect } from 'react';
import MobileBottomNav from '../components/MobileBottomNav';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link, useRoute, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { formatPrice, type PriceType, findCategoryById } from '../constants/categories';
import FilterModal, { type FilterState, type SortOption } from '../components/FilterModal';
import FavoriteButton from '../components/FavoriteButton';
import StatusBadge from '../components/StatusBadge';
import { calculateDistance, formatDistance } from '../utils/geo';

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
  listingStatus?: string;
  latitude?: number;
  longitude?: number;
}

export default function AdsList() {
  const [, params] = useRoute('/category/:categoryId');
  const [, setLocation] = useLocation();
  const categoryId = params?.categoryId || 'all';
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({ minPrice: '', maxPrice: '', sortBy: 'newest', city: '', distanceKm: '', listingStatus: '' });

  useEffect(() => { loadAds(); }, [categoryId, filters.sortBy]);

  const loadAds = async () => {
    try {
      setLoading(true); setIndexError(null);
      const adsRef = collection(db, 'ads');
      let orderByField = 'createdAt', orderByDirection: 'asc' | 'desc' = 'desc';
      switch (filters.sortBy) {
        case 'price-asc': orderByField = 'price'; orderByDirection = 'asc'; break;
        case 'price-desc': orderByField = 'price'; orderByDirection = 'desc'; break;
        case 'most-viewed': orderByField = 'views'; orderByDirection = 'desc'; break;
      }
      const q = categoryId === 'all'
        ? query(adsRef, orderBy(orderByField, orderByDirection))
        : query(adsRef, where('category', '==', categoryId), orderBy(orderByField, orderByDirection));
      const snapshot = await getDocs(q);
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Ad[]);
    } catch (error: any) {
      console.error('Error loading ads:', error);
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        const match = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/);
        setIndexError(match ? match[0] : 'INDEX_REQUIRED');
      }
    } finally { setLoading(false); }
  };

  const handleApplyFilters = (newFilters: FilterState) => { setFilters(newFilters); };
  const handleResetFilters = () => { setFilters({ minPrice: '', maxPrice: '', sortBy: 'newest', city: '', distanceKm: '', listingStatus: '' }); setSearchQuery(''); };

  const filteredAds = ads.filter(ad => {
    if (!ad || !ad.id || !ad.title) return false;
    // Search query
    if (searchQuery) {
      const s = searchQuery.toLowerCase();
      if (!(ad.title || '').toLowerCase().includes(s) && !(ad.description || '').toLowerCase().includes(s)) return false;
    }
    // City filter
    if (filters.city && ad.city !== filters.city) return false;
    // Price filter
    const p = ad.price || 0;
    if (filters.minPrice && p < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && p > parseFloat(filters.maxPrice)) return false;
    // ListingStatus filter
    if (filters.listingStatus) {
      const adStatus = ad.listingStatus || 'available';
      if (adStatus !== filters.listingStatus) return false;
    } else {
      // Default: exclude sold
      const adStatus = ad.listingStatus || 'available';
      if (adStatus === 'sold') return false;
    }
    return true;
  });

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.sortBy !== 'newest' || filters.city || filters.distanceKm || filters.listingStatus || searchQuery;
  const category = findCategoryById(categoryId);
  const categoryName = category?.name || (categoryId === 'all' ? 'جميع الفئات' : 'الإعلانات');

  return (
    <div className="page-wrap">
      <Helmet>
        <title>{categoryName} | Bare</title>
        <meta name="description" content={`تصفح ${categoryName} في Bare.`} />
      </Helmet>

      {/* Header */}
      <header className="page-header">
        <Link href="/"><span className="page-header-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </span></Link>
        <input type="text" className="search-bar" placeholder={`ابحث في ${categoryName}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1 }} />
        <button onClick={() => setShowFilterModal(true)} className={`ads-filter-btn${hasActiveFilters ? ' active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>
        </button>
        <button onClick={() => setLocation('/map')} className="ads-map-btn" title="عرض على الخريطة">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
        </button>
      </header>

      {/* Results counter */}
      {!loading && (
        <div className="ads-counter">
          <span>{filteredAds.length} إعلان</span>
          {hasActiveFilters && <button onClick={handleResetFilters} className="ads-reset">مسح الفلاتر</button>}
        </div>
      )}

      {/* Content */}
      <div className="page-content">
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : filteredAds.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h3>{hasActiveFilters ? 'لا توجد نتائج' : 'لا توجد إعلانات'}</h3>
            <p>{hasActiveFilters ? 'جرّب تغيير معايير البحث' : 'لم يتم العثور على إعلانات في هذه الفئة'}</p>
            {hasActiveFilters ? (
              <button onClick={handleResetFilters} className="btn btn-primary">مسح الفلاتر</button>
            ) : (
              <Link href="/create-ad"><span className="btn btn-primary">+ إضافة إعلان</span></Link>
            )}
          </div>
        ) : (
          <div className="fav-grid">
            {filteredAds.map(ad => {
              const safeAd = { ...ad, title: ad.title || 'إعلان', city: ad.city || '', images: Array.isArray(ad.images) ? ad.images : [], views: ad.views || 0 };
              const hasImage = safeAd.images.length > 0 && safeAd.images[0];
              const adStatus = ad.listingStatus || 'available';
              return (
                <div key={safeAd.id} className="hp-card-wrap">
                  <Link href={`/ad/${safeAd.id}`}>
                    <span className="hp-card">
                      <div className="hp-card-img">
                        {hasImage ? (
                          <img src={safeAd.images[0]} alt="" loading="lazy" />
                        ) : (
                          <div className="hp-card-placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        )}
                        {adStatus !== 'available' && (
                          <div className="hp-card-status"><StatusBadge listingStatus={adStatus} size="sm" /></div>
                        )}
                      </div>
                      <div className="hp-card-body">
                        <h3 className="hp-card-title">{safeAd.title}</h3>
                        <div className="hp-card-price">{formatPrice({ amount: safeAd.price || 0, type: safeAd.priceType || 'fixed' })}</div>
                        <div className="hp-card-meta">
                          {safeAd.city && <span>{safeAd.city}</span>}
                          {safeAd.views > 0 && <span>{safeAd.views} مشاهدة</span>}
                        </div>
                      </div>
                    </span>
                  </Link>
                  <div className="hp-card-fav"><FavoriteButton adId={safeAd.id} size="small" /></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <FilterModal isOpen={showFilterModal} onClose={() => setShowFilterModal(false)} onApply={handleApplyFilters} initialFilters={filters} />
      <MobileBottomNav />
    </div>
  );
}
