import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        {/* Logo */}
        <Link href="/">
          <a className="logo">
            📦 Bare
          </a>
        </Link>

        {/* Desktop Navigation Links (hidden on mobile) */}
        <div className="desktop-nav-links">
          <Link href="/">
            <a className={`nav-link ${location === '/' ? 'active' : ''}`}>
              🏠 الرئيسية
            </a>
          </Link>
          {user && (
            <>
              <Link href="/messages">
                <a className={`nav-link ${location === '/messages' || location === '/inbox' ? 'active' : ''}`}>
                  💬 الرسائل
                </a>
              </Link>
              <Link href="/favorites">
                <a className={`nav-link ${location === '/favorites' ? 'active' : ''}`}>
                  ❤️ المفضلة
                </a>
              </Link>
            </>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/create-ad">
                <a className="btn btn-primary">
                  + إضافة إعلان
                </a>
              </Link>
              <Link href="/profile">
                <a className="btn btn-outline desktop-only">
                  حسابي
                </a>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <a className="btn btn-outline">
                  تسجيل الدخول
                </a>
              </Link>
              <Link href="/register">
                <a className="btn btn-primary desktop-only">
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
