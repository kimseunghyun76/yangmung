// 홈 화면 — 진척 요약 · K1 안정도 · 다음 세션 구성 · 시작 버튼.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import {
  isKanaReadStable, kanaReadMastery, nextSessionId, plannedSessionBreakdown,
  plannedSessionSize, sessionCounts, summarize, type ProgressMap, type SessionState,
} from '../learn/progress';
import { ttsSupported } from '../tts';
import { BTN, PRIMARY, WRAP } from '../ui/styles';

interface Props {
  allCards: Card[];
  progress: ProgressMap;
  session: SessionState;
  onStart: () => void;
  onReset: () => void;
}

export function Home({ allCards, progress, session, onStart, onReset }: Props) {
  const upcomingId = nextSessionId(session);
  const counts = sessionCounts(allCards, progress, upcomingId);
  const planned = plannedSessionSize(allCards, progress, upcomingId);
  const breakdown = plannedSessionBreakdown(allCards, progress, upcomingId);
  const kanaUnits = CONTENT.units.filter((u) => u.track === 'kana' && u.mode === 'drill');
  const s = summarize(progress);

  return (
    <main style={WRAP}>
      <h1 style={{ marginBottom: 4 }}>yangmung</h1>
      <p style={{ color: '#888', marginTop: 0, fontSize: 13 }}>다음 세션 #{upcomingId}</p>

      {s.seen > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Stat label="본 카드" value={s.seen} />
          <Stat label="익숙" value={s.mastered} color="#16a34a" bg="#dcfce7" />
          <Stat label="약점" value={s.weak} color="#dc2626" bg="#fee2e2" />
        </div>
      )}

      {kanaUnits.map((u) => (
        <KanaPanel key={u.id} stage={u.stage} kanaIds={u.kanaIds ?? []} progress={progress} />
      ))}

      <div style={{ background: '#f5f5fb', padding: 16, borderRadius: 12, marginTop: 12 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#666' }}>📋 다음 세션 구성</p>
        <p style={{ margin: '6px 0 0', fontSize: 15 }}>
          가나 <strong>{breakdown.K}</strong> · 표현 <strong>{breakdown.B}</strong> · 미션 <strong>{breakdown.C}</strong> · 팁 <strong>{breakdown.tip}</strong>
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13, color: '#666' }}>
          <span>🔁 오늘 복습 {counts.due}개</span>
          <span>🆕 새 학습 {counts.fresh}개</span>
          <span>💤 제외 {counts.cooldown}개</span>
        </div>
      </div>

      <button style={{ ...PRIMARY, marginTop: 16, width: '100%' }} onClick={onStart} disabled={planned === 0}>
        {planned === 0 ? '오늘 학습할 카드가 없어요' : `시작 (${planned}카드)`}
      </button>
      {planned > 0 && counts.due + counts.fresh > planned && (
        <p style={{ fontSize: 12, color: '#888', marginTop: 6, textAlign: 'center' }}>
          오늘 풀 수 있는 카드는 {counts.due + counts.fresh}개지만 한 번에 {planned}개씩 짧게 진행해요.
        </p>
      )}

      {s.seen > 0 && (
        <button
          style={{ ...BTN, marginTop: 12, color: '#888', textAlign: 'center', width: '100%', fontSize: 13 }}
          onClick={() => { if (confirm('진척을 모두 지울까요?')) onReset(); }}
        >
          처음부터 다시
        </button>
      )}

      {!ttsSupported() && <p style={{ color: '#b45309', fontSize: 13, marginTop: 16 }}>이 브라우저는 음성(TTS) 미지원 — 텍스트로만 진행됩니다.</p>}
    </main>
  );
}

// 단계별 가나 안정도 패널 (읽기 기준) — K1·K2 등 드릴 Unit마다 1개.
function KanaPanel({ stage, kanaIds, progress }: { stage: string; kanaIds: string[]; progress: ProgressMap }) {
  const m = kanaReadMastery(progress, kanaIds);
  const chars = kanaIds.map((id) => CONTENT.kana.find((kk) => kk.id === id)?.char ?? '?');
  return (
    <div style={{ background: '#eef2ff', padding: 14, borderRadius: 10, marginTop: 12 }}>
      <p style={{ margin: 0, fontSize: 13, color: '#666' }}>📚 {stage} 히라가나 안정도 (읽기 기준)</p>
      <p style={{ margin: '4px 0 0', fontSize: 18 }}>
        <strong style={{ color: '#4f46e5' }}>{m.mastered}</strong>
        <span style={{ color: '#666' }}> / {m.total}자</span>
      </p>
      <div style={{ height: 6, background: '#d4d4e0', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
        <div style={{ width: `${(m.mastered / Math.max(1, m.total)) * 100}%`, height: '100%', background: '#4f46e5', transition: 'width 0.3s' }} />
      </div>
      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 18 }}>
        {kanaIds.map((id, idx) => {
          const ok = isKanaReadStable(progress, id);
          return (
            <span
              key={id}
              style={{
                minWidth: 28, textAlign: 'center', padding: '2px 6px', borderRadius: 6,
                background: ok ? '#4f46e5' : '#fff', color: ok ? '#fff' : '#999',
                border: '1px solid #c7c7d8',
              }}
              title={ok ? '읽기 안정' : '아직'}
            >
              {chars[idx]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color, bg = '#eef2ff' }: { label: string; value: number; color?: string; bg?: string }) {
  return (
    <div style={{ flex: 1, background: bg, padding: 10, borderRadius: 10, textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#666' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color }}>{value}</div>
    </div>
  );
}
