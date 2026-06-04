import { SCENE_SENTENCES } from './sceneSentences';
import type { CLevel } from './types';

const scenes: CLevel[] = Array.from({ length: 31 }, (_, i) => `C${i}` as CLevel);
const kanaOnly = /^[\u3040-\u309f\u30a0-\u30ffー]+$/u;
const idPattern = /^ss_c(?:[1-9]|[12][0-9]|30)_\d{2}$/;
const ids = new Set<string>();
const errors: string[] = [];
const warnings: string[] = [];

for (const scene of scenes) {
  const rows = SCENE_SENTENCES[scene];
  const sceneNo = Number(scene.slice(1));
  const expected = sceneNo >= 1 && sceneNo <= 13 ? 30 : sceneNo >= 14 && sceneNo <= 30 ? 26 : 0;
  if (rows.length !== expected) errors.push(`${scene}: expected ${expected}, got ${rows.length}`);

  const speakers = { clerk: 0, me: 0 };
  const tiers = { 1: 0, 2: 0, 3: 0 };
  const kanaInScene = new Set<string>();

  for (const row of rows) {
    if (!idPattern.test(row.id)) errors.push(`${row.id}: invalid id`);
    if (ids.has(row.id)) errors.push(`${row.id}: duplicate id`);
    ids.add(row.id);
    if (!kanaOnly.test(row.kana)) errors.push(`${row.id}: kana contains unsupported characters: ${row.kana}`);
    if (kanaInScene.has(row.kana)) errors.push(`${row.id}: duplicate kana in ${scene}: ${row.kana}`);
    kanaInScene.add(row.kana);
    if (!row.romaji.trim()) errors.push(`${row.id}: romaji is empty`);
    if (!row.korean.trim()) errors.push(`${row.id}: korean is empty`);
    if (row.speaker === 'clerk' && row.register === 'productive') errors.push(`${row.id}: clerk cannot be productive`);
    if (row.speaker === 'me' && row.register === 'receptive') errors.push(`${row.id}: me cannot be receptive`);
    speakers[row.speaker]++;
    tiers[row.tier ?? 1]++;
    if ((row.tip?.length ?? 0) > 40) warnings.push(`${row.id}: tip exceeds 40 characters`);
  }

  if (expected > 0) {
    if (speakers.clerk < 8 || speakers.me < 16) warnings.push(`${scene}: speaker balance clerk/me=${speakers.clerk}/${speakers.me}`);
    if (tiers[1] < 12 || tiers[2] < 8 || tiers[3] < 4) warnings.push(`${scene}: tier balance=${tiers[1]}/${tiers[2]}/${tiers[3]}`);
  }
}

console.log(`scene sentences: ${ids.size} items, ${errors.length} errors, ${warnings.length} warnings`);
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
if (errors.length) process.exit(1);
