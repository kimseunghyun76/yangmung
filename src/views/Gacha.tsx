// 가챠 덱 G1 — 완료 후 보석함 개봉 + 도감. 자체 localStorage(학습 로직 영향 0).
// 단계 외형은 CSS(단계 색 링/리본), 장면 식별은 기존 모노 아이콘. (에셋 생기면 프레임으로 교체)
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CONTENT } from '../content';
import { SCENE_SENTENCES } from '../content/sceneSentences';
import { claim, loadCollection, saveCollection, tierMeta, tierNeed, MAX_TIER, ownedCount, diamondCount, sentenceCount, BOX, type BoxGrade, type Collection, type DropResult } from '../learn/collection';
import { Icon } from '../ui/Icon';
import { speak, ttsSupported } from '../tts';
import { Modal } from './Modal';
import { sceneVisualByMission } from './scene';
import { MascotBubble } from './mascot';

const SCENES = CONTENT.missions.filter((m) => m.id !== 'C0');
const placeOf = (id: string) => CONTENT.missions.find((m) => m.id === id)?.place ?? id;
const sentenceOf = (sceneId: string, sentenceId: string) => SCENE_SENTENCES[sceneId as keyof typeof SCENE_SENTENCES]?.find((s) => s.id === sentenceId);
type RewardItem = { result: DropResult; sentenceId?: string };

