// 주제별 어휘 커리큘럼 — 반드시 외워야 할 단어를 그룹별로 관리.
import rawData from './data/thematicVocab.json';

export interface VocabItem {
  id: string;
  ja: string;       // 한자/가타카나 표기
  kana: string;     // 읽기(히라가나/가타카나)
  korean: string;   // 뜻
  tip?: string;     // 추가 설명
}

export interface VocabGroup {
  id: string;
  label: string;    // 한국어 그룹명
  icon: string;     // 이모지
  description: string;
  items: VocabItem[];
}

const raw = rawData as { groups: VocabGroup[] };
export const VOCAB_GROUPS: VocabGroup[] = raw.groups;
export const VOCAB_GROUP_MAP: Map<string, VocabGroup> = new Map(VOCAB_GROUPS.map((g) => [g.id, g]));
export const ALL_VOCAB_ITEMS: VocabItem[] = VOCAB_GROUPS.flatMap((g) => g.items);
