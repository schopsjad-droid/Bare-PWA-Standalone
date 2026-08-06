import { useState } from 'react';
import { useLocation } from 'wouter';
import { doc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function CompleteProfile() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [, setLocation] = useLocation();

  if (userProfile?.username && userProfile.username !== 'مستخدم') { setLocation('/'); }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!username.trim()) { setError('يرجى إدخال اسم المستخدم'); return; }
    if (username.length < 3) { setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل'); return; }
    if (username.length > 20) { setError('اسم المستخدم يجب أن يكون 20 حرف كحد أقصى'); return; }
    if (!/^[a-zA-Z0-9_\u0600-\u06FF-]+$/.test(username)) { setError('اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط'); return; }
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('username', '==', username)));
      if (!snap.empty) { setError('اسم المستخدم مستخدم بالفعل'); setLoading(false); return; }
      if (user) { await updateDoc(doc(db, 'users', user.uid), { username: username.trim() }); await refreshUserProfile(); setLocation('/'); }
    } catch (err: any) { console.error(err); setError('حدث خطأ أثناء حفظ اسم المستخدم'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--bare-green)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <h1 className="auth-title">إكمال الملف الشخصي</h1>
          <p className="auth-subtitle">مرحباً! يرجى اختيار اسم مستخدم للمتابعة</p>
        </div>

        {error && <div className="form-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>{error}</span></div>}

        <div className="auth-info-box">
          <strong>لماذا نحتاج اسم مستخدم؟</strong><br/>
          سيظهر اسم المستخدم على جميع إعلاناتك بدلاً من بريدك الإلكتروني لحماية خصوصيتك.
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          <div className="form-group">
            <label className="label">اسم المستخدم</label>
            <input type="text" className="input" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="مثال: Tiger2025" minLength={3} maxLength={20} autoFocus />
            <p className="form-hint">من 3 إلى 20 حرف - حروف وأرقام فقط</p>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ والمتابعة'}</button>
        </form>
      </div>
    </div>
  );
}
