// 상단 네비게이션 — 에디토리얼: 텍스트 탭 + 朱 언더라인, 모노 컨트롤.
import { Icon } from '../ui/Icon';
type NavView = 'home' | 'practice' | 'map' | 'review' | 'gacha';

export interface NavBarProps {
  current: NavView;
  onNavigate: (v: NavView) => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenTips: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}
type Props = NavBarProps;

const items: { key: NavView; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'practice', label: '학습' },
  { key: 'map', label: '미션' },
  { key: 'review', label: '복습' },
  { key: 'gacha', label: '도감' },
];

export function NavBar({ current, onNavigate, onOpenGuide, onOpenSettings, onOpenTips, theme, onToggleTheme }: Props) {
  const tab = (active: boolean): React.CSSProperties => ({
    border: 'none', background: 'none', cursor: 'pointer', fontSize: 15,
    padding: '4px 1px', color: active ? 'var(--ink)' : 'var(--ink-faint)',
    fontWeight: active ? 800 : 600, letterSpacing: '-0.03em',
    borderBottom: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    whiteSpace: 'nowrap', flex: '0 0 auto',
  });
  const ctrl: React.CSSProperties = {
    border: 'none', background: 'none', cursor: 'pointer', fontSize: 16,
    padding: '4px 6px', color: 'var(--ink-soft)', minWidth: 32, fontWeight: 700,
  };
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
      {items.map((it) => (
        <button key={it.key} style={tab(current === it.key)} onClick={() => onNavigate(it.key)}>
          {it.label}
        </button>
      ))}
      <span style={{ flex: 1 }} />
      <button style={ctrl} onClick={onToggleTheme} title="주간/야간"><Icon name={theme === 'dark' ? 'theme-day' : 'theme-night'} size={19} /></button>
      <button style={ctrl} onClick={onOpenTips} title="문화·여행 팁"><Icon name="tip" size={19} /></button>
      <button style={ctrl} onClick={onOpenGuide} title="가이드"><Icon name="nav-guide" size={19} /></button>
      <button style={ctrl} onClick={onOpenSettings} title="설정"><Icon name="nav-settings" size={19} /></button>
    </nav>
  );
}
