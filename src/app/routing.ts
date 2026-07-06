// 해시 기반 URL 라우팅 — 라우터 라이브러리 없이 View ↔ hash 동기화.
// 목적: 뒤로가기/새로고침/딥링크가 앱 이탈이 아니라 화면 이동이 되게 한다.
// 허브 화면은 push(히스토리에 쌓임), 자동 전환(세션 소진→완료 등)은 replace.
import { useCallback, useEffect, useRef, useState } from 'react';

export type View =
  | 'home' | 'practice' | 'map' | 'review' | 'gacha'
  | 'vocabTable' | 'verbs' | 'kana' | 'public' | 'ent'
  | 'intro' | 'preview' | 'session' | 'done' | 'flash' | 'write' | 'kanaSpeak' | 'placement';

const VIEW_TO_HASH: Record<View, string> = {
  home: '/',
  practice: '/practice',
  map: '/map',
  review: '/review',
  gacha: '/gacha',
  vocabTable: '/vocab/basics',
  verbs: '/verbs',
  kana: '/kana',
  public: '/public',
  ent: '/ent',
  intro: '/session/intro',
  preview: '/session/preview',
  session: '/session',
  done: '/session/done',
  flash: '/flash',
  write: '/write',
  kanaSpeak: '/kana/speak',
  placement: '/placement',
};

const HASH_TO_VIEW = new Map<string, View>(
  (Object.entries(VIEW_TO_HASH) as [View, string][]).map(([v, h]) => [h, v]),
);

// 세션 데이터가 메모리에만 있어 새로고침으로 복원할 수 없는 화면.
// (App에서 데이터 없이 이 화면에 진입하면 홈으로 되돌린다)
export const FLOW_VIEWS: ReadonlySet<View> = new Set<View>([
  'intro', 'preview', 'session', 'done', 'flash', 'write', 'kanaSpeak', 'placement',
]);

export function viewFromLocation(): View {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  return HASH_TO_VIEW.get(raw) ?? 'home';
}

export type Navigate = (v: View, opts?: { replace?: boolean }) => void;
export type GoBack = (fallback: View) => void;

export function useHashView(): [View, Navigate, GoBack] {
  const [view, setView] = useState<View>(() => viewFromLocation());
  // 이번 세션에서 push()한 횟수 — "실제로 되짚어갈 히스토리가 있는지" 판단용.
  // 뒤로가기 버튼들이 고정 목적지(navigate('home') 등)로 하드코딩돼 있어, 어디서 들어왔든
  // (예: 세션 완료 화면의 빠른 연습 배너) 항상 그 화면의 "홈"으로 튕기던 버그를 막는다.
  const pushDepthRef = useRef(0);

  useEffect(() => {
    // 첫 진입에 해시가 없으면 '#/'로 정규화 (홈 중복 히스토리 방지)
    if (!window.location.hash) window.history.replaceState(null, '', '#/');
    const onPop = () => {
      setView(viewFromLocation());
      pushDepthRef.current = Math.max(0, pushDepthRef.current - 1);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback<Navigate>((v, opts) => {
    const url = `#${VIEW_TO_HASH[v]}`;
    if (window.location.hash !== url) {
      if (opts?.replace) window.history.replaceState(null, '', url);
      else { window.history.pushState(null, '', url); pushDepthRef.current++; }
    }
    setView(v);
  }, []);

  // 진짜 뒤로가기 — 브라우저 히스토리를 되짚어 "들어왔던 그 화면"으로 돌아간다(history.back()).
  // 이번 세션에서 push된 이력이 없으면(예: 새로고침 직후 딥링크) 대신 fallback 화면으로 이동.
  const goBack = useCallback<GoBack>((fallback) => {
    if (pushDepthRef.current > 0) window.history.back();
    else navigate(fallback, { replace: true });
  }, [navigate]);

  return [view, navigate, goBack];
}
