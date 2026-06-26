import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataPath = join(root, 'src', 'content', 'data', 'thematicVocab.json');
const outDir = join(root, 'public', 'vocab', 'word-art');
const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const SIZE = 512;

const groupPal = {
  greetings: { main: '#f0a23a', dark: '#6d4318', light: '#fff0bd' },
  body: { main: '#e07a8a', dark: '#74404a', light: '#ffe2e8' },
  sports: { main: '#4f93d8', dark: '#244b78', light: '#d8ecff' },
  animals: { main: '#caa14a', dark: '#6e4b26', light: '#ffe4ad' },
  plants: { main: '#5db87a', dark: '#285c3b', light: '#dff6e6' },
  colors: { main: '#b06bd8', dark: '#57316d', light: '#f1dcff' },
  food: { main: '#e0794a', dark: '#74341e', light: '#ffe0ca' },
  family: { main: '#e08bb2', dark: '#7b4260', light: '#ffe1ef' },
  weather: { main: '#5bb8e0', dark: '#255a73', light: '#dff5ff' },
  adjectives: { main: '#7a8ad8', dark: '#333d78', light: '#e4e9ff' },
  places: { main: '#5d9ec4', dark: '#2a526b', light: '#dff2ff' },
  transport: { main: '#6e8e9a', dark: '#344b54', light: '#e1eef2' },
  feelings: { main: '#e0a23a', dark: '#704a16', light: '#fff0bd' },
};

const colorHex = {
  '빨간색': '#e0463c', '파란색': '#3a78d8', '파란색 / 초록색': '#2f9e8f', '노란색': '#f0c23a',
  '초록색': '#4faf6a', '흰색': '#f4efe6', '검은색': '#2a2620', '갈색': '#9c6f42', '보라색': '#9a6ad6',
  '주황색': '#e8843a', '분홍색': '#e88bb2', '회색': '#9aa3ad', '금색': '#d9a531', '하늘색': '#7cc4e8',
  '남색': '#34487a', '은색': '#b8c0c8',
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
  const rgbaData = Buffer.alloc(width * height * 4);
  const blend = (x, y, color) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const i = (y * width + x) * 4;
    const a = (color[3] ?? 255) / 255;
    const ia = 1 - a;
    rgbaData[i] = Math.round(color[0] * a + rgbaData[i] * ia);
    rgbaData[i + 1] = Math.round(color[1] * a + rgbaData[i + 1] * ia);
    rgbaData[i + 2] = Math.round(color[2] * a + rgbaData[i + 2] * ia);
    rgbaData[i + 3] = Math.min(255, Math.round((color[3] ?? 255) + rgbaData[i + 3] * ia));
  };
  draw(makeApi(width, height, blend));
  const rows = [];
  for (let y = 0; y < height; y++) rows.push(Buffer.concat([Buffer.from([0]), rgbaData.subarray(y * width * 4, (y + 1) * width * 4)]));
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
    const steps = Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2);
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
const mix = (hex, amount, a = 255) => rgba(hex).slice(0, 3).map((v) => Math.max(0, Math.min(255, Math.round(v + amount)))).concat(a);
const has = (text, words) => words.some((w) => text.includes(w));
const hash = (s) => [...s].reduce((n, ch) => (n * 33 + ch.charCodeAt(0)) >>> 0, 5381);

function base(g, pal, seed) {
  g.roundedRect(18, 18, 476, 476, 62, rgba('#fffaf0', 246));
  g.roundedRect(32, 32, 448, 448, 52, rgba(pal.light, 78));
  g.circle(106 + seed % 34, 96 + seed % 28, 76, rgba('#ffffff', 92));
  g.circle(392 - seed % 46, 122 + seed % 35, 96, rgba(pal.main, 54));
  g.circle(406, 380, 104, rgba('#ffffff', 54));
  g.ellipse(256, 430, 168, 34, rgba('#000000', 26));
  g.roundedRect(82, 360, 348, 58, 29, rgba('#ffffff', 118));
  if (seed % 3 === 0) {
    g.line(76, 144, 112, 144, 7, rgba(pal.main, 82));
    g.line(94, 126, 94, 162, 7, rgba(pal.main, 82));
  }
  if (seed % 2 === 0) {
    g.circle(422, 88, 8, rgba(pal.dark, 76));
    g.circle(452, 148, 5, rgba(pal.main, 80));
  }
}

