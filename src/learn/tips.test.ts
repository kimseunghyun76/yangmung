// 미션/연습 팁(문법·문화) 검증 — 항상 맨 앞에 붙는지, 관련 있으면 우선 고르는지, 반복을 피하는지.
// 실행: npm run test:tips
import { CONTENT } from '../content';
import { buildCards } from './cards';
import { selectMissionCards, type ProgressMap, type CardProgress } from './progress';
import { pickTipForMission, pickTipForTopic } from './tips';

let pass = 0, fail = 0;
function check(name: string, ok: boolean, detail = '') {
  if (ok) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`); }
}

const allCards = buildCards(2);
const MISSION_IDS = CONTENT.missions.filter((m) => m.id !== 'C0').map((m) => m.id as string);

console.log('=== 미션 팁 — 항상 맨 앞, 존재 보장 ===');
{
  let allHaveLeadingTip = true, missingDetail = '';
  for (const mid of MISSION_IDS) {
    const cards = selectMissionCards(allCards, mid, {});
    if (cards.length === 0) continue; // 카드 자체가 없는 미션은 대상 아님
    if (cards[0].kind !== 'tip') { allHaveLeadingTip = false; missingDetail = mid; break; }
  }
  check('모든 미션의 첫 카드가 tip(신규 유저 기준)', allHaveLeadingTip, missingDetail);
}

console.log('=== missionIds로 연결된 미션은 연관 팁을 우선 고름 ===');
{
  const grammarWithMissions = CONTENT.grammar.filter((g) => g.missionIds && g.missionIds.length > 0);
  check('missionIds가 부여된 팁이 존재함(콘텐츠 매핑 확인)', grammarWithMissions.length > 0, `실제 ${grammarWithMissions.length}개`);

  let allRelevant = true, detail = '';
  for (const g of grammarWithMissions) {
    for (const mid of g.missionIds!) {
      const tip = pickTipForMission(allCards, mid, {});
      if (!tip) { allRelevant = false; detail = `${mid}: 팁 없음`; break; }
      const relevantPool = allCards.filter((c) => c.kind === 'tip' && (c as { missionIds?: string[] }).missionIds?.includes(mid));
      if (relevantPool.length > 0 && !relevantPool.some((c) => c.id === tip.id)) {
        allRelevant = false; detail = `${mid}: 연관 팁 있는데 무관한 팁(${tip.id}) 선택됨`; break;
      }
    }
    if (!allRelevant) break;
  }
  check('연관 팁이 있는 미션은 항상 연관 팁 중에서 고름', allRelevant, detail);
}

console.log('=== 안 본 것 우선 → 다 보면 오래된 것부터(반복 최소화) ===');
{
  const mid = MISSION_IDS.find((id) => {
    const relevant = allCards.filter((c) => c.kind === 'tip' && (c as { missionIds?: string[] }).missionIds?.includes(id));
    return relevant.length >= 2;
  });
  check('연관 팁 2개 이상인 미션이 존재(회전 검증 대상 확보)', !!mid, mid ?? '없음');

  if (mid) {
    const relevant = allCards.filter((c) => c.kind === 'tip' && (c as { missionIds?: string[] }).missionIds?.includes(mid));
    const progress: ProgressMap = {};
    const picked = new Set<string>();
    for (let i = 0; i < relevant.length + 2; i++) {
      const tip = pickTipForMission(allCards, mid, progress);
      if (!tip) break;
      picked.add(tip.id);
      const prog: CardProgress = {
        attempts: 1, correct: 1, consecutiveCorrect: 1, lastResult: 'correct', lastSessionId: i,
        lastSeenAt: new Date(2026, 0, 1 + i).toISOString(), usedRecoveryEver: false,
      };
      progress[tip.id] = prog;
    }
    check('안 본 팁을 우선 소진하며 여러 개를 돌아가며 고름(중복 최소화)', picked.size >= Math.min(2, relevant.length), `실제 ${picked.size}종`);
  }
}

console.log('=== pickTipForTopic — 키워드 연관 우선, 없으면 폴백 ===');
{
  const cafeTip = pickTipForTopic(allCards, ['카페'], {});
  check('키워드 매칭 팁이 있으면 그중에서 고름', !!cafeTip && (cafeTip.label.includes('카페') || cafeTip.tipKo.includes('카페')), cafeTip?.id ?? 'null');

  const noMatch = pickTipForTopic(allCards, ['존재하지않는키워드zzz'], {});
  check('키워드 매칭이 없어도 전체 풀로 폴백해 null이 아님', !!noMatch);
}

console.log(`\n결과: ${pass}/${pass + fail} PASS`);
if (fail > 0) process.exitCode = 1;
