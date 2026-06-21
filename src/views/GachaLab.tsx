// 새 가챠 프로토타입 — 「양뭉 보물 개봉식」 (온라인·웅장·2.5D 실물).
// 기존 가챠(Gacha.tsx)·index.html과 분리된 신규 탭. 스타일은 이 파일 안에 self-contained.
// Phase 1 수직 슬라이스: 무대 → 충전(탭) → 개봉(빛기둥+2.5D 상승) → 마스코트 리액션 → 도감 안착.
import { useRef, useState } from 'react';
import { WRAP } from '../ui/styles';
import { NavBar, type NavBarProps } from './NavBar';
import { MascotFace } from './mascot';
import { speak } from '../tts';

type Rarity = 'common' | 'rare' | 'epic' | 'legend';
interface ProtoItem { id: string; name: string; korean: string; scene: string; image: string; rarity: Rarity }

const RARITY: Record<Rarity, { label: string; color: string; glow: string; weight: number }> = {
  common: { label: '커먼', color: '#b9b2a4', glow: 'rgba(216,210,196,.5)', weight: 56 },
  rare: { label: '레어', color: '#4f93d8', glow: 'rgba(79,147,216,.6)', weight: 28 },
  epic: { label: '에픽', color: '#9a6ad6', glow: 'rgba(154,106,214,.65)', weight: 12 },
  legend: { label: '레전드', color: '#e8b23a', glow: 'rgba(232,178,58,.75)', weight: 4 },
};

// 프로토타입 샘플 — 기존 아이템 이미지를 재활용(이미지 에셋은 수정하지 않음).
const SAMPLE_ITEMS: ProtoItem[] = [
  { id: 'onigiri', name: 'おにぎり', korean: '주먹밥', scene: '편의점', image: '/gacha/items/generated/onigiri.png', rarity: 'common' },
  { id: 'hotsnack', name: 'ホットスナック', korean: '핫스낵', scene: '편의점', image: '/gacha/items/generated/hot-snack.png', rarity: 'common' },
  { id: 'water', name: 'お水', korean: '물 한 잔', scene: '식당', image: '/gacha/items/generated/water-glass.png', rarity: 'common' },
  { id: 'bento', name: 'お弁当', korean: '도시락', scene: '편의점', image: '/gacha/items/generated/bento-box.png', rarity: 'rare' },
  { id: 'teishoku', name: '定食', korean: '정식 세트', scene: '식당', image: '/gacha/items/generated/teishoku-menu.png', rarity: 'rare' },
  { id: 'premium', name: '特上弁当', korean: '프리미엄 도시락', scene: '편의점', image: '/gacha/items/generated/premium-bento.png', rarity: 'epic' },
  { id: 'recommend', name: 'おすすめ膳', korean: '추천 세트', scene: '식당', image: '/gacha/items/generated/recommended-set.png', rarity: 'epic' },
  { id: 'combo', name: '夜食コンボ', korean: '심야 콤보', scene: '편의점', image: '/gacha/items/generated/late-night-combo.png', rarity: 'legend' },
];

function rollItem(): ProtoItem {
  const total = SAMPLE_ITEMS.reduce((s, it) => s + RARITY[it.rarity].weight, 0);
  let r = Math.random() * total;
  for (const it of SAMPLE_ITEMS) { r -= RARITY[it.rarity].weight; if (r <= 0) return it; }
  return SAMPLE_ITEMS[0];
}

const DEX_KEY = 'yangmung:gachalab:dex:v1';
const loadDex = (): string[] => { try { return JSON.parse(localStorage.getItem(DEX_KEY) || '[]'); } catch { return []; } };
const saveDex = (ids: string[]) => { try { localStorage.setItem(DEX_KEY, JSON.stringify(ids)); } catch { /* noop */ } };

