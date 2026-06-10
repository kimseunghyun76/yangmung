// 수준 진단(배치) 테스트 — 첫 사용자가 가나·표현 몇 문제를 풀면 시작 난이도(모드)를 추천·적용.
// SRS/진척에 기록하지 않는 1회성 진단.
import { useState } from 'react';
import type { Card, Choice } from '../learn/cards';
import type { LearnMode } from '../learn/settings';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { PrimaryAction } from './shell';

interface Props {
  cards: Card[];
  onDone: (mode: LearnMode, markKanaKnown: boolean) => void;
  onSkip: () => void;
}

type Reco = { mode: LearnMode; markKana: boolean; title: string; desc: string };
function recommend(pct: number): Reco {
  if (pct < 0.4) return { mode: 'beginner', markKana: false, title: '처음부터 차근차근', desc: '가나와 기초 표현부터 천천히 — 발음 보조를 항상 켜고 시작해요.' };
  if (pct < 0.75) return { mode: 'default', markKana: false, title: '기본 코스', desc: '모르는 가나만 보조하며 장면 학습을 균형 있게 진행해요.' };
  return { mode: 'express', markKana: true, title: '여행 급행', desc: '기본기가 탄탄해요! 가나는 익힌 것으로 두고 장면 미션 위주로 빠르게.' };
}

export function Placement({ cards, onDone, onSkip }: Props) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(cards.length === 0);
  const card = cards[idx];

  function pick(i: number, c: Choice) {
    if (picked !== null) return;
    setPicked(i);
    const ok = c.correct && !c.recovery;
    if (ok) setScore((s) => s + 1);
    if (c.ja) speak(c.ja);
    window.setTimeout(() => {
      setPicked(null);
      if (idx + 1 >= cards.length) setDone(true); else setIdx((n) => n + 1);
    }, 650);
  }

  if (done) {
    const pct = cards.length ? score / cards.length : 0;
    const r = recommend(pct);
    return (
      <main style={WRAP}>
        <div className="ym-rise" style={{ textAlign: 'center', paddingTop: 24 }}>
          <div className="ym-burst" style={{ width: 76, height: 76, margin: '0 auto', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chart" size={36} />
          </div>
          <h1 style={{ margin: '16px 0 0', fontSize: 24 }}>진단 결과</h1>
          <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 900, color: 'var(--accent)' }}>{score} / {cards.length}</p>
          <div style={{ marginTop: 18, padding: 18, borderRadius: 18, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.05em' }}>추천 시작 난이도</p>
            <p style={{ margin: '6px 0 0', fontSize: 19, fontWeight: 800 }}>{r.title}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{r.desc}</p>
          </div>
        </div>
        <div className="ym-rise" style={{ animationDelay: '.08s', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryAction onClick={() => onDone(r.mode, r.markKana)}><Icon name="check" size={18} /> 이 난이도로 시작</PrimaryAction>
          <button className="ym-press" onClick={onSkip} style={ghostBtn}>나중에 / 직접 고르기</button>
          <p style={{ fontSize: 12, color: 'var(--ink-faint)', textAlign: 'center', margin: '2px 0 0' }}>난이도는 설정에서 언제든 바꿀 수 있어요.</p>
        </div>
      </main>
    );
  }

  if (!card || card.kind !== 'quiz') return <main style={WRAP}><p style={{ textAlign: 'center', marginTop: 40, color: 'var(--ink-soft)' }}>진단 문항을 준비하고 있어요.</p></main>;
  const promptBig = card.tag.startsWith('K') || /^kana:/.test(card.id);

  return (
    <main style={WRAP}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={onSkip} className="ym-press" style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, cursor: 'pointer', padding: 4 }}>건너뛰기</button>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {cards.length}</span>
      </div>
      <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>수준 진단 · {card.sub || '맞는 답을 골라요'}</p>

      <div style={{ textAlign: 'center', padding: '26px 16px', marginTop: 12, borderRadius: 20, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)' }}>
        {card.listen ? (
          <button className="ym-press" onClick={() => card.bannerJa && speak(card.bannerJa)} disabled={!ttsSupported()}
            style={{ width: 80, height: 80, borderRadius: 99, border: '1px solid var(--glass-border)', background: 'var(--accent-soft)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="listen" size={38} />
          </button>
        ) : (
          <div lang="ja" style={{ fontSize: promptBig ? 60 : 28, fontWeight: 900, lineHeight: 1.15, color: 'var(--ink)' }}>{card.bannerJa || card.banner}</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
        {card.choices.map((c, i) => {
          const reveal = picked !== null;
          const right = c.correct && !c.recovery;
          let border = 'var(--glass-border)', bg = 'var(--glass-bg-strong)', color = 'var(--ink)';
          if (reveal && right) { border = 'var(--ok)'; bg = 'var(--ok-soft)'; color = 'var(--ok)'; }
          else if (reveal && picked === i && !right) { border = 'var(--accent)'; bg = 'var(--accent-soft)'; color = 'var(--accent)'; }
          return (
            <button key={i} className="ym-press" onClick={() => pick(i, c)} disabled={picked !== null}
              style={{ padding: '16px 12px', borderRadius: 16, border: `1.5px solid ${border}`, background: bg, color, fontSize: 16, fontWeight: 750, cursor: picked === null ? 'pointer' : 'default', minHeight: 58 }}>
              {c.label}
            </button>
          );
        })}
      </div>
    </main>
  );
}

const ghostBtn: React.CSSProperties = {
  width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 15, cursor: 'pointer',
};
