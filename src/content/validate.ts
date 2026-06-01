// 콘텐츠 검증 하니스 — CONTENT_SCHEMA.md §9 (V1~V15, V18~V19).
// V16(분량 예산)·V17(N5 커버리지)는 CURRICULUM/N5_COVERAGE 단계에서 추가.
// V19(productive/both choice는 사전 도입 필수)는 친구 2라운드 권고 반영.
// 실행: npm run lint:content  (하드 실패 시 exit 1)

import type { ContentBundle } from './types';
import { CONTENT } from './index';

export interface Issue {
  rule: string;
  sev: 'fail' | 'warn';
  msg: string;
}

const KANA_RE = /^[ぁ-ゖァ-ヺー]+$/;            // 순수 읽기 (가나+장음)
const DISPLAY_RE = /^[ぁ-ゖァ-ヺー、。！？\s]+$/; // 가나 + 허용 문장부호
const ID_RE = /^[A-Za-z0-9_]+$/;
const GRAMMAR_HINT = /(ます|てください|〜|を\(|は\(|조사)/;
const K_METRIC = /(\d|%|초|정확도)/;
// 친구 4차 권고: 정규식 prefix 대신 정확한 literal Set (K99·B_BAD 차단)
const K_LEVELS = new Set(Array.from({ length: 32 }, (_, i) => `K${i + 1}`));
const B_LEVELS = new Set(['B0','B1','B2','B3','B4','B5']);

export function validateContent(d: ContentBundle): Issue[] {
  const issues: Issue[] = [];
  const add = (rule: string, sev: Issue['sev'], msg: string) => issues.push({ rule, sev, msg });

  const kanaIds = new Set(d.kana.map((k) => k.id));
  const phraseIds = new Set(d.phrases.map((p) => p.id));
  const grammarIds = new Set(d.grammar.map((g) => g.id));
  const n5Ids = new Set(d.n5.map((n) => n.id));
  const unitIds = new Set(d.units.map((u) => u.id));
  const missionIds = new Set(d.missions.map((m) => m.id));
  const phraseById = Object.fromEntries(d.phrases.map((p) => [p.id, p]));

  // V5: id 유일성/형식
  const seen = new Set<string>();
  for (const o of [...d.kana, ...d.phrases, ...d.grammar, ...d.n5, ...d.units, ...d.missions]) {
    if (seen.has(o.id)) add('V5', 'fail', `중복 id: ${o.id}`);
    seen.add(o.id);
    if (!ID_RE.test(o.id)) add('V5', 'fail', `id에 ASCII 외 문자: ${o.id}`);
  }

  // KanaItem
  for (const k of d.kana) {
    if (!k.char || !k.level || !k.kind) add('V1', 'fail', `KanaItem 필수 누락: ${k.id}`);
    if (k.script === 'common' && k.kind !== 'special') add('V10', 'fail', `script:'common'은 kind:'special'만: ${k.id}`);
    for (const r of k.n5Refs ?? []) if (!n5Ids.has(r)) add('V3', 'fail', `KanaItem ${k.id} n5Refs 깨짐: ${r}`);
  }

  // Phrase
  for (const p of d.phrases) {
    if (!p.kana || !p.korean || !p.register) add('V1', 'fail', `Phrase 필수 누락: ${p.id}`);
    if (p.kana && !KANA_RE.test(p.kana)) add('V2', 'fail', `Phrase.kana 문자집합 위반: ${p.id} ("${p.kana}")`);
    if (p.displayKana && !DISPLAY_RE.test(p.displayKana)) add('V2', 'fail', `Phrase.displayKana 문자집합 위반: ${p.id} ("${p.displayKana}")`);
    for (const r of p.grammarRefs ?? []) if (!grammarIds.has(r)) add('V3', 'fail', `Phrase ${p.id} grammarRefs 깨짐: ${r}`);
    for (const r of p.n5Refs ?? []) if (!n5Ids.has(r)) add('V3', 'fail', `Phrase ${p.id} n5Refs 깨짐: ${r}`);
  }

  // N5
  for (const n of d.n5) if (n.source !== 'unofficial') add('V12', 'fail', `N5Entry.source != unofficial: ${n.id}`);

  // Unit
  const introduced = new Set<string>();
  for (const u of d.units) {
    if (!u.canDo) add('V11', 'fail', `Unit.canDo 빈값: ${u.id}`);
    if (u.track === 'kana') {
      if (!u.kanaIds || u.kanaIds.length === 0) add('V6', 'fail', `kana Unit인데 kanaIds 없음: ${u.id}`);
      if (u.newPhraseIds?.length || u.reviewPhraseIds?.length) add('V6', 'fail', `kana Unit에 phraseIds 혼입: ${u.id}`);
      if (!K_LEVELS.has(u.stage)) add('V6', 'fail', `kana Unit인데 stage가 KLevel 아님: ${u.id} (${u.stage})`);
      for (const r of u.kanaIds ?? []) if (!kanaIds.has(r)) add('V3', 'fail', `Unit ${u.id} kanaIds 깨짐: ${r}`);
      if (u.canDo && !K_METRIC.test(u.canDo)) add('V15', 'warn', `K Can-do에 속도/정확도 기준 없음: ${u.id}`);
    } else if (u.track === 'lang') {
      if (!u.newPhraseIds || u.newPhraseIds.length === 0) add('V6', 'fail', `lang Unit인데 newPhraseIds 없음: ${u.id}`);
      if (u.kanaIds?.length) add('V6', 'fail', `lang Unit에 kanaIds 혼입: ${u.id}`);
      if (!B_LEVELS.has(u.stage)) add('V6', 'fail', `lang Unit인데 stage가 BLevel 아님: ${u.id} (${u.stage})`);
      for (const r of [...(u.newPhraseIds ?? []), ...(u.reviewPhraseIds ?? [])]) if (!phraseIds.has(r)) add('V3', 'fail', `Unit ${u.id} phraseIds 깨짐: ${r}`);
      if (u.canDo && GRAMMAR_HINT.test(u.canDo)) add('V15', 'warn', `B/C Can-do에 문법명 포함: ${u.id}`);
    }
    for (const pid of u.newPhraseIds ?? []) {
      if (introduced.has(pid)) add('V4', 'fail', `Phrase 중복 도입: ${pid}`);
      introduced.add(pid);
    }
  }
  // V18: review-only 미도입 Phrase
  for (const u of d.units) for (const pid of u.reviewPhraseIds ?? []) {
    if (!introduced.has(pid)) add('V18', 'fail', `review-only 미도입 Phrase: ${pid} (Unit ${u.id})`);
  }

  // Mission
  for (const m of d.missions) {
    if (!m.canDo) add('V11', 'fail', `Mission.canDo 빈값: ${m.id}`);
    if (m.canDo && GRAMMAR_HINT.test(m.canDo)) add('V15', 'warn', `Mission Can-do에 문법명 포함: ${m.id}`);
    for (const r of m.unlockAfter ?? []) if (!unitIds.has(r) && !missionIds.has(r as never)) add('V3', 'fail', `Mission ${m.id} unlockAfter 깨짐: ${r}`);
    let recCount = 0, hasFull = false, hasPartial = false;
    m.steps.forEach((s, i) => {
      const where = `${m.id} step${i + 1}`;
      if (s.promptPhraseId) {
        if (!phraseIds.has(s.promptPhraseId)) add('V3', 'fail', `${where} promptPhraseId 깨짐: ${s.promptPhraseId}`);
        else if (phraseById[s.promptPhraseId].register === 'productive') add('V13', 'warn', `${where} prompt가 productive: ${s.promptPhraseId}`);
      }
      if (!s.choices || s.choices.length < 2) add('V8', 'fail', `${where} 선택지 <2`);
      const corrects = (s.choices ?? []).filter((c) => c.correct);
      if (corrects.length === 0) add('V8', 'fail', `${where} correct 없음`);
      if (corrects.length > 0 && corrects.every((c) => c.recoveryType)) add('V14', 'warn', `${where} 정답이 전부 recovery`);
      for (const c of s.choices ?? []) {
        const has1 = !!c.phraseId, has2 = !!c.actionText;
        if (has1 === has2) add('V7', 'fail', `${where} Choice는 phraseId/actionText 중 정확히 하나`);
        if (c.phraseId) {
          if (!phraseIds.has(c.phraseId)) add('V3', 'fail', `${where} choice.phraseId 깨짐: ${c.phraseId}`);
          else {
            const reg = phraseById[c.phraseId].register;
            if (reg === 'receptive') add('V13', 'warn', `${where} 학습자 발화가 receptive: ${c.phraseId}`);
            // V19: productive/both는 어떤 Unit에서 newPhraseId로 사전 도입 필수
            if ((reg === 'productive' || reg === 'both') && !introduced.has(c.phraseId)) {
              add('V19', 'fail', `${where} productive/both 사전 미도입: ${c.phraseId}`);
            }
          }
        }
        if (c.recoveryType) {
          recCount++;
          if (c.recoveryOutcome === 'full') hasFull = true;
          if (c.recoveryOutcome === 'partial') hasPartial = true;
        }
      }
    });
    const recShort = recCount < 2;
    const fpMissing = !hasFull || !hasPartial;
    if (recShort || fpMissing) {
      const reason = m.meta?.recoveryExemptReason;
      if (reason && reason.length >= 10) {
        add('V9', 'warn', `${m.id} recovery 부족 면제: "${reason}"`);
      } else {
        if (recShort) add('V9', 'fail', `${m.id} recovery <2`);
        if (fpMissing) add('V9', 'fail', `${m.id} full+partial 미충족 (full=${hasFull}, partial=${hasPartial})`);
      }
    }
  }

  return issues;
}

// ── CLI 게이트 ──────────────────────────────
const issues = validateContent(CONTENT);
const fails = issues.filter((i) => i.sev === 'fail');
const warns = issues.filter((i) => i.sev === 'warn');

console.log('=== lint:content ===');
console.log(`KanaItem ${CONTENT.kana.length} · Phrase ${CONTENT.phrases.length} · Unit ${CONTENT.units.length} · Mission ${CONTENT.missions.length} · Grammar ${CONTENT.grammar.length} · N5 ${CONTENT.n5.length}`);
console.log(`하드 실패: ${fails.length}`);
fails.forEach((i) => console.log(`  ❌ ${i.rule}: ${i.msg}`));
console.log(`경고: ${warns.length}`);
warns.forEach((i) => console.log(`  ⚠️  ${i.rule}: ${i.msg}`));

if (fails.length > 0) {
  console.error('\n빌드 차단: 하드 실패 존재.');
  process.exitCode = 1;
} else {
  console.log('\n✅ 통과 (하드 실패 0).');
}
