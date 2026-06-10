// 사용자 설정 — LocalStorage. 학습 모드(난이도 프로필) + 세부 토글.
export type ReadingAidMode = 'auto' | 'always' | 'off';
// 난이도 사다리: 입문 → 기본 → 중급(express) → 고급(advanced). review·kana는 유틸 모드.
export type LearnMode = 'beginner' | 'default' | 'express' | 'advanced' | 'review' | 'kana';
// 퀴즈 보기 표시: 일본어+한글 / 일본어(가나)만 / 한자 — 난이도가 오를수록 한글을 떼고 한자로.
export type ChoiceMode = 'kana_ko' | 'kana' | 'kanji';

export type Theme = 'light' | 'dark';
export interface Settings {
  mode: LearnMode;
  readingAid: ReadingAidMode; // auto=익히면 사라짐, always=항상, off=끔
  choiceMode: ChoiceMode;     // 퀴즈 보기를 일본어로(난이도별)
  slowListening: boolean;     // 듣기 자동 재생을 느리게
  fastForward: boolean;       // 정답이면 자동으로 다음 카드 (빠른 진행)
  theme: Theme;               // 주간/야간
}

const KEY = 'yangmung:settings:v1';
const DEFAULTS: Settings = { mode: 'default', readingAid: 'auto', choiceMode: 'kana_ko', slowListening: false, fastForward: true, theme: 'light' };

// 첫 실행이면 시스템 외형(라이트/다크)을 따른다 (Apple HIG: 시스템 appearance 존중).
function systemTheme(): Theme {
  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch { return 'light'; }
}

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS, theme: systemTheme() }; // 첫 실행 = 시스템 외형
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch { return { ...DEFAULTS, theme: systemTheme() }; }
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
  choiceMode: ChoiceMode;
  slowListening: boolean;
  quotas: { K: number; B: number; C: number; tip: number };
  minFresh: { K: number; B: number; C: number };
}

export const MODE_PRESETS: Record<LearnMode, ModePreset> = {
  beginner: { label: '입문', desc: '발음 보조 항상 · 천천히 · 일본어+한글 · 가나 위주', readingAid: 'always', choiceMode: 'kana_ko', slowListening: true, quotas: { K: 7, B: 3, C: 3, tip: 1 }, minFresh: { K: 2, B: 1, C: 1 } },
  default: { label: '기본', desc: '모르는 가나만 보조 · 일본어+한글 · 균형', readingAid: 'auto', choiceMode: 'kana_ko', slowListening: false, quotas: { K: 6, B: 3, C: 5, tip: 1 }, minFresh: { K: 2, B: 1, C: 2 } },
  express: { label: '중급', desc: '보조 끔 · 일본어(가나) 보기 · 장면 위주', readingAid: 'off', choiceMode: 'kana', slowListening: false, quotas: { K: 2, B: 2, C: 9, tip: 1 }, minFresh: { K: 1, B: 1, C: 3 } },
  advanced: { label: '고급', desc: '한자 보기 · 보조 끔 · 빠르게 · 장면 위주', readingAid: 'off', choiceMode: 'kanji', slowListening: false, quotas: { K: 1, B: 2, C: 10, tip: 1 }, minFresh: { K: 0, B: 1, C: 3 } },
  review: { label: '복습', desc: '틀린 것 · 오래 안 본 것 우선', readingAid: 'auto', choiceMode: 'kana_ko', slowListening: false, quotas: { K: 5, B: 4, C: 5, tip: 1 }, minFresh: { K: 0, B: 0, C: 0 } },
  kana: { label: '가나만', desc: '히라가나·가타카나만 집중 (미션 X)', readingAid: 'auto', choiceMode: 'kana_ko', slowListening: false, quotas: { K: 12, B: 0, C: 0, tip: 0 }, minFresh: { K: 4, B: 0, C: 0 } },
};
