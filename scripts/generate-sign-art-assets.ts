import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { signSceneFor, signs, type Sign, type SignScene } from '../src/content/signs';

const require = createRequire(import.meta.url);
const { chromium } = require('/Users/dennis/kana-master/kana-master/node_modules/playwright');

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, '.asset-tmp', 'sign-art-generated-png');
mkdirSync(outDir, { recursive: true });

const W = 768;
const H = 768;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const classByScene: Record<SignScene, string> = {
  restroom: 'restroom',
  mallEntrance: 'mall',
  stationWayfinding: 'station',
  construction: 'construction',
  transitBoard: 'board',
  shopNotice: 'shop',
  receipt: 'receipt',
  restaurantMenu: 'menu',
  checkout: 'checkout',
  storePromo: 'promo',
};

function splitJa(text: string): string[] {
  const compact = text.replace(/\s+/g, '');
  const max = compact.length >= 11 ? 5 : compact.length >= 8 ? 6 : 7;
  if (compact.length <= max) return [compact];
  const lines: string[] = [];
  let cur = '';
  for (const ch of compact) {
    cur += ch;
    if (cur.length >= max) {
      lines.push(cur);
      cur = '';
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function textSize(text: string): number {
  const len = text.replace(/\s+/g, '').length;
  if (len <= 1) return 158;
  if (len <= 2) return 122;
  if (len <= 4) return 88;
  if (len <= 6) return 68;
  if (len <= 9) return 54;
  return 44;
}

function noteFor(sign: Sign, scene: SignScene): string {
  if (scene === 'construction' && sign.id === 'setsubi') return '通行制限のお知らせ';
  if (scene === 'construction') return 'ご注意ください';
  if (scene === 'transitBoard') return sign.id === 'go_annai' ? 'ご案内' : '運行情報';
  if (scene === 'receipt') return 'レシート';
  if (scene === 'restaurantMenu') return 'お品書き';
  if (scene === 'checkout') return 'お会計';
  if (scene === 'shopNotice') return 'お知らせ';
  if (scene === 'restroom') return '化粧室';
  if (scene === 'stationWayfinding') return '駅構内案内';
  if (scene === 'mallEntrance') return sign.id === 'osu' || sign.id === 'hiku' ? 'ドア表示' : '館内案内';
  return '本日の案内';
}

function signIcon(sign: Sign, scene: SignScene): string {
  if (scene === 'restroom') {
    if (['men_toilet', 'danshi'].includes(sign.id)) return '<div class="person male"></div>';
    if (['women_toilet', 'josei'].includes(sign.id)) return '<div class="person female"></div>';
    return '<div class="person male small"></div><div class="person female small"></div>';
  }
  if (scene === 'stationWayfinding') return '<div class="arrow"></div>';
  if (scene === 'construction') return '<div class="warn-mark">!</div>';
  if (scene === 'checkout') return '<div class="pay-wave"></div>';
  if (scene === 'receipt') return '<div class="receipt-lines"></div>';
  if (scene === 'restaurantMenu') return '<div class="bowl"></div>';
  return '';
}

function sceneExtras(scene: SignScene): string {
  if (scene === 'restroom') {
    return '<div class="tile-grid"></div><div class="door left-door"></div><div class="door right-door"></div><div class="floor-reflect"></div>';
  }
  if (scene === 'mallEntrance') {
    return '<div class="glass-door"></div><div class="store-awning"></div><div class="floor-reflect"></div>';
  }
  if (scene === 'stationWayfinding') {
    return '<div class="platform-line"></div><div class="rail rail-a"></div><div class="rail rail-b"></div><div class="ceiling-lights"></div>';
  }
  if (scene === 'construction') {
    return '<div class="barrier"></div><div class="cone cone-a"></div><div class="cone cone-b"></div><div class="tape tape-a"></div><div class="tape tape-b"></div>';
  }
  if (scene === 'transitBoard') {
    return '<div class="terminal-window"></div><div class="departures"></div><div class="floor-reflect"></div>';
  }
  if (scene === 'shopNotice') {
    return '<div class="shop-door"></div><div class="hanging-chain"></div><div class="shop-counter"></div>';
  }
  if (scene === 'receipt') {
    return '<div class="countertop"></div><div class="register"></div><div class="coins"></div>';
  }
  if (scene === 'restaurantMenu') {
    return '<div class="restaurant-wall"></div><div class="table"></div><div class="steam steam-a"></div><div class="steam steam-b"></div>';
  }
  if (scene === 'checkout') {
    return '<div class="checkout-counter"></div><div class="card-reader"></div><div class="shopping-bag"></div>';
  }
  return '<div class="shop-window"></div><div class="display-shelf"></div><div class="sparkles"></div>';
}

function signFrame(sign: Sign, scene: SignScene): string {
  const lines = splitJa(sign.ja);
  const size = textSize(sign.ja);
  const note = noteFor(sign, scene);
  return `
    <div class="real-sign ${classByScene[scene]}-sign">
      <div class="sign-note">${esc(note)}</div>
      <div class="sign-icon">${signIcon(sign, scene)}</div>
      <div class="sign-text" style="font-size:${size}px">
        ${lines.map((line) => `<span>${esc(line)}</span>`).join('')}
      </div>
    </div>`;
}

function mascot(kind: 'yang' | 'mung', mood: 'point' | 'work' | 'read' | 'hold' | 'pay', side: 'left' | 'right'): string {
  return `
    <div class="mascot ${kind} ${mood} ${side}">
      <div class="ear ear-l"></div>
      <div class="ear ear-r"></div>
      <div class="head">
        <div class="eye eye-l"></div>
        <div class="eye eye-r"></div>
        <div class="snout"><div class="nose"></div></div>
        <div class="cheek cheek-l"></div>
        <div class="cheek cheek-r"></div>
      </div>
      <div class="body"></div>
      <div class="arm arm-l"></div>
      <div class="arm arm-r"></div>
      <div class="leg leg-l"></div>
      <div class="leg leg-r"></div>
      <div class="prop"></div>
    </div>`;
}

function mascotSet(scene: SignScene): string {
  if (scene === 'construction') return mascot('yang', 'work', 'left') + mascot('mung', 'point', 'right');
  if (scene === 'receipt' || scene === 'checkout') return mascot('yang', 'pay', 'left') + mascot('mung', 'hold', 'right');
  if (scene === 'restaurantMenu') return mascot('yang', 'read', 'left') + mascot('mung', 'hold', 'right');
  if (scene === 'transitBoard' || scene === 'stationWayfinding') return mascot('yang', 'point', 'left') + mascot('mung', 'read', 'right');
  if (scene === 'shopNotice' || scene === 'storePromo') return mascot('yang', 'hold', 'left') + mascot('mung', 'point', 'right');
  return mascot('yang', 'point', 'left') + mascot('mung', 'read', 'right');
}

function htmlFor(sign: Sign): string {
  const scene = signSceneFor(sign);
  const cls = classByScene[scene];
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #f3eadb; width: ${W}px; height: ${H}px; overflow: hidden; }
  .art {
    position: relative;
    width: ${W}px;
    height: ${H}px;
    overflow: hidden;
    background:
      radial-gradient(circle at 23% 16%, rgba(255,255,255,.88), transparent 24%),
      radial-gradient(circle at 76% 18%, rgba(255,255,255,.44), transparent 20%),
      linear-gradient(155deg, var(--sky1), var(--sky2) 52%, var(--floor) 53%, var(--floor2));
    font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic", sans-serif;
    color: #2b2118;
  }
  .art::before {
    content: "";
    position: absolute;
    inset: 28px;
    border-radius: 58px;
    background: linear-gradient(145deg, rgba(255,255,255,.36), rgba(255,255,255,.06));
    border: 4px solid rgba(65,43,25,.13);
    box-shadow: inset 0 0 0 2px rgba(255,255,255,.34);
  }
  .art::after {
    content: "";
    position: absolute;
    left: 76px;
    right: 76px;
    bottom: 93px;
    height: 52px;
    border-radius: 999px;
    background: rgba(56,37,22,.12);
    filter: blur(2px);
  }
  .mall { --sky1:#ffe9bd; --sky2:#f3c783; --floor:#f7e1ba; --floor2:#e5bd82; }
  .restroom { --sky1:#dff3f5; --sky2:#acd2dc; --floor:#e8d8bd; --floor2:#cfae83; }
  .station { --sky1:#cfece4; --sky2:#8fc6c5; --floor:#d8c7a2; --floor2:#b99266; }
  .construction { --sky1:#ffe5a6; --sky2:#f4bd58; --floor:#dbb070; --floor2:#b88244; }
  .board { --sky1:#d6ecea; --sky2:#8fbfbd; --floor:#d6c098; --floor2:#a77b52; }
  .shop { --sky1:#ffead1; --sky2:#dcae76; --floor:#eed1a5; --floor2:#c49663; }
  .receipt { --sky1:#f2ead9; --sky2:#d6c5a6; --floor:#d6b88c; --floor2:#a67a4c; }
  .menu { --sky1:#ffe0c8; --sky2:#df9b6d; --floor:#dfb986; --floor2:#a96c43; }
  .checkout { --sky1:#dff0e5; --sky2:#a9cfb9; --floor:#dbc28f; --floor2:#ad8150; }
  .promo { --sky1:#ffe2dd; --sky2:#dc9b8c; --floor:#eac598; --floor2:#b78452; }

  .tile-grid, .restaurant-wall, .shop-window, .terminal-window {
    position:absolute; left:76px; right:76px; top:82px; height:368px; border-radius:38px;
    background:
      linear-gradient(90deg, rgba(255,255,255,.24) 1px, transparent 1px) 0 0/74px 74px,
      linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px) 0 0/74px 74px,
      rgba(255,255,255,.12);
    border: 4px solid rgba(62,43,26,.13);
  }
  .door, .glass-door, .shop-door {
    position:absolute; top:150px; bottom:160px; border-radius:28px;
    background: linear-gradient(145deg, rgba(255,255,255,.48), rgba(168,209,216,.34));
    border: 5px solid rgba(52,40,31,.2);
  }
  .left-door { left:106px; width:196px; }
  .right-door { right:106px; width:196px; }
  .glass-door { left:106px; right:106px; top:126px; bottom:150px; }
  .store-awning {
    position:absolute; left:92px; right:92px; top:92px; height:78px; border-radius:30px 30px 16px 16px;
    background: repeating-linear-gradient(90deg, #c74e43 0 64px, #fff0d4 64px 128px);
    border: 5px solid rgba(62,36,22,.22);
  }
  .floor-reflect { position:absolute; left:118px; right:118px; bottom:128px; height:92px; border-radius:50%; background:rgba(255,255,255,.22); }
  .platform-line { position:absolute; left:72px; right:72px; bottom:186px; height:26px; border-radius:99px; background:#f4d14d; box-shadow:0 18px 0 rgba(45,38,30,.16); }
  .rail { position:absolute; left:96px; right:96px; height:8px; bottom:124px; border-radius:99px; background:rgba(47,39,34,.35); }
  .rail-b { bottom:92px; }
  .ceiling-lights { position:absolute; left:118px; right:118px; top:82px; height:20px; border-radius:99px; background:linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent); }
  .barrier { position:absolute; left:80px; right:80px; bottom:198px; height:82px; border-radius:24px; background:repeating-linear-gradient(135deg,#f3c236 0 34px,#29231d 34px 68px); border:5px solid rgba(40,31,25,.3); }
  .cone { position:absolute; bottom:120px; width:78px; height:130px; clip-path:polygon(50% 0, 84% 74%, 100% 100%, 0 100%, 16% 74%); background:linear-gradient(#f05b38 0 42%,#fff4df 42% 55%,#f05b38 55%); filter:drop-shadow(0 12px 8px rgba(45,27,14,.2)); }
  .cone-a { left:96px; } .cone-b { right:98px; transform:scale(.86); }
  .tape { position:absolute; height:22px; background:repeating-linear-gradient(135deg,#f5d23d 0 24px,#2a241f 24px 48px); border-radius:99px; opacity:.9; }
  .tape-a { left:90px; right:92px; top:118px; transform:rotate(-5deg); }
  .tape-b { left:124px; right:124px; top:188px; transform:rotate(4deg); }
  .departures { position:absolute; left:112px; right:112px; top:122px; height:238px; border-radius:28px; background:#121b20; box-shadow:0 14px 24px rgba(24,20,17,.24); }
  .departures::before { content:"09:42  10:05  10:18"; position:absolute; left:30px; right:30px; bottom:26px; font:800 25px Menlo, monospace; color:rgba(134,255,213,.55); letter-spacing:2px; }
  .shop-door { left:136px; right:136px; top:112px; bottom:132px; background:linear-gradient(140deg,#8cb7b5,#e9d2a0); }
  .hanging-chain { position:absolute; left:50%; top:116px; width:128px; height:96px; transform:translateX(-50%); border-left:6px solid rgba(78,50,27,.42); border-right:6px solid rgba(78,50,27,.42); }
  .shop-counter, .countertop, .table, .checkout-counter, .display-shelf {
    position:absolute; left:72px; right:72px; bottom:112px; height:116px; border-radius:38px 38px 24px 24px;
    background:linear-gradient(#ba7743,#7d4c2e); border:5px solid rgba(55,35,23,.2);
  }
  .register { position:absolute; right:92px; bottom:204px; width:170px; height:112px; border-radius:26px; background:#57666d; box-shadow:0 12px 18px rgba(34,25,18,.2); }
  .coins { position:absolute; left:154px; bottom:218px; width:132px; height:36px; border-radius:50%; background:radial-gradient(circle at 30% 50%,#e7c45b 0 18px,transparent 19px), radial-gradient(circle at 64% 44%,#d6ad4b 0 16px,transparent 17px); }
  .steam { position:absolute; top:106px; width:18px; height:92px; border-radius:99px; border-left:8px solid rgba(255,255,255,.34); }
  .steam-a { left:176px; } .steam-b { right:178px; transform:scale(.85); }
  .card-reader { position:absolute; right:110px; bottom:220px; width:172px; height:114px; border-radius:24px; background:#35424a; transform:rotate(-4deg); box-shadow:0 16px 24px rgba(32,24,17,.22); }
  .card-reader::after { content:""; position:absolute; left:26px; right:26px; top:26px; height:36px; border-radius:12px; background:#dff4e5; }
  .shopping-bag { position:absolute; left:116px; bottom:196px; width:126px; height:134px; border-radius:24px 24px 30px 30px; background:#f6e1b8; border:5px solid rgba(67,43,25,.22); }
  .shop-window { top:116px; height:300px; background:linear-gradient(135deg,rgba(255,255,255,.38),rgba(255,255,255,.1)); }
  .sparkles::before, .sparkles::after { content:""; position:absolute; width:34px; height:34px; background:#ffe285; clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%); }
  .sparkles::before { right:116px; top:142px; } .sparkles::after { left:130px; top:208px; transform:scale(.7); }

  .real-sign {
    position:absolute; left:50%; top:48%; transform:translate(-50%,-50%);
    width:430px; min-height:286px; padding:28px 32px 24px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    border-radius:34px; z-index:4; text-align:center;
    box-shadow:0 24px 38px rgba(48,30,18,.28), inset 0 0 0 2px rgba(255,255,255,.34);
  }
  .restroom-sign { top:44%; width:392px; min-height:344px; background:linear-gradient(145deg,#1c5262,#123441); border:12px solid #f9fbf4; color:#fffaf0; }
  .mall-sign { top:47%; background:linear-gradient(145deg,#fff4cf,#e8c27f); border:12px solid #79512e; color:#382719; }
  .station-sign { top:38%; width:508px; min-height:236px; background:linear-gradient(145deg,#143f4b,#0d2a34); border:10px solid #f7fff5; color:#f7fff5; }
  .construction-sign { top:39%; width:438px; min-height:272px; background:linear-gradient(145deg,#fff0b7,#ffd23b); border:13px solid #28231f; color:#28231f; }
  .board-sign { top:37%; width:514px; min-height:252px; background:linear-gradient(145deg,#101820,#18242b); border:10px solid #4e6a72; color:#90ffd9; font-family:Menlo, Consolas, monospace; }
  .shop-sign { top:43%; width:384px; min-height:304px; background:linear-gradient(145deg,#fff8df,#e7c68a); border:11px solid #72492a; color:#64271d; }
  .receipt-sign { top:42%; width:338px; min-height:398px; background:#fffdf4; border:0; border-radius:18px; color:#27231d; clip-path:polygon(0 0,8% 4%,16% 0,24% 4%,32% 0,40% 4%,48% 0,56% 4%,64% 0,72% 4%,80% 0,88% 4%,100% 0,100% 100%,0 100%); }
  .menu-sign { top:41%; width:444px; min-height:372px; background:linear-gradient(145deg,#fae2ad,#e9bf73); border:14px solid #3b2a20; color:#221911; }
  .checkout-sign { top:41%; width:378px; min-height:286px; background:linear-gradient(145deg,#ecf7e7,#b9d9c6); border:11px solid #2e4d47; color:#124d3c; }
  .promo-sign { top:42%; width:418px; min-height:304px; background:linear-gradient(145deg,#fff7dc,#ffd38d); border:12px solid #c53c37; color:#292019; }
  .sign-note { font-size:24px; font-weight:950; opacity:.74; letter-spacing:1px; margin-bottom:10px; }
  .sign-text { font-weight:1000; line-height:.96; letter-spacing:0; text-shadow:0 2px 0 rgba(255,255,255,.28); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; }
  .board-sign .sign-text, .station-sign .sign-text, .restroom-sign .sign-text { text-shadow:0 3px 0 rgba(0,0,0,.35); }
  .sign-icon { position:relative; height:64px; min-width:68px; margin-bottom:10px; }
  .arrow { position:absolute; left:8px; top:14px; width:80px; height:22px; background:#2ab36c; border-radius:99px; }
  .arrow::after { content:""; position:absolute; right:-24px; top:-13px; border-left:34px solid #2ab36c; border-top:24px solid transparent; border-bottom:24px solid transparent; }
  .warn-mark { width:66px; height:60px; margin:auto; border-radius:18px; background:#d94032; color:#fff; font-size:54px; line-height:60px; font-weight:1000; }
  .person { position:absolute; left:50%; top:0; transform:translateX(-50%); width:46px; height:76px; }
  .person::before { content:""; position:absolute; left:13px; top:0; width:20px; height:20px; border-radius:50%; background:#fff; }
  .person::after { content:""; position:absolute; left:5px; top:26px; width:36px; height:50px; border-radius:10px 10px 6px 6px; background:#fff; }
  .person.female::after { clip-path:polygon(50% 0,100% 100%,0 100%); border-radius:0; }
  .person.small { transform:translateX(-88%); }
  .person.female.small { transform:translateX(22%); }
  .pay-wave { width:76px; height:52px; margin:auto; border-radius:16px; border:8px solid currentColor; position:relative; opacity:.78; }
  .pay-wave::after { content:""; position:absolute; right:-38px; top:0; width:26px; height:44px; border-right:7px solid currentColor; border-radius:50%; }
  .receipt-lines { width:100px; height:52px; margin:auto; background:repeating-linear-gradient(#a49a88 0 7px, transparent 7px 16px); opacity:.5; }
  .bowl { width:94px; height:48px; margin:6px auto 0; border-radius:0 0 50px 50px; background:#7c321e; position:relative; }
  .bowl::before { content:""; position:absolute; left:-9px; right:-9px; top:-15px; height:28px; border-radius:50%; background:#fff6d9; border:6px solid #7c321e; }

  .mascot { position:absolute; width:154px; height:210px; z-index:5; bottom:118px; filter:drop-shadow(0 12px 10px rgba(52,31,17,.18)); }
  .mascot.left { left:86px; } .mascot.right { right:78px; transform:scaleX(-1); }
  .head { position:absolute; left:20px; top:16px; width:116px; height:100px; border-radius:54% 54% 48% 48%; background:var(--fur); border:4px solid rgba(70,45,28,.15); }
  .yang { --fur:#dba653; --ear:#7d5531; --body:#f2c86a; }
  .mung { --fur:#f1e6d3; --ear:#f2c0ca; --body:#7fbf9e; }
  .ear { position:absolute; top:14px; width:42px; height:58px; background:var(--ear); z-index:-1; }
  .yang .ear { border-radius:60% 60% 70% 70%; }
  .mung .ear { clip-path:polygon(50% 0,100% 100%,0 100%); background:var(--fur); }
  .ear-l { left:10px; transform:rotate(-24deg); } .ear-r { right:10px; transform:rotate(24deg); }
  .eye { position:absolute; top:40px; width:9px; height:12px; border-radius:50%; background:#37251a; }
  .eye-l { left:34px; } .eye-r { right:34px; }
  .snout { position:absolute; left:41px; top:55px; width:34px; height:25px; border-radius:50%; background:rgba(255,246,224,.82); }
  .nose { position:absolute; left:13px; top:7px; width:9px; height:7px; border-radius:50%; background:#3b2a20; }
  .cheek { position:absolute; top:58px; width:14px; height:9px; border-radius:50%; background:#ee9e9e; opacity:.55; }
  .cheek-l { left:22px; } .cheek-r { right:22px; }
  .body { position:absolute; left:35px; top:108px; width:86px; height:86px; border-radius:34px 34px 42px 42px; background:var(--body); border:4px solid rgba(70,45,28,.14); }
  .arm { position:absolute; top:124px; width:26px; height:74px; border-radius:99px; background:var(--fur); transform-origin:50% 10%; }
  .arm-l { left:30px; transform:rotate(26deg); } .arm-r { right:30px; transform:rotate(-56deg); }
  .leg { position:absolute; bottom:0; width:34px; height:34px; border-radius:50%; background:var(--fur); }
  .leg-l { left:45px; } .leg-r { right:45px; }
  .point .arm-r { transform:rotate(-118deg); top:106px; height:92px; }
  .work .head::after { content:""; position:absolute; left:12px; right:12px; top:-18px; height:32px; border-radius:24px 24px 10px 10px; background:#f2c43d; border:4px solid rgba(65,43,23,.22); }
  .read .prop { position:absolute; left:28px; top:146px; width:98px; height:48px; border-radius:10px; background:#fff8d9; border:4px solid rgba(67,43,24,.22); }
  .hold .prop { position:absolute; left:22px; top:136px; width:112px; height:70px; border-radius:16px; background:#f5d897; border:4px solid rgba(67,43,24,.22); }
  .pay .prop { position:absolute; right:10px; top:132px; width:70px; height:44px; border-radius:12px; background:#4d8ecb; border:4px solid rgba(67,43,24,.16); transform:rotate(-12deg); }
</style>
</head>
<body>
  <main class="art ${cls}" aria-label="${esc(sign.korean)}">
    ${sceneExtras(scene)}
    ${signFrame(sign, scene)}
    ${mascotSet(scene)}
  </main>
</body>
</html>`;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

for (const sign of signs) {
  await page.setContent(htmlFor(sign), { waitUntil: 'load' });
  await page.screenshot({ path: join(outDir, `${sign.id}.png`), clip: { x: 0, y: 0, width: W, height: H } });
}

await browser.close();

console.log(`generated ${signs.length} complete sign PNG assets in ${outDir}`);
