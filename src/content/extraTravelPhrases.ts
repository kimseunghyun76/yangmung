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
  { id: 'p_aji_wa_nan_desu_ka', kana: 'あじはなんですか', kanji: '鯵は何ですか', displayKana: 'あじは、なんですか？', korean: '아지(전갱이)는 뭐예요?', register: 'productive' },
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

  // C51 지진·재난 대응
  { id: 'p_karada_wo_mamorimasu', kana: 'からだをまもります', kanji: '体を守ります', displayKana: 'からだを、まもります', korean: '몸을 보호할게요', register: 'productive', tip: '「体(からだ)を守(まも)ります」— 지진 직후 지시를 듣고 책상 아래 등으로 몸을 보호하겠다는 응답이에요' },
  { id: 'p_hinanbasho_ni_ikimasu', kana: 'ひなんばしょにいきます', kanji: '避難場所に行きます', displayKana: 'ひなんばしょに、いきます', korean: '대피 장소로 갈게요', register: 'productive', tip: '「避難場所(ひなんばしょ)に行(い)きます」— 안내받은 대피 장소로 이동하겠다는 응답이에요' },
  { id: 'p_kowai_desu', kana: 'こわいです', kanji: '怖いです', korean: '무서워요', register: 'productive', tip: '「怖(こわ)いです」— 지진 등 놀란 상황에서 감정을 솔직히 표현해도 괜찮아요. 주변 사람이 안심시켜 줄 수 있어요' },
  { id: 'p_hinan_subeki_desu_ka', kana: 'ひなんすべきですか', kanji: '避難すべきですか', displayKana: 'ひなんすべきですか？', korean: '대피해야 하나요?', register: 'productive', tip: '「避難(ひなん)すべきですか」— 흔들림이 멈춘 뒤 다음 행동을 확인하는 질문. 직원이나 안내방송의 지시를 먼저 따르는 게 안전해요' },
  { id: 'p_soto_ni_dete_mo_ii_desu_ka', kana: 'そとにでてもいいですか', kanji: '外に出てもいいですか', displayKana: 'そとに、でてもいいですか？', korean: '밖으로 나가도 되나요?', register: 'productive', tip: '「外(そと)に出(で)てもいいですか」— 여진 위험이 있을 수 있어 직원 안내 없이 임의로 나가지 않는 게 좋아요' },
  { id: 'p_hinanbasho_kochira', kana: 'ひなんばしょはこちらです', kanji: '避難場所はこちらです', korean: '대피 장소는 이쪽입니다', register: 'receptive' },
  { id: 'p_itsu_saikai_desu_ka', kana: 'うんてんさいかいはいつですか', kanji: '運転再開はいつですか', displayKana: 'うんてんさいかいは、いつですか？', korean: '운행 재개는 언제예요?', register: 'productive', tip: '「運転再開(うんてんさいかい)はいつですか」— 지연·운행 중단 안내 후 재개 시점을 확인할 때. 안내판의 現在(げんざい)状況(じょうきょう)도 함께 확인해보세요' },
  { id: 'p_watashi_wa_daijoubu_desu', kana: 'わたしはだいじょうぶです', kanji: '私は大丈夫です', displayKana: 'わたしは、だいじょうぶです', korean: '저는 괜찮아요', register: 'productive', tip: '「私(わたし)は大丈夫(だいじょうぶ)です」— 지진 후 무사함을 알릴 때. 가족·지인에게 SNS·메시지로도 빠르게 안심시켜 주세요' },

  // C52 병원 접수
  { id: 'p_junban_wo_machimasu', kana: 'じゅんばんをまちます', kanji: '順番を待ちます', displayKana: 'じゅんばんを、まちます', korean: '순서를 기다릴게요', register: 'productive', tip: '「順番(じゅんばん)を待(ま)ちます」— 진료과 안내를 받고 이름이 불릴 때까지 기다리겠다는 응답이에요' },
  { id: 'p_hajimete_desu', kana: 'はじめてです', kanji: '初めてです', korean: '처음이에요', register: 'productive', tip: '「初(はじ)めてです」— 병원 접수처에서 첫 방문임을 알릴 때. 첫 방문은 보통 문진표(問診票) 작성이 추가로 필요해요' },
  { id: 'p_nikaime_desu', kana: 'にかいめです', kanji: '二回目です', korean: '두 번째예요', register: 'productive', tip: '「二回目(にかいめ)です」— 재방문임을 알릴 때. 진찰권(診察券)이 있으면 함께 보여줘요' },
  { id: 'p_ryokousha_hoken_ga_arimasu', kana: 'りょこうしゃほけんがあります', kanji: '旅行者保険があります', displayKana: 'りょこうしゃほけんが、あります', korean: '여행자 보험이 있어요', register: 'productive', tip: '「旅行者保険(りょこうしゃほけん)があります」— 일본 건강보험은 없어도 여행자보험 가입 여부를 알리면 영수증 발급 방식을 안내받을 수 있어요' },
  { id: 'p_dorekurai_machimasu_ka', kana: 'どれくらいまちますか', kanji: 'どれくらい待ちますか', displayKana: 'どれくらい、まちますか？', korean: '얼마나 기다려요?', register: 'productive', tip: '「どれくらい待(ま)ちますか」— 대기 시간을 미리 확인하면 계획을 세우기 편해요' },
  { id: 'p_kaado_ga_tsukaenai_you_desu', kana: 'かーどがつかえないようです', kanji: 'カードが使えないようです', displayKana: 'カードが、つかえないようです', korean: '카드가 안 되는 것 같아요', register: 'receptive' },
  { id: 'p_betsu_no_card_tameshite', kana: 'べつのかーどでためしてもいいですか', kanji: '別のカードで試してもいいですか', displayKana: 'べつのカードで、ためしてもいいですか？', korean: '다른 카드로 해봐도 될까요?', register: 'productive', tip: '「別(べつ)のカードで試(ため)してもいいですか」— 카드 결제가 거절됐을 때 당황하지 말고 이렇게 물어보세요' },
  { id: 'p_genkin_de_haraimasu', kana: 'げんきんではらいます', kanji: '現金で払います', displayKana: 'げんきんで、はらいます', korean: '현금으로 낼게요', register: 'productive', tip: '「現金(げんきん)で払(はら)います」— 카드가 안 될 때 가장 확실한 대안. 소액 현금을 항상 여유 있게 챙겨두면 안심이에요' },
];
