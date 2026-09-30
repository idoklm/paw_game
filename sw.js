// Service worker: keeps every game file on the tablet, so the game works without internet.
// tools/build.mjs writes precache.json and updates VERSION when any file changes.

const VERSION = 'b7aca89ed1';
const CACHE = `lighthouse-team-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const res = await fetch('precache.json', { cache: 'no-store' });
    const { files } = await res.json();
    const cache = await caches.open(CACHE);
    // cache: 'reload' skips the HTTP cache, so a new version never stores old copies.
    await cache.addAll(files.map((f) => new Request(f, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Delete only old versions of this game. Other apps on the same origin keep their caches.
    for (const key of await caches.keys()) if (key.startsWith('lighthouse-team-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      return (await cache.match('./')) || Response.error();
    }
  })());
});
