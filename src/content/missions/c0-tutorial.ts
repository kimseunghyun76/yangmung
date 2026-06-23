import type { Mission } from '../types';

// C0 — 튜토리얼 미니미션 (인사 + 기본 복구 도입)
export const c0: Mission = {
  id: 'C0',
  tier: 1,
  scenario: '가게에 들어가며 인사 (튜토리얼)',
  place: '가게',
  canDo: '사용자는 가게에서 인사를 듣고 인사로 답하고, 못 알아들으면 다시 또는 천천히 말해 달라고 할 수 있다',
  unlockAfter: ['u_b0_reaction'],
  steps: [
    {
      situationKo: '점원이 「어서 오세요」 하고 맞이해요 — 어떻게 인사할까요?',
      speaker: '점원',
      promptPhraseId: 'p_irasshai',
      choices: [
        { text: '안녕하세요', phraseId: 'p_konnichiwa', correct: true, feedback: '「こんにちは」— 낮 인사. 아침엔 おはようございます, 저녁엔 こんばんは. 가게에 들어서면 이렇게 인사해 봐요' },
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: false, feedback: '「ありがとうございます」는 고맙거나 나갈 때 인사예요. 막 들어와 맞이 인사를 받았을 땐 こんにちは가 자연스러워요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
        { text: '천천히 부탁합니다', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'partial' },
      ],
    },
  ],
};
