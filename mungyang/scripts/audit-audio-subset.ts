import fs from 'node:fs';
import path from 'node:path';
import { allUnits } from '../src/data/curriculum';
import { lessonForUnit } from '../src/data/lessons';
import { normalizeAudioText, type AudioManifest, type AudioManifestItem } from '../src/data/audio';

interface AudioNeed {
  unit: string;
  kind: string;
  text: string;
}

interface AudioHit {
  itemId: string;
  item: AudioManifestItem;
  relativePath: string;
}

const distAudioPath = path.resolve('dist/audio');
const manifestPath = path.join(distAudioPath, 'manifest.json');
const reportPath = path.resolve('docs/audio-subset-report.md');
const jsonReportPath = path.resolve('docs/audio-subset-report.json');

function readManifest(): AudioManifest {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing dist audio manifest: ${manifestPath}`);
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as AudioManifest;
}

function voiceNames(manifest: AudioManifest): string[] {
  return Array.isArray(manifest.voices) ? manifest.voices : Object.keys(manifest.voices ?? {});
}

function itemPath(item: AudioManifestItem, voice: string, itemId: string): string {
  if (item.path) return item.path.replace(/^\/audio\//, '');
  return `${voice}/${itemId}.mp3`;
}

function variantsFor(item: AudioManifestItem): string[] {
  return [item.text, item.synthText, ...(item.altTexts ?? [])].filter(Boolean) as string[];
}

function collectNeeds(): AudioNeed[] {
  const needs: AudioNeed[] = [];
  for (const unit of allUnits) {
    const lesson = lessonForUnit(unit.id);
    if (!lesson) continue;
    for (const card of lesson.cards) {
      if (card.kind === 'expression' || card.kind === 'staffLine' || card.kind === 'listen') {
        needs.push({ unit: unit.id, kind: card.kind, text: card.japanese });
      }
      if (card.kind === 'dialogue') {
        for (const turn of card.turns) needs.push({ unit: unit.id, kind: 'dialogue', text: turn.japanese });
      }
      if (card.kind === 'roleplay') needs.push({ unit: unit.id, kind: 'roleplay', text: card.starter });
    }
  }
  return Array.from(new Map(needs.map((need) => [normalizeAudioText(need.text), need])).values());
}

function collectFiles(root: string, suffix: string): string[] {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { recursive: true })
    .map((entry) => String(entry))
    .filter((entry) => {
      const fullPath = path.join(root, entry);
      return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile() && entry.endsWith(suffix);
    })
    .sort();
}

function fileBytes(root: string, files: string[]): number {
  return files.reduce((sum, file) => sum + fs.statSync(path.join(root, file)).size, 0);
}

function buildDistIndex(manifest: AudioManifest): { textIndex: Map<string, AudioHit>; manifestPaths: Set<string> } {
  const textIndex = new Map<string, AudioHit>();
  const manifestPaths = new Set<string>();
  const voices = voiceNames(manifest);
  const preferredVoice = voices.includes('nanami') ? 'nanami' : voices[0];

  for (const [itemId, item] of Object.entries(manifest.items ?? {})) {
    const voice = item.voice ?? preferredVoice;
    if (!voice) continue;
    const relativePath = itemPath(item, voice, itemId);
    if (relativePath.endsWith('.mp3')) manifestPaths.add(relativePath);
    for (const variant of variantsFor(item)) {
      const key = normalizeAudioText(variant);
      if (key && !textIndex.has(key)) textIndex.set(key, { itemId, item, relativePath });
    }
  }

  if (!preferredVoice) return { textIndex, manifestPaths };
  for (const [text, itemId] of Object.entries(manifest.textIndex ?? {})) {
    const key = normalizeAudioText(text);
    if (!key || textIndex.has(key)) continue;
    const item = manifest.items?.[itemId] ?? { text };
    const voice = item.voice ?? preferredVoice;
    const relativePath = itemPath(item, voice, itemId);
    if (relativePath.endsWith('.mp3')) manifestPaths.add(relativePath);
    textIndex.set(key, { itemId, item, relativePath });
  }

  return { textIndex, manifestPaths };
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });

const manifest = readManifest();
const needs = collectNeeds();
const { textIndex, manifestPaths } = buildDistIndex(manifest);
const missingTexts = needs.filter((need) => !textIndex.get(normalizeAudioText(need.text)));
const expectedFiles = new Set(
  needs
    .map((need) => textIndex.get(normalizeAudioText(need.text))?.relativePath)
    .filter((file): file is string => Boolean(file) && file.endsWith('.mp3')),
);
const actualFiles = new Set(collectFiles(distAudioPath, '.mp3'));
const missingFiles = [...expectedFiles].filter((file) => !actualFiles.has(file)).sort();
const extraFiles = [...actualFiles].filter((file) => !expectedFiles.has(file)).sort();
const extraManifestFiles = [...manifestPaths].filter((file) => !expectedFiles.has(file)).sort();
const expectedBytes = fileBytes(distAudioPath, [...expectedFiles].filter((file) => actualFiles.has(file)));
const actualBytes = fileBytes(distAudioPath, [...actualFiles]);
const ok = missingTexts.length === 0 && missingFiles.length === 0 && extraFiles.length === 0 && extraManifestFiles.length === 0;

const result = {
  requiredUniqueSessionTexts: needs.length,
  expectedMp3Files: expectedFiles.size,
  actualMp3Files: actualFiles.size,
  missingTexts: missingTexts.length,
  missingFiles: missingFiles.length,
  extraFiles: extraFiles.length,
  extraManifestFiles: extraManifestFiles.length,
  expectedBytes,
  actualBytes,
  ok,
  details: {
    missingTexts,
    missingFiles,
    extraFiles,
    extraManifestFiles,
  },
};

fs.writeFileSync(jsonReportPath, JSON.stringify(result, null, 2) + '\n');
fs.writeFileSync(
  reportPath,
  [
    '# Audio Subset Report',
    '',
    `- Dist audio source: \`${distAudioPath}\``,
    `- Required unique session texts: ${needs.length}`,
    `- Expected mp3 files: ${expectedFiles.size}`,
    `- Actual mp3 files: ${actualFiles.size}`,
    `- Missing texts: ${missingTexts.length}`,
    `- Missing files: ${missingFiles.length}`,
    `- Extra mp3 files: ${extraFiles.length}`,
    `- Extra manifest files: ${extraManifestFiles.length}`,
    `- Actual mp3 bytes: ${actualBytes}`,
    `- Status: ${ok ? 'PASS' : 'FAIL'}`,
    '',
    '## Missing Texts',
    '',
    '| Unit | Card | Japanese |',
    '| --- | --- | --- |',
    ...missingTexts.map((need) => `| ${need.unit} | ${need.kind} | ${need.text.replace(/\|/g, '\\|')} |`),
    '',
    '## Missing Files',
    '',
    ...missingFiles.map((file) => `- \`${file}\``),
    '',
    '## Extra Files',
    '',
    ...extraFiles.map((file) => `- \`${file}\``),
    '',
    '## Extra Manifest Files',
    '',
    ...extraManifestFiles.map((file) => `- \`${file}\``),
    '',
  ].join('\n'),
);

console.log(
  JSON.stringify(
    {
      expectedMp3Files: expectedFiles.size,
      actualMp3Files: actualFiles.size,
      missingTexts: missingTexts.length,
      missingFiles: missingFiles.length,
      extraFiles: extraFiles.length,
      extraManifestFiles: extraManifestFiles.length,
      actualBytes,
      ok,
      jsonReportPath,
    },
    null,
    2,
  ),
);

if (!ok) process.exit(1);
