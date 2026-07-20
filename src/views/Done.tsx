// 세션 완료 — Immersive Scene Coach. 장면 클리어 감정 + 여권 스탬프 + 다음 장면 예고.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import { loadCollection } from '../learn/collection';
import { useLearningStats } from '../learn/learningStats';
import { sessionResult, summarize, type ProgressMap, type SessionLogEntry } from '../learn/progress';
import { categoryBreakdown } from '../learn/sessionCategories';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { GlassPanel, hexA } from './shell';
import { quickPracticeBackdrop, sceneVisualByMission } from './scene';
import { MascotLine } from './mascot';
import { PromotionResult } from './PromotionResult';
import { StatTile } from './StatsWidgets';
import {
  CORE_LEVEL_LABEL,
  LEVEL_STAGES,
  isStageComplete,
  isStageUnlocked,
  type CoreLevel,
  type PracticeKey,
  type ProgStage,
  type ProgressionState,
} from '../learn/progression';

// 레벨 순위 — Practice.tsx(학습 탭)와 동일한 규칙: 현재+지난 레벨은 자유 연습, 미래 레벨은 잠금.
const CORE_LEVEL_RANK: Record<CoreLevel, number> = { beginner: 0, default: 1, express: 2, advanced: 3 };

// 이 연습(practice/script)이 어느 레벨의 몇 번째 단계인지 찾는다(스테이지에 없는 자유 연습은 null).
function findStageLevel(practice: PracticeKey, script?: 'hiragana' | 'katakana'): { level: CoreLevel; idx: number } | null {
  for (const level of Object.keys(LEVEL_STAGES) as CoreLevel[]) {
    const idx = LEVEL_STAGES[level].findIndex((s) => s.practice === practice && (script === undefined || s.script === script));
    if (idx !== -1) return { level, idx };
  }
  return null;
}

// 빠른 연습 배너가 실제로 도달 가능한 단계인지 — 미래 레벨은 항상 잠금, 현재 레벨은 순차 잠금(이전 단계 완료 필요),
// 지난 레벨은 이미 통과했으므로 자유 연습 허용. 세션 완료 화면에서 "아직 배울 단계가 아닌" 연습이
// 한꺼번에 풀려서 나오고 실제로 클릭하면 들어가지던 버그를 막는다.
function stageReachable(coreLevel: CoreLevel, progression: ProgressionState, devUnlockAll: boolean, practice: PracticeKey, script?: 'hiragana' | 'katakana'): boolean {
  if (devUnlockAll) return true;
  const found = findStageLevel(practice, script);
  if (!found) return true; // 어느 레벨에도 속하지 않는 자유 연습(가나 쓰기·속도전 등)은 항상 허용
  const foundRank = CORE_LEVEL_RANK[found.level];
  const curRank = CORE_LEVEL_RANK[coreLevel];
  if (foundRank > curRank) return false; // 아직 도달 못한 레벨
  if (foundRank < curRank) return true;  // 이미 지나온 레벨 — 자유 연습
  return isStageUnlocked(progression, found.level, found.idx); // 현재 레벨 — 순차 잠금
}

