import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

interface Ad {
  id: string;
  title: string;
  price: number;
  priceType?: string;
  images: string[];
  status?: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  createdAt: any;
  category: string;
}

interface UserData {
  id: string;
  email?: string;
  displayName?: string;
  createdAt: any;
}

const ADMIN_EMAIL = 'schops.jad@gmail.com';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'ads' | 'users'>('ads');
  const [ads, setAds] = useState<Ad[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  // Fetch all ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const adsQuery = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(adsQuery);
        const adsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ad[];
        setAds(adsData);
      } catch (error) {
        console.error('Error fetching ads:', error);
      }
    };

    if (user?.email === ADMIN_EMAIL) {
      fetchAds();
    }
  }, [user]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const snapshot = await getDocs(usersQuery);
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserData[];
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email === ADMIN_EMAIL) {
      fetchUsers();
    }
  }, [user]);

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    
    setDeleting(adId);
    try {
      await deleteDoc(doc(db, 'ads', adId));
      setAds(prev => prev.filter(ad => ad.id !== adId));
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'غير معروف';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ar-SY');
  };

  const formatPrice = (price: number, priceType?: string) => {
    if (priceType === 'free') return 'مجاناً';
    if (priceType === 'contact') return 'اتصل للسعر';
    return `${price?.toLocaleString()} ل.س`;
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: 'var(--text-primary)'
        }}>
          🛡️ لوحة تحكم المشرف
        </h1>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          borderBottom: '2px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('ads')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'ads' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'ads' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            📋 إدارة الإعلانات ({ads.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === 'users' ? 'var(--primary-color)' : 'transparent',
              color: activeTab === 'users' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            👥 إحصائيات المستخدمين ({users.length})
          </button>
        </div>

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>الصورة</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>العنوان</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>السعر</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>الحالة</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>المالك</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>التاريخ</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-primary)' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(ad => (
                  <tr key={ad.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px' }}>
                      <img 
                        src={ad.images?.[0] || '/placeholder.png'} 
                        alt={ad.title}
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                      <a href={`/ad/${ad.id}`} style={{ color: 'var(--primary-color)' }}>
                        {ad.title}
                      </a>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                      {formatPrice(ad.price, ad.priceType)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: ad.status === 'approved' ? '#22c55e20' : '#f59e0b20',
                        color: ad.status === 'approved' ? '#22c55e' : '#f59e0b'
                      }}>
                        {ad.status === 'approved' ? 'معتمد' : ad.status || 'معلق'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {ad.userName || ad.userEmail || ad.userId?.slice(0, 8)}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {formatDate(ad.createdAt)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        disabled={deleting === ad.id}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: deleting === ad.id ? 'not-allowed' : 'pointer',
                          opacity: deleting === ad.id ? 0.5 : 1
                        }}
                      >
                        {deleting === ad.id ? '...' : '🗑️ حذف'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {ads.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: 'var(--text-secondary)'
              }}>
                لا توجد إعلانات
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {users.length}
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                  👥 إجمالي المستخدمين
                </div>
              </div>
              <div style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#22c55e' }}>
                  {ads.length}
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                  📋 إجمالي الإعلانات
                </div>
              </div>
            </div>

            <h3 style={{ 
              marginBottom: '16px', 
              color: 'var(--text-primary)',
              fontSize: '18px'
            }}>
              قائمة المستخدمين
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>#</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>الاسم</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>البريد</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userData, index) => (
                    <tr key={userData.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{index + 1}</td>
                      <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                        {userData.displayName || 'غير معروف'}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                        {userData.email || '-'}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                        {formatDate(userData.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
