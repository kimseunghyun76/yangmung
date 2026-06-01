// 장면 흐름 카드 — 정답 채점 없이 흔한 흐름을 확인하는 정보 카드.
import type { OrderCard } from '../learn/cards';
import { PRIMARY } from '../ui/styles';

interface Props {
  card: OrderCard;
  onNext: () => void;
}

export function OrderCardView({ card, onNext }: Props) {
  return (
    <div>
      <h2 style={{ marginTop: 14, marginBottom: 4 }}>🧭 {card.title}</h2>
      <p style={{ color: 'var(--ink-soft)', marginTop: 0 }}>{card.prompt}</p>

      <ol style={{ paddingLeft: 0, listStyle: 'none', margin: '12px 0' }}>
        {card.items.map((it, i) => {
          return (
            <li key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', marginBottom: 6, border: '1px solid var(--line)' }}>
              <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              <span style={{ fontSize: 16 }}>{it.label}</span>
            </li>
          );
        })}
      </ol>

      <p style={{ background: 'var(--warn-soft)', padding: 12, borderRadius: 8, color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5 }}>
        가게마다 순서는 조금 달라질 수 있어요. 여기서는 여행자가 자주 만나는 흐름만 미리 봅니다.
      </p>
      <button style={{ ...PRIMARY, marginTop: 8, width: '100%' }} onClick={onNext}>확인</button>
    </div>
  );
}
