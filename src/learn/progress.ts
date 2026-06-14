// 학습 진척 + 세션 + 약점 재출제 — LocalStorage 기반.
// 친구 5차 권고 단순화: SM-2 X, "틀린 것/복구 사용 = 다음 세션 앞쪽, 2회 연속 정답 = 잠시 제외"

import type { Card, DictationCard, IntroduceCard, QuizCard, SpeakCard } from './cards';
import { routePosition } from '../content/routes';

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
const SEENKANA_KEY = 'yangmung:seenkana:v1';
const DISCOVERED_KEY = 'yangmung:discovered:v1';
const DEFERRED_SAVE_MS = 160;

const pendingWrites = new Map<string, unknown>();
const pendingTimers = new Map<string, number>();

function flushStorageKey(key: string): void {
  if (typeof window === 'undefined') return;
  const value = pendingWrites.get(key);
  if (value === undefined) return;
  pendingWrites.delete(key);
  const timer = pendingTimers.get(key);
  if (timer) {
    window.clearTimeout(timer);
    pendingTimers.delete(key);
  }
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function flushPendingStorage(): void {
  for (const key of [...pendingWrites.keys()]) flushStorageKey(key);
}

function saveDeferred(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  pendingWrites.set(key, value);
  if (pendingTimers.has(key)) return;
  const timer = window.setTimeout(() => flushStorageKey(key), DEFERRED_SAVE_MS);
  pendingTimers.set(key, timer);
}

function saveImmediate(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  pendingWrites.delete(key);
  const timer = pendingTimers.get(key);
  if (timer) {
    window.clearTimeout(timer);
    pendingTimers.delete(key);
  }
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

if (typeof window !== 'undefined' && !(window as Window & { __yangmungStorageFlushBound?: boolean }).__yangmungStorageFlushBound) {
  (window as Window & { __yangmungStorageFlushBound?: boolean }).__yangmungStorageFlushBound = true;
  window.addEventListener('pagehide', flushPendingStorage);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushPendingStorage();
  });
}

// 발견(이제 읽을 수 있는 표현)으로 이미 축하한 id 모음
export function loadDiscovered(): string[] {
  if (typeof window === 'undefined') return [];
  try { const raw = window.localStorage.getItem(DISCOVERED_KEY); return raw ? JSON.parse(raw) as string[] : []; } catch { return []; }
}
export function saveDiscovered(ids: string[]): void {
  if (typeof window === 'undefined') return;
  saveImmediate(DISCOVERED_KEY, ids);
}

export function loadProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch { return {}; }
}

export function saveProgress(p: ProgressMap): void {
  if (typeof window === 'undefined') return;
  saveDeferred(PROGRESS_KEY, p);
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PROGRESS_KEY);
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(SEENKANA_KEY);
    window.localStorage.removeItem(DISCOVERED_KEY);
    pendingWrites.clear();
    for (const t of pendingTimers.values()) window.clearTimeout(t);
    pendingTimers.clear();
  } catch {}
}

// ── 본 가나 카운트 (발음 보조 점진 제거용) ───────────────
// char → 마주친 횟수. 일정 횟수 이상이면 "익숙"으로 보고 로마자 보조를 뗌.
export type SeenKana = Record<string, number>;
export const KANA_FAMILIAR_AT = 3;

export function loadSeenKana(): SeenKana {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(SEENKANA_KEY);
    return raw ? (JSON.parse(raw) as SeenKana) : {};
  } catch { return {}; }
}

export function saveSeenKana(s: SeenKana): void {
  if (typeof window === 'undefined') return;
  saveDeferred(SEENKANA_KEY, s);
}

export function markKanaSeen(seen: SeenKana, chars: string[]): SeenKana {
  if (chars.length === 0) return seen;
  const next = { ...seen };
  for (const c of chars) next[c] = (next[c] ?? 0) + 1;
  return next;
}

// "이미 알아요": 가나 글자들을 바로 익숙(FAMILIAR_AT)으로 — 발음 보조도 즉시 사라짐
export function markKanaKnown(seen: SeenKana, chars: string[]): SeenKana {
  if (chars.length === 0) return seen;
  const next = { ...seen };
  for (const c of chars) next[c] = Math.max(next[c] ?? 0, KANA_FAMILIAR_AT);
  return next;
}

