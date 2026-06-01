// 상단 네비게이션 — 에디토리얼: 텍스트 탭 + 朱 언더라인, 모노 컨트롤.
import { COLORS } from '../ui/styles';
type NavView = 'home' | 'map' | 'review';

export interface NavBarProps {
  current: NavView;
  onNavigate: (v: NavView) => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}
type Props = NavBarProps;

const items: { key: NavView; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'map', label: '지도' },
  { key: 'review', label: '복습' },
];

export function NavBar({ current, onNavigate, onOpenGuide, onOpenSettings, theme, onToggleTheme }: Props) {
  const tab = (active: boolean): React.CSSProperties => ({
    border: 'none', background: 'none', cursor: 'pointer', fontSize: 16,
    padding: '4px 2px', color: active ? COLORS.ink : COLORS.inkFaint,
    fontWeight: active ? 800 : 600, letterSpacing: '-0.02em',
    borderBottom: `3px solid ${active ? COLORS.indigo : 'transparent'}`,
  });
  const ctrl: React.CSSProperties = {
    border: 'none', background: 'none', cursor: 'pointer', fontSize: 16,
    padding: '4px 6px', color: COLORS.inkSoft, minWidth: 32, fontWeight: 700,
  };
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
      {items.map((it) => (
        <button key={it.key} style={tab(current === it.key)} onClick={() => onNavigate(it.key)}>
          {it.label}
        </button>
      ))}
      <span style={{ flex: 1 }} />
      <button style={ctrl} onClick={onToggleTheme} title="주간/야간">{theme === 'dark' ? '☀' : '☾'}</button>
      <button style={ctrl} onClick={onOpenGuide} title="가이드">?</button>
      <button style={ctrl} onClick={onOpenSettings} title="설정">⚙</button>
    </nav>
  );
}
