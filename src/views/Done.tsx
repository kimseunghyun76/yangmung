// 세션 완료 화면 — "다음엔?" 행동 버튼이 주역, 통계는 아래로.
import {
  sessionResult, summarize, type ProgressMap, type SessionLogEntry,
} from '../learn/progress';
import { BTN, PRIMARY, WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';

interface Props {
  sessionId: number;
  score: number;
  quizSeen: number;
  sessionLog: SessionLogEntry[];
  progress: ProgressMap;
  speakCount: number;
  canContinue: boolean;
  onRetryWeak: () => void;
  onContinue: () => void;
  onHome: () => void;
}

export function Done({ sessionId, score, quizSeen, sessionLog, progress, speakCount, canContinue, onRetryWeak, onContinue, onHome }: Props) {
  const stars = quizSeen ? Math.max(1, Math.round((score / quizSeen) * 3)) : 0;
  const s = summarize(progress);
  const sr = sessionResult(progress, sessionId);
  const recoveryUsed = sessionLog.filter((r) => r.result === 'recovery').length;
  const wrongCount = sessionLog.filter((r) => r.result === 'wrong').length;
  const weak = new Set(sessionLog.filter((r) => r.result !== 'correct').map((r) => r.id)).size;

  return (
    <main style={WRAP}>
      {/* 완료 축하 — 색종이 + 별 버스트 */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '12px 0 4px' }}>
        <img className="ym-burst" src="/celebrate.svg" alt="" style={{ width: 132, height: 132, display: 'block', margin: '0 auto' }} />
        <div style={{ position: 'absolute', left: '50%', top: 42, transform: 'translateX(-50%)', color: stars >= 3 ? 'var(--warn)' : 'var(--accent)' }}>
          <Icon name={stars >= 3 ? 'trophy' : 'star'} size={42} />
        </div>
      </div>
      <h1 style={{ textAlign: 'center', marginTop: 6 }}>세션 {sessionId} 완료</h1>
      <p style={{ margin: '8px 0 0', textAlign: 'center', color: 'var(--warn)', display: 'flex', justifyContent: 'center', gap: 4 }}>
        {Array.from({ length: 3 }, (_, i) => <Icon key={i} name="star" size={24} style={{ opacity: i < stars ? 1 : 0.22 }} />)}
      </p>
      <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '8px 0 0', textAlign: 'center', fontWeight: 600 }}>
        첫 시도 {score}/{quizSeen}{speakCount > 0 ? ` · 말하기 ${speakCount}문장` : ''}{sr.weakNow > 0 ? ` · 약점 ${sr.weakNow}개 다음에 다시 나와요` : ''}
      </p>

      {/* 주역: 다음 행동 */}
      <p className="ym-kicker" style={{ margin: '22px 0 10px' }}>다음엔?</p>
      {weak > 0 && (
        <button className="ym-pop-sm" style={{ ...PRIMARY, width: '100%' }} onClick={onRetryWeak}>
          <Icon name="target" size={17} /> 약점만 다시 풀기 ({weak}카드)
        </button>
      )}
      {canContinue && (
        <button className={weak > 0 ? undefined : 'ym-pop-sm'} style={{ ...(weak > 0 ? BTN : PRIMARY), width: '100%', textAlign: 'center', marginTop: 10 }} onClick={onContinue}>
          <Icon name="plus" size={17} /> 바로 한 세션 더
        </button>
      )}
      <button style={{ ...BTN, width: '100%', textAlign: 'center', marginTop: 10 }} onClick={onHome}>
        <Icon name="nav-home" size={17} /> 홈으로
      </button>

      {/* 보조: 이번 세션 통계 */}
      <details style={{ marginTop: 20 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--ink-faint)' }}>이번 세션 자세히</summary>
        <div style={{ marginTop: 10, padding: 14, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 14 }}>
            <div>카드 수</div><Num value={quizSeen} />
            <div style={{ color: 'var(--ok)' }}>첫 시도 정답</div><Num value={score} color="var(--ok)" />
            <div style={{ color: 'var(--warn)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="recovery" size={15} /> 복구 사용</div><Num value={recoveryUsed} color="var(--warn)" />
            <div style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="cross" size={15} /> 오답</div><Num value={wrongCount} color="var(--accent)" />
            {speakCount > 0 && (<><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="speak" size={15} /> 말한 문장</div><Num value={speakCount} /></>)}
            <div style={{ color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={15} /> 새로 익숙</div><Num value={sr.masteredNow} color="var(--ok)" />
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--ink-faint)' }}>복구는 별점에 안 들어가요 — 보조 바퀴.</p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="chart" size={15} /> 누적: 본 {s.seen} · 익숙 {s.mastered} · 약점 {s.weak}</p>
        </div>
      </details>
    </main>
  );
}

function Num({ value, color }: { value: number; color?: string }) {
  return <div style={{ textAlign: 'right', color }}><strong>{value}</strong></div>;
}
