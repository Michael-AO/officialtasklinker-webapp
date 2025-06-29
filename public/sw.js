// Service Worker for TaskLinker - Push Notifications DISABLED
const CACHE_NAME = 'tasklinker-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/dashboard/applications',
  '/dashboard/tasks',
  '/dashboard/profile',
  '/images/logo-icon.svg'
]

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log('Service Worker: Installed')
        return self.skipWaiting()
      })
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker: Activated')
      return self.clients.claim()
    })
  )
})

// Push event - DISABLED
self.addEventListener('push', (event) => {
  console.log('🔕 Push notifications are disabled')
  // Do nothing - push notifications are disabled
})

// Notification click event - DISABLED
self.addEventListener('notificationclick', (event) => {
  console.log('🔕 Push notifications are disabled')
  event.notification.close()
})

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('Background sync triggered')
    )
  }
})

// Fetch event for caching
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return
  }

  // Skip API requests
  if (event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cache successful responses
            if (fetchResponse && fetchResponse.status === 200) {
              const responseToCache = fetchResponse.clone()
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache)
                })
            }
            return fetchResponse
          })
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/')
      })
  )
})

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
}) 