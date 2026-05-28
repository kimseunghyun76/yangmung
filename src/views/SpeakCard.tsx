// 따라 말하기 카드 v1 — 음성 인식 없이 "입으로 꺼내기" 연습. 채점 X.
import { useState } from 'react';
import type { SpeakCard } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { BTN, PRIMARY } from '../ui/styles';

interface Props {
  card: SpeakCard;
  onPracticed: () => void;
  onNext: () => void;
}

export function SpeakCardView({ card, onPracticed, onNext }: Props) {
  const [spoke, setSpoke] = useState(false);

  function markSpoke() {
    if (spoke) return;
    setSpoke(true);
    onPracticed();
  }

  return (
    <div>
      <h2 style={{ marginTop: 14 }}>🗣 따라 말하기</h2>
      <div style={{ fontSize: 30, textAlign: 'center', margin: '18px 0 4px', fontWeight: 600 }}>{card.ja}</div>
      <p style={{ textAlign: 'center', color: '#888', margin: 0 }}>{card.kana}</p>
      <p style={{ textAlign: 'center', color: '#555', marginTop: 4 }}>{card.korean}</p>

      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <button
          style={{ ...BTN, padding: '10px 22px', fontSize: 18, background: '#eef2ff' }}
          onClick={() => speak(card.ja)} disabled={!ttsSupported()}
        >🔊 듣기</button>
      </div>

      <p style={{ textAlign: 'center', color: '#777', fontSize: 14, marginTop: 16 }}>
        🗣 소리 내어 따라 말해보세요{ttsSupported() ? ' (듣고 → 따라서)' : ''}
      </p>

      {!spoke ? (
        <button style={{ ...PRIMARY, marginTop: 8, width: '100%' }} onClick={markSpoke}>말했어요</button>
      ) : (
        <div style={{ marginTop: 12 }}>
          <p style={{ background: '#dcfce7', padding: 12, borderRadius: 8, color: '#16a34a', fontWeight: 600, margin: 0 }}>👍 좋아요! 입으로 꺼내는 게 진짜 실력이에요</p>
          {card.tip && <p style={{ background: '#f5f5fb', padding: 12, borderRadius: 8, fontSize: 14, color: '#444', marginTop: 8 }}>💡 {card.tip}</p>}
          <button style={{ ...PRIMARY, marginTop: 8, width: '100%' }} onClick={onNext}>다음</button>
        </div>
      )}
    </div>
  );
}
