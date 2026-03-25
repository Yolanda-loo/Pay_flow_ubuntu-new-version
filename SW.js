const CACHE_NAME = 'ubuntupay-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  // If you moved your JS/CSS to /src, add those paths here:
  // '/src/main.js' 
];

// 1. Install Event: Pre-cache the core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(self.skipWaiting()) // Force activation of the new service worker
  );
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch Event: Smart caching strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (like Tailwind CDN) to avoid errors
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Don't cache invalid responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cache the new resource for next time
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }).catch(() => {
      // Fallback: If offline and not in cache, you could return a custom offline page
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});