import type { Mission } from '../types';

// C11 — 코인로커. 역·관광지에서 짐 맡기기.
export const c11: Mission = {
  id: 'C11',
  scenario: '코인로커에 짐 맡기기',
  place: '코인로커',
  canDo: '사용자는 코인로커 위치와 사용법을 묻고, 안내를 못 알아들으면 다시·천천히·영어를 청할 수 있다',
  unlockAfter: ['C3'],
  sequence: ['로커 찾기', '사용법 확인'],
  speakPhraseIds: ['p_koinrokkaa', 'p_tsukaikata'],
  steps: [
    {
      situationKo: '무거운 짐을 맡기고 싶다',
      speaker: '나',
      choices: [
        { text: '코인로커 어디예요?', phraseId: 'p_koinrokkaa', correct: true },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 빠르게 사용법을 설명한다',
      speaker: '직원',
      choices: [
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true },
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};
