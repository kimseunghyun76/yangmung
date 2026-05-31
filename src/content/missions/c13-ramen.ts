import type { Mission } from '../types';

// C13 — 라멘집 식권기. 도쿄 라멘집 = 입구 식권기 + 替え玉(면 추가) 문화.
export const c13: Mission = {
  id: 'C13',
  scenario: '라멘집 식권기에서 주문',
  place: '라멘',
  canDo: '사용자는 식권기 위치·사용법을 묻고, 곱빼기·면 추가를 요청하며, 막히면 다시·천천히·영어를 청할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['식권기 찾기', '면 추가·곱빼기'],
  speakPhraseIds: ['p_kenbaiki', 'p_oomori', 'p_kaedama'],
  steps: [
    {
      situationKo: '입구 식권기 앞에서 막혔다',
      speaker: '나',
      choices: [
        { text: '식권기 어디예요?', phraseId: 'p_kenbaiki', correct: true },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '자리에 앉아 양을 정한다',
      speaker: '나',
      choices: [
        { text: '곱빼기 되나요?', phraseId: 'p_oomori', correct: true },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: true, feedback: '替え玉(かえだま)는 라멘 면 사리 추가 — 도쿄·하카타 필수' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};
