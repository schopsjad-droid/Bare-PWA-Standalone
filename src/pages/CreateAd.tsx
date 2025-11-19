import { useState } from 'react';
import { useLocation } from 'wouter';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

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

export default function CreateAd() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [images, setImages] = useState<File[]>([]);

  if (!user) {
    setLocation('/login');
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setImages(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const image of images) {
        const imageRef = ref(storage, `ads/${Date.now()}-${image.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      // Create ad document
      await addDoc(collection(db, 'ads'), {
        title,
        description,
        price: Number(price),
        category,
        city,
        images: imageUrls,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      });

      setLocation('/');
    } catch (err: any) {
      setError(err.message || 'فشل نشر الإعلان');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      
      <div className="container py-8">
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="text-3xl font-bold mb-6">إضافة إعلان جديد</h1>

          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
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
                {SYRIAN_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="label">الصور (حتى 5 صور)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="input"
              />
              {images.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  تم اختيار {images.length} صورة
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'جاري النشر...' : 'نشر الإعلان'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

