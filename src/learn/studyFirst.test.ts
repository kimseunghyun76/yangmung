// 절대 룰 검증 — "학습 먼저 → 퀴즈": 배우지 않은 항목이 퀴즈로 나오면 안 된다.
// 학습형 덱(selectStudyDeck)의 두 불변식을 실제 콘텐츠로 반복 검사:
//   ① 순서 — 모든 학습(introduce) 카드는 모든 퀴즈보다 앞에 온다.
//   ② 커버리지 — 퀴즈 대상은 (이번 덱에서 학습하는 항목 ∪ 이전에 학습한 항목)에만 속한다.
// 실행: npm run test:studyfirst
import { buildCards, type Card, type QuizCard } from './cards';
import { selectStudyDeck, type ProgressMap } from './progress';
import { check } from '../test/check';


const allCards = buildCards(2);
const isVocabStudy = (id: string) => id.includes(':study:');

// App.tsx의 실제 학습형 덱 구성과 동일한 설정들
const CONFIGS = [
  { name: '간판(sign)', studyTest: (id: string) => id.startsWith('sign:study:'), quizTest: (id: string) => id.startsWith('sign:') && !id.startsWith('sign:study:'), studyLimit: 24, quizCount: 6 },
  { name: '생활 기초(basic)', studyTest: (id: string) => id.startsWith('basic:study:'), quizTest: (id: string) => id.startsWith('basic:') && !isVocabStudy(id), studyLimit: 36, quizCount: 8 },
  { name: '어휘 전체(vocab)', studyTest: (id: string) => id.startsWith('vocab:') && isVocabStudy(id), quizTest: (id: string) => id.startsWith('vocab:') && !isVocabStudy(id), studyLimit: 36, quizCount: 8 },
  { name: '기본 인사(greetings)', studyTest: (id: string) => id.startsWith('vocab:greetings:study:'), quizTest: (id: string) => id.startsWith('vocab:greetings:') && !isVocabStudy(id), studyLimit: 24, quizCount: 6 },
];

const ITER = 30; // 셔플 무작위성 커버

console.log('=== 신규 사용자(진척 없음): 이번 덱에서 배우는 것만 퀴즈로 ===');
for (const cfg of CONFIGS) {
  let orderOk = true, coverOk = true, sawQuiz = false;
  let leakSample = '';
  for (let i = 0; i < ITER; i++) {
    const deck = selectStudyDeck(allCards, cfg.studyTest, cfg.quizTest, { studyLimit: cfg.studyLimit, quizCount: cfg.quizCount, progress: {} });
    const firstQuiz = deck.findIndex((c) => c.kind === 'quiz');
    const lastIntro = deck.reduce((acc, c, idx) => (c.kind === 'introduce' ? idx : acc), -1);
    if (firstQuiz !== -1 && lastIntro > firstQuiz) orderOk = false;
    const learned = new Set(deck.filter((c) => c.kind === 'introduce').map((c) => c.id.replace(':study:', ':')));
    for (const c of deck) {
      if (c.kind !== 'quiz') continue;
      sawQuiz = true;
      const target = String((c as QuizCard).reviewTarget?.id ?? '');
      if (!learned.has(target)) { coverOk = false; leakSample = `${c.id} → ${target}`; }
    }
  }
  check(`${cfg.name} — 학습이 퀴즈보다 먼저`, orderOk);
  check(`${cfg.name} — 미학습 항목 퀴즈 누출 없음`, coverOk, leakSample);
  check(`${cfg.name} — 퀴즈가 실제로 출제됨(빈 덱 아님)`, sawQuiz);
}

console.log('=== 학습량 0이면 퀴즈도 0 (배운 게 없으면 시험도 없다) ===');
{
  const deck = selectStudyDeck(
    allCards,
    (id) => id.startsWith('vocab:') && isVocabStudy(id),
    (id) => id.startsWith('vocab:') && !isVocabStudy(id),
    { studyLimit: 0, quizCount: 8, progress: {} },
  );
  check('studyLimit 0 → 퀴즈 0', deck.every((c) => c.kind !== 'quiz'), deck.filter((c) => c.kind === 'quiz').map((c) => c.id).join(','));
}

console.log('=== 이전에 학습한 항목은 이번 덱에 없어도 퀴즈 허용 ===');
{
  // 실제 콘텐츠에서 어휘 study 카드 하나를 골라 "이전에 학습함"으로 기록
  const anyStudy = allCards.find((c): c is Card & { kind: 'introduce' } => c.kind === 'introduce' && /^vocab:[^:]+:study:(?!ex\d+$)/.test(c.id));
  if (!anyStudy) {
    check('어휘 study 카드 존재', false);
  } else {
    const concept = anyStudy.id.replace(':study:', ':');
    const progress: ProgressMap = {
      [anyStudy.id]: { attempts: 1, correct: 1, lastSeenAt: new Date().toISOString(), usedRecoveryEver: false, consecutiveCorrect: 1, lastResult: 'correct', lastSessionId: 1 },
    };
    // 이번 덱에서는 아무것도 새로 학습하지 않음(studyLimit 0) → 허용 퀴즈 = 과거 학습분만
    let onlyLearned = true;
    let sawTargetQuiz = false;
    for (let i = 0; i < ITER; i++) {
      const deck = selectStudyDeck(
        allCards,
        (id) => id.startsWith('vocab:') && isVocabStudy(id),
        (id) => id.startsWith('vocab:') && !isVocabStudy(id),
        { studyLimit: 0, quizCount: 8, progress },
      );
      for (const c of deck) {
        if (c.kind !== 'quiz') continue;
        const target = String((c as QuizCard).reviewTarget?.id ?? '');
        if (target !== concept) onlyLearned = false;
        else sawTargetQuiz = true;
      }
    }
    check('과거 학습 개념만 퀴즈로 나옴', onlyLearned);
    check('과거 학습 개념이 퀴즈로 실제 출제됨', sawTargetQuiz);
  }
}
