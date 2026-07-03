// 보물 개봉식(랩) 가챠가 기대하는 아이템 이미지 목록을 생성한다.
// 랩 가챠는 아이템 이미지를 /gacha/items/generated-v2/<slug>.webp 로 자동 해석하므로,
// 이미지 담당자는 이 매니페스트의 image 경로 그대로 파일을 만들면 자동 반영된다.
// 실행: npx tsx scripts/gacha-lab-manifest.ts
import { writeFileSync } from 'node:fs';
import { CONTENT } from '../src/content';
import { gachaLabItemForPlace } from '../src/learn/gachaItems';
import type { Rarity } from '../src/learn/collection';

const RARITIES: Rarity[] = ['basic', 'bronze', 'silver', 'gold', 'diamond'];
const RARITY_KO: Record<Rarity, string> = { basic: '커먼', bronze: '레어', silver: '에픽', gold: 'SSR', diamond: 'UR' };

const places = [...new Set(
  CONTENT.missions.filter((m) => m.id !== 'C0').map((m) => (m.place ?? m.scenario ?? m.id) as string),
)];

const byPath = new Map<string, { image: string; rarity: Rarity; rarityKo: string; ja: string; ko: string; motif: string; places: Set<string> }>();
for (const place of places) {
  for (const rarity of RARITIES) {
    const a = gachaLabItemForPlace(place, rarity);
    if (!a.image) continue;
    const e = byPath.get(a.image) ?? { image: a.image, rarity, rarityKo: RARITY_KO[rarity], ja: a.jaTitle ?? a.title, ko: a.title, motif: a.motif, places: new Set<string>() };
    e.places.add(place);
    byPath.set(a.image, e);
  }
}

const items = [...byPath.values()]
  .map((e) => ({ image: e.image, rarity: e.rarity, rarityKo: e.rarityKo, ja: e.ja, ko: e.ko, motif: e.motif, places: [...e.places].sort() }))
  .sort((a, b) => a.image.localeCompare(b.image));

writeFileSync('docs/gacha-lab-assets.json', JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), count: items.length, note: 'image 경로 그대로 투명 WebP 생성 -> 랩 가챠/도감에 자동 반영', items }, null, 2) + '\n');
console.log(`wrote docs/gacha-lab-assets.json — ${items.length} unique lab item images`);
