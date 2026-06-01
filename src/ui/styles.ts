// 공용 스타일 + 디자인 토큰 — 색·간격·라운드·그림자를 한곳에서 (일관된 폴리시).
import type { CSSProperties } from 'react';

// 뉴트로·일본 감성 팔레트 — 크림 와시지 + 朱(주홍)·藍(남색)·먹빛.
// indigo/indigoSoft 이름은 기존 코드 호환을 위해 유지하되 값은 주홍(앱 메인 포인트)으로.
export const COLORS = {
  ink: '#2a2a30',       // 먹빛
  inkSoft: '#6b6258',
  inkFaint: '#a99f8c',
  indigo: '#c8453a',    // 朱 (메인 포인트) — 이름은 호환용
  indigoSoft: '#f6e4df',
  navy: '#1f3f5f',      // 藍 (보조 강조·히어로)
  navySoft: '#e6ecf2',
  surface: '#fffdf6',   // 따뜻한 종이 흰색
  line: '#e7dcc4',      // 와시 테두리
  green: '#3f7d4e',
  greenSoft: '#e4efe0',
  red: '#c8453a',
  redSoft: '#f6e4df',
  amber: '#a86a1d',
  amberSoft: '#f7ecd6',
} as const;

export const RADIUS = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
export const SHADOW = {
  card: '0 1px 2px rgba(80,60,30,0.05), 0 4px 14px rgba(80,60,30,0.08)',
  raised: '0 2px 5px rgba(200,69,58,0.20), 0 8px 22px rgba(200,69,58,0.22)',
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
