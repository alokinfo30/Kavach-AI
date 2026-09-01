// Kavach-AI Service Worker for Offline Access & PWA Support
const CACHE_NAME = 'kavach-ai-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Some assets could not be cached on install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For API requests, attempt network first with fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful GET API responses for offline viewing
          if (event.request.method === 'GET' && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Network failed, check cache
          const cached = await caches.match(event.request);
          if (cached) {
            return cached;
          }
          // Return an offline json response
          return new Response(
            JSON.stringify({ 
              error: 'Offline Mode Active',
              message: 'You are currently offline. Showing cached system state.',
              offline: true 
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // For navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedIndex = await cache.match('/index.html') || await cache.match('/');
        return cachedIndex || new Response('Offline: Kavach-AI is ready when reconnected.', {
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for other static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
