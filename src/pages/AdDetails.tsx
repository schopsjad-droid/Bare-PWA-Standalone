import { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Helmet } from 'react-helmet-async';
import FavoriteButton from '../components/FavoriteButton';
import ReportModal from '../components/ReportModal';
import { formatPrice, type PriceType } from '../constants/categories';
import { getCategoryAttributes, formatAttributeValue } from '../config/categoryAttributes';

interface Ad {
  title: string;
  description: string;
  price: number;
  priceType?: PriceType;
  category: string;
  mainCategory?: string;
  city: string;
  images: string[];
  userId: string;
  username: string;
  createdAt: any;
  views?: number;
  attributes?: Record<string, any>;
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

  useEffect(() => {
    if (params?.id) {
      loadAd(params.id);
      incrementViewCount(params.id);
    }
  }, [params?.id]);

  const incrementViewCount = async (adId: string) => {
    try {
      const adRef = doc(db, 'ads', adId);
      await updateDoc(adRef, {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const loadAd = async (id: string) => {
    try {
      const docRef = doc(db, 'ads', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const adData = docSnap.data() as Ad;
        setAd(adData);
        
        // Load seller rating
        if (adData.userId) {
          const sellerDoc = await getDoc(doc(db, 'users', adData.userId));
          if (sellerDoc.exists()) {
            const sellerData = sellerDoc.data();
            if (sellerData.ratingSum && sellerData.ratingCount) {
              setSellerRating({
                sum: sellerData.ratingSum,
                count: sellerData.ratingCount
              });
            }
          }
        }
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

  // Contact seller - create or find existing chat
  const handleContactSeller = async () => {
    if (!user) {
      alert('يجب تسجيل الدخول أولاً');
      setLocation('/login');
      return;
    }

    if (!userProfile || !userProfile.username) {
      alert('يجب إكمال الملف الشخصي أولاً');
      setLocation('/complete-profile');
      return;
    }

    if (!ad || !params?.id) return;

    setStartingChat(true);
    try {
      // Check if chat already exists using participants array-contains
      // This query is compatible with Firestore security rules that check participants
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', user.uid),
        where('adId', '==', params.id)
      );
      
      const existingChats = await getDocs(q);
      
      if (!existingChats.empty) {
        // Chat exists, navigate to it
        const chatId = existingChats.docs[0].id;
        setLocation(`/chat/${chatId}`);
      } else {
        // ========== GUARD CLAUSES ==========
        
        // 1. Validate Seller ID
        if (!ad.userId) {
          console.error("⛔ ERROR: Ad has no userId (sellerId)!", ad);
          alert("خطأ: لا يمكن التواصل، بيانات البائع غير مكتملة.");
          setStartingChat(false);
          return;
        }
        
        // 2. Validate Current User
        if (!user?.uid) {
          console.error("⛔ ERROR: User is not logged in properly!");
          alert("يرجى تسجيل الدخول أولاً.");
          setStartingChat(false);
          return;
        }
        
        // 3. Ensure no undefined in participants
        const participants = [user.uid, ad.userId];
        if (participants.includes(undefined as any) || participants.includes(null as any)) {
          console.error("⛔ ERROR: Participants array contains undefined!", participants);
          alert("خطأ داخلي: فشل تحديد أطراف المحادثة.");
          setStartingChat(false);
          return;
        }
        
        // ========== CREATE NEW CHAT ==========
        
        const chatPayload = {
          adId: params.id,
          adTitle: ad.title || 'إعلان',
          adImage: (ad.images && ad.images.length > 0 && ad.images[0]) ? ad.images[0] : null,
          buyerId: user.uid,
          buyerName: userProfile.username || 'مستخدم',
          sellerId: ad.userId,
          sellerName: ad.username || 'بائع',
          participants: participants,
          lastMessage: '',
          lastMessageTime: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const newChat = await addDoc(collection(db, 'chats'), chatPayload);
        
        setLocation(`/chat/${newChat.id}`);
      }
    } catch (error: any) {
      console.error('Error starting chat:', error);
      alert('Error: ' + (error.message || error.toString()));
    } finally {
      setStartingChat(false);
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
      <Helmet>
        <title>{ad ? `${ad.title} | Bare` : 'Bare'}</title>
        <meta name="description" content={ad ? ad.description.substring(0, 160) : 'منصة للإعلانات المبوبة'} />
      </Helmet>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h1 className="text-3xl font-bold" style={{ flex: 1 }}>{ad.title}</h1>
              {params?.id && <FavoriteButton adId={params.id} size="large" />}
            </div>
            <div className="text-3xl font-bold mb-2" style={{
              color: (ad.priceType === 'free') ? '#22c55e' : '#22c55e'
            }}>
              {formatPrice({ amount: ad.price, type: ad.priceType || 'fixed' })}
            </div>
            
            {/* View Count */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '24px'
            }}>
              <span>👁️</span>
              <span>{ad.views || 0} مشاهدة</span>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">الوصف</h3>
              <p className="text-gray-700" style={{ whiteSpace: 'pre-wrap' }}>
                {ad.description}
              </p>
            </div>
            {/* Dynamic Category Attributes */}
            {ad.attributes && ad.mainCategory && getCategoryAttributes(ad.mainCategory) && (
              <div className="mb-6" style={{
                backgroundColor: 'var(--bg-secondary)',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-color)'
              }}>
                <h3 className="font-semibold mb-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📋 المواصفات
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '0.75rem' 
                }}>
                  {getCategoryAttributes(ad.mainCategory)?.fields.map(field => {
                    const value = ad.attributes?.[field.id];
                    if (value === undefined || value === null || value === '') return null;
                    return (
                      <div key={field.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>{field.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {field.labelAr}
                          </div>
                          <div style={{ fontWeight: '600' }}>
                            {formatAttributeValue(field, value, true)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


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
              <Link href={`/seller/${ad.userId}`}>
                <a style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  padding: '8px',
                  borderRadius: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '24px' }}>👤</span>
                  <div>
                    <div style={{ fontWeight: '600' }}>{ad.username}</div>
                    {sellerRating && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px'
                      }}>
                        <span>⭐</span>
                        <span style={{ color: '#f59e0b', fontWeight: '600' }}>
                          {(sellerRating.sum / sellerRating.count).toFixed(1)}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          ({sellerRating.count} تقييم)
                        </span>
                      </div>
                    )}
                  </div>
                  <span style={{ marginRight: 'auto', fontSize: '18px' }}>›</span>
                </a>
              </Link>
            </div>

            {/* Contact Seller Button - Only visible to non-owners */}
            {user && ad.userId !== user.uid && (
              <div className="border-t pt-4 mt-4">
                <button
                  onClick={handleContactSeller}
                  disabled={startingChat}
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '12px' }}
                >
                  {startingChat ? 'جاري الفتح...' : '💬 راسل البائع'}
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="btn"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-secondary)',
                    color: '#dc2626',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  🚩 الإبلاغ عن هذا الإعلان
                </button>
              </div>
            )}

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

      {/* Report Modal */}
      {ad && params?.id && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          adId={params.id}
          adTitle={ad.title}
        />
      )}
    </div>
  );
}

