// 속도전 — 레벨별 모드 선택 + 제한시간 내 즉답 대결. 콤보·점수, 고득점이면 보석함 보상.
import { useEffect, useRef, useState } from 'react';
import type { Card } from '../learn/cards';
import type { FlashMode } from '../learn/progress';
import { speak, stopSpeaking, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { PrimaryAction } from './shell';
import { GachaBox } from './Gacha';
import { boxGrade } from '../learn/collection';

interface Props {
  cards: Card[];
  unlockedSceneIds: string[];
  onExit: () => void;
  onReplay: (mode: FlashMode, count: number) => Card[];
}

// ── 모드 설정 ────────────────────────────────────────────────────────────────
const MODE_CONFIG: Record<FlashMode, {
  label: string;
  sub: string;
  emoji: string;
  durationMs: number;
  fastMs: number;
  color: string;
  difficulty: 1 | 2 | 3 | 4;
}> = {
  kana: {
    label: '가나 특훈',
    sub: '히라가나 · 가타카나 읽기 / 듣기 즉답',
    emoji: 'あ',
    durationMs: 8000,
    fastMs: 3500,
    color: '#3fb27f',
    difficulty: 1,
  },
  expression: {
    label: '표현 특훈',
    sub: '여행 표현 · 간판 · 어휘 의미 즉답',
    emoji: '💬',
    durationMs: 6000,
    fastMs: 2800,
    color: '#3b9fe0',
    difficulty: 2,
  },
  situation: {
    label: '상황 대화',
    sub: '편의점 · 식당 · 전철 — 장면 선택지 즉답',
    emoji: '🗺',
    durationMs: 5000,
    fastMs: 2200,
    color: '#9b59b6',
    difficulty: 3,
  },
  blitz: {
    label: '전체 블리츠',
    sub: '가나 + 표현 + 상황 무작위 최강 혼합',
    emoji: '⚡',
    durationMs: 4000,
    fastMs: 1800,
    color: '#e0564a',
    difficulty: 4,
  },
};

const COUNT_OPTIONS = [10, 15, 20] as const;
type CountOption = typeof COUNT_OPTIONS[number];

const REWARD_RATIO = 0.75;

type Callout = 'perfect' | 'good' | 'miss' | null;

// ── 모드 선택 화면 ────────────────────────────────────────────────────────────
interface SelectProps {
  lastMode: FlashMode;
  lastCount: CountOption;
  onStart: (mode: FlashMode, count: CountOption) => void;
  onExit: () => void;
}

function ModeSelect({ lastMode, lastCount, onStart, onExit }: SelectProps) {
  const [mode, setMode] = useState<FlashMode>(lastMode);
  const [count, setCount] = useState<CountOption>(lastCount);
  const cfg = MODE_CONFIG[mode];

  return (
    <main style={{ ...WRAP, minHeight: '100svh', paddingTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={onExit} style={ghostIcon}>
          <Icon name="back" size={18} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 16 }}>⚡ 속도전 설정</span>
        <span style={{ width: 32 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        {(Object.entries(MODE_CONFIG) as [FlashMode, typeof MODE_CONFIG[FlashMode]][]).map(([m, c]) => {
          const active = mode === m;
          return (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '14px 12px', borderRadius: 18, textAlign: 'left', cursor: 'pointer',
              border: `2px solid ${active ? c.color : 'var(--glass-border)'}`,
              background: active ? `${c.color}18` : 'var(--glass-bg-strong)',
              transition: 'all .15s',
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{c.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: active ? c.color : 'var(--ink)' }}>{c.label}</div>
              <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} style={{
                    width: 8, height: 8, borderRadius: 99,
                    background: n <= c.difficulty ? c.color : 'var(--glass-border)',
                  }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ padding: 16, borderRadius: 16, border: `1.5px solid ${cfg.color}`, background: `${cfg.color}10`, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: cfg.color }}>{cfg.label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }}>⏱ {cfg.durationMs / 1000}초 제한</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{cfg.sub}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} style={{ width: 10, height: 10, borderRadius: 99, background: n <= cfg.difficulty ? cfg.color : 'var(--glass-border)' }} />
          ))}
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', marginLeft: 2 }}>
            {['', '초급', '중급', '고급', '최강'][cfg.difficulty]}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)' }}>문항 수</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {COUNT_OPTIONS.map((n) => (
            <button key={n} onClick={() => setCount(n)} style={{
              flex: 1, padding: '10px 0', borderRadius: 12, fontWeight: 800, fontSize: 15,
              border: `2px solid ${count === n ? cfg.color : 'var(--glass-border)'}`,
              background: count === n ? `${cfg.color}18` : 'var(--glass-bg-strong)',
              color: count === n ? cfg.color : 'var(--ink)',
              cursor: 'pointer',
            }}>{n}문항</button>
          ))}
        </div>
      </div>

      <PrimaryAction onClick={() => onStart(mode, count)} style={{ background: cfg.color }}>
        <Icon name="fast" size={18} /> {cfg.label} 시작
      </PrimaryAction>
    </main>
  );
}

