import {
  CORE_LEVEL_LABEL, CORE_LEVELS, LEVEL_STAGES, isStageComplete, isStageUnlocked,
  type CoreLevel, type ProgStage, type ProgressionState,
} from '../learn/progression';
import { VOCAB_GROUPS, vocabGroupArt } from '../content/thematicVocab';
import { WRAP } from '../ui/styles';
import { Icon, type IconName } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { GlassPanel, hexA } from './shell';

interface Props {
  nav: NavBarProps;
  coreLevel: CoreLevel;
  progression: ProgressionState;
  devUnlockAll: boolean;
  onStartStage: (stage: ProgStage) => void;
  onPracticeWrite: () => void;
  onPracticeSpeak: () => void;
  onPracticeFlash: () => void;
  onOpenBasics: () => void;
  onOpenPublic: () => void;
  onOpenEntertainment: () => void;
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
  if (!item.stage) return true;
  const idx = LEVEL_STAGES[item.level].findIndex((stage) => stage.id === item.stage?.id);
  return idx < 0 ? true : isStageUnlocked(progression, item.level, idx);
}

function itemDone(item: PracticeItem, progression: ProgressionState): boolean {
  return !!item.stage && isStageComplete(progression, item.level, item.stage.id);
}

export function Practice({ nav, coreLevel, progression, devUnlockAll, onStartStage, onPracticeWrite, onPracticeSpeak, onPracticeFlash, onOpenBasics, onOpenPublic, onOpenEntertainment, onStartVocabGroup }: Props) {
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
      key: 'beginner:flash',
      label: '속도전 대결',
      sub: '제한시간 즉답',
      level: 'beginner',
      art: 'flash',
      icon: 'fast',
      accent: '#b9382e',
      onClick: onPracticeFlash,
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

  return (
    <main style={WRAP}>
      <NavBar {...nav} />
      <GlassPanel>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: 'var(--accent)', letterSpacing: '.06em' }}>STUDY</p>
            <h1 style={{ margin: '5px 0 0', fontSize: 25, lineHeight: 1.12, letterSpacing: 0 }}>학습</h1>
          </div>
          <span style={{
            flex: '0 0 auto',
            padding: '7px 10px',
            borderRadius: 999,
            background: devUnlockAll ? 'var(--accent)' : 'var(--glass-bg-strong)',
            color: devUnlockAll ? 'var(--accent-ink)' : 'var(--ink-soft)',
            border: '1px solid var(--glass-border)',
            fontSize: 12,
            fontWeight: 900,
          }}>
            {devUnlockAll ? '제한 해제' : CORE_LEVEL_LABEL[coreLevel]}
          </span>
        </div>
      </GlassPanel>

      {CORE_LEVELS.map((level) => {
        const group = items.filter((item) => item.level === level);
        if (!group.length) return null;
        const lockedLevel = !devUnlockAll && LEVEL_RANK[level] > LEVEL_RANK[coreLevel];
        return (
          <section key={level} className="ym-rise" style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '0 2px 9px' }}>
              <h2 style={{ margin: 0, fontSize: 15, color: 'var(--ink)', lineHeight: 1.2 }}>{CORE_LEVEL_LABEL[level]}</h2>
              {lockedLevel && <span style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 850 }}>잠김</span>}
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
    </main>
  );
}

function PracticeCard({ item, unlocked, done }: { item: PracticeItem; unlocked: boolean; done: boolean }) {
  return (
    <button
      className="ym-press"
      onClick={item.onClick}
      disabled={!unlocked}
      style={{
        position: 'relative',
        minWidth: 0,
        overflow: 'hidden',
        aspectRatio: '4 / 3',
        border: `1px solid ${unlocked ? 'var(--glass-border)' : 'rgba(127,127,127,.18)'}`,
        borderRadius: 16,
        padding: 0,
        background: 'var(--glass-bg-strong)',
        color: '#fff',
        cursor: unlocked ? 'pointer' : 'default',
        opacity: unlocked ? 1 : 0.58,
        textAlign: 'left',
        boxShadow: unlocked ? '0 10px 22px rgba(89,58,28,.09)' : 'none',
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
        padding: 10,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: hexA(item.accent, 0.82),
            border: '1px solid rgba(255,255,255,.22)',
            color: '#fff',
          }}>
            <Icon name={item.icon} size={18} />
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
            {done ? '완료' : unlocked ? '열림' : 'LOCK'}
          </span>
        </span>
        <span style={{ display: 'block', minWidth: 0 }}>
          <strong style={{ display: 'block', fontSize: 17, lineHeight: 1.08, fontWeight: 950, textShadow: '0 2px 8px rgba(0,0,0,.45)', overflowWrap: 'anywhere' }}>{item.label}</strong>
          <span style={{ display: 'block', marginTop: 4, fontSize: 11.5, lineHeight: 1.28, fontWeight: 760, color: 'rgba(255,255,255,.82)', overflowWrap: 'anywhere' }}>{item.sub}</span>
        </span>
      </span>
    </button>
  );
}
