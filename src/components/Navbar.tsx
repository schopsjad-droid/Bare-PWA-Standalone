import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const [location] = useLocation();

  return (
    <nav className="header">
      <div className="header-content">
        <Link href="/"><span className="logo">Bare</span></Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav-links">
          <Link href="/"><span className={`nav-link ${location === '/' ? 'active' : ''}`}>الرئيسية</span></Link>
          {user && (
            <>
              <Link href="/messages"><span className={`nav-link ${location === '/messages' || location === '/inbox' ? 'active' : ''}`}>الرسائل</span></Link>
              <Link href="/favorites"><span className={`nav-link ${location === '/favorites' ? 'active' : ''}`}>المفضلة</span></Link>
            </>
          )}
        </div>

        {/* Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <>
              <Link href="/create-ad"><span className="btn btn-primary btn-sm">+ إضافة إعلان</span></Link>
              <Link href="/profile"><span className="btn btn-secondary btn-sm desktop-only">حسابي</span></Link>
            </>
          ) : (
            <>
              <Link href="/login"><span className="btn btn-secondary btn-sm">تسجيل الدخول</span></Link>
              <Link href="/register"><span className="btn btn-primary btn-sm desktop-only">إنشاء حساب</span></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
