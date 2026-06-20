// yangmung 서비스워커 — 오프라인 지원.
// 전략: 앱 셸(내비게이션)은 network-first(항상 최신 코드, 오프라인 시 캐시),
//       정적 에셋(이미지·오디오·해시된 JS/CSS)은 cache-first(오프라인·속도).
// 해시 파일명을 쓰는 빌드라 새 배포는 새 index.html이 새 에셋을 가리켜 자연히 갱신된다.
const CACHE = 'yangmung-v1';
const ASSET_RE = /\.(?:mp3|webp|png|jpe?g|svg|gif|woff2?|ico|json)$/i;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // 오래된 캐시 버전 정리
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
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
        const cache = await caches.open(CACHE);
        cache.put('/index.html', res.clone());
        return res;
      } catch {
        return (await caches.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  // 정적 에셋: cache-first
  if (ASSET_RE.test(url.pathname) || url.pathname.startsWith('/assets/')) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      if (res.ok) { const cache = await caches.open(CACHE); cache.put(req, res.clone()); }
      return res;
    })());
    return;
  }

  // 그 외: network-first
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
