import type { Mission } from '../types';

export const c31: Mission = {
  id: 'C31',
  place: '회전초밥',
  scenario: '회전초밥집에서 주문과 계산',
  canDo: '사용자는 회전초밥집에서 자리 안내, 터치패널 주문, 생선 이름 주문, 추가 음료와 계산을 처리할 수 있다',
  unlockAfter: ['C17'],
  sequence: ['자리 안내', '터치패널 주문', '접시 계산'],
  speakPhraseIds: ['p_maguro_kudasai', 'p_saamon_kudasai', 'p_biiru_mou_ippai'],
  steps: [
    {
      situationKo: '회전초밥집 입구에서 인원과 좌석을 확인한다',
      speaker: '점원',
      promptPhraseId: 'p_nanmeisama',
      choices: [
        { text: '두 명이요', phraseId: 'p_futari_desu', correct: true },
        { text: '카운터석으로 부탁합니다', phraseId: 'p_kauntaa_de_onegai', correct: true },
        { text: '방을 바꿔 주세요', phraseId: 'p_heya_kaete_kudasai', correct: false, feedback: '초밥집 입장에서는 방 변경이 아니라 인원/좌석을 답해야 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '터치패널로 주문하라는 안내를 듣는다',
      speaker: '점원',
      promptPhraseId: 'p_touch_panel_order',
      choices: [
        { text: '참치 주세요', phraseId: 'p_maguro_kudasai', correct: true },
        { text: '연어 주세요', phraseId: 'p_saamon_kudasai', correct: true },
        { text: '우산을 빌릴 수 있나요?', phraseId: 'p_kasa_kariremasu_ka', correct: false, feedback: '초밥 주문 중에는 음식 이름을 말하는 게 자연스러워요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '접시를 세고 계산하는 순간',
      speaker: '점원',
      promptPhraseId: 'p_osara_count',
      choices: [
        { text: '맥주 한 잔 더 주세요', phraseId: 'p_biiru_mou_ippai', correct: true },
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: true },
        { text: '오픈 티켓을 교환하고 싶습니다', phraseId: 'p_open_ticket_koukan', correct: false, feedback: '티켓 교환은 역 창구 상황이에요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c32: Mission = {
  id: 'C32',
  place: '편집샵피팅',
  scenario: '편집샵에서 옷 입어보기',
  canDo: '사용자는 편집샵에서 사이즈와 색을 묻고 피팅룸 안내를 받아 착용 후 의견을 말할 수 있다',
  unlockAfter: ['C7'],
  sequence: ['상품 찾기', '피팅룸 안내', '착용 후 결정'],
  speakPhraseIds: ['p_shichaku', 'p_emu_saizu_arimasu_ka', 'p_chotto_chiisai_desu'],
  steps: [
    {
      situationKo: '직원이 찾는 상품이 있는지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nanika_osagashi_fashion',
      choices: [
        { text: '입어 봐도 돼요?', phraseId: 'p_shichaku', correct: true },
        { text: 'M 사이즈 있나요?', phraseId: 'p_emu_saizu_arimasu_ka', correct: true },
        { text: '짐을 줄이겠습니다', phraseId: 'p_nimotsu_herashimasu', correct: false, feedback: '수하물 표현이라 편집샵에서는 맞지 않아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '피팅룸 위치를 안내받는다',
      speaker: '점원',
      promptPhraseId: 'p_shichakushitsu_kochira',
      choices: [
        { text: '다른 색 있나요?', phraseId: 'p_hoka_no_iro_arimasu_ka', correct: true },
        { text: '이걸로 할게요', phraseId: 'p_kore_kudasai_shop', correct: true },
        { text: '맥주 한 잔 더 주세요', phraseId: 'p_biiru_mou_ippai', correct: false, feedback: '음식점 추가 주문 표현이에요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '입어 본 뒤 사이즈가 맞는지 말한다',
      speaker: '점원',
      recapPromptJa: 'サイズはいかがですか',
      recapPromptKo: '사이즈는 어떠세요?',
      choices: [
        { text: '조금 작아요', phraseId: 'p_chotto_chiisai_desu', correct: true },
        { text: '이걸로 할게요', phraseId: 'p_kore_kudasai_shop', correct: true },
        { text: '접시를 가져가도 되나요?', phraseId: 'p_osara_tottemo_ii', correct: false, feedback: '회전초밥집 표현이라 피팅 상황에는 맞지 않아요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c33: Mission = {
  id: 'C33',
  place: '호텔우산',
  scenario: '호텔에서 우산 빌리기',
  canDo: '사용자는 호텔 프런트에서 비가 올 때 우산 대여와 반납을 자연스럽게 요청할 수 있다',
  unlockAfter: ['C4'],
  sequence: ['비 확인', '우산 대여', '반납 확인'],
  speakPhraseIds: ['p_kasa_kariremasu_ka', 'p_kasa_wo_kaeshimasu', 'p_wakarimashita_arigatou'],
  steps: [
    {
      situationKo: '잠깐 외출하려는데 프런트에서 비가 온다고 알려준다',
      speaker: '프런트 직원',
      promptPhraseId: 'p_ame_ga_futteimasu',
      choices: [
        { text: '우산을 빌릴 수 있나요?', phraseId: 'p_kasa_kariremasu_ka', correct: true },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '참치 주세요', phraseId: 'p_maguro_kudasai', correct: false, feedback: '호텔 프런트에서는 음식 주문이 아니라 우산 요청이 맞아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '우산 위치를 안내받는다',
      speaker: '프런트 직원',
      promptPhraseId: 'p_kasa_wa_front_desu',
      choices: [
        { text: '우산을 반납하겠습니다', phraseId: 'p_kasa_wo_kaeshimasu', correct: true },
        { text: '잠시만 기다려 주세요', phraseId: 'p_chotto_matte', correct: true, feedback: '바로 받기 어려우면 잠깐 기다려 달라고 해도 좋아요' },
        { text: '기내수하물로 하겠습니다', phraseId: 'p_kore_tebutsu_ni_shimasu', correct: false, feedback: '공항 수하물 표현이라 호텔 우산 상황에는 맞지 않아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '우산을 언제 돌려주면 되는지 확인한다',
      speaker: '프런트 직원',
      recapPromptJa: 'おかえりのときにおねがいします',
      recapPromptKo: '돌아오실 때 부탁드립니다',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '우산을 반납하겠습니다', phraseId: 'p_kasa_wo_kaeshimasu', correct: true },
        { text: '치즈를 추가해 주세요', phraseId: 'p_chiizu_tsuika', correct: false, feedback: '파스타 옵션 표현이라 호텔 프런트에서는 어색해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c34: Mission = {
  id: 'C34',
  place: '호텔방변경',
  scenario: '호텔에서 방 바꿔 달라고 하기',
  canDo: '사용자는 호텔 방에 문제가 있을 때 냄새, 침대 타입, 방 크기를 말하고 변경을 요청할 수 있다',
  unlockAfter: ['C4'],
  sequence: ['문제 설명', '방 변경 요청', '대안 확인'],
  speakPhraseIds: ['p_tabako_no_nioi', 'p_heya_kaete_kudasai', 'p_tsuin_no_heya_arimasu_ka'],
  steps: [
    {
      situationKo: '프런트 직원이 무슨 문제인지 묻는다',
      speaker: '프런트 직원',
      promptPhraseId: 'p_dou_nasaimashita_ka',
      choices: [
        { text: '담배 냄새가 납니다', phraseId: 'p_tabako_no_nioi', correct: true },
        { text: '방을 바꿔 주세요', phraseId: 'p_heya_kaete_kudasai', correct: true },
        { text: '접시를 가져가도 되나요?', phraseId: 'p_osara_tottemo_ii', correct: false, feedback: '초밥집 표현이라 호텔 방 문제와 맞지 않아요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '다른 방이 있는지 확인하는 상황',
      speaker: '프런트 직원',
      promptPhraseId: 'p_kakunin_shimasu',
      choices: [
        { text: '트윈 침대 방이 있나요?', phraseId: 'p_tsuin_no_heya_arimasu_ka', correct: true },
        { text: '더 넓은 방이 있나요?', phraseId: 'p_motto_hiroi_heya', correct: true },
        { text: '알덴테로 부탁합니다', phraseId: 'p_arudente_de', correct: false, feedback: '음식 주문 표현이라 방 변경에는 맞지 않아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '가능한 방을 안내받고 마무리한다',
      speaker: '프런트 직원',
      recapPromptJa: 'べつのへやをごよういします',
      recapPromptKo: '다른 방을 준비하겠습니다',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '연어 주세요', phraseId: 'p_saamon_kudasai', correct: false, feedback: '스시 주문 표현이라 호텔에서는 어색해요' },
      ],
    },
  ],
};

export const c35: Mission = {
  id: 'C35',
  place: '나리타역',
  scenario: '나리타 공항역에서 오픈 티켓 교환',
  canDo: '사용자는 나리타 공항역 창구에서 오픈 티켓을 실제 승차권으로 교환하고 시간 변경을 요청할 수 있다',
  unlockAfter: ['C23'],
  sequence: ['창구 찾기', '티켓 교환', '시간 확인'],
  speakPhraseIds: ['p_open_ticket_koukan', 'p_kono_chiketto_tsukaemasu_ka', 'p_narita_ekisupuresu'],
  steps: [
    {
      situationKo: '역무원이 창구에서 티켓 교환을 안내한다',
      speaker: '역무원',
      promptPhraseId: 'p_madoguchi_de_koukan',
      choices: [
        { text: '오픈 티켓을 교환하고 싶습니다', phraseId: 'p_open_ticket_koukan', correct: true },
        { text: '이 티켓 사용할 수 있나요?', phraseId: 'p_kono_chiketto_tsukaemasu_ka', correct: true },
        { text: '우산을 빌릴 수 있나요?', phraseId: 'p_kasa_kariremasu_ka', correct: false, feedback: '역 창구에서는 티켓 교환을 말해야 해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '어떤 열차로 바꿀지 말한다',
      speaker: '역무원',
      promptPhraseId: 'p_jiyuuseki_desu_ka',
      choices: [
        { text: '나리타 익스프레스로 부탁합니다', phraseId: 'p_narita_ekisupuresu', correct: true },
        { text: '시간을 바꾸고 싶어요', phraseId: 'p_jikan_kaetai', correct: true },
        { text: '담배 냄새가 납니다', phraseId: 'p_tabako_no_nioi', correct: false, feedback: '호텔 방 문제 표현이라 역 창구에서는 맞지 않아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '승강장 안내를 듣고 마무리한다',
      speaker: '역무원',
      promptPhraseId: 'p_noriba_wa_jyuunibansen_desu',
      choices: [
        { text: '몇 번 선이에요?', phraseId: 'p_nanbansen', correct: true },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '조금 작아요', phraseId: 'p_chotto_chiisai_desu', correct: false, feedback: '편집샵 피팅 표현이라 승강장 안내와 맞지 않아요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c36: Mission = {
  id: 'C36',
  place: '공항수하물',
  scenario: '공항에서 수하물 무게 줄이기',
  canDo: '사용자는 공항 체크인에서 수하물 초과 안내를 듣고 추가 요금 대신 짐을 줄이거나 기내수하물로 돌릴 수 있다',
  unlockAfter: ['C9'],
  sequence: ['무게 초과', '요금 확인', '짐 줄이기'],
  speakPhraseIds: ['p_tsui_ryoukin_ikura', 'p_nimotsu_herashimasu', 'p_kore_tebutsu_ni_shimasu'],
  steps: [
    {
      situationKo: '수하물 무게가 초과됐다는 말을 듣는다',
      speaker: '항공사 직원',
      promptPhraseId: 'p_jyuuryou_koeteimasu',
      choices: [
        { text: '추가 요금은 얼마인가요?', phraseId: 'p_tsui_ryoukin_ikura', correct: true },
        { text: '짐을 줄이겠습니다', phraseId: 'p_nimotsu_herashimasu', correct: true },
        { text: '조금 작아요', phraseId: 'p_chotto_chiisai_desu', correct: false, feedback: '공항 수하물 상황에서는 무게/요금을 말해야 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '추가 요금이 든다는 안내를 듣는다',
      speaker: '항공사 직원',
      promptPhraseId: 'p_tsui_ryoukin_kakarimasu',
      choices: [
        { text: '이걸 기내수하물로 하겠습니다', phraseId: 'p_kore_tebutsu_ni_shimasu', correct: true },
        { text: '잠시만 기다려 주세요', phraseId: 'p_chotto_matte', correct: true },
        { text: '면세 부탁합니다', phraseId: 'p_menzei_onegai', correct: false, feedback: '면세 계산 표현이라 수하물 초과에는 맞지 않아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '짐을 뺀 뒤 다시 확인받는다',
      speaker: '항공사 직원',
      recapPromptJa: 'もういちどはかります',
      recapPromptKo: '다시 한 번 무게를 재겠습니다',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '치즈를 추가해 주세요', phraseId: 'p_chiizu_tsuika', correct: false, feedback: '식당 옵션 표현이라 공항 수하물과 맞지 않아요' },
      ],
    },
  ],
};

export const c37: Mission = {
  id: 'C37',
  place: '조식뷔페',
  scenario: '조식 뷔페에서 음식 보충 요청',
  canDo: '사용자는 호텔 조식 뷔페에서 음식이 떨어졌을 때 보충을 부탁하고 커피 위치를 물을 수 있다',
  unlockAfter: ['C4'],
  sequence: ['음식 부족', '보충 요청', '위치 확인'],
  speakPhraseIds: ['p_ryouri_sukunai', 'p_mou_sukoshi_moraemasu_ka', 'p_koohii_wa_doko'],
  steps: [
    {
      situationKo: '뷔페 음식이 거의 없어 직원에게 말한다',
      speaker: '직원',
      recapPromptJa: 'どうされましたか',
      recapPromptKo: '무슨 일이세요?',
      choices: [
        { text: '음식이 부족합니다', phraseId: 'p_ryouri_sukunai', correct: true },
        { text: '조금 더 받을 수 있나요?', phraseId: 'p_mou_sukoshi_moraemasu_ka', correct: true },
        { text: '시간을 바꾸고 싶어요', phraseId: 'p_jikan_kaetai', correct: false, feedback: '역 창구 표현이라 조식 뷔페에는 맞지 않아요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 곧 보충하겠다고 말한다',
      speaker: '직원',
      promptPhraseId: 'p_sugu_hojuu_shimasu',
      choices: [
        { text: '커피는 어디예요?', phraseId: 'p_koohii_wa_doko', correct: true },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '방을 바꿔 주세요', phraseId: 'p_heya_kaete_kudasai', correct: false, feedback: '호텔 프런트 요청이지 조식장 표현은 아니에요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '추가 요청 후 짧게 마무리한다',
      speaker: '직원',
      recapPromptJa: 'しょうしょうおまちください',
      recapPromptKo: '잠시만 기다려 주세요',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'partial' },
        { text: '접시를 가져가도 되나요?', phraseId: 'p_osara_tottemo_ii', correct: false, feedback: '회전초밥 표현이라 뷔페 보충 요청에는 어색해요' },
      ],
    },
  ],
};

export const c38: Mission = {
  id: 'C38',
  place: '스시추가',
  scenario: '스시집에서 생선 이름과 추가 주문',
  canDo: '사용자는 스시집에서 추천 생선, 생선 이름, 맥주 추가 주문을 말할 수 있다',
  unlockAfter: ['C17'],
  sequence: ['추천 묻기', '생선 주문', '음료 추가'],
  speakPhraseIds: ['p_osusume_no_sakana', 'p_hamachi_kudasai', 'p_biiru_mou_ippai'],
  steps: [
    {
      situationKo: '스시집에서 추천 생선을 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_okawari_wa_irimasu_ka',
      choices: [
        { text: '추천 생선은 뭐예요?', phraseId: 'p_osusume_no_sakana', correct: true },
        { text: '아지는 뭐예요?', phraseId: 'p_aji_wa_nan_desu_ka', correct: true },
        { text: '우산을 반납하겠습니다', phraseId: 'p_kasa_wo_kaeshimasu', correct: false, feedback: '호텔 우산 표현이라 스시집에서는 맞지 않아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '생선 이름을 듣고 하나 더 주문한다',
      speaker: '점원',
      promptPhraseId: 'p_sabi_wa_daijoubu_desu_ka',
      choices: [
        { text: '방어 주세요', phraseId: 'p_hamachi_kudasai', correct: true },
        { text: '맥주 한 잔 더 주세요', phraseId: 'p_biiru_mou_ippai', correct: true },
        { text: '더 넓은 방이 있나요?', phraseId: 'p_motto_hiroi_heya', correct: false, feedback: '호텔 방 변경 표현이에요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '추가 주문 뒤 계산을 요청한다',
      speaker: '점원',
      recapPromptJa: 'ほかにごちゅうもんはありますか',
      recapPromptKo: '추가 주문 있으세요?',
      choices: [
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: true },
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: true },
        { text: '오픈 티켓을 교환하고 싶습니다', phraseId: 'p_open_ticket_koukan', correct: false, feedback: '역 창구 표현이라 식당 계산에는 맞지 않아요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c39: Mission = {
  id: 'C39',
  place: '파스타',
  scenario: '파스타 메뉴 옵션 선택',
  canDo: '사용자는 파스타집에서 면 익힘, 소스, 치즈, 마늘 제외 같은 옵션을 요청할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['면 익힘', '추가 옵션', '제외 요청'],
  speakPhraseIds: ['p_arudente_de', 'p_chiizu_tsuika', 'p_ninniku_nuki'],
  steps: [
    {
      situationKo: '면 익힘을 어떻게 할지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_men_no_katasa',
      choices: [
        { text: '알덴테로 부탁합니다', phraseId: 'p_arudente_de', correct: true },
        { text: '보통으로 부탁합니다', phraseId: 'p_futsuu_de', correct: true },
        { text: '티켓을 교환하고 싶습니다', phraseId: 'p_open_ticket_koukan', correct: false, feedback: '파스타 주문에서는 음식 옵션을 답해야 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '소스와 추가 옵션을 고른다',
      speaker: '점원',
      promptPhraseId: 'p_soosu_erabemasu',
      choices: [
        { text: '치즈를 추가해 주세요', phraseId: 'p_chiizu_tsuika', correct: true },
        { text: '마늘 빼고 부탁합니다', phraseId: 'p_ninniku_nuki', correct: true },
        { text: '기내수하물로 하겠습니다', phraseId: 'p_kore_tebutsu_ni_shimasu', correct: false, feedback: '공항 수하물 표현이에요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '주문을 마무리한다',
      speaker: '점원',
      recapPromptJa: 'ほかにごようぼうはありますか',
      recapPromptKo: '다른 요청 있으세요?',
      choices: [
        { text: '이걸로 부탁합니다', phraseId: 'p_kore_de', correct: true },
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true },
        { text: '담배 냄새가 납니다', phraseId: 'p_tabako_no_nioi', correct: false, feedback: '호텔 방 문제 표현이에요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c40: Mission = {
  id: 'C40',
  place: '편집샵계산',
  scenario: '편집샵에서 계산과 면세 처리',
  canDo: '사용자는 편집샵 계산대에서 면세, 여권 제시, 선물 포장, 영수증 방식을 말할 수 있다',
  unlockAfter: ['C32'],
  sequence: ['면세 요청', '여권 제시', '포장/영수증'],
  speakPhraseIds: ['p_menzei_onegai', 'p_gift_wrapping_onegai', 'p_receipt_email_ii'],
  steps: [
    {
      situationKo: '계산대에서 면세 가능 여부를 확인한다',
      speaker: '점원',
      promptPhraseId: 'p_menzei_counter_kochira',
      choices: [
        { text: '면세 부탁합니다', phraseId: 'p_menzei_onegai', correct: true },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true },
        { text: '맥주 한 잔 더 주세요', phraseId: 'p_biiru_mou_ippai', correct: false, feedback: '식당 추가 주문 표현이라 계산대와 맞지 않아요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '포장 방식과 결제를 정한다',
      speaker: '점원',
      recapPromptJa: 'おつつみしますか',
      recapPromptKo: '포장해 드릴까요?',
      choices: [
        { text: '선물 포장 부탁합니다', phraseId: 'p_gift_wrapping_onegai', correct: true },
        { text: '카드로요', phraseId: 'p_card_de', correct: true },
        { text: '마늘 빼고 부탁합니다', phraseId: 'p_ninniku_nuki', correct: false, feedback: '파스타 옵션 표현이라 편집샵 계산대에서는 맞지 않아요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '영수증 방식을 확인한다',
      speaker: '점원',
      recapPromptJa: 'レシートはいかがしますか',
      recapPromptKo: '영수증은 어떻게 하시겠어요?',
      choices: [
        { text: '영수증은 이메일로 괜찮습니다', phraseId: 'p_receipt_email_ii', correct: true },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: true },
        { text: '짐을 줄이겠습니다', phraseId: 'p_nimotsu_herashimasu', correct: false, feedback: '공항 수하물 표현이에요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const frictionMissions: Mission[] = [c31, c32, c33, c34, c35, c36, c37, c38, c39, c40];
