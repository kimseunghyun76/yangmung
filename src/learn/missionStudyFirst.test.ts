// 절대 룰 검증(미션·오늘의 학습 세션 전용) — "학습 먼저 → 퀴즈".
// cards.test.ts가 이미 selectMissionCards(지도에서 미션 단독 연습) 경로를 철저히 검증하므로,
// 여기서는 그 외 두 가지를 추가로 확인한다.
//   ① selectSessionCards — 홈의 "오늘의 학습" 세션에 여러 미션·카드가 섞여 나올 때도
//      미션 퀴즈가 필요로 하는 표현(answerPhraseIds)이 그 시점(이전 세션 진척 ∪ 이번 세션 앞쪽)에 있는지.
//   ② 오답 선택지가 다른 장면 전용 표현을 끌어와 주제가 어긋나지 않는지(질문·답변 정합성).
// 실행: npm run test:missionstudyfirst
import { buildCards, type QuizCard } from './cards';
import { CONTENT } from '../content';
import { phrases as PHRASES } from '../content/phrases';
import { selectSessionCards, DEFAULT_SESSION_CONFIG, type ProgressMap, type CardProgress } from './progress';

let pass = 0, fail = 0;
function check(name: string, ok: boolean, detail = '') {
  if (ok) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`); }
}

const allCards = buildCards(2);
const phraseIdOf = (id: string) => id.split(':').slice(2).join(':');

function mark(progress: ProgressMap, id: string, sessionId: number): void {
  const prev = progress[id];
  const entry: CardProgress = {
    attempts: (prev?.attempts ?? 0) + 1,
    correct: (prev?.correct ?? 0) + 1,
    consecutiveCorrect: (prev?.consecutiveCorrect ?? 0) + 1,
    lastResult: 'correct',
    lastSeenAt: new Date().toISOString(),
    lastSessionId: sessionId,
    usedRecoveryEver: false,
  };
  progress[id] = entry;
}

console.log('=== selectSessionCards — 오늘의 학습 세션(다른 카드와 섞임) ===');
{
  const progress: ProgressMap = {};
  let coverOk = true, leak = '';
  let sawMissionQuiz = false;
  const SESSIONS = 150;
  for (let session = 1; session <= SESSIONS; session++) {
    const cardsThisSession = selectSessionCards(allCards, progress, session, DEFAULT_SESSION_CONFIG);
    const learnedSoFar = new Set(
      Object.keys(progress).filter((k) => k.startsWith('intro:')).map(phraseIdOf),
    );
    for (const c of cardsThisSession) {
      if (c.kind === 'quiz' && c.reviewTarget?.type === 'mission') {
        sawMissionQuiz = true;
        for (const pid of (c as QuizCard).answerPhraseIds ?? []) {
          if (!learnedSoFar.has(pid)) {
            coverOk = false;
            leak = leak || `session${session} ${c.id} needs ${pid} (미학습, 세션 내 순서 위반 포함)`;
          }
        }
      }
      if (c.kind === 'introduce') learnedSoFar.add(phraseIdOf(c.id));
    }
    for (const c of cardsThisSession) mark(progress, c.id, session);
  }
  check(`오늘의 학습 세션 ${SESSIONS}회 누적 — 미션 퀴즈가 미학습 표현을 요구하지 않음(순서 포함)`, coverOk, leak);
  check('미션 퀴즈가 실제로 출제됨', sawMissionQuiz);
}

console.log('\n=== 미션 퀴즈 오답 — 다른 장면 전용 표현으로 주제가 어긋나지 않음 ===');
{
  // 특정 미션 1곳에만 강하게 묶인 표현(예: 료칸 전용 "유카타 사이즈는…")이 다른 장면의
  // 오답으로 튀어나오면 학습자가 맥락을 오해한다. buildStepChoicePools가 이런 표현을
  // 최후순위로 미루는지 실제 콘텐츠로 확인 — 허용 오차는 소량(동일 카테고리 표현 등)만 허용.
  const phraseMissions = new Map<string, Set<string>>();
  for (const m of CONTENT.missions) {
    const add = (pid?: string) => {
      if (!pid) return;
      if (!phraseMissions.has(pid)) phraseMissions.set(pid, new Set());
      phraseMissions.get(pid)!.add(m.id);
    };
    for (const pid of m.speakPhraseIds ?? []) add(pid);
    for (const s of m.steps) { add(s.promptPhraseId); for (const c of s.choices) add(c.phraseId); }
  }
  const byKorean = new Map<string, string[]>();
  for (const p of PHRASES) { const arr = byKorean.get(p.korean) ?? []; arr.push(p.id); byKorean.set(p.korean, arr); }

  let totalWrong = 0, crossMission = 0;
  for (const c of allCards) {
    if (c.kind !== 'quiz' || !c.id.startsWith('mission:')) continue;
    const missionId = c.id.split(':')[1];
    for (const ch of c.choices.filter((x) => !x.correct && !x.recovery)) {
      totalWrong++;
      const owners = new Set<string>();
      for (const pid of byKorean.get(ch.label) ?? []) for (const mid of phraseMissions.get(pid) ?? []) owners.add(mid);
      if (owners.size > 0 && !owners.has(missionId)) crossMission++;
    }
  }
  const ratio = totalWrong ? crossMission / totalWrong : 0;
  check(`다른 장면 전용 오답 비율이 낮음(${crossMission}/${totalWrong} = ${(ratio * 100).toFixed(1)}%, 기준 <1%)`, ratio < 0.01);
}

console.log('\n=== 복습 큐(reviewConfig) — 신규 유저(미션 미경험)는 미션 퀴즈 0장 ===');
{
  // 실사고 재현: 히라가나만 풀고 미션은 한 번도 안 한 입문 유저가 "복습 큐 풀기"를 누르면,
  // 이전엔 구식 isMissionUnlocked(각 루트 첫 장면은 항상 열림) 폴백 + missionTierFilter가 0개일 때
  // 전체로 폴백하는 이중 버그가 겹쳐, 전혀 배운 적 없는 미션이 "복습"으로 튀어나왔다.
  // 여기선 App.tsx의 reviewConfig와 동일하게 openMissions + missionTierFilter + strictMissionFilter를 재현.
  const progress: ProgressMap = {};
  for (const c of allCards) {
    if (c.kind === 'quiz' && c.reviewTarget?.type === 'kana') mark(progress, c.id, 1); // 히라가나만 풀었음
  }
  const openMissions: string[] = []; // 미션은 아직 아무것도 안 열림/시작 안 함
  const reviewConfig = {
    quotas: { K: 0, B: 0, C: 8, P: 0, tip: 1 },
    minFresh: { K: 0, B: 0, C: 0 },
    openMissions,
    missionTierFilter: (mid: string) => {
      // missionExperiencedCount 대체 — 이 progress엔 미션 카드가 전혀 없으므로 항상 false
      return Object.keys(progress).some((k) => k.startsWith(`mission:${mid}:`));
    },
    strictMissionFilter: true,
  };
  const cards = selectSessionCards(allCards, progress, 2, reviewConfig);
  const missionCards = cards.filter((c) => c.kind === 'quiz' && c.reviewTarget?.type === 'mission');
  check('미션 경험 0인 신규 유저 — 복습 큐에 미션 퀴즈가 하나도 안 섞임', missionCards.length === 0, `${missionCards.length}장 섞임: ${missionCards.map((c) => c.id).join(',')}`);
}

console.log(`\n결과: ${pass}/${pass + fail} PASS`);
if (fail > 0) process.exitCode = 1;
