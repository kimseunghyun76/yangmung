// "이제 읽을 수 있어요!" 갤러리 — 입문 전용. 세션 중간중간 하나씩 스치듯 보여주던 발견 카드 대신,
// 히라가나·가타카나를 모두 배운 뒤 지금까지 배운 가나만으로 읽을 수 있는 표현을 한 번에 모아 보여준다.
import { useEffect, useState } from 'react';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { MascotEmpty } from './mascot';

export interface DiscoverEntry { id: string; ja: string; korean: string; isNew: boolean }

interface Props {
  nav: NavBarProps;
  onBack: () => void;
  entries: DiscoverEntry[];
  onSeenAll: (ids: string[]) => void;
}

export function DiscoverGallery({ nav, onBack, entries, onSeenAll }: Props) {
  // 마운트 시점의 NEW 배지를 그대로 고정 — onSeenAll이 부모의 discovered를 갱신해도
  // 이번 화면을 보는 동안은 배지가 바로 사라지지 않고, 다음에 다시 열 때부터 반영된다.
  const [frozen] = useState(entries);
  useEffect(() => {
    if (frozen.length) onSeenAll(frozen.map((e) => e.id));
    // 처음 마운트될 때만 — entries가 바뀔 때마다 다시 부르면 setState 루프가 생긴다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '4px 0', marginBottom: 12,
      }}>← 뒤로</button>

      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase' }}>입문 전용</p>
        <h1 style={{ margin: '8px 0 4px', fontSize: 25, fontWeight: 900, letterSpacing: '-0.03em' }}>이제 읽을 수 있어요!</h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          지금까지 배운 히라가나·가타카나만으로 읽을 수 있는 표현이에요.
          {frozen.length > 0 && <> 지금 <strong style={{ color: 'var(--ink)' }}>{frozen.length}개</strong>를 읽을 수 있어요.</>}
        </p>
      </div>

      {frozen.length === 0 ? (
        <MascotEmpty who="mung" mood="default" title="아직 모을 표현이 없어요">
          히라가나·가타카나를 계속 익히면 읽을 수 있는 표현이 여기에 하나씩 쌓여요.
        </MascotEmpty>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {frozen.map((e) => (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: 14,
              border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)',
            }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <strong lang="ja" style={{ fontSize: 19, color: 'var(--ink)' }}>{e.ja}</strong>
                  {e.isNew && (
                    <span style={{ fontSize: 10, fontWeight: 900, padding: '2px 7px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accent-ink)' }}>NEW</span>
                  )}
                </span>
                <span style={{ display: 'block', marginTop: 3, fontSize: 13, color: 'var(--ink-soft)' }}>{e.korean}</span>
              </span>
              <button className="ym-press" onClick={() => speak(e.ja)} disabled={!ttsSupported()} aria-label="발음 듣기" style={{
                flex: '0 0 auto', width: 38, height: 38, borderRadius: 11, border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="listen" size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
