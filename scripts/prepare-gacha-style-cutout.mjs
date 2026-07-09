import { mkdirSync, renameSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const [, , input, output, keyColorArg = '0x00ff00'] = process.argv;

if (!input || !output) {
  console.error('Usage: node scripts/prepare-gacha-style-cutout.mjs <input.png> <output.webp> [keyColor]');
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });
const tmp = join(dirname(output), `.${Date.now()}.tmp.webp`);

const filters = [
  'format=rgba',
  `colorkey=${keyColorArg}:0.28:0.05`,
];

if (keyColorArg.toLowerCase() !== '0xff00ff') {
  filters.push('despill=type=green:mix=0.82:expand=0.18');
}

const vf = [
  ...filters,
  'format=rgba',
  'scale=512:512:flags=lanczos',
].join(',');

const result = spawnSync('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-i',
  input,
  '-vf',
  vf,
  '-c:v',
  'libwebp',
  '-quality',
  '88',
  tmp,
], { stdio: 'inherit' });

if (result.status !== 0) {
  rmSync(tmp, { force: true });
  process.exit(result.status ?? 1);
}

renameSync(tmp, output);
console.log(`prepared ${output}`);
