// 상단 네비게이션 — 허브 화면(홈·지도·복습)에서 자유 이동 + 가이드/설정/테마.
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

const items: { key: NavView; label: string; icon: string }[] = [
  { key: 'home', label: '홈', icon: '🏠' },
  { key: 'map', label: '지도', icon: '🗺' },
  { key: 'review', label: '복습', icon: '📚' },
];

export function NavBar({ current, onNavigate, onOpenGuide, onOpenSettings, theme, onToggleTheme }: Props) {
  const btn = (active: boolean): React.CSSProperties => ({
    border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
    padding: '6px 8px', borderRadius: 8, color: active ? COLORS.indigo : COLORS.inkFaint,
    fontWeight: active ? 700 : 500,
  });
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 14, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 10 }}>
      {items.map((it) => (
        <button key={it.key} style={btn(current === it.key)} onClick={() => onNavigate(it.key)}>
          {it.icon} {it.label}
        </button>
      ))}
      <span style={{ flex: 1 }} />
      <button style={btn(false)} onClick={onToggleTheme} title="주간/야간">{theme === 'dark' ? '☀️' : '🌙'}</button>
      <button style={btn(false)} onClick={onOpenGuide}>❓</button>
      <button style={btn(false)} onClick={onOpenSettings}>⚙️</button>
    </nav>
  );
}
