import fs from 'node:fs';
import path from 'node:path';
import { allUnits, foundationUnits, integratedUnits, practiceUnits, starterUnits } from '../src/data/curriculum';
import { lessonForUnit, type LessonCard } from '../src/data/lessons';

interface Finding {
  severity: 'error' | 'warning';
  unit: string;
  scope: string;
  message: string;
}

const findings: Finding[] = [];
const levels = ['beginner', 'intermediate', 'advanced'] as const;
const baseFlow = ['preview', 'expression', 'expression', 'expression', 'staffLine', 'dialogue', 'branch', 'roleplay', 'quiz', 'listen', 'done'] as const;
const beginnerFlow = ['preview', 'expression', 'staffLine', 'dialogue', 'quiz', 'listen', 'done'] as const;
const intermediateFlow = ['preview', 'expression', 'expression', 'staffLine', 'dialogue', 'branch', 'quiz', 'listen', 'done'] as const;
const advancedFlow = ['preview', 'expression', 'expression', 'expression', 'staffLine', 'dialogue', 'branch', 'roleplay', 'quiz', 'listen', 'done'] as const;
const journeyRequiredKinds = ['preview', 'checkpoint', 'missionDrill', 'expression', 'staffLine', 'dialogue', 'branch', 'roleplay', 'quiz', 'listen', 'done'] as const;
const staffLike = /(ございます|いたします|お待ちください|ご確認ください|お受け取りください|お出しください|ご遠慮ください)/;
const awkwardTravelerPhrases = [
  '右に曲がってください。',
  '見せてください。',
  '合計はいくらですか。',
  'できればお願いします。',
  '問題があります。',
  '手伝ってもらえますか。',
  '液体は入っていますか。',
  '整理券を取りますか。',
  '券売機で買いますか。',
  '時間を遅くできますか。',
  '一日何回飲みますか。',
];

function add(severity: Finding['severity'], unit: string, scope: string, message: string) {
  findings.push({ severity, unit, scope, message });
}

function assertQuizRequiresSeen(unitId: string, cards: LessonCard[], scope: string) {
  const seen = new Set(cards.filter((card) => card.kind === 'expression' || card.kind === 'staffLine').map((card) => card.id));
  for (const card of cards) {
    if (card.kind !== 'quiz') continue;
    for (const id of card.requiredExpressionIds) {
      if (!seen.has(id)) add('error', unitId, scope, `quiz ${card.id} requires unseen expression ${id}`);
    }
  }
}

function assertExactFlow(unitId: string, cards: LessonCard[], scope: string, expected: readonly string[]) {
  const actual = cards.map((card) => card.kind);
  if (actual.length !== expected.length) {
    add('error', unitId, scope, `expected ${expected.length} cards, got ${actual.length}`);
    return;
  }
  for (let index = 0; index < expected.length; index++) {
    if (actual[index] !== expected[index]) {
      add('error', unitId, scope, `expected ${expected[index]} at card ${index + 1}, got ${actual[index]}`);
      return;
    }
  }
}

function assertContainsKinds(unitId: string, cards: LessonCard[], scope: string, expectedKinds: readonly string[]) {
  const actual = new Set(cards.map((card) => card.kind));
  for (const kind of expectedKinds) {
    if (!actual.has(kind)) add('error', unitId, scope, `missing required card kind ${kind}`);
  }
}

function assertUniqueCardIds(unitId: string, cards: LessonCard[], scope: string) {
  const seen = new Set<string>();
  for (const card of cards) {
    if (seen.has(card.id)) add('error', unitId, scope, `duplicate card id ${card.id}`);
    seen.add(card.id);
  }
}

function assertTravelerLines(unitId: string, cards: LessonCard[], scope: string) {
  const assertAwkward = (text: string, place: string) => {
    if (awkwardTravelerPhrases.includes(text)) add('warning', unitId, scope, `${place} should be rewritten for traveler speech: ${text}`);
  };
  for (const card of cards) {
    if (card.kind === 'expression' && staffLike.test(card.japanese)) {
      add('warning', unitId, scope, `traveler expression may sound staff-like: ${card.japanese}`);
    }
    if (card.kind === 'expression') assertAwkward(card.japanese, 'traveler expression');
    if (card.kind === 'roleplay' && staffLike.test(card.starter)) {
      add('warning', unitId, scope, `roleplay starter may sound staff-like: ${card.starter}`);
    }
    if (card.kind === 'roleplay') assertAwkward(card.starter, 'roleplay starter');
    if (card.kind === 'missionDrill') {
      if (card.lines.length === 0) add('error', unitId, scope, `mission drill ${card.id} has no lines`);
      for (const line of card.lines) {
        if (staffLike.test(line.japanese)) add('warning', unitId, scope, `mission drill line may sound staff-like: ${line.unitId} ${line.japanese}`);
        assertAwkward(line.japanese, `mission drill line ${line.unitId}`);
      }
    }
  }
}

