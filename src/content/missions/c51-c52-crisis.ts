import type { Mission } from '../types';

// ── Tier 5 위기 대응 미션 C51~C52 ────────────────────────────────────────
// 전체 콘텐츠 재검수에서 확인된 공백(지진·재난 대응, 병원 접수) 보강.
// C27(갑작스러운 부상·통증)·C26(분실물 신고)·C48(약국 처방전)과 겹치지 않게
// "지진 발생 시 행동요령"과 "병원 접수·카드 결제 문제"만 다룬다.

// C51 — 지진·재난 대응. 지진 발생 → 흔들림 후 대피 확인 → 대피 장소 → 교통 중단 → 안전 알리기.
export const c51: Mission = {
  id: 'C51',
  tier: 5,
  scenario: '지진·재난 대응',
  place: '실내·길거리',
  sequence: ['지진 발생', '흔들림 후 확인', '대피 장소', '교통 중단 안내', '안전 알리기'],
  speakPhraseIds: ['p_hinan_subeki_desu_ka', 'p_watashi_wa_daijoubu_desu'],
  canDo: '지진이 발생했을 때 즉각 대응하고, 대피 여부와 장소를 확인하고, 무사함을 알릴 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '갑자기 건물이 흔들린다. 직원이 소리친다',
      speaker: '직원',
      recapPromptJa: '地震です！机の下に隠れてください',
      recapPromptKo: '지진이에요! 책상 아래로 숨으세요',
      choices: [
        { text: '몸을 보호할게요', phraseId: 'p_karada_wo_mamorimasu', correct: true, feedback: '「体(からだ)を守(まも)ります」— 지진 직후에는 지시를 따르는 것이 최우선. 책상 아래로 들어가 머리와 목을 보호해요' },
        { text: '무서워요', phraseId: 'p_kowai_desu', correct: true, feedback: '「怖(こわ)いです」— 놀란 감정을 솔직히 말해도 괜찮아요. 주변 사람이 안심시켜 줄 수 있어요' },
        { text: '화장실 어디예요?', phraseId: 'p_toire_doko', correct: false, feedback: '지금은 몸을 보호하는 게 먼저예요 — 화장실 문의는 상황과 맞지 않아요' },
      ],
    },
    {
      situationKo: '흔들림이 멈췄다. 다음 행동을 확인한다',
      speaker: '직원',
      recapPromptJa: '揺れが収まりました。落ち着いて行動してください',
      recapPromptKo: '흔들림이 멈췄어요. 침착하게 행동해 주세요',
      choices: [
        { text: '대피해야 하나요?', phraseId: 'p_hinan_subeki_desu_ka', correct: true, feedback: '「避難(ひなん)すべきですか」— 흔들림이 멈춰도 여진이 있을 수 있어 다음 행동을 반드시 확인해요' },
        { text: '밖으로 나가도 되나요?', phraseId: 'p_soto_ni_dete_mo_ii_desu_ka', correct: true, feedback: '「外(そと)に出(で)てもいいですか」— 임의로 나가지 말고 직원 안내를 먼저 확인해요' },
        { text: '도와주세요', phraseId: 'p_tasukete', correct: false, feedback: '지금은 다친 상황이 아니에요 — 다음 행동을 확인하는 것이 우선이에요' },
      ],
    },
    {
      situationKo: '직원이 대피 장소를 안내한다',
      speaker: '직원',
      promptPhraseId: 'p_hinanbasho_kochira',
      choices: [
        { text: '대피 장소로 갈게요', phraseId: 'p_hinanbasho_ni_ikimasu', correct: true, feedback: '「避難場所(ひなんばしょ)に行(い)きます」— 지정된 대피 장소로 침착하게 이동해요' },
        { text: '여기서 기다릴게요', phraseId: 'p_new_koko_de_machimasu', correct: true, feedback: '「ここで待(ま)っています」— 대피 장소 이동 전, 안내를 더 들어야 할 때 쓸 수 있는 표현' },
        { text: '사진 부탁드려요', phraseId: 'p_shashin_onegai', correct: false, feedback: '재난 상황에서는 안전이 우선이에요 — 사진 요청은 맥락과 맞지 않아요' },
      ],
    },
    {
      situationKo: '역에서 열차 운행이 멈췄다는 안내를 듣는다',
      speaker: '역무원',
      recapPromptJa: '地震の影響で、電車の運転を見合わせています',
      recapPromptKo: '지진의 영향으로 열차 운행을 중단하고 있습니다',
      choices: [
        { text: '운행 재개는 언제예요?', phraseId: 'p_itsu_saikai_desu_ka', correct: true, feedback: '「運転再開(うんてんさいかい)はいつですか」— 재개 시점을 확인하면 다음 계획을 세우기 편해요' },
        { text: '걸어서 몇 분이에요?', phraseId: 'p_aruite_nanpun', correct: true, feedback: '「歩(ある)いて何分(なんぷん)ですか」— 운행 중단이 길어지면 도보나 다른 교통수단을 알아봐요' },
        { text: '대피해야 하나요?', phraseId: 'p_hinan_subeki_desu_ka', correct: false, feedback: '지금은 열차 운행 상황을 묻는 중이에요 — 대피 여부는 앞서 확인했어요' },
      ],
    },
    {
      situationKo: '상황이 진정된 뒤 가족·지인에게 안전을 알리고 싶다',
      speaker: '나',
      choices: [
        { text: '저는 괜찮아요', phraseId: 'p_watashi_wa_daijoubu_desu', correct: true, feedback: '「私(わたし)は大丈夫(だいじょうぶ)です」— 무사함을 알리는 표현. SNS·메시지 앱으로 빠르게 안심시켜 주세요' },
        { text: '도와주세요', phraseId: 'p_tasukete', correct: false, feedback: '이미 안전한 상황이에요 — 도움 요청보다 무사함을 알리는 것이 맞아요' },
      ],
    },
  ],
};

