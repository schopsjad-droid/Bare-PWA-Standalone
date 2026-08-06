import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// ========================================
// PWA Service Worker
// ========================================
// vite-plugin-pwa handles SW registration automatically via registerType: 'autoUpdate'
// with cleanupOutdatedCaches: true, skipWaiting: true, clientsClaim: true
// No manual cleanup needed — Workbox handles cache versioning correctly

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
