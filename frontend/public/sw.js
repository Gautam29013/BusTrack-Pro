/**
 * Service Worker for BusTrackPro
 * - Caches app shell for offline mode
 * - Caches last-known bus location API responses
 * - Serves cached data when network is unavailable
 */

const CACHE_NAME = 'bustrakpro-v1';
const BUS_DATA_CACHE = 'bustrakpro-bus-data-v1';

// App shell: static assets to precache
const SHELL_URLS = [
  '/',
  '/dashboard',
  '/offline',
];

// ── Install: Cache app shell ────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_URLS).catch(() => {
        // Non-fatal: some pages may not be pre-rendered
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: Clean old caches ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== BUS_DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Network-first for API, cache-first for assets ───────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache bus API responses (network-first, fall back to cache)
  if (url.pathname.includes('/api/buses') || url.pathname.includes('/api/stops')) {
    event.respondWith(
      fetch(request.clone())
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(BUS_DATA_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For navigation requests: network first, offline page fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/offline') || caches.match('/'))
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// ── Push Notifications ──────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'BusTrackPro', {
      body: data.body || 'Bus update',
      icon: '/bus-icon.svg',
      badge: '/bus-icon.svg',
      tag: data.tag || 'bus-update',
      renotify: true,
      data: data.url ? { url: data.url } : {},
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
