const CACHE_NAME = 'quran-v1';
// لیست فایل‌هایی که می‌خواهید آفلاین هم باز شوند
const urlsToCache = [
  'index.html',
  'style.css',
  'app.js',
  'data.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // اگر در کش بود از کش بده، وگرنه از شبکه بگیر
      return response || fetch(event.request);
    })
  );
});
