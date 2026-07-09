// 홈 — Immersive Scene Coach. 오늘의 루트 + 장면 히어로 + 가나/여행 루트 진입.
import { useState } from 'react';
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import type { Diagnosis } from '../learn/adaptive';
import { LEVEL_LABEL } from '../learn/adaptive';
import {
  CORE_LEVEL_LABEL, LEVEL_STAGES, isStageComplete, isStageUnlocked, levelAllComplete, nextLevel,
  type CoreLevel, type ProgStage, type ProgressionState,
} from '../learn/progression';
import {
  kanaReadMastery, missionProgress, nextSessionId, planSession,
  type ProgressMap, type SessionConfig, type SessionState,
} from '../learn/progress';
import { ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { isMangaSceneImage, sceneVisualByMission, sceneVisualByPlace } from './scene';
import { NavBar, type NavBarProps } from './NavBar';
import { GlassPanel, PrimaryAction, hexA } from './shell';
import { MascotEmpty, MascotFace } from './mascot';
import { Icon } from '../ui/Icon';
import { loadCollection } from '../learn/collection';
import { useLearningStats, type LearningStats } from '../learn/learningStats';
import { StatTile, LearningHeatmap } from './StatsWidgets';
import { VOCAB_GROUPS, vocabGroupArt } from '../content/thematicVocab';

interface Props {
  nav: NavBarProps;
  allCards: Card[];
  progress: ProgressMap;
  session: SessionState;
  sessionConfig: SessionConfig;
  openMissions: string[];
  missionsLocked: boolean;
  diagnosis: Diagnosis;
  modeLabel: string;
  onStart: () => void;
  onPracticeScene: (missionId: string) => void;
  onPracticeFlash: () => void;
  onPracticeWrite: () => void;
  onPlacement: () => void;
  placementDone: boolean;
  // 레벨 진도
  coreLevel: CoreLevel;
  progression: ProgressionState;
  devUnlockAll: boolean;
  onStartStage: (stage: ProgStage) => void;
  onStartPromotion: () => void;
  onOpenBasics: () => void;
  onStartVocabGroup: (groupId: string) => void;
}

const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase' };

export function Home({ nav, allCards, progress, session, sessionConfig, openMissions, missionsLocked, diagnosis, modeLabel, onStart, onPracticeScene, onPracticeFlash, onPracticeWrite, onPlacement, placementDone, coreLevel, progression, devUnlockAll, onStartStage, onStartPromotion, onOpenBasics, onStartVocabGroup }: Props) {
  const upcomingId = nextSessionId(session);
  const plan = planSession(allCards, progress, upcomingId, sessionConfig);
  const planned = plan.size;
  const hiraIds = CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id);
  const kataIds = CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id);
  const hira = kanaReadMastery(progress, hiraIds);
  const kata = kanaReadMastery(progress, kataIds);
  const kanaPct = Math.round(((hira.mastered + kata.mastered) / Math.max(1, hira.total + kata.total)) * 100);
  const collection = loadCollection();
  const stats = useLearningStats(collection);
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0');
  const openScenes = scenes.filter((m) => openMissions.includes(m.id));

  // 오늘의 장면 = goal과 동일 기준(튜토리얼 C0 제외한 첫 장면). 없으면 가나 위주의 날.
  const primary = plan.missions.find((m) => m.id !== 'C0') ?? plan.missions[0];
  const heroMission = primary ? CONTENT.missions.find((m) => m.id === primary.id) : undefined;
  const heroSv = primary ? sceneVisualByMission(primary.id) : sceneVisualByPlace(undefined);
  const heroPlace = heroMission?.place ?? primary?.scenario;
  const heroTitle = homeGoal(heroMission);
  const heroChips = heroMission ? phraseChips(heroMission.id).slice(0, 3) : kanaChips(allCards);
  const outcome = outcomeLine(heroMission, planned);
  const coach = coachForHome(diagnosis, heroMission, plan.breakdown.B + plan.breakdown.C);

  // 여행 루트 — 오늘의 미션(hero)과 중복되지 않게 나머지 열린 미션을 앞세워 최대 4개.
  // 열린 미션이 없으면 잠긴(다음) 미션을 잠금 카드로 보여준다(클릭 시 지도로 이동).
  const openOther = openScenes.filter((m) => m.id !== primary?.id);
  const routeLocked = openOther.length === 0;
  const routeScenes = routeLocked
    ? scenes.filter((m) => !openMissions.includes(m.id)).slice(0, 4)
    : [...openOther].sort((a, b) => Number(missionProgress(allCards, progress, a.id).started) - Number(missionProgress(allCards, progress, b.id).started)).slice(0, 4);

  // 레벨이 낮은 사람(입문·기본)은 레벨 진도(빠른 연습)를 오늘의 미션보다 위에 둔다.
  const lowLevel = coreLevel === 'beginner' || coreLevel === 'default';

  // 여행 미션은 입문·기본에서는 절대 노출하지 않는다(요청) — 오늘의 미션 히어로·여행 루트 대신
  // "왜 안 보이는지 + 언제 열리는지"를 분명히 알려주는 안내 카드로 대체.
  const missionPanel = missionsLocked ? (
    <div className="ym-rise" style={{ marginTop: 14 }}>
      <GlassPanel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span aria-hidden style={{ fontSize: 26 }}>🔒</span>
          <div>
            <p style={{ margin: 0, ...label }}>여행 미션</p>
            <strong style={{ display: 'block', marginTop: 3, fontSize: 16 }}>미션은 중급부터 열려요</strong>
          </div>
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
          지금은 가나·기본 단어를 다지는 단계예요. 아래 <strong style={{ color: 'var(--ink)' }}>레벨 진도</strong>를 다 통과하고
          중급으로 승급하면 편의점·식당 같은 실전 여행 장면이 열려요.
        </p>
      </GlassPanel>
    </div>
  ) : (
    <>
      {/* 오늘의 여행 미션 히어로 + 시작 CTA */}
      <div className="ym-rise" style={{ marginTop: 14 }}>
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
        <p className="ym-rise" style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '10px 2px 0', textAlign: 'center', fontWeight: 700, lineHeight: 1.45 }}>{outcome}</p>
      )}
      {/* 오늘의 미션과 한 묶음 — 다른 열린 장면 또는 잠긴 다음 미션 */}
      <div className="ym-rise" style={{ marginTop: 14 }}>
        <TravelRoute routeScenes={routeScenes} locked={routeLocked} allCards={allCards} progress={progress} onPracticeScene={onPracticeScene} onMap={() => nav.onNavigate('map')} />
      </div>
    </>
  );

  const levelPanel = (
    <div className="ym-rise" style={{ marginTop: 14 }}>
      <LevelProgress coreLevel={coreLevel} progression={progression} onStartStage={onStartStage} onStartPromotion={onStartPromotion} onPracticeWrite={onPracticeWrite} devUnlockAll={devUnlockAll} onOpenBasics={onOpenBasics} onStartVocabGroup={onStartVocabGroup} onSeeAll={() => nav.onNavigate('practice')} />
    </div>
  );

  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      {/* ⓪ 내 학습 현황 — 상태 분석(코치·학습 상태·가나 안정도·난이도)을 한 카드에 */}
      <div className="ym-rise">
        <GlassPanel>
          <StatusDashboard
            d={diagnosis} line={coach.line}
            hira={hira} kata={kata} kanaPct={kanaPct} stats={stats}
            modeLabel={modeLabel} onPlacement={onPlacement}
          />
        </GlassPanel>
      </div>

      {/* 첫 실행: 수준 진단 권유 배너 */}
      {!placementDone && (
        <button className="ym-rise ym-press" onClick={onPlacement} style={{
          width: '100%', textAlign: 'left', cursor: 'pointer', margin: '14px 0 0', display: 'flex', alignItems: 'center', gap: 13,
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

      {/* 레벨이 낮으면 빠른 연습(레벨 진도)을 오늘의 미션 위에, 높으면 미션을 위에 */}
      {lowLevel ? (<>{levelPanel}{missionPanel}</>) : (<>{missionPanel}{levelPanel}</>)}

      {/* 속도전 대결 — 메인 제일 하단 */}
      <button className="ym-rise ym-press" onClick={onPracticeFlash} style={{
        width: '100%', marginTop: 14, textAlign: 'left', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 20,
        border: '1px solid var(--accent)', color: '#fff',
        background: 'linear-gradient(135deg, #b9382e, #e0564a 60%, #f0a23a)',
        boxShadow: '0 12px 30px rgba(185,56,46,0.34)',
      }}>
        <span style={{
          width: 42, height: 42, borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,.14)', color: '#fff', border: '1px solid rgba(255,255,255,.24)', flex: '0 0 42px',
        }}>
          <Icon name="fast" size={21} />
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em' }}>속도전 대결</span>
          <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>제한시간 안에 빠르게! 높은 점수로 보석함 획득</span>
        </span>
        <Icon name="flow" size={20} style={{ color: 'rgba(255,255,255,0.85)' }} />
      </button>

      {!ttsSupported() && <p style={{ color: 'var(--warn)', fontSize: 13, marginTop: 16, fontWeight: 600 }}>이 브라우저는 음성(TTS) 미지원 — 텍스트로만 진행됩니다.</p>}
    </main>
  );
}

// 여행 루트 — 오늘의 미션과 한 묶음. 열린 다른 장면(중복 제외) 또는 잠긴 다음 미션(클릭 시 지도).
function TravelRoute({ routeScenes, locked, allCards, progress, onPracticeScene, onMap }: {
  routeScenes: typeof CONTENT.missions; locked: boolean; allCards: Card[]; progress: ProgressMap;
  onPracticeScene: (id: string) => void; onMap: () => void;
}) {
  const compact = routeScenes.length > 1;
  return (
    <GlassPanel>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ margin: 0, ...label }}>{locked ? '다음 여행 미션' : '여행 루트'}</p>
        <button className="ym-press" onClick={onMap} style={{ border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', borderRadius: 999, padding: '8px 12px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>미션 보기</button>
      </div>
      {locked && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--ink-faint)', fontWeight: 700 }}>아직 열린 장면이 없어요. 눌러서 미션 지도에서 다음 미션을 열어보세요.</p>}
      {routeScenes.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap: 10, marginTop: 12 }}>
          {routeScenes.map((m) => (
            <RouteCard key={m.id} m={m} locked={locked} compact={compact} allCards={allCards} progress={progress}
              onClick={() => (locked ? onMap() : onPracticeScene(m.id))} />
          ))}
        </div>
      ) : (
        <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>모든 미션을 열었어요! 미션 지도에서 골라 진행해요.</p>
      )}
    </GlassPanel>
  );
}

