import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sceneDir = join(root, 'public', 'scenes');
const iconDir = join(root, 'public', 'icons');
const publicDir = join(root, 'public');
mkdirSync(sceneDir, { recursive: true });
mkdirSync(iconDir, { recursive: true });

const palette = {
  ink: '#16171c',
  accent: '#b23b32',
  bg: '#f6f6f4',
  surface: '#ffffff',
  ok: '#2e8b57',
  warn: '#b5791f',
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
  const set = (x, y, color) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const i = (y * width + x) * 4;
    rgba[i] = color[0]; rgba[i + 1] = color[1]; rgba[i + 2] = color[2]; rgba[i + 3] = color[3] ?? 255;
  };
  const fill = (color) => {
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) set(x, y, color);
  };
  const circle = (cx, cy, r, color) => {
    const rr = r * r;
    for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
      for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        if ((x - cx) ** 2 + (y - cy) ** 2 <= rr) set(x, y, color);
      }
    }
  };
  const line = (x1, y1, x2, y2, w, color) => {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / Math.max(1, steps);
      circle(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, w / 2, color);
    }
  };
  draw({ fill, circle, line, width, height });
  const rows = [];
  for (let y = 0; y < height; y++) rows.push(Buffer.concat([Buffer.from([0]), rgba.subarray(y * width * 4, (y + 1) * width * 4)]));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 255];

function appIconPng(size) {
  const ink = hex(palette.ink);
  const accent = hex(palette.accent);
  const paper = hex('#f6f6f4');
  return png(size, size, ({ fill, circle, line, width }) => {
    fill(ink);
    circle(width * 0.74, width * 0.24, width * 0.09, accent);
    line(width * 0.30, width * 0.32, width * 0.70, width * 0.32, width * 0.055, paper);
    line(width * 0.31, width * 0.66, width * 0.44, width * 0.75, width * 0.065, paper);
    line(width * 0.44, width * 0.75, width * 0.62, width * 0.67, width * 0.065, paper);
    line(width * 0.62, width * 0.67, width * 0.58, width * 0.49, width * 0.065, paper);
    line(width * 0.58, width * 0.49, width * 0.39, width * 0.48, width * 0.065, paper);
    line(width * 0.39, width * 0.48, width * 0.32, width * 0.66, width * 0.065, paper);
  });
}

function icoFromPng(pngData) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = 32; entry[1] = 32; entry[2] = 0; entry[3] = 0;
  entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngData.length, 8); entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, pngData]);
}

const scenes = [
  ['c0', '가게', 'bag'],
  ['c1', '편의점', 'store'],
  ['c2', '식당', 'bowl'],
  ['c3', '전철', 'train'],
  ['c4', '호텔', 'hotel'],
  ['c5', '거리', 'sign'],
  ['c6', '약국', 'cross'],
  ['c7', '쇼핑', 'tag'],
  ['c8', '택시', 'taxi'],
  ['c9', '공항', 'plane'],
  ['c10', '환전', 'yen'],
  ['c11', '코인로커', 'locker'],
  ['c12', '택배', 'box'],
  ['c13', '라멘', 'ramen'],
];

