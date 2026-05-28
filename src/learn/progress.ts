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

// 각 버킷에서 보장하는 최소 fresh(신규) 수 — due 복습이 quota를 다 채워서
// 새 미션·새 글자가 무한정 밀리는 걸 방지 (fresh가 그만큼 없으면 있는 만큼만).
export const SESSION_MIN_FRESH = { K: 2, B: 1, C: 2 } as const;

type Bucket = 'K' | 'B' | 'C';
function bucketOf(c: QuizCard): Bucket | null {
  const t = c.reviewTarget?.type;
  if (t === 'kana') return 'K';
  if (t === 'phrase') return 'B';
  if (t === 'mission') return 'C';
  return null;
}

// C3(전철)은 C1·C2를 충분히 경험한 뒤에만 열림 — 새 장면이 너무 일찍 나오지 않게.
// 식당(C2)을 "한 번 본 수준"이 아니라 마무리(계산)까지 반복하도록 조건을 늦춤.
export const C3_UNLOCK = { c1: 5, c2: 4 } as const;
export function missionExperiencedCount(progress: ProgressMap, missionId: string): number {
  const prefix = `mission:${missionId}:`;
  let n = 0;
  for (const k in progress) if (k.startsWith(prefix)) n++;
  return n;
}
export function isMissionUnlocked(missionId: string, progress: ProgressMap): boolean {
  if (missionId === 'C3') {
    return missionExperiencedCount(progress, 'C1') >= C3_UNLOCK.c1
      && missionExperiencedCount(progress, 'C2') >= C3_UNLOCK.c2;
  }
  return true; // C0·C1·C2는 항상 열림 (진행 순서로 자연스레 노출)
}

function interleave<T>(...arrs: T[][]): T[] {
  const out: T[] = [];
  const max = Math.max(0, ...arrs.map((a) => a.length));
  for (let i = 0; i < max; i++) for (const a of arrs) if (i < a.length) out.push(a[i]);
  return out;
}

interface Pool { due: QuizCard[]; fresh: QuizCard[] }
const pushByStatus = (pool: Pool, c: QuizCard, status: CardStatus) =>
  (status === 'due' ? pool.due : pool.fresh).push(c);

// due 우선으로 채우되, fresh를 최소 minFresh장 보장 → 새 콘텐츠가 계속 밀리지 않음.
function pickPool(pool: Pool, quota: number, minFresh: number): QuizCard[] {
  const guaranteedFresh = Math.min(minFresh, pool.fresh.length, quota);
  const dueTake = Math.min(pool.due.length, quota - guaranteedFresh);
  const freshTake = Math.min(pool.fresh.length, quota - dueTake);
  return [...pool.due.slice(0, dueTake), ...pool.fresh.slice(0, freshTake)];
}

// 미션 카드는 "한 장면"에 집중: 진행 순서(C0→C1→…)대로 한 미션을 통째로 채우고
// quota가 남을 때만 다음 미션으로 넘어감. → "편의점 한 판" 같은 몰입감.
function pickScene(byMission: Map<string, Pool>, quota: number): QuizCard[] {
  const out: QuizCard[] = [];
  for (const pool of byMission.values()) {           // Map = 등장(=진행) 순서 유지
    if (out.length >= quota) break;
    for (const c of [...pool.due, ...pool.fresh]) {   // 장면 안에서는 약점 먼저, 그 다음 신규
      if (out.length >= quota) break;
      out.push(c);
    }
  }
  return out;
}

export function selectSessionCards(
  allCards: Card[],
  progress: ProgressMap,
  currentSessionId: number,
): Card[] {
  const k: Pool = { due: [], fresh: [] };
  const b: Pool = { due: [], fresh: [] };
  const cByMission = new Map<string, Pool>(); // 미션별 그룹 (등장 순서 = 진행 순서)
  const tips: Card[] = [];
  for (const c of allCards) {
    if (c.kind === 'tip') { tips.push(c); continue; }
    const status = classifyCard(c, progress[c.id], currentSessionId);
    if (status === 'cooldown') continue;
    const t = c.reviewTarget?.type;
    if (t === 'kana') pushByStatus(k, c, status);
    else if (t === 'phrase') pushByStatus(b, c, status);
    else if (t === 'mission') {
      const mid = String(c.reviewTarget!.id);
      if (!isMissionUnlocked(mid, progress)) continue; // 잠긴 장면(C3 등)은 제외
      if (!cByMission.has(mid)) cByMission.set(mid, { due: [], fresh: [] });
      pushByStatus(cByMission.get(mid)!, c, status);
    }
  }
  const kSel = pickPool(k, SESSION_QUOTAS.K, SESSION_MIN_FRESH.K);
  const bSel = pickPool(b, SESSION_QUOTAS.B, SESSION_MIN_FRESH.B);
  const scene = pickScene(cByMission, SESSION_QUOTAS.C);
  const tipsSel = tips.slice(0, SESSION_QUOTAS.tip);
  // 흐름: 가나·표현으로 몸풀기(K↔B 왕복) → 미션 한 장면 통째로 → 팁
  return [...interleave(kSel, bSel), ...scene, ...tipsSel];
}

