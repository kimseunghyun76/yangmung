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
  // 2026-07-26 신규: 약점 1순위 카테고리를 바로 연습하러 갈 수 있는 지름길(있는 카테고리만 버튼 노출).
  onPracticeGreetings?: () => void;
  onPracticeKanaHiragana?: () => void;
  onPracticePairs?: () => void;
  onCompose?: () => void;
  onDictation?: () => void;
  onPracticeVocab?: () => void;
  onSigns?: () => void;
}

// 오답 분석("어떤 부분을 다시 학습해야 하는지") — categoryBreakdown 중 하나라도 틀린 카테고리만.
function weakBreakdown(sessionLog: SessionLogEntry[], sessionCards: Card[]): { label: string; count: number }[] {
  return categoryBreakdown(sessionLog, sessionCards)
    .filter((c) => c.correct < c.total)
    .map((c) => ({ label: c.label, count: c.total - c.correct }))
    .sort((a, b) => b.count - a.count);
}

// 카테고리별 한 줄 조언 — 왜 틀렸을 가능성이 높은지·어떻게 다시 보면 좋을지 구체적으로.
const ADVICE: Record<string, string> = {
  '가나 읽기': '헷갈리는 글자 위주로 표를 다시 보고, 모양이 비슷한 글자(예: り/わ, ソ/ン)를 나란히 비교해 보세요.',
  '발음 구분': '비슷하게 들리는 소리(탁음·요음 등)를 짝지어 반복해서 들어보면 귀가 빨리 트여요.',
  '작문': '뜻을 보고 일본어 문장을 직접 만드는 연습이에요 — 짧은 문장부터 소리 내어 만들어 보세요.',
  '받아쓰기': '듣고 가나로 받아 적는 연습이에요 — 속도를 늦춰서 듣고, 안 들리면 여러 번 반복해서 들어보세요.',
  '기본 인사': '첫 만남·감사·부탁 인사말을 실제 상황을 상상하며 소리 내어 반복해 보세요.',
  '어휘': '주제별 단어를 카드로 넘기며 뜻과 발음을 함께 익혀 보세요.',
  '숫자·기본 어휘': '숫자·요일·시간·금액처럼 실생활에서 바로 쓰는 표현이라, 소리 내어 여러 번 말해보면 빨리 익어요.',
  '간판·표지': '역·식당·주의 표지판을 실제로 본다고 상상하며 뜻을 다시 확인해 보세요.',
  '문법': '문법 팁을 다시 읽고, 예문을 소리 내어 따라 말해 보세요.',
};

// 카테고리 label → 지름길 버튼에 쓸 텍스트·콜백 키. Done.tsx가 이미 갖고 있는 연습 시작 함수와 매칭한다.
function practiceShortcut(label: string, cbs: {
  onPracticeGreetings?: () => void; onPracticeKanaHiragana?: () => void; onPracticePairs?: () => void;
  onCompose?: () => void; onDictation?: () => void; onPracticeVocab?: () => void; onSigns?: () => void;
}): { text: string; onClick: () => void } | null {
  if (label === '가나 읽기' && cbs.onPracticeKanaHiragana) return { text: '가나 표 다시 보기', onClick: cbs.onPracticeKanaHiragana };
  if (label === '발음 구분' && cbs.onPracticePairs) return { text: '발음 구분 연습하러 가기', onClick: cbs.onPracticePairs };
  if (label === '작문' && cbs.onCompose) return { text: '작문 연습하러 가기', onClick: cbs.onCompose };
  if (label === '받아쓰기' && cbs.onDictation) return { text: '받아쓰기 연습하러 가기', onClick: cbs.onDictation };
  if (label === '기본 인사' && cbs.onPracticeGreetings) return { text: '기본 인사 다시 보기', onClick: cbs.onPracticeGreetings };
  if ((label === '어휘' || label === '숫자·기본 어휘') && cbs.onPracticeVocab) return { text: '어휘 연습하러 가기', onClick: cbs.onPracticeVocab };
  if (label === '간판·표지' && cbs.onSigns) return { text: '간판·표지 연습하러 가기', onClick: cbs.onSigns };
  return null;
}

