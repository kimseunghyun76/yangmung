// 적응형 엔진 테스트 — 진단/동적 난이도가 의도대로 동작하는지.
// 실행: npm run test:adaptive
import { buildCards, type Card } from './cards';
type QuizC = Extract<Card, { kind: 'quiz' }>;
import { diagnose, adaptSessionConfig } from './adaptive';
import { itemMastery, type CardProgress, type ProgressMap, type SessionConfig } from './progress';

const cards = buildCards();
let pass = 0, total = 0;
function check(name: string, cond: boolean) {
  total++; if (cond) pass++;
  console.log(`  ${cond ? '✅' : '❌'} ${name}`);
}

// 진척 엔트리 헬퍼
function mk(o: Partial<CardProgress>): CardProgress {
  return {
    attempts: 1, correct: 1, lastSeenAt: new Date().toISOString(),
    usedRecoveryEver: false, consecutiveCorrect: 0, lastResult: 'correct', lastSessionId: 0, ...o,
  };
}

const readCard = cards.find((c): c is QuizC => c.kind === 'quiz' && c.reviewTarget?.type === 'kana' && c.id.endsWith(':read'))!;
const missionQuiz = cards.find((c): c is QuizC => c.kind === 'quiz' && c.reviewTarget?.type === 'mission')!;
const base: SessionConfig = { quotas: { K: 6, B: 3, C: 5, tip: 1 }, minFresh: { K: 2, B: 1, C: 2 } };

console.log('=== itemMastery 단조성 ===');
check('미시도=0', itemMastery(undefined) === 0 && itemMastery(mk({ attempts: 0 })) === 0);
check('연속정답 많을수록 ↑', itemMastery(mk({ attempts: 4, correct: 4, consecutiveCorrect: 4 })) > itemMastery(mk({ attempts: 4, correct: 2, consecutiveCorrect: 1 })));
check('최근 오답 페널티', itemMastery(mk({ attempts: 3, correct: 2, consecutiveCorrect: 1, lastResult: 'wrong' })) < itemMastery(mk({ attempts: 3, correct: 2, consecutiveCorrect: 1, lastResult: 'correct' })));
check('복구 페널티', itemMastery(mk({ attempts: 3, correct: 3, consecutiveCorrect: 2, usedRecoveryEver: true })) < itemMastery(mk({ attempts: 3, correct: 3, consecutiveCorrect: 2 })));

console.log('\n=== 진단: 신호 부족 ===');
{
  const d = diagnose(cards, {}, 0);
  check('빈 진척 → level null', d.level === null);
  check('빈 진척 → 안내 메시지', d.message.includes('분석'));
  check('빈 진척 → seen 0', d.seen === 0);
}

console.log('\n=== 진단: struggling(저성과) ===');
{
  // 직전 세션(=3)에서 다수 오답 → 정답률 낮음
  const p: ProgressMap = {};
  for (let i = 0; i < 6; i++) p[`x${i}`] = mk({ attempts: 2, correct: 0, lastResult: 'wrong', lastSessionId: 3 });
  const d = diagnose(cards, p, 3);
  check('struggling 판정', d.level === 'struggling');
  check('정답률 낮게 추정', (d.recentAccuracy ?? 1) < 0.62);
  const { config, changed } = adaptSessionConfig(base, d);
  check('struggling → 신규 유입 감소', changed && config.minFresh.K < base.minFresh.K && config.minFresh.B === 0);
  check('세션 길이(quota)는 유지', config.quotas.K === base.quotas.K && config.quotas.C === base.quotas.C);
}

console.log('\n=== 진단: cruising(고성과) ===');
{
  const p: ProgressMap = {};
  for (let i = 0; i < 6; i++) p[`y${i}`] = mk({ attempts: 2, correct: 2, consecutiveCorrect: 3, lastResult: 'correct', lastSessionId: 5 });
  const d = diagnose(cards, p, 5);
  check('cruising 판정', d.level === 'cruising');
  const { config } = adaptSessionConfig(base, d);
  check('cruising → 신규 유입 증가', config.minFresh.K > base.minFresh.K && config.minFresh.C > base.minFresh.C);
}

console.log('\n=== 진단: 약점 항목 ===');
{
  const p: ProgressMap = {
    [readCard.id]: mk({ attempts: 4, correct: 0, consecutiveCorrect: 0, lastResult: 'wrong', lastSessionId: 2 }),
    [missionQuiz.id]: mk({ attempts: 3, correct: 0, consecutiveCorrect: 0, lastResult: 'wrong', lastSessionId: 2 }),
  };
  const d = diagnose(cards, p, 2);
  check('약한 글자 검출', d.weakKana.some((w) => w.key === String(readCard.reviewTarget!.id)));
  check('약한 장면 검출', d.weakScenes.some((w) => w.key === String(missionQuiz.reviewTarget!.id)));
  check('focus가 약점을 가리킴', d.focus.length > 0 && d.focus !== '약점 복습 + 새 표현 확장');
}

console.log('\n=== 진단: 잘하는 항목은 약점 아님 ===');
{
  const p: ProgressMap = {
    [readCard.id]: mk({ attempts: 4, correct: 4, consecutiveCorrect: 4, lastResult: 'correct', lastSessionId: 2 }),
  };
  const d = diagnose(cards, p, 2);
  check('숙련 글자는 weakKana 제외', !d.weakKana.some((w) => w.key === String(readCard.reviewTarget!.id)));
}

console.log(`\n결과: ${pass}/${total} PASS`);
if (pass !== total) process.exit(1);
