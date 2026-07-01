import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './app/ErrorBoundary';
import { applyOverrides } from './content/overrides';

// admin 편집 내용을 런타임 콘텐츠에 먼저 반영(앱·admin 공통)
applyOverrides();

// /admin (또는 #admin) → 콘텐츠 검수·편집 페이지. 학습 앱 상태와 분리.
const path = window.location.pathname.replace(/\/$/, '');
const hash = window.location.hash.replace(/^#\/?/, '');
const isAdmin = path === '/admin' || hash === 'admin';

const Admin = lazy(() => import('./views/Admin').then((m) => ({ default: m.Admin })));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {isAdmin
        ? <Suspense fallback={<p style={{ padding: 24, fontFamily: 'sans-serif' }}>검수 페이지 로딩…</p>}><Admin /></Suspense>
        : <App />}
    </ErrorBoundary>
  </StrictMode>,
);

// 서비스워커 — 오프라인 지원. 프로덕션 빌드에서만 등록(개발 중 캐시 혼란 방지).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* 등록 실패 무시 */ });
  });
}
