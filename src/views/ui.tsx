// 공용 화면 프리미티브 — 모든 페이지가 같은 볼드 모던 언어를 쓰도록 한곳에서.
import type { CSSProperties, ReactNode } from 'react';
import { RADIUS, SHADOW } from '../ui/styles';

// 얇은 구분선
export const Rule = ({ m = 24 }: { m?: number }) => <hr className="ym-rule" style={{ margin: `${m}px 0` }} />;

// 섹션 라벨 (朱 사각 + 굵은 텍스트) — .ym-kicker 사용
export const Kicker = ({ children }: { children: ReactNode }) => <p className="ym-kicker" style={{ margin: 0 }}>{children}</p>;

// 페이지 헤더 — 큰 헤비 타이틀 + 朱 언더바 + 부제. 전 페이지 통일.
export function PageHead({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <header style={{ marginBottom: 22 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      <span style={{ display: 'block', width: 44, height: 5, background: 'var(--accent)', borderRadius: 3, marginTop: 10 }} />
      {sub && <p style={{ color: 'var(--ink-soft)', margin: '12px 0 0', fontSize: 14, lineHeight: 1.5 }}>{sub}</p>}
    </header>
  );
}

// 솔리드/테두리 블록 — 청키 카드. tone: surface | ink | accent.
export function Block({ tone = 'surface', pop = false, style, children }: {
  tone?: 'surface' | 'ink' | 'accent'; pop?: boolean; style?: CSSProperties; children: ReactNode;
}) {
  const tones: Record<string, CSSProperties> = {
    surface: { background: 'var(--surface)', color: 'var(--ink)', border: '1.5px solid var(--border)' },
    ink: { background: 'var(--hero)', color: 'var(--surface)', border: '1.5px solid var(--ink)' },
    accent: { background: 'var(--accent)', color: 'var(--accent-ink)', border: '1.5px solid var(--ink)' },
  };
  return (
    <div style={{ borderRadius: RADIUS.lg, padding: 18, ...tones[tone], boxShadow: pop ? SHADOW.pop : undefined, ...style }}>
      {children}
    </div>
  );
}

// 뒤로가기/나가기 텍스트 버튼
export function BackLink({ label = '← 뒤로', onClick }: { label?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)', padding: '4px 0', marginBottom: 8 }}>
      {label}
    </button>
  );
}
