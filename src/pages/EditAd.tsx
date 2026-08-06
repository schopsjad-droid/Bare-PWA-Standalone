import { useState, useEffect } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import MobileBottomNav from '../components/MobileBottomNav';
import ProtectedRoute from '../components/ProtectedRoute';
import { MAIN_CATEGORIES, SYRIAN_CITIES, getSubcategories, type PriceType } from '../constants/categories';
import LocationPicker from '../components/LocationPicker';
import LocationPrivacySelector from '../components/LocationPrivacySelector';
import { generateGeohash, getPublicCoordinates, type LocationPrecision } from '../utils/geo';

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
  const [priceType, setPriceType] = useState<PriceType>('fixed');
  const [mainCategory, setMainCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [city, setCity] = useState('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Location state
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [locationPrecision, setLocationPrecision] = useState<LocationPrecision>('approximate');
  const [hasExistingLocation, setHasExistingLocation] = useState(false);

  useEffect(() => { if (params?.id && user) loadAd(params.id); }, [params?.id, user]);

  const loadAd = async (id: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'ads', id));
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (d.userId !== user?.uid) { setUnauthorized(true); setLoading(false); return; }
        setTitle(d.title || ''); setDescription(d.description || ''); setPrice(d.price?.toString() || '0');
        setPriceType(d.priceType || 'fixed');
        const adMain = d.mainCategory || d.category; setMainCategory(adMain || '');
        if (d.category && d.category !== adMain) setSubcategory(d.category); else setSubcategory('');
        setCity(d.city || ''); setExistingImages(d.images || []);
        // Load existing location data
        if (d.latitude && d.longitude) {
          setSelectedLat(d.latitude);
          setSelectedLng(d.longitude);
          setLocationPrecision(d.locationPrecision || 'approximate');
          setHasExistingLocation(true);
        }
      } else { setError('الإعلان غير موجود'); }
    } catch (e) { console.error(e); setError('فشل تحميل الإعلان'); }
    finally { setLoading(false); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) setNewImages(Array.from(e.target.files).slice(0, 5 - existingImages.length)); };
  const removeExistingImage = (index: number) => { setExistingImages(prev => prev.filter((_, i) => i !== index)); };
  const handleMainCategoryChange = (value: string) => { setMainCategory(value); setSubcategory(''); };

  const handleLocationConfirm = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setShowMapPicker(false);
    setHasExistingLocation(true);
  };

  const handleRemoveLocation = () => {
    setSelectedLat(null);
    setSelectedLng(null);
    setHasExistingLocation(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const newUrls: string[] = [];
      for (const img of newImages) { const r = ref(storage, `ads/${Date.now()}-${img.name}`); await uploadBytes(r, img); newUrls.push(await getDownloadURL(r)); }
      const allImages = [...existingImages, ...newUrls];
      const finalCategory = subcategory || mainCategory;
      if (params?.id && user) {
        const docRef = doc(db, 'ads', params.id);
        const snap = await getDoc(docRef);
        if (!snap.exists() || snap.data().userId !== user.uid) { setError('غير مصرح لك بتعديل هذا الإعلان'); setSaving(false); return; }

        // Build update data
        const updateData: Record<string, any> = {
          title, description, price: priceType === 'free' ? 0 : Number(price), priceType,
          category: finalCategory, mainCategory, city, images: allImages, updatedAt: serverTimestamp()
        };

        // Add location data if set
        if (selectedLat !== null && selectedLng !== null) {
          const [pubLat, pubLng] = getPublicCoordinates(selectedLat, selectedLng, locationPrecision);
          updateData.latitude = pubLat;
          updateData.longitude = pubLng;
          updateData.geohash = generateGeohash(pubLat, pubLng);
          updateData.locationPrecision = locationPrecision;
          updateData.locationSource = 'map';
        } else if (!hasExistingLocation) {
          // User explicitly removed location - clear fields
          updateData.latitude = null;
          updateData.longitude = null;
          updateData.geohash = null;
          updateData.locationPrecision = null;
          updateData.locationSource = null;
        }

        await updateDoc(docRef, updateData);
        setLocation(`/ad/${params.id}`);
      }
    } catch (err: any) { console.error(err); setError(err.message || 'فشل تحديث الإعلان'); }
    finally { setSaving(false); }
  };

  const subcategories = getSubcategories(mainCategory);

  if (loading) return <ProtectedRoute requireAuth={true} requireUsername={true}><div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div></ProtectedRoute>;

  if (unauthorized) return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
      <div className="page-wrap">
        <header className="page-header"><Link href="/"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link><h1 className="page-header-title">غير مصرح</h1><div className="page-header-spacer"/></header>
        <div className="empty-state"><h3>ليس لديك صلاحية لتعديل هذا الإعلان</h3><button onClick={() => setLocation('/')} className="btn btn-primary">العودة للرئيسية</button></div>
        <MobileBottomNav />
      </div>
    </ProtectedRoute>
  );

  return (
    <ProtectedRoute requireAuth={true} requireUsername={true}>
      <div className="page-wrap">
        <header className="page-header">
          <Link href={`/ad/${params?.id}`}><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
          <h1 className="page-header-title">تعديل الإعلان</h1>
          <div className="page-header-spacer" />
        </header>

        <div className="page-content">
          <div className="form-container">
            {error && <div className="form-error"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>{error}</span></div>}

            <form onSubmit={handleSubmit} className="form-body">
              <div className="form-group"><label className="label">عنوان الإعلان</label><input type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
              <div className="form-group"><label className="label">الوصف</label><textarea className="input form-textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} required /></div>

              {/* Price Type */}
              <div className="form-group">
                <label className="label">نوع السعر</label>
                <div className="form-radio-group">
                  <label className="form-radio"><input type="radio" name="priceType" value="fixed" checked={priceType === 'fixed'} onChange={(e) => setPriceType(e.target.value as PriceType)} /><span>سعر ثابت</span></label>
                  <label className="form-radio"><input type="radio" name="priceType" value="negotiable" checked={priceType === 'negotiable'} onChange={(e) => setPriceType(e.target.value as PriceType)} /><span>قابل للتفاوض</span></label>
                  <label className="form-radio"><input type="radio" name="priceType" value="free" checked={priceType === 'free'} onChange={(e) => setPriceType(e.target.value as PriceType)} /><span>مجاناً</span></label>
                </div>
              </div>

              {priceType !== 'free' && <div className="form-group"><label className="label">{priceType === 'negotiable' ? 'السعر التقريبي (ل.س)' : 'السعر (ل.س)'}</label><input type="number" className="input" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" /></div>}

              <div className="form-group"><label className="label">الفئة الرئيسية</label><select className="input" value={mainCategory} onChange={(e) => handleMainCategoryChange(e.target.value)} required><option value="">اختر الفئة</option>{MAIN_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>

              {subcategories.length > 0 && <div className="form-group"><label className="label">الفئة الفرعية</label><select className="input" value={subcategory} onChange={(e) => setSubcategory(e.target.value)}><option value="">اختر الفئة الفرعية</option>{subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}</select></div>}

              <div className="form-group"><label className="label">المدينة</label><select className="input" value={city} onChange={(e) => setCity(e.target.value)} required><option value="">اختر المدينة</option>{SYRIAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>

              {/* Location Section */}
              <div className="form-section">
                <h3 className="form-section-title">الموقع على الخريطة {hasExistingLocation ? '' : '(اختياري)'}</h3>

                {selectedLat === null ? (
                  <div className="form-group">
                    <button type="button" className="btn btn-secondary btn-full" onClick={() => setShowMapPicker(true)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {hasExistingLocation ? 'إعادة تحديد الموقع' : 'تحديد الموقع على الخريطة'}
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

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="form-group">
                  <label className="label">الصور الحالية</label>
                  <div className="form-images-grid">
                    {existingImages.map((url, i) => (
                      <div key={i} className="form-image-item">
                        <img src={url} alt="" className="form-image-thumb" />
                        <button type="button" onClick={() => removeExistingImage(i)} className="form-image-remove">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {existingImages.length < 5 && (
                <div className="form-group">
                  <label className="label">إضافة صور جديدة</label>
                  <input type="file" className="input form-file" accept="image/*" multiple onChange={handleImageChange} />
                  <p className="form-hint">يمكنك إضافة حتى {5 - existingImages.length} صورة إضافية</p>
                  {newImages.length > 0 && <p className="form-hint">تم اختيار {newImages.length} صورة جديدة</p>}
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</button>
                <button type="button" onClick={() => setLocation(`/ad/${params?.id}`)} className="btn btn-secondary" disabled={saving}>إلغاء</button>
              </div>
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
