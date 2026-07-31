// 상단 내비게이션 — 에디토리얼: 텍스트 탭 + 朱 언더라인, 모노 컨트롤.
// 2026-08-01: 탭 5개+유틸 아이콘 6개(총 11개)가 모바일 좁은 화면에서 폭을 넘어 "설정" 등이
// 화면 밖으로 밀려나 조작 불가능했던 문제(BL-01, 사용자 재보고)를 스크롤 방식 대신 항목 자체를
// 줄여서 해결한다 — 복습을 듣기에 통합해 탭을 4개로 줄이고, 자주 안 쓰는 유틸(주야·팁·가이드·설정)을
// "더보기" 메뉴 하나로 접어 화면 폭 안에 항상 들어오게 한다.
import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from '../ui/Icon';
type NavTabView = 'home' | 'practice' | 'map' | 'listen' | 'gacha';
type NavView = NavTabView | 'emergency';

export interface NavBarProps {
  current: NavView;
  onNavigate: (v: NavTabView) => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onOpenTips: () => void;
  onOpenEmergency: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}
type Props = NavBarProps;

const items: { key: NavTabView; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'practice', label: '학습' },
  { key: 'map', label: '미션' },
  { key: 'listen', label: '듣기' }, // 2026-08-01: 복습(가나·표현·장면별·약점)을 듣기 모드에 통합
  { key: 'gacha', label: '수집함' },
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

// "더보기" — 자주 안 쓰는 유틸(주야·팁·가이드·설정)을 눌러야 보이는 작은 메뉴로 접는다.
// 가로 스크롤(예전 방식)과 달리 버튼 하나로 명확히 보여, 존재 자체를 못 찾는 문제가 없다.
function MoreMenu({ theme, onToggleTheme, onOpenTips, onOpenGuide, onOpenSettings }: {
  theme: 'light' | 'dark'; onToggleTheme: () => void; onOpenTips: () => void; onOpenGuide: () => void; onOpenSettings: () => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const row: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
    border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink)', fontSize: 14, fontWeight: 700, textAlign: 'left',
  };
  const pick = (fn: () => void) => { fn(); setOpen(false); };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: '0 0 auto' }}>
      <CtrlButton icon="more" label="더보기" onClick={() => setOpen((v) => !v)} />
      {open && (
        <div role="menu" className="ym-reveal" style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 6, minWidth: 148, zIndex: 50,
          borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--surface)',
          boxShadow: 'var(--glass-shadow)', overflow: 'hidden', padding: 4,
        }}>
          <button className="ym-press" style={row} onClick={() => pick(onToggleTheme)}>
            <Icon name={theme === 'dark' ? 'theme-day' : 'theme-night'} size={17} /> 주야 전환
          </button>
          <button className="ym-press" style={row} onClick={() => pick(onOpenTips)}>
            <Icon name="tip" size={17} /> 팁
          </button>
          <button className="ym-press" style={row} onClick={() => pick(onOpenGuide)}>
            <Icon name="nav-guide" size={17} /> 가이드
          </button>
          <button className="ym-press" style={row} onClick={() => pick(onOpenSettings)}>
            <Icon name="nav-settings" size={17} /> 설정
          </button>
        </div>
      )}
    </div>
  );
}

export function NavBar({ current, onNavigate, onOpenGuide, onOpenSettings, onOpenTips, onOpenEmergency, theme, onToggleTheme }: Props) {
  const tab = (active: boolean): React.CSSProperties => ({
    border: 'none', background: 'none', cursor: 'pointer', fontSize: 15,
    padding: '4px 1px', color: active ? 'var(--ink)' : 'var(--ink-faint)',
    fontWeight: active ? 800 : 600, letterSpacing: '-0.03em',
    borderBottom: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    whiteSpace: 'nowrap', flex: '0 0 auto',
  });
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}>
      {items.map((it) => (
        <button key={it.key} style={tab(current === it.key)} onClick={() => onNavigate(it.key)}>
          {it.label}
        </button>
      ))}
      <span style={{ flex: 1, minWidth: 4 }} />
      <CtrlButton icon="emergency" label="긴급" tone="warn" onClick={onOpenEmergency} />
      <MoreMenu theme={theme} onToggleTheme={onToggleTheme} onOpenTips={onOpenTips} onOpenGuide={onOpenGuide} onOpenSettings={onOpenSettings} />
    </nav>
  );
}
