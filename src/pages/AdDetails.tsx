import { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import MobileBottomNav from '../components/MobileBottomNav';
import { Helmet } from 'react-helmet-async';
import FavoriteButton from '../components/FavoriteButton';
import ReportModal from '../components/ReportModal';
import { formatPrice, type PriceType } from '../constants/categories';
import { getCategoryAttributes, formatAttributeValue } from '../config/categoryAttributes';
import ListingMap from '../components/ListingMap';
import StatusBadge from '../components/StatusBadge';
import ListingStatusControl from '../components/ListingStatusControl';
import type { LocationPrecision } from '../utils/geo';

interface Ad {
  title: string; description: string; price: number; priceType?: PriceType;
  category: string; mainCategory?: string; city: string; images: string[];
  userId: string; username: string; createdAt: any; views?: number;
  attributes?: Record<string, any>;
  latitude?: number; longitude?: number; locationPrecision?: LocationPrecision;
  listingStatus?: string; status?: string;
}

export default function AdDetails() {
  const { user, userProfile } = useAuth();
  const [, params] = useRoute('/ad/:id');
  const [, setLocation] = useLocation();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startingChat, setStartingChat] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [sellerRating, setSellerRating] = useState<{ sum: number; count: number } | null>(null);
  const [showExpandedMap, setShowExpandedMap] = useState(false);
  const [currentListingStatus, setCurrentListingStatus] = useState<string>('');

  useEffect(() => { if (params?.id) { loadAd(params.id); incrementViewCount(params.id); } }, [params?.id]);

  const incrementViewCount = async (adId: string) => { try { await updateDoc(doc(db, 'ads', adId), { views: increment(1) }); } catch (e) {} };

  const loadAd = async (id: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'ads', id));
      if (docSnap.exists()) {
        const adData = docSnap.data() as Ad;
        setAd(adData);
        setCurrentListingStatus(adData.listingStatus || 'available');
        if (adData.userId) {
          const sellerDoc = await getDoc(doc(db, 'users', adData.userId));
          if (sellerDoc.exists()) {
            const sd = sellerDoc.data();
            if (sd.ratingSum && sd.ratingCount) setSellerRating({ sum: sd.ratingSum, count: sd.ratingCount });
          }
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getFilePathFromUrl = (url: string): string | null => { try { const m = decodeURIComponent(url).match(/\/o\/(.+?)\?/); return m ? m[1] : null; } catch { return null; } };

  const handleContactSeller = async () => {
    if (!user) { alert('يجب تسجيل الدخول أولاً'); setLocation('/login'); return; }
    if (!userProfile?.username) { alert('يجب إكمال الملف الشخصي أولاً'); setLocation('/complete-profile'); return; }
    if (!ad || !params?.id) return;
    setStartingChat(true);
    try {
      const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), where('adId', '==', params.id));
      const existing = await getDocs(q);
      if (!existing.empty) { setLocation(`/chat/${existing.docs[0].id}`); return; }
      if (!ad.userId || !user.uid) { alert("خطأ: بيانات غير مكتملة."); return; }
      const participants = [user.uid, ad.userId];
      const newChat = await addDoc(collection(db, 'chats'), {
        adId: params.id, adTitle: ad.title || 'إعلان',
        adImage: ad.images?.[0] || null,
        buyerId: user.uid, buyerName: userProfile.username || 'مستخدم',
        sellerId: ad.userId, sellerName: ad.username || 'بائع',
        participants, lastMessage: '', lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      setLocation(`/chat/${newChat.id}`);
    } catch (e: any) { console.error(e); alert('Error: ' + (e.message || '')); }
    finally { setStartingChat(false); }
  };

  const handleDelete = async () => {
    if (!params?.id || !user || !ad) return;
    setDeleting(true);
    try {
      if (ad.images?.length) { for (const url of ad.images) { try { const p = getFilePathFromUrl(url); if (p) await deleteObject(ref(storage, p)); } catch {} } }
      await deleteDoc(doc(db, 'ads', params.id));
      setLocation('/');
    } catch (e) { console.error(e); alert('حدث خطأ أثناء الحذف'); }
    finally { setDeleting(false); setShowDeleteConfirm(false); }
  };

  if (loading) return <div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  if (!ad) return (
    <div className="page-wrap">
      <header className="page-header"><Link href="/"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link><h1 className="page-header-title">الإعلان غير موجود</h1><div className="page-header-spacer"/></header>
      <div className="empty-state"><h3>عذراً، لم نتمكن من العثور على هذا الإعلان</h3><Link href="/"><span className="btn btn-primary">العودة للرئيسية</span></Link></div>
      <MobileBottomNav />
    </div>
  );

  return (
    <div className="page-wrap">
      <Helmet><title>{ad.title} | Bare</title><meta name="description" content={ad.description?.substring(0, 160)} /></Helmet>

      {/* Header */}
      <header className="page-header">
        <Link href="/"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
        <h1 className="page-header-title">تفاصيل الإعلان</h1>
        {params?.id && <FavoriteButton adId={params.id} size="medium" />}
      </header>

      <div className="page-content ad-detail">
        {/* Image Gallery */}
        {ad.images?.length > 0 && (
          <div className="ad-detail-gallery">
            <img src={ad.images[currentImageIndex]} alt={ad.title} className="ad-detail-main-img" />
            {ad.images.length > 1 && (
              <div className="ad-detail-thumbs">
                {ad.images.map((img, i) => (
                  <img key={i} src={img} alt="" onClick={() => setCurrentImageIndex(i)} className={`ad-detail-thumb${i === currentImageIndex ? ' active' : ''}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Title & Price */}
        <div className="ad-detail-section">
          <div className="ad-detail-title-row">
            <h1 className="ad-detail-title">{ad.title}</h1>
            <StatusBadge listingStatus={currentListingStatus} size="md" />
          </div>
          <div className="ad-detail-price">{formatPrice({ amount: ad.price, type: ad.priceType || 'fixed' })}</div>
          <div className="ad-detail-meta">
            <span>{ad.city}</span>
            <span>{ad.views || 0} مشاهدة</span>
          </div>
        </div>

        {/* Description */}
        <div className="ad-detail-section">
          <h3 className="ad-detail-label">الوصف</h3>
          <p className="ad-detail-desc">{ad.description}</p>
        </div>

        {/* Attributes */}
        {ad.attributes && ad.mainCategory && getCategoryAttributes(ad.mainCategory) && (
          <div className="ad-detail-section">
            <h3 className="ad-detail-label">المواصفات</h3>
            <div className="ad-detail-attrs">
              {getCategoryAttributes(ad.mainCategory)?.fields.map(field => {
                const value = ad.attributes?.[field.id];
                if (!value) return null;
                return (
                  <div key={field.id} className="ad-detail-attr">
                    <span className="ad-detail-attr-icon">{field.icon}</span>
                    <div><div className="ad-detail-attr-label">{field.labelAr}</div><div className="ad-detail-attr-value">{formatAttributeValue(field, value, true)}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category & City */}
        <div className="ad-detail-section ad-detail-info-row">
          <div><span className="ad-detail-info-label">الفئة</span><span className="ad-detail-info-value">{ad.category}</span></div>
          <div><span className="ad-detail-info-label">المدينة</span><span className="ad-detail-info-value">{ad.city}</span></div>
        </div>

        {/* Map */}
        {ad.latitude && ad.longitude && (
          <div className="ad-detail-section">
            <h3 className="ad-detail-label">الموقع</h3>
            <ListingMap
              latitude={ad.latitude}
              longitude={ad.longitude}
              precision={ad.locationPrecision || 'approximate'}
              expanded={showExpandedMap}
            />
            <button onClick={() => setShowExpandedMap(!showExpandedMap)} className="btn btn-secondary btn-full" style={{ marginTop: '8px' }}>
              {showExpandedMap ? 'تصغير الخريطة' : 'عرض على الخريطة'}
            </button>
          </div>
        )}

        {/* Seller */}
        <div className="ad-detail-section">
          <h3 className="ad-detail-label">البائع</h3>
          <Link href={`/seller/${ad.userId}`}>
            <span className="ad-detail-seller">
              <div className="ad-detail-seller-avatar">{ad.username?.charAt(0) || 'B'}</div>
              <div className="ad-detail-seller-info">
                <div className="ad-detail-seller-name">{ad.username}</div>
                {sellerRating && (
                  <div className="ad-detail-seller-rating">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>{(sellerRating.sum / sellerRating.count).toFixed(1)}</span>
                    <span className="ad-detail-seller-count">({sellerRating.count} تقييم)</span>
                  </div>
                )}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
          </Link>
        </div>

        {/* Actions */}
        {user && ad.userId !== user.uid && currentListingStatus !== 'sold' && (
          <div className="ad-detail-actions">
            <button onClick={handleContactSeller} disabled={startingChat} className="btn btn-primary btn-full">
              {startingChat ? 'جاري الفتح...' : 'راسل البائع'}
            </button>
            <button onClick={() => setShowReportModal(true)} className="btn btn-danger-outline btn-full">
              الإبلاغ عن هذا الإعلان
            </button>
          </div>
        )}

        {user && ad.userId === user.uid && (
          <div className="ad-detail-actions">
            {params?.id && <ListingStatusControl adId={params.id} currentListingStatus={currentListingStatus} onStatusChange={(s) => setCurrentListingStatus(s)} />}
            <Link href={`/edit-ad/${params?.id}`}><span className="btn btn-primary btn-full">تعديل</span></Link>
            <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger btn-full">حذف</button>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--bare-error)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <h2 className="modal-title">تأكيد الحذف</h2>
            <p className="modal-desc">هل أنت متأكد أنك تريد حذف هذا الإعلان نهائياً؟ لا يمكن التراجع.</p>
            <div className="modal-actions">
              <button onClick={handleDelete} disabled={deleting} className="btn btn-danger">{deleting ? 'جاري الحذف...' : 'نعم، احذف'}</button>
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="btn btn-secondary">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {ad && params?.id && <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} adId={params.id} adTitle={ad.title} />}
      <MobileBottomNav />
    </div>
  );
}
