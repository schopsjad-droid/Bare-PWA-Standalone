import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  chatId?: string;
  adTitle?: string;
}

interface InAppNotificationProps {
  notification: NotificationData | null;
  onDismiss: () => void;
}

export default function InAppNotification({ notification, onDismiss }: InAppNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300); }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleClick = useCallback(() => {
    if (notification?.chatId) { setLocation(`/chat/${notification.chatId}`); }
    setVisible(false);
    setTimeout(onDismiss, 100);
  }, [notification, setLocation, onDismiss]);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  if (!notification) return null;

  return (
    <div className={`in-app-toast${visible ? ' visible' : ''}`} onClick={handleClick}>
      <div className="in-app-toast-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bare-green)" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>
      <div className="in-app-toast-content">
        <span className="in-app-toast-title">{notification.title}</span>
        <span className="in-app-toast-body">{notification.body}</span>
        {notification.adTitle && <span className="in-app-toast-ad">{notification.adTitle}</span>}
      </div>
      <button className="in-app-toast-close" onClick={handleClose}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}
