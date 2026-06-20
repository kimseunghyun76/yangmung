// 속도전 모드별 최고 기록 — localStorage. 점수(반응속도·콤보 가산)와 최고 콤보를 보관.
import type { FlashMode } from './progress';

export interface FlashBest { score: number; combo: number }
type Store = Partial<Record<FlashMode, FlashBest>>;

const KEY = 'yangmung:flash:v1';

function load(): Store {
  if (typeof window === 'undefined') return {};
  try { const raw = window.localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as Store) : {}; } catch { return {}; }
}

export function loadFlashBest(mode: FlashMode): FlashBest {
  return load()[mode] ?? { score: 0, combo: 0 };
}

// 기록 갱신 후 "신기록 여부"를 돌려준다(점수 기준).
export function saveFlashRun(mode: FlashMode, score: number, combo: number): { isRecord: boolean; prev: FlashBest } {
  const store = load();
  const prev = store[mode] ?? { score: 0, combo: 0 };
  const isRecord = score > prev.score;
  store[mode] = { score: Math.max(prev.score, score), combo: Math.max(prev.combo, combo) };
  try { window.localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
  return { isRecord, prev };
}

export function resetFlashBest(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(KEY); } catch {}
}
