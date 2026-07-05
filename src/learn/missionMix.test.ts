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

console.log('\n=== missionTierWindow — 레벨별 floorTier(상위 레벨은 앞 tier 건너뜀) ===');
// 고급(floor 3) 신규: tier3부터 시작, tier1~2는 건너뜀.
check('floor3 신규(전부 0) → [3,3] tier3만', eq(missionTierWindow([0, 0, 0, 0, 0], 3), [3, 3]));
check('floor3 tier3 진행중(0.5) → [3,4]', eq(missionTierWindow([0, 0, 0.5, 0, 0], 3), [3, 4]));
check('floor3 tier3 숙련 → [4,5]', eq(missionTierWindow([0, 0, 0.8, 0.1, 0], 3), [4, 5]));
check('floor3 tier3·4 숙련 → [5,5]', eq(missionTierWindow([0, 0, 0.8, 0.7, 0.1], 3), [5, 5]));
check('floor3 하한 미만 진척은 무시(tier1·2 숙련도 [3,3])', eq(missionTierWindow([0.9, 0.9, 0, 0, 0], 3), [3, 3]));
// 중급(floor 2) 신규: tier2부터.
check('floor2 신규 → [2,2] tier2만', eq(missionTierWindow([0, 0, 0, 0, 0], 2), [2, 2]));
check('floor2 tier2 진행중(0.5) → [2,3]', eq(missionTierWindow([0, 0.5, 0, 0, 0], 2), [2, 3]));
// floor는 위로만 밀어 올림 — 이미 상위까지 숙련한 유저는 창이 낮아지지 않음.
check('floor2라도 전부 숙련이면 [5,5](하한이 창을 낮추지 않음)', eq(missionTierWindow([0.9, 0.9, 0.9, 0.9, 0.9], 2), [5, 5]));
check('floor1(기본)은 기존과 동일 [1,1]', eq(missionTierWindow([0, 0, 0, 0, 0], 1), [1, 1]));

console.log(`\n결과: ${pass}/${total} ${pass === total ? 'PASS' : 'FAIL'}`);
if (pass !== total) process.exit(1);
