import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { CONTENT } from '../src/content/index.ts';
import { RARITIES } from '../src/learn/collection.ts';
import { GACHA_ITEM_PLACES, gachaLabItemForPlace } from '../src/learn/gachaItems.ts';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'public', 'gacha', 'items', 'generated-v2');
const tempRoot = join(tmpdir(), 'yangmung-gacha-items');
const svgDir = join(tempRoot, 'svg');
const pngDir = join(tempRoot, 'png');

rmSync(tempRoot, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(svgDir, { recursive: true });
mkdirSync(pngDir, { recursive: true });

for (const name of readdirSync(outDir)) {
  if (name.endsWith('.png') || name.endsWith('.webp')) rmSync(join(outDir, name));
}

const SIZE = 768;
const rarities = {
  basic: { main: '#dbc39f', dark: '#714e33', light: '#fff4d4', gem: '#f8d071', trim: '#a78455' },
  bronze: { main: '#d88a50', dark: '#7a3f22', light: '#ffe0b5', gem: '#ffbb78', trim: '#b05a31' },
  silver: { main: '#b9cbe0', dark: '#445d76', light: '#f5fbff', gem: '#d7e9ff', trim: '#7f9bb8' },
  gold: { main: '#f4bd3e', dark: '#754610', light: '#fff0a0', gem: '#ffd957', trim: '#bd7c16' },
  diamond: { main: '#77d7f2', dark: '#245c82', light: '#f4ffff', gem: '#b997ff', trim: '#47aadf' },
  xur: { main: '#b78cff', dark: '#4b247d', light: '#fbf4ff', gem: '#78e5f1', trim: '#8c57ed' },
};

const compact = (title) => title.replace(/\s+/g, '');
const has = (title, words) => words.some((word) => title.includes(word));
const tier = (rarity) => ({ basic: 1, bronze: 2, silver: 3, gold: 4, diamond: 5, xur: 6 })[rarity] ?? 1;
const hash = (text) => [...text].reduce((n, ch) => (Math.imul(n, 33) + ch.charCodeAt(0)) >>> 0, 5381);
const esc = (text) => text.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[ch]);

