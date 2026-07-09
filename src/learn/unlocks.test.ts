// unlocks.ts 단위 테스트 — 미션 랜덤 순차 오픈 모델.
// 실행: npm run test:unlocks  (실패 시 exit 1)
import { reconcileOpenMissions, isSceneOpen } from './unlocks';
import { SCENE_UNLOCK_THRESHOLD, type ProgressMap, type CardProgress } from './progress';
import { CONTENT } from '../content';
import { check } from '../test/check';


const POOL: string[] = CONTENT.missions.filter((m) => m.id !== 'C0').map((m) => m.id);
const cp = (): CardProgress => ({ attempts: 1, correct: 1, consecutiveCorrect: 1, lastResult: 'correct', lastSeenAt: '', lastSessionId: 1, usedRecoveryEver: false });
// 미션을 n번 학습한 progress (키: mission:ID:i)
function studied(id: string, n: number): ProgressMap {
  const p: ProgressMap = {};
  for (let i = 0; i < n; i++) p[`mission:${id}:${i}`] = cp();
  return p;
}

console.log('=== reconcileOpenMissions ===');
{
  // 여러 번 반복해도 항상 1개·유효 미션 (랜덤 안정성)
  let allOne = true, allValid = true;
  for (let t = 0; t < 30; t++) {
    const a = reconcileOpenMissions([], {});
    if (a.length !== 1) allOne = false;
    if (!POOL.includes(a[0]) || a[0] === 'C0') allValid = false;
  }
  check('최초(빈 목록) → 항상 정확히 1개 오픈', allOne);
  check('최초 오픈은 항상 풀 안의 유효 미션(C0 제외)', allValid);
}
{
  const seed = POOL[0];
  const a = reconcileOpenMissions([seed], studied(seed, SCENE_UNLOCK_THRESHOLD));
  check(`${SCENE_UNLOCK_THRESHOLD}회 학습 → 다음 1개 더 오픈(총 2)`, a.length === 2);
  check('기존 오픈은 유지', a.includes(seed));
  check('추가 오픈은 풀에 속하고 기존과 중복 아님', POOL.includes(a[1]) && a[1] !== seed);
}
{
  const seed = POOL[0];
  const a = reconcileOpenMissions([seed], studied(seed, SCENE_UNLOCK_THRESHOLD - 1));
  check('threshold 미만 학습 → 오픈 그대로(1개)', a.length === 1 && a[0] === seed);
}
{
  const [s0, s1] = [POOL[0], POOL[1]];
  const prog = { ...studied(s0, SCENE_UNLOCK_THRESHOLD), ...studied(s1, SCENE_UNLOCK_THRESHOLD) };
  const a = reconcileOpenMissions([s0, s1], prog);
  check('성숙 2개 → 오픈 3개(2+1)', a.length === 3);
}
{
  // 전부 열리고 전부 성숙해도 풀 크기를 넘지 않음
  const prog: ProgressMap = {};
  for (const id of POOL) Object.assign(prog, studied(id, SCENE_UNLOCK_THRESHOLD));
  const a = reconcileOpenMissions([...POOL], prog);
  check('오픈은 풀 크기를 넘지 않음', a.length === POOL.length);
}
{
  const a = reconcileOpenMissions(['ZZZ_invalid', POOL[0]], {});
  check('풀에 없는 잘못된 id는 제거', !a.includes('ZZZ_invalid') && a.includes(POOL[0]));
}

