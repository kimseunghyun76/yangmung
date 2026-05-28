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

// 세션 중 카드별 결과 로그 (Done 화면 통계 + 약점 재출제용)
export type AttemptResult = 'correct' | 'wrong' | 'recovery';
export interface SessionLogEntry { id: string; result: AttemptResult }

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

// 세션 구성: 타입별 quota (K↔B↔C 왕복 + 끝에 Tip)
// 의도: K가 앞을 다 잡아먹지 않게, 한 세션 안에 가나·표현·미션이 모두 등장
export const SESSION_QUOTAS = { K: 6, B: 3, C: 5, tip: 1 } as const;

type Bucket = 'K' | 'B' | 'C';
function bucketOf(c: QuizCard): Bucket | null {
  const t = c.reviewTarget?.type;
  if (t === 'kana') return 'K';
  if (t === 'phrase') return 'B';
  if (t === 'mission') return 'C';
  return null;
}

function interleave<T>(...arrs: T[][]): T[] {
  const out: T[] = [];
  const max = Math.max(0, ...arrs.map((a) => a.length));
  for (let i = 0; i < max; i++) for (const a of arrs) if (i < a.length) out.push(a[i]);
  return out;
}

export function selectSessionCards(
  allCards: Card[],
  progress: ProgressMap,
  currentSessionId: number,
): Card[] {
  const buckets: Record<Bucket, { due: QuizCard[]; fresh: QuizCard[] }> = {
    K: { due: [], fresh: [] }, B: { due: [], fresh: [] }, C: { due: [], fresh: [] },
  };
  const tips: Card[] = [];
  for (const c of allCards) {
    if (c.kind === 'tip') { tips.push(c); continue; }
    const status = classifyCard(c, progress[c.id], currentSessionId);
    if (status === 'cooldown') continue;
    const b = bucketOf(c);
    if (!b) continue;
    if (status === 'due') buckets[b].due.push(c);
    else buckets[b].fresh.push(c);
  }
  const pick = (b: Bucket, n: number): QuizCard[] =>
    [...buckets[b].due, ...buckets[b].fresh].slice(0, n);
  const k = pick('K', SESSION_QUOTAS.K);
  const bb = pick('B', SESSION_QUOTAS.B);
  const cc = pick('C', SESSION_QUOTAS.C);
  const tipsSel = tips.slice(0, SESSION_QUOTAS.tip);
  return [...interleave(k, bb, cc), ...tipsSel];
}

// 홈에서 "시작 버튼이 정확히 몇 카드 시작인지" 표시용
export function plannedSessionSize(
  allCards: Card[],
  progress: ProgressMap,
  currentSessionId: number,
): number {
  return selectSessionCards(allCards, progress, currentSessionId).length;
}

export interface SessionBreakdown { K: number; B: number; C: number; tip: number }
export function plannedSessionBreakdown(
  allCards: Card[],
  progress: ProgressMap,
  currentSessionId: number,
): SessionBreakdown {
  const out: SessionBreakdown = { K: 0, B: 0, C: 0, tip: 0 };
  for (const c of selectSessionCards(allCards, progress, currentSessionId)) {
    if (c.kind === 'tip') { out.tip++; continue; }
    const b = bucketOf(c);
    if (b === 'K') out.K++; else if (b === 'B') out.B++; else if (b === 'C') out.C++;
  }
  return out;
}

// K1 완료감: 각 글자의 'read' 카드가 2회 연속 첫시도 정답이면 "안정"으로 간주
export function k1Mastery(
  progress: ProgressMap,
  k1KanaIds: string[],
): { mastered: number; total: number } {
  let mastered = 0;
  for (const id of k1KanaIds) {
    const p = progress[`kana:${id}:read`];
    if (p && p.consecutiveCorrect >= 2) mastered++;
  }
  return { mastered, total: k1KanaIds.length };
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
