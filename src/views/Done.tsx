// 세션 완료 화면 — "다음엔?" 행동 버튼이 주역, 통계는 아래로.
import {
  sessionResult, summarize, type ProgressMap, type SessionLogEntry,
} from '../learn/progress';
import { BTN, PRIMARY, WRAP } from '../ui/styles';

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
        <div className="ym-confetti" aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {['🎉', '✨', '🎊', '⭐', '🌸', '🎉', '✨', '🎊'].map((e, i) => (
            <span key={i} style={{ left: `${8 + i * 11}%`, animationDelay: `${i * 0.08}s` }}>{e}</span>
          ))}
        </div>
        <div className="ym-burst" style={{ fontSize: 52, lineHeight: 1 }}>{stars >= 3 ? '🏆' : '🎉'}</div>
      </div>
      <h1 style={{ textAlign: 'center', marginTop: 6 }}>세션 {sessionId} 완료</h1>
      <p style={{ fontSize: 26, margin: '4px 0 0', textAlign: 'center' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
      <p style={{ color: '#666', fontSize: 14, margin: '6px 0 0', textAlign: 'center' }}>
        첫 시도 {score}/{quizSeen}{speakCount > 0 ? ` · 말하기 ${speakCount}문장` : ''}{sr.weakNow > 0 ? ` · 약점 ${sr.weakNow}개 다음에 다시 나와요` : ''}
      </p>

      {/* 주역: 다음 행동 */}
      <p style={{ margin: '20px 0 8px', fontSize: 14, color: '#666', fontWeight: 600 }}>다음엔?</p>
      {weak > 0 && (
        <button style={{ ...PRIMARY, width: '100%' }} onClick={onRetryWeak}>
          🎯 약점만 다시 풀기 ({weak}카드)
        </button>
      )}
      {canContinue && (
        <button style={{ ...(weak > 0 ? BTN : PRIMARY), width: '100%', textAlign: 'center', marginTop: 10 }} onClick={onContinue}>
          ➕ 바로 한 세션 더
        </button>
      )}
      <button style={{ ...BTN, width: '100%', textAlign: 'center', marginTop: 10 }} onClick={onHome}>
        🏠 홈으로
      </button>

      {/* 보조: 이번 세션 통계 */}
      <details style={{ marginTop: 20 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, color: '#888' }}>이번 세션 자세히</summary>
        <div style={{ marginTop: 10, padding: 14, background: '#f6e4df', borderRadius: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 14 }}>
            <div>카드 수</div><Num value={quizSeen} />
            <div style={{ color: '#16a34a' }}>첫 시도 정답</div><Num value={score} color="#16a34a" />
            <div style={{ color: '#b45309' }}>🛟 복구 사용</div><Num value={recoveryUsed} color="#b45309" />
            <div style={{ color: '#dc2626' }}>✗ 오답</div><Num value={wrongCount} color="#dc2626" />
            {speakCount > 0 && (<><div>🗣 말한 문장</div><Num value={speakCount} /></>)}
            <div style={{ color: '#16a34a' }}>✅ 새로 익숙</div><Num value={sr.masteredNow} color="#16a34a" />
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: '#888' }}>복구는 별점에 안 들어가요 — 보조 바퀴.</p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#666' }}>📊 누적: 본 {s.seen} · 익숙 {s.mastered} · 약점 {s.weak}</p>
        </div>
      </details>
    </main>
  );
}

function Num({ value, color }: { value: number; color?: string }) {
  return <div style={{ textAlign: 'right', color }}><strong>{value}</strong></div>;
}
