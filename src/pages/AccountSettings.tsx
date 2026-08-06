import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import MobileBottomNav from '../components/MobileBottomNav';
import { useLocation, Link } from 'wouter';

export default function AccountSettings() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { if (!user) { setLocation('/login'); return; } if (userProfile?.username) setUsername(userProfile.username); }, [user, userProfile]);

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !username.trim()) { setMessage('الرجاء إدخال اسم مستخدم صالح'); return; }
    if (username.trim() === 'مستخدم') { setMessage('لا يمكن استخدام "مستخدم" كاسم مستخدم'); return; }
    if (username.trim().length < 3) { setMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل'); return; }
    setSaving(true); setMessage('');
    try {
      await updateDoc(doc(db, 'users', user.uid), { username: username.trim() });
      await refreshUserProfile();
      setMessage('success:تم حفظ التغييرات بنجاح');
    } catch (e) { console.error(e); setMessage('error:فشل حفظ التغييرات'); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => { try { await signOut(auth); setLocation('/'); } catch (e) { console.error(e); } };

  if (!user) return null;

  return (
    <div className="page-wrap">
      <header className="page-header">
        <Link href="/profile"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
        <h1 className="page-header-title">إعدادات الحساب</h1>
        <div className="page-header-spacer" />
      </header>

      <div className="page-content">
        <div className="form-container">
          {/* Email */}
          <div className="form-group">
            <label className="label">البريد الإلكتروني</label>
            <div className="form-static-value">{user.email}</div>
            <p className="form-hint">لا يمكن تعديل البريد الإلكتروني</p>
          </div>

          {/* Username Form */}
          <form onSubmit={handleSaveUsername} className="form-body">
            <div className="form-group">
              <label className="label">اسم المستخدم <span className="form-required">*</span></label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="اختر اسم مستخدم" className="input" required minLength={3} disabled={saving} />
              <p className="form-hint">سيظهر اسمك في الإعلانات والمحادثات</p>
            </div>

            {message && (
              <div className={message.startsWith('success:') ? 'form-success' : 'form-error'}>
                {message.startsWith('success:') ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
                <span>{message.replace(/^(success:|error:)/, '')}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</button>
          </form>

          <div className="form-divider" />

          <button onClick={handleLogout} className="btn btn-danger btn-full">تسجيل الخروج</button>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