function face(g, cx, cy, s = 1, ink = '#3c2b22') {
  g.circle(cx - 20 * s, cy - 4 * s, 5 * s, rgba(ink));
  g.circle(cx + 20 * s, cy - 4 * s, 5 * s, rgba(ink));
  g.line(cx - 13 * s, cy + 16 * s, cx, cy + 24 * s, 4 * s, rgba(ink));
  g.line(cx, cy + 24 * s, cx + 13 * s, cy + 16 * s, 4 * s, rgba(ink));
  g.circle(cx - 33 * s, cy + 8 * s, 8 * s, rgba('#f4a2a2', 120));
  g.circle(cx + 33 * s, cy + 8 * s, 8 * s, rgba('#f4a2a2', 120));
}

function miniMascots(g, pal, seed) {
  const dogLeft = seed % 2 === 0;
  const dogX = dogLeft ? 106 : 406;
  const catX = dogLeft ? 406 : 106;
  const y = 408;
  drawMiniDog(g, dogX, y, 0.58, pal);
  drawMiniCat(g, catX, y + 2, 0.56, pal);
}

function drawMiniDog(g, x, y, s, pal) {
  g.ellipse(x, y, 48 * s, 40 * s, rgba('#d9a756', 245));
  g.ellipse(x - 35 * s, y - 10 * s, 15 * s, 26 * s, rgba('#8c6335', 230));
  g.ellipse(x + 35 * s, y - 10 * s, 15 * s, 26 * s, rgba('#8c6335', 230));
  g.ellipse(x, y + 13 * s, 21 * s, 14 * s, rgba('#fff1d8', 235));
  g.circle(x - 14 * s, y - 5 * s, 4.2 * s, rgba('#37251b'));
  g.circle(x + 14 * s, y - 5 * s, 4.2 * s, rgba('#37251b'));
  g.circle(x, y + 5 * s, 4 * s, rgba('#37251b'));
  g.line(x - 7 * s, y + 14 * s, x, y + 18 * s, 2.8 * s, rgba('#37251b'));
  g.line(x, y + 18 * s, x + 7 * s, y + 14 * s, 2.8 * s, rgba('#37251b'));
  g.roundedRect(x - 42 * s, y + 30 * s, 84 * s, 22 * s, 10 * s, rgba(pal.main, 150));
}

function drawMiniCat(g, x, y, s, pal) {
  g.ellipse(x, y, 45 * s, 38 * s, rgba('#f4efe6', 245));
  g.poly([[x - 34 * s, y - 16 * s], [x - 20 * s, y - 50 * s], [x - 6 * s, y - 18 * s]], rgba('#f4efe6', 245));
  g.poly([[x + 34 * s, y - 16 * s], [x + 20 * s, y - 50 * s], [x + 6 * s, y - 18 * s]], rgba('#f4efe6', 245));
  g.poly([[x - 27 * s, y - 18 * s], [x - 20 * s, y - 36 * s], [x - 12 * s, y - 18 * s]], rgba('#f0b8c2', 210));
  g.poly([[x + 27 * s, y - 18 * s], [x + 20 * s, y - 36 * s], [x + 12 * s, y - 18 * s]], rgba('#f0b8c2', 210));
  g.circle(x - 14 * s, y - 2 * s, 4 * s, rgba('#37251b'));
  g.circle(x + 14 * s, y - 2 * s, 4 * s, rgba('#37251b'));
  g.line(x - 7 * s, y + 13 * s, x, y + 18 * s, 2.8 * s, rgba('#37251b'));
  g.line(x, y + 18 * s, x + 7 * s, y + 13 * s, 2.8 * s, rgba('#37251b'));
  g.roundedRect(x - 42 * s, y + 29 * s, 84 * s, 22 * s, 10 * s, rgba(pal.light, 170));
}

function drawSpeech(g, pal, mood = 'hello') {
  g.roundedRect(104, 116, 304, 184, 58, rgba('#ffffff', 246));
  g.poly([[202, 292], [168, 354], [258, 304]], rgba('#ffffff', 246));
  g.roundedRect(146, 170, 104, 26, 13, rgba(pal.main, 190));
  g.roundedRect(146, 224, mood === 'thanks' ? 188 : 142, 22, 11, rgba(pal.dark, 130));
  g.circle(338, 190, 30, rgba(pal.light, 240));
  face(g, 338, 190, 0.42);
}