export function countSeenKana(seen: SeenKana): number {
  return Object.keys(seen).length;
}

// 가나 글자가 "익숙"한가 — 충분히 자주 마주쳤으면. (드릴 카드도 등장 시 seen 적립됨)
export function isKanaFamiliar(char: string, seen: SeenKana): boolean {
  return (seen[char] ?? 0) >= KANA_FAMILIAR_AT;
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
  saveImmediate(SESSION_KEY, s);
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
  opts: { correct: boolean; usedRecovery: boolean; sessionId: number; fast?: boolean },
): ProgressMap {
  // 호환성: 옛 데이터(필드 누락)도 안전. spread로 defaults 채움 + 숫자 필드 NaN/null 방어.
  const raw = map[cardId] ?? {};
  const prev: CardProgress = { ...DEFAULT_PROGRESS, ...raw };
  const prevCC = Number.isFinite(prev.consecutiveCorrect) ? prev.consecutiveCorrect : 0;
  const firstTryCorrect = opts.correct && !opts.usedRecovery;
  // 빠른 첫시도 정답 = 확실히 안다 → 즉시 익힘(cc 2). 느린 정답은 한 칸씩.
  const nextCC = firstTryCorrect ? (opts.fast ? Math.max(2, prevCC + 1) : prevCC + 1) : 0;
  return {
    ...map,
    [cardId]: {
      attempts: prev.attempts + 1,
      correct: prev.correct + (firstTryCorrect ? 1 : 0),
      lastSeenAt: new Date().toISOString(),
      usedRecoveryEver: prev.usedRecoveryEver || opts.usedRecovery,
      consecutiveCorrect: nextCC,
      lastResult: opts.usedRecovery ? 'recovery' : (opts.correct ? 'correct' : 'wrong'),
      lastSessionId: opts.sessionId,
    },
  };
}

