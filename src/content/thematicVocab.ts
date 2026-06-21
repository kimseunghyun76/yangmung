// 주제별 어휘 커리큘럼 — 반드시 외워야 할 단어를 그룹별로 관리.
import rawData from './data/thematicVocab.json';

export interface VocabItem {
  id: string;
  ja: string;       // 한자/가타카나 표기
  kana: string;     // 읽기(히라가나/가타카나)
  korean: string;   // 뜻
  tip?: string;     // 추가 설명
}

// 그룹 대표 예문 — 단어를 문장 속에서 익히도록 학습 카드로 제공.
export interface VocabExample {
  ja: string;       // 자연 표기(한자+가나)
  kana: string;     // 전체 히라가나 읽기
  korean: string;   // 뜻
}

export interface VocabGroup {
  id: string;
  label: string;    // 한국어 그룹명
  icon: string;     // 이모지
  description: string;
  items: VocabItem[];
  examples?: VocabExample[];
}

const raw = rawData as { groups: VocabGroup[] };
export const VOCAB_GROUPS: VocabGroup[] = raw.groups;
