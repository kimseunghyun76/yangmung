import type { Mission } from '../types';

export const c14: Mission = {
  id: 'C14',
  tier: 2,
  place: '카페',
  scenario: '카페에서 음료 주문',
  canDo: '사용자는 카페에서 주문·매장/포장·따뜻함/아이스·사이즈·커스텀·계산을 실제 흐름대로 처리할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['주문', '매장/포장', '따뜻/아이스', '사이즈', '커스텀', '계산'],
  speakPhraseIds: ['p_tennai_de', 'p_hotto_de', 'p_shotto_tsuika'],
  steps: [
    {
      situationKo: '카페 카운터에서 점원이 주문을 받는다',
      speaker: '점원',
      promptPhraseId: 'p_gochuumon',
      choices: [
        { text: '이거 주세요 (메뉴를 가리키며)', phraseId: 'p_kore_kudasai', correct: true, feedback: '「これをください」— 메뉴판이나 진열을 가리키며 주문. 발음이 어려운 메뉴는 가리키는 게 가장 확실해요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 시즌 한정 음료나 인기 메뉴를 물어봐요. 季節限定(きせつげんてい)が狙(ねら)い目!' },
        { text: '메뉴 좀 보여 주세요', phraseId: 'p_menu_misete', correct: true, feedback: '「メニューを見(み)せてください」— 메뉴판을 천천히 보고 싶을 때. 사진·번호로 고르면 편해요' },
        { text: 'M 사이즈로요', phraseId: 'p_emu_saizu_de', correct: false, feedback: '아직 무엇을 마실지 정하기 전이에요 — 사이즈는 메뉴를 고른 뒤에 말해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '점원이 매장에서 마실지 포장할지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_kochira_de_meshiagarimasu_ka',
      choices: [
        { text: '매장에서요', phraseId: 'p_tennai_de', correct: true, feedback: '「店内(てんない)で」— 매장 이용 시 도자기 컵으로 서비스되는 경우가 많아요. 소비세율도 포장과 달라요(매장 10%·포장 8%)' },
        { text: '포장으로요', phraseId: 'p_mochikaeri_de', correct: true, feedback: '「持(も)ち帰(かえ)りで / テイクアウトで」— 포장 시 종이컵으로 받아요. お持ち帰りで라고도 해요' },
        { text: 'S 사이즈로요', phraseId: 'p_esu_saizu_de', correct: false, feedback: '먼저 매장/포장을 정해요 — 사이즈는 조금 뒤에 물어봐요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '점원이 따뜻한 것과 아이스 중 무엇으로 할지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_hot_ice_dochira',
      choices: [
        { text: '따뜻한 걸로요', phraseId: 'p_hotto_de', correct: true, feedback: '「ホットで」— 따뜻한 음료. 추운 날엔 あたたかいの로도 통해요. 컵이 뜨거우면 スリーブ(슬리브)를 요청해도 좋아요' },
        { text: '차가운 걸로요', phraseId: 'p_aisu_de', correct: true, feedback: '「アイスで」— 차가운 음료. 얼음을 줄이려면 「氷(こおり)少(すく)なめで」라고 해요' },
        { text: '포장으로요', phraseId: 'p_mochikaeri_de', correct: false, feedback: '매장/포장은 이미 정했어요 — 지금은 따뜻한지 차가운지 골라요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '음료 사이즈를 고르는 순간',
      speaker: '점원',
      promptPhraseId: 'p_saizu_wa_dou_shimasu_ka',
      choices: [
        { text: 'S 사이즈로요', phraseId: 'p_esu_saizu_de', correct: true, feedback: '「Sサイズで」— 일본 카페 S는 한국보다 작은 경우가 많아요. 양이 부족하면 M이나 L을 고려해요' },
        { text: 'M 사이즈로요', phraseId: 'p_emu_saizu_de', correct: true, feedback: '「Mサイズで」— 가장 일반적인 선택. スターバックス에서는 トール(Tall)이 이에 해당해요' },
        { text: '화장실 어디예요?', phraseId: 'p_toire_doko', correct: false, feedback: '지금은 사이즈 질문이에요 — 먼저 크기를 답하는 게 자연스러워요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '점원이 추가 커스텀이 있는지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_custom_arimasu',
      choices: [
        { text: '샷 추가요', phraseId: 'p_shotto_tsuika', correct: true, feedback: '「ショット追加(ついか)で」— 에스프레소 샷 추가로 진하게. シロップ(시럽)·ミルク変更(우유 변경)도 같은 방식으로 요청해요' },
        { text: '괜찮습니다 (그대로)', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 기본 그대로면 가볍게 사양해요' },
        { text: '따뜻한 걸로요', phraseId: 'p_hotto_de', correct: false, feedback: '따뜻함/아이스는 이미 정했어요 — 지금은 추가 커스텀이 있는지 답해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '받은 뒤 물이 필요하고 계산을 마무리한다',
      speaker: '점원',
      recapPromptJa: 'ほかにご注文はございますか',
      recapPromptKo: '다른 주문 있으세요?',
      choices: [
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true, feedback: '「お水(みず)ください」— 카페에서도 물을 무료로 주는 곳이 많아요. セルフサービスのコップがあれば自分でどうぞ' },
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: true, feedback: '「お会計(かいけい)お願いします」— 카운터에서 말하거나 직원에게 손짓으로도 전달 가능해요' },
        { text: '샷 추가요', phraseId: 'p_shotto_tsuika', correct: false, feedback: '커스텀은 이미 정했어요 — 지금은 추가 주문이나 계산을 말해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c15: Mission = {
  id: 'C15',
  tier: 2,
  place: '빵집',
  scenario: '빵집에서 빵 고르기',
  canDo: '사용자는 빵집에서 빵을 고르고 추천을 듣고, 따로 포장·봉투·결제까지 실제 흐름대로 처리할 수 있다',
  unlockAfter: ['C1'],
  sequence: ['빵 고르기', '추천 빵', '따로 포장', '봉투 확인', '결제'],
  speakPhraseIds: ['p_kore_to_kore', 'p_hitotsu_kudasai', 'p_fukuro_iranai'],
  steps: [
    {
      situationKo: '빵집에서 트레이를 들고 점원이 어떤 빵을 고를지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_dore_ni_shimasu_ka',
      choices: [
        { text: '이거랑 이거요', phraseId: 'p_kore_to_kore', correct: true, feedback: '「これとこれ」— 빵을 가리키며 말하는 가장 안전한 주문법. 일본 빵집은 트레이(トレー)와 집게(トング)로 직접 담는 곳이 많아요' },
        { text: '하나 주세요', phraseId: 'p_hitotsu_kudasai', correct: true, feedback: '「一(ひと)つください」— 개수 표현은 ひとつ·ふたつ·みっつ 패턴. 손가락으로 숫자를 보여주면 더 확실해요' },
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: false, feedback: '먼저 빵을 고르세요 — 봉투는 계산 직전에 정해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '점원이 갓 구운 빵을 추천한다',
      speaker: '점원',
      promptPhraseId: 'p_yakitate_desu',
      choices: [
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: true, feedback: '「これをください」— 갓 구운(焼(や)きたて) 빵을 추천받으면 가리키며 추가해요. 빵 냄새가 좋을 때가 노릴 타이밍이에요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 가게 간판 빵을 물어봐요. メロンパン·あんパン·カレーパン 등 일본 특유의 빵이 많아요' },
        { text: '하나 더 주세요', phraseId: 'p_hitotsu_kudasai', correct: true, feedback: '「もう一(ひと)つください」처럼 もう를 붙이면 "하나 더". 갓 구운 빵은 인기라 금방 팔려요' },
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: false, feedback: '아직 빵을 고르는 중이에요 — 봉투는 계산할 때 정해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '계산대에서 점원이 빵을 따로 포장할지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_betsubetsu_tsutsumi',
      choices: [
        { text: '따로따로요', phraseId: 'p_betsubetsu_de', correct: true, feedback: '「別々(べつべつ)で」— 선물용이거나 나눠줄 때 따로 포장을 부탁해요. 일본 빵집의 개별 포장은 정성스러워요' },
        { text: '괜찮습니다 (같이요)', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 따로 포장이 필요 없으면 한 봉투에 같이. 간단히 사양하면 돼요' },
        { text: '카드로요', phraseId: 'p_card_de', correct: false, feedback: '아직 포장 방식을 정하는 중이에요 — 결제는 마지막에 해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '계산 전 봉투가 필요한지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_fukuro_otsuke_shimasu_ka',
      choices: [
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: true, feedback: '「袋(ふくろ)はいりません」— 환경 보호를 위한 봉투 절약. マイバッグ(에코백)을 챙기면 이 표현을 자주 쓰게 돼요' },
        { text: '네, 부탁합니다', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願いします」— 봉투 요청. 일본 빵집은 종이봉투가 일반적이에요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: false, feedback: '봉투 여부를 먼저 답해요 — 추천 질문은 여기서는 흐름이 맞지 않아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '결제 금액을 듣고 지불한다',
      speaker: '점원',
      promptPhraseId: 'p_okaikei_wa_sennihyakuen_desu',
      choices: [
        { text: '카드로요', phraseId: 'p_card_de', correct: true, feedback: '「カードで」— 최근 일본 빵집도 카드·IC카드를 받는 곳이 늘었어요. 단말기에 탭하면 돼요' },
        { text: '현금으로요', phraseId: 'p_genkin_de', correct: true, feedback: '「現金(げんきん)で」— 현금 결제. 돈은 트레이에 올려놓는 것이 일본식 에티켓이에요' },
        { text: '하나 주세요', phraseId: 'p_hitotsu_kudasai', correct: false, feedback: '빵은 이미 골랐어요 — 지금은 결제 방법을 답해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
  ],
};

export const c16: Mission = {
  id: 'C16',
  tier: 2,
  place: '이자카야',
  scenario: '이자카야에서 주문',
  canDo: '사용자는 이자카야에서 예약·음료·추가 주문·마지막 주문을 처리할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['예약 확인', '첫 음료', '오토시 안내', '음식 추가', '추가 주문'],
  speakPhraseIds: ['p_futari_desu', 'p_osusume_wa', 'p_okaikei'],
  steps: [
    {
      situationKo: '입구에서 예약이 있는지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_yoyaku_wa_arimasu_ka',
      choices: [
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: true, feedback: '「予約(よやく)しています」— 이름도 바로 말하면 빠르게 자리 안내받아요. 「〇〇という名前で予約しています」가 완성형' },
        { text: '두 명이요', phraseId: 'p_futari_desu', correct: true, feedback: '예약이 없어도 인원수를 바로 말하면 안내받기 쉬워요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: false, feedback: '입구에서는 예약 여부나 인원을 먼저 답해요 — 추천은 자리에 앉은 뒤에 물어봐요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '자리에 앉자 첫 음료를 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nomimono_wa_dou_shimasu_ka',
      choices: [
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 이자카야 인기 주류·안주를 현지인 감각으로 추천받아요. 첫 잔은 とりあえずビール(우선 맥주)가 정석이에요' },
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true, feedback: '「お水(みず)ください」— 이자카야에서 물은 대부분 무료. お通し(오토시) 안주와 함께 나오는 경우가 많아요' },
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: false, feedback: '이제 막 앉아 첫 음료를 고르는 중이에요 — 계산은 마지막에 해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '주문하지 않은 작은 안주가 나온다 — 오토시 안내를 듣는다',
      speaker: '점원',
      promptPhraseId: 'p_otoshi_desu',
      choices: [
        { text: '이건 뭐예요?', phraseId: 'p_kore_nani', correct: true, feedback: '「これは何(なん)ですか」— お通し(오토시)는 자릿세 개념의 기본 안주(300~500엔). 주문 안 해도 나오고 거절이 어려운 문화예요' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「わかりました」— 오토시는 일본 이자카야의 관습이에요. 받아들이면 자연스러워요' },
        { text: '잘 먹겠습니다', phraseId: 'p_itadakimasu', correct: true, feedback: '「いただきます」— 오토시(기본 안주)를 받을 때. 자릿세 포함이라 거절은 어려워요' },
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: false, feedback: '이제 막 안주가 나온 참이에요 — 계산은 마지막에 해요' },
      ],
    },
    {
      situationKo: '점원이 음식 주문은 어떻게 할지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_oryouri_ikaga',
      choices: [
        { text: '이거랑 이거요', phraseId: 'p_kore_to_kore', correct: true, feedback: '「これとこれ」— 메뉴를 가리키며 주문. 焼(や)き鳥(とり)·枝豆(えだまめ)·唐揚(からあ)げ는 이자카야 정석 안주예요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 그날의 추천 안주(本日(ほんじつ)のおすすめ)를 물어봐요' },
        { text: '이거 빼 주세요', phraseId: 'p_kore_nuite', correct: true, feedback: '「これを抜(ぬ)いてください」— 못 먹는 재료가 있으면 빼 달라고 해요. 알레르기는 미리 전하면 안전해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '마지막 주문 시간이 되어 추가 주문 여부를 정한다',
      speaker: '점원',
      promptPhraseId: 'p_rasuto_ooda_desu',
      choices: [
        { text: '이거랑 이거요', phraseId: 'p_kore_to_kore', correct: true, feedback: '「これとこれ」— 라스트 오더에도 메뉴를 가리키며 추가 주문 가능. 술은 もう一杯(いっぱい)도 써요' },
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: true, feedback: '「お会計(かいけい)お願いします」— 이자카야는 자리에서 합산 결제가 일반적. お通し 요금도 포함돼요' },
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: false, feedback: '이미 입장해 식사 중이에요 — 라스트 오더엔 추가 주문이나 계산을 말해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
  ],
};

export const c17: Mission = {
  id: 'C17',
  tier: 2,
  place: '스시집',
  scenario: '스시집에서 안전하게 주문',
  canDo: '사용자는 스시집에서 자리·추천 주문·알레르기·와사비를 전달하고 식사를 마무리할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['자리 안내', '추천 주문', '못 먹는 재료', '와사비 확인', '마무리'],
  speakPhraseIds: ['p_osusume_wa', 'p_arerugi', 'p_kore_nuite'],
  steps: [
    {
      situationKo: '스시집에서 카운터석을 안내받는다',
      speaker: '점원',
      promptPhraseId: 'p_kauntaa_de_yoroshii_desu_ka',
      choices: [
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 카운터석 수락 표현. 스시 카운터는 셰프를 바로 앞에서 볼 수 있는 특별한 자리예요' },
        { text: '두 명이요', phraseId: 'p_futari_desu', correct: true, feedback: '「二人(ふたり)です」— 카운터 2인석을 안내받을 때. ひとり·ふたり는 불규칙 형태라 주의해요' },
        { text: '이거 빼 주세요', phraseId: 'p_kore_nuite', correct: false, feedback: '아직 자리 안내 단계예요 — 못 먹는 재료는 주문할 때 말해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '셰프가 무엇부터 쥐어 줄지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nani_kara',
      choices: [
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 그날 좋은 재료를 셰프에게 맡기는 게 스시집의 묘미. おまかせ(오마카세)로 코스를 부탁할 수도 있어요' },
        { text: '참치 주세요', phraseId: 'p_maguro_kudasai', correct: true, feedback: '「マグロください」— 원하는 재료를 직접 지정. 赤身(あかみ)·中(ちゅう)トロ·大(おお)トロ는 참치 부위 이름이에요' },
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: true, feedback: '「これをください」— 쇼케이스의 재료를 가리키며 주문. 이름을 몰라도 가리키면 통해요' },
        { text: '계산 부탁드려요', phraseId: 'p_okaikei', correct: false, feedback: '이제 막 주문을 시작하는 참이에요 — 계산은 다 먹은 뒤에 해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '셰프가 못 먹는 재료가 있는지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nigate_na_mono_arimasu_ka',
      choices: [
        { text: '메밀·땅콩 알레르기가 있어요', phraseId: 'p_arerugi', correct: true, feedback: '「そばとピーナッツアレルギーがあります」— 구체적인 알레르기 원인을 말해야 안전하게 대응해줘요. 스시에서는 えび(새우)·かに(게) 알레르기도 미리 전달하는 게 중요해요' },
        { text: '이거 빼 주세요', phraseId: 'p_kore_nuite', correct: true, feedback: '「これを抜(ぬ)いてください」— 손가락으로 재료를 가리키며 말하면 더 정확하게 전달돼요' },
        { text: '곱빼기 되나요?', phraseId: 'p_oomori', correct: false, feedback: '스시에서는 곱빼기가 없어요 — 못 먹는 재료나 알레르기를 말해야 해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '와사비가 괜찮은지 확인한다',
      speaker: '점원',
      promptPhraseId: 'p_sabi_wa_daijoubu_desu_ka',
      choices: [
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫です」— 와사비 OK 표현. 「さびあり(サビあり)でお願いします」도 같은 의미로 쓰여요' },
        { text: '이거 빼 주세요', phraseId: 'p_kore_nuite', correct: true, feedback: '「これを抜(ぬ)いてください」— 와사비를 빼달라는 뜻으로도 써요. 「サビ抜きで」라고도 해요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: false, feedback: '와사비 여부를 먼저 답하세요 — 추천 질문은 다른 상황이에요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '맛있게 먹고 식사를 마무리한다',
      speaker: '나',
      choices: [
        { text: '맛있어요', phraseId: 'p_oishii', correct: true, feedback: '「おいしい！」— 셰프 앞에서 바로 표현하면 크게 기뻐해요. 카운터 스시는 셰프와의 교감이 즐거움의 절반이에요' },
        { text: '계산 부탁드려요', phraseId: 'p_okaikei', correct: true, feedback: '「お会計(かいけい)お願いします」— 스시 카운터는 자리에서 계산. 현금 선호 가게가 많으니 카드 여부를 미리 확인해요' },
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: true, feedback: '「ごちそうさまでした」— 셰프에게 직접 전하는 마무리 인사. 일본 식사 예절의 핵심이에요' },
        { text: '이거 빼 주세요', phraseId: 'p_kore_nuite', correct: false, feedback: '식사를 마친 단계예요 — 재료 제외 요청은 주문할 때 했어요' },
      ],
    },
  ],
};

export const c18: Mission = {
  id: 'C18',
  tier: 2,
  place: '관광안내소',
  scenario: '관광안내소에서 정보 얻기',
  canDo: '사용자는 관광안내소에서 추천 관광지·가는 방법·지도를 요청하고 감사 인사로 마무리할 수 있다',
  unlockAfter: ['C5'],
  sequence: ['추천 장소 묻기', '가는 방법 확인', '지도 받고 마무리'],
  speakPhraseIds: ['p_osusume_wa', 'p_michi_oshiete', 'p_doko_desu_ka'],
  steps: [
    {
      // 관광안내소 첫 마디 — 원하는 정보(추천·길)를 직원에게 말한다
      situationKo: '관광안내소에 들어서자 직원이 환영한다. 먼저 원하는 정보를 말한다',
      speaker: '안내 직원',
      promptPhraseId: 'p_irasshai',
      choices: [
        { text: '근처 관광지 추천해 주세요', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なに)ですか」— 직원에게 먼저 추천을 요청하는 가장 효율적인 첫 마디. 지도·팸플릿·교통 방법까지 한꺼번에 안내받을 수 있어요' },
        { text: '아사쿠사 가는 길 알려주세요', phraseId: 'p_michi_oshiete', correct: true, feedback: '「道(みち)を教(おし)えてください」— 목적지가 정해졌을 때 바로 길을 물어봐요. 지도 위에 경로를 직접 표시해달라고 하면 더 확실해요' },
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: false, feedback: '관광안내소는 교통표를 파는 곳이 아니에요. 역 창구나 자동발매기를 이용해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      // 추천 관광지 안내 — 위치·가는 방법을 추가로 확인한다
      situationKo: '직원이 근처 추천 관광지를 안내한다',
      speaker: '안내 직원',
      recapPromptJa: '近くには浅草と上野公園がありますよ',
      recapPromptKo: '근처에 아사쿠사와 우에노 공원이 있습니다',
      choices: [
        { text: '어디예요?', phraseId: 'p_doko_desu_ka', correct: true, feedback: '장소를 안내받은 뒤 위치를 더 구체적으로 확인해요' },
        { text: '길을 가르쳐 주세요', phraseId: 'p_michi_oshiete', correct: true, feedback: '「道(みち)を教(おし)えてください」— 걸어갈 수 있는 거리라면 직원에게 지도 위에 직접 경로를 표시해 달라고 하면 더욱 확실해요' },
        { text: '기대돼요', phraseId: 'p_tanoshimi_desu', correct: true, feedback: '「楽(たの)しみです」— 추천 관광지를 듣고 "기대돼요"로 반응' },
        { text: '표 두 장 주세요', phraseId: 'p_kippu_nimai_kudasai', correct: false, feedback: '관광안내소에서는 교통표 구매보다 정보 확인이 먼저예요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      // 지도 수령 — 안내 마무리. 촬영 허가와는 무관한 상황.
      situationKo: '직원이 지도가 필요한지 묻는다',
      speaker: '안내 직원',
      promptPhraseId: 'p_chizu_wa_irimasu_ka',
      choices: [
        { text: '네, 부탁합니다 (지도 요청)', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願いします」— 일본 관광안내소 지도는 한국어판도 많아요. 영어·중국어판도 준비돼 있어요' },
        { text: '그걸로 부탁드려요', phraseId: 'p_sorede_onegai', correct: true, feedback: '「それでお願(ねが)いします」— 지도를 권하면 "그걸로 주세요"로 수락' },
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: false, feedback: '지도를 받는 상황에서 촬영 허가를 묻는 건 맥락이 맞지 않아요. 사진 질문은 신사나 박물관에서 해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '직원이 짐 보관도 가능하다고 안내한다',
      speaker: '안내 직원',
      promptPhraseId: 'p_tenimotsu_azukari',
      choices: [
        { text: '네, 부탁합니다', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願(ねが)いします」— 관광안내소·역의 手荷物預(てにもつあず)かり는 코인로커가 꽉 찼을 때 유용해요. 짐 없이 가볍게 다녀요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '「いくらですか」— 보관 요금을 확인. 개수·크기·시간에 따라 달라요. 무료인 곳도 있어요' },
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 짐이 가벼우면 가볍게 사양해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '직원이 한국어 팸플릿을 건넨다',
      speaker: '안내 직원',
      promptPhraseId: 'p_pamphlet_douzo',
      choices: [
        { text: '덕분에 도움이 됐어요', phraseId: 'p_tasukarimashita', correct: true, feedback: '「助(たす)かりました」— 한국어 팸플릿을 받아 "도움이 됐어요"' },
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: true, feedback: '「これをください」— 다른 지역 팸플릿이 필요하면 가리키며 요청해요. 대부분 무료예요' },
        { text: '이건 뭐예요?', phraseId: 'p_kore_nani', correct: true, feedback: '「これは何(なん)ですか」— 처음 보는 축제·행사 안내가 있으면 물어봐요. 현지 정보를 얻는 좋은 기회예요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c19: Mission = {
  id: 'C19',
  tier: 2,
  place: '신사',
  scenario: '신사와 절에서 예절 지키기',
  canDo: '사용자는 신사에서 조용히 길을 묻고, 참배법·촬영·오미쿠지·부적을 안내받을 수 있다',
  unlockAfter: ['C5'],
  sequence: ['조용히 묻기', '참배 방법', '촬영 확인', '오미쿠지', '부적 위치'],
  speakPhraseIds: ['p_sumimasen_koko_doko', 'p_shashin_ii', 'p_arigatou_gozaimasu'],
  steps: [
    {
      situationKo: '경내에서 길을 몰라 신사 직원에게 말을 건다',
      speaker: '신사 직원',
      promptPhraseId: 'p_dou_nasaimashita_ka',
      choices: [
        { text: '실례합니다, 여기가 어디예요?', phraseId: 'p_sumimasen_koko_doko', correct: true, feedback: '「すみません、ここはどこですか」— 신사 경내 지도를 보여주면서 물어보면 더 효율적이에요' },
        { text: '길을 가르쳐 주세요', phraseId: 'p_michi_oshiete', correct: true, feedback: '「道(みち)を教(おし)えてください」— 신사 안에서는 조용히 낮은 목소리로 물어보는 게 예절이에요' },
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: false, feedback: '먼저 여기가 어디인지 물어요 — 촬영 허가는 그다음에 확인해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '본전 앞에서 직원이 참배 방법을 알려준다',
      speaker: '신사 직원',
      promptPhraseId: 'p_nirei',
      choices: [
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「わかりました」— 二礼二拍手一礼(にれいにはくしゅいちれい): 두 번 절→두 번 박수→소원→한 번 절. 賽銭(さいせん, 봉납금)을 먼저 넣어요' },
        { text: '그렇게 할게요', phraseId: 'p_sou_shimasu', correct: true, feedback: '「そうします」— 참배 방법을 듣고 그대로 따르겠다는 응답' },
        { text: '이건 뭐예요?', phraseId: 'p_kore_nani', correct: true, feedback: '「これは何(なん)ですか」— 手水舎(ちょうずや, 물로 손 씻는 곳)나 처음 보는 시설을 물어봐요. 참배 전 손과 입을 헹궈요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '사진을 찍어도 되는지 확인한다',
      speaker: '신사 직원',
      promptPhraseId: 'p_shashin_wa_daijoubu_desu',
      choices: [
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: true, feedback: '「写真(しゃしん)いいですか」— 신사·사원 내 촬영 허가를 먼저 구하는 것이 일본 예절. 본전(本殿) 내부는 촬영 금지인 곳이 많아요' },
        { text: '조심할게요', phraseId: 'p_ki_o_tsukemasu', correct: true, feedback: '「気(き)をつけます」— 촬영 허락을 받고 "조심해서 찍을게요"' },
        { text: '실례합니다, 여기가 어디예요?', phraseId: 'p_sumimasen_koko_doko', correct: false, feedback: '위치는 이미 안내받았어요 — 지금은 촬영이 가능한지 물어봐요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 오미쿠지(운세 뽑기) 자리를 안내한다',
      speaker: '신사 직원',
      promptPhraseId: 'p_omikuji',
      choices: [
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: true, feedback: '「これをください」— おみくじ(운세)는 보통 100~200엔. 大吉(だいきち, 대길)~凶(きょう, 흉)까지 나와요. 나쁜 운세는 나뭇가지에 묶고 가요' },
        { text: '이건 뭐예요?', phraseId: 'p_kore_nani', correct: true, feedback: '「これは何(なん)ですか」— 오미쿠지 결과 한자를 모를 때 물어봐요. 직원이 뜻을 설명해줘요' },
        { text: '가 볼게요', phraseId: 'p_itte_mimasu', correct: true, feedback: '「行(い)ってみます」— 오미쿠지 자리로 가 보겠다는 응답' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '부적을 사고 싶은데 위치를 안내받는다',
      speaker: '신사 직원',
      promptPhraseId: 'p_omamori_wa_kochira_desu',
      choices: [
        { text: '찾아볼게요', phraseId: 'p_sagashite_mimasu', correct: true, feedback: '「探(さが)してみます」— 부적(お守り) 파는 곳을 찾아보겠다는 응답' },
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: true, feedback: '「これをください」— 부적(お守り)은 종류가 다양해요. 합격·건강·연애 등 목적별로 골라봐요' },
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: false, feedback: '부적을 고르는 중이에요 — 촬영 허가는 앞서 확인했어요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c20: Mission = {
  id: 'C20',
  tier: 2,
  place: '온천',
  scenario: '온천 이용 방법 묻기',
  canDo: '사용자는 온천에서 요금·신발장·문신 규정·수건·입욕 규칙을 이해하고 되물을 수 있다',
  unlockAfter: ['C4'],
  sequence: ['요금 확인', '신발장 안내', '문신 확인', '수건 대여', '입욕 규칙'],
  speakPhraseIds: ['p_ikura_desu_ka', 'p_hai', 'p_wakarimashita_arigatou'],
  steps: [
    {
      situationKo: '온천 접수에서 입욕료를 안내받는다',
      speaker: '접수 직원',
      promptPhraseId: 'p_nyuuyokuryou_wa_happyakuen_desu',
      choices: [
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true, feedback: '「カード使(つか)えますか」— 온천에 따라 현금만 받는 곳도 있어요. 작은 동네 온천일수록 현금 준비를 권해요' },
        { text: '현금으로요', phraseId: 'p_genkin_de', correct: true, feedback: '현금으로 입욕료를 낼 때 — 가장 간단한 결제 표현' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: false, feedback: '방금 800엔이라고 들었어요. 금액을 들은 뒤에는 결제 방법을 말해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 신발을 신발장에 넣으라고 안내한다',
      speaker: '접수 직원',
      promptPhraseId: 'p_getabako_e',
      choices: [
        { text: '그렇게 할게요', phraseId: 'p_sou_shimasu', correct: true, feedback: '「そうします」— 신발을 신발장에 넣으라는 안내를 따르겠다는 응답' },
        { text: '어디예요?', phraseId: 'p_doko_desu_ka', correct: true, feedback: '「どこですか」— 신발장 위치가 헷갈리면 물어봐요. 보통 입구 바로 옆에 있어요' },
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: false, feedback: '결제는 이미 끝났어요 — 지금은 신발장 안내를 따르는 단계예요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 문신이 있는지 확인한다',
      speaker: '접수 직원',
      promptPhraseId: 'p_tattoo_arimasu_ka',
      choices: [
        { text: '아니요, 없어요', phraseId: 'p_iie_arimasen', correct: true, feedback: '「いいえ、ありません」— 일본 온천은 위생·관습상 문신(タトゥー) 입장을 제한하는 곳이 많아요. 작은 문신은 防水(ぼうすい)シール로 가리기도 해요' },
        { text: '네, 있어요', phraseId: 'p_hai_arimasu', correct: true, feedback: '「はい、あります」— 솔직하게 답해요. 문신이 있으면 貸切風呂(かしきりぶろ, 전세탕)를 안내받거나 가림 스티커를 권유받아요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: false, feedback: '요금은 이미 냈어요 — 지금은 문신 여부를 답하는 단계예요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '수건이 필요한지 묻는다',
      speaker: '접수 직원',
      promptPhraseId: 'p_taoru_wa_irimasu_ka',
      choices: [
        { text: '네, 부탁합니다 (수건 요청)', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願いします」— 온천 수건 대여는 보통 유료(100~200엔). バスタオル(목욕 수건)과 フェイスタオル(세면 수건)을 구분해요' },
        { text: '아니요, 필요 없어요', phraseId: 'p_iie_irimasen', correct: true, feedback: '자신의 수건을 갖고 있을 때 — 「いいえ、いりません」으로 간단하게 사양해요' },
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: false, feedback: '수건 여부를 먼저 답해요 — 계산은 나오실 때 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '탕에 들어가기 전 이용 규칙을 듣는다',
      speaker: '접수 직원',
      promptPhraseId: 'p_karada_o_aratte_kudasai',
      choices: [
        { text: '기억해 둘게요', phraseId: 'p_oboete_okimasu', correct: true, feedback: '「覚(おぼ)えておきます」— 이용 규칙을 잊지 않게 기억해 두는 응답' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「分(わ)かりました」— 안내받은 규칙을 이해했다는 응답' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: false, feedback: '규칙 안내를 듣는 중이라 먼저 이해/확인을 답하는 게 좋아요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c21: Mission = {
  id: 'C21',
  tier: 3,
  place: '료칸',
  scenario: '료칸에서 숙박',
  canDo: '사용자는 료칸에서 예약·유카타·식사 시간·목욕탕·이부자리를 확인할 수 있다',
  unlockAfter: ['C4'],
  sequence: ['예약 확인', '유카타', '식사 시간', '목욕탕 위치', '이부자리'],
  speakPhraseIds: ['p_yoyaku_shiteimasu', 'p_choushoku_wa', 'p_wifi_arimasu_ka'],
  steps: [
    {
      situationKo: '료칸 프런트에서 예약 여부를 확인한다',
      speaker: '프런트 직원',
      promptPhraseId: 'p_yoyaku_wa_arimasu_ka',
      choices: [
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: true, feedback: '「予約(よやく)しています」— 료칸에서는 예약자 이름을 이어서 말하면 접수가 빨라요. 「キムです」처럼 성만 말해도 OK' },
        { text: '체크인 부탁드립니다', phraseId: 'p_checkin_onegai', correct: true, feedback: '「チェックインお願いします」— 료칸에서도 호텔과 같은 표현으로 OK. 나막신(下駄)을 신고 들어가는 문화도 확인해요' },
        { text: '조식은요?', phraseId: 'p_choushoku_wa', correct: false, feedback: '먼저 예약·체크인을 확인해요 — 식사 안내는 그다음에 물어봐요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 유카타 사이즈를 묻는다',
      speaker: '프런트 직원',
      promptPhraseId: 'p_yukata_size',
      choices: [
        { text: 'M 사이즈 있나요?', phraseId: 'p_emu_saizu_arimasu_ka', correct: true, feedback: '「Mサイズはありますか」— 浴衣(ゆかた)는 료칸에서 제공돼요. 키에 맞는 사이즈를 받아 온천·식사 때 입어요' },
        { text: '큰 걸로 부탁해요', phraseId: 'p_ookii_no_de', correct: true, feedback: '「大(おお)きいので」— 키가 크면 큰 사이즈를. 帯(おび, 허리띠) 매는 법은 객실 안내문이나 직원에게 물어봐요' },
        { text: '조식은요?', phraseId: 'p_choushoku_wa', correct: false, feedback: '지금은 유카타 사이즈를 정하는 중이에요 — 식사 안내는 그다음에 물어봐요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '저녁 식사 시간 안내를 듣는다',
      speaker: '프런트 직원',
      recapPromptJa: '夕食は六時からご用意できます',
      recapPromptKo: '저녁 식사는 6시부터 준비됩니다',
      choices: [
        { text: '조식은요?', phraseId: 'p_choushoku_wa', correct: true, feedback: '「朝食(ちょうしょく)は？」— 료칸 조식은 방 배달(お部屋食) 또는 식당에서 제공되는 전통 회석(懐石) 스타일이 많아요' },
        { text: '기억해 둘게요', phraseId: 'p_oboete_okimasu', correct: true, feedback: '「覚(おぼ)えておきます」— 저녁 식사 시간을 기억해 두는 응답' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: false, feedback: '식사 시간 안내에는 감사나 추가 질문이 자연스러워요 — 가격은 흐름에 맞지 않아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '목욕탕 위치와 시설을 확인한다',
      speaker: '프런트 직원',
      promptPhraseId: 'p_ofuro_wa_ichikai_desu',
      choices: [
        { text: '가 볼게요', phraseId: 'p_itte_mimasu', correct: true, feedback: '「行(い)ってみます」— 목욕탕 위치를 확인하고 가 보겠다는 응답' },
        { text: '와이파이는 있나요?', phraseId: 'p_wifi_arimasu_ka', correct: true, feedback: '「Wi-Fiはありますか」— 오래된 료칸은 Wi-Fi가 로비에만 있거나 없는 경우도 있어요. 미리 확인이 필수예요' },
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: false, feedback: '체크인은 이미 끝났어요 — 지금은 목욕탕 위치를 확인해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '직원이 이부자리는 나중에 깔아 주겠다고 안내한다',
      speaker: '프런트 직원',
      promptPhraseId: 'p_ofuton',
      choices: [
        { text: '그걸로 부탁드려요', phraseId: 'p_sorede_onegai', correct: true, feedback: '「それでお願(ねが)いします」— 나중에 깔아 준다는 제안을 수락' },
        { text: '네, 부탁합니다', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願(ねが)いします」— 시간을 지정하고 싶으면 「〇時(じ)にお願いします」처럼 말해요' },
        { text: '와이파이는 있나요?', phraseId: 'p_wifi_arimasu_ka', correct: false, feedback: '와이파이는 이미 확인했어요 — 지금은 이부자리 안내에 답할 차례예요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c22: Mission = {
  id: 'C22',
  tier: 3,
  place: '버스',
  scenario: '버스 타고 목적지 가기',
  canDo: '사용자는 버스에서 목적지·IC카드·정리권·하차 벨·하차 위치를 확인할 수 있다',
  unlockAfter: ['C3'],
  sequence: ['목적지 확인', 'IC카드', '정리권', '하차 벨', '하차'],
  speakPhraseIds: ['p_doko_desu_ka', 'p_tsugi_de_orimasu', 'p_wakarimashita_arigatou'],
  steps: [
    {
      situationKo: '운전사가 어디까지 가는지 확인한다',
      speaker: '운전사',
      promptPhraseId: 'p_dochira_made_ikimasu_ka',
      choices: [
        { text: '시부야까지 가주세요', phraseId: 'p_made_onegai', correct: true, feedback: '「渋谷(しぶや)までお願いします」— 버스는 탈 때 목적지를 말하거나 정류장 안내판을 확인하면 돼요. 均一料金(균일요금)인 버스도 있어요' },
        { text: '다음은 시부야예요?', phraseId: 'p_tsugi_wa_shibuya', correct: false, feedback: '목적지를 묻는 질문에는 "〇〇까지 가주세요"로 행선지를 답해요' },
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: false, feedback: '먼저 목적지를 말해요 — 결제 수단은 그다음에 확인해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: 'IC카드를 사용할 수 있다는 안내를 듣는다',
      speaker: '운전사',
      promptPhraseId: 'p_ic_kaado_tsukaemasu',
      choices: [
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true, feedback: '「カード使(つか)えますか」— 버스마다 IC카드(Suica/PASMO) 가능 여부가 달라요. 도심 버스는 대부분 사용 가능해요' },
        { text: '그렇게 할게요', phraseId: 'p_sou_shimasu', correct: true, feedback: '「そうします」— IC카드로 내겠다는 응답' },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: false, feedback: '결제 안내 중이에요 — 방향은 내릴 때 확인해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '뒷문으로 타고 정리권을 뽑으라는 안내를 듣는다',
      speaker: '운전사',
      promptPhraseId: 'p_seiriken',
      choices: [
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「わかりました」— 整理券(せいりけん)은 탄 정류장을 기록한 번호표. 내릴 때 요금표에서 그 번호 요금을 확인해 후불로 내요(IC카드는 불필요)' },
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true, feedback: '「カード使(つか)えますか」— IC카드를 쓰면 정리권 없이 탈 때·내릴 때 터치만 하면 돼요' },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: false, feedback: '지금은 정리권 안내를 따르는 단계예요 — 방향은 내릴 때 확인해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '목적지가 가까워져 하차 벨을 누르고 알린다',
      speaker: '나',
      choices: [
        { text: '다음에서 내려요', phraseId: 'p_tsugi_de_orimasu', correct: true, feedback: '「次(つぎ)で降(お)ります」— 내리기 전 降車(こうしゃ)ボタン(하차 벨)을 눌러요. 안 누르면 정류장을 지나칠 수 있어요' },
        { text: '여기서 세워 주세요', phraseId: 'p_koko_de_tomete', correct: false, feedback: '버스는 정해진 정류장에만 서요 — 「次で降ります」로 다음 정류장에서 내려요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '내릴 정류장을 안내받는다',
      speaker: '운전사',
      promptPhraseId: 'p_tsugi_de_orite_kudasai',
      choices: [
        { text: '기억해 둘게요', phraseId: 'p_oboete_okimasu', correct: true, feedback: '「覚(おぼ)えておきます」— 내릴 정류장을 기억해 두는 응답' },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: true, feedback: '「どちらですか」— 하차 후 목적지 방향을 확인. 버스 정류장에서 지도 앱도 함께 사용하면 편해요' },
        { text: '시부야까지 가주세요', phraseId: 'p_made_onegai', correct: false, feedback: '목적지는 이미 말했어요 — 지금은 내릴 정류장을 확인하는 단계예요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c23: Mission = {
  id: 'C23',
  tier: 3,
  place: '신칸센',
  scenario: '신칸센 표 사고 타기',
  canDo: '사용자는 신칸센 표·좌석/호차·승강장·시간·차내 판매를 확인할 수 있다',
  unlockAfter: ['C3'],
  sequence: ['표 종류', '호차 확인', '승강장', '시간 확인', '차내 판매'],
  speakPhraseIds: ['p_kippu_kudasai', 'p_nan_gousha', 'p_wakarimashita_arigatou'],
  steps: [
    {
      situationKo: '역무원이 자유석인지 확인한다',
      speaker: '역무원',
      promptPhraseId: 'p_jiyuuseki_desu_ka',
      choices: [
        { text: '네, 그렇습니다 (자유석 확인)', phraseId: 'p_hai_sou_desu', correct: true, feedback: '「はい、そうです」— 자유석(自由席) 확인. 혼잡 시간대엔 지정석(指定席)이 더 안전해요. 자유석은 저렴하지만 서서 갈 수도 있어요' },
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫です」— 자유석도 OK라는 뜻으로 통해요. 짧은 거리 신칸센은 자유석으로 충분해요' },
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: false, feedback: '이미 표를 사는 중이에요. 자유석인지 물었으니 はい、そうです로 답해요' },
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: false, feedback: '신칸센 표 구매 중에는 좌석/표 관련 답변이 맞아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '지정석 표를 받아 몇 호차인지 확인한다',
      speaker: '나',
      choices: [
        { text: '몇 호차예요?', phraseId: 'p_nan_gousha', correct: true, feedback: '「何号車(なんごうしゃ)ですか」— 지정석은 표의 号車(호차)·座席番号(좌석번호)를 확인. 승강장 바닥의 号車 위치에서 기다리면 정확히 그 칸 앞에 서요' },
        { text: '몇 번 선이에요?', phraseId: 'p_nanbansen', correct: true, feedback: '「何番線(なんばんせん)ですか」— 호차와 함께 승강장 번호도 확인. 신칸센 홈은 일반 전철과 분리돼 있어요' },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: true, feedback: '「どちらですか」— 진행 방향(上(のぼ)り/下(くだ)り)이 헷갈리면 확인. 도쿄行(ゆ)き인지 표지판을 봐요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '승강장 번호를 안내받는다',
      speaker: '역무원',
      promptPhraseId: 'p_noriba_wa_jyuunibansen_desu',
      choices: [
        { text: '기억해 둘게요', phraseId: 'p_oboete_okimasu', correct: true, feedback: '「覚(おぼ)えておきます」— 승강장 번호를 기억해 두는 응답' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「分(わ)かりました」— 승강장 안내를 이해했다는 응답' },
        { text: '몇 번 선이에요?', phraseId: 'p_nanbansen', correct: false, feedback: '방금 12번선이라고 들었어요. 이미 들은 정보를 다시 물으면 어색해요' },
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: false, feedback: '표는 이미 샀어요 — 지금은 승강장 안내를 확인해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '출발 시간에 주의하라는 안내를 듣는다',
      speaker: '역무원',
      promptPhraseId: 'p_jikan_ni_gochuui_kudasai',
      choices: [
        { text: '조심할게요', phraseId: 'p_ki_o_tsukemasu', correct: true, feedback: '「気(き)をつけます」— 출발 시간에 늦지 않게 "조심하겠습니다"' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「分(わ)かりました」— 시간 주의 안내를 이해했다는 응답' },
        { text: '다음은 시부야예요?', phraseId: 'p_tsugi_wa_shibuya', correct: false, feedback: '시간 주의 안내에 노선 질문은 어긋나요. 먼저 알겠다고 답해요' },
        { text: '몇 번 선이에요?', phraseId: 'p_nanbansen', correct: false, feedback: '승강장은 이미 안내받았어요 — 지금은 출발 시간 주의를 확인해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '차내 판매원이 도시락과 음료를 권한다',
      speaker: '차내 판매원',
      promptPhraseId: 'p_ekiben',
      choices: [
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: true, feedback: '「これをください」— 신칸센 駅弁(えきべん, 역 도시락)은 여행의 별미. 카트(ワゴン)를 가리키며 고르면 돼요' },
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 필요 없으면 가볍게 사양해요. 미리 역에서 駅弁을 사두는 사람도 많아요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '「いくらですか」— 가격 확인 후 현금이나 카드로 결제. 차내 판매는 현금이 편할 때가 많아요' },
        { text: '몇 호차예요?', phraseId: 'p_nan_gousha', correct: false, feedback: '이미 자리에 앉았어요 — 지금은 차내 판매에 답하는 상황이에요' },
      ],
    },
  ],
};

export const c24: Mission = {
  id: 'C24',
  tier: 3,
  place: '렌터카',
  scenario: '렌터카 빌리고 반납',
  canDo: '사용자는 렌터카 카운터에서 면허증·보험·반납 장소·내비·주유 조건을 확인할 수 있다',
  unlockAfter: ['C8'],
  sequence: ['면허증 제시', '보험 선택', '반납 장소', '내비 안내', '주유 조건'],
  speakPhraseIds: ['p_yoyaku_shiteimasu', 'p_card_de', 'p_ryoushuusho'],
  steps: [
    {
      situationKo: '렌터카 카운터에서 면허증을 요청받는다',
      speaker: '카운터 직원',
      promptPhraseId: 'p_menkyo_shou_onegai_shimasu',
      choices: [
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true, feedback: '국제면허증과 여권을 함께 제시하는 것이 정석이에요' },
        { text: '잠깐만 기다려 주세요', phraseId: 'p_chotto_matte', correct: true, feedback: '가방에서 면허증을 찾는 동안 자연스럽게 쓰는 표현이에요' },
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: false, feedback: '면허증을 요청받았으니 증명서를 제시하는 답이 먼저예요' },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: false, feedback: '면허증을 제시하는 단계예요 — 영수증은 반납·정산할 때 받아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 보험은 어떻게 할지 묻는다',
      speaker: '카운터 직원',
      promptPhraseId: 'p_hoken_dou',
      choices: [
        { text: '네, 부탁합니다 (보험 가입)', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願(ねが)いします」— 면책보상제도(免責補償/めんせきほしょう) 가입을 권장해요. 사고 시 자기부담금이 크게 줄어요. 하루 1,000~2,000엔 정도예요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 보험 종류가 헷갈리면 추천을 물어봐요. 외국인 여행자는 풀커버를 택하는 경우가 많아요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '「いくらですか」— 보험료를 확인. 기본 보험 + 추가 보상(NOC 등)으로 나뉘어요' },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: false, feedback: '아직 계약 중이에요 — 영수증은 정산할 때 받아요' },
      ],
    },
    {
      situationKo: '차를 어디에 반납해야 하는지 안내받는다',
      speaker: '카운터 직원',
      promptPhraseId: 'p_henkyaku_basho_wa_kochira_desu',
      choices: [
        { text: '기억해 둘게요', phraseId: 'p_oboete_okimasu', correct: true, feedback: '「覚(おぼ)えておきます」— 반납 장소를 기억해 두는 응답' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「分(わ)かりました」— 반납 장소 안내를 이해했다는 응답' },
        { text: '어디예요?', phraseId: 'p_doko_desu_ka', correct: false, feedback: '방금 이쪽이라고 안내받았어요. 위치를 들었으면 확인 응답을 해요' },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: false, feedback: '반납 장소 안내 단계예요. 영수증은 계산할 때 요청해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 내비게이션은 일본어만 된다고 안내한다',
      speaker: '카운터 직원',
      promptPhraseId: 'p_navi_nihongo',
      choices: [
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true, feedback: '「使(つか)い方(かた)を教(おし)えてください」— 내비는 전화번호나 マップコード(맵코드)로 목적지를 입력해요. 직원이 기본 조작을 알려줘요' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「わかりました」— 일본어 내비가 부담되면 스마트폰 지도 앱을 거치대에 두고 병행해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '반납 전 주유 조건을 듣는다',
      speaker: '카운터 직원',
      promptPhraseId: 'p_gasorin_mantan_de_onegai_shimasu',
      choices: [
        { text: '그렇게 할게요', phraseId: 'p_sou_shimasu', correct: true, feedback: '「そうします」— 가득 채워 반납하라는 조건을 따르겠다는 응답' },
        { text: '카드로요', phraseId: 'p_card_de', correct: true, feedback: '「カードで」— 렌터카 요금을 카드로 결제. 외국 카드는 사전 확인이 필요할 때도 있어요' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: false, feedback: '면허·여권 확인은 이미 끝났어요 — 지금은 주유 조건을 확인해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c25: Mission = {
  id: 'C25',
  tier: 3,
  place: '병원',
  scenario: '병원에서 증상 설명',
  canDo: '사용자는 병원에서 문진표·증상·보험·진료 설명·처방전을 안전하게 처리할 수 있다',
  unlockAfter: ['C6'],
  sequence: ['문진표 작성', '증상 설명', '보험 확인', '진료 설명', '처방전'],
  speakPhraseIds: ['p_atama_itai', 'p_onaka_itai', 'p_yasashii_nihongo'],
  steps: [
    {
      situationKo: '접수에서 문진표를 작성해 달라고 한다',
      speaker: '접수 직원',
      promptPhraseId: 'p_monshinhyou',
      choices: [
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「わかりました」— 問診票(もんしんひょう)는 증상·병력·알레르기를 적는 표예요. 영어 양식을 달라고 「英語(えいご)のはありますか」로 물어봐도 좋아요' },
        { text: '도와주세요', phraseId: 'p_tasukete', correct: true, feedback: '「助(たす)けてください」— 한자 양식이 어려우면 도움을 요청해요. 접수처에서 함께 작성해줄 수 있어요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '카드로요', phraseId: 'p_card_de', correct: false, feedback: '지금은 문진표를 작성하는 단계예요 — 결제는 진료 후에 해요' },
      ],
    },
    {
      situationKo: '접수에서 증상을 말해 달라고 한다',
      speaker: '접수 직원',
      promptPhraseId: 'p_shoujou_o_oshiete_kudasai',
      choices: [
        { text: '머리가 아파요', phraseId: 'p_atama_itai', correct: true, feedback: '「頭(あたま)が痛(いた)いです」— 「〇〇が痛い」패턴으로 어디든 전달 가능해요. 熱(ねつ)があります(열이 있어요)도 함께 말해요' },
        { text: '배가 아파요', phraseId: 'p_onaka_itai', correct: true, feedback: '「お腹(なか)が痛いです」— 복통이 있을 때. 下痢(げり)·嘔吐(おうと)가 있으면 함께 말하면 진료에 도움이 돼요' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: false, feedback: '지금은 증상을 말할 차례예요 — 보험·신분 확인은 그다음에 해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '보험증이 있는지 확인한다',
      speaker: '접수 직원',
      promptPhraseId: 'p_hokenshou_wa_arimasu_ka',
      choices: [
        { text: '아니요, 없어요 (보험증 미소지)', phraseId: 'p_iie_arimasen', correct: true, feedback: '「いいえ、ありません」— 외국인은 보험증 없음. 자비 진료 요금이 청구되는데 여행자 보험으로 나중에 청구 가능해요' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true, feedback: '「パスポートはこちらです」— 병원 접수에서 외국인 신분 확인으로 여권을 요청하는 경우가 많아요' },
        { text: '머리가 아파요', phraseId: 'p_atama_itai', correct: false, feedback: '증상은 이미 말했어요 — 지금은 보험증이 있는지 답해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '의사가 설명할 것이라는 안내를 듣는다',
      speaker: '의료진',
      promptPhraseId: 'p_sensei_ga_setsumei_shimasu',
      choices: [
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '잘 부탁드려요', phraseId: 'p_yoroshiku_onegai', correct: true, feedback: '「よろしくお願(ねが)いします」— 진료를 시작하며 건네는 응답' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「分(わ)かりました」— 의사가 설명할 것이라는 안내를 이해했다는 응답' },
        { text: '카드로요', phraseId: 'p_card_de', correct: false, feedback: '진료 설명 안내에는 결제보다 이해 확인이 먼저예요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '진료가 끝나고 처방전은 옆 약국으로 가라고 안내받는다',
      speaker: '의료진',
      promptPhraseId: 'p_shohousen_tonari',
      choices: [
        { text: '가 볼게요', phraseId: 'p_itte_mimasu', correct: true, feedback: '「行(い)ってみます」— 옆 약국으로 가 보겠다는 응답' },
        { text: '어디예요?', phraseId: 'p_doko_desu_ka', correct: true, feedback: '「どこですか」— 약국 위치가 헷갈리면 물어봐요. 병원 바로 옆이나 길 건너에 있는 경우가 많아요' },
        { text: '카드로요', phraseId: 'p_card_de', correct: true, feedback: '「カードで」— 진료비를 계산. 외국인 자비 진료는 현금을 요구하는 곳도 있으니 미리 확인해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c26: Mission = {
  id: 'C26',
  tier: 3,
  place: '경찰서',
  scenario: '분실물과 길 도움 요청',
  canDo: '사용자는 경찰서에서 분실물 종류·시간·연락처·신고서 작성을 처리할 수 있다',
  unlockAfter: ['C5'],
  sequence: ['도움 요청', '분실물 종류', '잃어버린 시간', '연락처 남기기', '신고서 작성'],
  speakPhraseIds: ['p_tasukete', 'p_saifu_nakushita', 'p_michi_oshiete'],
  steps: [
    {
      situationKo: '파출소에 들어서자 경찰관이 무슨 일인지 묻는다',
      speaker: '경찰관',
      recapPromptJa: 'どうしましたか',
      recapPromptKo: '무슨 일이세요?',
      choices: [
        { text: '도와주세요', phraseId: 'p_tasukete', correct: true, feedback: '「助(たす)けてください」— 경찰관에게 도움을 요청하는 첫 마디. 분실물(遺失物/いしつぶつ)신고는 교반(交番)에서 해요' },
        { text: '일본어가 어려워요', phraseId: 'p_nihon_go_muzukashii', correct: true, feedback: '「日本語(にほんご)が難(むずか)しいです」— 언어 장벽을 솔직하게 말하면 통역 서비스(電話通訳/でんわつうやく)를 연결해줄 수 있어요' },
        { text: '길을 가르쳐 주세요', phraseId: 'p_michi_oshiete', correct: false, feedback: '지금은 무슨 일인지부터 설명해요 — 길 안내는 다른 도움이에요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '경찰관이 무엇을 잃어버렸는지 묻는다',
      speaker: '경찰관',
      promptPhraseId: 'p_nani_nakushita',
      choices: [
        { text: '지갑을 잃어버렸어요', phraseId: 'p_saifu_nakushita', correct: true, feedback: '「財布(さいふ)をなくしました」— 「〇〇をなくしました」패턴. パスポート(여권)·スマホ(스마트폰)로 바꿔 말할 수 있어요. 색·특징도 덧붙이면 좋아요' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: false, feedback: '지금은 무엇을 잃어버렸는지 답할 차례예요 — 여권은 신분 확인 때 보여줘요' },
        { text: '일본어가 어려워요', phraseId: 'p_nihon_go_muzukashii', correct: true, feedback: '「日本語(にほんご)が難(むずか)しいです」— 정확한 설명이 어려우면 통역 도움을 받아요. 그림을 그리거나 사진을 보여줘도 좋아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '언제 잃어버렸는지 추가로 묻는다',
      speaker: '경찰관',
      promptPhraseId: 'p_itsu_nakushimashita_ka',
      choices: [
        { text: '모르겠어요', phraseId: 'p_wakarimasen', correct: true, feedback: '「わかりません」— 언제 잃어버렸는지 모를 때 솔직하게. 경찰관이 다른 방법(사진·CCTV 등)으로 확인해줄 수 있어요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '도와주세요', phraseId: 'p_tasukete', correct: false, feedback: '도움 요청은 이미 했어요 — 지금은 언제 잃어버렸는지 답해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '찾으면 연락하기 위해 연락처를 요청받는다',
      speaker: '경찰관',
      promptPhraseId: 'p_renrakusaki_o_kaite_kudasai',
      choices: [
        { text: '연락 주세요', phraseId: 'p_renraku_kudasai', correct: true, feedback: '「連絡(れんらく)してください」— 분실물을 찾으면 알려달라고 부탁하는 표현' },
        { text: '잠깐만 기다려 주세요', phraseId: 'p_chotto_matte', correct: true, feedback: '연락처를 찾는 동안 잠깐 기다려 달라고 하면 자연스러워요' },
        { text: '도와주세요', phraseId: 'p_tasukete', correct: false, feedback: '지금은 연락처를 적어 달라는 요청이에요 — 도움 요청은 앞서 했어요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '경찰관이 분실 신고서를 작성할지 묻는다',
      speaker: '경찰관',
      promptPhraseId: 'p_funshitsu_todoke',
      choices: [
        { text: '네, 부탁합니다', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願(ねが)いします」— 紛失届(ふんしつとどけ)는 분실 신고서. 여권 분실 시 대사관 재발급에도 이 서류 번호(受理番号/じゅりばんごう)가 필요해요' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「わかりました」— 작성 안내를 이해했을 때. 신용카드 분실이면 카드사에도 바로 정지 요청을 해요' },
        { text: '잠깐만 기다려 주세요', phraseId: 'p_chotto_matte', correct: true, feedback: '「ちょっと待(ま)ってください」— 필요한 정보를 정리하는 동안 양해를 구해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c27: Mission = {
  id: 'C27',
  tier: 3,
  place: '긴급상황',
  scenario: '긴급상황에서 도움 청하기',
  canDo: '사용자는 긴급상황에서 도움 요청·거동 상태·증상·지병·위치를 짧고 명확하게 전달할 수 있다',
  unlockAfter: ['C26'],
  sequence: ['도움 요청', '거동 확인', '구급차 호출', '지병·약', '위치 전달'],
  speakPhraseIds: ['p_tasukete', 'p_atama_itai', 'p_doko_desu_ka'],
  steps: [
    {
      situationKo: '행인이 괜찮은지 묻는다',
      speaker: '행인',
      promptPhraseId: 'p_daijoubu_desu_ka',
      choices: [
        { text: '도와주세요', phraseId: 'p_tasukete', correct: true, feedback: '「助(たす)けてください」— 긴급상황에서 가장 먼저 외쳐야 할 말. 크고 명확하게 말하면 주변 사람이 빠르게 반응해요' },
        { text: '머리가 아파요', phraseId: 'p_atama_itai', correct: true, feedback: '「頭(あたま)が痛(いた)いです」— 긴급할수록 짧고 명확하게. 어디가 아픈지 가리키면서 말하면 더 빠르게 전달돼요' },
        { text: '여기 어디예요?', phraseId: 'p_doko_desu_ka', correct: false, feedback: '먼저 도움과 증상을 알려요 — 위치 확인은 그다음 단계예요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '행인이 움직일 수 있는지 묻는다',
      speaker: '행인',
      promptPhraseId: 'p_ugokemasu_ka',
      choices: [
        { text: '움직일 수 없어요', phraseId: 'p_ugokemasen', correct: true, feedback: '「動(うご)けません」— 거동이 어려우면 무리하지 말고 그대로 도움을 기다려요. 함부로 움직이면 부상이 악화될 수 있어요' },
        { text: '괜찮아요', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 조금 움직일 수 있으면 안전한 곳으로 이동해요. 무리는 금물이에요' },
        { text: '배가 아파요', phraseId: 'p_onaka_itai', correct: true, feedback: '「お腹(なか)が痛いです」— 거동을 답하며 증상도 함께 전하면 더 정확해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '구급차를 부르겠다는 말을 듣는다',
      speaker: '행인',
      promptPhraseId: 'p_kyuukyuusha_o_yobimasu',
      choices: [
        { text: '서둘러 주세요', phraseId: 'p_isoide_kudasai', correct: true, feedback: '「急(いそ)いでください」— 긴급 상황에서 "서둘러 주세요"' },
        { text: '배가 아파요', phraseId: 'p_onaka_itai', correct: true, feedback: '「お腹(なか)が痛いです」— 구급대원에게 증상 전달. 배가 아프면서 어지럽거나 구토가 있으면 함께 말해요' },
        { text: '도와주세요', phraseId: 'p_tasukete', correct: false, feedback: '구급차를 부른다고 했어요 — 지금은 상태(증상)를 전해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '구급대원이 지병이나 복용 약이 있는지 묻는다',
      speaker: '구급대원',
      promptPhraseId: 'p_jibyou',
      choices: [
        { text: '약을 먹고 있어요', phraseId: 'p_kusuri_nondeimasu', correct: true, feedback: '「薬(くすり)を飲(の)んでいます」— 복용 약을 알리면 응급 처치가 안전해져요. 약봉지나 お薬手帳(おくすりてちょう)를 보여주면 더 좋아요' },
        { text: '아니요, 없어요', phraseId: 'p_iie_arimasen', correct: true, feedback: '「いいえ、ありません」— 지병·약이 없으면 그렇게 답해요. 알레르기가 있으면 꼭 함께 전해요' },
        { text: '배가 아파요', phraseId: 'p_onaka_itai', correct: true, feedback: '「お腹(なか)が痛いです」— 지병 질문에 현재 증상도 덧붙이면 진단에 도움이 돼요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '현재 위치를 알려 달라는 요청을 받는다',
      speaker: '구급/행인',
      promptPhraseId: 'p_basho_o_oshiete_kudasai',
      choices: [
        { text: '어디예요?', phraseId: 'p_doko_desu_ka', correct: true, feedback: '「ここはどこですか」— 위치를 모를 때 스마트폰 지도를 보여주는 것도 효과적. 주변 간판이나 번지수를 확인해요' },
        { text: '일본어는 조금만 할 수 있어요', phraseId: 'p_nihongo_sukoshi_dake', correct: true, feedback: '「日本語(にほんご)が少(すこ)しだけできます」— 언어 한계를 솔직히 알리면 구급대원이 쉬운 말로 설명해줘요' },
        { text: '도와주세요', phraseId: 'p_tasukete', correct: false, feedback: '위치를 묻고 있어요 — 어디인지 알려주는 게 먼저예요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
  ],
};

export const c28: Mission = {
  id: 'C28',
  tier: 3,
  place: '통신매장',
  scenario: '유심과 데이터 개통',
  canDo: '사용자는 통신매장에서 요금제·데이터 용량·이용 기간·여권 확인·설정을 처리할 수 있다',
  unlockAfter: ['C7'],
  sequence: ['요금제 선택', '데이터 용량', '이용 기간', '여권 확인', '설정 도움'],
  speakPhraseIds: ['p_kore_ikura', 'p_card_tsukaemasu_ka', 'p_card_de'],
  steps: [
    {
      situationKo: '점원이 어떤 요금제를 원하는지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_dono_puran_ni_shimasu_ka',
      choices: [
        { text: '이거 얼마예요?', phraseId: 'p_kore_ikura', correct: true, feedback: '「これ、いくらですか」— 요금제 가격 확인. 日(ひ)単位(たんい)か月(つき)単位かも確認(かくにん)してね(일별/월별인지도 확인해요)' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 관광객에게 맞는 단기 데이터 요금제를 직원이 추천해줘요' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: false, feedback: '먼저 요금제를 정해요 — 여권 확인은 개통 단계에서 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '점원이 데이터 용량이 얼마나 필요한지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_data_youryou',
      choices: [
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 지도·SNS 위주면 하루 1~3GB로 충분해요. 동영상을 많이 보면 무제한(無制限/むせいげん)을 고려해요' },
        { text: '이거 얼마예요?', phraseId: 'p_kore_ikura', correct: true, feedback: '「これ、いくらですか」— 용량별 가격을 비교. 무제한과 용량제 중 여행 스타일에 맞게 골라요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '「いくらですか」— 용량을 정하면서 가격도 확인. eSIM이면 QR로 바로 개통되기도 해요' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: false, feedback: '아직 요금제를 고르는 중이에요 — 여권은 개통할 때 보여줘요' },
      ],
    },
    {
      situationKo: '점원이 며칠간 이용할지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nannichikan',
      choices: [
        { text: '일주일이요', phraseId: 'p_isshuukan', correct: true, feedback: '「一週間(いっしゅうかん)です」— 이용 기간을 말해요. 8일·15일·30일권 등 기간별 상품이 있어요' },
        { text: '3일이요', phraseId: 'p_mikka', correct: true, feedback: '「三日(みっか)です」— 짧은 여행이면 단기권이 경제적이에요. 날수 표현은 불규칙하니 외워두면 편해요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 체류 일수에 맞는 상품을 추천받아요. 남는 날은 아깝지 않게 딱 맞춰요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '개통을 위해 여권 확인을 요청받는다',
      speaker: '점원',
      promptPhraseId: 'p_pasupooto_kakunin_shimasu',
      choices: [
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true, feedback: '「パスポートはこちらです」— 일본 통신 SIM 개통에는 여권이 필수. 외국인 등록 의무에 따라 신분 확인이 필요해요' },
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: false, feedback: '여권 확인 단계예요. 결제 질문은 개통이 끝난 뒤에 해요' },
        { text: '이거 얼마예요?', phraseId: 'p_kore_ikura', correct: false, feedback: '지금은 여권을 보여줄 차례예요 — 가격은 이미 확인했어요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 휴대폰 설정을 도와주겠다고 한다',
      speaker: '점원',
      promptPhraseId: 'p_settei_o_tetsudaimasu',
      choices: [
        { text: '네, 부탁합니다 (설정 도움 요청)', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願いします」— 직원이 SIM 삽입부터 APN 설정까지 도와줘요. 설정 후 「繋(つな)がりましたか」(연결됐나요?)로 확인까지!' },
        { text: '괜찮습니다 (혼자 할게요)', phraseId: 'p_daijoubu_desu', correct: true, feedback: '설정 도움이 필요 없을 때 정중하게 사양하는 표현' },
        { text: '카드로요', phraseId: 'p_card_de', correct: false, feedback: '설정을 도와준다는 제안에는 수락/사양으로 답해요. 결제는 그다음이에요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c29: Mission = {
  id: 'C29',
  tier: 3,
  place: '코인세탁',
  scenario: '코인세탁기 사용',
  canDo: '사용자는 코인세탁소에서 기계 위치·세탁/건조 코스·세제·완료 시간·건조 완료를 확인할 수 있다',
  unlockAfter: ['C4'],
  sequence: ['기계 찾기', '코스 선택', '세제 확인', '완료 시간', '건조 완료'],
  speakPhraseIds: ['p_tsukaikata', 'p_sentaku_de', 'p_wakarimashita_arigatou'],
  steps: [
    {
      situationKo: '직원 또는 주변 사람이 세탁기 위치를 알려준다',
      speaker: '안내 직원',
      promptPhraseId: 'p_senntakuki_wa_kochira_desu',
      choices: [
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true, feedback: '「使い方を教えてください」— 일본 코인세탁기는 세탁→헹굼→탈수 코스를 선택하는 형식이에요. 직접 눌러줄 만큼 친절해요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '「いくらですか」— 세탁(洗濯) 600~700엔, 건조(乾燥) 100엔/8분 정도. 동전 100엔짜리 여러 개 미리 준비해요' },
        { text: '스이카로요', phraseId: 'p_suica_de', correct: false, feedback: '코인세탁기는 보통 동전으로 써요 — 먼저 사용법을 물어봐요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 세탁인지 건조인지 묻는다',
      speaker: '안내 직원',
      promptPhraseId: 'p_sentaku_kansou',
      choices: [
        { text: '세탁이요', phraseId: 'p_sentaku_de', correct: true, feedback: '「洗濯(せんたく)で」— 빨래를 처음부터 할 때. 일체형 기계는 洗濯から乾燥まで(세탁부터 건조까지) 한 번에 되는 곳도 있어요' },
        { text: '건조요', phraseId: 'p_kansou_de', correct: true, feedback: '「乾燥(かんそう)で」— 빨래만 따로 말릴 때. 호텔에서 손빨래한 옷을 건조기만 돌리러 오기도 해요' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true, feedback: '「使(つか)い方(かた)を教(おし)えてください」— 코스 선택이 헷갈리면 물어봐요. 그림 안내가 붙어 있는 기계도 많아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '세제가 자동인지 안내받는다',
      speaker: '안내 직원',
      promptPhraseId: 'p_senzai_wa_jidou_desu',
      choices: [
        { text: '그렇게 할게요', phraseId: 'p_sou_shimasu', correct: true, feedback: '「そうします」— 세제가 자동이라는 안내를 따르겠다는 응답' },
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫です」— 세제 안내를 이해했을 때 간단하게 OK 표현' },
        { text: '스이카로요', phraseId: 'p_suica_de', correct: false, feedback: '세제 안내 중에는 결제 수단보다 이해 확인이 먼저예요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '세탁 완료까지 걸리는 시간을 듣는다',
      speaker: '안내 직원',
      promptPhraseId: 'p_kanryou_made_sanjuppun_desu',
      choices: [
        { text: '기억해 둘게요', phraseId: 'p_oboete_okimasu', correct: true, feedback: '「覚(おぼ)えておきます」— 세탁 완료 시간을 기억해 두는 응답' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「分(わ)かりました」— 완료 시간 안내를 이해했다는 응답' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: false, feedback: '사용법은 이미 익혔어요 — 지금은 완료 시간을 확인하면 돼요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '건조가 끝났다는 안내를 듣고 빨래를 꺼낸다',
      speaker: '안내 직원',
      promptPhraseId: 'p_kansou_owari',
      choices: [
        { text: '확인했어요', phraseId: 'p_kakunin_shimashita', correct: true, feedback: '「確認(かくにん)しました」— 빨래를 다 꺼냈는지 확인하는 응답' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「わかりました」— 덜 말랐으면 동전을 더 넣어 시간을 추가할 수 있어요' },
        { text: '건조요', phraseId: 'p_kansou_de', correct: true, feedback: '「乾燥(かんそう)で」— 더 말리고 싶으면 건조를 한 번 더. 두꺼운 옷은 시간이 더 필요해요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: false, feedback: '요금은 이미 냈어요 — 지금은 빨래를 꺼내 마무리하면 돼요' },
      ],
    },
  ],
};

export const c30: Mission = {
  id: 'C30',
  tier: 3,
  place: '축제',
  scenario: '축제와 행사 즐기기',
  canDo: '사용자는 축제에서 표·먹거리·노점 게임·입구 방향·불꽃놀이 자리를 확인할 수 있다',
  unlockAfter: ['C18'],
  sequence: ['표 사기', '먹거리 주문', '노점 게임', '입구 확인', '불꽃놀이 자리'],
  speakPhraseIds: ['p_kippu_kudasai', 'p_kore_kudasai', 'p_shashin_ii'],
  steps: [
    {
      situationKo: '행사 입구에서 표가 몇 장인지 묻는다',
      speaker: '안내 직원',
      promptPhraseId: 'p_nanmai_desu_ka',
      choices: [
        { text: '표 두 장 주세요', phraseId: 'p_kippu_nimai_kudasai', correct: true, feedback: '「切符(きっぷ)2枚(まい)ください」— 일본 축제·행사 입장권. 현금만 받는 곳이 많으니 小銭(こぜに)를 준비해요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '「いくらですか」— 장당 얼마인지 확인. 子供料金(こどもりょうきん)이 따로 있는지도 물어봐요' },
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: false, feedback: '먼저 입장권을 사요 — 촬영은 입장한 뒤에 확인해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '노점에서 이 음식 하나면 되는지 확인한다',
      speaker: '노점 점원',
      promptPhraseId: 'p_kore_hitotsu_de_yoroshii_desu_ka',
      choices: [
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: true, feedback: '「これをください」— 노점에서 손가락으로 가리키며 주문하는 가장 안전한 방법. 야키소바·타코야키·たい焼き 등 다양해요' },
        { text: '하나 주세요', phraseId: 'p_hitotsu_kudasai', correct: true, feedback: '「一(ひと)つください」— 노점 먹거리는 보통 1개 단위. 手(て)で受(う)け取(と)れるものが多い(손으로 받는 것이 많아요)' },
        { text: '표 두 장 주세요', phraseId: 'p_kippu_nimai_kudasai', correct: false, feedback: '입장권은 이미 샀어요 — 지금은 먹거리를 주문해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '노점 주인이 금붕어 뜨기를 권한다',
      speaker: '노점 점원',
      promptPhraseId: 'p_kingyo_sukui',
      choices: [
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: true, feedback: '「これをください」— 金魚(きんぎょ)すくい·射的(しゃてき, 사격)·輪投(わな)げ는 일본 축제 노점 게임. 종이 뜰채(ポイ)로 금붕어를 떠요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '「いくらですか」— 노점 게임은 보통 1회 300~500엔. 잡은 금붕어를 가져가거나 경품으로 바꾸기도 해요' },
        { text: '이건 뭐예요?', phraseId: 'p_kore_nani', correct: true, feedback: '「これは何(なん)ですか」— 처음 보는 게임이나 간식을 물어봐요. 점원이 신나게 설명해줘요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '입구 방향과 사진 가능 여부를 확인한다',
      speaker: '안내 직원',
      promptPhraseId: 'p_iriguchi_wa_migi_desu',
      choices: [
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: true, feedback: '「写真(しゃしん)いいですか」— 퍼레이드·공연 촬영 전 허가를 구하는 에티켓. 손짓으로 카메라를 가리키며 묻는 것도 통해요' },
        { text: '그렇게 할게요', phraseId: 'p_sou_shimasu', correct: true, feedback: '「そうします」— 입구 방향·촬영 안내를 따르겠다는 응답' },
        { text: '표 두 장 주세요', phraseId: 'p_kippu_nimai_kudasai', correct: false, feedback: '표는 이미 샀어요 — 지금은 입구 방향과 촬영 여부를 확인해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '직원이 불꽃놀이는 강변에서 볼 수 있다고 안내한다',
      speaker: '안내 직원',
      promptPhraseId: 'p_hanabi_kasenjiki',
      choices: [
        { text: '기대돼요', phraseId: 'p_tanoshimi_desu', correct: true, feedback: '「楽(たの)しみです」— 불꽃놀이 안내를 듣고 "기대돼요"' },
        { text: '어디예요?', phraseId: 'p_doko_desu_ka', correct: true, feedback: '「どこですか」— 강변 위치를 구체적으로 확인. 지도 앱과 함께 보면 길을 잃지 않아요' },
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: true, feedback: '「写真(しゃしん)いいですか」— 불꽃놀이는 삼각대 사용이 제한되는 곳도 있어요. 주변에 방해되지 않게 촬영해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const moreMissions: Mission[] = [
  c14, c15, c16, c17, c18, c19, c20, c21, c22, c23, c24, c25, c26, c27, c28, c29, c30,
];
