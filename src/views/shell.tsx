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

// 장면 히어로 — 장면 컬러 일러스트 + accent 틴트 + 하단 스크림. 그 위에 콘텐츠(콘텐츠는 흰 글자).
export function SceneHero({ hero, accent, kicker, title, children, minH = 210, style }: {
  hero?: string; accent: string; kicker?: ReactNode; title?: ReactNode; children?: ReactNode; minH?: number; style?: CSSProperties;
}) {
  return (
    <div style={{
      position: 'relative', borderRadius: 24, overflow: 'hidden', minHeight: minH,
      background: `linear-gradient(165deg, ${hexA(accent, 0.16)}, ${hexA(accent, 0.30)})`,
      border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)', ...style,
    }}>
      {hero && <img src={hero} alt="" aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.82 }} />}
      {/* 스크림 — 전반적으로 어둡게(테마 무관) 해서 흰 텍스트 가독 확보 */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.34) 45%, rgba(0,0,0,0.68) 100%)' }} />
      <div style={{ position: 'relative', minHeight: minH, padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff' }}>
        {kicker && <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>{kicker}</p>}
        {title && <p style={{ margin: '6px 0 0', fontSize: 25, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', textShadow: '0 1px 10px rgba(0,0,0,0.55)' }}>{title}</p>}
        {children}
      </div>
    </div>
  );
}
