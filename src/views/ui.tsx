// 공용 화면 프리미티브 — 모든 페이지가 같은 볼드 모던 언어를 쓰도록 한곳에서.
import { useState, type CSSProperties, type ReactNode } from 'react';
import { RADIUS, SHADOW } from '../ui/styles';
import { Icon, type IconName } from '../ui/Icon';
import { isMangaSceneImage } from './scene';

// 장면 썸네일 — 테마 적응 모노 아이콘(currentColor=장면 색)을 중립 타일에. 라이트/다크 자동.
export function SceneThumb({ icon, accent, size = 48, muted = false }: { icon: IconName; accent: string; size?: number; muted?: boolean }) {
  return (
    <span style={{
      width: size, height: size, flex: `0 0 ${size}px`, borderRadius: 13,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface-2)', border: '1.5px solid var(--border)',
      color: muted ? 'var(--ink-faint)' : accent, opacity: muted ? 0.7 : 1,
    }}>
      <Icon name={icon} size={Math.round(size * 0.56)} />
    </span>
  );
}

// 장면 이미지 썸네일 — 생성 배경이 있으면 사진을 쓰고, 실패하면 기존 모노 아이콘으로 안전하게 폴백.
export function SceneImageThumb({ src, icon, accent, size = 64, muted = false, style }: {
  src?: string;
  icon: IconName;
  accent: string;
  size?: number;
  muted?: boolean;
  style?: CSSProperties;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <SceneThumb icon={icon} accent={accent} size={size} muted={muted} />;
  const showFullImage = isMangaSceneImage(src);
  return (
    <span style={{
      position: 'relative',
      overflow: 'hidden',
      width: size,
      height: size,
      flex: `0 0 ${size}px`,
      borderRadius: Math.max(14, Math.round(size * 0.24)),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid var(--glass-border)',
      background: `linear-gradient(135deg, ${accent}22, var(--glass-bg-strong))`,
      opacity: muted ? 0.62 : 1,
      boxShadow: muted ? undefined : `0 14px 34px ${accent}20`,
      ...style,
    }}>
      {showFullImage && (
        <img
          src={src}
          alt=""
          aria-hidden
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: 0.22,
            filter: 'blur(10px) saturate(0.96) contrast(1.04)',
          }}
        />
      )}
      <img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        onError={() => setFailed(true)}
        style={{
          position: 'absolute',
          inset: showFullImage ? 4 : 0,
          width: showFullImage ? 'calc(100% - 8px)' : '100%',
          height: showFullImage ? 'calc(100% - 8px)' : '100%',
          objectFit: showFullImage ? 'contain' : 'cover',
          filter: 'saturate(0.96) contrast(1.04)',
        }}
      />
      <span aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.34))' }} />
      <span style={{ position: 'relative', color: '#fff', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.42))', display: 'inline-flex' }}>
        <Icon name={icon} size={Math.round(size * 0.38)} />
      </span>
    </span>
  );
}

// 얇은 구분선
export const Rule = ({ m = 24 }: { m?: number }) => <hr className="ym-rule" style={{ margin: `${m}px 0` }} />;

// 섹션 라벨 (朱 사각 + 굵은 텍스트) — .ym-kicker 사용
export const Kicker = ({ children }: { children: ReactNode }) => <p className="ym-kicker" style={{ margin: 0 }}>{children}</p>;

// 페이지 헤더 — 큰 헤비 타이틀 + 朱 언더바 + 부제. 전 페이지 통일.
export function PageHead({ title, sub }: { title: ReactNode; sub?: ReactNode }) {
  return (
    <header style={{ marginBottom: 22 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      <span style={{ display: 'block', width: 44, height: 5, background: 'var(--accent)', borderRadius: 3, marginTop: 10 }} />
      {sub && <p style={{ color: 'var(--ink-soft)', margin: '12px 0 0', fontSize: 14, lineHeight: 1.5 }}>{sub}</p>}
    </header>
  );
}

// 솔리드/테두리 블록 — 청키 카드. tone: surface | ink | accent.
export function Block({ tone = 'surface', pop = false, style, children }: {
  tone?: 'surface' | 'ink' | 'accent'; pop?: boolean; style?: CSSProperties; children: ReactNode;
}) {
  const tones: Record<string, CSSProperties> = {
    surface: { background: 'var(--surface)', color: 'var(--ink)', border: '1.5px solid var(--border)' },
    ink: { background: 'var(--hero)', color: 'var(--surface)', border: '1.5px solid var(--ink)' },
    accent: { background: 'var(--accent)', color: 'var(--accent-ink)', border: '1.5px solid var(--ink)' },
  };
  return (
    <div style={{ borderRadius: RADIUS.lg, padding: 18, ...tones[tone], boxShadow: pop ? SHADOW.pop : undefined, ...style }}>
      {children}
    </div>
  );
}

// 뒤로가기/나가기 텍스트 버튼
export function BackLink({ label = '← 뒤로', onClick }: { label?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)', padding: '4px 0', marginBottom: 8 }}>
      {label}
    </button>
  );
}
