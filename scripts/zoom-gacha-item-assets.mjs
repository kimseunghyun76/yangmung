import { readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const dir = process.argv[2] ?? 'public/gacha/items/generated-v2';
const crop = Number(process.argv[3] ?? 420);
const canvas = 512;
const inset = Math.floor((canvas - crop) / 2);

if (!Number.isFinite(crop) || crop <= 0 || crop > canvas) {
  console.error('Usage: node scripts/zoom-gacha-item-assets.mjs [dir] [crop]');
  process.exit(1);
}

for (const name of readdirSync(dir).filter((file) => file.endsWith('.webp')).sort()) {
  const src = join(dir, name);
  const tmp = join(dir, `.${name}.tmp.webp`);
  const result = spawnSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    src,
    '-vf',
    `format=rgba,crop=${crop}:${crop}:${inset}:${inset},scale=${canvas}:${canvas},format=rgba`,
    '-c:v',
    'libwebp',
    '-quality',
    '82',
    tmp,
  ], { stdio: 'inherit' });

  if (result.status !== 0) process.exit(result.status ?? 1);
  renameSync(tmp, src);
}

console.log(`zoomed ${dir} with center crop ${crop}x${crop}`);
