import type { Mission } from '../types';

export const c31: Mission = {
  id: 'C31',
  tier: 4,
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
        { text: '두 명이요', phraseId: 'p_futari_desu', correct: true, feedback: '「二人(ふたり)です」— 인원 표현은 ひとり(1명)・ふたり(2명)처럼 불규칙. 세 명부터는 〇人(にん): さんにん・よにん...' },
        { text: '카운터석으로 부탁합니다', phraseId: 'p_kauntaa_de_onegai', correct: true, feedback: '「カウンターでお願いします」— 회전 레일 바로 앞 자리. 장인이 직접 쥐는 스시를 바로 받는 묘미가 있어요' },
        { text: '참치 주세요', phraseId: 'p_maguro_kudasai', correct: false, feedback: '아직 자리 안내 중이에요 — 주문은 자리에 앉아 터치패널로 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '터치패널로 주문하라는 안내를 듣는다',
      speaker: '점원',
      promptPhraseId: 'p_touch_panel_order',
      choices: [
        { text: '참치 주세요', phraseId: 'p_maguro_kudasai', correct: true, feedback: '「マグロください」— 참치는 회전초밥 인기 1위. 赤身(あかみ)=살코기, 中(ちゅう)トロ·大(おお)トロ=뱃살 부위도 알아두면 좋아요' },
        { text: '연어 주세요', phraseId: 'p_saamon_kudasai', correct: true, feedback: '「サーモンください」— 한국인이 가장 좋아하는 초밥 재료 중 하나. 터치패널에서 쉽게 선택할 수 있어요' },
        { text: '계산 부탁드려요', phraseId: 'p_okaikei', correct: false, feedback: '지금은 주문 단계예요 — 계산은 다 먹은 뒤 접시를 세며 해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '접시를 세고 계산하는 순간',
      speaker: '점원',
      promptPhraseId: 'p_osara_count',
      choices: [
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: true, feedback: '「お会計(かいけい)お願いします」— 회전초밥은 접시 수로 계산. 가게마다 단색 접시=100엔, 금색=500엔 등 규칙이 달라요' },
        { text: '맥주 한 잔 더 주세요', phraseId: 'p_biiru_mou_ippai', correct: false, feedback: '접시를 세며 계산하는 중이에요. 추가 주문은 계산 전에 해요' },
        { text: '참치 주세요', phraseId: 'p_maguro_kudasai', correct: false, feedback: '접시를 세어 계산하는 중이에요 — 추가 주문은 계산 전에 해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c32: Mission = {
  id: 'C32',
  tier: 4,
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
        { text: '입어 봐도 돼요?', phraseId: 'p_shichaku', correct: true, feedback: '「試着(しちゃく)してもいいですか」— 허락 없이 입어보면 실례예요. 피팅룸 이용 수는 보통 3벌 이내로 제한돼요' },
        { text: 'M 사이즈 있나요?', phraseId: 'p_emu_saizu_arimasu_ka', correct: true, feedback: '「Mサイズありますか」— 일본 S≒한국 M, 일본 M≒한국 L인 경우가 많아요. 사이즈 표기를 반드시 확인하세요' },
        { text: '짐을 줄이겠습니다', phraseId: 'p_nimotsu_herashimasu', correct: false, feedback: '수하물 표현이라 편집샵에서는 맞지 않아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '피팅룸 위치를 안내받는다',
      speaker: '점원',
      promptPhraseId: 'p_shichakushitsu_kochira',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true, feedback: '피팅룸 안내에 대한 자연스러운 확인+감사 표현. わかりました+ありがとうございます를 한 묶음으로 써요' },
        { text: '이걸로 할게요', phraseId: 'p_kore_kudasai_shop', correct: false, feedback: '아직 입어보기 전이에요. 피팅룸 안내에는 확인 응답이 자연스러워요' },
        { text: '입어 봐도 돼요?', phraseId: 'p_shichaku', correct: false, feedback: '피팅룸 안내를 받는 중이에요 — 입어봐도 되는지는 이미 물었어요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '입어 본 뒤 사이즈가 맞는지 말한다',
      speaker: '점원',
      recapPromptJa: 'サイズはいかがですか',
      recapPromptKo: '사이즈는 어떠세요?',
      choices: [
        { text: '조금 작아요', phraseId: 'p_chotto_chiisai_desu', correct: true, feedback: '「ちょっと小さいです」— ちょっと(조금)를 붙이면 부드럽게 전달돼요. 이어서 「Lサイズはありますか」로 연결하면 완벽해요' },
        { text: '이걸로 할게요', phraseId: 'p_kore_kudasai_shop', correct: true, feedback: '마음에 들면 「これをください」로 구매 확정. 계산대로 들고 가거나 직원에게 전달해요' },
        { text: 'M 사이즈 있나요?', phraseId: 'p_emu_saizu_arimasu_ka', correct: false, feedback: '이미 입어본 뒤예요 — 지금은 사이즈가 맞는지 말해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c33: Mission = {
  id: 'C33',
  tier: 4,
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
        { text: '우산을 빌릴 수 있나요?', phraseId: 'p_kasa_kariremasu_ka', correct: true, feedback: '「傘(かさ)を借りられますか」— 대부분의 일본 호텔은 무료 우산 대여 서비스를 운영해요. 프런트 옆에 비치돼 있어요' },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true, feedback: '비 소식을 알려준 직원에 대한 감사 표현. 확인+감사를 동시에 전달할 수 있어요' },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: false, feedback: '아직 우산 대여를 말하기 전이에요 — 먼저 빌릴 수 있는지 물어봐요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '우산 위치를 안내받는다',
      speaker: '프런트 직원',
      promptPhraseId: 'p_kasa_wa_front_desu',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true, feedback: '우산 위치 안내에 대한 자연스러운 응답. 일본 호텔 서비스에 감사를 표하는 게 예의예요' },
        { text: '우산을 반납하겠습니다', phraseId: 'p_kasa_wo_kaeshimasu', correct: false, feedback: '지금은 빌리는 중이에요. 반납 표현은 돌아온 뒤에 써요' },
        { text: '우산을 반납하겠습니다', phraseId: 'p_kasa_wo_kaeshimasu', correct: false, feedback: '지금 막 빌리는 중이에요 — 반납은 외출 후 돌아와서 해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '우산을 언제 돌려주면 되는지 확인한다',
      speaker: '프런트 직원',
      recapPromptJa: 'おかえりのときにおねがいします',
      recapPromptKo: '돌아오실 때 부탁드립니다',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true, feedback: '반납 시점 안내를 이해했다는 표현. 외출 후 돌아왔을 때 반드시 프런트에 반납해요' },
        { text: '우산을 반납하겠습니다', phraseId: 'p_kasa_wo_kaeshimasu', correct: true, feedback: '「傘を返します」— 돌아와서 직접 반납할 때 쓰는 표현. 약속을 지키는 모습이 일본에서 큰 인상을 줘요' },
        { text: '우산을 빌릴 수 있나요?', phraseId: 'p_kasa_kariremasu_ka', correct: false, feedback: '우산은 이미 빌렸어요 — 지금은 반납 시점을 확인해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c34: Mission = {
  id: 'C34',
  tier: 4,
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
        { text: '담배 냄새가 납니다', phraseId: 'p_tabako_no_nioi', correct: true, feedback: '「タバコのにおいがします」— 금연 객실에 냄새가 나면 즉시 프런트에 말해요. 일본 호텔은 신속하게 대응해줘요' },
        { text: '방을 바꿔 주세요', phraseId: 'p_heya_kaete_kudasai', correct: true, feedback: '「部屋(へや)を変えてください」— 직접적인 방 변경 요청. 이유를 먼저 말하고 이 표현을 이어가면 더 자연스러워요' },
        { text: '트윈 침대 방이 있나요?', phraseId: 'p_tsuin_no_heya_arimasu_ka', correct: false, feedback: '먼저 무슨 문제인지 말해요 — 다른 방 문의는 그다음에 해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '다른 방이 있는지 확인하는 상황',
      speaker: '프런트 직원',
      promptPhraseId: 'p_kakunin_shimasu',
      choices: [
        { text: '트윈 침대 방이 있나요?', phraseId: 'p_tsuin_no_heya_arimasu_ka', correct: true, feedback: '「ツインの部屋はありますか」— 2인 여행이라면 더블보다 트윈이 더 편한 경우도 많아요. 요청하면 응해주는 경우가 많아요' },
        { text: '더 넓은 방이 있나요?', phraseId: 'p_motto_hiroi_heya', correct: true, feedback: '「もっと広(ひろ)い部屋はありますか」— 업그레이드를 요청하는 표현. 여유 객실이 있으면 동일 요금으로 바꿔주기도 해요' },
        { text: '담배 냄새가 납니다', phraseId: 'p_tabako_no_nioi', correct: false, feedback: '문제는 이미 말했어요 — 지금은 다른 방이 있는지 물어요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '가능한 방을 안내받고 마무리한다',
      speaker: '프런트 직원',
      recapPromptJa: 'べつのへやをごよういします',
      recapPromptKo: '다른 방을 준비하겠습니다',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true, feedback: '새 방 준비 소식에 대한 감사 표현. 일본 호텔 스태프의 노고를 인정해주는 한 마디가 큰 인상을 남겨요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '방을 바꿔 주세요', phraseId: 'p_heya_kaete_kudasai', correct: false, feedback: '새 방을 안내받는 마무리예요 — 감사 인사로 답하면 돼요' },
      ],
    },
  ],
};

export const c35: Mission = {
  id: 'C35',
  tier: 4,
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
        { text: '오픈 티켓을 교환하고 싶습니다', phraseId: 'p_open_ticket_koukan', correct: true, feedback: '「オープンチケットを交換(こうかん)したいです」— 날짜·시간이 열린 항공권을 특정 편으로 확정할 때 써요' },
        { text: '이 티켓 사용할 수 있나요?', phraseId: 'p_kono_chiketto_tsukaemasu_ka', correct: true, feedback: '「このチケット使えますか」— 갖고 있는 승차권·티켓이 해당 열차에 유효한지 확인하는 표현' },
        { text: '시간을 바꾸고 싶어요', phraseId: 'p_jikan_kaetai', correct: false, feedback: '먼저 오픈 티켓을 교환해요 — 시간 변경은 그다음 단계예요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '어떤 열차로 바꿀지 말한다',
      speaker: '역무원',
      recapPromptJa: 'どの列車になさいますか',
      recapPromptKo: '어느 열차로 하시겠어요?',
      choices: [
        { text: '나리타 익스프레스로 부탁합니다', phraseId: 'p_narita_ekisupuresu', correct: true, feedback: '成田エクスプレス(N\'EX)는 나리타↔도쿄역 약 60분. 좌석 지정이므로 현장 교환 또는 사전 예약이 필요해요' },
        { text: '시간을 바꾸고 싶어요', phraseId: 'p_jikan_kaetai', correct: true, feedback: '「時間(じかん)を変えたいです」— 출발 시간 변경 요청. 오픈 티켓이면 대부분 가능하지만 빈 좌석에 따라 달라요' },
        { text: '오픈 티켓을 교환하고 싶습니다', phraseId: 'p_open_ticket_koukan', correct: false, feedback: '교환은 이미 요청했어요 — 지금은 어느 열차로 할지 말해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '승강장 안내를 듣고 마무리한다',
      speaker: '역무원',
      promptPhraseId: 'p_noriba_wa_jyuunibansen_desu',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true, feedback: '승강장 번호를 확인했다는 표현. 나리타 공항역은 승강장이 복잡하니 방향 표지도 함께 확인해요' },
        { text: '몇 번 선이에요?', phraseId: 'p_nanbansen', correct: false, feedback: '방금 12번선이라고 들었어요. 들은 정보를 다시 묻지 않아요' },
        { text: '이 티켓 사용할 수 있나요?', phraseId: 'p_kono_chiketto_tsukaemasu_ka', correct: false, feedback: '승강장 안내를 들었어요 — 표 교환은 이미 끝났어요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c36: Mission = {
  id: 'C36',
  tier: 4,
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
        { text: '추가 요금은 얼마인가요?', phraseId: 'p_tsui_ryoukin_ikura', correct: true, feedback: '「追加料金(ついかりょうきん)はいくらですか」— 초과 요금은 항공사마다 달라요. kg당 수천 엔이 되는 경우도 있으니 먼저 확인해요' },
        { text: '짐을 줄이겠습니다', phraseId: 'p_nimotsu_herashimasu', correct: true, feedback: '「荷物(にもつ)を減(へ)らします」— 추가 요금보다 현장에서 짐을 꺼내는 게 대부분 더 경제적이에요' },
        { text: '이걸 기내수하물로 하겠습니다', phraseId: 'p_kore_tebutsu_ni_shimasu', correct: false, feedback: '먼저 무게·요금을 확인해요 — 기내로 돌리는 건 그다음 단계예요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '추가 요금이 든다는 안내를 듣는다',
      speaker: '항공사 직원',
      promptPhraseId: 'p_tsui_ryoukin_kakarimasu',
      choices: [
        { text: '이걸 기내수하물로 하겠습니다', phraseId: 'p_kore_tebutsu_ni_shimasu', correct: true, feedback: '「これを手荷物(てにもつ)にします」— 위탁 수하물에서 빼 기내에 들고 타겠다는 표현. 액체·예리한 물건은 기내 반입 규정을 먼저 확인해요' },
        { text: '잠시만 기다려 주세요', phraseId: 'p_chotto_matte', correct: true, feedback: '「ちょっと待ってください」— 가방을 열어 짐을 꺼내는 동안 시간을 버는 표현. 일본 직원은 기다려줘요' },
        { text: '추가 요금은 얼마인가요?', phraseId: 'p_tsui_ryoukin_ikura', correct: false, feedback: '요금은 이미 들었어요 — 지금은 짐을 어떻게 할지 정해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '짐을 뺀 뒤 다시 확인받는다',
      speaker: '항공사 직원',
      recapPromptJa: 'もういちどはかります',
      recapPromptKo: '다시 한 번 무게를 재겠습니다',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true, feedback: '재측정 안내에 대한 확인 표현. 신속하게 처리해 준 직원에게 감사를 전해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '이걸 기내수하물로 하겠습니다', phraseId: 'p_kore_tebutsu_ni_shimasu', correct: false, feedback: '짐을 뺀 뒤 다시 무게를 재는 마무리예요 — 확인·감사로 답해요' },
      ],
    },
  ],
};

export const c37: Mission = {
  id: 'C37',
  tier: 4,
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
        { text: '음식이 부족합니다', phraseId: 'p_ryouri_sukunai', correct: true, feedback: '「料理(りょうり)が少(すく)ないです」— 직접 말하면 일본 뷔페 직원은 즉시 보충해줘요. 손짓+이 표현이면 충분해요' },
        { text: '조금 더 받을 수 있나요?', phraseId: 'p_mou_sukoshi_moraemasu_ka', correct: true, feedback: '「もう少(すこ)しもらえますか」— 공손한 부탁 표현. もらえますか(받을 수 있나요?)는 다양한 상황에서 쓸 수 있어요' },
        { text: '커피는 어디예요?', phraseId: 'p_koohii_wa_doko', correct: false, feedback: '지금은 음식이 부족하다고 말하는 상황이에요 — 커피 위치는 그다음에 물어요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 곧 보충하겠다고 말한다',
      speaker: '직원',
      promptPhraseId: 'p_sugu_hojuu_shimasu',
      choices: [
        { text: '커피는 어디예요?', phraseId: 'p_koohii_wa_doko', correct: true, feedback: '「コーヒーはどこですか」— 뷔페에서 음료 위치를 확인하는 표현. お茶(おちゃ)=녹차, ジュース=주스로 바꿔도 같은 패턴이에요' },
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true, feedback: '보충 예정 안내에 대한 감사 표현. 일본 호텔 직원의 신속한 서비스에 짧은 감사 인사가 큰 의미를 가져요' },
        { text: '음식이 부족합니다', phraseId: 'p_ryouri_sukunai', correct: false, feedback: '음식이 부족하다는 건 이미 말했어요 — 안내에 감사하거나 음료 위치를 물어요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '추가 요청 후 짧게 마무리한다',
      speaker: '직원',
      recapPromptJa: 'しょうしょうおまちください',
      recapPromptKo: '잠시만 기다려 주세요',
      choices: [
        { text: '알겠습니다, 감사합니다', phraseId: 'p_wakarimashita_arigatou', correct: true, feedback: '기다리겠다는 표현. 일본 호텔 조식 서비스에 대한 감사가 남다른 경험을 만들어요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'partial' },
        { text: '조금 더 받을 수 있나요?', phraseId: 'p_mou_sukoshi_moraemasu_ka', correct: false, feedback: '추가 요청은 이미 했어요 — 기다리겠다는 인사로 마무리해요' },
      ],
    },
  ],
};

export const c38: Mission = {
  id: 'C38',
  tier: 4,
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
      recapPromptJa: 'つぎはなにをにぎりましょうか',
      recapPromptKo: '다음은 무엇을 만들어 드릴까요?',
      choices: [
        { text: '추천 생선은 뭐예요?', phraseId: 'p_osusume_no_sakana', correct: true, feedback: '「おすすめの魚(さかな)は何(なん)ですか」— 제철 생선을 추천받는 최고의 방법. 장인이 그날 들어온 최고 재료를 알려줘요' },
        { text: '아지는 뭐예요?', phraseId: 'p_aji_wa_nan_desu_ka', correct: true, feedback: '「アジは何(なん)ですか」— 모르는 생선 이름을 바로 물어봐요. アジ=전갱이(고등어 계열), 여름 제철로 지방이 오른 인기 초밥 재료예요' },
        { text: '방어 주세요', phraseId: 'p_hamachi_kudasai', correct: false, feedback: '아직 추천을 받는 중이에요 — 생선 주문은 그다음에 해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '생선 이름을 듣고 하나 더 주문한다',
      speaker: '점원',
      recapPromptJa: 'はまちもおいしいですよ',
      recapPromptKo: '방어도 맛있어요',
      choices: [
        { text: '방어 주세요', phraseId: 'p_hamachi_kudasai', correct: true, feedback: '「ハマチください」— 방어(はまち)는 겨울 제철 지방이 오른 인기 재료. カウンター 스시집에서 직접 장인에게 말하는 재미가 있어요' },
        { text: '맥주 한 잔 더 주세요', phraseId: 'p_biiru_mou_ippai', correct: true, feedback: '「ビールもう一杯(いっぱい)ください」— 추가 패턴: もう一杯=한 잔 더, もう一皿(さら)=접시 하나 더, もう一度(いちど)=한 번 더로 응용 가능해요' },
        { text: '추천 생선은 뭐예요?', phraseId: 'p_osusume_no_sakana', correct: false, feedback: '추천은 이미 받았어요 — 마음에 드는 생선을 주문하거나 음료를 추가해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '추가 주문 뒤 계산을 요청한다',
      speaker: '점원',
      recapPromptJa: 'ほかにごちゅうもんはありますか',
      recapPromptKo: '추가 주문 있으세요?',
      choices: [
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: true, feedback: '「お会計(かいけい)お願いします」— 스시 카운터 계산은 자리에서 바로 해요. 현금 선호 가게가 많으니 카드 여부를 미리 확인하세요' },
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: true, feedback: '「ごちそうさまでした」— 식사 후 반드시 해야 하는 인사. 장인과 홀 직원 모두에게 전하면 최고의 마무리예요' },
        { text: '방어 주세요', phraseId: 'p_hamachi_kudasai', correct: false, feedback: '계산하는 마무리예요 — 추가 주문은 계산 전에 해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c39: Mission = {
  id: 'C39',
  tier: 4,
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
        { text: '알덴테로 부탁합니다', phraseId: 'p_arudente_de', correct: true, feedback: '「アルデンテで」— 이탈리아어 al dente가 일본에서도 그대로 통해요. 씹히는 식감이 살아있는 면을 원할 때 써요' },
        { text: '보통으로 부탁합니다', phraseId: 'p_futsuu_de', correct: true, feedback: '「普通(ふつう)で」— 특별한 요청 없이 기본으로 달라고 할 때. 「ふつうで大丈夫です」도 자연스러워요' },
        { text: '치즈를 추가해 주세요', phraseId: 'p_chiizu_tsuika', correct: false, feedback: '지금은 면 익힘을 정하는 단계예요 — 추가 옵션은 그다음에 골라요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '소스와 추가 옵션을 고른다',
      speaker: '점원',
      promptPhraseId: 'p_soosu_erabemasu',
      choices: [
        { text: '치즈를 추가해 주세요', phraseId: 'p_chiizu_tsuika', correct: true, feedback: '「チーズ追加(ついか)で」— 추가 옵션 패턴: 〇〇追加でお願いします. ベーコン(베이컨)·エビ(새우)도 같은 패턴으로 추가 가능해요' },
        { text: '마늘 빼고 부탁합니다', phraseId: 'p_ninniku_nuki', correct: true, feedback: '「にんにく抜(ぬ)きで」— 제외 요청 패턴: 〇〇抜きでお願いします. 알레르기나 기피 식재료가 있을 때 꼭 활용하세요' },
        { text: '알덴테로 부탁합니다', phraseId: 'p_arudente_de', correct: false, feedback: '면 익힘은 이미 정했어요 — 지금은 소스·추가 옵션을 골라요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '주문을 마무리한다',
      speaker: '점원',
      recapPromptJa: 'ほかにごようぼうはありますか',
      recapPromptKo: '다른 요청 있으세요?',
      choices: [
        { text: '이걸로 부탁합니다', phraseId: 'p_kore_de', correct: true, feedback: '「これで」— 이걸로 됐다는 마무리 표현. 추가 요청이 없을 때 간단하게 주문을 확정하는 한 마디예요' },
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true, feedback: '「お水ください」— 파스타집에서도 물은 대부분 무료. お水(물)와 スパークリングウォーター(탄산수)를 구분해서 요청해요' },
        { text: '치즈를 추가해 주세요', phraseId: 'p_chiizu_tsuika', correct: false, feedback: '주문을 마무리하는 단계예요 — 추가 옵션은 앞서 골랐어요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const c40: Mission = {
  id: 'C40',
  tier: 4,
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
        { text: '면세 부탁합니다', phraseId: 'p_menzei_onegai', correct: true, feedback: '「免税(めんぜい)お願いします」— 계산 전에 먼저 말해야 해요. 5,000엔 이상 구매 시 소비세 10%를 돌려받아요' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true, feedback: '면세 처리에는 여권 원본이 필요해요. 사본이나 사진은 인정되지 않으니 항상 원본을 지참하세요' },
        { text: '선물 포장 부탁합니다', phraseId: 'p_gift_wrapping_onegai', correct: false, feedback: '먼저 면세를 요청해요 — 선물 포장은 그다음 단계예요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '포장 방식과 결제를 정한다',
      speaker: '점원',
      recapPromptJa: 'おつつみしますか',
      recapPromptKo: '포장해 드릴까요?',
      choices: [
        { text: '선물 포장 부탁합니다', phraseId: 'p_gift_wrapping_onegai', correct: true, feedback: '「ギフトラッピングお願いします」— 일본 백화점·편집샵의 선물 포장 수준은 세계 최고예요. 대부분 무료 또는 저렴해요' },
        { text: '카드로요', phraseId: 'p_card_de', correct: true, feedback: '「カードで」— 결제 방식 표현. クレジットカードで, PayPayで처럼 구체적으로 말하면 처리가 더 빠르게 돼요' },
        { text: '면세 부탁합니다', phraseId: 'p_menzei_onegai', correct: false, feedback: '면세는 이미 요청했어요 — 지금은 포장·결제 방식을 정해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '영수증 방식을 확인한다',
      speaker: '점원',
      recapPromptJa: 'レシートはいかがしますか',
      recapPromptKo: '영수증은 어떻게 하시겠어요?',
      choices: [
        { text: '영수증은 이메일로 괜찮습니다', phraseId: 'p_receipt_email_ii', correct: true, feedback: '「レシートはメールで大丈夫です」— 디지털 영수증 표현. 환경을 생각하는 일본 매장에서 자주 묻는 질문이에요' },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: true, feedback: '종이 영수증은 면세 증빙·경비 처리에 필요해요. 해외 신용카드 이용 시 분쟁 해결에도 유용하니 보관해두세요' },
        { text: '짐을 줄이겠습니다', phraseId: 'p_nimotsu_herashimasu', correct: false, feedback: '공항 수하물 표현이에요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};

export const frictionMissions: Mission[] = [c31, c32, c33, c34, c35, c36, c37, c38, c39, c40];
