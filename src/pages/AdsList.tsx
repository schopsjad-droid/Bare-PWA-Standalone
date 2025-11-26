import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Link, useRoute } from 'wouter';
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
  createdAt: any;
}

export default function AdsList() {
  const [, params] = useRoute('/category/:categoryId');
  const categoryId = params?.categoryId || 'all';
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-low' | 'price-high'>('newest');

  useEffect(() => {
    loadAds();
  }, [categoryId]);

  const loadAds = async () => {
    try {
      setLoading(true);
      const adsRef = collection(db, 'ads');
      
      let q;
      if (categoryId === 'all') {
        q = query(adsRef, orderBy('createdAt', 'desc'));
      } else {
        q = query(
          adsRef,
          where('category', '==', categoryId),
          orderBy('createdAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      const adsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ad[];
      
      setAds(adsData);
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedAds = ads
    .filter(ad => {
      if (!searchQuery) return true;
      return (
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt?.seconds - a.createdAt?.seconds;
        case 'oldest':
          return a.createdAt?.seconds - b.createdAt?.seconds;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
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
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        padding: '12px 20px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--divider-color)',
        display: 'flex',
        gap: '12px',
        overflowX: 'auto'
      }}>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="newest">الأحدث</option>
          <option value="oldest">الأقدم</option>
          <option value="price-low">السعر: من الأقل للأعلى</option>
          <option value="price-high">السعر: من الأعلى للأقل</option>
        </select>
      </div>

      {/* Ads Grid */}
      <div style={{ padding: '16px' }}>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : filteredAndSortedAds.length === 0 ? (
          <div className="card text-center py-8">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <h3 className="text-xl font-bold" style={{ marginBottom: '8px' }}>
              لا توجد إعلانات
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
              لم يتم العثور على إعلانات في هذه الفئة
            </p>
            <Link href="/create-ad">
              <a className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                + إضافة إعلان جديد
              </a>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 grid-cols-sm-2 grid-cols-md-3">
            {filteredAndSortedAds.map(ad => (
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
    </div>
  );
}

