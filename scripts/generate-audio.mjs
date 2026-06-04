#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { CONTENT } from '../src/content/index.ts';
import { signs } from '../src/content/signs.ts';
import { SCENE_SENTENCES } from '../src/content/sceneSentences.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'audio');
const VOICES = {
  nanami: {
    name: 'ja-JP-NanamiNeural',
    lang: 'ja-JP',
    label: 'Nanami (ja-JP)',
    gender: 'F',
  },
  keita: {
    name: 'ja-JP-KeitaNeural',
    lang: 'ja-JP',
    label: 'Keita (ja-JP)',
    gender: 'M',
  },
};

const KEY = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION || 'koreacentral';
const args = process.argv.slice(2);
const dryRun = args.includes('--dry');
const force = args.includes('--force');
const only = valueArg('--only'); // kana | phrases | signs | sentences | tips | recap | core
const VOICE_KEY = valueArg('--voice') || (only === 'recap' ? 'keita' : 'nanami');
const VOICE = VOICES[VOICE_KEY];
const sourceIdFilter = valueArg('--source-id'); // 특정 Phrase/Kana/Sign id만 재생성
const limit = Number(valueArg('--limit') || '0');
const reuseRoot = valueArg('--reuse-root') || path.resolve(ROOT, '..', 'kana-master', 'public', 'audio');
const UNSPEAKABLE_TEXTS = new Set(['ー']);
const RECAP_PROMPTS = [
  'おしはらいはどうしますか',
  'ごちゅうもんはおきまりですか',
  'なんめいさまですか',
  'ごよやくはありますか',
  'どうしましたか',
  'どちらへいきますか',
  'なにをおさがしですか',
  'ごようけんはなんですか',
  'ほかになにかありますか',
];

function valueArg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

if (!VOICE) {
  console.error(`Unknown voice "${VOICE_KEY}". Available: ${Object.keys(VOICES).join(', ')}`);
  process.exit(1);
}

function hashText(text) {
  return crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);
}

