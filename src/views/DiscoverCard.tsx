// 발견 카드 — "이제 이 표현을 읽을 수 있어요!" 성취 순간 (보조 없이 가나만 + 축하).
import type { DiscoverCard } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { BTN, COLORS, PRIMARY } from '../ui/styles';

export function DiscoverCardView({ card, onNext }: { card: DiscoverCard; onNext: () => void }) {
  return (
    <div className="ym-reveal" style={{ textAlign: 'center' }}>
      <div className="ym-burst" style={{ fontSize: 44, marginTop: 8 }}>👀✨</div>
      <h2 style={{ marginTop: 6, color: COLORS.indigo }}>이제 이걸 읽을 수 있어요!</h2>
      <p style={{ color: COLORS.inkSoft, fontSize: 14, marginTop: 4 }}>배운 가나로만 된 표현이에요 — 보조 없이 읽어보세요</p>

      <div style={{ fontSize: 34, fontWeight: 700, margin: '20px 0 6px' }}>{card.kana}</div>
      <p style={{ color: COLORS.inkSoft, margin: 0 }}>{card.korean}</p>

      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <button style={{ ...BTN, padding: '10px 22px', fontSize: 18, background: COLORS.indigoSoft }} onClick={() => speak(card.ja)} disabled={!ttsSupported()}>🔊 확인</button>
      </div>

      <button style={{ ...PRIMARY, width: '100%', marginTop: 18 }} onClick={onNext}>좋아요!</button>
    </div>
  );
}
