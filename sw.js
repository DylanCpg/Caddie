// Service worker de Caddie : permet d’ouvrir l’appli sans réseau.
// Si vous modifiez les fichiers, changez le numéro de version ci-dessous.
const CACHE = 'caddie-v11';
const ASSETS = ['./', 'index.html', 'manifest.json', 'firebase-config.js', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;
  // On ne touche qu'à l'appli et aux scripts Firebase : jamais aux échanges avec la base de données.
  if (!sameOrigin && url.hostname !== 'www.gstatic.com') return;

  const store = res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  };

  // La configuration passe par le réseau d'abord, pour prendre en compte vos modifications.
  if (sameOrigin && url.pathname.endsWith('firebase-config.js')) {
    e.respondWith(fetch(e.request).then(store).catch(() => caches.match(e.request)));
    return;
  }

  // Le reste : réponse immédiate depuis le cache, mise à jour en arrière-plan.
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(store).catch(() => hit);
      return hit || net;
    })
  );
});
