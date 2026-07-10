import type { Mission } from '../types';

// ── Tier 5 고급심화 미션 C41~C50 ──────────────────────────────────────────
// 실생활 마찰(friction)이 높은 상황 — 트러블 교섭·고급 요청·복합 선택.
// 각 미션 기본 3스텝 + advancedSteps.part5.json의 응용·종합 2스텝 = 5스텝.

// C41 — 환불·교환. 영수증 제시 → 이유 설명 → 교환 or 환불 선택.
export const c41: Mission = {
  id: 'C41',
  tier: 5,
  scenario: '환불·교환',
  place: '쇼핑몰 서비스 데스크',
  sequence: ['영수증 제시', '이유 설명', '교환/환불 선택', '처리 완료'],
  speakPhraseIds: ['p_reshiito_kudasai', 'p_hoka_no_iro_arimasu_ka'],
  canDo: '구입한 상품에 문제가 있을 때 영수증을 내고 교환이나 환불을 요청할 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '서비스 데스크에서 직원이 용건을 묻는다',
      speaker: '직원',
      recapPromptJa: 'いらっしゃいませ。本日はどのようなご用件でしょうか',
      recapPromptKo: '어서 오세요. 오늘은 어떤 용건이신가요?',
      choices: [
        { text: '이걸 교환하고 싶어요', phraseId: 'p_koukan_shitai', correct: true, feedback: '「これを交換(こうかん)したいです」— 환불·교환 데스크에서 용건을 명확히 전달하는 첫 마디. 영수증(レシート)을 함께 제시하면 빠르게 진행돼요' },
        { text: '환불로 부탁드려요', phraseId: 'p_henkin_de', correct: true, feedback: '「返金(へんきん)でお願(ねが)いします」— 교환 대신 환불을 원할 때도 첫 마디로 바로 말할 수 있어요' },
        { text: '영수증 주세요', phraseId: 'p_reshiito_kudasai', correct: false, feedback: '영수증은 내가 가져와야 합니다 — 직원에게 달라는 말이 아니에요' },
        { text: '조금 작아요', phraseId: 'p_chotto_chiisai_desu', correct: false, feedback: '먼저 무슨 용건인지 말해요 — 사이즈 같은 이유는 그다음에 설명해요' },
      ],
    },
    {
      situationKo: '직원이 불량인지 사이즈 문제인지 이유를 묻는다',
      speaker: '직원',
      recapPromptJa: 'どのような理由でしょうか',
      recapPromptKo: '어떤 이유이신가요?',
      choices: [
        { text: '조금 작아요', phraseId: 'p_chotto_chiisai_desu', correct: true, feedback: '「ちょっと小(ちい)さいです」— 사이즈가 맞지 않을 때 가장 자연스러운 표현. ちょっと(조금)를 붙이면 부드러운 뉘앙스. 大(おお)きいです(커요)로도 응용할 수 있어요' },
        { text: '다른 색 있나요?', phraseId: 'p_hoka_no_iro_arimasu_ka', correct: true, feedback: '「他(ほか)の色(いろ)はありますか」— 색상 교환 요청. 他の는 "다른"이라는 뜻으로 サイズ·デザインにも応用できます' },
        { text: 'M 사이즈 있나요?', phraseId: 'p_emu_saizu_arimasu_ka', correct: true, feedback: '「Mサイズはありますか」— 원하는 사이즈를 구체적으로 확인하는 표현. S/M/L/XL 모두 카타카나로 표현해요' },
      ],
    },
    {
      situationKo: '직원이 영수증을 가지고 있는지 확인한다',
      speaker: '직원',
      promptPhraseId: 'p_reshiito_omochi',
      choices: [
        { text: '네, 있어요', phraseId: 'p_hai_arimasu', correct: true, feedback: '「はい、あります」— 영수증(レシート)을 건네요. 교환·환불에는 영수증이 필수예요. 카드 결제였다면 결제 카드도 함께 준비해요' },
        { text: '잠깐만 기다려 주세요', phraseId: 'p_chotto_matte', correct: true, feedback: '「ちょっと待(ま)ってください」— 가방에서 영수증을 찾는 동안 양해를 구해요' },
        { text: '영수증 주세요', phraseId: 'p_reshiito_kudasai', correct: false, feedback: '영수증은 내가 가진 걸 보여줘야 해요 — 직원에게 달라는 말이 아니에요' },
      ],
    },
    {
      situationKo: '직원이 환불은 카드로 돌려준다고 안내한다',
      speaker: '직원',
      promptPhraseId: 'p_henkin_card',
      choices: [
        { text: '사용했던 카드랑 같은 건가요?', phraseId: 'p_new_card_kakunin', correct: true, feedback: '「使(つか)ったカードと同(おな)じですか」— 환불 카드가 원래 결제 카드와 같은지 재차 확인하면 착오를 막을 수 있어요' },
        { text: '이걸 교환하고 싶어요', phraseId: 'p_koukan_shitai', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '직원이 교환과 환불 중 어떻게 할지 묻는다',
      speaker: '직원',
      recapPromptJa: '交換とご返金、どちらになさいますか',
      recapPromptKo: '교환과 환불 중 어떻게 하시겠어요?',
      choices: [
        { text: 'M 사이즈로요', phraseId: 'p_emu_saizu_de', correct: true, feedback: '「Mサイズで」— 교환 사이즈를 결정할 때. ～で는 선택을 나타내는 조사예요. Sサイズで·Lサイズで로 바꿔서도 그대로 쓸 수 있어요' },
        { text: 'S 사이즈로요', phraseId: 'p_esu_saizu_de', correct: true, feedback: '「Sサイズで」— S 사이즈 교환 선택. 일본 의류 사이즈는 한국보다 작은 경향이 있으니 교환 전 꼭 착용해보세요' },
        { text: '환불로 부탁드려요', phraseId: 'p_henkin_de', correct: true, feedback: '「返金(へんきん)でお願(ねが)いします」— 교환 대신 환불을 택할 때. 카드 결제는 보통 카드로 돌려받아요' },
      ],
    },
  ],
};

