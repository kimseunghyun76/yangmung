import type { Mission } from '../types';

// C8 — 택시. 행선지 말하기 → 도착·세우기·영수증. 도쿄 늦은 밤·짐 많을 때.
export const c8: Mission = {
  id: 'C8',
  scenario: '택시 타기',
  place: '택시',
  canDo: '사용자는 택시에서 행선지를 말하고, 원하는 곳에서 세워 달라고 하고, 영수증을 받을 수 있다',
  unlockAfter: ['C3'],
  sequence: ['행선지 말하기', '이동 중', '내리기'],
  speakPhraseIds: ['p_made_onegai', 'p_koko_de_tomete', 'p_ryoushuusho'],
  steps: [
    {
      situationKo: '택시를 타며 행선지를 말한다',
      speaker: '나',
      choices: [
        { text: '시부야까지 가주세요', phraseId: 'p_made_onegai', correct: true, feedback: '행선지 뒤에 までおねがいします를 붙여요' },
        { text: '택시 불러주세요', phraseId: 'p_takushi_onegai', correct: true },
        { text: '신주쿠역은 어디예요?', phraseId: 'p_shinjuku_doko', correct: true },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '기사가 행선지를 되묻는다',
      speaker: '기사',
      promptPhraseId: 'p_doko_made',
      choices: [
        { text: '시부야까지 가주세요', phraseId: 'p_made_onegai', correct: true },
        { text: '(지도를 보여준다)', actionText: '지도 화면을 보여준다', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '여기서 세워 주세요', phraseId: 'p_koko_de_tomete', correct: false, feedback: '아직 출발 단계 — 행선지를 먼저 확인해요' },
      ],
    },
    {
      situationKo: '목적지에 가까워졌다 — 내릴 준비',
      speaker: '나',
      choices: [
        { text: '여기서 세워 주세요', phraseId: 'p_koko_de_tomete', correct: true },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: true },
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true },
      ],
    },
  ],
};
