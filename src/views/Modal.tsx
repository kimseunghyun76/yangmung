// 공용 모달 — 화면 위 팝업 (가이드·설정·도감). body 포털로 어떤 조상(transform 등) 안에서도 풀스크린.
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PrimaryAction } from './shell';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      // 포커스 트랩 — Tab/Shift+Tab이 모달 밖(배경 요소)으로 나가지 않게 첫/마지막 요소 사이를 순환.
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusables.length === 0) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);

    // 열릴 때 모달 안으로 포커스 이동, 닫힐 때 원래 있던 위치로 복원.
    const prevFocused = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    return () => {
      window.removeEventListener('keydown', onKey);
      prevFocused?.focus();
    };
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
        ref={panelRef}
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
          <button aria-label="닫기" onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--ink-faint)', padding: 10, minWidth: 40, minHeight: 40, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
        {footer === undefined && <PrimaryAction onClick={onClose} style={{ marginTop: 16 }}>닫기</PrimaryAction>}
        {footer !== undefined && footer !== null && <div style={{ marginTop: 16 }}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
