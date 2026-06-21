// 보물 개봉식 가챠 (상용 버전) — 온라인·웅장·2.5D 실물.
// 실제 컬렉션 파이프라인 연동: drawGacha(전 등급 직접 드롭) → 컬렉션 저장 → 도감 반영.
// 고희귀도(SSR=금·UR=다이아) 전용 화려한 개봉 + 미션 여성 캐릭터 카메오, 다연차(10연차).
// 캐릭터/일부 아이템 이미지는 별도 제작(친구 작업) — CAST.art / 아이템 image 슬롯에 들어온다.
import { useMemo, useRef, useState } from 'react';
import { CONTENT } from '../content';
import { isMissionUnlocked, type ProgressMap } from '../learn/progress';
import { drawGacha, loadCollection, saveCollection, bestRarity, totalItems, type Collection, type Rarity } from '../learn/collection';
import { gachaLabItemForPlace } from '../learn/gachaItems';
import { WRAP } from '../ui/styles';
import { NavBar, type NavBarProps } from './NavBar';
import { MascotFace } from './mascot';
import { speak } from '../tts';

// 컬렉션 등급 → 시각 등급(별·색·특별 연출 여부).
const VIS: Record<Rarity, { label: string; stars: number; color: string; glow: string; special: boolean }> = {
  basic: { label: '커먼', stars: 2, color: '#b9b2a4', glow: 'rgba(216,210,196,.5)', special: false },
  bronze: { label: '레어', stars: 3, color: '#c98a4b', glow: 'rgba(201,138,75,.6)', special: false },
  silver: { label: '에픽', stars: 4, color: '#aab2be', glow: 'rgba(170,178,190,.62)', special: false },
  gold: { label: 'SSR', stars: 5, color: '#e8b23a', glow: 'rgba(232,178,58,.85)', special: true },
  diamond: { label: 'UR', stars: 6, color: '#5bc7e0', glow: 'rgba(91,199,224,.9)', special: true },
};
const RANK: Rarity[] = ['basic', 'bronze', 'silver', 'gold', 'diamond'];

interface DrawItem { sceneId: string; name: string; korean: string; place: string; image: string; rarity: Rarity }

// 미션 여성 캐릭터 카메오 — 장면(place)별. art가 채워지면 실제 캐릭터 이미지로, 없으면 실루엣 플레이스홀더.
interface Cast { kana: string; role: string; hue: number; art?: string }
const CAST: Record<string, Cast> = {
  '편의점': { kana: 'ナナミ', role: '편의점 점원', hue: 330 },
  '식당': { kana: 'さくら', role: '식당 직원', hue: 350 },
  '라멘': { kana: 'みお', role: '라멘집 직원', hue: 16 },
  '카페': { kana: 'リン', role: '카페 바리스타', hue: 28 },
  '전철': { kana: 'ゆい', role: '역무원', hue: 262 },
  '신칸센': { kana: 'ゆい', role: '역무원', hue: 248 },
  '호텔': { kana: 'あおい', role: '호텔 프런트', hue: 210 },
  '료칸': { kana: 'はな', role: '료칸 안주인', hue: 300 },
  '환전': { kana: 'あや', role: '은행원', hue: 200 },
  '약국': { kana: 'みき', role: '약사', hue: 158 },
  '쇼핑': { kana: 'えま', role: '편집샵 점원', hue: 320 },
  '관광안내소': { kana: 'ことね', role: '관광 안내원', hue: 184 },
  '축제': { kana: 'まつり', role: '축제 도우미', hue: 8 },
};
const DEFAULT_CAST: Cast = { kana: 'なかま', role: '여행 동료', hue: 280 };
const castFor = (place: string): Cast => CAST[place] ?? DEFAULT_CAST;

function artFor(sceneId: string, rarity: Rarity): DrawItem {
  const m = CONTENT.missions.find((x) => x.id === sceneId);
  const place = (m?.place ?? m?.scenario ?? sceneId) as string;
  const a = gachaLabItemForPlace(place, rarity);
  return { sceneId, name: a.jaTitle ?? a.title, korean: a.title, place, image: a.image ?? '', rarity };
}
const bestOf = (items: DrawItem[]) => items.reduce((b, it) => (RANK.indexOf(it.rarity) > RANK.indexOf(b.rarity) ? it : b), items[0]);

const Stars = ({ n, color }: { n: number; color: string }) => (
  <span className="gl-stars" style={{ color }}>{'★'.repeat(n)}</span>
);

