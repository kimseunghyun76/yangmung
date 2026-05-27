import type { Mission } from './types';

export const missions: Mission[] = [
  {
    id: 'C0',
    scenario: '가게에 들어가며 인사 (튜토리얼)',
    canDo: '사용자는 가게에서 인사를 듣고 인사로 답하고, 못 알아들으면 다시 말해 달라고 할 수 있다',
    unlockAfter: ['u_b0_reaction'],
    meta: { recoveryExemptReason: '튜토리얼 미니미션이라 복구 1종만 도입한다' },
    steps: [
      {
        situationKo: '점원이 인사한다',
        speaker: '점원',
        promptPhraseId: 'p_irasshai',
        choices: [
          { text: '안녕하세요', phraseId: 'p_konnichiwa', correct: true },
          { text: '(가볍게 목례한다)', actionText: '가볍게 목례한다', correct: true, feedback: '사실 일본 손님은 말 없이 목례만 하는 게 가장 자연스러워요' },
          { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true },
          { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
        ],
      },
    ],
  },
  {
    id: 'C1',
    scenario: '편의점 계산대',
    canDo: '사용자는 편의점 계산대에서 봉투 필요 여부를 듣고, 필요/불필요를 짧게 답할 수 있다',
    unlockAfter: ['u_b0_reaction', 'u_b4_recovery'],
    steps: [
      {
        situationKo: '점원이 봉투가 필요한지 묻는다',
        speaker: '점원',
        promptPhraseId: 'p_fukuro',
        choices: [
          { text: '네 (필요해요)', phraseId: 'p_hai', correct: true },
          { text: '아니요 (괜찮아요)', phraseId: 'p_iie', correct: true },
          { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: true },
          { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
        ],
      },
      {
        situationKo: '점원이 합계 금액을 빠르게 말한다',
        speaker: '점원',
        promptPhraseId: 'p_price',
        choices: [
          { text: '(동전을 건넨다)', actionText: '동전을 건넨다', correct: true },
          { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
          { text: '(번역앱 보여주기)', actionText: '번역앱 화면을 보여준다', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
          { text: '모르겠어요', phraseId: 'p_wakarimasen', correct: false, feedback: '솔직하지만, 막혔을 땐 ゆっくり 요청이 더 생산적' },
        ],
      },
      {
        situationKo: '점원이 결제 방법을 묻는다',
        speaker: '점원',
        promptPhraseId: 'p_shiharai_houhou',
        choices: [
          { text: '현금으로요', phraseId: 'p_genkin_de', correct: true },
          { text: '카드로요', phraseId: 'p_card_de', correct: true },
          { text: '이걸로 부탁드려요', phraseId: 'p_kore_de', correct: true },
          { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        ],
      },
      {
        situationKo: '점원이 포인트카드를 묻는다',
        speaker: '점원',
        promptPhraseId: 'p_pointo_arimasu_ka',
        choices: [
          { text: '없어요', phraseId: 'p_arimasen', correct: true },
          { text: '있어요', phraseId: 'p_arimasu', correct: true },
          { text: '영수증 주세요', phraseId: 'p_reshiito_kudasai', correct: false },
          { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
        ],
      },
    ],
  },
  {
    id: 'C2',
    scenario: '식당에서 주문 (한 조각)',
    canDo: '사용자는 식당에서 점원이 주문을 받을 때 메뉴를 가리키거나 추천을 묻고, 음료를 요청할 수 있다',
    unlockAfter: ['C1'],
    steps: [
      {
        situationKo: '점원이 자리에 와서 주문을 받는다',
        speaker: '점원',
        promptPhraseId: 'p_gochuumon',
        choices: [
          { text: '이거 주세요 (메뉴를 가리키며)', phraseId: 'p_kore_kudasai', correct: true },
          { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true },
          { text: '메뉴 좀 보여 주세요', phraseId: 'p_menu_misete', correct: true },
          { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
          { text: '잠깐만 기다려 주세요 (메뉴 보는 중)', phraseId: 'p_chotto_matte', correct: true },
        ],
      },
      {
        situationKo: '점원이 음료를 묻는다',
        speaker: '점원',
        promptPhraseId: 'p_nomimono',
        choices: [
          { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true },
          { text: '괜찮아요 (필요 없어요)', phraseId: 'p_daijoubu', correct: true },
          { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
          { text: '(메뉴 사진 가리키기)', actionText: '메뉴 사진을 가리킨다', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
          { text: '필요 없어요', phraseId: 'p_irimasen', correct: true },
        ],
      },
    ],
  },
  {
    id: 'C3',
    scenario: '전철 한 조각 (행선지 묻기 + 환승 듣기)',
    canDo: '사용자는 역무원에게 행선지를 묻고, 환승 안내를 듣고 다음 행동을 정할 수 있다',
    unlockAfter: ['C2'],
    steps: [
      {
        situationKo: '길을 잃었다 — 역무원에게 신주쿠역 가는 길을 묻기',
        speaker: '나',
        choices: [
          { text: '저기요 (말 걸기)', phraseId: 'p_sumimasen', correct: true, feedback: '먼저 すみません으로 주의를 끄는 게 일본식 매너' },
          { text: '신주쿠역은 어디예요?', phraseId: 'p_shinjuku_doko', correct: true },
          { text: '길을 가르쳐 주세요', phraseId: 'p_michi_oshiete', correct: true },
          { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        ],
      },
      {
        situationKo: '역무원이 환승 안내를 한다',
        speaker: '역무원',
        promptPhraseId: 'p_norikae_kudasai',
        choices: [
          { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true },
          { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true },
          { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
          { text: '다시 한 번 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
        ],
      },
    ],
  },
];
