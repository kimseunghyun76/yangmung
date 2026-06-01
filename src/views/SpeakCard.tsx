// 따라 말하기 카드 v1 — 음성 인식 없이 "입으로 꺼내기" 연습. 채점 X.
import { useState } from 'react';
import type { SpeakCard } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { BTN, PRIMARY } from '../ui/styles';
import { ReadingAid } from './ReadingAid';
import { Icon } from '../ui/Icon';

interface Props {
  card: SpeakCard;
  isKanaFamiliar: (char: string) => boolean;
  onPracticed: () => void;
  onNext: () => void;
}

export function SpeakCardView({ card, isKanaFamiliar, onPracticed, onNext }: Props) {
  const [spoke, setSpoke] = useState(false);

  function markSpoke() {
    if (spoke) return;
    setSpoke(true);
    onPracticed();
  }

  return (
    <div>
      <h2 style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="speak" size={22} /> 따라 말하기</h2>
      <div style={{ textAlign: 'center', margin: '18px 0 4px' }}>
        <ReadingAid text={card.kana} isFamiliar={isKanaFamiliar} fontSize={30} />
      </div>
      <p style={{ textAlign: 'center', color: 'var(--ink-soft)', marginTop: 4 }}>{card.korean}</p>

      <div style={{ textAlign: 'center', marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          style={{ ...BTN, padding: '10px 22px', fontSize: 18, background: 'var(--accent-soft)' }}
          onClick={() => speak(card.ja)} disabled={!ttsSupported()}
        ><Icon name="listen" size={17} /> 듣기</button>
        <button
          style={{ ...BTN, padding: '10px 18px', fontSize: 14 }}
          onClick={() => speak(card.ja, { rate: 0.6 })} disabled={!ttsSupported()}
        >천천히</button>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: 14, marginTop: 16 }}>
        소리 내어 따라 말해보세요{ttsSupported() ? ' (듣고 → 따라서)' : ''}
      </p>

      {!spoke ? (
        <button style={{ ...PRIMARY, marginTop: 8, width: '100%' }} onClick={markSpoke}>말했어요</button>
      ) : (
        <div style={{ marginTop: 12 }}>
          <p style={{ background: 'var(--ok-soft)', padding: 12, borderRadius: 8, color: 'var(--ok)', fontWeight: 600, margin: 0 }}>👍 좋아요! 입으로 꺼내는 게 진짜 실력이에요</p>
          {card.tip && <p style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8, fontSize: 14, color: 'var(--ink-soft)', marginTop: 8 }}><Icon name="tip" size={15} style={{ marginRight: 6 }} />{card.tip}</p>}
          <button style={{ ...PRIMARY, marginTop: 8, width: '100%' }} onClick={onNext}>다음</button>
        </div>
      )}
    </div>
  );
}
