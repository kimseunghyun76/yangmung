// 카드로 해제한 장면 — localStorage. 경험치 해제(progress)와 병행한다.
// 장면이 "열림"인 조건: 개발용 전체해제 OR 경험치 해제(isMissionUnlocked) OR 카드 해제(여기).
import { isMissionUnlocked, type ProgressMap } from './progress';

const KEY = 'yangmung:unlocks:v1';

export function loadCardUnlocks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

export function saveCardUnlocks(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify([...new Set(ids)])); } catch {}
}

export function addCardUnlock(ids: string[], id: string): string[] {
  return [...new Set([...ids, id])];
}

export function resetCardUnlocks(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(KEY); } catch {}
}

// 장면이 열려 있는가 — 경험치/카드/개발해제 통합 판정.
export function isSceneOpen(
  missionId: string,
  progress: ProgressMap,
  cardUnlocks: string[],
  devUnlockAll = false,
): boolean {
  if (devUnlockAll) return true;
  if (cardUnlocks.includes(missionId)) return true;
  return isMissionUnlocked(missionId, progress);
}
