import type { N5Entry } from './types';

// JLPT 공식 목록 비공개 -> source 항상 'unofficial' (비공식 교재 기반).
// 한자 id는 의미 slug 중심 (n5_k_person), 충돌 시 suffix.
export const n5: N5Entry[] = [
  { id: 'n5_v_daijoubu', type: 'vocab',   value: '大丈夫', source: 'unofficial' },
  { id: 'n5_g_masu',     type: 'grammar', value: 'ます',   source: 'unofficial' },
  { id: 'n5_k_person',   type: 'kanji',   value: '人',     source: 'unofficial' },
];
