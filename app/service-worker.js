const CACHE_NAME = "mci-cache-v2";

const ASSETS = [
  "./",
  "digitalización_MCI.html",
  "manifest.json"
];

// ✅ INSTALACIÓN
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ✅ ACTIVACIÓN (LIMPIA CACHE VIEJO)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ✅ FETCH — NETWORK FIRST (LA CLAVE 🔥)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Solo manejar mismo dominio
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Guarda copia en cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });

        return response;
      })
      .catch(() => {
        // Si falla red → usa cache
        return caches.match(event.request);
      })
  );
});
