// 나선형 난이도 — 설계 1(표현 확장 사슬 buildsOn) 단위 테스트. SPIRAL_DIFFICULTY_BRIEF.md.
// 선행 표현이 mastered일 때만 후속 표현이 fresh 풀에 등장하는지 검증.
// 실행: npm run test:spiral
import { CONTENT } from '../content';
import type { Phrase } from '../content';
import type { QuizCard } from './cards';
import { isPhraseUnlocked, masteredPhraseIds, recordAttempt, selectSessionCards, type ProgressMap } from './progress';

let pass = 0, total = 0;
function check(name: string, cond: boolean) {
  total++; if (cond) pass++;
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}`);
}

// 테스트 전용 3단 사슬을 실제 CONTENT.phrases에 임시로 밀어넣는다(이 프로세스 안에서만 유효 —
// 각 test:* 스크립트는 별도 프로세스로 실행돼 다른 테스트 파일에 영향 없음).
const P1: Phrase = { id: 'spiral_test_p1', kana: 'これをください', korean: '이거 주세요', register: 'productive' };
const P2: Phrase = { id: 'spiral_test_p2', kana: 'これをふたつください', korean: '이거 두 개 주세요', register: 'productive', buildsOn: ['spiral_test_p1'] };
const P3: Phrase = { id: 'spiral_test_p3', kana: 'ふくろもおねがいします', korean: '봉투도 부탁드려요', register: 'productive', buildsOn: ['spiral_test_p2'] };
CONTENT.phrases.push(P1, P2, P3);

function quizCard(id: string, phraseId: string): QuizCard {
  return { kind: 'quiz', id, tag: 't', banner: 'b', sub: 's', choices: [], reviewTarget: { type: 'phrase', id: phraseId } };
}
const q1 = quizCard('spiral:q1:read', P1.id);
const q2 = quizCard('spiral:q2:read', P2.id);
const q3 = quizCard('spiral:q3:read', P3.id);
const allCards = [q1, q2, q3];

console.log('=== isPhraseUnlocked — 선행 없음/충족/미충족 ===');
{
  check('buildsOn 없으면 항상 해금', isPhraseUnlocked('아무거나', new Set()));
  check('선행이 mastered 집합에 있으면 해금', isPhraseUnlocked(P2.id, new Set([P1.id])));
  check('선행이 mastered 집합에 없으면 잠김', !isPhraseUnlocked(P2.id, new Set()));
  check('사슬 2단계(P3)는 P2까지 있어야 해금 — P1만으론 부족', !isPhraseUnlocked(P3.id, new Set([P1.id])));
  check('사슬 2단계(P3) — P2까지 있으면 해금', isPhraseUnlocked(P3.id, new Set([P1.id, P2.id])));
}

console.log('=== masteredPhraseIds — consecutiveCorrect>=2인 표현만 mastered로 집계 ===');
{
  let progress: ProgressMap = {};
  check('진척 없음 → 빈 집합', masteredPhraseIds(allCards, progress).size === 0);
  progress = recordAttempt(progress, q1.id, { correct: true, usedRecovery: false, sessionId: 1 });
  check('1회 정답만으론 아직 mastered 아님', !masteredPhraseIds(allCards, progress).has(P1.id));
  progress = recordAttempt(progress, q1.id, { correct: true, usedRecovery: false, sessionId: 2 });
  check('2연속 정답 → mastered', masteredPhraseIds(allCards, progress).has(P1.id));
}

console.log('=== selectSessionCards 통합 — 선행 미숙련 → 후속 미출제 / mastered → 후속 fresh 등장 ===');
{
  const config = { quotas: { K: 0, B: 10, C: 0, P: 0, tip: 0 }, minFresh: { K: 0, B: 10, C: 0 } };
  // currentSessionId를 항상 기록된 sessionId보다 넉넉히 크게 잡아 cooldown 판정과 섞이지 않게 한다.
  const idsInDeck = (progress: ProgressMap) => new Set(selectSessionCards(allCards, progress, 100, config).map((c) => c.id));

  const freshDeck = idsInDeck({});
  check('선행 미숙련 상태 → P1(선행 없음)만 등장, P2·P3는 안 나옴', freshDeck.has(q1.id) && !freshDeck.has(q2.id) && !freshDeck.has(q3.id));

  let progress: ProgressMap = {};
  for (let s = 1; s <= 2; s++) progress = recordAttempt(progress, q1.id, { correct: true, usedRecovery: false, sessionId: s });
  const afterP1 = idsInDeck(progress);
  check('P1 mastered → P2가 fresh로 등장(P3는 아직)', afterP1.has(q2.id) && !afterP1.has(q3.id));

  for (let s = 3; s <= 4; s++) progress = recordAttempt(progress, q2.id, { correct: true, usedRecovery: false, sessionId: s });
  const afterP2 = idsInDeck(progress);
  check('P1·P2 모두 mastered → 사슬 3단계(P3)까지 순차 해금', afterP2.has(q3.id));
}

console.log(`\n결과: ${pass}/${total} ${pass === total ? 'PASS' : 'FAIL'}`);
if (pass !== total) process.exitCode = 1;