interface Props {
  sessionId: number;
  score: number;
  quizSeen: number;
  sessionLog: SessionLogEntry[];
  sessionCards: Card[];
  progress: ProgressMap;
  speakCount: number;
  canContinue: boolean;
  clearedSceneIds: string[];
  nextSceneId?: string;
  reviewCount?: number;
  dictationCount?: number;
  composeCount?: number;
  signCount?: number;
  isQuickPractice?: boolean;
  coreLevel: CoreLevel;
  progression: ProgressionState;
  devUnlockAll?: boolean;
  /** 이번 세션이 승급 시험이었으면 결과 — 있으면 일반 결과 화면 대신 전용 합격/불합격 화면을 그린다. */
  promotionResult?: { fromLevel: CoreLevel; toLevel: CoreLevel; passed: boolean };
  onOpenLevelGuide?: (level: CoreLevel) => void;
  onRetryPromotion?: (level: CoreLevel) => void;
  onRetryWeak: () => void;
  onRetrySame?: () => void; // 방금 한 연습을 처음부터 다시(연습 완료 화면 전용)
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

export function Done({ sessionId, score, quizSeen, sessionLog, sessionCards, progress, speakCount, canContinue, clearedSceneIds, nextSceneId, reviewCount = 0, dictationCount = 0, composeCount = 0, signCount = 0, isQuickPractice = false, coreLevel, progression, devUnlockAll = false, promotionResult, onOpenLevelGuide, onRetryPromotion, onRetryWeak, onRetrySame, onContinue, onReview, onDictation, onCompose, onSigns, onFlash, onPracticeVocab, onPracticeGreetings, onPracticeKanaHiragana, onPracticeKanaKatakana, onPracticePairs, onPracticeWrite, onPracticeVerbs, onHome }: Props) {
  // 훅은 이 아래 이른 반환(promotionResult)과 무관하게 항상 같은 순서로 호출돼야 한다(rules-of-hooks).
  const learningStats = useLearningStats(loadCollection());
  // 승급 시험이었으면 일반 결과 화면 대신 전용 합격/불합격 화면 — 캐릭터가 목적·결과·다음 행동을 설명한다.
  if (promotionResult) {
    return (
      <PromotionResult
        fromLevel={promotionResult.fromLevel}
        toLevel={promotionResult.toLevel}
        passed={promotionResult.passed}
        score={score}
        quizSeen={quizSeen}
        sessionLog={sessionLog}
        sessionCards={sessionCards}
        onOpenLevelGuide={() => onOpenLevelGuide?.(promotionResult.toLevel)}
        onRetry={() => onRetryPromotion?.(promotionResult.fromLevel)}
        onHome={onHome}
      />
    );
  }
  // 정답률을 있는 그대로 보여준다 — 예전엔 0점이어도 최소 1성으로 올려 보여줘서(Math.max(1,…))
  // "하나도 못 맞혔는데 완료 축하"처럼 결과를 왜곡했다. 이젠 별점이 실제 정답률을 그대로 반영한다.
  const accuracy = quizSeen ? score / quizSeen : null;
  const stars = quizSeen ? Math.round((score / quizSeen) * 3) : 0;
  const strugglingResult = accuracy !== null && accuracy < 0.34; // 3분의 1도 못 맞힘 — 축하보다 재학습 권유가 맞다
  const s = summarize(progress);
  const sr = sessionResult(progress, sessionId);
  const catStats = categoryBreakdown(sessionLog, sessionCards);
  const cumulativeAccuracy = learningStats.attempts ? Math.round((learningStats.correct / learningStats.attempts) * 100) : 0;
  const recoveryUsed = sessionLog.filter((r) => r.result === 'recovery').length;
  const wrongCount = sessionLog.filter((r) => r.result === 'wrong').length;
  const weak = new Set(sessionLog.filter((r) => r.result !== 'correct').map((r) => r.id)).size;
  const stamps = clearedSceneIds.slice(0, 3);
  // 아직 도달 못한 레벨의 연습은 배너 자체를 안 보여준다(전엔 항상 다 보이고 눌리면 실제로 들어가지는 버그였음).
  const reach = (practice: PracticeKey, script?: 'hiragana' | 'katakana') => stageReachable(coreLevel, progression, devUnlockAll, practice, script);
  // "전체 어휘 세션"은 더 이상 LEVEL_STAGES 단계가 아니라(자유 배너) stageReachable이 무조건 통과시키지만,
  // Practice.tsx에서는 실제로 중급(express) 배너로 배치해뒀다 — 여기서도 같은 최소 레벨을 지켜야
  // 입문 유저 Done 화면에 중급 전용 메뉴가 새는 걸 막을 수 있다.
  const reachVocabAll = devUnlockAll || CORE_LEVEL_RANK[coreLevel] >= CORE_LEVEL_RANK.express;
  const quickPracticeActions: NextAction[] = [
    // 방금 한 연습을 처음부터 다시 — 항상 맨 앞(가장 예상되는 다음 행동)
    ...(onRetrySame ? [quickAction('retry-same', 'flow', 'var(--ok)', '다시 한번 학습', '방금 한 연습을 처음부터 다시', onRetrySame, true)] : []),
    ...(onPracticeVocab && reachVocabAll ? [quickAction('vocab', 'kana', 'var(--accent)', '전체 어휘 세션', '모든 주제를 SRS 방식으로 복습', onPracticeVocab, !onRetrySame)] : []),
    ...(onPracticeGreetings && reach('greetings') ? [quickAction('greetings', 'speak', 'var(--ok)', '기본 인사', '듣고 바로 반응하기', onPracticeGreetings)] : []),
    ...(onSigns && reach('signs') ? [quickAction('signs', 'sign', 'var(--accent)', '거리 읽기', '간판·메뉴·안내 읽기', onSigns)] : []),
    ...(onDictation && reach('dictation') ? [quickAction('dictation', 'dictation', 'var(--warn)', '받아쓰기', '듣고 가나 타일로 쓰기', onDictation)] : []),
    ...(onCompose && reach('compose') ? [quickAction('compose', 'speak', 'var(--accent)', '한→일 작문', '뜻을 보고 일본어 만들기', onCompose)] : []),
    ...(onPracticeKanaHiragana && reach('kana', 'hiragana') ? [quickAction('hiragana', 'kana', 'var(--accent)', '히라가나', '글자 읽기 빠른 회전', onPracticeKanaHiragana)] : []),
    ...(onPracticeKanaKatakana && reach('kana', 'katakana') ? [quickAction('katakana', 'kana', 'var(--accent)', '가타카나', '외래어 표기 읽기', onPracticeKanaKatakana)] : []),
    ...(onPracticePairs && reach('pairs') ? [quickAction('pairs', 'listen', 'var(--warn)', '발음 구분', '비슷한 소리 듣고 고르기', onPracticePairs)] : []),
    ...(onPracticeVerbs && reach('verbs') ? [quickAction('verbs', 'flow', 'var(--accent)', '동사 형태', '자주 쓰는 활용 패턴', onPracticeVerbs)] : []),
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
      image: quickPracticeBackdrop('retry-missed'),
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
  // nextSceneId가 없으면(입문·기본은 미션 자체가 잠겨 있어 다음 세션에 장면이 전혀 없음) "새 장면
  // 학습"이라는 이름표를 붙일 실체가 없다 — canContinue만 보고 띄우면 가나/어휘뿐인 다음 세션에도
  // "새 장면"이라 잘못 표시되고, 이미 같은 정보를 정확히 주는 레벨 가이드 섹션과 중복된다.
  // 실제 장면이 있을 때만(주로 중급 이상) 이 배너를 띄운다.
  const nextSceneAction: NextAction | null = !isQuickPractice && canContinue && nextSceneId ? (() => {
    const sv = sceneVisualByMission(nextSceneId);
    return {
      section: 'next' as const,
      icon: sv.icon as IconName,
      accent: sv.accent,
      title: '새 장면 학습',
      sub: `다음 장면 · ${placeOf(nextSceneId)}`,
      image: sv.thumb ?? sv.hero ?? sv.backdrop,
      badge: '다음',
      onClick: onContinue,
      preferred: weak === 0,
    };
  })() : null;
  const reinforcementActions: NextAction[] = isQuickPractice ? [] : [
    ...(onDictation && dictationCount > 0 && reach('dictation') ? [quickAction('dictation', 'dictation', 'var(--warn)', '받아쓰기', '듣고 가나 타일로 쓰기', onDictation)] : []),
    ...(onCompose && composeCount > 0 && reach('compose') ? [quickAction('compose', 'speak', 'var(--accent)', '한→일 작문', '뜻을 보고 일본어로 만들기', onCompose)] : []),
    ...(onSigns && signCount > 0 && reach('signs') ? [quickAction('signs', 'sign', 'var(--accent)', '거리 읽기', '간판·메뉴·안내 읽기', onSigns)] : []),
    ...(onFlash ? [quickAction('flash', 'fast', 'var(--accent)', '속도전 플래시', '제한시간 안에 빠르게 복습', onFlash)] : []),
  ].map((a) => ({ ...a, section: 'next' as const, badge: a.badge ?? '강화' }));
  // 연습 완료 화면엔 "오답과 복습" + "연습" 부분만(미션 다음 단계 가이드 X), 미션 완료 화면엔
  // 반대로 "오답과 복습" + 미션 다음 단계 가이드만(다른 연습 목록 X) — 서로의 다음 행동을 섞지 않는다.
  const actionSections = buildActionSections(CORE_LEVEL_LABEL[coreLevel], {
    recovery: weakActions,
    guide: isQuickPractice ? [] : levelGuideActions,
    quick: isQuickPractice ? quickPracticeActions : [],
    next: isQuickPractice ? [] : [nextSceneAction, ...reinforcementActions].filter((action): action is NextAction => !!action),
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
          <Icon name={stars >= 3 ? 'trophy' : strugglingResult ? 'target' : 'check'} size={38} />
        </div>
        <h1 style={{ margin: '16px 0 0', fontSize: 28 }}>세션 {sessionId} 완료</h1>
        {/* 퀴즈 없이 전체 학습만 한 세션엔 별점·"0/0" 대신 학습한 카드 수를 보여준다 —
            채점 대상이 없는데 별점/점수 UI를 그대로 쓰면 실패처럼 보였다. */}
        {quizSeen > 0 ? (
          <>
            <p style={{ fontSize: 22, margin: '10px 0 0', letterSpacing: 2, color: 'var(--accent)' }}>
              {'★'.repeat(stars)}<span style={{ color: 'var(--glass-border)' }}>{'★'.repeat(3 - stars)}</span>
            </p>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '8px 0 0', fontWeight: 600 }}>
              첫 시도 {score}/{quizSeen}{speakCount > 0 ? ` · 말하기 ${speakCount}` : ''}
            </p>
          </>
        ) : (
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '10px 0 0', fontWeight: 600 }}>
            카드 {sessionCards.length}개 학습 완료
          </p>
        )}
        {strugglingResult && (
          <p style={{ color: 'var(--warn)', fontSize: 13, margin: '10px 0 0', fontWeight: 700 }}>
            이번엔 많이 낯설었어요 — 아래에서 다시 배우고 도전하면 훨씬 쉬워져요.
          </p>
        )}
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

