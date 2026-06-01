// 받아쓰기 카드 — 듣고 가나 타일을 순서대로 골라 문장 완성. 듣기+쓰기 입문.
// (진입 자동재생은 App에서 일원화)
import { useState } from 'react';
import type { DictationCard } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { BTN, PRIMARY } from '../ui/styles';

interface Props {
  card: DictationCard;
  onResult: (correct: boolean) => void;
  onNext: () => void;
}

export function DictationCardView({ card, onResult, onNext }: Props) {
  const [built, setBuilt] = useState<number[]>([]); // 고른 타일 인덱스 순서
  const [checked, setChecked] = useState<null | boolean>(null);

  const usable = card.tiles.map((_, i) => !built.includes(i));
  const builtText = built.map((i) => card.tiles[i]);

  function tap(i: number) {
    if (checked !== null || !usable[i]) return;
    setBuilt((b) => [...b, i]);
  }
  function undo() {
    if (checked !== null) return;
    setBuilt((b) => b.slice(0, -1));
  }
  function check() {
    const correct = builtText.length === card.answer.length && builtText.every((t, i) => t === card.answer[i]);
    setChecked(correct);
    onResult(correct);
  }

  return (
    <div>
      <h2 style={{ marginTop: 14 }}>✏️ 받아쓰기</h2>
      <p style={{ color: 'var(--ink-soft)', margin: '4px 0 0' }}>🔊 듣고, 가나를 순서대로 골라 문장을 만들어요</p>

      <div style={{ textAlign: 'center', marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button style={{ ...BTN, padding: '10px 22px', fontSize: 18, background: 'var(--accent-soft)' }} onClick={() => speak(card.ja)} disabled={!ttsSupported()}>🔊 듣기</button>
        <button style={{ ...BTN, padding: '10px 18px', fontSize: 14 }} onClick={() => speak(card.ja, { rate: 0.6 })} disabled={!ttsSupported()}>🐢 천천히</button>
      </div>

      {/* 만든 문장 */}
      <div style={{ minHeight: 52, margin: '16px 0 8px', padding: 10, border: '2px dashed #d0d0d8', borderRadius: 10, textAlign: 'center', fontSize: 28, letterSpacing: 2 }}>
        {builtText.length ? builtText.join('') : <span style={{ color: 'var(--ink-faint)', fontSize: 15, letterSpacing: 0 }}>여기에 글자가 쌓여요</span>}
      </div>

      {/* 타일 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {card.tiles.map((t, i) => (
          <button
            key={i}
            onClick={() => tap(i)}
            disabled={!usable[i] || checked !== null}
            style={{ ...BTN, fontSize: 24, padding: '8px 16px', opacity: usable[i] ? 1 : 0.3 }}
          >{t}</button>
        ))}
      </div>

      {checked === null ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button style={{ ...BTN, flex: 1, textAlign: 'center' }} onClick={undo} disabled={built.length === 0}>⌫ 지우기</button>
          <button style={{ ...PRIMARY, flex: 2 }} onClick={check} disabled={built.length === 0}>확인</button>
        </div>
      ) : (
        <div className="ym-reveal" style={{ marginTop: 16 }}>
          {checked ? (
            <p style={{ background: 'var(--ok-soft)', padding: 12, borderRadius: 8, color: 'var(--ok)', fontWeight: 600, margin: 0 }}>✓ 정답! {card.answer.join('')} — {card.korean}</p>
          ) : (
            <p style={{ background: 'var(--accent-soft)', padding: 12, borderRadius: 8, color: 'var(--accent)', margin: 0 }}>
              아쉬워요. 정답은 <strong>{card.answer.join('')}</strong> — {card.korean}
            </p>
          )}
          <button style={{ ...PRIMARY, marginTop: 10, width: '100%' }} onClick={onNext}>다음</button>
        </div>
      )}
    </div>
  );
}
