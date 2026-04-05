// /// <reference lib="webworker" />

// const CACHE_NAME = "commonground-v1";

// /**
//  * Assets to precache for offline use.
//  * The app shell (HTML, CSS, JS, fonts) is cached on install
//  * so the app loads even without network.
//  *
//  * NOTE: Translation still requires either:
//  * - A network connection to your backend API, OR
//  * - An on-device model loaded in the browser (e.g. via Transformers.js)
//  *
//  * Speech recognition and TTS are browser-native and work offline
//  * in most browsers (Chrome, Safari).
//  */

// const PRECACHE_URLS = [
//   "/",
//   "/manifest.json",
// ];

// // ─── Install: precache app shell ───

// self.addEventListener("install", (event) => {
//   const e = event as ExtendableEvent;
//   e.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       return cache.addAll(PRECACHE_URLS);
//     })
//   );
//   (self as any).skipWaiting();
// });

// // ─── Activate: clean old caches ───

// self.addEventListener("activate", (event) => {
//   const e = event as ExtendableEvent;
//   e.waitUntil(
//     caches.keys().then((names) =>
//       Promise.all(
//         names
//           .filter((name) => name !== CACHE_NAME)
//           .map((name) => caches.delete(name))
//       )
//     )
//   );
//   (self as any).clients.claim();
// });

// // ─── Fetch: network-first for API, cache-first for assets ───

// self.addEventListener("fetch", (event) => {
//   const e = event as FetchEvent;
//   const url = new URL(e.request.url);

//   // API calls: network only (translation needs live backend)
//   if (url.pathname.startsWith("/api/")) {
//     e.respondWith(
//       fetch(e.request).catch(() => {
//         return new Response(
//           JSON.stringify({
//             error: "Offline — translation unavailable",
//             translatedText: "[offline]",
//             targetLanguage: "en",
//           }),
//           {
//             status: 503,
//             headers: { "Content-Type": "application/json" },
//           }
//         );
//       })
//     );
//     return;
//   }

//   // Everything else: cache-first, fallback to network
//   e.respondWith(
//     caches.match(e.request).then((cached) => {
//       if (cached) return cached;

//       return fetch(e.request).then((response) => {
//         // Cache successful GET responses
//         if (
//           e.request.method === "GET" &&
//           response.status === 200 &&
//           response.type === "basic"
//         ) {
//           const clone = response.clone();
//           caches.open(CACHE_NAME).then((cache) => {
//             cache.put(e.request, clone);
//           });
//         }
//         return response;
//       });
//     })
//   );
// });

const CACHE_NAME = "commonground-v1";

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

// ─── Fetch: network-first for API, cache-first for assets ───

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

  // Everything else: cache-first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
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
      });
    })
  );
});
