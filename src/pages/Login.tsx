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
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem' }}>
        <h1 className="text-3xl font-bold text-center mb-6">تسجيل الدخول</h1>
        
        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '0.5rem', marginBottom: '1rem' }}>
            <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{error}</p>
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
            />
          </div>

          <div className="mb-6">
            <label className="label">كلمة المرور</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            ليس لديك حساب؟{' '}
            <Link href="/register">
              <a className="text-primary font-semibold">سجل الآن</a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

