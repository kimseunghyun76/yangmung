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


// ── Liquid Glass 프리미티브 — 설정·모달·시트 계열 공용 (SettingsModal에서 승격) ──
// 개별 뷰에서 로컬로 복제하지 말 것: 여기서 가져다 쓰거나 필요한 변형을 여기에 추가.

// 글래스 버튼 — 반투명 배경 + 얇은 글래스 테두리
export const GLASS_BTN: CSSProperties = {
  borderRadius: RADIUS.md,
  border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)',
  color: COLORS.ink,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
  padding: '12px 14px',
  textAlign: 'left',
};

// 섹션 헤더 — 아이콘 + 소제목 한 줄
export const SECTION_HEAD: CSSProperties = {
  margin: '0 0 8px',
  fontWeight: 700,
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  gap: 7,
};

// 온/오프 토글(필) — 켜짐 = 朱 솔리드
export const glassToggle = (on: boolean): CSSProperties => ({
  ...GLASS_BTN,
  padding: '8px 16px',
  borderRadius: RADIUS.pill,
  background: on ? 'var(--accent)' : 'var(--glass-bg-strong)',
  color: on ? 'var(--accent-ink)' : COLORS.inkSoft,
  border: `1px solid ${on ? 'var(--ink)' : 'var(--glass-border)'}`,
});

// 세그먼트 선택 버튼 — 활성 = 朱 솔리드 (여러 개를 flex로 나란히)
export const glassSeg = (active: boolean): CSSProperties => ({
  ...GLASS_BTN,
  flex: 1,
  textAlign: 'center',
  fontSize: 13,
  padding: '9px 6px',
  background: active ? 'var(--accent)' : 'var(--glass-bg-strong)',
  color: active ? 'var(--accent-ink)' : COLORS.inkSoft,
  border: `1px solid ${active ? 'var(--ink)' : 'var(--glass-border)'}`,
});

// iOS Safe Area 대응 (노치·홈 인디케이터). HIG: 콘텐츠가 안전 영역 안에 들어오게.
export const WRAP: CSSProperties = {
  maxWidth: 540,
  margin: '0 auto',
  paddingTop: 'max(28px, env(safe-area-inset-top))',
  paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom) + 12px))',
  paddingLeft: 'max(24px, env(safe-area-inset-left))',
  paddingRight: 'max(24px, env(safe-area-inset-right))',
};
