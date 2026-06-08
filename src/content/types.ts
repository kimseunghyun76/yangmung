// yangmung 콘텐츠 타입 — CONTENT_SCHEMA.md(SSOT) §1~8 그대로.

export type KLevel =
  | 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6' | 'K7' | 'K8' | 'K9' | 'K10'
  | 'K11' | 'K12' | 'K13' | 'K14' | 'K15' | 'K16' | 'K17' | 'K18' | 'K19' | 'K20'
  | 'K21' | 'K22' | 'K23' | 'K24' | 'K25' | 'K26' | 'K27' | 'K28' | 'K29' | 'K30'
  | 'K31' | 'K32';
export type BLevel = 'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5';
export type CLevel =
  | 'C0' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9'
  | 'C10' | 'C11' | 'C12' | 'C13' | 'C14' | 'C15' | 'C16' | 'C17' | 'C18' | 'C19'
  | 'C20' | 'C21' | 'C22' | 'C23' | 'C24' | 'C25' | 'C26' | 'C27' | 'C28' | 'C29' | 'C30'
  | 'C31' | 'C32' | 'C33' | 'C34' | 'C35' | 'C36' | 'C37' | 'C38' | 'C39' | 'C40'; // C0 = 튜토리얼 미니미션

export type EvalMode =
  | 'drill' | 'match' | 'cloze' | 'reaction' | 'action' | 'recovery' | 'branch';

export type RecoveryType = 'repeat' | 'slow' | 'simplify' | 'fallback';

// receptive: 이해만 / productive: 생산 / both: 양방향 핵심어 (はい·ありがとう 등)
export type Register = 'receptive' | 'productive' | 'both';

export type KanaKind =
  | 'sei' | 'daku' | 'handaku' | 'yoon' | 'extended' | 'special';

export interface KanaItem {
  id: string;
  char: string;
  script: 'hiragana' | 'katakana' | 'common'; // ー='common', っ='hiragana', ッ='katakana'
  kind: KanaKind;
  romaji: string;
  koreanSound: string;
  level: KLevel;
  group: string;
  components?: string[];
  confusables?: string[];
  examples?: string[]; // 경량 원시 문자열 (Phrase 참조 아님)
  n5Refs?: string[];
}

export interface Phrase {
  id: string;
  kana: string;          // 순수 읽기 (가나+ー+っ/ッ+요음). 문장부호·한자 불가
  kanji?: string;
  displayKana?: string;  // 선택. 가나 + 허용 문장부호
  romaji?: string;
  korean: string;
  english?: string;
  tip?: string;
  pos?: string;
  register: Register;
  grammarRefs?: string[];
  n5Refs?: string[];
  recoveryType?: RecoveryType;
  audioId?: string;      // 지금은 비움 (오디오 후행)
  speechPhoneme?: string;// Azure ja-JP SAPI 가타카나 발음 강제. 자동 발음이 틀릴 때만 사용
}

export interface Unit {
  id: string;
  track: 'kana' | 'lang';
  stage: KLevel | BLevel;
  ageMotif?: string;
  canDo: string;
  mode: EvalMode;
  kanaIds?: string[];        // Track K
  newPhraseIds?: string[];   // Track B (분량 예산 카운트 대상)
  reviewPhraseIds?: string[];// Track B (나선형 복습)
}

// 장면 비주얼 — 단계적 도입: 지금은 emoji만 채우고, 나중에 thumb(목록)·hero(입장)·
// success(완료) 이미지나 짧은 영상(loop)을 갈아끼울 수 있게 슬롯만 미리 설계.
export interface MissionVisual {
  emoji?: string;
  bg?: string;       // 배경 틴트
  thumb?: string;    // 홈/지도 썸네일 (이미지 URL)
  hero?: string;     // 장면 입장 대표 이미지
  success?: string;  // 완료 비주얼
  loop?: string;     // 2~4초 장면 루프 영상 (최후 도입)
}

export interface Mission {
  id: CLevel;
  scenario: string;
  place?: string;        // 짧은 장소 라벨 (편의점·식당·전철) — 목표 카피·잠금 힌트용
  visual?: MissionVisual; // 장면 비주얼 슬롯 — 지금은 이모지, 나중에 image/video로 갈아끼움
  sequence?: string[];   // 장면의 일어나는 순서(짧은 라벨) — "순서 맞추기" 카드 생성용
  speakPhraseIds?: string[]; // 장면 끝 "따라 말하기" 카드로 꺼낼 핵심 문장
  canDo: string;
  unlockAfter: string[];
  steps: MissionStep[];
  meta?: {
    recoveryExemptReason?: string; // ≥10자: Recovery 부족 실패→경고 강등
  };
}

export interface MissionStep {
  situationKo: string;
  speaker?: string;
  promptPhraseId?: string;
  recapPromptJa?: string; // 대화 다시보기용 상대 질문. promptPhraseId가 없을 때 사용
  recapPromptKo?: string;
  choices: Choice[];
}

export interface Choice {
  text: string;
  correct: boolean;
  phraseId?: string;
  actionText?: string;
  recoveryType?: RecoveryType;
  recoveryOutcome?: 'full' | 'partial';
  feedback?: string;
}

export interface GrammarPoint {
  id: string;
  label: string;
  tipKo?: string;   // 10초 마이크로 정확도 팁 (한국어 대조, just-in-time 노출)
  exampleJa?: string;
  exampleKo?: string;
  commonMistake?: string;
  action?: string;
  category?: string; // 팁 분류 배지 (문법·문화·발음·여행)
  n5Refs?: string[];
}

export interface N5Entry {
  id: string;
  type: 'vocab' | 'grammar' | 'kanji';
  value: string;
  source: 'unofficial';
}

export type ReviewTarget =
  | { type: 'kana'; id: string }
  | { type: 'phrase'; id: string }
  | { type: 'grammar'; id: string }
  | { type: 'mission'; id: CLevel };

export interface SrsCard {
  target: ReviewTarget;
  ease: number;
  intervalDays: number;
  dueAt: string;
  lapses: number;
}

export interface ContentBundle {
  kana: KanaItem[];
  phrases: Phrase[];
  grammar: GrammarPoint[];
  n5: N5Entry[];
  units: Unit[];
  missions: Mission[];
}
