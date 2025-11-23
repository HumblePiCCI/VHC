const CACHE_NAME = 'vh-pwa-cache-v1';
const ASSET_PATTERN = /\/assets\/.*\.(js|css|wasm)$/; // Added css

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...', event);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching app shell');
      return cache.addAll(['/', '/index.html']);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...', event);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Navigation requests (HTML) -> Network first, then Cache (or Cache first for offline?)
  // For "True Offline", we usually want Cache First or Stale-While-Revalidate for the shell.
  // Let's try Cache First for the shell to ensure offline works immediately.
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put('/index.html', response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Assets -> Cache First
  if (ASSET_PATTERN.test(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          console.log('[SW] Serving from cache:', url.pathname);
          return cached;
        }
        console.log('[SW] Fetching:', url.pathname);
        const response = await fetch(request);
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })
    );
  }
});
