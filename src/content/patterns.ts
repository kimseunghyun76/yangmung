// 문형(패턴) 그룹 — 이미 존재하는 표현들을 "같은 틀, 다른 단어"로 묶어서 보여주기 위한 매핑.
// Phrase 스키마·기존 콘텐츠는 건드리지 않고 id만 참조한다(신규 문장 제작 없음).
// 학습 전문가 감사(learning-expert-audit.md §4-A)·교차 검토(expert-cross-review.md §4-1) 후속 —
// 절충안(예시 중심 설명 + 처음 노출 시에만 배지 강조 + 선택적 문법 상세)을 따른다.
export interface PatternGroup {
  id: string;
  label: string;      // 한국어로 된 문형 의도, 예: "위치를 물을 때"
  structure: string;   // 일본어 틀
  grammarRef?: string; // 관련 grammar.ts 항목 id(있으면 "문법 자세히"에서 재사용)
  phraseIds: string[]; // 이 틀을 쓰는 기존 표현 id들
}

export const PATTERNS: PatternGroup[] = [
  {
    id: 'pt_wa_doko_desu_ka',
    label: '위치를 물을 때',
    structure: '〜はどこですか',
    grammarRef: 'g_masuka',
    phraseIds: [
      'p_doko_desu_ka',
      'p_shinjuku_doko',
      'p_eki_wa_doko',
      'p_kaisatsu_doko',
      'p_koinrokkaa',
      'p_kenbaiki',
      'p_toire_doko',
      'p_heya_doko',
      'p_sumimasen_koko_doko',
    ],
  },
];

export function patternForPhrase(phraseId: string): PatternGroup | undefined {
  return PATTERNS.find((p) => p.phraseIds.includes(phraseId));
}
