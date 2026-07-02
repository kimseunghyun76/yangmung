import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const args = process.argv.slice(2);
const outArgIndex = args.indexOf('--out');
const outDir = outArgIndex >= 0 ? args[outArgIndex + 1] : 'public/vocab/sign-art/concept';
if (outArgIndex >= 0) args.splice(outArgIndex, 2);
const [src, ...ids] = args;

if (!src || ids.length !== 4) {
  console.error('Usage: node scripts/crop-sign-concept-sheet.mjs <sheet.png> <top-left-id> <top-right-id> <bottom-left-id> <bottom-right-id>');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const size = 627;
const crops = [
  { id: ids[0], x: 0, y: 0 },
  { id: ids[1], x: size, y: 0 },
  { id: ids[2], x: 0, y: size },
  { id: ids[3], x: size, y: size },
];

for (const crop of crops) {
  const out = `${outDir}/${crop.id}.webp`;
  const result = spawnSync('ffmpeg', [
    '-y',
    '-loglevel', 'error',
    '-i', src,
    '-vf', `crop=${size}:${size}:${crop.x}:${crop.y},scale=720:720`,
    '-c:v', 'libwebp',
    '-quality', '82',
    out,
  ], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log(out);
}
