// 공용 스타일 + 디자인 토큰 — 색·간격·라운드·그림자를 한곳에서 (일관된 폴리시).
import type { CSSProperties } from 'react';

export const COLORS = {
  ink: '#1f2430',
  inkSoft: '#5b6170',
  inkFaint: '#9aa0ad',
  indigo: '#4f46e5',
  indigoSoft: '#eef0fe',
  surface: '#ffffff',
  line: '#e7e8ef',
  green: '#16a34a',
  greenSoft: '#dcfce7',
  red: '#dc2626',
  redSoft: '#fee2e2',
  amber: '#b45309',
  amberSoft: '#fff7e6',
} as const;

export const RADIUS = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
export const SHADOW = {
  card: '0 1px 2px rgba(31,36,48,0.04), 0 4px 16px rgba(31,36,48,0.06)',
  raised: '0 2px 4px rgba(79,70,229,0.15), 0 8px 24px rgba(79,70,229,0.22)',
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

// 주요 액션 버튼 — 인디고, 떠 있는 느낌
export const PRIMARY: CSSProperties = {
  ...BTN,
  background: COLORS.indigo,
  color: '#fff',
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
