#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTENT } from '../src/content/index.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'scenes');
const SESSION_OUT = path.join(OUT, 'session-variants');
const QUICK_OUT = path.join(OUT, 'quick-practice');

const cuts = [
  ['solo-shop-01', 'solo', 'shop', 'counter'],
  ['solo-restaurant-02', 'solo', 'restaurant', 'table'],
  ['solo-street-03', 'solo', 'street', 'sign'],
  ['ff-shop-01', 'ff', 'shop', 'shelves'],
  ['ff-restaurant-02', 'ff', 'restaurant', 'menu'],
  ['ff-street-03', 'ff', 'street', 'lantern'],
  ['mf-shop-01', 'mf', 'shop', 'register'],
  ['mf-restaurant-02', 'mf', 'restaurant', 'serving'],
  ['mf-street-03', 'mf', 'street', 'map'],
];

const quick = [
  ['hiragana', 'HIRAGANA', 'あ い う', 'kana'],
  ['katakana', 'KATAKANA', 'ア イ ウ', 'kana'],
  ['greetings', 'GREETINGS', 'こんにちは', 'speech'],
  ['vocab', 'VOCAB', 'ことば', 'cards'],
  ['signs', 'SIGNS', '駅 入口 会計', 'sign'],
  ['dictation', 'DICTATION', 'きいて ならべる', 'pen'],
  ['compose', 'COMPOSE', '뜻에서 일본어로', 'speech'],
  ['basics', 'BASICS', '1 2 3 月 火 水', 'calendar'],
  ['kana-write', 'WRITE', 'なぞって おぼえる', 'pen'],
  ['pairs', 'SOUND PAIRS', 'つ / す', 'sound'],
  ['verbs', 'VERB FORMS', 'ます · ながら · たい', 'cards'],
  ['flash', 'SPEED QUIZ', 'READY?', 'bolt'],
];

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return Math.abs(h);
}

function palette(seedText) {
  const palettes = [
    ['#18314f', '#2dd4bf', '#f8fafc', '#f59e0b'],
    ['#2f1b46', '#f472b6', '#fff7ed', '#22c55e'],
    ['#17311f', '#84cc16', '#f7fee7', '#38bdf8'],
    ['#3a1f18', '#fb923c', '#fff7ed', '#60a5fa'],
    ['#1f2937', '#a78bfa', '#f8fafc', '#facc15'],
    ['#0f2a3a', '#38bdf8', '#ecfeff', '#fb7185'],
  ];
  return palettes[hash(seedText) % palettes.length];
}

function mascot(x, y, scale, kind = 'duo') {
  const cat = `
    <g transform="translate(${x - 42 * scale} ${y}) scale(${scale})">
      <path d="M12 24 22 8l10 18 10-18 10 16c12 4 20 16 20 31 0 22-18 38-40 38S-8 77-8 55c0-15 8-27 20-31Z" fill="#f8fbff" stroke="#102033" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="21" cy="56" r="4" fill="#102033"/><circle cx="47" cy="56" r="4" fill="#102033"/>
      <path d="M31 66h8M35 66v8M22 76c6 5 20 5 26 0" fill="none" stroke="#102033" stroke-width="4" stroke-linecap="round"/>
      <path d="M4 43h-18M6 53h-20M64 43h18M62 53h20" stroke="#102033" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    </g>`;
  const dog = `
    <g transform="translate(${x + 26 * scale} ${y + 8 * scale}) scale(${scale})">
      <path d="M2 34 20 10l10 20 24-2 10-18 16 26c7 7 11 16 11 28 0 22-18 38-44 38S4 86 4 64c0-12 4-22 12-29Z" fill="#e9f2ff" stroke="#102033" stroke-width="5" stroke-linejoin="round"/>
      <path d="M28 36c8-6 24-6 32 0" fill="none" stroke="#102033" stroke-width="4" stroke-linecap="round" opacity=".5"/>
      <circle cx="33" cy="63" r="4" fill="#102033"/><circle cx="59" cy="63" r="4" fill="#102033"/>
      <path d="M42 72h9M35 82c7 6 23 6 30 0" fill="none" stroke="#102033" stroke-width="4" stroke-linecap="round"/>
    </g>`;
  return kind === 'cat' ? cat : kind === 'dog' ? dog : `${cat}${dog}`;
}

