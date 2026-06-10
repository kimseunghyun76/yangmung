// 세션 — Immersive Scene Coach v1. 상단 장면 헤더 + 하단 글래스 학습 시트.
// 시각 위계: 일본어 > 듣기 > 행동(선택/말하기) > 한국어. (UI_REDESIGN_PROPOSAL.md §4-2)
import type { Card, Choice } from '../learn/cards';
import type { CardStatus } from '../learn/progress';
import type { GrammarPoint } from '../content/types';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { IntroduceCardView } from './IntroduceCard';
import { OrderCardView, type PickMap } from './OrderCard';
import { SpeakCardView } from './SpeakCard';
import { DictationCardView } from './DictationCard';
import { DiscoverCardView } from './DiscoverCard';
import { ReadingAid } from './ReadingAid';
import { sceneVisualByMission } from './scene';
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
  onExit: () => void;
  onKnown: () => void;
  picks: PickMap;
}

export function Session({ card, index, total, picked, onChoose, onIntroduceSeen, onSpeakPracticed, onDictationResult, isKanaFamiliar, onNext, onExit, onKnown, picks }: Props) {
  const sv = card.kind !== 'tip' && card.kind !== 'discover' && card.reviewTarget?.type === 'mission'
    ? sceneVisualByMission(String(card.reviewTarget.id)) : null;
  const accent = sv?.accent ?? '#b9382e';
  const isMissionStep = card.kind === 'quiz' && !!card.promptPhrase;
  const speaker = isMissionStep ? card.sub : '';
  const scenario = 'scenario' in card ? card.scenario : undefined;
  // 장면 진입 모션 키 — 같은 장면(미션) 안에서는 유지, 새 장면으로 바뀔 때만 재생.
  const sceneKey = sv && 'reviewTarget' in card && card.reviewTarget ? `sc-${String(card.reviewTarget.id)}` : 'plain';

  const exit = () => { if (index === 0 || confirm('세션을 끝내고 홈으로 갈까요? (지금까지 푼 카드는 저장돼요)')) onExit(); };

  return (
    <main style={{ ...WRAP, minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: 0 }}>
      {/* ── 상단: 장면 헤더 (배경, 주인공 아님) ── */}
      <div key={sceneKey} className="ym-scene-bg" style={{
        position: 'relative', overflow: 'hidden', paddingTop: 'max(16px, env(safe-area-inset-top))',
        background: sv ? `linear-gradient(165deg, ${hexA(accent, 0.18)}, ${hexA(accent, 0.34)})` : 'var(--surface-2)',
      }}>
        {(sv?.backdrop ?? sv?.hero) && <img src={sv?.backdrop ?? sv?.hero} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: sv?.backdrop ? 0.9 : 0.92, filter: 'saturate(.82) contrast(.96) brightness(1.08)' }} />}
        {sv && <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.5))' }} />}
        <div style={{ position: 'relative', padding: '0 16px 16px', color: sv ? '#fff' : 'var(--ink)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 40 }}>
            <button onClick={exit} aria-label="나가기" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'inherit', display: 'flex', alignItems: 'center', gap: 4, padding: 4 }}>
              <Icon name="back" size={18} /> 나가기
            </button>
            <Dots i={index} total={total} onScene={!!sv} />
          </div>
          <div style={{ minHeight: sv ? 56 : 8, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            {sv && (scenario || speaker) && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {scenario && <span style={{ padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: hexA(accent, 0.9), color: '#fff' }}>{scenario}</span>}
                {speaker && <span style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.22)', color: '#fff', backdropFilter: 'blur(6px)' }}>{speaker}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 하단: 글래스 학습 시트 (flex로 끝까지 채우고, 길면 내부 스크롤) ── */}
      <GlassPanel style={{
        flex: 1, minHeight: 0, overflowY: 'auto', marginTop: -20, borderRadius: '24px 24px 0 0', borderBottom: 'none',
        padding: '20px max(20px, env(safe-area-inset-left)) max(24px, calc(env(safe-area-inset-bottom) + 16px))',
      }}>
        <div key={sceneKey} className="ym-sheet-up" style={{ maxWidth: 540, margin: '0 auto' }}>
          {card.kind === 'tip' ? (
            <TipBody card={card} onNext={onNext} />
          ) : card.kind === 'introduce' ? (
            <IntroduceCardView key={card.id} card={card} isKanaFamiliar={isKanaFamiliar} onSeen={onIntroduceSeen} onNext={onNext} />
          ) : card.kind === 'order' ? (
            <OrderCardView key={card.id} card={card} picks={picks} isKanaFamiliar={isKanaFamiliar} onNext={onNext} />
          ) : card.kind === 'speak' ? (
            <SpeakCardView key={card.id} card={card} isKanaFamiliar={isKanaFamiliar} onPracticed={onSpeakPracticed} onNext={onNext} />
          ) : card.kind === 'dictation' ? (
            <DictationCardView key={card.id} card={card} onResult={onDictationResult} onNext={onNext} />
          ) : card.kind === 'discover' ? (
            <DiscoverCardView key={card.id} card={card} onNext={onNext} />
          ) : (
            <QuizBody card={card} index={index} picked={picked} isMissionStep={isMissionStep} isKanaFamiliar={isKanaFamiliar} onChoose={onChoose} onNext={onNext} onKnown={onKnown} />
          )}
        </div>
      </GlassPanel>
    </main>
  );
}

function TipBody({ card, onNext }: { card: Extract<Card, { kind: 'tip' }>; onNext: () => void }) {
  const detail = CONTENT.grammar.find((g) => `tip:${g.id}` === card.id);
  return (
    <>
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
              <MascotLine key={`${card.id}:tip`} copyKey="tip" style={{ marginTop: 14 }} />
              <PrimaryAction onClick={onNext} style={{ marginTop: 16 }}>다음</PrimaryAction>
    </>
  );
}

function TipDetail({ label, text, tone }: { label: string; text: string; tone: string }) {
  return <div style={{ marginTop: 10, padding: '11px 13px', borderRadius: 13, borderLeft: `3px solid ${tone}`, background: 'var(--surface-2)' }}><strong style={{ display: 'block', fontSize: 12, color: tone }}>{label}</strong><span style={{ display: 'block', marginTop: 3, fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-soft)' }}>{text}</span></div>;
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
        </div>
      ) : isMissionStep ? (
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 22, verticalAlign: 'bottom', color: 'var(--ink-faint)' }}>「</span>
          <ReadingAid text={card.promptPhrase!.kana} isFamiliar={isKanaFamiliar} fontSize={28} />
          <span style={{ fontSize: 22, verticalAlign: 'bottom', color: 'var(--ink-faint)' }}>」</span>
        </div>
      ) : (
        <div style={{ fontSize: big, fontWeight: 700, textAlign: 'center', margin: '4px 0' }}>{card.banner}</div>
      )}

      {/* 2. 듣기 / 천천히 (1급 액션) */}
      {card.bannerJa && !card.listen && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 6 }}>
          <ListenBtn onClick={() => speak(card.bannerJa!)}><Icon name="listen" size={17} /> 듣기</ListenBtn>
          <ListenBtn onClick={() => speak(card.bannerJa!, { rate: 0.6 })}>천천히</ListenBtn>
        </div>
      )}
      {card.listen && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <ListenBtn onClick={() => speak(card.bannerJa!, { rate: 0.6 })}>천천히 다시</ListenBtn>
        </div>
      )}

      {/* 3. 한국어 (보조) — 질문/뜻 */}
      {isMissionStep
        ? <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: 14, margin: '8px 0 0' }}>{card.promptPhrase!.korean}</p>
        : card.sub ? <p style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: 14, margin: '8px 0 0' }}>{card.sub}</p> : null}

      {/* 4. 선택지 (행동) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 16 }}>
        {card.choices.map((c, idx) => {
          const isPicked = picked === idx;
          const state = !reveal ? 'idle' : c.correct ? 'correct' : isPicked ? 'wrong' : 'dim';
          const anim = state === 'correct' ? 'ym-correct' : state === 'wrong' ? 'ym-wrong' : '';
          return (
            <button key={idx} className={`${anim} ym-press`} disabled={reveal} onClick={() => onChoose(idx, c)} style={choiceStyle(state)}>
              <span>{c.label}</span>
              {reveal && c.recovery && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--warn)' }}>복구</span>}
              {reveal && c.correct && <Icon name="check" size={18} style={{ color: 'var(--ok)' }} />}
            </button>
          );
        })}
      </div>

      {reveal && <ChoiceFeedback card={card} picked={picked!} cardIndex={index} onNext={onNext} />}
      {!reveal && (
        <button onClick={onKnown} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-faint)', fontWeight: 600, marginTop: 14, width: '100%', textAlign: 'center' }}>이미 알아요 (건너뛰기)</button>
      )}
    </>
  );
}

function ListenBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="ym-press" onClick={onClick} disabled={!ttsSupported()}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
      {children}
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
  const c = card.choices[picked];
  const isRecovery = !!c.recovery;
  const isCorrect = c.correct && !isRecovery;
  const isWrong = !c.correct;
  const event = isRecovery ? 'recovery' : isCorrect ? 'correct' : 'wrong';
  const correctRef = card.choices.find((x) => x.correct && !x.recovery && x.phrase);
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
