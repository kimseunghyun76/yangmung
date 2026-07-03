import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import { CONTENT } from '../src/content/index.ts';
import { RARITIES } from '../src/learn/collection.ts';
import { GACHA_ITEM_PLACES, gachaLabItemForPlace } from '../src/learn/gachaItems.ts';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'public', 'gacha', 'items', 'generated-v2');
mkdirSync(outDir, { recursive: true });

const SIZE = 768;
const rarityPal = {
  basic: { main: '#d8c9ad', dark: '#6d5a44', light: '#fff6df', gem: '#e8ddc5', trim: '#b89f75' },
  bronze: { main: '#d89a5d', dark: '#7b4425', light: '#ffe2bb', gem: '#f0b777', trim: '#b56a35' },
  silver: { main: '#b9c7d8', dark: '#526274', light: '#f8fbff', gem: '#dce8f5', trim: '#8ca1b8' },
  gold: { main: '#f1c24e', dark: '#825416', light: '#fff1a8', gem: '#ffd96d', trim: '#c98b22' },
  diamond: { main: '#86d7ee', dark: '#286080', light: '#f5ffff', gem: '#b996ff', trim: '#56aee0' },
  xur: { main: '#b993ff', dark: '#4d2d85', light: '#fbf5ff', gem: '#80e4f3', trim: '#8d5cff' },
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
    const srcA = (color[3] ?? 255) / 255;
    const dstA = rgba[i + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA <= 0) return;
    rgba[i] = Math.round((color[0] * srcA + rgba[i] * dstA * (1 - srcA)) / outA);
    rgba[i + 1] = Math.round((color[1] * srcA + rgba[i + 1] * dstA * (1 - srcA)) / outA);
    rgba[i + 2] = Math.round((color[2] * srcA + rgba[i + 2] * dstA * (1 - srcA)) / outA);
    rgba[i + 3] = Math.round(outA * 255);
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
const has = (title, words) => words.some((w) => title.includes(w));
const compact = (title) => title.replace(/\s+/g, '');
const hash = (s) => [...s].reduce((n, ch) => (n * 33 + ch.charCodeAt(0)) >>> 0, 5381);
const tier = (rarity) => ({ basic: 1, bronze: 2, silver: 3, gold: 4, diamond: 5, xur: 6 })[rarity] ?? 1;

function sparkle(g, x, y, s, color) {
  g.line(x - s, y, x + s, y, Math.max(2, s * 0.24), color);
  g.line(x, y - s, x, y + s, Math.max(2, s * 0.24), color);
  g.circle(x, y, Math.max(2, s * 0.18), color);
}

function decorate(g, item, rarity, pal) {
  const t = tier(rarity);
  g.ellipse(384, 590, 230, 38, rgba('#2d2118', 42));
  const h = hash(item.title + rarity);
  for (let i = 0; i < t + 1; i++) {
    const x = 160 + ((h >>> (i * 3)) % 450);
    const y = 120 + ((h >>> (i * 5)) % 420);
    sparkle(g, x, y, 8 + i * 2, rgba(i % 2 ? pal.gem : pal.light, 55 + t * 16));
  }
  if (t >= 4) {
    g.circle(586, 518, 24, rgba(pal.gem, 150));
    g.circle(586, 518, 11, rgba('#ffffff', 190));
  }
  if (rarity === 'xur') {
    g.ellipse(384, 380, 306, 238, rgba('#b993ff', 38));
    g.ellipse(384, 380, 250, 196, rgba('#79e4f3', 26));
  }
}

function shine(g, x, y, w, color = '#ffffff') {
  g.line(x, y, x + w, y - w * 0.28, Math.max(8, w * 0.1), rgba(color, 115));
}

function coin(g, x, y, r, pal, face = '#ffd766') {
  g.circle(x, y, r + 8, rgba(pal.dark, 210));
  g.circle(x, y, r, rgba(face, 255));
  g.circle(x, y, r * 0.68, rgba('#fff2a8', 150));
  g.rect(x - r * 0.08, y - r * 0.54, r * 0.16, r * 1.08, rgba(pal.dark, 95));
  shine(g, x - r * 0.45, y - r * 0.28, r * 0.56);
}

function drawCoinSet(g, title, pal, rarity) {
  const t = tier(rarity);
  coin(g, 328, 430, 76, pal);
  coin(g, 420, 394, 86, pal, t >= 4 ? '#ffe681' : '#f5c85c');
  if (t >= 3) coin(g, 498, 462, 58, pal, '#f3b95a');
  g.line(306, 274, 486, 320, 18, rgba('#d83f3f', 235));
  g.line(326, 272, 506, 318, 10, rgba('#ffffff', 150));
  if (has(title, ['참배'])) {
    g.poly([[382, 230], [510, 306], [254, 306]], rgba('#e95c4f', 235));
    g.roundedRect(304, 300, 160, 46, 16, rgba('#fff2d5', 245));
  }
}

function drawSushi(g, title, pal, rarity) {
  const t = tier(rarity);
  g.ellipse(384, 494, 248 + t * 8, 64, rgba(pal.dark, 70));
  g.ellipse(384, 472, 244 + t * 9, 76, rgba(t >= 4 ? '#fff5dc' : '#f8efe2', 252));
  const count = Math.min(7, t + (has(title, ['오마카세', '세트', '코스']) ? 2 : 1));
  const fish = has(title, ['계란']) ? ['#f7d45f'] :
    has(title, ['참치', '오토로']) ? ['#df4f58', '#f2868d'] :
    has(title, ['연어']) ? ['#f18b52', '#ffb070'] :
    has(title, ['아지', '히라메', '킨메']) ? ['#dce8f0', '#f06b62'] :
    ['#f18b52', '#df4f58', '#f7d45f', '#ffffff', '#e85377'];
  for (let i = 0; i < count; i++) {
    const row = i >= 4 ? 1 : 0;
    const x = 244 + (i % 4) * 90 + (row ? 46 : 0);
    const y = row ? 414 : 354;
    g.roundedRect(x - 10, y + 28, 82, 54, 22, rgba(pal.dark, 170));
    g.roundedRect(x, y + 34, 72, 44, 18, rgba('#fff8ef', 255));
    g.roundedRect(x - 5, y, 82, 44, 18, rgba(fish[i % fish.length], 250));
    shine(g, x + 8, y + 12, 38);
  }
  if (t >= 5) {
    g.circle(524, 330, 18, rgba('#111111', 230));
    g.circle(524, 330, 9, rgba('#f1c24e', 230));
  }
}

function drawRamen(g, title, pal, rarity) {
  const t = tier(rarity);
  g.ellipse(384, 482, 220, 68, rgba(pal.dark, 80));
  g.ellipse(384, 430, 228, 112, rgba(pal.dark, 230));
  g.ellipse(384, 404, 220, 100, rgba('#fff4df', 255));
  g.ellipse(384, 402, 178, 66, rgba(has(title, ['쇼유']) ? '#b8793f' : has(title, ['미소']) ? '#d39a4d' : '#ead082', 230));
  for (let i = 0; i < 8 + t; i++) g.line(250 + i * 28, 400 + (i % 2) * 12, 305 + i * 20, 426 - (i % 2) * 10, 8, rgba('#f4d177', 240));
  if (t >= 2) g.circle(322, 386, 24, rgba('#fff2ac', 245));
  if (t >= 3) g.roundedRect(434, 376, 76, 30, 14, rgba('#cb6a50', 245));
  if (t >= 5 || has(title, ['해산물'])) g.circle(486, 366, 24, rgba('#f06f54', 240));
  g.line(496, 268, 334, 360, 12, rgba('#7a4327', 245));
  g.line(528, 284, 364, 374, 12, rgba('#7a4327', 245));
}

function drawPasta(g, title, pal, rarity) {
  const sauce = has(title, ['토마토']) ? '#d84a3c' : has(title, ['크림']) ? '#fff1c7' : has(title, ['트러플']) ? '#7a5132' : '#f0b868';
  g.ellipse(384, 472, 230, 76, rgba(pal.dark, 70));
  g.ellipse(384, 444, 222, 82, rgba('#fff7e4', 255));
  for (let i = 0; i < 16; i++) g.line(244 + i * 21, 412 + (i % 3) * 10, 300 + i * 14, 462 - (i % 2) * 13, 8, rgba('#f0c46a', 245));
  g.circle(432, 408, 25, rgba(sauce, 230));
  if (tier(rarity) >= 3) g.circle(330, 436, 20, rgba('#4f8f4d', 225));
  if (has(title, ['해산물'])) g.circle(486, 428, 24, rgba('#f06f54', 235));
}

function drawBento(g, title, pal, rarity) {
  const t = tier(rarity);
  g.roundedRect(226, 286, 316, 238, 38, rgba(pal.dark, 230));
  g.roundedRect(252, 312, 264, 184, 26, rgba('#fff7e8', 255));
  g.line(384, 318, 384, 492, 9, rgba(pal.dark, 120));
  g.line(258, 404, 510, 404, 9, rgba(pal.dark, 120));
  g.circle(322, 364, 38, rgba('#f6f1df', 255));
  g.circle(448, 362, 31, rgba('#e75b48', 240));
  g.circle(324, 452, 27, rgba('#58a561', 235));
  g.circle(444, 452, 34, rgba(pal.main, 245));
  if (t >= 4) g.circle(494, 330, 18, rgba(pal.gem, 210));
}

function drawFood(g, item, rarity, pal) {
  const title = compact(item.title);
  if (has(title, ['동전', '코인', '토큰']) && !has(title, ['접시'])) return drawCoinSet(g, title, pal, rarity);
  if (has(title, ['초밥', '사시미', '네타', '오토로', '니기리', '오마카세', '스시'])) return drawSushi(g, title, pal, rarity);
  if (has(title, ['라멘', '컵라멘'])) return drawRamen(g, title, pal, rarity);
  if (has(title, ['파스타'])) return drawPasta(g, title, pal, rarity);
  if (has(title, ['벤토', '도시락', '정식', '세트', '코스', '플레이트', '조식', '오믈렛'])) return drawBento(g, title, pal, rarity);
  if (has(title, ['삼각김밥'])) {
    g.poly([[384, 244], [542, 520], [226, 520]], rgba(pal.dark, 220));
    g.poly([[384, 266], [516, 500], [252, 500]], rgba('#fff8ee', 255));
    g.poly([[384, 338], [444, 498], [324, 498]], rgba('#263729', 245));
    return;
  }
  if (has(title, ['빵', '식빵'])) {
    g.ellipse(384, 430, 196, 118, rgba(pal.dark, 170));
    g.ellipse(384, 410, 190, 112, rgba('#df9b51', 255));
    g.ellipse(320, 364, 72, 54, rgba('#f1bf73', 245));
    g.ellipse(404, 354, 84, 58, rgba('#f1bf73', 245));
    g.ellipse(478, 386, 68, 54, rgba('#f1bf73', 245));
    return;
  }
  drawBento(g, title, pal, rarity);
}

function drawDrink(g, item, rarity, pal) {
  const title = compact(item.title);
  const hot = has(title, ['커피', '라떼', '블렌드', '시그니처', '녹차']);
  const cup = has(title, ['물컵']) ? '#a8dff5' : has(title, ['말차', '녹차']) ? '#9bcf73' : has(title, ['생맥주']) ? '#f2b64a' : pal.main;
  g.roundedRect(286, 250, 196, 300, hot ? 46 : 30, rgba(pal.dark, 185));
  g.roundedRect(304, 268, 160, 260, hot ? 38 : 24, rgba('#fff9ed', 255));
  g.roundedRect(322, 318, 124, 160, 22, rgba(cup, 230));
  g.ellipse(384, 284, 92, 28, rgba('#ffffff', 240));
  if (hot) g.ellipse(384, 326, 72, 22, rgba(has(title, ['말차', '녹차']) ? '#6a994f' : '#6c3a20', 220));
  else g.line(346, 326, 420, 486, 10, rgba('#ffffff', 135));
  if (!has(title, ['캔'])) {
    g.line(480, 352, 546, 394, 17, rgba(pal.dark, 180));
    g.line(546, 394, 486, 448, 17, rgba(pal.dark, 180));
  }
}

function drawTicket(g, item, rarity, pal) {
  const title = compact(item.title);
  if (has(title, ['지도', 'ルート', '루트', '안내도'])) return drawMap(g, pal, rarity);
  if (has(title, ['카드', '패스', 'IC', 'ETC'])) {
    g.roundedRect(220, 296, 328, 216, 36, rgba(pal.dark, 220));
    g.roundedRect(240, 316, 288, 176, 28, rgba(pal.main, 255));
    g.roundedRect(270, 348, 92, 56, 14, rgba(pal.light, 210));
    g.circle(478, 438, 28, rgba(pal.gem, 210));
    return;
  }
  if (has(title, ['영수증', '서류', '신청서', '확인서', '신고서', '예약표', '송장', '라벨'])) {
    return drawDocument(g, title, pal, rarity);
  }
  if (has(title, ['오미쿠지'])) {
    g.roundedRect(318, 242, 132, 320, 22, rgba(pal.dark, 200));
    g.roundedRect(332, 260, 104, 284, 18, rgba('#fff8e8', 255));
    g.circle(384, 316, 24, rgba('#e84a56', 235));
    g.line(360, 390, 408, 390, 8, rgba(pal.trim, 170));
    g.line(360, 438, 408, 438, 8, rgba(pal.trim, 150));
    return;
  }
  g.poly([[224, 296], [544, 296], [544, 368], [512, 394], [544, 420], [544, 496], [224, 496], [224, 420], [256, 394], [224, 368]], rgba(pal.dark, 210));
  g.poly([[246, 316], [522, 316], [522, 372], [492, 394], [522, 416], [522, 476], [246, 476], [246, 416], [276, 394], [246, 372]], rgba('#fff8e8', 255));
  g.roundedRect(286, 346, 196, 34, 14, rgba(pal.main, 220));
  g.line(290, 426, 478, 426, 9, rgba(pal.dark, 120));
}

function drawDocument(g, title, pal, rarity) {
  g.roundedRect(286, 238, 196, 318, 26, rgba(pal.dark, 200));
  g.roundedRect(304, 256, 160, 282, 20, rgba('#fff8ec', 255));
  g.roundedRect(326, 300, 116, 34, 14, rgba(pal.main, 220));
  g.line(326, 386, 442, 386, 8, rgba(pal.dark, 120));
  g.line(326, 430, 420, 430, 8, rgba(pal.dark, 100));
  if (has(title, ['영수증', '番号', '번호표'])) {
    for (let i = 0; i < 5; i++) g.poly([[304 + i * 32, 538], [320 + i * 32, 558], [336 + i * 32, 538]], rgba('#fff8ec', 255));
  }
}

function drawMap(g, pal, rarity) {
  g.poly([[236, 302], [344, 258], [452, 302], [552, 268], [552, 514], [444, 556], [336, 512], [236, 548]], rgba(pal.dark, 170));
  g.poly([[254, 318], [344, 282], [452, 322], [532, 294], [532, 498], [444, 532], [336, 492], [254, 522]], rgba('#fff9e9', 255));
  g.line(344, 282, 336, 492, 9, rgba(pal.main, 170));
  g.line(452, 322, 444, 532, 9, rgba(pal.main, 170));
  g.line(292, 420, 496, 374, 12, rgba(pal.dark, 140));
  g.circle(438, 374, 18, rgba('#e84a56', 230));
}

function drawKey(g, pal, rarity) {
  g.circle(332, 350, 68, rgba(pal.dark, 220));
  g.circle(332, 350, 40, rgba(pal.light, 230));
  g.line(386, 396, 534, 544, 34, rgba(pal.dark, 235));
  g.line(482, 494, 548, 494, 24, rgba(pal.dark, 235));
  g.line(510, 522, 568, 522, 20, rgba(pal.dark, 235));
  g.line(386, 396, 534, 544, 18, rgba(pal.main, 245));
}

function drawStay(g, item, rarity, pal) {
  const title = compact(item.title);
  if (has(title, ['키', '열쇠'])) return drawKey(g, pal, rarity);
  if (has(title, ['우산'])) {
    g.poly([[384, 230], [550, 408], [218, 408]], rgba(pal.dark, 205));
    g.poly([[384, 250], [518, 390], [250, 390]], rgba(pal.main, 245));
    g.line(384, 390, 384, 552, 16, rgba(pal.dark, 230));
    g.line(384, 552, 434, 552, 16, rgba(pal.dark, 230));
    return;
  }
  if (has(title, ['수건', '타월', '레인코트', '유카타'])) {
    g.roundedRect(250, 316, 268, 174, 34, rgba(pal.dark, 170));
    g.roundedRect(270, 296, 228, 174, 30, rgba('#fff8ec', 255));
    g.line(292, 370, 476, 370, 12, rgba(pal.main, 170));
    return;
  }
  g.roundedRect(260, 284, 248, 224, 36, rgba('#fff8ec', 255));
  g.roundedRect(304, 328, 160, 72, 18, rgba(pal.main, 230));
  g.line(310, 450, 456, 450, 16, rgba(pal.dark, 140));
}

function drawShopping(g, item, rarity, pal) {
  const title = compact(item.title);
  if (has(title, ['재킷', '코디', '스타일링'])) {
    g.poly([[300, 280], [468, 280], [552, 506], [438, 536], [384, 410], [330, 536], [216, 506]], rgba(pal.dark, 180));
    g.poly([[304, 296], [464, 296], [524, 494], [438, 516], [384, 408], [330, 516], [244, 494]], rgba(pal.main, 245));
    g.poly([[348, 298], [384, 408], [420, 298]], rgba('#fff8ec', 235));
    return;
  }
  if (has(title, ['태그', '가격표'])) {
    g.roundedRect(300, 270, 194, 252, 28, rgba(pal.dark, 190));
    g.roundedRect(318, 288, 158, 216, 22, rgba('#fff2cf', 255));
    g.circle(352, 326, 16, rgba(pal.dark, 180));
    g.line(352, 326, 270, 250, 10, rgba(pal.main, 210));
    return;
  }
  if (has(title, ['리본', '포장'])) {
    g.roundedRect(250, 344, 268, 178, 28, rgba(pal.dark, 180));
    g.roundedRect(270, 364, 228, 138, 22, rgba(pal.main, 245));
    g.line(384, 340, 384, 512, 24, rgba(pal.light, 210));
    g.poly([[384, 340], [314, 286], [314, 378]], rgba(pal.gem, 225));
    g.poly([[384, 340], [454, 286], [454, 378]], rgba(pal.gem, 225));
    return;
  }
  g.roundedRect(266, 330, 236, 204, 28, rgba(pal.dark, 185));
  g.roundedRect(286, 348, 196, 166, 22, rgba(pal.main, 250));
  g.line(326, 330, 326, 286, 18, rgba(pal.dark, 210));
  g.line(442, 330, 442, 286, 18, rgba(pal.dark, 210));
  g.line(326, 286, 442, 286, 18, rgba(pal.dark, 210));
}

function drawSafety(g, item, rarity, pal) {
  const title = compact(item.title);
  if (has(title, ['마스크'])) {
    g.roundedRect(238, 344, 292, 138, 44, rgba(pal.dark, 150));
    g.roundedRect(258, 360, 252, 106, 38, rgba('#f4fbff', 255));
    g.line(286, 392, 482, 392, 8, rgba(pal.main, 150));
    g.line(286, 428, 482, 428, 8, rgba(pal.main, 140));
    return;
  }
  if (has(title, ['캔디'])) {
    g.roundedRect(286, 356, 196, 96, 46, rgba('#ffe8ef', 255));
    g.poly([[286, 404], [218, 358], [228, 450]], rgba(pal.main, 210));
    g.poly([[482, 404], [550, 358], [540, 450]], rgba(pal.main, 210));
    return;
  }
  g.roundedRect(292, 270, 184, 276, 36, rgba('#fff8ec', 255));
  g.roundedRect(332, 314, 104, 64, 18, rgba(pal.main, 235));
  g.line(384, 410, 384, 492, 28, rgba('#d94b65', 240));
  g.line(342, 452, 426, 452, 28, rgba('#d94b65', 240));
}

function drawService(g, item, rarity, pal) {
  const title = compact(item.title);
  if (has(title, ['지도', '루트', '표지', '위치'])) return drawMap(g, pal, rarity);
  if (has(title, ['동전', '코인', '토큰'])) return drawCoinSet(g, title, pal, rarity);
  if (has(title, ['키', '열쇠'])) return drawKey(g, pal, rarity);
  if (has(title, ['배송', '택배', '박스', '완충재', '파우치', '키트', '팩'])) {
    g.roundedRect(252, 324, 264, 206, 28, rgba(pal.dark, 175));
    g.roundedRect(272, 344, 224, 166, 22, rgba('#d8a06c', 255));
    g.line(384, 344, 384, 510, 10, rgba(pal.dark, 95));
    g.line(278, 398, 490, 398, 10, rgba(pal.dark, 95));
    return;
  }
  if (has(title, ['유심', '데이터', '와이파이', '통신'])) {
    g.roundedRect(304, 270, 160, 278, 32, rgba(pal.dark, 190));
    g.roundedRect(324, 294, 120, 230, 24, rgba(pal.main, 245));
    g.circle(384, 488, 16, rgba(pal.light, 210));
    return;
  }
  drawDocument(g, title, pal, rarity);
}

function drawFestival(g, item, rarity, pal) {
  const title = compact(item.title);
  if (has(title, ['동전', '코인', '토큰', '참배'])) return drawCoinSet(g, title, pal, rarity);
  if (has(title, ['오마모리', '부적'])) {
    g.roundedRect(304, 270, 160, 250, 34, rgba(pal.dark, 190));
    g.roundedRect(322, 292, 124, 206, 26, rgba(pal.main, 250));
    g.line(384, 254, 384, 320, 12, rgba('#f5d777', 230));
    g.line(338, 354, 430, 354, 8, rgba(pal.light, 160));
    return;
  }
  if (has(title, ['에마', '목패'])) {
    g.poly([[258, 356], [384, 260], [510, 356], [510, 520], [258, 520]], rgba(pal.dark, 190));
    g.poly([[282, 366], [384, 292], [486, 366], [486, 496], [282, 496]], rgba('#e0ac68', 255));
    g.line(332, 338, 436, 338, 10, rgba('#d64c43', 220));
    return;
  }
  if (has(title, ['고슈인'])) {
    g.roundedRect(270, 270, 230, 282, 28, rgba(pal.dark, 190));
    g.roundedRect(292, 292, 186, 238, 22, rgba('#fff4df', 255));
    g.circle(384, 390, 58, rgba('#d94848', 170));
    g.line(330, 472, 438, 472, 9, rgba(pal.trim, 160));
    return;
  }
  if (has(title, ['부채'])) {
    for (let i = 0; i < 9; i++) {
      const a = -0.78 + i * 0.195;
      g.poly([[384, 514], [384 + Math.sin(a) * 235, 514 - Math.cos(a) * 235], [384 + Math.sin(a + 0.17) * 225, 514 - Math.cos(a + 0.17) * 225]], rgba(i % 2 ? pal.light : pal.main, 230));
    }
    g.circle(384, 514, 22, rgba(pal.dark, 235));
    return;
  }
  if (has(title, ['뜰채'])) {
    g.circle(352, 350, 96, rgba(pal.dark, 190));
    g.circle(352, 350, 76, rgba('#dff8ff', 120));
    g.line(410, 410, 530, 540, 22, rgba(pal.dark, 220));
    return;
  }
  if (has(title, ['불꽃', '마츠리'])) {
    sparkle(g, 332, 330, 74, rgba('#ffdf6d', 220));
    sparkle(g, 456, 402, 58, rgba('#ff8cab', 200));
    g.roundedRect(314, 464, 140, 82, 24, rgba(pal.main, 240));
    return;
  }
  g.circle(384, 382, 148, rgba(pal.dark, 170));
  g.circle(384, 382, 126, rgba(pal.main, 245));
  g.circle(384, 382, 78, rgba(pal.light, 230));
  sparkle(g, 384, 382, 42, rgba(pal.gem, 210));
}

function drawItem(g, item, rarity) {
  const pal = rarityPal[rarity];
  decorate(g, item, rarity, pal);
  switch (item.motif) {
    case 'food': drawFood(g, item, rarity, pal); break;
    case 'drink': drawDrink(g, item, rarity, pal); break;
    case 'ticket': drawTicket(g, item, rarity, pal); break;
    case 'stay': drawStay(g, item, rarity, pal); break;
    case 'shopping': drawShopping(g, item, rarity, pal); break;
    case 'safety': drawSafety(g, item, rarity, pal); break;
    case 'festival': drawFestival(g, item, rarity, pal); break;
    default: drawService(g, item, rarity, pal); break;
  }
  const h = hash(item.title + rarity);
  const pal2 = ['#ff8cab', '#84d8ff', '#ffd96d', '#a7e37b', '#c7a4ff'][h % 5];
  g.circle(180 + (h % 5) * 22, 552 - (h % 4) * 16, 12, rgba(pal2, 190));
}

const places = [...new Set([...GACHA_ITEM_PLACES, ...CONTENT.missions.map((m) => m.place).filter(Boolean)])];
const items = new Map();
for (const place of places) {
  for (const r of RARITIES) {
    const item = gachaLabItemForPlace(place, r.key);
    const rel = item.image?.replace(/^\/gacha\/items\/generated-v2\//, '').replace(/\.webp$/i, '.png');
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

console.log(`generated ${written} gacha item PNG assets in ${outDir}`);
