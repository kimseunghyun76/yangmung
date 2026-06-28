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
  fastForward: boolean;       // 정답이면 자동으로 다음 카드 (빠른 진행)
  theme: Theme;               // 주간/야간
  listenRate: number;         // 듣기 속도 배율 (x0.5~x2)
  devUnlockAll?: boolean;     // 개발용 — 모든 장면 lock 무시
}

const KEY = 'yangmung:settings:v1';
const DEFAULTS: Settings = { mode: 'default', readingAid: 'auto', choiceMode: 'kana_ko', fastForward: false, theme: 'light', listenRate: 1, devUnlockAll: false };

// 듣기 속도 선택지 — 설정 UI + 검증 공용.
export const LISTEN_RATES = [0.5, 0.8, 1, 1.2, 1.5, 2] as const;

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

// ── 스킬 프로필 — 수준 진단이 채점한 스킬별 강·약 (학습 난이도와 별개, 콘텐츠 선택 힌트) ──
// 예: 애니·드라마를 많이 봐서 듣기는 강한데 가나 읽기는 약한 사람 → 듣기 콘텐츠 비중↑ + 읽기 보조 유지.
export interface SkillProfile {
  read: number;    // 0..1 — 가나/문장 읽기 정답률
  listen: number;  // 0..1 — 듣고 이해 정답률
  at: string;      // 진단 시각(ISO)
}

const SKILL_KEY = 'yangmung:skillprofile:v1';

export function saveSkillProfile(p: SkillProfile): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(SKILL_KEY, JSON.stringify(p)); } catch {}
}

// 모드 프리셋 — 같은 콘텐츠를 사람마다 다르게: 보조·속도·세션 구성을 한 번에.
export interface ModePreset {
  label: string;
  desc: string;
  readingAid: ReadingAidMode;
  choiceMode: ChoiceMode;
  quotas: { K: number; B: number; C: number; P: number; tip: number };
  minFresh: { K: number; B: number; C: number };
  /** 세션에서 선택할 미션 티어 범위 [min, max]. 이 범위 밖 미션은 제외됨. */
  tierRange: [number, number];
}

export const MODE_PRESETS: Record<LearnMode, ModePreset> = {
  // B=단어, C=장면미션, P=발음구분, tip=문법/문화 팁
  // 총량 13~15장. tip은 레벨이 낮을수록 많이(입문 3개 → 고급 0개) — 설명이 필요한 단계에 집중.
  // tierRange: 해당 모드에서 세션에 포함할 미션 티어 [최소, 최대]
  // tier 1=입문(생존), 2=기본(생활), 3=응용(문화), 4=고급(트러블), 5=고급심화(복합)
  beginner: { label: '입문', desc: '발음 보조 항상 · 일본어+한글 · 단어+발음+팁 집중', readingAid: 'always', choiceMode: 'kana_ko', quotas: { K: 0, B: 3, C: 5, P: 2, tip: 3 }, minFresh: { K: 0, B: 1, C: 1 }, tierRange: [1, 1] },
  default:  { label: '기본', desc: '모르는 가나만 보조 · 일본어+한글 · 균형',          readingAid: 'auto',   choiceMode: 'kana_ko', quotas: { K: 0, B: 3, C: 8, P: 2, tip: 2 }, minFresh: { K: 0, B: 1, C: 2 }, tierRange: [1, 2] },
  express:  { label: '중급', desc: '보조 끔 · 일본어(가나) 보기 · 문장+발음 위주',     readingAid: 'off',    choiceMode: 'kana',    quotas: { K: 0, B: 2, C: 8, P: 3, tip: 1 }, minFresh: { K: 0, B: 1, C: 3 }, tierRange: [2, 3] },
  advanced: { label: '고급', desc: '한자 보기 · 보조 끔 · 빠르게 · 문장 집중',         readingAid: 'off',    choiceMode: 'kanji',   quotas: { K: 0, B: 2, C: 10, P: 3, tip: 0 }, minFresh: { K: 0, B: 1, C: 4 }, tierRange: [3, 5] },
  review:   { label: '복습', desc: '틀린 것 · 오래 안 본 것 우선',                     readingAid: 'auto',   choiceMode: 'kana_ko', quotas: { K: 0, B: 3, C: 8, P: 2, tip: 1 }, minFresh: { K: 0, B: 0, C: 0 }, tierRange: [1, 5] },
  kana:     { label: '가나만', desc: '히라가나·가타카나만 집중 (미션 X)',               readingAid: 'auto',   choiceMode: 'kana_ko', quotas: { K: 12, B: 0, C: 0, P: 0, tip: 0 }, minFresh: { K: 4, B: 0, C: 0 }, tierRange: [1, 5] },
};

export const sceneSentenceLevelForMode = (mode: LearnMode): 1 | 2 | 3 | 4 => {
  if (mode === 'beginner' || mode === 'kana') return 1;
  if (mode === 'default' || mode === 'review') return 2;
  if (mode === 'express') return 3;
  return 4;
};
