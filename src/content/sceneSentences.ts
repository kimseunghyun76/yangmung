// 가챠로 모으는 장면별 문장. 기존 Phrase/SRS와 분리해 수집·복습용으로 사용한다.
import type { CLevel, Register } from './types';
import { toReadingUnits } from '../learn/kanaReading';
import { missions } from './missions';
import { phrases } from './phrases';
import { extraTravelPhrases } from './extraTravelPhrases';

export interface SceneSentence {
  id: string;
  kana: string;
  kanji?: string;
  displayKana?: string;
  romaji: string;
  korean: string;
  register: Register;
  speaker: 'clerk' | 'me';
  level: 1 | 2 | 3 | 4;
  skills: SceneSentenceSkill[];
  tip?: string;
}

export type SceneSentenceSkill = 'read' | 'listen' | 'speak' | 'write';
type Seed = [kana: string, kanji: string, korean: string, speaker: 'clerk' | 'me', level?: 1 | 2 | 3 | 4, tip?: string];
type SentenceScene = Exclude<CLevel, 'C0'>;

const romaji = (kana: string) => {
  const units = toReadingUnits(kana);
  let out = '';
  let geminate = false;
  for (const unit of units) {
    if (unit.text === 'っ' || unit.text === 'ッ') {
      geminate = true;
      continue;
    }
    if (unit.text === 'ー') {
      const vowel = [...out].reverse().find((ch) => 'aeiou'.includes(ch));
      if (vowel) out += vowel;
      continue;
    }
    if (!unit.romaji) continue;
    out += geminate ? `${unit.romaji[0]}${unit.romaji}` : unit.romaji;
    geminate = false;
  }
  return out;
};
const normalizeLevel = (raw: 1 | 2 | 3 | 4 = 1, kana: string): 1 | 2 | 3 | 4 => {
  if (raw >= 3) return 4;
  if (raw === 2 && kana.length >= 16) return 3;
  return raw;
};

const inferSkills = (speaker: 'clerk' | 'me', level: 1 | 2 | 3 | 4): SceneSentenceSkill[] => {
  if (speaker === 'clerk') return level >= 3 ? ['listen', 'read', 'write'] : ['listen', 'read'];
  if (level >= 3) return ['speak', 'listen', 'read', 'write'];
  return level >= 2 ? ['speak', 'listen', 'read'] : ['speak', 'read'];
};

const sentence = (scene: string, n: number, [kana, kanji, korean, speaker, rawLevel = 1, tip]: Seed): SceneSentence => {
  const level = normalizeLevel(rawLevel, kana);
  return {
  id: `ss_${scene.toLowerCase()}_${String(n).padStart(2, '0')}`,
  kana, kanji: kanji === kana ? undefined : kanji, romaji: romaji(kana), korean,
  register: speaker === 'clerk' ? 'receptive' : 'productive', speaker, level, skills: inferSkills(speaker, level), tip,
  };
};

// 미션 대화에서 그 장면 전용 문장을 추출(상대 대사 + 사용자 비복구 답변 + 따라말하기).
// 공통 베이스(COMMON) 제거 — 도감은 각 장면 고유 내용만, 전역 중복 없이 채운다.
const phraseById = new Map([...phrases, ...extraTravelPhrases].map((p) => [p.id, p]));
function missionSeeds(scene: SentenceScene): Seed[] {
  const m = missions.find((x) => x.id === scene);
  if (!m) return [];
  const out: Seed[] = [];
  const add = (id?: string) => {
    if (!id) return;
    const p = phraseById.get(id);
    if (!p) return;
    out.push([p.kana, p.kanji ?? p.kana, p.korean, p.register === 'receptive' ? 'clerk' : 'me', 1]);
  };
  for (const s of m.steps) {
    add(s.promptPhraseId);
    for (const c of s.choices) if (!c.recoveryType) add(c.phraseId);
  }
  for (const id of m.speakPhraseIds ?? []) add(id);
  return out;
}