export function PromotionResult({
  fromLevel, toLevel, passed, score, quizSeen, sessionLog, sessionCards, onOpenLevelGuide, onRetry, onHome,
  onPracticeGreetings, onPracticeKanaHiragana, onPracticePairs, onCompose, onDictation, onPracticeVocab, onSigns,
}: PromotionResultProps) {
  const pct = quizSeen ? Math.round((score / quizSeen) * 100) : 0;
  const fromLabel = CORE_LEVEL_LABEL[fromLevel];
  const toLabel = CORE_LEVEL_LABEL[toLevel];
  const weakAreas = weakBreakdown(sessionLog, sessionCards);
  const topWeak = weakAreas[0];
  const shortcut = topWeak ? practiceShortcut(topWeak.label, { onPracticeGreetings, onPracticeKanaHiragana, onPracticePairs, onCompose, onDictation, onPracticeVocab, onSigns }) : null;

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 40px' }}>
      {/* 배경 배너 — 이전엔 이 화면 전체에 이미지가 하나도 없었다(2026-07-27 사용성 지적).
          전용 삽화가 없어 새로 만들지 않고, 기존 마스코트 레퍼런스 이미지를 결과(합격/불합격) 톤에 맞춰 재사용. */}
      <div className="ym-rise" style={{
        position: 'relative', height: 132, borderRadius: 20, overflow: 'hidden', marginBottom: 4,
        background: passed
          ? 'radial-gradient(circle at 25% 20%, rgba(60,150,90,0.28), transparent 55%), linear-gradient(135deg, rgba(60,150,90,0.16), var(--glass-bg-strong))'
          : 'radial-gradient(circle at 25% 20%, rgba(200,140,30,0.24), transparent 55%), linear-gradient(135deg, rgba(200,140,30,0.14), var(--glass-bg-strong))',
        border: '1px solid var(--glass-border)',
      }}>
        <img src="/mascots/yangmung-duo-done.webp" alt="" style={{
          position: 'absolute', right: -10, bottom: -18, height: 168, width: 168, objectFit: 'contain',
          filter: passed ? undefined : 'saturate(.75)',
        }} />
      </div>
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
        20문제 중 90% 이상 맞히면 <strong>{toLabel}</strong>으로 올라가요.
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
          {/* 친절한 안내 — 1순위 약점을 이름으로 콕 짚어 먼저 말해준다(2026-07-26, 사용자 요청). */}
          <MascotBubble who="yang" style={{ marginTop: 12 }}>
            {topWeak
              ? <>이번엔 <strong>{topWeak.label}</strong>에서 실수가 가장 많았어요({topWeak.count}개). 여기부터 다시 보면 통과에 훨씬 가까워질 거예요!</>
              : '아깝게 놓쳤어요! 조금만 더 반복하면 금방 통과할 거예요.'}
          </MascotBubble>
          <GlassPanel style={{ marginTop: 12 }}>
            <p style={{ ...kicker, margin: '0 0 8px' }}>이 부분을 다시 학습해 보세요</p>
            {weakAreas.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {weakAreas.map((w) => (
                  <div key={w.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                      <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{w.label}</span>
                      <strong style={{ color: 'var(--warn)' }}>{w.count}개 틀림</strong>
                    </div>
                    {ADVICE[w.label] && (
                      <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{ADVICE[w.label]}</p>
                    )}
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
          {shortcut && (
            <button className="ym-press" style={{ ...primaryBtn, marginTop: 12 }} onClick={shortcut.onClick}>
              <Icon name="target" size={18} /> {shortcut.text}
            </button>
          )}
          <button className="ym-press" style={{ ...(shortcut ? glassBtn : primaryBtn), marginTop: shortcut ? 10 : 12 }} onClick={onRetry}>
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
