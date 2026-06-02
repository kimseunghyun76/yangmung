import type { CSSProperties } from 'react';

export type IconName =
  | 'nav-home' | 'nav-map' | 'nav-review' | 'nav-guide' | 'nav-settings'
  | 'theme-day' | 'theme-night' | 'back'
  | 'target' | 'kana' | 'sign' | 'dictation' | 'listen' | 'speak' | 'discover' | 'tip' | 'flow' | 'recovery'
  | 'check' | 'cross' | 'star' | 'trophy'
  | 'plus' | 'chart' | 'celebrate' | 'mode' | 'fast'
  | 'scene-store' | 'scene-conbini' | 'scene-restaurant' | 'scene-train' | 'scene-hotel' | 'scene-street'
  | 'scene-pharmacy' | 'scene-shopping' | 'scene-taxi' | 'scene-airport' | 'scene-exchange' | 'scene-locker'
  | 'scene-delivery' | 'scene-ramen';

interface Props {
  name: IconName;
  size?: number;
  style?: CSSProperties;
  title?: string;
}

export function Icon({ name, size = 18, style, title }: Props) {
  return (
    <span
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        backgroundColor: 'currentColor',
        WebkitMask: `url(/icons/${name}.svg) center / contain no-repeat`,
        mask: `url(/icons/${name}.svg) center / contain no-repeat`,
        verticalAlign: '-0.16em',
        ...style,
      }}
    />
  );
}