function normalizeText(text) {
  return String(text || '')
    .replace(/[〜~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function displayText(p) {
  return normalizeText(p.displayKana ?? p.kana);
}

function synthesisText(p) {
  return normalizeText(p.kanji ?? p.displayKana ?? p.kana);
}

function inheritedSpeechPhoneme(item) {
  const keys = new Set([displayText(item), synthesisText(item), normalizeText(item.kana), normalizeText(item.kanji)].filter(Boolean));
  return CONTENT.phrases.find((p) => p.speechPhoneme && [displayText(p), synthesisText(p), normalizeText(p.kana), normalizeText(p.kanji)].some((text) => keys.has(text)))?.speechPhoneme;
}

function addItem(items, seen, source, sourceId, text, priority = 50, altTexts = [], synthText = text, speechPhoneme = undefined) {
  const clean = normalizeText(text);
  if (!clean) return;
  if (UNSPEAKABLE_TEXTS.has(clean)) return;
  const cleanSynthText = normalizeText(synthText) || clean;
  const cleanPhoneme = normalizeText(speechPhoneme);
  const synthSignature = hashText(JSON.stringify([cleanSynthText, cleanPhoneme || null]));
  const key = clean;
  if (seen.has(key)) {
    const prev = seen.get(key);
    prev.sources.push(`${source}:${sourceId}`);
    prev.altTexts.push(...altTexts.map(normalizeText).filter(Boolean));
    prev.altTexts = [...new Set(prev.altTexts)];
    prev.priority = Math.min(prev.priority, priority);
    return;
  }
  const id = VOICE_KEY === 'nanami' ? `tts_${hashText(clean)}` : `tts_${VOICE_KEY}_${hashText(clean)}`;
  const item = { id, text: clean, synthText: cleanSynthText, speechPhoneme: cleanPhoneme || undefined, synthSignature, altTexts: [...new Set(altTexts.map(normalizeText).filter(Boolean))], source, sourceId, sources: [`${source}:${sourceId}`], priority };
  seen.set(key, item);
  items.push(item);
}

function missionPhraseIds() {
  const ids = new Set();
  for (const m of CONTENT.missions) {
    for (const step of m.steps) {
      if (step.promptPhraseId) ids.add(step.promptPhraseId);
      for (const c of step.choices) if (c.phraseId) ids.add(c.phraseId);
    }
    for (const id of m.speakPhraseIds ?? []) ids.add(id);
  }
  return ids;
}

function collectItems() {
  const items = [];
  const seen = new Map();
  const corePhraseIds = missionPhraseIds();

  if (!only || only === 'kana' || only === 'core') {
    for (const k of CONTENT.kana) addItem(items, seen, 'kana', k.id, k.char, 10);
  }
  if (!only || only === 'phrases' || only === 'core') {
    for (const p of CONTENT.phrases) {
      const inMission = corePhraseIds.has(p.id);
      if (only === 'core' && !inMission && !p.recoveryType) continue;
      addItem(items, seen, 'phrase', p.id, displayText(p), inMission ? 15 : 35, [p.displayKana, p.kana, p.kanji].filter(Boolean), synthesisText(p), p.speechPhoneme);
    }
  }
  if (!only || only === 'signs') {
    for (const s of signs) {
      addItem(items, seen, 'sign', s.id, normalizeText(s.kana || s.ja), 45, [s.ja]);
      if (s.ja && s.ja !== s.kana) addItem(items, seen, 'sign', `${s.id}:ja`, s.ja, 50, [s.kana]);
    }
  }
  if (!only || only === 'sentences') {
    for (const [sceneId, sentences] of Object.entries(SCENE_SENTENCES)) {
      for (const s of sentences) {
        addItem(
          items,
          seen,
          'sentence',
          s.id,
          displayText(s),
          55,
          [s.displayKana, s.kana, s.kanji].filter(Boolean),
          synthesisText(s),
          inheritedSpeechPhoneme(s),
        );
      }
    }
  }
  if (!only || only === 'tips') {
    for (const tip of CONTENT.grammar) {
      if (tip.exampleJa) addItem(items, seen, 'tip', tip.id, tip.exampleJa, 58);
    }
  }
  if (!only || only === 'recap') {
    RECAP_PROMPTS.forEach((text, i) => addItem(items, seen, 'recap', `recap_${i + 1}`, text, 32));
  }

  items.sort((a, b) => a.priority - b.priority || a.text.localeCompare(b.text, 'ja'));
  const filtered = sourceIdFilter ? items.filter((item) => item.sourceId === sourceIdFilter) : items;
  return limit > 0 ? filtered.slice(0, limit) : filtered;
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSSML(item) {
  const body = item.speechPhoneme
    ? `<phoneme alphabet="sapi" ph="${escapeXml(item.speechPhoneme)}">${escapeXml(item.synthText)}</phoneme>`
    : escapeXml(item.synthText);
  return `<speak version="1.0" xml:lang="${VOICE.lang}" xmlns="http://www.w3.org/2001/10/synthesis">
  <voice name="${VOICE.name}">
    <prosody rate="-5%">${body}</prosody>
  </voice>
</speak>`;
}

async function synth(item, attempt = 1) {
  const url = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'yangmung-tts',
    },
    body: buildSSML(item),
  });
  if (res.status === 429 && attempt <= 10) {
    const retryAfter = Number(res.headers.get('retry-after') || '0');
    const wait = retryAfter > 0 ? retryAfter * 1000 : Math.min(90000, 5000 * Math.pow(1.5, attempt - 1));
    console.log(`429 rate limited; waiting ${Math.round(wait / 1000)}s`);
    await new Promise((r) => setTimeout(r, wait));
    return synth(item, attempt + 1);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${body.slice(0, 180)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function loadManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return { generatedAt: null, voices: {}, items: {}, textIndex: {}, voiceTextIndex: {} };
  }
  try {
    const old = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const textIndex = old.textIndex ?? {};
    return {
      generatedAt: old.generatedAt ?? null,
      voices: old.voices ?? {},
      items: old.items ?? {},
      textIndex,
      voiceTextIndex: old.voiceTextIndex ?? { nanami: { ...textIndex } },
    };
  } catch {
    return { generatedAt: null, voices: {}, items: {}, textIndex: {}, voiceTextIndex: {} };
  }
}

function audioFileReady(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
  } catch {
    return false;
  }
}

function copyReusableAudio(items, manifest, voiceDir) {
  const sourceManifestPath = path.join(reuseRoot, 'manifest.json');
  if (!fs.existsSync(sourceManifestPath)) return 0;
  let source;
  try {
    source = JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8'));
  } catch {
    return 0;
  }
  let copied = 0;
  fs.mkdirSync(voiceDir, { recursive: true });
  for (const item of items) {
    // 명시 발음 교정 항목은 외부 파일을 재사용하지 않고 현재 SSML로 다시 만든다.
    if (item.speechPhoneme) continue;
    const outPath = path.join(voiceDir, `${item.id}.mp3`);
    if (!force && !needsGeneration(item, manifest, voiceDir)) continue;
    const sourceId = source.voiceTextIndex?.[VOICE_KEY]?.[item.synthText]
      ?? (VOICE_KEY === 'nanami' ? source.textIndex?.[item.synthText] : undefined);
    if (!sourceId) continue;
    const sourcePath = path.join(reuseRoot, VOICE_KEY, `${sourceId}.mp3`);
    if (!audioFileReady(sourcePath)) continue;
    fs.copyFileSync(sourcePath, outPath);
    const cur = manifest.items[item.id] ?? {};
    manifest.items[item.id] = { ...cur, reusedFrom: `kana-master:${sourceId}` };
    markAvailable(manifest, item);
    copied++;
  }
  return copied;
}

function markAvailable(manifest, item) {
  manifest.voiceTextIndex[VOICE_KEY] ??= {};
  manifest.voiceTextIndex[VOICE_KEY][item.text] = item.id;
  if (VOICE_KEY === 'nanami') manifest.textIndex[item.text] = item.id;
  for (const alias of item.altTexts ?? []) {
    const clean = normalizeText(alias);
    if (clean && !UNSPEAKABLE_TEXTS.has(clean)) {
      manifest.voiceTextIndex[VOICE_KEY][clean] = item.id;
      if (VOICE_KEY === 'nanami') manifest.textIndex[clean] = item.id;
    }
  }
  manifest.items[item.id] = {
    ...(manifest.items[item.id] ?? {}),
    text: item.text,
    synthText: item.synthText,
    speechPhoneme: item.speechPhoneme,
    synthSignature: item.synthSignature,
    altTexts: item.altTexts,
    path: `/audio/${VOICE_KEY}/${item.id}.mp3`,
    voice: VOICE_KEY,
    source: item.source,
    sourceId: item.sourceId,
    sources: item.sources,
  };
}

function needsGeneration(item, manifest, voiceDir) {
  if (force) return true;
  if (!audioFileReady(path.join(voiceDir, `${item.id}.mp3`))) return true;
  const current = manifest.items[item.id];
  const pronunciationSensitive = item.synthText !== item.text || !!item.speechPhoneme;
  return pronunciationSensitive && current?.synthSignature !== item.synthSignature;
}

function syncAvailableManifest(items, manifest, voiceDir) {
  manifest.voiceTextIndex[VOICE_KEY] ??= {};
  for (const item of items) {
    if (!needsGeneration(item, manifest, voiceDir)) markAvailable(manifest, item);
    else {
      if (manifest.voiceTextIndex[VOICE_KEY][item.text] === item.id) delete manifest.voiceTextIndex[VOICE_KEY][item.text];
      if (VOICE_KEY === 'nanami' && manifest.textIndex[item.text] === item.id) delete manifest.textIndex[item.text];
    }
  }
}

function writeManifest(manifestPath, manifest) {
  manifest.generatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
}

async function main() {
  const items = collectItems();
  const chars = items.reduce((sum, item) => sum + item.text.length, 0);
  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  const voiceDir = path.join(OUT_DIR, VOICE_KEY);
  const manifest = loadManifest(manifestPath);
  const currentIds = new Set(items.map((item) => item.id));
  const fullCollection = VOICE_KEY === 'nanami' && !only && !sourceIdFilter && limit <= 0;

  if (fullCollection) {
    for (const text of UNSPEAKABLE_TEXTS) {
      const id = manifest.textIndex[text] ?? `tts_${hashText(text)}`;
      delete manifest.textIndex[text];
      delete manifest.voiceTextIndex.nanami?.[text];
      delete manifest.items[id];
    }
    for (const id of Object.keys(manifest.items)) {
      if (manifest.items[id]?.voice === 'nanami' && !currentIds.has(id)) delete manifest.items[id];
    }
    for (const [text, id] of Object.entries(manifest.textIndex)) {
      if (!currentIds.has(id)) delete manifest.textIndex[text];
    }
    for (const [text, id] of Object.entries(manifest.voiceTextIndex.nanami ?? {})) {
      if (!currentIds.has(id)) delete manifest.voiceTextIndex.nanami[text];
    }
  }

  manifest.voices[VOICE_KEY] = VOICE;
  for (const item of items) {
    const cur = manifest.items[item.id] ?? {};
    manifest.items[item.id] = {
      ...cur,
      text: item.text,
      voice: VOICE_KEY,
      source: item.source,
      sourceId: item.sourceId,
      sources: item.sources,
      altTexts: item.altTexts,
      synthText: item.synthText,
      speechPhoneme: item.speechPhoneme,
      synthSignature: cur.synthSignature,
    };
  }

  const reused = dryRun ? 0 : copyReusableAudio(items, manifest, voiceDir);
  if (!dryRun) {
    syncAvailableManifest(items, manifest, voiceDir);
    writeManifest(manifestPath, manifest);
  }
  const jobs = items.filter((item) => needsGeneration(item, manifest, voiceDir));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`voice     : ${VOICE_KEY} (${VOICE.name})`);
  console.log(`region    : ${REGION}`);
  console.log(`items     : ${items.length}`);
  console.log(`new jobs  : ${jobs.length}${force ? ' (--force)' : ''}`);
  if (!dryRun) console.log(`reused    : ${reused} (${path.relative(ROOT, reuseRoot)})`);
  console.log(`chars     : ${chars.toLocaleString()}`);
  console.log(`filter    : ${only ?? 'all'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (dryRun) {
    console.log(items.slice(0, 20).map((item) => `${item.id} ${item.text}`).join('\n'));
    console.log('[--dry] no Azure calls');
    return;
  }
  if (!KEY) {
    console.error('AZURE_SPEECH_KEY is required. AZURE_SPEECH_REGION defaults to koreacentral.');
    process.exit(1);
  }

  fs.mkdirSync(voiceDir, { recursive: true });
  const RATE_GAP_MS = 3500;
  let done = 0;
  let failed = 0;
  let lastCallAt = 0;
  const failures = [];

  for (const job of jobs) {
    try {
      const wait = Math.max(0, lastCallAt + RATE_GAP_MS - Date.now());
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      lastCallAt = Date.now();
      const buf = await synth(job);
      if (buf.length === 0) throw new Error('empty audio response');
      fs.writeFileSync(path.join(voiceDir, `${job.id}.mp3`), buf);
      delete manifest.items[job.id]?.reusedFrom;
      markAvailable(manifest, job);
      done++;
      if (done % 20 === 0 || done === jobs.length) console.log(`  [${done}/${jobs.length}] ${job.text}`);
      if (done % 20 === 0) writeManifest(manifestPath, manifest);
    } catch (err) {
      failed++;
      failures.push({ id: job.id, text: job.text, error: err.message });
      console.error(`  fail ${job.id} ${job.text}: ${err.message}`);
    }
  }

  writeManifest(manifestPath, manifest);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`done      : ${done}`);
  console.log(`failed    : ${failed}`);
  console.log(`manifest  : ${path.relative(ROOT, manifestPath)}`);
  if (failures.length) {
    console.log('failures:');
    failures.slice(0, 10).forEach((f) => console.log(`- ${f.id} ${f.text}: ${f.error}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