function RouteCard({ m, locked, compact, allCards, progress, onClick }: {
  m: typeof CONTENT.missions[number]; locked: boolean; compact: boolean; allCards: Card[]; progress: ProgressMap; onClick: () => void;
}) {
  const sv = sceneVisualByMission(m.id);
  const p = missionProgress(allCards, progress, m.id);
  const done = p.total > 0 && p.mastered === p.total;
  const src = sv.backdrop ?? sv.thumb;
  const statusText = locked ? '잠김' : done ? '완료' : !p.started ? '아직 안 함' : `${p.mastered}/${p.total}`;
  const statusBg = locked ? 'rgba(40,40,52,.92)' : done ? 'rgba(35,134,82,.94)' : p.started ? 'rgba(185,56,46,.96)' : 'rgba(255,255,255,.94)';
  const statusColor = locked || done || p.started ? '#fff' : 'var(--accent)';
  return (
    <button className="ym-press" onClick={onClick} style={{
      position: 'relative', minWidth: 0, overflow: 'hidden', border: '1px solid var(--glass-border)',
      background: 'var(--glass-bg-strong)', color: '#fff', borderRadius: compact ? 16 : 18, padding: 0,
      cursor: 'pointer', textAlign: 'left', aspectRatio: compact ? '4 / 3' : '16 / 9', boxShadow: '0 10px 22px rgba(89,58,28,.09)',
    }}>
      {src ? (
        <img src={src} alt="" loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: locked ? 'grayscale(.9) brightness(.7)' : 'saturate(.94) contrast(1.02)' }} />
      ) : (
        <span aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${hexA(sv.accent, 0.18)}, var(--glass-bg-strong))`, color: sv.accent }}>
          <Icon name={sv.icon} size={42} />
        </span>
      )}
      <span aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,.06), rgba(0,0,0,.34) 50%, rgba(0,0,0,.74))' }} />
      {locked && <span aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🔒</span>}
      <span style={{ position: 'relative', zIndex: 1, minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: compact ? 10 : 14 }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: compact ? 6 : 10 }}>
          <span style={{ display: compact ? 'none' : 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0, padding: '6px 9px', borderRadius: 999, background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.22)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#fff', fontSize: 12, fontWeight: 850 }}>
            <Icon name={sv.icon} size={14} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.scenario}</span>
          </span>
          <span style={{ flex: '0 0 auto', padding: compact ? '5px 7px' : '6px 9px', borderRadius: 999, background: statusBg, color: statusColor, border: locked || done || p.started ? '1px solid rgba(255,255,255,.24)' : '1px solid rgba(255,255,255,.9)', boxShadow: '0 4px 14px rgba(0,0,0,.22)', fontSize: compact ? 11 : 12, fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1, whiteSpace: 'nowrap' }}>{statusText}</span>
        </span>
        <span style={{ display: 'block', marginTop: compact ? 7 : 9, fontSize: compact ? 17 : 22, lineHeight: 1.12, fontWeight: 900, letterSpacing: '-0.02em', textShadow: '0 2px 14px rgba(0,0,0,.38)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.place ?? m.scenario}</span>
        <span style={{ display: '-webkit-box', marginTop: 4, color: 'rgba(255,255,255,.86)', fontSize: compact ? 11.5 : 12.5, fontWeight: 750, overflow: 'hidden', textOverflow: 'ellipsis', WebkitLineClamp: compact ? 2 : 1, WebkitBoxOrient: 'vertical' }}>{m.canDo}</span>
      </span>
    </button>
  );
}

function HomeSceneCard({ hero, accent, kicker, title, chips, planned, onStart }: {
  hero?: string;
  accent: string;
  kicker: string;
  title: string;
  chips: string[];
  planned: number;
  onStart: () => void;
}) {
  const showFullBackdrop = isMangaSceneImage(hero);
  const generatedBackdrop = hero?.includes('/generated/') || showFullBackdrop;
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
        <>
          {showFullBackdrop && (
            <img
              src={hero}
              alt=""
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 0.28,
                filter: 'blur(16px) saturate(0.92) contrast(1.05)',
                pointerEvents: 'none',
              }}
            />
          )}
          <img
            src={hero}
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              right: showFullBackdrop ? 0 : generatedBackdrop ? -68 : -180,
              top: showFullBackdrop ? 0 : generatedBackdrop ? 0 : 18,
              width: showFullBackdrop ? '100%' : generatedBackdrop ? 'calc(100% + 92px)' : 560,
              height: showFullBackdrop ? '100%' : generatedBackdrop ? '100%' : 230,
              objectFit: showFullBackdrop ? 'contain' : 'cover',
              objectPosition: 'center',
              opacity: generatedBackdrop ? 1 : 0.22,
              filter: generatedBackdrop ? 'saturate(0.92) contrast(1.05)' : 'saturate(0.9) contrast(1.08)',
              transform: generatedBackdrop ? 'none' : 'rotate(-3deg)',
              borderRadius: generatedBackdrop ? 0 : 34,
              pointerEvents: 'none',
            }}
          />
        </>
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
          fontSize: 'clamp(16px, 4.8vw, 24px)',
          lineHeight: 1.15,
          letterSpacing: '-0.035em',
          color: foreground,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
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
        <PrimaryAction onClick={onStart} disabled={planned === 0} style={{ marginTop: 16 }}>
          {planned === 0 ? '오늘 학습할 카드가 없어요' : `시작 · ${planned}장`}
        </PrimaryAction>
        {planned === 0 && (
          <MascotEmpty who="duo" size={48} title="오늘은 복습장으로 가볼까요?" style={{ padding: '12px 0 0' }}>
            미션 지도나 복습장에서 다시 듣고 익숙한 표현을 확인할 수 있어요.
          </MascotEmpty>
        )}
      </div>
    </section>
  );
}

// 상태 대시보드 — 코치·학습 상태·가나 안정도·난이도(진단)를 한 카드로 묶어 "한눈에".
// 접었을 때도 등급·코치 한 줄은 보이고, 펼치면 학습 상태·가나 안정도·성장 기록·보유 카드·약점까지.
function StatusDashboard({ d, line, hira, kata, kanaPct, stats, modeLabel, onPlacement }: {
  d: Diagnosis; line: string;
  hira: { mastered: number; total: number }; kata: { mastered: number; total: number };
  kanaPct: number; stats: LearningStats; modeLabel: string; onPlacement: () => void;
}) {
  // 기본은 접힌 상태로 시작(2026-07-08, 사용자 요청) — 요약(코치 한 줄)은 접혀 있어도 항상 보임.
  const [expanded, setExpanded] = useState(false);
  const tone = d.level === 'struggling' ? 'var(--warn)' : d.level === 'cruising' ? 'var(--ok)' : 'var(--accent)';
  return (
    <>
      {/* 헤더: 제목 + 등급 뱃지 + 난이도/진단 칩 + 접기/펼치기 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <p style={{ margin: 0, ...label }}>내 학습 현황</p>
          <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 800, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '3px 9px', borderRadius: 999 }}>🧭 {stats.rank}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button className="ym-press" onClick={onPlacement} title="수준 진단으로 난이도 재조정" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 999,
            border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
            fontSize: 12.5, fontWeight: 750, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
            {modeLabel} · 진단
          </button>
          <button className="ym-press" onClick={() => setExpanded((v) => !v)} aria-label={expanded ? '내 학습 현황 접기' : '내 학습 현황 펼치기'} style={{
            width: 30, height: 30, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink-soft)', cursor: 'pointer',
          }}>
            <Icon name="flow" size={13} style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(-90deg)', transition: 'transform .2s' }} />
          </button>
        </div>
      </div>

      {/* 상태 분석: 캐릭터 + 가나 링 + 코치 한 줄 — 접혀 있어도 항상 보이는 요약.
          캐릭터 표정은 최근 성과(struggling→복구, cruising→정답)에 맞춰 바뀐다. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
        <MascotFace
          who="mung"
          mood={d.level === 'struggling' ? 'recovery' : d.level === 'cruising' ? 'correct' : 'default'}
          size={48}
          style={{ filter: 'saturate(.85) brightness(1.05) drop-shadow(0 8px 14px rgba(0,0,0,.14))' }}
        />
        <Ring pct={kanaPct} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.04em' }}>오늘의 코치</p>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, fontWeight: 650, lineHeight: 1.5, color: 'var(--ink)' }}>{line}</p>
        </div>
      </div>

      {!expanded ? null : (
        <>
          {/* 학습 상태 + 직전 정답률 */}
          <div style={{ marginTop: 13, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, color: 'var(--ink-faint)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: tone, boxShadow: `0 0 8px ${tone}` }} />
                학습 상태{d.level ? ` · ${LEVEL_LABEL[d.level]}` : ''}
              </p>
              {d.level !== null && d.recentAccuracy !== null && (
                <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>직전 정답률 {Math.round(d.recentAccuracy * 100)}%</span>
              )}
            </div>
            <p style={{ margin: '7px 0 0', fontSize: 15, fontWeight: 750, letterSpacing: '-0.01em' }}>{d.focus}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{d.message}</p>
          </div>

          {/* 가나 안정도 — 히라/가타 나란히 */}
          <div style={{ marginTop: 13, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
            <p style={{ margin: 0, ...label }}>가나 안정도</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 18px' }}>
              <KanaRow label="히라가나" m={hira} />
              <KanaRow label="가타카나" m={kata} />
            </div>
          </div>

          {/* 성장 기록 — 학습일·정답률·최근 4주 진도(도감에 흩어져 있던 등급·학습일 통계를 여기로 병합) */}
          <div style={{ marginTop: 13, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
            <p style={{ margin: '0 0 8px', ...label }}>성장 기록</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <StatTile label="학습일" value={`${stats.dates.length}일`} sub={stats.dates.slice(-7).join(' · ') || '아직 없음'} />
              <StatTile label="정답률" value={stats.attempts ? `${Math.round((stats.correct / stats.attempts) * 100)}%` : '—'} sub={`${stats.attempts}문제 학습`} />
            </div>
            <LearningHeatmap dayCounts={stats.dayCounts} />
          </div>

          {/* 약점 */}
          {(d.weakKana.length > 0 || d.weakScenes.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 13, alignItems: 'center' }}>
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
      )}
    </>
  );
}

// 기본 레벨은 순차 단계가 간판·메뉴 하나뿐이라(어휘 주제는 순서 없는 자유 연습으로 뺐음),
// 레벨 진도 패널이 너무 휑해 보이지 않게 생활 기초 + 어휘 주제 일부를 미리보기로 함께 보여준다.
// 나머지 주제는 학습 탭(Practice)에서 전부 볼 수 있다(TravelRoute의 "최대 4개 미리보기" 관례와 동일).
const DEFAULT_PREVIEW_VOCAB_GROUPS = VOCAB_GROUPS.filter((g) => g.id !== 'greetings').slice(0, 3);

// 레벨 진도 패널 — 현재 레벨의 단계를 순서대로, 잠금/완료 상태로. 모두 통과 시 승급 시험.
function LevelProgress({ coreLevel, progression, onStartStage, onStartPromotion, onPracticeWrite, onOpenBasics, onStartVocabGroup, onSeeAll, devUnlockAll }: {
  coreLevel: CoreLevel; progression: ProgressionState;
  onStartStage: (stage: ProgStage) => void; onStartPromotion: () => void; onPracticeWrite: () => void;
  onOpenBasics: () => void; onStartVocabGroup: (groupId: string) => void; onSeeAll: () => void;
  devUnlockAll: boolean;
}) {
  const stages = LEVEL_STAGES[coreLevel];
  const allDone = levelAllComplete(progression, coreLevel);
  const promotionUnlocked = allDone || devUnlockAll;
  const nx = nextLevel(coreLevel);
  const artOf = (s: ProgStage) => s.script ?? s.practice;
  const freeExtras = coreLevel === 'default' ? [
    { key: 'basics', label: '숫자 학습', sub: '숫자·요일·시간·금액', art: 'basics', onClick: onOpenBasics },
    ...DEFAULT_PREVIEW_VOCAB_GROUPS.map((g) => ({ key: `vocab:${g.id}`, label: g.label, sub: g.description, art: vocabGroupArt(g.id), onClick: () => onStartVocabGroup(g.id) })),
  ] : [];
  return (
    <GlassPanel>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <p style={{ margin: 0, ...label }}>레벨 진도 · {CORE_LEVEL_LABEL[coreLevel]}</p>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-faint)' }}>통과하면 다음이 열려요</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
        {stages.map((st, idx) => (
          <StageTile
            key={st.id} order={idx + 1} stage={st} art={artOf(st)}
            done={isStageComplete(progression, coreLevel, st.id)}
            unlocked={devUnlockAll || isStageUnlocked(progression, coreLevel, idx)}
            onClick={() => onStartStage(st)}
          />
        ))}
        {freeExtras.map((it) => (
          <FreeTile key={it.key} label={it.label} sub={it.sub} art={it.art} onClick={it.onClick} />
        ))}
      </div>
      {freeExtras.length > 0 && (
        <button className="ym-press" onClick={onSeeAll} style={{
          width: '100%', marginTop: 10, padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
          border: 'none', background: 'none', color: 'var(--accent)', fontWeight: 750, fontSize: 12.5,
        }}>학습 탭에서 어휘 주제 전체 보기 →</button>
      )}

      {nx ? (
        <button className="ym-press" onClick={onStartPromotion} disabled={!promotionUnlocked} style={{
          width: '100%', marginTop: 12, padding: '14px 16px', borderRadius: 14, cursor: promotionUnlocked ? 'pointer' : 'default',
          fontWeight: 850, fontSize: 14.5, opacity: promotionUnlocked ? 1 : 0.55,
          background: promotionUnlocked ? 'linear-gradient(135deg, #b9382e, #e0564a)' : 'var(--glass-bg-strong)',
          color: promotionUnlocked ? '#fff' : 'var(--ink-faint)', border: promotionUnlocked ? 'none' : '1px solid var(--glass-border)',
        }}>
          {promotionUnlocked ? `🎯 ${CORE_LEVEL_LABEL[nx]} 승급 시험 — 20문항·90%` : '🔒 모든 단계를 통과하면 승급 시험이 열려요'}
        </button>
      ) : (
        <p style={{ margin: '12px 0 0', fontSize: 13.5, color: 'var(--ink-soft)', fontWeight: 700, lineHeight: 1.5 }}>
          고급은 승급 시험 없이 위 단계와 아래 <strong style={{ color: 'var(--ink)' }}>여행 미션</strong>으로 계속 실력을 다져요.
        </p>
      )}

      <button className="ym-press" onClick={onPracticeWrite} style={{
        width: '100%', marginTop: 10, padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
        border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink-soft)', fontWeight: 750, fontSize: 13,
      }}>✍️ 쓰기 시험 — 가나 따라쓰기 (자유 연습)</button>
    </GlassPanel>
  );
}

function StageTile({ order, stage, art, done, unlocked, onClick }: {
  order: number; stage: ProgStage; art: string; done: boolean; unlocked: boolean; onClick: () => void;
}) {
  return (
    <button key={stage.id} className="ym-press" onClick={onClick} disabled={!unlocked} style={{
      position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0,
      border: done ? '1.5px solid var(--ok)' : '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
      borderRadius: 14, padding: 0, cursor: unlocked ? 'pointer' : 'default', opacity: unlocked ? 1 : 0.62, boxShadow: '0 7px 16px rgba(89,58,28,.06)',
    }}>
      <span aria-hidden style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', background: 'rgba(255,247,235,.64)' }}>
        <img src={`/scenes/quick-practice/${art}.webp`} alt="" loading="lazy" decoding="async" style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          filter: unlocked ? 'saturate(.9) contrast(.97) brightness(1.02)' : 'grayscale(.85) brightness(.92)',
        }} />
        <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,247,235,.02), transparent 58%, rgba(48,34,18,.26))' }} />
        {/* 순서 배지 */}
        <span style={{ position: 'absolute', top: 7, left: 7, width: 22, height: 22, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 12, fontWeight: 900 }}>{order}</span>
        {/* 상태 배지 */}
        {done && <span style={{ position: 'absolute', top: 7, right: 7, padding: '3px 7px', borderRadius: 999, background: 'rgba(35,134,82,.96)', color: '#fff', fontSize: 10.5, fontWeight: 900 }}>완료 ✓</span>}
        {!unlocked && (
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🔒</span>
        )}
      </span>
      <span style={{ minWidth: 0, display: 'block', padding: '10px 11px 11px' }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stage.label}</span>
        <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stage.sub}</span>
      </span>
    </button>
  );
}

// 순서 없는 자유 연습 항목(어휘 주제 등) — 늘 열려 있어 순번·잠금 배지가 없다는 점만 StageTile과 다르다.
function FreeTile({ label: lbl, sub, art, onClick }: { label: string; sub: string; art: string; onClick: () => void }) {
  return (
    <button className="ym-press" onClick={onClick} style={{
      position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left', minWidth: 0,
      border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
      borderRadius: 14, padding: 0, cursor: 'pointer', boxShadow: '0 7px 16px rgba(89,58,28,.06)',
    }}>
      <span aria-hidden style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', background: 'rgba(255,247,235,.64)' }}>
        <img src={`/scenes/quick-practice/${art}.webp`} alt="" loading="lazy" decoding="async" style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'saturate(.9) contrast(.97) brightness(1.02)',
        }} />
        <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,247,235,.02), transparent 58%, rgba(48,34,18,.26))' }} />
      </span>
      <span style={{ minWidth: 0, display: 'block', padding: '10px 11px 11px' }}>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lbl}</span>
        <span style={{ display: 'block', fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>
      </span>
    </button>
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

// 진척률 막대 그래프 — 예전엔 숫자만 있어 "차트가 반영 안 됐다"는 피드백을 받아 막대를 추가(2026-07-08).
function KanaRow({ label: lbl, m }: { label: string; m: { mastered: number; total: number } }) {
  const pct = m.total > 0 ? Math.round((m.mastered / m.total) * 100) : 0;
  return (
    <div style={{ marginTop: 9 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 13 }}>
        <span style={{ fontWeight: 700 }}>{lbl}</span>
        <span style={{ color: 'var(--ink-faint)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
          <strong style={{ color: 'var(--ink)' }}>{m.mastered}</strong> / {m.total}
        </span>
      </div>
      <div style={{ marginTop: 5, height: 7, borderRadius: 99, background: 'var(--glass-bg-strong)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 99, transition: 'width .4s ease' }} />
      </div>
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

function coachForHome(d: Diagnosis, mission: ReturnType<typeof CONTENT.missions.find>, sceneWeight: number): { line: string } {
  if (d.level === 'struggling') {
    return { line: '막히면 「もう一度お願いします」만 기억해도 대화는 이어져요.' };
  }
  if (sceneWeight >= 4 && mission) {
    const p = phraseById(mission.steps.find((s) => s.promptPhraseId)?.promptPhraseId);
    if (p) return { line: `오늘은 「${p.kanji ?? p.displayKana ?? p.kana}」를 먼저 귀에 익혀요.` };
  }
  return { line: '짧게 한 판만 해도 다음 장면이 훨씬 덜 낯설어요.' };
}
