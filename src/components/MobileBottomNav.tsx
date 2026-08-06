import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useUnreadMessages } from '../contexts/UnreadMessagesContext';

const icons = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  heart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  plus: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  message: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  user: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

export default function MobileBottomNav() {
  const { user } = useAuth();
  const { totalUnread } = useUnreadMessages();
  const [location] = useLocation();

  if (!user) return null;

  const navItems = [
    { href: '/', icon: icons.home, label: 'الرئيسية', active: location === '/' },
    { href: '/favorites', icon: icons.heart, label: 'المفضلة', active: location === '/favorites' },
    { href: '/create-ad', icon: icons.plus, label: 'إضافة', active: location === '/create-ad' },
    { href: '/messages', icon: icons.message, label: 'الرسائل', active: location === '/messages' || location === '/inbox', badge: totalUnread },
    { href: '/profile', icon: icons.user, label: 'حسابي', active: location === '/profile' },
  ];

  return (
    <nav className="mobile-bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 0 calc(8px + env(safe-area-inset-bottom, 0px))',
      zIndex: 999
    }}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <a style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: item.active ? 'var(--accent-green)' : 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '10px',
            fontWeight: item.active ? '600' : '400',
            position: 'relative',
            minWidth: '44px',
            minHeight: '44px',
            justifyContent: 'center'
          }}>
            <span style={{ position: 'relative', display: 'flex' }}>
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-10px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: '700',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px'
                }}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </span>
            <span>{item.label}</span>
          </a>
        </Link>
      ))}
    </nav>
  );
}
