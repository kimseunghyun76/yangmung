import { CONTENT } from '../content';
import {
  CORE_LEVEL_LABEL, CORE_LEVELS, LEVEL_STAGES, isStageComplete, isStageUnlocked,
  type CoreLevel, type ProgStage, type ProgressionState,
} from '../learn/progression';
import { kanaReadMastery, type ProgressMap } from '../learn/progress';
import { VOCAB_GROUPS, vocabGroupArt } from '../content/thematicVocab';
import { WRAP } from '../ui/styles';
import { Icon, type IconName } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead } from './ui';
import { GlassPanel, hexA } from './shell';

interface Props {
  nav: NavBarProps;
  coreLevel: CoreLevel;
  progression: ProgressionState;
  progress: ProgressMap;
  devUnlockAll: boolean;
  onStartStage: (stage: ProgStage) => void;
  onPracticeWrite: () => void;
  onPracticeSpeak: () => void;
  onPracticeFlash: () => void;
  onOpenBasics: () => void;
  onOpenPublic: () => void;
  onOpenEntertainment: () => void;
  onOpenDiscoverGallery: () => void;
  onStartVocabGroup: (groupId: string) => void;
}

interface PracticeItem {
  key: string;
  label: string;
  sub: string;
  level: CoreLevel;
  art: string;
  icon: IconName;
  accent: string;
  stage?: ProgStage;
  onClick: () => void;
  // stage 기반 순차 잠금과 다른 커스텀 해금 조건이 필요할 때만 지정(예: 히라가나+가타카나 완료).
  unlockCheck?: (progression: ProgressionState) => boolean;
}

const LEVEL_RANK: Record<CoreLevel, number> = { beginner: 0, default: 1, express: 2, advanced: 3 };
const STAGE_ART: Record<string, string> = {
  hiragana: 'hiragana',
  katakana: 'katakana',
  pairs: 'pairs',
  dictation: 'dictation',
  greetings: 'greetings',
  signs: 'signs',
  vocab: 'vocab',
  compose: 'compose',
  verbs: 'verbs',
};
const STAGE_ICON: Record<string, IconName> = {
  hiragana: 'kana',
  katakana: 'kana',
  pairs: 'listen',
  dictation: 'dictation',
  greetings: 'speak',
  signs: 'sign',
  vocab: 'kana',
  compose: 'flow',
  verbs: 'flow',
};
const LEVEL_ACCENT: Record<CoreLevel, string> = {
  beginner: '#b9382e',
  default: '#2f8b67',
  express: '#3867b7',
  advanced: '#8d63c7',
};
const kicker: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 };

function stageItems(onStartStage: (stage: ProgStage) => void): PracticeItem[] {
  return CORE_LEVELS.flatMap((level) =>
    LEVEL_STAGES[level].map((stage) => ({
      key: `${level}:${stage.id}`,
      label: stage.label,
      sub: stage.sub,
      level,
      art: STAGE_ART[stage.id] ?? 'vocab',
      icon: STAGE_ICON[stage.id] ?? 'flow',
      accent: LEVEL_ACCENT[level],
      stage,
      onClick: () => onStartStage(stage),
    })),
  );
}

function itemUnlocked(item: PracticeItem, coreLevel: CoreLevel, progression: ProgressionState, devUnlockAll: boolean): boolean {
  if (devUnlockAll) return true;
  if (LEVEL_RANK[item.level] < LEVEL_RANK[coreLevel]) return true;
  if (LEVEL_RANK[item.level] > LEVEL_RANK[coreLevel]) return false;
  if (item.unlockCheck) return item.unlockCheck(progression);
  if (!item.stage) return true;
  const idx = LEVEL_STAGES[item.level].findIndex((stage) => stage.id === item.stage?.id);
  return idx < 0 ? true : isStageUnlocked(progression, item.level, idx);
}

function itemDone(item: PracticeItem, progression: ProgressionState): boolean {
  return !!item.stage && isStageComplete(progression, item.level, item.stage.id);
}

