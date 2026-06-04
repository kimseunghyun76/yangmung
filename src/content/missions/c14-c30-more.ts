import type { Mission } from '../types';

export const c14: Mission = {
  id: 'C14',
  place: '카페',
  scenario: '카페에서 음료 주문',
  canDo: '사용자는 카페에서 매장/포장, 사이즈, 추가 요청과 계산을 자연스럽게 처리할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['매장/포장', '사이즈 선택', '계산 마무리'],
  speakPhraseIds: ['p_tennai_de', 'p_mochikaeri_de', 'p_emu_saizu_de'],
  steps: [
    {
      situationKo: '카페 점원이 매장에서 마실지 포장할지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_kochira_de_meshiagarimasu_ka',
      choices: [
        { text: '매장에서요', phraseId: 'p_tennai_de', correct: true },
        { text: '포장으로요', phraseId: 'p_mochikaeri_de', correct: true },
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: false, feedback: '카페 주문에서는 표가 아니라 매장/포장 여부를 답해야 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '음료 사이즈를 고르는 순간',
      speaker: '점원',
      promptPhraseId: 'p_saizu_wa_dou_shimasu_ka',
      choices: [
        { text: 'S 사이즈로요', phraseId: 'p_esu_saizu_de', correct: true },
        { text: 'M 사이즈로요', phraseId: 'p_emu_saizu_de', correct: true },
        { text: '화장실 어디예요?', phraseId: 'p_toire_doko', correct: false, feedback: '지금은 사이즈 질문이라 먼저 크기를 답하는 게 자연스러워요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '받은 뒤 물이 필요하고 계산을 마무리한다',
      speaker: '점원',
      promptPhraseId: 'p_oatame_shimasu_ka',
      choices: [
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true },
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: true },
        { text: '데워 주세요', phraseId: 'p_atatamete', correct: false, feedback: '카페 음료 상황에서는 데우기보다 물/계산 요청이 맞아요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c15: Mission = {
  id: 'C15',
  place: '빵집',
  scenario: '빵집에서 빵 고르기',
  canDo: '사용자는 빵집에서 상품과 개수를 고르고 봉투와 결제까지 처리할 수 있다',
  unlockAfter: ['C1'],
  sequence: ['빵 고르기', '봉투 확인', '결제'],
  speakPhraseIds: ['p_kore_to_kore', 'p_hitotsu_kudasai', 'p_fukuro_iranai'],
  steps: [
    {
      situationKo: '빵집 점원이 어떤 빵을 고를지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_dore_ni_shimasu_ka',
      choices: [
        { text: '이거랑 이거요', phraseId: 'p_kore_to_kore', correct: true },
        { text: '하나 주세요', phraseId: 'p_hitotsu_kudasai', correct: true },
        { text: '체크인 부탁드립니다', phraseId: 'p_checkin_onegai', correct: false, feedback: '숙소 표현이라 빵집에서는 완전히 다른 상황이에요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '계산 전 봉투가 필요한지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_fukuro_otsuke_shimasu_ka',
      choices: [
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: true },
        { text: '네, 부탁합니다', phraseId: 'p_hai', correct: true },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: false, feedback: '라멘집 표현이라 빵집 봉투 질문에는 맞지 않아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '결제 금액을 듣고 지불한다',
      speaker: '점원',
      promptPhraseId: 'p_okaikei_wa_sennihyakuen_desu',
      choices: [
        { text: '카드로요', phraseId: 'p_card_de', correct: true },
        { text: '현금으로요', phraseId: 'p_genkin_de', correct: true },
        { text: '어디까지 가세요?', phraseId: 'p_dochira_desu_ka', correct: false, feedback: '교통/방향 질문이라 결제 상황에서는 어색해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
  ],
};

export const c16: Mission = {
  id: 'C16',
  place: '이자카야',
  scenario: '이자카야에서 주문',
  canDo: '사용자는 이자카야에서 예약·음료·추가 주문·마지막 주문을 처리할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['예약 확인', '첫 음료', '추가 주문'],
  speakPhraseIds: ['p_futari_desu', 'p_osusume_wa', 'p_okaikei'],
  steps: [
    {
      situationKo: '입구에서 예약이 있는지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_yoyaku_wa_arimasu_ka',
      choices: [
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: true },
        { text: '두 명이요', phraseId: 'p_futari_desu', correct: true, feedback: '예약이 없어도 인원수를 바로 말하면 안내받기 쉬워요' },
        { text: '코인로커 어디예요?', phraseId: 'p_koinrokkaa', correct: false, feedback: '이자카야 입장 질문에는 예약/인원 답변이 우선이에요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '자리에 앉자 첫 음료를 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nomimono_wa_dou_shimasu_ka',
      choices: [
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true },
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true },
        { text: '방은 어디예요?', phraseId: 'p_heya_doko', correct: false, feedback: '숙소 표현이라 식당 음료 질문에는 맞지 않아요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '마지막 주문 시간이 되어 추가 주문 여부를 정한다',
      speaker: '점원',
      promptPhraseId: 'p_rasuto_ooda_desu',
      choices: [
        { text: '이거랑 이거요', phraseId: 'p_kore_to_kore', correct: true },
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: true },
        { text: '체크인 부탁드립니다', phraseId: 'p_checkin_onegai', correct: false, feedback: '식당에서는 체크인이 아니라 추가 주문/계산을 말해야 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
  ],
};

export const c17: Mission = {
  id: 'C17',
  place: '스시집',
  scenario: '스시집에서 안전하게 주문',
  canDo: '사용자는 스시집에서 자리, 추천, 알레르기, 와사비 여부를 안전하게 전달할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['자리 안내', '추천 주문', '못 먹는 재료'],
  speakPhraseIds: ['p_osusume_wa', 'p_arerugi', 'p_kore_nuite'],
  steps: [
    {
      situationKo: '스시집에서 카운터석을 안내받는다',
      speaker: '점원',
      promptPhraseId: 'p_kauntaa_de_yoroshii_desu_ka',
      choices: [
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true },
        { text: '두 명이요', phraseId: 'p_futari_desu', correct: true },
        { text: '잔돈으로 해 주세요', phraseId: 'p_komakaku', correct: false, feedback: '환전 표현이라 자리 안내에는 맞지 않아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '셰프가 못 먹는 재료가 있는지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nigate_na_mono_arimasu_ka',
      choices: [
        { text: '알레르기가 있어요', phraseId: 'p_arerugi', correct: true },
        { text: '이거 빼 주세요', phraseId: 'p_kore_nuite', correct: true },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: false, feedback: '라멘집 표현이라 스시 재료 설명에는 어색해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '와사비가 괜찮은지 확인한다',
      speaker: '점원',
      promptPhraseId: 'p_sabi_wa_daijoubu_desu_ka',
      choices: [
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true },
        { text: '택시 불러주세요', phraseId: 'p_takushi_onegai', correct: false, feedback: '스시 주문 중에는 음식 관련 답변이 먼저예요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c18: Mission = {
  id: 'C18',
  place: '관광안내소',
  scenario: '관광안내소에서 표와 길 묻기',
  canDo: '사용자는 관광안내소에서 표, 위치, 지도, 촬영 가능 여부를 물을 수 있다',
  unlockAfter: ['C5'],
  sequence: ['필요한 정보 말하기', '표 확인', '지도 받기'],
  speakPhraseIds: ['p_kippu_kudasai', 'p_doko_desu_ka', 'p_shashin_ii'],
  steps: [
    {
      situationKo: '안내 직원이 무엇을 찾는지 묻는다',
      speaker: '안내 직원',
      promptPhraseId: 'p_nanika_osagashi_desu_ka',
      choices: [
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: true },
        { text: '어디예요?', phraseId: 'p_doko_desu_ka', correct: true },
        { text: '데워 주세요', phraseId: 'p_atatamete', correct: false, feedback: '편의점 표현이라 관광안내소에서는 맞지 않아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '티켓 위치를 안내받고 장수를 말한다',
      speaker: '안내 직원',
      promptPhraseId: 'p_chiketto_wa_kochira_desu',
      choices: [
        { text: '표 두 장 주세요', phraseId: 'p_kippu_nimai_kudasai', correct: true },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true },
        { text: '매장에서요', phraseId: 'p_tennai_de', correct: false, feedback: '카페 표현이라 티켓 안내에는 어색해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '길을 찾기 위해 지도를 받을지 묻는다',
      speaker: '안내 직원',
      promptPhraseId: 'p_chizu_wa_irimasu_ka',
      choices: [
        { text: '네, 부탁합니다', phraseId: 'p_hai', correct: true },
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: true },
        { text: '카드로요', phraseId: 'p_card_de', correct: false, feedback: '아직 결제가 아니라 안내/지도 확인 단계예요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c19: Mission = {
  id: 'C19',
  place: '신사',
  scenario: '신사와 절에서 예절 지키기',
  canDo: '사용자는 신사에서 조용히 도움을 청하고 위치와 촬영 가능 여부를 물을 수 있다',
  unlockAfter: ['C5'],
  sequence: ['조용히 묻기', '촬영 확인', '부적 위치'],
  speakPhraseIds: ['p_sumimasen_koko_doko', 'p_shashin_ii', 'p_arigatou_gozaimasu'],
  steps: [
    {
      situationKo: '경내에서 길을 몰라 신사 직원에게 말을 건다',
      speaker: '신사 직원',
      promptPhraseId: 'p_dou_nasaimashita_ka',
      choices: [
        { text: '실례합니다, 여기가 어디예요?', phraseId: 'p_sumimasen_koko_doko', correct: true },
        { text: '길을 가르쳐 주세요', phraseId: 'p_michi_oshiete', correct: true },
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: false, feedback: '신사는 가게가 아니라 봉투 응답이 어색해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '사진을 찍어도 되는지 확인한다',
      speaker: '신사 직원',
      promptPhraseId: 'p_shashin_wa_daijoubu_desu',
      choices: [
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: true },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: false, feedback: '라멘집 표현이라 신사에서는 전혀 맞지 않아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '부적을 사고 싶은데 위치를 안내받는다',
      speaker: '신사 직원',
      promptPhraseId: 'p_omamori_wa_kochira_desu',
      choices: [
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true },
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: true },
        { text: '데워 주세요', phraseId: 'p_atatamete', correct: false, feedback: '부적을 고르는 상황에서 데우기 표현은 맞지 않아요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c20: Mission = {
  id: 'C20',
  place: '온천',
  scenario: '온천 이용 방법 묻기',
  canDo: '사용자는 온천에서 요금·수건·기본 이용 규칙을 이해하고 되물을 수 있다',
  unlockAfter: ['C4'],
  sequence: ['요금 확인', '수건 대여', '입욕 규칙'],
  speakPhraseIds: ['p_ikura_desu_ka', 'p_hai', 'p_wakarimashita_arigatou'],
  steps: [
    {
      situationKo: '온천 접수에서 입욕료를 안내받는다',
      speaker: '접수 직원',
      promptPhraseId: 'p_nyuuyokuryou_wa_happyakuen_desu',
      choices: [
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true },
        { text: '표 두 장 주세요', phraseId: 'p_kippu_nimai_kudasai', correct: false, feedback: '온천 접수에서는 표보다 입욕료/결제 확인이 자연스러워요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '수건이 필요한지 묻는다',
      speaker: '접수 직원',
      promptPhraseId: 'p_taoru_wa_irimasu_ka',
      choices: [
        { text: '네, 부탁합니다', phraseId: 'p_hai', correct: true },
        { text: '필요 없어요', phraseId: 'p_irimasen', correct: true },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: false, feedback: '라멘집 표현이라 온천 수건 질문에는 맞지 않아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '탕에 들어가기 전 이용 규칙을 듣는다',
      speaker: '접수 직원',
      promptPhraseId: 'p_karada_o_aratte_kudasai',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: false, feedback: '규칙 안내를 듣는 중이라 먼저 이해/확인을 답하는 게 좋아요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c21: Mission = {
  id: 'C21',
  place: '료칸',
  scenario: '료칸에서 숙박',
  canDo: '사용자는 료칸에서 예약 확인, 식사 시간, 온천 위치를 확인할 수 있다',
  unlockAfter: ['C4'],
  sequence: ['예약 확인', '식사 시간', '목욕탕 위치'],
  speakPhraseIds: ['p_yoyaku_shiteimasu', 'p_choushoku_wa', 'p_wifi_arimasu_ka'],
  steps: [
    {
      situationKo: '료칸 프런트에서 예약 여부를 확인한다',
      speaker: '프런트 직원',
      promptPhraseId: 'p_yoyaku_wa_arimasu_ka',
      choices: [
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: true },
        { text: '체크인 부탁드립니다', phraseId: 'p_checkin_onegai', correct: true },
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: false, feedback: '숙박 체크인에서는 예약/체크인 표현이 맞아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '저녁 식사 시간을 정한다',
      speaker: '프런트 직원',
      promptPhraseId: 'p_yuushoku_wa_nanji_ni_shimasu_ka',
      choices: [
        { text: '조식은요?', phraseId: 'p_choushoku_wa', correct: true },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: false, feedback: '식사 시간이지만 라멘 추가 표현은 료칸 프런트에서 어색해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '목욕탕 위치와 시설을 확인한다',
      speaker: '프런트 직원',
      promptPhraseId: 'p_ofuro_wa_ichikai_desu',
      choices: [
        { text: '와이파이는 있나요?', phraseId: 'p_wifi_arimasu_ka', correct: true },
        { text: '방은 어디예요?', phraseId: 'p_heya_doko', correct: true },
        { text: '포장으로요', phraseId: 'p_mochikaeri_de', correct: false, feedback: '카페 표현이라 료칸 시설 안내에는 맞지 않아요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c22: Mission = {
  id: 'C22',
  place: '버스',
  scenario: '버스 타고 목적지 가기',
  canDo: '사용자는 버스에서 목적지, IC카드 사용, 하차 위치를 확인할 수 있다',
  unlockAfter: ['C3'],
  sequence: ['목적지 확인', 'IC카드', '하차'],
  speakPhraseIds: ['p_doko_desu_ka', 'p_card_tsukaemasu_ka', 'p_wakarimashita_arigatou'],
  steps: [
    {
      situationKo: '운전사가 어디까지 가는지 확인한다',
      speaker: '운전사',
      promptPhraseId: 'p_dochira_made_ikimasu_ka',
      choices: [
        { text: '어디예요?', phraseId: 'p_doko_desu_ka', correct: true },
        { text: '다음은 시부야예요?', phraseId: 'p_tsugi_wa_shibuya', correct: true },
        { text: '데워 주세요', phraseId: 'p_atatamete', correct: false, feedback: '버스에서는 목적지/정류장 확인이 우선이에요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: 'IC카드를 사용할 수 있다는 안내를 듣는다',
      speaker: '운전사',
      promptPhraseId: 'p_ic_kaado_tsukaemasu',
      choices: [
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '체크인 부탁드립니다', phraseId: 'p_checkin_onegai', correct: false, feedback: '버스 결제에는 숙소 체크인 표현이 맞지 않아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '내릴 정류장을 안내받는다',
      speaker: '운전사',
      promptPhraseId: 'p_tsugi_de_orite_kudasai',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: true },
        { text: '봉투 주세요', phraseId: 'p_hashi_kudasai', correct: false, feedback: '버스 하차 안내에서 편의점 물품 요청은 맞지 않아요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c23: Mission = {
  id: 'C23',
  place: '신칸센',
  scenario: '신칸센 표 사고 타기',
  canDo: '사용자는 신칸센 표, 자유석/지정석, 승강장, 시간 안내를 확인할 수 있다',
  unlockAfter: ['C3'],
  sequence: ['표 종류', '승강장', '시간 확인'],
  speakPhraseIds: ['p_kippu_kudasai', 'p_nanbansen', 'p_wakarimashita_arigatou'],
  steps: [
    {
      situationKo: '역무원이 자유석인지 확인한다',
      speaker: '역무원',
      promptPhraseId: 'p_jiyuuseki_desu_ka',
      choices: [
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: true },
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true },
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: false, feedback: '신칸센 표 구매 중에는 좌석/표 관련 답변이 맞아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '승강장 번호를 안내받는다',
      speaker: '역무원',
      promptPhraseId: 'p_noriba_wa_jyuunibansen_desu',
      choices: [
        { text: '몇 번 선이에요?', phraseId: 'p_nanbansen', correct: true },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '데워 주세요', phraseId: 'p_atatamete', correct: false, feedback: '승강장 안내에서는 확인/감사 표현이 자연스러워요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '출발 시간에 주의하라는 안내를 듣는다',
      speaker: '역무원',
      promptPhraseId: 'p_jikan_ni_gochuui_kudasai',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '다음은 시부야예요?', phraseId: 'p_tsugi_wa_shibuya', correct: true },
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: false, feedback: '식당 인사라 열차 시간 안내에는 맞지 않아요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c24: Mission = {
  id: 'C24',
  place: '렌터카',
  scenario: '렌터카 빌리고 반납',
  canDo: '사용자는 렌터카 카운터에서 예약, 면허증, 반납 장소, 주유 조건을 확인할 수 있다',
  unlockAfter: ['C8'],
  sequence: ['예약 확인', '반납 장소', '주유 조건'],
  speakPhraseIds: ['p_yoyaku_shiteimasu', 'p_card_de', 'p_ryoushuusho'],
  steps: [
    {
      situationKo: '렌터카 카운터에서 면허증을 요청받는다',
      speaker: '카운터 직원',
      promptPhraseId: 'p_menkyo_shou_onegai_shimasu',
      choices: [
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: true },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: false, feedback: '렌터카 접수에서는 신분증/예약 관련 표현이 필요해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '차를 어디에 반납해야 하는지 안내받는다',
      speaker: '카운터 직원',
      promptPhraseId: 'p_henkyaku_basho_wa_kochira_desu',
      choices: [
        { text: '어디예요?', phraseId: 'p_doko_desu_ka', correct: true },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: true },
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: false, feedback: '반납 장소 확인에는 위치/영수증 요청이 더 자연스러워요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '반납 전 주유 조건을 듣는다',
      speaker: '카운터 직원',
      promptPhraseId: 'p_gasorin_mantan_de_onegai_shimasu',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '카드로요', phraseId: 'p_card_de', correct: true },
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: false, feedback: '렌터카 주유 안내와 봉투 응답은 연결되지 않아요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c25: Mission = {
  id: 'C25',
  place: '병원',
  scenario: '병원에서 증상 설명',
  canDo: '사용자는 병원에서 증상, 보험 여부, 쉬운 설명 요청을 안전하게 말할 수 있다',
  unlockAfter: ['C6'],
  sequence: ['증상 설명', '보험 확인', '진료 설명'],
  speakPhraseIds: ['p_atama_itai', 'p_onaka_itai', 'p_yasashii_nihongo'],
  steps: [
    {
      situationKo: '접수에서 증상을 말해 달라고 한다',
      speaker: '접수 직원',
      promptPhraseId: 'p_shoujou_o_oshiete_kudasai',
      choices: [
        { text: '머리가 아파요', phraseId: 'p_atama_itai', correct: true },
        { text: '배가 아파요', phraseId: 'p_onaka_itai', correct: true },
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: false, feedback: '병원에서는 식사 인사가 아니라 증상을 말해야 해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '보험증이 있는지 확인한다',
      speaker: '접수 직원',
      promptPhraseId: 'p_hokenshou_wa_arimasu_ka',
      choices: [
        { text: '없어요', phraseId: 'p_arimasen', correct: true },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true },
        { text: '포장으로요', phraseId: 'p_mochikaeri_de', correct: false, feedback: '병원 접수에서는 포장 표현이 맞지 않아요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '의사가 설명할 것이라는 안내를 듣는다',
      speaker: '의료진',
      promptPhraseId: 'p_sensei_ga_setsumei_shimasu',
      choices: [
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '카드로요', phraseId: 'p_card_de', correct: false, feedback: '진료 설명 안내에는 결제보다 이해 확인이 먼저예요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
  ],
};

export const c26: Mission = {
  id: 'C26',
  place: '경찰서',
  scenario: '분실물과 길 도움 요청',
  canDo: '사용자는 경찰서에서 분실물, 시간, 연락처, 다음 행동을 설명할 수 있다',
  unlockAfter: ['C5'],
  sequence: ['분실물 말하기', '잃어버린 시간', '연락처 남기기'],
  speakPhraseIds: ['p_tasukete', 'p_sumimasen', 'p_michi_oshiete'],
  steps: [
    {
      situationKo: '경찰관이 무엇을 잃어버렸는지 묻는다',
      speaker: '경찰관',
      promptPhraseId: 'p_nani_o_nakushimashita_ka',
      choices: [
        { text: '도와주세요', phraseId: 'p_tasukete', correct: true },
        { text: '일본어가 어려워요', phraseId: 'p_nihon_go_muzukashii', correct: true },
        { text: '데워 주세요', phraseId: 'p_atatamete', correct: false, feedback: '분실 신고에서는 물건/도움 요청을 말해야 해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '언제 잃어버렸는지 추가로 묻는다',
      speaker: '경찰관',
      promptPhraseId: 'p_itsu_nakushimashita_ka',
      choices: [
        { text: '모르겠어요', phraseId: 'p_wakarimasen', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: false, feedback: '경찰서에서는 라멘집 표현이 완전히 어긋나요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '찾으면 연락하기 위해 연락처를 요청받는다',
      speaker: '경찰관',
      promptPhraseId: 'p_renrakusaki_o_kaite_kudasai',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '적어 주세요', phraseId: 'p_chotto_matte', correct: true, feedback: '바로 적기 어렵다면 잠깐 기다려 달라고 해도 좋아요' },
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: false, feedback: '연락처 작성 요청과 봉투 응답은 관련이 없어요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
  ],
};

export const c27: Mission = {
  id: 'C27',
  place: '긴급상황',
  scenario: '긴급상황에서 도움 청하기',
  canDo: '사용자는 긴급상황에서 도움 요청, 상태, 위치를 짧고 명확하게 전달할 수 있다',
  unlockAfter: ['C26'],
  sequence: ['도움 요청', '상태 확인', '위치 전달'],
  speakPhraseIds: ['p_tasukete', 'p_atama_itai', 'p_doko_desu_ka'],
  steps: [
    {
      situationKo: '행인이 괜찮은지 묻는다',
      speaker: '행인',
      promptPhraseId: 'p_daijoubu_desu_ka',
      choices: [
        { text: '도와주세요', phraseId: 'p_tasukete', correct: true },
        { text: '머리가 아파요', phraseId: 'p_atama_itai', correct: true },
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: false, feedback: '긴급상황에서는 인사보다 도움/증상을 바로 말해야 해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '구급차를 부르겠다는 말을 듣는다',
      speaker: '행인',
      promptPhraseId: 'p_kyuukyuusha_o_yobimasu',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '배가 아파요', phraseId: 'p_onaka_itai', correct: true },
        { text: '카드로요', phraseId: 'p_card_de', correct: false, feedback: '지금은 결제가 아니라 상태 전달이 우선이에요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '현재 위치를 알려 달라는 요청을 받는다',
      speaker: '구급/행인',
      promptPhraseId: 'p_basho_o_oshiete_kudasai',
      choices: [
        { text: '어디예요?', phraseId: 'p_doko_desu_ka', correct: true },
        { text: '일본어는 조금만 할 수 있어요', phraseId: 'p_nihongo_sukoshi_dake', correct: true },
        { text: '포장으로요', phraseId: 'p_mochikaeri_de', correct: false, feedback: '긴급상황에서 카페식 답변은 위험하게 어긋나요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
  ],
};

export const c28: Mission = {
  id: 'C28',
  place: '통신매장',
  scenario: '유심과 데이터 개통',
  canDo: '사용자는 통신매장에서 요금제, 여권 확인, 설정 도움, 결제를 처리할 수 있다',
  unlockAfter: ['C7'],
  sequence: ['요금제 선택', '여권 확인', '설정 도움'],
  speakPhraseIds: ['p_kore_ikura', 'p_card_tsukaemasu_ka', 'p_card_de'],
  steps: [
    {
      situationKo: '점원이 어떤 요금제를 원하는지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_dono_puran_ni_shimasu_ka',
      choices: [
        { text: '이거 얼마예요?', phraseId: 'p_kore_ikura', correct: true },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: false, feedback: '통신매장에서는 요금제/가격을 물어야 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '개통을 위해 여권 확인을 요청받는다',
      speaker: '점원',
      promptPhraseId: 'p_pasupooto_kakunin_shimasu',
      choices: [
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true },
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true },
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: false, feedback: '여권 확인 단계에는 식당 인사가 맞지 않아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 휴대폰 설정을 도와주겠다고 한다',
      speaker: '점원',
      promptPhraseId: 'p_settei_o_tetsudaimasu',
      choices: [
        { text: '네, 부탁합니다', phraseId: 'p_hai', correct: true },
        { text: '카드로요', phraseId: 'p_card_de', correct: true },
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: false, feedback: '설정 도움과 봉투 응답은 관련이 없어요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c29: Mission = {
  id: 'C29',
  place: '코인세탁',
  scenario: '코인세탁기 사용',
  canDo: '사용자는 코인세탁소에서 기계 위치, 세제, 완료 시간을 확인할 수 있다',
  unlockAfter: ['C4'],
  sequence: ['기계 찾기', '세제 확인', '완료 시간'],
  speakPhraseIds: ['p_tsukaikata', 'p_ikura_desu_ka', 'p_wakarimashita_arigatou'],
  steps: [
    {
      situationKo: '직원 또는 주변 사람이 세탁기 위치를 알려준다',
      speaker: '안내 직원',
      promptPhraseId: 'p_senntakuki_wa_kochira_desu',
      choices: [
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true },
        { text: '체크인 부탁드립니다', phraseId: 'p_checkin_onegai', correct: false, feedback: '세탁소에서는 숙소 체크인 표현이 맞지 않아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '세제가 자동인지 안내받는다',
      speaker: '안내 직원',
      promptPhraseId: 'p_senzai_wa_jidou_desu',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true },
        { text: '스이카로요', phraseId: 'p_suica_de', correct: false, feedback: '세제 안내 중에는 결제 수단보다 이해 확인이 먼저예요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '세탁 완료까지 걸리는 시간을 듣는다',
      speaker: '안내 직원',
      promptPhraseId: 'p_kanryou_made_sanjuppun_desu',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: false, feedback: '세탁 완료 시간 안내에는 물 요청이 맞지 않아요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c30: Mission = {
  id: 'C30',
  place: '축제',
  scenario: '축제와 행사 즐기기',
  canDo: '사용자는 축제에서 표, 먹거리, 사진, 입구 방향을 확인할 수 있다',
  unlockAfter: ['C18'],
  sequence: ['표 사기', '먹거리 주문', '입구 확인'],
  speakPhraseIds: ['p_kippu_kudasai', 'p_kore_kudasai', 'p_shashin_ii'],
  steps: [
    {
      situationKo: '행사 입구에서 표가 몇 장인지 묻는다',
      speaker: '안내 직원',
      promptPhraseId: 'p_nanmai_desu_ka',
      choices: [
        { text: '표 두 장 주세요', phraseId: 'p_kippu_nimai_kudasai', correct: true },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true },
        { text: '체크인 부탁드립니다', phraseId: 'p_checkin_onegai', correct: false, feedback: '축제 입장에서는 표/금액을 말해야 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '노점에서 이 음식 하나면 되는지 확인한다',
      speaker: '노점 점원',
      promptPhraseId: 'p_kore_hitotsu_de_yoroshii_desu_ka',
      choices: [
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: true },
        { text: '하나 주세요', phraseId: 'p_hitotsu_kudasai', correct: true },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: false, feedback: '노점 주문에는 여권이 필요하지 않아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '입구 방향과 사진 가능 여부를 확인한다',
      speaker: '안내 직원',
      promptPhraseId: 'p_iriguchi_wa_migi_desu',
      choices: [
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: true },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '데워 주세요', phraseId: 'p_atatamete', correct: false, feedback: '축제 이동 안내에서는 방향/촬영 확인이 맞아요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const moreMissions: Mission[] = [
  c14, c15, c16, c17, c18, c19, c20, c21, c22, c23, c24, c25, c26, c27, c28, c29, c30,
];
