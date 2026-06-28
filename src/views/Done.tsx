// 세션 완료 — Immersive Scene Coach. 장면 클리어 감정 + 여권 스탬프 + 다음 장면 예고.
import { CONTENT } from '../content';
import { sessionResult, summarize, type ProgressMap, type SessionLogEntry } from '../learn/progress';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { GlassPanel, hexA } from './shell';
import { sceneVisualByMission } from './scene';
import { MascotLine } from './mascot';
import { GachaBox } from './Gacha';
import { boxGrade } from '../learn/collection';

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

export function Done({ sessionId, score, quizSeen, sessionLog, progress, speakCount, canContinue, clearedSceneIds, fallbackSceneIds = [], nextSceneId, showGacha = true, reviewCount = 0, dictationCount = 0, composeCount = 0, signCount = 0, isQuickPractice = false, onRetryWeak, onContinue, onReview, onDictation, onCompose, onSigns, onFlash, onPracticeVocab, onPracticeGreetings, onPracticeKanaHiragana, onPracticeKanaKatakana, onPracticePairs, onPracticeWrite, onPracticeVerbs, onHome }: Props) {
  const stars = quizSeen ? Math.max(1, Math.round((score / quizSeen) * 3)) : 0;
  const s = summarize(progress);
  const sr = sessionResult(progress, sessionId);
  const recoveryUsed = sessionLog.filter((r) => r.result === 'recovery').length;
  const wrongCount = sessionLog.filter((r) => r.result === 'wrong').length;
  const weak = new Set(sessionLog.filter((r) => r.result !== 'correct').map((r) => r.id)).size;
  const stamps = clearedSceneIds.slice(0, 3);
  const quickPracticeActions: NextAction[] = [
    ...(onPracticeVocab ? [{ icon: 'kana' as const, accent: 'var(--accent)', title: '어휘 커리큘럼', sub: '단어 그림·표기·뜻 다시 회전', onClick: onPracticeVocab, preferred: true }] : []),
    ...(onPracticeGreetings ? [{ icon: 'speak' as const, accent: 'var(--ok)', title: '기본 인사', sub: '듣고 바로 반응하기', onClick: onPracticeGreetings }] : []),
    ...(onSigns ? [{ icon: 'sign' as const, accent: 'var(--accent)', title: '거리 읽기', sub: '간판·메뉴·안내 읽기', onClick: onSigns }] : []),
    ...(onDictation ? [{ icon: 'dictation' as const, accent: 'var(--warn)', title: '받아쓰기', sub: '듣고 가나 타일로 쓰기', onClick: onDictation }] : []),
    ...(onCompose ? [{ icon: 'speak' as const, accent: 'var(--accent)', title: '한→일 작문', sub: '뜻을 보고 일본어 만들기', onClick: onCompose }] : []),
    ...(onPracticeKanaHiragana ? [{ icon: 'kana' as const, accent: 'var(--accent)', title: '히라가나', sub: '글자 읽기 빠른 회전', onClick: onPracticeKanaHiragana }] : []),
    ...(onPracticeKanaKatakana ? [{ icon: 'kana' as const, accent: 'var(--accent)', title: '가타카나', sub: '외래어 표기 읽기', onClick: onPracticeKanaKatakana }] : []),
    ...(onPracticePairs ? [{ icon: 'listen' as const, accent: 'var(--warn)', title: '발음 구분', sub: '비슷한 소리 듣고 고르기', onClick: onPracticePairs }] : []),
    ...(onPracticeVerbs ? [{ icon: 'flow' as const, accent: 'var(--accent)', title: '동사 형태', sub: '자주 쓰는 활용 패턴', onClick: onPracticeVerbs }] : []),
    ...(onPracticeWrite ? [{ icon: 'kana' as const, accent: 'var(--ok)', title: '가나 쓰기', sub: '손으로 따라 쓰기', onClick: onPracticeWrite }] : []),
    ...(onFlash ? [{ icon: 'fast' as const, accent: 'var(--accent)', title: '속도전 플래시', sub: '제한시간 안에 빠르게 복습', onClick: onFlash }] : []),
  ];
  const nextActions: NextAction[] = isQuickPractice ? quickPracticeActions : [
    ...(weak > 0 ? [{
      icon: 'target' as const,
      accent: 'var(--accent)',
      title: '약점만 다시 풀기',
      sub: `이번에 막힌 ${weak}개 집중`,
      onClick: onRetryWeak,
      preferred: !canContinue,
    }] : []),
    ...(canContinue ? [{
      icon: nextSceneId ? sceneVisualByMission(nextSceneId).icon : 'flow' as const,
      accent: nextSceneId ? sceneVisualByMission(nextSceneId).accent : 'var(--accent)',
      title: '새 장면 학습',
      sub: nextSceneId ? `다음 장면 · ${placeOf(nextSceneId)}` : '새로운 표현 익히기',
      onClick: onContinue,
      preferred: true,
    }] : []),
    ...(onReview && reviewCount > 0 ? [{ icon: 'recovery' as const, accent: 'var(--ok)', title: '복습하기', sub: `익힌 것·오래된 것 ${reviewCount}개 다시`, onClick: onReview }] : []),
    ...(onDictation && dictationCount > 0 ? [{ icon: 'dictation' as const, accent: 'var(--warn)', title: '받아쓰기', sub: '듣고 가나 타일로 쓰기', onClick: onDictation }] : []),
    ...(onCompose && composeCount > 0 ? [{ icon: 'speak' as const, accent: 'var(--accent)', title: '한→일 작문', sub: '뜻을 보고 일본어로 만들기', onClick: onCompose }] : []),
    ...(onSigns && signCount > 0 ? [{ icon: 'sign' as const, accent: 'var(--accent)', title: '거리 읽기', sub: '간판·메뉴·안내 읽기', onClick: onSigns }] : []),
    ...(onFlash ? [{ icon: 'fast' as const, accent: 'var(--accent)', title: '속도전 플래시', sub: '제한시간 안에 빠르게 복습', onClick: onFlash }] : []),
  ];
  const primaryNext = nextActions.find((a) => a.preferred) ?? nextActions[0];
  const secondaryNext = nextActions.filter((a) => a !== primaryNext);

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
          <span>{isQuickPractice ? '빠른 연습 안에서 바로 이어갈 수 있어요.' : weak > 0 ? '막힌 곳을 먼저 잡거나, 바로 다음 장면으로 갈 수 있어요.' : '흐름을 끊지 않고 바로 이어갈 추천이에요.'}</span>
        </div>
        <div className="ym-next-action-board">
          {primaryNext && <NextStep {...primaryNext} primary />}
          {secondaryNext.length > 0 && (
            <div className="ym-next-action-grid">
              {secondaryNext.map((action) => <NextStep key={`${action.title}:${action.sub}`} {...action} compact />)}
            </div>
          )}
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

type NextAction = {
  icon: React.ComponentProps<typeof Icon>['name'];
  accent: string;
  title: string;
  sub: string;
  preferred?: boolean;
  onClick: () => void;
};

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
function NextStep({ icon, accent, title, sub, primary, compact, onClick }: NextAction & { primary?: boolean; compact?: boolean }) {
  return (
    <button className={`ym-press ym-next-step${primary ? ' is-primary' : ''}${compact ? ' is-compact' : ''}`} onClick={onClick} style={{
      ['--next-accent' as string]: accent,
      ['--next-soft' as string]: hexA(accent, primary ? 0.18 : 0.11),
      width: '100%', display: 'flex', alignItems: 'center', gap: primary ? 15 : 10, textAlign: 'left',
      padding: primary ? '17px 17px 18px' : compact ? '11px 10px' : '12px 13px', borderRadius: primary ? 22 : 16, cursor: 'pointer',
      border: `1px solid ${primary ? hexA(accent, 0.46) : 'var(--glass-border)'}`,
      background: primary
        ? `radial-gradient(circle at 12% 10%, ${hexA(accent, 0.3)}, transparent 32%), linear-gradient(135deg, ${hexA(accent, 0.14)}, var(--glass-bg-strong))`
        : 'var(--glass-bg-strong)',
      color: 'var(--ink)', boxShadow: primary ? `0 16px 42px ${hexA(accent, 0.2)}` : undefined,
      position: 'relative', overflow: 'hidden',
    }}>
      <span className="ym-next-step-icon" style={{ width: primary ? 52 : 36, height: primary ? 52 : 36, flex: `0 0 ${primary ? 52 : 36}px`, borderRadius: primary ? 17 : 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: hexA(accent, primary ? 0.2 : 0.13), color: accent }}>
        <Icon name={icon} size={primary ? 24 : 19} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: primary ? 17 : 13.5, fontWeight: 850, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: compact ? 'nowrap' : 'normal' }}>{title}</span>
        <span style={{ display: 'block', fontSize: primary ? 13 : 11.2, color: 'var(--ink-soft)', marginTop: 3, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: compact ? 'nowrap' : 'normal' }}>{sub}</span>
      </span>
      <span className="ym-next-step-arrow" style={{ width: primary ? 30 : 26, height: primary ? 30 : 26, flex: `0 0 ${primary ? 30 : 26}px`, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: primary ? hexA(accent, 0.16) : 'var(--glass-bg)', color: primary ? accent : 'var(--ink-faint)' }}>
        <Icon name="flow" size={17} />
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
