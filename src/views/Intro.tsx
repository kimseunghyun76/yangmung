// 세션 시작 전 "오늘 한 판" 인트로 — 목표와 첫 행동을 정렬.
// goal은 App에서 planSession 기반으로 계산해 전달(복습 뉘앙스 포함).
import type { Card } from '../learn/cards';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { sceneVisualByMission } from './scene';
import { PrimaryAction, hexA } from './shell';

export function Intro({ cards, goal, onStart, onBack }: { cards: Card[]; goal: string; onStart: () => void; onBack: () => void }) {
  let k = 0, b = 0, c = 0;
  let firstMissionId: string | undefined;
  for (const card of cards) {
    if (card.kind === 'tip' || card.kind === 'discover') continue;
    if (card.kind === 'dictation') { b++; continue; }
    if (card.kind === 'order' || card.kind === 'speak') {
      c++;
      if (!firstMissionId && card.reviewTarget?.type === 'mission' && String(card.reviewTarget.id) !== 'C0') firstMissionId = String(card.reviewTarget.id);
      continue;
    }
    const t = card.reviewTarget?.type;
    if (t === 'kana') k++;
    else if (t === 'phrase') b++;
    else if (t === 'mission') {
      c++;
      const id = String(card.reviewTarget!.id);
      if (!firstMissionId && id !== 'C0') firstMissionId = id;
    }
  }
  const sv = sceneVisualByMission(firstMissionId);
  const backdrop = sv.backdrop ?? sv.hero;
  const sceneOnly = k === 0 && b === 0 && c > 0; // 장면 단독 연습
  const lead =
    sceneOnly ? ' — 실제 상황만 짧게 연습합니다.'
    : k > 0 && c > 0 ? ' — 가나로 몸 풀고 실제 상황까지 한 번에 가봅니다.'
    : '.';

  return (
    <main style={{ ...WRAP, minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <button onClick={onBack} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--ink-faint)', padding: '4px 0', marginBottom: 8, alignSelf: 'flex-start' }}>← 홈으로</button>
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 28,
        minHeight: 430,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        border: backdrop ? '1px solid rgba(255,255,255,0.22)' : '1.5px solid var(--border)',
        background: backdrop ? `linear-gradient(165deg, ${hexA(sv.accent, 0.22)}, ${hexA(sv.accent, 0.38)})` : 'var(--surface-2)',
        boxShadow: 'var(--glass-shadow)',
        color: backdrop ? '#fff' : 'var(--ink)',
      }}>
        {backdrop && <img src={backdrop} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.92) contrast(1.05)' }} />}
        {backdrop && <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.7))' }} />}
        <div style={{ position: 'relative' }}>
          <span style={{
            width: 62,
            height: 62,
            borderRadius: 20,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: backdrop ? 'rgba(255,255,255,0.18)' : hexA(sv.accent, 0.14),
            color: backdrop ? '#fff' : sv.accent,
            border: backdrop ? '1px solid rgba(255,255,255,0.2)' : `1px solid ${hexA(sv.accent, 0.22)}`,
            backdropFilter: 'blur(10px)',
          }}>
            <Icon name={sv.icon} size={34} />
          </span>
          <p style={{ color: backdrop ? 'rgba(255,255,255,0.78)' : 'var(--ink-faint)', fontSize: 13, margin: '18px 0 0', fontWeight: 700 }}>오늘 한 판</p>
          <h1 style={{ margin: '7px 0 0', lineHeight: 1.28, letterSpacing: '-0.025em' }}>{goal}</h1>
          <p style={{ color: backdrop ? 'rgba(255,255,255,0.82)' : 'var(--ink-soft)', fontSize: 15, lineHeight: 1.6, marginTop: 14 }}>
            짧게 {cards.length}장이에요{lead}
            {' '}막히면 <strong>「다시 말해 주세요」</strong>로 넘어갈 수 있으니 부담 없이 시작하세요.
          </p>
          <p style={{ color: backdrop ? 'rgba(255,255,255,0.68)' : 'var(--ink-faint)', fontSize: 13, marginTop: 6, fontWeight: 650 }}>
            가나 {k} · 표현 {b} · 미션 {c}
          </p>
          <PrimaryAction onClick={onStart} style={{ marginTop: 20, width: '100%', fontSize: 17 }}>
            시작
          </PrimaryAction>
        </div>
      </div>
    </main>
  );
}
