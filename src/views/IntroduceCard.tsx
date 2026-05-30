// 새 표현 소개 카드 — 퀴즈 전에 의미·소리·쪼개보기를 먼저 제공.
import type { IntroduceCard } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { BTN, PRIMARY } from '../ui/styles';

interface Props {
  card: IntroduceCard;
  onSeen: () => void;
  onNext: () => void;
}

export function IntroduceCardView({ card, onSeen, onNext }: Props) {
  function next() {
    onSeen();
    onNext();
  }

  return (
    <div>
      <h2 style={{ marginTop: 14, marginBottom: 6 }}>👀 새 표현</h2>
      <p style={{ color: '#555', marginTop: 0, lineHeight: 1.5 }}>{card.note}</p>

      <div style={{ background: '#eef2ff', padding: 16, borderRadius: 10, marginTop: 14 }}>
        <div style={{ fontSize: 28, fontWeight: 700, textAlign: 'center' }}>{card.ja}</div>
        <p style={{ margin: '8px 0 0', textAlign: 'center', color: '#555', fontSize: 18 }}>{card.kana}</p>
        <p style={{ margin: '6px 0 0', textAlign: 'center', color: '#444' }}>{card.korean}</p>
      </div>

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button
          style={{ ...BTN, padding: '10px 22px', fontSize: 18, background: '#fff' }}
          onClick={() => speak(card.ja)}
          disabled={!ttsSupported()}
        >
          🔊 듣기
        </button>
      </div>

      {card.tip && (
        <p style={{ background: '#f5f5fb', padding: 12, borderRadius: 8, color: '#555', fontSize: 14, lineHeight: 1.5 }}>
          💡 {card.tip}
        </p>
      )}

      <button style={{ ...PRIMARY, width: '100%', marginTop: 14 }} onClick={next}>알겠어요</button>
    </div>
  );
}
