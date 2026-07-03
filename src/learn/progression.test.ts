// progression.ts 단위 테스트 — 레벨별 순차 잠금/완료/승급 로직.
// 실행: npm run test:progression  (실패 시 exit 1)
import {
  LEVEL_STAGES, stageKey, isStageComplete, isStageUnlocked, levelAllComplete,
  markStageComplete, nextStageIndex, nextLevel, coreLevelOf, type ProgressionState,
} from './progression';

let pass = 0, total = 0;
function check(name: string, cond: boolean) {
  total++; if (cond) pass++;
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}`);
}

const empty: ProgressionState = { completed: [] };

console.log('=== 순차 잠금 ===');
check('첫 단계는 항상 열림', isStageUnlocked(empty, 'beginner', 0));
check('두 번째 단계는 처음엔 잠김', !isStageUnlocked(empty, 'beginner', 1));
{
  const s = markStageComplete(empty, stageKey('beginner', 'hiragana'));
  check('히라가나 완료 → 가타카나 열림', isStageUnlocked(s, 'beginner', 1));
  check('히라가나 완료 → 발음구분(2)은 아직 잠김', !isStageUnlocked(s, 'beginner', 2));
  check('isStageComplete 반영', isStageComplete(s, 'beginner', 'hiragana'));
}

console.log('=== 완료/다음 단계 ===');
check('빈 상태 nextStageIndex=0', nextStageIndex(empty, 'beginner') === 0);
{
  let s = empty;
  for (const st of LEVEL_STAGES.beginner) s = markStageComplete(s, stageKey('beginner', st.id));
  check('모든 단계 완료 → levelAllComplete', levelAllComplete(s, 'beginner'));
  check('모든 단계 완료 → nextStageIndex=-1', nextStageIndex(s, 'beginner') === -1);
  check('다른 레벨은 영향 없음(기본 미완료)', !levelAllComplete(s, 'default'));
}

console.log('=== 멱등성/승급 ===');
{
  const s1 = markStageComplete(empty, stageKey('beginner', 'pairs'));
  const s2 = markStageComplete(s1, stageKey('beginner', 'pairs'));
  check('중복 완료 무시(멱등)', s2.completed.length === 1);
}
check('nextLevel: beginner→default', nextLevel('beginner') === 'default');
check('nextLevel: advanced→null', nextLevel('advanced') === null);
check('고급(받아쓰기) 빈 상태는 미완료', !levelAllComplete(empty, 'advanced'));
{
  const s = markStageComplete(empty, stageKey('advanced', 'dictation'));
  check('고급 받아쓰기 완료 → levelAllComplete', levelAllComplete(s, 'advanced'));
}

console.log('=== coreLevelOf ===');
check('express 그대로', coreLevelOf('express') === 'express');
check('review → beginner로 폴백', coreLevelOf('review') === 'beginner');
check('kana → beginner로 폴백', coreLevelOf('kana') === 'beginner');

console.log(`\n결과: ${pass}/${total} ${pass === total ? 'PASS' : 'FAIL'}`);
if (pass !== total) process.exit(1);
