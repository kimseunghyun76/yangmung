// 공용 스타일 + 디자인 토큰 — 색·간격·라운드·그림자를 한곳에서 (일관된 폴리시).
import type { CSSProperties } from 'react';

// 디자인 토큰 — 전부 CSS 변수 참조라 주간/야간 테마가 자동 전환된다.
// (indigo/navy 등 이름은 기존 코드 호환용. 값은 절제된 럭셔리 팔레트의 변수)
export const COLORS = {
  ink: 'var(--ink)',
  inkSoft: 'var(--ink-soft)',
  inkFaint: 'var(--ink-faint)',
  indigo: 'var(--accent)',       // 메인 액센트(토리이 레드)
  indigoSoft: 'var(--accent-soft)',
  navy: 'var(--ink)',
  navySoft: 'var(--surface-2)',
  surface: 'var(--surface)',
  surface2: 'var(--surface-2)',
  line: 'var(--line)',
  green: 'var(--ok)',
  greenSoft: 'var(--ok-soft)',
  red: 'var(--accent)',
  redSoft: 'var(--accent-soft)',
  amber: 'var(--warn)',
  amberSoft: 'var(--warn-soft)',
  accentInk: 'var(--accent-ink)',
} as const;

export const RADIUS = { sm: 10, md: 14, lg: 18, pill: 999 } as const;
export const SHADOW = {
  card: 'var(--shadow-card)',
  raised: 'var(--shadow-raised)',
} as const;

// 기본 버튼 — 카드형, 부드러운 테두리 + 미세 그림자
export const BTN: CSSProperties = {
  padding: '13px 16px',
  borderRadius: RADIUS.md,
  border: `1px solid ${COLORS.line}`,
  background: COLORS.surface,
  color: COLORS.ink,
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 500,
  textAlign: 'left',
  boxShadow: SHADOW.card,
};

// 주요 액션 버튼 — 액센트, 떠 있는 느낌
export const PRIMARY: CSSProperties = {
  ...BTN,
  background: COLORS.indigo,
  color: COLORS.accentInk,
  fontWeight: 700,
  textAlign: 'center',
  border: 'none',
  boxShadow: SHADOW.raised,
};

// 카드 컨테이너 (정보 블록 공용)
export const CARD: CSSProperties = {
  background: COLORS.surface,
  borderRadius: RADIUS.lg,
  border: `1px solid ${COLORS.line}`,
  boxShadow: SHADOW.card,
  padding: 16,
};

export const WRAP: CSSProperties = { padding: 20, maxWidth: 560, margin: '0 auto' };
