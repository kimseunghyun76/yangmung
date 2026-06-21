import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import { CONTENT } from '../src/content/index.ts';
import { RARITIES } from '../src/learn/collection.ts';
import { GACHA_ITEM_PLACES, gachaItemForPlace } from '../src/learn/gachaItems.ts';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'public', 'gacha', 'items', 'generated-v2');
mkdirSync(outDir, { recursive: true });

const SIZE = 768;
const rarityPal = {
  basic: { main: '#c8c1b3', dark: '#5a5147', light: '#fff6e9', gem: '#d8d1c4' },
  bronze: { main: '#c88749', dark: '#6f3d1f', light: '#ffe0bd', gem: '#df9a58' },
  silver: { main: '#b8c1cd', dark: '#56616e', light: '#f5fbff', gem: '#d8e2ee' },
  gold: { main: '#f1bf45', dark: '#7f5216', light: '#fff1a8', gem: '#ffd65b' },
  diamond: { main: '#77d7ec', dark: '#265d85', light: '#f5ffff', gem: '#b996ff' },
};
const motifAccent = {
  food: '#e85743',
  drink: '#5aa6d9',
  ticket: '#4d78c7',
  stay: '#7d61c8',
  shopping: '#c55ab2',
  service: '#c44d45',
  safety: '#d94b65',
  festival: '#e5a22d',
};

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function png(width, height, draw) {
  const rgba = Buffer.alloc(width * height * 4);
  const blend = (x, y, color) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const i = (y * width + x) * 4;
    const a = (color[3] ?? 255) / 255;
    const ia = 1 - a;
    rgba[i] = Math.round(color[0] * a + rgba[i] * ia);
    rgba[i + 1] = Math.round(color[1] * a + rgba[i + 1] * ia);
    rgba[i + 2] = Math.round(color[2] * a + rgba[i + 2] * ia);
    rgba[i + 3] = Math.min(255, Math.round((color[3] ?? 255) + rgba[i + 3] * ia));
  };
  const api = makeApi(width, height, blend);
  draw(api);
  const rows = [];
  for (let y = 0; y < height; y++) rows.push(Buffer.concat([Buffer.from([0]), rgba.subarray(y * width * 4, (y + 1) * width * 4)]));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
function makeApi(width, height, set) {
  const circle = (cx, cy, r, color) => {
    const rr = r * r;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= rr) set(x, y, color);
    }
  };
  const ellipse = (cx, cy, rx, ry, color) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) set(x, y, color);
    }
  };
  const rect = (x, y, w, h, color) => {
    for (let yy = Math.floor(y); yy < Math.ceil(y + h); yy++) for (let xx = Math.floor(x); xx < Math.ceil(x + w); xx++) set(xx, yy, color);
  };
  const roundedRect = (x, y, w, h, r, color) => {
    rect(x + r, y, w - r * 2, h, color);
    rect(x, y + r, w, h - r * 2, color);
    circle(x + r, y + r, r, color);
    circle(x + w - r, y + r, r, color);
    circle(x + r, y + h - r, r, color);
    circle(x + w - r, y + h - r, r, color);
  };
  const line = (x1, y1, x2, y2, w, color) => {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / Math.max(1, steps);
      circle(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, w / 2, color);
    }
  };
  const poly = (points, color) => {
    const minY = Math.floor(Math.min(...points.map((p) => p[1])));
    const maxY = Math.ceil(Math.max(...points.map((p) => p[1])));
    for (let y = minY; y <= maxY; y++) {
      const hits = [];
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) hits.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
      }
      hits.sort((a, b) => a - b);
      for (let i = 0; i < hits.length; i += 2) for (let x = Math.floor(hits[i]); x <= Math.ceil(hits[i + 1]); x++) set(x, y, color);
    }
  };
  return { width, height, circle, ellipse, rect, roundedRect, line, poly };
}
const rgba = (hex, a = 255) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), a];
const shade = (hex, amount) => {
  const c = rgba(hex);
  return [0, 1, 2].map((i) => Math.max(0, Math.min(255, Math.round(c[i] + amount)))).concat(c[3]);
};
const hash = (s) => [...s].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
const has = (title, words) => words.some((w) => title.includes(w));

