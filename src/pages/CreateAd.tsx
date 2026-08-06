import { useState } from 'react';
import { useLocation } from 'wouter';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import MobileBottomNav from '../components/MobileBottomNav';
import ProtectedRoute from '../components/ProtectedRoute';
import { Link } from 'wouter';
import { MAIN_CATEGORIES, SYRIAN_CITIES, getSubcategories, type PriceType } from '../constants/categories';
import { getCategoryAttributes, type AttributeField } from '../config/categoryAttributes';
import LocationPicker from '../components/LocationPicker';
import LocationPrivacySelector from '../components/LocationPrivacySelector';
import { generateGeohash, getPublicCoordinates, type LocationPrecision } from '../utils/geo';

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
  const [customAttributes, setCustomAttributes] = useState<Record<string, any>>({});

  // Location state
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [locationPrecision, setLocationPrecision] = useState<LocationPrecision>('approximate');

  const categoryConfig = getCategoryAttributes(mainCategory);
  const handleAttributeChange = (fieldId: string, value: any) => { setCustomAttributes(prev => ({ ...prev, [fieldId]: value })); };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) setImages(Array.from(e.target.files).slice(0, 5)); };
  const handleMainCategoryChange = (value: string) => { setMainCategory(value); setSubcategory(''); setCustomAttributes({}); };

  const handleLocationConfirm = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setShowMapPicker(false);
  };

  const handleRemoveLocation = () => {
    setSelectedLat(null);
    setSelectedLng(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const imageUrls: string[] = [];
      for (const image of images) { const r = ref(storage, `ads/${Date.now()}-${image.name}`); await uploadBytes(r, image); imageUrls.push(await getDownloadURL(r)); }
      const finalCategory = subcategory || `${mainCategory}-all`;

      // Build location data
      const locationData: Record<string, any> = {};
      if (selectedLat !== null && selectedLng !== null) {
        const [pubLat, pubLng] = getPublicCoordinates(selectedLat, selectedLng, locationPrecision);
        locationData.latitude = pubLat;
        locationData.longitude = pubLng;
        locationData.geohash = generateGeohash(pubLat, pubLng);
        locationData.locationPrecision = locationPrecision;
        locationData.locationSource = 'map';
      }

      await addDoc(collection(db, 'ads'), {
        title, description, price: priceType === 'free' ? 0 : Number(price), priceType,
        category: finalCategory, mainCategory, status: 'available', city, images: imageUrls,
        userId: user.uid, username: userProfile?.username || 'مستخدم', views: 0, createdAt: serverTimestamp(),
        ...locationData,
        ...(Object.keys(customAttributes).length > 0 && { attributes: customAttributes }),
      });
      setLocation('/');
    } catch (err: any) { setError(err.message || 'فشل نشر الإعلان'); }
    finally { setLoading(false); }
  };

  const subcategories = getSubcategories(mainCategory);

  return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
      <div className="page-wrap">
        <header className="page-header">
          <Link href="/"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
          <h1 className="page-header-title">إضافة إعلان جديد</h1>
          <div className="page-header-spacer" />
        </header>

        <div className="page-content">
          <div className="form-container">
            {error && <div className="form-error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>{error}</span></div>}

            <form onSubmit={handleSubmit} className="form-body">
              {/* Title */}
              <div className="form-group">
                <label className="label">عنوان الإعلان</label>
                <input type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="مثال: iPhone 14 Pro Max" />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="label">الوصف</label>
                <textarea className="input form-textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="وصف تفصيلي للمنتج أو الخدمة..." />
              </div>

              {/* Price Type */}
              <div className="form-group">
                <label className="label">نوع السعر</label>
                <div className="form-radio-group">
                  <label className="form-radio"><input type="radio" name="priceType" value="fixed" checked={priceType === 'fixed'} onChange={(e) => setPriceType(e.target.value as PriceType)} /><span>سعر ثابت</span></label>
                  <label className="form-radio"><input type="radio" name="priceType" value="negotiable" checked={priceType === 'negotiable'} onChange={(e) => setPriceType(e.target.value as PriceType)} /><span>قابل للتفاوض</span></label>
                  <label className="form-radio"><input type="radio" name="priceType" value="free" checked={priceType === 'free'} onChange={(e) => setPriceType(e.target.value as PriceType)} /><span>مجاناً</span></label>
                </div>
              </div>

              {/* Price */}
              {priceType !== 'free' && (
                <div className="form-group">
                  <label className="label">{priceType === 'negotiable' ? 'السعر التقريبي (ل.س)' : 'السعر (ل.س)'}</label>
                  <input type="number" className="input" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" placeholder="0" />
                </div>
              )}

              {/* Main Category */}
              <div className="form-group">
                <label className="label">الفئة الرئيسية</label>
                <select className="input" value={mainCategory} onChange={(e) => handleMainCategoryChange(e.target.value)} required>
                  <option value="">اختر الفئة الرئيسية</option>
                  {MAIN_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              {/* Subcategory */}
              {subcategories.length > 0 && (
                <div className="form-group">
                  <label className="label">الفئة الفرعية (اختياري)</label>
                  <select className="input" value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                    <option value="">اختر الفئة الفرعية</option>
                    {subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                  </select>
                </div>
              )}

              {/* Dynamic Attributes */}
              {categoryConfig && categoryConfig.fields.length > 0 && (
                <div className="form-section">
                  <h3 className="form-section-title">معلومات إضافية ({categoryConfig.categoryNameAr})</h3>
                  <div className="form-attrs-grid">
                    {categoryConfig.fields.map((field: AttributeField) => (
                      <div key={field.id} className="form-group">
                        <label className="label">{field.labelAr}{field.required && <span className="form-required">*</span>}</label>
                        {field.type === 'text' && <input type="text" className="input" value={customAttributes[field.id] || ''} onChange={(e) => handleAttributeChange(field.id, e.target.value)} placeholder={field.placeholderAr} required={field.required} />}
                        {field.type === 'number' && (
                          <div className="form-input-unit">
                            <input type="number" className="input" value={customAttributes[field.id] || ''} onChange={(e) => handleAttributeChange(field.id, e.target.value ? Number(e.target.value) : '')} placeholder={field.placeholderAr} min={field.min} max={field.max} required={field.required} />
                            {field.unitAr && <span className="form-unit">{field.unitAr}</span>}
                          </div>
                        )}
                        {field.type === 'select' && (
                          <select className="input" value={customAttributes[field.id] || ''} onChange={(e) => handleAttributeChange(field.id, e.target.value)} required={field.required}>
                            <option value="">اختر...</option>
                            {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.labelAr}</option>)}
                          </select>
                        )}
                        {field.type === 'boolean' && (
                          <div className="form-radio-group form-radio-row">
                            <label className="form-radio"><input type="radio" name={field.id} checked={customAttributes[field.id] === true} onChange={() => handleAttributeChange(field.id, true)} /><span>نعم</span></label>
                            <label className="form-radio"><input type="radio" name={field.id} checked={customAttributes[field.id] === false} onChange={() => handleAttributeChange(field.id, false)} /><span>لا</span></label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* City */}
              <div className="form-group">
                <label className="label">المدينة</label>
                <select className="input" value={city} onChange={(e) => setCity(e.target.value)} required>
                  <option value="">اختر المدينة</option>
                  {SYRIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Location Section */}
              <div className="form-section">
                <h3 className="form-section-title">الموقع على الخريطة (اختياري)</h3>

                {selectedLat === null ? (
                  <div className="form-group">
                    <button type="button" className="btn btn-secondary btn-full" onClick={() => setShowMapPicker(true)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      تحديد الموقع على الخريطة
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="location-summary">
                      <span className="location-summary-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </span>
                      <span className="location-summary-text">
                        تم تحديد الموقع ({locationPrecision === 'approximate' ? 'تقريبي' : 'دقيق'})
                      </span>
                      <button type="button" onClick={() => setShowMapPicker(true)} className="location-summary-remove" title="تغيير">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button type="button" onClick={handleRemoveLocation} className="location-summary-remove" title="إزالة">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>

                    <LocationPrivacySelector value={locationPrecision} onChange={setLocationPrecision} />
                  </>
                )}
              </div>

              {/* Images */}
              <div className="form-group">
                <label className="label">الصور (حتى 5 صور)</label>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="input form-file" />
                {images.length > 0 && <p className="form-hint">تم اختيار {images.length} صورة</p>}
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'جاري النشر...' : 'نشر الإعلان'}
              </button>
            </form>
          </div>
        </div>
        <MobileBottomNav />
      </div>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onConfirm={handleLocationConfirm}
        initialLat={selectedLat || undefined}
        initialLng={selectedLng || undefined}
      />
    </ProtectedRoute>
  );
}
