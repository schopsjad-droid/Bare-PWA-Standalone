import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      setLocation('/');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Top Green Accent Line */}
      <div className="top-accent"></div>

      <div className="flex items-center justify-center" style={{ minHeight: '100vh', paddingTop: '60px' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Link href="/">
              <a className="logo" style={{ fontSize: '32px', textDecoration: 'none', display: 'inline-block' }}>
                Bare
              </a>
            </Link>
            <h1 style={{ fontSize: '24px', fontWeight: 600, marginTop: '16px', color: 'var(--text-primary)' }}>
              تسجيل الدخول
            </h1>
          </div>
          
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

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="label">البريد الإلكتروني</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
              />
            </div>

            <div className="mb-4">
              <label className="label">كلمة المرور</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '16px' }}
              disabled={loading}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              ليس لديك حساب؟{' '}
              <Link href="/register">
                <a style={{ color: 'var(--accent-green)', fontWeight: 600, textDecoration: 'none' }}>
                  سجل الآن
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

