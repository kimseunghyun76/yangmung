import type { Mission } from '../types';

// C0 — 튜토리얼 미니미션 (인사 + 복구 1종 도입)
export const c0: Mission = {
  id: 'C0',
  scenario: '가게에 들어가며 인사 (튜토리얼)',
  canDo: '사용자는 가게에서 인사를 듣고 인사로 답하고, 못 알아들으면 다시 말해 달라고 할 수 있다',
  unlockAfter: ['u_b0_reaction'],
  meta: { recoveryExemptReason: '튜토리얼 미니미션이라 복구 1종만 도입한다' },
  steps: [
    {
      situationKo: '점원이 인사한다',
      speaker: '점원',
      promptPhraseId: 'p_irasshai',
      choices: [
        { text: '안녕하세요', phraseId: 'p_konnichiwa', correct: true },
        { text: '(가볍게 목례한다)', actionText: '가볍게 목례한다', correct: true, feedback: '사실 일본 손님은 말 없이 목례만 하는 게 가장 자연스러워요' },
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
  ],
};
