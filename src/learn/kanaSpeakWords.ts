// 가나 말하기 — 낱글자 대신 실제 짧은 단어를 가나 개수(모라 수) 오름차순으로 한 개씩 뽑아
// "1개 → 2개 → 3개…" 점점 길어지는 사다리로 구성한다(2026-07-07, 사용자 요청).
// 무작정 임의 가나를 이어 붙이지 않고, thematicVocab의 실제 단어 풀만 사용.
import { VOCAB_GROUPS } from '../content/thematicVocab';
import { toReadingUnits } from './kanaReading';

export interface SpeakWord {
  id: string;
  kana: string;
  korean: string;
  len: number; // 모라 수(읽기 단위 개수) — 요음(きゃ 등)은 1로, 장음(ー)은 별도 1로 셈
}

// 존재하는 모든 길이(1,2,3...)에서 각각 하나씩 무작위로 뽑아 오름차순으로 배열 —
// 가장 짧은 단어부터 가장 긴 단어까지 점점 길어지는 사다리.
export function buildKanaSpeakLadder(): SpeakWord[] {
  const pool = VOCAB_GROUPS.flatMap((g) => g.items);
  const byLen = new Map<number, typeof pool>();
  for (const it of pool) {
    const len = toReadingUnits(it.kana).length;
    if (len <= 0) continue;
    if (!byLen.has(len)) byLen.set(len, []);
    byLen.get(len)!.push(it);
  }
  const lengths = Array.from(byLen.keys()).sort((a, b) => a - b);
  return lengths.map((len) => {
    const candidates = byLen.get(len)!;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    return { id: pick.id, kana: pick.kana, korean: pick.korean, len };
  });
}
