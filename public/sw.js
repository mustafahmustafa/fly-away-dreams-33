const clearAndReleaseClients = async () => {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

  await self.registration.unregister();

  const clients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  await Promise.all(
    clients.map((client) => client.navigate(client.url).catch(() => undefined)),
  );
};

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clearAndReleaseClients());
});

self.addEventListener("fetch", () => undefined);