function environment(kind, motif, colors, title) {
  const [ink, accent, paper, hot] = colors;
  const base = `
    <rect width="1280" height="800" rx="0" fill="${paper}"/>
    <rect x="38" y="34" width="1204" height="716" rx="64" fill="url(#room)" stroke="${ink}" stroke-width="10"/>
    <path d="M110 620C280 540 420 590 560 610c220 32 318-130 520-104 72 9 130 38 176 78" fill="none" stroke="${accent}" stroke-width="24" stroke-linecap="round" opacity=".18"/>
    <path d="M116 652h1038" stroke="${ink}" stroke-width="12" stroke-linecap="round" opacity=".16"/>
  `;
  if (kind === 'shop') {
    return `${base}
      <rect x="96" y="132" width="260" height="360" rx="28" fill="#fff" stroke="${ink}" stroke-width="8" opacity=".92"/>
      <path d="M124 210h204M124 306h204M124 402h204" stroke="${accent}" stroke-width="12" stroke-linecap="round" opacity=".55"/>
      <rect x="780" y="414" width="320" height="150" rx="30" fill="#fff" stroke="${ink}" stroke-width="8"/>
      <circle cx="1032" cy="454" r="32" fill="${hot}" opacity=".88"/>
      <path d="M832 474h124M832 520h196" stroke="${ink}" stroke-width="10" stroke-linecap="round" opacity=".48"/>
      <text x="136" y="108" fill="${ink}" font-size="38" font-weight="900" font-family="Arial, sans-serif">${esc(title)}</text>`;
  }
  if (kind === 'restaurant') {
    return `${base}
      <rect x="118" y="164" width="290" height="190" rx="34" fill="#fff" stroke="${ink}" stroke-width="8"/>
      <path d="M160 220h198M160 272h146" stroke="${accent}" stroke-width="12" stroke-linecap="round" opacity=".64"/>
      <ellipse cx="840" cy="532" rx="260" ry="78" fill="#fff" stroke="${ink}" stroke-width="8"/>
      <circle cx="820" cy="520" r="42" fill="${hot}" opacity=".86"/>
      <path d="M706 510c54-34 178-34 232 0" stroke="${ink}" stroke-width="10" stroke-linecap="round" fill="none" opacity=".5"/>
      <text x="148" y="128" fill="${ink}" font-size="38" font-weight="900" font-family="Arial, sans-serif">${esc(title)}</text>`;
  }
  return `${base}
    <path d="M166 160h272l40 64-40 64H166Z" fill="#fff" stroke="${ink}" stroke-width="8"/>
    <path d="M858 130h210l-26 402H884Z" fill="#fff" stroke="${ink}" stroke-width="8"/>
    <path d="M910 216h94M904 298h104M898 380h110" stroke="${accent}" stroke-width="12" stroke-linecap="round" opacity=".58"/>
    <circle cx="490" cy="164" r="34" fill="${hot}" opacity=".9"/>
    <text x="198" y="214" fill="${ink}" font-size="42" font-weight="900" font-family="Arial, sans-serif">${esc(title)}</text>`;
}

