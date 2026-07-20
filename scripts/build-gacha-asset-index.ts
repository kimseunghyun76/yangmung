// public/gacha/items/generated-v2의 실제 파일명(제목이 base36 char-code로 인코딩된 slug)을 디코딩해
// 정적 인덱스로 저장한다. gachaItems.ts가 이 인덱스로 (title,rarity,motif) 정확매치 실패 시에도
// 항상 실사 이미지로 폴백할 수 있게 한다(제목 변경/등급 재배치로 파일명과 어긋나는 문제 대응).
// 실행: npx tsx scripts/build-gacha-asset-index.ts
import { readdirSync, writeFileSync } from 'node:fs';

const DIR = 'public/gacha/items/generated-v2';
const OUT = 'src/content/data/gachaAssetIndex.json';

interface Entry { file: string; rarity: string; motif: string; title: string }

const files = readdirSync(DIR).filter((f) => f.endsWith('.webp'));
const entries: Entry[] = [];
for (const file of files) {
  const m = file.match(/^([a-z]+)-([a-z]+)-(.+)\.webp$/);
  if (!m) continue;
  const [, rarity, motif, hash] = m;
  const title = hash.split('-').map((h) => String.fromCharCode(parseInt(h, 36))).join('');
  entries.push({ file, rarity, motif, title });
}
entries.sort((a, b) => a.file.localeCompare(b.file));
writeFileSync(OUT, JSON.stringify(entries, null, 1) + '\n');
console.log(`wrote ${OUT} — ${entries.length} decoded image entries`);
