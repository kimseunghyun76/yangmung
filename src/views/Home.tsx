// 홈 — Immersive Scene Coach. 오늘의 루트 + 장면 히어로 + 가나/여행 루트 진입.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import type { Diagnosis } from '../learn/adaptive';
import { LEVEL_LABEL } from '../learn/adaptive';
import {
  isMissionUnlocked, kanaReadMastery, missionProgress, nextSessionId, planSession,
  type ProgressMap, type SessionConfig, type SessionState,
} from '../learn/progress';
import { bestRarity, loadCollection, totalItems } from '../learn/collection';
import { gachaItemForPlace } from '../learn/gachaItems';
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
  onPracticeFlash: () => void;
  onPracticeBasics: () => void;
  onPracticeWrite: () => void;
  onPracticePairs: () => void;
  onPracticeVocab: () => void;
  onPracticeGreetings: () => void;
  onPlacement: () => void;
  placementDone: boolean;
}

const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase' };

export function Home({ nav, allCards, progress, session, sessionConfig, diagnosis, modeLabel, onStart, onPracticeScene, onPracticeKana, onPracticeSigns, onPracticeDictation, onPracticeCompose, onPracticeFlash, onPracticeBasics, onPracticeWrite, onPracticePairs, onPracticeVocab, onPracticeGreetings, onPlacement, placementDone }: Props) {
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
  const collection = loadCollection();

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

      {/* 슬림 헤더 — 난이도 칩(누르면 수준 진단으로 재조정) */}
      <div className="ym-rise" style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 0 12px' }}>
        <button className="ym-press" onClick={onPlacement} title="수준 진단으로 난이도 재조정" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontSize: 12.5, fontWeight: 750, cursor: 'pointer' }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
          {modeLabel} · 진단
        </button>
      </div>

      {/* 첫 실행: 수준 진단 권유 배너 */}
      {!placementDone && (
        <button className="ym-rise ym-press" onClick={onPlacement} style={{
          width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 13,
          padding: '14px 16px', borderRadius: 18, border: '1px solid var(--accent)', color: 'var(--ink)',
          background: 'linear-gradient(135deg, var(--accent-soft), var(--glass-bg-strong))',
        }}>
          <span style={{ fontSize: 28 }}>🎯</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 800 }}>내 수준 진단하고 시작하기</span>
            <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>10문제로 난이도를 추천받아요 (1분 · 언제든 설정에서 변경)</span>
          </span>
          <Icon name="flow" size={18} style={{ color: 'var(--ink-faint)' }} />
        </button>
      )}

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

      {/* ③ 속도전 대결 배너 — 점수로 보석함 획득 */}
      <button className="ym-rise ym-press" onClick={onPracticeFlash} style={{
        animationDelay: '.14s', width: '100%', marginTop: 14, textAlign: 'left', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 20,
        border: '1px solid var(--accent)', color: '#fff',
        background: 'linear-gradient(135deg, #b9382e, #e0564a 60%, #f0a23a)',
        boxShadow: '0 12px 30px rgba(185,56,46,0.34)',
      }}>
        <span style={{ fontSize: 34, lineHeight: 1 }}>⚡</span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em' }}>속도전 대결</span>
          <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>제한시간 안에 빠르게! 높은 점수로 보석함 획득 🎁</span>
        </span>
        <Icon name="flow" size={20} style={{ color: 'rgba(255,255,255,0.85)' }} />
      </button>

      {/* ④ 빠른 연습 — 꽉 찬 타일 그리드 */}
      <div className="ym-rise" style={{ animationDelay: '.17s', marginTop: 14 }}>
        <GlassPanel>
          <p style={{ margin: 0, ...label }}>빠른 연습</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
            {([
              { label: '히라가나', sub: '46자 읽기', icon: 'kana', onClick: () => onPracticeKana('hiragana') },
              { label: '가타카나', sub: '46자 읽기', icon: 'kana', onClick: () => onPracticeKana('katakana') },
              { label: '기본 인사', sub: 'こんにちは·ありがとう', icon: 'speak', onClick: onPracticeGreetings },
              { label: '어휘 커리큘럼', sub: '주제별 필수 단어', icon: 'target', onClick: onPracticeVocab },
              { label: '간판·메뉴', sub: '실전 읽기', icon: 'sign', onClick: onPracticeSigns },
              { label: '받아쓰기', sub: '듣고 가나 쓰기', icon: 'dictation', onClick: onPracticeDictation },
              { label: '한→일 작문', sub: '뜻 보고 작문', icon: 'speak', onClick: onPracticeCompose },
              { label: '생활 기초', sub: '숫자·요일·시간', icon: 'target', onClick: onPracticeBasics },
              { label: '가나 쓰기', sub: '따라쓰기', icon: 'dictation', onClick: onPracticeWrite },
              { label: '발음 구분', sub: 'つ/す·장음·촉음', icon: 'listen', onClick: onPracticePairs },
            ] as { label: string; sub: string; icon: IconName; onClick: () => void }[]).map((t) => (
              <button key={t.label} className="ym-press" onClick={t.onClick} style={{
                display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left', minWidth: 0,
                border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
                borderRadius: 16, padding: '12px 12px', cursor: 'pointer',
              }}>
                <span style={{ width: 38, height: 38, flex: '0 0 38px', borderRadius: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: hexA('#b9382e', 0.13), color: 'var(--accent)' }}>
                  <Icon name={t.icon} size={20} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700, marginTop: 1 }}>{t.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* ⑤ 가나 안정도 */}
      <div className="ym-rise" style={{ animationDelay: '.2s', marginTop: 14 }}>
        <GlassPanel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Ring pct={kanaPct} size={58} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, ...label }}>가나 안정도</p>
              <KanaRow label="히라가나" m={hira} />
              <KanaRow label="가타카나" m={kata} />
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* ⑥ 오늘의 코치 */}
      <div className="ym-rise" style={{ animationDelay: '.23s', marginTop: 14 }}>
        <GlassPanel>
          <HomeCoachBody d={diagnosis} who={coach.who} line={coach.line} />
        </GlassPanel>
      </div>

      {/* ⑦ 여행 루트 */}
      <div className="ym-rise" style={{ animationDelay: '.26s', marginTop: 14 }}>
        <GlassPanel>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ margin: 0, ...label }}>여행 루트</p>
            <button className="ym-press" onClick={() => nav.onNavigate('map')} style={{
              border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
              borderRadius: 999, padding: '8px 12px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
            }}>지도 보기</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 12 }}>
            {routeScenes.map((m) => {
              const sv = sceneVisualByMission(m.id);
              const p = missionProgress(allCards, progress, m.id);
              const done = p.total > 0 && p.mastered === p.total;
              const card = collection.cards[m.id];
              const owned = totalItems(card);
              const rarity = bestRarity(card);
              const reward = gachaItemForPlace(m.place, rarity);
              return (
                <button key={m.id} className="ym-press" onClick={() => onPracticeScene(m.id)} style={{
                  minWidth: 0, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)',
                  color: 'var(--ink)', borderRadius: 16, padding: '11px 8px', cursor: 'pointer', textAlign: 'center',
                }}>
                  <SceneImageThumb src={sv.backdrop ?? sv.thumb} icon={sv.icon} accent={sv.accent} size={42} />
                  <span style={{ display: 'block', marginTop: 7, fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.place ?? m.scenario}</span>
                  <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: done ? 'var(--ok)' : 'var(--ink-faint)', fontWeight: 750 }}>{done ? '완료' : `${p.mastered}/${p.total}`}</span>
                  <span style={{ display: 'block', marginTop: 6, padding: '4px 6px', borderRadius: 8, background: owned ? 'var(--accent-soft)' : 'var(--glass-bg)', color: owned ? 'var(--accent)' : 'var(--ink-faint)', fontSize: 10.5, fontWeight: 850, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {owned ? reward.title : `선물: ${reward.title}`}
                  </span>
                </button>
              );
            })}
          </div>
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
    C14: '카페에서 매장/포장과 사이즈 말하기',
    C15: '빵집에서 고르고 봉투까지 답하기',
    C16: '이자카야에서 예약과 첫 주문 넘기기',
    C17: '스시집에서 못 먹는 재료 말하기',
    C18: '관광안내소에서 길과 추천 묻기',
    C19: '신사에서 촬영과 예절 확인하기',
    C20: '온천에서 수건과 이용 규칙 듣기',
    C21: '료칸에서 식사와 목욕 위치 확인하기',
    C22: '버스에서 목적지와 요금 확인하기',
    C23: '신칸센 표와 승강장 확인하기',
    C24: '렌터카에서 보험과 반납 조건 확인하기',
    C25: '병원 접수에서 증상을 짧게 말하기',
    C26: '交番에서 분실물을 신고하기',
    C27: '긴급 상황에서 도움 요청하기',
    C28: '유심·와이파이 요금제 고르기',
    C29: '코인세탁기 사용법 묻기',
    C30: '축제 노점에서 음식 주문하기',
    C31: '회전초밥에서 패널 주문과 계산하기',
    C32: '편집샵에서 옷 입어보기',
    C33: '호텔에서 우산 빌리기',
    C34: '객실 냄새나 침대 문제로 방 바꾸기',
    C35: '나리타 공항역에서 티켓 교환하기',
    C36: '공항 수하물 초과를 해결하기',
    C37: '조식 뷔페에서 음식 리필 요청하기',
    C38: '스시집에서 맥주와 추가 주문하기',
    C39: '파스타 메뉴 옵션을 하나씩 고르기',
    C40: '편집샵 계산대에서 면세와 영수증 처리하기',
    C41: '서비스 데스크에서 교환·환불 요청하기',
    C42: '자판기에서 음료 사고 잔돈 수령하기',
    C43: 'ATM에서 외국 카드로 엔화 인출하기',
    C44: '편의점 복합기에서 복사·출력 마치기',
    C45: '앱 사전 주문을 카운터에서 픽업하기',
    C46: '스타디움 입장하고 스탠드 음식 주문하기',
    C47: '쇼핑몰 안내소에서 매장 위치 찾기',
    C48: '약국에서 처방전 내고 복약 지도 받기',
    C49: '오마카세 카운터에서 셰프와 대화하기',
    C50: '낯선 거리에서 길 잃었을 때 대처하기',
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