// ── 2.5D 아이템 — 포인터/자동 틸트 + 홀로 시트 + 부유 ──
function Item25D({ item, size = 200 }: { item: ProtoItem; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * 18).toFixed(1)}deg`);
    el.style.setProperty('--ry', `${(px * 22).toFixed(1)}deg`);
  };
  const reset = () => { const el = ref.current; if (el) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); } };
  const rc = RARITY[item.rarity];
  return (
    <div className="gl-25d-wrap" style={{ width: size, height: size }} onPointerMove={onMove} onPointerLeave={reset}>
      <div ref={ref} className="gl-25d">
        <div className="gl-25d-glow" style={{ background: `radial-gradient(circle, ${rc.glow}, transparent 68%)` }} />
        <div className="gl-25d-art">
          {failed ? (
            <div className="gl-25d-fallback" style={{ borderColor: rc.color }}><span lang="ja">{item.name}</span></div>
          ) : (
            <img src={item.image} alt={item.korean} draggable={false} onError={() => setFailed(true)} />
          )}
          <span className="gl-25d-holo" />
        </div>
        <div className="gl-25d-floor" />
      </div>
    </div>
  );
}

interface Props { nav: NavBarProps; onExit: () => void }

export function GachaLab({ nav, onExit }: Props) {
  const [tab, setTab] = useState<'draw' | 'dex'>('draw');
  const [phase, setPhase] = useState<'idle' | 'charging' | 'reveal'>('idle');
  const [charge, setCharge] = useState(0);
  const [item, setItem] = useState<ProtoItem | null>(null);
  const [dex, setDex] = useState<string[]>(() => loadDex());

  const auraColor = charge >= 100 ? RARITY.legend.color : charge >= 70 ? RARITY.epic.color : charge >= 40 ? RARITY.rare.color : RARITY.common.color;

  function tapCharge() {
    if (phase === 'reveal') return;
    setPhase('charging');
    setCharge((c) => {
      const next = Math.min(100, c + 34);
      if (next >= 100) window.setTimeout(reveal, 260);
      return next;
    });
  }
  function reveal() {
    const it = rollItem();
    setItem(it);
    setPhase('reveal');
    speak(it.name);
    setDex((d) => { if (d.includes(it.id)) return d; const nx = [...d, it.id]; saveDex(nx); return nx; });
  }
  function again() { setItem(null); setCharge(0); setPhase('idle'); }

  const rc = item ? RARITY[item.rarity] : null;

  return (
    <main className="gl-root" style={{ ...WRAP, minHeight: '100svh', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLE}</style>
      <NavBar {...nav} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button className="ym-press" onClick={() => setTab('draw')} style={pill(tab === 'draw')}>✨ 뽑기</button>
        <button className="ym-press" onClick={() => setTab('dex')} style={pill(tab === 'dex')}>🗃 보물 도감 <b style={{ opacity: .7 }}>{dex.length}/{SAMPLE_ITEMS.length}</b></button>
        <span style={{ flex: 1 }} />
        <button className="ym-press" onClick={onExit} style={{ ...pill(false), padding: '8px 12px' }}>← 홈</button>
      </div>

      {tab === 'draw' ? (
        <section className="gl-stage" aria-label="보물 개봉식 무대">
          <span className="gl-stage-light" aria-hidden style={{ ['--aura' as string]: auraColor }} />
          <span className="gl-stage-floor" aria-hidden />

          {phase !== 'reveal' && (
            <div className={`gl-box ${phase === 'charging' ? 'is-charging' : ''}`} style={{ ['--aura' as string]: auraColor }}
              onClick={tapCharge} role="button" aria-label="상자에 기운 모으기">
              <span className="gl-box-aura" />
              <span className="gl-box-lid" />
              <span className="gl-box-body" />
              <span className="gl-box-seal">福</span>
            </div>
          )}

          {phase === 'reveal' && item && (
            <div className="gl-reveal">
              <span className="gl-pillar" aria-hidden style={{ ['--c' as string]: rc!.color }} />
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="gl-spark" aria-hidden style={{ ['--c' as string]: rc!.color, ['--a' as string]: `${i * (360 / 14)}deg`, ['--d' as string]: `${i * 0.03}s` }} />
              ))}
              <div className="gl-rise">
                <span className="gl-rarity-badge" style={{ background: rc!.color }}>{rc!.label}</span>
                <Item25D item={item} size={210} />
              </div>
            </div>
          )}

          {/* 캐릭터 — 양·뭉이 무대에서 함께 뽑는다 */}
          <div className="gl-cast" aria-hidden>
            <MascotFace who="yang" mood={phase === 'reveal' ? 'done' : 'tip'} size={64} style={{ filter: 'drop-shadow(0 10px 16px rgba(0,0,0,.4))' }} />
            <MascotFace who="mung" mood={phase === 'reveal' ? 'correct' : 'default'} size={64} style={{ filter: 'drop-shadow(0 10px 16px rgba(0,0,0,.4))' }} />
          </div>

          <div className="gl-panel">
            {phase === 'reveal' && item ? (
              <>
                <p className="gl-get">획득! <b lang="ja" style={{ color: rc!.color }}>{item.name}</b></p>
                <p className="gl-get-sub">{item.korean} · {item.scene}에서 얻은 보물 · 도감에 등록됨</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="ym-press" onClick={again} style={cta(true)}>한 번 더 뽑기</button>
                  <button className="ym-press" onClick={() => setTab('dex')} style={cta(false)}>도감 보기</button>
                </div>
              </>
            ) : (
              <>
                <p className="gl-prompt">{charge === 0 ? '양·뭉과 함께 오늘의 보물을 뽑아볼까요?' : charge >= 100 ? '가득 찼어요! 개봉합니다…' : '상자를 눌러 기운을 모아요!'}</p>
                <div className="gl-meter"><span style={{ width: `${charge}%`, background: auraColor }} /></div>
                <button className="ym-press" onClick={tapCharge} style={cta(true, auraColor)}>{charge === 0 ? '✨ 기운 모으기' : '더 모으기 (탭)'}</button>
              </>
            )}
          </div>
        </section>
      ) : (
        <section>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>
            획득한 실물 보물을 진열했어요. 카드를 기울여 보세요 (2.5D).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {SAMPLE_ITEMS.map((it) => {
              const owned = dex.includes(it.id);
              const rc2 = RARITY[it.rarity];
              return (
                <div key={it.id} className="gl-shelf" style={{ borderColor: owned ? rc2.color : 'var(--glass-border)' }}>
                  {owned ? <Item25D item={it} size={130} /> : <div className="gl-shelf-empty">？</div>}
                  <p className="gl-shelf-name" style={{ color: owned ? 'var(--ink)' : 'var(--ink-faint)' }}>
                    {owned ? it.korean : '미획득'}
                  </p>
                  {owned && <span className="gl-shelf-tag" style={{ color: rc2.color, borderColor: rc2.color }}>{rc2.label}</span>}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

function pill(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 999,
    border: `1.5px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
    background: active ? 'var(--accent-soft)' : 'var(--glass-bg-strong)',
    color: active ? 'var(--accent)' : 'var(--ink-soft)', fontWeight: 800, fontSize: 13, cursor: 'pointer',
  };
}
function cta(primary: boolean, color?: string): React.CSSProperties {
  return {
    flex: 1, padding: '13px 16px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 850, fontSize: 15,
    background: primary ? (color ?? 'var(--accent)') : 'var(--glass-bg-strong)',
    color: primary ? '#fff' : 'var(--ink)',
    boxShadow: primary ? `0 8px 22px ${color ? color + '55' : 'rgba(185,56,46,.3)'}` : 'none',
  };
}

