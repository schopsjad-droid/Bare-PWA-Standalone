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

// UPDATED: Cache version with timestamp to force updates
const CACHE_VERSION = 'v2-' + Date.now();
const CACHE_NAME = 'bare-cache-' + CACHE_VERSION;

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-192.png',
  '/logo-512.png'
];

// Service Worker installation - UPDATED
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version:', CACHE_VERSION);
  // Force immediate activation
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Service Worker activation - UPDATED: Clear old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName.startsWith('bare-cache-')) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// UPDATED: Network-first strategy for HTML/CSS/JS to always get fresh content
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Network-first for HTML, CSS, JS files
  if (
    event.request.url.includes('.html') ||
    event.request.url.includes('.css') ||
    event.request.url.includes('.js') ||
    url.pathname === '/'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Update cache with fresh content
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
  } 
  // Cache-first for images and static assets
  else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            // Cache the fetched resource
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          });
        })
    );
  }
});

