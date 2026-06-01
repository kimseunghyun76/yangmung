// 홈 화면 — "오늘 한 판" 목표가 주인공. 가나 안정도/세션 구성은 보조.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import {
  isMissionUnlocked, kanaReadMastery, missionProgress, nextSessionId, planSession,
  sessionCounts, summarize, type ProgressMap, type SessionConfig, type SessionState,
} from '../learn/progress';
import { ttsSupported } from '../tts';
import { BTN, CARD, PRIMARY, WRAP } from '../ui/styles';
import { sessionGoalText } from './goal';
import { sceneVisualByPlace } from './scene';
import { NavBar, type NavBarProps } from './NavBar';

interface Props {
  nav: NavBarProps;
  allCards: Card[];
  progress: ProgressMap;
  session: SessionState;
  sessionConfig: SessionConfig;
  modeLabel: string;
  onStart: () => void;
  onReset: () => void;
  onPracticeScene: (missionId: string) => void;
  onPracticeKana: (script: 'hiragana' | 'katakana') => void;
  onPracticeSigns: () => void;
}

export function Home({ nav, allCards, progress, session, sessionConfig, modeLabel, onStart, onReset, onPracticeScene, onPracticeKana, onPracticeSigns }: Props) {
  const upcomingId = nextSessionId(session);
  const counts = sessionCounts(allCards, progress, upcomingId);
  const plan = planSession(allCards, progress, upcomingId, sessionConfig);
  const planned = plan.size;
  const hiraIds = CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id);
  const kataIds = CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id);
  const s = summarize(progress);
  const goal = sessionGoalText(plan.missions, plan.breakdown.K > 0);
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0'); // 튜토리얼 제외

  return (
    <main style={WRAP}>
      <NavBar {...nav} />
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
          🎚 {modeLabel} · 가나 {plan.breakdown.K} · 표현 {plan.breakdown.B} · 미션 {plan.breakdown.C} · 팁 {plan.breakdown.tip}
        </p>
      </div>

      {planned > 0 && counts.due + counts.fresh > planned && (
        <p style={{ fontSize: 12, color: '#888', marginTop: 8, textAlign: 'center' }}>
          오늘 풀 수 있는 카드는 {counts.due + counts.fresh}개지만 한 번에 {planned}개씩 짧게 진행해요.
        </p>
      )}

      <div style={{ ...CARD, marginTop: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#666', fontWeight: 600 }}>📚 가나 안정도 (읽기 기준)</p>
        <KanaTrackBar label="히라가나" kanaIds={hiraIds} progress={progress} />
        <KanaTrackBar label="가타카나" kanaIds={kataIds} progress={progress} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button style={{ ...BTN, flex: 1, textAlign: 'center', fontSize: 14 }} onClick={() => onPracticeKana('hiragana')}>🔤 히라가나 연습</button>
          <button style={{ ...BTN, flex: 1, textAlign: 'center', fontSize: 14 }} onClick={() => onPracticeKana('katakana')}>🔤 가타카나 연습</button>
        </div>
        <button style={{ ...BTN, width: '100%', textAlign: 'center', fontSize: 14, marginTop: 8 }} onClick={onPracticeSigns}>🏯 간판·메뉴·안내 읽기</button>
      </div>

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
          const sv = sceneVisualByPlace(m.place);
          if (!unlocked) {
            return (
              <p key={m.id} style={{ margin: '6px 0', fontSize: 13, color: '#aaa' }}>
                🔒 {sv.emoji} {m.place ?? m.scenario} — {lockHint(m.id)}
              </p>
            );
          }
          const p = missionProgress(allCards, progress, m.id);
          const done = p.total > 0 && p.mastered === p.total;
          const pct = p.total ? Math.round((p.mastered / p.total) * 100) : 0;
          return (
            <button
              key={m.id}
              style={{ ...BTN, width: '100%', marginTop: 8, padding: 0, display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}
              onClick={() => onPracticeScene(m.id)}
            >
              {/* 장면 색 이모지 배지 */}
              <span style={{ width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: sv.bg, alignSelf: 'stretch' }}>{sv.emoji}</span>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px 14px', gap: 5 }}>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{m.place ?? m.scenario} 연습</span>
                  <span style={{ fontSize: 12, color: done ? '#16a34a' : '#9aa0ad' }}>{done ? '✅ 완료' : `${p.mastered}/${p.total}`}</span>
                </span>
                <span style={{ height: 4, background: '#eceef4', borderRadius: 2, overflow: 'hidden' }}>
                  <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: sv.accent }} />
                </span>
              </span>
            </button>
          );
        })}
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
  if (missionId === 'C4') return '전철을 더 익히면 열려요';
  return '조금 더 익히면 열려요';
}

// 가나 트랙 요약 바 — 히라가나/가타카나 각각 안정도(읽기 기준) 한 줄.
function KanaTrackBar({ label, kanaIds, progress }: { label: string; kanaIds: string[]; progress: ProgressMap }) {
  const m = kanaReadMastery(progress, kanaIds);
  const pct = Math.round((m.mastered / Math.max(1, m.total)) * 100);
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555' }}>
        <span>{label}</span><span><strong style={{ color: '#4f46e5' }}>{m.mastered}</strong> / {m.total}자</span>
      </div>
      <div style={{ height: 6, background: '#eceef4', borderRadius: 3, marginTop: 5, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#4f46e5', transition: 'width 0.3s' }} />
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
