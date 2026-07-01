// yangmung 서비스워커 — 오프라인 지원.
// 전략: 앱 셸은 network-first, 정적 에셋은 제한형 cache-first.
// vocab 이미지는 항목이 많아 별도 캐시에 작게 보관한다.
const SHELL_CACHE = 'yangmung-shell-v2';
const ASSET_CACHE = 'yangmung-assets-v2';
const VOCAB_CACHE = 'yangmung-vocab-v2';
const KEEP_CACHES = new Set([SHELL_CACHE, ASSET_CACHE, VOCAB_CACHE]);
const MAX_ASSET_ITEMS = 180;
const MAX_VOCAB_ITEMS = 80;
const ASSET_RE = /\.(?:mp3|webp|png|jpe?g|svg|gif|woff2?|ico|json)$/i;
const VOCAB_RE = /^\/vocab\/(?:word-art|sign-art)\//;

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxItems) return;
  await Promise.all(keys.slice(0, keys.length - maxItems).map((key) => cache.delete(key)));
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // 오래된 캐시 버전 정리
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !KEEP_CACHES.has(k)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 앱 셸: network-first → 온라인이면 항상 최신, 오프라인이면 캐시된 셸
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(SHELL_CACHE);
        cache.put('/index.html', res.clone());
        return res;
      } catch {
        const cache = await caches.open(SHELL_CACHE);
        return (await cache.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  // vocab 이미지: 제한형 cache-first
  if (VOCAB_RE.test(url.pathname)) {
    e.respondWith((async () => {
      const cache = await caches.open(VOCAB_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok) {
        await cache.put(req, res.clone());
        await trimCache(VOCAB_CACHE, MAX_VOCAB_ITEMS);
      }
      return res;
    })());
    return;
  }

  // 정적 에셋: 제한형 cache-first
  if (ASSET_RE.test(url.pathname) || url.pathname.startsWith('/assets/')) {
    e.respondWith((async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok) {
        await cache.put(req, res.clone());
        await trimCache(ASSET_CACHE, MAX_ASSET_ITEMS);
      }
      return res;
    })());
    return;
  }

  // 그 외: network-first
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
