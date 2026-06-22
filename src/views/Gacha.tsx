// 가챠 카드 도감 — 세션별 아이템 카드 수집 + 병합.
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CONTENT } from '../content';
import {
  BOX, MERGE_NEED, RARITIES,
  bestRarity, canMergeRarity, claim, diamondCount, honorTrophyCount, itemsOf, loadCollection,
  mergeSceneRarity, nextMergeRarity, ownedCount, rarityMeta, rarityToTier, saveCollection, totalItems,
  type BoxGrade, type Collection, type DropResult, type Rarity,
} from '../learn/collection';
import { gachaItemForPlace, gachaLabItemForPlace } from '../learn/gachaItems';
import { loadProgress } from '../learn/progress';
import { Icon } from '../ui/Icon';
import { speakSequence, ttsSupported } from '../tts';
import { loadSettings, sceneSentenceLevelForMode } from '../learn/settings';
import { Modal } from './Modal';
import { sceneVisualByMission } from './scene';
import { MascotBubble } from './mascot';

const SCENES = CONTENT.missions.filter((m) => m.id !== 'C0');
const MAX_GACHA_DRAWS = 30;
const placeOf = (id: string) => CONTENT.missions.find((m) => m.id === id)?.place ?? id;
const rarityStars = (rarity: Rarity) => rarityToTier(rarity);
const isRareReveal = (rarity: Rarity) => rarity === 'gold' || rarity === 'diamond' || rarity === 'xur';
const isPremiumReveal = (rarity: Rarity) => rarity === 'gold' || rarity === 'diamond' || rarity === 'xur';

function itemKoreanDescription(place: string, title: string, rarity: Rarity): string {
  const tone: Record<Rarity, string> = {
    basic: '여행 장면을 시작하게 해 주는 작은 선물',
    bronze: '실전 주문과 요청에 바로 쓰기 좋은 선물',
    silver: '상황 설명까지 자연스럽게 이어 주는 선물',
    gold: '정중하고 구체적인 부탁을 연습하게 해 주는 선물',
    diamond: '최종 미션을 떠올리게 하는 특별한 선물',
    xur: 'UR 병합으로만 열리는 초월 선물',
  };
  return `${place}에서 얻은 ${title}. ${tone[rarity]}입니다.`;
}

