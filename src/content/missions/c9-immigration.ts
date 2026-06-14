import type { Mission } from '../types';

// C9 — 공항 입국심사. 도착 후 가장 먼저 겪는 관문: 목적·체류기간·숙소.
export const c9: Mission = {
  id: 'C9',
  tier: 1,
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
        { text: '관광이에요', phraseId: 'p_kankou_desu', correct: true, feedback: '「観光(かんこう)です」— 가장 많이 쓰는 입국 목적 답변. 짧고 명확하게 한 단어로 충분해요' },
        { text: '일/출장이에요', phraseId: 'p_shigoto_desu', correct: true, feedback: '「仕事(しごと)です」— 업무·출장 방문 시. 비자 종류(관광/취업)와 목적이 반드시 일치해야 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '얼마나 머무는지 묻는다',
      speaker: '심사관',
      promptPhraseId: 'p_taizai_wa',
      choices: [
        { text: '일주일이요', phraseId: 'p_isshuukan', correct: true, feedback: '「一週間(いっしゅうかん)です」— 일 단위로 말할 수도 있어요: 3일=みっか, 5일=いつか, 10일=とおか' },
        { text: '3일이요', phraseId: 'p_mikka', correct: true, feedback: '「三日(みっか)です」— 일본어 날수는 불규칙해요. 1일=ついたち, 2일=ふつか, 3일=みっか... 외워두면 입국·예약 모두 편해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '관광이에요', phraseId: 'p_kankou_desu', correct: false, feedback: '지금은 기간 질문 — 「いっしゅうかんです」처럼 기간으로 답해요' },
      ],
    },
    {
      situationKo: '어디서 묵는지 묻는다',
      speaker: '심사관',
      promptPhraseId: 'p_doko_tomaru',
      choices: [
        { text: '호텔이에요', phraseId: 'p_hoteru_desu', correct: true, feedback: '「ホテルです」— 한 단어로 충분해요. 호텔명이나 예약확인서를 미리 꺼내두면 심사가 더 빨리 끝나요' },
        { text: '(예약 확인서를 보여준다)', actionText: '호텔 예약 확인서를 보여준다', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: false, feedback: '어디서 묵는지 물었으니 숙소를 답해야 해요. 「ホテルです」' },
      ],
    },
  ],
};
