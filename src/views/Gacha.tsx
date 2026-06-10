// 가챠 카드 도감 — 세션별 아이템 카드 수집 + 병합.
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CONTENT } from '../content';
import { SCENE_SENTENCES } from '../content/sceneSentences';
import {
  BOX, DRAW_COUNT, MERGE_NEED, NEXT_RARITY, RARITIES,
  bestRarity, claim, diamondCount, honorTrophyCount, itemsOf, loadCollection, mergeScene,
  ownedCount, rarityMeta, rarityToTier, saveCollection, sentenceCount, totalItems,
  type BoxGrade, type Collection, type DropResult, type Rarity,
} from '../learn/collection';
import { loadProgress } from '../learn/progress';
import { Icon } from '../ui/Icon';
import { speak, ttsSupported } from '../tts';
import { Modal } from './Modal';
import { sceneVisualByMission } from './scene';
import { MascotBubble } from './mascot';

const SCENES = CONTENT.missions.filter((m) => m.id !== 'C0');
const placeOf = (id: string) => CONTENT.missions.find((m) => m.id === id)?.place ?? id;

function DeckCardFace({ sceneId, rarity, size = 56 }: { sceneId: string; rarity: Rarity; size?: number }) {
  const sv = sceneVisualByMission(sceneId);
  const meta = rarityMeta(rarity);
  const diamond = rarity === 'diamond';
  const shine = diamond
    ? 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(91,199,224,0.32), rgba(226,101,90,0.2), rgba(255,255,255,0.68))'
    : `linear-gradient(145deg, rgba(255,255,255,0.52), ${meta.color}28 46%, rgba(0,0,0,0.1))`;
  return (
    <span className="ym-game-item-face" data-tier={rarityToTier(rarity)} style={{
      ['--tier-color' as string]: meta.color,
      ['--scene-accent' as string]: sv.accent,
      width: size, height: size, flex: `0 0 ${size}px`, borderRadius: Math.round(size * 0.27),
      position: 'relative', overflow: 'hidden',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: sv.accent,
      background: shine,
      border: `${Math.max(2, Math.round(size * 0.045))}px solid ${meta.color}`,
      boxShadow: diamond ? `0 0 20px ${meta.color}aa, inset 0 1px 0 rgba(255,255,255,0.8)` : `0 8px 18px ${meta.color}33, inset 0 1px 0 rgba(255,255,255,0.62)`,
    }}>
      <span aria-hidden style={{ position: 'absolute', inset: '13%', borderRadius: Math.round(size * 0.18), background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)' }} />
      <span aria-hidden style={{ position: 'absolute', top: '-35%', left: '-60%', width: '55%', height: '160%', transform: 'rotate(28deg)', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.56), transparent)' }} />
      <Icon name={sv.icon} size={Math.round(size * 0.48)} style={{ position: 'relative', filter: diamond ? `drop-shadow(0 0 8px ${meta.color})` : undefined }} />
      <span aria-hidden className="ym-game-item-star" style={{ right: Math.round(size * 0.12), top: Math.round(size * 0.09), fontSize: Math.max(9, Math.round(size * 0.17)) }}>✦</span>
    </span>
  );
}

function TierRibbon({ rarity }: { rarity: Rarity }) {
  const meta = rarityMeta(rarity);
  return <span style={{ fontSize: 10, fontWeight: 850, letterSpacing: '0.04em', color: meta.color, border: `1.5px solid ${meta.color}`, borderRadius: 6, padding: '1px 6px' }}>{meta.label}</span>;
}

