const CACHE_NAME = 'my-finances-v4';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install - Cache assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - Clean old caches
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

// Fetch - Network first, fallback to cache
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((response) => {
      if (response && response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      return caches.match(e.request).then((cached) => {
        return cached || caches.match('./index.html');
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
    lang: 'ar',
    actions: [
      { action: 'open', title: 'فتح التطبيق' },
      { action: 'close', title: 'إغلاق' }
    ]
  };
  e.waitUntil(
    self.registration.showNotification('مالياتى', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'open') {
    e.waitUntil(
      clients.openWindow('./index.html')
    );
  }
});
