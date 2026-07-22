import type { Unit } from './types';

export const extraTravelUnits: Unit[] = [
  {
    id: 'u_b2_travel_friction_pack', track: 'lang', stage: 'B2', mode: 'action',
    canDo: '사용자는 실제 여행 중 자주 마주치는 주문 변경, 피팅, 호텔 요청, 티켓 교환, 수하물 문제를 짧게 처리할 수 있다',
    newPhraseIds: [
      'p_maguro_kudasai', 'p_saamon_kudasai', 'p_biiru_mou_ippai', 'p_osara_tottemo_ii',
      'p_kauntaa_de_onegai',
      'p_emu_saizu_arimasu_ka', 'p_hoka_no_iro_arimasu_ka', 'p_chotto_chiisai_desu',
      'p_kasa_kariremasu_ka', 'p_kasa_wo_kaeshimasu',
      'p_tabako_no_nioi', 'p_heya_kaete_kudasai', 'p_tsuin_no_heya_arimasu_ka', 'p_motto_hiroi_heya',
      'p_open_ticket_koukan', 'p_kono_chiketto_tsukaemasu_ka', 'p_narita_ekisupuresu', 'p_jikan_kaetai',
      'p_nimotsu_herashimasu', 'p_kore_tebutsu_ni_shimasu', 'p_tsui_ryoukin_ikura',
      'p_ryouri_sukunai', 'p_mou_sukoshi_moraemasu_ka', 'p_koohii_wa_doko',
      'p_osusume_no_sakana', 'p_aji_wa_nan_desu_ka', 'p_hamachi_kudasai',
      'p_arudente_de', 'p_futsuu_de', 'p_chiizu_tsuika', 'p_ninniku_nuki',
      'p_menzei_onegai', 'p_gift_wrapping_onegai', 'p_receipt_email_ii',
    ],
  },
  {
    id: 'u_b3_scene_specific_answers', track: 'lang', stage: 'B3', mode: 'action',
    canDo: '사용자는 각 여행 장면(호텔·기차·환전·택시·환불·인쇄·매점 등)에서 그 상황에만 맞는 구체적인 응답을 할 수 있다',
    newPhraseIds: [
      'p_new_kinen_de_onegai', 'p_new_shokken_douzo', 'p_new_sen_nihyaku_en_desune', 'p_new_nimotsu_futatsu', 'p_new_sono_reeto_de_onegai', 'p_new_kozeni_shika_nai',
      'p_new_motto_hayaku_todoku', 'p_new_nimotsu_onegai', 'p_new_bentou_hitotsu', 'p_new_sara_kazoete', 'p_new_tsume_dorekurai_kakaru', 'p_new_omelette_cheese_ire',
      'p_new_supu_mo_onegai', 'p_new_fullcover_onegai', 'p_new_jibun_de_hakobimasu', 'p_new_nagame_yori_kinen', 'p_new_sagaku_koko_de_haraeru', 'p_new_30pun_go_daijoubu',
      'p_new_tsuurogawa_de', 'p_new_card_kakunin', 'p_new_card_ni_henkin', 'p_new_kono_muki_de_ii', 'p_new_meisai_shobun', 'p_new_karaa_a4_de',
      'p_new_ryoumen_de', 'p_new_yoyaku_namae_desu', 'p_new_bangou_nana_desu', 'p_new_megahon_iro', 'p_new_seki_ni_modorimasu', 'p_new_chizu_misete',
      'p_new_betsu_tsuuro_kakunin', 'p_new_koko_de_machimasu', 'p_onegai_shimasu',
    ],
  },
  {
    id: 'u_b4_crisis_response', track: 'lang', stage: 'B4', mode: 'action',
    canDo: '사용자는 지진 등 재난 상황에서 안전을 확인하고, 병원 접수·카드 결제 문제에 대응할 수 있다',
    newPhraseIds: [
      'p_karada_wo_mamorimasu', 'p_kowai_desu', 'p_hinan_subeki_desu_ka', 'p_soto_ni_dete_mo_ii_desu_ka',
      'p_hinanbasho_ni_ikimasu', 'p_itsu_saikai_desu_ka', 'p_watashi_wa_daijoubu_desu',
      'p_hajimete_desu', 'p_nikaime_desu', 'p_ryokousha_hoken_ga_arimasu', 'p_junban_wo_machimasu', 'p_dorekurai_machimasu_ka',
      'p_betsu_no_card_tameshite', 'p_genkin_de_haraimasu',
    ],
  },
];
