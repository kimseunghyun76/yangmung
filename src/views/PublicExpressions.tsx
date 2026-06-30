// 공공 표현 — 간판·메뉴와 방송 메시지를 한 메뉴로 묶어 학습. (독립 뷰; App/Practice에서 연결)
// 간판은 기존 startSignSession을, 방송은 selectAnnouncementDeck을 세션으로 띄우도록 콜백을 받는다.
import { ANNOUNCEMENT_CATEGORIES, type AnnouncementCategory } from '../content/announcements';
import { announcementCounts } from '../learn/announcementCards';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { GlassPanel, PrimaryAction } from './shell';

interface Props {
  nav: NavBarProps;
  onBack: () => void;
  onStartSigns: () => void;
  onStartAnnouncements: (category?: AnnouncementCategory) => void;
}

const label: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase',
};

export function PublicExpressions({ nav, onBack, onStartSigns, onStartAnnouncements }: Props) {
  const counts = announcementCounts();
  const totalAnnounce = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '4px 0', marginBottom: 12,
      }}>← 홈으로</button>

      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, ...label }}>공공 표현</p>
        <h1 style={{ margin: '8px 0 4px', fontSize: 25, fontWeight: 900, letterSpacing: '-0.03em' }}>간판 · 방송 한 곳에서</h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          거리의 <strong style={{ color: 'var(--ink)' }}>간판·메뉴</strong>와 전철·공항·버스에서 늘 들리는 <strong style={{ color: 'var(--ink)' }}>방송 메시지</strong>를 함께 익혀요.
        </p>
      </div>

      {/* 간판·메뉴 */}
      <GlassPanel>
        <p style={{ margin: 0, ...label }}>간판 · 메뉴 읽기</p>
        <button className="ym-press" onClick={onStartSigns} style={{
          width: '100%', marginTop: 10, display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left',
          padding: '14px 14px', borderRadius: 14, cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
        }}>
          <span style={{ fontSize: 26 }}>🪧</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 800 }}>간판·메뉴 읽기</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700, marginTop: 1 }}>역·식당·주의 표지 — 入口·会計·禁煙</span>
          </span>
          <Icon name="flow" size={18} style={{ color: 'var(--ink-faint)' }} />
        </button>
      </GlassPanel>

      {/* 방송 메시지 */}
      <div style={{ marginTop: 14 }}>
        <GlassPanel>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, ...label }}>방송 메시지 듣기</p>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-faint)' }}>총 {totalAnnounce}개</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
            {ANNOUNCEMENT_CATEGORIES.map((c) => (
              <button key={c.id} className="ym-press" onClick={() => onStartAnnouncements(c.id)} style={{
                display: 'flex', flexDirection: 'column', textAlign: 'left', gap: 4, minWidth: 0,
                padding: '13px 13px', borderRadius: 14, cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
              }}>
                <span style={{ fontSize: 24 }}>{c.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
                <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.sub}</span>
                <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 800 }}>{counts[c.id]}개 · 듣기 학습</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <PrimaryAction onClick={() => onStartAnnouncements(undefined)}>
              <Icon name="listen" size={18} /> 전체 방송 모아 듣기
            </PrimaryAction>
          </div>
        </GlassPanel>
      </div>
    </main>
  );
}
