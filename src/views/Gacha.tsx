// 가챠 카드 도감 — 세션별 아이템 카드 수집 + 병합.
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CONTENT } from '../content';
import {
  BOX, MERGE_NEED, NEXT_RARITY, RARITIES,
  bestRarity, claim, diamondCount, honorTrophyCount, itemsOf, loadCollection, mergeScene,
  ownedCount, rarityMeta, rarityToTier, saveCollection, totalItems,
  type BoxGrade, type Collection, type DropResult, type Rarity,
} from '../learn/collection';
import { gachaItemForPlace } from '../learn/gachaItems';
import { loadProgress } from '../learn/progress';
import { Icon } from '../ui/Icon';
import { speak, ttsSupported } from '../tts';
import { loadSettings, sceneSentenceLevelForMode } from '../learn/settings';
import { Modal } from './Modal';
import { sceneVisualByMission } from './scene';
import { MascotBubble } from './mascot';

const SCENES = CONTENT.missions.filter((m) => m.id !== 'C0');
const MAX_GACHA_DRAWS = 30;
const placeOf = (id: string) => CONTENT.missions.find((m) => m.id === id)?.place ?? id;
const rarityStars = (rarity: Rarity) => rarityToTier(rarity);
const isRareReveal = (rarity: Rarity) => rarity === 'gold' || rarity === 'diamond';

function itemKoreanDescription(place: string, title: string, rarity: Rarity): string {
  const tone: Record<Rarity, string> = {
    basic: '여행 장면을 시작하게 해 주는 작은 선물',
    bronze: '실전 주문과 요청에 바로 쓰기 좋은 선물',
    silver: '상황 설명까지 자연스럽게 이어 주는 선물',
    gold: '정중하고 구체적인 부탁을 연습하게 해 주는 선물',
    diamond: '최종 미션을 떠올리게 하는 특별한 선물',
  };
  return `${place}에서 얻은 ${title}. ${tone[rarity]}입니다.`;
}

function ItemArt({ sceneId, rarity, size }: { sceneId: string; rarity: Rarity; size: number }) {
  const sv = sceneVisualByMission(sceneId);
  const item = gachaItemForPlace(placeOf(sceneId), rarity);
  const [failed, setFailed] = useState(false);
  const src = !failed ? item.image : undefined;
  if (!src) {
    return <span className={`ym-gacha-item-illustration is-${item.motif} is-${rarity}`} style={{ ['--scene-accent' as string]: sv.accent, position: 'relative', left: 'auto', top: 'auto', width: Math.round(size * 0.72), height: Math.round(size * 0.72) }} />;
  }
  return <img className="ym-mcard-img" src={src} alt="" draggable={false} onError={() => setFailed(true)} />;
}

// 스포츠 트레이딩 카드 방향 — 사진 중심, 일본어 이름, 한국어 설명. 등급명은 말하지 않고 재질로만 구분.
function DeckCardFace({ sceneId, rarity, size = 56 }: { sceneId: string; rarity: Rarity; size?: number }) {
  const sv = sceneVisualByMission(sceneId);
  const meta = rarityMeta(rarity);
  const item = gachaItemForPlace(placeOf(sceneId), rarity);
  const cardNo = String(rarityToTier(rarity) * 100 + Math.max(1, SCENES.findIndex((m) => m.id === sceneId) + 1)).padStart(3, '0');
  const holo = rarity === 'gold' || rarity === 'diamond';
  return (
    <span className={`ym-mcard is-${rarity} ${holo ? 'is-holo' : ''}`} style={{
      ['--rarity-color' as string]: meta.color,
      ['--scene-accent' as string]: sv.accent,
      width: size, height: Math.round(size * 1.42), flex: '0 0 auto', aspectRatio: '5 / 7',
      borderRadius: Math.round(size * 0.08),
    }}>
      <span className="ym-mcard-brand" style={{ fontSize: Math.max(5, Math.round(size * 0.055)), marginTop: Math.round(size * 0.045) }}>YANGMUNG TRAVEL CARD</span>
      <span className="ym-mcard-serial" style={{ fontSize: Math.max(5, Math.round(size * 0.052)) }}>NO.{cardNo}</span>
      <span className="ym-mcard-stars" aria-label={`${rarityStars(rarity)}성 카드`} style={{ fontSize: Math.max(6, Math.round(size * 0.072)), marginTop: Math.round(size * 0.032) }}>
        {Array.from({ length: rarityStars(rarity) }, (_, i) => <span key={i}>★</span>)}
      </span>
      <span aria-hidden className="ym-mcard-art" style={{ width: Math.round(size * 0.78), height: Math.round(size * 0.64), marginTop: Math.round(size * 0.052) }}>
        <ItemArt sceneId={sceneId} rarity={rarity} size={size} />
      </span>
      <span className="ym-mcard-title" lang="ja" style={{ fontSize: Math.max(8, Math.round(size * 0.13)), width: '88%', marginTop: Math.round(size * 0.055) }}>{item.jaTitle ?? item.title}</span>
      <span className="ym-mcard-sub" style={{ fontSize: Math.max(6, Math.round(size * 0.079)), padding: '1px 6px', marginTop: 3, maxWidth: '86%' }}>{item.title}</span>
      <span className="ym-mcard-desc" style={{ fontSize: Math.max(5, Math.round(size * 0.058)), width: '84%' }}>{itemKoreanDescription(placeOf(sceneId), item.title, rarity)}</span>
    </span>
  );
}

// 가챠폰 머신(ガチャガチャ) — 머신은 고정, 돔 안 캡슐만 탭 속도에 맞춰 빨라진다.
const CAPSULE_COLORS: [string, string][] = [
  ['rgba(255,255,255,.74)', '#e8554d'],
  ['rgba(231,244,255,.76)', '#3f7cd6'],
  ['rgba(255,250,220,.78)', '#f2b63c'],
  ['rgba(237,255,241,.76)', '#58b66e'],
  ['rgba(255,239,249,.78)', '#f08bb2'],
  ['rgba(244,238,255,.76)', '#8a6fd1'],
  ['rgba(255,246,232,.78)', '#e8554d'],
  ['rgba(232,250,255,.76)', '#3f7cd6'],
];
const BALL_POS = [
  { l: 14, t: 50 }, { l: 32, t: 61 }, { l: 52, t: 58 }, { l: 72, t: 50 },
  { l: 22, t: 31 }, { l: 45, t: 24 }, { l: 64, t: 31 }, { l: 82, t: 33 },
];
const BALL_DEPTH = [0.82, 1.04, 0.94, 0.78, 1.1, 0.9, 1.02, 0.86];
const DISPENSED_CAPSULE_COLORS: Record<BoxGrade, [string, string]> = {
  wood: CAPSULE_COLORS[0],
  silver: CAPSULE_COLORS[1],
  gold: CAPSULE_COLORS[2],
};

