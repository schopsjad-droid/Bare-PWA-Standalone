importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl-7-ZhEWO0CBMHu24ebz0rNNBy6pocsg",
  authDomain: "bare-android-app.firebaseapp.com",
  projectId: "bare-android-app",
  storageBucket: "bare-android-app.firebasestorage.app",
  messagingSenderId: "674613626915",
  appId: "1:674613626915:web:1be46ae70b19cfb1600996"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo-192.png',
    badge: '/logo-192.png',
    tag: 'bare-notification',
    requireInteraction: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Service Worker installation
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Service Worker activation
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(self.clients.claim());
});

// Offline caching strategy
const CACHE_NAME = 'bare-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-192.png',
  '/logo-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