function BoxArt({ grade, size = 64, className, open = false }: { grade: BoxGrade; size?: number; className?: string; open?: boolean }) {
  const [failed, setFailed] = useState(false);
  const box = BOX[grade];
  if (failed) {
    return <span className={className} style={{ width: size, height: size, borderRadius: Math.round(size * 0.28), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.5), background: `linear-gradient(160deg, ${box.colors[0]}, ${box.colors[1]})`, boxShadow: `0 10px 26px ${box.colors[0]}66` }}>✦</span>;
  }
  return (
    <span className={`ym-yumebox ${open ? 'is-open' : 'is-closed'} ${className ?? ''}`} style={{ ['--box-grade' as string]: box.colors[1], width: size, height: size }}>
      <img src={`/gacha/box/${open ? 'yumebox-manga' : 'yumebox-closed-manga'}.webp`} alt="" aria-hidden width={size} height={size} onError={() => setFailed(true)} />
    </span>
  );
}

function CardBack({ rarity = 'basic', size = 82 }: { rarity?: Rarity; size?: number }) {
  const meta = rarityMeta(rarity);
  return (
    <span className={`ym-gacha-card-back is-${rarity}`} style={{
      ['--rarity-color' as string]: meta.color,
      width: size, height: Math.round(size * 1.28), borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 950, fontSize: 20,
    }}>?</span>
  );
}

function DrawCard({ item, flipped, onFlip, index }: { item: DropResult; flipped: boolean; onFlip: () => void; index: number }) {
  const meta = rarityMeta(item.rarity);
  return (
    <button
      className={`ym-gacha-draw-card ${flipped ? `is-flipped is-${item.rarity}` : 'ym-press'}`}
      onClick={(e) => { e.stopPropagation(); onFlip(); }}
      disabled={flipped}
      style={{
        ['--rarity-color' as string]: meta.color,
        animationDelay: flipped ? `${index * 0.035}s` : undefined,
        width: 88, minHeight: 132, border: 0, background: 'transparent', color: '#fff', cursor: flipped ? 'default' : 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: 0,
      }}
    >
      {flipped ? <DeckCardFace sceneId={item.sceneId} rarity={item.rarity} size={76} /> : <CardBack rarity={item.rarity} />}
      {flipped && (
        <>
          <span style={{ fontSize: 11, fontWeight: 900, color: meta.color }}>{meta.label}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.84)', maxWidth: 86, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{placeOf(item.sceneId)}</span>
        </>
      )}
    </button>
  );
}