// ── 게임 본체 ─────────────────────────────────────────────────────────────────
interface GameProps {
  cards: Card[];
  mode: FlashMode;
  count: number;
  unlockedSceneIds: string[];
  onExit: () => void;
  onReplay: () => void;
}

function FlashGame({ cards, mode, count, unlockedSceneIds, onExit, onReplay }: GameProps) {
  const cfg = MODE_CONFIG[mode];
  const DURATION = cfg.durationMs;
  const FAST_MS = cfg.fastMs;

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [callout, setCallout] = useState<Callout>(null);
  const [done, setDone] = useState(false);
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
    stopSpeaking();
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
      <main className={`ym-speed-show ym-speed-result ${win ? 'is-win' : ''}`} style={{ ...WRAP, minHeight: '100svh' }}>
        <span className="ym-speed-show-lights" aria-hidden />
        <div className="ym-rise ym-speed-result-board">
          <span className="ym-speed-onair" style={{ background: cfg.color }}><i /> {cfg.label.toUpperCase()}</span>
          <h1>{win ? 'CHALLENGE CLEAR' : 'TIME UP'}</h1>
          <div className="ym-speed-final-score">
            <strong>{score}</strong>
            <span>/ {count}</span>
          </div>
          <div className="ym-speed-result-stats">
            <span><b>{pct}%</b> ACCURACY</span>
            <span><b>{best}</b> BEST COMBO</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#d9e8ff', fontWeight: 700 }}>
            {pct >= 90 ? '🏆 완벽! 다음 레벨에도 도전해 보세요.' : pct >= 75 ? '🎯 보석함 획득! 꾸준히 유지해요.' : `정답률 ${Math.round(REWARD_RATIO * 100)}% 이상이면 보석함을 받아요!`}
          </div>
        </div>

        {reward && (
          <div className="ym-rise" style={{ animationDelay: '.06s', marginTop: 18 }}>
            <GachaBox sessionId={reward.sid} sceneIds={reward.scenes} grade={reward.grade} />
          </div>
        )}

        <div className="ym-rise" style={{ animationDelay: '.1s', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryAction onClick={onReplay} style={{ background: cfg.color }}><Icon name="fast" size={18} /> 모드 선택</PrimaryAction>
          <button className="ym-press" onClick={onExit} style={homeBtn}><Icon name="nav-home" size={18} /> 홈으로</button>
        </div>
      </main>
    );
  }

  if (!card || card.kind !== 'quiz') return (
    <main style={WRAP}>
      <p style={{ textAlign: 'center', marginTop: 40, color: 'var(--ink-soft)' }}>
        준비된 카드가 없어요. 해당 모드의 학습을 먼저 진행해 주세요.
      </p>
      <button onClick={onExit} style={{ ...homeBtn, marginTop: 16 }}>홈으로</button>
    </main>
  );

  const ratio = left / DURATION;
  const low = ratio <= 0.25;
  const barColor = ratio > 0.5 ? cfg.color : ratio > 0.25 ? '#e0a23a' : '#e0564a';
  const hot = combo >= 3;
  const promptText = card.listen ? null : (card.bannerJa || card.banner);
  const signCard = card.id.startsWith('sign:');
  const cardFx = callout === 'miss' ? 'ym-speed-card is-miss' : callout ? `ym-speed-card is-${callout}` : `ym-speed-card${hot ? ' is-hot' : ''}`;
  const timeLeft = Math.max(0, Math.ceil(left / 1000));
  const timerDeg = `${Math.max(0, Math.min(1, ratio)) * 360}deg`;
  const answerLetters = ['A', 'B', 'C', 'D'];

  return (
    <main className={`ym-speed-show ${hot ? 'is-hot' : ''} ${low ? 'is-low' : ''} ${callout ? `is-${callout}` : ''}`}
      style={{ ...WRAP, position: 'relative', overflow: 'hidden', minHeight: '100svh' }}>
      <span className="ym-speed-show-lights" aria-hidden />
      <span className="ym-speed-led-wall" aria-hidden />
      {callout && <SpeedScreenFx tone={callout} />}
      <header className="ym-speed-broadcast">
        <button onClick={onExit} className="ym-speed-exit">EXIT</button>
        <span className="ym-speed-onair" style={{ background: cfg.color }}><i /> {cfg.label}</span>
        <span className="ym-speed-round">Q {idx + 1}/{count}</span>
      </header>

      <section className="ym-speed-scoreboard" aria-label="scoreboard">
        <div><span>SCORE</span><strong>{score}</strong></div>
        <div><span>COMBO</span><strong>{combo}</strong></div>
        <div><span>BEST</span><strong>{best}</strong></div>
      </section>

      <section className="ym-speed-mainstage">
        <div className={`ym-speed-clock ${low ? 'is-low' : ''}`}
          style={{ ['--timer-deg' as string]: timerDeg, ['--timer-color' as string]: barColor }}>
          <strong>{timeLeft}</strong>
          <span>SEC</span>
        </div>
        <div key={`${idx}:${callout ?? ''}`} className={`${cardFx} ym-speed-question ym-speed-led-question`}>
          <span className="ym-speed-category">{card.tag}</span>
          {hot && <span className="ym-speed-combo-burst">COMBO ×{combo}</span>}
          {signCard ? (
            <SignPromptBoard text={card.bannerJa || card.banner} category={card.tag.replace(' 읽기', '')} />
          ) : card.listen ? (
            <button className="ym-press" onClick={() => card.bannerJa && speak(card.bannerJa)} disabled={!ttsSupported()}
              style={{ width: 84, height: 84, borderRadius: 99, border: `1px solid ${cfg.color}`, background: `${cfg.color}18`, color: cfg.color, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="listen" size={40} />
            </button>
          ) : (
            <div className="ym-speed-prompt" lang="ja">{promptText}</div>
          )}
          {card.sub && <p className="ym-speed-sub">{card.sub}</p>}
        </div>
      </section>

      <section className="ym-speed-buzzer-grid">
        {card.choices.map((c, i) => {
          const isPicked = picked === i;
          const reveal = picked !== null;
          const right = c.correct && !c.recovery;
          const fx = reveal && right ? ' is-correct ym-answer-correct' : reveal && isPicked && !right ? ' is-wrong ym-answer-wrong' : reveal ? ' is-dim' : '';
          return (
            <button key={i} className={`ym-press ym-speed-buzzer${fx}`} onClick={() => handle(i)} disabled={picked !== null}>
              <span>{answerLetters[i] ?? i + 1}</span>
              <strong>{c.label}</strong>
            </button>
          );
        })}
      </section>
    </main>
  );
}

// ── 공개 컴포넌트 — 모드 선택 → 게임 ─────────────────────────────────────────
export function Flash({ cards, unlockedSceneIds, onExit, onReplay: _onReplay }: Props) {
  const [run, setRun] = useState<{ mode: FlashMode; count: CountOption; cards: Card[] } | null>(null);
  const lastModeRef = useRef<FlashMode>('blitz');
  const lastCountRef = useRef<CountOption>(10);

  if (run === null) {
    return (
      <ModeSelect
        lastMode={lastModeRef.current}
        lastCount={lastCountRef.current}
        onStart={(m, c) => {
          lastModeRef.current = m;
          lastCountRef.current = c;
          const selected = _onReplay(m, c);
          setRun({ mode: m, count: c, cards: selected.length ? selected : cards.slice(0, c) });
        }}
        onExit={onExit}
      />
    );
  }

  return (
    <FlashGame
      key={`${run.mode}:${run.count}:${run.cards.map((c) => c.id).join('|')}`}
      cards={run.cards.slice(0, run.count)}
      mode={run.mode}
      count={run.count}
      unlockedSceneIds={unlockedSceneIds}
      onExit={onExit}
      onReplay={() => setRun(null)}
    />
  );
}

function SpeedScreenFx({ tone }: { tone: Exclude<Callout, null> }) {
  const label = tone === 'perfect' ? 'PERFECT' : tone === 'good' ? 'HIT' : 'MISS';
  const color = tone === 'miss' ? '#e0564a' : tone === 'perfect' ? '#f0b43f' : '#4cae79';
  return (
    <span aria-hidden className={`ym-speed-screen-fx is-${tone}`} style={{ ['--fx-color' as string]: color }}>
      <FlashHitFx tone={tone} />
      <span className="ym-speed-fx-ring is-one" />
      <span className="ym-speed-fx-ring is-two" />
      <span className="ym-speed-fx-swipe" />
      <span className={`ym-speed-callout is-${tone}`}>{label}</span>
    </span>
  );
}

function SignPromptBoard({ text, category }: { text: string; category: string }) {
  const menu = category === '메뉴';
  const traffic = category === '교통';
  const caution = category === '주의';
  return (
    <div className={`ym-local-sign ${menu ? 'is-menu' : traffic ? 'is-traffic' : caution ? 'is-caution' : ''}`}>
      <span className="ym-local-sign-pin" aria-hidden />
      <span className="ym-local-sign-category">{category}</span>
      <span lang="ja" className="ym-local-sign-text">{text}</span>
      <span className="ym-local-sign-sub">{menu ? '本日のおすすめ' : traffic ? '駅構内案内' : caution ? 'ご注意ください' : 'まちの表示'}</span>
    </div>
  );
}

function FlashHitFx({ tone }: { tone: Exclude<Callout, null> }) {
  const color = tone === 'miss' ? '#e0564a' : tone === 'perfect' ? '#f0b43f' : '#4cae79';
  const count = tone === 'perfect' ? 24 : tone === 'good' ? 18 : 12;
  return (
    <span aria-hidden className={`ym-speed-hitfx is-${tone}`} style={{ ['--fx-color' as string]: color }}>
      {Array.from({ length: count }).map((_, i) => (
        <i key={i} style={{
          ['--fx-color' as string]: color,
          ['--fx-rot' as string]: `${i * (360 / count)}deg`,
          animationDelay: `${i * 0.01}s`,
        }} />
      ))}
    </span>
  );
}

const homeBtn: React.CSSProperties = {
  width: '100%', padding: '15px 16px', borderRadius: 16, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};

const ghostIcon: React.CSSProperties = {
  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-soft)',
};