for (const unit of allUnits) {
  const lesson = lessonForUnit(unit.id);
  if (!lesson) {
    add('error', unit.id, 'base', 'missing lesson');
    continue;
  }
  assertUniqueCardIds(unit.id, lesson.cards, 'base');
  assertQuizRequiresSeen(unit.id, lesson.cards, 'base');
  assertTravelerLines(unit.id, lesson.cards, 'base');
}

for (const unit of [...starterUnits, ...foundationUnits]) {
  const lesson = lessonForUnit(unit.id);
  if (!lesson) continue;
  assertExactFlow(unit.id, lesson.cards, unit.course, baseFlow);
}

for (const unit of practiceUnits) {
  for (const level of levels) {
    const lesson = lessonForUnit(unit.id, level);
    if (!lesson) {
      add('error', unit.id, level, 'missing level lesson');
      continue;
    }
    assertUniqueCardIds(unit.id, lesson.cards, level);
    assertQuizRequiresSeen(unit.id, lesson.cards, level);
    assertTravelerLines(unit.id, lesson.cards, level);
    const expected =
      level === 'beginner' ? beginnerFlow
      : level === 'intermediate' ? intermediateFlow
      : advancedFlow;
    assertExactFlow(unit.id, lesson.cards, level, expected);
  }
}

for (const unit of integratedUnits) {
  const lesson = lessonForUnit(unit.id);
  if (!lesson) {
    add('error', unit.id, 'journey', 'missing lesson');
    continue;
  }
  assertUniqueCardIds(unit.id, lesson.cards, 'journey');
  assertQuizRequiresSeen(unit.id, lesson.cards, 'journey');
  assertTravelerLines(unit.id, lesson.cards, 'journey');
  assertContainsKinds(unit.id, lesson.cards, 'journey', journeyRequiredKinds);
  const sequence = lesson.cards.map((card) => card.kind);
  const checkpointCount = sequence.filter((kind) => kind === 'checkpoint').length;
  const drillCount = sequence.filter((kind) => kind === 'missionDrill').length;
  if (checkpointCount !== 4) add('error', unit.id, 'journey', `expected 4 checkpoints, got ${checkpointCount}`);
  if (drillCount !== 4) add('error', unit.id, 'journey', `expected 4 mission drills, got ${drillCount}`);
  for (let index = 1; index < 9; index += 2) {
    if (sequence[index] !== 'checkpoint' || sequence[index + 1] !== 'missionDrill') {
      add('error', unit.id, 'journey', 'checkpoint and mission drill are not paired in order');
      break;
    }
  }
}

const reportPath = path.resolve('docs/content-qa.md');
const errors = findings.filter((finding) => finding.severity === 'error');
const warnings = findings.filter((finding) => finding.severity === 'warning');
fs.writeFileSync(
  reportPath,
  [
    '# Content QA Report',
    '',
    `- Practice units: ${practiceUnits.length}`,
    `- Practice level lessons: ${practiceUnits.length * levels.length}`,
    `- Integrated journeys: ${integratedUnits.length}`,
    `- Total units checked: ${allUnits.length}`,
    `- Errors: ${errors.length}`,
    `- Warnings: ${warnings.length}`,
    '',
    '## Findings',
    '',
    findings.length ? '| Severity | Unit | Scope | Message |\n| --- | --- | --- | --- |' : 'No findings.',
    ...findings.map((finding) => `| ${finding.severity} | ${finding.unit} | ${finding.scope} | ${finding.message.replace(/\|/g, '\\|')} |`),
    '',
  ].join('\n'),
);

console.log(JSON.stringify({ errors: errors.length, warnings: warnings.length, reportPath }, null, 2));
