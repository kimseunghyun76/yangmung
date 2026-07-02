import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/dennis/kana-master/kana-master/node_modules/playwright');

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const manifestPath = join(root, 'docs', 'generated-image-manifests', 'vocab-body-and-sign-art.json');
const templateDir = join(root, 'scripts', 'assets', 'sign-art-templates');
const outDir = join(root, 'public', 'vocab', 'sign-art', 'generated');
const tmpDir = join(root, '.asset-tmp', 'sign-art-rendered-png');

const W = 1024;
const H = 1024;

const boxes = {
  checkout: { x: 455, y: 210, w: 410, h: 560, max: 145, color: '#172f2b', shadow: 'light' },
  construction: { x: 315, y: 165, w: 450, h: 660, max: 135, color: '#201914', shadow: 'light' },
  mallEntrance: { x: 305, y: 125, w: 640, h: 300, max: 175, color: '#211914', shadow: 'light' },
  receipt: { x: 330, y: 215, w: 280, h: 675, max: 130, color: '#26211c', shadow: 'light' },
  restaurantMenu: { x: 300, y: 165, w: 600, h: 675, max: 165, color: '#281b13', shadow: 'light' },
  restroom: { x: 335, y: 175, w: 560, h: 235, max: 150, color: '#1f1712', shadow: 'light' },
  shopNotice: { x: 465, y: 400, w: 335, h: 265, max: 120, color: '#241a13', shadow: 'light' },
  stationWayfinding: { x: 305, y: 150, w: 630, h: 205, max: 130, color: '#181f24', shadow: 'light' },
  storePromo: { x: 465, y: 245, w: 350, h: 660, max: 135, color: '#241913', shadow: 'light' },
  transitBoard: { x: 465, y: 215, w: 560, h: 255, max: 125, color: '#94ffd8', shadow: 'dark' },
};

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrap(text) {
  const compact = text.replace(/\s+/g, '');
  const chars = Array.from(compact);
  const max = chars.length >= 12 ? 5 : chars.length >= 9 ? 5 : chars.length >= 7 ? 4 : chars.length >= 5 ? 4 : 6;
  const lines = [];
  let current = '';
  for (const ch of chars) {
    current += ch;
    if (Array.from(current).length >= max) {
      lines.push(current);
      current = '';
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function htmlFor(sign, templateUrl, box) {
  const lines = wrap(sign.ja).map(esc).join('<br>');
  const shadow = box.shadow === 'dark'
    ? '0 2px 0 rgba(0,0,0,.75), 0 0 10px rgba(0,0,0,.42)'
    : '0 2px 0 rgba(255,255,255,.46), 0 0 8px rgba(255,255,255,.32)';
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: #f3eadb; }
  .art {
    position: relative;
    width: ${W}px;
    height: ${H}px;
    overflow: hidden;
    background: url("${templateUrl}") center / cover no-repeat;
    font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", system-ui, sans-serif;
  }
  .sign-text {
    position: absolute;
    left: ${box.x}px;
    top: ${box.y}px;
    width: ${box.w}px;
    height: ${box.h}px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    text-align: center;
    padding: 14px;
  }
  .fit {
    display: inline-block;
    color: ${box.color};
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: 0;
    text-shadow: ${shadow};
    white-space: nowrap;
  }
</style>
</head>
<body>
  <main class="art">
    <div class="sign-text" data-max="${box.max}"><div class="fit">${lines}</div></div>
  </main>
</body>
</html>`;
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

let rendered = 0;
for (const sign of manifest.sign) {
  const template = join(templateDir, `${sign.scene}.webp`);
  if (!existsSync(template)) throw new Error(`Missing template for ${sign.scene}: ${template}`);
  const box = boxes[sign.scene];
  if (!box) throw new Error(`Missing text box for scene: ${sign.scene}`);

  const pngOut = join(tmpDir, `${sign.id}.png`);
  const webpOut = join(root, sign.path);
  const templateUrl = `data:image/webp;base64,${readFileSync(template).toString('base64')}`;
  await page.setContent(htmlFor(sign, templateUrl, box), { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const box = document.querySelector('.sign-text');
    const el = document.querySelector('.fit');
    let size = Number(box.dataset.max);
    const fits = () => {
      const a = el.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      return a.width <= b.width - 24 && a.height <= b.height - 24;
    };
    while (size > 18) {
      el.style.fontSize = `${size}px`;
      if (fits()) break;
      size -= 2;
    }
  });
  await page.screenshot({ path: pngOut, clip: { x: 0, y: 0, width: W, height: H } });

  const result = spawnSync('cwebp', [
    '-quiet',
    '-q', '82',
    '-m', '6',
    '-resize', '512', '512',
    pngOut,
    '-o', webpOut,
  ], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`cwebp failed for ${sign.id}`);
  rendered++;
}

await browser.close();
console.log(`rendered ${rendered} sign-art WebP assets with browser-fitted text`);
