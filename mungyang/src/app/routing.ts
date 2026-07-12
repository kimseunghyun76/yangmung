import { useCallback, useEffect, useRef, useState } from 'react';

export type View = 'home' | 'prep' | 'foundation' | 'scenes' | 'journey' | 'review' | 'gacha' | 'settings' | 'session' | 'done';

const VIEW_TO_HASH: Record<View, string> = {
  home: '/',
  prep: '/prep',
  foundation: '/foundation',
  scenes: '/scenes',
  journey: '/journey',
  review: '/review',
  gacha: '/gacha',
  settings: '/settings',
  session: '/session',
  done: '/done',
};

const HASH_TO_VIEW = new Map<string, View>(
  (Object.entries(VIEW_TO_HASH) as [View, string][]).map(([view, hash]) => [hash, view]),
);

export function viewFromLocation(hash = typeof window === 'undefined' ? '#/' : window.location.hash): View {
  const raw = hash.replace(/^#/, '') || '/';
  return HASH_TO_VIEW.get(raw) ?? 'home';
}

export function hashForView(view: View): string {
  return `#${VIEW_TO_HASH[view]}`;
}

export type Navigate = (view: View, opts?: { replace?: boolean }) => void;

export function useHashView(): [View, Navigate] {
  const [view, setView] = useState<View>(() => viewFromLocation());
  const initialized = useRef(false);

  useEffect(() => {
    if (!window.location.hash) window.history.replaceState(null, '', hashForView('home'));
    initialized.current = true;
    const onPop = () => setView(viewFromLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback<Navigate>((next, opts) => {
    const hash = hashForView(next);
    if (typeof window !== 'undefined' && window.location.hash !== hash) {
      if (opts?.replace || !initialized.current) window.history.replaceState(null, '', hash);
      else window.history.pushState(null, '', hash);
    }
    setView(next);
  }, []);

  return [view, navigate];
}
