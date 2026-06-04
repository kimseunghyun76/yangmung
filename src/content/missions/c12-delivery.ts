import type { Mission } from '../types';

// C12 — 편의점 택배(택큐빈). 짐·기념품을 호텔/공항으로 부치기.
export const c12: Mission = {
  id: 'C12',
  scenario: '편의점에서 택배 부치기',
  place: '택배',
  canDo: '사용자는 편의점에서 물건을 부치겠다고 말하고 요금을 물으며, 직원 안내를 못 알아들으면 다시·천천히·영어를 청할 수 있다',
  unlockAfter: ['C1'],
  sequence: ['부치기 요청', '안내 듣기'],
  speakPhraseIds: ['p_okuritai', 'p_takkyubin'],
  steps: [
    {
      situationKo: '짐을 호텔로 부치고 싶다',
      speaker: '나',
      choices: [
        { text: '이거 보내고 싶어요', phraseId: 'p_okuritai', correct: true },
        { text: '택배 부탁해요', phraseId: 'p_takkyubin', correct: true },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true },
        { text: '젓가락 주세요', phraseId: 'p_hashi_kudasai', correct: false, feedback: '편의점 계산대 표현이에요 — 지금은 택배 부치기' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 주소·크기를 빠르게 묻는다',
      speaker: '점원',
      choices: [
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true },
      ],
    },
  ],
};
