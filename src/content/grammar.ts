import type { GrammarPoint } from './types';

export const grammar: GrammarPoint[] = [
  {
    id: 'g_masuka',
    label: '〜ますか (정중 의문)',
    tipKo: '문장 끝 ますか는 정중한 질문. 한국어 "~합니까?"처럼 끝만 올리면 됩니다. (반말 질문은 か 없이 억양만)',
    n5Refs: ['n5_g_masu'],
  },
];
