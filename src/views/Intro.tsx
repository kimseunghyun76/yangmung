// 세션 시작 전 "오늘 한 판" 인트로 — 목표와 첫 행동을 정렬.
import type { Card } from '../learn/cards';
import { PRIMARY, WRAP } from '../ui/styles';
import { sessionGoalText } from './goal';

export function Intro({ cards, onStart }: { cards: Card[]; onStart: () => void }) {
  const missions: { id: string; scenario: string }[] = [];
  const seen = new Set<string>();
  let k = 0, b = 0, c = 0;
  for (const card of cards) {
    if (card.kind !== 'quiz') continue;
    const t = card.reviewTarget?.type;
    if (t === 'kana') k++;
    else if (t === 'phrase') b++;
    else if (t === 'mission') {
      c++;
      const id = String(card.reviewTarget!.id);
      if (!seen.has(id)) { seen.add(id); missions.push({ id, scenario: card.scenario ?? '' }); }
    }
  }
  const goal = sessionGoalText(missions, k > 0);

  return (
    <main style={WRAP}>
      <p style={{ color: '#888', fontSize: 13, margin: 0 }}>오늘 한 판 🎒</p>
      <h1 style={{ margin: '6px 0 0', lineHeight: 1.35 }}>{goal}</h1>
      <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, marginTop: 14 }}>
        짧게 {cards.length}장이에요{c > 0 ? ' — 가나로 몸 풀고 실제 상황까지 한 번에 가봅니다.' : '.'}
        {' '}막히면 <strong>「다시 말해 주세요」</strong>로 넘어갈 수 있으니 부담 없이 시작하세요.
      </p>
      <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>
        가나 {k} · 표현 {b} · 미션 {c}
      </p>
      <button style={{ ...PRIMARY, marginTop: 20, width: '100%', fontSize: 17, fontWeight: 700 }} onClick={onStart}>
        시작
      </button>
    </main>
  );
}
