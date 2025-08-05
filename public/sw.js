// Service Worker para Festival & Friends
const CACHE_NAME = 'festival-friends-v1';
const urlsToCache = [
  '/',
  '/festivals',
  '/friends',
  '/connections'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message || 'Nueva notificación de Festival & Friends',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/',
        notificationId: data.notificationId
      },
      actions: [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/favicon.ico'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: '/favicon.ico'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Festival & Friends', options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('🔄 Processing background sync...')
    );
  }
}); 