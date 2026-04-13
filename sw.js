const CACHE_NAME = 'my-finances-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

// Install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((resp) => {
      return resp || fetch(e.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});

// Push Notifications
self.addEventListener('push', (e) => {
  const options = {
    body: e.data ? e.data.text() : 'لديك تنبيه مالي جديد!',
    icon: './icon-192.png',
    badge: './icon-192.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now() },
    dir: 'rtl',
    lang: 'ar'
  };
  e.waitUntil(
    self.registration.showNotification('My Finances', options)
  );
});
