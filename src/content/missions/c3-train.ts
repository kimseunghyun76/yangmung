import type { Mission } from '../types';

// C3 — 전철 한 사이클. 역 찾기 → 표/IC → 개찰구 → 플랫폼 → 환승 → 내릴 역 확인.
export const c3: Mission = {
  id: 'C3',
  scenario: '전철로 이동하기',
  place: '전철',
  canDo: '사용자는 역을 찾고, 표를 사거나 IC카드를 충전하고, 개찰구·플랫폼을 묻고, 환승 안내를 듣고 내릴 역을 확인할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['역 찾기', '표·IC카드', '개찰구 확인', '플랫폼 확인', '환승 안내', '내릴 역 확인'],
  speakPhraseIds: ['p_shinjuku_doko', 'p_kippu_kudasai', 'p_nanbansen', 'p_tsugi_wa_shibuya'],
  steps: [
    {
      situationKo: '길을 잃었다 — 역무원에게 신주쿠역 가는 길을 묻기',
      speaker: '나',
      choices: [
        { text: '저기요 (말 걸기)', phraseId: 'p_sumimasen', correct: true, feedback: '먼저 すみません으로 주의를 끄는 게 일본식 매너' },
        { text: '신주쿠역은 어디예요?', phraseId: 'p_shinjuku_doko', correct: true },
        { text: '길을 가르쳐 주세요', phraseId: 'p_michi_oshiete', correct: true },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '역에 도착 — 표를 사거나 IC카드를 충전한다',
      speaker: '나',
      choices: [
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: true },
        { text: '충전 부탁해요 (IC카드)', phraseId: 'p_chaaji_onegai', correct: true, feedback: 'Suica가 있으면 표 대신 충전만 하면 돼요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '개찰구를 못 찾겠다',
      speaker: '나',
      choices: [
        { text: '개찰구 어디예요?', phraseId: 'p_kaisatsu_doko', correct: true },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: true },
        { text: '충전 부탁해요', phraseId: 'p_chaaji_onegai', correct: false, feedback: '충전은 끝났어요 — 지금은 개찰구를 찾는 단계' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '플랫폼이 여러 개다 — 몇 번 선인지 확인한다',
      speaker: '나',
      choices: [
        { text: '몇 번 선이에요?', phraseId: 'p_nanbansen', correct: true },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: true },
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: false, feedback: '표는 이미 샀어요 — 지금은 플랫폼 확인' },
        { text: '저기요', phraseId: 'p_sumimasen', correct: true, feedback: '먼저 すみません으로 역무원을 부르면 자연스러워요' },
      ],
    },
    {
      situationKo: '역무원이 환승 안내를 한다',
      speaker: '역무원',
      promptPhraseId: 'p_norikae_kudasai',
      choices: [
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true },
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '다시 한 번 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '곧 내릴 때 — 다음 역이 맞는지 확인한다',
      speaker: '나',
      choices: [
        { text: '다음은 시부야예요?', phraseId: 'p_tsugi_wa_shibuya', correct: true },
        { text: '여기 어디예요?', phraseId: 'p_doko_desu_ka', correct: true },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '확인이 됐으면 마지막엔 짧게 受け答え' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};
