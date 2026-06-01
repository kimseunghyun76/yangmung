// 홈 — 볼드 모던. 솔리드 블록 + 굵은 테두리 + 큰 타이포.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import type { Diagnosis } from '../learn/adaptive';
import { LEVEL_LABEL } from '../learn/adaptive';
import {
  isMissionUnlocked, kanaReadMastery, missionProgress, nextSessionId, planSession,
  sessionCounts, summarize, type ProgressMap, type SessionConfig, type SessionState,
} from '../learn/progress';
import { ttsSupported } from '../tts';
import { BTN, PRIMARY, RADIUS, WRAP } from '../ui/styles';
import { sessionGoalText } from './goal';
import { sceneVisualByPlace } from './scene';
import { NavBar, type NavBarProps } from './NavBar';
import { Block, Kicker, Rule } from './ui';

interface Props {
  nav: NavBarProps;
  allCards: Card[];
  progress: ProgressMap;
  session: SessionState;
  sessionConfig: SessionConfig;
  diagnosis: Diagnosis;
  modeLabel: string;
  onStart: () => void;
  onReset: () => void;
  onPracticeScene: (missionId: string) => void;
  onPracticeKana: (script: 'hiragana' | 'katakana') => void;
  onPracticeSigns: () => void;
  onPracticeDictation: () => void;
}

export function Home({ nav, allCards, progress, session, sessionConfig, diagnosis, modeLabel, onStart, onReset, onPracticeScene, onPracticeKana, onPracticeSigns, onPracticeDictation }: Props) {
  const upcomingId = nextSessionId(session);
  const counts = sessionCounts(allCards, progress, upcomingId);
  const plan = planSession(allCards, progress, upcomingId, sessionConfig);
  const planned = plan.size;
  const hiraIds = CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id);
  const kataIds = CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id);
  const s = summarize(progress);
  const goal = sessionGoalText(plan.missions, plan.breakdown.K > 0);
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0');

  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      {/* 워드마크 */}
      <h1 style={{ margin: 0, fontSize: 36 }}>yangmung</h1>
      <p style={{ color: 'var(--ink-faint)', marginTop: 8, marginBottom: 0, fontSize: 13, fontWeight: 600 }}>일본 여행, 오늘 한 판 · 세션 #{upcomingId}</p>

      {/* 오늘 목표 — 잉크 솔리드 블록 + 朱 시작 버튼 */}
      <Block tone="ink" pop style={{ marginTop: 18 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--accent)' }}>오늘 목표</p>
        <p style={{ margin: '10px 0 0', fontSize: 25, fontWeight: 800, lineHeight: 1.22, letterSpacing: '-0.02em' }}>{goal}</p>
        <p style={{ margin: '12px 0 0', fontSize: 12, opacity: 0.7, fontWeight: 600 }}>
          {modeLabel} · 가나 {plan.breakdown.K} · 표현 {plan.breakdown.B} · 미션 {plan.breakdown.C} · 팁 {plan.breakdown.tip}
        </p>
        <button className="ym-pop-sm" style={{ ...PRIMARY, marginTop: 16, width: '100%', fontSize: 16 }} onClick={onStart} disabled={planned === 0}>
          {planned === 0 ? '오늘 학습할 카드가 없어요' : `시작 · ${planned}카드`}
        </button>
      </Block>
      {planned > 0 && counts.due + counts.fresh > planned && (
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 10, textAlign: 'center', fontWeight: 600 }}>
          오늘 풀 수 있는 카드 {counts.due + counts.fresh}개 중 {planned}개씩 짧게 진행해요.
        </p>
      )}

      {/* 학습 진단 */}
      <DiagnosisBlock d={diagnosis} />

      <Rule />

      {/* 가나 안정도 */}
      <Kicker>가나 안정도 · 읽기 기준</Kicker>
      <div style={{ marginTop: 14 }}>
        <KanaRow label="히라가나" kanaIds={hiraIds} progress={progress} />
        <KanaRow label="가타카나" kanaIds={kataIds} progress={progress} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
        <button style={{ ...BTN, textAlign: 'center', fontSize: 14 }} onClick={() => onPracticeKana('hiragana')}>히라가나 연습</button>
        <button style={{ ...BTN, textAlign: 'center', fontSize: 14 }} onClick={() => onPracticeKana('katakana')}>가타카나 연습</button>
        <button style={{ ...BTN, textAlign: 'center', fontSize: 14 }} onClick={onPracticeSigns}>간판·메뉴 읽기</button>
        <button style={{ ...BTN, textAlign: 'center', fontSize: 14 }} onClick={onPracticeDictation}>받아쓰기</button>
      </div>

      {s.seen > 0 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <Stat label="본 카드" value={s.seen} />
          <Stat label="익숙" value={s.mastered} tone="ok" />
          <Stat label="약점" value={s.weak} tone="accent" />
        </div>
      )}

      <Rule />

      {/* 장면별 연습 */}
      <Kicker>장면별 연습</Kicker>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        {scenes.map((m) => {
          const unlocked = isMissionUnlocked(m.id, progress);
          const sv = sceneVisualByPlace(m.place);
          const name = m.place ?? m.scenario;
          if (!unlocked) {
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: RADIUS.md, border: '1.5px dashed var(--line)', color: 'var(--ink-faint)' }}>
                <span style={{ fontSize: 18, opacity: 0.5 }}>{sv.emoji}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{name}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>🔒 {lockHint(m.id)}</span>
              </div>
            );
          }
          const p = missionProgress(allCards, progress, m.id);
          const done = p.total > 0 && p.mastered === p.total;
          return (
            <button
              key={m.id}
              className="ym-pop-sm"
              onClick={() => onPracticeScene(m.id)}
              style={{ ...BTN, display: 'flex', alignItems: 'center', gap: 12, padding: 0, overflow: 'hidden' }}
            >
              <span style={{ alignSelf: 'stretch', width: 8, background: done ? 'var(--ok)' : sv.accent }} />
              <span style={{ fontSize: 20, paddingLeft: 4 }}>{sv.emoji}</span>
              <span style={{ flex: 1, fontSize: 16, fontWeight: 700, textAlign: 'left' }}>{name}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: done ? 'var(--ok)' : 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>
                {done ? '완료' : `${p.mastered}/${p.total}`}
              </span>
              <span style={{ fontSize: 16, color: 'var(--ink-faint)', paddingRight: 14 }}>›</span>
            </button>
          );
        })}
      </div>

      {s.seen > 0 && (
        <button
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-faint)', fontSize: 13, fontWeight: 600, marginTop: 22, width: '100%', textAlign: 'center', textDecoration: 'underline', textUnderlineOffset: 3 }}
          onClick={() => { if (confirm('진척을 모두 지울까요?')) onReset(); }}
        >
          처음부터 다시
        </button>
      )}

      {!ttsSupported() && <p style={{ color: 'var(--warn)', fontSize: 13, marginTop: 16, fontWeight: 600 }}>이 브라우저는 음성(TTS) 미지원 — 텍스트로만 진행됩니다.</p>}
    </main>
  );
}

