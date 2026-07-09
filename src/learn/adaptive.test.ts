// 적응형 엔진 테스트 — 진단/동적 난이도가 의도대로 동작하는지.
// 실행: npm run test:adaptive
import { buildCards, type Card } from './cards';
type QuizC = Extract<Card, { kind: 'quiz' }>;
import { diagnose, adaptSessionConfig } from './adaptive';
import { itemMastery, type CardProgress, type ProgressMap, type SessionConfig } from './progress';
import { check } from '../test/check';

const cards = buildCards();

// 진척 엔트리 헬퍼
function mk(o: Partial<CardProgress>): CardProgress {
  return {
    attempts: 1, correct: 1, lastSeenAt: new Date().toISOString(),
    usedRecoveryEver: false, consecutiveCorrect: 0, lastResult: 'correct', lastSessionId: 0, ...o,
  };
}

const readCard = cards.find((c): c is QuizC => c.kind === 'quiz' && c.reviewTarget?.type === 'kana' && c.id.endsWith(':read'))!;
const missionQuiz = cards.find((c): c is QuizC => c.kind === 'quiz' && c.reviewTarget?.type === 'mission')!;
const base: SessionConfig = { quotas: { K: 6, B: 3, C: 5, P: 2, tip: 1 }, minFresh: { K: 2, B: 1, C: 2 } };

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

console.log('\n=== 진단: 며칠 만에 재접속(daysSinceLastVisit) ===');
{
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
  // 신규(진척 없음) → null이어야(복습 권유 문구가 잘못 뜨면 안 됨)
  const dNew = diagnose(cards, {}, 0);
  check('진척 없음 → daysSinceLastVisit null', dNew.daysSinceLastVisit === null);
  check('진척 없음 → focus/message에 재접속 문구 없음', !dNew.focus.includes('만이') && !dNew.message.includes('만이'));

  // 오늘(0~1일) → 평소 메시지, 재접속 문구 없음
  const pToday: ProgressMap = { a: mk({ lastSeenAt: daysAgo(0) }) };
  const dToday = diagnose(cards, pToday, 0);
  check('당일 재접속 → daysSinceLastVisit 0', dToday.daysSinceLastVisit === 0);
  check('당일 재접속 → 재접속 문구 없음', !dToday.focus.includes('만이'));

  // 3일 만 → "N일 만이에요" 문구 + adaptSessionConfig가 minFresh를 낮춤
  const p3: ProgressMap = { a: mk({ lastSeenAt: daysAgo(3) }) };
  const d3 = diagnose(cards, p3, 0);
  check('3일 만 → daysSinceLastVisit 3', d3.daysSinceLastVisit === 3);
  check('3일 만 → focus에 "3일 만" 포함', d3.focus.includes('3일 만'));
  check('3일 만 → message에 복습 비중 문구', d3.message.includes('복습'));
  const { config: c3, changed: ch3 } = adaptSessionConfig(base, d3);
  check('3일 만 → 신규 유입(minFresh) 감소', ch3 && c3.minFresh.K < base.minFresh.K && c3.minFresh.C < base.minFresh.C);
  check('3일 만 → 세션 길이(quota)는 유지', c3.quotas.K === base.quotas.K && c3.quotas.C === base.quotas.C);

  // 10일 만(오랜만) → "오랜만" 문구 + minFresh 전부 0(복습 최우선)
  const p10: ProgressMap = { a: mk({ lastSeenAt: daysAgo(10) }) };
  const d10 = diagnose(cards, p10, 0);
  check('10일 만 → daysSinceLastVisit 10', d10.daysSinceLastVisit === 10);
  check('10일 만 → focus에 "오랜만" 포함', d10.focus.includes('오랜만'));
  const { config: c10 } = adaptSessionConfig(base, d10);
  check('10일 만 → 신규 유입(minFresh) 전부 0(복습 최우선)', c10.minFresh.K === 0 && c10.minFresh.B === 0 && c10.minFresh.C === 0);

  // 더 긴 공백(20일)이 3일보다 minFresh를 더(또는 같게) 낮춰야 "그만큼 복습"이 성립
  const p20: ProgressMap = { a: mk({ lastSeenAt: daysAgo(20) }) };
  const d20 = diagnose(cards, p20, 0);
  const { config: c20 } = adaptSessionConfig(base, d20);
  check('공백이 길수록 minFresh.C가 짧은 공백보다 크지 않음(단조 감소)', c20.minFresh.C <= c3.minFresh.C);
}
