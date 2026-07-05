// 명장면 대화 · 추천 음악 가사 학습 — 한 메뉴에 두 섹션. (독립 뷰; App/Practice에서 연결)
// ⚠️ 콘텐츠는 저작권 안전을 위한 오리지널 샘플. 라이선스 확보 시 실제 대사·가사로 교체 가능.
import { DIALOGUE_SCENES, DIALOGUE_GENRES } from '../content/sceneDialogues';
import { SONGS, SONG_MOODS } from '../content/songLyrics';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { GlassPanel } from './shell';

interface Props {
  nav: NavBarProps;
  onBack: () => void;
  onStartDialogue: (sceneId: string) => void;
  onStartSong: (songId: string) => void;
}

const label: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase',
};
const genreLabel = (g: string) => DIALOGUE_GENRES.find((x) => x.id === g)?.label ?? g;
const genreIcon = (g: string) => DIALOGUE_GENRES.find((x) => x.id === g)?.icon ?? '🎬';
const moodLabel = (m: string) => SONG_MOODS.find((x) => x.id === m)?.label ?? m;
const moodIcon = (m: string) => SONG_MOODS.find((x) => x.id === m)?.icon ?? '🎵';

export function EntertainmentLearning({ nav, onBack, onStartDialogue, onStartSong }: Props) {
  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '4px 0', marginBottom: 12,
      }}>← 뒤로</button>

      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, ...label }}>엔터테인먼트로 배우기</p>
        <h1 style={{ margin: '8px 0 4px', fontSize: 25, fontWeight: 900, letterSpacing: '-0.03em' }}>명장면 대화 · 노래 가사</h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          드라마·애니 <strong style={{ color: 'var(--ink)' }}>명장면 대화</strong>와 추천 <strong style={{ color: 'var(--ink)' }}>노래 가사</strong>로 살아있는 표현을 익혀요.
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 11.5, color: 'var(--ink-faint)' }}>※ 지금은 학습용 오리지널 샘플이에요.</p>
      </div>

      {/* 명장면 대화 */}
      <GlassPanel>
        <p style={{ margin: 0, ...label }}>명장면 대화</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
          {DIALOGUE_SCENES.map((s) => (
            <button key={s.id} className="ym-press" onClick={() => onStartDialogue(s.id)} style={rowBtn}>
              <span style={{ fontSize: 24 }}>{genreIcon(s.genre)}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{genreLabel(s.genre)} · {s.lines.length}대사 · {s.setup}</span>
              </span>
              <Icon name="flow" size={18} style={{ color: 'var(--ink-faint)', flex: '0 0 18px' }} />
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* 추천 음악 가사 */}
      <div style={{ marginTop: 14 }}>
        <GlassPanel>
          <p style={{ margin: 0, ...label }}>추천 음악 가사</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
            {SONGS.map((s) => (
              <button key={s.id} className="ym-press" onClick={() => onStartSong(s.id)} style={rowBtn}>
                <span style={{ fontSize: 24 }}>{moodIcon(s.mood)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                  <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{moodLabel(s.mood)} · {s.lines.length}소절 · {s.note}</span>
                </span>
                <Icon name="flow" size={18} style={{ color: 'var(--ink-faint)', flex: '0 0 18px' }} />
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>
    </main>
  );
}

const rowBtn: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
  padding: '13px 14px', borderRadius: 14, cursor: 'pointer',
  border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
};
