// 현장 모드 응답 세트 — "여행 다닐 때는 정답을 찾는 게 아니라, 질문에 대한 긍정·부정·응용·
// 모르겠다·안 들린다 같은 다양한 대답을 익히는 데 초점을 맞춰야 한다"는 요청(2026-08-04).
//
// 학습 모드의 미션 퀴즈는 "이 상황의 정답 하나를 고르는" 구조라 현장에서는 오히려 부담이 된다.
// 여기서는 채점 없이, 점원이 던지는 실제 질문과 그에 대한 5가지 응답 갈래를 나란히 펼쳐 보여준다.
// 실제 현장에서 필요한 건 "무엇이 정답인가"가 아니라 "지금 내 상황을 어느 갈래로 답할 것인가"이므로.
//
// 문장은 전부 기존 phrases.ts의 표현을 재사용한다(신규 일본어를 지어내지 않음) — phraseId로 참조하고
// 화면에서 CONTENT.phrases를 찾아 표기·읽기·뜻을 가져온다.

/** 응답 갈래 — 어떤 상황에서든 이 5가지면 대화를 이어갈 수 있다. */
export type ReplyKind = 'yes' | 'no' | 'apply' | 'unknown' | 'unheard';

export const REPLY_KIND_LABEL: Record<ReplyKind, string> = {
  yes: '네 (긍정)',
  no: '아니요 (부정)',
  apply: '응용 — 내 상황 말하기',
  unknown: '모르겠어요',
  unheard: '못 알아들었어요',
};

export const REPLY_KIND_TONE: Record<ReplyKind, 'ok' | 'warn' | 'accent' | 'soft'> = {
  yes: 'ok', no: 'warn', apply: 'accent', unknown: 'soft', unheard: 'soft',
};

export interface FieldReply {
  kind: ReplyKind;
  phraseId: string;
  /** 이 갈래를 언제 고르는지 한 줄 안내 — 현장에서 훑어보고 바로 고를 수 있게. */
  when?: string;
}

export interface FieldSituation {
  id: string;
  /** 상대(점원·직원)가 던지는 질문 — 기존 receptive 표현 재사용. */
  promptPhraseId: string;
  /** 어떤 상황인지 한 줄. */
  situationKo: string;
  replies: FieldReply[];
}

export interface FieldScene {
  id: string;
  place: string;       // scene.ts의 place와 맞춰 아이콘·색을 재사용
  label: string;
  situations: FieldSituation[];
}

// 공통 복구 응답 — 모든 상황에 그대로 붙는다(못 알아들었을 때·모를 때는 장면과 무관하게 같다).
const UNKNOWN: FieldReply = { kind: 'unknown', phraseId: 'p_wakarimasen', when: '무슨 뜻인지 모를 때' };
const UNHEARD: FieldReply[] = [
  { kind: 'unheard', phraseId: 'p_mou_ichido', when: '한 번 더 듣고 싶을 때' },
  { kind: 'unheard', phraseId: 'p_yukkuri', when: '너무 빨라서 못 따라갔을 때' },
];

