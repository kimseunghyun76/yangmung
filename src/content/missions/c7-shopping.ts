import type { Mission } from '../types';

// C7 — 쇼핑·면세. 가격 묻기 → 입어보기 → 면세·결제. 도쿄 백화점·드러그스토어 면세 실전.
export const c7: Mission = {
  id: 'C7',
  scenario: '쇼핑하고 면세 받기',
  place: '쇼핑',
  canDo: '사용자는 가격을 묻고, 입어봐도 되는지 확인하고, 면세·카드 결제를 요청하며 여권을 제시할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['가격 묻기', '입어보기', '면세 확인', '결제'],
  speakPhraseIds: ['p_kore_ikura', 'p_menzei_dekimasu_ka', 'p_card_tsukaemasu_ka'],
  steps: [
    {
      situationKo: '마음에 드는 물건을 봤다 — 가격·착용 확인',
      speaker: '나',
      choices: [
        { text: '이거 얼마예요?', phraseId: 'p_kore_ikura', correct: true },
        { text: '입어 봐도 돼요?', phraseId: 'p_shichaku', correct: true },
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '사기로 했다 — 면세가 되는지 묻는다',
      speaker: '나',
      choices: [
        { text: '면세 되나요?', phraseId: 'p_menzei_dekimasu_ka', correct: true },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true, feedback: '면세는 여권이 꼭 필요해요 — 미리 챙기세요' },
        { text: '이걸로 할게요', phraseId: 'p_kore_kudasai_shop', correct: true },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '계산대에서 결제 방법을 정한다',
      speaker: '나',
      choices: [
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true },
        { text: '이걸로 할게요', phraseId: 'p_kore_kudasai_shop', correct: true },
        { text: '현금으로요', phraseId: 'p_genkin_de', correct: true },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
  ],
};
