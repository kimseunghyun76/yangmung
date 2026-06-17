import type { Mission } from '../types';

// C1 — 편의점 계산대. 스텝은 실제 계산 동선 순서:
// 봉투 담기 → 데우기 → 젓가락 → 포인트카드 → 합계 → 결제.
export const c1: Mission = {
  id: 'C1',
  tier: 1,
  scenario: '편의점 계산대',
  place: '편의점',
  sequence: ['봉투', '데우기', '젓가락', '스푼', '포인트카드', '합계', '결제'],
  speakPhraseIds: ['p_card_de', 'p_suica_de', 'p_atatamete'],
  canDo: '사용자는 편의점 계산대에서 봉투·결제 방법·포인트카드·젓가락·데우기 여부를 듣고, 필요/불필요와 결제 수단을 문장으로 답할 수 있다',
  unlockAfter: ['u_b0_reaction', 'u_b4_recovery'],
  steps: [
    {
      situationKo: '계산대에 물건을 올리자 점원이 봉투가 필요한지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_fukuro',
      choices: [
        { text: '네, 부탁합니다 (봉투 필요)', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願いします」— 일본 편의점은 봉투가 유료(3~5엔). 필요하면 한 마디로 바로 요청해요' },
        { text: '아니요, 괜찮습니다 (불필요)', phraseId: 'p_iie_kekkou', correct: true, feedback: '「いいえ、結構(けっこう)です」— 가장 정중한 거절 표현. マイバッグ(개인 장바구니)가 있으면 이렇게 말해요' },
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: true, feedback: '「袋(ふくろ)はいりません」— 직접적인 불필요 표현. 일본은 환경 보호를 위해 봉투 줄이기를 장려해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '도시락을 보고 점원이 데울지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_atatamemasu_ka',
      choices: [
        { text: '데워 주세요', phraseId: 'p_atatamete', correct: true, feedback: '「温(あたた)めてください」— 편의점 도시락·삼각김밥을 데울 때 쓰는 표현. レンジでチンする라고도 해요' },
        { text: '네, 데워 주세요', phraseId: 'p_hai_atatamete', correct: true, feedback: '「はい、温(あたた)めてください」— はい를 앞에 붙이면 더 정중한 인상. おにぎり·도시락 구매 시 가장 자주 쓰는 표현이에요. 점원이 전자레인지(電子レンジ)에 넣어줍니다' },
        { text: '그대로 주세요 (데우지 않아도 돼요)', phraseId: 'p_sono_mama_de', correct: true, feedback: '「そのままで」— 데우지 않을 때 쓰는 가장 자연스러운 한마디. 음료·과자·이미 따뜻한 식품처럼 데울 필요가 없을 때 빠르게 의사 전달이 돼요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '이어서 젓가락이 필요한지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_hashi_irimasu_ka',
      choices: [
        { text: '젓가락 주세요', phraseId: 'p_hashi_kudasai', correct: true, feedback: '「お箸(はし)ください」— 일본 편의점은 젓가락이 무료로 제공돼요. 숟가락은 スプーン、포크는 フォーク라고 해요' },
        { text: '아니요, 필요 없어요', phraseId: 'p_iie_irimasen', correct: true, feedback: '「いいえ、いりません」— 자신의 수저를 갖고 있거나 집에서 먹을 때. 간단하고 명확하게 거절해요' },
        { text: '그대로 주세요 (젓가락 불필요)', phraseId: 'p_sono_mama_de', correct: true, feedback: '데우지 말고 그대로 — 젓가락도 그대로(=불필요)로 통할 수 있어요' },
        { text: '스이카로요', phraseId: 'p_suica_de', correct: false, feedback: '결제 방법과 헷갈리지 마세요 — 지금은 젓가락 질문' },
      ],
    },
    {
      situationKo: '디저트(푸딩·아이스)를 보고 점원이 스푼이 필요한지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_supuun_otsuke',
      choices: [
        { text: '네, 부탁합니다 (스푼 필요)', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願(ねが)いします」— 푸딩·젤리·아이스 등 디저트를 사면 점원이 스푼을 물어봐요. 필요하면 이렇게 답해요' },
        { text: '아니요, 괜찮습니다', phraseId: 'p_iie_kekkou', correct: true, feedback: '「いいえ、結構(けっこう)です」— 집에서 먹거나 내 수저가 있을 때 정중하게 거절해요' },
        { text: '괜찮습니다 (불필요)', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 봉투·스푼·젓가락 모두 大丈夫です 한마디로 가볍게 거절돼요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '물건을 다 담은 뒤 포인트카드가 있는지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_pointo_arimasu_ka',
      choices: [
        { text: '아니요, 없어요', phraseId: 'p_iie_arimasen', correct: true, feedback: '「いいえ、ありません」— 포인트카드가 없을 때. 「作(つく)りますか」(만들까요?)라고 물으면 申(もう)し訳ないですが...로 거절해요' },
        { text: '네, 있어요', phraseId: 'p_hai_arimasu', correct: true, feedback: '「はい、あります」— 포인트카드를 꺼내 건네요. Tポイント·Ponta·nanacoなど 편의점마다 다른 포인트 시스템이 있어요' },
        { text: '영수증 주세요', phraseId: 'p_reshiito_kudasai', correct: false, feedback: '지금은 포인트카드 질문 — 영수증 요청은 흐름이 어긋나요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '그리고 합계 금액을 빠르게 말한다',
      speaker: '점원',
      promptPhraseId: 'p_price',
      choices: [
        { text: '네, 알겠습니다 (금액 확인)', phraseId: 'p_hai_wakarimashita', correct: true, feedback: '금액을 알아들었을 때 はい、わかりました로 답하고 결제를 준비해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '(번역앱 보여주기)', actionText: '번역앱 화면을 보여준다', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '모르겠어요', phraseId: 'p_wakarimasen', correct: false, feedback: '솔직하지만, 막혔을 땐 ゆっくり 요청이 더 생산적' },
      ],
    },
    {
      situationKo: '마지막으로 점원이 결제 방법을 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_shiharai_houhou',
      choices: [
        { text: '현금으로요', phraseId: 'p_genkin_de', correct: true, feedback: '「現金(げんきん)で」— 현금 결제. 점원이 금액을 화면에 보여주니 돈을 내면 돼요. 트레이에 올려놓는 게 일본 방식' },
        { text: '카드로요', phraseId: 'p_card_de', correct: true, feedback: '「カードで」— 카드 결제. 점원이 「こちらにタッチか差(さ)し込(こ)みをお願いします」(여기에 터치하거나 꽂아 주세요)라고 안내해요. タッチ=터치, 差し込み=카드 삽입' },
        { text: '스이카로요', phraseId: 'p_suica_de', correct: true, feedback: '교통카드(Suica)로 편의점 결제도 OK — 「ピッ」 하면 끝' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
  ],
};
