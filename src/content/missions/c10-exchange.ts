import type { Mission } from '../types';

// C10 — 환전. 공항·시내 환전소에서 엔화 바꾸기.
export const c10: Mission = {
  id: 'C10',
  tier: 1,
  scenario: '환전하기',
  place: '환전',
  canDo: '사용자는 환전을 요청하고 금액을 지정하며, 여권을 내고, 잔돈 지폐 단위를 정하고 영수증을 받을 수 있다',
  unlockAfter: ['C1'],
  sequence: ['환전 요청', '금액 지정', '여권 확인', '지폐 단위', '잔돈·영수증'],
  speakPhraseIds: ['p_ryougae', 'p_ichiman_ryougae', 'p_komakaku'],
  steps: [
    {
      situationKo: '환전 창구에서 엔으로 바꾸고 싶다',
      speaker: '나',
      choices: [
        { text: '환전해 주세요', phraseId: 'p_ryougae', correct: true, feedback: '「両替(りょうがえ)してください」— 공항보다 시내 환전소(특히 도톤보리·아키하바라 주변)가 환율이 더 유리해요' },
        { text: '얼마예요? (수수료)', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '수수료(手数料・てすうりょう)를 미리 확인하는 게 현명해요. 0엔이라도 환율 스프레드로 수익을 내는 곳이 많아요' },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: false, feedback: '영수증은 환전이 끝난 뒤에 받아요 — 지금은 먼저 「両替(りょうがえ)してください」로 환전을 요청하세요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '직원이 얼마를 환전할지 묻는다',
      speaker: '직원',
      promptPhraseId: 'p_ikura_ryougae',
      choices: [
        { text: '만 엔 바꿔 주세요', phraseId: 'p_ichiman_ryougae', correct: true, feedback: '「一万円(いちまんえん)お願(ねが)いします」— 바꿀 금액을 지정. 환율이 좋으면 한 번에, 아니면 필요한 만큼만 바꿔요' },
        { text: '전부 다 바꿔 주세요', phraseId: 'p_zenbu_de', correct: true, feedback: '「全部(ぜんぶ)でお願(ねが)いします」— 가진 외화를 전부 환전. 여행 막바지엔 남은 엔화를 역으로 바꾸기도 해요' },
        { text: '잔돈으로 해 주세요', phraseId: 'p_komakaku', correct: false, feedback: '먼저 환전할 금액을 정해요 — 잔돈 요청은 받은 뒤에 해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 환전에 필요한 여권을 요청한다',
      speaker: '직원',
      promptPhraseId: 'p_passport_onegai',
      choices: [
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true, feedback: '일본 외국환거래법상 환전 시 여권 제시는 법적 의무예요. 복사본이 아닌 원본을 항상 지참하세요' },
        { text: '잠깐만 기다려 주세요', phraseId: 'p_chotto_matte', correct: true, feedback: '「ちょっとまってください」— 여권을 가방에서 꺼낼 때 여유를 만들어요. 일본인은 이 한 마디에 기다려줘요' },
        { text: '잔돈으로 해 주세요', phraseId: 'p_komakaku', correct: false, feedback: '잔돈 요청은 환전이 끝난 뒤에 — 지금은 여권을 보여줄 차례예요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '직원이 천 엔짜리도 섞어 줄지 묻는다',
      speaker: '직원',
      promptPhraseId: 'p_sen_en_satsu',
      choices: [
        { text: '네, 부탁합니다', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願(ねが)いします」— 천 엔권(千円札)은 자판기·버스·소액 결제에 유용해요. 큰 권종만 받으면 쓰기 불편해요' },
        { text: '잔돈으로 해 주세요', phraseId: 'p_komakaku', correct: true, feedback: '「細(こま)かくしてください」— 동전·소액권으로 더 잘게. IC카드 충전이나 신사 봉납금에 잔돈이 필요해요' },
        { text: '괜찮습니다 (그대로)', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 권종 구성이 상관없으면 가볍게 답해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '큰 지폐를 잔돈으로 바꾸고 영수증을 받는다',
      speaker: '나',
      choices: [
        { text: '잔돈으로 해 주세요', phraseId: 'p_komakaku', correct: true, feedback: '「細(こま)かくしてください」— 큰 지폐를 잔돈으로. 교통 IC카드 충전·자판기·신사 오사이센(봉납금)에 잔돈이 꼭 필요해요' },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: true, feedback: '환전 영수증은 재환전·경비 처리 시 필요할 수 있어요. 여행 끝까지 보관하는 습관을 들이세요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '금액 확인했어요', phraseId: 'p_kingaku_kakunin', correct: true, feedback: '「金額(きんがく)を確認(かくにん)しました」— 받은 돈을 그 자리에서 확인했다는 표현. 돈 거래에서는 감사보다 확인이 먼저예요' },
      ],
    },
  ],
};
