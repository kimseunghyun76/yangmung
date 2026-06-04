import type { Mission } from '../types';

// C6 — 약국. 증상 말하기 → 약 받기. 도쿄 드러그스토어 어디나.
export const c6: Mission = {
  id: 'C6',
  scenario: '약국에서 약 사기',
  place: '약국',
  canDo: '사용자는 약국에서 증상(머리·배·감기)을 말하고 약을 요청하며, 약 설명을 못 알아들으면 다시·천천히·영어를 청할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['증상 말하기', '약 요청', '복용 확인'],
  speakPhraseIds: ['p_atama_itai', 'p_kusuri_kudasai', 'p_kono_kusuri'],
  steps: [
    {
      situationKo: '약사가 어디가 안 좋은지 묻는다',
      speaker: '약사',
      promptPhraseId: 'p_dou_shimashita',
      choices: [
        { text: '머리가 아파요', phraseId: 'p_atama_itai', correct: true },
        { text: '배가 아파요', phraseId: 'p_onaka_itai', correct: true },
        { text: '감기예요', phraseId: 'p_kaze_desu', correct: true },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '약을 받고 싶다',
      speaker: '나',
      choices: [
        { text: '약 주세요', phraseId: 'p_kusuri_kudasai', correct: true },
        { text: '이 약은 뭐예요?', phraseId: 'p_kono_kusuri', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '약사가 빠르게 복용법을 설명한다 — 잘 안 들린다',
      speaker: '약사',
      promptPhraseId: 'p_shokugo_nonde',
      choices: [
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true },
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '다시 한 번 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
  ],
};