function svgWrap(body, item, rarity) {
  const pal = rarities[rarity];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
<defs>
  <filter id="ds" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="28" stdDeviation="20" flood-color="#251b12" flood-opacity=".28"/>
  </filter>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="8"/>
  </filter>
  <filter id="lift" x="-24%" y="-24%" width="148%" height="148%">
    <feDropShadow dx="0" dy="16" stdDeviation="7" flood-color="#150f0d" flood-opacity=".24"/>
    <feDropShadow dx="-8" dy="-10" stdDeviation="7" flood-color="#ffffff" flood-opacity=".17"/>
  </filter>
  <pattern id="grain" width="34" height="34" patternUnits="userSpaceOnUse">
    <path d="M4 9c8-5 14-4 22 1M9 23c6 4 12 4 20-2" fill="none" stroke="#ffffff" stroke-width="2.5" opacity=".18"/>
    <circle cx="8" cy="28" r="2" fill="#251c16" opacity=".12"/>
    <circle cx="26" cy="12" r="1.8" fill="#ffffff" opacity=".22"/>
  </pattern>
  <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity=".96"/>
    <stop offset=".36" stop-color="${pal.light}" stop-opacity=".72"/>
    <stop offset=".72" stop-color="${pal.trim}" stop-opacity=".36"/>
    <stop offset="1" stop-color="${pal.dark}" stop-opacity=".64"/>
  </linearGradient>
  <linearGradient id="ink" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#332118" stop-opacity=".08"/>
    <stop offset=".7" stop-color="#17100d" stop-opacity=".28"/>
    <stop offset="1" stop-color="#17100d" stop-opacity=".46"/>
  </linearGradient>
  <linearGradient id="main" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${pal.light}"/>
    <stop offset=".38" stop-color="${pal.main}"/>
    <stop offset=".78" stop-color="${pal.trim}"/>
    <stop offset="1" stop-color="${pal.light}"/>
  </linearGradient>
  <linearGradient id="dark" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${pal.trim}"/>
    <stop offset="1" stop-color="${pal.dark}"/>
  </linearGradient>
  <radialGradient id="glow" cx=".38" cy=".28" r=".72">
    <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/>
    <stop offset=".48" stop-color="${pal.gem}" stop-opacity=".42"/>
    <stop offset="1" stop-color="${pal.dark}" stop-opacity=".08"/>
  </radialGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff7bd"/>
    <stop offset=".42" stop-color="#ffd45d"/>
    <stop offset=".78" stop-color="#db8f1f"/>
    <stop offset="1" stop-color="#fff1a6"/>
  </linearGradient>
  <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff9e9"/>
    <stop offset=".55" stop-color="#f8e8bd"/>
    <stop offset="1" stop-color="#ffe6ae"/>
  </linearGradient>
  <linearGradient id="red" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ff8170"/>
    <stop offset=".65" stop-color="#e8463d"/>
    <stop offset="1" stop-color="#9e1f2a"/>
  </linearGradient>
</defs>
<rect width="${SIZE}" height="${SIZE}" fill="#00ff00"/>
<title>${esc(item.title)}</title>
${ambient(item, rarity)}
<g filter="url(#ds)">${body}</g>
${surfaceGlints(item, rarity)}
${sparkles(item, rarity)}
</svg>`;
}

function ambient(item, rarity) {
  const t = tier(rarity);
  const showAura = t >= 4;
  return `<ellipse cx="384" cy="617" rx="230" ry="46" fill="#2a211a" opacity=".17"/>
${showAura ? `<ellipse cx="384" cy="382" rx="${226 + t * 18}" ry="${170 + t * 14}" fill="${rarities[rarity].gem}" opacity=".10"/>` : ''}`;
}

function sparkles(item, rarity) {
  const h = hash(item.title + rarity);
  const t = tier(rarity);
  if (t < 4) return '';
  const count = t - 1;
  const colors = ['#ffe184', '#ffffff', '#b997ff', '#7ee6f2', '#ff93ba'];
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = 150 + ((h >>> (i * 4)) % 468);
    const y = 140 + ((h >>> (i * 5)) % 392);
    const s = 6 + ((h >>> (i + 3)) % 8) + t;
    const c = colors[(h + i) % colors.length];
    out += `<g opacity="${0.32 + Math.min(t, 5) * 0.06}">
      <path d="M${x - s} ${y}H${x + s}M${x} ${y - s}V${y + s}" stroke="${c}" stroke-width="${Math.max(3, s * 0.25)}" stroke-linecap="round"/>
      <circle cx="${x}" cy="${y}" r="${Math.max(2, s * 0.16)}" fill="${c}"/>
    </g>`;
  }
  return out;
}

function outline(tag, stroke = 'url(#dark)', width = 10) {
  return tag.replace('/>', ` stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`);
}

function shine(x, y, w, rot = -14) {
  return `<path d="M${x} ${y}c${w * 0.25} ${-w * 0.18} ${w * 0.62} ${-w * 0.25} ${w} ${-w * 0.21}" fill="none" stroke="#fff8d8" stroke-width="${Math.max(9, w * 0.09)}" stroke-linecap="round" opacity=".9" transform="rotate(${rot} ${x} ${y})"/>`;
}

function gem(x, y, s) {
  return `<path d="M${x} ${y - s}L${x + s * 0.72} ${y}L${x} ${y + s}L${x - s * 0.72} ${y}Z" fill="url(#glow)" stroke="url(#dark)" stroke-width="${Math.max(4, s * 0.12)}"/>`;
}

function surfaceGlints(item, rarity) {
  const h = hash(`${item.title}:${rarity}:glint`);
  const t = tier(rarity);
  let out = '';
  for (let i = 0; i < 4 + t; i++) {
    const x = 160 + ((h >>> ((i % 7) * 4)) + i * 47) % 450;
    const y = 190 + ((h >>> ((i % 5) * 5)) + i * 61) % 350;
    const w = 26 + ((h >>> (i % 12)) % 42);
    const op = (0.06 + t * 0.012).toFixed(2);
    out += `<path d="M${x} ${y}c${w * .28} ${-w * .18} ${w * .62} ${-w * .22} ${w} ${-w * .09}" fill="none" stroke="#ffffff" stroke-width="${Math.max(3, w * .09).toFixed(1)}" stroke-linecap="round" opacity="${op}"/>`;
  }
  return `<g style="mix-blend-mode:screen">${out}</g>`;
}

function coin(x, y, r, rot = 0) {
  return `<g transform="rotate(${rot} ${x} ${y})">
    <circle cx="${x}" cy="${y}" r="${r + 13}" fill="#5a351b"/>
    <circle cx="${x}" cy="${y}" r="${r + 7}" fill="url(#dark)"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#gold)"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.82}" fill="none" stroke="#8d5a21" stroke-width="${Math.max(5, r * .07)}" opacity=".55"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.63}" fill="url(#glow)" opacity=".62"/>
    <circle cx="${x - r * .18}" cy="${y - r * .18}" r="${r * .36}" fill="#fff6be" opacity=".28"/>
    <path d="M${x - r * .44} ${y + r * .28}c${r * .2} ${r * .12} ${r * .58} ${r * .2} ${r * .9} ${r * .02}" fill="none" stroke="#9b5f1e" stroke-width="${Math.max(5, r * .07)}" stroke-linecap="round" opacity=".48"/>
    <rect x="${x - r * 0.08}" y="${y - r * 0.55}" width="${r * 0.16}" height="${r * 1.1}" rx="${r * 0.08}" fill="#815323" opacity=".58"/>
    <path d="M${x - r * .38} ${y - r * .52}L${x - r * .16} ${y - r * .18}L${x - r * .48} ${y - r * .08}L${x - r * .18} ${y + r * .08}L${x - r * .36} ${y + r * .48}" fill="none" stroke="#fff2aa" stroke-width="${Math.max(4, r * .055)}" stroke-linecap="round" stroke-linejoin="round" opacity=".38"/>
    ${shine(x - r * 0.52, y - r * 0.24, r * 0.62, -20)}
  </g>`;
}

function drawCoinSet(item, rarity) {
  const t = tier(rarity);
  const shrine = has(compact(item.title), ['참배']);
  return `${shrine ? `<g filter="url(#lift)">
    <path d="M185 258h398L384 122Z" fill="#7b1f29" opacity=".9"/>
    <path d="M206 250h356L384 140Z" fill="url(#red)" stroke="#fff1d2" stroke-width="5" stroke-linejoin="round"/>
    <path d="M240 246h288" stroke="#ffb36e" stroke-width="9" stroke-linecap="round" opacity=".55"/>
    <rect x="260" y="252" width="248" height="58" rx="21" fill="url(#paper)" stroke="#8d6239" stroke-width="8"/>
    <path d="M289 281H480" stroke="#b58b55" stroke-width="8" stroke-linecap="round" opacity=".35"/>
    <rect x="204" y="305" width="360" height="27" rx="13" fill="#c82735" stroke="#751c28" stroke-width="5"/>
  </g>` : ''}
    ${coin(315, 405, 88, -9)}
    ${coin(430, 382, 102, 7)}
    ${t >= 3 ? coin(515, 457, 62, 14) : ''}
    ${t >= 5 ? gem(575, 270, 30) : ''}`;
}

function sushiPiece(x, y, color, scale = 1) {
  const w = 96 * scale;
  const h = 60 * scale;
  const grain = `<g opacity=".55">
    <circle cx="${x + 22 * scale}" cy="${y + 57 * scale}" r="${3.8 * scale}" fill="#dfcfb5"/>
    <circle cx="${x + 44 * scale}" cy="${y + 72 * scale}" r="${3.2 * scale}" fill="#dfcfb5"/>
    <circle cx="${x + 67 * scale}" cy="${y + 58 * scale}" r="${3.5 * scale}" fill="#dfcfb5"/>
  </g>`;
  return `<g>
    <rect x="${x + 4}" y="${y + 42 * scale}" width="${w}" height="${h * 0.76}" rx="${24 * scale}" fill="#24536c" opacity=".88"/>
    <rect x="${x}" y="${y + 34 * scale}" width="${w}" height="${h * 0.74}" rx="${22 * scale}" fill="#fff7eb" stroke="#d8c4a5" stroke-width="${5 * scale}"/>
    ${grain}
    <rect x="${x - 6 * scale}" y="${y}" width="${w + 12 * scale}" height="${h}" rx="${23 * scale}" fill="${color}" stroke="#fff1df" stroke-width="${5 * scale}"/>
    <path d="M${x + 12 * scale} ${y + 15 * scale}c${28 * scale} ${-10 * scale} ${55 * scale} ${-9 * scale} ${78 * scale} ${3 * scale}" fill="none" stroke="#ffffff" stroke-width="${5 * scale}" stroke-linecap="round" opacity=".32"/>
    <path d="M${x + 10 * scale} ${y + 40 * scale}c${24 * scale} ${7 * scale} ${60 * scale} ${7 * scale} ${82 * scale} ${-4 * scale}" fill="none" stroke="#803d34" stroke-width="${4 * scale}" stroke-linecap="round" opacity=".18"/>
    ${shine(x + 13 * scale, y + 16 * scale, 42 * scale, -9)}
  </g>`;
}

function drawSushi(item, rarity) {
  const title = compact(item.title);
  const t = tier(rarity);
  const count = Math.min(8, t + (has(title, ['세트', '코스', '오마카세', '니기리']) ? 2 : 1));
  const fish = has(title, ['계란']) ? ['#f6d45c'] :
    has(title, ['참치', '오토로']) ? ['#df4f58', '#ff8791'] :
    has(title, ['연어']) ? ['#f08a52', '#ffb074'] :
    has(title, ['아지', '히라메', '킨메']) ? ['#e9f0f4', '#f26b63'] :
    ['#f08a52', '#df4f58', '#f6d45c', '#ffffff', '#e94f7d'];
  let pieces = '';
  for (let i = 0; i < count; i++) {
    const row = i >= 4 ? 1 : 0;
    const x = 220 + (i % 4) * 96 + (row ? 48 : 0) - Math.min(count, 4) * 8;
    const y = row ? 392 : 305;
    pieces += sushiPiece(x, y, fish[i % fish.length], t >= 5 ? 1.02 : 0.95);
  }
  return `<ellipse cx="384" cy="492" rx="${246 + t * 13}" ry="${76 + t * 3}" fill="url(#dark)" opacity=".55"/>
    <ellipse cx="384" cy="458" rx="${258 + t * 13}" ry="${84 + t * 4}" fill="#1e4158" opacity=".82"/>
    <ellipse cx="384" cy="446" rx="${248 + t * 11}" ry="${72 + t * 4}" fill="url(#paper)" stroke="url(#dark)" stroke-width="8"/>
    <ellipse cx="384" cy="436" rx="${210 + t * 9}" ry="${48 + t * 3}" fill="#fffdf1" opacity=".65"/>
    ${t >= 4 ? `<path d="M198 456c116 40 260 39 377-3" fill="none" stroke="url(#gold)" stroke-width="7" opacity=".75"/>` : ''}
    ${pieces}
    ${t >= 5 ? `<circle cx="577" cy="316" r="25" fill="#111"/><circle cx="577" cy="316" r="12" fill="url(#gold)"/>${gem(610, 262, 24)}` : ''}`;
}

function drawRamen(item, rarity) {
  const title = compact(item.title);
  const soup = has(title, ['쇼유']) ? '#b8783d' : has(title, ['미소']) ? '#d6964f' : has(title, ['돈코츠']) ? '#f0d692' : '#d98b45';
  const t = tier(rarity);
  let noodles = '';
  for (let i = 0; i < 13; i++) {
    noodles += `<path d="M${230 + i * 28} ${394 + (i % 2) * 14}c42 -24 58 28 102 3" fill="none" stroke="#f7d377" stroke-width="12" stroke-linecap="round"/>`;
  }
  return `<ellipse cx="384" cy="526" rx="242" ry="68" fill="url(#dark)" opacity=".5"/>
    <ellipse cx="384" cy="446" rx="250" ry="126" fill="url(#dark)"/>
    <ellipse cx="384" cy="408" rx="242" ry="112" fill="#fff3df" stroke="url(#dark)" stroke-width="8"/>
    <ellipse cx="384" cy="409" rx="194" ry="72" fill="${soup}" opacity=".9"/>
    ${noodles}
    <circle cx="312" cy="382" r="34" fill="#fff2aa" stroke="#d69b4e" stroke-width="5"/>
    ${t >= 3 ? `<rect x="448" y="360" width="100" height="42" rx="21" fill="#cc6c50" stroke="#8f3b2f" stroke-width="5"/>` : ''}
    ${t >= 5 ? `<circle cx="523" cy="332" r="31" fill="#f46d55" stroke="#b64135" stroke-width="5"/>` : ''}
    <path d="M504 243L310 348M548 261L350 365" stroke="#704328" stroke-width="17" stroke-linecap="round"/>`;
}

function drawBento(item, rarity) {
  const t = tier(rarity);
  return `<rect x="210" y="270" width="348" height="288" rx="44" fill="url(#dark)"/>
    <rect x="242" y="302" width="284" height="224" rx="34" fill="url(#paper)" stroke="#8b613d" stroke-width="8"/>
    <path d="M384 312v204M252 414h264" stroke="#8b613d" stroke-width="10" opacity=".55"/>
    <circle cx="318" cy="365" r="46" fill="#f9f0df" stroke="#dbc8a8" stroke-width="5"/>
    <circle cx="454" cy="365" r="38" fill="#e85f4a" stroke="#9f352d" stroke-width="5"/>
    <circle cx="320" cy="468" r="35" fill="#58a660" stroke="#327641" stroke-width="5"/>
    <circle cx="453" cy="466" r="43" fill="url(#main)" stroke="url(#dark)" stroke-width="6"/>
    ${t >= 4 ? `${gem(520, 292, 28)}${shine(272, 327, 98, -8)}` : ''}`;
}

function drawBread(item, rarity) {
  const t = tier(rarity);
  return `<ellipse cx="384" cy="465" rx="220" ry="96" fill="url(#dark)" opacity=".42"/>
    <ellipse cx="384" cy="404" rx="216" ry="134" fill="#d98d45" stroke="#8f552c" stroke-width="9"/>
    <ellipse cx="306" cy="352" rx="82" ry="63" fill="#f0b96c"/>
    <ellipse cx="403" cy="339" rx="96" ry="68" fill="#f0b96c"/>
    <ellipse cx="495" cy="378" rx="78" ry="64" fill="#e7a65d"/>
    ${shine(303, 330, 112, -10)}
    ${t >= 4 ? `<circle cx="477" cy="304" r="24" fill="url(#gold)"/>` : ''}`;
}

function drawFood(item, rarity) {
  const title = compact(item.title);
  if (has(title, ['동전', '코인', '토큰']) && !has(title, ['접시'])) return drawCoinSet(item, rarity);
  if (has(title, ['초밥', '사시미', '네타', '오토로', '니기리', '오마카세', '스시'])) return drawSushi(item, rarity);
  if (has(title, ['라멘', '컵라멘'])) return drawRamen(item, rarity);
  if (has(title, ['파스타'])) return drawPasta(item, rarity);
  if (has(title, ['빵', '식빵'])) return drawBread(item, rarity);
  if (has(title, ['삼각김밥'])) {
    return `<path d="M384 176L591 554H177Z" fill="url(#dark)"/>
      <path d="M384 205L556 532H212Z" fill="#fff9ee" stroke="#d8cbb7" stroke-width="8"/>
      <path d="M384 315L460 528H308Z" fill="#263729" stroke="#142018" stroke-width="7"/>
      ${shine(302, 414, 120, -4)}`;
  }
  return drawBento(item, rarity);
}

function drawPasta(item, rarity) {
  const title = compact(item.title);
  const sauce = has(title, ['토마토']) ? '#d94a3d' : has(title, ['크림']) ? '#fff0c8' : has(title, ['트러플']) ? '#74462b' : '#f0b868';
  const t = tier(rarity);
  let noodles = '';
  for (let i = 0; i < 17; i++) {
    noodles += `<path d="M${230 + i * 19} ${390 + (i % 3) * 15}c42 -24 62 24 104 -4" fill="none" stroke="#f1c66c" stroke-width="11" stroke-linecap="round"/>`;
  }
  return `<ellipse cx="384" cy="486" rx="250" ry="77" fill="url(#dark)" opacity=".38"/>
    <ellipse cx="384" cy="440" rx="236" ry="89" fill="url(#paper)" stroke="url(#dark)" stroke-width="8"/>
    ${noodles}
    <circle cx="451" cy="394" r="32" fill="${sauce}" opacity=".92"/>
    ${t >= 3 ? `<circle cx="318" cy="438" r="25" fill="#4f9b56"/>` : ''}
    ${has(title, ['해산물']) ? `<circle cx="515" cy="430" r="31" fill="#f06f54" stroke="#b44335" stroke-width="5"/>` : ''}`;
}

function drawDrink(item, rarity) {
  const title = compact(item.title);
  const t = tier(rarity);
  const fill = has(title, ['말차', '녹차']) ? '#93c96d' : has(title, ['맥주']) ? '#f0b448' : has(title, ['커피', '라떼', '블렌드']) ? '#7a4427' : '#91dcf6';
  const foam = has(title, ['맥주', '라떼', '커피', '말차', '녹차']);
  return `<rect x="283" y="198" width="202" height="374" rx="54" fill="#1d2440" opacity=".92"/>
    <rect x="304" y="222" width="160" height="326" rx="44" fill="url(#rim)" stroke="url(#dark)" stroke-width="8"/>
    <rect x="326" y="304" width="116" height="185" rx="31" fill="${fill}" opacity=".92"/>
    <rect x="338" y="319" width="28" height="152" rx="14" fill="#ffffff" opacity=".18"/>
    <path d="M342 379c26-22 63-18 82 17" fill="none" stroke="#fff8d6" stroke-width="9" stroke-linecap="round" opacity=".75"/>
    <path d="M337 456c22 9 60 10 88-3" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".24"/>
    <ellipse cx="384" cy="248" rx="88" ry="33" fill="#ffffff" opacity=".96"/>
    ${foam ? `<ellipse cx="384" cy="308" rx="75" ry="27" fill="#fff4e8" opacity=".88"/><path d="M326 318c33 18 82 18 116-1" fill="none" stroke="${fill}" stroke-width="9" opacity=".38"/>` : ''}
    <circle cx="416" cy="355" r="9" fill="#ffffff" opacity=".26"/>
    <circle cx="361" cy="426" r="7" fill="#ffffff" opacity=".20"/>
    <path d="M478 352c101 35 102 126 10 153" fill="none" stroke="#1e2442" stroke-width="29" stroke-linecap="round"/>
    <path d="M484 371c66 28 66 87 4 107" fill="none" stroke="url(#main)" stroke-width="16" stroke-linecap="round" opacity=".84"/>
    ${t >= 4 ? `${gem(487, 246, 28)}<circle cx="307" cy="515" r="18" fill="url(#gold)" opacity=".86"/>` : ''}`;
}

function drawTicket(item, rarity) {
  const title = compact(item.title);
  if (has(title, ['지도', '루트', '안내도'])) return drawMap(item, rarity);
  if (has(title, ['오미쿠지'])) return drawOmikuji(item, rarity);
  if (has(title, ['카드', '패스', 'IC', 'ETC'])) {
    return `<rect x="206" y="280" width="356" height="238" rx="42" fill="url(#dark)"/>
      <rect x="232" y="307" width="304" height="184" rx="32" fill="url(#main)" stroke="#ffffff" stroke-width="4" opacity=".98"/>
      <rect x="274" y="354" width="100" height="66" rx="17" fill="url(#paper)" opacity=".88"/>
      <circle cx="480" cy="438" r="35" fill="url(#glow)" stroke="url(#dark)" stroke-width="6"/>
      ${shine(260, 329, 148, -8)}`;
  }
  if (has(title, ['영수증', '서류', '신청서', '확인서', '신고서', '송장', '라벨', '번호표', '예약표'])) return drawDocument(item, rarity);
  return `<path d="M197 286H571V371L535 394L571 421V512H197V421L233 394L197 371Z" fill="url(#dark)"/>
    <path d="M225 315H543V374L511 394L543 414V484H225V414L257 394L225 374Z" fill="url(#paper)" stroke="#8c653d" stroke-width="7"/>
    <rect x="286" y="356" width="196" height="37" rx="18" fill="url(#main)" opacity=".9"/>
    <path d="M292 434H476M308 462H442" stroke="#8c653d" stroke-width="10" stroke-linecap="round" opacity=".55"/>
    <path d="M251 336c70 21 194 20 270-2M250 475c76-18 197-17 273 1" fill="none" stroke="#fff8dc" stroke-width="5" stroke-linecap="round" opacity=".45"/>
    <circle cx="256" cy="394" r="11" fill="#9a6840" opacity=".55"/>
    <circle cx="512" cy="394" r="11" fill="#9a6840" opacity=".55"/>
    ${shine(266, 328, 108, -10)}`;
}

function drawDocument(item, rarity) {
  const t = tier(rarity);
  return `<rect x="278" y="182" width="212" height="394" rx="36" fill="url(#dark)"/>
    <path d="M315 213H458V548H310c-18-68-14-244 5-335Z" fill="url(#paper)" stroke="#8f6841" stroke-width="7" stroke-linejoin="round"/>
    <path d="M420 214L458 252H421Z" fill="#e9c78f" stroke="#8f6841" stroke-width="5" stroke-linejoin="round"/>
    <rect x="334" y="276" width="100" height="42" rx="17" fill="url(#main)" opacity=".85"/>
    <path d="M337 367H435M336 410H428M338 454H444M339 497H413" stroke="#8f6841" stroke-width="9" stroke-linecap="round" opacity=".48"/>
    <circle cx="433" cy="334" r="29" fill="#d94b65" opacity=".78"/>
    <path d="M416 334h34M433 317v34" stroke="#fff2d8" stroke-width="7" stroke-linecap="round" opacity=".55"/>
    ${t >= 4 ? `<circle cx="443" cy="239" r="23" fill="url(#gold)"/><path d="M342 224c30-10 61-10 90 0" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".45"/>` : ''}`;
}

function drawOmikuji(item, rarity) {
  return `<rect x="310" y="177" width="148" height="390" rx="27" fill="url(#dark)"/>
    <rect x="331" y="203" width="106" height="336" rx="22" fill="url(#paper)" stroke="#8c653d" stroke-width="7"/>
    <circle cx="384" cy="282" r="34" fill="#e84a56" opacity=".9"/>
    <path d="M358 382H410M358 438H410" stroke="#8c653d" stroke-width="10" stroke-linecap="round" opacity=".5"/>
    ${shine(347, 224, 78, -10)}`;
}

function drawMap(item, rarity) {
  const t = tier(rarity);
  return `<path d="M196 296L333 238L461 300L578 250V562L445 618L321 562L196 612Z" fill="url(#dark)"/>
    <path d="M230 324L333 282L457 336L540 301V530L446 568L322 518L230 556Z" fill="url(#paper)" stroke="#8b6843" stroke-width="7"/>
    <path d="M333 282L322 518M457 336L446 568" fill="none" stroke="#b88a55" stroke-width="9" opacity=".44"/>
    <path d="M271 453C337 390 418 430 502 362" fill="none" stroke="url(#main)" stroke-width="15" stroke-linecap="round"/>
    <path d="M270 382c40-18 75-16 106 8M377 499c37-17 76-14 118 8M250 520c31-13 55-13 82 0" fill="none" stroke="#8b6843" stroke-width="6" stroke-linecap="round" opacity=".28"/>
    <circle cx="488" cy="366" r="29" fill="#e84a56" stroke="#9d2636" stroke-width="5"/>
    <circle cx="488" cy="366" r="10" fill="#fff1d2" opacity=".8"/>
    ${t >= 4 ? `<path d="M526 266l28 19-28 19-28-19Z" fill="url(#gold)" stroke="#8b6843" stroke-width="5"/>` : ''}
    ${shine(260, 334, 92, -12)}`;
}

function drawKey(item, rarity) {
  const t = tier(rarity);
  return `<circle cx="315" cy="333" r="86" fill="url(#dark)"/>
    <circle cx="315" cy="333" r="54" fill="url(#paper)"/>
    <circle cx="315" cy="333" r="31" fill="none" stroke="#8a6845" stroke-width="10" opacity=".55"/>
    <path d="M378 392L564 578" stroke="url(#dark)" stroke-width="43" stroke-linecap="round"/>
    <path d="M386 400L556 570" stroke="url(#main)" stroke-width="22" stroke-linecap="round"/>
    <path d="M505 520H606M535 552H620" stroke="url(#dark)" stroke-width="26" stroke-linecap="round"/>
    <path d="M421 433L541 553" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".36"/>
    ${shine(262, 293, 92, -15)}
    ${t >= 4 ? gem(410, 306, 26) : ''}`;
}

function drawStay(item, rarity) {
  const title = compact(item.title);
  if (has(title, ['키', '열쇠'])) return drawKey(item, rarity);
  if (has(title, ['우산'])) {
    return `<path d="M384 177L587 408H181Z" fill="url(#dark)"/>
      <path d="M384 206L544 384H224Z" fill="url(#main)" stroke="#ffffff" stroke-width="5"/>
      <path d="M384 382V590M384 590c31 30 74 24 92-12" fill="none" stroke="url(#dark)" stroke-width="24" stroke-linecap="round"/>
      ${shine(270, 330, 120, -10)}`;
  }
  if (has(title, ['수건', '타월', '레인코트', '유카타', '어메니티'])) {
    return `<rect x="226" y="304" width="316" height="218" rx="45" fill="url(#dark)"/>
      <rect x="262" y="278" width="244" height="221" rx="43" fill="url(#paper)" stroke="#90724c" stroke-width="8"/>
      <path d="M294 374H474M294 426H452" stroke="url(#main)" stroke-width="16" stroke-linecap="round" opacity=".65"/>
      ${shine(290, 314, 110, -12)}`;
  }
  return `<rect x="250" y="262" width="268" height="282" rx="46" fill="url(#dark)"/>
    <rect x="282" y="294" width="204" height="214" rx="34" fill="url(#paper)" stroke="#8c653d" stroke-width="8"/>
    <rect x="322" y="340" width="124" height="74" rx="22" fill="url(#main)" opacity=".9"/>`;
}

function drawShopping(item, rarity) {
  const title = compact(item.title);
  if (has(title, ['재킷', '코디', '스타일링'])) {
    return `<path d="M294 214H474L595 545L444 589L384 430L324 589L173 545Z" fill="url(#dark)"/>
      <path d="M312 247H456L551 520L448 550L384 419L320 550L217 520Z" fill="url(#main)" stroke="#ffffff" stroke-width="5"/>
      <path d="M345 250L384 418L423 250" fill="url(#paper)" opacity=".9"/>
      ${shine(277, 353, 118, -20)}`;
  }
  if (has(title, ['태그', '가격표'])) {
    return `<rect x="294" y="224" width="220" height="318" rx="38" fill="url(#dark)"/>
      <rect x="320" y="250" width="168" height="266" rx="30" fill="url(#paper)" stroke="#987347" stroke-width="7"/>
      <circle cx="362" cy="306" r="20" fill="url(#dark)"/>
      <path d="M362 306L258 206" stroke="url(#main)" stroke-width="14" stroke-linecap="round"/>
      <path d="M358 385H448M358 438H426" stroke="#987347" stroke-width="11" stroke-linecap="round" opacity=".5"/>
      ${shine(343, 275, 74, -9)}`;
  }
  return `<rect x="244" y="316" width="280" height="246" rx="43" fill="url(#dark)"/>
    <rect x="274" y="344" width="220" height="190" rx="34" fill="url(#main)" stroke="#ffffff" stroke-width="5"/>
    <path d="M321 324V267M447 324V267M321 267c31-56 95-56 126 0" fill="none" stroke="url(#dark)" stroke-width="22" stroke-linecap="round"/>
    <path d="M322 267c32-40 92-40 124 0" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity=".24"/>
    <rect x="339" y="405" width="91" height="59" rx="17" fill="url(#paper)" stroke="#b59668" stroke-width="5" opacity=".88"/>
    <circle cx="315" cy="361" r="13" fill="url(#gold)" opacity=".78"/>
    <circle cx="453" cy="361" r="13" fill="url(#gold)" opacity=".78"/>
    <path d="M298 386c50-18 120-16 170 4M307 498c42 13 102 13 153 0" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".28"/>`;
}

function drawSafety(item, rarity) {
  const title = compact(item.title);
  if (has(title, ['마스크'])) {
    return `<rect x="204" y="326" width="360" height="170" rx="58" fill="url(#dark)" opacity=".86"/>
      <rect x="238" y="348" width="292" height="126" rx="50" fill="#f4fbff" stroke="#8fb6c8" stroke-width="8"/>
      <path d="M278 391H490M278 436H490" stroke="url(#main)" stroke-width="12" stroke-linecap="round" opacity=".65"/>`;
  }
  if (has(title, ['캔디'])) {
    return `<rect x="277" y="352" width="214" height="112" rx="56" fill="#ffe9f0" stroke="url(#dark)" stroke-width="8"/>
      <path d="M277 408L190 350L204 472ZM491 408L578 350L564 472Z" fill="url(#main)" stroke="url(#dark)" stroke-width="7"/>
      ${shine(314, 379, 82, -10)}`;
  }
  return `<rect x="292" y="220" width="184" height="348" rx="44" fill="url(#dark)"/>
    <rect x="320" y="252" width="128" height="284" rx="34" fill="url(#paper)" stroke="#8c653d" stroke-width="8"/>
    <rect x="346" y="305" width="76" height="62" rx="18" fill="url(#main)"/>
    <path d="M384 405V500M336 452H432" stroke="#d94b65" stroke-width="34" stroke-linecap="round"/>`;
}

function drawService(item, rarity) {
  const title = compact(item.title);
  if (has(title, ['지도', '루트', '표지', '위치'])) return drawMap(item, rarity);
  if (has(title, ['동전', '코인', '토큰'])) return drawCoinSet(item, rarity);
  if (has(title, ['키', '열쇠'])) return drawKey(item, rarity);
  if (has(title, ['배송', '택배', '박스', '완충재', '파우치', '키트', '팩'])) {
    return `<rect x="238" y="310" width="292" height="252" rx="42" fill="url(#dark)"/>
      <rect x="266" y="338" width="236" height="196" rx="32" fill="#d59c67" stroke="#8a562e" stroke-width="8"/>
      <path d="M384 338V534M270 405H498" stroke="#8a562e" stroke-width="11" opacity=".55"/>
      ${shine(290, 360, 118, -10)}`;
  }
  if (has(title, ['유심', '데이터', '와이파이', '통신'])) {
    return `<rect x="302" y="218" width="164" height="340" rx="40" fill="url(#dark)"/>
      <rect x="326" y="248" width="116" height="280" rx="28" fill="url(#main)" stroke="#ffffff" stroke-width="5"/>
      <circle cx="384" cy="490" r="17" fill="url(#paper)"/>
      ${shine(342, 277, 70, -10)}`;
  }
  return drawDocument(item, rarity);
}

function drawFestival(item, rarity) {
  const title = compact(item.title);
  if (has(title, ['동전', '코인', '토큰', '참배'])) return drawCoinSet(item, rarity);
  if (has(title, ['오마모리', '부적'])) {
    return `<rect x="302" y="214" width="164" height="340" rx="45" fill="url(#dark)"/>
      <rect x="326" y="246" width="116" height="276" rx="34" fill="url(#main)" stroke="#ffffff" stroke-width="5"/>
      <path d="M384 196V310" stroke="url(#gold)" stroke-width="17" stroke-linecap="round"/>
      <path d="M350 358H418M350 418H418" stroke="#fff4d0" stroke-width="11" stroke-linecap="round" opacity=".7"/>
      ${shine(344, 271, 72, -9)}`;
  }
  if (has(title, ['에마', '목패'])) {
    return `<path d="M204 352L384 218L564 352V574H204Z" fill="url(#dark)"/>
      <path d="M241 371L384 265L527 371V538H241Z" fill="#e2ad68" stroke="#8a5a2e" stroke-width="8"/>
      <path d="M318 323H450" stroke="#d54b43" stroke-width="13" stroke-linecap="round"/>
      ${shine(284, 382, 112, -12)}`;
  }
  if (has(title, ['고슈인'])) return drawDocument(item, rarity);
  if (has(title, ['부채'])) {
    let ribs = '';
    for (let i = 0; i < 11; i++) {
      const a = -0.88 + i * 0.176;
      const x = 384 + Math.sin(a) * 260;
      const y = 570 - Math.cos(a) * 260;
      ribs += `<path d="M384 570L${x.toFixed(1)} ${y.toFixed(1)}" stroke="url(#dark)" stroke-width="7" opacity=".45"/>`;
    }
    return `<path d="M137 494C202 185 566 185 631 494Z" fill="url(#main)" stroke="url(#dark)" stroke-width="10"/>
      ${ribs}<circle cx="384" cy="570" r="26" fill="url(#dark)"/>${shine(250, 315, 160, -8)}`;
  }
  if (has(title, ['뜰채'])) {
    return `<circle cx="342" cy="346" r="108" fill="url(#dark)"/>
      <circle cx="342" cy="346" r="84" fill="#dff8ff" opacity=".58"/>
      <path d="M412 418L560 590" stroke="url(#dark)" stroke-width="29" stroke-linecap="round"/>
      ${shine(292, 304, 90, -10)}`;
  }
  return `<circle cx="384" cy="382" r="166" fill="url(#dark)"/>
    <circle cx="384" cy="382" r="140" fill="url(#main)" stroke="#ffffff" stroke-width="5"/>
    <circle cx="384" cy="382" r="82" fill="url(#glow)"/>
    ${gem(384, 382, 45)}${shine(298, 303, 110, -12)}`;
}

function drawItem(item, rarity) {
  switch (item.motif) {
    case 'food': return drawFood(item, rarity);
    case 'drink': return drawDrink(item, rarity);
    case 'ticket': return drawTicket(item, rarity);
    case 'stay': return drawStay(item, rarity);
    case 'shopping': return drawShopping(item, rarity);
    case 'safety': return drawSafety(item, rarity);
    case 'festival': return drawFestival(item, rarity);
    default: return drawService(item, rarity);
  }
}

const places = [...new Set([...GACHA_ITEM_PLACES, ...CONTENT.missions.map((m) => m.place).filter(Boolean)])];
const files = new Map();
for (const place of places) {
  for (const r of RARITIES) {
    const item = gachaLabItemForPlace(place, r.key);
    const rel = item.image?.replace(/^\/gacha\/items\/generated-v2\//, '').replace(/\.webp$/i, '');
    if (!rel) continue;
    files.set(rel, { item, rarity: r.key });
  }
}

const svgFiles = [];
for (const [slug, { item, rarity }] of files) {
  const svg = svgWrap(drawItem(item, rarity), item, rarity);
  const path = join(svgDir, `${slug}.svg`);
  writeFileSync(path, svg);
  svgFiles.push(path);
}

const render = spawnSync('qlmanage', ['-t', '-s', String(SIZE), '-o', pngDir, ...svgFiles], { stdio: ['ignore', 'ignore', 'inherit'] });
if (render.status !== 0) process.exit(render.status ?? 1);

let written = 0;
for (const path of svgFiles) {
  const name = path.split('/').pop();
  const rendered = join(pngDir, `${name}.png`);
  if (!existsSync(rendered)) throw new Error(`missing rendered thumbnail: ${rendered}`);
  renameSync(rendered, join(outDir, name.replace(/\.svg$/, '.png')));
  written++;
}

rmSync(tempRoot, { recursive: true, force: true });
console.log(`generated ${written} high-detail anime gacha item PNG assets in ${outDir}`);
