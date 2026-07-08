// 주제별 어휘 커리큘럼 — 반드시 외워야 할 단어를 그룹별로 관리.
import rawData from './data/thematicVocab.json';

export interface VocabItem {
  id: string;
  ja: string;       // 한자/가타카나 표기
  kana: string;     // 읽기(히라가나/가타카나)
  korean: string;   // 뜻
  tip?: string;     // 추가 설명
  /** 격식 — 인사말처럼 상대에 따라 표현이 달라지는 그룹에서만 사용(친한 사이/정중한 사이 구분). */
  register?: 'casual' | 'formal' | 'both';
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

export const VOCAB_GROUP_ART: Record<string, string> = {
  greetings: 'greetings',
  body: 'vocab-body',
  sports: 'vocab-sports',
  animals: 'vocab-animals',
  plants: 'vocab-plants',
  colors: 'vocab-colors',
  food: 'vocab-food',
  family: 'vocab-family',
  weather: 'vocab-weather',
  adjectives: 'vocab-adjectives',
  places: 'vocab-places',
  transport: 'vocab-transport',
  feelings: 'vocab-feelings',
};

export function vocabGroupArt(groupId: string): string {
  return VOCAB_GROUP_ART[groupId] ?? 'vocab';
}