// C52 — 병원 접수. 접수 확인 → 보험증 확인 → 증상 설명 → 진료과 안내 → 카드 결제 거절 대응.
export const c52: Mission = {
  id: 'C52',
  tier: 5,
  scenario: '병원 접수',
  place: '병원',
  sequence: ['접수 확인', '보험증 확인', '증상 설명', '진료과 안내', '결제 문제 대응'],
  speakPhraseIds: ['p_netsu_arimasu', 'p_genkin_de_haraimasu'],
  canDo: '병원 접수처에서 방문 여부·보험·증상을 전달하고, 진료과 안내를 이해하고, 결제 문제에 대응할 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '접수처에서 직원이 첫 방문인지 묻는다',
      speaker: '직원',
      recapPromptJa: '初めてのご来院ですか',
      recapPromptKo: '첫 방문이신가요?',
      choices: [
        { text: '처음이에요', phraseId: 'p_hajimete_desu', correct: true, feedback: '「初(はじ)めてです」— 첫 방문이면 보통 문진표(問診票) 작성이 추가로 필요해요' },
        { text: '두 번째예요', phraseId: 'p_nikaime_desu', correct: true, feedback: '「二回目(にかいめ)です」— 재방문이면 진찰권(診察券)이 있는지 확인해요' },
        { text: '카드로 부탁드려요', phraseId: 'p_card_de_onegai', correct: false, feedback: '아직 접수 단계예요 — 결제 이야기는 진료가 끝난 뒤에 해요' },
      ],
    },
    {
      situationKo: '직원이 보험증이 있는지 확인한다',
      speaker: '직원',
      promptPhraseId: 'p_hokenshou_wa_arimasu_ka',
      choices: [
        { text: '아니요, 없어요', phraseId: 'p_iie_arimasen', correct: true, feedback: '「いいえ、ありません」— 외국인은 대부분 일본 보험증이 없어요. 자비 진료(自費/じひ)로 안내돼요' },
        { text: '여행자 보험이 있어요', phraseId: 'p_ryokousha_hoken_ga_arimasu', correct: true, feedback: '「旅行者保険(りょこうしゃほけん)があります」— 일본 건강보험은 없어도 여행자보험 여부를 알리면 영수증 발급을 안내받을 수 있어요' },
      ],
    },
    {
      situationKo: '의사가 증상을 묻는다',
      speaker: '의사',
      promptPhraseId: 'p_dou_nasaimashita_ka',
      choices: [
        { text: '배가 아파요', phraseId: 'p_onaka_itai', correct: true, feedback: '「お腹(なか)が痛(いた)いです」— 증상을 명확하게 말해요. 어디가·언제부터 아픈지 덧붙이면 더 정확해요' },
        { text: '열이 있어요', phraseId: 'p_netsu_arimasu', correct: true, feedback: '「熱(ねつ)があります」— 체온 관련 증상. 몇 도인지 알면 「38度(さんじゅうはちど)あります」처럼 덧붙여요' },
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: false, feedback: '지금은 증상을 설명하는 중이에요 — 결제 문의는 진료 후에 해요' },
      ],
    },
    {
      situationKo: '접수 직원이 진료과를 안내한다',
      speaker: '직원',
      recapPromptJa: '内科でご案内します',
      recapPromptKo: '내과로 안내해드릴게요',
      choices: [
        { text: '순서를 기다릴게요', phraseId: 'p_junban_wo_machimasu', correct: true, feedback: '「順番(じゅんばん)を待(ま)ちます」— 안내받은 진료과(科)에서 이름이 불릴 때까지 대기해요' },
        { text: '얼마나 기다려요?', phraseId: 'p_dorekurai_machimasu_ka', correct: true, feedback: '「どれくらい待(ま)ちますか」— 대기 시간을 미리 확인하면 계획을 세우기 편해요' },
      ],
    },
    {
      situationKo: '진료 후 수납에서 카드가 거절된다',
      speaker: '직원',
      promptPhraseId: 'p_kaado_ga_tsukaenai_you_desu',
      choices: [
        { text: '다른 카드로 해봐도 될까요?', phraseId: 'p_betsu_no_card_tameshite', correct: true, feedback: '「別(べつ)のカードで試(ため)してもいいですか」— 카드가 안 될 때 당황하지 말고 이렇게 물어보세요' },
        { text: '현금으로 낼게요', phraseId: 'p_genkin_de_haraimasu', correct: true, feedback: '「現金(げんきん)で払(はら)います」— 가장 확실한 대안. 소액 현금을 항상 챙겨두면 안심이에요' },
        { text: '영수증 주세요', phraseId: 'p_reshiito_kudasai', correct: false, feedback: '아직 결제가 끝나지 않았어요 — 결제 방법을 먼저 정해요' },
      ],
    },
  ],
};

export const crisisMissions: Mission[] = [c51, c52];