// "이미 알아요": 즉시 익숙(2연속 정답 상태)으로 — 다음 세션부터 cooldown. 거주자·중급자용 빠른 패스.
export function recordKnown(map: ProgressMap, cardId: string, sessionId: number): ProgressMap {
  const prev: CardProgress = { ...DEFAULT_PROGRESS, ...(map[cardId] ?? {}) };
  return {
    ...map,
    [cardId]: {
      attempts: prev.attempts + 1,
      correct: prev.correct + 1,
      lastSeenAt: new Date().toISOString(),
      usedRecoveryEver: prev.usedRecoveryEver,
      consecutiveCorrect: Math.max(2, prev.consecutiveCorrect),
      lastResult: 'correct',
      lastSessionId: sessionId,
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
// 점진적 cooldown: 연속 정답이 쌓일수록 더 오래 쉼 → 잘 아는 건 자주 안 나오고,
// 약한 건 빨리 돌아옴. "이미 아는 게 무한 반복"되는 느낌을 줄이는 핵심 장치.
export function cooldownSessions(consecutiveCorrect: number): number {
  if (consecutiveCorrect >= 5) return 16;
  if (consecutiveCorrect === 4) return 8;
  if (consecutiveCorrect === 3) return 4;
  if (consecutiveCorrect >= 2) return 2;
  return 0; // 미숙 → 쉬지 않음(곧 재출제)
}

// 연속 정답(이산)보다 부드러운 0..1 숙련도 — 적응형 약점 진단·약점 우선 정렬의 기반.
// 첫시도 정답률 + 연속 정답 스트릭을 섞고, 복구 사용/최근 오답에 페널티.
export function itemMastery(p?: CardProgress): number {
  if (!p || p.attempts === 0) return 0;
  const acc = p.correct / p.attempts;                         // 첫시도 정답률
  const cc = Math.min(Math.max(p.consecutiveCorrect, 0), 4) / 4; // 스트릭(최대 4에서 포화)
  let m = 0.45 * acc + 0.55 * cc;
  if (p.usedRecoveryEver) m -= 0.08;
  if (p.lastResult === 'wrong') m -= 0.1;
  return Math.max(0, Math.min(1, m));
}

export type CardStatus = 'due' | 'new' | 'cooldown';

export function classifyCard(_c: Card, p: CardProgress | undefined, currentSessionId: number): CardStatus {
  if (!p) return 'new';
  const cd = cooldownSessions(p.consecutiveCorrect);
  if (cd > 0 && currentSessionId - p.lastSessionId <= cd) return 'cooldown';
  return 'due'; // 진척 있고 미숙 → 재출제 대상
}

// 세션 구성: 타입별 quota (B=단어·P=발음구분·C=장면미션·tip)
// 의도: 한 세션 안에 단어·발음·장면이 모두 등장해 다양성 확보.
export const SESSION_QUOTAS = { K: 0, B: 3, C: 9, P: 2, tip: 1 } as const;

// 세션 구성 설정 — 학습 모드별로 quota·최소 fresh를 바꾸기 위한 주입 지점.
export interface SessionConfig {
  quotas: { K: number; B: number; C: number; P: number; tip: number };
  minFresh: { K: number; B: number; C: number };
}

// 각 버킷에서 보장하는 최소 fresh(신규) 수 — due 복습이 quota를 다 채워서
// 새 미션·새 글자가 무한정 밀리는 걸 방지 (fresh가 그만큼 없으면 있는 만큼만).
export const SESSION_MIN_FRESH = { K: 2, B: 1, C: 2 } as const;

export const DEFAULT_SESSION_CONFIG: SessionConfig = { quotas: SESSION_QUOTAS, minFresh: SESSION_MIN_FRESH };

// 발음 구분(P) 카드 SRS — pair: 프리픽스, 같은 쌍 연속 금지, due→fresh 순
function pickPairCards(allCards: Card[], progress: ProgressMap, currentSessionId: number, limit: number): Card[] {
  if (limit <= 0) return [];
  const due: Card[] = [], fresh: Card[] = [];
  for (const c of allCards) {
    if (c.kind !== 'quiz' || !c.id.startsWith('pair:')) continue;
    if (classifyCard(c, progress[c.id], currentSessionId) === 'cooldown') continue;
    (progress[c.id] ? due : fresh).push(c);
  }
  const ordered = [...shuffleKana(due), ...shuffleKana(fresh)];
  const pairKey = (c: Card) => c.id.split(':').slice(0, 2).join(':');
  const out: Card[] = [];
  const rest = [...ordered];
  while (rest.length && out.length < limit) {
    const prev = out[out.length - 1];
    const idx = rest.findIndex((c) => !prev || pairKey(c) !== pairKey(prev));
    out.push(rest.splice(idx >= 0 ? idx : 0, 1)[0]);
  }
  return out;
}

type Bucket = 'K' | 'B' | 'C';
type ReviewableCard = QuizCard | IntroduceCard | SpeakCard | DictationCard; // reviewTarget을 가진 카드(=SRS 대상)
function bucketOf(c: ReviewableCard): Bucket | null {
  const t = c.reviewTarget?.type;
  if (t === 'kana') return 'K';
  if (t === 'phrase') return 'B';
  if (t === 'mission') return 'C';
  return null;
}

// 한 "학습 대상"의 여러 카드 형태를 묶는 개념 키 — 복습 시 형태를 변주하기 위함.
// kana:<id>:read|listen|confuse → 한 글자, listen:/dictation: → 한 표현. 그 외(미션 장면)는 카드별 고유.
function conceptKey(c: ReviewableCard): string {
  const id = c.id;
  if (id.startsWith('kana:')) { const p = id.split(':'); return `kana:${p[1]}`; }
  if (id.startsWith('listen:')) return `phrase:${id.slice(7)}`;
  if (id.startsWith('dictation:')) return `phrase:${id.slice(10)}`;
  if (id.startsWith('ko2ja:')) return `phrase:${id.slice(6)}`; // 한→일 고르기 = 같은 표현의 한 형태(변주 회전)
  if (id.startsWith('basic:')) {
    const p = id.split(':');
    return `basic:${p.slice(2).join(':')}`;
  }
  return id; // 미션 스텝·소개·말하기·흐름은 묶지 않음
}

// 처음 만날 때 형태 우선순위(읽기 → 듣기 → 구분/받아쓰기). 같은 "안 본" 형태 중 가장 부드러운 것부터.
function formRank(id: string): number {
  if (id.endsWith(':read')) return 0;
  if (id.startsWith('listen:') || id.endsWith(':listen')) return 1;
  if (id.startsWith('ko2ja:')) return 2;   // 한→일 고르기 — 듣기 다음 난이도
  if (id.startsWith('dictation:')) return 3;
  if (id.endsWith(':confuse')) return 4;
  return 1;
}

// 개념의 여러 형태 중 "가장 안 본" 대표 1장 — 안 본 것(lastSeenAt 없음) 우선, 그다음 오래된 것.
// → 복습이 매번 같은 카드가 아니라 읽기↔듣기↔받아쓰기로 회전.
function pickFreshestVariant(variants: ReviewableCard[], progress: ProgressMap): ReviewableCard {
  return [...variants].sort((a, b) => {
    const ta = progress[a.id]?.lastSeenAt ?? '';
    const tb = progress[b.id]?.lastSeenAt ?? '';
    if (ta !== tb) return ta < tb ? -1 : 1;       // 덜 최근에 본 것 먼저
    return formRank(a.id) - formRank(b.id);         // 동률이면 부드러운 형태 먼저
  })[0];
}

// C3(전철)은 C1·C2를 충분히 경험한 뒤에만 열림 — 새 장면이 너무 일찍 나오지 않게.
// 식당(C2)을 "한 번 본 수준"이 아니라 마무리(계산)까지 반복하도록 조건을 늦춤.
export const SCENE_UNLOCK_THRESHOLD = 3; // 루트 안에서 앞 장면을 이만큼 익히면 다음이 열림
export function missionExperiencedCount(progress: ProgressMap, missionId: string): number {
  const prefix = `mission:${missionId}:`;
  let n = 0;
  for (const k in progress) if (k.startsWith(prefix)) n++;
  return n;
}
// 루트별 순차 잠금 — 각 루트 첫 장면은 열림, 안에서 앞 장면을 일정량 익히면 다음 장면이 열린다.
export function isMissionUnlocked(missionId: string, progress: ProgressMap): boolean {
  if (missionId === 'C0') return true;
  const pos = routePosition(missionId);
  if (!pos) return true;            // 루트에 없는 장면은 열림(안전)
  if (pos.index === 0) return true; // 각 루트의 첫 장면은 항상 열림
  const prev = pos.route.ids[pos.index - 1];
  return missionExperiencedCount(progress, prev) >= SCENE_UNLOCK_THRESHOLD;
}

function interleave<T>(...arrs: T[][]): T[] {
  const out: T[] = [];
  const max = Math.max(0, ...arrs.map((a) => a.length));
  for (let i = 0; i < max; i++) for (const a of arrs) if (i < a.length) out.push(a[i]);
  return out;
}

interface Pool { due: ReviewableCard[]; fresh: ReviewableCard[] }
const pushByStatus = (pool: Pool, c: ReviewableCard, status: CardStatus) =>
  (status === 'due' ? pool.due : pool.fresh).push(c);

// due 우선으로 채우되, fresh를 최소 minFresh장 보장 → 새 콘텐츠가 계속 밀리지 않음.
// 적응형: due는 숙련도 낮은(약점) 카드부터 — 한정된 quota를 약점에 먼저 쓴다.
function sortWeakFirst(cards: ReviewableCard[], progress: ProgressMap): ReviewableCard[] {
  return [...cards].sort((a, b) => itemMastery(progress[a.id]) - itemMastery(progress[b.id]));
}
function pickPool(pool: Pool, quota: number, minFresh: number, progress: ProgressMap): ReviewableCard[] {
  const due = sortWeakFirst(pool.due, progress);
  const guaranteedFresh = Math.min(minFresh, pool.fresh.length, quota);
  const dueTake = Math.min(due.length, quota - guaranteedFresh);
  const freshTake = Math.min(pool.fresh.length, quota - dueTake);
  return [...due.slice(0, dueTake), ...pool.fresh.slice(0, freshTake)];
}

// 미션 카드는 "한 장면"에 집중: 진행 순서(C0→C1→…)대로 한 미션을 통째로 채우고
// quota가 남을 때만 다음 미션으로 넘어감. → "편의점 한 판" 같은 몰입감.
// 세션 id로 시드한 결정적 셔플 — 같은 세션이면 항상 같은 순서(홈 미리보기=실제 세션 일치),
// 세션이 바뀌면 순서가 바뀜(매번 같은 장면이 메인에 뜨는 지겨움 해소).
function seededOrder<T>(arr: T[], seed: number): T[] {
  let a = (seed >>> 0) || 1;
  const rng = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

function pickScene(byMission: Map<string, Pool>, quota: number, progress: ProgressMap, seed: number): ReviewableCard[] {
  const out: ReviewableCard[] = [];
  // 이미 시작한 장면은 세션마다 순서를 회전(다양성), 아직 시작 안 한 장면은 진행 순서 유지(초보에게 먼 장면이 튀지 않게).
  const entries = [...byMission.entries()];
  const started = entries.filter(([mid]) => missionExperiencedCount(progress, mid) > 0);
  const fresh = entries.filter(([mid]) => missionExperiencedCount(progress, mid) === 0);
  const ordered = [...seededOrder(started, seed), ...fresh];
  for (const [, pool] of ordered) {
    if (out.length >= quota) break;
    for (const c of [...sortWeakFirst(pool.due, progress), ...pool.fresh]) { // 장면 안에서는 약점 먼저, 그 다음 신규
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
  config: SessionConfig = DEFAULT_SESSION_CONFIG,
): Card[] {
  const k: Pool = { due: [], fresh: [] };
  const b: Pool = { due: [], fresh: [] };
  const cByMission = new Map<string, Pool>(); // 미션별 그룹 (등장 순서 = 진행 순서)
  const tips: Card[] = [];

  // 1) cooldown 아닌 형태들을 개념별로 묶음 (등장 순서 유지)
  const byConcept = new Map<string, ReviewableCard[]>();
  for (const c of allCards) {
    if (c.kind === 'tip') { tips.push(c); continue; }
    if (c.kind === 'order' || c.kind === 'discover') continue; // 흐름/발견 카드는 SRS 대상 아님
    if (c.kind === 'quiz' && c.id.startsWith('sign:')) continue;  // 거리 읽기는 전용 세션에서만
    if (c.kind === 'quiz' && c.id.startsWith('basic:')) continue; // 생활 기초는 전용 세션에서만
    if (c.kind === 'quiz' && c.id.startsWith('pair:')) continue;  // 발음 구분은 P 버킷으로 분리
    if (c.kind === 'introduce' && progress[c.id]) continue; // 새 표현 소개는 1회만 — 본 것은 제외(다른 새 표현으로)
    if (classifyCard(c, progress[c.id], currentSessionId) === 'cooldown') continue;
    const key = conceptKey(c);
    const arr = byConcept.get(key);
    if (arr) arr.push(c); else byConcept.set(key, [c]);
  }

  // 2) 개념마다 "가장 안 본" 형태 1장만 대표로 → 복습이 형태 변주로 신선해짐
  for (const variants of byConcept.values()) {
    const rep = pickFreshestVariant(variants, progress);
    const status: CardStatus = progress[rep.id] ? 'due' : 'new';
    const t = rep.reviewTarget?.type;
    if (t === 'kana') pushByStatus(k, rep, status);
    else if (t === 'phrase') pushByStatus(b, rep, status);
    else if (t === 'mission') {
      const mid = String(rep.reviewTarget!.id);
      if (!isMissionUnlocked(mid, progress)) continue; // 잠긴 장면(C3 등)은 제외
      if (!cByMission.has(mid)) cByMission.set(mid, { due: [], fresh: [] });
      pushByStatus(cByMission.get(mid)!, rep, status);
    }
  }
  const kSel = pickPool(k, config.quotas.K, config.minFresh.K, progress);
  const bSel = pickPool(b, config.quotas.B, config.minFresh.B, progress);
  const pSel = pickPairCards(allCards, progress, currentSessionId, config.quotas.P ?? 0);
  const scene = pickScene(cByMission, config.quotas.C, progress, currentSessionId);
  // 팁: 안 본 것/오래된 것부터 1개씩 회전 (매번 같은 팁 X)
  const tipsSel = [...tips]
    .sort((a, b2) => (progress[a.id]?.lastSeenAt ?? '') < (progress[b2.id]?.lastSeenAt ?? '') ? -1 : 1)
    .slice(0, config.quotas.tip);
  // 흐름: 단어(B)↔발음(P) 워밍업 → 장면 미션(C) 통째로 → 가나(K, 가나 모드용) → 팁
  return [...interleave(kSel, interleave(bSel, pSel)), ...scene, ...tipsSel];
}

// 홈에서 "시작 버튼이 정확히 몇 카드 시작인지" 표시용 (Done의 "한 세션 더" 가능 여부 판단에도 사용)
export function plannedSessionSize(
  allCards: Card[],
  progress: ProgressMap,
  currentSessionId: number,
  config: SessionConfig = DEFAULT_SESSION_CONFIG,
): number {
  return selectSessionCards(allCards, progress, currentSessionId, config).length;
}

export interface SessionBreakdown { K: number; B: number; C: number; P: number; tip: number }
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
    if (c.kind === 'tip' || c.kind === 'order' || c.kind === 'discover' || c.reviewTarget?.type !== 'mission') continue;
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
  config: SessionConfig = DEFAULT_SESSION_CONFIG,
): SessionPlan {
  const cards = selectSessionCards(allCards, progress, currentSessionId, config);
  const breakdown: SessionBreakdown = { K: 0, B: 0, C: 0, P: 0, tip: 0 };
  for (const c of cards) {
    if (c.kind === 'tip') { breakdown.tip++; continue; }
    if (c.kind === 'order') { breakdown.C++; continue; }
    if (c.kind === 'discover') continue;
    if (c.kind === 'quiz' && c.id.startsWith('pair:')) { breakdown.P++; continue; }
    const b = bucketOf(c);
    if (b === 'K') breakdown.K++;
    else if (b === 'B') breakdown.B++;
    else if (b === 'C') breakdown.C++;
  }
  return { size: cards.length, breakdown, missions: missionsFromCards(cards, progress, currentSessionId) };
}

// 장면(미션) 단독 연습 덱 — 해당 미션의 카드(스텝 + 순서 맞추기)를 순서대로. (수동 선택이라 cooldown 무시)
export function selectMissionCards(allCards: Card[], missionId: string): Card[] {
  return allCards.filter(
    (c) => (c.kind === 'introduce' || c.kind === 'quiz' || c.kind === 'order' || c.kind === 'speak')
      && c.reviewTarget?.type === 'mission' && String(c.reviewTarget.id) === missionId,
  );
}

// 발음 구분 전용 덱 — 최소 페어(듣고 둘 중 고르기)만, 약점/안 본 것 먼저. (직접 진입)
// 같은 쌍의 a/b 카드가 연속되지 않도록 쌍 id 기준으로 한 장씩 교차 선발.
export function selectPairCards(allCards: Card[], progress: ProgressMap, currentSessionId: number, limit = 12): Card[] {
  const due: Card[] = [], fresh: Card[] = [];
  for (const c of allCards) {
    if (c.kind !== 'quiz' || !c.id.startsWith('pair:')) continue;
    if (classifyCard(c, progress[c.id], currentSessionId) === 'cooldown') continue;
    (progress[c.id] ? due : fresh).push(c);
  }
  const ordered = [...shuffleKana(due), ...shuffleKana(fresh)];
  // 같은 쌍 연속 금지 (LEARNING_METHODS_PLAN §2): 인접 카드가 같은 pair id면 뒤로 민다.
  const pairKey = (c: Card) => c.id.split(':').slice(0, 2).join(':');
  const out: Card[] = [];
  const rest = [...ordered];
  while (rest.length && out.length < limit) {
    const prev = out[out.length - 1];
    const idx = rest.findIndex((c) => !prev || pairKey(c) !== pairKey(prev));
    out.push(rest.splice(idx >= 0 ? idx : 0, 1)[0]);
  }
  return out;
}

// 주제별 어휘 전용 덱 — vocab:groupId:* 카드, 그룹 필터 가능. limit = 24.
export function selectVocabCards(allCards: Card[], progress: ProgressMap, currentSessionId: number, groupId?: string, limit = 24): Card[] {
  const prefix = groupId ? `vocab:${groupId}:` : 'vocab:';
  const byConcept = new Map<string, ReviewableCard[]>();
  for (const c of allCards) {
    if (c.kind !== 'quiz' || !c.id.startsWith(prefix)) continue;
    if (classifyCard(c, progress[c.id], currentSessionId) === 'cooldown') continue;
    // 개념 키 = vocab:groupId:itemId (변형 3종을 하나로 묶음)
    const parts = c.id.split(':');
    const key = parts.slice(0, 2).concat(parts[3] ?? parts[2]).join(':');
    const arr = byConcept.get(key);
    if (arr) arr.push(c); else byConcept.set(key, [c]);
  }
  const due: ReviewableCard[] = [];
  const fresh: ReviewableCard[] = [];
  for (const variants of byConcept.values()) {
    const rep = pickFreshestVariant(variants, progress);
    (progress[rep.id] ? due : fresh).push(rep);
  }
  return [...sortWeakFirst(due, progress), ...shuffleKana(fresh)].slice(0, limit);
}

// 기본 인사 전용 덱 — vocab:greetings:* 카드만.
export function selectGreetingCards(allCards: Card[], progress: ProgressMap, currentSessionId: number, limit = 18): Card[] {
  return selectVocabCards(allCards, progress, currentSessionId, 'greetings', limit);
}

// 거리 읽기 전용 덱 — 간판·메뉴 카드만, 약점/안 본 것 먼저. (직접 진입)
export function selectSignCards(allCards: Card[], progress: ProgressMap, currentSessionId: number, limit = 12): Card[] {
  const due: Card[] = [], fresh: Card[] = [];
  for (const c of allCards) {
    if (c.kind !== 'quiz' || !c.id.startsWith('sign:')) continue;
    if (classifyCard(c, progress[c.id], currentSessionId) === 'cooldown') continue;
    (progress[c.id] ? due : fresh).push(c);
  }
  // 약점 먼저(due) 유지하되 각 그룹 내부는 셔플 — 풀이 커도 매번 같은 앞 12개만 나오지 않게.
  return [...shuffleKana(due), ...shuffleKana(fresh)].slice(0, limit);
}

// 생활 기초 전용 덱 — 숫자·순서·요일·달력·시간·금액. 같은 개념의 읽기/듣기/뜻→일본어를 회전.
export function selectBasicLifeCards(allCards: Card[], progress: ProgressMap, currentSessionId: number, limit = 24): Card[] {
  const byConcept = new Map<string, ReviewableCard[]>();
  for (const c of allCards) {
    if (c.kind !== 'quiz' || !c.id.startsWith('basic:')) continue;
    if (classifyCard(c, progress[c.id], currentSessionId) === 'cooldown') continue;
    const key = conceptKey(c);
    const arr = byConcept.get(key);
    if (arr) arr.push(c); else byConcept.set(key, [c]);
  }
  const due: ReviewableCard[] = [];
  const fresh: ReviewableCard[] = [];
  for (const variants of byConcept.values()) {
    const rep = pickFreshestVariant(variants, progress);
    (progress[rep.id] ? due : fresh).push(rep);
  }
  return [...sortWeakFirst(due, progress), ...shuffleKana(fresh)].slice(0, limit);
}

// 받아쓰기 전용 덱 — 받아쓰기 카드만, 약점/안 본 것 먼저. (직접 진입)
export function selectDictationCards(allCards: Card[], progress: ProgressMap, currentSessionId: number, limit = 12): Card[] {
  const due: Card[] = [], fresh: Card[] = [];
  for (const c of allCards) {
    if (c.kind !== 'dictation' || c.promptKind === 'korean') continue; // 작문(korean)은 별도 트랙
    if (classifyCard(c, progress[c.id], currentSessionId) === 'cooldown') continue;
    (progress[c.id] ? due : fresh).push(c);
  }
  return [...shuffleKana(due), ...shuffleKana(fresh)].slice(0, limit);
}

// 속도전 플래시 — 레벨별 카드 풀 선택.
// mode: 'kana'(가나 읽기), 'expression'(표현 듣기·의미), 'situation'(장면 대화), 'blitz'(전체 혼합)
export type FlashMode = 'kana' | 'expression' | 'situation' | 'blitz';

export function selectFlashCardsByMode(
  allCards: Card[],
  progress: ProgressMap,
  mode: FlashMode,
  limit = 12,
): Card[] {
  const seen: Card[] = [], fresh: Card[] = [];

  const isKana = (c: Card) => c.kind === 'quiz' && (
    c.id.endsWith(':read') || c.id.endsWith(':listen') || c.id.endsWith(':confuse') || c.id.startsWith('pair:')
  );
  const isExpression = (c: Card) => c.kind === 'quiz' && (
    c.id.startsWith('listen:') || c.id.startsWith('ko2ja:') || c.id.startsWith('sign:') ||
    (c.id.startsWith('basic:') && !c.id.includes(':read:')) ||
    c.id.startsWith('vocab:')
  );
  const isSituation = (c: Card) => c.kind === 'quiz' &&
    c.reviewTarget?.type === 'mission' &&
    !c.promptPhrase; // 상황 프롬프트(긴 점원 발화)는 제외 — 제한시간 내 읽기 불가

  const accept = (c: Card): boolean => {
    if (c.kind !== 'quiz' || c.choices.length < 2) return false;
    switch (mode) {
      case 'kana': return isKana(c);
      case 'expression': return isExpression(c);
      case 'situation': return isSituation(c);
      case 'blitz': return isKana(c) || isExpression(c) || isSituation(c);
    }
  };

  for (const c of allCards) {
    if (!accept(c)) continue;
    (progress[c.id] ? seen : fresh).push(c);
  }

  // 복습 우선, 부족하면 신규로 채움. 약점(틀린 것) 먼저.
  const sortWeak = (arr: Card[]) =>
    [...arr].sort((a, b) => itemMastery(progress[a.id]) - itemMastery(progress[b.id]));

  const pool = seen.length >= limit
    ? sortWeak(seen)
    : [...sortWeak(seen), ...shuffleKana(fresh)];

  return shuffleKana(pool.slice(0, Math.max(limit, 8))).slice(0, limit);
}

// 하위 호환 — 기존 호출부(블리츠 모드로 동작)
export function selectFlashCards(allCards: Card[], progress: ProgressMap, limit = 12): Card[] {
  return selectFlashCardsByMode(allCards, progress, 'blitz', limit);
}

// 한→일 작문 전용 덱 — 한국어 보고 가나 타일로 일본어 조립(산출 강화).
export function selectComposeCards(allCards: Card[], progress: ProgressMap, currentSessionId: number, limit = 12): Card[] {
  const due: Card[] = [], fresh: Card[] = [];
  for (const c of allCards) {
    if (c.kind !== 'dictation' || c.promptKind !== 'korean') continue;
    if (classifyCard(c, progress[c.id], currentSessionId) === 'cooldown') continue;
    (progress[c.id] ? due : fresh).push(c);
  }
  return [...shuffleKana(due), ...shuffleKana(fresh)].slice(0, limit);
}

// 가나 전용 덱 — 한 스크립트(히라/가타)만, 개념별 가장 안 본 형태 1장씩, 약점 먼저. (직접 진입 링크용)
export function selectScriptKanaCards(
  allCards: Card[], progress: ProgressMap, currentSessionId: number, kanaIds: Set<string>, limit = 12,
): Card[] {
  const byConcept = new Map<string, ReviewableCard[]>();
  for (const c of allCards) {
    if (c.kind !== 'quiz' || c.reviewTarget?.type !== 'kana') continue;
    if (!kanaIds.has(String(c.reviewTarget.id))) continue;
    if (classifyCard(c, progress[c.id], currentSessionId) === 'cooldown') continue;
    const key = String(c.reviewTarget.id);
    const arr = byConcept.get(key);
    if (arr) arr.push(c); else byConcept.set(key, [c]);
  }
  const due: ReviewableCard[] = [], fresh: ReviewableCard[] = [];
  for (const variants of byConcept.values()) {
    const rep = pickFreshestVariant(variants, progress);
    (progress[rep.id] ? due : fresh).push(rep);
  }
  // 가나는 오십음도(あいうえお…) 순으로 나오면 다음 글자가 유추됨 → 그룹 내부를 섞어 순서 추측 차단.
  // 학습 의도(약점 먼저)는 유지: 복습(due)을 신규(fresh)보다 앞에 두되, 각 그룹 안은 무작위.
  return [...shuffleKana(due), ...shuffleKana(fresh)].slice(0, limit);
}

// Fisher–Yates 셔플 — 가나 순서 유추 방지용
function shuffleKana<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
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
