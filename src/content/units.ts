import type { Unit } from './types';

export const units: Unit[] = [
  {
    id: 'u_k1_seion', track: 'kana', stage: 'K1', mode: 'drill',
    canDo: '사용자는 K1 히라가나 청음(あいうえお·かきくけこ)을 평균 0.8초 내 95% 정확도로 읽고 듣고 구분할 수 있다',
    kanaIds: ['k_hira_a', 'k_hira_i', 'k_hira_u', 'k_hira_e', 'k_hira_o', 'k_hira_ka', 'k_hira_ki', 'k_hira_ku', 'k_hira_ke', 'k_hira_ko'],
  },
  {
    id: 'u_k2_seion', track: 'kana', stage: 'K2', mode: 'drill',
    canDo: '사용자는 K2 히라가나 청음(さしすせそ)을 평균 0.8초 내 95% 정확도로 읽고 듣고 구분할 수 있다',
    kanaIds: ['k_hira_sa', 'k_hira_shi', 'k_hira_su', 'k_hira_se', 'k_hira_so'],
  },
  {
    id: 'u_k3_seion', track: 'kana', stage: 'K3', mode: 'drill',
    canDo: '사용자는 K3 히라가나 청음(たちつてと)을 평균 0.8초 내 95% 정확도로 읽고 듣고 구분할 수 있다',
    kanaIds: ['k_hira_ta', 'k_hira_chi', 'k_hira_tsu', 'k_hira_te', 'k_hira_to'],
  },
  {
    id: 'u_k4_seion', track: 'kana', stage: 'K4', mode: 'drill',
    canDo: '사용자는 K4 히라가나 청음(なにぬねの)을 평균 0.8초 내 95% 정확도로 읽고 듣고 구분할 수 있다',
    kanaIds: ['k_hira_na', 'k_hira_ni', 'k_hira_nu', 'k_hira_ne', 'k_hira_no'],
  },
  {
    id: 'u_b0_reaction', track: 'lang', stage: 'B0', mode: 'reaction',
    ageMotif: '0–1세',
    canDo: '사용자는 일상 대화에서 상대의 짧은 물음을 듣고, 긍정·부정·보류·감사를 한 마디로 답할 수 있다',
    newPhraseIds: ['p_hai', 'p_iie', 'p_un', 'p_iya', 'p_arigatou'],
    reviewPhraseIds: [],
  },
  {
    id: 'u_b4_recovery', track: 'lang', stage: 'B4', mode: 'recovery',
    ageMotif: '4–5세',
    canDo: '사용자는 상대의 말을 못 알아들었을 때, 다시·천천히 말해 달라고 요청할 수 있다',
    newPhraseIds: ['p_mou_ichido', 'p_yukkuri'],
    reviewPhraseIds: ['p_arigatou'],
  },

  // ── B0/B1 코어 (C 미션이 끌어쓰는 표현의 사전 도입, V19 충족) ──
  {
    id: 'u_b0_social', track: 'lang', stage: 'B0', mode: 'reaction',
    canDo: '사용자는 가게·길에서 인사·주의 끌기·짧은 동조를 한 마디로 할 수 있다',
    newPhraseIds: ['p_konnichiwa', 'p_sumimasen', 'p_chotto', 'p_sou_desu', 'p_daijoubu', 'p_kore', 'p_are'],
  },
  {
    id: 'u_b1_shop_core', track: 'lang', stage: 'B1', mode: 'action',
    canDo: '사용자는 편의점 계산대에서 봉투·결제·포인트카드·영수증·젓가락·데우기 요청에 적절히 응답할 수 있다',
    newPhraseIds: ['p_fukuro_iranai', 'p_genkin_de', 'p_card_de', 'p_kore_de', 'p_arimasu', 'p_arimasen', 'p_reshiito_kudasai', 'p_wakarimasen', 'p_atatamete', 'p_hashi_kudasai', 'p_sono_mama_de', 'p_betsubetsu_de', 'p_suica_de', 'p_mou_daijoubu_desu'],
    reviewPhraseIds: ['p_hai', 'p_iie'],
  },
  {
    id: 'u_b1_restaurant_core', track: 'lang', stage: 'B1', mode: 'action',
    canDo: '사용자는 식당에서 인원수를 답하고, 주문·추천·음료·개수를 요청하거나 거절하고, 식사 후 계산을 마무리할 수 있다',
    newPhraseIds: ['p_kore_kudasai', 'p_osusume_wa', 'p_menu_misete', 'p_chotto_matte', 'p_mizu_kudasai', 'p_okaikei', 'p_irimasen', 'p_oishii', 'p_hoshii_desu', 'p_hitotsu_kudasai', 'p_futatsu_kudasai', 'p_kore_to_kore', 'p_karai_desu_ka', 'p_tabemasu', 'p_hitori_desu', 'p_futari_desu', 'p_gochisousama', 'p_arerugi', 'p_kore_nuite'],
  },
  {
    id: 'u_b1_station_core', track: 'lang', stage: 'B1', mode: 'action',
    canDo: '사용자는 역에서 행선지·환승·표·개찰구를 묻고 안내를 듣고 다음 행동을 정할 수 있다',
    newPhraseIds: ['p_shinjuku_doko', 'p_michi_oshiete', 'p_dochira_desu_ka', 'p_ikura_desu_ka', 'p_doko_desu_ka', 'p_eki', 'p_norikae', 'p_kaisatsu', 'p_kippu', 'p_kippu_kudasai', 'p_chaaji_onegai', 'p_kaisatsu_doko', 'p_nanbansen', 'p_tsugi_wa_shibuya'],
  },
  {
    id: 'u_b1_hotel_core', track: 'lang', stage: 'B1', mode: 'action',
    canDo: '사용자는 호텔 프런트에서 체크인을 요청하고, 예약·여권·방 위치·조식·와이파이를 확인할 수 있다',
    newPhraseIds: ['p_checkin_onegai', 'p_yoyaku_shiteimasu', 'p_heya_doko', 'p_wifi_arimasu_ka', 'p_choushoku_wa'],
  },
  {
    id: 'u_b1_street_core', track: 'lang', stage: 'B1', mode: 'action',
    canDo: '사용자는 길에서 화장실·사진을 부탁하고 도움을 청할 수 있다',
    newPhraseIds: ['p_toire_doko', 'p_shashin_ii', 'p_shashin_onegai', 'p_tasukete'],
  },
  {
    id: 'u_b1_pharmacy_core', track: 'lang', stage: 'B1', mode: 'action',
    canDo: '사용자는 약국에서 증상을 말하고 약을 요청하고 약에 대해 물을 수 있다',
    newPhraseIds: ['p_atama_itai', 'p_onaka_itai', 'p_kaze_desu', 'p_kusuri_kudasai', 'p_kono_kusuri'],
  },
  {
    id: 'u_b1_shopping_core', track: 'lang', stage: 'B1', mode: 'action',
    canDo: '사용자는 쇼핑에서 가격·착용을 묻고 면세·카드 결제를 요청하며 여권을 제시할 수 있다',
    newPhraseIds: ['p_kore_ikura', 'p_shichaku', 'p_menzei_dekimasu_ka', 'p_kore_kudasai_shop', 'p_card_tsukaemasu_ka', 'p_pasupooto_arimasu'],
  },
  {
    id: 'u_b1_taxi_core', track: 'lang', stage: 'B1', mode: 'action',
    canDo: '사용자는 택시에서 행선지를 말하고 세워 달라고 하며 영수증을 받을 수 있다',
    newPhraseIds: ['p_takushi_onegai', 'p_made_onegai', 'p_koko_de_tomete', 'p_ryoushuusho'],
  },
  {
    id: 'u_b4_recovery_plus', track: 'lang', stage: 'B4', mode: 'recovery',
    canDo: '사용자는 정중하게 감사·이해·괜찮음·우회(쉬운 일본어·영어) 요청을 표현할 수 있다',
    newPhraseIds: ['p_yasashii_nihongo', 'p_arigatou_gozaimasu', 'p_daijoubu_desu', 'p_wakarimashita', 'p_eigo_de', 'p_wakarimashita_arigatou'],
  },
];