      {/* 결과 자세히 — 카테고리별 정답률 + 누적 통계와 비교. 접지 않고 바로 보여줘서
          "시험 결과를 제대로 안 알려준다"는 문제를 승급 시험 화면과 같은 수준으로 해결한다. */}
      {quizSeen > 0 && (
        <div className="ym-rise" style={{ animationDelay: '.14s', marginTop: 16 }}>
          <GlassPanel>
            {catStats.length > 0 && (
              <>
                <p style={{ ...kicker, margin: '0 0 8px' }}>카테고리별 정답률</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {catStats.map((c) => (
                    <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                      <span style={{ color: 'var(--ink)' }}>{c.label}</span>
                      <strong style={{ color: c.correct === c.total ? 'var(--ok)' : c.correct === 0 ? 'var(--warn)' : 'var(--ink-soft)' }}>
                        {c.correct}/{c.total}
                      </strong>
                    </div>
                  ))}
                </div>
                <div style={{ margin: '12px 0', borderTop: '1px solid var(--glass-border)' }} />
              </>
            )}
            <p style={{ ...kicker, margin: '0 0 8px' }}>누적 학습과 비교</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <StatTile label="누적 정답률" value={`${cumulativeAccuracy}%`} sub={`${learningStats.correct}/${learningStats.attempts}회 시도`} />
              <StatTile label="현재 등급" value={learningStats.rank} sub={`${learningStats.rankScore}/${learningStats.nextAt}점`} />
            </div>
          </GlassPanel>
        </div>
      )}

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