function ItemArt({ sceneId, rarity, size }: { sceneId: string; rarity: Rarity; size: number }) {
  const sv = sceneVisualByMission(sceneId);
  const item = gachaLabItemForPlace(placeOf(sceneId), rarity);
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
  const stars = rarityStars(rarity);
  const showDescription = size >= 120;
  return (
    <span className={`ym-mcard is-${rarity} ${holo ? 'is-holo' : ''}`} style={{
      ['--rarity-color' as string]: meta.color,
      ['--scene-accent' as string]: sv.accent,
      width: size, height: Math.round(size * 1.42), flex: '0 0 auto', aspectRatio: '5 / 7',
      borderRadius: Math.round(size * 0.08),
    }}>
      <span className="ym-mcard-brand" style={{ fontSize: Math.max(5, Math.round(size * 0.055)), marginTop: Math.round(size * 0.045) }}>YANGMUNG TRAVEL CARD</span>
      <span className="ym-mcard-serial" style={{ fontSize: Math.max(5, Math.round(size * 0.052)) }}>NO.{cardNo}</span>
      <span className="ym-mcard-tier" aria-hidden style={{ fontSize: Math.max(6, Math.round(size * 0.061)) }}>{meta.label}</span>
      <span className="ym-mcard-stars" aria-label={`${stars}성 카드`} style={{ fontSize: Math.max(7, Math.round(size * 0.074)), marginTop: Math.round(size * 0.03) }}>
        {Array.from({ length: 6 }, (_, i) => <span className={i < stars ? 'is-on' : undefined} key={i}>★</span>)}
      </span>
      <span aria-hidden className="ym-mcard-art" style={{ width: Math.round(size * 0.88), height: Math.round(size * 0.76), marginTop: Math.round(size * 0.04) }}>
        <ItemArt sceneId={sceneId} rarity={rarity} size={size} />
      </span>
      <span className="ym-mcard-title" lang="ja" style={{ fontSize: Math.max(8, Math.round(size * 0.13)), width: '88%', marginTop: Math.round(size * 0.055) }}>{item.jaTitle ?? item.title}</span>
      <span className="ym-mcard-sub" style={{ fontSize: Math.max(6, Math.round(size * 0.079)), padding: '1px 6px', marginTop: 3, maxWidth: '86%' }}>{item.title}</span>
      {showDescription && <span className="ym-mcard-desc" style={{ fontSize: Math.max(7, Math.round(size * 0.056)), width: '84%' }}>{itemKoreanDescription(placeOf(sceneId), item.title, rarity)}</span>}
      <span className="ym-mcard-place" style={{ fontSize: Math.max(5, Math.round(size * 0.052)) }}>{placeOf(sceneId)}</span>
    </span>
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

function ItemReveal({ item, index, active, onNext }: { item: DropResult; index: number; active: boolean; onNext: () => void }) {
  const meta = rarityMeta(item.rarity);
  const art = gachaLabItemForPlace(placeOf(item.sceneId), item.rarity);
  const [failed, setFailed] = useState(false);
  const premium = isPremiumReveal(item.rarity);
  const className = `ym-item-reveal is-${item.rarity} ${item.isNew ? 'is-new' : 'is-repeat'} ${premium ? 'is-premium' : ''}`;
  return (
    <button
      className={className}
      onClick={(e) => { e.stopPropagation(); onNext(); }}
      style={{ ['--rarity-color' as string]: meta.color, ['--intro-index' as string]: index }}
    >
      <span className="ym-item-reveal-aura" aria-hidden />
      <span className="ym-item-reveal-art">
        {!failed && art.image ? (
          <img src={art.image} alt="" draggable={false} onError={() => setFailed(true)} />
        ) : (
          <span className={`ym-gacha-item-illustration is-${art.motif} is-${item.rarity}`} />
        )}
      </span>
      <span className="ym-item-reveal-copy">
        <span className="ym-item-reveal-rarity">{meta.label}{item.isNew ? ' · NEW' : ''}</span>
        <strong lang="ja">{art.jaTitle ?? art.title}</strong>
        <em>{art.title}</em>
        <span>{itemKoreanDescription(placeOf(item.sceneId), art.title, item.rarity)}</span>
      </span>
      <span className="ym-item-reveal-next">{active ? '다음' : '확인'}</span>
    </button>
  );
}

function CardShufflePreview({ color }: { color: string }) {
  return (
    <span className="ym-shuffle-preview" aria-hidden style={{ ['--gacha-color' as string]: color }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <span key={i} className="ym-shuffle-preview-card" style={{ ['--i' as string]: i - 3 }}><CardBack size={70} /></span>
      ))}
    </span>
  );
}

function CardShuffleStage({ color, count, hint }: { color: string; count: number; hint?: Rarity }) {
  const hintMeta = hint ? rarityMeta(hint) : null;
  const premium = hint && isPremiumReveal(hint);
  return (
    <div className={`ym-shuffle-stage ${premium ? `has-${hint}` : ''}`} aria-hidden style={{ ['--gacha-color' as string]: hintMeta?.color ?? color }}>
      <span className="ym-shuffle-table-ring" />
      <span className="ym-shuffle-cut is-left">
        {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ ['--i' as string]: i }}><CardBack size={92} /></span>)}
      </span>
      <span className="ym-shuffle-cut is-right">
        {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ ['--i' as string]: i }}><CardBack size={92} /></span>)}
      </span>
      <span className="ym-shuffle-fan">
        {Array.from({ length: 11 }).map((_, i) => <span key={i} style={{ ['--i' as string]: i - 5 }}><CardBack size={96} /></span>)}
      </span>
      <strong>{count}장의 여행 카드 셔플 중</strong>
      <em>{premium && hintMeta ? `덱 안에서 ${hintMeta.label}의 강한 빛이 느껴집니다` : '잠시 후 한 장씩 공개됩니다'}</em>
    </div>
  );
}

