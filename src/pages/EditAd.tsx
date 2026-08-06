import { useState, useEffect } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import MobileBottomNav from '../components/MobileBottomNav';
import ProtectedRoute from '../components/ProtectedRoute';
import { MAIN_CATEGORIES, SYRIAN_CITIES, getSubcategories, type PriceType } from '../constants/categories';

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
      } else { setError('الإعلان غير موجود'); }
    } catch (e) { console.error(e); setError('فشل تحميل الإعلان'); }
    finally { setLoading(false); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) setNewImages(Array.from(e.target.files).slice(0, 5 - existingImages.length)); };
  const removeExistingImage = (index: number) => { setExistingImages(prev => prev.filter((_, i) => i !== index)); };
  const handleMainCategoryChange = (value: string) => { setMainCategory(value); setSubcategory(''); };

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
        await updateDoc(docRef, { title, description, price: priceType === 'free' ? 0 : Number(price), priceType, category: finalCategory, mainCategory, city, images: allImages, updatedAt: serverTimestamp() });
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
    </ProtectedRoute>
  );
}
