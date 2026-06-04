// 속도전 — 제한시간 안에 빠르게 푸는 대결형 복습 게임. 콤보·점수, 높은 점수면 보석함 보상.
import { useEffect, useRef, useState } from 'react';
import type { Card } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { PrimaryAction } from './shell';
import { GachaBox } from './Gacha';
import { boxGrade } from '../learn/collection';

interface Props {
  cards: Card[];
  unlockedSceneIds: string[];
  onExit: () => void;
  onReplay: () => void;
}

const DURATION = 6000;        // 카드당 제한시간(ms)
const FAST_MS = 2500;         // 이 안에 맞히면 PERFECT
const REWARD_RATIO = 0.7;     // 보석함 보상 점수 기준

type Callout = 'perfect' | 'good' | 'miss' | null;

export function Flash({ cards, unlockedSceneIds, onExit, onReplay }: Props) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [callout, setCallout] = useState<Callout>(null);
  const [done, setDone] = useState(cards.length === 0);
  const [reward, setReward] = useState<{ sid: number; scenes: string[]; grade: ReturnType<typeof boxGrade> } | null>(null);
  const tickRef = useRef<number | null>(null);
  const advRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const scoreRef = useRef(0);
  const shownRef = useRef(Date.now());
  const card = cards[idx];

  useEffect(() => {
    if (done || !card) return;
    lockedRef.current = false;
    setPicked(null);
    setCallout(null);
    setLeft(DURATION);
    shownRef.current = Date.now();
    const start = Date.now();
    tickRef.current = window.setInterval(() => {
      const rem = DURATION - (Date.now() - start);
      if (rem <= 0) { setLeft(0); handle(-1); } else setLeft(rem);
    }, 70);
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

  function finishGame() {
    const final = scoreRef.current;
    if (cards.length && final / cards.length >= REWARD_RATIO && unlockedSceneIds.length) {
      const n = final >= cards.length ? 2 : 1;
      const pool = [...unlockedSceneIds];
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      const stars = Math.round((final / cards.length) * 3);
      setReward({ sid: Date.now(), scenes: pool.slice(0, n), grade: boxGrade(stars, 0) });
    }
    setDone(true);
  }

  function handle(choiceIdx: number) {
    if (lockedRef.current || card?.kind !== 'quiz') return;
    lockedRef.current = true;
    if (tickRef.current) { window.clearInterval(tickRef.current); tickRef.current = null; }
    const ch = choiceIdx >= 0 ? card.choices[choiceIdx] : undefined;
    const correct = !!ch?.correct && !ch?.recovery;
    const fast = correct && Date.now() - shownRef.current < FAST_MS;
    setPicked(choiceIdx);
    setCallout(correct ? (fast ? 'perfect' : 'good') : 'miss');
    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setCombo((c) => { const n = c + 1; setBest((b) => Math.max(b, n)); return n; });
    } else {
      setCombo(0);
    }
    advRef.current = window.setTimeout(() => {
      if (idx + 1 >= cards.length) finishGame(); else setIdx((i) => i + 1);
    }, correct ? 420 : 820);
  }

  if (done) {
    const pct = cards.length ? Math.round((score / cards.length) * 100) : 0;
    const win = reward !== null;
    return (
      <main style={WRAP}>
        <div className="ym-rise" style={{ textAlign: 'center', paddingTop: 16 }}>
          <div className="ym-burst" style={{ width: 80, height: 80, margin: '0 auto', borderRadius: 99, background: win ? 'linear-gradient(135deg,#b9382e,#f0a23a)' : 'var(--glass-bg-strong)', color: win ? '#fff' : 'var(--ink-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: win ? 'none' : '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: 38 }}>{win ? '🏆' : '⚡'}</span>
          </div>
          <h1 style={{ margin: '14px 0 0', fontSize: 26 }}>{win ? '대결 승리!' : '속도전 끝!'}</h1>
          <p style={{ margin: '8px 0 0', fontSize: 42, fontWeight: 900, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{score}<span style={{ fontSize: 20, color: 'var(--ink-faint)' }}> / {cards.length}</span></p>
          <p style={{ margin: '6px 0 0', color: 'var(--ink-soft)', fontWeight: 700 }}>정답률 {pct}% · 최고 콤보 {best}🔥</p>
        </div>

        {reward
          ? <div className="ym-rise" style={{ animationDelay: '.06s', marginTop: 18 }}>
              <GachaBox sessionId={reward.sid} sceneIds={reward.scenes} grade={reward.grade} />
            </div>
          : <p className="ym-rise" style={{ animationDelay: '.06s', textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>
              정답률 {Math.round(REWARD_RATIO * 100)}% 이상이면 보석함을 받아요! 다시 도전해 볼까요?
            </p>}

        <div className="ym-rise" style={{ animationDelay: '.1s', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryAction onClick={onReplay}><Icon name="fast" size={18} /> 다시 도전</PrimaryAction>
          <button className="ym-press" onClick={onExit} style={homeBtn}><Icon name="nav-home" size={18} /> 홈으로</button>
        </div>
      </main>
    );
  }

  if (!card || card.kind !== 'quiz') return <main style={WRAP}><p style={{ textAlign: 'center', marginTop: 40, color: 'var(--ink-soft)' }}>준비된 카드가 없어요.</p></main>;

  const ratio = left / DURATION;
  const low = ratio <= 0.25;
  const barColor = ratio > 0.5 ? '#3fb27f' : ratio > 0.25 ? '#e0a23a' : '#e0564a';
  const hot = combo >= 3;
  const promptText = card.listen ? null : (card.bannerJa || card.banner);

  return (
    <main style={WRAP}>
      {/* 상단 — 그만 / 진행 / 점수 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={onExit} className="ym-press" style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, cursor: 'pointer', padding: 4 }}>← 그만</button>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {cards.length}</span>
        <span style={{ fontSize: 13, fontWeight: 850, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>점수 {score}</span>
      </div>

      {/* 콤보 미터 */}
      <div style={{ textAlign: 'center', height: 30, marginTop: 6 }}>
        {hot && <span className="ym-burst" key={combo} style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)' }}>🔥 {combo} COMBO</span>}
      </div>

      {/* 에너지(타이머) 게이지 */}
      <div style={{ height: 12, borderRadius: 99, background: 'var(--glass-border)', overflow: 'hidden', boxShadow: low ? '0 0 14px #e0564a88' : undefined }}>
        <div style={{ height: '100%', width: `${ratio * 100}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`, borderRadius: 99, transition: 'width .07s linear' }} />
      </div>

      {/* 문제 카드 — 콤보 높으면 달아오름 */}
      <div key={`${idx}:${callout ?? ''}`} className={callout === 'miss' ? 'ym-wrong' : ''} style={{
        marginTop: 16, textAlign: 'center', padding: '30px 16px', borderRadius: 22, position: 'relative',
        border: `2px solid ${hot ? 'var(--accent)' : 'var(--glass-border)'}`,
        background: hot ? 'linear-gradient(160deg, var(--glass-bg-strong), rgba(185,56,46,0.12))' : 'var(--glass-bg-strong)',
        boxShadow: hot ? '0 0 30px rgba(185,56,46,0.25)' : 'var(--glass-shadow)',
      }}>
        {/* 콜아웃 */}
        {callout && (
          <span className="ym-burst" style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 15, fontWeight: 900, color: callout === 'miss' ? 'var(--accent)' : callout === 'perfect' ? '#f0a23a' : 'var(--ok)' }}>
            {callout === 'perfect' ? 'PERFECT! ✨' : callout === 'good' ? 'GOOD!' : 'MISS'}
          </span>
        )}
        {card.listen ? (
          <button className="ym-press" onClick={() => card.bannerJa && speak(card.bannerJa)} disabled={!ttsSupported()}
            style={{ width: 84, height: 84, borderRadius: 99, border: '1px solid var(--glass-border)', background: 'var(--accent-soft)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="listen" size={40} />
          </button>
        ) : (
          <div lang="ja" style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.1, color: 'var(--ink)' }}>{promptText}</div>
        )}
        {card.sub && <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 650 }}>{card.sub}</p>}
      </div>

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

const homeBtn: React.CSSProperties = {
  width: '100%', padding: '15px 16px', borderRadius: 16, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};
