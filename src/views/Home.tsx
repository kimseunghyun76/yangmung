// 홈 — Immersive Scene Coach. 오늘의 장면 히어로 + 강한 CTA + 글래스 패널 + 접힌 다른 장면.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import type { Diagnosis } from '../learn/adaptive';
import { LEVEL_LABEL } from '../learn/adaptive';
import {
  isMissionUnlocked, kanaReadMastery, missionProgress, nextSessionId, planSession,
  sessionCounts, summarize, type ProgressMap, type SessionConfig, type SessionState,
} from '../learn/progress';
import { ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { sceneVisualByMission, sceneVisualByPlace } from './scene';
import { NavBar, type NavBarProps } from './NavBar';
import { SceneThumb } from './ui';
import { GlassPanel, PrimaryAction, hexA } from './shell';
import { MascotBubble, type Who } from './mascot';

interface Props {
  nav: NavBarProps;
  allCards: Card[];
  progress: ProgressMap;
  session: SessionState;
  sessionConfig: SessionConfig;
  diagnosis: Diagnosis;
  modeLabel: string;
  onStart: () => void;
  onReset: () => void;
  onPracticeScene: (missionId: string) => void;
  onPracticeKana: (script: 'hiragana' | 'katakana') => void;
  onPracticeSigns: () => void;
  onPracticeDictation: () => void;
}

const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase' };

export function Home({ nav, allCards, progress, session, sessionConfig, diagnosis, modeLabel, onStart, onReset, onPracticeScene, onPracticeKana, onPracticeSigns, onPracticeDictation }: Props) {
  const upcomingId = nextSessionId(session);
  const counts = sessionCounts(allCards, progress, upcomingId);
  const plan = planSession(allCards, progress, upcomingId, sessionConfig);
  const planned = plan.size;
  const hiraIds = CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id);
  const kataIds = CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id);
  const hira = kanaReadMastery(progress, hiraIds);
  const kata = kanaReadMastery(progress, kataIds);
  const kanaPct = Math.round(((hira.mastered + kata.mastered) / Math.max(1, hira.total + kata.total)) * 100);
  const s = summarize(progress);
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0');

  // 오늘의 장면 = goal과 동일 기준(튜토리얼 C0 제외한 첫 장면). 없으면 가나 위주의 날.
  const primary = plan.missions.find((m) => m.id !== 'C0') ?? plan.missions[0];
  const heroMission = primary ? CONTENT.missions.find((m) => m.id === primary.id) : undefined;
  const heroSv = primary ? sceneVisualByMission(primary.id) : sceneVisualByPlace(undefined);
  const heroPlace = heroMission?.place ?? primary?.scenario;
  const heroTitle = homeGoal(heroMission);
  const heroChips = heroMission ? phraseChips(heroMission.id).slice(0, 3) : kanaChips(allCards);
  const outcome = outcomeLine(heroMission, planned);
  const coach = coachForHome(diagnosis, heroMission, plan.breakdown.B + plan.breakdown.C);

  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      <div className="ym-rise" style={{ margin: '0 0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <img src="/mascots/yangmung-duo-logo.webp" alt="yangmung" width={70} height={70} style={{ objectFit: 'contain', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.16))' }} />
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 13px',
          borderRadius: 999,
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg-strong)',
          color: 'var(--ink)',
          fontSize: 13,
          fontWeight: 750,
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
          <span style={{ color: 'var(--ink-faint)', fontWeight: 650 }}>학습 모드</span>
          {modeLabel}
        </div>
      </div>

      {/* 오늘의 장면 — 히어로 + 강한 CTA */}
      <div className="ym-rise" style={{ animationDelay: '.04s' }}>
        <HomeSceneCard
          hero={primary ? (heroSv.backdrop ?? heroSv.hero) : undefined}
          accent={heroSv.accent}
          kicker={primary ? `오늘의 여행 미션 · ${heroPlace}` : '오늘 한 판'}
          title={heroTitle}
          chips={heroChips}
          planned={planned}
          onStart={onStart}
        />
      </div>
      {outcome && (
        <p className="ym-rise" style={{ animationDelay: '.07s', fontSize: 13, color: 'var(--ink-soft)', margin: '10px 2px 0', textAlign: 'center', fontWeight: 700, lineHeight: 1.45 }}>
          {outcome}
        </p>
      )}
      {planned > 0 && counts.due + counts.fresh > planned && (
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 6, textAlign: 'center', fontWeight: 600 }}>
          풀 수 있는 카드 {counts.due + counts.fresh}장 중 오늘은 {planned}장씩 짧게 진행해요.
        </p>
      )}

      {/* 오늘의 코치 (적응형 진단) */}
      <div className="ym-rise" style={{ animationDelay: '.09s', marginTop: 14 }}>
        <GlassPanel>
          <HomeCoachBody d={diagnosis} who={coach.who} line={coach.line} />
        </GlassPanel>
      </div>

      {/* 가나 안정도 — 링 + 빠른 연습 */}
      <div className="ym-rise" style={{ animationDelay: '.13s', marginTop: 14 }}>
        <GlassPanel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Ring pct={kanaPct} size={58} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, ...label }}>가나 안정도</p>
              <KanaRow label="히라가나" m={hira} />
              <KanaRow label="가타카나" m={kata} />
            </div>
          </div>
          <details style={{ marginTop: 12 }}>
            <summary style={{ ...label, cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              빠른 연습 <span style={{ color: 'var(--ink-faint)' }}>›</span>
            </summary>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
              <button className="ym-press" style={pill} onClick={() => onPracticeKana('hiragana')}>히라가나</button>
              <button className="ym-press" style={pill} onClick={() => onPracticeKana('katakana')}>가타카나</button>
              <button className="ym-press" style={pill} onClick={onPracticeSigns}>간판·메뉴</button>
              <button className="ym-press" style={pill} onClick={onPracticeDictation}>받아쓰기</button>
            </div>
          </details>
        </GlassPanel>
      </div>

      {/* 다른 장면 연습 — 접힘 (기본은 오늘의 장면에 집중) */}
      <details className="ym-rise" style={{ animationDelay: '.17s', marginTop: 18 }}>
        <summary style={{ ...label, cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '4px 2px' }}>
          다른 장면 연습 <span style={{ color: 'var(--ink-faint)' }}>›</span>
        </summary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {scenes.map((m) => {
            const unlocked = isMissionUnlocked(m.id, progress);
            const sv = sceneVisualByPlace(m.place);
            const name = m.place ?? m.scenario;
            if (!unlocked) {
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 16, border: '1px dashed var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink-faint)' }}>
                  <SceneThumb icon={sv.icon} accent={sv.accent} muted size={38} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>곧 열릴 여행지 · {lockHint(m.id)}</span>
                </div>
              );
            }
            const p = missionProgress(allCards, progress, m.id);
            const done = p.total > 0 && p.mastered === p.total;
            return (
              <button key={m.id} className="ym-glass ym-press" onClick={() => onPracticeScene(m.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', color: 'var(--ink)', borderRadius: 16 }}>
                <SceneThumb icon={sv.icon} accent={sv.accent} size={38} />
                <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: done ? 'var(--ok)' : 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>{done ? '완료' : `${p.mastered}/${p.total}`}</span>
                <span style={{ fontSize: 16, color: 'var(--ink-faint)' }}>›</span>
              </button>
            );
          })}
        </div>
      </details>

      {s.seen > 0 && (
        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-faint)', fontSize: 13, fontWeight: 600, marginTop: 22, width: '100%', textAlign: 'center' }}
          onClick={() => { if (confirm('진척을 모두 지울까요?')) onReset(); }}>처음부터 다시</button>
      )}
      {!ttsSupported() && <p style={{ color: 'var(--warn)', fontSize: 13, marginTop: 16, fontWeight: 600 }}>이 브라우저는 음성(TTS) 미지원 — 텍스트로만 진행됩니다.</p>}
    </main>
  );
}

const pill: React.CSSProperties = {
  padding: '13px 12px', borderRadius: 14, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 14,
  textAlign: 'center', cursor: 'pointer',
};

function HomeSceneCard({ hero, accent, kicker, title, chips, planned, onStart }: {
  hero?: string;
  accent: string;
  kicker: string;
  title: string;
  chips: string[];
  planned: number;
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
        <PrimaryAction onClick={onStart} disabled={planned === 0} style={{ marginTop: 18 }}>
          {planned === 0 ? '오늘 학습할 카드가 없어요' : `시작 · ${planned}장`}
        </PrimaryAction>
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

function lockHint(missionId: string): string {
  if (missionId === 'C3') return '전철';
  if (missionId === 'C4') return '호텔';
  return '다음 장면';
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