function Cameo({ place, side }: { place: string; side: 'l' | 'r' }) {
  const c = castFor(place);
  return (
    <div className={`gl-cameo gl-cameo-${side}`} style={{ ['--hue' as string]: String(c.hue) }} aria-hidden>
      <span className="gl-cameo-fig">
        {c.art ? <img src={c.art} alt="" /> : <><i /><b /></>}
      </span>
      <span className="gl-cameo-name" lang="ja">{c.kana}</span>
      <span className="gl-cameo-role">{c.role}</span>
    </div>
  );
}

// ── 2.5D 아이템 — 포인터/자동 틸트 + 홀로 시트 + 부유 ──
function Item25D({ item, size = 200 }: { item: DrawItem; size?: number }) {
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
  const v = VIS[item.rarity];
  return (
    <div className="gl-25d-wrap" style={{ width: size, height: size }} onPointerMove={onMove} onPointerLeave={reset}>
      <div ref={ref} className="gl-25d">
        <div className="gl-25d-glow" style={{ background: `radial-gradient(circle, ${v.glow}, transparent 68%)` }} />
        <div className="gl-25d-art">
          {failed || !item.image ? (
            <div className="gl-25d-fallback" style={{ borderColor: v.color }}><span lang="ja">{item.name}</span></div>
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

interface Props { nav: NavBarProps; progress: ProgressMap; onExit: () => void }

export function GachaLab({ nav, progress, onExit }: Props) {
  const [tab, setTab] = useState<'draw' | 'dex'>('draw');
  const [phase, setPhase] = useState<'idle' | 'charging' | 'single' | 'multi'>('idle');
  const [results, setResults] = useState<DrawItem[]>([]);
  const [collection, setCollection] = useState<Collection>(() => loadCollection());

  const scenes = useMemo(() => {
    const list = CONTENT.missions
      .filter((m) => m.id !== 'C0' && isMissionUnlocked(m.id, progress))
      .map((m) => ({ id: m.id, place: (m.place ?? m.scenario ?? m.id) as string }));
    return list.length ? list : [{ id: 'C1', place: '편의점' }];
  }, [progress]);
  const sceneIds = useMemo(() => scenes.map((s) => s.id), [scenes]);
  const ownedCount = scenes.filter((s) => totalItems(collection.cards[s.id]) > 0).length;

  function pull(n: number) {
    if (phase === 'charging') return;
    setPhase('charging');
    window.setTimeout(() => {
      const { collection: nc, results: drops } = drawGacha(collection, sceneIds, n);
      saveCollection(nc);
      setCollection(nc);
      const items = drops.map((d) => artFor(d.sceneId, d.rarity));
      setResults(items);
      speak(bestOf(items).name);
      setPhase(n === 1 ? 'single' : 'multi');
    }, n === 1 ? 720 : 900);
  }
  function reset() { setResults([]); setPhase('idle'); }

  const single = phase === 'single' ? results[0] : null;
  const best = results.length ? bestOf(results) : null;
  const bv = best ? VIS[best.rarity] : null;
  const special = !!bv && bv.special;
  const auraColor = special && bv ? bv.color : '#caa15c';

  return (
    <main className="gl-root" style={{ ...WRAP, minHeight: '100svh', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLE}</style>
      <NavBar {...nav} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button className="ym-press" onClick={() => setTab('draw')} style={pill(tab === 'draw')}>✨ 뽑기</button>
        <button className="ym-press" onClick={() => { setTab('dex'); reset(); }} style={pill(tab === 'dex')}>🗃 보물 도감 <b style={{ opacity: .7 }}>{ownedCount}/{scenes.length}</b></button>
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
              <span className="gl-box-backlight" />
              <span className="gl-box-aura" />
              <span className="gl-box-shadow" />
              <span className="gl-box-lid" />
              <span className="gl-box-slit" />
              <span className="gl-box-body" />
              <span className="gl-box-rune" />
              <span className="gl-box-seal">福</span>
            </div>
          )}

          {single && bv && (
            <div className="gl-reveal">
              <span className="gl-burst-ring" aria-hidden style={{ ['--c' as string]: bv.color }} />
              <span className="gl-pillar" aria-hidden style={{ ['--c' as string]: bv.color }} />
              {Array.from({ length: special ? 22 : 14 }).map((_, i) => (
                <span key={i} className="gl-spark" aria-hidden style={{ ['--c' as string]: bv.color, ['--a' as string]: `${i * (360 / (special ? 22 : 14))}deg`, ['--d' as string]: `${i * 0.03}s` }} />
              ))}
              {special && (
                <>
                  <Cameo place={single.place} side="l" />
                  {single.rarity === 'diamond' && <Cameo place={single.place} side="r" />}
                  <span className="gl-special-tag" style={{ color: bv.color }}>{single.rarity === 'diamond' ? '✦ UR 등장! ✦' : '✧ SSR ✧'}</span>
                </>
              )}
              <div className="gl-rise">
                <span className="gl-rarity-badge" style={{ background: bv.color }}>{bv.label}</span>
                <Item25D item={single} size={special ? 224 : 206} />
                <Stars n={bv.stars} color={bv.color} />
              </div>
            </div>
          )}

          {phase !== 'multi' && (
            <div className="gl-cast" aria-hidden>
              <MascotFace who="yang" mood={single ? 'done' : 'tip'} size={62} style={{ filter: 'drop-shadow(0 10px 16px rgba(0,0,0,.4))' }} />
              <MascotFace who="mung" mood={single ? 'correct' : 'default'} size={62} style={{ filter: 'drop-shadow(0 10px 16px rgba(0,0,0,.4))' }} />
            </div>
          )}

          {phase === 'multi' && best && bv && (
            <div className="gl-multi">
              <span className="gl-multi-sweep" aria-hidden style={{ ['--c' as string]: bv.color }} />
              {special && (
                <div className="gl-multi-feat" style={{ ['--c' as string]: bv.color }}>
                  <Cameo place={best.place} side="l" />
                  {best.rarity === 'diamond' && <Cameo place={best.place} side="r" />}
                  <span className="gl-special-tag" style={{ color: bv.color }}>{best.rarity === 'diamond' ? '✦ UR 등장! ✦' : '✧ SSR ✧'}</span>
                  <Item25D item={best} size={150} />
                  <Stars n={bv.stars} color={bv.color} />
                </div>
              )}
              <div className="gl-grid">
                {results.map((it, i) => {
                  const v = VIS[it.rarity];
                  return (
                    <div key={i} className="gl-cell" style={{ ['--c' as string]: v.color, animationDelay: `${i * 0.06}s` }}>
                      <Item25D item={it} size={56} />
                      <Stars n={v.stars} color={v.color} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="gl-panel">
            {phase === 'idle' && (
              <>
                <p className="gl-prompt">양·뭉과 함께 오늘의 보물을 뽑아볼까요?</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="ym-press" onClick={() => pull(1)} style={cta(true, '#caa15c')}>✨ 1회 뽑기</button>
                  <button className="ym-press" onClick={() => pull(10)} style={cta(true, '#b9382e')}>🎴 10연차</button>
                </div>
              </>
            )}
            {phase === 'charging' && <p className="gl-prompt gl-charge-txt">기운을 모으는 중…</p>}
            {(phase === 'single' || phase === 'multi') && best && bv && (
              <>
                <p className="gl-get">{phase === 'multi' ? `${results.length}개 획득!` : '획득!'} {single && <b lang="ja" style={{ color: bv.color }}>{single.name}</b>}{phase === 'multi' && <b style={{ color: bv.color }}> 최고 {bv.label}</b>}</p>
                <p className="gl-get-sub">{phase === 'single' && single ? `${single.korean} · ${single.place} · ` : '도감에 등록 · '}기울이면 입체로 보여요</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="ym-press" onClick={() => pull(phase === 'multi' ? 10 : 1)} style={cta(true)}>다시 뽑기</button>
                  <button className="ym-press" onClick={() => { setTab('dex'); reset(); }} style={cta(false)}>도감 보기</button>
                </div>
              </>
            )}
          </div>
        </section>
      ) : (
        <section>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>
            장면별 최고 등급 보물을 진열했어요. 카드를 기울여 보세요 (2.5D).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {scenes.map((s) => {
              const owned = totalItems(collection.cards[s.id]) > 0;
              const r = owned ? bestRarity(collection.cards[s.id]) : 'basic';
              const v = VIS[r];
              const item = owned ? artFor(s.id, r) : null;
              return (
                <div key={s.id} className="gl-shelf" style={{ borderColor: owned ? v.color : 'var(--glass-border)' }}>
                  {owned && item ? <Item25D item={item} size={130} /> : <div className="gl-shelf-empty">？</div>}
                  <p className="gl-shelf-name" style={{ color: owned ? 'var(--ink)' : 'var(--ink-faint)' }}>{owned && item ? item.korean : s.place}</p>
                  {owned ? <span className="gl-shelf-tag" style={{ color: v.color, borderColor: v.color }}>{v.label} {'★'.repeat(v.stars)}</span>
                    : <span className="gl-shelf-tag" style={{ color: 'var(--ink-faint)', borderColor: 'var(--glass-border)' }}>미획득</span>}
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
  background:
    radial-gradient(circle at 50% 16%, rgba(255,241,195,.12), transparent 28%),
    linear-gradient(180deg, rgba(255,255,255,.04), transparent 34%),
    radial-gradient(circle at 50% 30%, #2a1f33, #15101b 70%);
  border:1px solid rgba(255,255,255,.08); box-shadow:inset 0 0 60px rgba(0,0,0,.5), 0 22px 44px rgba(29,18,19,.22); }
.gl-stage.is-special{ background:
    radial-gradient(circle at 50% 18%, rgba(255,215,108,.18), transparent 31%),
    radial-gradient(circle at 50% 28%, #2c1430, #0e0a14 72%); }
.gl-stage-light{ position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(circle at 50% 18%, color-mix(in srgb, var(--aura,#caa15c), transparent 55%), transparent 46%); animation:gl-pulse 2.4s ease-in-out infinite; }
.gl-stage-floor{ position:absolute; left:-20%; right:-20%; bottom:-8%; height:42%; pointer-events:none;
  background:repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 42px); transform:perspective(360px) rotateX(64deg); opacity:.5; }
.gl-rainbow{ position:absolute; inset:-30%; pointer-events:none; z-index:0; opacity:.5; mix-blend-mode:screen;
  background:conic-gradient(from 0deg, #ff5db1,#ffb14e,#fff36b,#5de2a3,#5db8ff,#b06bff,#ff5db1); animation:gl-spin 8s linear infinite; filter:blur(2px);
  -webkit-mask:radial-gradient(circle at 50% 40%, transparent 0 22%, #000 40%, transparent 72%); mask:radial-gradient(circle at 50% 40%, transparent 0 22%, #000 40%, transparent 72%); }
@keyframes gl-spin{ to{ transform:rotate(360deg) } }
@keyframes gl-pulse{ 0%,100%{opacity:.7} 50%{opacity:1} }
.gl-box{ position:relative; width:168px; height:148px; z-index:2; filter:drop-shadow(0 18px 26px rgba(0,0,0,.5)); transform-style:preserve-3d; }
.gl-box.is-charging{ animation:gl-tremble .18s linear infinite; }
@keyframes gl-tremble{ 0%,100%{transform:translate(0,0) rotate(0)} 22%{transform:translate(-2px,1px) rotate(-1.4deg)} 54%{transform:translate(2px,-1px) rotate(1.6deg)} 76%{transform:translate(-1px,-1px) rotate(-.8deg)} }
.gl-box-backlight{ position:absolute; left:50%; top:46%; width:210px; height:210px; transform:translate(-50%,-50%) rotate(0deg); border-radius:50%; opacity:.35;
  background:conic-gradient(from 0deg, transparent, rgba(255,215,116,.55), transparent 30%, rgba(184,80,62,.38), transparent 64%, rgba(255,241,202,.48), transparent);
  filter:blur(1px); animation:gl-spin 7.5s linear infinite; }
.gl-box.is-charging .gl-box-backlight{ opacity:.72; animation-duration:1.8s; }
.gl-box-aura{ position:absolute; inset:-42%; border-radius:50%; pointer-events:none;
  background:radial-gradient(circle, rgba(216,162,74,.48), rgba(185,56,46,.15) 38%, transparent 66%); animation:gl-pulse 1.3s ease-in-out infinite; }
.gl-box-shadow{ position:absolute; left:3px; right:3px; bottom:-10px; height:28px; border-radius:50%; background:radial-gradient(ellipse, rgba(0,0,0,.42), transparent 72%); filter:blur(5px); }
.gl-box-body{ position:absolute; left:8px; right:8px; bottom:0; height:78px; border-radius:10px 10px 14px 14px;
  background:linear-gradient(180deg,#bd4337 0%,#8f2b25 54%,#5f1d18 100%); border:2px solid #2a1810; box-shadow:inset 0 4px 0 rgba(255,255,255,.18), inset 0 -18px 22px rgba(0,0,0,.22); }
.gl-box-lid{ position:absolute; left:0; right:0; top:18px; height:38px; border-radius:13px;
  background:linear-gradient(180deg,#f0d98d 0%,#caa14a 46%,#8d6928 100%); border:2px solid #2a1810; box-shadow:inset 0 3px 0 rgba(255,255,255,.38), 0 8px 18px rgba(0,0,0,.22); z-index:2; transform-origin:50% 100%; }
.gl-box.is-charging .gl-box-lid{ animation:gl-lid-crack .92s ease-in-out infinite; }
@keyframes gl-lid-crack{ 0%,100%{ transform:translateY(0) rotateX(0deg)} 45%{ transform:translateY(-8px) rotateX(-18deg)} 70%{ transform:translateY(-3px) rotateX(-7deg)} }
.gl-box-slit{ position:absolute; left:18px; right:18px; top:57px; height:8px; border-radius:999px; background:linear-gradient(90deg, transparent, rgba(255,236,138,.95), transparent); z-index:3; opacity:.28; filter:blur(.2px); }
.gl-box.is-charging .gl-box-slit{ animation:gl-slit .72s ease-in-out infinite; }
@keyframes gl-slit{ 0%,100%{ opacity:.28; transform:scaleX(.72)} 50%{ opacity:1; transform:scaleX(1.08)} }
.gl-box-rune{ position:absolute; left:50%; bottom:20px; width:76px; height:76px; margin-left:-38px; border-radius:50%; z-index:2; opacity:.5;
  border:1px solid rgba(255,226,140,.45); box-shadow:inset 0 0 18px rgba(255,226,140,.16), 0 0 12px rgba(255,226,140,.12); }
.gl-box-rune:before,.gl-box-rune:after{ content:''; position:absolute; inset:12px; border-radius:50%; border:1px dashed rgba(255,239,190,.44); }
.gl-box-rune:after{ inset:24px; border-style:solid; }
.gl-box.is-charging .gl-box-rune{ animation:gl-spin 2.6s linear infinite; opacity:.9; }
.gl-box-seal{ position:absolute; left:50%; top:65px; transform:translateX(-50%); z-index:4; font-size:24px; font-weight:900; color:#fff2dc; text-shadow:0 1px 2px rgba(0,0,0,.5), 0 0 10px rgba(255,226,140,.45); }
.gl-cast{ position:absolute; left:0; right:0; bottom:128px; display:flex; justify-content:center; gap:120px; z-index:1; pointer-events:none; animation:gl-walkin .6s ease both; }
@keyframes gl-walkin{ from{opacity:0; transform:translateY(20px)} to{opacity:1; transform:none} }
.gl-reveal{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:3; }
.gl-burst-ring{ position:absolute; left:50%; top:48%; width:90px; height:90px; margin:-45px 0 0 -45px; border-radius:50%; border:3px solid var(--c,#e8b23a); box-shadow:0 0 24px var(--c,#e8b23a), inset 0 0 18px var(--c,#e8b23a); opacity:0; animation:gl-burst .86s cubic-bezier(.16,.9,.24,1) both; }
@keyframes gl-burst{ 0%{opacity:0; transform:scale(.28)} 22%{opacity:1} 100%{opacity:0; transform:scale(4.8)} }
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
.gl-cameo-fig img{ width:100%; height:100%; object-fit:cover; }
.gl-cameo-fig i{ position:absolute; left:50%; top:20px; width:30px; height:30px; margin-left:-15px; border-radius:50%; background:rgba(255,255,255,.92); }
.gl-cameo-fig b{ position:absolute; left:50%; bottom:0; width:64px; height:48px; margin-left:-32px; border-radius:40px 40px 0 0; background:rgba(255,255,255,.85); }
.gl-cameo-name{ margin-top:5px; font-size:13px; font-weight:900; color:#fff7eb; text-shadow:0 1px 3px rgba(0,0,0,.6); }
.gl-cameo-role{ font-size:10px; font-weight:700; color:rgba(255,247,235,.78); }
.gl-multi{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; z-index:3; padding:8px 10px 130px; overflow:auto; }
.gl-multi-sweep{ position:absolute; inset:-18%; opacity:.28; pointer-events:none; mix-blend-mode:screen;
  background:linear-gradient(118deg, transparent 35%, color-mix(in srgb, var(--c,#e8b23a), transparent 25%) 48%, transparent 61%);
  transform:translateX(-44%) rotate(0deg); animation:gl-sweep 1.15s ease-out both; }
@keyframes gl-sweep{ 0%{opacity:0; transform:translateX(-52%)} 28%{opacity:.46} 100%{opacity:0; transform:translateX(52%)} }
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
.gl-25d-art img{ width:118%; height:118%; object-fit:contain; filter:drop-shadow(0 10px 16px rgba(0,0,0,.4)); }
.gl-25d-fallback{ width:90%; height:90%; border-radius:16px; border:2px dashed; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:13px; background:rgba(255,255,255,.06); text-align:center; padding:6px; }
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
