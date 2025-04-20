const CACHE_NAME = 'galeria-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg'  
];

// Instalación del Service Worker y precaching
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        urlsToCache.map((url) => cache.add(url))
      ).then((results) => {
        results.forEach((res, i) => {
          if (res.status === 'rejected') {
            console.warn(`[SW] No se pudo cachear: ${urlsToCache[i]}`);
          }
        });
      });
    })
  );
});


// Activación del SW
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      )
    )
  );
});

// Interceptar fetch y usar cache
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/gallery')) return;
  if (
    !event.request.url.startsWith('http') ||
    event.request.method !== 'GET' ||
    event.request.url.includes('localhost:3000') || // ✅ evita interceptar al backend
    event.request.url.includes('vite') ||
    event.request.url.includes('__vite_ping') ||
    event.request.url.includes('sockjs-node')
  ) return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si está cacheado, lo usamos
      if (cachedResponse) return cachedResponse;

      // Si no, lo pedimos a la red y lo cacheamos
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Clonamos porque fetch y cache.put consumen el stream
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Si falla (por ejemplo, sin red), mostramos un fallback
        return new Response('<h1>Estás offline. Y no hay versión guardada.</h1>', {
          headers: { 'Content-Type': 'text/html' }
        });
      });
    })
  );
});

// Notificaciones push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png'
    })
  );
});

