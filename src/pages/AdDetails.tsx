import { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

interface Ad {
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  images: string[];
  userId: string;
  username: string;
  createdAt: any;
}

export default function AdDetails() {
  const { user } = useAuth();
  const [, params] = useRoute('/ad/:id');
  const [, setLocation] = useLocation();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  // Extract file path from Firebase Storage URL
  const getFilePathFromUrl = (url: string): string | null => {
    try {
      const decodedUrl = decodeURIComponent(url);
      const match = decodedUrl.match(/\/o\/(.+?)\?/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting file path:', error);
      return null;
    }
  };

  // Delete ad with storage cleanup
  const handleDelete = async () => {
    if (!params?.id || !user || !ad) return;

    setDeleting(true);

    try {
      // Step 1: Delete images from Storage
      if (ad.images && ad.images.length > 0) {
        for (const imageUrl of ad.images) {
          try {
            const filePath = getFilePathFromUrl(imageUrl);
            if (filePath) {
              const imageRef = ref(storage, filePath);
              await deleteObject(imageRef);
              console.log('Image deleted:', filePath);
            }
          } catch (imgError) {
            console.error('Error deleting image:', imgError);
            // Continue even if image deletion fails
          }
        }
      }

      // Step 2: Delete ad document from Firestore
      await deleteDoc(doc(db, 'ads', params.id));

      // Step 3: Redirect to home
      setLocation('/');
    } catch (error: any) {
      console.error('Error deleting ad:', error);
      alert('حدث خطأ أثناء حذف الإعلان');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
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
              <p className="text-gray-700">👤 {ad.username}</p>
            </div>

            {/* Edit & Delete Buttons - Only visible to owner */}
            {user && ad.userId === user.uid && (
              <div className="border-t pt-4 mt-4">
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link href={`/edit-ad/${params?.id}`}>
                    <a className="btn btn-primary" style={{ flex: 1, display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                      ✏️ تعديل
                    </a>
                  </Link>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn"
                    style={{
                      flex: 1,
                      background: '#ef4444',
                      color: 'white',
                      border: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                تأكيد الحذف
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                هل أنت متأكد أنك تريد حذف هذا الإعلان نهائياً؟<br/>
                <strong>لا يمكن التراجع عن هذه العملية.</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn"
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: 'white',
                  border: 'none'
                }}
              >
                {deleting ? 'جاري الحذف...' : 'نعم، احذف'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

