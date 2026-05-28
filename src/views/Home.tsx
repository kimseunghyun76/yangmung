// 홈 화면 — "오늘 한 판" 목표가 주인공. 가나 안정도/세션 구성은 보조.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import {
  isKanaReadStable, isMissionUnlocked, kanaReadMastery, missionProgress, nextSessionId, planSession,
  sessionCounts, summarize, type ProgressMap, type SessionState,
} from '../learn/progress';
import { ttsSupported } from '../tts';
import { BTN, PRIMARY, WRAP } from '../ui/styles';
import { sessionGoalText } from './goal';

// 앞 단계 가나가 N자 안정되기 전에는 다음 단계(K2 등) 패널을 접어 둠 — 첫 화면이 드릴처럼 안 보이게.
const REVEAL_NEXT_KANA_AT = 3;

interface Props {
  allCards: Card[];
  progress: ProgressMap;
  session: SessionState;
  onStart: () => void;
  onReset: () => void;
  onOpenMap: () => void;
  onPracticeScene: (missionId: string) => void;
}

export function Home({ allCards, progress, session, onStart, onReset, onOpenMap, onPracticeScene }: Props) {
  const upcomingId = nextSessionId(session);
  const counts = sessionCounts(allCards, progress, upcomingId);
  const plan = planSession(allCards, progress, upcomingId);
  const planned = plan.size;
  const kanaUnits = revealedKanaUnits(progress);
  const s = summarize(progress);
  const goal = sessionGoalText(plan.missions, plan.breakdown.K > 0);
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0'); // 튜토리얼 제외

  return (
    <main style={WRAP}>
      <h1 style={{ marginBottom: 4 }}>yangmung</h1>
      <p style={{ color: '#888', marginTop: 0, fontSize: 13 }}>일본 여행, 오늘 한 판 · 세션 #{upcomingId}</p>

      {/* 주인공: 오늘의 목표 + 시작 */}
      <div style={{ background: '#4f46e5', color: '#fff', padding: 20, borderRadius: 14, marginTop: 14 }}>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>🎯 오늘 목표</p>
        <p style={{ margin: '6px 0 0', fontSize: 20, fontWeight: 700, lineHeight: 1.35 }}>{goal}</p>
        <button
          style={{ ...PRIMARY, background: '#fff', color: '#4f46e5', marginTop: 16, width: '100%', fontWeight: 700, fontSize: 17 }}
          onClick={onStart}
          disabled={planned === 0}
        >
          {planned === 0 ? '오늘 학습할 카드가 없어요' : `시작 (${planned}카드)`}
        </button>
        <p style={{ margin: '10px 0 0', fontSize: 12, opacity: 0.85 }}>
          가나 {plan.breakdown.K} · 표현 {plan.breakdown.B} · 미션 {plan.breakdown.C} · 팁 {plan.breakdown.tip}
        </p>
      </div>

      {planned > 0 && counts.due + counts.fresh > planned && (
        <p style={{ fontSize: 12, color: '#888', marginTop: 8, textAlign: 'center' }}>
          오늘 풀 수 있는 카드는 {counts.due + counts.fresh}개지만 한 번에 {planned}개씩 짧게 진행해요.
        </p>
      )}

      {kanaUnits.map((u) => (
        <KanaPanel key={u.id} stage={u.stage} kanaIds={u.kanaIds ?? []} progress={progress} />
      ))}

      {s.seen > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <Stat label="본 카드" value={s.seen} />
          <Stat label="익숙" value={s.mastered} color="#16a34a" bg="#dcfce7" />
          <Stat label="약점" value={s.weak} color="#dc2626" bg="#fee2e2" />
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <p style={{ margin: '0 0 6px', fontSize: 13, color: '#666', fontWeight: 600 }}>🎬 장면별 연습</p>
        {scenes.map((m) => {
          const unlocked = isMissionUnlocked(m.id, progress);
          if (!unlocked) {
            return (
              <p key={m.id} style={{ margin: '6px 0', fontSize: 13, color: '#aaa' }}>
                🔒 {m.place ?? m.scenario} — {lockHint(m.id)}
              </p>
            );
          }
          const p = missionProgress(allCards, progress, m.id);
          const done = p.total > 0 && p.mastered === p.total;
          return (
            <button
              key={m.id}
              style={{ ...BTN, width: '100%', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => onPracticeScene(m.id)}
            >
              <span>🎬 {m.place ?? m.scenario} 연습</span>
              <span style={{ fontSize: 13, color: done ? '#16a34a' : '#888' }}>{done ? '✅ ' : ''}{p.mastered}/{p.total}</span>
            </button>
          );
        })}
        <button
          style={{ ...BTN, width: '100%', marginTop: 8, textAlign: 'center', color: '#4f46e5' }}
          onClick={onOpenMap}
        >
          🗺 학습 지도 보기
        </button>
      </div>

      {s.seen > 0 && (
        <button
          style={{ ...BTN, marginTop: 16, color: '#888', textAlign: 'center', width: '100%', fontSize: 13 }}
          onClick={() => { if (confirm('진척을 모두 지울까요?')) onReset(); }}
        >
          처음부터 다시
        </button>
      )}

      {!ttsSupported() && <p style={{ color: '#b45309', fontSize: 13, marginTop: 16 }}>이 브라우저는 음성(TTS) 미지원 — 텍스트로만 진행됩니다.</p>}
    </main>
  );
}

// 잠긴 장면 오픈 조건 안내 (현재 C3만 잠김).
function lockHint(missionId: string): string {
  if (missionId === 'C3') return '편의점·식당을 더 익히면 열려요';
  return '조금 더 익히면 열려요';
}

// 노출할 가나 드릴 Unit: K1은 항상, 다음 단계는 앞 단계가 충분히 안정됐거나 이미 시작했을 때만.
function revealedKanaUnits(progress: ProgressMap) {
  const units = CONTENT.units.filter((u) => u.track === 'kana' && u.mode === 'drill');
  const out: typeof units = [];
  for (let idx = 0; idx < units.length; idx++) {
    const u = units[idx];
    if (idx === 0) { out.push(u); continue; }
    const prevMastered = kanaReadMastery(progress, units[idx - 1].kanaIds ?? []).mastered;
    const selfStarted = (u.kanaIds ?? []).some((id) =>
      progress[`kana:${id}:read`] || progress[`kana:${id}:listen`] || progress[`kana:${id}:confuse`]);
    if (prevMastered >= REVEAL_NEXT_KANA_AT || selfStarted) out.push(u);
    else break; // 이번 단계가 잠겼으면 이후 단계도 모두 잠금
  }
  return out;
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