function drawBody(g, ko, pal) {
  if (has(ko, ['눈'])) {
    g.ellipse(256, 250, 148, 82, rgba('#fff9f0', 255));
    g.circle(256, 250, 42, rgba(pal.main, 240));
    g.circle(256, 250, 20, rgba('#2c2630', 255));
    g.circle(240, 232, 10, rgba('#ffffff', 230));
  } else if (has(ko, ['귀'])) {
    g.ellipse(238, 262, 82, 128, rgba('#f5c99c', 255));
    g.ellipse(252, 266, 42, 78, rgba(pal.light, 220));
    g.line(252, 226, 226, 286, 12, rgba(pal.main, 150));
  } else if (has(ko, ['입', '목소리'])) {
    g.circle(256, 254, 106, rgba('#f8c9a7', 255));
    g.ellipse(256, 284, 56, 26, rgba('#9e3c43', 245));
    g.ellipse(256, 292, 34, 10, rgba('#ef8b98', 210));
  } else if (has(ko, ['손', '손가락'])) {
    g.roundedRect(196, 238, 118, 162, 52, rgba('#f4c69a', 255));
    for (let i = 0; i < 4; i++) g.roundedRect(158 + i * 44, 150 + (i % 2) * 14, 38, 126, 19, rgba('#f4c69a', 255));
  } else if (has(ko, ['발', '다리'])) {
    g.roundedRect(198, 160, 52, 210, 24, rgba('#f4c69a', 255));
    g.roundedRect(278, 160, 52, 210, 24, rgba('#f4c69a', 255));
    g.ellipse(202, 396, 74, 32, rgba(pal.main, 230));
    g.ellipse(328, 396, 74, 32, rgba(pal.main, 230));
  } else {
    g.circle(256, 158, 62, rgba('#f6c99d', 255));
    g.roundedRect(180, 226, 152, 168, 54, rgba(pal.main, 240));
    face(g, 256, 158, 0.72);
  }
}

function drawSports(g, ko, pal) {
  if (has(ko, ['야구'])) {
    g.circle(250, 266, 96, rgba('#fffaf2', 255));
    g.line(208, 184, 294, 348, 7, rgba('#d94d4d', 230));
    g.line(294, 184, 208, 348, 7, rgba('#d94d4d', 230));
    g.line(342, 148, 404, 382, 26, rgba('#c99554', 245));
  } else if (has(ko, ['테니스'])) {
    g.circle(220, 254, 86, rgba('#c9e64f', 255));
    g.line(184, 176, 256, 332, 6, rgba('#ffffff', 200));
    g.ellipse(340, 256, 70, 98, rgba('#ffffff', 60));
    g.line(340, 354, 386, 424, 18, rgba(pal.dark, 230));
  } else if (has(ko, ['수영'])) {
    g.circle(256, 202, 54, rgba('#f4c69a', 255));
    g.line(150, 318, 362, 318, 26, rgba(pal.main, 220));
    g.line(184, 356, 400, 356, 18, rgba('#7cc4e8', 230));
    face(g, 256, 202, 0.54);
  } else {
    g.circle(256, 270, 104, rgba('#fffaf2', 255));
    g.poly([[256, 178], [308, 232], [288, 306], [224, 306], [204, 232]], rgba(pal.main, 230));
    g.line(168, 270, 344, 270, 8, rgba(pal.dark, 170));
  }
}