export function Practice({ nav, coreLevel, progression, progress, devUnlockAll, onStartStage, onPracticeWrite, onPracticeSpeak, onPracticeFlash, onOpenBasics, onOpenPublic, onOpenEntertainment, onOpenDiscoverGallery, onStartVocabGroup }: Props) {
  const hira = kanaReadMastery(progress, CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id));
  const kata = kanaReadMastery(progress, CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id));
  // 어휘 커리큘럼 — 예전엔 "어휘 커리큘럼" 배너 하나로 뭉쳐 그 안의 하위 메뉴(/vocab)로 들어가야 했는데,
  // 그 메뉴 안에 기본 인사·생활 기초가 이미 별도 배너로 있는 내용과 중복돼 혼란스러웠다.
  // 이제 기본 인사(입문 단계로 이동)를 뺀 나머지 주제 그룹을 기본 레벨에 개별 배너로 바로 펼쳐 놓는다.
  const vocabGroupItems: PracticeItem[] = VOCAB_GROUPS.filter((g) => g.id !== 'greetings').map((g) => ({
    key: `default:vocab:${g.id}`,
    label: g.label,
    sub: g.description,
    level: 'default',
    art: vocabGroupArt(g.id),
    icon: 'kana',
    accent: LEVEL_ACCENT.default,
    onClick: () => onStartVocabGroup(g.id),
  }));
  const items: PracticeItem[] = [
    ...stageItems(onStartStage),
    {
      key: 'default:basics',
      label: '숫자 학습',
      sub: '숫자·요일·시간·금액',
      level: 'default',
      art: 'basics',
      icon: 'kana',
      accent: LEVEL_ACCENT.default,
      onClick: onOpenBasics,
    },
    ...vocabGroupItems,
    {
      key: 'beginner:kana-write',
      label: '가나 쓰기',
      sub: '손으로 따라 쓰기',
      level: 'beginner',
      art: 'kana-write',
      icon: 'kana',
      accent: '#2f8b67',
      onClick: onPracticeWrite,
    },
    {
      key: 'beginner:kana-speak',
      label: '가나 말하기',
      sub: '듣고 따라 말하기 10자',
      level: 'beginner',
      art: 'greetings',
      icon: 'speak',
      accent: '#2f8b67',
      onClick: onPracticeSpeak,
    },
    {
      key: 'beginner:discover',
      label: '이제 읽을 수 있어요!',
      sub: '히라가나·가타카나를 다 배운 뒤 모아보는 표현들',
      level: 'beginner',
      art: 'hiragana',
      icon: 'discover',
      accent: '#2f8b67',
      onClick: onOpenDiscoverGallery,
      unlockCheck: (p) => isStageComplete(p, 'beginner', 'hiragana') && isStageComplete(p, 'beginner', 'katakana'),
    },
    {
      key: 'express:vocab-all',
      label: '전체 어휘 세션',
      sub: '모든 주제를 SRS 방식으로 복습',
      level: 'express',
      art: 'vocab',
      icon: 'kana',
      accent: LEVEL_ACCENT.express,
      onClick: () => onStartVocabGroup('all'),
    },
    {
      key: 'advanced:public',
      label: '공공 표현',
      sub: '간판·방송 메시지',
      level: 'advanced',
      art: 'signs',
      icon: 'sign',
      accent: LEVEL_ACCENT.advanced,
      onClick: onOpenPublic,
    },
    {
      key: 'advanced:entertainment',
      label: '명장면·가사',
      sub: '대화와 노래 표현',
      level: 'advanced',
      art: 'greetings',
      icon: 'speak',
      accent: LEVEL_ACCENT.advanced,
      onClick: onOpenEntertainment,
    },
  ];

  // 오늘의 추천 — 현재 레벨에서 아직 안 끝낸, 잠기지 않은 첫 스테이지(순서대로). 미션 지도의
  // "추천" 카드와 같은 역할: 여러 섹션을 훑어보지 않고도 바로 다음 할 일을 알 수 있게 한다.
  const recommended = items.find((item) => item.level === coreLevel && item.stage
    && itemUnlocked(item, coreLevel, progression, devUnlockAll) && !itemDone(item, progression));

  return (
    <main style={WRAP}>
      <NavBar {...nav} />
      <PageHead title="학습 지도" sub="레벨별 단계를 순서대로 밟고, 자유 연습으로 언제든 복습해요" />

      {/* 진행률 + 가나 읽기 기준 — 예전엔 비슷한 "요약 지표" 패널 두 개가 따로 붙어 있어
          화면이 길어 보였다(사용자 지적: 화면이 어수선함). 한 카드 안에 구분선으로만 나눴다. */}
      <GlassPanel style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <p style={{ ...kicker, margin: 0 }}>내 진행률</p>
          <span style={{
            padding: '4px 9px', borderRadius: 999,
            background: devUnlockAll ? 'var(--accent)' : 'var(--glass-bg-strong)',
            color: devUnlockAll ? 'var(--accent-ink)' : 'var(--ink-soft)',
            border: '1px solid var(--glass-border)', fontSize: 11, fontWeight: 900,
          }}>
            {devUnlockAll ? '제한 해제' : `현재 · ${CORE_LEVEL_LABEL[coreLevel]}`}
          </span>
        </div>
        {CORE_LEVELS.map((level) => (
          <LevelProgressRow key={level} level={level} isCurrent={level === coreLevel} progression={progression} />
        ))}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
          <p style={{ ...kicker, marginBottom: 10 }}>가나 · 읽기 기준</p>
          <KanaMasteryBar label="히라가나" m={hira} />
          <KanaMasteryBar label="가타카나" m={kata} />
        </div>
      </GlassPanel>

      {/* 오늘의 추천 */}
      {recommended && (
        <section className="ym-rise" style={{ marginBottom: 18 }}>
          <p style={{ ...kicker, marginBottom: 10 }}>오늘의 추천</p>
          <PracticeCard item={recommended} unlocked done={false} featured />
        </section>
      )}

      {CORE_LEVELS.map((level) => {
        const group = items.filter((item) => item.level === level);
        if (!group.length) return null;
        const lockedLevel = !devUnlockAll && LEVEL_RANK[level] > LEVEL_RANK[coreLevel];
        // 아직 도달 못한 레벨은 이미지 카드 대신 미션 지도의 "아직 안 열린 장면"처럼 자물쇠 그리드로
        // 압축해 보여준다 — 레벨마다 큰 이미지 카드가 반복돼 화면이 답답해 보이던 문제(2026-07-29 지적)의 해결책.
        if (lockedLevel) {
          return <LockedLevelSection key={level} level={level} count={group.length} />;
        }
        return (
          <section key={level} className="ym-rise" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '0 2px 9px' }}>
              <h2 style={{ margin: 0, fontSize: 15, color: 'var(--ink)', lineHeight: 1.2 }}>{CORE_LEVEL_LABEL[level]}</h2>
              {level === coreLevel && <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 900 }}>현재 레벨</span>}
              {LEVEL_RANK[level] < LEVEL_RANK[coreLevel] && <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 850 }}>지난 레벨 · 자유 복습</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              {group.map((item) => (
                <PracticeCard
                  key={item.key}
                  item={item}
                  unlocked={itemUnlocked(item, coreLevel, progression, devUnlockAll)}
                  done={itemDone(item, progression)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* 속도전 대결 — 레벨 단계와 무관한 공통 미션(어느 레벨에서든 그 레벨 문제로 도전 가능)이라
          레벨별 진도 그리드 안에 끼워 넣지 않고, 페이지 맨 아래에 별도 배너로 분리해 놓는다. */}
      <section className="ym-rise" style={{ marginTop: 18 }}>
        <button className="ym-press" onClick={onPracticeFlash} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
          borderRadius: 18, border: '1px solid var(--glass-border)', cursor: 'pointer', textAlign: 'left',
          background: 'linear-gradient(120deg, rgba(185,56,46,.16), var(--glass-bg-strong) 60%)',
        }}>
          <span style={{
            flex: '0 0 auto', width: 46, height: 46, borderRadius: 14, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center', background: hexA('#b9382e', 0.16), color: '#b9382e',
          }}>
            <Icon name="fast" size={22} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 16, color: 'var(--ink)' }}>속도전 대결</strong>
              <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', fontSize: 10.5, fontWeight: 850, color: 'var(--ink-soft)' }}>공통 · 전 레벨</span>
            </span>
            <span style={{ display: 'block', marginTop: 3, fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 650 }}>제한시간 즉답 — 지금 레벨 문제로 바로 대결해요</span>
          </span>
          <Icon name="flow" size={18} style={{ color: 'var(--ink-faint)', flex: '0 0 auto' }} />
        </button>
      </section>

    </main>
  );
}

