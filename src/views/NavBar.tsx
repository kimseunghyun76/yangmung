// 상단 네비게이션 — 에디토리얼: 텍스트 탭 + 朱 언더라인, 모노 컨트롤.
import { Icon } from '../ui/Icon';
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
  const tab = (active: boolean, home = false): React.CSSProperties => ({
    border: 'none', background: 'none', cursor: 'pointer', fontSize: 16,
    padding: home ? '1px 2px 5px' : '4px 2px', color: active ? 'var(--ink)' : 'var(--ink-faint)',
    fontWeight: active ? 800 : 600, letterSpacing: '-0.02em',
    borderBottom: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
  const ctrl: React.CSSProperties = {
    border: 'none', background: 'none', cursor: 'pointer', fontSize: 16,
    padding: '4px 6px', color: 'var(--ink-soft)', minWidth: 32, fontWeight: 700,
  };
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
      {items.map((it) => (
        <button key={it.key} style={tab(current === it.key, it.key === 'home')} onClick={() => onNavigate(it.key)} aria-label={it.label} title={it.label}>
          {it.key === 'home'
            ? <img src="/mascots/yangmung-duo-logo.webp" alt="" width={32} height={32} style={{ objectFit: 'contain', filter: 'drop-shadow(0 7px 12px rgba(0,0,0,0.12))' }} />
            : it.label}
        </button>
      ))}
      <span style={{ flex: 1 }} />
      <button style={ctrl} onClick={onToggleTheme} title="주간/야간"><Icon name={theme === 'dark' ? 'theme-day' : 'theme-night'} size={19} /></button>
      <button style={ctrl} onClick={onOpenGuide} title="가이드"><Icon name="nav-guide" size={19} /></button>
      <button style={ctrl} onClick={onOpenSettings} title="설정"><Icon name="nav-settings" size={19} /></button>
    </nav>
  );
}
