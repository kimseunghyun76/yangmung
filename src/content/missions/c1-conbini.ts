import type { Mission } from '../types';

// C1 — 편의점 계산대. 실제 계산 동선을 풍부하게:
// 추가 구매 → 성인 인증 → 봉투 → 데우기 → 수저 → 포인트카드 → 합계(큰 돈) → 결제.
// (응용·종합 2스텝은 advancedSteps.part1.json: IC 잔액 부족 / 거스름돈·영수증 마무리)
export const c1: Mission = {
  id: 'C1',
  tier: 1,
  scenario: '편의점 계산대',
  place: '편의점',
  sequence: ['추가 주문', '성인 인증', '봉투', '데우기', '수저', '포인트카드', '합계', '결제'],
  speakPhraseIds: ['p_oden_hitotsu', 'p_card_de_onegai', 'p_atatamete'],
  canDo: '사용자는 편의점 계산대에서 추가 주문·연령 확인·봉투·데우기·수저·포인트카드·결제·거스름돈까지 실제 흐름에 맞춰 응답할 수 있다',
  unlockAfter: ['u_b0_reaction', 'u_b4_recovery'],
  steps: [
    {
      situationKo: '계산대에 물건을 올리자 점원이 "이게 다인지" 확인한다. 옆 핫스낵 코너가 보인다',
      speaker: '점원',
      promptPhraseId: 'p_ijou_de_yoroshii',
      choices: [
        { text: '어묵 하나 주세요', phraseId: 'p_oden_hitotsu', correct: true, feedback: '「おでんを一(ひと)つください」— 계산대 옆 おでん(어묵)을 추가 주문. 겨울철 편의점의 인기 메뉴예요. 가리키며 말하면 점원이 골라 담아줍니다' },
        { text: '닭튀김 주세요', phraseId: 'p_karaage_kudasai', correct: true, feedback: '「唐揚(からあ)げをください」— 따뜻한 핫스낵 추가. ファミチキ·からあげクン 같은 체인별 인기 메뉴를 가리켜 주문할 수 있어요' },
        { text: '이게 다예요', phraseId: 'p_ijou_desu', correct: true, feedback: '「以上(いじょう)です」— 더 살 게 없으면 "이게 끝"이라는 마무리. 「以上で大丈夫です」도 자연스러워요' },
      ],
    },
    {
      situationKo: '맥주를 함께 사자 점원이 연령 확인을 위해 화면 터치를 요청한다',
      speaker: '점원',
      promptPhraseId: 'p_nenrei_kakunin',
      choices: [
        { text: '스무 살 넘었어요', phraseId: 'p_hatachi_ijou_desu', correct: true, feedback: '「二十歳(はたち)以上(いじょう)です」— 말로 확인해줄 때. 二十歳는 はたち로 읽는 특별한 단어라 알아두면 좋아요' },
        { text: '카드로 부탁드려요', phraseId: 'p_card_de_onegai', correct: false, feedback: '아직 결제 단계가 아니에요 — 지금은 연령 확인을 먼저 해야 해요' },
      ],
    },
    {
      situationKo: '점원이 봉투가 필요한지 묻는다. 산 물건이 꽤 많다',
      speaker: '점원',
      promptPhraseId: 'p_fukuro',
      choices: [
        { text: '큰 봉투로 부탁해요', phraseId: 'p_ookii_fukuro', correct: true, feedback: '「大(おお)きい袋(ふくろ)でお願(ねが)いします」— 짐이 많을 때 큰 봉투를 지정. 작은 건 小(ちい)さい袋. 봉투는 보통 3~5엔 유료예요' },
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: true, feedback: '「袋(ふくろ)はいりません」— 에코백(マイバッグ)이 있을 때. 일본은 봉투 줄이기 문화가 자리잡혀 거절해도 자연스러워요' },
        { text: '아니요, 없어요', phraseId: 'p_iie_arimasen', correct: false, feedback: '지금은 봉투 질문이에요 — 포인트카드는 조금 뒤에 물어봐요' },
      ],
    },
    {
      situationKo: '도시락을 보고 점원이 데울지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_atatamemasu_ka',
      choices: [
        { text: '네, 데워 주세요', phraseId: 'p_hai_atatamete', correct: true, feedback: '「はい、温(あたた)めてください」— 도시락·삼각김밥·찐빵을 데울 때. 점원이 전자레인지(電子レンジ)에 넣어줍니다' },
        { text: '데워 주세요', phraseId: 'p_atatamete', correct: true, feedback: '「温(あたた)めてください」— はい 없이도 통하는 기본 표현. レンジでお願いします라고도 해요' },
        { text: '그대로 주세요', phraseId: 'p_sono_mama_de', correct: true, feedback: '「そのままで」— 데울 필요 없을 때. 음료·과자·이미 따뜻한 식품엔 이 한마디로 빠르게 전달돼요' },
        { text: '큰 봉투로 부탁해요', phraseId: 'p_ookii_fukuro', correct: false, feedback: '봉투는 이미 정했어요 — 지금은 데우기 질문이에요' },
      ],
    },
    {
      situationKo: '도시락·디저트를 보고 점원이 젓가락이나 수저가 필요한지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_hashi_irimasu_ka',
      choices: [
        { text: '젓가락 주세요', phraseId: 'p_hashi_kudasai', correct: true, feedback: '「お箸(はし)ください」— 일본 편의점은 젓가락을 자동으로 안 주는 경우가 많아 직접 말해요. 무료로 제공돼요' },
        { text: '숟가락 주세요', phraseId: 'p_supuun_kudasai', correct: true, feedback: '「スプーンをください」— 푸딩·카레·컵라면엔 숟가락. 포크는 フォーク. 필요한 식기는 직접 말해야 챙겨줘요' },
        { text: '아니요, 필요 없어요', phraseId: 'p_iie_irimasen', correct: true, feedback: '「いいえ、いりません」— 내 수저가 있거나 집에서 먹을 때 간단히 거절해요' },
      ],
    },
    {
      situationKo: '물건을 다 담은 뒤 포인트카드가 있는지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_pointo_arimasu_ka',
      choices: [
        { text: '네, 있어요', phraseId: 'p_hai_arimasu', correct: true, feedback: '「はい、あります」— 포인트카드를 꺼내 건네요. Tポイント·Ponta·nanaco 등 편의점마다 시스템이 달라요' },
        { text: '아니요, 없어요', phraseId: 'p_iie_arimasen', correct: true, feedback: '「いいえ、ありません」— 없을 때. 「お作(つく)りしますか」(만들까요?)라고 물으면 「大丈夫です」로 거절하면 돼요' },
        { text: '아니요, 괜찮습니다 (정중하게 거절)', phraseId: 'p_iie_kekkou', correct: true, feedback: '「いいえ、結構(けっこう)です」— 포인트카드 권유를 정중히 거절하는 표현이에요' },
        { text: '영수증 주세요', phraseId: 'p_reshiito_kudasai', correct: false, feedback: '지금은 포인트카드 질문이에요 — 영수증은 계산 마무리에 받아요' },
      ],
    },
    {
      situationKo: '점원이 합계 금액을 말한다. 지갑에 큰 지폐밖에 없다',
      speaker: '점원',
      promptPhraseId: 'p_price',
      choices: [
        { text: '만 엔으로 낼게요', phraseId: 'p_ichiman_de', correct: true, feedback: '「一万円(いちまんえん)でお願(ねが)いします」— 큰 지폐로 낼 때. 점원이 「一万円お預(あず)かりします」라고 복창하고 거스름돈을 줘요' },
        { text: '어묵 하나 주세요', phraseId: 'p_oden_hitotsu', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '마지막으로 점원이 결제 방법을 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_shiharai_houhou',
      choices: [
        { text: '카드로 부탁드려요', phraseId: 'p_card_de_onegai', correct: true, feedback: '「カードでお願(ねが)いします」— 「カードで」보다 정중한 완성형. 「一括(いっかつ)でよろしいですか」(일시불로?)라고 물으면 「はい、一括で」라고 답해요' },
        { text: '스이카로 부탁드려요', phraseId: 'p_suica_de_onegai', correct: true, feedback: '「Suicaでお願(ねが)いします」— IC카드 결제. 점원이 단말기를 가리키면 카드를 「ピッ」 터치하면 끝나요' },
      ],
    },
  ],
};
