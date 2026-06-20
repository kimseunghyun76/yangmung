// Scene UI Shell — 홈·세션이 공유하는 "장면 배경 + 글래스 패널 + 강한 CTA" 공통 구조.
// Immersive Scene Coach의 뼈대. (UI_REDESIGN_PROPOSAL.md §4,§5 참고)
import type { CSSProperties, ReactNode } from 'react';

// #rrggbb → rgba(.., a)  — 장면 accent 틴트용
export function hexA(hex: string, a: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

// 강한 1급 액션 — 朱 솔리드 + 소프트 글로우 + 누름 반응
export function PrimaryAction({ children, onClick, disabled, style }: {
  children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties;
}) {
  return (
    <button
      className="ym-press" onClick={onClick} disabled={disabled}
      style={{
        width: '100%', padding: '16px 18px', border: 'none', borderRadius: 16,
        background: disabled ? 'var(--surface-2)' : 'var(--accent)',
        color: disabled ? 'var(--ink-faint)' : 'var(--accent-ink)',
        fontWeight: 750, fontSize: 17, letterSpacing: '0.01em',
        cursor: disabled ? 'default' : 'pointer',
        boxShadow: disabled ? 'none' : '0 8px 22px rgba(185,56,46,0.32)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        ...style,
      }}
    >{children}</button>
  );
}

// 글래스 패널 — 반투명 학습/정보 패널. scroll이면 내부 스크롤(정보 많은 카드용).
export function GlassPanel({ children, style, scroll, strong }: {
  children: ReactNode; style?: CSSProperties; scroll?: boolean; strong?: boolean;
}) {
  return (
    <div className={`ym-glass${strong ? ' ym-glass-strong' : ''}`}
      style={{ padding: 18, ...(scroll ? { maxHeight: '58vh', overflowY: 'auto' } : null), ...style }}>
      {children}
    </div>
  );
}

