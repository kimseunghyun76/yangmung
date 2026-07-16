import fs from 'node:fs';
import path from 'node:path';
import { allUnits, integratedUnits, practiceUnits } from '../src/data/curriculum';
import { lessonForUnit, type LessonCard } from '../src/data/lessons';

interface Row {
  unit: string;
  scope: string;
  finding: string;
  detail: string;
}

const rows: Row[] = [];
const genericNotes = [
  '상황을 정확히 맞추기 위해 한 번 더 확인하는 표현입니다.',
  '기본 대화가 끝난 뒤 필요한 정보를 덧붙일 때 씁니다.',
];

function add(unit: string, scope: string, finding: string, detail: string) {
  rows.push({ unit, scope, finding, detail });
}

function isGenericGeneratedNote(card: LessonCard): boolean {
  if (card.kind === 'expression') {
    return (
      card.note.endsWith('에서 먼저 말해야 하는 핵심 표현입니다. 짧게 말하고 직원의 확인 질문을 기다립니다.')
      || genericNotes.includes(card.note)
    );
  }
  if (card.kind === 'staffLine') {
    return card.cue.endsWith('에서 직원이 실제로 말할 수 있는 안내입니다. 핵심 명사와 문장 끝을 먼저 잡습니다.');
  }
  return false;
}

for (const unit of practiceUnits) {
  if (unit.subtitle === unit.group) {
    add(unit.id, 'curriculum', 'subtitle repeats group', `${unit.title}: ${unit.subtitle}`);
  }

  const advancedLesson = lessonForUnit(unit.id, 'advanced');
  if (!advancedLesson) {
    add(unit.id, 'lesson', 'missing advanced lesson', unit.title);
    continue;
  }

  const genericCards = advancedLesson.cards.filter(isGenericGeneratedNote);
  if (genericCards.length > 0) {
    add(
      unit.id,
      'lesson',
      'generic note/cue remains',
      `${genericCards.length} card(s): ${genericCards.map((card) => card.id).join(', ')}`,
    );
  }
}

const postArrivalUnits = practiceUnits.filter((unit) => /^S([7-9]|[1-3][0-9]|4[0-3])$/.test(unit.id));
const requiredGroups = new Map<string, string[]>();
for (const unit of postArrivalUnits) {
  const key = unit.requiredIds.join(',');
  requiredGroups.set(key, [...(requiredGroups.get(key) ?? []), unit.id]);
}

for (const [requiredIds, ids] of requiredGroups.entries()) {
  if (ids.length >= 8) {
    add('S7-S43', 'curriculum', 'large repeated requiredIds block', `${ids.join(', ')} all require [${requiredIds}]`);
  }
}

for (const unit of integratedUnits) {
  const linkedIds = new Set(unit.journeyCheckpoints?.flatMap((checkpoint) => checkpoint.linkedUnitIds) ?? []);
  const missing = [...linkedIds].filter((id) => !unit.requiredIds.includes(id));
  if (missing.length > 0) {
    add(unit.id, 'journey', 'requiredIds missing checkpoint-linked unit', missing.join(', '));
  }
}

const summary = {
  practiceUnits: practiceUnits.length,
  integratedUnits: integratedUnits.length,
  findings: rows.length,
  subtitleRepeatsGroup: rows.filter((row) => row.finding === 'subtitle repeats group').length,
  genericNoteOrCue: rows.filter((row) => row.finding === 'generic note/cue remains').length,
  largeRepeatedRequiredIdsBlock: rows.filter((row) => row.finding === 'large repeated requiredIds block').length,
  journeyRequiredIdsMissingLinkedUnit: rows.filter((row) => row.finding === 'requiredIds missing checkpoint-linked unit').length,
};

const docsDir = path.resolve('docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, 'content-structure-report.json'), `${JSON.stringify({ summary, rows }, null, 2)}\n`);
fs.writeFileSync(
  path.join(docsDir, 'content-structure-report.md'),
  [
    '# Content Structure Report',
    '',
    'This is a non-blocking report for planned curriculum/content refactors. It does not fail `npm run check` or `npm run build`.',
    '',
    '## Summary',
    '',
    `- Practice units: ${summary.practiceUnits}`,
    `- Integrated journeys: ${summary.integratedUnits}`,
    `- Findings: ${summary.findings}`,
    `- Subtitle repeats group: ${summary.subtitleRepeatsGroup}`,
    `- Generic note/cue remains: ${summary.genericNoteOrCue}`,
    `- Large repeated requiredIds block: ${summary.largeRepeatedRequiredIdsBlock}`,
    `- Journey requiredIds missing linked unit: ${summary.journeyRequiredIdsMissingLinkedUnit}`,
    '',
    '## Findings',
    '',
    rows.length ? '| Unit | Scope | Finding | Detail |\n| --- | --- | --- | --- |' : 'No findings.',
    ...rows.map((row) => `| ${row.unit} | ${row.scope} | ${row.finding} | ${row.detail.replace(/\|/g, '\\|')} |`),
    '',
  ].join('\n'),
);

console.log(JSON.stringify(summary, null, 2));
