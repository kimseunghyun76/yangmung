// 세션 — Immersive Scene Coach v1. 상단 장면 헤더 + 하단 글래스 학습 시트.
// 시각 위계: 일본어 > 듣기 > 행동(선택/말하기) > 한국어. (UI_REDESIGN_PROPOSAL.md §4-2)
import { useState } from 'react';
import type { Card, Choice } from '../learn/cards';
import type { CardStatus } from '../learn/progress';
import type { GrammarPoint } from '../content/types';
import { loadSettings } from '../learn/settings';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { IntroduceCardView } from './IntroduceCard';
import { OrderCardView, type PickMap } from './OrderCard';
import { SpeakCardView } from './SpeakCard';
import { DictationCardView } from './DictationCard';
import { DiscoverCardView } from './DiscoverCard';
import { ReadingAid } from './ReadingAid';
import { sceneVisualByMission, sceneBackdropForCard } from './scene';
import { Icon } from '../ui/Icon';
import { GlassPanel, PrimaryAction, hexA } from './shell';
import { MascotLine, mascotShows } from './mascot';
import { CONTENT } from '../content';

interface Props {
  card: Card;
  index: number;
  total: number;
  picked: number | null;
  cardStatus: CardStatus | null;
  onChoose: (idx: number, c: Choice) => void;
  onIntroduceSeen: () => void;
  onSpeakPracticed: () => void;
  onDictationResult: (correct: boolean) => void;
  isKanaFamiliar: (char: string) => boolean;
  onNext: () => void;
  onPrev?: () => void;
  onExit: () => void;
  onKnown: () => void;
  picks: PickMap;
}

