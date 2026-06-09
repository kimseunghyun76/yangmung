// 가챠 컬렉션 — 학습 로직과 분리된 수집 보상.
// 장면별 카드를 모으고, 낮은 등급 카드를 병합해 상위 등급과 명예 트로피를 만든다.
import { SCENE_SENTENCES } from '../content/sceneSentences';
import type { CLevel } from '../content/types';

export type Rarity = 'basic' | 'bronze' | 'silver' | 'gold' | 'diamond';
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
  sentences: Record<string, string[]>;  // key = 미션 id, value = 획득한 SceneSentence id
  trophies: Partial<Record<TrophyKey, number>>;
  lastClaimedSessionId: number;          // 같은 세션 중복 보상 방지
}

const KEY = 'yangmung:collection:v1';
const EMPTY: Collection = { cards: {}, sentences: {}, trophies: {}, lastClaimedSessionId: 0 };

export const RARITIES: { key: Rarity; label: string; color: string; weight: number }[] = [
  { key: 'basic', label: '기본', color: 'var(--ink-faint)', weight: 50 },
  { key: 'bronze', label: '동', color: '#a9743b', weight: 30 },
  { key: 'silver', label: '은', color: '#9aa3ad', weight: 13 },
  { key: 'gold', label: '금', color: '#d9a531', weight: 7 },
  { key: 'diamond', label: '다이아', color: '#5bc7e0', weight: 1 },
];

export const DRAW_COUNT = 10;
export const MERGE_NEED: Record<Rarity, number> = {
  basic: 30,
  bronze: 30,
  silver: 20,
  gold: 10,
  diamond: 100,
};

export const NEXT_RARITY: Partial<Record<Rarity, Rarity>> = {
  basic: 'bronze',
  bronze: 'silver',
  silver: 'gold',
  gold: 'diamond',
};

export const rarityMeta = (rarity: Rarity) => RARITIES.find((r) => r.key === rarity) ?? RARITIES[0];
export const tierMeta = (tier: number) => RARITIES[Math.min(Math.max(tier, 1), 5) - 1];
export const rarityToTier = (rarity: Rarity) => RARITIES.findIndex((r) => r.key === rarity) + 1;
export const tierToRarity = (tier: number): Rarity => RARITIES[Math.min(Math.max(tier, 1), 5) - 1].key;
export const tierNeed = (tier: number) => MERGE_NEED[tierToRarity(tier)] ?? Infinity;
export const MAX_TIER = 5;

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
  return { basic: 0, bronze: 0, silver: 0, gold: 0, diamond: 0 };
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

function weightedRarity(): Rarity {
  const total = RARITIES.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * total;
  for (const r of RARITIES) {
    roll -= r.weight;
    if (roll <= 0) return r.key;
  }
  return 'basic';
}

function pickScene(sceneIds: string[]): string {
  return sceneIds[Math.floor(Math.random() * sceneIds.length)];
}

// 세션 보상 — 해당 세션 장면에서만 10장 드롭. 기본/동/은/금/다이아는 가중치 50/30/13/7/1.
export function claim(prev: Collection, sessionId: number, sceneIds: string[], draws = DRAW_COUNT): { collection: Collection; results: DropResult[] } {
  const normalized = normalizeCollection(prev);
  if (sessionId > 0 && normalized.lastClaimedSessionId === sessionId) return { collection: normalized, results: [] };
  if (sceneIds.length === 0) return { collection: normalized, results: [] };
  const cards = { ...normalized.cards };
  const sentences = Object.fromEntries(Object.entries(normalized.sentences ?? {}).map(([id, rows]) => [id, [...rows]]));
  const results: DropResult[] = [];

  for (let i = 0; i < draws; i++) {
    const sceneId = pickScene(sceneIds);
    const rarity = weightedRarity();
    const before = cards[sceneId];
    const isNew = !before || totalItems(before) === 0;
    const item = normalizeCard(before);
    const items = itemsOf(item);
    items[rarity] += 1;
    cards[sceneId] = { items };

    const owned = new Set(sentences[sceneId] ?? []);
    const sentenceIds = pickNewSentenceIds(sceneId, owned, rarity === 'basic' ? 0 : 1);
    sentences[sceneId] = [...owned, ...sentenceIds];
    results.push({ sceneId, rarity, count: 1, isNew, sentenceIds, tier: rarityToTier(rarity), shards: items[rarity], leveledTo: null });
  }

  return { collection: { cards, sentences, trophies: normalized.trophies, lastClaimedSessionId: sessionId }, results };
}

export function mergeScene(prev: Collection, sceneId: string, rarity: Rarity): Collection {
  const c = normalizeCollection(prev);
  const need = MERGE_NEED[rarity];
  const cards = { ...c.cards };
  const card = normalizeCard(cards[sceneId]);
  const items = itemsOf(card);
  if ((items[rarity] ?? 0) < need) return c;
  items[rarity] -= need;
  const next = NEXT_RARITY[rarity];
  const trophies = { ...c.trophies };
  if (next) items[next] += 1;
  else trophies.honor = (trophies.honor ?? 0) + 1;
  cards[sceneId] = { items };
  return { ...c, cards, trophies };
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

function pickNewSentenceIds(sceneId: string, owned: Set<string>, count: number): string[] {
  if (count <= 0) return [];
  const candidates = (SCENE_SENTENCES[sceneId as CLevel] ?? []).map((row) => row.id).filter((id) => !owned.has(id));
  return candidates.slice(0, count);
}

export function boxGrade(stars: number, recoveryUsed: number): BoxGrade {
  if (stars >= 3 && recoveryUsed === 0) return 'gold';
  if (stars >= 2) return 'silver';
  return 'wood';
}

export const ownedCount = (c: Collection) => Object.values(normalizeCollection(c).cards).filter((x) => totalItems(x) > 0).length;
export const diamondCount = (c: Collection) => Object.values(normalizeCollection(c).cards).reduce((sum, card) => sum + itemsOf(card).diamond, 0);
export const sentenceCount = (c: Collection) => Object.values(c.sentences ?? {}).reduce((sum, rows) => sum + rows.length, 0);
export const honorTrophyCount = (c: Collection) => normalizeCollection(c).trophies.honor ?? 0;
