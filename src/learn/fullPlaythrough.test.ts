// 전체 완주 시뮬레이션 — "레벨별 모든 단계 + 모든 미션을 다 통과시키면" 로직이 안 깨지는지.
// 데이터 레벨 시뮬레이션이라 UI 배선 버그는 못 잡지만(별도로 브라우저 검증 필요),
// 진행/승급/완전마스터 상태에서의 크래시·비정상 값(NaN·undefined·무한루프)은 여기서 잡는다.
// 실행: npm run test:fullplaythrough
import { CONTENT } from '../content';
import { buildCards } from './cards';
import {
  recordKnown, missionProgress, kanaReadMastery, selectSessionCards, planSession,
  DEFAULT_SESSION_CONFIG, type ProgressMap,
} from './progress';
import { diagnose } from './adaptive';
import {
  LEVEL_STAGES, CORE_LEVELS, isStageUnlocked, levelAllComplete, markStageComplete, nextLevel,
  stageKey, type ProgressionState,
} from './progression';

let pass = 0, total = 0;
function check(name: string, cond: boolean, detail = '') {
  total++; if (cond) pass++;
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : detail ? ` — ${detail}` : ''}`);
}

const cards = buildCards();

console.log('=== 레벨 순차 완주(입문→고급) — 모든 단계 통과 시 승급 체인 ===');
{
  let prog: ProgressionState = { completed: [] };
  for (const level of CORE_LEVELS) {
    const stages = LEVEL_STAGES[level];
    if (stages.length === 0) {
      check(`${level} 단계 없음 → levelAllComplete 항상 true`, levelAllComplete(prog, level));
      continue;
    }
    for (let i = 0; i < stages.length; i++) {
      // 순차 완주 중이라 이 시점엔 0..i-1이 이미 완료돼 있어 i번째는 이미 열려 있어야 정상(잠금 자체의
      // 전이 테스트는 progression.test.ts에서 별도로 함 — 여기선 "끝까지 완주 가능한지"만 본다).
      check(`${level} "${stages[i].label}" 순서대로 도달 가능(열려 있음)`, isStageUnlocked(prog, level, i));
      prog = markStageComplete(prog, stageKey(level, stages[i].id));
      check(`${level} "${stages[i].label}" 완료 처리됨`, prog.completed.includes(stageKey(level, stages[i].id)));
    }
    check(`${level} 모든 단계 완료 → levelAllComplete`, levelAllComplete(prog, level));
  }
  check('advanced 다음 레벨 없음(최종 레벨)', nextLevel('advanced') === null);
  check('중복 완료 처리해도 안전(멱등)', (() => {
    const before = prog.completed.length;
    const after = markStageComplete(prog, stageKey('beginner', LEVEL_STAGES.beginner[0].id)).completed.length;
    return before === after;
  })());
}

console.log('\n=== 전체 50개 미션 완전 마스터 시뮬레이션 ===');
let progress: ProgressMap = {};
let sid = 1;
{
  const missions = CONTENT.missions.filter((m) => m.id !== 'C0');
  check('미션 총 개수 51개(C0 제외 50개)', missions.length === 50, `실제 ${missions.length}`);
  let crashed = 0;
  for (const m of missions) {
    const quizCards = cards.filter((c) => c.kind === 'quiz' && c.reviewTarget?.type === 'mission' && String(c.reviewTarget.id) === m.id);
    if (quizCards.length === 0) { crashed++; continue; }
    for (const c of quizCards) progress = recordKnown(progress, c.id, sid);
    sid++;
    const mp = missionProgress(cards, progress, m.id);
    if (mp.total === 0 || mp.mastered !== mp.total) crashed++;
  }
  check('모든 미션에 퀴즈 카드 존재 + 완전 마스터 도달', crashed === 0, `문제 미션 ${crashed}건`);
}

console.log('\n=== 가나(히라가나·가타카나) 전원 완전 마스터 ===');
{
  const hiraIds = CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id);
  const kataIds = CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id);
  for (const id of [...hiraIds, ...kataIds]) progress = recordKnown(progress, `kana:${id}:read`, sid);
  sid++;
  const hira = kanaReadMastery(progress, hiraIds);
  const kata = kanaReadMastery(progress, kataIds);
  check('히라가나 전원 마스터', hira.total > 0 && hira.mastered === hira.total, `${hira.mastered}/${hira.total}`);
  check('가타카나 전원 마스터', kata.total > 0 && kata.mastered === kata.total, `${kata.mastered}/${kata.total}`);
}

console.log('\n=== 완전 마스터 상태에서 진단·세션 계획이 안 깨지는지(크래시·NaN 방어) ===');
{
  let d: ReturnType<typeof diagnose> | null = null;
  try { d = diagnose(cards, progress, sid - 1); check('diagnose() 크래시 없음', true); }
  catch (e) { check('diagnose() 크래시 없음', false, String(e)); }
  if (d) {
    check('완전 마스터 상태 → level이 struggling이 아님', d.level !== 'struggling', `실제 level=${d.level}`);
    check('recentAccuracy가 NaN 아님', d.recentAccuracy === null || Number.isFinite(d.recentAccuracy));
    check('focus·message가 빈 문자열 아님', d.focus.length > 0 && d.message.length > 0);
  }

  let sessionCards: ReturnType<typeof selectSessionCards> | null = null;
  try { sessionCards = selectSessionCards(cards, progress, sid, DEFAULT_SESSION_CONFIG); check('selectSessionCards() 크래시 없음', true); }
  catch (e) { check('selectSessionCards() 크래시 없음', false, String(e)); }
  check('완전 마스터 상태에서도 세션이 빈 배열로 멈추지 않음(복습으로 채워짐)', !!sessionCards && sessionCards.length > 0, `길이=${sessionCards?.length}`);

  try {
    const plan = planSession(cards, progress, sid, DEFAULT_SESSION_CONFIG);
    check('planSession() 크래시 없음', true);
    check('planSession() size가 NaN 아님', Number.isFinite(plan.size));
  } catch (e) { check('planSession() 크래시 없음', false, String(e)); }
}

console.log(`\n결과: ${pass}/${total} ${pass === total ? 'PASS' : 'FAIL'}`);
if (pass !== total) process.exit(1);
