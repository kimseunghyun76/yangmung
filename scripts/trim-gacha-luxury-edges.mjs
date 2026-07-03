import { readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const dir = process.argv[2] ?? 'public/gacha/items/luxury';
const inset = Number(process.argv[3] ?? 16);
const canvas = 720;
const crop = canvas - inset * 2;

if (!Number.isFinite(inset) || inset < 0 || inset >= 80) {
  console.error('Usage: node scripts/trim-gacha-luxury-edges.mjs [dir] [inset]');
  console.error('inset must be a number from 0 to 79');
  process.exit(1);
}

const files = readdirSync(dir)
  .filter((name) => name.endsWith('.webp'))
  .sort();

for (const name of files) {
  const src = join(dir, name);
  const tmp = join(dir, `.${name}.tmp.webp`);
  const result = spawnSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    src,
    '-vf',
    `format=rgba,crop=${crop}:${crop}:${inset}:${inset},pad=${canvas}:${canvas}:${inset}:${inset}:color=#00000000,format=rgba`,
    '-c:v',
    'libwebp',
    '-quality',
    '82',
    tmp,
  ], { stdio: 'inherit' });

  if (result.status !== 0) process.exit(result.status ?? 1);
  renameSync(tmp, src);
  console.log(src);
}
