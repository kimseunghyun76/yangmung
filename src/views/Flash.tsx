// 속도전 — 레벨별 모드 선택 + 제한시간 내 즉답 대결. 콤보·점수, 고득점이면 보석함 보상.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Card, Choice } from '../learn/cards';
import type { FlashMode } from '../learn/progress';
import { speak, stopSpeaking, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { PrimaryAction } from './shell';
import { GachaBox } from './Gacha';
import { boxGrade } from '../learn/collection';
import { loadFlashBest, saveFlashRun, type FlashBest } from '../learn/flashScores';

const vibrate = (p: number | number[]) => { try { navigator.vibrate?.(p); } catch { /* 미지원 무시 */ } };
// 콤보 단계 칭호 — 3 HOT · 6 FEVER · 10 PERFECT
function comboTier(combo: number): { label: string; color: string } | null {
  if (combo >= 10) return { label: 'PERFECT', color: '#ffd24a' };
  if (combo >= 6) return { label: 'FEVER', color: '#ff7a3d' };
  if (combo >= 3) return { label: 'HOT', color: '#ff4d6d' };
  return null;
}

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
  const best = loadFlashBest(mode);

  return (
    <main style={{ ...WRAP, minHeight: '100svh', paddingTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={onExit} style={ghostIcon}>
          <Icon name="back" size={18} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 16 }}>⚡ 속도전 설정</span>
        <span style={{ width: 32 }} />
      </div>

      <div style={{ overflow: 'hidden', width: '100%', aspectRatio: '4 / 3', marginBottom: 18, borderRadius: 18, background: '#111827', border: '1px solid rgba(255,255,255,.14)' }}>
        <img src="/scenes/quick-practice/flash.webp" alt="" aria-hidden style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
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
        {best.score > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--glass-border)' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: cfg.color }}>🏅 내 최고 {best.score.toLocaleString()}점</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)' }}>· 최고 콤보 {best.combo}</span>
          </div>
        )}
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

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [done, setDone] = useState(false);
  const [reward, setReward] = useState<{ sid: number; scenes: string[]; grade: ReturnType<typeof boxGrade> } | null>(null);
  const tickRef = useRef<number | null>(null);
  const advRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const scoreRef = useRef(0);        // 누적 점수(반응속도·콤보 가산)
  const correctRef = useRef(0);      // 맞힌 개수(정답률·보상 판정용)
  const bestComboRef = useRef(0);
  const reactSumRef = useRef(0);     // 정답까지 걸린 시간 합(평균 반응속도용)
  const missedRef = useRef<{ ja: string; ko: string }[]>([]); // 틀린 표현(다시보기용)
  const shownRef = useRef(Date.now());
  const [floatPts, setFloatPts] = useState<{ n: number; key: number } | null>(null); // 정답 시 +점수 플로팅
  const [screenFx, setScreenFx] = useState<{ kind: 'perfect' | 'good' | 'miss'; label: string; color: string; key: number } | null>(null);
  const [record, setRecord] = useState<{ isRecord: boolean; prev: FlashBest } | null>(null);
  const myBest = useRef<FlashBest>(loadFlashBest(mode)).current; // 이 모드 최고기록(시작 시점)
  const card = cards[idx];

  useEffect(() => {
    if (done || !card) return;
    lockedRef.current = false;
    setPicked(null);
    setFloatPts(null);
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
    const correctCount = correctRef.current;
    const acc = cards.length ? correctCount / cards.length : 0;
    setRecord(saveFlashRun(mode, scoreRef.current, bestComboRef.current));
    if (cards.length && acc >= REWARD_RATIO && unlockedSceneIds.length) {
      const n = correctCount >= cards.length ? 2 : 1;
      const pool = [...unlockedSceneIds];
      for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      const stars = Math.round(acc * 3);
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
    setPicked(choiceIdx);
    const elapsedAll = Date.now() - shownRef.current;
    if (correct) {
      correctRef.current += 1;
      reactSumRef.current += elapsedAll;
      const comboNow = combo + 1;
      const elapsed = elapsedAll;
      const remRatio = Math.max(0, Math.min(1, 1 - elapsed / DURATION));
      const speedBonus = Math.round(remRatio * 150);          // 빨리 답할수록 +최대 150
      const comboBonus = Math.min(comboNow, 12) * 15;          // 콤보 유지 보너스
      const gained = 100 + speedBonus + comboBonus;
      scoreRef.current += gained;
      setScore(scoreRef.current);
      setFloatPts({ n: gained, key: Date.now() });
      const fxKey = Date.now();
      const perfect = elapsedAll <= cfg.fastMs;
      setScreenFx({ kind: perfect ? 'perfect' : 'good', label: perfect ? 'PERFECT' : 'CORRECT', color: perfect ? '#d8a24a' : '#6fb98a', key: fxKey });
      window.setTimeout(() => setScreenFx((cur) => (cur?.key === fxKey ? null : cur)), 760);
      bestComboRef.current = Math.max(bestComboRef.current, comboNow);
      setBest(bestComboRef.current);
      setCombo(comboNow);
      vibrate(comboNow >= 10 ? [10, 30, 10] : 15);
    } else {
      setCombo(0);
      const fxKey = Date.now();
      setScreenFx({ kind: 'miss', label: 'MISS', color: '#e2655a', key: fxKey });
      window.setTimeout(() => setScreenFx((cur) => (cur?.key === fxKey ? null : cur)), 720);
      vibrate([20, 40, 20]);
      const target = card.choices.find((c) => c.correct && !c.recovery);
      const ja = card.bannerJa || target?.ja || card.banner;
      const ko = target?.phrase?.korean || target?.label || '';
      if (ja && !missedRef.current.some((m) => m.ja === ja)) missedRef.current.push({ ja, ko });
    }
    advRef.current = window.setTimeout(() => {
      if (idx + 1 >= cards.length) finishGame(); else setIdx((i) => i + 1);
    }, correct ? 420 : 820);
  }

  if (done) {
    const correctCount = correctRef.current;
    const pct = cards.length ? Math.round((correctCount / cards.length) * 100) : 0;
    const win = reward !== null;
    const isRecord = !!record?.isRecord;
    return (
      <main style={{ ...WRAP, minHeight: '100svh', paddingTop: 'max(20px, env(safe-area-inset-top))' }}>
        <div className="ym-rise ym-glass ym-glass-strong" style={{ padding: '24px 20px', borderRadius: 22, textAlign: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)' }}>
            <span aria-hidden style={{ fontSize: 15 }}>{cfg.emoji}</span>{cfg.label}
          </span>
          <h1 style={{ margin: '10px 0 0', fontSize: 25, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{win ? '클리어!' : '시간 종료'}</h1>
          {isRecord && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, margin: '10px auto 0', padding: '4px 13px', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 900, fontSize: 13 }}>
              <Icon name="star" size={14} /> 신기록
            </div>
          )}
          <div style={{ marginTop: 14 }}>
            <strong style={{ fontSize: 58, fontWeight: 950, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', lineHeight: 0.95 }}>{score.toLocaleString()}</strong>
            <span style={{ fontSize: 20, color: 'var(--ink-soft)', marginLeft: 6, fontWeight: 800 }}>점</span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 12.5, fontWeight: 750, color: isRecord ? 'var(--accent)' : 'var(--ink-faint)' }}>
            {isRecord ? `이전 기록 ${record!.prev.score.toLocaleString()}점 경신` : `내 최고 ${Math.max(myBest.score, score).toLocaleString()}점`}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
            <ResultStat label="정답" value={`${correctCount}/${count}`} />
            <ResultStat label="정답률" value={`${pct}%`} />
            <ResultStat label="최고 콤보" value={best} />
            {correctCount > 0 && <ResultStat label="평균 반응" value={`${(reactSumRef.current / correctCount / 1000).toFixed(1)}초`} />}
          </div>
          <p style={{ marginTop: 14, marginBottom: 0, fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700, lineHeight: 1.5 }}>
            {pct >= 90 ? '완벽해요! 다음 레벨에도 도전해 보세요.' : pct >= 75 ? '보석함 획득! 꾸준히 유지해요.' : `정답률 ${Math.round(REWARD_RATIO * 100)}% 이상이면 보석함을 받아요.`}
          </p>
        </div>

        {missedRef.current.length > 0 && (
          <div className="ym-rise ym-glass" style={{ animationDelay: '.04s', marginTop: 14, padding: '14px 16px', borderRadius: 18 }}>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', color: 'var(--accent)' }}>틀린 표현 다시보기</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {missedRef.current.slice(0, 8).map((m, i) => (
                <button key={i} className="ym-press" onClick={() => speak(m.ja)} disabled={!ttsSupported()}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 12, padding: '9px 12px', cursor: 'pointer', color: 'var(--ink)' }}>
                  <Icon name="listen" size={15} style={{ color: 'var(--accent)', flex: '0 0 auto' }} />
                  <span lang="ja" style={{ fontSize: 16, fontWeight: 800 }}>{m.ja}</span>
                  {m.ko && <span style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginLeft: 'auto' }}>{m.ko}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {reward && (
          <div className="ym-rise" style={{ animationDelay: '.06s', marginTop: 16 }}>
            <GachaBox sessionId={reward.sid} sceneIds={reward.scenes} grade={reward.grade} />
          </div>
        )}

        <div className="ym-rise" style={{ animationDelay: '.1s', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <PrimaryAction onClick={onReplay}><Icon name="fast" size={18} /> 모드 선택</PrimaryAction>
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

  const ratio = Math.max(0, Math.min(1, left / DURATION));
  const low = ratio <= 0.25;
  const barColor = ratio > 0.5 ? 'var(--accent)' : ratio > 0.25 ? '#e0a23a' : '#e0564a';
  const tier = comboTier(combo);
  const situationCard = card.reviewTarget?.type === 'mission'; // 상황 대화 = 일본어 질문 + 일본어 답
  const promptText = card.listen ? null : (card.bannerJa || card.banner);
  const signCard = card.id.startsWith('sign:');
  const choiceLabel = (c: Choice) => situationCard ? (c.phrase?.kana ?? c.ja ?? c.label) : c.label;
  const answerLetters = ['A', 'B', 'C', 'D'];
  const timeSec = Math.max(0, left / 1000).toFixed(1);
  const plen = Array.from(promptText ?? '').length;
  const promptFs = plen <= 4 ? 'clamp(38px, 12vw, 60px)' : plen <= 9 ? 'clamp(26px, 8vw, 42px)' : 'clamp(19px, 5.6vw, 28px)';

  return (
    <main className="ym-speed-show" style={{ minHeight: '100svh', position: 'relative', overflow: 'hidden' }}>
      <span className="ym-speed-show-lights" aria-hidden />
      <span className="ym-speed-led-wall" aria-hidden />
      {screenFx && typeof document !== 'undefined' && createPortal(
        <div key={screenFx.key} className="ym-speed-screen-fx" style={{ ['--fx-color' as string]: screenFx.color }} aria-hidden>
          <span className="ym-speed-fx-swipe" />
          <span className="ym-speed-fx-ring" />
          <span className="ym-speed-fx-ring is-two" />
          <span className={`ym-speed-hitfx is-${screenFx.kind}`}>
            {Array.from({ length: 16 }).map((_, n) => <i key={n} style={{ ['--fx-rot' as string]: `${n * 22.5}deg` }} />)}
          </span>
          <span className={`ym-speed-callout is-${screenFx.kind}`}>{screenFx.label}</span>
        </div>,
        document.body,
      )}
      <div style={{ ...WRAP, maxWidth: 720, position: 'relative', zIndex: 1, minHeight: '100svh', display: 'flex', flexDirection: 'column', paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <header className="ym-speed-broadcast">
          <button onClick={onExit} className="ym-speed-exit" aria-label="나가기"><Icon name="back" size={18} /></button>
          <span className="ym-speed-onair"><i /> SPEED QUIZ</span>
          <span className="ym-speed-round">{idx + 1} / {count}</span>
        </header>

        <section className="ym-speed-scoreboard" aria-label="속도전 점수판">
          <div><span>SCORE</span><strong>{score.toLocaleString()}</strong>{floatPts && <em key={floatPts.key} className="ym-rise" style={{ display: 'block', color: '#d8a24a', fontStyle: 'normal', fontSize: 12, fontWeight: 1000 }}>+{floatPts.n}</em>}</div>
          <div><span>COMBO</span><strong>{combo}</strong></div>
          <div><span>BEST</span><strong>{Math.max(myBest.score, score).toLocaleString()}</strong></div>
        </section>

        {/* 타이머 — 전체 폭 슬림 바 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0 12px' }}>
          <div style={{ flex: 1, height: 12, borderRadius: 999, background: 'rgba(255,247,235,.12)', overflow: 'hidden', boxShadow: low ? '0 0 16px rgba(224,86,74,.4)' : 'none' }}>
            <div style={{ height: '100%', width: `${ratio * 100}%`, background: barColor, borderRadius: 999, transition: 'width .1s linear' }} />
          </div>
          <span style={{ minWidth: 50, textAlign: 'right', color: low ? '#e0564a' : '#fff7eb', fontWeight: 1000, fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>{timeSec}s</span>
        </div>

        {/* 질문 — 전체 폭, 글자 자동 크기 */}
        <div style={{ position: 'relative', borderRadius: 20, padding: '22px 16px', minHeight: 148, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'linear-gradient(180deg, rgba(43,32,21,.72), rgba(26,19,12,.74))', border: '1px solid rgba(216,162,74,.28)' }}>
          <span style={{ position: 'absolute', left: 14, top: 12, fontSize: 10.5, fontWeight: 900, letterSpacing: '.08em', color: '#d8a24a' }}>{card.tag}</span>
          {tier && <span style={{ position: 'absolute', right: 12, top: 11, fontSize: 11, fontWeight: 1000, color: '#f0d28a' }}>{tier.label} ×{combo}</span>}
          {signCard ? (
            <SignPromptBoard text={card.bannerJa || card.banner} category={card.tag.replace(' 읽기', '')} />
          ) : card.listen ? (
            <>
              <button className="ym-press" onClick={() => card.bannerJa && speak(card.bannerJa)} disabled={!ttsSupported()}
                style={{ width: 92, height: 92, borderRadius: 999, border: '1px solid rgba(216,162,74,.5)', background: 'rgba(255,247,235,.08)', color: '#fff7eb', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 28px rgba(216,162,74,.18)' }}>
                <Icon name="listen" size={44} />
              </button>
              <p lang="ja" style={{ margin: '10px 0 0', fontSize: 14, fontWeight: 800, color: '#fff7eb' }}>聞いて意味を選びましょう</p>
            </>
          ) : (
            <div lang="ja" style={{ fontSize: promptFs, fontWeight: 1000, color: '#fff7eb', lineHeight: 1.16, wordBreak: 'keep-all' }}>{promptText}</div>
          )}
          {card.sub && !situationCard && !card.listen && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'rgba(244,237,224,.66)', fontWeight: 600 }}>{card.sub}</p>}
        </div>

        {/* 선택지 — 세로 스택(전체 폭), 긴 일본어도 줄바꿈 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14, paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}>
          {card.choices.map((c, i) => {
            const isPicked = picked === i;
            const reveal = picked !== null;
            const right = c.correct && !c.recovery;
            let border = 'rgba(216,162,74,.22)', bg = 'linear-gradient(145deg, rgba(48,36,24,.92), rgba(26,19,12,.94))', badgeBg = 'rgba(216,162,74,.92)', op = 1;
            if (reveal && right) { border = '#6fb98a'; bg = 'linear-gradient(145deg, rgba(45,96,64,.92), rgba(18,40,28,.94))'; badgeBg = '#6fb98a'; }
            else if (reveal && isPicked && !right) { border = '#e2655a'; bg = 'linear-gradient(145deg, rgba(120,42,36,.92), rgba(44,16,13,.94))'; badgeBg = '#e2655a'; }
            else if (reveal) op = 0.42;
            return (
              <button key={i} className="ym-press" onClick={() => handle(i)} disabled={reveal}
                style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '15px 14px', borderRadius: 16, border: `1.5px solid ${border}`, background: bg, color: '#f7f0e3', cursor: reveal ? 'default' : 'pointer', opacity: op, transition: 'opacity .12s', minHeight: 56 }}>
                <span style={{ width: 30, height: 30, flex: '0 0 30px', borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: badgeBg, color: '#2a1c08', fontWeight: 1000, fontSize: 14 }}>{answerLetters[i] ?? i + 1}</span>
                <strong lang={situationCard ? 'ja' : undefined} style={{ fontWeight: 850, fontSize: 16, lineHeight: 1.3, wordBreak: 'keep-all' }}>{choiceLabel(c)}</strong>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function ResultStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 14, padding: '11px 10px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
      <span style={{ display: 'block', fontSize: 11, fontWeight: 750, color: 'var(--ink-faint)' }}>{label}</span>
      <strong style={{ display: 'block', marginTop: 3, fontSize: 21, fontWeight: 900, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</strong>
    </div>
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

const homeBtn: React.CSSProperties = {
  width: '100%', padding: '15px 16px', borderRadius: 16, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};

const ghostIcon: React.CSSProperties = {
  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-soft)',
};