function drawMascot(g, x, y, s, kind, pal) {
  const base = kind === 'cat' ? rgba('#f2c66d', 245) : rgba('#d7a756', 245);
  const ink = rgba('#4c3421', 245);
  g.ellipse(x, y, 48 * s, 42 * s, base);
  if (kind === 'cat') {
    g.poly([[x - 34 * s, y - 24 * s], [x - 18 * s, y - 58 * s], [x - 4 * s, y - 18 * s]], base);
    g.poly([[x + 34 * s, y - 24 * s], [x + 18 * s, y - 58 * s], [x + 4 * s, y - 18 * s]], base);
  } else {
    g.ellipse(x - 34 * s, y - 18 * s, 15 * s, 24 * s, shade(pal.dark, 80));
    g.ellipse(x + 34 * s, y - 18 * s, 15 * s, 24 * s, shade(pal.dark, 80));
  }
  g.circle(x - 15 * s, y - 5 * s, 4 * s, ink);
  g.circle(x + 15 * s, y - 5 * s, 4 * s, ink);
  g.ellipse(x, y + 10 * s, 10 * s, 7 * s, rgba('#fff6e6', 220));
  g.circle(x, y + 7 * s, 3 * s, ink);
}
function shine(g, pal, rarity) {
  const alpha = rarity === 'diamond' ? 56 : rarity === 'gold' ? 44 : 24;
  g.ellipse(384, 594, 250, 44, rgba('#000000', 38));
  g.circle(230, 164, 10, rgba(pal.light, alpha));
  g.circle(586, 218, 8, rgba(pal.light, alpha));
  g.line(152, 176, 198, 176, 5, rgba(pal.gem, alpha));
  g.line(175, 153, 175, 199, 5, rgba(pal.gem, alpha));
  if (rarity === 'gold' || rarity === 'diamond') {
    g.circle(536, 154, 8, rgba(pal.gem, 60));
    g.circle(570, 468, 6, rgba(pal.light, 52));
  }
}
function drawRibbon(g, pal, rarity) {
  g.roundedRect(244, 92, 280, 62, 24, rgba(pal.dark, 230));
  g.roundedRect(262, 106, 244, 32, 16, rgba(pal.main, 245));
  if (rarity === 'diamond') g.line(278, 122, 490, 122, 5, rgba(pal.light, 160));
}
function drawFood(g, title, pal) {
  if (has(title, ['라멘', '컵라멘'])) {
    g.ellipse(384, 462, 224, 90, rgba(pal.dark, 235));
    g.ellipse(384, 420, 224, 100, rgba('#fff8e8', 250));
    g.ellipse(384, 418, 188, 72, rgba('#d98b45', 230));
    for (let i = 0; i < 8; i++) g.line(260 + i * 34, 416 + (i % 2) * 12, 306 + i * 26, 432 - (i % 2) * 10, 10, rgba('#f3cf73', 240));
    g.circle(325, 394, 26, rgba('#fff0a8', 245));
    g.circle(438, 394, 24, rgba('#d05d48', 245));
    g.line(500, 278, 322, 374, 12, rgba('#7a4327', 245));
    g.line(532, 292, 354, 386, 12, rgba('#7a4327', 245));
    return;
  }
  if (has(title, ['초밥', '사시미', '네타', '오토로'])) {
    for (let i = 0; i < 3; i++) {
      const x = 284 + i * 96;
      g.roundedRect(x, 382, 88, 56, 20, rgba('#fff7ef', 250));
      g.roundedRect(x - 4, 344, 96, 50, 20, rgba(i === 0 ? '#e86a52' : i === 1 ? '#f0a35e' : pal.main, 245));
    }
    g.ellipse(384, 492, 260, 42, rgba(pal.dark, 70));
    return;
  }
  if (has(title, ['파스타'])) {
    g.ellipse(384, 460, 220, 76, rgba('#fff7e4', 250));
    for (let i = 0; i < 14; i++) g.line(250 + i * 20, 420 + (i % 3) * 11, 305 + i * 13, 462 - (i % 2) * 15, 9, rgba('#f0c46a', 240));
    g.circle(440, 406, 24, rgba('#d84a3c', 240));
    g.circle(330, 438, 18, rgba('#4f8f4d', 230));
    return;
  }
  if (has(title, ['벤토', '도시락', '정식', '세트', '코스', '플레이트', '오마카세'])) {
    g.roundedRect(248, 300, 272, 210, 36, rgba(pal.dark, 235));
    g.roundedRect(270, 322, 228, 166, 24, rgba('#fff7e8', 250));
    g.line(384, 330, 384, 484, 10, rgba(pal.dark, 120));
    g.line(276, 404, 492, 404, 10, rgba(pal.dark, 120));
    g.circle(326, 368, 36, rgba('#f6f1df', 250));
    g.circle(444, 368, 28, rgba('#e75b48', 240));
    g.circle(328, 448, 26, rgba('#58a561', 235));
    g.circle(444, 448, 32, rgba(pal.main, 245));
    return;
  }
  if (has(title, ['삼각김밥'])) {
    g.poly([[384, 246], [536, 510], [232, 510]], rgba('#fff8ee', 255));
    g.poly([[384, 330], [440, 508], [328, 508]], rgba('#2c3a2e', 245));
    g.line(298, 454, 470, 454, 10, rgba(pal.main, 210));
    return;
  }
  if (has(title, ['빵'])) {
    g.ellipse(384, 426, 190, 118, rgba('#d99049', 250));
    g.ellipse(320, 370, 74, 58, rgba('#f0b96c', 245));
    g.ellipse(402, 358, 86, 62, rgba('#f0b96c', 245));
    g.ellipse(476, 388, 68, 58, rgba('#f0b96c', 245));
    return;
  }
  g.ellipse(384, 452, 210, 78, rgba('#fff7e8', 250));
  g.circle(334, 408, 48, rgba('#e85f45', 240));
  g.circle(420, 402, 46, rgba(pal.main, 245));
  g.circle(398, 460, 34, rgba('#5faa62', 230));
}
function drawDrink(g, title, pal) {
  const hot = has(title, ['커피', '라떼', '블렌드', '시그니처']);
  g.roundedRect(294, 264, 180, 278, hot ? 42 : 28, rgba('#fff9ed', 250));
  g.roundedRect(312, 304, 144, 198, 28, rgba(pal.main, 220));
  g.ellipse(384, 276, 96, 30, rgba('#ffffff', 235));
  g.line(476, 342, 544, 384, 18, rgba('#fff9ed', 230));
  g.line(544, 384, 480, 440, 18, rgba('#fff9ed', 230));
  if (hot) g.ellipse(384, 326, 76, 24, rgba('#6c3a20', 220));
  else g.line(346, 326, 420, 486, 12, rgba('#ffffff', 150));
}
function drawTicket(g, title, pal) {
  const card = has(title, ['카드', '패스']);
  if (card) g.roundedRect(230, 290, 308, 206, 34, rgba(pal.main, 250));
  else g.poly([[230, 292], [538, 292], [538, 370], [506, 394], [538, 418], [538, 496], [230, 496], [230, 418], [262, 394], [230, 370]], rgba('#fff8e8', 250));
  g.roundedRect(266, 326, 236, 36, 16, rgba(pal.dark, 220));
  g.line(282, 406, 480, 406, 10, rgba(pal.gem, 210));
  g.line(282, 448, 430, 448, 8, rgba(pal.dark, 150));
  g.circle(504, 452, 28, rgba(pal.light, 210));
}
function drawStay(g, title, pal) {
  if (has(title, ['키'])) {
    g.roundedRect(296, 292, 176, 132, 28, rgba(pal.main, 250));
    g.circle(384, 356, 34, rgba(pal.light, 210));
    g.line(384, 424, 384, 546, 28, rgba(pal.dark, 245));
    g.line(384, 514, 460, 514, 22, rgba(pal.dark, 245));
    return;
  }
  g.roundedRect(260, 284, 248, 224, 36, rgba('#fff8ec', 250));
  g.roundedRect(304, 328, 160, 72, 18, rgba(pal.main, 230));
  g.line(310, 450, 456, 450, 16, rgba(pal.dark, 160));
}
function drawShopping(g, title, pal) {
  if (has(title, ['재킷', '코디'])) {
    g.poly([[300, 282], [468, 282], [548, 504], [438, 534], [384, 408], [330, 534], [220, 504]], rgba(pal.main, 245));
    g.poly([[348, 288], [384, 408], [420, 288]], rgba('#fff8ec', 235));
    g.line(384, 408, 384, 528, 8, rgba(pal.dark, 150));
    return;
  }
  g.roundedRect(266, 330, 236, 204, 28, rgba(pal.main, 250));
  g.line(318, 330, 318, 286, 18, rgba(pal.dark, 210));
  g.line(450, 330, 450, 286, 18, rgba(pal.dark, 210));
  g.line(318, 286, 450, 286, 18, rgba(pal.dark, 210));
  g.roundedRect(338, 390, 92, 58, 14, rgba('#fff8ec', 210));
}
function drawSafety(g, title, pal) {
  if (has(title, ['마스크'])) {
    g.roundedRect(246, 342, 276, 132, 42, rgba('#f4fbff', 250));
    g.line(276, 382, 492, 382, 8, rgba(pal.main, 160));
    g.line(276, 424, 492, 424, 8, rgba(pal.main, 160));
    g.line(246, 392, 186, 360, 10, rgba('#f4fbff', 210));
    g.line(522, 392, 582, 360, 10, rgba('#f4fbff', 210));
    return;
  }
  g.roundedRect(292, 270, 184, 276, 36, rgba('#fff8ec', 250));
  g.roundedRect(332, 314, 104, 64, 18, rgba(pal.main, 235));
  g.line(384, 410, 384, 492, 28, rgba('#d94b65', 240));
  g.line(342, 452, 426, 452, 28, rgba('#d94b65', 240));
}
function drawService(g, title, pal) {
  if (has(title, ['지도', '루트', '표지'])) {
    g.poly([[246, 300], [350, 260], [452, 302], [548, 264], [548, 510], [444, 552], [342, 510], [246, 548]], rgba('#fff9e9', 250));
    g.line(350, 260, 342, 510, 10, rgba(pal.main, 180));
    g.line(452, 302, 444, 552, 10, rgba(pal.main, 180));
    g.line(292, 420, 496, 374, 12, rgba(pal.dark, 170));
    return;
  }
  g.roundedRect(278, 270, 212, 274, 30, rgba('#fff8ec', 250));
  g.roundedRect(312, 312, 144, 34, 14, rgba(pal.main, 220));
  g.line(324, 394, 444, 394, 10, rgba(pal.dark, 150));
  g.line(324, 438, 420, 438, 10, rgba(pal.dark, 130));
}
function drawFestival(g, title, pal) {
  if (has(title, ['배지', '탐험가'])) {
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI * 2 * i) / 10;
      g.poly([[384, 382], [384 + Math.cos(a - 0.18) * 185, 382 + Math.sin(a - 0.18) * 185], [384 + Math.cos(a + 0.18) * 185, 382 + Math.sin(a + 0.18) * 185]], rgba(pal.main, 210));
    }
    g.circle(384, 382, 126, rgba(pal.light, 245));
    g.circle(384, 382, 82, rgba(pal.gem, 235));
    return;
  }
  g.ellipse(384, 384, 132, 170, rgba(pal.main, 245));
  g.roundedRect(310, 246, 148, 42, 16, rgba(pal.dark, 230));
  g.line(384, 290, 384, 520, 10, rgba(pal.light, 160));
}
function drawItem(g, item, rarity) {
  const pal = rarityPal[rarity];
  shine(g, pal, rarity);
  switch (item.motif) {
    case 'food': drawFood(g, item.title, pal); break;
    case 'drink': drawDrink(g, item.title, pal); break;
    case 'ticket': drawTicket(g, item.title, pal); break;
    case 'stay': drawStay(g, item.title, pal); break;
    case 'shopping': drawShopping(g, item.title, pal); break;
    case 'safety': drawSafety(g, item.title, pal); break;
    case 'festival': drawFestival(g, item.title, pal); break;
    default: drawService(g, item.title, pal); break;
  }
  const h = hash(item.title + rarity);
  drawMascot(g, h % 2 ? 590 : 178, h % 2 ? 554 : 548, 0.72, h % 3 ? 'cat' : 'dog', pal);
  if (rarity === 'diamond') {
    g.poly([[384, 118], [414, 164], [384, 210], [354, 164]], rgba(pal.gem, 220));
  }
}

const places = [...new Set([...GACHA_ITEM_PLACES, ...CONTENT.missions.map((m) => m.place).filter(Boolean)])];
const items = new Map();
for (const place of places) {
  for (const r of RARITIES) {
    const item = gachaItemForPlace(place, r.key);
    const rel = item.image?.replace(/^\/gacha\/items\/generated-v2\//, '');
    if (!rel) continue;
    items.set(rel, { item, rarity: r.key, place });
  }
}

let written = 0;
for (const [file, { item, rarity }] of items) {
  const data = png(SIZE, SIZE, (g) => drawItem(g, item, rarity));
  writeFileSync(join(outDir, file), data);
  written++;
}
console.log(`generated ${written} gacha item assets in ${outDir}`);