// 단계 색 링에 장면 아이콘. 실사 보상 대신 게임 아이템 카드처럼 보이게 구성한다.
function DeckCardFace({ sceneId, tier, size = 56 }: { sceneId: string; tier: number; size?: number }) {
  const sv = sceneVisualByMission(sceneId);
  const meta = tierMeta(tier);
  const diamond = tier >= MAX_TIER;
  const shine = diamond
    ? 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(91,199,224,0.32), rgba(226,101,90,0.2), rgba(255,255,255,0.68))'
    : `linear-gradient(145deg, rgba(255,255,255,0.52), ${meta.color}28 46%, rgba(0,0,0,0.1))`;
  return (
    <span className="ym-game-item-face" data-tier={tier} style={{
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

function TierRibbon({ tier }: { tier: number }) {
  const meta = tierMeta(tier);
  return <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', color: meta.color, border: `1.5px solid ${meta.color}`, borderRadius: 6, padding: '1px 6px' }}>{meta.label}</span>;
}

// 등급 박스 비주얼 — 중국풍 보물상자 대신 일본 만화풍 캡슐 오르골 박스를 사용.
function BoxArt({ grade, size = 64, className, open = false }: { grade: BoxGrade; size?: number; className?: string; open?: boolean }) {
  const [failed, setFailed] = useState(false);
  const box = BOX[grade];
  if (failed) {
    return <span className={className} style={{ width: size, height: size, borderRadius: Math.round(size * 0.28), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.5), background: `linear-gradient(160deg, ${box.colors[0]}, ${box.colors[1]})`, boxShadow: `0 10px 26px ${box.colors[0]}66` }}>✦</span>;
  }
  return (
    <span className={`ym-yumebox ${open ? 'is-open' : 'is-closed'} ${className ?? ''}`} style={{
      ['--box-grade' as string]: box.colors[1],
      width: size,
      height: size,
    }}>
      <img src={`/gacha/box/${open ? 'yumebox' : 'yumebox-closed'}.png`} alt="" aria-hidden width={size} height={size} onError={() => setFailed(true)} />
    </span>
  );
}

function RevealCards({ results, shards, animate }: { results: DropResult[]; shards: number; animate?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
      {results.map((r, i) => (
        <div key={r.sceneId} className={animate ? 'ym-card-in' : undefined} style={{ animationDelay: animate ? `${0.7 + i * 0.12}s` : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 86, position: 'relative', zIndex: 2 }}>
          <DeckCardFace sceneId={r.sceneId} tier={r.tier} size={animate ? 72 : 58} />
          <span style={{ fontSize: 13, fontWeight: 800 }}>{placeOf(r.sceneId)}</span>
          <TierRibbon tier={r.tier} />
          <span style={{ fontSize: 11, fontWeight: 800, color: r.leveledTo ? 'var(--ok)' : r.isNew ? 'var(--accent)' : 'var(--ink-faint)' }}>
            {r.leveledTo ? `${tierMeta(r.leveledTo).label} 승급!` : r.isNew ? 'NEW' : `조각 +${shards}`}
          </span>
          {r.sentenceIds.length > 0 && <span style={{ fontSize: 10.5, color: 'var(--ink-soft)', fontWeight: 750 }}>표현 +{r.sentenceIds.length}</span>}
        </div>
      ))}
    </div>
  );
}

function RewardPopCard({ item, color, index, total }: { item: RewardItem; color: string; index: number; total: number }) {
  const sentence = item.sentenceId ? sentenceOf(item.result.sceneId, item.sentenceId) : undefined;
  return (
    <div
      key={`${item.result.sceneId}:${item.sentenceId ?? index}`}
      className="ym-item-out ym-gacha-reward-card"
      style={{
        ['--reward-color' as string]: color,
        ['--reward-accent' as string]: tierMeta(item.result.tier).color,
      }}
    >
      <span className="ym-gacha-reward-badge">GET {index}/{total}</span>
      <DeckCardFace sceneId={item.result.sceneId} tier={item.result.tier} size={90} />
      <span className="ym-gacha-reward-place">{placeOf(item.result.sceneId)}</span>
      {sentence ? (
        <>
          <span className="ym-gacha-reward-type">NEW EXPRESSION</span>
          <span lang="ja" className="ym-gacha-reward-ja">{sentence.kanji ?? sentence.kana}</span>
          <span className="ym-gacha-reward-ko">{sentence.korean}</span>
        </>
      ) : (
        <>
          <span className="ym-gacha-reward-type">SCENE SHARD</span>
          <TierRibbon tier={item.result.tier} />
        </>
      )}
    </div>
  );
}

const reduceMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ── 보석함 (완료 화면) ──────────────────────────────
export function GachaBox({ sessionId, sceneIds, grade = 'wood' }: { sessionId: number; sceneIds: string[]; grade?: BoxGrade }) {
  const [phase, setPhase] = useState<'closed' | 'open' | 'revealed'>('closed');
  const [results, setResults] = useState<DropResult[]>([]);
  const [taps, setTaps] = useState(0);
  const [burst, setBurst] = useState(false);
  const [revealed, setRevealed] = useState(0); // 하나씩 공개된 아이템 수
  const [deck, setDeck] = useState(false);
  if (sceneIds.length === 0) return null;
  const box = BOX[grade];
  const TAPS = 3; // 상자를 터뜨리기까지 필요한 탭 수
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' };

  function doClaim(): DropResult[] {
    const res = claim(loadCollection(), sessionId, sceneIds, box.shards);
    saveCollection(res.collection);
    let r = res.results;
    if (r.length === 0) {
      const c = loadCollection();
      r = sceneIds.map((id) => ({ sceneId: id, isNew: false, leveledTo: null, tier: c.cards[id]?.tier ?? 1, shards: c.cards[id]?.shards ?? 0, sentenceIds: [] }));
    }
    setResults(r);
    return r;
  }
  function start() {
    if (reduceMotion()) { doClaim(); setPhase('revealed'); return; }
    setTaps(0); setBurst(false); setRevealed(0); setPhase('open');
  }
  const rewardItems: RewardItem[] = results.flatMap<RewardItem>((result) =>
    result.sentenceIds.length > 0
      ? result.sentenceIds.map((sentenceId) => ({ result, sentenceId }))
      : [{ result, sentenceId: undefined }],
  );
  // 오버레이 탭: 상자 깨기(여러 번) → 아이템 한 개씩 단독 공개 → 마지막 확인 후 전체 요약
  function overlayTap() {
    if (!burst) {
      const n = taps + 1;
      setTaps(n);
      if (n >= TAPS) { doClaim(); setBurst(true); setRevealed(0); }
    } else if (revealed <= rewardItems.length) {
      setRevealed((v) => v + 1);
    }
  }
  const complete = burst && rewardItems.length > 0 && revealed > rewardItems.length;
  const currentReward = revealed > 0 && revealed <= rewardItems.length ? rewardItems[revealed - 1] : undefined;

  return (
    <div className="ym-rise" style={{ marginTop: 22 }}>
      <p style={labelStyle}>오늘의 보석함</p>

      {phase === 'closed' && (
        <button className="ym-press" onClick={start}
          style={{ width: '100%', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '18px 20px 20px', borderRadius: 22, border: '1px solid var(--glass-border)', background: `radial-gradient(circle at 50% 26%, ${box.colors[1]}2e, transparent 42%), var(--glass-bg-strong)`, cursor: 'pointer', color: 'var(--ink)' }}>
          <GachaGlow color={box.colors[1]} />
          <BoxArt grade={grade} size={112} className="ym-listening" />
          <span style={{ fontWeight: 800, fontSize: 16 }}>{box.label} 열기</span>
          <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700 }}>장면당 조각 +{box.shards}</span>
        </button>
      )}

      {phase === 'revealed' && (
        <div style={{ position: 'relative', overflow: 'hidden', padding: 18, borderRadius: 22, border: '1px solid var(--glass-border)', background: `radial-gradient(circle at 50% 18%, ${box.colors[1]}24, transparent 50%), var(--glass-bg-strong)` }}>
          <GachaGlow color={box.colors[1]} strong />
          <MascotBubble who="duo" size={42} style={{ marginBottom: 14 }}>오늘 모은 장면과 표현이 여행 도감에 들어갔어요.</MascotBubble>
          <RevealCards results={results} shards={box.shards} />
          <button className="ym-press" onClick={() => setDeck(true)}
            style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            내 도감 보기
          </button>
        </div>
      )}

      {/* 개봉 오버레이 — 여러 번 탭해 상자 깨기 → 아이템 하나씩 → 전체 (body 포털) */}
      {phase === 'open' && typeof document !== 'undefined' && createPortal(
        <div onClick={overlayTap} className={`ym-gacha-stage ${burst ? 'is-burst' : ''}`}
          style={{ ['--gacha-color' as string]: box.colors[1], position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24, background: 'radial-gradient(circle at 50% 34%, rgba(255,255,255,0.16), transparent 24%), rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <span className="ym-gacha-runes" aria-hidden />
          {burst && <span className="ym-gacha-shockwave" aria-hidden />}
          {burst && (
            <>
              <span className="ym-gacha-rays" aria-hidden style={{ position: 'absolute', width: 360, height: 360, color: box.colors[1], opacity: 0.55 }} />
              <div className="ym-confetti" aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {['✦', '★', '✦', '✧', '★', '✦', '✧', '★'].map((e, i) => (
                  <span key={i} style={{ left: `${8 + i * 11}%`, color: i % 2 ? box.colors[1] : 'var(--accent)', animationDelay: `${i * 0.06}s` }}>{e}</span>
                ))}
              </div>
              <BurstParticles color={box.colors[1]} />
            </>
          )}

          {!burst ? (
            <>
              <div style={{ position: 'relative', width: 220, height: 178, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="ym-glow" aria-hidden style={{ position: 'absolute', inset: -18, borderRadius: '50%', background: `radial-gradient(circle, ${box.colors[1]}aa, ${box.colors[1]}33 40%, transparent 70%)` }} />
                <div key={taps} className={taps > 0 ? 'ym-gacha-box-hit' : undefined} style={{ transform: `scale(${1 + taps * 0.08})`, transition: 'transform .12s' }}>
                  <BoxArt grade={grade} size={150} />
                </div>
              </div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, textShadow: '0 1px 8px rgba(0,0,0,.5)' }}>탭해서 상자 깨기</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {Array.from({ length: TAPS }, (_, i) => (
                  <span key={i} style={{ width: 12, height: 12, borderRadius: 99, background: i < taps ? box.colors[1] : 'rgba(255,255,255,0.3)', boxShadow: i < taps ? `0 0 10px ${box.colors[1]}` : 'none' }} />
                ))}
              </div>
            </>
          ) : !complete ? (
            <>
              <div style={{ position: 'relative', width: 260, minHeight: 330, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', zIndex: 2 }}><BoxArt grade={grade} size={138} open /></span>
                {currentReward ? (
                  <div style={{ position: 'absolute', left: '50%', top: '36%', transform: 'translate(-50%, -50%)', zIndex: 3 }}>
                    <RewardPopCard item={currentReward} color={box.colors[1]} index={revealed} total={rewardItems.length} />
                  </div>
                ) : (
                  <img className="ym-listening" src="/gacha/item/mystery-sentence.webp" alt="상자에서 나올 표현 카드" width={94} height={120} style={{ position: 'absolute', left: '50%', top: '36%', transform: 'translate(-50%, -50%)', objectFit: 'contain', zIndex: 3, filter: `drop-shadow(0 0 24px ${box.colors[1]}cc)` }} />
                )}
              </div>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 15, textShadow: '0 1px 8px rgba(0,0,0,.5)' }}>
                {currentReward
                  ? `${revealed === rewardItems.length ? '마지막 아이템 확인' : '탭해서 다음 아이템'} · ${revealed}/${rewardItems.length}`
                  : `탭해서 첫 아이템 받기 · 0/${rewardItems.length}`}
              </p>
            </>
          ) : (
            <>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, position: 'relative', zIndex: 2 }}>오늘 얻은 아이템</p>
              <div style={{ position: 'relative', zIndex: 2 }}><RevealCards results={results} shards={box.shards} animate /></div>
              <button onClick={(e) => { e.stopPropagation(); setPhase('revealed'); }} className="ym-card-in" style={{ animationDelay: '0.3s', marginTop: 6, padding: '12px 28px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 22px rgba(185,56,46,0.4)', position: 'relative', zIndex: 2 }}>좋아요</button>
            </>
          )}
        </div>,
        document.body,
      )}

      {deck && <DeckModal onClose={() => setDeck(false)} />}
    </div>
  );
}

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

