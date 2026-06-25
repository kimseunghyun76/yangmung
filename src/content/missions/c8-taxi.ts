import type { Mission } from '../types';

// C8 — 택시. 행선지 말하기 → 도착·세우기·영수증. 도쿄 늦은 밤·짐 많을 때.
export const c8: Mission = {
  id: 'C8',
  tier: 1,
  scenario: '택시 타기',
  place: '택시',
  canDo: '사용자는 택시에서 행선지·짐·경로를 정하고, 원하는 곳에서 세워 달라고 하며, 요금을 내고 영수증을 받을 수 있다',
  unlockAfter: ['C3'],
  sequence: ['행선지 말하기', '행선지 확인', '짐 싣기', '경로 확인', '내리기', '요금·영수증'],
  speakPhraseIds: ['p_made_onegai', 'p_koko_de_tomete', 'p_ryoushuusho'],
  steps: [
    {
      situationKo: '택시를 타며 행선지를 말한다',
      speaker: '나',
      choices: [
        { text: '시부야까지 가주세요', phraseId: 'p_made_onegai', correct: true, feedback: '「渋谷(しぶや)までお願(ねが)いします」— 목적지 뒤에 まで를 붙이면 어디든 전달 가능. 일본 택시는 자동문이라 직접 열지 않아도 되고, 주소 메모나 지도 화면을 보여주면 더 정확해요' },
        { text: '택시 불러주세요', phraseId: 'p_takushi_onegai', correct: false, feedback: '이미 택시에 탔어요. 부르는 표현은 호텔 프런트에서 써요' },
        { text: '신주쿠역은 어디예요?', phraseId: 'p_shinjuku_doko', correct: false, feedback: '기사에게는 길을 묻는 게 아니라 행선지를 말해요. 「〇〇までお願いします」' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '기사가 행선지를 되묻는다',
      speaker: '기사',
      promptPhraseId: 'p_doko_made',
      choices: [
        { text: '시부야까지 가주세요', phraseId: 'p_made_onegai', correct: true, feedback: '기사가 못 알아들었을 때 또렷이 한 번 더. 지명을 한자로 쓴 쪽지를 보여줘도 효과적이에요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '여기서 세워 주세요', phraseId: 'p_koko_de_tomete', correct: false, feedback: '아직 출발 단계 — 행선지를 먼저 확인해요' },
      ],
    },
    {
      situationKo: '기사가 짐이 있는지 묻는다',
      speaker: '기사',
      promptPhraseId: 'p_nimotsu_arimasu_ka',
      choices: [
        { text: '네, 부탁합니다 (트렁크에)', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願(ねが)いします」— 큰 짐은 トランク(트렁크)에. 일본 택시 기사는 직접 실어줘요. 캐리어가 있으면 미리 말해요' },
        { text: '괜찮습니다 (가지고 탈게요)', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 작은 가방은 들고 타면 돼요. 무릎 위나 옆자리에 두면 편해요' },
        { text: '여기서 세워 주세요', phraseId: 'p_koko_de_tomete', correct: false, feedback: '이제 막 출발하는 참이에요 — 세우는 건 목적지 근처에서 말해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '기사가 고속도로를 이용해도 되는지 묻는다',
      speaker: '기사',
      promptPhraseId: 'p_kousoku_tsukaimasu_ka',
      choices: [
        { text: '네, 부탁합니다', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願(ねが)いします」— 고속도로(高速)는 빠르지만 별도 통행료가 미터기에 더해져요. 급할 때 선택해요' },
        { text: '일반도로로 가주세요', phraseId: 'p_ippan_michi_de', correct: true, feedback: '「一般道(いっぱんどう)でお願いします」— 통행료를 아끼고 싶을 때. 시간 여유가 있으면 일반도로도 좋아요' },
        { text: '시부야까지 가주세요', phraseId: 'p_made_onegai', correct: false, feedback: '행선지는 이미 말했어요 — 지금은 경로(고속/일반)를 정하는 중이에요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '목적지에 가까워졌다 — 세워 달라고 한다',
      speaker: '나',
      choices: [
        { text: '여기서 세워 주세요', phraseId: 'p_koko_de_tomete', correct: true, feedback: '「ここで止(と)めてください」— 정확한 위치에서 내리려면 「その角(かど)で」(그 모퉁이에서)와 함께 써요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '「いくらですか」— 미터기 요금 확인. 심야(22시~5시)는 약 20% 할증이 붙어요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '기사가 요금을 말한다 — 지불하고 영수증을 받는다',
      speaker: '기사',
      promptPhraseId: 'p_ryoukin_ni_narimasu',
      choices: [
        { text: '카드로요', phraseId: 'p_card_de', correct: true, feedback: '「カードで」— 도쿄 택시는 대부분 카드·IC카드·QR결제가 돼요. 단말기에 탭하면 끝나요' },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: true, feedback: '「領収書(りょうしゅうしょ)ください」— 경비 처리나 분실물 신고에 필요해요. 내리기 전에 받아두면 좋아요' },
        { text: '거스름돈은 괜찮아요', phraseId: 'p_otsuri_daijoubu', correct: true, feedback: '「お釣(つ)りは大丈夫(だいじょうぶ)です」— 소액 거스름돈을 사양할 때. 내리기 직전 자연스럽게 쓰는 택시 마무리 표현이에요' },
        { text: '시부야까지 가주세요', phraseId: 'p_made_onegai', correct: false, feedback: '이미 도착했어요 — 지금은 요금을 내고 영수증을 받을 차례예요' },
      ],
    },
  ],
};