const icons = {
  'nav-home': '<path d="M4 11.5 12 5l8 6.5v7a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M9.5 20v-6h5v6"/>',
  'nav-map': '<path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2z"/><path d="M9 4v14M15 6v14"/>',
  'nav-review': '<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21z"/><path d="M5 5.5V21M9 7h7M9 11h6"/>',
  'nav-guide': '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 0 1 5.1 1.3c0 2-2.6 2.2-2.6 4.2"/><path d="M12 18h.01"/>',
  'nav-settings': '<circle cx="12" cy="12" r="3"/><path d="M19 12a7.3 7.3 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7.2 7.2 0 0 0-1.7-1L14.5 3h-5l-.3 3.1a7.2 7.2 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7.3 7.3 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7.2 7.2 0 0 0 1.7 1l.3 3.1h5l.3-3.1a7.2 7.2 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1z"/>',
  'theme-day': '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  'theme-night': '<path d="M20 14.5A8 8 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
  back: '<path d="M19 12H5M12 5l-7 7 7 7"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  kana: '<path d="M5 7h14M8 7c1 4 0 8-3 11M13 7v11M13 13h5"/>',
  sign: '<path d="M12 21V4M6 5h10l2 3-2 3H6zM18 13H8l-2 3 2 3h10z"/>',
  dictation: '<path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10z"/><path d="m14 7 3 3"/>',
  listen: '<path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v4a2 2 0 0 0 2 2h2v-6H4zM20 13v4a2 2 0 0 1-2 2h-2v-6h4z"/>',
  speak: '<path d="M5 6h14v9H9l-4 4z"/><path d="M9 10h6M9 13h4"/>',
  discover: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="3"/><path d="M19 4v3M17.5 5.5h3"/>',
  tip: '<path d="M9 18h6M10 21h4"/><path d="M8 13a6 6 0 1 1 8 0c-1.2 1-1.5 2.1-1.5 3h-5c0-.9-.3-2-1.5-3z"/>',
  flow: '<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 6h8M18 8v8M16 18H8a2 2 0 0 1-2-2v-5"/>',
  recovery: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m5.6 5.6 3.2 3.2M15.2 15.2l3.2 3.2M18.4 5.6l-3.2 3.2M8.8 15.2l-3.2 3.2"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18"/>',
  star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.3 6.1-.9z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 21h6M8 17h8"/>',
  'scene-store': '<path d="M6 9h12l-1 11H7z"/><path d="M9 9a3 3 0 0 1 6 0"/>',
  'scene-conbini': '<path d="M4 10h16l-1.5-5h-13z"/><path d="M5 10v10h14V10M10 20v-6h4v6M7 13h2M15 13h2"/>',
  'scene-restaurant': '<path d="M5 14h14c-.8 4-3.4 6-7 6s-6.2-2-7-6z"/><path d="M8 10c2-1.5 6-1.5 8 0M7 4v6M17 4v6M10 4v4"/>',
  'scene-train': '<rect x="6" y="4" width="12" height="14" rx="2"/><path d="M8 8h8v4H8zM8 22l2-4M16 22l-2-4"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/>',
  'scene-hotel': '<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M12 20v-4"/><circle cx="12" cy="4" r="2"/>',
  'scene-street': '<path d="M12 21V4M6 5h10l2 3-2 3H6zM18 13H8l-2 3 2 3h10z"/>',
  'scene-pharmacy': '<rect x="5" y="7" width="14" height="12" rx="2"/><path d="M12 10v6M9 13h6"/>',
  'scene-shopping': '<path d="M4 12 12 4h8v8l-8 8z"/><circle cx="16" cy="8" r="1"/><path d="M8 16l4-4"/>',
  'scene-taxi': '<path d="M5 17v-5l2-4h10l2 4v5zM8 8h8M7 17v2M17 17v2"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>',
  'scene-airport': '<path d="M3 13 21 5l-4 15-5-6-5 4 2-6z"/>',
  'scene-exchange': '<circle cx="12" cy="12" r="8"/><path d="M8 8l4 5 4-5M9 13h6M9 16h6"/>',
  'scene-locker': '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M10 4v16M14 4v16M5 12h14"/><circle cx="7.5" cy="8" r=".5"/><circle cx="12" cy="8" r=".5"/><circle cx="16.5" cy="8" r=".5"/>',
  'scene-delivery': '<path d="M4 8 12 4l8 4v8l-8 4-8-4z"/><path d="M12 12v8M4 8l8 4 8-4M8 6l8 4"/>',
  'scene-ramen': '<path d="M5 14h14c-.8 4-3.4 6-7 6s-6.2-2-7-6z"/><path d="M7 10c3-2 7-2 10 0M8 5l4 5M16 5l-4 5"/><circle cx="15" cy="16" r="1.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chart: '<path d="M4 19V5M4 19h16"/><path d="M8 15v-4M12 15V8M16 15v-7"/>',
  celebrate: '<path d="m5 21 3-9 7 7z"/><path d="M14 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1zM19 13l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  mode: '<path d="M5 7h14M5 12h14M5 17h14"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="11" cy="17" r="2"/>',
  fast: '<path d="M5 5v14l7-7zM13 5v14l7-7z"/>',
};