function RevealCards({ results, animate }: { results: DropResult[]; animate?: boolean }) {
  const grouped = groupResults(results);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
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
  const [stage, setStage] = useState<'shuffle' | 'cards'>('shuffle');
  const [sfx, setSfx] = useState<{ text: string; size: number; key: number } | null>(null);
  const [results, setResults] = useState<DropResult[]>([]);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [visibleCount, setVisibleCount] = useState(1);
  const [currentDraws, setCurrentDraws] = useState(drawCount ?? box.draws);
  const [rareBurst, setRareBurst] = useState<{ index: number; rarity: Rarity; key: number } | null>(null);
  const [deck, setDeck] = useState(false);
  const plannedDrawsRef = useRef(drawCount ?? box.draws);
  const timersRef = useRef<number[]>([]);
  const introSeenRef = useRef<Set<number>>(new Set());
  const displayDraws = currentDraws;
  const closedDrawLabel = randomDrawCount ? '여행 선물 카드 1~30장 랜덤' : `여행 선물 카드 ${displayDraws}장`;
  const allFlipped = results.length > 0 && flipped.size >= results.length;
  const activeIndex = Math.min(Math.max(visibleCount - 1, 0), Math.max(results.length - 1, 0));
  const activeResult = results[activeIndex];
  const openedResults = results.filter((_, i) => flipped.has(i) && i < activeIndex);
  const shuffleHint = results.reduce<Rarity | undefined>((best, r) => {
    if (!best) return isPremiumReveal(r.rarity) ? r.rarity : undefined;
    return rarityToTier(r.rarity) > rarityToTier(best) ? r.rarity : best;
  }, undefined);
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 850, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' };

  useEffect(() => () => { timersRef.current.forEach((t) => window.clearTimeout(t)); }, []);
  useEffect(() => {
    if (phase !== 'open' || stage !== 'cards' || !activeResult || introSeenRef.current.has(activeIndex)) return;
    introSeenRef.current.add(activeIndex);
    if (isPremiumReveal(activeResult.rarity)) {
      setRareBurst({ index: activeIndex, rarity: activeResult.rarity, key: Date.now() });
      playSfx(activeResult.rarity === 'diamond' ? 'UR REVEAL' : activeResult.rarity === 'xur' ? 'XUR REVEAL' : 'SSR REVEAL', activeResult.rarity === 'diamond' || activeResult.rarity === 'xur' ? 48 : 42);
      const hold = activeResult.rarity === 'xur' ? 4200 : activeResult.rarity === 'diamond' ? 3400 : 2600;
      after(hold, () => setRareBurst((cur) => (cur?.index === activeIndex ? null : cur)));
    } else if (activeResult.isNew) {
      playSfx('NEW!', 30);
    } else {
      playSfx(rarityMeta(activeResult.rarity).label, 22);
    }
  }, [phase, stage, activeIndex, activeResult]);

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
    const r = doClaim();
    setStage('shuffle');
    setSfx(null);
    setFlipped(new Set());
    introSeenRef.current = new Set();
    setVisibleCount(1);
    setRareBurst(null);
    setPhase('open');
    playSfx('SHUFFLE', 36);
    after(1320, () => playSfx('CUT', 30));
    after(2500, () => playSfx('DRAW', 38));
    after(3050, () => {
      setStage('cards');
      setVisibleCount(r.length > 0 ? 1 : 0);
    });
  }
  function overlayTap() {
    if (stage === 'shuffle') {
      setStage('cards');
      setVisibleCount(results.length > 0 ? 1 : 0);
    }
  }
  function flip(i: number) {
    setFlipped((prev) => new Set(prev).add(i));
    advanceCard(i);
  }
  function advanceCard(i: number) {
    if (i === visibleCount - 1 && visibleCount < results.length) setVisibleCount((n) => Math.min(results.length, n + 1));
  }

  return (
    <div className="ym-rise" style={{ marginTop: 22 }}>
      <p style={labelStyle}>{label}</p>

      {phase === 'closed' && (
        <button className="ym-press" onClick={start}
          style={{ width: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 18px 20px', borderRadius: 22, border: '1px solid var(--glass-border)', background: `radial-gradient(circle at 50% 38%, ${box.colors[1]}2e, transparent 46%), var(--glass-bg-strong)`, cursor: 'pointer', color: 'var(--ink)' }}>
          <GachaGlow color={box.colors[1]} />
          <CardShufflePreview color={box.colors[1]} />
          <span style={{ fontWeight: 900, fontSize: 16 }}>{box.label} 카드 셔플 시작</span>
          <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 750 }}>{closedDrawLabel} · 한 장씩 공개</span>
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
        <div onClick={overlayTap} className={`ym-gacha-stage ym-gacha-card-show ${stage === 'cards' ? 'is-burst' : 'is-shuffling'}`}
          style={{
            ['--gacha-color' as string]: box.colors[1],
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: 'max(14px, env(safe-area-inset-top)) 18px max(14px, env(safe-area-inset-bottom))',
            background: 'radial-gradient(circle at 50% 28%, rgba(255,230,165,.24), transparent 25%), radial-gradient(circle at 22% 18%, rgba(89,204,226,.12), transparent 28%), linear-gradient(140deg, rgba(8,7,4,.94), rgba(38,27,11,.9) 48%, rgba(8,12,22,.96))',
            boxShadow: 'inset 0 0 140px rgba(255,216,128,.16), inset 0 0 260px rgba(0,0,0,.45)',
            backdropFilter: 'blur(10px) saturate(1.08)',
            WebkitBackdropFilter: 'blur(10px) saturate(1.08)',
          }}>
          <span className="ym-gacha-comic-bg" aria-hidden />
          <span className="ym-gacha-show-lights" aria-hidden />
          {stage === 'cards' && <BurstParticles color={box.colors[1]} />}
          {rareBurst && (
            <div key={`rare:${rareBurst.key}`} className={`ym-gacha-rare-burst is-${rareBurst.rarity}`} style={{ ['--rarity-color' as string]: rarityMeta(rareBurst.rarity).color }} aria-hidden>
              <span>{rareBurst.rarity === 'diamond' ? 'UR CARD' : 'SSR CARD'}</span>
              <strong>{rarityStars(rareBurst.rarity)} STAR SPECIAL REVEAL</strong>
            </div>
          )}
          {sfx && (
            <span key={`sfx:${sfx.key}`} className="ym-manga-sfx" aria-hidden style={{ fontSize: sfx.size, top: stage === 'shuffle' ? '30%' : '42%' }}>{sfx.text}</span>
          )}

          {stage === 'shuffle' ? (
            <>
              <CardShuffleStage color={box.colors[1]} count={results.length || currentDraws} hint={shuffleHint} />
              <span style={{ position: 'relative', zIndex: 3, color: 'rgba(255,255,255,.74)', fontSize: 12, fontWeight: 850 }}>탭하면 셔플을 건너뛸 수 있어요</span>
            </>
          ) : (
            <>
              <div className="ym-gpn-spill" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#fff', fontWeight: 1000, fontSize: 21, textShadow: '2px 2px 0 #20242f' }}>
                  {results.length}장 중 {Math.min(activeIndex + 1, results.length)}번째 카드
                </p>
                <p style={{ margin: '5px 0 0', color: 'rgba(255,255,255,.76)', fontWeight: 800, fontSize: 12 }}>
                  {activeResult ? '아이템을 확인하고 다음으로 넘어가세요' : '획득한 아이템을 정리하는 중입니다'}
                </p>
              </div>
              <div className="ym-gacha-pile-zone ym-gpn-spill" style={{ position: 'relative', zIndex: 2, ['--spill-d' as string]: '.08s' }}>
                <div className={`ym-gacha-card-pile ${activeResult && isRareReveal(activeResult.rarity) ? `is-${activeResult.rarity}` : ''}`}>
                  {results.slice(activeIndex + 1, Math.min(results.length, activeIndex + 6)).map((r, offset) => (
                    <span key={`pile:${activeIndex}:${offset}`} className="ym-gacha-pile-back" style={{ ['--pile-offset' as string]: offset + 1 }}>
                      <CardBack rarity={r.rarity} />
                    </span>
                  ))}
                  {activeResult && (
                    <ItemReveal
                      key={`active:${activeIndex}:${activeResult.sceneId}:${activeResult.rarity}`}
                      item={activeResult}
                      index={activeIndex}
                      active={activeIndex < results.length - 1}
                      onNext={() => flip(activeIndex)}
                    />
                  )}
                </div>
                {openedResults.length > 0 && (
                  <div className="ym-gacha-opened-stack" aria-label="앞서 뽑은 카드">
                    {openedResults.slice(-14).map((r, i) => (
                      <span key={`opened:${i}:${r.sceneId}:${r.rarity}`} className="ym-gacha-opened-stack-card">
                        <DeckCardFace sceneId={r.sceneId} rarity={r.rarity} size={154} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 2 }}>
                {activeResult && activeIndex < results.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); flip(activeIndex); }} style={overlayBtn}>다음 카드</button>
                )}
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

function CollectionCardDetailModal({ sceneId, rarity, count, onClose }: { sceneId: string; rarity: Rarity; count: number; onClose: () => void }) {
  const item = gachaItemForPlace(placeOf(sceneId), rarity);
  const place = placeOf(sceneId);
  const dialogue = giftDialogue(place, item.title, rarity);
  // 줄 단위로 읽어 각 줄이 개별 mp3(Nanami)를 탈 수 있게 — 없으면 줄마다 Web Speech 폴백.
  const speakLines = dialogue.lines.map((line) => line.ja);
  return (
    <Modal title="카드 상세" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '132px minmax(0, 1fr)', gap: 14, alignItems: 'center' }}>
        <DeckCardFace sceneId={sceneId} rarity={rarity} size={128} />
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, color: rarityMeta(rarity).color, fontSize: 12, fontWeight: 950, letterSpacing: '0.06em' }}>{rarityStars(rarity)} STAR · {place}</p>
          <h3 lang="ja" style={{ margin: '6px 0 0', fontSize: 22, lineHeight: 1.15, color: 'var(--ink)' }}>{item.jaTitle ?? item.title}</h3>
          <strong style={{ display: 'block', marginTop: 5, color: 'var(--ink)', fontSize: 15 }}>{item.title}</strong>
          <p style={{ margin: '8px 0 0', color: 'var(--ink-soft)', fontSize: 13, lineHeight: 1.5 }}>{itemKoreanDescription(place, item.title, rarity)}</p>
          <span style={{ display: 'inline-flex', marginTop: 9, padding: '5px 8px', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 11.5, fontWeight: 900 }}>보유 {count}장</span>
        </div>
      </div>
      <section style={{ marginTop: 16, padding: 14, borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <strong style={{ color: 'var(--ink)', fontSize: 14 }}>{dialogue.title}</strong>
          <button className="ym-press" onClick={() => speakSequence(speakLines)} disabled={!ttsSupported()} aria-label="일본어 문장 듣기"
            style={{ flex: '0 0 auto', width: 38, height: 38, borderRadius: 11, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="listen" size={18} />
          </button>
        </div>
        {dialogue.lines.map((line, i) => (
          <div key={i} style={{ padding: i === 0 ? '0 0 10px' : '10px 0 0', borderTop: i === 0 ? 'none' : '1px solid var(--glass-border)' }}>
            <p lang="ja" style={{ margin: 0, color: 'var(--ink)', fontSize: 18, lineHeight: 1.38, fontWeight: 900 }}>{line.ja}</p>
            <p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 13, lineHeight: 1.45, fontWeight: 700 }}>{line.ko}</p>
          </div>
        ))}
      </section>
    </Modal>
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
    xur: {
      title: '초월 선물의 약속',
      lines: [
        { ja: 'この特別な招待状で、次の旅の約束を形にしたいです', ko: '이 특별한 초대장으로 다음 여행의 약속을 구체적으로 만들고 싶어요.' },
        { ja: '二人だけの記念になるように、いちばん美しい形で残していただけますか', ko: '둘만의 기념이 되도록 가장 아름다운 형태로 남겨 주실 수 있을까요?' },
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
  const [selectedDetail, setSelectedDetail] = useState<{ sceneId: string; rarity: Rarity } | null>(null);
  const [mergeFx, setMergeFx] = useState<{ from: Rarity; to: Rarity; key: number } | null>(null);
  const stats = useLearningStats(collection);

  function runMerge(sceneId: string, rarity: Rarity) {
    const merged = mergeSceneRarity(collection, sceneId, rarity);
    if (!merged) return;
    saveCollection(merged.collection);
    setCollection(merged.collection);
    setMergeFx({ from: rarity, to: merged.target, key: Date.now() });
    window.setTimeout(() => setMergeFx(null), isPremiumReveal(merged.target) ? 1800 : 1100);
  }

  if (selected) {
    const card = collection.cards[selected];
    const items = itemsOf(card);
    const ownedRarities = RARITIES.filter((r) => items[r.key] > 0).map((r) => r.key);
    return (
      <>
        <button className="ym-press" onClick={() => { setSelected(undefined); setSelectedDetail(null); }} style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, padding: '4px 0 12px', cursor: 'pointer' }}>← 도감으로</button>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>
          {placeOf(selected)}에서 모은 선물 카드예요. 획득한 카드만 눌러 상세 문장을 볼 수 있습니다.
        </p>
        {mergeFx && (
          <div key={mergeFx.key} className={`ym-merge-shuffle-fx is-${mergeFx.to}`} style={{ ['--rarity-color' as string]: rarityMeta(mergeFx.to).color }}>
            <span>{rarityMeta(mergeFx.from).label}</span>
            <b>SHUFFLE MERGE</b>
            <strong>{rarityMeta(mergeFx.to).label}</strong>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 14 }}>
          {RARITIES.map((r) => {
            const count = items[r.key];
            const target = nextMergeRarity(r.key);
            if (!count) {
              return (
                <div key={r.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: 11, borderRadius: 16, border: '1px dashed var(--glass-border)', background: 'var(--glass-bg)', opacity: 0.62 }}>
                  <span style={{ width: 94, height: 134, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, rgba(120,120,120,.14), rgba(120,120,120,.05))', color: 'var(--ink-faint)', border: '1px solid var(--glass-border)', fontWeight: 950, fontSize: 24 }}>?</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--ink-faint)' }}>미획득 카드</span>
                  <span style={{ fontSize: 11, fontWeight: 850, color: 'var(--ink-faint)' }}>정보 잠김</span>
                </div>
              );
            }
            const item = gachaItemForPlace(placeOf(selected), r.key);
            return (
              <div key={r.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 11, borderRadius: 16, border: `1px solid ${r.color}`, background: 'var(--glass-bg-strong)', color: 'var(--ink)' }}>
                <button className="ym-press" onClick={() => setSelectedDetail({ sceneId: selected, rarity: r.key })} style={{ border: 0, background: 'transparent', color: 'var(--ink)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 0 }}>
                  <DeckCardFace sceneId={selected} rarity={r.key} size={104} />
                  <span lang="ja" style={{ fontSize: 12, fontWeight: 950, color: r.color, textAlign: 'center' }}>{item.jaTitle ?? item.title}</span>
                  <span style={{ fontSize: 11, fontWeight: 850, color: 'var(--ink-soft)' }}>x{count}</span>
                </button>
                {target && canMergeRarity(card, r.key) && (
                  <button className="ym-press" onClick={() => runMerge(selected, r.key)}
                    style={{ marginTop: 2, width: '100%', border: 0, borderRadius: 999, padding: '7px 8px', background: r.color, color: '#fff', fontSize: 11, fontWeight: 950, cursor: 'pointer' }}>
                    {MERGE_NEED[r.key]}장 병합 → {rarityMeta(target).label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {selectedDetail && items[selectedDetail.rarity] > 0 && (
          <CollectionCardDetailModal
            sceneId={selectedDetail.sceneId}
            rarity={selectedDetail.rarity}
            count={items[selectedDetail.rarity]}
            onClose={() => setSelectedDetail(null)}
          />
        )}
        <div style={{ padding: 14, borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', marginBottom: 12 }}>
          <strong style={{ display: 'block', color: 'var(--ink)', fontSize: 14 }}>최종 미션 카드</strong>
          <span style={{ display: 'block', marginTop: 5, color: 'var(--ink-soft)', fontSize: 12.5, lineHeight: 1.5, fontWeight: 700 }}>
            모든 여행 선물을 모으면 특별한 최종 카드가 열립니다. 관리자랑 데이트하기, 일본여행 같이 가기 같은 큰 선물이 숨어 있어요.
          </span>
        </div>
        {!ownedRarities.length && <p style={{ margin: 0, color: 'var(--ink-faint)', fontSize: 13, fontWeight: 700 }}>아직 이 장면의 선물 카드가 없어요.</p>}
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
        같은 장면의 같은 테크트리에서만 병합돼요. N 10장→R, R 5장→SR, SR 5장→SSR, SSR 5장→UR, UR 3장→XUR입니다.
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(150px, 1fr))', gap: 14 }}>
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
            <div key={m.id} className="ym-gacha-merge-host" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, padding: '15px 10px', borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
              <button className="ym-press" onClick={() => setSelected(m.id)} style={{ border: 0, background: 'transparent', color: 'var(--ink)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: 0, width: '100%' }}>
                <DeckCardFace sceneId={m.id} rarity={rarity} size={116} />
                <span style={{ fontSize: 12, fontWeight: 850 }}>{placeOf(m.id)}</span>
              </button>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                {RARITIES.map((r) => {
                  const count = items[r.key];
                  const label = count > 0 ? `${gachaItemForPlace(m.place, r.key).title} ${count}` : '미획득';
                  return <span key={r.key} style={{ fontSize: 10.5, fontWeight: 850, color: count > 0 ? r.color : 'var(--ink-faint)', border: `1px solid ${count > 0 ? r.color : 'var(--glass-border)'}`, borderRadius: 999, padding: '2px 5px' }}>{label}</span>;
                })}
              </div>
              <span style={{ fontSize: 10.5, color: 'var(--ink-faint)', fontWeight: 800 }}>같은 테크트리 수동 병합</span>
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