// C42 — 자판기 음료 구입. 동전/IC카드 사용법 → 버튼 선택 → 잔돈 확인.
export const c42: Mission = {
  id: 'C42',
  tier: 5,
  scenario: '자판기',
  place: '자판기',
  sequence: ['결제 수단 투입', '음료 선택', '잔돈 수령'],
  speakPhraseIds: ['p_suica_de', 'p_kore_kudasai'],
  canDo: '자판기에서 IC카드나 동전으로 음료를 사고, 사용법을 모를 때 도움을 요청할 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '자판기 앞에서 사람이 IC카드로 할지 현금으로 할지 물어본다',
      speaker: '상대',
      recapPromptJa: 'ICカードが使えますよ',
      recapPromptKo: 'IC카드를 쓸 수 있어요',
      choices: [
        { text: '스이카로요', phraseId: 'p_suica_de', correct: true, feedback: '「Suicaで」— IC카드로 자판기 결제. 잔액이 부족하면 残高不足(ざんだかふそく)가 뜨니 미리 충전해두면 좋아요' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true, feedback: '「使(つか)い方(かた)を教(おし)えてください」— 자판기 조작이 처음일 때. 옆 사람에게 물어보면 친절하게 알려줘요. 일본 자판기는 세계에서 가장 종류가 다양해요' },
        { text: '영수증 주세요', phraseId: 'p_reshiito_kudasai', correct: false, feedback: '자판기는 영수증이 나오지 않는 경우가 대부분입니다' },
      ],
    },
    {
      situationKo: '자판기에서 무엇을 살지 물어본다 (관광객 돕는 현지인)',
      speaker: '상대',
      recapPromptJa: '何にしますか',
      recapPromptKo: '무엇으로 하시겠어요?',
      choices: [
        { text: '이 버튼 눌러 주세요', phraseId: 'p_kono_botan_oshite', correct: true, feedback: '「このボタンを押(お)してください」— 어떤 버튼인지 모를 때 직접 도움을 구하는 실용 표현. 화면을 가리키며 쓰면 바로 이해해줘요' },
        { text: '커피는 어디예요?', phraseId: 'p_koohii_wa_doko', correct: true, feedback: '「コーヒーはどこですか」— 원하는 음료 위치를 찾을 때. 자판기는 カテゴリー(コーヒー·炭酸/たんさん·お茶/おちゃ 등)별로 구분돼 있어요' },
        { text: '잔돈으로 해 주세요', phraseId: 'p_komakaku', correct: false, feedback: '자판기에서 잔돈 교환 요청은 불가능합니다' },
      ],
    },
    {
      situationKo: '상대가 따뜻한 것과 차가운 것 중 무엇으로 할지 묻는다',
      speaker: '상대',
      promptPhraseId: 'p_hot_ice_dochira',
      choices: [
        { text: '따뜻한 걸로요', phraseId: 'p_hotto_de', correct: true, feedback: '「ホットで」— 자판기는 あたたかい·つめたい 표시가 있어요. 겨울엔 따뜻한 캔커피가 인기예요' },
        { text: '차가운 걸로요', phraseId: 'p_aisu_de', correct: true, feedback: '「アイスで」— 같은 음료도 ホット·アイス 버튼이 따로 있어요' },
        { text: '잔돈으로 해 주세요', phraseId: 'p_komakaku', correct: false, feedback: '자판기에서는 잔돈 교환을 못 해요 — 먼저 음료를 골라요' },
      ],
    },
    {
      situationKo: '고른 음료가 품절이라고 알려준다',
      speaker: '상대',
      promptPhraseId: 'p_urikire',
      choices: [
        { text: '이건 뭐예요?', phraseId: 'p_kore_nani', correct: true, feedback: '「これは何(なん)ですか」— 처음 보는 음료를 물어봐요. 신상·한정 음료가 자주 나와요' },
        { text: '스이카로요', phraseId: 'p_suica_de', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '잔돈이 나왔는데 확인이 필요하다',
      speaker: '상대',
      recapPromptJa: 'おつりは出ましたか',
      recapPromptKo: '거스름돈 나왔나요?',
      choices: [
        { text: '잔돈 확인했어요', phraseId: 'p_kakunin_shimashita', correct: true, feedback: '「確認(かくにん)しました」— 잔돈을 그 자리에서 확인. 자판기·거스름돈은 바로 세어보는 게 좋아요' },
        { text: '잘 모르겠어요', phraseId: 'p_wakarimasen', correct: true, feedback: '「分(わ)かりません」— 잔돈이 제대로 나왔는지 확신이 없을 때. おつりを確認(かくにん)してください라고 주변에 도움을 구할 수도 있어요' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: false, feedback: '잔돈을 확인하는 마무리예요 — 사용법은 앞서 익혔어요' },
      ],
    },
  ],
};

