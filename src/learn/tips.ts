// 미션·연습 진입 시 맨 앞에 붙는 문법/문화 팁 선택 — 그 미션과 연관 있으면 우선,
// 없으면 전체 팁 풀에서 안 본 것 → 오래 안 본 것 순으로 하나 고른다(2026-07-08).
import type { Card, TipCard } from './cards';
import type { ProgressMap } from './progress';

function isTip(c: Card): c is TipCard {
  return c.kind === 'tip';
}

// missionId와 연관된(missionIds에 포함된) 팁을 우선 사용하고, 없으면 전체 팁 풀로 폴백.
// 안 본 팁이 있으면 그중 무작위, 전부 본 적 있으면 가장 오래 안 본 것(least-recently-seen).
export function pickTipForMission(allCards: Card[], missionId: string, progress: ProgressMap): TipCard | null {
  const tips = allCards.filter(isTip);
  if (tips.length === 0) return null;
  const relevant = tips.filter((c) => c.missionIds?.includes(missionId));
  const pool = relevant.length > 0 ? relevant : tips;
  const unseen = pool.filter((c) => !progress[c.id]);
  if (unseen.length > 0) return unseen[Math.floor(Math.random() * unseen.length)];
  const sorted = [...pool].sort((a, b) => (progress[a.id]?.lastSeenAt ?? '') < (progress[b.id]?.lastSeenAt ?? '') ? -1 : 1);
  return sorted[0] ?? null;
}

// 특정 미션에 묶이지 않는 일반 연습(어휘 그룹·동사형태·받아쓰기 등)에서 쓰는 폴백 —
// tag로 살짝 연관지어 보고(예: 그룹 라벨이 팁 label/tag에 겹치면 우선), 없으면 전체 팁 풀에서 회전.
export function pickTipForTopic(allCards: Card[], topicKeywords: string[], progress: ProgressMap): TipCard | null {
  const tips = allCards.filter(isTip);
  if (tips.length === 0) return null;
  const kws = topicKeywords.map((k) => k.toLowerCase()).filter(Boolean);
  const relevant = kws.length > 0
    ? tips.filter((c) => kws.some((kw) => c.label.toLowerCase().includes(kw) || c.tipKo.toLowerCase().includes(kw)))
    : [];
  const pool = relevant.length > 0 ? relevant : tips;
  const unseen = pool.filter((c) => !progress[c.id]);
  if (unseen.length > 0) return unseen[Math.floor(Math.random() * unseen.length)];
  const sorted = [...pool].sort((a, b) => (progress[a.id]?.lastSeenAt ?? '') < (progress[b.id]?.lastSeenAt ?? '') ? -1 : 1);
  return sorted[0] ?? null;
}

// 카드 배열 맨 앞에 팁이 없으면 골라서 붙인다(이미 tip이 있으면 그대로 — 중복 삽입 방지).
export function withLeadingTip(cards: Card[], tip: TipCard | null): Card[] {
  if (!tip || cards.length === 0) return cards;
  if (cards.some((c) => c.kind === 'tip')) return cards;
  return [tip, ...cards];
}
