// 새 가챠 프로토타입 — 「양뭉 보물 개봉식」 (온라인·웅장·2.5D 실물).
// 기존 가챠(Gacha.tsx)·index.html과 분리된 신규 탭. 스타일은 이 파일 안에 self-contained.
// Phase 2: 고희귀도(SSR·UR) 전용 화려한 연출 + 미션 여성 캐릭터 카메오, 다연차(10연차).
import { useRef, useState } from 'react';
import { WRAP } from '../ui/styles';
import { NavBar, type NavBarProps } from './NavBar';
import { MascotFace } from './mascot';
import { speak } from '../tts';

type Rarity = 'common' | 'rare' | 'epic' | 'ssr' | 'ur';
interface ProtoItem { id: string; name: string; korean: string; scene: string; image: string; rarity: Rarity }

const RARITY: Record<Rarity, { label: string; stars: number; color: string; glow: string; weight: number; special: boolean }> = {
  common: { label: '커먼', stars: 2, color: '#b9b2a4', glow: 'rgba(216,210,196,.5)', weight: 50, special: false },
  rare: { label: '레어', stars: 3, color: '#4f93d8', glow: 'rgba(79,147,216,.6)', weight: 30, special: false },
  epic: { label: '에픽', stars: 4, color: '#9a6ad6', glow: 'rgba(154,106,214,.65)', weight: 13, special: false },
  ssr: { label: 'SSR', stars: 5, color: '#e8b23a', glow: 'rgba(232,178,58,.85)', weight: 6, special: true },
  ur: { label: 'UR', stars: 6, color: '#ff5db1', glow: 'rgba(255,93,177,.9)', weight: 1, special: true },
};
const RANK: Rarity[] = ['common', 'rare', 'epic', 'ssr', 'ur'];

// 프로토타입 샘플 — 기존 아이템 이미지를 재활용(이미지 에셋은 수정하지 않음).
const SAMPLE_ITEMS: ProtoItem[] = [
  { id: 'onigiri', name: 'おにぎり', korean: '주먹밥', scene: '편의점', image: '/gacha/items/generated/onigiri.png', rarity: 'common' },
  { id: 'hotsnack', name: 'ホットスナック', korean: '핫스낵', scene: '편의점', image: '/gacha/items/generated/hot-snack.png', rarity: 'common' },
  { id: 'water', name: 'お水', korean: '물 한 잔', scene: '식당', image: '/gacha/items/generated/water-glass.png', rarity: 'common' },
  { id: 'bento', name: 'お弁当', korean: '도시락', scene: '편의점', image: '/gacha/items/generated/bento-box.png', rarity: 'rare' },
  { id: 'teishoku', name: '定食', korean: '정식 세트', scene: '식당', image: '/gacha/items/generated/teishoku-menu.png', rarity: 'rare' },
  { id: 'premium', name: '特上弁当', korean: '프리미엄 도시락', scene: '편의점', image: '/gacha/items/generated/premium-bento.png', rarity: 'epic' },
  { id: 'recommend', name: 'おすすめ膳', korean: '추천 세트', scene: '식당', image: '/gacha/items/generated/recommended-set.png', rarity: 'epic' },
  { id: 'combo', name: '夜食コンボ', korean: '심야 콤보', scene: '편의점', image: '/gacha/items/generated/late-night-combo.png', rarity: 'ssr' },
  { id: 'kingbento', name: '伝説の駅弁', korean: '전설의 에키벤', scene: '전철', image: '/gacha/items/generated/premium-bento.png', rarity: 'ur' },
];

// 미션 여성 캐릭터 — 프로토용 카메오 플레이스홀더(실제 캐릭터 아트는 추후 이 슬롯에 교체).
const CAMEOS = [
  { kana: 'ナナミ', role: '편의점 점원', hue: 330 },
  { kana: 'さくら', role: '식당 직원', hue: 350 },
  { kana: 'ゆい', role: '역무원', hue: 262 },
];

