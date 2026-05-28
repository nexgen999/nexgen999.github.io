/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'x-free-dashboard-cache-v4';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa_icon.png',
  '/screenshot_desktop.png',
  '/screenshot_mobile.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Skip waiting to activate immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Warm up the cache with primary assets
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('Cache warm up warning: may lack some static screenshots yet:', err);
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      ).then(() => {
        // Take immediate control of all clients
        return self.clients.claim();
      });
    })
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Network-First strategy for application files & manifest to avoid stuck state
  if (
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/manifest.json'
  ) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache-First strategy for static assets
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request).then((response) => {
          // If response is valid, cache it
          if (response && response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, clonedResponse);
            });
          }
          return response;
        });
      })
    );
  }
});

// Listener for push notifications simulation
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});
