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
  pop: 'var(--shadow-pop)',
  popSm: 'var(--shadow-pop-sm)',
} as const;

const BORDER = 'var(--border)';

// 기본 버튼 — 굵은(1.5px) 테두리, 청키
export const BTN: CSSProperties = {
  padding: '13px 16px',
  borderRadius: RADIUS.md,
  border: `1.5px solid ${BORDER}`,
  background: COLORS.surface,
  color: COLORS.ink,
  cursor: 'pointer',
  fontSize: 16,
  fontWeight: 600,
  textAlign: 'left',
};

// 주요 액션 — 朱 솔리드 + 잉크 테두리 + 하드 오프셋 섀도 (청키 팝)
export const PRIMARY: CSSProperties = {
  ...BTN,
  background: COLORS.indigo,
  color: COLORS.accentInk,
  fontWeight: 750,
  textAlign: 'center',
  border: '1.5px solid var(--ink)',
  boxShadow: SHADOW.pop,
  letterSpacing: '0.01em',
};

// 텍스트형 액션 — 밑줄 없는 강조 링크
// 카드 컨테이너 — 굵은 테두리 블록(섀도 없음, 테두리로 정의)
export const CARD: CSSProperties = {
  background: COLORS.surface,
  borderRadius: RADIUS.lg,
  border: `1.5px solid ${BORDER}`,
  padding: 18,
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
