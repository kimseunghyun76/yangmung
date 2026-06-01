// 새 표현 소개 카드 — 퀴즈 전에 의미·소리·쪼개보기를 먼저 제공.
import type { IntroduceCard } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { BTN, PRIMARY } from '../ui/styles';
import { ReadingAid } from './ReadingAid';

interface Props {
  card: IntroduceCard;
  isKanaFamiliar: (char: string) => boolean;
  onSeen: () => void;
  onNext: () => void;
}

export function IntroduceCardView({ card, isKanaFamiliar, onSeen, onNext }: Props) {
  function next() {
    onSeen();
    onNext();
  }

  return (
    <div>
      <h2 style={{ marginTop: 14, marginBottom: 6 }}>👀 새 표현</h2>
      <p style={{ color: 'var(--ink-soft)', marginTop: 0, lineHeight: 1.5 }}>{card.note}</p>

      <div style={{ background: 'var(--accent-soft)', padding: 16, borderRadius: 10, marginTop: 14, textAlign: 'center' }}>
        <ReadingAid text={card.kana} isFamiliar={isKanaFamiliar} fontSize={30} />
        <p style={{ margin: '8px 0 0', color: 'var(--ink-soft)' }}>{card.korean}</p>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--ink-faint)' }}>빨간 로마자는 아직 익숙하지 않은 글자예요 — 익히면 사라져요</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          style={{ ...BTN, padding: '10px 22px', fontSize: 18, background: 'var(--surface)' }}
          onClick={() => speak(card.ja)}
          disabled={!ttsSupported()}
        >
          🔊 듣기
        </button>
        <button
          style={{ ...BTN, padding: '10px 18px', fontSize: 14, background: 'var(--surface)' }}
          onClick={() => speak(card.ja, { rate: 0.6 })}
          disabled={!ttsSupported()}
        >
          🐢 천천히
        </button>
      </div>

      {card.tip && (
        <p style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8, color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5 }}>
          💡 {card.tip}
        </p>
      )}

      <button style={{ ...PRIMARY, width: '100%', marginTop: 14 }} onClick={next}>알겠어요</button>
    </div>
  );
}
