import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyEmail() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user, resendVerificationEmail, logout } = useAuth();

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await resendVerificationEmail();
      setMessage('تم إرسال رسالة التفعيل بنجاح! يرجى التحقق من بريدك الإلكتروني.');
    } catch (err: any) {
      setError(err.message || 'فشل إرسال رسالة التفعيل');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      {/* Top Green Accent Line */}
      <div className="top-accent"></div>

      <div className="flex items-center justify-center" style={{ minHeight: '100vh', paddingTop: '60px' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', margin: '1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📧</div>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              تفعيل البريد الإلكتروني
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              تم إرسال رسالة تفعيل إلى بريدك الإلكتروني
            </p>
          </div>

          {message && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <p style={{ color: 'var(--accent-green-dark)', fontSize: '14px' }}>{message}</p>
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>
            </div>
          )}

          <div style={{
            padding: '16px',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>البريد الإلكتروني:</strong><br/>
              {user?.email}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              يرجى التحقق من صندوق الوارد (أو مجلد البريد المزعج) والنقر على رابط التفعيل.
            </p>
          </div>

          <div style={{
            padding: '16px',
            background: 'rgba(34, 197, 94, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              📋 خطوات التفعيل:
            </h3>
            <ol style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', paddingRight: '20px', margin: 0 }}>
              <li>افتح بريدك الإلكتروني</li>
              <li>ابحث عن رسالة من Bare</li>
              <li>اضغط على رابط التفعيل في الرسالة</li>
              <li>عد إلى صفحة تسجيل الدخول</li>
            </ol>
          </div>

          <button
            onClick={handleResend}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '12px' }}
          >
            {loading ? 'جاري الإرسال...' : 'إعادة إرسال رسالة التفعيل'}
          </button>

          <Link href="/login">
            <a className="btn btn-outline" style={{ width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              العودة إلى تسجيل الدخول
            </a>
          </Link>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              تسجيل الخروج
            </button>
          </div>

          <div style={{
            marginTop: '24px',
            padding: '12px',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              💡 <strong>نصيحة:</strong> إذا لم تجد الرسالة، تحقق من مجلد "البريد المزعج" أو "Spam". قد تستغرق الرسالة بضع دقائق للوصول.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

