import type { Mission } from '../types';

// C9 — 공항 입국심사. 도착 후 가장 먼저 겪는 관문: 목적·체류기간·숙소.
export const c9: Mission = {
  id: 'C9',
  scenario: '공항 입국심사',
  place: '공항',
  canDo: '사용자는 입국심사에서 방문 목적·체류 기간·숙소를 답하고, 못 알아들으면 다시·천천히·영어를 청할 수 있다',
  unlockAfter: ['C1'],
  sequence: ['목적 답하기', '체류 기간', '숙소 답하기'],
  speakPhraseIds: ['p_kankou_desu', 'p_isshuukan', 'p_hoteru_desu'],
  steps: [
    {
      situationKo: '심사관이 방문 목적을 묻는다',
      speaker: '심사관',
      promptPhraseId: 'p_mokuteki_wa',
      choices: [
        { text: '관광이에요', phraseId: 'p_kankou_desu', correct: true },
        { text: '일/출장이에요', phraseId: 'p_shigoto_desu', correct: true },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '얼마나 머무는지 묻는다',
      speaker: '심사관',
      promptPhraseId: 'p_taizai_wa',
      choices: [
        { text: '일주일이요', phraseId: 'p_isshuukan', correct: true },
        { text: '3일이요', phraseId: 'p_mikka', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '관광이에요', phraseId: 'p_kankou_desu', correct: false, feedback: '지금은 기간 질문 — 「いっしゅうかんです」처럼 기간으로 답해요' },
      ],
    },
    {
      situationKo: '어디서 묵는지 묻는다',
      speaker: '심사관',
      promptPhraseId: 'p_doko_tomaru',
      choices: [
        { text: '호텔이에요', phraseId: 'p_hoteru_desu', correct: true },
        { text: '(예약 확인서를 보여준다)', actionText: '호텔 예약 확인서를 보여준다', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true },
      ],
    },
  ],
};
