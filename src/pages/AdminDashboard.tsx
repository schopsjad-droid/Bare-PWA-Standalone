import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) { setLocation('/'); }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    const fetchAds = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'ads'), orderBy('createdAt', 'desc')));
        setAds(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Ad[]);
      } catch (e) { console.error(e); }
    };
    fetchAds();
  }, [user]);

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(query(collection(db, 'users')));
        setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as UserData[]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, [user]);

  const handleDeleteAd = async (adId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) return;
    setDeleting(adId);
    try {
      await deleteDoc(doc(db, 'ads', adId));
      setAds(prev => prev.filter(ad => ad.id !== adId));
    } catch (e) { console.error(e); alert('حدث خطأ أثناء الحذف'); }
    finally { setDeleting(null); }
  };

  const formatDate = (ts: any) => {
    if (!ts) return '-';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('ar-SY');
  };

  const fmtPrice = (price: number, type?: string) => {
    if (type === 'free') return 'مجاناً';
    if (type === 'contact') return 'اتصل للسعر';
    return `${(price || 0).toLocaleString()} ل.س`;
  };

  if (authLoading || loading) return <div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" /></div>;
  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="page-wrap" style={{ paddingBottom: 0 }}>
      <header className="page-header">
        <Link href="/"><span className="page-header-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </span></Link>
        <h1 className="page-header-title">لوحة تحكم المشرف</h1>
        <div className="page-header-spacer" />
      </header>

      <div className="admin-content">
        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab${activeTab === 'ads' ? ' active' : ''}`} onClick={() => setActiveTab('ads')}>
            إدارة الإعلانات ({ads.length})
          </button>
          <button className={`admin-tab${activeTab === 'users' ? ' active' : ''}`} onClick={() => setActiveTab('users')}>
            المستخدمين ({users.length})
          </button>
        </div>

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          <div className="admin-table-wrap">
            {ads.length === 0 ? (
              <div className="empty-state"><h3>لا توجد إعلانات</h3></div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الصورة</th>
                    <th>العنوان</th>
                    <th>السعر</th>
                    <th>الحالة</th>
                    <th>المالك</th>
                    <th>التاريخ</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map(ad => (
                    <tr key={ad.id}>
                      <td>
                        {ad.images?.[0] ? (
                          <img src={ad.images[0]} alt="" className="admin-thumb" />
                        ) : (
                          <div className="admin-thumb-empty">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                          </div>
                        )}
                      </td>
                      <td><Link href={`/ad/${ad.id}`}><span className="admin-link">{ad.title}</span></Link></td>
                      <td>{fmtPrice(ad.price, ad.priceType)}</td>
                      <td><span className={`badge ${ad.status === 'approved' ? 'badge-green' : 'badge-info'}`}>{ad.status === 'approved' ? 'معتمد' : ad.status || 'نشط'}</span></td>
                      <td className="admin-muted">{ad.userName || ad.userEmail || ad.userId?.slice(0, 8)}</td>
                      <td className="admin-muted">{formatDate(ad.createdAt)}</td>
                      <td>
                        <button onClick={() => handleDeleteAd(ad.id)} disabled={deleting === ad.id} className="btn btn-danger btn-sm">
                          {deleting === ad.id ? '...' : 'حذف'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="admin-stats">
              <div className="admin-stat-card">
                <div className="admin-stat-num">{users.length}</div>
                <div className="admin-stat-label">إجمالي المستخدمين</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-num green">{ads.length}</div>
                <div className="admin-stat-label">إجمالي الإعلانات</div>
              </div>
            </div>

            <h3 className="admin-section-title">قائمة المستخدمين</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>#</th><th>الاسم</th><th>البريد</th><th>تاريخ التسجيل</th></tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td className="admin-muted">{i + 1}</td>
                      <td>{u.displayName || 'غير معروف'}</td>
                      <td className="admin-muted">{u.email || '-'}</td>
                      <td className="admin-muted">{formatDate(u.createdAt)}</td>
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
