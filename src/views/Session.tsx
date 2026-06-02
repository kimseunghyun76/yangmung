// 세션 화면 — 카드 1장 출제 + 선택 후 학습 피드백.
import type { Card, Choice } from '../learn/cards';
import type { CardStatus } from '../learn/progress';
import { speak, ttsSupported } from '../tts';
import { BTN, PRIMARY, WRAP } from '../ui/styles';
import { IntroduceCardView } from './IntroduceCard';
import { OrderCardView } from './OrderCard';
import { SpeakCardView } from './SpeakCard';
import { DictationCardView } from './DictationCard';
import { DiscoverCardView } from './DiscoverCard';
import { ReadingAid } from './ReadingAid';
import { sceneVisualByMission } from './scene';
import { Icon } from '../ui/Icon';

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
}

const badgeStyle: React.CSSProperties = { display: 'inline-block', padding: '3px 9px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginLeft: 8 };

export function Session({ card, index, total, picked, cardStatus, onChoose, onIntroduceSeen, onSpeakPracticed, onDictationResult, isKanaFamiliar, onNext, onExit, onKnown }: Props) {
  const badge =
    cardStatus === 'due' ? <span style={{ ...badgeStyle, background: 'var(--accent-soft)', color: 'var(--accent)' }}>복습</span> :
    cardStatus === 'new' ? <span style={{ ...badgeStyle, background: 'var(--surface-2)', color: 'var(--ink-soft)' }}>신규</span> :
    null;

  // 장면 색 테마 — 미션 카드면 장소 색/마크로 (세션이 장면마다 다르게 보이게)
  const sv = card.kind !== 'tip' && card.kind !== 'discover' && card.reviewTarget?.type === 'mission'
    ? sceneVisualByMission(String(card.reviewTarget.id)) : null;

  return (
    <main style={{ ...WRAP, minHeight: '100vh' }}>
      <button
        onClick={() => { if (index === 0 || confirm('세션을 끝내고 홈으로 갈까요? (지금까지 푼 카드는 저장돼요)')) onExit(); }}
        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--ink-faint)', padding: '4px 0', marginBottom: 4 }}
      >← 나가기</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>
        <span>{card.tag}{badge}</span>
        <span>{index + 1} / {total}</span>
      </div>
      {card.kind !== 'tip' && card.kind !== 'discover' && card.scenario && (
        <div style={{ display: 'inline-block', marginTop: 4, padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: '#fff', background: sv ? sv.accent : 'var(--accent)' }}>
          {card.scenario}
        </div>
      )}

      {card.kind === 'tip' ? (
        <>
          <h2 style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="tip" size={22} /> {card.label}</h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, background: 'var(--surface-2)', padding: 16, borderRadius: 10 }}>{card.tipKo}</p>
          <button style={{ ...PRIMARY, marginTop: 16 }} onClick={onNext}>다음</button>
        </>
      ) : card.kind === 'introduce' ? (
        <IntroduceCardView key={card.id} card={card} isKanaFamiliar={isKanaFamiliar} onSeen={onIntroduceSeen} onNext={onNext} />
      ) : card.kind === 'order' ? (
        <OrderCardView key={card.id} card={card} onNext={onNext} />
      ) : card.kind === 'speak' ? (
        <SpeakCardView key={card.id} card={card} isKanaFamiliar={isKanaFamiliar} onPracticed={onSpeakPracticed} onNext={onNext} />
      ) : card.kind === 'dictation' ? (
        <DictationCardView key={card.id} card={card} onResult={onDictationResult} onNext={onNext} />
      ) : card.kind === 'discover' ? (
        <DiscoverCardView key={card.id} card={card} onNext={onNext} />
      ) : (
        <>
          {card.listen ? (
            <div style={{ textAlign: 'center', margin: '20px 0 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 48 }}>{card.banner}</div>
              <span className="ym-wave" aria-hidden><i /><i /><i /><i /><i /></span>
            </div>
          ) : (
            <div style={{ fontSize: card.tag.startsWith('K') ? 72 : 28, textAlign: 'center', margin: '20px 0 6px' }}>{card.banner}</div>
          )}
          {card.bannerJa && (
            <div style={{ textAlign: 'center', marginBottom: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                style={{ ...BTN, padding: card.listen ? '10px 22px' : '6px 12px', fontSize: card.listen ? 18 : undefined, background: card.listen ? 'var(--accent-soft)' : undefined }}
                onClick={() => speak(card.bannerJa!)} disabled={!ttsSupported()}
              ><Icon name="listen" size={17} /> 듣기</button>
              <button
                style={{ ...BTN, padding: card.listen ? '10px 18px' : '6px 12px', fontSize: 14 }}
                onClick={() => speak(card.bannerJa!, { rate: 0.6 })} disabled={!ttsSupported()}
              >천천히</button>
            </div>
          )}
          {card.promptPhrase ? (
            <div style={{ marginBottom: 4 }}>
              {card.sub && <p style={{ color: 'var(--ink-faint)', fontSize: 13, margin: '0 0 4px' }}>{card.sub}</p>}
              <div style={{ textAlign: 'center', color: 'var(--ink)' }}>
                <span style={{ fontSize: 22, verticalAlign: 'bottom' }}>「</span>
                <ReadingAid text={card.promptPhrase.kana} isFamiliar={isKanaFamiliar} fontSize={24} />
                <span style={{ fontSize: 22, verticalAlign: 'bottom' }}>」</span>
              </div>
              <p style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: 14, margin: '4px 0 0' }}>{card.promptPhrase.korean}</p>
            </div>
          ) : (
            <p style={{ color: 'var(--ink-soft)' }}>{card.sub}</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {card.choices.map((c, idx) => {
              const isPicked = picked === idx;
              const reveal = picked !== null;
              const bg = !reveal ? 'var(--surface)' : c.correct ? 'var(--ok-soft)' : isPicked ? 'var(--accent-soft)' : 'var(--surface)';
              // 정답 펄스 / 오답(내가 고른 것) 흔들림
              const anim = !reveal ? '' : c.correct ? 'ym-correct' : isPicked ? 'ym-wrong' : '';
              return (
                <button key={idx} className={anim} style={{ ...BTN, background: bg }} onClick={() => onChoose(idx, c)} disabled={reveal}>
                  {c.label}{reveal && c.recovery ? ' 복구' : ''}{reveal && c.correct ? ' ✓' : ''}
                </button>
              );
            })}
          </div>
          {picked !== null && <ChoiceFeedback card={card} picked={picked} onNext={onNext} />}
          {picked === null && (
            <button
              onClick={onKnown}
              style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-faint)', marginTop: 14, width: '100%', textAlign: 'center' }}
            >✓ 이미 알아요 (건너뛰기)</button>
          )}
        </>
      )}
    </main>
  );
}

// 선택 후 피드백 — 정답 / 오답 / 복구 3종 분리, 일본어·뜻·팁 노출.
function ChoiceFeedback({ card, picked, onNext }: { card: Extract<Card, { kind: 'quiz' }>; picked: number; onNext: () => void }) {
  const c = card.choices[picked];
  const isRecovery = !!c.recovery;
  const isCorrect = c.correct && !isRecovery;
  const isWrong = !c.correct;
  const correctRef = card.choices.find((x) => x.correct && !x.recovery && x.phrase);
  const ja = c.phrase ? (c.phrase.kanji ?? c.phrase.kana) : undefined;

  return (
    <div className="ym-reveal" style={{ marginTop: 14 }}>
      {isCorrect && (
        <div style={{ background: 'var(--ok-soft)', padding: 12, borderRadius: 8, marginBottom: 8 }}>
          <p style={{ margin: 0, color: 'var(--ok)', fontWeight: 600 }}>✓ 정답 — 이 상황에서 자연스러워요</p>
          {ja && <PhraseLine ja={ja} korean={c.phrase!.korean} />}
          {c.phrase?.tip && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)', display: 'flex', alignItems: 'flex-start', gap: 6 }}><Icon name="tip" size={15} style={{ marginTop: 2 }} /> <span>{c.phrase.tip}</span></p>}
          {c.feedback && <FeedbackText>{c.feedback}</FeedbackText>}
        </div>
      )}
      {isRecovery && (
        <div style={{ background: 'var(--warn-soft)', padding: 12, borderRadius: 8, marginBottom: 8, border: '1px solid var(--warn)' }}>
          <p style={{ margin: 0, color: 'var(--warn)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="recovery" size={18} /> 복구 전략 사용 — 실패가 아니에요</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>별점은 낮아지지만 미션은 계속 이어집니다.</p>
          {ja && <PhraseLine ja={ja} korean={c.phrase!.korean} />}
          {c.feedback && <FeedbackText>{c.feedback}</FeedbackText>}
        </div>
      )}
      {isWrong && (
        <div style={{ background: 'var(--accent-soft)', padding: 12, borderRadius: 8, marginBottom: 8 }}>
          <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 600 }}>✗ 이 상황에서는 어색해요</p>
          <FeedbackText>{c.feedback ?? '문맥과 맞지 않아 듣는 사람이 갸웃할 수 있어요.'}</FeedbackText>
          {correctRef && (
            <p style={{ margin: '8px 0 0', fontSize: 14 }}>
              자연스러운 답 → <strong>{correctRef.phrase!.kanji ?? correctRef.phrase!.kana}</strong>
              <span style={{ color: 'var(--ink-soft)' }}> — {correctRef.phrase!.korean}</span>
            </p>
          )}
        </div>
      )}
      {card.listen && card.bannerJa && (
        <p style={{ background: 'var(--warn-soft)', padding: 12, borderRadius: 8, fontSize: 16, color: 'var(--ink-soft)' }}>들린 표현: <strong>{card.bannerJa}</strong></p>
      )}
      <button style={PRIMARY} onClick={onNext}>다음</button>
    </div>
  );
}

function PhraseLine({ ja, korean }: { ja: string; korean: string }) {
  return (
    <p style={{ margin: '6px 0 0', fontSize: 17 }}>
      <strong>{ja}</strong>
      <span style={{ color: 'var(--ink-soft)' }}> — {korean}</span>
    </p>
  );
}

function FeedbackText({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
      <Icon name="tip" size={15} style={{ marginTop: 2 }} />
      <span>{children}</span>
    </p>
  );
}
