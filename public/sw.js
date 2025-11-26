// Service Worker with Force Update Strategy
const CACHE_VERSION = 'v20241126-1845';
const CACHE_NAME = `bare-pwa-${CACHE_VERSION}`;

// Skip waiting and claim clients immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker...');
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker...');
  event.waitUntil(
    // Delete old caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Network-first strategy for HTML files
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Always fetch HTML files from network
  if (event.request.method === 'GET' && (
    url.pathname.endsWith('.html') || 
    url.pathname === '/' ||
    url.pathname.startsWith('/account-settings') ||
    url.pathname.startsWith('/profile')
  )) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other resources, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
