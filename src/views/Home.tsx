// 홈 — iOS Liquid Glass + Motion 프로토타입.
// 반투명 글래스 레이어 + 앰비언트 깊이 + 스프링 등장 모션 + 절제된 보상(진척 링).
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import type { Diagnosis } from '../learn/adaptive';
import { LEVEL_LABEL } from '../learn/adaptive';
import {
  isMissionUnlocked, kanaReadMastery, missionProgress, nextSessionId, planSession,
  sessionCounts, summarize, type ProgressMap, type SessionConfig, type SessionState,
} from '../learn/progress';
import { ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { sessionGoalText } from './goal';
import { sceneVisualByPlace } from './scene';
import { NavBar, type NavBarProps } from './NavBar';
import { SceneThumb } from './ui';

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

// 글래스 카드 (반투명 + 블러). padding은 인라인으로.
const glassCard = (delay: number, pad = 18): React.CSSProperties => ({ padding: pad, animationDelay: `${delay}s` });
const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase' };

export function Home({ nav, allCards, progress, session, sessionConfig, diagnosis, modeLabel, onStart, onReset, onPracticeScene, onPracticeKana, onPracticeSigns, onPracticeDictation }: Props) {
  const upcomingId = nextSessionId(session);
  const counts = sessionCounts(allCards, progress, upcomingId);
  const plan = planSession(allCards, progress, upcomingId, sessionConfig);
  const planned = plan.size;
  const hiraIds = CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id);
  const kataIds = CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id);
  const hira = kanaReadMastery(progress, hiraIds);
  const kata = kanaReadMastery(progress, kataIds);
  const kanaPct = Math.round(((hira.mastered + kata.mastered) / Math.max(1, hira.total + kata.total)) * 100);
  const s = summarize(progress);
  const goal = sessionGoalText(plan.missions, plan.breakdown.K > 0);
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0');

  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      <h1 className="ym-rise" style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', animationDelay: '0s' }}>yangmung</h1>
      <p className="ym-rise" style={{ color: 'var(--ink-faint)', marginTop: 6, marginBottom: 0, fontSize: 13, fontWeight: 600, animationDelay: '.03s' }}>일본 여행, 오늘 한 판 · 세션 #{upcomingId}</p>

      {/* 오늘 목표 — 글래스 히어로 */}
      <div className="ym-glass ym-rise" style={{ ...glassCard(0.06, 20), marginTop: 18 }}>
        <p style={{ margin: 0, ...label }}>오늘 목표</p>
        <p style={{ margin: '10px 0 0', fontSize: 24, fontWeight: 750, lineHeight: 1.25, letterSpacing: '-0.02em' }}>{goal}</p>
        <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>
          {modeLabel} · 가나 {plan.breakdown.K} · 표현 {plan.breakdown.B} · 미션 {plan.breakdown.C} · 팁 {plan.breakdown.tip}
        </p>
        <button className="ym-press" style={accentBtn} onClick={onStart} disabled={planned === 0}>
          {planned === 0 ? '오늘 학습할 카드가 없어요' : `시작 · ${planned}카드`}
        </button>
        {planned > 0 && counts.due + counts.fresh > planned && (
          <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 10, textAlign: 'center', fontWeight: 600 }}>
            오늘 풀 수 있는 카드 {counts.due + counts.fresh}개 중 {planned}개씩 짧게 진행해요.
          </p>
        )}
      </div>

      {/* 학습 진단 — 글래스 */}
      <div className="ym-glass ym-rise" style={{ ...glassCard(0.1), marginTop: 14 }}>
        <DiagnosisBody d={diagnosis} />
      </div>

      {/* 가나 안정도 — 글래스 + 진척 링 */}
      <div className="ym-glass ym-rise" style={{ ...glassCard(0.14), marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Ring pct={kanaPct} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, ...label }}>가나 안정도</p>
            <KanaRow label="히라가나" m={hira} />
            <KanaRow label="가타카나" m={kata} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
          <button className="ym-press" style={pill} onClick={() => onPracticeKana('hiragana')}>히라가나 연습</button>
          <button className="ym-press" style={pill} onClick={() => onPracticeKana('katakana')}>가타카나 연습</button>
          <button className="ym-press" style={pill} onClick={onPracticeSigns}>간판·메뉴 읽기</button>
          <button className="ym-press" style={pill} onClick={onPracticeDictation}>받아쓰기</button>
        </div>
      </div>

      {/* 장면별 연습 */}
      <p className="ym-rise" style={{ ...label, display: 'block', margin: '24px 4px 12px', animationDelay: '.18s' }}>장면별 연습</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {scenes.map((m, idx) => {
          const unlocked = isMissionUnlocked(m.id, progress);
          const sv = sceneVisualByPlace(m.place);
          const name = m.place ?? m.scenario;
          const delay = `${0.2 + idx * 0.03}s`;
          if (!unlocked) {
            return (
              <div key={m.id} className="ym-rise" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 18, border: '1px dashed var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink-faint)', animationDelay: delay }}>
                <SceneThumb icon={sv.icon} accent={sv.accent} muted size={42} />
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{name}</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>🔒 {lockHint(m.id)}</span>
              </div>
            );
          }
          const p = missionProgress(allCards, progress, m.id);
          const done = p.total > 0 && p.mastered === p.total;
          return (
            <button key={m.id} className="ym-glass ym-press ym-rise" onClick={() => onPracticeScene(m.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', color: 'var(--ink)', borderRadius: 18, animationDelay: delay }}>
              <SceneThumb icon={sv.icon} accent={sv.accent} size={42} />
              <span style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>{name}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: done ? 'var(--ok)' : 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}>
                {done ? '완료' : `${p.mastered}/${p.total}`}
              </span>
              <span style={{ fontSize: 18, color: 'var(--ink-faint)' }}>›</span>
            </button>
          );
        })}
      </div>

      {s.seen > 0 && (
        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-faint)', fontSize: 13, fontWeight: 600, marginTop: 22, width: '100%', textAlign: 'center' }}
          onClick={() => { if (confirm('진척을 모두 지울까요?')) onReset(); }}>처음부터 다시</button>
      )}
      {!ttsSupported() && <p style={{ color: 'var(--warn)', fontSize: 13, marginTop: 16, fontWeight: 600 }}>이 브라우저는 음성(TTS) 미지원 — 텍스트로만 진행됩니다.</p>}
    </main>
  );
}