function people(pattern, colors) {
  const [ink, accent, , hot] = colors;
  const person = (x, y, s, hair, shirt) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <circle cx="0" cy="-78" r="42" fill="#ffe1c7" stroke="${ink}" stroke-width="6"/>
      <path d="M-42-76c8-48 74-58 92-6-28-12-54-10-92 6Z" fill="${hair}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M-44 34c8-70 80-70 92 0v96h-92Z" fill="${shirt}" stroke="${ink}" stroke-width="7" stroke-linejoin="round"/>
      <circle cx="-14" cy="-76" r="4" fill="${ink}"/><circle cx="18" cy="-76" r="4" fill="${ink}"/>
      <path d="M-10-54c12 8 26 8 38 0" stroke="${ink}" stroke-width="5" stroke-linecap="round" fill="none"/>
    </g>`;
  const staff = person(488, 446, 1.08, '#222635', accent);
  if (pattern === 'solo') return `${staff}${person(716, 468, 1.02, '#2b2434', '#ffffff')}`;
  if (pattern === 'ff') return `${staff}${person(696, 468, .98, '#33213a', '#ffffff')}${person(836, 480, .9, '#51372b', hot)}`;
  return `${staff}${person(692, 470, .98, '#2b2434', '#ffffff')}${person(842, 484, .92, '#263244', hot)}`;
}

function sessionSvg(mission, cut) {
  const [name, pattern, group, motif] = cut;
  const colors = palette(`${mission.id}:${name}`);
  const [ink, accent, paper, hot] = colors;
  const title = `${mission.id} ${mission.place ?? mission.scenario ?? 'TRAVEL'}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" role="img" aria-label="${esc(title)} background">
  <defs>
    <linearGradient id="room" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${paper}"/>
      <stop offset=".52" stop-color="#ffffff"/>
      <stop offset="1" stop-color="${accent}" stop-opacity=".2"/>
    </linearGradient>
    <filter id="lift" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="${ink}" flood-opacity=".22"/>
    </filter>
  </defs>
  ${environment(group, motif, colors, title)}
  <g filter="url(#lift)">${people(pattern, colors)}</g>
  <g filter="url(#lift)">${mascot(226, 480, 1.02, 'duo')}</g>
  <rect x="78" y="578" width="460" height="102" rx="30" fill="#fff" stroke="${ink}" stroke-width="8" opacity=".94"/>
  <text x="116" y="626" fill="${ink}" font-size="30" font-weight="900" font-family="Arial, sans-serif">${esc(mission.scenario ?? mission.place ?? mission.id)}</text>
  <text x="116" y="662" fill="${accent}" font-size="24" font-weight="800" font-family="Arial, sans-serif">${esc(pattern.toUpperCase())} · ${esc(group.toUpperCase())}</text>
  <circle cx="1142" cy="118" r="46" fill="${hot}" opacity=".9"/>
  <path d="M1076 118h132M1142 52v132" stroke="${ink}" stroke-width="9" stroke-linecap="round" opacity=".32"/>
</svg>`;
}

function quickMotif(kind, colors) {
  const [ink, accent, , hot] = colors;
  if (kind === 'kana') return `<rect x="146" y="164" width="410" height="296" rx="44" fill="#fff" stroke="${ink}" stroke-width="9"/><text x="204" y="350" fill="${accent}" font-size="136" font-weight="900" font-family="Arial, sans-serif">あ</text><text x="346" y="350" fill="${ink}" font-size="136" font-weight="900" font-family="Arial, sans-serif">ア</text>`;
  if (kind === 'sign') return `<path d="M182 182h370l54 64-54 64H182Z" fill="#fff" stroke="${ink}" stroke-width="9"/><path d="M552 354H234l-54 64 54 64h318Z" fill="#fff" stroke="${ink}" stroke-width="9"/><text x="250" y="266" fill="${accent}" font-size="54" font-weight="900" font-family="Arial, sans-serif">駅</text><text x="278" y="438" fill="${ink}" font-size="54" font-weight="900" font-family="Arial, sans-serif">会計</text>`;
  if (kind === 'pen') return `<rect x="168" y="178" width="410" height="310" rx="42" fill="#fff" stroke="${ink}" stroke-width="9"/><path d="M250 404 468 186l78 78-218 218-104 26Z" fill="${accent}" stroke="${ink}" stroke-width="9" stroke-linejoin="round"/><path d="M432 222l78 78" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".72"/>`;
  if (kind === 'calendar') return `<rect x="172" y="166" width="402" height="324" rx="42" fill="#fff" stroke="${ink}" stroke-width="9"/><path d="M172 246h402" stroke="${accent}" stroke-width="20"/><text x="232" y="368" fill="${ink}" font-size="56" font-weight="900" font-family="Arial, sans-serif">1 2 3</text><text x="242" y="438" fill="${accent}" font-size="48" font-weight="900" font-family="Arial, sans-serif">月 火 水</text>`;
  if (kind === 'sound') return `<circle cx="360" cy="324" r="150" fill="#fff" stroke="${ink}" stroke-width="9"/><path d="M326 318c54-60 54-112 0-170M390 318c54-60 54-112 0-170" stroke="${accent}" stroke-width="18" stroke-linecap="round" fill="none"/><text x="286" y="436" fill="${ink}" font-size="62" font-weight="900" font-family="Arial, sans-serif">つ/す</text>`;
  if (kind === 'bolt') return `<path d="M392 126 214 378h132l-62 198 220-284H368Z" fill="${hot}" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/><circle cx="470" cy="190" r="48" fill="${accent}" opacity=".35"/>`;
  if (kind === 'cards') return `<rect x="202" y="188" width="196" height="276" rx="28" fill="#fff" stroke="${ink}" stroke-width="9" transform="rotate(-9 300 326)"/><rect x="316" y="180" width="196" height="276" rx="28" fill="#fff" stroke="${ink}" stroke-width="9" transform="rotate(8 414 318)"/><text x="254" y="346" fill="${accent}" font-size="68" font-weight="900" font-family="Arial, sans-serif">語</text><text x="374" y="352" fill="${ink}" font-size="58" font-weight="900" font-family="Arial, sans-serif">旅</text>`;
  return `<path d="M172 210h430v248H344L220 552v-94h-48Z" fill="#fff" stroke="${ink}" stroke-width="9" stroke-linejoin="round"/><text x="236" y="350" fill="${accent}" font-size="60" font-weight="900" font-family="Arial, sans-serif">話す</text>`;
}

function quickSvg([id, title, subtitle, kind]) {
  const colors = palette(`quick:${id}`);
  const [ink, accent, paper, hot] = colors;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 960" role="img" aria-label="${esc(title)} quick practice background">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${paper}"/>
      <stop offset=".58" stop-color="#fff"/>
      <stop offset="1" stop-color="${accent}" stop-opacity=".2"/>
    </linearGradient>
    <filter id="lift" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="14" flood-color="${ink}" flood-opacity=".24"/>
    </filter>
  </defs>
  <rect width="1280" height="960" fill="url(#bg)"/>
  <rect x="38" y="34" width="1204" height="876" rx="64" fill="transparent" stroke="${ink}" stroke-width="10" opacity=".9"/>
  <path d="M102 780C260 694 414 740 584 768c238 38 340-134 552-102" fill="none" stroke="${accent}" stroke-width="24" stroke-linecap="round" opacity=".16"/>
  <g transform="translate(0 80)" filter="url(#lift)">${quickMotif(kind, colors)}</g>
  <g filter="url(#lift)">${mascot(780, 574, 1.28, 'duo')}</g>
  <rect x="760" y="118" width="382" height="172" rx="36" fill="#fff" stroke="${ink}" stroke-width="8" opacity=".94"/>
  <text x="804" y="184" fill="${ink}" font-size="42" font-weight="900" font-family="Arial, sans-serif">${esc(title)}</text>
  <text x="804" y="242" fill="${accent}" font-size="30" font-weight="900" font-family="Arial, sans-serif">${esc(subtitle)}</text>
  <circle cx="1122" cy="786" r="54" fill="${hot}" opacity=".86"/>
</svg>`;
}

function write(file, body) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body, 'utf8');
}

let count = 0;
for (const mission of CONTENT.missions.filter((m) => /^C\d+$/.test(m.id) && m.id !== 'C0')) {
  for (const cut of cuts) {
    write(path.join(SESSION_OUT, mission.id, `${cut[0]}.svg`), sessionSvg(mission, cut));
    count++;
  }
}
for (const item of quick) {
  write(path.join(QUICK_OUT, `${item[0]}.svg`), quickSvg(item));
  count++;
}

console.log(`Generated ${count} SVG scene assets.`);
