// 받아쓰기 카드 v2 — 듣고 가나 타일을 슬롯에 채워 문장 완성.
// 개선: 글자 슬롯(진행감) + 글자별 정/오답 피드백 + 슬롯 탭으로 정정. (진입 자동재생은 App에서 일원화)
import { useState } from 'react';
import type { DictationCard } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { BTN, PRIMARY } from '../ui/styles';
import { Icon } from '../ui/Icon';

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
  const slotCount = Math.max(card.answer.length, built.length);

  function tap(i: number) {
    if (checked !== null || !usable[i]) return;
    setBuilt((b) => [...b, i]);
  }
  function removeAt(slot: number) {
    if (checked !== null || slot >= built.length) return;
    setBuilt((b) => [...b.slice(0, slot), ...b.slice(slot + 1)]);
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
      <h2 style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="dictation" size={22} /> 받아쓰기</h2>
      <p style={{ color: 'var(--ink-soft)', margin: '4px 0 0' }}>듣고, 가나를 순서대로 골라 문장을 만들어요</p>

      <div style={{ textAlign: 'center', marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button style={{ ...BTN, padding: '10px 22px', fontSize: 18, background: 'var(--accent-soft)' }} onClick={() => speak(card.ja)} disabled={!ttsSupported()}><Icon name="listen" size={17} /> 듣기</button>
        <button style={{ ...BTN, padding: '10px 18px', fontSize: 14 }} onClick={() => speak(card.ja, { rate: 0.6 })} disabled={!ttsSupported()}>천천히</button>
      </div>

      {/* 글자 슬롯 — 채워질 자리 + 진행감. 채운 글자는 탭해서 빼기. 채점 후 글자별 정/오답 색. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', margin: '18px 0 6px', minHeight: 52 }}>
        {Array.from({ length: slotCount }, (_, i) => {
          const ch = builtText[i];
          const caret = checked === null && i === built.length && i < card.answer.length;
          let border = 'var(--glass-border)';
          let bg = ch !== undefined ? 'var(--glass-bg-strong)' : 'transparent';
          let color = 'var(--ink)';
          if (checked !== null && ch !== undefined) {
            const ok = ch === card.answer[i];
            border = ok ? 'var(--ok)' : 'var(--accent)';
            bg = ok ? 'var(--ok-soft)' : 'var(--accent-soft)';
            color = ok ? 'var(--ink)' : 'var(--accent)';
          }
          return (
            <button key={i} onClick={() => removeAt(i)} disabled={checked !== null || ch === undefined}
              style={{
                width: 44, height: 52, borderRadius: 12, fontSize: 26, fontWeight: 700, color,
                border: `1.5px ${ch === undefined ? 'dashed' : 'solid'} ${caret ? 'var(--accent)' : border}`,
                background: bg, cursor: checked === null && ch !== undefined ? 'pointer' : 'default',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 0,
              }}>
              {ch ?? ''}
            </button>
          );
        })}
      </div>

      {/* 타일 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 10 }}>
        {card.tiles.map((t, i) => (
          <button key={i} className="ym-press" onClick={() => tap(i)} disabled={!usable[i] || checked !== null}
            style={{ ...BTN, fontSize: 24, padding: '8px 16px', opacity: usable[i] ? 1 : 0.28, background: 'var(--glass-bg-strong)' }}>{t}</button>
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
            <p style={{ background: 'var(--ok-soft)', padding: 12, borderRadius: 12, color: 'var(--ok)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={16} /> 정답! {card.answer.join('')} — {card.korean}
            </p>
          ) : (
            <p style={{ background: 'var(--accent-soft)', padding: 12, borderRadius: 12, color: 'var(--accent)', margin: 0 }}>
              아쉬워요. 정답은 <strong>{card.answer.join('')}</strong> <span style={{ color: 'var(--ink-soft)' }}>— {card.korean}</span>
            </p>
          )}
          <button style={{ ...PRIMARY, marginTop: 10, width: '100%' }} onClick={onNext}>다음</button>
        </div>
      )}
    </div>
  );
}
