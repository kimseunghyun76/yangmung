// 검증 규칙 커버리지 테스트 — 일부러 깨뜨린 콘텐츠를 validateContent가 잡는지.
// 실행: npm run test:content
import type { ContentBundle } from './types';
import { CONTENT } from './index';
import { validateContent } from './validate';

const clone = (): ContentBundle => structuredClone(CONTENT);
const c1 = (d: ContentBundle) => d.missions.find((m) => m.id === 'C1')!; // C1은 2스텝 정식 미션 (C0는 튜토리얼)
let pass = 0, total = 0;

function expectFail(name: string, mutate: (d: ContentBundle) => void, rule: string) {
  total++;
  const d = clone(); mutate(d);
  const got = [...new Set(validateContent(d).filter((i) => i.sev === 'fail').map((i) => i.rule))];
  const ok = got.includes(rule);
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name} -> 기대 ${rule}, 검출 [${got.join(',') || '없음'}]`);
  if (ok) pass++;
}

console.log('=== 정상 데이터셋 ===');
{
  const issues = validateContent(CONTENT);
  const f = issues.filter((i) => i.sev === 'fail');
  const w = issues.filter((i) => i.sev === 'warn');
  console.log(`하드 실패 ${f.length} / 경고 ${w.length}`);
  // 정상셋: 하드 실패 0.
  // 허용 경고: V9(C0 면제), V13(receptive 학습 목적 wrong choice — 정답이 아닌 쪽에 사용 가능).
  const warnsOk = w.every((x) => x.rule === 'V9' || x.rule === 'V13');
  total++; if (f.length === 0 && warnsOk) { pass++; console.log('  PASS 정상셋 클린 (하드 0, 허용 경고만)'); }
  else console.log('  FAIL 정상셋에 예상 밖 이슈');
}

console.log('\n=== 위반 검출 ===');
expectFail('V2 kana에 한자', (d) => { d.phrases[5].kana = '大丈夫'; }, 'V2');
expectFail('V2 displayKana에 한자', (d) => { d.phrases[6].displayKana = '大丈夫だ'; }, 'V2');
expectFail('V10 ー를 sei로', (d) => { d.kana.find((k) => k.id === 'k_long')!.kind = 'sei'; }, 'V10');
expectFail('V6 kana Unit에 BLevel', (d) => { d.units[0].stage = 'B1'; }, 'V6');
expectFail('V8 step 선택지 1개', (d) => { c1(d).steps[0].choices = [c1(d).steps[0].choices[0]]; }, 'V8');
expectFail('V12 N5 source 위반', (d) => { (d.n5[0] as { source: string }).source = 'official'; }, 'V12');
expectFail('V5 중복 id', (d) => { d.phrases.push({ ...d.phrases[0] }); }, 'V5');
expectFail('V5 id에 한자', (d) => { d.n5.push({ id: 'n5_k_人', type: 'kanji', value: '人', source: 'unofficial' }); }, 'V5');
const langUnit = (d: ContentBundle) => d.units.find((u) => u.track === 'lang')!;
expectFail('V3 깨진 참조', (d) => { langUnit(d).newPhraseIds!.push('p_nonexist'); }, 'V3');
expectFail('V4 중복 도입', (d) => { langUnit(d).newPhraseIds!.push('p_hai'); }, 'V4');
expectFail('V18 유령 복습', (d) => { langUnit(d).reviewPhraseIds = ['p_un_ghost']; }, 'V18');
expectFail('V19 productive 사전 미도입', (d) => {
  d.phrases.push({ id: 'p_test_orphan', kana: 'てすと', korean: '테스트', register: 'productive' });
  c1(d).steps[0].choices.push({ text: '테스트(미도입)', phraseId: 'p_test_orphan', correct: false });
}, 'V19');
expectFail('V7 Choice 형태(둘 다)', (d) => { c1(d).steps[0].choices[0].actionText = 'x'; }, 'V7');
expectFail('V9 recovery 제거(사유 없음)', (d) => {
  const m = c1(d);
  for (const s of m.steps) for (const c of s.choices) c.recoveryType = undefined;
}, 'V9');

console.log('\n=== 강등/경고 (실패가 아니어야) ===');
total++;
{
  const d = clone();
  const m = c1(d);
  for (const s of m.steps) for (const c of s.choices) c.recoveryType = undefined;
  m.meta = { recoveryExemptReason: 'C1 데모: 면제 사유로 강등 확인' };
  const r = validateContent(d);
  const f = [...new Set(r.filter((i) => i.sev === 'fail').map((i) => i.rule))];
  const w = [...new Set(r.filter((i) => i.sev === 'warn').map((i) => i.rule))];
  const ok = !f.includes('V9') && w.includes('V9');
  console.log(`  ${ok ? 'PASS' : 'FAIL'} V9 면제사유로 강등 -> fail[${f.join(',') || '없음'}] warn[${w.join(',') || '없음'}]`);
  if (ok) pass++;
}
total++;
{
  const d = clone();
  c1(d).steps[0].choices[0].phraseId = 'p_fukuro'; // receptive를 학습자 발화로
  const w = [...new Set(validateContent(d).filter((i) => i.sev === 'warn').map((i) => i.rule))];
  const ok = w.includes('V13');
  console.log(`  ${ok ? 'PASS' : 'FAIL'} V13 receptive를 학습자 선택지로 -> warn[${w.join(',') || '없음'}]`);
  if (ok) pass++;
}

console.log(`\n결과: ${pass}/${total} ${pass === total ? 'PASS' : 'FAIL'}`);
if (pass !== total) process.exitCode = 1;
