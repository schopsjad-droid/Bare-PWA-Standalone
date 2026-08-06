import { useState } from 'react';
import { useLocation } from 'wouter';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { MAIN_CATEGORIES, SYRIAN_CITIES, getSubcategories, type PriceType } from '../constants/categories';
import { getCategoryAttributes, hasCustomAttributes, type AttributeField } from '../config/categoryAttributes';

export default function CreateAd() {
  const { user, userProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('fixed');
  const [mainCategory, setMainCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [city, setCity] = useState('');
  const [images, setImages] = useState<File[]>([]);
  // Dynamic category attributes
  const [customAttributes, setCustomAttributes] = useState<Record<string, any>>({});
  
  // Get category config when mainCategory changes
  const categoryConfig = getCategoryAttributes(mainCategory);
  
  // Handle custom attribute change
  const handleAttributeChange = (fieldId: string, value: any) => {
    setCustomAttributes(prev => ({ ...prev, [fieldId]: value }));
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setImages(files);
    }
  };

  const handleMainCategoryChange = (value: string) => {
    setMainCategory(value);
    setSubcategory(''); // Reset subcategory when main category changes
    setCustomAttributes({}); // Reset custom attributes when category changes
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

      // Determine final category (use subcategory if selected, otherwise main category)
      // Auto-fallback: if no subcategory selected, append "-all" to main category
      const finalCategory = subcategory || `${mainCategory}-all`;
      
      // Set default status to 'approved' so ads are visible immediately
      const status = 'approved';

      // Create ad document
      await addDoc(collection(db, 'ads'), {
        title,
        description,
        price: priceType === 'free' ? 0 : Number(price),
        priceType,
        category: finalCategory,
        mainCategory,
        status,
        city,
        images: imageUrls,
        userId: user.uid,
        username: userProfile?.username || 'مستخدم',
        views: 0,
        createdAt: serverTimestamp(),
        // Custom category attributes
        ...(Object.keys(customAttributes).length > 0 && { attributes: customAttributes }),
      });

      setLocation('/');
    } catch (err: any) {
      setError(err.message || 'فشل نشر الإعلان');
    } finally {
      setLoading(false);
    }
  };

  const subcategories = getSubcategories(mainCategory);

  return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
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

            {/* Price Type Selection */}
            <div className="mb-4">
              <label className="label">نوع السعر</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="priceType"
                    value="fixed"
                    checked={priceType === 'fixed'}
                    onChange={(e) => setPriceType(e.target.value as PriceType)}
                    style={{ marginLeft: '0.5rem' }}
                  />
                  <span>سعر ثابت</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="priceType"
                    value="negotiable"
                    checked={priceType === 'negotiable'}
                    onChange={(e) => setPriceType(e.target.value as PriceType)}
                    style={{ marginLeft: '0.5rem' }}
                  />
                  <span>قابل للتفاوض</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="priceType"
                    value="free"
                    checked={priceType === 'free'}
                    onChange={(e) => setPriceType(e.target.value as PriceType)}
                    style={{ marginLeft: '0.5rem' }}
                  />
                  <span>إهداء / تبرع (مجاناً)</span>
                </label>
              </div>
            </div>

            {/* Price Input (hidden for free) */}
            {priceType !== 'free' && (
              <div className="mb-4">
                <label className="label">
                  {priceType === 'negotiable' ? 'السعر التقريبي (ل.س)' : 'السعر (ل.س)'}
                </label>
                <input
                  type="number"
                  className="input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                />
              </div>
            )}

            {/* Main Category */}
            <div className="mb-4">
              <label className="label">الفئة الرئيسية</label>
              <select
                className="input"
                value={mainCategory}
                onChange={(e) => handleMainCategoryChange(e.target.value)}
                required
              >
                <option value="">اختر الفئة الرئيسية</option>
                {MAIN_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory (shown only if main category has subcategories) */}
            {subcategories.length > 0 && (
              <div className="mb-4">
                <label className="label">الفئة الفرعية (اختياري)</label>
                <select
                  className="input"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                >
                  <option value="">اختر الفئة الفرعية (أو اترك فارغاً)</option>
                  {subcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.icon} {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Dynamic Category Attributes */}
            {categoryConfig && categoryConfig.fields.length > 0 && (
              <div className="mb-6" style={{ 
                backgroundColor: 'var(--card-bg)', 
                padding: '1rem', 
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  معلومات إضافية ({categoryConfig.categoryNameAr})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {categoryConfig.fields.map((field: AttributeField) => (
                    <div key={field.id}>
                      <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{field.icon}</span>
                        <span>{field.labelAr}</span>
                        {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>
                      
                      {field.type === 'text' && (
                        <input
                          type="text"
                          className="input"
                          value={customAttributes[field.id] || ''}
                          onChange={(e) => handleAttributeChange(field.id, e.target.value)}
                          placeholder={field.placeholderAr}
                          required={field.required}
                        />
                      )}
                      
                      {field.type === 'number' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="number"
                            className="input"
                            style={{ flex: 1 }}
                            value={customAttributes[field.id] || ''}
                            onChange={(e) => handleAttributeChange(field.id, e.target.value ? Number(e.target.value) : '')}
                            placeholder={field.placeholderAr}
                            min={field.min}
                            max={field.max}
                            required={field.required}
                          />
                          {field.unitAr && <span style={{ color: 'var(--text-secondary)' }}>{field.unitAr}</span>}
                        </div>
                      )}
                      
                      {field.type === 'select' && (
                        <select
                          className="input"
                          value={customAttributes[field.id] || ''}
                          onChange={(e) => handleAttributeChange(field.id, e.target.value)}
                          required={field.required}
                        >
                          <option value="">اختر...</option>
                          {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.labelAr}</option>
                          ))}
                        </select>
                      )}
                      
                      {field.type === 'boolean' && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={field.id}
                              checked={customAttributes[field.id] === true}
                              onChange={() => handleAttributeChange(field.id, true)}
                              style={{ marginLeft: '0.5rem' }}
                            />
                            <span>نعم</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name={field.id}
                              checked={customAttributes[field.id] === false}
                              onChange={() => handleAttributeChange(field.id, false)}
                              style={{ marginLeft: '0.5rem' }}
                            />
                            <span>لا</span>
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}


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
    </ProtectedRoute>
  );
}