function CapsuleBall({ className = '', style, mark = false }: { className?: string; style?: React.CSSProperties; mark?: boolean }) {
  return (
    <span className={`ym-gpn-ball ${className}`} aria-hidden style={style}>
      <span className="ym-gpn-ball-shell" />
      <span className="ym-gpn-ball-cup" />
      <span className="ym-gpn-ball-band" />
      <span className="ym-gpn-ball-seam" />
      <span className="ym-gpn-ball-lock" />
      <span className="ym-gpn-ball-glare" />
      {mark && <span className="ym-gpn-capsule-mark">?</span>}
    </span>
  );
}

function GachaMachine({ grade, taps, spinning, mini = false }: { grade: BoxGrade; taps: number; spinning?: boolean; mini?: boolean }) {
  const domeState = spinning || taps > 0 ? 'is-spin' : '';
  const speed = Math.max(0.34, 0.92 - taps * 0.075);
  const machine = (
    <div className={`ym-gpn-machine ym-gpn-image-machine ${taps > 0 || spinning ? 'is-active' : ''} ${taps > 0 && !spinning ? 'is-jolt' : ''}`} key={`m:${taps}:${spinning ? 's' : ''}`}
      style={{ ['--ball-speed' as string]: `${speed}s`, ['--tap-count' as string]: String(taps), ...(mini ? { transform: 'scale(0.58)', transformOrigin: 'center bottom' } : null) }}>
      <img className="ym-gpn-machine-img" src="/gacha/machine/gachapon-machine.webp" alt="" draggable={false} />
      <div className={`ym-gpn-dome ym-gpn-dome-overlay ${domeState}`} aria-hidden>
        <span className="ym-gpn-dome-vortex" aria-hidden />
        {BALL_POS.map((p, i) => (
          <CapsuleBall key={i} style={{
            left: `${p.l}%`, top: `${p.t}%`,
            ['--cap-scale' as string]: String(BALL_DEPTH[i]),
            ['--cap-top' as string]: CAPSULE_COLORS[i][0],
            ['--cap' as string]: CAPSULE_COLORS[i][1],
            ['--cap-rot' as string]: `${-18 + (i % 5) * 9}deg`,
            ['--jx' as string]: `${(i % 2 === 0 ? 1 : -1) * (4 + (i % 3) * 4)}px`,
            ['--jy' as string]: `${-8 - (i % 4) * 5}px`,
            ['--d' as string]: `${i * 0.03}s`,
            ['--ang' as string]: `${i * 45}deg`,
            ['--orbit' as string]: `${18 + (i % 3) * 10}px`,
            ['--spd' as string]: `calc(var(--ball-speed, .82s) + ${(i % 3) * 0.1}s)`,
            ['--tx1' as string]: `${(i % 2 === 0 ? 1 : -1) * (18 + (i % 3) * 7)}px`,
            ['--ty1' as string]: `${-18 + (i % 4) * 5}px`,
            ['--tx2' as string]: `${(i % 3 === 0 ? -1 : 1) * (26 + (i % 2) * 10)}px`,
            ['--ty2' as string]: `${10 - (i % 3) * 7}px`,
            ['--tx3' as string]: `${(i % 2 === 0 ? -1 : 1) * (10 + (i % 4) * 6)}px`,
            ['--ty3' as string]: `${18 - (i % 2) * 9}px`,
          }} />
        ))}
        <span className="ym-gpn-dome-glass" aria-hidden />
      </div>
      <span className="ym-gpn-crank-shadow" aria-hidden />
      <span className={`ym-gpn-touch-ring is-${grade} ${taps === 0 && !spinning ? 'is-idle' : ''}`} aria-hidden />
      <span className="ym-gpn-crank-knob" aria-hidden />
      <span className="ym-gpn-chute-glow" aria-hidden />
    </div>
  );
  if (!mini) return machine;
  return <div className="ym-gpn-mini-slot">{machine}</div>;
}

// 배출된 캡슐 — 떨어지고(ゴトンッ) → 흔들리고 → 빠캉! 반으로 갈라짐(パカッ‼)
function Capsule({ grade, state }: { grade: BoxGrade; state: 'drop' | 'wobble' | 'pop' }) {
  const box = BOX[grade];
  const [capTop, capBottom] = DISPENSED_CAPSULE_COLORS[grade];
  return (
    <div className={`ym-gpn-capsule is-${state}`} style={{
      ['--cap-top' as string]: capTop,
      ['--cap' as string]: capBottom || box.colors[1],
    }}>
      <CapsuleBall className="ym-gpn-capsule-whole" mark={state !== 'pop'} />
      <span className="ym-gpn-cap-half ym-gpn-cap-top" aria-hidden />
      <span className="ym-gpn-cap-half ym-gpn-cap-bottom" aria-hidden />
    </div>
  );
}

// 망가 카드 뒷면 — 인디고 + 집중선 + ？
function CardBack({ rarity = 'basic', size = 82 }: { rarity?: Rarity; size?: number }) {
  const meta = rarityMeta(rarity);
  return (
    <span className={`ym-mback is-${rarity}`} style={{
      ['--rarity-color' as string]: meta.color,
      width: size, height: Math.round(size * 1.28), borderRadius: Math.round(size * 0.17),
    }}>
      <span className="ym-mback-mascot" aria-hidden />
    </span>
  );
}

