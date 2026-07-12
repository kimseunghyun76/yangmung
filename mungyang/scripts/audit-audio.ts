import fs from 'node:fs';
import path from 'node:path';
import { allUnits } from '../src/data/curriculum';
import { lessonForUnit } from '../src/data/lessons';
import { audioPathForText, buildAudioIndex, type AudioManifest } from '../src/data/audio';

interface AudioNeed {
  unit: string;
  kind: string;
  text: string;
}

const manifestPath = path.resolve('public/audio/manifest.json');
const fallbackManifestPath = path.resolve('../kana-master/public/audio/manifest.json');
const reportPath = path.resolve('docs/audio-missing.md');
const jsonReportPath = path.resolve('docs/audio-missing.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as AudioManifest;
const fallbackManifest = fs.existsSync(fallbackManifestPath)
  ? JSON.parse(fs.readFileSync(fallbackManifestPath, 'utf8')) as AudioManifest
  : undefined;
const index = new Map<string, string>();
if (fallbackManifest) {
  for (const [key, value] of buildAudioIndex(fallbackManifest, '../kana-master/public/audio')) index.set(key, value);
}
for (const [key, value] of buildAudioIndex(manifest, '/audio')) index.set(key, value);
const needs: AudioNeed[] = [];

for (const unit of allUnits) {
  const lesson = lessonForUnit(unit.id);
  if (!lesson) continue;
  for (const card of lesson.cards) {
    if (card.kind === 'expression' || card.kind === 'staffLine' || card.kind === 'listen') {
      needs.push({ unit: unit.id, kind: card.kind, text: card.japanese });
    }
    if (card.kind === 'dialogue') {
      for (const turn of card.turns) {
        needs.push({ unit: unit.id, kind: 'dialogue', text: turn.japanese });
      }
    }
    if (card.kind === 'roleplay') {
      needs.push({ unit: unit.id, kind: 'roleplay', text: card.starter });
    }
  }
}

const uniqueNeeds = Array.from(new Map(needs.map((need) => [need.text, need])).values());
const missing = uniqueNeeds.filter((need) => !audioPathForText(index, need.text));
const covered = uniqueNeeds.length - missing.length;
const coverage = uniqueNeeds.length ? ((covered / uniqueNeeds.length) * 100).toFixed(1) : '0.0';

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(
  reportPath,
  [
    '# Audio Missing Report',
    '',
    `- Primary source: \`${manifestPath}\``,
    `- Fallback source: \`${fallbackManifestPath}\``,
    `- Primary manifest items: ${Object.keys(manifest.items ?? {}).length}`,
    `- Fallback text index items: ${Object.keys(fallbackManifest?.textIndex ?? {}).length}`,
    `- Required unique session texts: ${uniqueNeeds.length}`,
    `- Reused from existing audio: ${covered}`,
    `- Missing audio: ${missing.length}`,
    `- Coverage: ${coverage}%`,
    '',
    '## Missing Texts',
    '',
    '| Unit | Card | Japanese |',
    '| --- | --- | --- |',
    ...missing.map((need) => `| ${need.unit} | ${need.kind} | ${need.text.replace(/\|/g, '\\|')} |`),
    '',
  ].join('\n'),
);

fs.writeFileSync(
  jsonReportPath,
  JSON.stringify(
    {
      primarySource: manifestPath,
      fallbackSource: fallbackManifestPath,
      requiredUniqueSessionTexts: uniqueNeeds.length,
      reusedFromExistingAudio: covered,
      missingAudio: missing.length,
      coverage: Number(coverage),
      missingTexts: missing,
    },
    null,
    2,
  ),
);

console.log(JSON.stringify({ total: uniqueNeeds.length, covered, missing: missing.length, coverage, jsonReportPath }, null, 2));
