import fs from 'node:fs';
import path from 'node:path';
import { allUnits } from '../src/data/curriculum';
import { lessonForUnit } from '../src/data/lessons';
import { normalizeAudioText, type AudioManifest, type AudioManifestItem } from '../src/data/audio';

interface AudioNeed {
  text: string;
}

interface AudioHit {
  key: string;
  itemId: string;
  item: AudioManifestItem;
  sourceRoot: string;
  voice: string;
  sourcePath: string;
  distPath: string;
}

const distAudioPath = path.resolve('dist/audio');
const primaryAudioPath = path.resolve('public/audio');
const fallbackAudioPath = path.resolve('../kana-master/public/audio');
const primaryManifestPath = path.join(primaryAudioPath, 'manifest.json');
const fallbackManifestPath = path.join(fallbackAudioPath, 'manifest.json');
const preferredVoice = 'nanami';

function readManifest(manifestPath: string): AudioManifest | undefined {
  if (!fs.existsSync(manifestPath)) return undefined;
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
      if (card.kind === 'expression' || card.kind === 'staffLine' || card.kind === 'listen') needs.push({ text: card.japanese });
      if (card.kind === 'dialogue') {
        for (const turn of card.turns) needs.push({ text: turn.japanese });
      }
      if (card.kind === 'roleplay') needs.push({ text: card.starter });
    }
  }
  return Array.from(new Map(needs.map((need) => [normalizeAudioText(need.text), need])).values());
}

function addManifestHits(index: Map<string, AudioHit>, manifest: AudioManifest | undefined, sourceRoot: string): void {
  if (!manifest) return;
  const voices = voiceNames(manifest);
  const voice = voices.includes(preferredVoice) ? preferredVoice : voices[0];
  for (const [itemId, item] of Object.entries(manifest.items ?? {})) {
    const itemVoice = item.voice ?? voice;
    const relativePath = itemPath(item, itemVoice, itemId);
    const sourcePath = path.join(sourceRoot, relativePath);
    if (!fs.existsSync(sourcePath)) continue;
    for (const variant of variantsFor(item)) {
      const key = normalizeAudioText(variant);
      if (!key || index.has(key)) continue;
      index.set(key, {
        key,
        itemId,
        item,
        sourceRoot,
        voice: itemVoice,
        sourcePath,
        distPath: relativePath,
      });
    }
  }
  if (!voice) return;
  for (const [text, itemId] of Object.entries(manifest.textIndex ?? {})) {
    const key = normalizeAudioText(text);
    if (!key || index.has(key)) continue;
    const item = manifest.items?.[itemId] ?? { text };
    const relativePath = itemPath(item, voice, itemId);
    const sourcePath = path.join(sourceRoot, relativePath);
    if (!fs.existsSync(sourcePath)) continue;
    index.set(key, {
      key,
      itemId,
      item: { ...item, text, path: `/audio/${relativePath}`, voice },
      sourceRoot,
      voice,
      sourcePath,
      distPath: relativePath,
    });
  }
}

const beforeBytes = fs.existsSync(distAudioPath) ? Number(fs.statSync(distAudioPath).size) : 0;
const beforeSize = fs.existsSync(distAudioPath)
  ? Number(fs.readdirSync(distAudioPath, { recursive: true }).reduce((sum, entry) => {
      const fullPath = path.join(distAudioPath, String(entry));
      return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile() ? sum + fs.statSync(fullPath).size : sum;
    }, 0))
  : beforeBytes;
const primaryManifest = readManifest(primaryManifestPath);
const fallbackManifest = readManifest(fallbackManifestPath);
const index = new Map<string, AudioHit>();

addManifestHits(index, fallbackManifest, fallbackAudioPath);
addManifestHits(index, primaryManifest, primaryAudioPath);

const needs = collectNeeds();
const hits = needs.map((need) => index.get(normalizeAudioText(need.text))).filter(Boolean) as AudioHit[];
const uniqueHits = Array.from(new Map(hits.map((hit) => [hit.distPath, hit])).values());
const prunedItems: Record<string, AudioManifestItem> = {};
const prunedTextIndex: Record<string, string> = {};

fs.rmSync(distAudioPath, { recursive: true, force: true });
fs.mkdirSync(distAudioPath, { recursive: true });

for (const hit of uniqueHits) {
  const destination = path.join(distAudioPath, hit.distPath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(hit.sourcePath, destination);
  const itemId = path.basename(hit.distPath, '.mp3');
  const text = hit.item.text ?? hit.item.synthText ?? hit.key;
  prunedItems[itemId] = {
    ...hit.item,
    text,
    path: `/audio/${hit.distPath}`,
    voice: hit.voice,
  };
  for (const variant of variantsFor(prunedItems[itemId])) {
    prunedTextIndex[variant] = itemId;
  }
}

const voices = Object.fromEntries(
  Object.entries((primaryManifest?.voices ?? fallbackManifest?.voices ?? {}) as Record<string, unknown>).filter(([voice]) =>
    uniqueHits.some((hit) => hit.voice === voice),
  ),
);

fs.writeFileSync(
  path.join(distAudioPath, 'manifest.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      voices,
      items: prunedItems,
      textIndex: prunedTextIndex,
    },
    null,
    2,
  ),
);

const afterSize = Number(fs.readdirSync(distAudioPath, { recursive: true }).reduce((sum, entry) => {
  const fullPath = path.join(distAudioPath, String(entry));
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile() ? sum + fs.statSync(fullPath).size : sum;
}, 0));

console.log(JSON.stringify({ needs: needs.length, copied: uniqueHits.length, beforeBytes: beforeSize, afterBytes: afterSize }, null, 2));