// 도감 표현 1개 — 듣기 → 따라 말하기(섀도잉) 루프. 채점 없이 연습만(speak practiced 패턴).
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

// ── 도감 모달 ──────────────────────────────────────
export function DeckModal({ onClose }: { onClose: () => void }) {
  const c: Collection = loadCollection();
  const [selected, setSelected] = useState<string>();
  if (selected) {
    const ownedIds = c.sentences[selected] ?? [];
    const rows = SCENE_SENTENCES[selected as keyof typeof SCENE_SENTENCES].filter((row) => ownedIds.includes(row.id));
    return (
      <Modal title={`${placeOf(selected)} 표현`} onClose={onClose}>
        <button className="ym-press" onClick={() => setSelected(undefined)} style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, padding: '4px 0 12px', cursor: 'pointer' }}>← 도감으로</button>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>모은 표현 {rows.length}/30</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {rows.map((row) => (
            <DeckSentenceRow key={row.id} ja={row.kanji ?? row.kana} korean={row.korean} />
          ))}
        </div>
      </Modal>
    );
  }
  return (
    <Modal title="내 여행 도감" onClose={onClose}>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 650 }}>
        모은 장면 <strong style={{ color: 'var(--ink)' }}>{ownedCount(c)}</strong>/{SCENES.length} · 표현 <strong style={{ color: 'var(--accent)' }}>{sentenceCount(c)}</strong>/390 · 다이아 <strong style={{ color: '#5bc7e0' }}>{diamondCount(c)}</strong>
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {SCENES.map((m) => {
          const card = c.cards[m.id];
          const owned = !!card;
          const tier = card?.tier ?? 1;
          const sv = sceneVisualByMission(m.id);
          if (!owned) {
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px', borderRadius: 16, border: '1px dashed var(--glass-border)', opacity: 0.5 }}>
                <span style={{ width: 56, height: 56, borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg)', color: 'var(--ink-faint)' }}><Icon name={sv.icon} size={26} /></span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-faint)' }}>{placeOf(m.id)}</span>
                <span style={{ fontSize: 16 }}>🔒</span>
              </div>
            );
          }
          const need = tierNeed(tier);
          const pct = need === Infinity ? 100 : Math.round((card!.shards / need) * 100);
          return (
            <button key={m.id} className="ym-press" onClick={() => setSelected(m.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px', borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', cursor: 'pointer' }}>
              <DeckCardFace sceneId={m.id} tier={tier} />
              <span style={{ fontSize: 12, fontWeight: 800 }}>{placeOf(m.id)}</span>
              <TierRibbon tier={tier} />
              <div style={{ width: '80%', height: 4, borderRadius: 2, background: 'var(--glass-border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: tierMeta(tier).color }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 700 }}>{need === Infinity ? 'MAX' : `${card!.shards}/${need}`}</span>
              <span style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 700 }}>
                {SCENE_SENTENCES[m.id].length > 0 ? `표현 ${c.sentences[m.id]?.length ?? 0}/${SCENE_SENTENCES[m.id].length}` : '표현 카드 준비 중'}
              </span>
            </button>
          );
        })}
      </div>
      <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.5 }}>장면을 연습할수록 조각이 모여 기본→동→은→금→다이아로 자라요.</p>
    </Modal>
  );
}

// 도감 단독 진입(지도 등)에서 쓰는 버튼 + 모달
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
