import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!username.trim()) { setError('يرجى إدخال اسم المستخدم'); return; }
    if (username.length < 3) { setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل'); return; }
    if (password !== confirmPassword) { setError('كلمات المرور غير متطابقة'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      await signup(email, password, username);
      setSuccess('تم إنشاء الحساب بنجاح! تم إرسال رسالة تفعيل إلى بريدك الإلكتروني.');
      setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
      setTimeout(() => { setLocation('/login'); }, 3000);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب');
    } finally { setLoading(false); }
  };

  const handleGoogleSignup = async () => {
    setError(''); setLoading(true);
    try { await loginWithGoogle(); setLocation('/'); }
    catch (err: any) { setError(err.message || 'فشل التسجيل عبر Google'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link href="/"><span className="auth-logo">Bare</span></Link>
          <h1 className="auth-title">إنشاء حساب جديد</h1>
        </div>

        {error && (
          <div className="auth-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>{success}</span>
          </div>
        )}

        <button onClick={handleGoogleSignup} disabled={loading} className="auth-google-btn">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          التسجيل عبر Google
        </button>

        <div className="auth-divider"><span>أو</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="label">اسم المستخدم</label>
            <input type="text" className="input" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="أدخل اسم المستخدم" minLength={3} />
          </div>
          <div className="auth-field">
            <label className="label">البريد الإلكتروني</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com" />
          </div>
          <div className="auth-field">
            <label className="label">كلمة المرور</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
          </div>
          <div className="auth-field">
            <label className="label">تأكيد كلمة المرور</label>
            <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <p className="auth-footer">
          لديك حساب بالفعل؟ <Link href="/login"><span className="auth-link">سجل الدخول</span></Link>
        </p>

        <div className="auth-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>بعد التسجيل، سيتم إرسال رسالة تفعيل إلى بريدك الإلكتروني.</span>
        </div>
      </div>
    </div>
  );
}
