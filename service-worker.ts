/// <reference lib="WebWorker" />

declare var self: ServiceWorkerGlobalScope;

// Activate the service worker as soon as it is installed
self.addEventListener("install", (event) => {
  // The promise that skipWaiting() returns can be safely ignored.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log(navigator.storage.getDirectory);
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", async (event) => {
  event.respondWith(
    (async () => {
      const responseFromCache = await caches.match(event.request);
      if (responseFromCache) {
        return responseFromCache;
      }
      return fetch(event.request);
    })(),
  );
});
