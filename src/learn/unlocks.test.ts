// unlocks.ts 단위 테스트 — 미션 랜덤 순차 오픈 모델.
// 실행: npm run test:unlocks  (실패 시 exit 1)
import { reconcileOpenMissions, isSceneOpen } from './unlocks';
import { SCENE_UNLOCK_THRESHOLD, type ProgressMap, type CardProgress } from './progress';
import { CONTENT } from '../content';

let pass = 0, total = 0;
function check(name: string, cond: boolean) {
  total++; if (cond) pass++;
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}`);
}

const POOL = CONTENT.missions.filter((m) => m.id !== 'C0').map((m) => m.id);
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

console.log('\n=== isSceneOpen ===');
{
  check('C0(튜토리얼)은 항상 열림', isSceneOpen('C0', []));
  check('devUnlockAll이면 모두 열림', isSceneOpen('C9', [], true));
  check('목록에 있으면 열림', isSceneOpen('C9', ['C9']));
  check('목록에 없으면 닫힘', !isSceneOpen('C9', ['C1']));
}

console.log(`\n결과: ${pass}/${total} ${pass === total ? 'PASS' : 'FAIL'}`);
if (pass !== total) process.exit(1);
