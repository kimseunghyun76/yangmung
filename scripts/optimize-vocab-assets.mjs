import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, 'public');
const removePng = process.argv.includes('--remove-png');
const cwebp = process.env.CWEBP_BIN || 'cwebp';

const jobs = [
  {
    name: 'word-art',
    source: join(publicDir, 'vocab', 'word-art'),
    target: join(publicDir, 'vocab', 'word-art'),
    size: 384,
    quality: 76,
  },
  {
    name: 'sign-art',
    source: join(root, '.asset-tmp', 'sign-art-generated-png'),
    target: join(publicDir, 'vocab', 'sign-art', 'generated'),
    size: 512,
    quality: 78,
  },
];

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return entry.isFile() ? [path] : [];
  });
}

function sizeOf(paths) {
  return paths.reduce((sum, path) => sum + statSync(path).size, 0);
}

function fmt(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

let totalBefore = 0;
let totalAfter = 0;
let totalCount = 0;

for (const job of jobs) {
  const inputs = walk(job.source).filter((path) => extname(path).toLowerCase() === '.png');
  let before = 0;
  let after = 0;

  for (const input of inputs) {
    const rel = relative(job.source, input).replace(/\.png$/i, '.webp');
    const output = join(job.target, rel);
    mkdirSync(dirname(output), { recursive: true });
    before += statSync(input).size;

    const result = spawnSync(cwebp, [
      '-quiet',
      '-q', String(job.quality),
      '-m', '6',
      '-resize', String(job.size), String(job.size),
      input,
      '-o', output,
    ], { stdio: 'inherit' });
    if (result.status !== 0) {
      throw new Error(`${job.name}: cwebp failed for ${relative(root, input)}`);
    }
    after += statSync(output).size;
    if (removePng) rmSync(input);
  }

  const outputs = walk(job.target).filter((path) => extname(path).toLowerCase() === '.webp');
  if (job.name === 'sign-art' && removePng && existsSync(job.source)) rmSync(job.source, { recursive: true, force: true });
  totalBefore += before;
  totalAfter += after;
  totalCount += inputs.length;
  console.log(`${job.name}: ${inputs.length} PNG -> WebP, ${fmt(before)} -> ${fmt(after || sizeOf(outputs))}`);
}

console.log(`total optimized: ${totalCount} images, ${fmt(totalBefore)} -> ${fmt(totalAfter)}`);