function drawAnimal(g, ko, pal, seed) {
  const bird = has(ko, ['새', '닭']);
  const fish = has(ko, ['물고기']);
  if (fish) {
    g.ellipse(252, 270, 132, 76, rgba(pal.main, 245));
    g.poly([[362, 270], [444, 198], [444, 342]], rgba(pal.dark, 230));
    g.circle(204, 246, 8, rgba('#352417'));
    g.ellipse(250, 292, 58, 14, rgba(pal.light, 150));
  } else if (bird) {
    g.ellipse(252, 276, 106, 128, rgba(pal.main, 245));
    g.circle(250, 164, 62, rgba(pal.main, 245));
    g.poly([[306, 160], [382, 188], [306, 216]], rgba('#f0a23a', 245));
    g.circle(234, 150, 6, rgba('#352417'));
    g.line(224, 386, 208, 430, 10, rgba(pal.dark, 220));
    g.line(282, 386, 304, 430, 10, rgba(pal.dark, 220));
  } else {
    const cat = has(ko, ['고양이', '여우', '토끼']);
    g.ellipse(256, 268, 132, 112, rgba(pal.main, 245));
    if (cat) {
      g.poly([[164, 210], [196, 122], [240, 210]], rgba(pal.main, 245));
      g.poly([[348, 210], [316, 122], [272, 210]], rgba(pal.main, 245));
    } else {
      g.ellipse(152, 222, 44, 64, rgba(pal.dark, 220));
      g.ellipse(360, 222, 44, 64, rgba(pal.dark, 220));
    }
    g.ellipse(256, 304, 58, 36, rgba('#fff2db', 235));
    face(g, 256, 260, 0.9);
  }
}

function drawPlant(g, ko, pal) {
  if (has(ko, ['나무'])) {
    g.roundedRect(232, 242, 48, 166, 22, rgba('#8a552d', 245));
    g.circle(206, 218, 68, rgba(pal.main, 235));
    g.circle(282, 196, 78, rgba('#67c985', 235));
    g.circle(308, 260, 64, rgba('#4da86a', 235));
  } else if (has(ko, ['과일'])) {
    g.circle(236, 282, 76, rgba('#e44f45', 245));
    g.circle(300, 286, 72, rgba('#f0b83a', 245));
    g.line(256, 198, 276, 154, 12, rgba('#6b4b2c', 230));
    g.ellipse(300, 178, 34, 18, rgba(pal.main, 230));
  } else {
    g.line(256, 394, 256, 220, 20, rgba(pal.dark, 230));
    for (let i = 0; i < 7; i++) {
      const a = (Math.PI * 2 * i) / 7;
      g.ellipse(256 + Math.cos(a) * 72, 196 + Math.sin(a) * 62, 38, 58, rgba(i % 2 ? pal.main : '#f08db6', 245));
    }
    g.circle(256, 196, 42, rgba('#f0c23a', 245));
  }
}

function drawFood(g, ko, pal) {
  if (has(ko, ['차', '우유', '주스', '물'])) {
    g.roundedRect(178, 158, 150, 236, 42, rgba('#fffaf0', 250));
    g.roundedRect(198, 214, 110, 142, 26, rgba(has(ko, ['우유']) ? '#f7fbff' : pal.main, 220));
    g.line(328, 226, 400, 274, 18, rgba('#fffaf0', 230));
    g.line(400, 274, 334, 334, 18, rgba('#fffaf0', 230));
  } else if (has(ko, ['밥', '음식', '고기', '생선', '야채'])) {
    g.ellipse(256, 326, 168, 66, rgba('#fffaf0', 252));
    g.circle(202, 278, 46, rgba('#f6f1df', 250));
    g.circle(270, 274, 42, rgba('#e75b48', 240));
    g.circle(318, 306, 34, rgba('#58a561', 235));
    g.line(370, 172, 244, 256, 12, rgba('#7a4327', 245));
    g.line(390, 190, 264, 274, 12, rgba('#7a4327', 245));
  } else {
    g.ellipse(256, 318, 174, 72, rgba('#fffaf0', 252));
    g.circle(210, 276, 54, rgba('#e85f45', 240));
    g.circle(292, 270, 50, rgba(pal.main, 245));
    g.circle(280, 326, 36, rgba('#5faa62', 230));
  }
}

function drawFamily(g, ko, pal) {
  const small = has(ko, ['동생', '아이']);
  const elder = has(ko, ['할머니', '할아버지']);
  const people = has(ko, ['가족']) ? [[196, 236, 0.86], [272, 220, 1], [342, 250, 0.72]] : [[222, 236, small ? 0.74 : 0.9], [308, 230, elder ? 1.04 : 0.9]];
  for (const [x, y, s] of people) {
    g.circle(x, y, 42 * s, rgba('#f5c99c', 255));
    g.roundedRect(x - 48 * s, y + 48 * s, 96 * s, 116 * s, 34 * s, rgba(pal.main, 230));
    if (elder) g.line(x - 24 * s, y - 32 * s, x + 26 * s, y - 32 * s, 8 * s, rgba('#ffffff', 210));
    face(g, x, y, 0.42 * s);
  }
}

