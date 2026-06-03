// 가챠 덱 컬렉션 — 자체 localStorage(기존 progress/SRS와 완전 분리, 학습 로직 영향 0).
// 장면(미션) 카드를 모아 5단계(기본→동→은→금→다이아)로 키운다.

export interface DeckCard { tier: number; shards: number } // tier 1~5, shards = 다음 단계 진척
export interface Collection {
  cards: Record<string, DeckCard>;      // key = 미션 id (C1…)
  lastClaimedSessionId: number;          // 같은 세션 중복 보상 방지
}

const KEY = 'yangmung:collection:v1';
const EMPTY: Collection = { cards: {}, lastClaimedSessionId: 0 };

// 단계 진행에 필요한 조각 수 (현재 tier → 다음). 5단계는 최종.
const NEED: Record<number, number> = { 1: 2, 2: 3, 3: 5, 4: 8, 5: Infinity };
export const tierNeed = (tier: number) => NEED[tier] ?? Infinity;
export const MAX_TIER = 5;

export const TIERS: { tier: number; label: string; color: string }[] = [
  { tier: 1, label: '기본', color: 'var(--ink-faint)' },
  { tier: 2, label: '동', color: '#a9743b' },
  { tier: 3, label: '은', color: '#9aa3ad' },
  { tier: 4, label: '금', color: '#d9a531' },
  { tier: 5, label: '다이아', color: '#5bc7e0' },
];
export const tierMeta = (tier: number) => TIERS[Math.min(Math.max(tier, 1), 5) - 1];

export function loadCollection(): Collection {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const c = JSON.parse(raw) as Collection;
    return { cards: c.cards ?? {}, lastClaimedSessionId: c.lastClaimedSessionId ?? 0 };
  } catch { return { ...EMPTY }; }
}

export function saveCollection(c: Collection): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
}

export interface DropResult { sceneId: string; isNew: boolean; leveledTo: number | null; tier: number; shards: number }

// 세션 보상 적립 — sceneIds 각각 조각 +1(중복 보상 1세션 1회). 결과 + 갱신 컬렉션 반환.
export function claim(prev: Collection, sessionId: number, sceneIds: string[], perScene = 1): { collection: Collection; results: DropResult[] } {
  if (sessionId > 0 && prev.lastClaimedSessionId === sessionId) return { collection: prev, results: [] };
  if (sceneIds.length === 0) return { collection: prev, results: [] };
  const cards = { ...prev.cards };
  const results: DropResult[] = [];
  for (const id of sceneIds) {
    const existed = !!cards[id];
    const cur: DeckCard = existed ? { ...cards[id] } : { tier: 1, shards: 0 };
    let leveledTo: number | null = null;
    for (let n = 0; n < perScene; n++) {
      if (cur.tier >= MAX_TIER) break;
      cur.shards += 1;
      while (cur.tier < MAX_TIER && cur.shards >= tierNeed(cur.tier)) {
        cur.shards -= tierNeed(cur.tier);
        cur.tier += 1;
        leveledTo = cur.tier;
      }
    }
    cards[id] = cur;
    results.push({ sceneId: id, isNew: !existed, leveledTo, tier: cur.tier, shards: cur.shards });
  }
  return { collection: { cards, lastClaimedSessionId: sessionId }, results };
}

export const ownedCount = (c: Collection) => Object.keys(c.cards).length;
export const diamondCount = (c: Collection) => Object.values(c.cards).filter((x) => x.tier >= MAX_TIER).length;