function DrawCard({ item, flipped, onFlip, index, active = true, large = false }: { item: DropResult; flipped: boolean; onFlip: () => void; index: number; active?: boolean; large?: boolean }) {
  const meta = rarityMeta(item.rarity);
  return (
    <button
      className={`ym-gacha-draw-card ${flipped ? `is-flipped is-${item.rarity}` : 'ym-press'} ${active ? 'is-active' : ''} ${large ? 'is-large' : ''}`}
      onClick={(e) => { e.stopPropagation(); onFlip(); }}
      disabled={!active}
      style={{
        ['--rarity-color' as string]: meta.color,
        animationDelay: flipped ? `${index * 0.035}s` : undefined,
        width: large ? 172 : 110, minHeight: large ? 244 : 166, border: 0, background: 'transparent', color: '#fff', cursor: active ? 'pointer' : 'default',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: 0,
      }}
    >
      {flipped ? <DeckCardFace sceneId={item.sceneId} rarity={item.rarity} size={large ? 154 : 96} /> : <CardBack rarity={item.rarity} size={large ? 148 : 96} />}
      {flipped && (
        <>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.84)', maxWidth: 86, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{placeOf(item.sceneId)}</span>
        </>
      )}
    </button>
  );
}

function CardDetailOverlay({ item, canAdvance, onClose, onAdvance }: { item: DropResult; canAdvance: boolean; onClose: () => void; onAdvance: () => void }) {
  const meta = rarityMeta(item.rarity);
  const gift = gachaItemForPlace(placeOf(item.sceneId), item.rarity);
  const sv = sceneVisualByMission(item.sceneId);
  return (
    <div className="ym-gacha-detail-backdrop" onClick={(e) => { e.stopPropagation(); onClose(); }}>
      <div className={`ym-gacha-detail is-${item.rarity}`} onClick={(e) => e.stopPropagation()} style={{ ['--rarity-color' as string]: meta.color, ['--scene-accent' as string]: sv.accent }}>
        <DeckCardFace sceneId={item.sceneId} rarity={item.rarity} size={174} />
        <div className="ym-gacha-detail-copy">
          <span className="ym-gacha-detail-kicker">{rarityStars(item.rarity)} STAR · {placeOf(item.sceneId)}</span>
          <h3 lang="ja">{gift.jaTitle ?? gift.title}</h3>
          <strong>{gift.title}</strong>
          <p>{itemKoreanDescription(placeOf(item.sceneId), gift.title, item.rarity)}</p>
          <span className="ym-gacha-detail-count">이번 카드로 이 선물 {item.shards}장 보유</span>
        </div>
        <div className="ym-gacha-detail-actions">
          <button className="ym-press" onClick={onClose}>계속 보기</button>
          <button className="ym-press is-primary" onClick={onAdvance}>{canAdvance ? '스택에 넣고 다음 카드' : '상세 닫기'}</button>
        </div>
      </div>
    </div>
  );
}

function RevealCards({ results, animate }: { results: DropResult[]; animate?: boolean }) {
  const grouped = groupResults(results);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))', gap: 14, justifyItems: 'center' }}>
      {grouped.map((r, i) => (
        <div key={`${r.sceneId}:${r.rarity}`} className={animate ? 'ym-card-in' : undefined} style={{ animationDelay: animate ? `${0.3 + i * 0.08}s` : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, minWidth: 104, position: 'relative', zIndex: 2 }}>
          <DeckCardFace sceneId={r.sceneId} rarity={r.rarity} size={animate ? 104 : 92} />
          <span style={{ fontSize: 13, fontWeight: 850 }}>{placeOf(r.sceneId)}</span>
          <span style={{ fontSize: 11, fontWeight: 850, color: 'var(--ink-faint)' }}>x{r.count}</span>
        </div>
      ))}
    </div>
  );
}

function groupResults(results: DropResult[]): DropResult[] {
  const map = new Map<string, DropResult>();
  for (const r of results) {
    const key = `${r.sceneId}:${r.rarity}`;
    const prev = map.get(key);
    if (prev) prev.count += r.count;
    else map.set(key, { ...r });
  }
  return [...map.values()];
}

const reduceMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function randomGachaDrawCount(): number {
  const table: { count: number; weight: number }[] = [
    { count: 1, weight: 30 },
    { count: 2, weight: 20 },
    { count: 3, weight: 10 },
    { count: 5, weight: 20 },
    { count: 10, weight: 10 },
    { count: 20, weight: 7 },
    { count: 30, weight: 3 },
  ];
  const total = table.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of table) {
    roll -= item.weight;
    if (roll < 0) return item.count;
  }
  return 1;
}

