import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

interface MissingAudioReport {
  missingTexts: Array<{
    unit: string;
    kind: string;
    text: string;
  }>;
}

interface AudioManifestItem {
  text?: string;
  synthText?: string;
  altTexts?: string[];
  path?: string;
  voice?: string;
  source?: string;
  sourceId?: string;
  sources?: string[];
  synthSignature?: string;
}

interface AudioManifest {
  generatedAt?: string | null;
  voices?: Record<string, { name: string; lang: string; label: string; gender: string }>;
  items?: Record<string, AudioManifestItem>;
  textIndex?: Record<string, string>;
  voiceTextIndex?: Record<string, Record<string, string>>;
}

interface AudioJob {
  id: string;
  text: string;
  sourceId: string;
  sources: string[];
  synthSignature: string;
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry');
const force = args.includes('--force');
const limit = Number(valueArg('--limit') || '0');
const reportPath = path.resolve(valueArg('--report') || 'docs/audio-missing.json');
const audioRoot = path.resolve(valueArg('--audio-root') || 'public/audio');
const manifestPath = path.join(audioRoot, 'manifest.json');
const voiceKey = valueArg('--voice') || 'nanami';
const region = process.env.AZURE_SPEECH_REGION || 'koreacentral';
const key = process.env.AZURE_SPEECH_KEY;

const voices = {
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
} as const;

function valueArg(name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function hashText(text: string): string {
  return crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);
}

function normalizeText(text: string): string {
  return String(text || '')
    .replace(/[〜~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSSML(job: AudioJob): string {
  const voice = voices[voiceKey as keyof typeof voices];
  return `<speak version="1.0" xml:lang="${voice.lang}" xmlns="http://www.w3.org/2001/10/synthesis">
  <voice name="${voice.name}">
    <prosody rate="-5%">${escapeXml(job.text)}</prosody>
  </voice>
</speak>`;
}

function loadManifest(): AudioManifest {
  if (!fs.existsSync(manifestPath)) {
    return { generatedAt: null, voices: {}, items: {}, textIndex: {}, voiceTextIndex: {} };
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as AudioManifest;
}

function audioReady(job: AudioJob): boolean {
  const filePath = path.join(audioRoot, voiceKey, `${job.id}.mp3`);
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
}

function markAvailable(manifest: AudioManifest, job: AudioJob): void {
  manifest.items ??= {};
  manifest.textIndex ??= {};
  manifest.voiceTextIndex ??= {};
  manifest.voiceTextIndex[voiceKey] ??= {};
  manifest.items[job.id] = {
    ...(manifest.items[job.id] ?? {}),
    text: job.text,
    synthText: job.text,
    altTexts: [],
    synthSignature: job.synthSignature,
    path: `/audio/${voiceKey}/${job.id}.mp3`,
    voice: voiceKey,
    source: 'mungyang',
    sourceId: job.sourceId,
    sources: job.sources,
  };
  manifest.voiceTextIndex[voiceKey][job.text] = job.id;
  if (voiceKey === 'nanami') manifest.textIndex[job.text] = job.id;
}

function writeManifest(manifest: AudioManifest): void {
  manifest.generatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
}

function collectJobs(): AudioJob[] {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as MissingAudioReport;
  const grouped = new Map<string, MissingAudioReport['missingTexts'][number][]>();
  for (const item of report.missingTexts) {
    const text = normalizeText(item.text);
    if (!text) continue;
    const rows = grouped.get(text) ?? [];
    rows.push(item);
    grouped.set(text, rows);
  }
  const jobs = Array.from(grouped.entries()).map(([text, rows]) => {
    const id = voiceKey === 'nanami' ? `tts_${hashText(text)}` : `tts_${voiceKey}_${hashText(text)}`;
    return {
      id,
      text,
      sourceId: rows.map((row) => `${row.unit}:${row.kind}`).join(','),
      sources: rows.map((row) => `mungyang:${row.unit}:${row.kind}`),
      synthSignature: hashText(JSON.stringify([text, null])),
    };
  });
  return limit > 0 ? jobs.slice(0, limit) : jobs;
}

async function synth(job: AudioJob, attempt = 1): Promise<Buffer> {
  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key ?? '',
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'mungyang-tts',
    },
    body: buildSSML(job),
  });
  if (response.status === 429 && attempt <= 10) {
    const retryAfter = Number(response.headers.get('retry-after') || '0');
    const wait = retryAfter > 0 ? retryAfter * 1000 : Math.min(90000, 5000 * Math.pow(1.5, attempt - 1));
    console.log(`429 rate limited; waiting ${Math.round(wait / 1000)}s`);
    await new Promise((resolve) => setTimeout(resolve, wait));
    return synth(job, attempt + 1);
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${body.slice(0, 180)}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main(): Promise<void> {
  const voice = voices[voiceKey as keyof typeof voices];
  if (!voice) throw new Error(`Unknown voice "${voiceKey}". Available: ${Object.keys(voices).join(', ')}`);
  const manifest = loadManifest();
  manifest.voices ??= {};
  manifest.voices[voiceKey] = voice;

  const jobs = collectJobs().filter((job) => force || !audioReady(job));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`voice     : ${voiceKey} (${voice.name})`);
  console.log(`region    : ${region}`);
  console.log(`jobs      : ${jobs.length}${force ? ' (--force)' : ''}`);
  console.log(`manifest  : ${path.relative(process.cwd(), manifestPath)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (dryRun) {
    console.log(jobs.slice(0, 20).map((job) => `${job.id} ${job.text}`).join('\n'));
    console.log('[--dry] no Azure calls');
    return;
  }
  if (!key) throw new Error('AZURE_SPEECH_KEY is required. AZURE_SPEECH_REGION defaults to koreacentral.');

  fs.mkdirSync(path.join(audioRoot, voiceKey), { recursive: true });
  const rateGapMs = 3500;
  let done = 0;
  let failed = 0;
  let lastCallAt = 0;
  const failures: Array<{ id: string; text: string; error: string }> = [];

  for (const job of jobs) {
    try {
      const wait = Math.max(0, lastCallAt + rateGapMs - Date.now());
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      lastCallAt = Date.now();
      const audio = await synth(job);
      if (audio.length === 0) throw new Error('empty audio response');
      fs.writeFileSync(path.join(audioRoot, voiceKey, `${job.id}.mp3`), audio);
      markAvailable(manifest, job);
      done++;
      if (done % 10 === 0 || done === jobs.length) {
        console.log(`  [${done}/${jobs.length}] ${job.text}`);
        writeManifest(manifest);
      }
    } catch (error) {
      failed++;
      failures.push({ id: job.id, text: job.text, error: error instanceof Error ? error.message : String(error) });
      console.error(`  fail ${job.id} ${job.text}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  writeManifest(manifest);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`done      : ${done}`);
  console.log(`failed    : ${failed}`);
  if (failures.length > 0) {
    console.log('failures:');
    for (const failure of failures.slice(0, 10)) console.log(`- ${failure.id} ${failure.text}: ${failure.error}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
