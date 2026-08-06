import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { requestNotificationPermission } from '../utils/notifications';
import MobileBottomNav from '../components/MobileBottomNav';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export default function NotificationSettings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [permissionState, setPermissionState] = useState<PermissionState>('default');
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [messagePreview, setMessagePreview] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tokenRegistered, setTokenRegistered] = useState(false);

  useEffect(() => {
    if (!user) { setLocation('/login'); return; }
    // Check notification support
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermissionState('unsupported');
    } else {
      setPermissionState(Notification.permission as PermissionState);
      setTokenRegistered(Notification.permission === 'granted');
    }
    // Load saved preferences
    const prefs = localStorage.getItem(`notif_prefs_${user.uid}`);
    if (prefs) {
      const parsed = JSON.parse(prefs);
      setMessageNotifications(parsed.messageNotifications ?? true);
      setMessagePreview(parsed.messagePreview ?? true);
    }
  }, [user]);

  const savePrefs = (msgNotif: boolean, msgPreview: boolean) => {
    if (user) {
      localStorage.setItem(`notif_prefs_${user.uid}`, JSON.stringify({ messageNotifications: msgNotif, messagePreview: msgPreview }));
    }
  };

  const handleEnableNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await requestNotificationPermission(user.uid);
      if (token) { setPermissionState('granted'); setTokenRegistered(true); }
      else { setPermissionState(Notification.permission as PermissionState); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleToggleMessages = (val: boolean) => {
    setMessageNotifications(val);
    savePrefs(val, messagePreview);
  };

  const handleTogglePreview = (val: boolean) => {
    setMessagePreview(val);
    savePrefs(messageNotifications, val);
  };

  if (!user) return null;

  return (
    <div className="page-wrap">
      <header className="page-header">
        <Link href="/settings"><span className="page-header-back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></span></Link>
        <h1 className="page-header-title">الإشعارات</h1>
        <div className="page-header-spacer" />
      </header>

      <div className="page-content">
        {/* Permission Status */}
        <div className="settings-card">
          <div className="notif-status-row">
            <div className="notif-status-icon">
              {permissionState === 'granted' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--bare-green)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
              {permissionState === 'denied' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
              {permissionState === 'default' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--bare-text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
              {permissionState === 'unsupported' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--bare-text-muted)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>}
            </div>
            <div className="notif-status-text">
              <span className="notif-status-label">حالة الإشعارات</span>
              <span className="notif-status-value">
                {permissionState === 'granted' && 'مفعّلة'}
                {permissionState === 'denied' && 'محظورة'}
                {permissionState === 'default' && 'لم يتم الطلب بعد'}
                {permissionState === 'unsupported' && 'غير مدعومة في هذا المتصفح'}
              </span>
            </div>
          </div>

          {permissionState === 'default' && (
            <button onClick={handleEnableNotifications} disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: '12px' }}>
              {loading ? 'جاري التفعيل...' : 'تفعيل الإشعارات'}
            </button>
          )}

          {permissionState === 'denied' && (
            <div className="notif-blocked-hint">
              <p>تم حظر الإشعارات من إعدادات المتصفح. لتفعيلها:</p>
              <ol>
                <li>اضغط على أيقونة القفل بجانب عنوان الموقع</li>
                <li>ابحث عن "الإشعارات" أو "Notifications"</li>
                <li>غيّر الإعداد إلى "السماح"</li>
                <li>أعد تحميل الصفحة</li>
              </ol>
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        {permissionState === 'granted' && (
          <div className="settings-card">
            <h3 className="settings-section-title">تفضيلات الإشعارات</h3>
            
            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <span className="settings-toggle-label">إشعارات الرسائل</span>
                <span className="settings-toggle-desc">إشعار عند استلام رسالة جديدة</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={messageNotifications} onChange={(e) => handleToggleMessages(e.target.checked)} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <span className="settings-toggle-label">معاينة الرسائل</span>
                <span className="settings-toggle-desc">عرض محتوى الرسالة في الإشعار</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={messagePreview} onChange={(e) => handleTogglePreview(e.target.checked)} disabled={!messageNotifications} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
        )}

        {/* Device Status */}
        <div className="settings-card">
          <h3 className="settings-section-title">حالة الجهاز</h3>
          <div className="notif-device-row">
            <span className="notif-device-label">تسجيل الجهاز</span>
            <span className={`notif-device-status ${tokenRegistered ? 'active' : ''}`}>{tokenRegistered ? 'مسجّل' : 'غير مسجّل'}</span>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
