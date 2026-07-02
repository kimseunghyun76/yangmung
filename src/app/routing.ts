// 해시 기반 URL 라우팅 — 라우터 라이브러리 없이 View ↔ hash 동기화.
// 목적: 뒤로가기/새로고침/딥링크가 앱 이탈이 아니라 화면 이동이 되게 한다.
// 허브 화면은 push(히스토리에 쌓임), 자동 전환(세션 소진→완료 등)은 replace.
import { useCallback, useEffect, useState } from 'react';

export type View =
  | 'home' | 'practice' | 'map' | 'review' | 'gacha'
  | 'vocab' | 'vocabTable' | 'verbs' | 'kana' | 'public' | 'ent'
  | 'intro' | 'preview' | 'session' | 'done' | 'flash' | 'write' | 'placement';

const VIEW_TO_HASH: Record<View, string> = {
  home: '/',
  practice: '/practice',
  map: '/map',
  review: '/review',
  gacha: '/gacha',
  vocab: '/vocab',
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
  placement: '/placement',
};

const HASH_TO_VIEW = new Map<string, View>(
  (Object.entries(VIEW_TO_HASH) as [View, string][]).map(([v, h]) => [h, v]),
);

// 세션 데이터가 메모리에만 있어 새로고침으로 복원할 수 없는 화면.
// (App에서 데이터 없이 이 화면에 진입하면 홈으로 되돌린다)
export const FLOW_VIEWS: ReadonlySet<View> = new Set<View>([
  'intro', 'preview', 'session', 'done', 'flash', 'write', 'placement',
]);

export function viewFromLocation(): View {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  return HASH_TO_VIEW.get(raw) ?? 'home';
}

export type Navigate = (v: View, opts?: { replace?: boolean }) => void;

export function useHashView(): [View, Navigate] {
  const [view, setView] = useState<View>(() => viewFromLocation());

  useEffect(() => {
    // 첫 진입에 해시가 없으면 '#/'로 정규화 (홈 중복 히스토리 방지)
    if (!window.location.hash) window.history.replaceState(null, '', '#/');
    const onPop = () => setView(viewFromLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback<Navigate>((v, opts) => {
    const url = `#${VIEW_TO_HASH[v]}`;
    if (window.location.hash !== url) {
      if (opts?.replace) window.history.replaceState(null, '', url);
      else window.history.pushState(null, '', url);
    }
    setView(v);
  }, []);

  return [view, navigate];
}
