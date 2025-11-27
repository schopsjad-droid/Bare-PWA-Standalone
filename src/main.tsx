import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ========================================
// كود "القتل الرحيم" للكاش القديم
// ========================================
if ('serviceWorker' in navigator) {
  // 1. إلغاء تسجيل جميع Service Workers القديمة
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    console.log('[CLEANUP] Found', registrations.length, 'service workers');
    for (const registration of registrations) {
      console.log('[CLEANUP] Unregistering:', registration.scope);
      registration.unregister();
    }
  });

  // 2. مسح جميع الـ Caches القديمة
  caches.keys().then((names) => {
    console.log('[CLEANUP] Found', names.length, 'caches');
    for (const name of names) {
      console.log('[CLEANUP] Deleting cache:', name);
      caches.delete(name);
    }
  });
}

// ========================================
// تسجيل PWA الجديد (vite-plugin-pwa)
// ========================================
// سيتم تسجيل Service Worker تلقائياً بواسطة vite-plugin-pwa
// لا حاجة لكود يدوي هنا

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
