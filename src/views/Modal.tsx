// 공용 모달 — 화면 위 팝업 (가이드·설정).
import { PRIMARY } from '../ui/styles';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ym-reveal"
        style={{ background: 'var(--surface)', width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', borderRadius: '18px 18px 0 0', borderTop: '3px solid var(--accent)', padding: '20px 20px max(24px, env(safe-area-inset-bottom))' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ink-faint)' }}>✕</button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
        <button style={{ ...PRIMARY, width: '100%', marginTop: 16 }} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
