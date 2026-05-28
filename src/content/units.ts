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
    newPhraseIds: ['p_kore_kudasai', 'p_osusume_wa', 'p_menu_misete', 'p_chotto_matte', 'p_mizu_kudasai', 'p_okaikei', 'p_irimasen', 'p_oishii', 'p_hoshii_desu', 'p_hitotsu_kudasai', 'p_futatsu_kudasai', 'p_kore_to_kore', 'p_karai_desu_ka', 'p_tabemasu', 'p_hitori_desu', 'p_futari_desu', 'p_gochisousama'],
  },
  {
    id: 'u_b1_station_core', track: 'lang', stage: 'B1', mode: 'action',
    canDo: '사용자는 역에서 행선지·환승·표·개찰구를 묻고 안내를 듣고 다음 행동을 정할 수 있다',
    newPhraseIds: ['p_shinjuku_doko', 'p_michi_oshiete', 'p_dochira_desu_ka', 'p_ikura_desu_ka', 'p_doko_desu_ka', 'p_eki', 'p_norikae', 'p_kaisatsu', 'p_kippu'],
  },
  {
    id: 'u_b4_recovery_plus', track: 'lang', stage: 'B4', mode: 'recovery',
    canDo: '사용자는 정중하게 감사·이해·괜찮음·우회(쉬운 일본어·영어) 요청을 표현할 수 있다',
    newPhraseIds: ['p_yasashii_nihongo', 'p_arigatou_gozaimasu', 'p_daijoubu_desu', 'p_wakarimashita', 'p_eigo_de', 'p_wakarimashita_arigatou'],
  },
];