// C43 — ATM 이용. 언어 선택 → 카드 삽입 안내 수령 → 금액 확인.
export const c43: Mission = {
  id: 'C43',
  tier: 5,
  scenario: 'ATM',
  place: '편의점 ATM',
  sequence: ['언어 설정', '카드 삽입', '금액 입력', '현금 수령'],
  speakPhraseIds: ['p_eigo_de', 'p_ikura_desu_ka'],
  canDo: '편의점 ATM에서 외국 카드로 엔화를 인출할 때 안내 멘트를 듣고 필요한 표현을 구사할 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: 'ATM 화면에서 언어 선택을 안내하는 직원에게 도움을 요청한다',
      speaker: '직원',
      recapPromptJa: 'お困りですか',
      recapPromptKo: '불편하신가요?',
      choices: [
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true, feedback: '「使(つか)い方(かた)を教(おし)えてください」— ATM 조작법 도움 요청. 해외 카드(International Card)로 인출하는 방법을 모를 때 직접 도움을 구해요' },
        { text: '잔돈으로 해 주세요', phraseId: 'p_komakaku', correct: false, feedback: 'ATM 현금 인출과 잔돈 교환은 다른 상황입니다' },
      ],
    },
    {
      situationKo: '직원이 카드를 화살표 방향으로 넣으라고 한다',
      speaker: '직원',
      recapPromptJa: 'こちらにカードを入れてください',
      recapPromptKo: '이쪽에 카드를 넣어 주세요',
      choices: [
        { text: '카드 되나요?', phraseId: 'p_card_tsukaemasu_ka', correct: false, feedback: '이미 카드를 쓰려고 준비한 상황 — 다시 물어볼 필요가 없어요' },
        { text: '이 방향 맞아요?', phraseId: 'p_new_kono_muki_de_ii', correct: true, feedback: '「この向(む)きで合(あ)ってますか」— 화살표 방향 안내를 듣고 카드를 넣기 직전에 방향을 재확인하는 자연스러운 대답이에요' },
      ],
    },
    {
      situationKo: '직원이 인출 금액을 입력하라고 안내한다',
      speaker: '직원',
      promptPhraseId: 'p_kingaku_nyuuryoku',
      choices: [
        { text: '만 엔으로 낼게요', phraseId: 'p_ichiman_de', correct: true, feedback: '「一万円(いちまんえん)で」— 인출 금액을 입력. 1,000엔·10,000엔 단위로 뽑을 수 있어요' },
        { text: '카드 되나요?', phraseId: 'p_card_tsukaemasu_ka', correct: false, feedback: '이미 카드를 넣었어요 — 지금은 금액을 입력하면 돼요' },
      ],
    },
    {
      situationKo: '직원이 명세표가 필요한지 묻는다',
      speaker: '직원',
      promptPhraseId: 'p_meisai',
      choices: [
        { text: '처분해 주세요', phraseId: 'p_new_meisai_shobun', correct: true, feedback: '「処分(しょぶん)しておいてください」— 명세표를 굳이 받지 않고 기기 쪽에서 파기해달라고 요청하는 자연스러운 대답이에요. 명세표엔 계좌 정보가 있어 이렇게 처리하는 사람이 많아요' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '인출 금액을 입력 후 수수료 안내 화면이 나타난다. 직원이 확인을 권한다',
      speaker: '직원',
      recapPromptJa: '手数料が表示されていますが、よろしいですか',
      recapPromptKo: '수수료가 표시되어 있는데 괜찮으세요?',
      choices: [
        { text: '추가 요금은 얼마예요?', phraseId: 'p_tsui_ryoukin_ikura', correct: true, feedback: '「追加料金(ついかりょうきん)はいくらですか」— 수수료를 명확히 확인하는 표현. 화면에 表示(ひょうじ)되는 금액을 직접 확인하는 것이 더 빠를 수 있어요' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: false, feedback: '지금은 수수료를 확인하는 중이에요 — 진행 여부를 정하면 돼요' },
      ],
    },
  ],
};

// C44 — 편의점 복합기. 복사·인쇄 안내 → 용지 선택 → 결제.
export const c44: Mission = {
  id: 'C44',
  tier: 5,
  scenario: '편의점 복합기',
  place: '편의점 복합기',
  sequence: ['기기 조작', '용지/컬러 선택', '결제'],
  speakPhraseIds: ['p_tsukaikata', 'p_kore_de'],
  canDo: '편의점 멀티복합기에서 복사·출력을 할 때 기기 조작법을 물어보고 결제까지 마무리할 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '멀티복합기 앞에서 사용법을 모르겠다. 지나가던 직원에게 묻는다',
      speaker: '직원',
      recapPromptJa: 'どのようなご利用ですか',
      recapPromptKo: '어떤 용도로 사용하실 건가요?',
      choices: [
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true, feedback: '「使(つか)い方(かた)を教(おし)えてください」— 복합기 조작을 처음 접할 때. 편의점 직원은 보통 친절하게 도와줘요. 基本(きほん)は画面(がめん)の指示(しじ)に従(したが)えばOK!' },
        { text: '이 버튼을 눌러 주세요', phraseId: 'p_kono_botan_oshite', correct: true, feedback: '「このボタンを押(お)してください」— 어떤 버튼인지 모를 때 직접 도움을 요청하는 표현. 화면을 가리키면서 함께 쓰면 더 효과적이에요' },
        { text: '영수증 주세요', phraseId: 'p_reshiito_kudasai', correct: false, feedback: '아직 이용도 안 했는데 영수증 요청은 맥락과 맞지 않아요' },
      ],
    },
    {
      situationKo: '직원이 흑백인지 컬러인지, 용지 크기를 묻는다',
      speaker: '직원',
      recapPromptJa: 'カラーですか、白黒ですか。用紙はA4でよろしいですか',
      recapPromptKo: '컬러인가요, 흑백인가요? 용지는 A4로 괜찮으세요?',
      choices: [
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: false, feedback: '복사 옵션을 고르는 중이에요 — 사용법은 앞서 물었어요' },
        { text: '컬러로, A4로 부탁드려요', phraseId: 'p_new_karaa_a4_de', correct: true, feedback: '「カラーで、A4でお願いします」— 직원의 두 가지 질문(컬러 여부, 용지 크기)에 순서대로 답하는 자연스러운 응답이에요' },
      ],
    },
    {
      situationKo: '직원이 몇 부 인쇄할지 묻는다',
      speaker: '직원',
      promptPhraseId: 'p_nanbu',
      choices: [
        { text: '하나 주세요', phraseId: 'p_hitotsu_kudasai', correct: true, feedback: '「一(ひと)つ / 一部(いちぶ)」— 인쇄 부수를 말해요. 화면에서 숫자로 지정해도 돼요' },
        { text: '두 개 주세요', phraseId: 'p_futatsu_kudasai', correct: true, feedback: '「二(ふた)つ / 二部(にぶ)」— 여러 부 인쇄. 매수가 많으면 비용도 늘어요' },
      ],
    },
    {
      situationKo: '직원이 양면 인쇄로 할지 묻는다',
      speaker: '직원',
      promptPhraseId: 'p_ryoumen',
      choices: [
        { text: '양면으로 부탁해요', phraseId: 'p_new_ryoumen_de', correct: true, feedback: '「両面(りょうめん)でお願(ねが)いします」— 직원의 양면 인쇄 확인에 그렇게 해달라고 답하는 표현이에요. 종이를 아낄 때 자주 쓰는 선택이죠' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '출력이 끝나고 직원이 결제 방법을 묻는다',
      speaker: '직원',
      recapPromptJa: 'お支払いはどうされますか',
      recapPromptKo: '결제는 어떻게 하시겠어요?',
      choices: [
        { text: '스이카로요', phraseId: 'p_suica_de', correct: true, feedback: '「Suicaで」— IC카드로 복합기 결제. タッチするだけで完了(かんりょう)! 가장 빠르고 편한 결제 방법이에요' },
        { text: '예약했어요', phraseId: 'p_yoyaku_shiteimasu', correct: false, feedback: '복합기 이용에서 예약은 관계없는 개념입니다' },
      ],
    },
  ],
};

