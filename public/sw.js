// Service worker mínimo: hace la app instalable y deja una copia para abrirla
// sin conexión. Estrategia "red primero": si hay red siempre se sirve la
// versión nueva (así no se queda atascada una versión antigua tras un
// despliegue); la caché solo se usa cuando la red falla. Las peticiones a
// otros orígenes (Supabase, escudos) no se tocan.
const CACHE = 'quiniela-shell-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match(self.registration.scope) : undefined)),
      ),
  );
});
