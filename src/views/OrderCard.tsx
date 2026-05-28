// 순서 맞추기 카드 — 탭해서 순서 채우기 (드래그 X, 모바일 안정).
import { useState } from 'react';
import type { OrderCard } from '../learn/cards';
import { BTN, PRIMARY } from '../ui/styles';

interface Props {
  card: OrderCard;
  onComplete: (correct: boolean) => void;
  onNext: () => void;
}

export function OrderCardView({ card, onComplete, onNext }: Props) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const labelOf = (id: string) => card.items.find((it) => it.id === id)?.label ?? '';
  const remaining = card.items.filter((it) => !placed.includes(it.id));
  const correct = placed.length === card.correctOrder.length && placed.every((id, i) => id === card.correctOrder[i]);

  function tap(id: string) {
    if (done) return;
    const next = [...placed, id];
    setPlaced(next);
    if (next.length === card.items.length) {
      setDone(true);
      onComplete(next.every((x, i) => x === card.correctOrder[i]));
    }
  }
  function reset() { if (!done) setPlaced([]); }

  return (
    <div>
      <h2 style={{ marginTop: 14, marginBottom: 4 }}>🔢 {card.title}</h2>
      <p style={{ color: '#555', marginTop: 0 }}>{card.prompt}</p>

      {/* 채워지는 순서 */}
      <ol style={{ paddingLeft: 0, listStyle: 'none', margin: '12px 0' }}>
        {card.correctOrder.map((_, i) => {
          const id = placed[i];
          const filled = id !== undefined;
          const isCorrectSlot = done && id === card.correctOrder[i];
          const bg = !done ? (filled ? '#eef2ff' : '#f7f7fb') : isCorrectSlot ? '#dcfce7' : filled ? '#fee2e2' : '#f7f7fb';
          return (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: bg, marginBottom: 6, border: '1px solid #e4e4ee' }}>
              <span style={{ width: 22, height: 22, borderRadius: 999, background: '#4f46e5', color: '#fff', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              <span style={{ fontSize: 16 }}>{filled ? labelOf(id) : '…'}{done && isCorrectSlot ? ' ✓' : ''}</span>
            </li>
          );
        })}
      </ol>

      {/* 남은 항목 */}
      {!done && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {remaining.map((it) => (
            <button key={it.id} style={{ ...BTN, padding: '10px 14px' }} onClick={() => tap(it.id)}>{it.label}</button>
          ))}
        </div>
      )}
      {!done && placed.length > 0 && (
        <button style={{ ...BTN, marginTop: 12, color: '#888', fontSize: 13 }} onClick={reset}>처음부터</button>
      )}

      {done && (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: correct ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
            {correct ? '✓ 순서 정확해요!' : '✗ 순서가 조금 달라요'}
          </p>
          {!correct && (
            <p style={{ background: '#f5f5fb', padding: 12, borderRadius: 8, fontSize: 14, color: '#444' }}>
              올바른 순서: {card.correctOrder.map((id) => labelOf(id)).join(' → ')}
            </p>
          )}
          <button style={{ ...PRIMARY, marginTop: 8, width: '100%' }} onClick={onNext}>다음</button>
        </div>
      )}
    </div>
  );
}
