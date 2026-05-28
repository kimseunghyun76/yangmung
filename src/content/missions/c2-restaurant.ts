import type { Mission } from '../types';

// C2 — 식당 한 사이클. 스텝은 입장 동선 순서:
// 인원수 → 주문 받기 → 음료(일본 식당은 음료를 먼저) → 개수 → 계산 마무리.
export const c2: Mission = {
  id: 'C2',
  scenario: '식당에서 주문 (한 조각)',
  place: '식당',
  canDo: '사용자는 식당에서 인원수를 답하고, 메뉴를 가리키거나 추천을 묻고, 음료와 개수를 요청하고, 식사 후 계산을 마무리할 수 있다',
  unlockAfter: ['C1'],
  steps: [
    {
      situationKo: '식당에 들어서자 점원이 인원수를 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nanmeisama',
      choices: [
        { text: '한 명이요', phraseId: 'p_hitori_desu', correct: true },
        { text: '두 명이요', phraseId: 'p_futari_desu', correct: true },
        { text: '저기요 (주의 끌기)', phraseId: 'p_sumimasen', correct: false, feedback: '인원수 질문에는 「ひとりです / ふたりです」처럼 숫자로 답해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '자리에 앉자 점원이 주문을 받으러 온다',
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
      situationKo: '주문을 받은 점원이 먼저 음료를 묻는다',
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
    {
      situationKo: '이어서 몇 개 시킬지 말한다',
      speaker: '나',
      choices: [
        { text: '하나 주세요', phraseId: 'p_hitotsu_kudasai', correct: true },
        { text: '두 개 주세요', phraseId: 'p_futatsu_kudasai', correct: true },
        { text: '이거랑 이거', phraseId: 'p_kore_to_kore', correct: true, feedback: '메뉴를 가리키며 — 발음에 자신이 없을 때 가장 안전한 주문법' },
        { text: '매워요?', phraseId: 'p_karai_desu_ka', correct: false, feedback: '확인 질문은 자연스럽지만 "주문 개수 정하기" 단계는 아니에요' },
      ],
    },
    {
      situationKo: '식사를 마치고 계산대로 향한다',
      speaker: '나',
      choices: [
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: true },
        { text: '따로따로요 (각자 계산)', phraseId: 'p_betsubetsu_de', correct: true, feedback: '동행자와 나눠 낼 때 — 계산대에서 미리 말하면 매끄러워요' },
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: true, feedback: '계산하며 곁들이면 인상이 좋아지는 마무리 인사' },
        { text: '메뉴 좀 보여 주세요', phraseId: 'p_menu_misete', correct: false, feedback: '식사를 마친 단계라 메뉴 요청은 흐름에 안 맞아요' },
      ],
    },
  ],
};
