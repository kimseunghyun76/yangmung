// 미션 오픈 — 랜덤 순차 모델. 가챠/카드와 무관(가챠는 수집 전용).
// 최초 접근: 랜덤 1개 오픈. 오픈된 미션을 SCENE_UNLOCK_THRESHOLD번 이상 학습하면
// 남은 미션 중 하나를 무작위 추첨해 1개 더 오픈한다.
import { missionExperiencedCount, SCENE_UNLOCK_THRESHOLD, type ProgressMap } from './progress';
import { CONTENT } from '../content';

const KEY = 'yangmung:openmissions:v1';

function mainMissions(): string[] {
  return CONTENT.missions.filter((m) => m.id !== 'C0').map((m) => m.id);
}

export function loadOpenMissions(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

export function saveOpenMissions(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify([...new Set(ids)])); } catch {}
}

export function resetOpenMissions(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(KEY); } catch {}
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// 진척에 맞춰 오픈 목록을 보충. 랜덤 추첨이 포함되므로 순수 함수는 아니다.
// (오픈된 미션 중 충분히 학습한 수 + 1만큼 오픈을 유지 — 새로 열릴 미션은 무작위 추첨.)
export function reconcileOpenMissions(open: string[], progress: ProgressMap): string[] {
  const pool = mainMissions();
  let result = open.filter((id) => pool.includes(id));
  if (result.length === 0) result = [pick(pool)]; // 최초 1개 랜덤 오픈
  const matured = result.filter((id) => missionExperiencedCount(progress, id) >= SCENE_UNLOCK_THRESHOLD).length;
  const target = Math.min(pool.length, 1 + matured);
  while (result.length < target) {
    const closed = pool.filter((id) => !result.includes(id));
    if (closed.length === 0) break;
    result.push(pick(closed)); // 다음 미션 랜덤 추첨
  }
  return result;
}

// 장면이 열려 있는가 — openMissions(랜덤 순차) 기준. C0 튜토리얼·개발해제는 항상 열림.
export function isSceneOpen(missionId: string, openMissions: string[], devUnlockAll = false): boolean {
  if (devUnlockAll) return true;
  if (missionId === 'C0') return true;
  return openMissions.includes(missionId);
}
