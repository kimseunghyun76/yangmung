// 미션 오픈 — 랜덤 순차 모델. 가챠/카드와 무관(가챠는 수집 전용).
// 최초 접근: 랜덤 1개 오픈. 오픈된 미션을 SCENE_UNLOCK_THRESHOLD번 이상 학습하면
// 남은 미션 중 하나를 무작위 추첨해 1개 더 오픈한다.
// tierWindow(선택)가 주어지면 그 난이도 범위 안에서 우선 추첨 — 실력에 안 맞는 미션이
// "오늘의 미션"으로 노출되는 걸 막는다. 범위 안에 후보가 없을 때만 전체로 폴백.
import { missionExperiencedCount, SCENE_UNLOCK_THRESHOLD, type ProgressMap } from './progress';
import { CONTENT } from '../content';

const KEY = 'yangmung:openmissions:v1';

function mainMissions(): string[] {
  return CONTENT.missions.filter((m) => m.id !== 'C0').map((m) => m.id);
}

const missionTier = new Map<string, number>(CONTENT.missions.map((m) => [m.id, m.tier ?? 1]));

// 후보 중 tierWindow 범위 안의 것을 우선 사용. 창이 비면 "레벨 하한(floorTier) 이상" 미션을
// 하한 미만보다 먼저 연다 — 고급 사용자가 tier1~2로 새지 않고 tier3~5(창 밖 낙오 포함)를 먼저 소진하게 하고,
// 그마저 없을 때만(완전 정복 단계) 하한 미만을 최후로 연다(막다른 상황·완주 보장).
// floorTier와 window[0]는 다를 수 있다: 창은 실력으로 [5,5]까지 오르지만 하한은 레벨 고정값(예: 고급 3).
function narrowToWindow(candidates: string[], tierWindow?: [number, number], floorTier = 1): string[] {
  if (!tierWindow) return candidates;
  const [lo, hi] = tierWindow;
  const tierOf = (id: string) => missionTier.get(id) ?? 1;
  const inWindow = candidates.filter((id) => { const t = tierOf(id); return t >= lo && t <= hi; });
  if (inWindow.length > 0) return inWindow;
  const atOrAboveFloor = candidates.filter((id) => tierOf(id) >= floorTier); // 하한 이상(창 밖 낙오 상위 tier 포함) 우선
  if (atOrAboveFloor.length > 0) return atOrAboveFloor;
  return candidates; // 최후: 하한 미만 포함 전체(완전 정복 시 완주용)
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
// 개방 목표는 "현재 난이도 창 안"에서 충분히 학습한 수 + 1 — 창이 전진하면 그 창의 미션을 새로 확보한다.
// (핵심: 창 밖으로 밀려난 지난 tier 미션은 목표 계산에서 제외해야, 창이 올라갔을 때 새 tier 미션이 열린다.
//  전엔 창 밖 성숙 미션까지 세어 목표가 이미 충족→새 미션이 안 열려 진행이 막히는 버그가 있었다.)
// 창 밖 기존 open 미션은 복습용으로 보존한다(닫지 않음).
export function reconcileOpenMissions(open: string[], progress: ProgressMap, tierWindow?: [number, number], floorTier = 1): string[] {
  const pool = mainMissions();
  const tierOf = (id: string) => missionTier.get(id) ?? 1;
  const inWin = (id: string) => !tierWindow || (tierOf(id) >= tierWindow[0] && tierOf(id) <= tierWindow[1]);
  let result = open.filter((id) => pool.includes(id));
  // 레벨 상승으로 하한이 오른 경우: 아직 한 번도 안 한(자동 시드) 하한 미만 미션은 정리한다.
  // 고급으로 배치되면 초기에 시드됐던 tier1 미션을 상위로 교체 — 단, 이미 학습한(경험 ≥1) 미션은 복습 위해 유지.
  // 기준은 floorTier(레벨 고정 하한) — 실력으로 오른 window[0]가 아님(그러면 상위 tier 낙오까지 잘림).
  if (floorTier > 1) {
    result = result.filter((id) => tierOf(id) >= floorTier || missionExperiencedCount(progress, id) > 0);
  }
  // 창 안에서 충분히 학습(경험 ≥ threshold)한 수 + 1 만큼 창 안 미션을 확보(전진 시 새 tier 확장).
  const inWindowMatured = result.filter((id) => inWin(id) && missionExperiencedCount(progress, id) >= SCENE_UNLOCK_THRESHOLD).length;
  const target = 1 + inWindowMatured;
  let guard = 0;
  while (result.filter(inWin).length < target && guard++ < pool.length) {
    const closedInWin = pool.filter((id) => !result.includes(id) && inWin(id));
    if (closedInWin.length === 0) break;
    result.push(pick(closedInWin)); // 창 안에서 무작위 추첨
  }
  // 창 안 후보가 아예 없는 막다른 창(예: 존재하지 않는 tier)에서도 최소 1개는 보장.
  if (result.length === 0) result = [pick(narrowToWindow(pool, tierWindow, floorTier))];
  return result;
}

// 장면이 열려 있는가 — openMissions(랜덤 순차) 기준. C0 튜토리얼·개발해제는 항상 열림.
export function isSceneOpen(missionId: string, openMissions: string[], devUnlockAll = false): boolean {
  if (devUnlockAll) return true;
  if (missionId === 'C0') return true;
  return openMissions.includes(missionId);
}
