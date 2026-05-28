import type { Mission } from '../types';

// C2 — 식당 주문 (주문 받기·음료·개수)
export const c2: Mission = {
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
    {
      situationKo: '메뉴를 보고 개수를 정한다',
      speaker: '나',
      choices: [
        { text: '하나 주세요', phraseId: 'p_hitotsu_kudasai', correct: true },
        { text: '두 개 주세요', phraseId: 'p_futatsu_kudasai', correct: true },
        { text: '이거랑 이거', phraseId: 'p_kore_to_kore', correct: true, feedback: '메뉴를 가리키며 — 발음에 자신이 없을 때 가장 안전한 주문법' },
        { text: '매워요?', phraseId: 'p_karai_desu_ka', correct: false, feedback: '확인 질문은 자연스럽지만 "주문 개수 정하기" 단계는 아니에요' },
      ],
    },
  ],
};
