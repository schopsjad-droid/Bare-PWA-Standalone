import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link href="/">
          <a className="logo">
            📦 Bare
          </a>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/create-ad">
                <a className="btn btn-primary">
                  + إضافة إعلان
                </a>
              </Link>
              <Link href="/profile">
                <a className="btn btn-outline">
                  حسابي
                </a>
              </Link>
              <button onClick={logout} className="btn btn-outline">
                تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <a className="btn btn-outline">
                  تسجيل الدخول
                </a>
              </Link>
              <Link href="/register">
                <a className="btn btn-primary">
                  إنشاء حساب
                </a>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