function motif(kind, x = 600, y = 242, s = 1) {
  const p = palette;
  const stroke = `stroke="${p.ink}" stroke-width="${8 * s}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const fillAccent = `fill="${p.accent}"`;
  const fillSurface = `fill="${p.surface}" stroke="${p.ink}" stroke-width="${8 * s}"`;
  if (kind === 'store') return `<path ${stroke} d="M${x-150*s} ${y-40*s}h${300*s}l-${24*s}-${72*s}h-${252*s}z"/><path ${stroke} d="M${x-124*s} ${y-40*s}v${126*s}h${248*s}v-${126*s}"/><path ${stroke} d="M${x-44*s} ${y+86*s}v-${78*s}h${88*s}v${78*s}"/><circle ${fillAccent} cx="${x+94*s}" cy="${y+20*s}" r="${18*s}"/>`;
  if (kind === 'bowl' || kind === 'ramen') return `<path ${stroke} d="M${x-145*s} ${y+10*s}h${290*s}c-${18*s} ${84*s}-${76*s} ${118*s}-${145*s} ${118*s}s-${127*s}-${34*s}-${145*s}-${118*s}z"/><path ${stroke} d="M${x-96*s} ${y-24*s}c${32*s}-${22*s} ${64*s}-${22*s} ${96*s} 0s${64*s} ${22*s} ${96*s} 0"/><path ${stroke} d="M${x-98*s} ${y-70*s}l${78*s} ${70*s}M${x+98*s} ${y-70*s}l-${78*s} ${70*s}"/><circle ${fillAccent} cx="${x+78*s}" cy="${y+62*s}" r="${20*s}"/>`;
  if (kind === 'train') return `<rect ${fillSurface} x="${x-118*s}" y="${y-118*s}" width="${236*s}" height="${210*s}" rx="${28*s}"/><path ${stroke} d="M${x-74*s} ${y-54*s}h${148*s}v${72*s}h-${148*s}zM${x-72*s} ${y+132*s}l${42*s}-${40*s}M${x+72*s} ${y+132*s}l-${42*s}-${40*s}"/><circle ${fillAccent} cx="${x-56*s}" cy="${y+54*s}" r="${17*s}"/><circle ${fillAccent} cx="${x+56*s}" cy="${y+54*s}" r="${17*s}"/>`;
  if (kind === 'hotel') return `<rect ${fillSurface} x="${x-104*s}" y="${y-118*s}" width="${208*s}" height="${236*s}" rx="${20*s}"/><path ${stroke} d="M${x-58*s} ${y-62*s}h${116*s}M${x-58*s} ${y-12*s}h${116*s}M${x-58*s} ${y+38*s}h${116*s}M${x} ${y+118*s}v-${50*s}"/><circle ${fillAccent} cx="${x}" cy="${y-118*s}" r="${20*s}"/>`;
  if (kind === 'sign') return `<path ${stroke} d="M${x} ${y+118*s}v-${220*s}M${x-102*s} ${y-86*s}h${178*s}l${42*s} ${42*s}-${42*s} ${42*s}h-${178*s}zM${x+96*s} ${y+8*s}h-${178*s}l-${42*s} ${42*s} ${42*s} ${42*s}h${178*s}z"/><circle ${fillAccent} cx="${x}" cy="${y-98*s}" r="${14*s}"/>`;
  if (kind === 'cross') return `<rect ${fillSurface} x="${x-122*s}" y="${y-86*s}" width="${244*s}" height="${172*s}" rx="${28*s}"/><path ${stroke} d="M${x} ${y-52*s}v${104*s}M${x-52*s} ${y}h${104*s}"/><circle ${fillAccent} cx="${x+92*s}" cy="${y-62*s}" r="${18*s}"/>`;
  if (kind === 'tag') return `<path ${stroke} d="M${x-126*s} ${y-56*s}l${86*s}-${58*s}h${154*s}v${154*s}l-${58*s} ${86*s}z"/><circle ${fillAccent} cx="${x+62*s}" cy="${y-60*s}" r="${18*s}"/><path ${stroke} d="M${x-60*s} ${y+4*s}h${88*s}"/>`;
  if (kind === 'taxi') return `<path ${stroke} d="M${x-132*s} ${y+54*s}v-${62*s}l${44*s}-${66*s}h${176*s}l${44*s} ${66*s}v${62*s}zM${x-70*s} ${y-8*s}h${140*s}M${x-54*s} ${y-112*s}h${108*s}"/><circle ${fillAccent} cx="${x-82*s}" cy="${y+68*s}" r="${22*s}"/><circle ${fillAccent} cx="${x+82*s}" cy="${y+68*s}" r="${22*s}"/>`;
  if (kind === 'plane') return `<path ${stroke} d="M${x-150*s} ${y+20*s}l${300*s}-${110*s}-${58*s} ${126*s} ${80*s} ${72*s}-${50*s} ${28*s}-${84*s}-${54*s}-${78*s} ${30*s}z"/><path ${stroke} d="M${x-10*s} ${y-34*s}l-${22*s} ${118*s}"/><circle ${fillAccent} cx="${x+118*s}" cy="${y-72*s}" r="${18*s}"/>`;
  if (kind === 'yen') return `<circle ${fillSurface} cx="${x}" cy="${y}" r="${118*s}"/><path ${stroke} d="M${x-58*s} ${y-54*s}l${58*s} ${68*s} ${58*s}-${68*s}M${x} ${y+14*s}v${78*s}M${x-54*s} ${y+22*s}h${108*s}M${x-54*s} ${y+62*s}h${108*s}"/><circle ${fillAccent} cx="${x+92*s}" cy="${y-84*s}" r="${18*s}"/>`;
  if (kind === 'locker') return `<rect ${fillSurface} x="${x-130*s}" y="${y-116*s}" width="${260*s}" height="${232*s}" rx="${20*s}"/><path ${stroke} d="M${x-43*s} ${y-116*s}v${232*s}M${x+43*s} ${y-116*s}v${232*s}M${x-130*s} ${y}h${260*s}"/><circle ${fillAccent} cx="${x-82*s}" cy="${y-46*s}" r="${11*s}"/><circle ${fillAccent} cx="${x+4*s}" cy="${y-46*s}" r="${11*s}"/><circle ${fillAccent} cx="${x+90*s}" cy="${y-46*s}" r="${11*s}"/>`;
  if (kind === 'box') return `<path ${stroke} d="M${x-118*s} ${y-70*s}l${118*s}-${54*s} ${118*s} ${54*s}v${142*s}l-${118*s} ${56*s}-${118*s}-${56*s}zM${x} ${y-14*s}v${142*s}M${x-118*s} ${y-70*s}l${118*s} ${56*s} ${118*s}-${56*s}"/><path ${fillAccent} d="M${x-18*s} ${y-114*s}h${36*s}v${84*s}h-${36*s}z"/>`;
  return `<path ${stroke} d="M${x-96*s} ${y+84*s}h${192*s}l-${22*s}-${150*s}h-${148*s}z"/><path ${stroke} d="M${x-54*s} ${y-18*s}h${108*s}"/><circle ${fillAccent} cx="${x}" cy="${y+28*s}" r="${22*s}"/>`;
}

function hero(id, label, kind) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 480" role="img" aria-label="${label} scene illustration">
  <rect width="1200" height="480" rx="0" fill="transparent"/>
  <path d="M70 372C218 294 306 320 436 338c174 24 258-126 424-112 102 8 178 72 270 38" fill="none" stroke="${palette.accent}" stroke-width="20" stroke-linecap="round" opacity=".16"/>
  <rect x="72" y="70" width="1056" height="340" rx="56" fill="${palette.bg}" stroke="${palette.ink}" stroke-width="10"/>
  <circle cx="980" cy="126" r="44" fill="${palette.accent}" opacity=".92"/>
  ${motif(kind)}
  <path d="M184 374h832" stroke="${palette.ink}" stroke-width="10" stroke-linecap="round" opacity=".16"/>
</svg>
`;
}

