// composeContext 검증 — 작문 카드 하단 "질문/답변 힌트"가 엉뚱한 표현을 보여주지 않는지.
// 복구 표현("다시 말씀해주세요" 등)은 어떤 질문에도 붙을 수 있는 범용 응답이라
// 특정 질문의 "답변 예시"로 보여주면 그 질문과 무관해 보여 오해를 준다 — 절대 섞이면 안 된다.
// 실행: npm run test:composecontext
import { CONTENT } from '../content';
import { composeContextFor } from './composeContext';

let pass = 0, fail = 0;
function check(name: string, ok: boolean, detail = '') {
  if (ok) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`); }
}

console.log('=== composeContextFor — 질문↔답변 정합성 ===');
{
  const allPhraseIds = new Set<string>();
  for (const m of CONTENT.missions) {
    for (const step of m.steps) {
      if (step.promptPhraseId) allPhraseIds.add(step.promptPhraseId);
      for (const c of step.choices) if (c.phraseId) allPhraseIds.add(c.phraseId);
    }
  }

  let noRecoveryLeak = true, leakDetail = '';
  let noSelfReference = true, selfDetail = '';
  let sawQuestion = false, sawAnswer = false;

  for (const pid of allPhraseIds) {
    const ctx = composeContextFor(pid);
    if (!ctx) continue;
    if (ctx.role === 'question') sawQuestion = true; else sawAnswer = true;
    for (const rel of ctx.related) {
      if (rel.recoveryType) { noRecoveryLeak = false; leakDetail = leakDetail || `${pid}(${ctx.role}) → related 복구표현 "${rel.korean}"`; }
      if (rel.id === pid) { noSelfReference = false; selfDetail = selfDetail || `${pid}가 자기 자신을 관련 표현으로 가짐`; }
    }
  }
  check('복구 표현이 질문/답변 힌트로 섞이지 않음', noRecoveryLeak, leakDetail);
  check('표현이 자기 자신을 관련 항목으로 갖지 않음', noSelfReference, selfDetail);
  check('질문 역할 컨텍스트가 실제로 존재함', sawQuestion);
  check('답변 역할 컨텍스트가 실제로 존재함', sawAnswer);
}

console.log(`\n결과: ${pass}/${pass + fail} PASS`);
if (fail > 0) process.exitCode = 1;
