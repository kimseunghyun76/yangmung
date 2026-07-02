// 변형 사다리 단위 테스트 — SPIRAL_DIFFICULTY_BRIEF.md 설계 2.
// 숙련도가 낮으면 읽기(쉬움)를, 오르면 듣기→산출(어려움)로 자연히 옮겨가는지 검증.
// 실행: npm run test:variantladder  (실패 시 exit 1)
import {
  formRank, conceptMastery, desiredFormRank, pickFreshestVariant,
  recordAttempt, type ProgressMap,
} from './progress';
import type { QuizCard } from './cards';

let pass = 0, total = 0;
function check(name: string, cond: boolean) {
  total++; if (cond) pass++;
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}`);
}

// 최소 QuizCard 픽스처 — reviewTarget만 있으면 pickFreshestVariant엔 충분.
// id 규칙은 실제 콘텐츠와 동일: kana:xxx:read / listen:xxx / ko2ja:xxx / dictation:xxx.
function quiz(id: string): QuizCard {
  return { kind: 'quiz', id, tag: 't', banner: 'b', sub: 's', choices: [], reviewTarget: { type: 'phrase', id: 'p1' } };
}
const readCard = quiz('p1:read');
const listenCard = quiz('listen:p1');
const ko2jaCard = quiz('ko2ja:p1');
const variants = [readCard, listenCard, ko2jaCard];

console.log('=== formRank — 형태별 난이도 등급 ===');
{
  check('읽기(:read) = 0', formRank('p1:read') === 0);
  check('듣기(listen:) = 1', formRank('listen:p1') === 1);
  check('듣고 일본어(hear2ja:) = 1', formRank('hear2ja:p1') === 1);
  check('한→일(ko2ja:) = 2', formRank('ko2ja:p1') === 2);
  check('받아쓰기(dictation:) = 3', formRank('dictation:p1') === 3);
  check('발음구분(:confuse) = 4', formRank('sign:x:confuse') === 4);
  check('읽기 < 듣기 < 한→일 < 받아쓰기', formRank('p1:read') < formRank('listen:p1') && formRank('listen:p1') < formRank('ko2ja:p1') && formRank('ko2ja:p1') < formRank('dictation:p1'));
}

console.log('=== conceptMastery / desiredFormRank — 숙련도→요구 난이도 매핑 ===');
{
  check('아무 형태도 안 봄 → 숙련도 0', conceptMastery(variants, {}) === 0);
  check('숙련도 0 → 요구 등급 0(읽기)', desiredFormRank(0) === 0);
  check('숙련도 0.3 → 요구 등급 1(듣기)', desiredFormRank(0.3) === 1);
  check('숙련도 0.6 → 요구 등급 2(산출)', desiredFormRank(0.6) === 2);
  check('숙련도 1.0 → 요구 등급 2(산출)', desiredFormRank(1.0) === 2);
}

console.log('=== pickFreshestVariant — 신규 학습자(진척 없음)는 기존과 동일하게 읽기부터 ===');
{
  const rep = pickFreshestVariant(variants, {});
  check('진척 0 → 읽기(가장 부드러운 형태) 선택', rep.id === 'p1:read');
}

console.log('=== pickFreshestVariant — 숙련도가 오르면 사다리를 타고 어려운 형태로 ===');
{
  // 세 형태 모두 여러 번 정답 처리해 숙련도를 인위적으로 올린다.
  let progress: ProgressMap = {};
  for (const id of ['p1:read', 'listen:p1', 'ko2ja:p1']) {
    for (let s = 1; s <= 3; s++) {
      progress = recordAttempt(progress, id, { correct: true, usedRecovery: false, sessionId: s, fast: true });
    }
  }
  const mastery = conceptMastery(variants, progress);
  check('반복 정답 후 숙련도가 0.6 이상으로 상승', mastery >= 0.6);
  // 숙련도가 높아도 "가장 안 본" 규칙은 유지 — lastSeenAt을 강제로 벌려 read/listen을 더 오래된 것으로 만든다.
  progress['p1:read'] = { ...progress['p1:read'], lastSeenAt: '2020-01-01T00:00:00.000Z' };
  progress['listen:p1'] = { ...progress['listen:p1'], lastSeenAt: '2020-01-02T00:00:00.000Z' };
  progress['ko2ja:p1'] = { ...progress['ko2ja:p1'], lastSeenAt: '2024-01-01T00:00:00.000Z' };
  const rep = pickFreshestVariant(variants, progress);
  check('숙련도 높음 + read가 가장 오래됨이어도 산출형(ko2ja) 우선', rep.id === 'ko2ja:p1');
}

console.log('=== pickFreshestVariant — 사다리 등급의 형태가 없으면 전체로 폴백 ===');
{
  // read/listen만 있고 ko2ja가 없는 개념 — 숙련도가 높아져도 산출형이 아예 없으면 안전하게 폴백.
  const twoForms = [readCard, listenCard];
  let progress: ProgressMap = {};
  for (const id of ['p1:read', 'listen:p1']) {
    for (let s = 1; s <= 3; s++) progress = recordAttempt(progress, id, { correct: true, usedRecovery: false, sessionId: s, fast: true });
  }
  const rep = pickFreshestVariant(twoForms, progress);
  check('산출형 없음 → 폴백으로 두 형태 중 하나 정상 선택', rep.id === 'p1:read' || rep.id === 'listen:p1');
}

console.log(`\n결과: ${pass}/${total} PASS`);
if (pass !== total) process.exitCode = 1;
