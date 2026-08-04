// 이동 중 학습 전용 전체화면 — 마스코트가 말풍선으로 문장을 말해주는 형태로 크게 보여준다.
// 계기: "한자와 섞이니 발음 외우는 게 쉽지 않다 / 이동중 학습에는 마스코트와 함께 말풍선 형태로
// 전체 화면 크게 보기 모드가 필요하다"(2026-08-04). 그래서 BigTextOverlay(상대에게 보여주는 용도,
// 검은 배경에 문장만)와 목적이 다르다 — 이쪽은 내가 외우는 용도라 읽기(가나)를 크게 분리해 주고
// 뜻까지 함께 띄운다.
import { createPortal } from 'react-dom';
import { Icon } from '../ui/Icon';
import { Furigana } from './Furigana';
import { MascotFace, type Who } from './mascot';

interface Props {
  kanji?: string;
  kana: string;
  korean: string;
  /** 재생/일시정지 — 화면을 크게 띄운 채로도 듣기를 이어서 조작할 수 있게. */
  playing?: boolean;
  onTogglePlay?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** 목록 위치 표시(1 / 24) */
  position?: { index: number; total: number };
  who?: Who;
  onClose: () => void;
}

export function SpeechBubbleStage({
  kanji, kana, korean, playing, onTogglePlay, onPrev, onNext, position, who = 'mung', onClose,
}: Props) {
  if (typeof document === 'undefined') return null;

  const ctrl: React.CSSProperties = {
    width: 52, height: 52, borderRadius: 999, cursor: 'pointer',
    border: '1px solid rgba(255,255,255,.26)', background: 'rgba(255,255,255,.10)', color: '#fff',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${kanji ?? kana} — ${korean}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 210,
        background: 'radial-gradient(circle at 50% 22%, #2c2118, #14100b 62%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'max(28px, env(safe-area-inset-top)) 20px max(24px, env(safe-area-inset-bottom))',
      }}
    >
      <button
        aria-label="닫기"
        onClick={onClose}
        style={{
          position: 'absolute', top: 'max(16px, env(safe-area-inset-top))', right: 16,
          width: 44, height: 44, borderRadius: 999, border: '1px solid rgba(255,255,255,.28)',
          background: 'rgba(255,255,255,.08)', color: '#fff', fontSize: 20, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >✕</button>

      {position && (
        <p style={{ position: 'absolute', top: 'max(24px, env(safe-area-inset-top))', left: 20, margin: 0, fontSize: 13, fontWeight: 850, color: 'rgba(255,247,235,.55)', fontVariantNumeric: 'tabular-nums' }}>
          {position.index} / {position.total}
        </p>
      )}

      {/* 말풍선 — 문장(후리가나)과 뜻을 한 덩어리로. 꼬리는 아래 마스코트 쪽을 향한다. */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 620 }}>
        <div style={{
          padding: '30px 26px', borderRadius: 28,
          background: 'rgba(255,247,235,.97)', color: '#1a130c',
          boxShadow: '0 22px 60px rgba(0,0,0,.45)', textAlign: 'center',
        }}>
          <Furigana kanji={kanji} kana={kana} style={{
            display: 'block', fontSize: 'clamp(30px, 9vw, 56px)', fontWeight: 900, lineHeight: 1.75,
            overflowWrap: 'anywhere', color: '#1a130c',
          }} />
          <p style={{ margin: '18px 0 0', fontSize: 'clamp(15px, 4vw, 20px)', fontWeight: 750, color: '#8a5a2b' }}>{korean}</p>
        </div>
        {/* 말풍선 꼬리 */}
        <span aria-hidden style={{
          position: 'absolute', left: '50%', bottom: -14, transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '15px solid transparent', borderRight: '15px solid transparent',
          borderTop: '18px solid rgba(255,247,235,.97)',
        }} />
      </div>

      <MascotFace who={who} size={92} style={{ marginTop: 28 }} />

      {(onTogglePlay || onPrev || onNext) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 26 }}>
          {onPrev && (
            <button className="ym-press" aria-label="이전 문장" onClick={onPrev} style={ctrl}>
              <Icon name="back" size={20} />
            </button>
          )}
          {onTogglePlay && (
            <button className="ym-press" aria-label={playing ? '일시정지' : '재생'} onClick={onTogglePlay}
              style={{ ...ctrl, width: 72, height: 72, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)' }}>
              <Icon name={playing ? 'cross' : 'listen'} size={30} />
            </button>
          )}
          {onNext && (
            <button className="ym-press" aria-label="다음 문장" onClick={onNext} style={{ ...ctrl, transform: 'scaleX(-1)' }}>
              <Icon name="back" size={20} />
            </button>
          )}
        </div>
      )}

      <p style={{ margin: '22px 0 0', fontSize: 12, color: 'rgba(255,247,235,.4)' }}>화면이 켜진 채로 계속 재생돼요</p>
    </div>,
    document.body,
  );
}