function PracticeCard({ item, unlocked, done, featured = false }: { item: PracticeItem; unlocked: boolean; done: boolean; featured?: boolean }) {
  return (
    <button
      className="ym-press"
      onClick={item.onClick}
      disabled={!unlocked}
      style={{
        position: 'relative',
        minWidth: 0,
        width: '100%',
        overflow: 'hidden',
        aspectRatio: featured ? '16 / 9' : '4 / 3',
        border: featured ? `1.5px solid ${hexA(item.accent, 0.5)}` : `1px solid ${unlocked ? 'var(--glass-border)' : 'rgba(127,127,127,.18)'}`,
        borderRadius: featured ? 22 : 16,
        padding: 0,
        background: 'var(--glass-bg-strong)',
        color: '#fff',
        cursor: unlocked ? 'pointer' : 'default',
        opacity: unlocked ? 1 : 0.58,
        textAlign: 'left',
        boxShadow: featured ? '0 14px 32px rgba(89,58,28,.14)' : unlocked ? '0 10px 22px rgba(89,58,28,.09)' : 'none',
      }}
    >
      <img
        src={`/scenes/quick-practice/${item.art}.webp`}
        alt=""
        loading="lazy"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: unlocked ? 'saturate(.92) contrast(1.02)' : 'grayscale(.78) brightness(.8)',
        }}
      />
      <span aria-hidden style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,.03), rgba(0,0,0,.28) 48%, rgba(0,0,0,.76))',
      }} />
      <span style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: featured ? 16 : 10,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            width: featured ? 42 : 34,
            height: featured ? 42 : 34,
            borderRadius: 11,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: hexA(item.accent, 0.82),
            border: '1px solid rgba(255,255,255,.22)',
            color: '#fff',
          }}>
            <Icon name={item.icon} size={featured ? 22 : 18} />
          </span>
          <span style={{
            padding: '4px 7px',
            borderRadius: 999,
            background: done ? 'rgba(35,134,82,.92)' : unlocked ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.42)',
            border: '1px solid rgba(255,255,255,.18)',
            fontSize: 10.5,
            fontWeight: 950,
            color: '#fff',
          }}>
            {done ? '완료' : unlocked ? (featured ? '바로 시작' : '열림') : 'LOCK'}
          </span>
        </span>
        <span style={{ display: 'block', minWidth: 0 }}>
          <strong style={{ display: 'block', fontSize: featured ? 22 : 17, lineHeight: 1.08, fontWeight: 950, textShadow: '0 2px 8px rgba(0,0,0,.45)', overflowWrap: 'anywhere' }}>{item.label}</strong>
          <span style={{ display: 'block', marginTop: 4, fontSize: featured ? 13 : 11.5, lineHeight: 1.28, fontWeight: 760, color: 'rgba(255,255,255,.82)', overflowWrap: 'anywhere' }}>{item.sub}</span>
        </span>
      </span>
    </button>
  );
}