function rollItem(): ProtoItem {
  const total = SAMPLE_ITEMS.reduce((s, it) => s + RARITY[it.rarity].weight, 0);
  let r = Math.random() * total;
  for (const it of SAMPLE_ITEMS) { r -= RARITY[it.rarity].weight; if (r <= 0) return it; }
  return SAMPLE_ITEMS[0];
}
function rollMany(n: number): ProtoItem[] {
  const out = Array.from({ length: n }, rollItem);
  // 10연차 보장: 에픽 이상 1장 확정.
  if (n >= 10 && !out.some((it) => RANK.indexOf(it.rarity) >= 2)) {
    const pool = SAMPLE_ITEMS.filter((it) => RANK.indexOf(it.rarity) >= 2);
    out[n - 1] = pool[Math.floor(Math.random() * pool.length)];
  }
  return out;
}
const bestOf = (items: ProtoItem[]) => items.reduce((b, it) => (RANK.indexOf(it.rarity) > RANK.indexOf(b.rarity) ? it : b), items[0]);

const DEX_KEY = 'yangmung:gachalab:dex:v1';
const loadDex = (): string[] => { try { return JSON.parse(localStorage.getItem(DEX_KEY) || '[]'); } catch { return []; } };
const saveDex = (ids: string[]) => { try { localStorage.setItem(DEX_KEY, JSON.stringify(ids)); } catch { /* noop */ } };

const Stars = ({ n, color }: { n: number; color: string }) => (
  <span className="gl-stars" style={{ color }}>{'★'.repeat(n)}</span>
);

