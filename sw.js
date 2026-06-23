// ==========================================
// SERVICE WORKER — Finance RDC Pro v2.7
// Stratégie : Cache-First + Offline Fallback
// ==========================================

const CACHE_NAME = "finance-rdc-v2.7";
const OFFLINE_URL = "index.html";

// Ressources à mettre en cache immédiatement
const PRECACHE_ASSETS = [
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",
  "icon-app.png",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/chart.js"
];

// ── Installation : précache des ressources essentielles ──────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activation : suppression des anciens caches ──────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch : Cache-First pour assets, Network-First pour API ──
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Requêtes API de taux de change → Network-First (données fraîches)
  if (url.hostname === "open.er-api.com") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)) // Fallback sur le cache si hors ligne
    );
    return;
  }

  // Requêtes Firebase → Network-Only (temps réel obligatoire)
  if (
    url.hostname.includes("firebaseapp.com") ||
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("gstatic.com")
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Tout le reste → Cache-First
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Ne cache que les réponses valides
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Fallback HTML si navigation hors ligne
          if (request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

// ── Message : force la mise à jour depuis l'UI ───────────────
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
