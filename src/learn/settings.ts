// 사용자 설정 — LocalStorage. 발음 보조 모드·자동 음성 재생.
export type ReadingAidMode = 'auto' | 'always' | 'off';
export interface Settings {
  readingAid: ReadingAidMode; // auto=익히면 사라짐, always=항상, off=끔
  autoPlay: boolean;          // 듣기 카드 진입 시 자동 재생
}

const KEY = 'yangmung:settings:v1';
const DEFAULTS: Settings = { readingAid: 'auto', autoPlay: true };

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : { ...DEFAULTS };
  } catch { return { ...DEFAULTS }; }
}

export function saveSettings(s: Settings): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
