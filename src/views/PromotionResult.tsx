// 승급 시험 전용 결과 화면 — 합격/불합격을 명확히 구분하고, 캐릭터가 시험의 목적·결과·다음 행동을 설명한다.
// Done.tsx가 doneSnapshot.promotionResult를 갖고 있을 때만 이 컴포넌트를 그린다(일반 세션은 기존 화면 유지).
import type { Card } from '../learn/cards';
import type { SessionLogEntry } from '../learn/progress';
import { CORE_LEVEL_LABEL, LEVEL_STAGES, type CoreLevel } from '../learn/progression';
import { MODE_PRESETS } from '../learn/settings';
import { categoryBreakdown } from '../learn/sessionCategories';
import { Icon } from '../ui/Icon';
import { MascotBubble } from './mascot';
import { GlassPanel } from './shell';

export interface PromotionResultProps {
  fromLevel: CoreLevel;
  toLevel: CoreLevel;
  passed: boolean;
  score: number;
  quizSeen: number;
  sessionLog: SessionLogEntry[];
  sessionCards: Card[];
  onOpenLevelGuide: () => void;
  onRetry: () => void;
  onHome: () => void;
}

// 오답 분석("어떤 부분을 다시 학습해야 하는지") — categoryBreakdown 중 하나라도 틀린 카테고리만.
function weakBreakdown(sessionLog: SessionLogEntry[], sessionCards: Card[]): { label: string; count: number }[] {
  return categoryBreakdown(sessionLog, sessionCards)
    .filter((c) => c.correct < c.total)
    .map((c) => ({ label: c.label, count: c.total - c.correct }))
    .sort((a, b) => b.count - a.count);
}

export function PromotionResult({ fromLevel, toLevel, passed, score, quizSeen, sessionLog, sessionCards, onOpenLevelGuide, onRetry, onHome }: PromotionResultProps) {
  const pct = quizSeen ? Math.round((score / quizSeen) * 100) : 0;
  const fromLabel = CORE_LEVEL_LABEL[fromLevel];
  const toLabel = CORE_LEVEL_LABEL[toLevel];
  const weakAreas = weakBreakdown(sessionLog, sessionCards);

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 40px' }}>
      <div className="ym-rise" style={{ textAlign: 'center', paddingTop: 8 }}>
        <div className="ym-burst" style={{
          width: 76, height: 76, margin: '0 auto', borderRadius: 99,
          background: passed ? 'var(--ok)' : 'var(--warn)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: passed ? '0 10px 28px rgba(60,150,90,0.4)' : '0 10px 28px rgba(200,140,30,0.35)',
        }}>
          <Icon name={passed ? 'trophy' : 'target'} size={38} />
        </div>
        <p style={{ ...kicker, marginTop: 14 }}>{fromLabel} → {toLabel} 승급 시험</p>
        <h1 style={{ margin: '6px 0 0', fontSize: 26 }}>{passed ? '합격했어요!' : '아직이에요'}</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '8px 0 0', fontWeight: 650 }}>
          정답률 {pct}% ({score}/{quizSeen}) · 통과 기준 90%
        </p>
      </div>

      {/* 이 시험이 무엇을 확인하는지 */}
      <MascotBubble who="mung" style={{ marginTop: 22 }}>
        이 시험은 <strong>{fromLabel}</strong> 단계에서 배운 핵심 내용을 얼마나 익혔는지 확인해요.
        20문제 중 90% 이상 맞히면 <strong>{toLabel}</strong>로 올라가요.
      </MascotBubble>

      {passed ? (
        <div className="ym-rise" style={{ marginTop: 18 }}>
          <GlassPanel>
            <p style={{ ...kicker, margin: '0 0 8px' }}>{toLabel}에서 배우게 될 내용</p>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{MODE_PRESETS[toLevel].desc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LEVEL_STAGES[toLevel].length > 0 ? LEVEL_STAGES[toLevel].map((stage) => (
                <div key={stage.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5 }}>
                  <strong style={{ color: 'var(--ink)' }}>{stage.label}</strong>
                  <span style={{ color: 'var(--ink-soft)' }}>{stage.sub}</span>
                </div>
              )) : <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>단계 구분 없이 자유롭게 미션과 심화 표현을 이어가요.</p>}
            </div>
          </GlassPanel>
          <button className="ym-press" style={{ ...primaryBtn, marginTop: 12 }} onClick={onOpenLevelGuide}>
            <Icon name="flow" size={18} /> {toLabel} 학습 가이드 보기
          </button>
          <button className="ym-press" style={{ ...glassBtn, marginTop: 10 }} onClick={onHome}>
            <Icon name="nav-home" size={18} /> 홈으로
          </button>
        </div>
      ) : (
        <div className="ym-rise" style={{ marginTop: 18 }}>
          <GlassPanel>
            <p style={{ ...kicker, margin: '0 0 8px' }}>이 부분을 다시 학습해 보세요</p>
            {weakAreas.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {weakAreas.map((w) => (
                  <div key={w.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                    <span style={{ color: 'var(--ink)' }}>{w.label}</span>
                    <strong style={{ color: 'var(--warn)' }}>{w.count}개 틀림</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>큰 약점은 없었어요 — 조금만 더 반복하면 통과할 거예요.</p>
            )}
            <p style={{ margin: '12px 0 0', fontSize: 12.5, color: 'var(--ink-faint)', lineHeight: 1.5 }}>
              위 내용을 다시 학습한 뒤, 시험을 다시 보면 돼요. 몇 번이든 다시 볼 수 있어요.
            </p>
          </GlassPanel>
          <button className="ym-press" style={{ ...primaryBtn, marginTop: 12 }} onClick={onRetry}>
            <Icon name="recovery" size={18} /> 시험 다시 보기
          </button>
          <button className="ym-press" style={{ ...glassBtn, marginTop: 10 }} onClick={onHome}>
            <Icon name="nav-home" size={18} /> 홈으로 — 복습부터 다시
          </button>
        </div>
      )}
    </main>
  );
}

const kicker: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 };
const primaryBtn: React.CSSProperties = {
  width: '100%', padding: '15px 16px', borderRadius: 16, border: 'none',
  background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 800, fontSize: 15.5, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};
const glassBtn: React.CSSProperties = {
  width: '100%', padding: '15px 16px', borderRadius: 16, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 15, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};