function thumb(id, label, kind) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${label} scene thumbnail">
  <rect width="96" height="96" rx="20" fill="${palette.bg}" stroke="${palette.ink}" stroke-width="4"/>
  <circle cx="74" cy="22" r="8" fill="${palette.accent}"/>
  ${motif(kind, 48, 50, 0.18)}
</svg>
`;
}

for (const [id, label, kind] of scenes) {
  writeFileSync(join(sceneDir, `${id}-hero.svg`), hero(id, label, kind));
  writeFileSync(join(sceneDir, `${id}-thumb.svg`), thumb(id, label, kind));
}

for (const [name, body] of Object.entries(icons)) {
  writeFileSync(join(iconDir, `${name}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${body}</svg>
`);
}

writeFileSync(join(publicDir, 'app-icon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="yangmung app icon">
  <rect width="1024" height="1024" rx="224" fill="${palette.ink}"/>
  <circle cx="760" cy="248" r="92" fill="${palette.accent}"/>
  <path d="M300 646c70 82 178 100 260 44 70-48 88-154 24-216-60-58-164-58-234 8-50 48-70 122-40 192 24 56 82 98 154 98 82 0 150-46 178-116" fill="none" stroke="#f6f6f4" stroke-width="64" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M304 328h408" stroke="#f6f6f4" stroke-width="58" stroke-linecap="round"/>
</svg>
`);
writeFileSync(join(publicDir, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${palette.ink}"/><circle cx="47" cy="16" r="6" fill="${palette.accent}"/><path d="M20 40c5 7 14 9 21 4 6-4 7-13 2-18-5-5-14-5-20 1-5 5-6 14-1 20" fill="none" stroke="#f6f6f4" stroke-width="5" stroke-linecap="round"/></svg>
`);
writeFileSync(join(publicDir, 'celebrate.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" role="img" aria-label="session complete celebration">
  <rect width="480" height="480" fill="transparent"/>
  <circle cx="360" cy="104" r="44" fill="${palette.accent}"/>
  <circle cx="122" cy="350" r="28" fill="${palette.warn}" opacity=".88"/>
  <path d="M156 380 214 174l130 130z" fill="${palette.bg}" stroke="${palette.ink}" stroke-width="12" stroke-linejoin="round"/>
  <path d="m214 174 42 88-100 118z" fill="${palette.accent}" opacity=".9"/>
  <path d="M112 112l28 24M362 308l42 34M314 72l18-42M94 240l-48 12M382 190l50-10" stroke="${palette.ink}" stroke-width="12" stroke-linecap="round"/>
  <path d="M250 94l16 36 38 10-36 16-10 38-16-36-38-10 36-16z" fill="${palette.warn}"/>
</svg>
`);

const app1024 = appIconPng(1024);
const apple180 = appIconPng(180);
const fav32 = appIconPng(32);
writeFileSync(join(publicDir, 'app-icon.png'), app1024);
writeFileSync(join(publicDir, 'apple-touch-icon.png'), apple180);
writeFileSync(join(publicDir, 'favicon.ico'), icoFromPng(fav32));

console.log(`Generated ${scenes.length * 2 + Object.keys(icons).length + 6} assets in public/.`);
