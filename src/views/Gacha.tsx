// 가챠 덱 G1 — 완료 후 보석함 개봉 + 도감. 자체 localStorage(학습 로직 영향 0).
// 단계 외형은 CSS(단계 색 링/리본), 장면 식별은 기존 모노 아이콘. (에셋 생기면 프레임으로 교체)
import { useState } from 'react';
import { CONTENT } from '../content';
import { claim, loadCollection, saveCollection, tierMeta, tierNeed, MAX_TIER, ownedCount, diamondCount, BOX, type BoxGrade, type Collection, type DropResult } from '../learn/collection';
import { Icon } from '../ui/Icon';
import { Modal } from './Modal';
import { sceneVisualByMission } from './scene';

const SCENES = CONTENT.missions.filter((m) => m.id !== 'C0');
const placeOf = (id: string) => CONTENT.missions.find((m) => m.id === id)?.place ?? id;

// 단계 색 링에 장면 아이콘
function DeckCardFace({ sceneId, tier, size = 56 }: { sceneId: string; tier: number; size?: number }) {
  const sv = sceneVisualByMission(sceneId);
  const meta = tierMeta(tier);
  const diamond = tier >= MAX_TIER;
  return (
    <span style={{
      width: size, height: size, flex: `0 0 ${size}px`, borderRadius: 16,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: sv.accent,
      background: `radial-gradient(circle at 50% 38%, ${meta.color}22, transparent 70%)`,
      border: `2.5px solid ${meta.color}`,
      boxShadow: diamond ? `0 0 14px ${meta.color}aa` : `0 4px 14px ${meta.color}33`,
    }}>
      <Icon name={sv.icon} size={Math.round(size * 0.5)} />
    </span>
  );
}

function TierRibbon({ tier }: { tier: number }) {
  const meta = tierMeta(tier);
  return <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', color: meta.color, border: `1.5px solid ${meta.color}`, borderRadius: 6, padding: '1px 6px' }}>{meta.label}</span>;
}

// ── 보석함 (완료 화면) ──────────────────────────────
export function GachaBox({ sessionId, sceneIds, grade = 'wood' }: { sessionId: number; sceneIds: string[]; grade?: BoxGrade }) {
  const [opened, setOpened] = useState(false);
  const [results, setResults] = useState<DropResult[]>([]);
  const [deck, setDeck] = useState(false);
  if (sceneIds.length === 0) return null;
  const box = BOX[grade];

  function open() {
    const res = claim(loadCollection(), sessionId, sceneIds, box.shards);
    saveCollection(res.collection);
    let r = res.results;
    if (r.length === 0) {
      const c = loadCollection();
      r = sceneIds.map((id) => ({ sceneId: id, isNew: false, leveledTo: null, tier: c.cards[id]?.tier ?? 1, shards: c.cards[id]?.shards ?? 0 }));
    }
    setResults(r);
    setOpened(true);
  }

  return (
    <div className="ym-rise" style={{ marginTop: 22 }}>
      <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: '0 0 12px', textAlign: 'center' }}>오늘의 보석함</p>

      {!opened ? (
        <button className="ym-press" onClick={open}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px', borderRadius: 20, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', cursor: 'pointer', color: 'var(--ink)' }}>
          <span className="ym-listening" style={{ width: 64, height: 64, borderRadius: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, background: `linear-gradient(160deg, ${box.colors[0]}, ${box.colors[1]})`, boxShadow: `0 10px 26px ${box.colors[0]}66` }}>🎁</span>
          <span style={{ fontWeight: 800, fontSize: 16 }}>{box.label} 열기</span>
          <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700 }}>장면당 조각 +{box.shards}</span>
        </button>
      ) : (
        <div className="ym-burst" style={{ padding: 18, borderRadius: 20, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)' }}>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {results.map((r) => (
              <div key={r.sceneId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 86 }}>
                <DeckCardFace sceneId={r.sceneId} tier={r.tier} />
                <span style={{ fontSize: 13, fontWeight: 800 }}>{placeOf(r.sceneId)}</span>
                <TierRibbon tier={r.tier} />
                <span style={{ fontSize: 11, fontWeight: 800, color: r.leveledTo ? 'var(--ok)' : r.isNew ? 'var(--accent)' : 'var(--ink-faint)' }}>
                  {r.leveledTo ? `${tierMeta(r.leveledTo).label} 승급!` : r.isNew ? 'NEW' : `조각 +${box.shards}`}
                </span>
              </div>
            ))}
          </div>
          <button className="ym-press" onClick={() => setDeck(true)}
            style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            내 도감 보기
          </button>
        </div>
      )}

      {deck && <DeckModal onClose={() => setDeck(false)} />}
    </div>
  );
}

// ── 도감 모달 ──────────────────────────────────────
export function DeckModal({ onClose }: { onClose: () => void }) {
  const c: Collection = loadCollection();
  return (
    <Modal title="내 여행 도감" onClose={onClose}>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 650 }}>
        모은 장면 <strong style={{ color: 'var(--ink)' }}>{ownedCount(c)}</strong>/{SCENES.length} · 다이아 <strong style={{ color: '#5bc7e0' }}>{diamondCount(c)}</strong>
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
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px', borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)' }}>
              <DeckCardFace sceneId={m.id} tier={tier} />
              <span style={{ fontSize: 12, fontWeight: 800 }}>{placeOf(m.id)}</span>
              <TierRibbon tier={tier} />
              <div style={{ width: '80%', height: 4, borderRadius: 2, background: 'var(--glass-border)', overflow: 'hidden' }}>
                <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: tierMeta(tier).color }} />
              </div>
              <span style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 700 }}>{need === Infinity ? 'MAX' : `${card!.shards}/${need}`}</span>
            </div>
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
