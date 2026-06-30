// 세션 완료 — Immersive Scene Coach. 장면 클리어 감정 + 여권 스탬프 + 다음 장면 예고.
import { CONTENT } from '../content';
import { sessionResult, summarize, type ProgressMap, type SessionLogEntry } from '../learn/progress';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { GlassPanel, hexA } from './shell';
import { quickPracticeBackdrop, sceneVisualByMission } from './scene';
import { MascotLine } from './mascot';
import { GachaBox } from './Gacha';
import { boxGrade } from '../learn/collection';
import {
  CORE_LEVEL_LABEL,
  LEVEL_STAGES,
  isStageComplete,
  isStageUnlocked,
  type CoreLevel,
  type ProgStage,
  type ProgressionState,
} from '../learn/progression';

interface Props {
  sessionId: number;
  score: number;
  quizSeen: number;
  sessionLog: SessionLogEntry[];
  progress: ProgressMap;
  speakCount: number;
  canContinue: boolean;
  clearedSceneIds: string[];
  fallbackSceneIds?: string[]; // 장면이 없는 연습 세션(간판·받아쓰기·작문…)에서 점수 좋으면 줄 보상 장면
  nextSceneId?: string;
  showGacha?: boolean;
  reviewCount?: number;
  dictationCount?: number;
  composeCount?: number;
  signCount?: number;
  isQuickPractice?: boolean;
  coreLevel: CoreLevel;
  progression: ProgressionState;
  devUnlockAll?: boolean;
  onRetryWeak: () => void;
  onContinue: () => void;
  onReview?: () => void;
  onDictation?: () => void;
  onCompose?: () => void;
  onSigns?: () => void;
  onFlash?: () => void;
  onPracticeVocab?: () => void;
  onPracticeGreetings?: () => void;
  onPracticeKanaHiragana?: () => void;
  onPracticeKanaKatakana?: () => void;
  onPracticePairs?: () => void;
  onPracticeWrite?: () => void;
  onPracticeVerbs?: () => void;
  onHome: () => void;
}

const placeOf = (id: string) => CONTENT.missions.find((m) => m.id === id)?.place
  ?? CONTENT.missions.find((m) => m.id === id)?.scenario ?? id;

