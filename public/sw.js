const CACHE_NAME = 'anispectra-pwa-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/anispectra-192x192.png',
  '/anispectra-512x512.png',
  '/anispectra-180x180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Faqat GET so'rovlarni ushlash
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Yandex, Google Analytics va boshqa tashqi xizmatlar so'rovlarini o'tkazib yuborish
  if (url.origin !== location.origin) return;

  // Video va API so'rovlarni keshlamaslik
  if (event.request.url.includes('/api/') || event.request.url.includes('video') || event.request.url.includes('stream')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return new Response(null, { status: 408, statusText: 'Request failed or blocked' });
      });
    })
  );
});
