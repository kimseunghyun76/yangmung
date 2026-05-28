// 세션 완료 화면 — 결과 통계 · 학습 신호 · 누적 · 약점 재출제.
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
  onRetryWeak: () => void;
  onHome: () => void;
}

export function Done({ sessionId, score, quizSeen, sessionLog, progress, onRetryWeak, onHome }: Props) {
  const stars = quizSeen ? Math.max(1, Math.round((score / quizSeen) * 3)) : 0;
  const s = summarize(progress);
  const sr = sessionResult(progress, sessionId);
  const recoveryUsed = sessionLog.filter((r) => r.result === 'recovery').length;
  const wrongCount = sessionLog.filter((r) => r.result === 'wrong').length;
  const weakInThisSession = new Set(sessionLog.filter((r) => r.result !== 'correct').map((r) => r.id)).size;

  return (
    <main style={WRAP}>
      <h1>세션 {sessionId} 완료 🎉</h1>
      <p style={{ fontSize: 22 }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>

      <div style={{ marginTop: 12, padding: 14, background: '#eef2ff', borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>📋 이번 세션</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8, fontSize: 14 }}>
          <div>카드 수</div><Num value={quizSeen} />
          <div style={{ color: '#16a34a' }}>첫 시도 정답</div><Num value={score} color="#16a34a" />
          <div style={{ color: '#b45309' }}>🛟 복구 사용</div><Num value={recoveryUsed} color="#b45309" />
          <div style={{ color: '#dc2626' }}>✗ 오답</div><Num value={wrongCount} color="#dc2626" />
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#888' }}>복구는 별점에 안 들어가요 — 보조 바퀴.</p>
      </div>

      <div style={{ marginTop: 12, padding: 14, background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>🎯 학습 신호</p>
        <p style={{ margin: '4px 0 0', fontSize: 15, color: '#16a34a' }}>✅ 새로 익숙해진 카드 {sr.masteredNow}개</p>
        <p style={{ margin: '4px 0 0', fontSize: 15, color: '#dc2626' }}>⚠️ 다음 세션에서 다시 나올 약점 {sr.weakNow}개</p>
        {sr.masteredNow === 0 && (
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#888' }}>tip: 같은 카드를 *2회 연속 첫시도 정답*하면 익숙으로 진입(다음 세션 잠시 제외)</p>
        )}
      </div>

      <div style={{ marginTop: 12, padding: 14, background: '#f5f5fb', borderRadius: 10 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>📊 누적</p>
        <p style={{ margin: '4px 0 0', fontSize: 15 }}>본 카드 {s.seen} · 익숙 {s.mastered} · 약점 {s.weak}</p>
      </div>

      {weakInThisSession > 0 && (
        <button style={{ ...PRIMARY, marginTop: 16, width: '100%' }} onClick={onRetryWeak}>
          약점만 다시 풀기 ({weakInThisSession}카드)
        </button>
      )}
      <button
        style={{ ...(weakInThisSession > 0 ? BTN : PRIMARY), marginTop: 12, width: '100%', textAlign: 'center' }}
        onClick={onHome}
      >
        홈으로
      </button>
    </main>
  );
}

function Num({ value, color }: { value: number; color?: string }) {
  return <div style={{ textAlign: 'right', color }}><strong>{value}</strong></div>;
}
