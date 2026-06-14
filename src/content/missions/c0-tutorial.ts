import type { Mission } from '../types';

// C0 — 튜토리얼 미니미션 (인사 + 복구 1종 도입)
export const c0: Mission = {
  id: 'C0',
  tier: 1,
  scenario: '가게에 들어가며 인사 (튜토리얼)',
  place: '가게',
  canDo: '사용자는 가게에서 인사를 듣고 인사로 답하고, 못 알아들으면 다시 말해 달라고 할 수 있다',
  unlockAfter: ['u_b0_reaction'],
  meta: { recoveryExemptReason: '튜토리얼 미니미션이라 복구 1종만 도입한다' },
  steps: [
    {
      situationKo: '점원이 인사한다',
      speaker: '점원',
      promptPhraseId: 'p_irasshai',
      choices: [
        { text: '안녕하세요', phraseId: 'p_konnichiwa', correct: true, feedback: '「こんにちは」— 낮 인사. 아침엔 おはようございます, 저녁엔 こんばんは. 상점에 들어서면 자연스럽게 인사해 봐요' },
        { text: '(가볍게 목례한다)', actionText: '가볍게 목례한다', correct: false, feedback: '목례도 자연스럽지만, 일본어 공부 중이니 인사를 입으로 꺼내 보는 연습을 해요!' },
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true, feedback: '「ありがとうございます」— 가장 정중한 감사 표현. 친구끼리는 ありがとう만 써도 OK. 일본에서 가장 많이 쓰는 말 중 하나예요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
  ],
};