const STYLE = `
.gl-root{ --stage:#171019; }
.gl-stage{ position:relative; height:min(58svh,520px); border-radius:24px; overflow:hidden; display:flex; align-items:center; justify-content:center;
  background:radial-gradient(circle at 50% 30%, #2a1f33, #15101b 70%); border:1px solid rgba(255,255,255,.08);
  box-shadow:inset 0 0 60px rgba(0,0,0,.5); }
.gl-stage-light{ position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--aura,#caa15c), transparent 55%), transparent 46%);
  animation:gl-pulse 2.4s ease-in-out infinite; }
.gl-stage-floor{ position:absolute; left:-20%; right:-20%; bottom:-8%; height:42%; pointer-events:none;
  background:repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 42px);
  transform:perspective(360px) rotateX(64deg); opacity:.5; }
@keyframes gl-pulse{ 0%,100%{opacity:.7} 50%{opacity:1} }
.gl-box{ position:relative; width:150px; height:130px; cursor:pointer; z-index:2; filter:drop-shadow(0 18px 26px rgba(0,0,0,.5)); }
.gl-box.is-charging{ animation:gl-tremble .18s linear infinite; }
@keyframes gl-tremble{ 0%,100%{transform:translate(0,0) rotate(0)} 25%{transform:translate(-2px,1px) rotate(-1.4deg)} 75%{transform:translate(2px,-1px) rotate(1.4deg)} }
.gl-box-aura{ position:absolute; inset:-30%; border-radius:50%; pointer-events:none;
  background:radial-gradient(circle, color-mix(in srgb, var(--aura,#caa15c), transparent 40%), transparent 64%);
  animation:gl-pulse 1.3s ease-in-out infinite; }
.gl-box-body{ position:absolute; left:8px; right:8px; bottom:0; height:78px; border-radius:10px 10px 14px 14px;
  background:linear-gradient(180deg,#b23a2f,#7d2620); border:2px solid #2a1810; box-shadow:inset 0 4px 0 rgba(255,255,255,.18); }
.gl-box-lid{ position:absolute; left:0; right:0; top:18px; height:36px; border-radius:12px;
  background:linear-gradient(180deg,#caa14a,#9c7a30); border:2px solid #2a1810; box-shadow:inset 0 3px 0 rgba(255,255,255,.3); z-index:1; }
.gl-box-seal{ position:absolute; left:50%; top:62px; transform:translateX(-50%); z-index:2; font-size:22px; font-weight:900; color:#fff2dc;
  text-shadow:0 1px 2px rgba(0,0,0,.5); }
.gl-cast{ position:absolute; left:0; right:0; bottom:128px; display:flex; justify-content:center; gap:120px; z-index:1; pointer-events:none; animation:gl-walkin .6s ease both; }
@keyframes gl-walkin{ from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:none} }
.gl-reveal{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:3; }
.gl-pillar{ position:absolute; left:50%; top:-10%; width:120px; height:120%; transform:translateX(-50%);
  background:linear-gradient(180deg, color-mix(in srgb, var(--c,#e8b23a), transparent 20%), transparent 80%);
  filter:blur(8px); opacity:.7; animation:gl-pillar .9s ease-out both; mix-blend-mode:screen; }
@keyframes gl-pillar{ 0%{opacity:0; transform:translateX(-50%) scaleY(.2)} 40%{opacity:.85} 100%{opacity:.55; transform:translateX(-50%) scaleY(1)} }
.gl-spark{ position:absolute; left:50%; top:50%; width:6px; height:6px; border-radius:50%; background:var(--c,#e8b23a);
  box-shadow:0 0 10px var(--c,#e8b23a); transform:rotate(var(--a)) translateY(0); animation:gl-spark .8s cubic-bezier(.2,.7,.3,1) var(--d,0s) both; }
@keyframes gl-spark{ 0%{opacity:0; transform:rotate(var(--a)) translateY(0) scale(.4)} 25%{opacity:1} 100%{opacity:0; transform:rotate(var(--a)) translateY(-170px) scale(1)} }
.gl-rise{ position:relative; z-index:2; animation:gl-rise .8s cubic-bezier(.16,.9,.24,1.05) both; }
@keyframes gl-rise{ 0%{opacity:0; transform:translateY(60px) scale(.6)} 60%{opacity:1} 100%{opacity:1; transform:none} }
.gl-rarity-badge{ position:absolute; top:-6px; left:50%; transform:translateX(-50%); z-index:3; padding:3px 12px; border-radius:999px;
  color:#1a1208; font-weight:900; font-size:12px; letter-spacing:.05em; box-shadow:0 4px 12px rgba(0,0,0,.4); }
.gl-25d-wrap{ perspective:760px; display:inline-flex; align-items:center; justify-content:center; }
.gl-25d{ position:relative; width:100%; height:100%; transform-style:preserve-3d;
  transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)); transition:transform .18s ease; animation:gl-float 3.4s ease-in-out infinite; }
@keyframes gl-float{ 0%,100%{translate:0 0} 50%{translate:0 -10px} }
.gl-25d-glow{ position:absolute; inset:-12%; border-radius:50%; transform:translateZ(-40px); filter:blur(6px); }
.gl-25d-art{ position:absolute; inset:6%; transform:translateZ(28px); border-radius:18px; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.gl-25d-art img{ width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 10px 16px rgba(0,0,0,.4)); }
.gl-25d-fallback{ width:90%; height:90%; border-radius:16px; border:2px dashed; display:flex; align-items:center; justify-content:center;
  color:#fff; font-weight:800; font-size:18px; background:rgba(255,255,255,.06); text-align:center; padding:8px; }
.gl-25d-holo{ position:absolute; inset:0; pointer-events:none; mix-blend-mode:screen; opacity:.5;
  background:linear-gradient(115deg, transparent 38%, rgba(255,255,255,.5) 46%, transparent 54%); background-size:240% 100%;
  animation:gl-holo 2.6s linear infinite; }
@keyframes gl-holo{ from{background-position:180% 0} to{background-position:-80% 0} }
.gl-25d-floor{ position:absolute; left:14%; right:14%; bottom:2%; height:12px; border-radius:50%; transform:translateZ(-30px);
  background:radial-gradient(ellipse, rgba(0,0,0,.42), transparent 70%); filter:blur(3px); }
.gl-panel{ position:absolute; left:14px; right:14px; bottom:14px; z-index:4; padding:14px 16px; border-radius:18px;
  background:rgba(20,14,11,.62); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.12); }
.gl-prompt{ margin:0 0 10px; color:#f4ede0; font-weight:800; font-size:14px; text-align:center; }
.gl-meter{ height:10px; border-radius:999px; background:rgba(255,255,255,.12); overflow:hidden; margin-bottom:12px; }
.gl-meter span{ display:block; height:100%; border-radius:999px; transition:width .2s ease; }
.gl-get{ margin:0; color:#fff7eb; font-weight:900; font-size:17px; text-align:center; }
.gl-get-sub{ margin:4px 0 0; color:rgba(244,237,224,.72); font-size:12.5px; font-weight:700; text-align:center; }
.gl-shelf{ position:relative; border:1.5px solid; border-radius:18px; padding:14px 10px 30px; display:flex; flex-direction:column; align-items:center;
  background:radial-gradient(circle at 50% 24%, rgba(255,255,255,.05), transparent 60%), var(--glass-bg-strong); min-height:172px; justify-content:center; }
.gl-shelf-empty{ width:120px; height:120px; border-radius:16px; border:2px dashed var(--glass-border); display:flex; align-items:center; justify-content:center;
  color:var(--ink-faint); font-size:32px; font-weight:800; }
.gl-shelf-name{ margin:8px 0 0; font-size:13.5px; font-weight:800; }
.gl-shelf-tag{ position:absolute; bottom:8px; padding:1px 9px; border-radius:999px; border:1px solid; font-size:10.5px; font-weight:900; }
`;
