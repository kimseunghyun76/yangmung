import type { Mission } from '../types';

// C12 — 편의점 택배(택큐빈). 짐·기념품을 호텔/공항으로 부치기.
export const c12: Mission = {
  id: 'C12',
  tier: 2,
  scenario: '편의점에서 택배 부치기',
  place: '택배',
  canDo: '사용자는 편의점에서 물건을 부치겠다고 말하고 요금을 물으며, 직원 안내를 못 알아들으면 다시·천천히·영어를 청할 수 있다',
  unlockAfter: ['C1'],
  sequence: ['부치기 요청', '이름 확인', '영수증 확인'],
  speakPhraseIds: ['p_okuritai', 'p_takkyubin'],
  steps: [
    {
      situationKo: '짐을 호텔로 부치고 싶다',
      speaker: '나',
      choices: [
        { text: '이거 보내고 싶어요', phraseId: 'p_okuritai', correct: true, feedback: '「これを送(おく)りたいです」— 짐을 가리키며 말하면 OK. 호텔→공항 당일 배송도 가능해요' },
        { text: '택배 부탁해요', phraseId: 'p_takkyubin', correct: true, feedback: '宅急便(たっきゅうびん)는 야마토 운수 브랜드명이 일반명사로 굳어진 표현. 전국 편의점 어디서나 접수 가능해요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '요금은 사이즈(60~160)와 배송지 거리에 따라 달라요. 도쿄→도쿄는 500~800엔 정도예요' },
        { text: '카드로요', phraseId: 'p_card_de', correct: false, feedback: '아직 접수도 전이에요 — 결제는 부치기 요청 후에요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 전표에 이름과 연락처를 적어 달라고 한다',
      speaker: '점원',
      recapPromptJa: '伝票にお名前とご連絡先をお願いします',
      recapPromptKo: '전표에 성함과 연락처를 부탁드립니다',
      choices: [
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '전표 작성 안내를 이해했다는 신호. 호텔 주소·연락처를 미리 메모해두면 현장에서 당황하지 않아요' },
        { text: '잠깐만 기다려 주세요', phraseId: 'p_chotto_matte', correct: true, feedback: '호텔 주소를 찾는 동안 자연스럽게 쓰는 표현이에요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '직원이 영수증이 필요한지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_reshiito_irimasu_ka',
      choices: [
        { text: '영수증 주세요', phraseId: 'p_reshiito_kudasai', correct: true, feedback: '택배 영수증엔 배송 추적번호(追跡番号・ついせきばんごう)가 적혀 있어요. 배송 상황을 앱에서 실시간 확인할 수 있어요' },
        { text: '아니요, 필요 없어요', phraseId: 'p_iie_irimasen', correct: true, feedback: '「いいえ、いりません」— 영수증이 필요 없을 때. 앱으로 영수증을 받는 デジタルレシート도 점점 늘고 있어요' },
        { text: '이거 보내고 싶어요', phraseId: 'p_okuritai', correct: false, feedback: '접수는 이미 끝났어요 — 지금은 영수증이 필요한지 답할 차례예요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
  ],
};
