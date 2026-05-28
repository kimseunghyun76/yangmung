import type { Mission } from '../types';

// C3 — 전철 (행선지 묻기 + 환승 듣기)
export const c3: Mission = {
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
};
