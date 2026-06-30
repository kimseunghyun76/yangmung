// missionMix.ts 단위 테스트 — 미션 난이도 이동 창.
// 실행: npm run test:missionmix
import { missionTierWindow } from './missionMix';

let pass = 0, total = 0;
function check(name: string, cond: boolean) {
  total++; if (cond) pass++;
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}`);
}
const eq = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];

console.log('=== missionTierWindow ===');
check('신규(전부 0) → [1,1] 초급만', eq(missionTierWindow([0, 0, 0, 0, 0]), [1, 1]));
check('tier1 진행중(0.5) → [1,2] 초급+기본', eq(missionTierWindow([0.5, 0, 0, 0, 0]), [1, 2]));
check('tier1 숙련(0.8) → [2,3] 초급 제외', eq(missionTierWindow([0.8, 0.1, 0, 0, 0]), [2, 3]));
check('tier1·2 숙련 → [3,4]', eq(missionTierWindow([0.8, 0.7, 0.1, 0, 0]), [3, 4]));
check('tier1~3 숙련 → [4,5]', eq(missionTierWindow([0.9, 0.8, 0.7, 0.2, 0]), [4, 5]));
check('전부 숙련 → [5,5]', eq(missionTierWindow([0.9, 0.9, 0.9, 0.9, 0.9]), [5, 5]));
check('상위가 비어도 하위부터 연속만 카운트', eq(missionTierWindow([0.2, 0.9, 0.9, 0, 0]), [1, 1]));
check('하위 미숙련이면 상위 무시(tier1 0.5만) → [1,2]', eq(missionTierWindow([0.5, 0.9, 0.9, 0, 0]), [1, 2]));

console.log(`\n결과: ${pass}/${total} ${pass === total ? 'PASS' : 'FAIL'}`);
if (pass !== total) process.exit(1);
