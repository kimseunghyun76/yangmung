// buildKanaSpeakLadder 검증 — 길이가 항상 1부터 오름차순으로 점점 길어지는지,
// 그리고 실제 단어 풀에서만 뽑는지(무작정 가나를 이어 붙이지 않는지).
// 실행: npm run test:kanaspeakwords
import { buildKanaSpeakLadder } from './kanaSpeakWords';
import { VOCAB_GROUPS } from '../content/thematicVocab';
import { check } from '../test/check';


console.log('=== buildKanaSpeakLadder — 점점 길어지는 단어 사다리 ===');
{
  const validKana = new Set(VOCAB_GROUPS.flatMap((g) => g.items).map((it) => it.kana));
  const validIds = new Set(VOCAB_GROUPS.flatMap((g) => g.items).map((it) => it.id));

  const ladder = buildKanaSpeakLadder();
  check('최소 5개 이상(연달아 노출 요구 충족)', ladder.length >= 5, `실제 ${ladder.length}개`);
  check('첫 항목은 1개짜리(가나 하나)부터 시작', ladder[0]?.len === 1, `실제 ${ladder[0]?.len}`);

  let strictlyIncreasing = true, incDetail = '';
  for (let i = 1; i < ladder.length; i++) {
    if (ladder[i].len <= ladder[i - 1].len) { strictlyIncreasing = false; incDetail = `${ladder[i - 1].len} → ${ladder[i].len}`; break; }
  }
  check('길이가 매 항목마다 엄격히 증가(점점 길어짐)', strictlyIncreasing, incDetail);

  const allFromPool = ladder.every((w) => validKana.has(w.kana) && validIds.has(w.id));
  check('모든 단어가 실제 단어 풀(VOCAB_GROUPS)에서만 옴(임의 가나 조합 아님)', allFromPool);
  check('각 항목의 len 필드가 양수', ladder.every((w) => w.len > 0));

  // 10회 반복 — 매번 오름차순·풀 소속 불변식 유지(무작위 선택이라도 안정적이어야 함)
  let allRunsOk = true, runDetail = '';
  for (let r = 0; r < 10; r++) {
    const l = buildKanaSpeakLadder();
    for (let i = 1; i < l.length; i++) {
      if (l[i].len <= l[i - 1].len) { allRunsOk = false; runDetail = `run${r}: ${l[i - 1].len}→${l[i].len}`; break; }
    }
    if (!allRunsOk) break;
  }
  check('10회 반복 실행해도 항상 오름차순 유지', allRunsOk, runDetail);
}