// ── 미션 여성 캐릭터 카메오(플레이스홀더) — SSR/UR에서 등장 ──
function Cameo({ idx, side }: { idx: number; side: 'l' | 'r' }) {
  const c = CAMEOS[idx % CAMEOS.length];
  return (
    <div className={`gl-cameo gl-cameo-${side}`} style={{ ['--hue' as string]: String(c.hue) }} aria-hidden>
      <span className="gl-cameo-fig"><i /><b /></span>
      <span className="gl-cameo-name" lang="ja">{c.kana}</span>
      <span className="gl-cameo-role">{c.role}</span>
    </div>
  );
}

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
  const [phase, setPhase] = useState<'idle' | 'charging' | 'single' | 'multi'>('idle');
  const [results, setResults] = useState<ProtoItem[]>([]);
  const [dex, setDex] = useState<string[]>(() => loadDex());

  function startPull(n: number) {
    if (phase === 'charging') return;
    setPhase('charging');
    window.setTimeout(() => {
      const items = rollMany(n);
      setResults(items);
      setDex((d) => { const nx = [...new Set([...d, ...items.map((i) => i.id)])]; saveDex(nx); return nx; });
      const best = bestOf(items);
      speak(best.name);
      setPhase(n === 1 ? 'single' : 'multi');
    }, n === 1 ? 720 : 900);
  }
  function again() { setResults([]); setPhase('idle'); }

  const single = phase === 'single' ? results[0] : null;
  const best = results.length ? bestOf(results) : null;
  const special = !!best && RARITY[best.rarity].special;
  const bc = best ? RARITY[best.rarity] : null;
  const auraColor = special && bc ? bc.color : '#caa15c';

  return (
    <main className="gl-root" style={{ ...WRAP, minHeight: '100svh', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLE}</style>
      <NavBar {...nav} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button className="ym-press" onClick={() => { setTab('draw'); }} style={pill(tab === 'draw')}>✨ 뽑기</button>
        <button className="ym-press" onClick={() => { setTab('dex'); again(); }} style={pill(tab === 'dex')}>🗃 보물 도감 <b style={{ opacity: .7 }}>{dex.length}/{SAMPLE_ITEMS.length}</b></button>
        <span style={{ flex: 1 }} />
        <button className="ym-press" onClick={onExit} style={{ ...pill(false), padding: '8px 12px' }}>← 홈</button>
      </div>

      {tab === 'draw' ? (
        <section className={`gl-stage ${special ? 'is-special' : ''}`} aria-label="보물 개봉식 무대">
          <span className="gl-stage-light" aria-hidden style={{ ['--aura' as string]: auraColor }} />
          <span className="gl-stage-floor" aria-hidden />
          {special && <span className="gl-rainbow" aria-hidden />}

          {(phase === 'idle' || phase === 'charging') && (
            <div className={`gl-box ${phase === 'charging' ? 'is-charging' : ''}`} aria-hidden>
              <span className="gl-box-aura" />
              <span className="gl-box-lid" />
              <span className="gl-box-body" />
              <span className="gl-box-seal">福</span>
            </div>
          )}

          {/* 단일 개봉 */}
          {single && (
            <div className="gl-reveal">
              <span className="gl-pillar" aria-hidden style={{ ['--c' as string]: bc!.color }} />
              {Array.from({ length: special ? 22 : 14 }).map((_, i) => (
                <span key={i} className="gl-spark" aria-hidden style={{ ['--c' as string]: bc!.color, ['--a' as string]: `${i * (360 / (special ? 22 : 14))}deg`, ['--d' as string]: `${i * 0.03}s` }} />
              ))}
              {special && (
                <>
                  <Cameo idx={0} side="l" />
                  {single.rarity === 'ur' && <Cameo idx={2} side="r" />}
                  <span className="gl-special-tag" style={{ color: bc!.color }}>{single.rarity === 'ur' ? '✦ UR 등장! ✦' : '✧ SSR ✧'}</span>
                </>
              )}
              <div className="gl-rise">
                <span className="gl-rarity-badge" style={{ background: bc!.color }}>{bc!.label}</span>
                <Item25D item={single} size={special ? 224 : 206} />
                <Stars n={bc!.stars} color={bc!.color} />
              </div>
            </div>
          )}

          {/* 캐릭터 — 양·뭉 */}
          {phase !== 'multi' && (
            <div className="gl-cast" aria-hidden>
              <MascotFace who="yang" mood={single ? 'done' : 'tip'} size={62} style={{ filter: 'drop-shadow(0 10px 16px rgba(0,0,0,.4))' }} />
              <MascotFace who="mung" mood={single ? 'correct' : 'default'} size={62} style={{ filter: 'drop-shadow(0 10px 16px rgba(0,0,0,.4))' }} />
            </div>
          )}

          {/* 다연차 그리드 */}
          {phase === 'multi' && (
            <div className="gl-multi">
              {special && bc && (
                <div className="gl-multi-feat" style={{ ['--c' as string]: bc.color }}>
                  <Cameo idx={0} side="l" />
                  {best!.rarity === 'ur' && <Cameo idx={2} side="r" />}
                  <span className="gl-special-tag" style={{ color: bc.color }}>{best!.rarity === 'ur' ? '✦ UR 등장! ✦' : '✧ SSR ✧'}</span>
                  <Item25D item={best!} size={150} />
                  <Stars n={bc.stars} color={bc.color} />
                </div>
              )}
              <div className="gl-grid">
                {results.map((it, i) => {
                  const rc = RARITY[it.rarity];
                  return (
                    <div key={i} className="gl-cell" style={{ ['--c' as string]: rc.color, animationDelay: `${i * 0.06}s` }}>
                      <Item25D item={it} size={56} />
                      <Stars n={rc.stars} color={rc.color} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 하단 패널 */}
          <div className="gl-panel">
            {phase === 'idle' && (
              <>
                <p className="gl-prompt">양·뭉과 함께 오늘의 보물을 뽑아볼까요?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="ym-press" onClick={() => startPull(1)} style={cta(true, '#caa15c')}>✨ 1회 뽑기</button>
                  <button className="ym-press" onClick={() => startPull(10)} style={cta(true, '#b9382e')}>🎴 10연차</button>
                </div>
              </>
            )}
            {phase === 'charging' && <p className="gl-prompt gl-charge-txt">기운을 모으는 중…</p>}
            {(phase === 'single' || phase === 'multi') && best && (
              <>
                <p className="gl-get">{phase === 'multi' ? `${results.length}개 획득!` : '획득!'} {single && <b lang="ja" style={{ color: bc!.color }}>{single.name}</b>}{phase === 'multi' && <b style={{ color: bc!.color }}> 최고 {bc!.label}</b>}</p>
                <p className="gl-get-sub">{phase === 'single' && single ? `${single.korean} · ${single.scene}에서 얻은 보물 · ` : '도감에 등록 · '}기울이면 입체로 보여요</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="ym-press" onClick={() => startPull(phase === 'multi' ? 10 : 1)} style={cta(true)}>다시 뽑기</button>
                  <button className="ym-press" onClick={() => { setTab('dex'); again(); }} style={cta(false)}>도감 보기</button>
                </div>
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
            {[...SAMPLE_ITEMS].sort((a, b) => RANK.indexOf(b.rarity) - RANK.indexOf(a.rarity)).map((it) => {
              const owned = dex.includes(it.id);
              const rc2 = RARITY[it.rarity];
              return (
                <div key={it.id} className="gl-shelf" style={{ borderColor: owned ? rc2.color : 'var(--glass-border)' }}>
                  {owned ? <Item25D item={it} size={130} /> : <div className="gl-shelf-empty">？</div>}
                  <p className="gl-shelf-name" style={{ color: owned ? 'var(--ink)' : 'var(--ink-faint)' }}>{owned ? it.korean : '미획득'}</p>
                  {owned && <span className="gl-shelf-tag" style={{ color: rc2.color, borderColor: rc2.color }}>{rc2.label} {'★'.repeat(rc2.stars)}</span>}
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
.gl-stage{ position:relative; height:min(60svh,540px); border-radius:24px; overflow:hidden; display:flex; align-items:center; justify-content:center;
  background:radial-gradient(circle at 50% 30%, #2a1f33, #15101b 70%); border:1px solid rgba(255,255,255,.08); box-shadow:inset 0 0 60px rgba(0,0,0,.5); }
.gl-stage.is-special{ background:radial-gradient(circle at 50% 28%, #2c1430, #0e0a14 72%); }
.gl-stage-light{ position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--aura,#caa15c), transparent 55%), transparent 46%); animation:gl-pulse 2.4s ease-in-out infinite; }
.gl-stage-floor{ position:absolute; left:-20%; right:-20%; bottom:-8%; height:42%; pointer-events:none;
  background:repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 42px); transform:perspective(360px) rotateX(64deg); opacity:.5; }
.gl-rainbow{ position:absolute; inset:-30%; pointer-events:none; z-index:0; opacity:.5; mix-blend-mode:screen;
  background:conic-gradient(from 0deg, #ff5db1,#ffb14e,#fff36b,#5de2a3,#5db8ff,#b06bff,#ff5db1); animation:gl-spin 8s linear infinite; filter:blur(2px);
  -webkit-mask:radial-gradient(circle at 50% 40%, transparent 0 22%, #000 40%, transparent 72%); mask:radial-gradient(circle at 50% 40%, transparent 0 22%, #000 40%, transparent 72%); }
@keyframes gl-spin{ to{ transform:rotate(360deg) } }
@keyframes gl-pulse{ 0%,100%{opacity:.7} 50%{opacity:1} }
.gl-box{ position:relative; width:150px; height:130px; z-index:2; filter:drop-shadow(0 18px 26px rgba(0,0,0,.5)); }
.gl-box.is-charging{ animation:gl-tremble .16s linear infinite; }
@keyframes gl-tremble{ 0%,100%{transform:translate(0,0) rotate(0)} 25%{transform:translate(-3px,1px) rotate(-2deg)} 75%{transform:translate(3px,-1px) rotate(2deg)} }
.gl-box-aura{ position:absolute; inset:-30%; border-radius:50%; pointer-events:none;
  background:radial-gradient(circle, rgba(216,162,74,.5), transparent 64%); animation:gl-pulse 1.3s ease-in-out infinite; }
.gl-box-body{ position:absolute; left:8px; right:8px; bottom:0; height:78px; border-radius:10px 10px 14px 14px;
  background:linear-gradient(180deg,#b23a2f,#7d2620); border:2px solid #2a1810; box-shadow:inset 0 4px 0 rgba(255,255,255,.18); }
.gl-box-lid{ position:absolute; left:0; right:0; top:18px; height:36px; border-radius:12px;
  background:linear-gradient(180deg,#caa14a,#9c7a30); border:2px solid #2a1810; box-shadow:inset 0 3px 0 rgba(255,255,255,.3); z-index:1; }
.gl-box-seal{ position:absolute; left:50%; top:62px; transform:translateX(-50%); z-index:2; font-size:22px; font-weight:900; color:#fff2dc; text-shadow:0 1px 2px rgba(0,0,0,.5); }
.gl-cast{ position:absolute; left:0; right:0; bottom:128px; display:flex; justify-content:center; gap:120px; z-index:1; pointer-events:none; animation:gl-walkin .6s ease both; }
@keyframes gl-walkin{ from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:none} }
.gl-reveal{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:3; }
.gl-pillar{ position:absolute; left:50%; top:-10%; width:120px; height:120%; transform:translateX(-50%);
  background:linear-gradient(180deg, color-mix(in srgb, var(--c,#e8b23a), transparent 20%), transparent 80%); filter:blur(8px); opacity:.7; animation:gl-pillar .9s ease-out both; mix-blend-mode:screen; }
@keyframes gl-pillar{ 0%{opacity:0; transform:translateX(-50%) scaleY(.2)} 40%{opacity:.85} 100%{opacity:.55; transform:translateX(-50%) scaleY(1)} }
.gl-spark{ position:absolute; left:50%; top:50%; width:6px; height:6px; border-radius:50%; background:var(--c,#e8b23a); box-shadow:0 0 10px var(--c,#e8b23a);
  transform:rotate(var(--a)) translateY(0); animation:gl-spark .8s cubic-bezier(.2,.7,.3,1) var(--d,0s) both; }
@keyframes gl-spark{ 0%{opacity:0; transform:rotate(var(--a)) translateY(0) scale(.4)} 25%{opacity:1} 100%{opacity:0; transform:rotate(var(--a)) translateY(-180px) scale(1)} }
.gl-rise{ position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; animation:gl-rise .8s cubic-bezier(.16,.9,.24,1.05) both; }
@keyframes gl-rise{ 0%{opacity:0; transform:translateY(60px) scale(.6)} 60%{opacity:1} 100%{opacity:1; transform:none} }
.gl-rarity-badge{ position:absolute; top:-10px; left:50%; transform:translateX(-50%); z-index:3; padding:3px 12px; border-radius:999px;
  color:#1a1208; font-weight:900; font-size:12px; letter-spacing:.05em; box-shadow:0 4px 12px rgba(0,0,0,.4); }
.gl-stars{ display:block; margin-top:4px; font-size:14px; letter-spacing:2px; text-shadow:0 1px 2px rgba(0,0,0,.5); }
.gl-special-tag{ position:absolute; top:8%; left:50%; transform:translateX(-50%); z-index:5; font-weight:1000; font-size:18px; letter-spacing:.08em;
  text-shadow:0 2px 10px rgba(0,0,0,.6); animation:gl-tagpop .6s cubic-bezier(.2,.8,.3,1.2) both; }
@keyframes gl-tagpop{ 0%{opacity:0; transform:translateX(-50%) scale(.5)} 100%{opacity:1; transform:translateX(-50%) scale(1)} }
.gl-cameo{ position:absolute; bottom:14%; z-index:4; width:96px; display:flex; flex-direction:column; align-items:center; animation:gl-cameo-in .7s cubic-bezier(.16,.9,.24,1.05) both; }
.gl-cameo-l{ left:6px; } .gl-cameo-r{ right:6px; }
@keyframes gl-cameo-in{ from{opacity:0; transform:translateY(28px) scale(.8)} to{opacity:1; transform:none} }
.gl-cameo-fig{ position:relative; width:84px; height:104px; border-radius:18px; overflow:hidden;
  background:linear-gradient(180deg, hsl(var(--hue,330) 70% 70%), hsl(var(--hue,330) 55% 42%));
  border:2px solid rgba(255,255,255,.55); box-shadow:0 8px 22px rgba(0,0,0,.45), 0 0 20px hsl(var(--hue,330) 80% 60% / .5); }
.gl-cameo-fig i{ position:absolute; left:50%; top:20px; width:30px; height:30px; margin-left:-15px; border-radius:50%; background:rgba(255,255,255,.92); }
.gl-cameo-fig b{ position:absolute; left:50%; bottom:0; width:64px; height:48px; margin-left:-32px; border-radius:40px 40px 0 0; background:rgba(255,255,255,.85); }
.gl-cameo-name{ margin-top:5px; font-size:13px; font-weight:900; color:#fff7eb; text-shadow:0 1px 3px rgba(0,0,0,.6); }
.gl-cameo-role{ font-size:10px; font-weight:700; color:rgba(255,247,235,.78); }
.gl-multi{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; z-index:3; padding:8px 10px 130px; overflow:auto; }
.gl-multi-feat{ position:relative; display:flex; flex-direction:column; align-items:center; padding:6px 10px 0; }
.gl-grid{ display:grid; grid-template-columns:repeat(5, minmax(0,1fr)); gap:7px; width:100%; max-width:360px; }
.gl-cell{ display:flex; flex-direction:column; align-items:center; padding:5px 2px 4px; border-radius:12px; border:1px solid color-mix(in srgb, var(--c,#888), transparent 50%);
  background:color-mix(in srgb, var(--c,#888), transparent 86%); animation:gl-cellpop .4s cubic-bezier(.2,.8,.3,1.1) both; }
.gl-cell .gl-stars{ font-size:9px; letter-spacing:0; margin-top:1px; }
@keyframes gl-cellpop{ 0%{opacity:0; transform:translateY(12px) scale(.7)} 100%{opacity:1; transform:none} }
.gl-25d-wrap{ perspective:760px; display:inline-flex; align-items:center; justify-content:center; }
.gl-25d{ position:relative; width:100%; height:100%; transform-style:preserve-3d;
  transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)); transition:transform .18s ease; animation:gl-float 3.4s ease-in-out infinite; }
@keyframes gl-float{ 0%,100%{translate:0 0} 50%{translate:0 -10px} }
.gl-25d-glow{ position:absolute; inset:-12%; border-radius:50%; transform:translateZ(-40px); filter:blur(6px); }
.gl-25d-art{ position:absolute; inset:6%; transform:translateZ(28px); border-radius:18px; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.gl-25d-art img{ width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 10px 16px rgba(0,0,0,.4)); }
.gl-25d-fallback{ width:90%; height:90%; border-radius:16px; border:2px dashed; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:14px; background:rgba(255,255,255,.06); text-align:center; padding:6px; }
.gl-25d-holo{ position:absolute; inset:0; pointer-events:none; mix-blend-mode:screen; opacity:.5;
  background:linear-gradient(115deg, transparent 38%, rgba(255,255,255,.5) 46%, transparent 54%); background-size:240% 100%; animation:gl-holo 2.6s linear infinite; }
@keyframes gl-holo{ from{background-position:180% 0} to{background-position:-80% 0} }
.gl-25d-floor{ position:absolute; left:14%; right:14%; bottom:2%; height:10px; border-radius:50%; transform:translateZ(-30px);
  background:radial-gradient(ellipse, rgba(0,0,0,.42), transparent 70%); filter:blur(3px); }
.gl-panel{ position:absolute; left:14px; right:14px; bottom:14px; z-index:6; padding:14px 16px; border-radius:18px;
  background:rgba(20,14,11,.66); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,.12); }
.gl-prompt{ margin:0 0 10px; color:#f4ede0; font-weight:800; font-size:14px; text-align:center; }
.gl-charge-txt{ margin:0; animation:gl-pulse 1s ease-in-out infinite; }
.gl-get{ margin:0; color:#fff7eb; font-weight:900; font-size:16px; text-align:center; }
.gl-get-sub{ margin:4px 0 0; color:rgba(244,237,224,.72); font-size:12.5px; font-weight:700; text-align:center; }
.gl-shelf{ position:relative; border:1.5px solid; border-radius:18px; padding:14px 10px 32px; display:flex; flex-direction:column; align-items:center;
  background:radial-gradient(circle at 50% 24%, rgba(255,255,255,.05), transparent 60%), var(--glass-bg-strong); min-height:172px; justify-content:center; }
.gl-shelf-empty{ width:120px; height:120px; border-radius:16px; border:2px dashed var(--glass-border); display:flex; align-items:center; justify-content:center; color:var(--ink-faint); font-size:32px; font-weight:800; }
.gl-shelf-name{ margin:8px 0 0; font-size:13.5px; font-weight:800; }
.gl-shelf-tag{ position:absolute; bottom:7px; padding:1px 9px; border-radius:999px; border:1px solid; font-size:10px; font-weight:900; }
`;
