// 가챠 이미지 PNG → WebP 변환 — optimize-vocab-assets.mjs와 같은 cwebp 파이프라인.
// 사용자 이미지 생성 파이프라인이 PNG를 다시 만들면 이 스크립트를 재실행하면 된다.
// 실행: node scripts/optimize-gacha-assets.mjs [--remove-png]
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
    name: 'gacha-items-generated',
    source: join(publicDir, 'gacha', 'items', 'generated'),
    target: join(publicDir, 'gacha', 'items', 'generated'),
    size: 512,   // 카드 표시 크기 대비 충분 (원본 768)
    quality: 80,
  },
  {
    name: 'gacha-items-generated-v2',
    source: join(publicDir, 'gacha', 'items', 'generated-v2'),
    target: join(publicDir, 'gacha', 'items', 'generated-v2'),
    size: 512,
    quality: 80,
  },
  {
    name: 'gacha-fx',
    source: join(publicDir, 'gacha', 'fx'),
    target: join(publicDir, 'gacha', 'fx'),
    size: 640,   // 원본 크기 유지 (연출용 스프라이트)
    quality: 80,
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

  totalBefore += before;
  totalAfter += after;
  totalCount += inputs.length;
  console.log(`${job.name}: ${inputs.length} PNG -> WebP, ${fmt(before)} -> ${fmt(after)}`);
}

console.log(`total optimized: ${totalCount} images, ${fmt(totalBefore)} -> ${fmt(totalAfter)}`);
