import { Link, useLocation } from 'wouter';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import MobileBottomNav from '../components/MobileBottomNav';

export default function Settings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) { setLocation('/login'); return null; }

  const handleLogout = async () => {
    try { await signOut(auth); setLocation('/'); } catch (e) { console.error(e); }
  };

  const rows = [
    { label: 'الحساب والملف الشخصي', href: '/account-settings', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { label: 'الإشعارات', href: '/settings/notifications', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { label: 'الخصوصية', href: '/privacy', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { label: 'حول Bare', href: '/about', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> },
  ];

  return (
    <div className="page-wrap">
      <header className="page-header">
        <Link href="/profile"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
        <h1 className="page-header-title">الإعدادات</h1>
        <div className="page-header-spacer" />
      </header>

      <div className="page-content">
        <div className="settings-card">
          {rows.map((row, i) => (
            <Link key={i} href={row.href}>
              <span className="settings-row">
                <span className="settings-row-icon">{row.icon}</span>
                <span className="settings-row-label">{row.label}</span>
                <svg className="settings-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </span>
            </Link>
          ))}
        </div>

        <div className="settings-card settings-card-danger">
          <button onClick={handleLogout} className="settings-row settings-row-danger">
            <span className="settings-row-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
            <span className="settings-row-label">تسجيل الخروج</span>
            <span />
          </button>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
