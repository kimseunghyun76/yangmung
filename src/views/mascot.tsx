// 마스코트 공용 — yang/mung 얼굴·말풍선 + 카피 뱅크 + 빈도 게이트.
// 기준: MASCOT_DIRECTION.md (해요체 통일 / 이벤트성 등장 / 표시 레이어만, 로직 불변).
import { useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export type Who = 'yang' | 'mung' | 'duo';
export type MascotMood = 'default' | 'tip' | 'recovery' | 'correct' | 'wrong' | 'done' | 'loading';

const FACE: Record<Who, string> = {
  yang: '/mascots/yang-cat-face.webp',   // 설명·정확성 코치
  mung: '/mascots/mung-shiba-face.webp', // 응원·복구 코치
  duo: '/mascots/yangmung-duo-logo.webp', // 홈·완료·특별 보상만
};
const MOOD_FACE: Partial<Record<Who, Partial<Record<MascotMood, string>>>> = {
  yang: { tip: '/mascots/yang-tip.webp', loading: '/mascots/yang-loading.webp' },
  mung: { correct: '/mascots/mung-correct.webp', wrong: '/mascots/mung-wrong.webp', recovery: '/mascots/mung-recovery.webp' },
  duo: { done: '/mascots/yangmung-duo-done.webp' },
};

// 얼굴만 (빈 상태·로딩·인라인). 장식이므로 aria-hidden.
export function MascotFace({ who, mood = 'default', size = 32, style }: { who: Who; mood?: MascotMood; size?: number; style?: CSSProperties }) {
  return (
    <img src={MOOD_FACE[who]?.[mood] ?? FACE[who]} alt="" aria-hidden width={size} height={size} loading="lazy"
      style={{ objectFit: 'contain', flex: `0 0 ${size}px`, ...style }} />
  );
}

// 말풍선 — 얼굴 + 글래스 버블 한 줄. 등장은 부드럽게(ym-rise).
export function MascotBubble({ who, children, mood = 'default', size = 40, tone = 'glass', style }: {
  who: Who; children: ReactNode; mood?: MascotMood; size?: number; tone?: 'glass' | 'plain'; style?: CSSProperties;
}) {
  return (
    <div className="ym-rise" style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <MascotFace who={who} mood={mood} size={size} />
      <div
        className={tone === 'glass' ? 'ym-glass-strong' : undefined}
        style={{
          flex: 1, padding: '10px 13px', borderRadius: 14, fontSize: 14, lineHeight: 1.45, color: 'var(--ink)',
          border: '1px solid var(--glass-border)',
          background: tone === 'glass' ? undefined : 'transparent',
          backdropFilter: tone === 'glass' ? 'blur(10px)' : undefined,
          WebkitBackdropFilter: tone === 'glass' ? 'blur(10px)' : undefined,
        }}
      >{children}</div>
    </div>
  );
}

// 빈 상태·로딩용. 학습 흐름을 방해하지 않게 얼굴 중심으로 작게만 노출.
export function MascotEmpty({ who = 'yang', mood = 'default', title, children, size = 58, style }: {
  who?: Who;
  mood?: MascotMood;
  title?: ReactNode;
  children: ReactNode;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '18px 12px',
      textAlign: 'center',
      color: 'var(--ink-soft)',
      ...style,
    }}>
      <MascotFace who={who} mood={mood} size={size} style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.14))' }} />
      {title && <strong style={{ color: 'var(--ink)', fontSize: 15, lineHeight: 1.35 }}>{title}</strong>}
      <p style={{ color: 'var(--ink-faint)', fontSize: 13, lineHeight: 1.5, margin: 0, maxWidth: 260 }}>{children}</p>
    </div>
  );
}

// ── 카피 뱅크 (해요체·성인 톤·1줄·이모지 0~1) ──────────────
export type CopyKey = 'introYang' | 'correct' | 'wrong' | 'recovery' | 'tip' | 'introducePhrase' | 'doneDuo' | 'empty';

const POOLS: Record<CopyKey, string[]> = {
  introYang: ['오늘은 {place} 차례예요. 같이 가봐요.', '{place}에서 쓰는 말, 천천히 익혀요.', '{place} 한 판, 짧게 가볼게요.'],
  correct: ['좋아요, 그거예요.', '자연스러웠어요.', '한 걸음 더 가볼까요?', '깔끔했어요.'],
  wrong: ['괜찮아요, 이게 더 자연스러워요.', '거의 다 왔어요.', '이 상황엔 이렇게 말해요.'],
  recovery: ['막혀도 이렇게 넘어가면 돼요.', '실패 아니에요 — 좋은 전략이에요.', '이 한마디면 충분해요.'],
  tip: ['여기선 이 한 끗이 포인트예요.', '이건 이렇게 기억해요.', '딱 이것만 챙겨요.'],
  introducePhrase: ['이 표현, 같이 봐요.', '소리부터 익혀볼게요.', '한 번 들어볼까요?'],
  doneDuo: ['오늘도 한 장면 해냈어요!', '여권에 도장 하나 더.', '이 기세로 가요.'],
  empty: ['아직 비어 있어요 — 한 판 하면 채워져요.', '여기는 곧 채워질 거예요.'],
};

const WHO_OF: Record<CopyKey, Who> = {
  introYang: 'yang', correct: 'mung', wrong: 'mung', recovery: 'mung',
  tip: 'yang', introducePhrase: 'yang', doneDuo: 'duo', empty: 'yang',
};
export const mascotWho = (key: CopyKey): Who => WHO_OF[key];

const lastIdx: Partial<Record<CopyKey, number>> = {};
// 카피 1줄 선택 — 직전과 다른 것으로 회전. {place} 치환.
export function mascotCopy(key: CopyKey, vars?: { place?: string }): string {
  const pool = POOLS[key];
  let n = Math.floor(Math.random() * pool.length);
  if (pool.length > 1 && n === lastIdx[key]) n = (n + 1) % pool.length;
  lastIdx[key] = n;
  let s = pool[n];
  if (vars?.place) s = s.replace('{place}', vars.place);
  return s;
}

// 빈도 게이트 — 오답·복구·팁·완료·인트로는 항상, 정답은 가끔(3카드마다, 인덱스 기반 안정적).
export function mascotShows(event: CopyKey, cardIndex = 0): boolean {
  if (event === 'correct') return cardIndex % 3 === 0;
  return true;
}

// 카피 1줄을 마운트 시 1회만 뽑아 고정(리렌더로 문구가 바뀌지 않게). 카드별 remount는 key로.
export function MascotLine({ copyKey, who, place, size = 36, style }: {
  copyKey: CopyKey; who?: Who; place?: string; size?: number; style?: CSSProperties;
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const text = useMemo(() => mascotCopy(copyKey, place ? { place } : undefined), []);
  const actual = who ?? mascotWho(copyKey);
  const mood: MascotMood =
    copyKey === 'tip' || copyKey === 'introducePhrase' ? 'tip'
    : copyKey === 'correct' ? 'correct'
    : copyKey === 'wrong' ? 'wrong'
    : copyKey === 'recovery' ? 'recovery'
    : copyKey === 'doneDuo' ? 'done'
    : 'default';
  return <MascotBubble who={actual} mood={mood} size={size} style={style}>{text}</MascotBubble>;
}
