import type { Mission } from '../types';

// C10 — 환전. 공항·시내 환전소에서 엔화 바꾸기.
export const c10: Mission = {
  id: 'C10',
  scenario: '환전하기',
  place: '환전',
  canDo: '사용자는 환전을 요청하고, 수수료를 묻고, 잔돈으로 바꿔 달라고 하며 영수증을 받을 수 있다',
  unlockAfter: ['C1'],
  sequence: ['환전 요청', '잔돈·영수증'],
  speakPhraseIds: ['p_ryougae', 'p_komakaku'],
  steps: [
    {
      situationKo: '환전 창구에서 엔으로 바꾸고 싶다',
      speaker: '나',
      choices: [
        { text: '환전해 주세요', phraseId: 'p_ryougae', correct: true },
        { text: '얼마예요? (수수료)', phraseId: 'p_ikura_desu_ka', correct: true },
        { text: '데워 주세요', phraseId: 'p_atatamete', correct: false, feedback: '여긴 환전소예요 — 편의점에서 쓰는 말이에요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '큰 지폐를 잔돈으로 바꾸고 영수증을 받는다',
      speaker: '나',
      choices: [
        { text: '잔돈으로 해 주세요', phraseId: 'p_komakaku', correct: true },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true },
      ],
    },
  ],
};