export function Session({ card, index, total, picked, onChoose, onIntroduceSeen, onSpeakPracticed, onDictationResult, isKanaFamiliar, onNext, onPrev, onExit, onKnown, picks }: Props) {
  const missionId = card.kind !== 'tip' && card.kind !== 'discover' && card.reviewTarget?.type === 'mission'
    ? String(card.reviewTarget.id) : undefined;
  const sv = missionId ? sceneVisualByMission(missionId) : null;
  // 배경 컷은 카드(화면) 전환마다 회전 — 같은 장면이라도 카드마다 다른 컷이 보인다.
  const cardBackdrop = sv ? (sv.backdrop ? sceneBackdropForCard(missionId, index) : sv.hero) : undefined;
  const accent = sv?.accent ?? '#b9382e';
  const isMissionStep = card.kind === 'quiz' && !!card.promptPhrase;
  const speaker = isMissionStep ? card.sub : '';
  const scenario = 'scenario' in card ? card.scenario : undefined;
  const plainTag = !sv && card.kind !== 'tip' && card.kind !== 'discover' ? card.tag : '';
  // 장면 진입 모션 키 — 같은 장면(미션) 안에서는 유지, 새 장면으로 바뀔 때만 재생.
  const sceneKey = sv && 'reviewTarget' in card && card.reviewTarget ? `sc-${String(card.reviewTarget.id)}` : 'plain';

  const exit = () => { if (index === 0 || confirm('세션을 끝내고 홈으로 갈까요? (지금까지 푼 카드는 저장돼요)')) onExit(); };

  return (
    <main style={{ ...WRAP, minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: 0 }}>
      {/* ── 1. 내비게이션 바 (배경 이미지는 질문 문장 위로 이동) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        padding: 'max(14px, env(safe-area-inset-top)) 16px 8px',
        background: 'var(--surface-2)',
      }}>
        <button onClick={exit} aria-label="나가기" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 4, padding: 4 }}>
          <Icon name="back" size={18} /> 나가기
        </button>
        <Dots i={index} total={total} onScene={false} />
        <button
          onClick={onPrev}
          disabled={index === 0 || !onPrev}
          aria-label="이전 카드"
          style={{
            border: 'none', background: 'none', cursor: index > 0 ? 'pointer' : 'default',
            fontSize: 14, fontWeight: 600, color: index > 0 ? 'var(--ink)' : 'transparent',
            display: 'flex', alignItems: 'center', gap: 3, padding: 4,
            pointerEvents: index > 0 ? 'auto' : 'none',
          }}
        >
          ← 이전
        </button>
      </div>

      {/* ── 3. 장면·화자 배지 (새 표현 카드는 장면명을 배경 하단 오버레이로 옮겨 숨김) ── */}
      {(() => {
        const showScenario = !!sv && !!scenario && card.kind !== 'introduce';
        const showSpeaker = !!sv && !!speaker;
        const showPlain = !sv && !!plainTag;
        if (!showScenario && !showSpeaker && !showPlain) return null;
        return (
          <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', background: 'var(--surface-2)', flexShrink: 0 }}>
            {showScenario && <span style={{ padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: hexA(accent, 0.9), color: '#fff' }}>{scenario}</span>}
            {showSpeaker && <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: 'var(--accent-soft)', color: 'var(--accent)' }}>{speaker}</span>}
            {showPlain && <span style={{ padding: '5px 11px', borderRadius: 999, fontSize: 12, fontWeight: 800, background: 'var(--accent-soft)', color: 'var(--accent)' }}>{plainTag}</span>}
          </div>
        );
      })()}

      {/* ── 4. 글래스 학습 시트 (flex로 끝까지 채우고, 길면 내부 스크롤) ── */}
      <GlassPanel style={{
        flex: 1, minHeight: 0, overflowY: 'auto', borderRadius: '24px 24px 0 0', borderBottom: 'none',
        padding: '20px max(20px, env(safe-area-inset-left)) max(24px, calc(env(safe-area-inset-bottom) + 16px))',
      }}>
        <div key={sceneKey} className="ym-sheet-up" style={{ maxWidth: 540, margin: '0 auto' }}>
          {/* 장면 배경 — 질문 문장 바로 위. 잘리지 않게 전체 표시(contain), 여백은 테마색이 채운다.
              key={cardBackdrop}로 카드 전환마다 등장 애니를 재생해 컷이 바뀌는 게 보이게 한다. */}
          {cardBackdrop && (
            <div key={cardBackdrop} className="ym-scene-bg" style={{
              position: 'relative', overflow: 'hidden', width: 'calc(100% + 40px)', marginLeft: -20, marginRight: -20,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${hexA(accent, 0.14)}, var(--surface-2))`, marginBottom: 18,
            }}>
              <img src={cardBackdrop} alt="" aria-hidden style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                objectPosition: 'center',
                filter: 'saturate(.88) contrast(.98)',
              }} />
              {/* 새 표현 — 타이틀 + 장면 설명을 배경 하단에 얹는다 */}
              {card.kind === 'introduce' && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0, padding: '34px 16px 12px',
                  background: 'linear-gradient(to top, rgba(20,12,8,.78), rgba(20,12,8,.34) 58%, transparent)',
                  color: '#fff', textAlign: 'left',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 800, letterSpacing: '.02em', color: '#ffe6b0' }}>
                    <Icon name="discover" size={15} /> 새 표현
                  </span>
                  {card.note && <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.45, fontWeight: 600, color: 'rgba(255,255,255,.94)', textShadow: '0 1px 6px rgba(0,0,0,.5)' }}>{card.note}</p>}
                </div>
              )}
            </div>
          )}
          {card.kind === 'tip' ? (
            <TipBody card={card} onNext={onNext} />
          ) : card.kind === 'introduce' ? (
            <IntroduceCardView key={card.id} card={card} isKanaFamiliar={isKanaFamiliar} onSeen={onIntroduceSeen} onNext={onNext} headerInScene={!!cardBackdrop} />
          ) : card.kind === 'order' ? (
            <OrderCardView key={card.id} card={card} picks={picks} isKanaFamiliar={isKanaFamiliar} onNext={onNext} />
          ) : card.kind === 'speak' ? (
            <SpeakCardView key={card.id} card={card} isKanaFamiliar={isKanaFamiliar} onPracticed={onSpeakPracticed} onNext={onNext} />
          ) : card.kind === 'dictation' ? (
            <DictationCardView key={card.id} card={card} onResult={onDictationResult} onNext={onNext} />
          ) : card.kind === 'discover' ? (
            <DiscoverCardView key={card.id} card={card} onNext={onNext} />
          ) : (
            <QuizBody key={card.id} card={card} index={index} picked={picked} isMissionStep={isMissionStep} isKanaFamiliar={isKanaFamiliar} onChoose={onChoose} onNext={onNext} onKnown={onKnown} />
          )}
        </div>
      </GlassPanel>
    </main>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  '문법': '#4c6ef5', '문화': '#e67700', '발음': '#0ca678', '여행': '#b9382e', '회화법': '#6741d9', '장면': '#1971c2',
};

function TipBody({ card, onNext }: { card: Extract<Card, { kind: 'tip' }>; onNext: () => void }) {
  const detail = CONTENT.grammar.find((g) => `tip:${g.id}` === card.id);
  const cat = detail?.category;
  const catColor = cat ? (CATEGORY_COLORS[cat] ?? 'var(--accent)') : 'var(--accent)';
  return (
    <>
              {cat && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: catColor, color: '#fff', letterSpacing: 0.3 }}>{cat}</span>
                </div>
              )}
              <h2 style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="tip" size={22} /> {card.label}</h2>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-soft)' }}>{card.tipKo}</p>
              {detail?.exampleJa && (
                <button className="ym-press" onClick={() => speak(detail.exampleJa!)} style={{ width: '100%', padding: 14, borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', textAlign: 'left', cursor: 'pointer' }}>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--accent)' }}>실제 예문 · 눌러서 듣기</span>
                  <strong lang="ja" style={{ display: 'block', marginTop: 5, fontSize: 19 }}>{detail.exampleJa}</strong>
                  {detail.exampleKo && <span style={{ display: 'block', marginTop: 3, fontSize: 13, color: 'var(--ink-soft)' }}>{detail.exampleKo}</span>}
                </button>
              )}
              {detail?.commonMistake && <TipDetail label="흔한 실수" text={detail.commonMistake} tone="var(--warn)" />}
              {detail?.action && <TipDetail label="바로 해보기" text={detail.action} tone="var(--ok)" />}
              {detail?.n5Refs && detail.n5Refs.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-faint)' }}>
                  JLPT N5 참고: {detail.n5Refs.join(' · ')}
                </div>
              )}
              <MascotLine key={`${card.id}:tip`} copyKey="tip" style={{ marginTop: 14 }} />
              <PrimaryAction onClick={onNext} style={{ marginTop: 16 }}>다음</PrimaryAction>
    </>
  );
}

function TipDetail({ label, text, tone }: { label: string; text: string; tone: string }) {
  return <div style={{ marginTop: 10, padding: '11px 13px', borderRadius: 13, borderLeft: `3px solid ${tone}`, background: 'var(--surface-2)' }}><strong style={{ display: 'block', fontSize: 12, color: tone }}>{label}</strong><span style={{ display: 'block', marginTop: 3, fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-soft)' }}>{text}</span></div>;
}
// 보기 텍스트 — 가나 퀴즈는 소리(한글) 그대로, 표현/미션 보기는 난이도별 일본어 표기.
function ChoiceText({ c, mode, kanaQuiz }: { c: Choice; mode: 'kana_ko' | 'kana' | 'kanji'; kanaQuiz: boolean }) {
  const p = c.phrase;
  if (kanaQuiz || !p) return <span style={{ flex: 1 }}>{c.label}</span>;
  const primary = mode === 'kanji' ? (p.kanji ?? p.kana) : p.kana;
  const showKo = mode === 'kana_ko';
  return (
    <span style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
      <span lang="ja" style={{ fontWeight: 750, lineHeight: 1.2 }}>{primary}</span>
      {showKo && <span style={{ fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600 }}>{c.label}</span>}
    </span>
  );
}

// 진행 스텝 도트 + 진척 카운트(현재/전체 · 남은 개수)
function Dots({ i, total, onScene }: { i: number; total: number; onScene: boolean }) {
  const n = Math.min(total, 16);
  const on = onScene ? '#fff' : 'var(--accent)';
  const off = onScene ? 'rgba(255,255,255,0.38)' : 'var(--glass-border)';
  const cur = Math.min(i + 1, total);
  const left = Math.max(0, total - cur);
  const textColor = onScene ? '#fff' : 'var(--ink-soft)';
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {Array.from({ length: n }, (_, k) => (
          <span key={k} style={{ width: k === i ? 18 : 7, height: 7, borderRadius: 9, background: k <= i ? on : off, transition: 'width .25s' }} />
        ))}
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: textColor, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {cur}/{total}{left > 0 ? ` · ${left}개 남음` : ' · 마지막'}
      </span>
    </div>
  );
}

// 퀴즈/듣기 본문 — 일본어(주인공) → 듣기(1급) → 선택(행동) → 한국어(보조)
function QuizBody({ card, index, picked, isMissionStep, isKanaFamiliar, onChoose, onNext, onKnown }: {
  card: Extract<Card, { kind: 'quiz' }>; index: number; picked: number | null; isMissionStep: boolean;
  isKanaFamiliar: (c: string) => boolean; onChoose: (i: number, c: Choice) => void; onNext: () => void; onKnown: () => void;
}) {
  const reveal = picked !== null;
  const big = card.tag.startsWith('K') ? 68 : 30;
  // 보기 표시 난이도: 가나 퀴즈는 소리(한글) 유지, 표현/미션 보기는 일본어로(한글병기→가나만→한자).
  const settings = loadSettings();
  const choiceMode = settings.choiceMode;
  const beginner = settings.mode === 'beginner' || settings.mode === 'kana'; // 초급에서만 한국어 해석 노출
  const isKanaQuiz = card.reviewTarget?.type === 'kana';
  const isKo2Ja = card.id.includes(':ko2ja:'); // 뜻 보고 일본어 고르기
  // 힌트: 답하기 전에 눌러 내 속도로 읽는다(정답 자동 넘김과 무관).
  // 1순위 문법 규칙, 없으면 정답 표현의 설명(tip/feedback)으로 폴백 — 가나 퀴즈는 제외.
  const [hintOpen, setHintOpen] = useState(false);
  const hintGrammar = relatedGrammar(card);
  const correctChoice = card.choices.find((x) => x.correct && !x.recovery) ?? card.choices.find((x) => x.correct);
  const hintFallback = !isKanaQuiz && !hintGrammar ? buildHintFallback(card, correctChoice) : undefined;
  // 반전 퀴즈·발음 구분(pair)은 힌트를 끈다.
  const isPair = card.id.startsWith('pair:');
  const hasHint = !card.inverted && !isPair && (!!hintGrammar || !!hintFallback);
  const recoveryChoice = card.choicePools?.recovery?.[0] ?? card.choices.find((x) => x.recovery);
  return (
    <>
      {/* 1. 일본어 (주인공) */}
      {card.listen ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <button onClick={() => speak(card.bannerJa!)} disabled={!ttsSupported()}
            style={{ width: 84, height: 84, borderRadius: 99, border: 'none', cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: '0 8px 22px rgba(185,56,46,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="ym-press" aria-label="듣기">
            <Icon name="listen" size={34} />
          </button>
          <span className="ym-wave" aria-hidden><i /><i /><i /><i /><i /></span>
          <p lang="ja" style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>聞いて意味を選びましょう</p>
          {beginner && <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600 }}>듣고 의미를 고르세요</p>}
        </div>
      ) : isMissionStep ? (
        <button onClick={() => card.bannerJa && speak(card.bannerJa)} disabled={!card.bannerJa || !ttsSupported()}
          style={{ display: 'block', width: '100%', textAlign: 'center', marginBottom: 4, border: 'none', background: 'none', cursor: card.bannerJa ? 'pointer' : 'default', color: 'var(--ink)' }}>
          <span style={{ fontSize: 22, verticalAlign: 'bottom', color: 'var(--ink-faint)' }}>「</span>
          <ReadingAid text={card.promptPhrase!.kana} isFamiliar={isKanaFamiliar} fontSize={28} />
          <span style={{ fontSize: 22, verticalAlign: 'bottom', color: 'var(--ink-faint)' }}>」</span>
        </button>
      ) : (
        <button onClick={() => card.bannerJa && speak(card.bannerJa)} disabled={!card.bannerJa || !ttsSupported()}
          style={{ display: 'block', width: '100%', fontSize: big, fontWeight: 700, textAlign: 'center', margin: '4px 0', border: 'none', background: 'none', cursor: card.bannerJa ? 'pointer' : 'default', color: 'var(--ink)' }}>{card.banner}</button>
      )}

      {/* 2. (일본어 탭=듣기) 탭 안내 / 힌트 */}
      {card.bannerJa && !card.listen && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="listen" size={12} /> 탭하면 들려요</span>
          {hasHint && !reveal && <HintBtn open={hintOpen} onClick={() => setHintOpen((o) => !o)} />}
        </div>
      )}
      {card.listen && hasHint && !reveal && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4, flexWrap: 'wrap' }}>
          <HintBtn open={hintOpen} onClick={() => setHintOpen((o) => !o)} />
        </div>
      )}
      {/* 듣기 행이 없는 카드(예: 음성 없는 미션 스텝)도 힌트는 노출 */}
      {hasHint && !reveal && !card.bannerJa && !card.listen && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          <HintBtn open={hintOpen} onClick={() => setHintOpen((o) => !o)} />
        </div>
      )}
      {/* 힌트 ON → 문법 규칙(있으면) 또는 정답 표현의 설명. 답하면 닫히고 결과 피드백으로 대체. */}
      {hintOpen && !reveal && (hintGrammar ? <WrongTip g={hintGrammar} /> : hintFallback ? <HintExplain {...hintFallback} /> : null)}

      {/* 3. 한국어 (보조) — 질문/뜻. 듣기 카드는 위 타이틀로 대체. ko2ja(뜻→일본어)는 질문을 또렷이. */}
      {isMissionStep ? (
        <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: 14, margin: '8px 0 0' }}>{card.promptPhrase!.korean}</p>
      ) : card.listen ? null : card.sub ? (
        <p style={{ textAlign: 'center', color: isKo2Ja ? 'var(--ink)' : 'var(--ink-faint)', fontSize: isKo2Ja ? 15.5 : 14, fontWeight: isKo2Ja ? 800 : 400, margin: '8px 0 0' }}>{card.sub}</p>
      ) : null}

      {/* 반전 퀴즈 안내 — 어색한 답 고르기 */}
      {card.inverted && !reveal && (
        <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 12, border: '1px solid var(--warn)', background: 'var(--warn-soft)', textAlign: 'center' }}>
          <span style={{ fontWeight: 800, color: 'var(--warn)', fontSize: 14 }}>❌ 이 상황에 <u>어울리지 않는</u> 답을 고르세요</span>
        </div>
      )}

      {/* 4. 선택지 (행동) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 16 }}>
        {card.choices.map((c, idx) => {
          const isPicked = picked === idx;
          const state = !reveal ? 'idle' : c.correct ? 'correct' : isPicked ? 'wrong' : 'dim';
          const anim = state === 'correct' ? 'ym-correct' : state === 'wrong' ? 'ym-wrong' : '';
          return (
            <button key={idx} className={`${anim} ym-press`} disabled={reveal} onClick={() => onChoose(idx, c)} style={choiceStyle(state)}>
              <ChoiceText c={c} mode={choiceMode} kanaQuiz={isKanaQuiz} />
              {reveal && c.recovery && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--warn)' }}>복구</span>}
              {reveal && c.correct && <Icon name="check" size={18} style={{ color: 'var(--ok)' }} />}
            </button>
          );
        })}
      </div>

      {reveal && <ChoiceFeedback card={card} picked={picked!} cardIndex={index} onNext={onNext} />}
      {!reveal && (
        recoveryChoice
          ? <RecoverySkipAction choice={recoveryChoice} onClick={onKnown} />
          : <button onClick={onKnown} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-faint)', fontWeight: 600, marginTop: 14, width: '100%', textAlign: 'center' }}>이번 카드는 건너뛰기</button>
      )}
    </>
  );
}

function RecoverySkipAction({ choice, onClick }: { choice: Choice; onClick: () => void }) {
  const ja = choice.phrase ? (choice.phrase.kanji ?? choice.phrase.kana) : choice.ja;
  const ko = choice.phrase?.korean ?? choice.label;
  return (
    <button
      onClick={onClick}
      className="ym-press"
      style={{
        width: '100%',
        marginTop: 14,
        padding: 13,
        borderRadius: 14,
        border: '1px solid var(--warn)',
        background: 'var(--warn-soft)',
        color: 'var(--ink)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--warn)', fontSize: 12, fontWeight: 900 }}>
        <Icon name="recovery" size={15} /> 막혔을 때 대화 넘기기
      </span>
      {ja && <strong lang="ja" style={{ display: 'block', marginTop: 8, fontSize: 16, color: 'var(--ink)' }}>{ja}</strong>}
      <span style={{ display: 'block', marginTop: 2, fontSize: 13, color: 'var(--ink-soft)', fontWeight: 750 }}>{ko}</span>
    </button>
  );
}

// 힌트 버튼 — 듣기 안내 옆. 열리면 정답 표현의 문법 규칙을 보여준다.
function HintBtn({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button className="ym-press" onClick={onClick} aria-expanded={open}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 999, border: `1px solid ${open ? 'var(--accent)' : 'var(--glass-border)'}`, background: open ? 'var(--accent)' : 'var(--glass-bg-strong)', color: open ? 'var(--accent-ink)' : 'var(--ink)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
      <Icon name="tip" size={16} /> 힌트
    </button>
  );
}

function choiceStyle(state: 'idle' | 'correct' | 'wrong' | 'dim'): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    padding: '14px 16px', borderRadius: 14, fontSize: 16, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
    border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
  };
  if (state === 'correct') return { ...base, background: 'var(--ok-soft)', border: '1px solid var(--ok)', color: 'var(--ink)' };
  if (state === 'wrong') return { ...base, background: 'var(--accent-soft)', border: '1px solid var(--accent)' };
  if (state === 'dim') return { ...base, opacity: 0.55 };
  return base;
}

// 선택 후 피드백 — 정답 / 오답 / 복구
function ChoiceFeedback({ card, picked, cardIndex, onNext }: { card: Extract<Card, { kind: 'quiz' }>; picked: number; cardIndex: number; onNext: () => void }) {
  const inverted = !!card.inverted;
  const c = card.choices[picked];
  const isRecovery = !!c.recovery;
  // 반전: c.correct(타깃)=어색한 답을 고른 게 성공. 일반: c.correct=자연스러운 답이 성공.
  const isCorrect = !inverted && c.correct && !isRecovery;
  const isWrong = !inverted && !c.correct;
  const invSuccess = inverted && !!c.correct;  // 어색한 답(정답)을 골랐다
  const invFail = inverted && !c.correct;       // 자연스러운 답을 골랐다(실패)
  const event = isRecovery ? 'recovery' : (isCorrect || invSuccess) ? 'correct' : 'wrong';
  const correctRef = card.choices.find((x) => x.correct && !x.recovery && x.phrase);
  const target = inverted ? card.choices.find((x) => x.correct) : undefined; // 어색한 답(타깃)
  const ja = c.phrase ? (c.phrase.kanji ?? c.phrase.kana) : undefined;
  // 오답일 때 이 표현과 연결된 문법 팁을 즉시 노출(세션 끝 무작위 팁과 별개로 "맞는 순간" 학습)
  const wrongTip = isWrong ? relatedGrammar(card) : undefined;

  return (
    <div className="ym-reveal" style={{ marginTop: 14 }}>
      {isCorrect && (
        <div style={{ background: 'var(--ok-soft)', padding: 14, borderRadius: 14, marginBottom: 10 }}>
          <p style={{ margin: 0, color: 'var(--ok)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={18} /> 자연스러워요</p>
          {ja && <PhraseLine ja={ja} korean={c.phrase!.korean} />}
          {c.phrase?.tip && <FeedbackText>{c.phrase.tip}</FeedbackText>}
          {c.feedback && <FeedbackText>{c.feedback}</FeedbackText>}
        </div>
      )}
      {isRecovery && (
        <div style={{ background: 'var(--warn-soft)', padding: 14, borderRadius: 14, marginBottom: 10, border: '1px solid var(--warn)' }}>
          <p style={{ margin: 0, color: 'var(--warn)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="recovery" size={18} /> 복구 전략 — 실패가 아니에요</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>막혀도 이렇게 넘어가면 대화는 계속됩니다.</p>
          {ja && <PhraseLine ja={ja} korean={c.phrase!.korean} />}
          {c.feedback && <FeedbackText>{c.feedback}</FeedbackText>}
        </div>
      )}
      {isWrong && (
        <div style={{ background: 'var(--accent-soft)', padding: 14, borderRadius: 14, marginBottom: 10 }}>
          <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 700 }}>이 상황에선 어색해요</p>
          <FeedbackText>{c.feedback ?? '문맥과 맞지 않아 듣는 사람이 갸웃할 수 있어요.'}</FeedbackText>
          {correctRef && (
            <p style={{ margin: '8px 0 0', fontSize: 14 }}>
              자연스러운 답 → <strong>{correctRef.phrase!.kanji ?? correctRef.phrase!.kana}</strong>
              <span style={{ color: 'var(--ink-soft)' }}> — {correctRef.phrase!.korean}</span>
            </p>
          )}
          {wrongTip && <WrongTip g={wrongTip} />}
        </div>
      )}
      {invSuccess && (
        <div style={{ background: 'var(--ok-soft)', padding: 14, borderRadius: 14, marginBottom: 10 }}>
          <p style={{ margin: 0, color: 'var(--ok)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="check" size={18} /> 정답! 이 답이 어색해요</p>
          {ja && <PhraseLine ja={ja} korean={c.phrase!.korean} />}
          {c.feedback && <FeedbackText>{c.feedback}</FeedbackText>}
        </div>
      )}
      {invFail && (
        <div style={{ background: 'var(--accent-soft)', padding: 14, borderRadius: 14, marginBottom: 10 }}>
          <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 700 }}>이건 자연스러운 답이에요 — 어색한 답을 골라야 해요</p>
          {target?.phrase && (
            <p style={{ margin: '8px 0 0', fontSize: 14 }}>
              어색한 답 → <strong lang="ja">{target.phrase.kanji ?? target.phrase.kana}</strong>
              <span style={{ color: 'var(--ink-soft)' }}> — {target.phrase.korean}</span>
            </p>
          )}
          {target?.feedback && <FeedbackText>{target.feedback}</FeedbackText>}
        </div>
      )}
      {card.listen && card.bannerJa && (
        <p style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 12, fontSize: 16, color: 'var(--ink-soft)' }}>들린 표현: <strong style={{ color: 'var(--ink)' }}>{card.bannerJa}</strong></p>
      )}
      {mascotShows(event, cardIndex) && <MascotLine key={`${card.id}:${picked}`} copyKey={event} who="mung" style={{ marginBottom: 12 }} />}
      <PrimaryAction onClick={onNext} style={{ marginTop: 4 }}>다음</PrimaryAction>
    </div>
  );
}

// 정답 표현 → grammarRefs → 문법 팁. 오답 순간에 맞는 규칙을 즉시 보여주기 위함.
function relatedGrammar(card: Extract<Card, { kind: 'quiz' }>): GrammarPoint | undefined {
  const correct = card.choices.find((x) => x.correct && !x.recovery) ?? card.choices.find((x) => x.correct);
  const phraseId = correct?.phrase?.id
    ?? (card.reviewTarget?.type === 'phrase' ? String(card.reviewTarget.id) : undefined);
  if (!phraseId) return undefined;
  const p = CONTENT.phrases.find((x) => x.id === phraseId);
  const gid = p?.grammarRefs?.[0];
  if (!gid) return undefined;
  return CONTENT.grammar.find((g) => g.id === gid);
}

interface HintExplainProps { ja?: string; korean?: string; tip?: string; feedback?: string }

// 문법 규칙이 없을 때의 힌트 폴백 — 정답 표현의 설명(tip/feedback).
// tip은 CONTENT의 phrase에서 id로 조회(선택지에 안 실려도 잡힘). 설명이 없으면 힌트를 띄우지 않는다.
function buildHintFallback(card: Extract<Card, { kind: 'quiz' }>, c?: Choice): HintExplainProps | undefined {
  if (!c) return undefined;
  const phraseId = c.phrase?.id ?? (card.reviewTarget?.type === 'phrase' ? String(card.reviewTarget.id) : undefined);
  const p = phraseId ? CONTENT.phrases.find((x) => x.id === phraseId) : undefined;
  const tip = p?.tip ?? c.phrase?.tip;
  const feedback = c.feedback;
  if (!tip && !feedback) return undefined;
  const ja = c.phrase ? (c.phrase.kanji ?? c.phrase.kana) : (p ? (p.kanji ?? p.kana) : c.ja);
  const korean = c.phrase?.korean ?? p?.korean;
  return { ja, korean, tip, feedback };
}

function HintExplain({ ja, korean, tip, feedback }: HintExplainProps) {
  return (
    <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--glass-border)' }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.03em', display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon name="tip" size={14} /> 힌트
      </p>
      {tip && <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-soft)' }}>{tip}</p>}
      {feedback && feedback !== tip && <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-soft)' }}>{feedback}</p>}
      {ja && (
        <p style={{ margin: '8px 0 0', fontSize: 14 }}>
          <strong lang="ja">{ja}</strong>{korean ? <span style={{ color: 'var(--ink-soft)' }}> — {korean}</span> : null}
        </p>
      )}
    </div>
  );
}

// 오답 시 즉시 노출되는 관련 팁 — 규칙 한 줄 + 예문 듣기. (전체 팁 카드보다 가벼움)
function WrongTip({ g }: { g: GrammarPoint }) {
  return (
    <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--glass-border)' }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.03em', display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icon name="tip" size={14} /> 관련 팁 · {g.label}
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-soft)' }}>{g.tipKo}</p>
      {g.exampleJa && (
        <button className="ym-press" onClick={() => speak(g.exampleJa!)} disabled={!ttsSupported()}
          style={{ marginTop: 8, width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="listen" size={15} style={{ flex: '0 0 15px', color: 'var(--accent)' }} />
          <span style={{ fontSize: 14 }}><strong lang="ja">{g.exampleJa}</strong>{g.exampleKo ? <span style={{ color: 'var(--ink-soft)' }}> — {g.exampleKo}</span> : null}</span>
        </button>
      )}
    </div>
  );
}

function PhraseLine({ ja, korean }: { ja: string; korean: string }) {
  return (
    <p style={{ margin: '8px 0 0', fontSize: 18 }}>
      <strong>{ja}</strong>
      <span style={{ color: 'var(--ink-soft)', fontSize: 15 }}> — {korean}</span>
    </p>
  );
}

function FeedbackText({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
      <Icon name="tip" size={15} style={{ marginTop: 2, flex: '0 0 15px' }} />
      <span>{children}</span>
    </p>
  );
}