const accentBtn: React.CSSProperties = {
  marginTop: 16, width: '100%', padding: '15px 16px', border: 'none', borderRadius: 16,
  background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 750, fontSize: 16,
  cursor: 'pointer', boxShadow: '0 8px 22px rgba(185,56,46,0.32)', letterSpacing: '0.01em',
};
const pill: React.CSSProperties = {
  padding: '13px 12px', borderRadius: 14, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 14,
  textAlign: 'center', cursor: 'pointer',
};

function DiagnosisBody({ d }: { d: Diagnosis }) {
  const tone = d.level === 'struggling' ? 'var(--warn)' : d.level === 'cruising' ? 'var(--ok)' : 'var(--accent)';
  return (
    <>
      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700 }}>
        <span style={{ width: 9, height: 9, borderRadius: 99, background: tone, boxShadow: `0 0 8px ${tone}` }} />
        학습 진단{d.level ? ` · ${LEVEL_LABEL[d.level]}` : ''}
      </p>
      <p style={{ margin: '12px 0 0', fontSize: 18, fontWeight: 750, letterSpacing: '-0.01em' }}>{d.focus}</p>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{d.message}</p>
      {d.level !== null && d.recentAccuracy !== null && (
        <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>직전 세션 정답률 {Math.round(d.recentAccuracy * 100)}%</p>
      )}
      {(d.weakKana.length > 0 || d.weakScenes.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-faint)' }}>약점</span>
          {d.weakKana.map((w) => (
            <span key={w.key} style={{ minWidth: 28, height: 28, padding: '0 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', borderRadius: 8, fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{w.label}</span>
          ))}
          {d.weakScenes.map((w) => (
            <span key={w.key} style={{ padding: '4px 10px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', borderRadius: 999, fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}>{w.label}</span>
          ))}
        </div>
      )}
    </>
  );
}

// 진척 링 (SVG) — 가나 전체 안정도 %
function Ring({ pct }: { pct: number }) {
  const r = 26, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" style={{ flex: '0 0 68px' }}>
      <circle cx="34" cy="34" r={r} fill="none" stroke="var(--glass-border)" strokeWidth="6" />
      <circle cx="34" cy="34" r={r} fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 34 34)" style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.2,.8,.2,1)' }} />
      <text x="34" y="38" textAnchor="middle" fontSize="16" fontWeight="750" fill="var(--ink)">{pct}%</text>
    </svg>
  );
}

function KanaRow({ label: lbl, m }: { label: string; m: { mastered: number; total: number } }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 14, marginTop: 6 }}>
      <span style={{ fontWeight: 600 }}>{lbl}</span>
      <span style={{ color: 'var(--ink-faint)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        <strong style={{ color: 'var(--ink)' }}>{m.mastered}</strong> / {m.total}
      </span>
    </div>
  );
}

function lockHint(missionId: string): string {
  if (missionId === 'C3') return '편의점·식당 더 익히기';
  if (missionId === 'C4') return '전철 더 익히기';
  return '조금 더 익히기';
}
