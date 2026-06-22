// 가챠 컬렉션 — 학습 로직과 분리된 수집 보상.
// 장면별 카드를 모으고, 낮은 등급 카드를 병합해 상위 등급과 명예 트로피를 만든다.
export type Rarity = 'basic' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'xur';
export type TrophyKey = 'honor';
export type BoxGrade = 'wood' | 'silver' | 'gold';

export type ItemCounts = Partial<Record<Rarity, number>>;

export interface DeckCard {
  items: ItemCounts;
  // v1 마이그레이션용. 저장 시 제거하지 않아도 무해하게 읽는다.
  tier?: number;
  shards?: number;
}

export interface Collection {
  cards: Record<string, DeckCard>;      // key = 미션 id (C1…)
  sentences: Record<string, string[]>;  // legacy: old expression rewards. New gacha uses gift cards only.
  trophies: Partial<Record<TrophyKey, number>>;
  lastClaimedSessionId: number;          // 같은 세션 중복 보상 방지
}

const KEY = 'yangmung:collection:v1';
const EMPTY: Collection = { cards: {}, sentences: {}, trophies: {}, lastClaimedSessionId: 0 };

export const RARITIES: { key: Rarity; label: string; color: string; weight: number }[] = [
  { key: 'basic', label: 'N', color: '#8b95a3', weight: 50 },
  { key: 'bronze', label: 'R', color: '#b77a42', weight: 30 },
  { key: 'silver', label: 'SR', color: '#9aa3ad', weight: 10 },
  { key: 'gold', label: 'SSR', color: '#d9a531', weight: 7 },
  { key: 'diamond', label: 'UR', color: '#5bc7e0', weight: 3 },
  { key: 'xur', label: 'XUR', color: '#b996ff', weight: 0 },
];

export const DRAW_COUNT = 10;
export const MERGE_NEED: Record<Rarity, number> = {
  basic: 10,
  bronze: 5,
  silver: 5,
  gold: 5,
  diamond: 3,
  xur: Number.POSITIVE_INFINITY,
};

export const rarityMeta = (rarity: Rarity) => RARITIES.find((r) => r.key === rarity) ?? RARITIES[0];
export const rarityToTier = (rarity: Rarity) => RARITIES.findIndex((r) => r.key === rarity) + 1;
export const tierToRarity = (tier: number): Rarity => RARITIES[Math.min(Math.max(tier, 1), 6) - 1].key;
export const MAX_TIER = 6;

export const BOX: Record<BoxGrade, { label: string; draws: number; colors: [string, string] }> = {
  wood: { label: '가챠 박스', draws: DRAW_COUNT, colors: ['#c56f62', '#d78f73'] },
  silver: { label: '빛나는 가챠 박스', draws: DRAW_COUNT, colors: ['#7f8794', '#c7ccd4'] },
  gold: { label: '특별 가챠 박스', draws: DRAW_COUNT, colors: ['#c8951f', '#e8c45a'] },
};

export interface DropResult {
  sceneId: string;
  rarity: Rarity;
  count: number;
  isNew: boolean;
  sentenceIds: string[];
  // 구 API 호환용 표시 필드.
  tier: number;
  shards: number;
  leveledTo: number | null;
}

function emptyItems(): Record<Rarity, number> {
  return { basic: 0, bronze: 0, silver: 0, gold: 0, diamond: 0, xur: 0 };
}

export function itemsOf(card?: DeckCard): Record<Rarity, number> {
  const items = { ...emptyItems(), ...(card?.items ?? {}) };
  if (card && !card.items && card.tier) {
    const migrated = tierToRarity(card.tier);
    items[migrated] = Math.max(items[migrated], 1);
    if (card.shards && card.tier < MAX_TIER) items[tierToRarity(card.tier)] += card.shards;
  }
  return items;
}

function normalizeCard(card?: DeckCard): DeckCard {
  return { items: itemsOf(card) };
}

