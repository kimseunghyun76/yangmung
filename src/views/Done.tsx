// 세션 완료 — Immersive Scene Coach. 장면 클리어 감정 + 여권 스탬프 + 다음 장면 예고.
import { CONTENT } from '../content';
import { sessionResult, summarize, type ProgressMap, type SessionLogEntry } from '../learn/progress';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { GlassPanel, PrimaryAction, hexA } from './shell';
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
  nextSceneId?: string;
  showGacha?: boolean;
  onRetryWeak: () => void;
  onContinue: () => void;
  onHome: () => void;
}

const placeOf = (id: string) => CONTENT.missions.find((m) => m.id === id)?.place
  ?? CONTENT.missions.find((m) => m.id === id)?.scenario ?? id;

export function Done({ sessionId, score, quizSeen, sessionLog, progress, speakCount, canContinue, clearedSceneIds, nextSceneId, showGacha = true, onRetryWeak, onContinue, onHome }: Props) {
  const stars = quizSeen ? Math.max(1, Math.round((score / quizSeen) * 3)) : 0;
  const s = summarize(progress);
  const sr = sessionResult(progress, sessionId);
  const recoveryUsed = sessionLog.filter((r) => r.result === 'recovery').length;
  const wrongCount = sessionLog.filter((r) => r.result === 'wrong').length;
  const weak = new Set(sessionLog.filter((r) => r.result !== 'correct').map((r) => r.id)).size;
  const stamps = clearedSceneIds.slice(0, 3);

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

      {/* 가챠 보석함 — 성과 등급별 조각 적립 (학습 로직과 분리). 약점 재도전 세션 제외 */}
      {showGacha && <GachaBox sessionId={sessionId} sceneIds={clearedSceneIds} grade={boxGrade(stars, recoveryUsed)} />}

      {/* 다음 장면 예고 */}
      {nextSceneId && (
        <div className="ym-rise" style={{ animationDelay: '.16s', marginTop: 20 }}>
          <GlassPanel style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16 }}>
            <span style={{ width: 46, height: 46, flex: '0 0 46px', borderRadius: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: hexA(sceneVisualByMission(nextSceneId).accent, 0.16), color: sceneVisualByMission(nextSceneId).accent }}>
              <Icon name={sceneVisualByMission(nextSceneId).icon} size={26} />
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, ...kicker }}>다음 장면</p>
              <p style={{ margin: '3px 0 0', fontSize: 16, fontWeight: 700 }}>{placeOf(nextSceneId)}</p>
            </div>
            <Icon name="flow" size={20} style={{ color: 'var(--ink-faint)' }} />
          </GlassPanel>
        </div>
      )}

      {/* 다음 행동 */}
      <div className="ym-rise" style={{ animationDelay: '.2s', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {weak > 0 && (
          <button className="ym-press" style={glassBtn} onClick={onRetryWeak}>
            <Icon name="target" size={18} style={{ color: 'var(--accent)' }} /> 약점만 다시 풀기 ({weak})
          </button>
        )}
        {canContinue && <PrimaryAction onClick={onContinue}><Icon name="plus" size={18} /> 한 세션 더</PrimaryAction>}
        <button className="ym-press" style={glassBtn} onClick={onHome}>
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

function Row({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 14, padding: '4px 0' }}>
      <span style={{ color: 'var(--ink-soft)' }}>{label}</span>
      <strong style={{ color: color ?? 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</strong>
    </div>
  );
}
