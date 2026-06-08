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
];
