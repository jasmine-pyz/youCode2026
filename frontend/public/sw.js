const CACHE_NAME = "hearth-v2";

const PRECACHE_URLS = ["/", "/manifest.json"];

// ─── Install: precache app shell ───

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ───

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
  );
  self.clients.claim();
});

// ─── Fetch: network-first, falling back to cache when offline ───

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // API calls: network only (translation needs live backend)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            error: "Offline — translation unavailable",
            translatedText: "[offline]",
            targetLanguage: "en",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }

  // Everything else: network-first, fallback to cache if offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (
          event.request.method === "GET" &&
          response.status === 200 &&
          response.type === "basic"
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
