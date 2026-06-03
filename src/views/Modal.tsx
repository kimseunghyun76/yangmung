// 공용 모달 — 화면 위 팝업 (가이드·설정·도감). body 포털로 어떤 조상(transform 등) 안에서도 풀스크린.
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PrimaryAction } from './shell';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="ym-reveal"
        style={{
          width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto',
          borderRadius: '22px 22px 0 0', borderTop: '3px solid var(--accent)',
          background: 'var(--glass-bg-strong)', backdropFilter: 'blur(24px) saturate(1.5)', WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
          padding: '20px 20px max(24px, calc(env(safe-area-inset-bottom) + 12px))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button aria-label="닫기" onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ink-faint)' }}>✕</button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
        <PrimaryAction onClick={onClose} style={{ marginTop: 16 }}>닫기</PrimaryAction>
      </div>
    </div>,
    document.body,
  );
}
