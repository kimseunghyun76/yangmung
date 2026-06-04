// 홈 — Immersive Scene Coach. 오늘의 루트 + 장면 히어로 + 가나/여행 루트 진입.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import type { Diagnosis } from '../learn/adaptive';
import { LEVEL_LABEL } from '../learn/adaptive';
import {
  isMissionUnlocked, kanaReadMastery, missionProgress, nextSessionId, planSession,
  type ProgressMap, type SessionConfig, type SessionState,
} from '../learn/progress';
import { ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { sceneVisualByMission, sceneVisualByPlace } from './scene';
import { NavBar, type NavBarProps } from './NavBar';
import { SceneImageThumb } from './ui';
import { GlassPanel, PrimaryAction, hexA } from './shell';
import { MascotBubble, MascotEmpty, MascotFace, type Who } from './mascot';
import { Icon, type IconName } from '../ui/Icon';

interface Props {
  nav: NavBarProps;
  allCards: Card[];
  progress: ProgressMap;
  session: SessionState;
  sessionConfig: SessionConfig;
  diagnosis: Diagnosis;
  modeLabel: string;
  onStart: () => void;
  onPracticeScene: (missionId: string) => void;
  onPracticeKana: (script: 'hiragana' | 'katakana') => void;
  onPracticeSigns: () => void;
  onPracticeDictation: () => void;
  onPracticeCompose: () => void;
}

const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase' };

export function Home({ nav, allCards, progress, session, sessionConfig, diagnosis, modeLabel, onStart, onPracticeScene, onPracticeKana, onPracticeSigns, onPracticeDictation, onPracticeCompose }: Props) {
  const upcomingId = nextSessionId(session);
  const plan = planSession(allCards, progress, upcomingId, sessionConfig);
  const planned = plan.size;
  const hiraIds = CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id);
  const kataIds = CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id);
  const hira = kanaReadMastery(progress, hiraIds);
  const kata = kanaReadMastery(progress, kataIds);
  const kanaPct = Math.round(((hira.mastered + kata.mastered) / Math.max(1, hira.total + kata.total)) * 100);
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0');
  const routeScenes = scenes.filter((m) => isMissionUnlocked(m.id, progress)).slice(0, 3);

  // 오늘의 장면 = goal과 동일 기준(튜토리얼 C0 제외한 첫 장면). 없으면 가나 위주의 날.
  const primary = plan.missions.find((m) => m.id !== 'C0') ?? plan.missions[0];
  const heroMission = primary ? CONTENT.missions.find((m) => m.id === primary.id) : undefined;
  const heroSv = primary ? sceneVisualByMission(primary.id) : sceneVisualByPlace(undefined);
  const heroPlace = heroMission?.place ?? primary?.scenario;
  const heroTitle = homeGoal(heroMission);
  const heroChips = heroMission ? phraseChips(heroMission.id).slice(0, 3) : kanaChips(allCards);
  const outcome = outcomeLine(heroMission, planned);
  const coach = coachForHome(diagnosis, heroMission, plan.breakdown.B + plan.breakdown.C);
  const nextAction = nextOneAction({ scenes, progress, allCards, hira, kata, kanaPct, onPracticeScene, onPracticeKana, onPracticeDictation });

  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      {/* 슬림 헤더 — 모드 칩만(듀오는 오늘의 장면 안 여행 안내자로 이동) */}
      <div className="ym-rise" style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 0 12px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontSize: 12.5, fontWeight: 750 }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
          {modeLabel}
        </span>
      </div>

      {/* ① 오늘의 장면 — 듀오 여행 안내자 + 히어로 + 시작 CTA */}
      <div className="ym-rise" style={{ animationDelay: '.04s' }}>
        <HomeSceneCard
          hero={primary ? (heroSv.backdrop ?? heroSv.hero) : undefined}
          accent={heroSv.accent}
          kicker={primary ? `오늘의 여행 미션 · ${heroPlace}` : '오늘 한 판'}
          title={heroTitle}
          chips={heroChips}
          planned={planned}
          guideLine={coach.line}
          onStart={onStart}
        />
      </div>
      {outcome && (
        <p className="ym-rise" style={{ animationDelay: '.07s', fontSize: 13, color: 'var(--ink-soft)', margin: '10px 2px 0', textAlign: 'center', fontWeight: 700, lineHeight: 1.45 }}>
          {outcome}
        </p>
      )}

      {/* ② 이어서 할 한 가지 행동 */}
      {nextAction && (
        <div className="ym-rise" style={{ animationDelay: '.1s', marginTop: 14 }}>
          <button className="ym-press" onClick={nextAction.onClick} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left',
            padding: '15px 16px', borderRadius: 18, cursor: 'pointer',
            border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
          }}>
            <span style={{ width: 42, height: 42, flex: '0 0 42px', borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: hexA('#b9382e', 0.14), color: 'var(--accent)' }}>
              <Icon name={nextAction.icon} size={23} />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.04em' }}>이어서 할 한 가지</span>
              <span style={{ display: 'block', fontSize: 16, fontWeight: 750, marginTop: 2 }}>{nextAction.label}</span>
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 1 }}>{nextAction.sub}</span>
            </span>
            <Icon name="flow" size={18} style={{ color: 'var(--ink-faint)' }} />
          </button>
        </div>
      )}

      {/* ③ 학습 가방 (접힘) — 코치 진단 · 가나 안정도 · 빠른 연습 · 여행 루트 */}
      <div className="ym-rise" style={{ animationDelay: '.14s', marginTop: 14 }}>
        <GlassPanel>
          <details>
            <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name="discover" size={18} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 15, fontWeight: 800 }}>학습 가방</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700 }}>가나 {kanaPct}% · 진단 · 연습 ›</span>
            </summary>

            {/* 코치 진단 */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--glass-border)' }}>
              <HomeCoachBody d={diagnosis} who={coach.who} line={coach.line} />
            </div>

            {/* 가나 안정도 */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <Ring pct={kanaPct} size={58} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, ...label }}>가나 안정도</p>
                <KanaRow label="히라가나" m={hira} />
                <KanaRow label="가타카나" m={kata} />
              </div>
            </div>

            {/* 빠른 연습 */}
            <p style={{ ...label, margin: '16px 0 0' }}>빠른 연습</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
              <button className="ym-press" style={pill} onClick={() => onPracticeKana('hiragana')}>히라가나</button>
              <button className="ym-press" style={pill} onClick={() => onPracticeKana('katakana')}>가타카나</button>
              <button className="ym-press" style={pill} onClick={onPracticeSigns}>간판·메뉴</button>
              <button className="ym-press" style={pill} onClick={onPracticeDictation}>받아쓰기</button>
              <button className="ym-press" style={pill} onClick={onPracticeCompose}>한→일 작문</button>
            </div>

            {/* 여행 루트 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '18px 0 0' }}>
              <p style={{ margin: 0, ...label }}>여행 루트</p>
              <button className="ym-press" onClick={() => nav.onNavigate('map')} style={{
                border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
                borderRadius: 999, padding: '8px 12px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
              }}>지도 보기</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
              {routeScenes.map((m) => {
                const sv = sceneVisualByPlace(m.place);
                const p = missionProgress(allCards, progress, m.id);
                const done = p.total > 0 && p.mastered === p.total;
                return (
                  <button key={m.id} className="ym-press" onClick={() => onPracticeScene(m.id)} style={{
                    minWidth: 0, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)',
                    color: 'var(--ink)', borderRadius: 16, padding: '11px 8px', cursor: 'pointer', textAlign: 'center',
                  }}>
                    <SceneImageThumb src={sv.backdrop ?? sv.thumb} icon={sv.icon} accent={sv.accent} size={42} />
                    <span style={{ display: 'block', marginTop: 7, fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.place ?? m.scenario}</span>
                    <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: done ? 'var(--ok)' : 'var(--ink-faint)', fontWeight: 750 }}>{done ? '완료' : `${p.mastered}/${p.total}`}</span>
                  </button>
                );
              })}
            </div>
          </details>
        </GlassPanel>
      </div>
      {!ttsSupported() && <p style={{ color: 'var(--warn)', fontSize: 13, marginTop: 16, fontWeight: 600 }}>이 브라우저는 음성(TTS) 미지원 — 텍스트로만 진행됩니다.</p>}
    </main>
  );
}

// 이어서 할 "한 가지" 행동 — 시작 전 진행중 장면 > 흔들리는 가나 > 받아쓰기 복습 순.
function nextOneAction({ scenes, progress, allCards, hira, kata, kanaPct, onPracticeScene, onPracticeKana, onPracticeDictation }: {
  scenes: typeof CONTENT.missions; progress: ProgressMap; allCards: Card[];
  hira: { mastered: number; total: number }; kata: { mastered: number; total: number }; kanaPct: number;
  onPracticeScene: (id: string) => void; onPracticeKana: (s: 'hiragana' | 'katakana') => void; onPracticeDictation: () => void;
}): { label: string; sub: string; icon: IconName; onClick: () => void } | null {
  const resume = scenes.find((m) => {
    if (m.id === 'C0' || !isMissionUnlocked(m.id, progress)) return false;
    const p = missionProgress(allCards, progress, m.id);
    return p.started && !(p.total > 0 && p.mastered === p.total);
  });
  if (resume) {
    return { label: `${resume.place ?? resume.scenario} 마저 하기`, sub: '시작한 장면을 마무리해요', icon: 'flow', onClick: () => onPracticeScene(resume.id) };
  }
  if (kanaPct < 100) {
    const hr = hira.mastered / Math.max(1, hira.total);
    const kr = kata.mastered / Math.max(1, kata.total);
    const weaker: 'hiragana' | 'katakana' = hr <= kr ? 'hiragana' : 'katakana';
    return { label: `${weaker === 'hiragana' ? '히라가나' : '가타카나'} 다지기`, sub: '아직 흔들리는 가나를 무작위로', icon: 'kana', onClick: () => onPracticeKana(weaker) };
  }
  return { label: '받아쓰기로 복습', sub: '듣고 가나로 써보기', icon: 'dictation', onClick: onPracticeDictation };
}

const pill: React.CSSProperties = {
  padding: '13px 12px', borderRadius: 14, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 14,
  textAlign: 'center', cursor: 'pointer',
};

function HomeSceneCard({ hero, accent, kicker, title, chips, planned, guideLine, onStart }: {
  hero?: string;
  accent: string;
  kicker: string;
  title: string;
  chips: string[];
  planned: number;
  guideLine?: string;
  onStart: () => void;
}) {
  const generatedBackdrop = hero?.includes('/generated/');
  const foreground = generatedBackdrop ? '#fff' : 'var(--ink)';
  const kickerColor = generatedBackdrop ? 'rgba(255,255,255,0.86)' : accent;
  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 28,
      padding: 18,
      border: generatedBackdrop ? '1px solid rgba(255,255,255,0.22)' : '1px solid var(--glass-border)',
      background: `
        radial-gradient(circle at 82% 18%, ${hexA(accent, 0.28)}, transparent 34%),
        linear-gradient(155deg, var(--glass-bg-strong), ${hexA(accent, 0.10)} 58%, var(--glass-bg))
      `,
      boxShadow: 'var(--glass-shadow)',
      minHeight: 248,
    }}>
      <div aria-hidden style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, transparent 0 62%, ${hexA(accent, 0.18)} 62% 100%)`,
        opacity: 0.8,
      }} />
      {hero && (
        <img
          src={hero}
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            right: generatedBackdrop ? -68 : -180,
            top: generatedBackdrop ? 0 : 18,
            width: generatedBackdrop ? 'calc(100% + 92px)' : 560,
            height: generatedBackdrop ? '100%' : 230,
            objectFit: 'cover',
            opacity: generatedBackdrop ? 1 : 0.22,
            filter: generatedBackdrop ? 'saturate(0.92) contrast(1.05)' : 'saturate(0.9) contrast(1.08)',
            transform: generatedBackdrop ? 'none' : 'rotate(-3deg)',
            borderRadius: generatedBackdrop ? 0 : 34,
            pointerEvents: 'none',
          }}
        />
      )}
      {generatedBackdrop && (
        <div aria-hidden style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(90deg, rgba(10,12,18,0.78), rgba(10,12,18,0.48) 48%, rgba(10,12,18,0.2)),
            linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.42))
          `,
        }} />
      )}
      <div aria-hidden style={{
        position: 'absolute',
        right: 18,
        top: 18,
        width: 96,
        height: 96,
        borderRadius: 28,
        border: `1px solid ${hexA(accent, 0.24)}`,
        background: generatedBackdrop ? 'rgba(255,255,255,0.1)' : hexA(accent, 0.12),
        boxShadow: `0 18px 46px ${hexA(accent, 0.16)}`,
      }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 212 }}>
        <p style={{ ...label, color: kickerColor, margin: 0 }}>{kicker}</p>
        <h2 style={{
          margin: '10px 0 0',
          maxWidth: 300,
          fontSize: 29,
          lineHeight: 1.12,
          letterSpacing: '-0.035em',
          color: foreground,
          textShadow: generatedBackdrop ? '0 2px 18px rgba(0,0,0,0.28)' : undefined,
        }}>{title}</h2>
        {chips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 13, maxWidth: 320 }}>
            {chips.map((chip) => (
              <span key={chip} style={{
                padding: '7px 10px',
                borderRadius: 999,
                border: generatedBackdrop ? '1px solid rgba(255,255,255,0.22)' : '1px solid var(--glass-border)',
                background: generatedBackdrop ? 'rgba(255,255,255,0.16)' : 'var(--glass-bg-strong)',
                color: generatedBackdrop ? '#fff' : 'var(--ink)',
                fontSize: 13,
                fontWeight: 750,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}>{chip}</span>
            ))}
          </div>
        )}
        <div style={{ flex: 1 }} />
        {guideLine && planned > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 16 }}>
            <MascotFace who="duo" size={34} style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.22))' }} />
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.4,
              color: generatedBackdrop ? 'rgba(255,255,255,0.92)' : 'var(--ink-soft)',
              textShadow: generatedBackdrop ? '0 1px 10px rgba(0,0,0,0.3)' : undefined,
            }}>{guideLine}</p>
          </div>
        )}
        <PrimaryAction onClick={onStart} disabled={planned === 0} style={{ marginTop: 14 }}>
          {planned === 0 ? '오늘 학습할 카드가 없어요' : `시작 · ${planned}장`}
        </PrimaryAction>
        {planned === 0 && (
          <MascotEmpty who="duo" size={48} title="오늘은 복습장으로 가볼까요?" style={{ padding: '12px 0 0' }}>
            지도나 복습장에서 다시 듣고 익숙한 표현을 확인할 수 있어요.
          </MascotEmpty>
        )}
      </div>
    </section>
  );
}

function HomeCoachBody({ d, who, line }: { d: Diagnosis; who: Who; line: string }) {
  const tone = d.level === 'struggling' ? 'var(--warn)' : d.level === 'cruising' ? 'var(--ok)' : 'var(--accent)';
  return (
    <>
      <MascotBubble who={who} size={38} style={{ animationDelay: '0s' }}>
        <strong style={{ display: 'block', fontSize: 14, marginBottom: 3 }}>오늘의 코치</strong>
        <span>{line}</span>
      </MascotBubble>
      <div style={{ marginTop: 12, paddingTop: 11, borderTop: '1px solid var(--glass-border)' }}>
        <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, color: 'var(--ink-faint)' }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: tone, boxShadow: `0 0 8px ${tone}` }} />
          학습 상태{d.level ? ` · ${LEVEL_LABEL[d.level]}` : ''}
        </p>
        <p style={{ margin: '7px 0 0', fontSize: 15, fontWeight: 750, letterSpacing: '-0.01em' }}>{d.focus}</p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{d.message}</p>
      </div>
      {d.level !== null && d.recentAccuracy !== null && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>직전 세션 정답률 {Math.round(d.recentAccuracy * 100)}%</p>
      )}
      {(d.weakKana.length > 0 || d.weakScenes.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-faint)' }}>약점</span>
          {d.weakKana.map((w) => (
            <span key={w.key} style={{ minWidth: 28, height: 28, padding: '0 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', borderRadius: 8, fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{w.label}</span>
          ))}
          {d.weakScenes.map((w) => (
            <span key={w.key} style={{ padding: '4px 10px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', borderRadius: 999, fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}>{w.label}</span>
          ))}
        </div>
      )}
    </>
  );
}

function Ring({ pct, size = 68 }: { pct: number; size?: number }) {
  const r = size / 2 - 8, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  const center = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: `0 0 ${size}px` }}>
      <circle cx={center} cy={center} r={r} fill="none" stroke="var(--glass-border)" strokeWidth="6" />
      <circle cx={center} cy={center} r={r} fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform={`rotate(-90 ${center} ${center})`} style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.2,.8,.2,1)' }} />
      <text x={center} y={center + 5} textAnchor="middle" fontSize="14" fontWeight="750" fill="var(--ink)">{pct}%</text>
    </svg>
  );
}

function KanaRow({ label: lbl, m }: { label: string; m: { mastered: number; total: number } }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 14, marginTop: 6 }}>
      <span style={{ fontWeight: 600 }}>{lbl}</span>
      <span style={{ color: 'var(--ink-faint)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        <strong style={{ color: 'var(--ink)' }}>{m.mastered}</strong> / {m.total}
      </span>
    </div>
  );
}

function homeGoal(mission?: { id: string; place?: string; scenario: string; canDo: string }): string {
  if (!mission) return '가나를 눈에 익히는 짧은 한 판';
  const goals: Record<string, string> = {
    C1: '편의점 계산대에서 당황하지 않기',
    C2: '식당에서 자연스럽게 주문하기',
    C3: '전철 이동 중 필요한 말 알아듣기',
    C4: '호텔 프런트에서 체크인하기',
    C5: '길거리에서 도움 청하기',
    C6: '약국에서 증상 말하고 약 사기',
    C7: '쇼핑하고 면세까지 묻기',
    C8: '택시에서 목적지 말하기',
    C9: '공항 입국심사 통과하기',
    C10: '환전소에서 엔화 바꾸기',
    C11: '코인로커에 짐 맡기기',
    C12: '편의점에서 택배 부치기',
    C13: '라멘집 식권기로 주문하기',
  };
  return goals[mission.id] ?? `${mission.place ?? mission.scenario}에서 필요한 말 익히기`;
}

function phraseById(id?: string) {
  return id ? CONTENT.phrases.find((p) => p.id === id) : undefined;
}

function phraseChips(missionId: string): string[] {
  const mission = CONTENT.missions.find((m) => m.id === missionId);
  if (!mission) return [];
  const ids: string[] = [];
  for (const step of mission.steps) {
    if (step.promptPhraseId) ids.push(step.promptPhraseId);
    for (const c of step.choices) if (c.phraseId) ids.push(c.phraseId);
  }
  ids.push(...(mission.speakPhraseIds ?? []));
  return [...new Set(ids)]
    .map((id) => phraseById(id))
    .filter((p): p is NonNullable<ReturnType<typeof phraseById>> => !!p)
    .map((p) => p.kanji ?? p.displayKana ?? p.kana)
    .slice(0, 3);
}

function kanaChips(cards: Card[]): string[] {
  const out: string[] = [];
  for (const c of cards) {
    if (c.kind !== 'quiz' || c.reviewTarget?.type !== 'kana') continue;
    out.push(c.bannerJa ?? c.banner);
    if (out.length >= 3) break;
  }
  return out;
}

function outcomeLine(mission: ReturnType<typeof CONTENT.missions.find>, planned: number): string {
  if (!mission || planned === 0) return '';
  const prompt = phraseById(mission.steps.find((s) => s.promptPhraseId)?.promptPhraseId);
  if (!prompt) return `오늘 ${planned}장이면 ${mission.place ?? mission.scenario} 장면을 짧게 해볼 수 있어요.`;
  const ko = prompt.korean.replace(/[.。]+$/g, '');
  return `오늘 ${planned}장이면 「${ko}」에 답할 수 있어요.`;
}

function coachForHome(d: Diagnosis, mission: ReturnType<typeof CONTENT.missions.find>, sceneWeight: number): { who: Who; line: string } {
  if (d.level === 'struggling') {
    return { who: 'mung', line: '막히면 「もう一度お願いします」만 기억해도 대화는 이어져요.' };
  }
  if (sceneWeight >= 4 && mission) {
    const p = phraseById(mission.steps.find((s) => s.promptPhraseId)?.promptPhraseId);
    if (p) return { who: 'yang', line: `오늘은 「${p.kanji ?? p.displayKana ?? p.kana}」를 먼저 귀에 익혀요.` };
  }
  return { who: 'mung', line: '짧게 한 판만 해도 다음 장면이 훨씬 덜 낯설어요.' };
}