// 가나 읽기 숙련도 막대(예전 미션 지도에 있던 것을 여기로 이동, 2026-07-29).
function KanaMasteryBar({ label, m }: { label: string; m: { mastered: number; total: number } }) {
  const SEG = 18;
  const filled = Math.round((m.mastered / Math.max(1, m.total)) * SEG);
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
        <span>{label}</span><span style={{ color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}><strong style={{ color: 'var(--ink)' }}>{m.mastered}</strong>/{m.total}</span>
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 7 }}>
        {Array.from({ length: SEG }, (_, i) => (
          <span key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i < filled ? 'var(--accent)' : 'var(--glass-border)' }} />
        ))}
      </div>
    </div>
  );
}

// 레벨별 진행률 한 줄 — 상단 배너에서 4개 레벨을 한눈에 훑어보게 한다("진행률 상단 표기", 2026-07-29).
// 고급은 순차 단계가 없어(LEVEL_STAGES.advanced = []) 막대 대신 "자유 학습"으로 표시.
function LevelProgressRow({ level, isCurrent, progression }: { level: CoreLevel; isCurrent: boolean; progression: ProgressionState }) {
  const stages = LEVEL_STAGES[level];
  const total = stages.length;
  const completed = stages.filter((s) => isStageComplete(progression, level, s.id)).length;
  const pct = total ? completed / total : 1;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <span style={{ flex: '0 0 46px', fontSize: 12.5, fontWeight: isCurrent ? 950 : 750, color: isCurrent ? 'var(--accent)' : 'var(--ink-soft)' }}>
        {CORE_LEVEL_LABEL[level]}
      </span>
      {total > 0 ? (
        <>
          <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--glass-border)', overflow: 'hidden' }}>
            <div style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 999, background: LEVEL_ACCENT[level], transition: 'width .4s ease' }} />
          </div>
          <span style={{ flex: '0 0 auto', fontSize: 11.5, fontWeight: 800, color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>{completed}/{total}</span>
        </>
      ) : (
        <span style={{ flex: 1, fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 700 }}>단계 없이 자유 학습</span>
      )}
    </div>
  );
}

// 아직 도달 못한 레벨 — 미션 지도의 "아직 안 열린 장면"과 같은 자물쇠 그리드로 압축 표시.
// 레벨마다 이미지 카드가 그대로 반복되면 화면이 길고 답답해 보이던 문제의 해결책.
function LockedLevelSection({ level, count }: { level: CoreLevel; count: number }) {
  return (
    <section className="ym-rise" style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '0 2px 9px' }}>
        <h2 style={{ margin: 0, fontSize: 15, color: 'var(--ink)', lineHeight: 1.2 }}>{CORE_LEVEL_LABEL[level]}</h2>
        <span style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 850 }}>잠김 · {count}개</span>
      </div>
      <GlassPanel style={{ padding: 12 }}>
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '0 0 10px', fontWeight: 700 }}>
          {CORE_LEVEL_LABEL[level]} 레벨로 승급하면 열려요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8 }}>
          {Array.from({ length: count }, (_, i) => (
            <div key={i} aria-hidden style={{ aspectRatio: '1', borderRadius: 10, border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--ink-faint)', opacity: 0.6 }}>🔒</div>
          ))}
        </div>
      </GlassPanel>
    </section>
  );
}
