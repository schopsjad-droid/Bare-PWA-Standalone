import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';

const SYRIAN_CITIES = [
  'دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'دير الزور', 'الرقة', 'إدلب', 'الحسكة', 'القامشلي',
  'درعا', 'السويداء', 'القنيطرة'
];

const CATEGORIES = [
  { id: 'electronics', name: 'إلكترونيات', icon: '📱' },
  { id: 'vehicles', name: 'مركبات', icon: '🚗' },
  { id: 'real-estate', name: 'عقارات', icon: '🏠' },
  { id: 'furniture', name: 'أثاث', icon: '🛋️' },
  { id: 'fashion', name: 'أزياء', icon: '👔' },
  { id: 'other', name: 'أخرى', icon: '📦' },
];

export default function EditAd() {
  const { user } = useAuth();
  const [, params] = useRoute('/edit-ad/:id');
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  useEffect(() => {
    if (params?.id && user) {
      loadAd(params.id);
    }
  }, [params?.id, user]);

  const loadAd = async (id: string) => {
    try {
      const docRef = doc(db, 'ads', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const adData = docSnap.data();
        
        // Check ownership
        if (adData.userId !== user?.uid) {
          setUnauthorized(true);
          setLoading(false);
          return;
        }

        // Load ad data
        setTitle(adData.title || '');
        setDescription(adData.description || '');
        setPrice(adData.price?.toString() || '');
        setCategory(adData.category || '');
        setCity(adData.city || '');
        setExistingImages(adData.images || []);
      } else {
        setError('الإعلان غير موجود');
      }
    } catch (error) {
      console.error('Error loading ad:', error);
      setError('فشل تحميل الإعلان');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5 - existingImages.length);
      setNewImages(files);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Upload new images
      const newImageUrls: string[] = [];
      for (const image of newImages) {
        const imageRef = ref(storage, `ads/${Date.now()}-${image.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        newImageUrls.push(url);
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];

      // Update ad document with ownership verification
      if (params?.id && user) {
        const docRef = doc(db, 'ads', params.id);
        
        // Verify ownership again before update
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists() || docSnap.data().userId !== user.uid) {
          setError('غير مصرح لك بتعديل هذا الإعلان');
          setSaving(false);
          return;
        }

        await updateDoc(docRef, {
          title,
          description,
          price: Number(price),
          category,
          city,
          images: allImages,
          updatedAt: serverTimestamp(),
        });

        setLocation(`/ad/${params.id}`);
      }
    } catch (err: any) {
      console.error('Error updating ad:', err);
      setError(err.message || 'فشل تحديث الإعلان');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true} requireUsername={true}>
        <div>
          <Navbar />
          <div className="flex justify-center items-center" style={{ minHeight: '50vh' }}>
            <div className="spinner"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (unauthorized) {
    return (
      <ProtectedRoute requireAuth={true} requireUsername={true}>
        <div>
          <Navbar />
          <div className="container py-8">
            <div className="card text-center">
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
              <h2 className="text-2xl font-bold mb-2">غير مصرح</h2>
              <p className="text-gray-600 mb-4">ليس لديك صلاحية لتعديل هذا الإعلان</p>
              <button
                onClick={() => setLocation('/')}
                className="btn btn-primary"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
      <div>
        <Navbar />
        
        <div className="container py-8">
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="text-2xl font-bold mb-6">تعديل الإعلان</h1>
            
            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="label">عنوان الإعلان</label>
                <input
                  type="text"
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="label">الوصف</label>
                <textarea
                  className="input"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="label">السعر (ل.س)</label>
                <input
                  type="number"
                  className="input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="label">الفئة</label>
                <select
                  className="input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">اختر الفئة</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="label">المدينة</label>
                <select
                  className="input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                >
                  <option value="">اختر المدينة</option>
                  {SYRIAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <label className="label">الصور الحالية</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                    {existingImages.map((url, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img
                          src={url}
                          alt={`صورة ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {existingImages.length < 5 && (
                <div className="mb-4">
                  <label className="label">إضافة صور جديدة (اختياري)</label>
                  <input
                    type="file"
                    className="input"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    يمكنك إضافة حتى {5 - existingImages.length} صورة إضافية
                  </p>
                  {newImages.length > 0 && (
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      تم اختيار {newImages.length} صورة جديدة
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={() => setLocation(`/ad/${params?.id}`)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