function drawWeather(g, ko, pal) {
  if (has(ko, ['비'])) {
    g.ellipse(250, 226, 142, 70, rgba('#dce7ef', 245));
    for (let i = 0; i < 6; i++) g.line(160 + i * 42, 306, 134 + i * 42, 374, 12, rgba(pal.main, 220));
  } else if (has(ko, ['눈'])) {
    g.ellipse(250, 226, 142, 70, rgba('#dce7ef', 245));
    for (let i = 0; i < 6; i++) {
      const x = 150 + i * 44;
      g.line(x - 14, 334, x + 14, 334, 5, rgba('#ffffff', 245));
      g.line(x, 320, x, 348, 5, rgba('#ffffff', 245));
    }
  } else if (has(ko, ['바람'])) {
    g.line(136, 222, 370, 222, 18, rgba(pal.main, 210));
    g.line(166, 286, 408, 286, 14, rgba(pal.dark, 160));
    g.line(210, 348, 350, 348, 12, rgba(pal.main, 180));
  } else {
    g.circle(220, 210, 82, rgba('#f0c23a', 245));
    g.ellipse(302, 308, 132, 58, rgba('#dce7ef', 230));
    g.ellipse(220, 330, 118, 52, rgba('#ffffff', 225));
  }
}

function drawAdjective(g, ko, pal) {
  if (has(ko, ['크다'])) {
    g.circle(256, 260, 126, rgba(pal.main, 235));
    g.circle(382, 360, 38, rgba(pal.light, 210));
  } else if (has(ko, ['작다'])) {
    g.circle(256, 278, 58, rgba(pal.main, 235));
    g.circle(360, 298, 22, rgba(pal.light, 210));
  } else if (has(ko, ['길다'])) {
    g.roundedRect(104, 244, 304, 58, 29, rgba(pal.main, 240));
  } else if (has(ko, ['짧다'])) {
    g.roundedRect(186, 244, 140, 58, 29, rgba(pal.main, 240));
  } else if (has(ko, ['뜨겁다', '덥다'])) {
    g.circle(256, 260, 76, rgba('#f0c23a', 245));
    g.line(256, 142, 256, 96, 14, rgba('#e75b48', 220));
    g.line(170, 176, 136, 142, 12, rgba('#e75b48', 220));
    g.line(342, 176, 376, 142, 12, rgba('#e75b48', 220));
  } else if (has(ko, ['차갑다', '춥다'])) {
    g.circle(256, 260, 76, rgba('#b7e7ff', 245));
    for (let i = 0; i < 6; i++) g.line(256, 260, 256 + Math.cos(i) * 132, 260 + Math.sin(i) * 132, 9, rgba('#ffffff', 210));
  } else {
    g.roundedRect(160, 170, 192, 192, 54, rgba(pal.main, 235));
    g.circle(220, 238, 26, rgba('#ffffff', 70));
    face(g, 256, 260, 0.64, '#ffffff');
  }
}

function drawPlace(g, ko, pal) {
  if (has(ko, ['공원', '정원'])) {
    drawPlant(g, '나무', groupPal.plants);
    g.line(108, 402, 404, 402, 18, rgba(pal.main, 160));
    return;
  }
  g.poly([[128, 210], [256, 112], [384, 210]], rgba(pal.dark, 230));
  g.roundedRect(152, 206, 208, 190, 18, rgba('#fff8e8', 250));
  g.roundedRect(226, 280, 60, 116, 12, rgba(pal.main, 225));
  g.roundedRect(176, 238, 46, 42, 10, rgba('#9ed5f0', 220));
  g.roundedRect(302, 238, 46, 42, 10, rgba('#9ed5f0', 220));
}

