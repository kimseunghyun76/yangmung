import type { Mission } from '../types';

// C54 — 택배 재배달 신청. 부재중 택배 스티커(不在票)를 보고 전화로 재배달을 신청하는 장면.
// 2026-07-26 사용성 테스트 후속(persona-06, 장기체류자): C12(택배 부치기)는 발송 전용이라
// 재배송 요청 같은 생활자 용도를 다루지 않았던 공백을 메우기 위해 신규 제작.
// 주의: 이 미션의 문장은 원어민 검수 전 상태다. 사전 생성 Azure 음성은 2026-07-30
// 전체 음성 생성 작업에 포함해 연결했으므로, 후속 작업은 원어민 표현 검수에 집중한다.
export const c54: Mission = {
  id: 'C54',
  tier: 4,
  scenario: '택배 재배달 신청',
  place: '택배',
  canDo: '사용자는 부재중 택배의 재배달을 요청하고, 원하는 날짜와 시간대를 말할 수 있다',
  unlockAfter: ['C12'],
  sequence: ['재배달 요청', '희망 날짜 확인', '희망 시간대 확인', '완료 확인'],
  speakPhraseIds: ['p_saihaitatsu_onegai', 'p_ashita_gogo_de', 'p_niji_kara_yoji_made'],
  steps: [
    {
      situationKo: '부재중 택배 스티커(부재표)를 보고 전화로 재배달을 신청한다',
      speaker: '나',
      choices: [
        { text: '재배달 부탁드려요', phraseId: 'p_saihaitatsu_onegai', correct: true, feedback: '「再配達(さいはいたつ)をお願(ねが)いします」— 부재표에 적힌 번호로 전화하거나 택배사 앱·QR코드로도 신청할 수 있어요' },
        { text: '이거 보내고 싶어요', phraseId: 'p_okuritai', correct: false, feedback: '그건 물건을 부칠 때 하는 말이에요 — 지금은 이미 온 택배를 다시 받고 싶다고 말할 차례예요' },
      ],
    },
    {
      situationKo: '상담원이 희망하는 재배달 날짜를 묻는다',
      speaker: '상담원',
      promptPhraseId: 'p_itsu_ga_yoroshii',
      choices: [
        { text: '내일 오후로 부탁드려요', phraseId: 'p_ashita_gogo_de', correct: true, feedback: '「明日(あした)の午後(ごご)でお願(ねが)いします」— 재배달은 보통 당일 저녁부터, 다음날은 오전·오후 모두 가능해요' },
        { text: '재배달 부탁드려요', phraseId: 'p_saihaitatsu_onegai', correct: false, feedback: '요청은 이미 전달됐어요 — 지금은 날짜를 답할 차례예요' },
      ],
    },
    {
      situationKo: '상담원이 희망하는 시간대를 묻는다',
      speaker: '상담원',
      promptPhraseId: 'p_nanji_kara_nanji_made',
      choices: [
        { text: '2시부터 4시까지요', phraseId: 'p_niji_kara_yoji_made', correct: true, feedback: '「2時(にじ)から4時(よじ)までです」— 일본 택배는 보통 2시간 단위 시간대(午前中·14~16時·16~18時 등)로 나뉘어요' },
        { text: '내일 오후로 부탁드려요', phraseId: 'p_ashita_gogo_de', correct: false, feedback: '날짜는 이미 답했어요 — 지금은 몇 시부터 몇 시까지인지 시간대를 답할 차례예요' },
      ],
    },
    {
      situationKo: '상담원이 예약 완료를 확인하고 마무리 인사를 한다',
      speaker: '상담원',
      recapPromptJa: '明日の14時から16時で承知しました',
      recapPromptKo: '내일 14시부터 16시로 접수됐습니다',
      choices: [
        { text: '감사합니다, 잘 부탁드려요', phraseId: 'p_saihaitatsu_arigatou', correct: true, feedback: '「ありがとうございます、よろしくお願(ねが)いします」— 통화를 마칠 때 자연스러운 마무리 인사예요' },
        { text: '감사합니다 (정중)', phraseId: 'p_arigatou_gozaimasu', correct: true, feedback: '더 짧게 감사 인사만으로 마무리해도 자연스러워요' },
        { text: '재배달 부탁드려요', phraseId: 'p_saihaitatsu_onegai', correct: false, feedback: '이미 예약이 완료됐어요 — 지금은 감사 인사로 마무리할 차례예요' },
      ],
    },
  ],
};
