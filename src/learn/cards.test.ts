// cards.ts 통합 테스트 — buildCards()가 만든 전체 카드 세트의 구조 무결성.
// id 유일성(진척 추적의 전제), 카드별 필수 필드, 퀴즈 정답 보장 등을 검증한다.
// 실행: npm run test:cards  (실패 시 exit 1)
import { buildCards, materializeQuizCard, type Card } from './cards';

let pass = 0, total = 0;
function check(name: string, cond: boolean, detail = '') {
  total++; if (cond) pass++;
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : detail ? ` — ${detail}` : ''}`);
}

const cards = buildCards();
const KINDS = new Set(['quiz', 'tip', 'introduce', 'order', 'speak', 'dictation', 'discover']);

console.log('=== 기본 ===');
check('카드 비어있지 않음', cards.length > 0, `len=${cards.length}`);
check('모든 카드 kind 유효', cards.every((c) => KINDS.has(c.kind)),
  cards.filter((c) => !KINDS.has(c.kind)).map((c) => c.kind).slice(0, 3).join(','));
check('모든 카드 id는 비어있지 않은 문자열', cards.every((c) => typeof c.id === 'string' && c.id.length > 0));

console.log('\n=== id 유일성 (SRS 진척 추적 전제) ===');
{
  const seen = new Map<string, number>();
  for (const c of cards) seen.set(c.id, (seen.get(c.id) ?? 0) + 1);
  const dups = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
  check('중복 id 없음', dups.length === 0, `중복: ${dups.slice(0, 5).join(', ')}`);
}

console.log('\n=== 퀴즈 카드 (materialize 후) ===');
{
  const quizzes = cards.filter((c) => c.kind === 'quiz').map(materializeQuizCard) as Extract<Card, { kind: 'quiz' }>[];
  check('퀴즈 카드 존재', quizzes.length > 0, `len=${quizzes.length}`);
  const noChoices = quizzes.filter((q) => !q.choices || q.choices.length < 2);
  check('모든 퀴즈 선택지 2개 이상', noChoices.length === 0, `부족: ${noChoices.map((q) => q.id).slice(0, 5).join(', ')}`);
  const noCorrect = quizzes.filter((q) => (q.choices ?? []).filter((ch) => ch.correct).length < 1);
  check('모든 퀴즈 정답 1개 이상', noCorrect.length === 0, `정답없음: ${noCorrect.map((q) => q.id).slice(0, 5).join(', ')}`);
  const noLabel = quizzes.filter((q) => (q.choices ?? []).some((ch) => !ch.label && !ch.ja && !ch.phrase));
  check('모든 선택지 표시 텍스트 보유', noLabel.length === 0, `라벨없음: ${noLabel.map((q) => q.id).slice(0, 5).join(', ')}`);
}

console.log('\n=== 카드 유형별 필수 필드 ===');
{
  const order = cards.filter((c) => c.kind === 'order') as Extract<Card, { kind: 'order' }>[];
  check('order 카드 items 2개 이상', order.every((c) => c.items.length >= 2), order.filter((c) => c.items.length < 2).map((c) => c.id).slice(0, 3).join(','));

  const intro = cards.filter((c) => c.kind === 'introduce') as Extract<Card, { kind: 'introduce' }>[];
  check('introduce 카드 kana·korean 보유', intro.every((c) => !!c.kana && !!c.korean));

  const speak = cards.filter((c) => c.kind === 'speak') as Extract<Card, { kind: 'speak' }>[];
  check('speak 카드 kana·korean 보유', speak.every((c) => !!c.kana && !!c.korean));

  const dict = cards.filter((c) => c.kind === 'dictation') as Extract<Card, { kind: 'dictation' }>[];
  check('dictation 카드 ja·korean 보유', dict.every((c) => !!c.ja && !!c.korean));
}

console.log('\n=== reviewTarget 무결성 ===');
{
  const withRt = cards.filter((c) => 'reviewTarget' in c && c.reviewTarget);
  const badRt = withRt.filter((c) => {
    const rt = (c as { reviewTarget?: { type?: string; id?: unknown } }).reviewTarget!;
    return !rt.type || (rt.id === undefined || rt.id === null || rt.id === '');
  });
  check('reviewTarget 있으면 type·id 유효', badRt.length === 0, `불량: ${badRt.map((c) => c.id).slice(0, 5).join(', ')}`);
}

console.log('\n=== 안정성: materializeQuizCard 멱등(비퀴즈 무변) ===');
{
  const tip = cards.find((c) => c.kind === 'tip');
  check('비퀴즈 카드는 materialize해도 동일 참조', !tip || materializeQuizCard(tip) === tip);
}

console.log(`\n결과: ${pass}/${total} ${pass === total ? 'PASS' : 'FAIL'}`);
if (pass !== total) process.exit(1);
