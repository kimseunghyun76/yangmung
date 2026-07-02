// N5 커버리지 리포트 — 우리 콘텐츠가 N5 목록(비공식)을 얼마나 다루는지 측정.
// 게이트가 아니라 대시보드: 부족한 항목을 보고 콘텐츠 확충 우선순위를 정한다.
// 실행: npm run report:n5
import { CONTENT } from './index';
import { VOCAB_GROUPS } from './thematicVocab';
import { signs } from './signs';
import { BASIC_LIFE_ITEMS } from './basicLife';
import type { N5Entry } from './types';

// 매칭 말뭉치 — 표기(한자 포함)와 읽기(가나)를 나눠 수집
const writtenCorpus: string[] = [
  ...CONTENT.phrases.map((p) => p.kanji ?? ''),
  ...VOCAB_GROUPS.flatMap((g) => g.items.map((i) => i.ja)),
  ...signs.map((s) => s.ja),
  ...BASIC_LIFE_ITEMS.map((b) => b.ja),
].filter(Boolean);

const kanaCorpus: string[] = [
  ...CONTENT.phrases.map((p) => p.kana),
  ...VOCAB_GROUPS.flatMap((g) => g.items.map((i) => i.kana)),
  ...signs.map((s) => s.kana),
  ...BASIC_LIFE_ITEMS.map((b) => b.kana ?? ''),
].filter(Boolean);

// 문법은 "명시적으로 가르치는가" — 문법 팁(label·예문·팁)에서만 찾는다.
// (は 같은 한 글자 조사가 아무 문장에나 '노출'되는 것을 커버로 치지 않기 위함)
const grammarCorpus: string[] = CONTENT.grammar.map((g) => `${g.label} ${g.exampleJa ?? ''} ${g.tipKo ?? ''}`);

function strip(value: string): string {
  return value.replace(/\(.*?\)/g, '').replace(/[〜・/]/g, ' ').trim();
}

function coveredBy(entry: N5Entry, corpus: string[]): boolean {
  const needles = [
    ...strip(entry.value).split(/\s+/).filter(Boolean),
    ...(entry.reading ? [entry.reading] : []),
  ];
  return needles.some((n) => corpus.some((c) => c.includes(n)));
}

function isCovered(entry: N5Entry): boolean {
  if (entry.type === 'grammar') return coveredBy(entry, grammarCorpus);
  if (entry.type === 'kanji') return coveredBy(entry, writtenCorpus);
  return coveredBy(entry, writtenCorpus) || coveredBy(entry, kanaCorpus);
}

const byType: Record<N5Entry['type'], { covered: N5Entry[]; missing: N5Entry[] }> = {
  vocab: { covered: [], missing: [] },
  grammar: { covered: [], missing: [] },
  kanji: { covered: [], missing: [] },
};
for (const e of CONTENT.n5) {
  (isCovered(e) ? byType[e.type].covered : byType[e.type].missing).push(e);
}

console.log('=== N5 커버리지 리포트 (비공식 목록 기준) ===');
const TYPE_LABEL: Record<N5Entry['type'], string> = { vocab: '어휘', grammar: '문법', kanji: '한자' };
let totalC = 0, totalN = 0;
for (const t of ['grammar', 'vocab', 'kanji'] as const) {
  const { covered, missing } = byType[t];
  const n = covered.length + missing.length;
  totalC += covered.length; totalN += n;
  const pct = n ? Math.round((covered.length / n) * 100) : 0;
  console.log(`\n${TYPE_LABEL[t]}: ${covered.length}/${n} (${pct}%)`);
  if (missing.length) {
    console.log(`  미커버: ${missing.map((e) => e.value).join(' · ')}`);
  }
}
console.log(`\n전체: ${totalC}/${totalN} (${Math.round((totalC / totalN) * 100)}%)`);
console.log('※ 문법은 문법 팁(grammar)에서 명시적으로 다뤄야 커버로 인정. 어휘·한자는 표현/어휘/간판/생활기초 등장 기준.');
