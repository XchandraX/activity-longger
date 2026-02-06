const CACHE_NAME = 'activity-logger-v12';
const STATIC_CACHE = 'static-cache-v3';
const DYNAMIC_CACHE = 'dynamic-cache-v3';
const OFFLINE_URL = '/offline.html';

// Assets yang akan di-cache saat instalasi
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Assets dari CDN (jangan di-cache tapi di-fallback ke jaringan)
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
];

// --- INSTALL EVENT ---
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets...');
        cache.addAll([...STATIC_ASSETS, OFFLINE_URL]); // Tambah offline page
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Failed to cache static assets:', err);
      })
  );
});

// --- ACTIVATE EVENT ---
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker activated');
      return self.clients.claim();
    })
  );
});

// --- FETCH EVENT ---
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip Firebase requests (biarkan online-only)
  if (url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google.com')) {
    return;
  }

  // Skip CDN requests (biarkan dari jaringan, fallback ke cache)
  if (CDN_ASSETS.some(cdnUrl => event.request.url.startsWith(cdnUrl))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache response untuk CDN assets
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match(OFFLINE_URL);
          }
          return caches.match(event.request);
        })
    );
    return;
  }

  // Untuk local assets, cache-first strategy
  if (STATIC_ASSETS.some(asset => event.request.url.includes(asset))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
    return;
  }

  // Untuk script.js, network-first strategy
  if (event.request.url.includes('/script.js')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Default: network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache dynamic responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback ke cache jika offline
        return caches.match(event.request);
      })
  );
});

// --- BACKGROUND SYNC ---
self.addEventListener('sync', event => {
  if (event.tag === 'sync-activities') {
    console.log('[SW] Background sync for activities');
    event.waitUntil(syncActivities());
  }
});

async function syncActivities() {
  // Implementasi sync untuk data yang perlu di-sync
  console.log('[SW] Syncing activities...');
}

// --- PERIODIC SYNC (jika didukung) ---
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'update-cache') {
      console.log('[SW] Periodic cache update');
      event.waitUntil(updateCache());
    }
  });
}

async function updateCache() {
  const cache = await caches.open(STATIC_CACHE);
  for (const asset of STATIC_ASSETS) {
    try {
      const response = await fetch(asset);
      if (response.ok) {
        await cache.put(asset, response);
      }
    } catch (err) {
      console.warn(`[SW] Failed to update ${asset}:`, err);
    }
  }
}

// --- NOTIFICATION CLICK ---
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Cari window yang sudah terbuka
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Buka window baru jika tidak ada
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// --- PUSH NOTIFICATION ---
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'Pemberitahuan dari Activity Logger',
    icon: '/images/icon-192.png',
    badge: '/images/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'open',
        title: 'Buka Aplikasi'
      },
      {
        action: 'close',
        title: 'Tutup'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Activity Logger Pro',
      options
    )
  );
});

// --- NOTIFICATION CLOSE ---
self.addEventListener('notificationclose', event => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// --- OFFLINE DETECTION ---
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});