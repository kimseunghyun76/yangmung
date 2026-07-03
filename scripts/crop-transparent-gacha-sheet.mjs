import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const outArgIndex = args.indexOf('--out');
const outDir = outArgIndex >= 0 ? args[outArgIndex + 1] : 'public/gacha/items/luxury';
if (outArgIndex >= 0) args.splice(outArgIndex, 2);
const keyArgIndex = args.indexOf('--key');
const keyColor = keyArgIndex >= 0 ? args[keyArgIndex + 1] : '0x00ff00';
if (keyArgIndex >= 0) args.splice(keyArgIndex, 2);
const insetArgIndex = args.indexOf('--inset');
const inset = insetArgIndex >= 0 ? Number(args[insetArgIndex + 1]) : 16;
if (insetArgIndex >= 0) args.splice(insetArgIndex, 2);
const [src, ...ids] = args;

if (!src || ids.length !== 4) {
  console.error('Usage: node scripts/crop-transparent-gacha-sheet.mjs <sheet.png> <top-left-id> <top-right-id> <bottom-left-id> <bottom-right-id> [--out dir] [--key 0x00ff00] [--inset 16]');
  process.exit(1);
}

if (!Number.isFinite(inset) || inset < 0 || inset >= 80) {
  console.error('--inset must be a number from 0 to 79');
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const size = 627;
const crops = [
  { id: ids[0], x: 0, y: 0 },
  { id: ids[1], x: size, y: 0 },
  { id: ids[2], x: 0, y: size },
  { id: ids[3], x: size, y: size },
];

for (const crop of crops) {
  const outWebp = `${outDir}/${crop.id}.webp`;
  const insetSize = size - inset * 2;
  run('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-i', src,
    '-vf', `crop=${insetSize}:${insetSize}:${crop.x + inset}:${crop.y + inset},scale=720:720,colorkey=${keyColor}:0.18:0.08,format=rgba`,
    '-c:v', 'libwebp',
    '-quality', '82',
    outWebp,
  ]);
  console.log(outWebp);
}
