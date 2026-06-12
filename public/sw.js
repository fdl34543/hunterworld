const CACHE_NAME = "hunterworld-assets-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.destination !== "image") return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);

      if (cached) {
        return cached;
      }

      const response = await fetch(event.request);

      cache.put(event.request, response.clone());

      return response;
    })
  );
});