export function GachaBox({ sessionId, sceneIds, grade = 'wood', label = '오늘의 가챠', drawCount, randomDrawCount = false, afterRevealLabel, onAfterReveal, onClaimed }: {
  sessionId: number;
  sceneIds: string[];
  grade?: BoxGrade;
  label?: string;
  drawCount?: number;
  randomDrawCount?: boolean;
  afterRevealLabel?: string;
  onAfterReveal?: () => void;
  onClaimed?: (results: DropResult[]) => void;
}) {
  const box = BOX[grade];
  const [phase, setPhase] = useState<'closed' | 'open' | 'revealed'>('closed');
  const [stage, setStage] = useState<'crank' | 'capsule' | 'cards'>('crank');
  const [capState, setCapState] = useState<'drop' | 'wobble' | 'pop'>('drop');
  const [spinning, setSpinning] = useState(false);
  const [sfx, setSfx] = useState<{ text: string; size: number; key: number } | null>(null);
  const [results, setResults] = useState<DropResult[]>([]);
  const [taps, setTaps] = useState(0);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState(1);
  const [currentDraws, setCurrentDraws] = useState(drawCount ?? box.draws);
  const [spotlightIndex, setSpotlightIndex] = useState<number | null>(null);
  const [bulkOpening, setBulkOpening] = useState(false);
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [rareBurst, setRareBurst] = useState<{ index: number; rarity: Rarity; key: number } | null>(null);
  const [deck, setDeck] = useState(false);
  const openedRef = useRef(false);
  const dispenseRef = useRef(false);
  const plannedDrawsRef = useRef(drawCount ?? box.draws);
  const timersRef = useRef<number[]>([]);
  const displayDraws = currentDraws;
  const closedDrawLabel = randomDrawCount ? '여행 선물 카드 1~30장 랜덤' : `여행 선물 카드 ${displayDraws}장`;
  const TAPS = 7; // 실제 손잡이를 돌리는 느낌으로 여러 번 회전 후 캡슐 배출
  const allFlipped = results.length > 0 && flipped.size >= results.length;
  const visibleResults = results.slice(0, visibleCount);
  const activeIndex = Math.min(Math.max(visibleCount - 1, 0), Math.max(results.length - 1, 0));
  const activeResult = results[activeIndex];
  const openedResults = results.filter((_, i) => flipped.has(i) && i < activeIndex);
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 850, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' };

  // 기다리면 자동 배출(학습 흐름을 막지 않기) + 타이머 정리
  useEffect(() => {
    if (phase !== 'open' || stage !== 'crank') return undefined;
    const t = window.setTimeout(() => beginDispense(), 5000);
    return () => window.clearTimeout(t);
  }, [phase, stage]);
  useEffect(() => () => { timersRef.current.forEach((t) => window.clearTimeout(t)); }, []);

  if (sceneIds.length === 0) return null;

  const after = (ms: number, fn: () => void) => { timersRef.current.push(window.setTimeout(fn, ms)); };
  const playSfx = (text: string, size = 30) => setSfx({ text, size, key: Date.now() });

  function doClaim(): DropResult[] {
    const preferredLevel = sceneSentenceLevelForMode(loadSettings().mode);
    const safeDraws = Math.min(MAX_GACHA_DRAWS, Math.max(1, plannedDrawsRef.current));
    const res = claim(loadCollection(), sessionId, sceneIds, safeDraws, preferredLevel);
    saveCollection(res.collection);
    const r = res.results;
    setResults(r);
    onClaimed?.(r);
    return r;
  }
  function start() {
    const planned = Math.min(MAX_GACHA_DRAWS, Math.max(1, randomDrawCount ? randomGachaDrawCount() : (drawCount ?? box.draws)));
    plannedDrawsRef.current = planned;
    setCurrentDraws(planned);
    if (reduceMotion()) { doClaim(); setPhase('revealed'); return; }
    openedRef.current = false;
    dispenseRef.current = false;
    setTaps(0); setStage('crank'); setCapState('drop'); setSpinning(false); setSfx(null);
    setFlipped(new Set()); setResults([]); setVisibleCount(1); setSpotlightIndex(null); setBulkOpening(false); setDetailIndex(null); setRareBurst(null); setPhase('open');
  }
  // 크랭크 다 돌림 → 볼들이 빠르게 돌고 → 캡슐이 굴러떨어짐
  function beginDispense() {
    if (dispenseRef.current) return;
    dispenseRef.current = true;
    setSpinning(true);
    playSfx('コロコロ…', 22);
    after(900, () => {
      setSpinning(false);
      setStage('capsule');
      setCapState('drop');
      playSfx('ゴトンッ!', 26);
      after(850, () => setCapState('wobble'));
      after(2400, () => popCapsule()); // 안 눌러도 자동으로 빠캉
    });
  }
  // 캡슐 빠캉! → 카드 분출
  function popCapsule() {
    if (openedRef.current) return;
    openedRef.current = true;
    const r = doClaim();
    setCapState('pop');
    playSfx('パカッ‼', 40);
    after(560, () => {
      setStage('cards');
      setVisibleCount(r.length > 0 ? 1 : 0);
    });
  }
  function overlayTap() {
    if (stage === 'crank') {
      if (dispenseRef.current) return;
      const n = taps + 1;
      setTaps(n);
      playSfx('ガチャッ', 22);
      if (n >= TAPS) beginDispense();
    } else if (stage === 'capsule' && capState === 'wobble') {
      popCapsule();
    }
  }
  function flip(i: number) {
    if (flipped.has(i)) {
      setDetailIndex(i);
      return;
    }
    setFlipped((prev) => new Set(prev).add(i));
    if (isRareReveal(results[i]?.rarity)) {
      setRareBurst({ index: i, rarity: results[i].rarity, key: Date.now() });
      playSfx(results[i].rarity === 'diamond' ? 'DIAMOND!' : 'GOLD!', 38);
      after(1500, () => setRareBurst((cur) => (cur?.index === i ? null : cur)));
    }
  }
  function advanceCard(i: number) {
    setDetailIndex(null);
    if (i === visibleCount - 1 && visibleCount < results.length) setVisibleCount((n) => Math.min(results.length, n + 1));
  }
  function revealBulkRest() {
    setSpotlightIndex(null);
    setVisibleCount(results.length);
    window.setTimeout(() => {
      setBulkOpening(true);
      setFlipped(new Set(results.map((_, i) => i)));
      const rareIndex = results.findIndex((r) => isRareReveal(r.rarity));
      if (rareIndex >= 0) {
        setRareBurst({ index: rareIndex, rarity: results[rareIndex].rarity, key: Date.now() });
        after(1600, () => setRareBurst((cur) => (cur?.index === rareIndex ? null : cur)));
      }
      window.setTimeout(() => setBulkOpening(false), Math.min(5200, 760 + results.length * 36));
    }, 120);
  }
  function flipAll(e: React.MouseEvent) {
    e.stopPropagation();
    revealBulkRest();
  }

  return (
    <div className="ym-rise" style={{ marginTop: 22 }}>
      <p style={labelStyle}>{label}</p>

      {phase === 'closed' && (
        <button className="ym-press" onClick={start}
          style={{ width: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 18px 20px', borderRadius: 22, border: '1px solid var(--glass-border)', background: `radial-gradient(circle at 50% 38%, ${box.colors[1]}2e, transparent 46%), var(--glass-bg-strong)`, cursor: 'pointer', color: 'var(--ink)' }}>
          <GachaGlow color={box.colors[1]} />
          <GachaMachine grade={grade} taps={0} mini />
          <span style={{ fontWeight: 850, fontSize: 16 }}>{box.label} 가챠 돌리기</span>
          <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 750 }}>{closedDrawLabel}</span>
        </button>
      )}

      {phase === 'revealed' && (
        <div style={{ position: 'relative', overflow: 'hidden', padding: 18, borderRadius: 22, border: '1px solid var(--glass-border)', background: `radial-gradient(circle at 50% 18%, ${box.colors[1]}24, transparent 50%), var(--glass-bg-strong)` }}>
          <GachaGlow color={box.colors[1]} strong />
          <MascotBubble who="duo" mood="done" size={42} style={{ marginBottom: 14 }}>오늘 얻은 카드가 여행 도감에 들어갔어요.</MascotBubble>
          <RevealCards results={results} />
          <button className="ym-press" onClick={() => setDeck(true)}
            style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink)', fontWeight: 750, fontSize: 14, cursor: 'pointer' }}>
            내 도감 보기
          </button>
          {afterRevealLabel && (
            <button className="ym-press" onClick={onAfterReveal}
              style={{ width: '100%', marginTop: 9, padding: '12px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 850, fontSize: 14, cursor: 'pointer' }}>
              {afterRevealLabel}
            </button>
          )}
        </div>
      )}

      {phase === 'open' && typeof document !== 'undefined' && createPortal(
        <div onClick={overlayTap} className={`ym-gacha-stage ${stage === 'cards' ? 'is-burst' : ''}`}
          style={{ ['--gacha-color' as string]: box.colors[1], position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 'max(14px, env(safe-area-inset-top)) 18px max(14px, env(safe-area-inset-bottom))', background: 'radial-gradient(circle at 50% 34%, rgba(255,255,255,0.16), transparent 24%), rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <span className="ym-gacha-comic-bg" aria-hidden />
          {capState === 'pop' && stage !== 'crank' && <span className="ym-manga-lines" aria-hidden />}
          {stage === 'cards' && <BurstParticles color={box.colors[1]} />}
          {rareBurst && (
            <div key={rareBurst.key} className={`ym-gacha-rare-burst is-${rareBurst.rarity}`} style={{ ['--rarity-color' as string]: rarityMeta(rareBurst.rarity).color }} aria-hidden>
              <span>{rareBurst.rarity === 'diamond' ? 'DIAMOND' : 'GOLD'}</span>
              <strong>{rarityStars(rareBurst.rarity)} STAR CARD</strong>
            </div>
          )}
          {sfx && (
            <span key={sfx.key} className="ym-manga-sfx" aria-hidden style={{ fontSize: sfx.size, top: stage === 'crank' ? '30%' : '42%' }}>{sfx.text}</span>
          )}

          {stage === 'crank' ? (
            <>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="ym-glow" aria-hidden style={{ position: 'absolute', inset: -26, borderRadius: '50%', background: `radial-gradient(circle, ${box.colors[1]}66, ${box.colors[1]}22 44%, transparent 72%)` }} />
                <GachaMachine grade={grade} taps={taps} spinning={spinning} />
              </div>
              <p style={{ color: '#fff', fontWeight: 850, fontSize: 16, textShadow: '0 1px 8px rgba(0,0,0,.5)' }}>
                {spinning ? '캡슐이 굴러가는 중…' : '탭할수록 캡슐이 빨라져요!'}
              </p>
              <div style={{ display: 'flex', gap: 7 }}>
                {Array.from({ length: TAPS }, (_, k) => (
                  <span key={k} style={{ width: 13, height: 13, borderRadius: 99, border: '2.5px solid rgba(255,255,255,.7)', background: k < taps ? box.colors[1] : 'transparent', boxShadow: k < taps ? `0 0 12px ${box.colors[1]}` : 'none', transition: 'all .15s' }} />
                ))}
              </div>
              <span style={{ color: 'rgba(255,255,255,.76)', fontSize: 12, fontWeight: 800 }}>스핀 {taps}/{TAPS} · 기다리면 자동으로 나와요</span>
            </>
          ) : stage === 'capsule' ? (
            <>
              <Capsule grade={grade} state={capState} />
              <p style={{ color: '#fff', fontWeight: 850, fontSize: 16, textShadow: '0 1px 8px rgba(0,0,0,.5)' }}>
                {capState === 'wobble' ? '탭해서 캡슐 열기!' : '몇 장이 들어 있을까요?'}
              </p>
              {capState === 'wobble' && <span style={{ color: 'rgba(255,255,255,.78)', fontSize: 12, fontWeight: 800 }}>열기 전까지 카드 수는 비밀이에요</span>}
            </>
          ) : (
            <>
              {spotlightIndex !== null && results[spotlightIndex] && (
                <div className={`ym-gacha-spotlight is-${results[spotlightIndex].rarity}`} style={{ ['--rarity-color' as string]: rarityMeta(results[spotlightIndex].rarity).color }}>
                  <span className="ym-gacha-rays" aria-hidden style={{ position: 'absolute', width: 420, height: 420, color: rarityMeta(results[spotlightIndex].rarity).color, opacity: 0.72 }} />
                  <DrawCard item={results[spotlightIndex]} index={spotlightIndex} flipped={flipped.has(spotlightIndex)} active large onFlip={() => {}} />
                  <p style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 950, textShadow: '0 2px 14px rgba(0,0,0,.55)' }}>특별한 선물 카드!</p>
                </div>
              )}
              <div className="ym-gpn-spill" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#fff', fontWeight: 950, fontSize: 20, textShadow: '2px 2px 0 #20242f' }}>카드 {results.length}장 발견!</p>
                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,.72)', fontWeight: 750, fontSize: 12 }}>첫 탭은 뒤집기, 다시 탭하면 상세 보기예요</p>
              </div>
              {!bulkOpening && spotlightIndex === null && (
                <div className="ym-gacha-pile-zone ym-gpn-spill" style={{ position: 'relative', zIndex: 2, ['--spill-d' as string]: '.08s' }}>
                  <div className="ym-gacha-card-pile">
                    {results.slice(activeIndex + 1, Math.min(results.length, activeIndex + 5)).map((r, offset) => (
                      <span key={`pile:${activeIndex}:${offset}`} className="ym-gacha-pile-back" style={{ ['--pile-offset' as string]: offset + 1 }}>
                        <CardBack rarity={r.rarity} />
                      </span>
                    ))}
                    {activeResult && (
                      <DrawCard key={`active:${activeIndex}:${activeResult.sceneId}:${activeResult.rarity}:${flipped.has(activeIndex) ? 'on' : 'off'}`} item={activeResult} index={activeIndex} flipped={flipped.has(activeIndex)} active large onFlip={() => flip(activeIndex)} />
                    )}
                  </div>
                  {openedResults.length > 0 && (
                    <div className="ym-gacha-opened-stack" aria-label="앞서 뽑은 카드">
                      {openedResults.slice(-14).map((r, i) => (
                        <button key={`opened:${i}:${r.sceneId}:${r.rarity}`} className="ym-gacha-opened-stack-card" onClick={(e) => { e.stopPropagation(); setDetailIndex(results.indexOf(r)); }}>
                          <DeckCardFace sceneId={r.sceneId} rarity={r.rarity} size={154} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className={bulkOpening ? 'ym-gacha-draw-grid is-bulk-opening' : 'ym-gacha-draw-grid'} style={{ position: 'relative', zIndex: 2, display: bulkOpening ? 'grid' : 'none', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 112px))', gap: 12, justifyContent: 'center', alignItems: 'start', maxWidth: 720, width: '100%', maxHeight: 'min(62vh, 560px)', overflowY: 'auto', padding: '6px 4px 12px' }}>
                {visibleResults.map((r, i) => <DrawCard key={`${i}:${r.sceneId}:${r.rarity}`} item={r} index={i} flipped={flipped.has(i)} active onFlip={() => flip(i)} />)}
              </div>
              <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 2 }}>
                {!allFlipped && spotlightIndex === null && <button onClick={flipAll} style={overlayBtn}>한번에 보기</button>}
                {allFlipped && !bulkOpening && <button onClick={(e) => { e.stopPropagation(); setPhase('revealed'); }} className="ym-card-in" style={overlayBtn}>오늘 얻은 카드 보기</button>}
              </div>
              {detailIndex !== null && results[detailIndex] && (
                <CardDetailOverlay
                  item={results[detailIndex]}
                  canAdvance={detailIndex === visibleCount - 1 && visibleCount < results.length}
                  onClose={() => setDetailIndex(null)}
                  onAdvance={() => advanceCard(detailIndex)}
                />
              )}
            </>
          )}
        </div>,
        document.body,
      )}

      {deck && <DeckModal onClose={() => setDeck(false)} />}
    </div>
  );
}

const overlayBtn: React.CSSProperties = {
  padding: '12px 22px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)',
  fontWeight: 900, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 22px rgba(185,56,46,0.4)',
};

function GachaGlow({ color, strong = false }: { color: string; strong?: boolean }) {
  return (
    <span aria-hidden className="ym-glow" style={{
      position: 'absolute',
      left: strong ? 'calc(50% - 115px)' : 'calc(50% - 85px)',
      top: strong ? -44 : -24,
      width: strong ? 230 : 170,
      height: strong ? 230 : 170,
      borderRadius: 999,
      background: `radial-gradient(circle, ${color}${strong ? '66' : '44'} 0%, ${color}1f 40%, transparent 72%)`,
      filter: 'blur(2px)',
      pointerEvents: 'none',
    }} />
  );
}

function BurstParticles({ color }: { color: string }) {
  return (
    <span aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <i key={i} className="ym-gacha-spark" style={{
          left: `${8 + ((i * 19) % 84)}%`,
          top: `${14 + ((i * 11) % 54)}%`,
          width: i % 3 === 0 ? 8 : 5,
          height: i % 3 === 0 ? 8 : 5,
          borderRadius: i % 2 === 0 ? 999 : 2,
          background: i % 4 === 0 ? 'rgba(255,255,255,0.96)' : color,
          boxShadow: `0 0 14px ${color}`,
          animationDelay: `${0.2 + i * 0.045}s`,
        }} />
      ))}
    </span>
  );
}

function GiftDialogueRow({ sceneId, rarity }: { sceneId: string; rarity: Rarity }) {
  const item = gachaItemForPlace(placeOf(sceneId), rarity);
  const place = placeOf(sceneId);
  const dialogue = giftDialogue(place, item.title, rarity);
  const speakText = dialogue.lines.map((line) => line.ja).join('。');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 13px', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)' }}>
      <DeckCardFace sceneId={sceneId} rarity={rarity} size={76} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span lang="ja" style={{ display: 'block', fontSize: 15, color: rarityMeta(rarity).color, fontWeight: 950, lineHeight: 1.25 }}>{item.jaTitle ?? item.title}</span>
        <span style={{ display: 'block', marginTop: 3, fontSize: 12, color: 'var(--ink-soft)', fontWeight: 750, lineHeight: 1.35 }}>{itemKoreanDescription(place, item.title, rarity)}</span>
        <span style={{ display: 'block', marginTop: 5, fontSize: 11, color: 'var(--ink-faint)', fontWeight: 850 }}>{dialogue.title}</span>
        {dialogue.lines.map((line, i) => (
          <span key={i} style={{ display: 'block', marginTop: i === 0 ? 5 : 4 }}>
            <span lang="ja" style={{ display: 'block', fontSize: 14.5, fontWeight: 850, lineHeight: 1.35 }}>{line.ja}</span>
            <span style={{ display: 'block', marginTop: 2, fontSize: 11.5, color: 'var(--ink-soft)', fontWeight: 650, lineHeight: 1.35 }}>{line.ko}</span>
          </span>
        ))}
      </span>
      <button className="ym-press" onClick={() => speak(speakText)} disabled={!ttsSupported()} aria-label="듣기"
        style={{ flex: '0 0 auto', width: 38, height: 38, borderRadius: 11, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="listen" size={18} />
      </button>
    </div>
  );
}

function giftDialogue(place: string, itemTitle: string, rarity: Rarity): { title: string; lines: { ja: string; ko: string }[] } {
  const koItem = `${place}의 ${itemTitle}`;
  const map: Record<Rarity, { title: string; lines: { ja: string; ko: string }[] }> = {
    basic: {
      title: '간단한 한마디',
      lines: [
        { ja: 'これ、ください', ko: `${koItem}, 이거 주세요.` },
      ],
    },
    bronze: {
      title: '조금 더 자연스럽게',
      lines: [
        { ja: 'こちらを一つ、いただけますか', ko: `${koItem} 하나 받을 수 있을까요?` },
        { ja: '袋は小さいもので大丈夫です', ko: '봉투는 작은 것으로 괜찮아요.' },
      ],
    },
    silver: {
      title: '상황을 덧붙이는 대화',
      lines: [
        { ja: 'おすすめの組み合わせで用意できますか', ko: '추천 조합으로 준비할 수 있나요?' },
        { ja: '初めてなので、食べ方も説明してもらえますか', ko: '처음이라 먹는 방법도 설명받을 수 있을까요?' },
      ],
    },
    gold: {
      title: '정중하고 구체적인 요청',
      lines: [
        { ja: '旅の記念にしたいので、特別なものを選びたいです', ko: '여행 기념으로 삼고 싶어서 특별한 것을 고르고 싶어요.' },
        { ja: '持ち帰りやすい形で包めますでしょうか', ko: '가지고 가기 편한 형태로 포장 가능할까요?' },
      ],
    },
    diamond: {
      title: '최종 선물을 암시하는 긴 대화',
      lines: [
        { ja: '大切な人への贈り物として、今日いちばん印象に残る品を探しています', ko: '소중한 사람에게 줄 선물로 오늘 가장 기억에 남을 물건을 찾고 있어요.' },
        { ja: '可能でしたら、限定仕様や背景の物語も添えてくださいますか', ko: '가능하다면 한정 사양이나 배경 이야기도 함께 받을 수 있을까요?' },
      ],
    },
  };
  return map[rarity];
}

function finalGiftProgress(collection: Collection): { have: number; total: number; ready: boolean } {
  const have = SCENES.filter((m) => totalItems(collection.cards[m.id]) > 0).length;
  return { have, total: SCENES.length, ready: have >= SCENES.length };
}

const RANKS = ['이등병', '일병', '상병', '병장', '하사', '중사', '상사', '원사', '소위', '중위', '대위', '소령', '중령', '대령', '준장', '소장', '중장', '대장', '원수'];
function storageSizeKb(): number {
  if (typeof window === 'undefined') return 0;
  let n = 0;
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i) ?? '';
    if (!k.startsWith('yangmung:')) continue;
    n += k.length + (window.localStorage.getItem(k)?.length ?? 0);
  }
  return Math.round((n * 2) / 1024);
}
function useLearningStats(collection: Collection) {
  return useMemo(() => {
    const progress = loadProgress();
    const attempts = Object.values(progress).reduce((sum, p) => sum + p.attempts, 0);
    const correct = Object.values(progress).reduce((sum, p) => sum + p.correct, 0);
    const dayCounts = Object.values(progress).reduce<Record<string, number>>((acc, p) => {
      const d = p.lastSeenAt?.slice(0, 10);
      if (d) acc[d] = (acc[d] ?? 0) + p.attempts;
      return acc;
    }, {});
    const dates = Object.keys(dayCounts).sort();
    const rankScore = attempts + totalItemsAll(collection) * 4 + honorTrophyCount(collection) * 140;
    const rankIndex = Math.min(RANKS.length - 1, Math.floor(rankScore / 120));
    const nextAt = (rankIndex + 1) * 120;
    return { attempts, correct, dates, dayCounts, rank: RANKS[rankIndex], rankScore, nextAt, storageKb: storageSizeKb() };
  }, [collection]);
}
function totalItemsAll(c: Collection): number {
  return Object.values(c.cards).reduce((sum, card) => sum + totalItems(card), 0);
}

