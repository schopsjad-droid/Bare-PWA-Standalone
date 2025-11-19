import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import Navbar from '../components/Navbar';
import { Link } from 'wouter';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  images: string[];
  createdAt: any;
}

export default function Home() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const adsRef = collection(db, 'ads');
      const q = query(adsRef, orderBy('createdAt', 'desc'));
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

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || ad.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'جميع الفئات', icon: '📦' },
    { id: 'electronics', name: 'إلكترونيات', icon: '📱' },
    { id: 'vehicles', name: 'مركبات', icon: '🚗' },
    { id: 'real-estate', name: 'عقارات', icon: '🏠' },
    { id: 'furniture', name: 'أثاث', icon: '🛋️' },
    { id: 'fashion', name: 'أزياء', icon: '👔' },
    { id: 'other', name: 'أخرى', icon: '📦' },
  ];

  return (
    <div>
      <Navbar />
      
      <div className="container py-8">
        {/* Search Bar */}
        <div className="card mb-6">
          <input
            type="text"
            className="input"
            placeholder="ابحث عن الإعلانات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-6" style={{ overflowX: 'auto' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Ads Grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="spinner"></div>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-3xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">لا توجد إعلانات بعد</h3>
            <p className="text-gray-600 mb-4">كن أول من ينشر إعلاناً في هذه المنصة!</p>
            <Link href="/create-ad">
              <a className="btn btn-primary">
                + إضافة إعلان جديد
              </a>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 grid-cols-sm-2 grid-cols-md-3 grid-cols-lg-4">
            {filteredAds.map(ad => (
              <Link key={ad.id} href={`/ad/${ad.id}`}>
                <a className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {ad.images && ad.images.length > 0 && (
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem'
                      }}
                    />
                  )}
                  <h3 className="font-semibold mb-2">{ad.title}</h3>
                  <p className="text-gray-600 text-sm mb-2" style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {ad.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-bold">{ad.price} ل.س</span>
                    <span className="text-sm text-gray-600">{ad.city}</span>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