export const FIELD_SCENES: FieldScene[] = [
  {
    id: 'fs_conbini', place: '편의점', label: '편의점',
    situations: [
      {
        id: 'fs_conbini_bag', promptPhraseId: 'p_fukuro_iru', situationKo: '봉투가 필요한지 묻는다',
        replies: [
          { kind: 'yes', phraseId: 'p_onegai_shimasu', when: '봉투를 받을 때' },
          { kind: 'no', phraseId: 'p_irimasen', when: '가방이 있어 사양할 때' },
          { kind: 'apply', phraseId: 'p_daijoubu', when: '짧게 "괜찮아요"로 넘길 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
      {
        id: 'fs_conbini_warm', promptPhraseId: 'p_atatamemasu_ka', situationKo: '데워 줄지 묻는다',
        replies: [
          { kind: 'yes', phraseId: 'p_onegai_shimasu', when: '데워 달라고 할 때' },
          { kind: 'no', phraseId: 'p_daijoubu', when: '그냥 받을 때' },
          { kind: 'apply', phraseId: 'p_atatamete', when: '내가 먼저 데워 달라고 할 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
      {
        id: 'fs_conbini_pay', promptPhraseId: 'p_shiharai_houhou', situationKo: '결제 방법을 묻는다',
        replies: [
          { kind: 'yes', phraseId: 'p_card_de', when: '카드로 낼 때' },
          { kind: 'no', phraseId: 'p_genkin_de', when: '현금으로 낼 때' },
          { kind: 'apply', phraseId: 'p_card_tsukaemasu_ka', when: '카드가 되는지 먼저 확인할 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
    ],
  },
  {
    id: 'fs_restaurant', place: '식당', label: '식당',
    situations: [
      {
        id: 'fs_rest_people', promptPhraseId: 'p_nanmeisama', situationKo: '몇 명인지 묻는다',
        replies: [
          { kind: 'yes', phraseId: 'p_hitori_desu', when: '혼자일 때' },
          { kind: 'no', phraseId: 'p_futari_desu', when: '둘일 때' },
          { kind: 'apply', phraseId: 'p_kauntaa_de_onegai', when: '자리까지 지정하고 싶을 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
      {
        id: 'fs_rest_order', promptPhraseId: 'p_gochuumon', situationKo: '주문을 받는다',
        replies: [
          { kind: 'yes', phraseId: 'p_kore_kudasai', when: '메뉴를 가리키며 주문할 때' },
          { kind: 'no', phraseId: 'p_chotto_matte', when: '아직 못 골랐을 때' },
          { kind: 'apply', phraseId: 'p_osusume_wa', when: '추천을 받고 싶을 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
      {
        id: 'fs_rest_more', promptPhraseId: 'p_ijou_de_yoroshii', situationKo: '주문이 이걸로 끝인지 확인한다',
        replies: [
          { kind: 'yes', phraseId: 'p_ijou_desu', when: '더 없을 때' },
          { kind: 'no', phraseId: 'p_kore_kudasai', when: '더 시킬 때' },
          { kind: 'apply', phraseId: 'p_mizu_kudasai', when: '물만 더 부탁할 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
    ],
  },
  {
    id: 'fs_shop', place: '쇼핑', label: '쇼핑·면세',
    situations: [
      {
        id: 'fs_shop_help', promptPhraseId: 'p_nanika_osagashi_desu_ka', situationKo: '찾는 물건이 있는지 묻는다',
        replies: [
          { kind: 'yes', phraseId: 'p_shichaku', when: '입어보고 싶을 때' },
          { kind: 'no', phraseId: 'p_daijoubu', when: '그냥 둘러볼 때' },
          { kind: 'apply', phraseId: 'p_kore_ikura', when: '가격부터 물을 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
      {
        id: 'fs_shop_wrap', promptPhraseId: 'p_otsutsumi_shimasu_ka', situationKo: '포장해 줄지 묻는다',
        replies: [
          { kind: 'yes', phraseId: 'p_gift_wrapping_onegai', when: '선물 포장을 원할 때' },
          { kind: 'no', phraseId: 'p_daijoubu', when: '그냥 받을 때' },
          { kind: 'apply', phraseId: 'p_menzei_onegai', when: '면세를 함께 요청할 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
    ],
  },
  {
    id: 'fs_transit', place: '역', label: '역·교통',
    situations: [
      {
        id: 'fs_transit_where', promptPhraseId: 'p_doko_made', situationKo: '어디까지 가는지 묻는다',
        replies: [
          { kind: 'yes', phraseId: 'p_made_onegai', when: '지명을 말할 때' },
          { kind: 'no', phraseId: 'p_kono_juusho_de', when: '지도·주소를 보여줄 때' },
          { kind: 'apply', phraseId: 'p_norikae', when: '환승을 물어볼 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
      {
        id: 'fs_transit_seat', promptPhraseId: 'p_jiyuuseki_shitei', situationKo: '자유석·지정석 중 무엇으로 할지 묻는다',
        replies: [
          { kind: 'yes', phraseId: 'p_shiteiseki_de', when: '지정석을 원할 때' },
          { kind: 'no', phraseId: 'p_daijoubu', when: '자유석으로 괜찮을 때' },
          { kind: 'apply', phraseId: 'p_nanbansen', when: '승강장을 확인할 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
    ],
  },
  {
    id: 'fs_hotel', place: '호텔', label: '호텔',
    situations: [
      {
        id: 'fs_hotel_passport', promptPhraseId: 'p_passport_onegai', situationKo: '여권을 요청한다',
        replies: [
          { kind: 'yes', phraseId: 'p_pasupooto_arimasu', when: '바로 건넬 때' },
          { kind: 'no', phraseId: 'p_chotto_matte', when: '가방에서 꺼낼 시간이 필요할 때' },
          { kind: 'apply', phraseId: 'p_yoyaku_shiteimasu', when: '예약자임을 먼저 밝힐 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
      {
        id: 'fs_hotel_breakfast', promptPhraseId: 'p_choushoku_wa', situationKo: '조식 시간을 안내받는다',
        replies: [
          { kind: 'yes', phraseId: 'p_wakarimashita', when: '이해했을 때' },
          { kind: 'no', phraseId: 'p_daijoubu', when: '조식을 안 먹을 때' },
          { kind: 'apply', phraseId: 'p_nanji_made', when: '몇 시까지인지 되물을 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
    ],
  },
  {
    id: 'fs_trouble', place: '길거리', label: '막혔을 때',
    situations: [
      {
        id: 'fs_trouble_stuck', promptPhraseId: 'p_dou_shimashita', situationKo: '무슨 일인지 묻는다 — 말이 막혔을 때',
        replies: [
          { kind: 'yes', phraseId: 'p_nihongo_sukoshi_dake', when: '일본어 수준을 먼저 알릴 때' },
          { kind: 'no', phraseId: 'p_eigo_de', when: '영어로 바꿔보고 싶을 때' },
          { kind: 'apply', phraseId: 'p_yasashii_nihongo', when: '쉬운 일본어를 부탁할 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
      {
        id: 'fs_trouble_lost', promptPhraseId: 'p_dochira_made_ikimasu_ka', situationKo: '길을 잃어 도움을 받을 때',
        replies: [
          { kind: 'yes', phraseId: 'p_michi_oshiete', when: '길을 알려달라고 할 때' },
          { kind: 'no', phraseId: 'p_daijoubu', when: '괜찮다고 사양할 때' },
          { kind: 'apply', phraseId: 'p_sumimasen_koko_doko', when: '현재 위치부터 확인할 때' },
          UNKNOWN, ...UNHEARD,
        ],
      },
    ],
  },
];