export function DeckBrowser() {
  const [collection, setCollection] = useState<Collection>(() => loadCollection());
  const [selected, setSelected] = useState<string>();
  const [merging, setMerging] = useState<string | null>(null);
  const refresh = (next: Collection) => { saveCollection(next); setCollection(next); };
  const stats = useLearningStats(collection);
  function mergeWithFx(sceneId: string, rarity: Rarity) {
    const key = `${sceneId}:${rarity}`;
    setMerging(key);
    refresh(mergeScene(collection, sceneId, rarity));
    window.setTimeout(() => setMerging((cur) => (cur === key ? null : cur)), 900);
  }

  if (selected) {
    const card = collection.cards[selected];
    const items = itemsOf(card);
    const ownedRarities = RARITIES.filter((r) => items[r.key] > 0).map((r) => r.key);
    return (
      <>
        <button className="ym-press" onClick={() => setSelected(undefined)} style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, padding: '4px 0 12px', cursor: 'pointer' }}>← 도감으로</button>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>
          {placeOf(selected)}에서 모은 선물 카드예요. 카드는 학습 해금이 아니라 여행 보상으로 쌓입니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 14 }}>
          {RARITIES.map((r) => {
            const count = items[r.key];
            const item = gachaItemForPlace(placeOf(selected), r.key);
            return (
              <div key={r.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 11, borderRadius: 16, border: `1px solid ${count ? r.color : 'var(--glass-border)'}`, background: count ? 'var(--glass-bg-strong)' : 'var(--glass-bg)', opacity: count ? 1 : 0.48 }}>
                <DeckCardFace sceneId={selected} rarity={r.key} size={94} />
                <span lang="ja" style={{ fontSize: 12, fontWeight: 950, color: r.color, textAlign: 'center' }}>{item.jaTitle ?? item.title}</span>
                <span style={{ fontSize: 11, fontWeight: 850, color: 'var(--ink-soft)' }}>x{count}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: 14, borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', marginBottom: 12 }}>
          <strong style={{ display: 'block', color: 'var(--ink)', fontSize: 14 }}>최종 미션 카드</strong>
          <span style={{ display: 'block', marginTop: 5, color: 'var(--ink-soft)', fontSize: 12.5, lineHeight: 1.5, fontWeight: 700 }}>
            모든 여행 선물을 모으면 특별한 최종 카드가 열립니다. 관리자랑 데이트하기, 일본여행 같이 가기 같은 큰 선물이 숨어 있어요.
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {ownedRarities.length
            ? ownedRarities.map((r) => <GiftDialogueRow key={r} sceneId={selected} rarity={r} />)
            : <p style={{ margin: 0, color: 'var(--ink-faint)', fontSize: 13, fontWeight: 700 }}>아직 이 장면의 선물 카드가 없어요.</p>}
        </div>
      </>
    );
  }
  const finalGift = finalGiftProgress(collection);

  return (
    <>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 650 }}>
        모은 장면 <strong style={{ color: 'var(--ink)' }}>{ownedCount(collection)}</strong>/{SCENES.length}
        {' · '}특별 카드 <strong style={{ color: '#5bc7e0' }}>{diamondCount(collection)}</strong>
        {' · '}명예 트로피 <strong style={{ color: 'var(--accent)' }}>{honorTrophyCount(collection)}</strong>
        {' · '}최종 선물 <strong style={{ color: 'var(--accent)' }}>{finalGift.have}</strong>/{finalGift.total}
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.5 }}>
        각 장면에서 같은 선물을 모으면 더 특별한 선물로 교환할 수 있어요. 마지막 선물은 명예 트로피로 이어집니다.
      </p>
      <div style={{ margin: '0 0 14px', padding: 14, borderRadius: 16, border: `1px solid ${finalGift.ready ? 'var(--accent)' : 'var(--glass-border)'}`, background: finalGift.ready ? 'var(--accent-soft)' : 'var(--glass-bg-strong)', color: 'var(--ink)' }}>
        <strong style={{ display: 'block', fontSize: 15 }}>비밀 최종 미션 카드</strong>
        <span style={{ display: 'block', marginTop: 5, fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700, lineHeight: 1.5 }}>
          모든 장면 선물을 모으면 큰 선물이 열려요. 관리자랑 데이트하기, 일본여행 같이 가기 같은 최종 보상을 암시하는 카드입니다.
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginBottom: 14 }}>
        <StatTile label="나의 계급" value={stats.rank} sub={`${stats.rankScore}/${stats.nextAt}`} />
        <StatTile label="학습일" value={`${stats.dates.length}일`} sub={stats.dates.slice(-7).join(' · ') || '아직 없음'} />
        <StatTile label="저장 용량" value={`${stats.storageKb}KB`} sub={`정답 ${stats.correct}/${stats.attempts}`} />
      </div>
      <LearningHeatmap dayCounts={stats.dayCounts} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
        {SCENES.map((m) => {
          const card = collection.cards[m.id];
          const owned = totalItems(card) > 0;
          const items = itemsOf(card);
          const rarity = bestRarity(card);
          const sv = sceneVisualByMission(m.id);
          if (!owned) {
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px', borderRadius: 16, border: '1px dashed var(--glass-border)', opacity: 0.5 }}>
                <span style={{ width: 56, height: 56, borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg)', color: 'var(--ink-faint)' }}><Icon name={sv.icon} size={26} /></span>
                <span style={{ fontSize: 12, fontWeight: 750, color: 'var(--ink-faint)' }}>{placeOf(m.id)}</span>
                <span style={{ fontSize: 16 }}>🔒</span>
              </div>
            );
          }
          return (
            <div key={m.id} className={merging?.startsWith(`${m.id}:`) ? 'ym-gacha-merge-host is-merging' : 'ym-gacha-merge-host'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 9px', borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
              {merging?.startsWith(`${m.id}:`) && <span className="ym-gacha-merge-burst" aria-hidden />}
              <button className="ym-press" onClick={() => setSelected(m.id)} style={{ border: 0, background: 'transparent', color: 'var(--ink)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 0 }}>
                <DeckCardFace sceneId={m.id} rarity={rarity} size={82} />
                <span style={{ fontSize: 12, fontWeight: 850 }}>{placeOf(m.id)}</span>
              </button>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                {RARITIES.map((r) => {
                  const item = gachaItemForPlace(m.place, r.key);
                  return <span key={r.key} style={{ fontSize: 10.5, fontWeight: 850, color: r.color, border: `1px solid ${r.color}`, borderRadius: 999, padding: '2px 5px' }}>{item.title} {items[r.key]}</span>;
                })}
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
                {RARITIES.map((r) => {
                  const need = MERGE_NEED[r.key];
                  const can = items[r.key] >= need;
                  const next = NEXT_RARITY[r.key] ? gachaItemForPlace(m.place, NEXT_RARITY[r.key]!).title : '트로피';
                  return (
                    <button key={r.key} className={can ? 'ym-press ym-gacha-merge-btn' : 'ym-press'} disabled={!can} onClick={() => mergeWithFx(m.id, r.key)}
                      style={{ padding: '5px 7px', borderRadius: 8, border: '1px solid var(--glass-border)', background: can ? 'var(--accent-soft)' : 'var(--glass-bg)', color: can ? 'var(--accent)' : 'var(--ink-faint)', fontSize: 10.5, fontWeight: 850, cursor: can ? 'pointer' : 'default', opacity: can ? 1 : 0.55 }}>
                      {need}장→{next}
                    </button>
                  );
                })}
              </div>
              <span style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 750 }}>선물 카드 {totalItems(card)}장</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function DeckModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="내 여행 도감" onClose={onClose}>
      <DeckBrowser />
    </Modal>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', borderRadius: 14, padding: '10px 9px', minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: 10.5, fontWeight: 850, color: 'var(--ink-faint)' }}>{label}</span>
      <strong style={{ display: 'block', marginTop: 3, fontSize: 15, color: 'var(--ink)' }}>{value}</strong>
      <span style={{ display: 'block', marginTop: 3, fontSize: 10.5, color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</span>
    </div>
  );
}

function LearningHeatmap({ dayCounts }: { dayCounts: Record<string, number> }) {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (27 - i));
      const key = d.toISOString().slice(0, 10);
      const n = dayCounts[key] ?? 0;
      return { key, n };
    });
  }, [dayCounts]);
  return (
    <div style={{ margin: '0 0 14px', padding: 12, borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 9 }}>
        <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--ink)' }}>최근 4주 학습 진도</span>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-faint)' }}>진할수록 많이 복습</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, minmax(0, 1fr))', gap: 4 }}>
        {days.map((d) => {
          const alpha = d.n >= 12 ? 0.95 : d.n >= 6 ? 0.72 : d.n >= 2 ? 0.48 : d.n > 0 ? 0.28 : 0;
          return (
            <span key={d.key} title={`${d.key} · ${d.n}회`} aria-label={`${d.key} ${d.n}회`}
              style={{ aspectRatio: '1', borderRadius: 4, background: alpha ? `rgba(185,56,46,${alpha})` : 'rgba(127,127,127,.14)', boxShadow: alpha >= 0.72 ? '0 0 10px rgba(185,56,46,.28)' : undefined }} />
          );
        })}
      </div>
    </div>
  );
}

export function DeckButton({ style }: { style?: React.CSSProperties }) {
  const [open, setOpen] = useState(false);
  const c = loadCollection();
  return (
    <>
      <button className="ym-press" onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', borderRadius: 999, padding: '9px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer', ...style }}>
        🎁 도감 {ownedCount(c)}/{SCENES.length}
      </button>
      {open && <DeckModal onClose={() => setOpen(false)} />}
    </>
  );
}
