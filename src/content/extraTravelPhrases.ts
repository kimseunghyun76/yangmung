import type { Phrase } from './types';

export const extraTravelPhrases: Phrase[] = [
  // C31 회전초밥
  { id: 'p_touch_panel_order', kana: 'ちゅうもんはタッチパネルです', kanji: '注文はタッチパネルです', korean: '주문은 터치패널로 합니다', register: 'receptive' },
  { id: 'p_osara_count', kana: 'おさらをかぞえます', kanji: 'お皿を数えます', korean: '접시를 세겠습니다', register: 'receptive' },
  { id: 'p_maguro_kudasai', kana: 'まぐろをください', kanji: 'まぐろをください', korean: '참치 주세요', register: 'productive' },
  { id: 'p_saamon_kudasai', kana: 'サーモンをください', kanji: 'サーモンをください', korean: '연어 주세요', register: 'productive' },
  { id: 'p_biiru_mou_ippai', kana: 'ビールをもういっぱいください', kanji: 'ビールをもう一杯ください', korean: '맥주 한 잔 더 주세요', register: 'productive' },
  { id: 'p_osara_tottemo_ii', kana: 'おさらをとってもいいですか', kanji: 'お皿を取ってもいいですか', displayKana: 'おさらを、とってもいいですか？', korean: '접시를 가져가도 되나요?', register: 'productive' },
  { id: 'p_kauntaa_de_onegai', kana: 'カウンターでおねがいします', kanji: 'カウンターでお願いします', korean: '카운터석으로 부탁합니다', register: 'productive' },

  // C32 편집샵 피팅
  { id: 'p_nanika_osagashi_fashion', kana: 'なにかおさがしですか', kanji: '何かお探しですか', displayKana: 'なにか、おさがしですか？', korean: '찾으시는 게 있으세요?', register: 'receptive' },
  { id: 'p_shichakushitsu_kochira', kana: 'しちゃくしつはこちらです', kanji: '試着室はこちらです', korean: '피팅룸은 이쪽입니다', register: 'receptive' },
  { id: 'p_emu_saizu_arimasu_ka', kana: 'エムサイズはありますか', kanji: 'Mサイズはありますか', displayKana: 'エムサイズは、ありますか？', korean: 'M 사이즈 있나요?', register: 'productive' },
  { id: 'p_hoka_no_iro_arimasu_ka', kana: 'ほかのいろはありますか', kanji: '他の色はありますか', displayKana: 'ほかのいろは、ありますか？', korean: '다른 색 있나요?', register: 'productive' },
  { id: 'p_chotto_chiisai_desu', kana: 'ちょっとちいさいです', kanji: 'ちょっと小さいです', korean: '조금 작아요', register: 'productive' },

  // C33 호텔 우산
  { id: 'p_ame_ga_futteimasu', kana: 'あめがふっています', kanji: '雨が降っています', korean: '비가 오고 있습니다', register: 'receptive' },
  { id: 'p_kasa_wa_front_desu', kana: 'かさはフロントです', kanji: '傘はフロントです', korean: '우산은 프런트에 있습니다', register: 'receptive' },
  { id: 'p_kasa_kariremasu_ka', kana: 'かさをかりられますか', kanji: '傘を借りられますか', displayKana: 'かさを、かりられますか？', korean: '우산을 빌릴 수 있나요?', register: 'productive' },
  { id: 'p_kasa_wo_kaeshimasu', kana: 'かさをかえします', kanji: '傘を返します', korean: '우산을 반납하겠습니다', register: 'productive' },

  // C34 호텔 방 변경
  { id: 'p_tabako_no_nioi', kana: 'たばこのにおいがします', kanji: 'タバコのにおいがします', korean: '담배 냄새가 납니다', register: 'productive' },
  { id: 'p_heya_kaete_kudasai', kana: 'へやをかえてください', kanji: '部屋を変えてください', korean: '방을 바꿔 주세요', register: 'productive' },
  { id: 'p_tsuin_no_heya_arimasu_ka', kana: 'ツインのへやはありますか', kanji: 'ツインの部屋はありますか', displayKana: 'ツインのへやは、ありますか？', korean: '트윈 침대 방이 있나요?', register: 'productive' },
  { id: 'p_motto_hiroi_heya', kana: 'もっとひろいへやはありますか', kanji: 'もっと広い部屋はありますか', displayKana: 'もっとひろいへやは、ありますか？', korean: '더 넓은 방이 있나요?', register: 'productive' },
  { id: 'p_kakunin_shimasu', kana: 'かくにんします', kanji: '確認します', korean: '확인하겠습니다', register: 'receptive' },

  // C35 나리타역 오픈티켓
  { id: 'p_open_ticket_koukan', kana: 'オープンチケットをこうかんしたいです', kanji: 'オープンチケットを交換したいです', korean: '오픈 티켓을 교환하고 싶습니다', register: 'productive' },
  { id: 'p_kono_chiketto_tsukaemasu_ka', kana: 'このチケットはつかえますか', kanji: 'このチケットは使えますか', displayKana: 'このチケットは、つかえますか？', korean: '이 티켓 사용할 수 있나요?', register: 'productive' },
  { id: 'p_narita_ekisupuresu', kana: 'なりたエクスプレスでおねがいします', kanji: '成田エクスプレスでお願いします', korean: '나리타 익스프레스로 부탁합니다', register: 'productive' },
  { id: 'p_jikan_kaetai', kana: 'じかんをかえたいです', kanji: '時間を変えたいです', korean: '시간을 바꾸고 싶어요', register: 'productive' },
  { id: 'p_madoguchi_de_koukan', kana: 'まどぐちでこうかんしてください', kanji: '窓口で交換してください', korean: '창구에서 교환해 주세요', register: 'receptive' },

  // C36 공항 수하물 초과
  { id: 'p_jyuuryou_koeteimasu', kana: 'じゅうりょうがこえています', kanji: '重量が超えています', korean: '무게가 초과되었습니다', register: 'receptive' },
  { id: 'p_tsui_ryoukin_kakarimasu', kana: 'ついかりょうきんがかかります', kanji: '追加料金がかかります', korean: '추가 요금이 듭니다', register: 'receptive' },
  { id: 'p_nimotsu_herashimasu', kana: 'にもつをへらします', kanji: '荷物を減らします', korean: '짐을 줄이겠습니다', register: 'productive' },
  { id: 'p_kore_tebutsu_ni_shimasu', kana: 'これをてにもつにします', kanji: 'これを手荷物にします', korean: '이걸 기내수하물로 하겠습니다', register: 'productive' },
  { id: 'p_tsui_ryoukin_ikura', kana: 'ついかりょうきんはいくらですか', kanji: '追加料金はいくらですか', displayKana: 'ついかりょうきんは、いくらですか？', korean: '추가 요금은 얼마인가요?', register: 'productive' },

  // C37 조식 뷔페
  { id: 'p_ryouri_sukunai', kana: 'りょうりがすくないです', kanji: '料理が少ないです', korean: '음식이 부족합니다', register: 'productive' },
  { id: 'p_mou_sukoshi_moraemasu_ka', kana: 'もうすこしもらえますか', kanji: 'もう少しもらえますか', displayKana: 'もうすこし、もらえますか？', korean: '조금 더 받을 수 있나요?', register: 'productive' },
  { id: 'p_koohii_wa_doko', kana: 'コーヒーはどこですか', kanji: 'コーヒーはどこですか', displayKana: 'コーヒーは、どこですか？', korean: '커피는 어디예요?', register: 'productive' },
  { id: 'p_sugu_hojuu_shimasu', kana: 'すぐほじゅうします', kanji: 'すぐ補充します', korean: '곧 보충하겠습니다', register: 'receptive' },

  // C38 스시집 추가 주문
  { id: 'p_okawari_wa_irimasu_ka', kana: 'おかわりはいりますか', kanji: 'おかわりは要りますか', displayKana: 'おかわりは、いりますか？', korean: '더 필요하세요?', register: 'receptive' },
  { id: 'p_osusume_no_sakana', kana: 'おすすめのさかなはなんですか', kanji: 'おすすめの魚は何ですか', displayKana: 'おすすめのさかなは、なんですか？', korean: '추천 생선은 뭐예요?', register: 'productive' },
  { id: 'p_aji_wa_nan_desu_ka', kana: 'あじはなんですか', kanji: 'あじは何ですか', displayKana: 'あじは、なんですか？', korean: '아지는 뭐예요?', register: 'productive' },
  { id: 'p_hamachi_kudasai', kana: 'はまちをください', kanji: 'はまちをください', korean: '방어 주세요', register: 'productive' },

  // C39 파스타 옵션
  { id: 'p_men_no_katasa', kana: 'めんのかたさはどうしますか', kanji: '麺の硬さはどうしますか', displayKana: 'めんのかたさは、どうしますか？', korean: '면 익힘은 어떻게 하시겠어요?', register: 'receptive' },
  { id: 'p_arudente_de', kana: 'アルデンテでおねがいします', kanji: 'アルデンテでお願いします', korean: '알덴테로 부탁합니다', register: 'productive' },
  { id: 'p_futsuu_de', kana: 'ふつうでおねがいします', kanji: '普通でお願いします', korean: '보통으로 부탁합니다', register: 'productive' },
  { id: 'p_chiizu_tsuika', kana: 'チーズをついかしてください', kanji: 'チーズを追加してください', korean: '치즈를 추가해 주세요', register: 'productive' },
  { id: 'p_ninniku_nuki', kana: 'にんにくぬきでおねがいします', kanji: 'にんにく抜きでお願いします', korean: '마늘 빼고 부탁합니다', register: 'productive' },
  { id: 'p_soosu_erabemasu', kana: 'ソースをえらべます', kanji: 'ソースを選べます', korean: '소스를 고를 수 있습니다', register: 'receptive' },

  // C40 편집샵 계산·면세
  { id: 'p_menzei_onegai', kana: 'めんぜいをおねがいします', kanji: '免税をお願いします', korean: '면세 부탁합니다', register: 'productive' },
  { id: 'p_gift_wrapping_onegai', kana: 'ギフトラッピングをおねがいします', kanji: 'ギフトラッピングをお願いします', korean: '선물 포장 부탁합니다', register: 'productive' },
  { id: 'p_receipt_email_ii', kana: 'レシートはメールでいいです', kanji: 'レシートはメールでいいです', korean: '영수증은 이메일로 괜찮습니다', register: 'productive' },
  { id: 'p_menzei_counter_kochira', kana: 'めんぜいカウンターはこちらです', kanji: '免税カウンターはこちらです', korean: '면세 카운터는 이쪽입니다', register: 'receptive' },
];
