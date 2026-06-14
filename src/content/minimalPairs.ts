// 최소 페어(발음 변별) 콘텐츠 — LEARNING_METHODS_PLAN §2.
// 데이터는 소스가 아닌 data/minimalPairs.json에서 관리한다.
import minimalPairsJson from './data/minimalPairs.json';

export interface MinimalPairSide {
  kana: string;   // 순수 읽기 (가나+ー+っ/ッ+요음)
  korean: string; // 뜻 또는 소리 설명
}

export interface MinimalPair {
  id: string;
  a: MinimalPairSide;
  b: MinimalPairSide;
  /** 무엇이 다른지 10초 설명 (정답 후 노출) */
  focus: string;
}

export const minimalPairs: MinimalPair[] = minimalPairsJson as MinimalPair[];
