// cards.ts 통합 테스트 — buildCards()가 만든 전체 카드 세트의 구조 무결성.
// id 유일성(진척 추적의 전제), 카드별 필수 필드, 퀴즈 정답 보장 등을 검증한다.
// 실행: npm run test:cards  (실패 시 exit 1)
import { CONTENT } from '../content';
import { buildCards, materializeQuizCard, type Card, type QuizCard } from './cards';
import { selectMissionCards } from './progress';

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

console.log('\n=== 미션 새표현 선행 규칙 ===');
{
  const introKey = (missionId: string, phraseId: string) => `intro:${missionId}:${phraseId}`;
  const introIds = new Set(cards.filter((c) => c.kind === 'introduce').map((c) => c.id));
  const missingIntro: string[] = [];
  const orderViolations: string[] = [];
  for (const m of CONTENT.missions.filter((mission) => mission.id !== 'C0')) {
    const required = new Set<string>();
    for (const pid of m.speakPhraseIds ?? []) required.add(pid);
    for (const step of m.steps) {
      if (step.promptPhraseId) required.add(step.promptPhraseId);
      for (const choice of step.choices) if (choice.phraseId) required.add(choice.phraseId);
    }
    for (const pid of required) {
      if (!introIds.has(introKey(m.id, pid))) missingIntro.push(`${m.id}:${pid}`);
    }

    // tip 카드는 맨 앞에 항상 붙는 문법/문화 팁(2026-07-08)으로, introduce→quiz 학습선행 게이팅과는
    // 무관한 별개 카드종류다 — 순서 검증에서는 제외하고 본다.
    const deck = selectMissionCards(cards, m.id, {}).filter((c) => c.kind !== 'tip');
    const firstNonIntro = deck.findIndex((c) => c.kind !== 'introduce');
    if (firstNonIntro >= 0 && deck.slice(firstNonIntro).some((c) => c.kind === 'introduce')) {
      orderViolations.push(m.id);
    }
  }
  check('모든 미션 표현은 같은 미션의 introduce 카드를 가진다', missingIntro.length === 0, `누락: ${missingIntro.slice(0, 5).join(', ')}`);
  check('단독 미션 덱은 introduce를 모두 끝낸 뒤 퀴즈로 넘어간다', orderViolations.length === 0, `위반: ${orderViolations.slice(0, 5).join(', ')}`);
}

console.log('\n=== 안정성: materializeQuizCard 멱등(비퀴즈 무변) ===');
{
  const tip = cards.find((c) => c.kind === 'tip');
  check('비퀴즈 카드는 materialize해도 동일 참조', !tip || materializeQuizCard(tip) === tip);
}

console.log('\n=== 규칙: 미션 퀴즈는 정답 표현을 새 표현으로 학습한 뒤에만 나온다 ===');
{
  // 모든 미션을 첫 방문부터 끝까지(8개씩 새 표현 소개) 시뮬레이션 — 어떤 방문에서도
  // "그 시점까지 학습한 표현"에 없는 정답을 가진 퀴즈가 나오면 안 된다.
  const phraseIdOf = (id: string) => id.split(':').slice(2).join(':');
  const introExistsFor = new Set(cards.filter((c) => c.kind === 'introduce').map((c) => phraseIdOf(c.id)));
  let violations = 0; let exhausted = 0;
  for (const m of CONTENT.missions) {
    const seen: Record<string, { attempts: number }> = {};
    for (let guard = 0; guard < 40; guard++) {
      const deck = selectMissionCards(cards, m.id, seen as never);
      const learned = new Set<string>(Object.keys(seen).filter((k) => k.startsWith('intro:')).map(phraseIdOf));
      for (const c of deck) if (c.kind === 'introduce') learned.add(phraseIdOf(c.id));
      for (const c of deck) {
        if (c.kind !== 'quiz' || !c.answerPhraseIds) continue;
        for (const pid of c.answerPhraseIds) {
          if (introExistsFor.has(pid) && !learned.has(pid)) { violations++; if (violations <= 5) console.log(`    위반: ${m.id} ${c.id} → ${pid}`); }
        }
      }
      const fresh = deck.filter((c) => c.kind === 'introduce' && !seen[c.id]);
      if (fresh.length === 0) { exhausted++; break; }
      for (const c of fresh) seen[c.id] = { attempts: 1 };
    }
  }
  check('모든 미션·모든 방문에서 미학습 정답 퀴즈 0건', violations === 0, `위반 ${violations}건`);
  check(`모든 미션이 새 표현을 끝까지 소진(${exhausted}/${CONTENT.missions.length})`, exhausted === CONTENT.missions.length);
}

console.log('\n=== 발음 구분 — 4지선다 확장(2026-07-05) ===');
{
  const pairCards = cards.filter((c): c is QuizCard => c.kind === 'quiz' && c.id.startsWith('pair:'));
  check('발음 구분 카드 존재', pairCards.length > 0);
  check('모든 발음 구분 카드가 4지선다', pairCards.every((c) => c.choices.length === 4),
    `예외: ${pairCards.filter((c) => c.choices.length !== 4).map((c) => c.id).slice(0, 5).join(',')}`);
  check('모든 발음 구분 카드에 정답이 정확히 1개', pairCards.every((c) => c.choices.filter((x) => x.correct).length === 1));
  check('모든 발음 구분 카드의 보기 4개가 서로 다른 표기', pairCards.every((c) => new Set(c.choices.map((x) => x.label)).size === 4),
    `중복 예: ${pairCards.filter((c) => new Set(c.choices.map((x) => x.label)).size !== 4).map((c) => c.id).slice(0, 5).join(',')}`);
}

console.log('\n=== 한→일 작문 — 콘텐츠 확장(2026-07-05) ===');
{
  const composeCards = cards.filter((c): c is Extract<Card, { kind: 'dictation' }> => c.kind === 'dictation' && c.promptKind === 'korean');
  check('작문 카드가 기존(70) 대비 대폭 확장됨', composeCards.length >= 200, `현재 ${composeCards.length}개`);
  check('작문 카드 id 유일성', new Set(composeCards.map((c) => c.id)).size === composeCards.length);
  check('작문 카드는 모두 한국어 프롬프트(promptKind=korean)', composeCards.every((c) => c.promptKind === 'korean'));
}

console.log(`\n결과: ${pass}/${total} ${pass === total ? 'PASS' : 'FAIL'}`);
if (pass !== total) process.exit(1);
