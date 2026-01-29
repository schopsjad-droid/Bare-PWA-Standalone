import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { useUnreadMessages } from '../contexts/UnreadMessagesContext';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const { totalUnread } = useUnreadMessages();
  const [location] = useLocation();

  if (!user) return null;

  const navItems = [
    { href: '/', icon: '🏠', label: 'الرئيسية', active: location === '/' },
    { href: '/favorites', icon: '❤️', label: 'المفضلة', active: location === '/favorites' },
    { href: '/create-ad', icon: '➕', label: 'إضافة', active: location === '/create-ad' },
    { href: '/messages', icon: '💬', label: 'الرسائل', active: location === '/messages' || location === '/inbox', badge: totalUnread },
    { href: '/profile', icon: '👤', label: 'حسابي', active: location === '/profile' },
  ];

  return (
    <div className="mobile-bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '12px 0',
      zIndex: 999
    }}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <a style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: item.active ? 'var(--accent-green)' : 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '12px',
            position: 'relative'
          }}>
            <span style={{ fontSize: '20px', position: 'relative' }}>
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '700',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </span>
            <span>{item.label}</span>
          </a>
        </Link>
      ))}
    </div>
  );
}