function RevealCards({ results, animate }: { results: DropResult[]; animate?: boolean }) {
  const grouped = groupResults(results);
  return (
    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
      {grouped.map((r, i) => (
        <div key={`${r.sceneId}:${r.rarity}`} className={animate ? 'ym-card-in' : undefined} style={{ animationDelay: animate ? `${0.3 + i * 0.08}s` : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 86, position: 'relative', zIndex: 2 }}>
          <DeckCardFace sceneId={r.sceneId} rarity={r.rarity} size={animate ? 72 : 58} />
          <span style={{ fontSize: 13, fontWeight: 850 }}>{placeOf(r.sceneId)}</span>
          <TierRibbon rarity={r.rarity} />
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

export function GachaBox({ sessionId, sceneIds, grade = 'wood' }: { sessionId: number; sceneIds: string[]; grade?: BoxGrade }) {
  const [phase, setPhase] = useState<'closed' | 'open' | 'revealed'>('closed');
  const [results, setResults] = useState<DropResult[]>([]);
  const [taps, setTaps] = useState(0);
  const [burst, setBurst] = useState(false);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState(1);
  const [deck, setDeck] = useState(false);
  const openedRef = useRef(false);
  const box = BOX[grade];
  const TAPS = 10;
  const allFlipped = results.length > 0 && flipped.size >= results.length;
  const visibleResults = results.slice(0, visibleCount);
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 850, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' };

  useEffect(() => {
    if (phase !== 'open' || burst) return undefined;
    const t = window.setTimeout(() => openBox(), 5000);
    return () => window.clearTimeout(t);
  }, [phase, burst]);

  if (sceneIds.length === 0) return null;

  function doClaim(): DropResult[] {
    const res = claim(loadCollection(), sessionId, sceneIds, box.draws);
    saveCollection(res.collection);
    let r = res.results;
    if (r.length === 0) r = [];
    setResults(r);
    return r;
  }
  function start() {
    if (reduceMotion()) { doClaim(); setPhase('revealed'); return; }
    openedRef.current = false;
    setTaps(0); setBurst(false); setFlipped(new Set()); setResults([]); setVisibleCount(1); setPhase('open');
  }
  function openBox() {
    if (openedRef.current) return;
    openedRef.current = true;
    const r = doClaim();
    setVisibleCount(r.length > 0 ? 1 : 0);
    setBurst(true);
  }
  function overlayTap() {
    if (!burst) {
      const n = taps + 1;
      setTaps(n);
      if (n >= TAPS) openBox();
    }
  }
  function flip(i: number) {
    setFlipped((prev) => new Set(prev).add(i));
    if (i === visibleCount - 1 && visibleCount < results.length) {
      window.setTimeout(() => setVisibleCount((n) => Math.min(results.length, n + 1)), 260);
    }
  }
  function flipAll(e: React.MouseEvent) {
    e.stopPropagation();
    setVisibleCount(results.length);
    window.setTimeout(() => setFlipped(new Set(results.map((_, i) => i))), 80);
  }

  return (
    <div className="ym-rise" style={{ marginTop: 22 }}>
      <p style={labelStyle}>오늘의 가챠</p>

      {phase === 'closed' && (
        <button className="ym-press" onClick={start}
          style={{ width: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '18px 20px 20px', borderRadius: 22, border: '1px solid var(--glass-border)', background: `radial-gradient(circle at 50% 26%, ${box.colors[1]}2e, transparent 42%), var(--glass-bg-strong)`, cursor: 'pointer', color: 'var(--ink)' }}>
          <GachaGlow color={box.colors[1]} />
          <BoxArt grade={grade} size={112} className="ym-listening" />
          <span style={{ fontWeight: 850, fontSize: 16 }}>{box.label} 열기</span>
          <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 750 }}>카드 {DRAW_COUNT}장 · 기본/동/은/금/다이아</span>
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
        </div>
      )}

      {phase === 'open' && typeof document !== 'undefined' && createPortal(
        <div onClick={overlayTap} className={`ym-gacha-stage ${burst ? 'is-burst' : ''}`}
          style={{ ['--gacha-color' as string]: box.colors[1], position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 18, background: 'radial-gradient(circle at 50% 34%, rgba(255,255,255,0.16), transparent 24%), rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <span className="ym-gacha-runes" aria-hidden />
          {burst && <span className="ym-gacha-shockwave" aria-hidden />}
          {burst && <span className="ym-gacha-rays" aria-hidden style={{ position: 'absolute', width: 360, height: 360, color: box.colors[1], opacity: 0.55 }} />}
          {burst && <BurstParticles color={box.colors[1]} />}

          {!burst ? (
            <>
              <div style={{ position: 'relative', width: 220, height: 178, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="ym-glow" aria-hidden style={{ position: 'absolute', inset: -18, borderRadius: '50%', background: `radial-gradient(circle, ${box.colors[1]}aa, ${box.colors[1]}33 40%, transparent 70%)` }} />
                <div key={taps} className={taps > 0 ? 'ym-gacha-box-hit' : undefined} style={{ transform: `scale(${1 + taps * 0.08})`, transition: 'transform .12s' }}>
                  <BoxArt grade={grade} size={150} />
                </div>
              </div>
              <p style={{ color: '#fff', fontWeight: 850, fontSize: 16, textShadow: '0 1px 8px rgba(0,0,0,.5)' }}>5초 안에 10번 두드리면 바로 열려요</p>
              <div style={{ width: 190, height: 12, borderRadius: 999, overflow: 'hidden', background: 'rgba(255,255,255,.24)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.2)' }}>
                <span style={{ display: 'block', height: '100%', width: `${Math.min(100, (taps / TAPS) * 100)}%`, background: `linear-gradient(90deg, #fff, ${box.colors[1]})`, boxShadow: `0 0 18px ${box.colors[1]}`, transition: 'width .12s' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,.76)', fontSize: 12, fontWeight: 800 }}>{taps}/{TAPS} HIT · 기다리면 자동 개봉</span>
            </>
          ) : (
            <>
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                <BoxArt grade={grade} size={74} open />
                <div>
                  <p style={{ margin: 0, color: '#fff', fontWeight: 900, fontSize: 18 }}>카드 {DRAW_COUNT}장 획득</p>
                  <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,.72)', fontWeight: 750, fontSize: 12 }}>하나씩 뒤집거나 한 번에 공개하세요</p>
                </div>
              </div>
              <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(5, minmax(62px, 88px))', gap: 10, justifyContent: 'center', maxWidth: 520, width: '100%' }}>
                {visibleResults.map((r, i) => <DrawCard key={`${i}:${r.sceneId}:${r.rarity}`} item={r} index={i} flipped={flipped.has(i)} onFlip={() => flip(i)} />)}
              </div>
              <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 2 }}>
                {!allFlipped && <button onClick={flipAll} style={overlayBtn}>한번에 보기</button>}
                {allFlipped && <button onClick={(e) => { e.stopPropagation(); setPhase('revealed'); }} className="ym-card-in" style={overlayBtn}>오늘 얻은 카드 보기</button>}
              </div>
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

function DeckSentenceRow({ ja, korean }: { ja: string; korean: string }) {
  const [shadowed, setShadowed] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 13px', borderRadius: 14, border: `1px solid ${shadowed ? 'var(--ok)' : 'var(--glass-border)'}`, background: shadowed ? 'var(--ok-soft)' : 'var(--glass-bg-strong)', color: 'var(--ink)' }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span lang="ja" style={{ display: 'block', fontSize: 16, fontWeight: 850 }}>{ja}</span>
        <span style={{ display: 'block', marginTop: 3, fontSize: 12, color: 'var(--ink-soft)', fontWeight: 650 }}>{korean}</span>
      </span>
      <button className="ym-press" onClick={() => speak(ja)} disabled={!ttsSupported()} aria-label="듣기"
        style={{ flex: '0 0 auto', width: 38, height: 38, borderRadius: 11, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="listen" size={18} />
      </button>
      <button className="ym-press" onClick={() => { speak(ja); setShadowed(true); }} disabled={!ttsSupported()}
        style={{ flex: '0 0 auto', padding: '0 12px', height: 38, borderRadius: 11, border: `1px solid ${shadowed ? 'var(--ok)' : 'var(--accent)'}`, background: shadowed ? 'var(--ok-soft)' : 'var(--accent-soft)', color: shadowed ? 'var(--ok)' : 'var(--accent)', fontWeight: 800, fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
        <Icon name={shadowed ? 'check' : 'speak'} size={15} /> {shadowed ? '잘했어요' : '따라 말하기'}
      </button>
    </div>
  );
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
    const rankScore = attempts + totalItemsAll(collection) * 3 + sentenceCount(collection) * 2 + honorTrophyCount(collection) * 100;
    const rankIndex = Math.min(RANKS.length - 1, Math.floor(rankScore / 120));
    const nextAt = (rankIndex + 1) * 120;
    return { attempts, correct, dates, dayCounts, rank: RANKS[rankIndex], rankScore, nextAt, storageKb: storageSizeKb() };
  }, [collection]);
}
function totalItemsAll(c: Collection): number {
  return Object.values(c.cards).reduce((sum, card) => sum + totalItems(card), 0);
}

export function DeckModal({ onClose }: { onClose: () => void }) {
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
    const ownedIds = collection.sentences[selected] ?? [];
    const rows = SCENE_SENTENCES[selected as keyof typeof SCENE_SENTENCES].filter((row) => ownedIds.includes(row.id));
    return (
      <Modal title={`${placeOf(selected)} 표현`} onClose={onClose}>
        <button className="ym-press" onClick={() => setSelected(undefined)} style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, padding: '4px 0 12px', cursor: 'pointer' }}>← 도감으로</button>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>모은 표현 {rows.length}/30</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {rows.map((row) => <DeckSentenceRow key={row.id} ja={row.kanji ?? row.kana} korean={row.korean} />)}
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="내 여행 도감" onClose={onClose}>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 650 }}>
        모은 장면 <strong style={{ color: 'var(--ink)' }}>{ownedCount(collection)}</strong>/{SCENES.length}
        {' · '}다이아 <strong style={{ color: '#5bc7e0' }}>{diamondCount(collection)}</strong>
        {' · '}명예 트로피 <strong style={{ color: 'var(--accent)' }}>{honorTrophyCount(collection)}</strong>
        {' · '}표현 <strong style={{ color: 'var(--accent)' }}>{sentenceCount(collection)}</strong>/390
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.5 }}>
        각 장면 수업에서만 그 장면 카드가 나와요. 기본 30→동 1, 동 30→은 1, 은 20→금 1, 금 10→다이아 1, 다이아 100→명예 트로피 1.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginBottom: 14 }}>
        <StatTile label="나의 계급" value={stats.rank} sub={`${stats.rankScore}/${stats.nextAt}`} />
        <StatTile label="학습일" value={`${stats.dates.length}일`} sub={stats.dates.slice(-7).join(' · ') || '아직 없음'} />
        <StatTile label="저장 용량" value={`${stats.storageKb}KB`} sub={`정답 ${stats.correct}/${stats.attempts}`} />
      </div>
      <LearningHeatmap dayCounts={stats.dayCounts} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
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
            <div key={m.id} className={merging?.startsWith(`${m.id}:`) ? 'ym-gacha-merge-host is-merging' : 'ym-gacha-merge-host'} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '12px 8px', borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
              {merging?.startsWith(`${m.id}:`) && <span className="ym-gacha-merge-burst" aria-hidden />}
              <button className="ym-press" onClick={() => setSelected(m.id)} style={{ border: 0, background: 'transparent', color: 'var(--ink)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 0 }}>
                <DeckCardFace sceneId={m.id} rarity={rarity} />
                <span style={{ fontSize: 12, fontWeight: 850 }}>{placeOf(m.id)}</span>
              </button>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                {RARITIES.map((r) => <span key={r.key} style={{ fontSize: 10.5, fontWeight: 850, color: r.color, border: `1px solid ${r.color}`, borderRadius: 999, padding: '2px 5px' }}>{r.label} {items[r.key]}</span>)}
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
                {RARITIES.map((r) => {
                  const need = MERGE_NEED[r.key];
                  const can = items[r.key] >= need;
                  const next = NEXT_RARITY[r.key] ? rarityMeta(NEXT_RARITY[r.key]!).label : '트로피';
                  return (
                    <button key={r.key} className={can ? 'ym-press ym-gacha-merge-btn' : 'ym-press'} disabled={!can} onClick={() => mergeWithFx(m.id, r.key)}
                      style={{ padding: '5px 7px', borderRadius: 8, border: '1px solid var(--glass-border)', background: can ? 'var(--accent-soft)' : 'var(--glass-bg)', color: can ? 'var(--accent)' : 'var(--ink-faint)', fontSize: 10.5, fontWeight: 850, cursor: can ? 'pointer' : 'default', opacity: can ? 1 : 0.55 }}>
                      {r.label} {need}→{next}
                    </button>
                  );
                })}
              </div>
              <span style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 750 }}>
                {SCENE_SENTENCES[m.id].length > 0 ? `표현 ${collection.sentences[m.id]?.length ?? 0}/${SCENE_SENTENCES[m.id].length}` : '표현 카드 준비 중'}
              </span>
            </div>
          );
        })}
      </div>
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