// C45 — 온라인 예약 픽업. 예약 확인 → QR/예약번호 제시 → 상품 수령.
export const c45: Mission = {
  id: 'C45',
  tier: 5,
  scenario: '온라인 예약 픽업',
  place: '카페·레스토랑 픽업 카운터',
  sequence: ['예약 확인', 'QR 제시', '상품 수령'],
  speakPhraseIds: ['p_yoyaku_shiteimasu', 'p_mochikaeri_de'],
  canDo: '앱으로 사전 주문한 음료/음식을 카운터에서 픽업할 때 예약 확인과 포장 요청을 자연스럽게 할 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '픽업 카운터에서 직원이 예약 여부를 확인한다',
      speaker: '직원',
      recapPromptJa: 'モバイルオーダーのお客様ですか',
      recapPromptKo: '모바일 주문 고객이신가요?',
      choices: [
        { text: '예약했어요', phraseId: 'p_yoyaku_shiteimasu', correct: true, feedback: '「予約(よやく)しています」— 모바일 주문 픽업 시 첫 마디. QR코드나 주문번호 화면을 미리 열어두면 더 빠르게 처리돼요' },
        { text: '이름은요?', actionText: '이름은요?', correct: false, feedback: '지금 직원이 당신의 이름을 묻는 상황 — 내가 먼저 물어볼 필요가 없어요' },
      ],
    },
    {
      situationKo: '직원이 예약자 이름이나 번호를 묻는다',
      speaker: '직원',
      promptPhraseId: 'p_onamae_wa',
      choices: [
        { text: '스이카로요', phraseId: 'p_suica_de', correct: false, feedback: '이름 확인 상황에서 결제 방법을 말하는 건 맥락이 어긋납니다' },
        { text: '예약한 야마다예요', phraseId: 'p_new_yoyaku_namae_desu', correct: true, feedback: '「予約の山田です」— 픽업 카운터에서 예약자 본인임을 이름으로 밝히는 자연스러운 대답이에요' },
      ],
    },
    {
      situationKo: '직원이 주문번호를 묻는다',
      speaker: '직원',
      promptPhraseId: 'p_chuumon_bangou',
      choices: [
        { text: '번호는 7번이에요', phraseId: 'p_new_bangou_nana_desu', correct: true, feedback: '「番号(ばんごう)は7番(ななばん)です」— 주문번호를 묻는 질문에 구체적인 숫자로 바로 답하는 가장 직접적인 대응이에요' },
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '직원이 더 필요한 것이 있는지 묻는다',
      speaker: '직원',
      recapPromptJa: 'ほかにご注文はございますか',
      recapPromptKo: '더 주문하실 것 있으세요?',
      choices: [
        { text: '이제 충분해요', phraseId: 'p_mou_juubun', correct: true, feedback: '「もう十分(じゅうぶん)です」— 더 권유받을 때 "이제 충분합니다"로 깔끔하게 마무리' },
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '직원이 상품을 건네며 포장인지 매장인지 다시 확인한다',
      speaker: '직원',
      recapPromptJa: 'こちらでお召し上がりですか、お持ち帰りですか',
      recapPromptKo: '매장에서 드실 건가요, 포장이신가요?',
      choices: [
        { text: '포장으로요', phraseId: 'p_mochikaeri_de', correct: true, feedback: '「持(も)ち帰(かえ)りで」— 포장을 명확히 전달하는 표현. スマホアプリで先払(さきばら)いの場合는 회계가 이미 완료된 상태예요' },
        { text: '매장에서요', phraseId: 'p_tennai_de', correct: true, feedback: '「店内(てんない)で」— 카페나 음식점에서 매장 이용 선택. 앉을 자리가 있을 때 선택하면 도자기 컵으로 서비스받을 수 있어요' },
        { text: '포장으로 부탁해요', phraseId: 'p_mochikaeri_de', correct: true, feedback: '「持(も)ち帰(かえ)りでお願いします」— 매장에서 먹으면 「店内(てんない)で」. 픽업 상품은 포장이 기본이에요' },
        { text: '예약했어요', phraseId: 'p_yoyaku_shiteimasu', correct: false, feedback: '이미 예약 확인이 끝난 상황 — 같은 말을 반복할 필요가 없어요' },
      ],
    },
  ],
};

