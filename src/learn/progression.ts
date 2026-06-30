// 레벨별 순차 진도 — 빠른 연습을 수준별/단계별로 잠그고, 단계를 통과(≥80%)하면 다음이 열린다.
// 한 레벨의 모든 단계를 통과하면 승급 시험(20문항·≥90%)이 열리고, 통과 시 다음 레벨로.
// 순수 로직만(저장은 load/save로 분리) — UI와 무관하게 테스트 가능.
import type { LearnMode } from './settings';

// 진도 레벨 = 입문 → 기본 → 중급 → 고급 (settings.mode의 핵심 4단계와 동일)
export type CoreLevel = 'beginner' | 'default' | 'express' | 'advanced';
export const CORE_LEVELS: CoreLevel[] = ['beginner', 'default', 'express', 'advanced'];
export const CORE_LEVEL_LABEL: Record<CoreLevel, string> = {
  beginner: '입문', default: '기본', express: '중급', advanced: '고급',
};

export const STAGE_PASS = 0.8;       // 단계 통과 기준(정답률)
export const PROMO_PASS = 0.9;       // 승급 시험 통과 기준
export const PROMO_COUNT = 20;       // 승급 시험 문항 수

// 단계가 어떤 빠른 연습으로 진입하는지
export type PracticeKey = 'kana' | 'pairs' | 'dictation' | 'greetings' | 'signs' | 'vocab' | 'compose' | 'verbs';

export interface ProgStage {
  id: string;            // 단계 키 (레벨 내 고유)
  label: string;
  sub: string;
  practice: PracticeKey;
  script?: 'hiragana' | 'katakana'; // practice === 'kana'일 때
}

// 3-1 ~ 3-4: 레벨별 순차 단계
export const LEVEL_STAGES: Record<CoreLevel, ProgStage[]> = {
  beginner: [
    { id: 'hiragana', label: '히라가나', sub: '표 학습 → 읽기 퀴즈', practice: 'kana', script: 'hiragana' },
    { id: 'katakana', label: '가타카나', sub: '표 학습 → 읽기 퀴즈', practice: 'kana', script: 'katakana' },
    { id: 'pairs', label: '발음 구분', sub: '비슷한 소리 변별', practice: 'pairs' },
    { id: 'dictation', label: '받아쓰기', sub: '듣고 가나로 쓰기', practice: 'dictation' },
  ],
  default: [
    { id: 'greetings', label: '기본 인사', sub: '첫 만남·감사·부탁', practice: 'greetings' },
    { id: 'signs', label: '간판·메뉴', sub: '역·식당·주의 표지 읽기', practice: 'signs' },
    { id: 'vocab', label: '어휘 커리큘럼', sub: '주제별 필수 단어', practice: 'vocab' },
  ],
  express: [
    { id: 'compose', label: '한→일 작문', sub: '뜻을 보고 일본어 만들기', practice: 'compose' },
    { id: 'verbs', label: '동사 형태', sub: 'ます·たい·ながら 활용', practice: 'verbs' },
  ],
  advanced: [], // 고급은 단계 없이 미션으로 진행
};

// settings.mode → 진도 레벨(핵심 4단계). 유틸 모드(review/kana)는 입문으로 간주.
export function coreLevelOf(mode: LearnMode): CoreLevel {
  return (CORE_LEVELS as string[]).includes(mode) ? (mode as CoreLevel) : 'beginner';
}

export function nextLevel(level: CoreLevel): CoreLevel | null {
  const i = CORE_LEVELS.indexOf(level);
  return i >= 0 && i < CORE_LEVELS.length - 1 ? CORE_LEVELS[i + 1] : null;
}

// ── 진도 상태 ────────────────────────────────────────────
export interface ProgressionState {
  completed: string[]; // 통과한 단계 키 ("beginner:hiragana" 형태)
}

const KEY = 'yangmung:progression:v1';

export function loadProgression(): ProgressionState {
  if (typeof window === 'undefined') return { completed: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { completed: [] };
    const parsed = JSON.parse(raw) as Partial<ProgressionState>;
    return { completed: Array.isArray(parsed.completed) ? parsed.completed : [] };
  } catch { return { completed: [] }; }
}

export function saveProgression(s: ProgressionState): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ }
}

export function resetProgression(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(KEY); } catch { /* noop */ }
}

export const stageKey = (level: CoreLevel, stageId: string) => `${level}:${stageId}`;

export function isStageComplete(s: ProgressionState, level: CoreLevel, stageId: string): boolean {
  return s.completed.includes(stageKey(level, stageId));
}

// 순차 잠금 — idx 단계는 그 앞 단계가 모두 완료돼야 열린다. (0번째는 항상 열림)
export function isStageUnlocked(s: ProgressionState, level: CoreLevel, idx: number): boolean {
  const stages = LEVEL_STAGES[level];
  for (let k = 0; k < idx && k < stages.length; k++) {
    if (!isStageComplete(s, level, stages[k].id)) return false;
  }
  return true;
}

export function levelAllComplete(s: ProgressionState, level: CoreLevel): boolean {
  const stages = LEVEL_STAGES[level];
  if (stages.length === 0) return true; // 고급 = 단계 없음
  return stages.every((st) => isStageComplete(s, level, st.id));
}

export function markStageComplete(s: ProgressionState, key: string): ProgressionState {
  if (s.completed.includes(key)) return s;
  return { completed: [...s.completed, key] };
}

// 다음에 해야 할 (열려 있고 아직 미완료인) 단계 인덱스. 모두 완료면 -1.
export function nextStageIndex(s: ProgressionState, level: CoreLevel): number {
  const stages = LEVEL_STAGES[level];
  for (let i = 0; i < stages.length; i++) {
    if (!isStageComplete(s, level, stages[i].id)) return i;
  }
  return -1;
}
