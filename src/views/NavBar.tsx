// 상단 네비게이션 — 허브 화면(홈·지도·복습)에서 자유 이동 + 가이드/설정 진입.
type NavView = 'home' | 'map' | 'review';

export interface NavBarProps {
  current: NavView;
  onNavigate: (v: NavView) => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
}
type Props = NavBarProps;

const items: { key: NavView; label: string; icon: string }[] = [
  { key: 'home', label: '홈', icon: '🏠' },
  { key: 'map', label: '지도', icon: '🗺' },
  { key: 'review', label: '복습', icon: '📚' },
];

export function NavBar({ current, onNavigate, onOpenGuide, onOpenSettings }: Props) {
  const btn = (active: boolean): React.CSSProperties => ({
    border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
    padding: '6px 8px', borderRadius: 8, color: active ? '#4f46e5' : '#888',
    fontWeight: active ? 700 : 500,
  });
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
      {items.map((it) => (
        <button key={it.key} style={btn(current === it.key)} onClick={() => onNavigate(it.key)}>
          {it.icon} {it.label}
        </button>
      ))}
      <span style={{ flex: 1 }} />
      <button style={btn(false)} onClick={onOpenGuide}>❓ 가이드</button>
      <button style={btn(false)} onClick={onOpenSettings}>⚙️ 설정</button>
    </nav>
  );
}
