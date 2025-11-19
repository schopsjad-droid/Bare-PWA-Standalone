import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Navbar from '../components/Navbar';

interface Ad {
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  images: string[];
  userEmail: string;
  createdAt: any;
}

export default function AdDetails() {
  const [, params] = useRoute('/ad/:id');
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params?.id) {
      loadAd(params.id);
    }
  }, [params?.id]);

  const loadAd = async (id: string) => {
    try {
      const docRef = doc(db, 'ads', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setAd(docSnap.data() as Ad);
      }
    } catch (error) {
      console.error('Error loading ad:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div>
        <Navbar />
        <div className="container py-8">
          <div className="card text-center">
            <h2 className="text-2xl font-bold mb-2">الإعلان غير موجود</h2>
            <p className="text-gray-600">عذراً، لم نتمكن من العثور على هذا الإعلان</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="container py-8">
        <div className="grid grid-cols-1" style={{ gap: '2rem' }}>
          {/* Images */}
          <div className="card">
            {ad.images && ad.images.length > 0 && (
              <div>
                <img
                  src={ad.images[currentImageIndex]}
                  alt={ad.title}
                  style={{
                    width: '100%',
                    maxHeight: '500px',
                    objectFit: 'contain',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}
                />
                {ad.images.length > 1 && (
                  <div className="flex gap-2" style={{ overflowX: 'auto' }}>
                    {ad.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`صورة ${idx + 1}`}
                        onClick={() => setCurrentImageIndex(idx)}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          border: idx === currentImageIndex ? '2px solid #3b82f6' : 'none'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="card">
            <h1 className="text-3xl font-bold mb-4">{ad.title}</h1>
            <div className="text-3xl font-bold text-primary mb-6">
              {ad.price.toLocaleString()} ل.س
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">الوصف</h3>
              <p className="text-gray-700" style={{ whiteSpace: 'pre-wrap' }}>
                {ad.description}
              </p>
            </div>

            <div className="grid grid-cols-1 grid-cols-sm-2 gap-4 mb-6">
              <div>
                <span className="text-gray-600">الفئة: </span>
                <span className="font-semibold">{ad.category}</span>
              </div>
              <div>
                <span className="text-gray-600">المدينة: </span>
                <span className="font-semibold">{ad.city}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">معلومات البائع</h3>
              <p className="text-gray-700">{ad.userEmail}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

