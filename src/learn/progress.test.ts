// progress.ts 단위 테스트 — SRS 코어(채점·쿨다운·분류·숙련도·가나 친숙도·장면 해금).
// 실행: npm run test:progress  (실패 시 exit 1)
import {
  recordAttempt, recordKnown, cooldownSessions, classifyCard, itemMastery,
  markKanaSeen, markKanaKnown, isKanaFamiliar, countSeenKana, KANA_FAMILIAR_AT,
  missionExperiencedCount, isMissionUnlocked, summarize, sessionResult,
  type ProgressMap, type CardProgress,
} from './progress';
import type { Card } from './cards';
import { check } from '../test/check';


const DUMMY = undefined as unknown as Card; // classifyCard는 첫 인자를 쓰지 않음(_c)

console.log('=== recordAttempt (채점) ===');
{
  const m0: ProgressMap = {};
  // 첫시도 정답(느림): correct+1, cc 1
  const m1 = recordAttempt(m0, 'x', { correct: true, usedRecovery: false, sessionId: 1 });
  check('첫시도 정답 → attempts 1, correct 1, cc 1', m1.x.attempts === 1 && m1.x.correct === 1 && m1.x.consecutiveCorrect === 1);
  check('lastResult correct', m1.x.lastResult === 'correct');
  // 빠른 첫시도 정답 → cc 최소 2로 점프
  const mf = recordAttempt(m0, 'x', { correct: true, usedRecovery: false, sessionId: 1, fast: true });
  check('빠른 정답 → cc>=2 즉시 익힘', mf.x.consecutiveCorrect >= 2);
  // 오답 → cc 0, correct 증가 안 함
  const m2 = recordAttempt(m1, 'x', { correct: false, usedRecovery: false, sessionId: 2 });
  check('오답 → cc 0, correct 유지', m2.x.consecutiveCorrect === 0 && m2.x.correct === 1 && m2.x.attempts === 2);
  check('오답 → lastResult wrong', m2.x.lastResult === 'wrong');
  // 복구 사용 정답 → firstTryCorrect 아님(cc 0), usedRecoveryEver true
  const mr = recordAttempt(m1, 'x', { correct: true, usedRecovery: true, sessionId: 2 });
  check('복구 정답 → cc 0, 복구이력 true, lastResult recovery', mr.x.consecutiveCorrect === 0 && mr.x.usedRecoveryEver === true && mr.x.lastResult === 'recovery');
  // 연속 정답 누적
  const m3 = recordAttempt(m1, 'x', { correct: true, usedRecovery: false, sessionId: 2 });
  check('연속 정답 → cc 2', m3.x.consecutiveCorrect === 2);
  // 불변성: 원본 맵 안 바뀜
  check('불변성(원본 미변경)', m0.x === undefined && m1.x.attempts === 1);
}

console.log('\n=== recordKnown (이미 알아요) ===');
{
  const m = recordKnown({}, 'y', 5);
  check('cc>=2, correct 1, lastResult correct', m.y.consecutiveCorrect >= 2 && m.y.correct === 1 && m.y.lastResult === 'correct');
}

console.log('\n=== cooldownSessions (점진적 간격) ===');
{
  check('cc 0 → 0(쉬지 않음)', cooldownSessions(0) === 0);
  check('cc 1 → 0', cooldownSessions(1) === 0);
  check('cc 2 → 2', cooldownSessions(2) === 2);
  check('cc 3 → 4', cooldownSessions(3) === 4);
  check('cc 4 → 8', cooldownSessions(4) === 8);
  check('cc 5+ → 16', cooldownSessions(5) === 16 && cooldownSessions(9) === 16);
  check('단조 증가', cooldownSessions(2) <= cooldownSessions(3) && cooldownSessions(3) <= cooldownSessions(4));
}