export function Done({ sessionId, score, quizSeen, sessionLog, progress, speakCount, canContinue, clearedSceneIds, fallbackSceneIds = [], nextSceneId, showGacha = true, reviewCount = 0, dictationCount = 0, composeCount = 0, signCount = 0, isQuickPractice = false, coreLevel, progression, devUnlockAll = false, onRetryWeak, onContinue, onReview, onDictation, onCompose, onSigns, onFlash, onPracticeVocab, onPracticeGreetings, onPracticeKanaHiragana, onPracticeKanaKatakana, onPracticePairs, onPracticeWrite, onPracticeVerbs, onHome }: Props) {
  const stars = quizSeen ? Math.max(1, Math.round((score / quizSeen) * 3)) : 0;
  const s = summarize(progress);
  const sr = sessionResult(progress, sessionId);
  const recoveryUsed = sessionLog.filter((r) => r.result === 'recovery').length;
  const wrongCount = sessionLog.filter((r) => r.result === 'wrong').length;
  const weak = new Set(sessionLog.filter((r) => r.result !== 'correct').map((r) => r.id)).size;
  const stamps = clearedSceneIds.slice(0, 3);
  const quickPracticeActions: NextAction[] = [
    ...(onPracticeVocab ? [quickAction('vocab', 'kana', 'var(--accent)', '어휘 커리큘럼', '단어 그림·표기·뜻 다시 회전', onPracticeVocab, true)] : []),
    ...(onPracticeGreetings ? [quickAction('greetings', 'speak', 'var(--ok)', '기본 인사', '듣고 바로 반응하기', onPracticeGreetings)] : []),
    ...(onSigns ? [quickAction('signs', 'sign', 'var(--accent)', '거리 읽기', '간판·메뉴·안내 읽기', onSigns)] : []),
    ...(onDictation ? [quickAction('dictation', 'dictation', 'var(--warn)', '받아쓰기', '듣고 가나 타일로 쓰기', onDictation)] : []),
    ...(onCompose ? [quickAction('compose', 'speak', 'var(--accent)', '한→일 작문', '뜻을 보고 일본어 만들기', onCompose)] : []),
    ...(onPracticeKanaHiragana ? [quickAction('hiragana', 'kana', 'var(--accent)', '히라가나', '글자 읽기 빠른 회전', onPracticeKanaHiragana)] : []),
    ...(onPracticeKanaKatakana ? [quickAction('katakana', 'kana', 'var(--accent)', '가타카나', '외래어 표기 읽기', onPracticeKanaKatakana)] : []),
    ...(onPracticePairs ? [quickAction('pairs', 'listen', 'var(--warn)', '발음 구분', '비슷한 소리 듣고 고르기', onPracticePairs)] : []),
    ...(onPracticeVerbs ? [quickAction('verbs', 'flow', 'var(--accent)', '동사 형태', '자주 쓰는 활용 패턴', onPracticeVerbs)] : []),
    ...(onPracticeWrite ? [quickAction('kana-write', 'kana', 'var(--ok)', '가나 쓰기', '손으로 따라 쓰기', onPracticeWrite)] : []),
    ...(onFlash ? [quickAction('flash', 'fast', 'var(--accent)', '속도전 플래시', '제한시간 안에 빠르게 복습', onFlash)] : []),
  ];
  const weakActions: NextAction[] = [
    ...(weak > 0 ? [{
      section: 'recovery' as const,
      icon: 'target' as const,
      accent: 'var(--accent)',
      title: '오답만 다시 잡기',
      sub: `이번에 막힌 ${weak}개를 바로 다시 풀기`,
      image: quickPracticeBackdrop('flash'),
      badge: '오답',
      onClick: onRetryWeak,
      preferred: true,
    }] : []),
    ...(onReview && reviewCount > 0 ? [{
      section: 'recovery' as const,
      icon: 'recovery' as const,
      accent: 'var(--ok)',
      title: '복습 큐 풀기',
      sub: `익힌 것·오래된 것 ${reviewCount}개 다시`,
      image: quickPracticeBackdrop('basics'),
      badge: '복습',
      onClick: onReview,
    }] : []),
  ];
  const levelGuideActions = LEVEL_STAGES[coreLevel]
    .map((stage, idx) => actionForStage(stage, idx))
    .filter((action): action is NextAction => !!action);
  const nextSceneAction: NextAction | null = !isQuickPractice && canContinue ? (() => {
    const sv = nextSceneId ? sceneVisualByMission(nextSceneId) : null;
    return {
      section: 'next' as const,
      icon: (sv?.icon ?? 'flow') as IconName,
      accent: sv?.accent ?? 'var(--accent)',
      title: '새 장면 학습',
      sub: nextSceneId ? `다음 장면 · ${placeOf(nextSceneId)}` : '새로운 표현 익히기',
      image: sv?.thumb ?? sv?.hero ?? sv?.backdrop,
      badge: '다음',
      onClick: onContinue,
      preferred: weak === 0,
    };
  })() : null;
  const reinforcementActions: NextAction[] = isQuickPractice ? [] : [
    ...(onDictation && dictationCount > 0 ? [quickAction('dictation', 'dictation', 'var(--warn)', '받아쓰기', '듣고 가나 타일로 쓰기', onDictation)] : []),
    ...(onCompose && composeCount > 0 ? [quickAction('compose', 'speak', 'var(--accent)', '한→일 작문', '뜻을 보고 일본어로 만들기', onCompose)] : []),
    ...(onSigns && signCount > 0 ? [quickAction('signs', 'sign', 'var(--accent)', '거리 읽기', '간판·메뉴·안내 읽기', onSigns)] : []),
    ...(onFlash ? [quickAction('flash', 'fast', 'var(--accent)', '속도전 플래시', '제한시간 안에 빠르게 복습', onFlash)] : []),
  ].map((a) => ({ ...a, section: 'next' as const, badge: a.badge ?? '강화' }));
  const actionSections = buildActionSections(CORE_LEVEL_LABEL[coreLevel], {
    recovery: weakActions,
    guide: levelGuideActions,
    quick: isQuickPractice ? quickPracticeActions : [],
    next: [nextSceneAction, ...reinforcementActions].filter((action): action is NextAction => !!action),
  });

  function actionForStage(stage: ProgStage, idx: number): NextAction | null {
    const completed = isStageComplete(progression, coreLevel, stage.id);
    const unlocked = devUnlockAll || isStageUnlocked(progression, coreLevel, idx);
    if (!unlocked) return null;
    const base = (() => {
      if (stage.practice === 'kana' && stage.script === 'hiragana' && onPracticeKanaHiragana) return quickAction('hiragana', 'kana', 'var(--accent)', stage.label, stage.sub, onPracticeKanaHiragana);
      if (stage.practice === 'kana' && stage.script === 'katakana' && onPracticeKanaKatakana) return quickAction('katakana', 'kana', 'var(--accent)', stage.label, stage.sub, onPracticeKanaKatakana);
      if (stage.practice === 'pairs' && onPracticePairs) return quickAction('pairs', 'listen', 'var(--warn)', stage.label, stage.sub, onPracticePairs);
      if (stage.practice === 'dictation' && onDictation) return quickAction('dictation', 'dictation', 'var(--warn)', stage.label, stage.sub, onDictation);
      if (stage.practice === 'greetings' && onPracticeGreetings) return quickAction('greetings', 'speak', 'var(--ok)', stage.label, stage.sub, onPracticeGreetings);
      if (stage.practice === 'signs' && onSigns) return quickAction('signs', 'sign', 'var(--accent)', stage.label, stage.sub, onSigns);
      if (stage.practice === 'vocab' && onPracticeVocab) return quickAction('vocab', 'kana', 'var(--accent)', stage.label, stage.sub, onPracticeVocab);
      if (stage.practice === 'compose' && onCompose) return quickAction('compose', 'speak', 'var(--accent)', stage.label, stage.sub, onCompose);
      if (stage.practice === 'verbs' && onPracticeVerbs) return quickAction('verbs', 'flow', 'var(--accent)', stage.label, stage.sub, onPracticeVerbs);
      return null;
    })();
    if (!base) return null;
    return {
      ...base,
      section: 'guide',
      sub: completed ? `완료 · ${stage.sub}` : stage.sub,
      badge: completed ? '완료' : '다음 단계',
      preferred: !completed,
    };
  }

  return (
    <main style={{ ...WRAP }}>
      {/* 축하 헤드 */}
      <div className="ym-rise" style={{ textAlign: 'center', paddingTop: 8 }}>
        <div className="ym-burst" style={{ width: 76, height: 76, margin: '0 auto', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 28px rgba(185,56,46,0.4)' }}>
          <Icon name={stars >= 3 ? 'trophy' : 'check'} size={38} />
        </div>
        <h1 style={{ margin: '16px 0 0', fontSize: 28 }}>세션 {sessionId} 완료</h1>
        <p style={{ fontSize: 22, margin: '10px 0 0', letterSpacing: 2, color: 'var(--accent)' }}>
          {'★'.repeat(stars)}<span style={{ color: 'var(--glass-border)' }}>{'★'.repeat(3 - stars)}</span>
        </p>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '8px 0 0', fontWeight: 600 }}>
          첫 시도 {score}/{quizSeen}{speakCount > 0 ? ` · 말하기 ${speakCount}` : ''}
        </p>
      </div>

      {/* 여권 스탬프 — 오늘 해낸 장면 */}
      {stamps.length > 0 && (
        <div className="ym-rise" style={{ animationDelay: '.08s', marginTop: 22 }}>
          <p style={{ ...kicker, textAlign: 'center', marginBottom: 12 }}>오늘 일본에서 해낸 일</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {stamps.map((id, i) => <Stamp key={id} id={id} idx={i} />)}
          </div>
          <MascotLine copyKey="doneDuo" style={{ marginTop: 16 }} />
        </div>
      )}

      {/* 복구 성공 */}
      {recoveryUsed > 0 && (
        <p className="ym-rise" style={{ animationDelay: '.12s', textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--warn)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="recovery" size={16} /> 복구 {recoveryUsed}회 — 막혀도 끝까지 이어갔어요
        </p>
      )}

      {/* 가챠 박스 — 세션 장면별 카드 10장 드롭 (학습 로직과 분리). 약점 재도전 세션 제외 */}
      {/* 장면 세션은 클리어 장면으로 보상. 연습 세션(장면 없음)은 별 2개↑일 때만 보상(점수 기준). */}
      {showGacha && <GachaBox sessionId={sessionId} sceneIds={clearedSceneIds.length ? clearedSceneIds : (stars >= 2 ? fallbackSceneIds : [])} grade={boxGrade(stars, recoveryUsed)} />}

      {/* 다음 단계 추천 — 매번 같은 다음 장면 대신 신규·복습·다른 연습을 골라가며 */}
      <div className="ym-rise" style={{ animationDelay: '.16s', marginTop: 24 }}>
        <div className="ym-next-action-head">
          <p style={{ ...kicker, margin: 0 }}>다음엔 무엇을 할까요?</p>
          <span>{isQuickPractice ? '빠른 연습 안에서 오답·복습·다음 단계로 이어갈 수 있어요.' : weak > 0 ? '막힌 곳을 먼저 잡고, 레벨 기준에 맞춰 다음 학습으로 이어가요.' : '현재 레벨 기준에 맞춰 다음 학습을 골라 이어가요.'}</span>
        </div>
        <div className="ym-next-action-board" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {actionSections.map((section) => (
            <section key={section.key} className="ym-next-section" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div className="ym-next-section-head" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 15, color: 'var(--ink)' }}>{section.title}</strong>
                <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 650 }}>{section.caption}</span>
              </div>
              <div className="ym-next-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(158px, 1fr))', gap: 10 }}>
                {section.actions.map((action, idx) => (
                  <NextStep key={`${section.key}:${action.title}:${action.sub}`} {...action} primary={idx === 0 && action.preferred} compact={idx > 0 || !action.preferred} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <button className="ym-press" style={{ ...glassBtn, marginTop: 12 }} onClick={onHome}>
          <Icon name="nav-home" size={18} /> 홈으로
        </button>
      </div>

      {/* 통계 (접힘) */}
      <details style={{ marginTop: 20 }}>
        <summary style={{ ...kicker, cursor: 'pointer', listStyle: 'none', textAlign: 'center', padding: 6 }}>이번 세션 자세히</summary>
        <GlassPanel style={{ marginTop: 10 }}>
          <Row label="카드 수" value={quizSeen} />
          <Row label="첫 시도 정답" value={score} color="var(--ok)" />
          <Row label="복구 사용" value={recoveryUsed} color="var(--warn)" />
          <Row label="오답" value={wrongCount} color="var(--accent)" />
          {speakCount > 0 && <Row label="말한 문장" value={speakCount} />}
          <Row label="새로 익숙" value={sr.masteredNow} color="var(--ok)" />
          <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--ink-faint)' }}>누적: 본 {s.seen} · 익숙 {s.mastered} · 약점 {s.weak}</p>
        </GlassPanel>
      </details>
    </main>
  );
}

const kicker: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 };
const glassBtn: React.CSSProperties = {
  width: '100%', padding: '15px 16px', borderRadius: 16, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};

type IconName = React.ComponentProps<typeof Icon>['name'];
type NextSectionKey = 'recovery' | 'guide' | 'quick' | 'next';

type NextAction = {
  section?: NextSectionKey;
  icon: IconName;
  accent: string;
  title: string;
  sub: string;
  image?: string;
  badge?: string;
  preferred?: boolean;
  onClick: () => void;
};

type NextSection = {
  key: NextSectionKey;
  title: string;
  caption: string;
  actions: NextAction[];
};

function quickAction(art: string, icon: IconName, accent: string, title: string, sub: string, onClick: () => void, preferred = false): NextAction {
  return {
    section: 'quick',
    icon,
    accent,
    title,
    sub,
    image: quickPracticeBackdrop(art),
    badge: '연습',
    onClick,
    preferred,
  };
}

function buildActionSections(levelLabel: string, groups: Record<NextSectionKey, NextAction[]>): NextSection[] {
  const seen = new Set<string>();
  const unique = (actions: NextAction[]) => actions.filter((action) => {
    const key = action.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const sections: NextSection[] = [
    {
      key: 'recovery',
      title: '오답과 복습',
      caption: '틀린 것과 오래된 기억을 먼저 정리',
      actions: unique(groups.recovery),
    },
    {
      key: 'guide',
      title: `${levelLabel} 레벨 가이드`,
      caption: '현재 단계 기준으로 이어가기',
      actions: unique(groups.guide),
    },
    {
      key: 'quick',
      title: '빠른 연습',
      caption: '연습 메뉴 안에서 계속 회전',
      actions: unique(groups.quick),
    },
    {
      key: 'next',
      title: '다음 흐름',
      caption: '새 장면 또는 강화 학습',
      actions: unique(groups.next),
    },
  ];
  return sections.filter((section) => section.actions.length > 0);
}

// 여권 스탬프 — 장면 클리어 도장
function Stamp({ id, idx }: { id: string; idx: number }) {
  const sv = sceneVisualByMission(id);
  const rot = idx % 2 === 0 ? -7 : 6;
  return (
    <div className="ym-burst" style={{ animationDelay: `${0.1 + idx * 0.08}s`, transform: `rotate(${rot}deg)`, width: 94, height: 94, borderRadius: 18, border: `2.5px solid ${sv.accent}`, color: sv.accent, background: hexA(sv.accent, 0.08), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative' }}>
      <Icon name={sv.icon} size={28} />
      <span style={{ fontSize: 13, fontWeight: 800 }}>{placeOf(id)}</span>
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', border: `1.5px solid ${sv.accent}`, borderRadius: 4, padding: '1px 5px' }}>CLEAR</span>
    </div>
  );
}

// 다음 단계 선택지 — 큰 탭 타깃 + 무엇/왜를 한눈에. primary는 강조 테두리.
function NextStep({ icon, accent, title, sub, image, badge, primary, compact, onClick }: NextAction & { primary?: boolean; compact?: boolean }) {
  return (
    <button className={`ym-press ym-next-step${primary ? ' is-primary' : ''}${compact ? ' is-compact' : ''}`} onClick={onClick} style={{
      ['--next-accent' as string]: accent,
      ['--next-soft' as string]: hexA(accent, primary ? 0.18 : 0.11),
      width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textAlign: 'left',
      gridColumn: primary ? '1 / -1' : undefined,
      minHeight: primary ? 168 : 132, aspectRatio: primary ? '16 / 9' : '4 / 3', padding: 0, borderRadius: primary ? 22 : 16, cursor: 'pointer',
      border: `1px solid ${primary ? hexA(accent, 0.46) : 'var(--glass-border)'}`,
      background: image ? '#111827' : primary
        ? `radial-gradient(circle at 12% 10%, ${hexA(accent, 0.3)}, transparent 32%), linear-gradient(135deg, ${hexA(accent, 0.14)}, var(--glass-bg-strong))`
        : 'var(--glass-bg-strong)',
      color: 'var(--ink)', boxShadow: primary ? `0 16px 42px ${hexA(accent, 0.2)}` : undefined,
      position: 'relative', overflow: 'hidden',
    }}>
      {image && (
        <img src={image} alt="" loading="lazy" decoding="async" style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        }} />
      )}
      <span aria-hidden style={{
        position: 'absolute', inset: 0,
        background: image
          ? `linear-gradient(180deg, rgba(7,10,18,0.06) 0%, rgba(7,10,18,0.15) 42%, rgba(7,10,18,0.74) 100%), linear-gradient(135deg, ${hexA(accent, 0.34)}, transparent 42%)`
          : 'transparent',
      }} />
      <span style={{
        position: 'absolute', top: 10, left: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 8px', borderRadius: 999, background: image ? 'rgba(255,255,255,0.9)' : hexA(accent, 0.14),
        color: image ? '#172033' : accent, fontSize: 11, fontWeight: 850,
      }}>
        <Icon name={icon} size={14} /> {badge ?? '추천'}
      </span>
      <span className="ym-next-step-arrow" style={{ position: 'absolute', top: 10, right: 10, width: primary ? 32 : 28, height: primary ? 32 : 28, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: image ? 'rgba(255,255,255,0.9)' : hexA(accent, 0.16), color: accent }}>
        <Icon name="flow" size={17} />
      </span>
      <span style={{ position: 'relative', zIndex: 1, width: '100%', minWidth: 0, padding: primary ? '0 16px 16px' : '0 12px 12px', color: image ? '#fff' : 'var(--ink)' }}>
        <span style={{ display: 'block', fontSize: primary ? 18 : 14.5, fontWeight: 900, lineHeight: 1.18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: compact ? 'nowrap' : 'normal' }}>{title}</span>
        <span style={{ display: 'block', fontSize: primary ? 13 : 11.8, color: image ? 'rgba(255,255,255,0.82)' : 'var(--ink-soft)', marginTop: 4, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: compact ? 'nowrap' : 'normal' }}>{sub}</span>
      </span>
    </button>
  );
}

function Row({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 14, padding: '4px 0' }}>
      <span style={{ color: 'var(--ink-soft)' }}>{label}</span>
      <strong style={{ color: color ?? 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</strong>
    </div>
  );
}