function drawTransport(g, ko, pal) {
  if (has(ko, ['비행기', '공항'])) {
    g.poly([[112, 272], [408, 204], [432, 242], [292, 308], [360, 392], [312, 410], [234, 330], [142, 346]], rgba(pal.main, 245));
    g.line(256, 300, 186, 188, 18, rgba(pal.dark, 200));
  } else if (has(ko, ['버스'])) {
    g.roundedRect(122, 190, 268, 180, 34, rgba(pal.main, 245));
    g.roundedRect(154, 226, 204, 70, 12, rgba('#e4f7ff', 230));
    g.circle(180, 376, 28, rgba(pal.dark, 245));
    g.circle(334, 376, 28, rgba(pal.dark, 245));
  } else if (has(ko, ['차', '택시'])) {
    g.roundedRect(132, 248, 260, 98, 30, rgba('#f0c23a', 245));
    g.poly([[190, 248], [230, 192], [310, 192], [352, 248]], rgba('#f0c23a', 245));
    g.circle(190, 354, 28, rgba(pal.dark, 245));
    g.circle(334, 354, 28, rgba(pal.dark, 245));
  } else {
    g.roundedRect(136, 172, 240, 220, 42, rgba(pal.main, 245));
    g.roundedRect(172, 218, 168, 78, 14, rgba('#e4f7ff', 230));
    g.circle(194, 392, 26, rgba(pal.dark, 245));
    g.circle(318, 392, 26, rgba(pal.dark, 245));
  }
}

function drawFeeling(g, ko, pal) {
  g.circle(256, 256, 118, rgba(pal.main, 245));
  g.circle(214, 236, 10, rgba('#3c2b22'));
  g.circle(298, 236, 10, rgba('#3c2b22'));
  if (has(ko, ['슬프다'])) {
    g.line(224, 304, 256, 288, 8, rgba('#3c2b22'));
    g.line(256, 288, 288, 304, 8, rgba('#3c2b22'));
    g.circle(308, 270, 12, rgba('#6fc7f0', 200));
  } else if (has(ko, ['화나다', '무섭다'])) {
    g.line(198, 214, 230, 226, 8, rgba('#3c2b22'));
    g.line(314, 214, 282, 226, 8, rgba('#3c2b22'));
    g.ellipse(256, 304, 34, 14, rgba('#3c2b22'));
  } else {
    g.line(204, 294, 256, 326, 8, rgba('#3c2b22'));
    g.line(256, 326, 308, 294, 8, rgba('#3c2b22'));
  }
}

function drawColor(g, ko) {
  const hex = colorHex[ko] ?? '#b06bd8';
  g.roundedRect(154, 138, 204, 236, 48, rgba(hex, 250));
  g.ellipse(208, 192, 48, 30, rgba('#ffffff', 62));
  g.circle(256, 410, 28, rgba(hex, 190));
}

function drawWord(group, item) {
  const ko = item.korean;
  const seed = hash(`${group}:${item.id}:${ko}`);
  const pal = groupPal[group] ?? groupPal.greetings;
  return png(SIZE, SIZE, (g) => {
    base(g, pal, seed);
    switch (group) {
      case 'greetings': drawSpeech(g, pal, has(ko, ['감사']) ? 'thanks' : 'hello'); break;
      case 'body': drawBody(g, ko, pal); break;
      case 'sports': drawSports(g, ko, pal); break;
      case 'animals': drawAnimal(g, ko, pal, seed); break;
      case 'plants': drawPlant(g, ko, pal); break;
      case 'colors': drawColor(g, ko); break;
      case 'food': drawFood(g, ko, pal); break;
      case 'family': drawFamily(g, ko, pal); break;
      case 'weather': drawWeather(g, ko, pal); break;
      case 'adjectives': drawAdjective(g, ko, pal); break;
      case 'places': drawPlace(g, ko, pal); break;
      case 'transport': drawTransport(g, ko, pal); break;
      case 'feelings': drawFeeling(g, ko, pal); break;
      default: drawSpeech(g, pal); break;
    }
    miniMascots(g, pal, seed);
  });
}

let written = 0;
for (const group of data.groups) {
  const groupDir = join(outDir, group.id);
  mkdirSync(groupDir, { recursive: true });
  for (const item of group.items) {
    writeFileSync(join(groupDir, `${item.id}.png`), drawWord(group.id, item));
    written++;
  }
}

console.log(`generated ${written} vocab word assets in ${outDir}`);
