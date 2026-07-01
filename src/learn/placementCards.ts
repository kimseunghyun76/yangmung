// 수준 진단(배치) 문항 구성 — 3축(읽기·듣기·상황) 16문항, 난이도 분산 무작위 선발.
// ① 읽기 6문 / ② 듣기 5문 / ③ 상황 5문.
// 상황 선택지는 한글 대신 일본어(가나)로 표시 — 실제 일본어 능력을 측정.
import type { Card } from './cards';

// Fisher-Yates 셔플 (매 실행마다 무작위)
function rng<T>(arr: T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// 난이도 구간별 무작위 선발 — 초급/중급/고급 각 1/3씩
function pickTiered(pool: Card[], n: number): Card[] {
  if (pool.length === 0) return [];
  const third = Math.floor(pool.length / 3);
  const low = rng(pool.slice(0, Math.max(third, 1)));
  const mid = rng(pool.slice(third, Math.max(third * 2, third + 1)));
  const hi  = rng(pool.slice(third * 2));
  const each = Math.floor(n / 3);
  const rem  = n - each * 3;
  return [
    ...low.slice(0, each + (rem > 0 ? 1 : 0)),
    ...mid.slice(0, each + (rem > 1 ? 1 : 0)),
    ...hi.slice(0, each),
  ];
}

// 상황 카드: 선택지 레이블을 일본어(가나)로 교체 — 한글 선택지 금지
function toJaLabels(card: Card): Card {
  if (card.kind !== 'quiz') return card;
  return {
    ...card,
    choices: card.choices.map((c) => ({
      ...c,
      label: c.ja ?? c.phrase?.kana ?? c.label,
    })),
  };
}

export function buildPlacementCards(allCards: Card[]): Card[] {
  // ① 읽기 축 — 가나 글자 → 소리 (히라가나 먼저, 가타카나 나중)
  const kanaPool = allCards.filter((c) =>
    c.kind === 'quiz' && /^kana:.*:read$/.test(c.id) && c.choices.length >= 2,
  );

  // ② 듣기 축 — 일본어 음성 → 한국어 뜻 (표현·금액·기초 생활어)
  const listenPool = allCards.filter((c) =>
    c.kind === 'quiz' && /^listen:/.test(c.id) && c.choices.length >= 2,
  );

  // ③ 상황 축 — 미션 장면 (tier 1→5 순서 유지하며 무작위 선발)
  //   promptPhrase 있는 카드 포함: 점원 일본어 발화 있으면 더 실전적 진단
  //   c.ja가 있는 선택지만 포함 — 일본어로 변환 가능한 카드만 사용
  const situationPool = allCards.filter((c) =>
    c.kind === 'quiz' &&
    c.reviewTarget?.type === 'mission' &&
    c.choices.length >= 2 &&
    c.choices.some((ch) => ch.ja),
  );

  const kana      = pickTiered(kanaPool, 6);                      // 읽기 6문
  const listen    = pickTiered(listenPool, 5);                     // 듣기 5문
  const situation = pickTiered(situationPool, 5).map(toJaLabels);  // 상황 5문 (일본어 선택지)

  // 순서: 읽기 → 듣기 → 상황 (단계적 심화)
  return [...kana, ...listen, ...situation];
}
