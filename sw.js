// Ce fichier permet l'installation réelle sur le téléphone
self.addEventListener('install', (e) => {
  console.log('Service Worker: Installé');
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});