// 홈에서 "시작 버튼이 정확히 몇 카드 시작인지" 표시용 (Done의 "한 세션 더" 가능 여부 판단에도 사용)
export function plannedSessionSize(
  allCards: Card[],
  progress: ProgressMap,
  currentSessionId: number,
): number {
  return selectSessionCards(allCards, progress, currentSessionId).length;
}

export interface SessionBreakdown { K: number; B: number; C: number; tip: number }
// isReview: 이번 세션에 이 미션의 신규(new) 카드가 없고 전부 복습(due)일 때 true → "복습하기" 카피.
export interface SessionMission { id: string; scenario: string; isReview: boolean }

// 세션 계획 한 번에: 장수 + 트랙 구성 + 이번 세션에 등장하는 미션 목록(목표 카피용).
// 홈에서 selectSessionCards를 여러 번 부르지 않도록 단일 진입점으로 묶음.
export interface SessionPlan {
  size: number;
  breakdown: SessionBreakdown;
  missions: SessionMission[]; // 등장 순서대로 distinct
}
// 카드 목록에서 등장 미션 목록(복습 여부 포함) 추출 — 자동 세션·장면 세션·인트로 공용.
export function missionsFromCards(
  cards: Card[],
  progress: ProgressMap,
  currentSessionId: number,
): SessionMission[] {
  const missions: SessionMission[] = [];
  const seen = new Set<string>();
  const freshMissions = new Set<string>();
  for (const c of cards) {
    if (c.kind !== 'quiz' || c.reviewTarget?.type !== 'mission') continue;
    const id = String(c.reviewTarget.id);
    if (!seen.has(id)) { seen.add(id); missions.push({ id, scenario: c.scenario ?? '', isReview: true }); }
    if (classifyCard(c, progress[c.id], currentSessionId) === 'new') freshMissions.add(id);
  }
  for (const m of missions) m.isReview = !freshMissions.has(m.id);
  return missions;
}

export function planSession(
  allCards: Card[],
  progress: ProgressMap,
  currentSessionId: number,
): SessionPlan {
  const cards = selectSessionCards(allCards, progress, currentSessionId);
  const breakdown: SessionBreakdown = { K: 0, B: 0, C: 0, tip: 0 };
  for (const c of cards) {
    if (c.kind === 'tip') { breakdown.tip++; continue; }
    const b = bucketOf(c);
    if (b === 'K') breakdown.K++;
    else if (b === 'B') breakdown.B++;
    else if (b === 'C') breakdown.C++;
  }
  return { size: cards.length, breakdown, missions: missionsFromCards(cards, progress, currentSessionId) };
}

// 장면(미션) 단독 연습 덱 — 해당 미션의 카드를 스텝 순서대로. (수동 선택이라 cooldown 무시)
export function selectMissionCards(allCards: Card[], missionId: string): Card[] {
  return allCards.filter(
    (c) => c.kind === 'quiz' && c.reviewTarget?.type === 'mission' && String(c.reviewTarget.id) === missionId,
  );
}

// 미션(장면) 진척 — 익숙(2연속 정답) 카드 수 / 전체 카드 수.
export function missionProgress(
  allCards: Card[],
  progress: ProgressMap,
  missionId: string,
): { mastered: number; total: number; started: boolean } {
  let mastered = 0, total = 0, started = false;
  for (const c of allCards) {
    if (c.kind !== 'quiz' || c.reviewTarget?.type !== 'mission' || String(c.reviewTarget.id) !== missionId) continue;
    total++;
    const p = progress[c.id];
    if (p) { started = true; if (p.consecutiveCorrect >= 2) mastered++; }
  }
  return { mastered, total, started };
}

// 가나 완료감(읽기 기준): 각 글자의 'read' 카드가 2회 연속 첫시도 정답이면 "안정"으로 간주.
// K1·K2 등 어떤 단계든 kanaIds만 넘기면 재사용 가능.
export function kanaReadMastery(
  progress: ProgressMap,
  kanaIds: string[],
): { mastered: number; total: number } {
  let mastered = 0;
  for (const id of kanaIds) {
    const p = progress[`kana:${id}:read`];
    if (p && p.consecutiveCorrect >= 2) mastered++;
  }
  return { mastered, total: kanaIds.length };
}

// 글자별 읽기 안정 여부 (홈 칩 표시용)
export function isKanaReadStable(progress: ProgressMap, kanaId: string): boolean {
  const p = progress[`kana:${kanaId}:read`];
  return !!p && p.consecutiveCorrect >= 2;
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
