// Service Worker pour Etchnote
// Fonctionnement hors ligne + mise en cache.
// - Code (HTML / JS / JSON) : réseau d'abord, cache en secours (les corrections arrivent tout de suite)
// - Images et icônes : cache d'abord

const CACHE_NAME = 'etchnote-v7';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './services.js',
  './manifest.json',
  './icon-192.png',
  './assets/emblem-120.webp',
  './assets/emblem-320.webp',
  './assets/icons/books.png',
  './assets/icons/inkwell.png',
  './assets/icons/scroll.png',
  './assets/icons/d20.png',
  './assets/icons/link.png'
];

// Installation : mise en cache de l'application, activation immédiate
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activation : suppression des anciens caches, prise de contrôle des pages ouvertes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

function isCode(request) {
  if (request.mode === 'navigate') return true;
  const path = new URL(request.url).pathname;
  return /\.(html|js|json)$/.test(path) || path.endsWith('/');
}

function putInCache(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic') return;
  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return; // polices, etc. : navigateur

  if (isCode(request)) {
    // Réseau d'abord
    event.respondWith(
      fetch(request)
        .then((response) => { putInCache(request, response); return response; })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Cache d'abord (images, icônes)
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      putInCache(request, response);
      return response;
    }))
  );
});