// C46 — 스포츠 관람. 입장 → 좌석 확인 → 음식 주문.
export const c46: Mission = {
  id: 'C46',
  tier: 5,
  scenario: '스포츠 관람',
  place: '야구장·스타디움',
  sequence: ['티켓 확인', '좌석 찾기', '스탠드 음식 주문'],
  speakPhraseIds: ['p_chiketto_wa_kochira_desu', 'p_kore_hitotsu_de_yoroshii_desu_ka'],
  canDo: '스타디움에서 티켓을 보여주고, 좌석 위치를 물어보고, 스탠드 음식을 주문할 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '입구에서 직원이 티켓을 확인한다',
      speaker: '직원',
      recapPromptJa: 'チケットの確認をさせていただきます',
      recapPromptKo: '티켓 확인을 하겠습니다',
      choices: [
        { text: '티켓은 이쪽입니다', phraseId: 'p_chiketto_wa_kochira_desu', correct: true, feedback: '「チケットはこちらです」— 티켓 제시 표현. こちらは"이쪽/여기"의 정중한 말투. 전자티켓(電子チケット)이라면 QR코드 화면을 보여주면 돼요' },
        { text: '여권은 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: false, feedback: '스타디움 입장은 여권이 아닌 티켓이 필요합니다' },
        { text: '이 티켓 사용할 수 있나요?', phraseId: 'p_kono_chiketto_tsukaemasu_ka', correct: true, feedback: '「このチケットは使(つか)えますか」— 전자티켓 유효성이 불확실할 때. 화면을 밝게 하거나 미리 저장해두면 스캔이 빠르게 돼요' },
      ],
    },
    {
      situationKo: '좌석 번호를 찾지 못해 직원에게 좌석 위치를 묻는다',
      speaker: '직원',
      recapPromptJa: 'どのようなお座席をお探しですか',
      recapPromptKo: '어떤 좌석을 찾고 계세요?',
      choices: [
        { text: '장소를 알려 주세요', phraseId: 'p_basho_o_oshiete_kudasai', correct: true, feedback: '「場所(ばしょ)を教(おし)えてください」— 좌석 위치를 모를 때. 티켓에 적힌 座席番号(ざせきばんごう)를 보여주면 직원이 바로 안내해줘요' },
        { text: '한 명이요', phraseId: 'p_hitori_desu', correct: false, feedback: '이미 좌석이 배정된 상황 — 인원 안내는 맥락과 맞지 않아요' },
        { text: '예약했어요', phraseId: 'p_yoyaku_shiteimasu', correct: true, feedback: '「予約(よやく)しています」— 예약 좌석임을 확인시키며 도움을 구할 때. 티켓 화면을 보여주면 직원이 쉽게 좌석 위치를 안내해줘요' },
      ],
    },
    {
      situationKo: '직원이 재입장 스탬프를 찍어 준다고 한다',
      speaker: '직원',
      promptPhraseId: 'p_sainyuujou',
      choices: [
        { text: '또 올게요', phraseId: 'p_mata_kimasu', correct: true, feedback: '「また来(き)ます」— 재입장 도장을 받고 잠깐 나갈 때 "다시 올게요"' },
        { text: '여권은 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: false, feedback: '스탬프 안내 중이에요 — 여권은 필요하지 않아요' },
      ],
    },
    {
      situationKo: '매점에서 응원 메가폰을 권한다',
      speaker: '직원',
      promptPhraseId: 'p_megaphone',
      choices: [
        { text: '무슨 색이 있어요?', phraseId: 'p_new_megahon_iro', correct: true, feedback: '「何色(なにいろ)がありますか」— 팀 컬러 굿즈를 살 때 색상 옵션부터 확인하는 실용적인 질문이에요. 「色」는 いろ로 읽어요' },
        { text: '티켓은 이쪽입니다', phraseId: 'p_chiketto_wa_kochira_desu', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '스탠드에서 직원이 무엇을 드릴지 묻는다',
      speaker: '직원',
      promptPhraseId: 'p_gochuumon',
      choices: [
        { text: '이거 하나로 괜찮으세요?', actionText: '이거 하나로 괜찮으세요?', correct: false, feedback: '직원이 나한테 묻는 말 — 내가 직원에게 쓰는 표현이 아니에요' },
        { text: '맥주 한 잔 더 주세요', phraseId: 'p_biiru_mou_ippai', correct: true, feedback: '「ビールもう一杯(いっぱい)ください」— 추가 주문 표현. もう一杯는 "한 잔 더". 야구장 비어걸(ビールの売(う)り子(こ))이 돌아다니니 손을 들어 부르세요' },
        { text: '하나 주세요', phraseId: 'p_hitotsu_kudasai', correct: true, feedback: '「一(ひと)つください」— 수량 지정 주문. 야구장 명물 음식 도시락(球場弁当/きゅうじょうべんとう)도 꼭 먹어봐요!' },
      ],
    },
  ],
};

// C47 — 쇼핑몰 안내소. 층 안내 → 매장 위치 → 화장실 위치.
export const c47: Mission = {
  id: 'C47',
  tier: 5,
  scenario: '쇼핑몰 안내소',
  place: '복합쇼핑몰',
  sequence: ['층 안내 확인', '목표 매장 위치', '화장실·편의시설 확인'],
  speakPhraseIds: ['p_nanika_osagashi_desu_ka', 'p_toire_doko'],
  canDo: '복합쇼핑몰 안내소에서 원하는 매장 위치와 편의시설을 물어볼 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '안내소 직원이 무엇을 찾는지 묻는다',
      speaker: '직원',
      promptPhraseId: 'p_nanika_osagashi_desu_ka',
      choices: [
        { text: '저거요', phraseId: 'p_are', correct: false, feedback: '안내소에서는 「あれ(저거)」처럼 막연하게 가리키지 말고 구체적인 장소나 물건을 말해야 합니다' },
        { text: '화장실 어디예요?', phraseId: 'p_toire_doko', correct: true, feedback: '「トイレはどこですか」— 화장실 위치 확인. 대형 쇼핑몰은 층별(フロアマップ)을 보거나 안내소에 物어보는 게 빠르기도 해요' },
        { text: '커피는 어디예요?', phraseId: 'p_koohii_wa_doko', correct: true, feedback: '「コーヒーはどこですか」— 안내소에서 특정 매장이나 상품 위치 확인. ○○はどこですか 패턴으로 어떤 매장이든 물어볼 수 있어요' },
      ],
    },
    {
      situationKo: '직원이 원하는 매장 위치를 설명한다. 이해가 안 된다',
      speaker: '직원',
      recapPromptJa: '3階のエスカレーター横にございます',
      recapPromptKo: '3층 에스컬레이터 옆에 있습니다',
      choices: [
        { text: '지도로 보여주실 수 있어요?', phraseId: 'p_new_chizu_misete', correct: true, feedback: '「地図で見せてもらえますか」— 매장 위치 설명이 복잡할 때 지도를 보여달라고 요청하는 게 다시 말해달라는 것보다 더 확실해요' },
        { text: '저거', phraseId: 'p_are', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '직원이 엘리베이터 위치를 안내한다',
      speaker: '직원',
      promptPhraseId: 'p_elevator',
      choices: [
        { text: '가 볼게요', phraseId: 'p_itte_mimasu', correct: true, feedback: '「行(い)ってみます」— 엘리베이터 위치를 안내받고 바로 가 보겠다는 응답' },
        { text: '저거', phraseId: 'p_are', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '직원이 면세 카운터 위치를 알려준다',
      speaker: '직원',
      promptPhraseId: 'p_menzei_counter8',
      choices: [
        { text: '찾아볼게요', phraseId: 'p_sagashite_mimasu', correct: true, feedback: '「探(さが)してみます」— 면세 카운터를 직접 찾아보겠다는 표현' },
        { text: '저거', phraseId: 'p_are', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '계단 위치까지 다시 설명받았다. 감사 인사를 하고 이동한다',
      speaker: '직원',
      recapPromptJa: 'ご案内できましたでしょうか',
      recapPromptKo: '안내가 되셨나요?',
      choices: [
        { text: '덕분에 도움이 됐어요', phraseId: 'p_tasukarimashita', correct: true, feedback: '「助(たす)かりました」— 여러 번 안내해 준 데 대한 자연스러운 응답' },
        { text: '저거', phraseId: 'p_are', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
  ],
};

// C48 — 약국 처방전. 처방전 제출 → 대기 → 복약 지도 수령.
export const c48: Mission = {
  id: 'C48',
  tier: 5,
  scenario: '약국 처방전',
  place: '약국',
  sequence: ['처방전 제출', '대기', '약 수령·복약 설명'],
  speakPhraseIds: ['p_kusuri_kudasai', 'p_shokugo_nonde'],
  canDo: '일본 병원 처방전을 약국에 제출하고, 대기 시간을 확인하며, 복약 지도를 이해할 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '약국 카운터에서 처방전을 제출하려 한다',
      speaker: '약사',
      recapPromptJa: 'お薬手帳はお持ちですか',
      recapPromptKo: '약 수첩이 있으신가요?',
      choices: [
        { text: '아니요, 없어요 (약 수첩 미소지)', phraseId: 'p_iie_arimasen', correct: true, feedback: '「いいえ、ありません」— 처음 방문이라면 없는 것이 자연스러워요. 薬(くすり)手帳(てちょう)は継続的に薬を飲む방에게 있는 건강 관리 수첩이에요' },
        { text: '네, 있어요 (약 수첩 소지)', phraseId: 'p_hai_arimasu', correct: true, feedback: '「はい、あります」— 약 수첩이 있을 때. 手帳(てちょう)を差(さ)し出(だ)しながら말하면 OK. 처방 이력 관리에 중요한 역할을 해요' },
        { text: '보험증이 있나요?', actionText: '보험증이 있나요?', correct: false, feedback: '약사가 먼저 물어보는 상황 — 내가 되묻는 건 맥락과 맞지 않아요' },
      ],
    },
    {
      situationKo: '약사가 조제 완료까지 시간이 걸린다고 한다',
      speaker: '약사',
      recapPromptJa: '少々お待ちください。30分ほどかかります',
      recapPromptKo: '잠시만 기다려 주세요. 30분 정도 걸립니다',
      choices: [
        { text: '완료까지 30분입니다', actionText: '완료까지 30분입니다', correct: false, feedback: '약사가 이미 말한 내용 — 내가 반복할 필요가 없어요' },
        { text: '전화번호를 적어 주세요', actionText: '전화번호를 적어 주세요', correct: false, feedback: '약국 대기 상황에서 연락처 요청은 맥락과 다릅니다' },
        { text: '여기서 기다릴게요', phraseId: 'p_new_koko_de_machimasu', correct: true, feedback: '「ここで待っています」— 30분 정도 걸린다는 안내에 자연스럽게 그 자리에서 기다리겠다고 응답하는 말이에요' },
      ],
    },
    {
      situationKo: '약사가 보험증이 있는지 묻는다',
      speaker: '약사',
      promptPhraseId: 'p_hokenshou_omochi',
      choices: [
        { text: '아니요, 없어요', phraseId: 'p_iie_arimasen', correct: true, feedback: '「いいえ、ありません」— 외국인은 보통 일본 보험증이 없어요. 자비 부담이며 여행자 보험으로 나중에 청구할 수 있어요' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true, feedback: '「パスポートはこちらです」— 신분 확인으로 여권을 요청하기도 해요' },
      ],
    },
    {
      situationKo: '약사가 제네릭 약으로 해도 되는지 묻는다',
      speaker: '약사',
      promptPhraseId: 'p_generic',
      choices: [
        { text: '이 약은 뭐예요?', phraseId: 'p_kono_kusuri', correct: true, feedback: '「この薬(くすり)は何(なん)ですか」— 약의 용도·성분을 확인해요' },
        { text: '아니요, 없어요', phraseId: 'p_iie_arimasen', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '약을 받고 약사가 복약 방법을 설명한다',
      speaker: '약사',
      promptPhraseId: 'p_shokugo_nonde',
      choices: [
        { text: '식후에 먹으면 되나요?', phraseId: 'p_shokugo_kakunin', correct: true, feedback: '「食後(しょくご)に飲(の)めばいいですか」— 복약법을 되물어 확인. 감사보다 안전하게 먹는 게 먼저예요' },
        { text: '이 약은 뭐예요?', phraseId: 'p_kono_kusuri', correct: true, feedback: '「この薬(くすり)は何(なに)ですか」— 약의 용도나 성분이 궁금할 때. 약 봉투에 薬の説明書(せつめいしょ)が入(はい)っている경우가 많아요' },
        { text: '영수증 주세요', phraseId: 'p_reshiito_kudasai', correct: false, feedback: '복약 설명을 듣는 상황에서 영수증 요청은 시기상 어색해요' },
      ],
    },
  ],
};

// C49 — 오마카세 스시. 셰프와 소통 → 알레르기 전달 → 추가 주문.
export const c49: Mission = {
  id: 'C49',
  tier: 5,
  scenario: '오마카세 스시',
  place: '스시 오마카세',
  sequence: ['알레르기 전달', '셰프 설명 듣기', '추가 주문·마무리'],
  speakPhraseIds: ['p_arerugi', 'p_osusume_no_sakana'],
  canDo: '오마카세 스시 카운터에서 알레르기를 전달하고, 셰프의 설명을 듣고, 추가 주문으로 자연스럽게 대화할 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '카운터에 앉자 셰프가 못 드시는 것이 있는지 묻는다',
      speaker: '셰프',
      promptPhraseId: 'p_nigate_na_mono_arimasu_ka',
      choices: [
        { text: '메밀·땅콩 알레르기가 있어요', phraseId: 'p_arerugi', correct: true, feedback: '「そばとピーナッツアレルギーがあります」— 오마카세에서 알레르기를 구체적으로 말하면 셰프가 코스 전체를 배려해줘요. えび(새우)·かに(게) 등 추가 원인도 함께 전달하는 게 안전해요' },
        { text: '이거 빼 주세요', phraseId: 'p_kore_nuite', correct: true, feedback: '「これを抜(ぬ)いてください」— 특정 재료를 제외해달라고 직접 요청. 재료를 가리키거나 말하면 셰프가 배려해줘요. 오마카세는 대화가 요리의 일부예요' },
        { text: '아니요, 아무것도 없어요 (못 드시는 것 없음)', phraseId: 'p_iie_nanimoarimasen', correct: true, feedback: '「いいえ、何(なに)もありません」— 먹지 못하는 것이 없다는 명확한 답변. これで 安心(あんしん)して셰프가 코스를 진행할 수 있어요' },
        { text: '와사비 괜찮으세요?', actionText: '와사비 괜찮으세요?', correct: false, feedback: '셰프가 묻는 역할 — 내가 되묻는 건 맥락이 바뀌어요' },
      ],
    },
    {
      situationKo: '셰프가 오늘의 추천 생선을 소개한다',
      speaker: '셰프',
      recapPromptJa: '本日のおすすめはこちらになります',
      recapPromptKo: '오늘의 추천은 이쪽입니다',
      choices: [
        { text: '추천 생선은 뭐예요?', phraseId: 'p_osusume_no_sakana', correct: true, feedback: '「おすすめの魚(さかな)は何(なに)ですか」— 셰프에게 오늘 제철 재료를 물어보는 표현. 오마카세에선 셰프와의 대화가 요리의 즐거움을 높여줘요' },
        { text: '참치 주세요', phraseId: 'p_maguro_kudasai', correct: true, feedback: '「まぐろください」— 참치는 스시의 대명사. 大トロ(おおとろ)·中トロ(ちゅうとろ)·赤身(あかみ) 등 부위별로 맛이 달라요' },
        { text: '연어 주세요', phraseId: 'p_saamon_kudasai', correct: true, feedback: '「サーモンください」— 연어(サーモン)는 외국인에게 가장 인기 있는 스시 재료. 실은 전통 에도마에 스시에는 없었던 比較的(ひかくてき)新(あたら)しい재료예요' },
        { text: '마늘 빼 주세요', phraseId: 'p_ninniku_nuki', correct: false, feedback: '스시 오마카세에서 마늘 제외는 일반적이지 않아요' },
      ],
    },
    {
      situationKo: '셰프가 오마카세 코스로 진행해도 되는지 확인한다',
      speaker: '셰프',
      promptPhraseId: 'p_omakase_course',
      choices: [
        { text: '추천 생선은 뭐예요?', phraseId: 'p_osusume_no_sakana', correct: true, feedback: '「おすすめの魚(さかな)は何(なに)ですか」— 코스 중에도 그날 특선을 물어봐요' },
        { text: '마늘 빼 주세요', phraseId: 'p_ninniku_nuki', correct: false, feedback: '스시 오마카세에서 마늘 제외는 일반적이지 않아요 — 알레르기는 앞서 전했어요' },
      ],
    },
    {
      situationKo: '셰프가 음료를 권한다',
      speaker: '셰프',
      promptPhraseId: 'p_nomimono',
      choices: [
        { text: '맥주 한 잔 더 주세요', phraseId: 'p_biiru_mou_ippai', correct: true, feedback: '「ビールもう一杯(いっぱい)ください」— 스시엔 日本酒·ビール가 잘 어울려요' },
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true, feedback: '「お水(みず)ください」— 술을 안 마시면 물·차로. 입가심으로 ガリ(초생강)도 곁들여요' },
      ],
    },
    {
      situationKo: '식사 마무리에 셰프가 추가 주문이 있는지 묻는다',
      speaker: '셰프',
      promptPhraseId: 'p_okawari_wa_irimasu_ka',
      choices: [
        { text: '방어 주세요', phraseId: 'p_hamachi_kudasai', correct: true, feedback: '방어(はまち)는 겨울 제철 고급 생선 — 오마카세에서 자주 나옴' },
        { text: '맥주 한 잔 더 주세요', phraseId: 'p_biiru_mou_ippai', correct: true, feedback: '「ビールもう一杯(いっぱい)ください」— 음료 추가 주문. 일본 스시 오마카세엔 日本酒(にほんしゅ)·清酒(せいしゅ)·생맥주(生(なま)ビール) 등 다양한 음료가 있어요' },
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: false, feedback: '아직 추가 주문을 묻는 중이에요 — 마무리 인사는 정말 다 먹은 뒤에 해요' },
      ],
    },
  ],
};

// C50 — 길을 잃었을 때. 현재 위치 파악 → 목적지 방향 질문 → 도보 vs 교통 선택.
export const c50: Mission = {
  id: 'C50',
  tier: 5,
  scenario: '길 잃음·긴급 위치 확인',
  place: '길거리',
  sequence: ['현재 위치 파악', '목적지 방향 질문', '이동 수단 결정'],
  speakPhraseIds: ['p_sumimasen_koko_doko', 'p_michi_oshiete'],
  canDo: '낯선 길에서 현재 위치를 확인하고, 목적지 방향을 물어보며, 도움에 감사 인사를 전할 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '낯선 거리에서 길을 잃었다. 지나가는 사람에게 말을 건다',
      speaker: '상대',
      recapPromptJa: 'どうしましたか',
      recapPromptKo: '무슨 일이에요?',
      choices: [
        { text: '실례합니다, 여기가 어디예요?', phraseId: 'p_sumimasen_koko_doko', correct: true, feedback: '「すみません、ここはどこですか」— 길을 잃었을 때 현재 위치 파악. 스마트폰 지도를 함께 보여주면 "여기에요"라고 바로 알려줘요' },
        { text: '길을 가르쳐 주세요', phraseId: 'p_michi_oshiete', correct: true, feedback: '「道(みち)を教(おし)えてください」— 도움을 요청하는 직접적인 표현. 일본인은 대체로 친절하게 길을 안내해줘요. 지도를 보여주면 더 명확해요' },
        { text: '도와주세요', phraseId: 'p_tasukete', correct: true, feedback: '긴급 상황에서 도움을 구할 때 — 단, 길 잃음에는 과한 표현일 수 있어요' },
        { text: '사진 부탁드려요', phraseId: 'p_shashin_onegai', correct: false, feedback: '길 잃은 상황에서 사진 요청은 완전히 맥락이 맞지 않아요' },
      ],
    },
    {
      situationKo: '상대가 목적지가 어디냐고 묻는다',
      speaker: '상대',
      recapPromptJa: 'どちらに行きたいですか',
      recapPromptKo: '어디에 가고 싶으세요?',
      choices: [
        { text: '역은 어디예요?', phraseId: 'p_eki_wa_doko', correct: true, feedback: '「駅(えき)はどこですか」— 역을 목적지로 삼을 때. 일본은 역이 랜드마크 역할을 해요. 역만 찾으면 대부분의 문제가 해결돼요' },
        { text: '신주쿠역은 어디예요?', phraseId: 'p_shinjuku_doko', correct: true, feedback: '「新宿駅(しんじゅくえき)はどこですか」— 구체적인 역명을 말할 때. ○○駅はどこですか 패턴 하나로 일본 어디서나 쓸 수 있어요' },
        { text: '장소를 알려 주세요', phraseId: 'p_basho_o_oshiete_kudasai', correct: true, feedback: '「場所(ばしょ)を教(おし)えてください」— 목적지 주소나 장소를 알려달라고 할 때. 스마트폰 지도를 보여주며 쓰면 더 효과적이에요' },
        { text: '예약했어요', phraseId: 'p_yoyaku_shiteimasu', correct: false, feedback: '길을 물어보는 상황에서 예약 얘기는 맥락에 맞지 않아요' },
      ],
    },
    {
      situationKo: '상대가 걷는 게 좋을지 전철이 좋을지 묻는다',
      speaker: '상대',
      promptPhraseId: 'p_aruku_densha',
      choices: [
        { text: '걸어서 몇 분이에요?', phraseId: 'p_aruite_nanpun', correct: true, feedback: '「歩(ある)いて何分(なんぷん)ですか」— 도보 시간을 확인해 결정. 가까우면 걷고 멀면 전철·버스를 타요' },
        { text: '역은 어디예요?', phraseId: 'p_eki_wa_doko', correct: true, feedback: '「駅(えき)はどこですか」— 전철을 타려면 가까운 역을 먼저 찾아요' },
        { text: '사진 부탁드려요', phraseId: 'p_shashin_onegai', correct: false, feedback: '지금은 이동 방법을 정하는 중이에요 — 사진 요청은 맥락과 달라요' },
      ],
    },
    {
      situationKo: '상대가 편의점을 표지 삼아 가라고 알려준다',
      speaker: '상대',
      promptPhraseId: 'p_meijirushi',
      choices: [
        { text: '가 볼게요', phraseId: 'p_itte_mimasu', correct: true, feedback: '「行(い)ってみます」— 편의점을 표지 삼아 가 보겠다는 응답' },
        { text: '실례합니다, 여기가 어디예요?', phraseId: 'p_sumimasen_koko_doko', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '상대가 도보 5분이라고 방향을 알려준다. 감사를 표하고 확인한다',
      speaker: '상대',
      recapPromptJa: '歩いて5分ほどです。あちらの方向です',
      recapPromptKo: '걸어서 5분 정도예요. 저쪽 방향입니다',
      choices: [
        { text: '덕분에 도움이 됐어요', phraseId: 'p_tasukarimashita', correct: true, feedback: '「助(たす)かりました」— 방향을 알려준 데 대한 응답' },
        { text: '걸어가 볼게요', phraseId: 'p_aruite_mimasu', correct: true, feedback: '「歩(ある)いてみます」— 도보 5분이면 걸어가 보겠다는 응답' },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: true, feedback: '「どちらですか」— 상대가 가리키는 방향을 재확인할 때. 손으로 방향을 가리키며 함께 쓰면 더 자연스러워요. まっすぐ(직진)·右(오른쪽)·左(왼쪽)도 함께 알아두세요' },
      ],
    },
  ],
};

export const advancedMissions: Mission[] = [
  c41, c42, c43, c44, c45, c46, c47, c48, c49, c50,
];
