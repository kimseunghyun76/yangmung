import type { Mission } from '../types';

// C3 — 전철 한 사이클. 역 찾기 → 표/IC → 개찰구 → 플랫폼 → 환승 → 내릴 역 확인.
export const c3: Mission = {
  id: 'C3',
  tier: 1,
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
        { text: '신주쿠역은 어디예요?', phraseId: 'p_shinjuku_doko', correct: true, feedback: '「〇〇はどこですか」— 역 이름 뒤에 は를 붙이면 공손하게 위치를 물을 수 있어요' },
        { text: '길을 가르쳐 주세요', phraseId: 'p_michi_oshiete', correct: true, feedback: '「道を教えてください」— 단순히 どこ만 묻는 것보다 길 전체를 안내받을 수 있어요' },
      ],
    },
    {
      situationKo: '역에 도착 — 표를 사거나 IC카드를 충전한다',
      speaker: '나',
      choices: [
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: true, feedback: '「切符(きっぷ)ください」— 자동판매기보다 창구에서 목적지를 말하면 더 편해요' },
        { text: '충전 부탁해요', phraseId: 'p_chaaji_onegai', correct: true, feedback: 'Suica가 있으면 표 대신 충전만 하면 돼요' },
      ],
    },
    {
      situationKo: '개찰구를 못 찾겠다',
      speaker: '나',
      choices: [
        { text: '개찰구 어디예요?', phraseId: 'p_kaisatsu_doko', correct: true, feedback: '改札口(かいさつぐち) — 역 입장 관문. 대형 역엔 출구마다 개찰구가 다르니 방향도 함께 물어보세요' },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: true, feedback: '「どちらですか」는 どこより 공손하고, 방향(왼쪽/오른쪽)을 묻는 뉘앙스가 강해요' },
        { text: '충전 부탁해요', phraseId: 'p_chaaji_onegai', correct: false, feedback: '충전은 끝났어요 — 지금은 개찰구를 찾는 단계' },
      ],
    },
    {
      situationKo: '플랫폼이 여러 개다 — 몇 번 선인지 확인한다',
      speaker: '나',
      choices: [
        { text: '몇 번 선이에요?', phraseId: 'p_nanbansen', correct: true, feedback: '「何番線(なんばんせん)ですか」— 신주쿠역은 플랫폼이 16개! 번호를 반드시 확인하세요' },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: true, feedback: '번호를 들었어도 방향이 헷갈리면 「どちらですか」로 손짓과 함께 확인해요' },
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: false, feedback: '표는 이미 샀어요 — 지금은 플랫폼 확인' },
      ],
    },
    {
      situationKo: '역무원이 환승 안내를 한다',
      speaker: '역무원',
      promptPhraseId: 'p_norikae_kudasai',
      choices: [
        { text: '덕분에 도움이 됐어요', phraseId: 'p_tasukarimashita', correct: true, feedback: '「助(たす)かりました」— 환승 안내를 받은 뒤 "덕분에 살았어요". 그냥 감사보다 도움이 됐다는 실감을 전하는 게 더 자연스러워요' },
        { text: '신주쿠역은 어디예요?', phraseId: 'p_shinjuku_doko', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '곧 내릴 때 — 다음 역이 맞는지 확인한다',
      speaker: '나',
      choices: [
        { text: '다음은 시부야예요?', phraseId: 'p_tsugi_wa_shibuya', correct: true, feedback: '「次は渋谷ですか」— 차내 안내방송을 못 들었을 때 옆 승객에게 확인하는 실용 표현' },
        { text: '신주쿠역은 어디예요?', phraseId: 'p_shinjuku_doko', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
  ],
};