function normalizeCollection(c: Partial<Collection>): Collection {
  const cards = Object.fromEntries(Object.entries(c.cards ?? {}).map(([id, card]) => [id, normalizeCard(card)]));
  return {
    cards,
    sentences: c.sentences ?? {},
    trophies: c.trophies ?? {},
    lastClaimedSessionId: c.lastClaimedSessionId ?? 0,
  };
}

export function loadCollection(): Collection {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return normalizeCollection(JSON.parse(raw) as Partial<Collection>);
  } catch { return { ...EMPTY }; }
}

export function saveCollection(c: Collection): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(normalizeCollection(c))); } catch {}
}

function weightedFromTable(table: { rarity: Rarity; weight: number }[]): Rarity {
  const total = table.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of table) {
    roll -= r.weight;
    if (roll <= 0) return r.rarity;
  }
  return table[0]?.rarity ?? 'basic';
}

function weightedRarity(level: 1 | 2 | 3 | 4 = 2): Rarity {
  void level;
  return weightedFromTable(RARITIES.filter((r) => r.weight > 0).map((r) => ({ rarity: r.key, weight: r.weight })));
}

function pickScene(sceneIds: string[]): string {
  return sceneIds[Math.floor(Math.random() * sceneIds.length)];
}

export function nextMergeRarity(rarity: Rarity): Rarity | null {
  if (rarity === 'xur') return null;
  return tierToRarity(Math.min(MAX_TIER, rarityToTier(rarity) + 1));
}

export function canMergeRarity(card: DeckCard | undefined, rarity: Rarity): boolean {
  const need = MERGE_NEED[rarity];
  return Number.isFinite(need) && itemsOf(card)[rarity] >= need;
}

export function mergeSceneRarity(prev: Collection, sceneId: string, rarity: Rarity): { collection: Collection; target: Rarity } | null {
  const target = nextMergeRarity(rarity);
  if (!target) return null;
  const c = normalizeCollection(prev);
  const items = itemsOf(c.cards[sceneId]);
  const need = MERGE_NEED[rarity];
  if (items[rarity] < need) return null;
  items[rarity] -= need;
  items[target] += 1;
  return { collection: { ...c, cards: { ...c.cards, [sceneId]: { items } } }, target };
}

// 세션 보상 — 해당 세션 장면에서만 드롭. 별 등급 확률은 현재 학습 모드에 맞춘다.
export function claim(prev: Collection, sessionId: number, sceneIds: string[], draws = DRAW_COUNT, preferredLevel: 1 | 2 | 3 | 4 = 2): { collection: Collection; results: DropResult[] } {
  const normalized = normalizeCollection(prev);
  if (sessionId > 0 && normalized.lastClaimedSessionId === sessionId) return { collection: normalized, results: [] };
  if (sceneIds.length === 0) return { collection: normalized, results: [] };
  const cards = { ...normalized.cards };
  const sentences = Object.fromEntries(Object.entries(normalized.sentences ?? {}).map(([id, rows]) => [id, [...rows]]));
  const results: DropResult[] = [];

  for (let i = 0; i < draws; i++) {
    const sceneId = pickScene(sceneIds);
    const rarity = weightedRarity(preferredLevel);
    const before = cards[sceneId];
    const beforeItems = itemsOf(before);
    const isNew = beforeItems[rarity] === 0;
    const item = normalizeCard(before);
    const items = itemsOf(item);
    items[rarity] += 1;
    cards[sceneId] = { items };

    results.push({ sceneId, rarity, count: 1, isNew, sentenceIds: [], tier: rarityToTier(rarity), shards: items[rarity], leveledTo: null });
  }

  return { collection: { cards, sentences, trophies: normalized.trophies, lastClaimedSessionId: sessionId }, results };
}

