// 학습 진척 + 세션 + 약점 재출제 — LocalStorage 기반.
// 친구 5차 권고 단순화: SM-2 X, "틀린 것/복구 사용 = 다음 세션 앞쪽, 2회 연속 정답 = 잠시 제외"

import type { Card, QuizCard } from './cards';

// ── 진척 데이터 ─────────────────────────────────────
export interface CardProgress {
  attempts: number;
  correct: number;                 // 첫시도 정답(복구 미사용)
  lastSeenAt: string;
  usedRecoveryEver: boolean;
  consecutiveCorrect: number;      // 연속 정답(복구 미사용) — 2 이상이면 잠시 제외
  lastResult: 'correct' | 'wrong' | 'recovery';
  lastSessionId: number;
}

export type ProgressMap = Record<string, CardProgress>;

const PROGRESS_KEY = 'yangmung:progress:v1';
const SESSION_KEY = 'yangmung:session:v1';

export function loadProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch { return {}; }
}

export function saveProgress(p: ProgressMap): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {}
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PROGRESS_KEY);
    window.localStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ── 세션 ────────────────────────────────────────────
export interface SessionState { lastCompletedSessionId: number }

export function loadSession(): SessionState {
  if (typeof window === 'undefined') return { lastCompletedSessionId: 0 };
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionState) : { lastCompletedSessionId: 0 };
  } catch { return { lastCompletedSessionId: 0 }; }
}

export function saveSession(s: SessionState): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch {}
}

// 세션 시작 = 이전 완료 + 1
export function nextSessionId(s: SessionState): number {
  return s.lastCompletedSessionId + 1;
}

// ── 시도 기록 ────────────────────────────────────────
const DEFAULT_PROGRESS: CardProgress = {
  attempts: 0, correct: 0, lastSeenAt: '',
  usedRecoveryEver: false, consecutiveCorrect: 0, lastResult: 'correct', lastSessionId: 0,
};
export function recordAttempt(
  map: ProgressMap,
  cardId: string,
  opts: { correct: boolean; usedRecovery: boolean; sessionId: number },
): ProgressMap {
  // 호환성: 옛 데이터(필드 누락)도 안전. spread로 defaults 채움 + 숫자 필드 NaN/null 방어.
  const raw = map[cardId] ?? {};
  const prev: CardProgress = { ...DEFAULT_PROGRESS, ...raw };
  const prevCC = Number.isFinite(prev.consecutiveCorrect) ? prev.consecutiveCorrect : 0;
  const firstTryCorrect = opts.correct && !opts.usedRecovery;
  return {
    ...map,
    [cardId]: {
      attempts: prev.attempts + 1,
      correct: prev.correct + (firstTryCorrect ? 1 : 0),
      lastSeenAt: new Date().toISOString(),
      usedRecoveryEver: prev.usedRecoveryEver || opts.usedRecovery,
      consecutiveCorrect: firstTryCorrect ? prevCC + 1 : 0,
      lastResult: opts.usedRecovery ? 'recovery' : (opts.correct ? 'correct' : 'wrong'),
      lastSessionId: opts.sessionId,
    },
  };
}

// ── 세션 결과 (done 화면용 — 이번 세션에서 익숙/약점 신호) ─────
export function sessionResult(progress: ProgressMap, sessionId: number): { masteredNow: number; weakNow: number } {
  let masteredNow = 0, weakNow = 0;
  for (const p of Object.values(progress)) {
    if (p.lastSessionId !== sessionId) continue;
    if (p.consecutiveCorrect >= 2) masteredNow++;
    if (p.lastResult === 'wrong' || p.lastResult === 'recovery') weakNow++;
  }
  return { masteredNow, weakNow };
}

// ── 요약 ────────────────────────────────────────────
export function summarize(map: ProgressMap): { seen: number; mastered: number; weak: number } {
  let seen = 0, mastered = 0, weak = 0;
  for (const p of Object.values(map)) {
    seen++;
    if (p.consecutiveCorrect >= 2) mastered++;
    else if (p.lastResult === 'wrong' || p.usedRecoveryEver) weak++;
  }
  return { seen, mastered, weak };
}

// ── 카드 분류 & 선별 (SRS 본질) ───────────────────────
// MASTERED_COOLDOWN_SESSIONS: 2회 연속 정답 후 N 세션 동안 제외
const MASTERED_COOLDOWN_SESSIONS = 2;

export type CardStatus = 'due' | 'new' | 'cooldown';

export function classifyCard(_c: QuizCard, p: CardProgress | undefined, currentSessionId: number): CardStatus {
  if (!p) return 'new';
  if (p.consecutiveCorrect >= 2 && currentSessionId - p.lastSessionId <= MASTERED_COOLDOWN_SESSIONS) {
    return 'cooldown';
  }
  return 'due'; // 진척 있고 미숙 → 재출제 대상
}

// 세션 카드 구성: [due (약점 앞)] + [new] + [tip은 항상 끝]
// 의도: 사용자가 들어오면 약점부터 만남 → 같은 단어를 다시 보게 됨
export function selectSessionCards(
  allCards: Card[],
  progress: ProgressMap,
  currentSessionId: number,
): Card[] {
  const due: QuizCard[] = [];
  const fresh: QuizCard[] = [];
  const tips: Card[] = [];
  for (const c of allCards) {
    if (c.kind === 'tip') { tips.push(c); continue; }
    const status = classifyCard(c, progress[c.id], currentSessionId);
    if (status === 'cooldown') continue;     // 잠시 제외
    if (status === 'due') due.push(c);
    else fresh.push(c);
  }
  return [...due, ...fresh, ...tips];
}

// 홈 카운트 (오늘 복습/신규)
export function sessionCounts(
  allCards: Card[],
  progress: ProgressMap,
  currentSessionId: number,
): { due: number; fresh: number; cooldown: number; total: number } {
  let due = 0, fresh = 0, cooldown = 0;
  for (const c of allCards) {
    if (c.kind !== 'quiz') continue;
    const s = classifyCard(c, progress[c.id], currentSessionId);
    if (s === 'due') due++;
    else if (s === 'new') fresh++;
    else cooldown++;
  }
  return { due, fresh, cooldown, total: due + fresh + cooldown };
}
