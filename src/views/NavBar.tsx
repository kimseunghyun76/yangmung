// 상단 네비게이션 — 에디토리얼: 텍스트 탭 + 朱 언더라인, 모노 컨트롤.
import { Icon, type IconName } from '../ui/Icon';
type NavTabView = 'home' | 'practice' | 'map' | 'review' | 'gacha';
type NavView = NavTabView | 'emergency' | 'listen';

export interface NavBarProps {
  current: NavView;
  onNavigate: (v: NavTabView) => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenTips: () => void;
  onOpenEmergency: () => void;
  onOpenListen: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}
type Props = NavBarProps;

const items: { key: NavTabView; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'practice', label: '학습' },
  { key: 'map', label: '미션' },
  { key: 'review', label: '복습' },
  { key: 'gacha', label: '수집함' }, // 2026-07-27: 내비게이션 라벨만 순화(화면 내부 "도감" 표기는 유지, 사용자 승인 범위)
];

// 우측 유틸리티 버튼 — 아이콘만으로는 저시력·저디지털숙련 사용자가 기능을 유추하기 어려워
// (사용성 테스트 지적) 아이콘 아래 짧은 한글 라벨을 항상 병기한다.
function CtrlButton({ icon, label, onClick, tone }: { icon: IconName; label: string; onClick: () => void; tone?: 'warn' }) {
  return (
    <button className="ym-press" onClick={onClick} title={label} aria-label={label} style={{
      border: 'none', background: 'none', cursor: 'pointer',
      padding: '5px 7px', minWidth: 44, minHeight: 40,
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      color: tone === 'warn' ? 'var(--accent)' : 'var(--ink-soft)',
    }}>
      <Icon name={icon} size={19} />
      <span style={{ fontSize: 9.5, fontWeight: tone === 'warn' ? 800 : 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

export function NavBar({ current, onNavigate, onOpenGuide, onOpenSettings, onOpenTips, onOpenEmergency, onOpenListen, theme, onToggleTheme }: Props) {
  const tab = (active: boolean): React.CSSProperties => ({
    border: 'none', background: 'none', cursor: 'pointer', fontSize: 15,
    padding: '4px 1px', color: active ? 'var(--ink)' : 'var(--ink-faint)',
    fontWeight: active ? 800 : 600, letterSpacing: '-0.03em',
    borderBottom: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    whiteSpace: 'nowrap', flex: '0 0 auto',
  });
  return (
    <nav className="ym-navbar-scroll" style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22, paddingRight: 16 }}>
      {items.map((it) => (
        <button key={it.key} style={tab(current === it.key)} onClick={() => onNavigate(it.key)}>
          {it.label}
        </button>
      ))}
      <span style={{ flex: 1, flexShrink: 0, minWidth: 8 }} />
      <CtrlButton icon="emergency" label="긴급" tone="warn" onClick={onOpenEmergency} />
      <CtrlButton icon="listen" label="듣기" onClick={onOpenListen} />
      <CtrlButton icon={theme === 'dark' ? 'theme-day' : 'theme-night'} label="주야" onClick={onToggleTheme} />
      <CtrlButton icon="tip" label="팁" onClick={onOpenTips} />
      <CtrlButton icon="nav-guide" label="가이드" onClick={onOpenGuide} />
      <CtrlButton icon="nav-settings" label="설정" onClick={onOpenSettings} />
    </nav>
  );
}