console.log('\n=== classifyCard (분류) ===');
{
  check('진척 없음 → new', classifyCard(DUMMY, undefined, 10) === 'new');
  const mastered: CardProgress = { attempts: 3, correct: 3, lastSeenAt: '', usedRecoveryEver: false, consecutiveCorrect: 2, lastResult: 'correct', lastSessionId: 10 };
  // cc 2 → cooldown 2세션. 같은/직후 세션이면 cooldown
  check('익힘 직후 → cooldown', classifyCard(DUMMY, mastered, 11) === 'cooldown');
  // cooldown(2) 지나면 due
  check('쿨다운 경과 → due', classifyCard(DUMMY, mastered, 13) === 'due');
  const weak: CardProgress = { attempts: 2, correct: 0, lastSeenAt: '', usedRecoveryEver: false, consecutiveCorrect: 0, lastResult: 'wrong', lastSessionId: 10 };
  check('미숙 → due(쿨다운 0)', classifyCard(DUMMY, weak, 10) === 'due');
}

console.log('\n=== itemMastery (0..1 숙련도) ===');
{
  check('진척 없음 → 0', itemMastery(undefined) === 0 && itemMastery({ attempts: 0 } as CardProgress) === 0);
  const perfect: CardProgress = { attempts: 4, correct: 4, lastSeenAt: '', usedRecoveryEver: false, consecutiveCorrect: 4, lastResult: 'correct', lastSessionId: 1 };
  const m = itemMastery(perfect);
  check('완벽 → 높음(>0.9), 1 이하', m > 0.9 && m <= 1);
  const wrong: CardProgress = { ...perfect, lastResult: 'wrong' };
  check('최근 오답 페널티 → 더 낮음', itemMastery(wrong) < m);
  const recov: CardProgress = { ...perfect, usedRecoveryEver: true };
  check('복구 이력 페널티 → 더 낮음', itemMastery(recov) < m);
  check('0..1 경계', itemMastery({ attempts: 1, correct: 0, lastSeenAt: '', usedRecoveryEver: true, consecutiveCorrect: 0, lastResult: 'wrong', lastSessionId: 1 }) >= 0);
}

console.log('\n=== 가나 친숙도 ===');
{
  let seen = markKanaSeen({}, ['あ', 'い']);
  check('seen 1회씩', seen['あ'] === 1 && seen['い'] === 1);
  seen = markKanaSeen(seen, ['あ']);
  check('재노출 → 누적 2', seen['あ'] === 2);
  check(`아직 친숙 아님(<${KANA_FAMILIAR_AT})`, !isKanaFamiliar('あ', seen));
  seen = markKanaSeen(seen, ['あ']);
  check('3회 → 친숙', isKanaFamiliar('あ', seen) && seen['あ'] === 3);
  const known = markKanaKnown({}, ['ね']);
  check('markKanaKnown → 즉시 친숙', isKanaFamiliar('ね', known) && known['ね'] === KANA_FAMILIAR_AT);
  check('countSeenKana', countSeenKana(seen) === 2);
  check('빈 입력 → 그대로', markKanaSeen(seen, []) === seen);
}

console.log('\n=== 장면 해금 ===');
{
  check('C0 항상 열림', isMissionUnlocked('C0', {}));
  check('루트 없는 id 안전 열림', isMissionUnlocked('ZZZ', {}));
  const prog: ProgressMap = { 'mission:C1:s1': {} as CardProgress, 'mission:C1:s2': {} as CardProgress, 'other:x': {} as CardProgress };
  check('missionExperiencedCount는 prefix만 카운트', missionExperiencedCount(prog, 'C1') === 2);
}

console.log('\n=== 요약/세션 결과 ===');
{
  const map: ProgressMap = {
    a: { attempts: 2, correct: 2, lastSeenAt: '', usedRecoveryEver: false, consecutiveCorrect: 2, lastResult: 'correct', lastSessionId: 7 },
    b: { attempts: 1, correct: 0, lastSeenAt: '', usedRecoveryEver: false, consecutiveCorrect: 0, lastResult: 'wrong', lastSessionId: 7 },
  };
  const s = summarize(map);
  check('summarize seen 2, mastered 1, weak 1', s.seen === 2 && s.mastered === 1 && s.weak === 1);
  const r = sessionResult(map, 7);
  check('sessionResult 이번 세션 익힘 1, 약점 1', r.masteredNow === 1 && r.weakNow === 1);
  check('다른 세션은 집계 제외', sessionResult(map, 99).masteredNow === 0);
}
