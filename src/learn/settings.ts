// 사용자 설정 — LocalStorage. 학습 모드(난이도 프로필) + 세부 토글.
export type ReadingAidMode = 'auto' | 'always' | 'off';
export type LearnMode = 'beginner' | 'default' | 'express' | 'review';

export interface Settings {
  mode: LearnMode;
  readingAid: ReadingAidMode; // auto=익히면 사라짐, always=항상, off=끔
  autoPlay: boolean;          // 듣기 카드 진입 시 자동 재생
  slowListening: boolean;     // 자동 재생을 느리게
}

const KEY = 'yangmung:settings:v1';
const DEFAULTS: Settings = { mode: 'default', readingAid: 'auto', autoPlay: true, slowListening: false };

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : { ...DEFAULTS };
  } catch { return { ...DEFAULTS }; }
}

export function saveSettings(s: Settings): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

// 모드 프리셋 — 같은 콘텐츠를 사람마다 다르게: 보조·속도·세션 구성을 한 번에.
export interface ModePreset {
  label: string;
  desc: string;
  readingAid: ReadingAidMode;
  slowListening: boolean;
  quotas: { K: number; B: number; C: number; tip: number };
  minFresh: { K: number; B: number; C: number };
}

export const MODE_PRESETS: Record<LearnMode, ModePreset> = {
  beginner: { label: '처음부터', desc: '발음 보조 항상 · 천천히 · 가나 위주', readingAid: 'always', slowListening: true, quotas: { K: 7, B: 3, C: 3, tip: 1 }, minFresh: { K: 2, B: 1, C: 1 } },
  default: { label: '기본', desc: '모르는 가나만 보조 · 일반 속도', readingAid: 'auto', slowListening: false, quotas: { K: 6, B: 3, C: 5, tip: 1 }, minFresh: { K: 2, B: 1, C: 2 } },
  express: { label: '여행 급행', desc: '보조 최소 · 장면 미션 우선', readingAid: 'off', slowListening: false, quotas: { K: 2, B: 2, C: 9, tip: 1 }, minFresh: { K: 1, B: 1, C: 3 } },
  review: { label: '복습', desc: '틀린 것 · 오래 안 본 것 우선', readingAid: 'auto', slowListening: false, quotas: { K: 5, B: 4, C: 5, tip: 1 }, minFresh: { K: 0, B: 0, C: 0 } },
};