// 상용 가챠(보물 개봉식) 드롭 — 전 등급(기본~다이아)을 직접 드롭한다.
// 세션 중복 가드 없음(의도적으로 반복 뽑는 가챠). XUR은 병합 전용이라 직접 드롭하지 않는다.
const FULL_DRAW_TABLE = RARITIES.filter((r) => r.weight > 0).map((r) => ({ rarity: r.key, weight: r.weight }));
export function drawGacha(prev: Collection, sceneIds: string[], draws = 1): { collection: Collection; results: DropResult[] } {
  const normalized = normalizeCollection(prev);
  if (sceneIds.length === 0) return { collection: normalized, results: [] };
  const cards = { ...normalized.cards };
  const results: DropResult[] = [];
  for (let i = 0; i < draws; i++) {
    const sceneId = pickScene(sceneIds);
    const rarity = weightedFromTable(FULL_DRAW_TABLE);
    const before = cards[sceneId];
    const beforeItems = itemsOf(before);
    const isNew = beforeItems[rarity] === 0;
    const items = itemsOf(normalizeCard(before));
    items[rarity] += 1;
    cards[sceneId] = { items };
    results.push({ sceneId, rarity, count: 1, isNew, sentenceIds: [], tier: rarityToTier(rarity), shards: items[rarity], leveledTo: null });
  }
  return { collection: { ...normalized, cards }, results };
}

// ── 장면 lock 해제 (그 장면의 수집 카드 소모) ──────────────
// tier별 필요한 "그 장면" 카드 수. 레벨이 높을수록 더 많이.
export const UNLOCK_COST: Record<number, number> = { 1: 3, 2: 5, 3: 8, 4: 10, 5: 12 };
export const unlockCost = (tier = 1): number => UNLOCK_COST[Math.min(5, Math.max(1, Math.round(tier)))] ?? 5;

// 그 장면 카드를 n장 소모(낮은 등급부터 — 희귀 카드는 보존). 부족하면 null.
export function spendSceneCards(prev: Collection, sceneId: string, n: number): Collection | null {
  const c = normalizeCollection(prev);
  const items = itemsOf(c.cards[sceneId]);
  if (RARITIES.reduce((s, r) => s + items[r.key], 0) < n) return null;
  let remaining = n;
  for (const r of RARITIES) {
    if (remaining <= 0) break;
    const take = Math.min(items[r.key], remaining);
    items[r.key] -= take; remaining -= take;
  }
  return { ...c, cards: { ...c.cards, [sceneId]: { items } } };
}

// 개발용: 각 장면에 카드를 등급 분배로 채운다(테스트 편의 — 해제·병합 확인용).
export function fillDevCards(prev: Collection, sceneIds: string[]): Collection {
  const c = normalizeCollection(prev);
  const cards = { ...c.cards };
  const dist: [Rarity, number][] = [['basic', 14], ['bronze', 8], ['silver', 5], ['gold', 2], ['diamond', 1], ['xur', 0]]; // 합 30
  for (const id of sceneIds) {
    const items = itemsOf(cards[id]);
    for (const [r, add] of dist) items[r] += add;
    cards[id] = { items };
  }
  return { ...c, cards };
}

export function bestRarity(card?: DeckCard): Rarity {
  const items = itemsOf(card);
  for (const r of [...RARITIES].reverse()) if (items[r.key] > 0) return r.key;
  return 'basic';
}

export function totalItems(card?: DeckCard): number {
  const items = itemsOf(card);
  return RARITIES.reduce((sum, r) => sum + items[r.key], 0);
}

export function boxGrade(stars: number, recoveryUsed: number): BoxGrade {
  if (stars >= 3 && recoveryUsed === 0) return 'gold';
  if (stars >= 2) return 'silver';
  return 'wood';
}

export const ownedCount = (c: Collection) => Object.values(normalizeCollection(c).cards).filter((x) => totalItems(x) > 0).length;
export const diamondCount = (c: Collection) => Object.values(normalizeCollection(c).cards).reduce((sum, card) => sum + itemsOf(card).diamond, 0);
export const honorTrophyCount = (c: Collection) => normalizeCollection(c).trophies.honor ?? 0;
