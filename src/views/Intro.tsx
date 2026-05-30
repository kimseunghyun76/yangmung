// 세션 시작 전 "오늘 한 판" 인트로 — 목표와 첫 행동을 정렬.
// goal은 App에서 planSession 기반으로 계산해 전달(복습 뉘앙스 포함).
import type { Card } from '../learn/cards';
import { PRIMARY, WRAP } from '../ui/styles';
import { sceneVisualByMission } from './scene';

export function Intro({ cards, goal, onStart }: { cards: Card[]; goal: string; onStart: () => void }) {
  let k = 0, b = 0, c = 0;
  let firstMissionId: string | undefined;
  for (const card of cards) {
    if (card.kind === 'tip') continue;
    if (card.kind === 'dictation') { b++; continue; }
    if (card.kind === 'order' || card.kind === 'speak') {
      c++;
      if (!firstMissionId && card.reviewTarget?.type === 'mission') firstMissionId = String(card.reviewTarget.id);
      continue;
    }
    const t = card.reviewTarget?.type;
    if (t === 'kana') k++;
    else if (t === 'phrase') b++;
    else if (t === 'mission') { c++; if (!firstMissionId) firstMissionId = String(card.reviewTarget!.id); }
  }
  const sv = sceneVisualByMission(firstMissionId);
  const sceneOnly = k === 0 && b === 0 && c > 0; // 장면 단독 연습
  const lead =
    sceneOnly ? ' — 실제 상황만 짧게 연습합니다.'
    : k > 0 && c > 0 ? ' — 가나로 몸 풀고 실제 상황까지 한 번에 가봅니다.'
    : '.';

  return (
    <main style={WRAP}>
      <div style={{ background: sv.bg, borderRadius: 16, padding: '28px 16px', textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 64, lineHeight: 1 }}>{sv.emoji}</div>
      </div>
      <p style={{ color: '#888', fontSize: 13, margin: 0 }}>오늘 한 판 🎒</p>
      <h1 style={{ margin: '6px 0 0', lineHeight: 1.35 }}>{goal}</h1>
      <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, marginTop: 14 }}>
        짧게 {cards.length}장이에요{lead}
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
