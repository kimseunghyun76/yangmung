import { StrictMode, lazy, Suspense } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './app/ErrorBoundary';
import { applyOverrides } from './content/overrides';
import { restoreFromMirrorIfNeeded, startMirror, requestPersistentStorage } from './learn/idbMirror';

// /admin (또는 #admin) → 콘텐츠 검수·편집 페이지. 학습 앱 상태와 분리.
const path = window.location.pathname.replace(/\/$/, '');
const hash = window.location.hash.replace(/^#\/?/, '');
const isAdmin = path === '/admin' || hash === 'admin';

const Admin = lazy(() => import('./views/Admin').then((m) => ({ default: m.Admin })));

async function boot() {
  // localStorage가 비었으면 IndexedDB 미러에서 복원 — 컴포넌트가 localStorage를 읽기 전에.
  // (정상 부팅 경로에서는 동기 검사만 하고 즉시 통과 — 지연 없음)
  await restoreFromMirrorIfNeeded();
  // admin 편집 내용을 런타임 콘텐츠에 먼저 반영(앱·admin 공통)
  applyOverrides();

  // dev HMR로 main이 재실행돼도 같은 컨테이너에 createRoot를 중복 호출하지 않게 재사용
  const w = window as Window & { __ymRoot?: Root };
  const root = w.__ymRoot ?? createRoot(document.getElementById('root')!);
  w.__ymRoot = root;
  root.render(
    <StrictMode>
      <ErrorBoundary>
        {isAdmin
          ? <Suspense fallback={<p style={{ padding: 24, fontFamily: 'sans-serif' }}>검수 페이지 로딩…</p>}><Admin /></Suspense>
          : <App />}
      </ErrorBoundary>
    </StrictMode>,
  );

  startMirror();               // 이후 상태를 IndexedDB에 자동 스냅숏
  requestPersistentStorage();  // 브라우저 정리로부터 저장소 보호 요청
}

void boot();

// 서비스워커 — 오프라인 지원. 프로덕션 빌드에서만 등록(개발 중 캐시 혼란 방지).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* 등록 실패 무시 */ });
  });
}