console.log('\n=== reconcileOpenMissions — tierWindow(실력 범위) ===');
{
  const tierOf = new Map<string, number>(CONTENT.missions.map((m) => [m.id, m.tier ?? 1]));
  // 신규 유저(tierWindow [1,1]) — 최초 오픈은 항상 tier1이어야 한다(버그 이전엔 완전 무작위였음).
  let allTier1 = true;
  for (let t = 0; t < 50; t++) {
    const a = reconcileOpenMissions([], {}, [1, 1]);
    if (tierOf.get(a[0]) !== 1) allTier1 = false;
  }
  check('tierWindow[1,1] → 최초 오픈은 항상 tier1', allTier1);
}
{
  const tierOf = new Map<string, number>(CONTENT.missions.map((m) => [m.id, m.tier ?? 1]));
  let allTier34 = true;
  for (let t = 0; t < 50; t++) {
    const a = reconcileOpenMissions([], {}, [3, 4]);
    const tt = tierOf.get(a[0])!;
    if (tt < 3 || tt > 4) allTier34 = false;
  }
  check('tierWindow[3,4] → 최초 오픈은 항상 tier3~4', allTier34);
}
{
  // 추가 오픈(성숙 시)도 tierWindow를 따른다.
  const tierOf = new Map<string, number>(CONTENT.missions.map((m) => [m.id, m.tier ?? 1]));
  const tier1Ids = POOL.filter((id) => tierOf.get(id) === 1);
  const seed = tier1Ids[0];
  let allInWindow = true;
  for (let t = 0; t < 50; t++) {
    const a = reconcileOpenMissions([seed], studied(seed, SCENE_UNLOCK_THRESHOLD), [1, 1]);
    if (a.length !== 2) { allInWindow = false; continue; }
    if (tierOf.get(a[1]) !== 1) allInWindow = false;
  }
  check('성숙 후 추가 오픈도 tierWindow[1,1] 범위 안', allInWindow);
}
{
  // 안전장치: window 밖에 이미 성숙한 후보만 남아도(극단적 상황) 무한루프·크래시 없이 폴백.
  const a = reconcileOpenMissions([], {}, [9, 9]); // 존재하지 않는 tier — 전체 폴백 확인
  check('범위 밖 tierWindow도 크래시 없이 폴백(전체 후보 사용)', a.length === 1 && POOL.includes(a[0]));
}

console.log('\n=== reconcileOpenMissions — 레벨 상승 시 하한 미만 미시작 미션 정리 ===');
{
  const tierOf = new Map<string, number>(CONTENT.missions.map((m) => [m.id, m.tier ?? 1]));
  const tier1 = POOL.filter((id) => tierOf.get(id) === 1);
  const tier3 = POOL.filter((id) => tierOf.get(id) === 3);
  // 고급 배치(floor 3): 초기에 시드됐던 tier1 미션(미학습)은 제거되고 tier3 미션으로 교체.
  {
    let allTier3 = true, noTier1Leftover = true;
    for (let t = 0; t < 30; t++) {
      const a = reconcileOpenMissions([tier1[0]], {}, [3, 4], 3); // 미학습 tier1 시드 + 창 [3,4] + 하한 3
      if (a.includes(tier1[0])) noTier1Leftover = false;
      if (!a.every((id) => { const tt = tierOf.get(id)!; return tt >= 3 && tt <= 4; })) allTier3 = false;
    }
    check('미학습 tier1 시드가 하한3에서 제거됨', noTier1Leftover);
    check('교체된 미션은 창(3~4) 안', allTier3);
  }
  // 이미 학습한(경험 있는) 하한 미만 미션은 유지 — 진척 보존.
  {
    const seed = tier1[0];
    const prog = studied(seed, 1); // 한 번 경험
    const a = reconcileOpenMissions([seed], prog, [3, 4], 3);
    check('학습한 tier1 미션은 하한3에서도 유지(복습 보존)', a.includes(seed));
  }
  // 하한 미만 미학습만 있고 나머지가 비면 → 창 안에서 새로 시드(빈 목록 방지).
  {
    const a = reconcileOpenMissions([tier1[0]], {}, [3, 3], 3);
    check('전부 제거돼도 창 안 미션으로 재시드(1개 이상)', a.length >= 1 && a.every((id) => tierOf.get(id) === 3));
    check('재시드는 tier3 실제 존재 확인', tier3.length > 0);
  }
  // 하한 1(입문/기본)은 정리 안 함 — 기존 동작 보존.
  {
    const a = reconcileOpenMissions([tier1[0]], {}, [1, 2], 1);
    check('하한1이면 tier1 시드 유지(입문 기존 동작)', a.includes(tier1[0]));
  }
}

console.log('\n=== isSceneOpen ===');
{
  check('C0(튜토리얼)은 항상 열림', isSceneOpen('C0', []));
  check('devUnlockAll이면 모두 열림', isSceneOpen('C9', [], true));
  check('목록에 있으면 열림', isSceneOpen('C9', ['C9']));
  check('목록에 없으면 닫힘', !isSceneOpen('C9', ['C1']));
}
