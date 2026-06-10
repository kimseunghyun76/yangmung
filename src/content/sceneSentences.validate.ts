import { SCENE_SENTENCES } from './sceneSentences';
import type { CLevel } from './types';

const scenes: CLevel[] = Array.from({ length: 41 }, (_, i) => `C${i}` as CLevel);
const kanaOnly = /^[\u3040-\u309f\u30a0-\u30ffー]+$/u;
const idPattern = /^ss_c(?:[1-9]|[1-3][0-9]|40)_\d{2}$/;
const ids = new Set<string>();
const allKana = new Map<string, string>(); // 전역 kana → 최초 등장 장면 (장면 간 중복 금지)
const errors: string[] = [];
const warnings: string[] = [];
const validSkills = new Set(['read', 'listen', 'speak', 'write']);

for (const scene of scenes) {
  const rows = SCENE_SENTENCES[scene];
  const sceneNo = Number(scene.slice(1));
  // 정책: C1~C40 장면당 정확히 20개.
  if (sceneNo >= 1 && sceneNo <= 40 && rows.length !== 20) errors.push(`${scene}: ${rows.length}개 — 정확히 20개 필요`);

  const speakers = { clerk: 0, me: 0 };
  const levels = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const skills = { read: 0, listen: 0, speak: 0, write: 0 };
  const kanaInScene = new Set<string>();

  for (const row of rows) {
    if (!idPattern.test(row.id)) errors.push(`${row.id}: invalid id`);
    if (ids.has(row.id)) errors.push(`${row.id}: duplicate id`);
    ids.add(row.id);
    if (!kanaOnly.test(row.kana)) errors.push(`${row.id}: kana contains unsupported characters: ${row.kana}`);
    if (kanaInScene.has(row.kana)) errors.push(`${row.id}: duplicate kana in ${scene}: ${row.kana}`);
    kanaInScene.add(row.kana);
    const prevScene = allKana.get(row.kana);
    if (prevScene && prevScene !== scene) errors.push(`${row.id}: 장면 간 중복 (${scene} ↔ ${prevScene}): ${row.kana}`);
    else allKana.set(row.kana, scene);
    if (!row.romaji.trim()) errors.push(`${row.id}: romaji is empty`);
    if (!row.korean.trim()) errors.push(`${row.id}: korean is empty`);
    if (row.speaker === 'clerk' && row.register === 'productive') errors.push(`${row.id}: clerk cannot be productive`);
    if (row.speaker === 'me' && row.register === 'receptive') errors.push(`${row.id}: me cannot be receptive`);
    if (![1, 2, 3, 4].includes(row.level)) errors.push(`${row.id}: level must be 1-4`);
    if ('tier' in row) errors.push(`${row.id}: tier is deprecated; use level`);
    if (!Array.isArray(row.skills) || row.skills.length === 0) {
      errors.push(`${row.id}: skills must not be empty`);
    } else {
      for (const skill of row.skills) {
        if (!validSkills.has(skill)) errors.push(`${row.id}: invalid skill ${skill}`);
        else skills[skill as keyof typeof skills]++;
      }
    }
    speakers[row.speaker]++;
    if ([1, 2, 3, 4].includes(row.level)) levels[row.level]++;
    if ((row.tip?.length ?? 0) > 40) warnings.push(`${row.id}: tip exceeds 40 characters`);
  }

  void speakers; void levels; void skills; // 균형 경고는 현재 비활성
}

console.log(`scene sentences: ${ids.size} items, ${errors.length} errors, ${warnings.length} warnings`);
for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
if (errors.length) process.exit(1);
