/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'

precacheAndRoute(self.__WB_MANIFEST)

// ── Cache API GET requests ──
registerRoute(
  ({ request, url }) => request.method === 'GET' && url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: '2Wise-api-cache',
    networkTimeoutSeconds: 8,
    plugins: [],
  })
)

// ── Cache navigation requests (HTML shell) ──
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: '2Wise-shell',
    networkTimeoutSeconds: 5,
  })
)

// ── Push notifications ──
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {
    title: '2Wise',
    body: 'You have a new notification!',
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      data: data.url || '/',
    })
  )
})

// ── Handle notification clicks ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data
  event.waitUntil(clients.openWindow(url))
})