// ── 예시 문장 시드 — 소스가 아닌 JSON으로 관리 ──────────────────────────
// 장면 전용 문장: data/sceneSeeds.specific.json (우선 채택)
// 보충 문장:     data/sceneSeeds.supplemental.json (20개 미달 시 채움)
// Seed 형식: [kana, kanji, korean, speaker, level?, tip?]
import specificSeeds from './data/sceneSeeds.specific.json';
import supplementalSeeds from './data/sceneSeeds.supplemental.json';

const SPECIFIC = specificSeeds as unknown as Record<SentenceScene, Seed[]>;
const SUPPLEMENTAL = supplementalSeeds as unknown as Partial<Record<SentenceScene, Seed[]>>;

const stableHash = (text: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = Math.imul(state + 0x6d2b79f5, 1);
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// 검증/오디오 생성 대상이 매 실행마다 바뀌지 않도록, 장면별 고정 시드로 섞는다.
const shuffleSeeds = (arr: Seed[], salt: string): Seed[] => {
  const out = [...arr];
  const random = seededRandom(stableHash(salt));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// 전역 중복 없는 장면 전용 도감 — 장면별 최대 20개. C1→C40 순서대로 선점(앞 장면이 공유 문장 차지).
// ※ SPECIFIC·SUPPLEMENTAL 풀은 장면별 고정 시드로 섞어 35~50개 풀에서 20개를 안정적으로 선택한다.
//   missionSeeds는 장면 핵심 표현이라 항상 포함(셔플 제외).
const usedKana = new Set<string>();
const buildScene = (scene: SentenceScene): SceneSentence[] => {
  const out: SceneSentence[] = [];
  const pool: Seed[] = [
    ...shuffleSeeds(SPECIFIC[scene] ?? [], `${scene}:specific`),
    ...missionSeeds(scene),
    ...shuffleSeeds(SUPPLEMENTAL[scene] ?? [], `${scene}:supplemental`),
  ];
  for (const seed of pool) {
    if (usedKana.has(seed[0])) continue;
    usedKana.add(seed[0]);
    out.push(sentence(scene, out.length + 1, seed));
    if (out.length >= 20) break;
  }
  return out;
};

export const SCENE_SENTENCES: Record<CLevel, SceneSentence[]> = {
  C0: [],
  C1: buildScene('C1'), C2: buildScene('C2'), C3: buildScene('C3'), C4: buildScene('C4'),
  C5: buildScene('C5'), C6: buildScene('C6'), C7: buildScene('C7'), C8: buildScene('C8'),
  C9: buildScene('C9'), C10: buildScene('C10'), C11: buildScene('C11'), C12: buildScene('C12'), C13: buildScene('C13'),
  C14: buildScene('C14'), C15: buildScene('C15'), C16: buildScene('C16'), C17: buildScene('C17'),
  C18: buildScene('C18'), C19: buildScene('C19'), C20: buildScene('C20'), C21: buildScene('C21'),
  C22: buildScene('C22'), C23: buildScene('C23'), C24: buildScene('C24'), C25: buildScene('C25'),
  C26: buildScene('C26'), C27: buildScene('C27'), C28: buildScene('C28'), C29: buildScene('C29'), C30: buildScene('C30'),
  C31: buildScene('C31'), C32: buildScene('C32'), C33: buildScene('C33'), C34: buildScene('C34'),
  C35: buildScene('C35'), C36: buildScene('C36'), C37: buildScene('C37'), C38: buildScene('C38'),
  C39: buildScene('C39'), C40: buildScene('C40'),
  C41: buildScene('C41'), C42: buildScene('C42'), C43: buildScene('C43'), C44: buildScene('C44'),
  C45: buildScene('C45'), C46: buildScene('C46'), C47: buildScene('C47'), C48: buildScene('C48'),
  C49: buildScene('C49'), C50: buildScene('C50'),
};