// 학습 진단 — 적응형 엔진의 판단을 보여주는 블록.
function DiagnosisBlock({ d }: { d: Diagnosis }) {
  const tone = d.level === 'struggling' ? 'var(--warn)' : d.level === 'cruising' ? 'var(--ok)' : 'var(--accent)';
  return (
    <div style={{ marginTop: 18, borderRadius: RADIUS.lg, border: '1.5px solid var(--border)', background: 'var(--surface)', padding: 18 }}>
      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800 }}>
        <span style={{ width: 12, height: 12, borderRadius: 3, background: tone }} />
        학습 진단{d.level ? ` · ${LEVEL_LABEL[d.level]}` : ''}
      </p>
      <p style={{ margin: '12px 0 0', fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>{d.focus}</p>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, fontWeight: 500 }}>{d.message}</p>
      {d.level !== null && d.recentAccuracy !== null && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          직전 세션 정답률 {Math.round(d.recentAccuracy * 100)}%
        </p>
      )}
      {(d.weakKana.length > 0 || d.weakScenes.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-faint)' }}>약점</span>
          {d.weakKana.map((w) => (
            <span key={w.key} style={{ minWidth: 28, height: 28, padding: '0 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--border)', borderRadius: 7, fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{w.label}</span>
          ))}
          {d.weakScenes.map((w) => (
            <span key={w.key} style={{ padding: '4px 10px', border: '1.5px solid var(--border)', borderRadius: 999, fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}>{w.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function lockHint(missionId: string): string {
  if (missionId === 'C3') return '편의점·식당 더 익히기';
  if (missionId === 'C4') return '전철 더 익히기';
  return '조금 더 익히기';
}

// 가나 트랙 — 세그먼트(칸) 진척 막대
function KanaRow({ label, kanaIds, progress }: { label: string; kanaIds: string[]; progress: ProgressMap }) {
  const m = kanaReadMastery(progress, kanaIds);
  const pct = m.mastered / Math.max(1, m.total);
  const SEG = 20;
  const filled = Math.round(pct * SEG);
  return (
    <div style={{ padding: '10px 0', borderTop: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 15 }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span style={{ color: 'var(--ink-faint)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          <strong style={{ color: 'var(--ink)' }}>{m.mastered}</strong> / {m.total}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
        {Array.from({ length: SEG }, (_, i) => (
          <span key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i < filled ? 'var(--accent)' : 'var(--surface-2)' }} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'ok' | 'accent' }) {
  const color = tone === 'ok' ? 'var(--ok)' : tone === 'accent' ? 'var(--accent)' : 'var(--ink)';
  return (
    <div style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: RADIUS.md, padding: '10px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 2 }}>{value}</div>
    </div>
  );
}
