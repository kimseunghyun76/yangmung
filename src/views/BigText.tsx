// 여행 현장에서 상대방에게 화면을 보여줄 때 쓰는 전체화면 확대 오버레이(BL-02).
// 학습 화면과 달리 설명·버튼 없이 "보여줄 문장 하나"만 최대한 크게 띄우는 것이 목적.
import { createPortal } from 'react-dom';
import { Icon } from '../ui/Icon';
import { Furigana } from './Furigana';

interface OverlayProps {
  kanji?: string;
  kana: string;
  sub?: string;
  onClose: () => void;
}

export function BigTextOverlay({ kanji, kana, sub, onClose }: OverlayProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={kanji ?? kana}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, background: '#000',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', cursor: 'pointer',
      }}
    >
      <button
        aria-label="닫기"
        onClick={onClose}
        style={{
          position: 'absolute', top: 'max(18px, env(safe-area-inset-top))', right: 18,
          width: 44, height: 44, borderRadius: 999, border: '1px solid rgba(255,255,255,.3)',
          background: 'rgba(255,255,255,.08)', color: '#fff', fontSize: 20, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >✕</button>
      <Furigana kanji={kanji} kana={kana} style={{ display: 'block', fontSize: 'clamp(32px, 12vw, 64px)', fontWeight: 900, color: '#fff', textAlign: 'center', lineHeight: 1.3, overflowWrap: 'anywhere' }} />
      {sub && <p style={{ margin: '18px 0 0', fontSize: 15, color: 'rgba(255,255,255,.5)', textAlign: 'center' }}>{sub}</p>}
      <p style={{ margin: '28px 0 0', fontSize: 12, color: 'rgba(255,255,255,.35)' }}>화면 아무 곳이나 탭하면 닫혀요</p>
    </div>,
    document.body,
  );
}

// 문장 카드에 붙이는 트리거 아이콘 버튼 — 부모의 클릭(예: 재생)과 겹치지 않게 전파를 막는다.
export function ZoomButton({ onClick, size = 34 }: { onClick: () => void; size?: number }) {
  return (
    <button
      className="ym-press"
      aria-label="크게 보여주기"
      title="크게 보여주기"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        flex: '0 0 auto', width: size, height: size, borderRadius: 10,
        border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink-soft)',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Icon name="expand" size={Math.round(size * 0.5)} />
    </button>
  );
}
