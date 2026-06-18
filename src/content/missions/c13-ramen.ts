import type { Mission } from '../types';

// C13 — 라멘집. 도쿄/하카타 라멘집 실제 동선:
// 식권기 → 자리 안내 → 식권 전달 → 면 굳기 → 토핑 → 면 추가/곱빼기 → 마무리.
// (응용·종합 2스텝은 advancedSteps JSON)
export const c13: Mission = {
  id: 'C13',
  tier: 2,
  scenario: '라멘집에서 주문하기',
  place: '라멘',
  canDo: '사용자는 라멘집에서 식권기·자리 안내·식권 전달·면 굳기·토핑·면 추가를 실제 흐름대로 처리하고, 막히면 다시·천천히·영어를 청할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['식권기', '자리 안내', '식권 전달', '면 굳기', '토핑', '면 추가', '마무리'],
  speakPhraseIds: ['p_kenbaiki', 'p_men_katame', 'p_kaedama'],
  steps: [
    {
      situationKo: '입구 식권기 앞에서 막혔다',
      speaker: '나',
      choices: [
        { text: '식권기 어디예요?', phraseId: 'p_kenbaiki', correct: true, feedback: '「券売機(けんばいき)はどこですか」— 라멘·소바집은 입구 식권기가 기본. 먼저 표를 뽑고 자리에 앉는 게 순서예요' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true, feedback: '「使(つか)い方(かた)を教(おし)えてください」— 기계가 낯설면 주저 없이 물어봐요. 일본 점원은 직접 눌러줄 만큼 친절해요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 간판 메뉴를 물어봐요. 인기 라멘집은 醤油(しょうゆ)·味噌(みそ)·豚骨(とんこつ) 중 대표 메뉴가 있어요' },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: false, feedback: '아직 식권도 안 뽑았어요 — 면 추가(替え玉)는 라멘을 먹는 중에 부탁해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '식권을 뽑자 점원이 자리로 안내한다',
      speaker: '점원',
      promptPhraseId: 'p_kauntaa_e_douzo',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true, feedback: '「わかりました、ありがとうございます」— 라멘집 카운터석은 주방을 바로 앞에서 볼 수 있어요. 혼밥하기에도 편한 자리예요' },
        { text: '두 명이요', phraseId: 'p_futari_desu', correct: true, feedback: '「二人(ふたり)です」— 일행이 있을 때 인원을 전해요. 카운터는 보통 1인석 위주라 자리를 따로 안내받기도 해요' },
        { text: '곱빼기 되나요?', phraseId: 'p_oomori', correct: false, feedback: '지금은 자리 안내 중이에요 — 양은 식권을 뽑을 때나 주문하면서 정해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '자리에 앉자 점원이 식권을 받는다',
      speaker: '점원',
      promptPhraseId: 'p_shokken_douzo',
      choices: [
        { text: '네, 부탁합니다', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願(ねが)いします」— 식권을 건네며 답해요. 라멘집은 식권 선불이라 식사 후 따로 계산하지 않아요' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「わかりました」— 식권을 카운터에 올려놓거나 직원에게 건네면 돼요' },
        { text: '계산 부탁드려요', phraseId: 'p_okaikei', correct: false, feedback: '라멘집은 식권으로 미리 결제해요 — 식사 후 따로 계산할 필요가 없어요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '점원이 면 굳기를 어떻게 할지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_men_no_katasa',
      choices: [
        { text: '면은 단단하게요', phraseId: 'p_men_katame', correct: true, feedback: '「麺(めん)は硬(かた)めで」— バリカタ〉硬め〉普通(ふつう)〉やわめ 순으로 굳기를 골라요. 돈코츠 라멘에서 특히 자주 물어봐요' },
        { text: '보통으로 부탁합니다', phraseId: 'p_futsuu_de', correct: true, feedback: '「普通(ふつう)で」— 잘 모르겠으면 보통이 무난해요. 「ふつうで大丈夫です」도 자연스러워요' },
        { text: '곱빼기 되나요?', phraseId: 'p_oomori', correct: false, feedback: '지금은 면 굳기 질문이에요 — 곱빼기/면 추가는 양에 관한 거라 따로 정해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '점원이 토핑을 추가할지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_topping_ikaga',
      choices: [
        { text: '맛계란 추가요', phraseId: 'p_ajitama_tsuika', correct: true, feedback: '「味玉(あじたま)追加(ついか)で」— 간장에 절인 반숙 계란. 라멘 인기 토핑 1위예요' },
        { text: '차슈 추가요', phraseId: 'p_chaashuu_tsuika', correct: true, feedback: '「チャーシュー追加(ついか)で」— 돼지고기 차슈. のり(김)·ねぎ(파)도 같은 「〇〇追加で」패턴으로 추가해요' },
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 토핑 없이 기본으로 충분할 때 가볍게 사양해요' },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: false, feedback: '지금은 토핑 질문이에요 — 면 추가(替え玉)는 면을 거의 다 먹어갈 때 부탁해요' },
      ],
    },
    {
      situationKo: '면을 거의 다 먹어 추가를 정한다',
      speaker: '나',
      choices: [
        { text: '면 추가요', phraseId: 'p_kaedama', correct: true, feedback: '「替え玉(かえだま)お願(ねが)いします」— 국물이 남았을 때 면만 추가. 하카타 라멘의 명물 문화예요. 보통 100~150엔' },
        { text: '곱빼기 되나요?', phraseId: 'p_oomori', correct: true, feedback: '「大盛(おおも)りできますか」— 처음부터 양을 늘리고 싶을 때. 가게에 따라 무료이거나 추가 요금이 있어요' },
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true, feedback: '「お水(みず)ください」— 라멘집 물은 대부분 셀프(セルフサービス). 진한 국물엔 물이 자주 당겨요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '다 먹고 자리를 정리하며 마무리한다',
      speaker: '나',
      choices: [
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: true, feedback: '「ごちそうさまでした」— 식사 후 인사. 카운터 너머 주방에 들리도록 말하면 직원이 환하게 답해줘요' },
        { text: '맛있어요', phraseId: 'p_oishii', correct: true, feedback: '「おいしい！」— 만족스러우면 바로 표현. 라멘집 주인에게 큰 기쁨이 돼요' },
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true, feedback: '「ありがとうございます」— 그릇은 카운터 위로 올려두고 나가면 깔끔해요. 짧은 감사 한마디가 좋은 인상을 남겨요' },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: false, feedback: '이미 다 먹고 일어서는 참이에요 — 면 추가가 아니라 마무리 인사를 해요' },
      ],
    },
  ],
};
