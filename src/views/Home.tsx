// 홈 — 에디토리얼 미니멀. 큰 타이포 + 헤어라인 + 朱 1색, 그림자 없음.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import {
  isMissionUnlocked, kanaReadMastery, missionProgress, nextSessionId, planSession,
  sessionCounts, summarize, type ProgressMap, type SessionConfig, type SessionState,
} from '../learn/progress';
import { ttsSupported } from '../tts';
import { PRIMARY, SERIF, WRAP } from '../ui/styles';
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
  onPracticeDictation: () => void;
}

const Rule = ({ m = 28 }: { m?: number }) => <hr className="ym-rule" style={{ margin: `${m}px 0` }} />;

export function Home({ nav, allCards, progress, session, sessionConfig, modeLabel, onStart, onReset, onPracticeScene, onPracticeKana, onPracticeSigns, onPracticeDictation }: Props) {
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

      {/* 워드마크 — 라틴 세리프(에디토리얼 시그니처) */}
      <h1 style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>yangmung</h1>
      <p style={{ color: 'var(--ink-faint)', marginTop: 6, marginBottom: 0, fontSize: 13, letterSpacing: '0.01em' }}>일본 여행, 오늘 한 판 · 세션 #{upcomingId}</p>

      <Rule m={26} />

      {/* 오늘 목표 — 큰 헤드라인 + 잉크 바 시작 */}
      <p className="ym-kicker">오늘 목표</p>
      <h2 style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.025em', margin: '10px 0 0' }}>{goal}</h2>
      <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--ink-faint)' }}>
        {modeLabel} · 가나 {plan.breakdown.K} · 표현 {plan.breakdown.B} · 미션 {plan.breakdown.C} · 팁 {plan.breakdown.tip}
      </p>
      <button style={{ ...PRIMARY, marginTop: 18, width: '100%', fontSize: 16 }} onClick={onStart} disabled={planned === 0}>
        {planned === 0 ? '오늘 학습할 카드가 없어요' : `시작 · ${planned}카드`}
      </button>
      {planned > 0 && counts.due + counts.fresh > planned && (
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 10, textAlign: 'center' }}>
          오늘 풀 수 있는 카드 {counts.due + counts.fresh}개 중 {planned}개씩 짧게 진행해요.
        </p>
      )}

      <Rule />

      {/* 가나 안정도 — 헤어라인 행 */}
      <p className="ym-kicker">가나 안정도 · 읽기 기준</p>
      <div style={{ marginTop: 14 }}>
        <KanaRow label="히라가나" kanaIds={hiraIds} progress={progress} />
        <KanaRow label="가타카나" kanaIds={kataIds} progress={progress} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginTop: 16, borderTop: '1px solid var(--line)' }}>
        <Quiet label="히라가나 연습" onClick={() => onPracticeKana('hiragana')} r />
        <Quiet label="가타카나 연습" onClick={() => onPracticeKana('katakana')} />
        <Quiet label="간판·메뉴 읽기" onClick={onPracticeSigns} r />
        <Quiet label="받아쓰기" onClick={onPracticeDictation} />
      </div>

      {s.seen > 0 && (
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--ink-soft)' }}>
          본 카드 <strong style={{ color: 'var(--ink)' }}>{s.seen}</strong>
          <span style={{ color: 'var(--ink-faint)' }}> · </span>익숙 <strong style={{ color: 'var(--ok)' }}>{s.mastered}</strong>
          <span style={{ color: 'var(--ink-faint)' }}> · </span>약점 <strong style={{ color: 'var(--accent)' }}>{s.weak}</strong>
        </p>
      )}

      <Rule />

      {/* 장면별 연습 — 헤어라인 리스트 */}
      <p className="ym-kicker">장면별 연습</p>
      <div style={{ marginTop: 12, borderTop: '1px solid var(--line)' }}>
        {scenes.map((m) => {
          const unlocked = isMissionUnlocked(m.id, progress);
          const sv = sceneVisualByPlace(m.place);
          const name = m.place ?? m.scenario;
          if (!unlocked) {
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 2px', borderBottom: '1px solid var(--line)', color: 'var(--ink-faint)' }}>
                <span style={{ fontSize: 16, opacity: 0.5 }}>{sv.emoji}</span>
                <span style={{ flex: 1, fontSize: 15 }}>{name}</span>
                <span style={{ fontSize: 12 }}>🔒 {lockHint(m.id)}</span>
              </div>
            );
          }
          const p = missionProgress(allCards, progress, m.id);
          const done = p.total > 0 && p.mastered === p.total;
          return (
            <button
              key={m.id}
              onClick={() => onPracticeScene(m.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 2px', border: 'none', borderBottom: '1px solid var(--line)', background: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--ink)', borderLeft: `2px solid ${done ? 'var(--ok)' : sv.accent}`, paddingLeft: 12 }}
            >
              <span style={{ fontSize: 18 }}>{sv.emoji}</span>
              <span style={{ flex: 1, fontSize: 16, fontWeight: 550 }}>{name}</span>
              <span style={{ fontSize: 13, color: done ? 'var(--ok)' : 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>
                {done ? '완료' : `${p.mastered}/${p.total}`}
              </span>
              <span style={{ fontSize: 15, color: 'var(--ink-faint)' }}>›</span>
            </button>
          );
        })}
      </div>

      {s.seen > 0 && (
        <button
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-faint)', fontSize: 13, marginTop: 22, width: '100%', textAlign: 'center', textDecoration: 'underline', textUnderlineOffset: 3 }}
          onClick={() => { if (confirm('진척을 모두 지울까요?')) onReset(); }}
        >
          처음부터 다시
        </button>
      )}

      {!ttsSupported() && <p style={{ color: 'var(--warn)', fontSize: 13, marginTop: 16 }}>이 브라우저는 음성(TTS) 미지원 — 텍스트로만 진행됩니다.</p>}
    </main>
  );
}

function lockHint(missionId: string): string {
  if (missionId === 'C3') return '편의점·식당 더 익히기';
  if (missionId === 'C4') return '전철 더 익히기';
  return '조금 더 익히기';
}

// 가나 트랙 — 한 줄 + 얇은 진척선 (카드 박스 없음)
function KanaRow({ label, kanaIds, progress }: { label: string; kanaIds: string[]; progress: ProgressMap }) {
  const m = kanaReadMastery(progress, kanaIds);
  const pct = Math.round((m.mastered / Math.max(1, m.total)) * 100);
  return (
    <div style={{ padding: '10px 0', borderTop: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 15 }}>
        <span style={{ fontWeight: 550 }}>{label}</span>
        <span style={{ color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>
          <strong style={{ color: 'var(--ink)' }}>{m.mastered}</strong> / {m.total}
        </span>
      </div>
      <div style={{ height: 2, background: 'var(--line)', marginTop: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

// 조용한 연습 진입 — 그리드 셀, 헤어라인으로만 구분
function Quiet({ label, onClick, r }: { label: string; onClick: () => void; r?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
        padding: '14px 4px', fontSize: 15, fontWeight: 500, color: 'var(--ink)',
        borderBottom: '1px solid var(--line)',
        borderRight: r ? '1px solid var(--line)' : 'none',
        paddingLeft: r ? 4 : 14,
      }}
    >
      {label} <span style={{ color: 'var(--ink-faint)' }}>›</span>
    </button>
  );
}
