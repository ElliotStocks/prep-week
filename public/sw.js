// Prep Week service worker: cache-first for photos and built assets (fingerprinted
// filenames make stale caches impossible), network-first for the app shell so
// updates arrive on next load. Bump CACHE to force a clean slate.
const CACHE = 'prep-week-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  const cacheFirst = url.pathname.includes('/photos/') || url.pathname.includes('/assets/') || url.pathname.includes('/icons/');
  // only ever cache successful responses — caching a 404 would make it permanent
  if (cacheFirst) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      }))
    );
  } else {
    e.respondWith(
      fetch(e.request).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./')))
    );
  }
});
