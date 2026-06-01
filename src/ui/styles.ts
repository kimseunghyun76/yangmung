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

export const RADIUS = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
export const SHADOW = {
  card: 'var(--shadow-card)',
  raised: 'var(--shadow-raised)',
} as const;

// 에디토리얼 헤드라인용 세리프(라틴 전용, iPhone의 New York). 한글은 SF로 폴백.
export const SERIF = "ui-serif, 'New York', Georgia, serif";

// 기본 버튼 — 플랫, 헤어라인 테두리, 그림자 없음
export const BTN: CSSProperties = {
  padding: '14px 16px',
  borderRadius: RADIUS.md,
  border: `1px solid ${COLORS.line}`,
  background: COLORS.surface,
  color: COLORS.ink,
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 500,
  textAlign: 'left',
};

// 주요 액션 — 잉크 솔리드 바(절제), 플랫
export const PRIMARY: CSSProperties = {
  ...BTN,
  background: COLORS.ink,
  color: 'var(--bg)',
  fontWeight: 650,
  textAlign: 'center',
  border: 'none',
  letterSpacing: '0.01em',
};

// 텍스트형 액션 (에디토리얼: "시작 →") — 밑줄 없는 강조 링크
export const TEXT_ACTION: CSSProperties = {
  border: 'none',
  background: 'none',
  color: COLORS.indigo,
  fontWeight: 650,
  fontSize: 17,
  cursor: 'pointer',
  padding: '8px 0',
  letterSpacing: '-0.01em',
};

// 카드 컨테이너 — 그림자 대신 헤어라인 + 넉넉한 패딩
export const CARD: CSSProperties = {
  background: COLORS.surface,
  borderRadius: RADIUS.lg,
  border: `1px solid ${COLORS.line}`,
  padding: 20,
};

// iOS Safe Area 대응 (노치·홈 인디케이터). HIG: 콘텐츠가 안전 영역 안에 들어오게.
export const WRAP: CSSProperties = {
  maxWidth: 540,
  margin: '0 auto',
  paddingTop: 'max(28px, env(safe-area-inset-top))',
  paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom) + 12px))',
  paddingLeft: 'max(24px, env(safe-area-inset-left))',
  paddingRight: 'max(24px, env(safe-area-inset-right))',
};
