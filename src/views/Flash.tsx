// 속도전 플래시 — 제한시간 안에 빠르게 푸는 복습 게임. 콤보·점수. (SRS 비반영, 순수 게임)
import { useEffect, useRef, useState } from 'react';
import type { Card } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { GlassPanel, PrimaryAction } from './shell';

interface Props {
  cards: Card[];
  onExit: () => void;
  onReplay: () => void;
}

const DURATION = 6000; // 카드당 제한시간(ms)

export function Flash({ cards, onExit, onReplay }: Props) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [done, setDone] = useState(cards.length === 0);
  const tickRef = useRef<number | null>(null);
  const advRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const card = cards[idx];

  useEffect(() => {
    if (done || !card) return;
    lockedRef.current = false;
    setPicked(null);
    setLeft(DURATION);
    const start = Date.now();
    tickRef.current = window.setInterval(() => {
      const rem = DURATION - (Date.now() - start);
      if (rem <= 0) { setLeft(0); handle(-1); } else setLeft(rem);
    }, 80);
    if (card.kind === 'quiz' && card.listen && card.bannerJa) {
      const t = window.setTimeout(() => speak(card.bannerJa!), 150);
      return () => { window.clearTimeout(t); cleanup(); };
    }
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done]);

  function cleanup() {
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    if (advRef.current) { window.clearTimeout(advRef.current); advRef.current = null; }
  }

  function handle(choiceIdx: number) {
    if (lockedRef.current || card?.kind !== 'quiz') return;
    lockedRef.current = true;
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    const ch = choiceIdx >= 0 ? card.choices[choiceIdx] : undefined;
    const correct = !!ch?.correct && !ch?.recovery;
    setPicked(choiceIdx);
    if (correct) {
      setScore((s) => s + 1);
      setCombo((c) => { const n = c + 1; setBest((b) => Math.max(b, n)); return n; });
    } else {
      setCombo(0);
    }
    advRef.current = window.setTimeout(() => {
      if (idx + 1 >= cards.length) setDone(true); else setIdx((i) => i + 1);
    }, correct ? 420 : 820);
  }

  if (done) {
    const pct = cards.length ? Math.round((score / cards.length) * 100) : 0;
    return (
      <main style={WRAP}>
        <div className="ym-rise" style={{ textAlign: 'center', paddingTop: 20 }}>
          <div className="ym-burst" style={{ width: 76, height: 76, margin: '0 auto', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="fast" size={38} />
          </div>
          <h1 style={{ margin: '16px 0 0', fontSize: 26 }}>속도전 끝!</h1>
          <p style={{ margin: '10px 0 0', fontSize: 40, fontWeight: 900, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{score}<span style={{ fontSize: 20, color: 'var(--ink-faint)' }}> / {cards.length}</span></p>
          <p style={{ margin: '6px 0 0', color: 'var(--ink-soft)', fontWeight: 700 }}>정답률 {pct}% · 최고 콤보 {best}</p>
        </div>
        <div className="ym-rise" style={{ animationDelay: '.08s', marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryAction onClick={onReplay}><Icon name="fast" size={18} /> 다시 도전</PrimaryAction>
          <button className="ym-press" onClick={onExit} style={{ width: '100%', padding: '15px 16px', borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="nav-home" size={18} /> 홈으로
          </button>
        </div>
      </main>
    );
  }

  if (!card || card.kind !== 'quiz') {
    return <main style={WRAP}><p style={{ textAlign: 'center', marginTop: 40, color: 'var(--ink-soft)' }}>준비된 카드가 없어요.</p></main>;
  }

  const ratio = left / DURATION;
  const barColor = ratio > 0.5 ? 'var(--ok)' : ratio > 0.25 ? 'var(--warn)' : 'var(--accent)';
  const promptText = card.listen ? null : (card.bannerJa || card.banner);

  return (
    <main style={WRAP}>
      {/* 상단 — 진행 + 점수 + 콤보 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={onExit} className="ym-press" style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, cursor: 'pointer', padding: 4 }}>← 그만</button>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {cards.length}</span>
        <span style={{ fontSize: 13, fontWeight: 850, color: combo >= 2 ? 'var(--accent)' : 'var(--ink-faint)' }}>{combo >= 2 ? `🔥 ${combo} 콤보` : `점수 ${score}`}</span>
      </div>

      {/* 타이머 바 */}
      <div style={{ height: 8, borderRadius: 99, background: 'var(--glass-border)', overflow: 'hidden', marginTop: 12 }}>
        <div style={{ height: '100%', width: `${ratio * 100}%`, background: barColor, borderRadius: 99, transition: 'width .08s linear' }} />
      </div>

      {/* 문제 */}
      <GlassPanel style={{ marginTop: 18, textAlign: 'center', padding: '26px 16px' }}>
        {card.listen ? (
          <button className="ym-press" onClick={() => card.bannerJa && speak(card.bannerJa)} disabled={!ttsSupported()}
            style={{ width: 84, height: 84, borderRadius: 99, border: '1px solid var(--glass-border)', background: 'var(--accent-soft)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="listen" size={40} />
          </button>
        ) : (
          <div lang="ja" style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.1, color: 'var(--ink)' }}>{promptText}</div>
        )}
        {card.sub && <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 650 }}>{card.sub}</p>}
      </GlassPanel>

      {/* 보기 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
        {card.choices.map((c, i) => {
          const isPicked = picked === i;
          const reveal = picked !== null;
          const right = c.correct && !c.recovery;
          let border = 'var(--glass-border)', bg = 'var(--glass-bg-strong)', color = 'var(--ink)';
          if (reveal && right) { border = 'var(--ok)'; bg = 'var(--ok-soft)'; color = 'var(--ok)'; }
          else if (reveal && isPicked && !right) { border = 'var(--accent)'; bg = 'var(--accent-soft)'; color = 'var(--accent)'; }
          return (
            <button key={i} className="ym-press" onClick={() => handle(i)} disabled={picked !== null}
              style={{ padding: '16px 12px', borderRadius: 16, border: `1.5px solid ${border}`, background: bg, color, fontSize: 16, fontWeight: 750, cursor: picked === null ? 'pointer' : 'default', minHeight: 60 }}>
              {c.label}
            </button>
          );
        })}
      </div>
    </main>
  );
}
