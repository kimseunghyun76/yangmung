import type { Phrase } from './types';

export const phrases: Phrase[] = [
  { id: 'p_hai',  kana: 'はい',   korean: '네',    register: 'both' },
  { id: 'p_iie',  kana: 'いいえ', korean: '아니요', register: 'both' },
  { id: 'p_un',   kana: 'うん',   korean: '응',    register: 'productive' },
  { id: 'p_iya',  kana: 'いや',   korean: '싫어',  register: 'productive' },
  { id: 'p_arigatou', kana: 'ありがとう', korean: '고마워', register: 'both' },
  { id: 'p_daijoubu', kana: 'だいじょうぶ', kanji: '大丈夫', korean: '괜찮아', register: 'both', n5Refs: ['n5_v_daijoubu'] },
  { id: 'p_mou_ichido', kana: 'もういちどおねがいします', kanji: 'もう一度お願いします', displayKana: 'もういちど、おねがいします', korean: '다시 한 번 부탁합니다', register: 'productive', recoveryType: 'repeat' },
  { id: 'p_yukkuri', kana: 'ゆっくりおねがいします', kanji: 'ゆっくりお願いします', displayKana: 'ゆっくり、おねがいします', korean: '천천히 부탁합니다', register: 'productive', recoveryType: 'slow' },
  { id: 'p_fukuro', kana: 'ふくろはいりますか', kanji: '袋は要りますか', displayKana: 'ふくろは、いりますか？', korean: '봉투 필요하세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_price', kana: 'ごうけいせんえんです', kanji: '合計千円です', displayKana: 'ごうけい、せんえんです。', korean: '합계 천엔입니다', register: 'receptive' },
  { id: 'p_konnichiwa', kana: 'こんにちは', korean: '안녕하세요', register: 'both' },
  { id: 'p_irasshai', kana: 'いらっしゃいませ', korean: '어서 오세요', register: 'receptive' },

  // ── C2 식당 주문 한 조각 (NPC + 학습자 발화) ──
  { id: 'p_gochuumon', kana: 'ごちゅうもんはおきまりですか', kanji: 'ご注文はお決まりですか', displayKana: 'ごちゅうもんは、おきまりですか？', korean: '주문 정하셨어요?', register: 'receptive' },
  { id: 'p_kore_kudasai', kana: 'これください', kanji: 'これ下さい', korean: '이거 주세요', register: 'productive' },
  { id: 'p_osusume_wa', kana: 'おすすめはなんですか', kanji: 'お勧めは何ですか', displayKana: 'おすすめは、なんですか？', korean: '추천이 뭐예요?', register: 'productive' },
  { id: 'p_menu_misete', kana: 'メニューをみせてください', kanji: 'メニューを見せてください', displayKana: 'メニューを、みせてください', korean: '메뉴 좀 보여 주세요', register: 'productive' },
  { id: 'p_nomimono', kana: 'おのみものは', kanji: 'お飲み物は', displayKana: 'おのみものは？', korean: '음료는요?', register: 'receptive' },
  { id: 'p_mizu_kudasai', kana: 'みずをください', kanji: '水をください', korean: '물 주세요', register: 'productive' },
  { id: 'p_okaikei', kana: 'おかいけいおねがいします', kanji: 'お会計お願いします', displayKana: 'おかいけい、おねがいします', korean: '계산 부탁드립니다', register: 'productive' },

  // ── B0/B1 narrow: C 미션이 끌어쓰는 핵심 (발달식 thesis 전면 검증 X, MVP 한정) ──
  { id: 'p_sumimasen', kana: 'すみません', korean: '저기요 / 죄송합니다', register: 'both', tip: '주의를 끌 때 + 사과 + 가벼운 감사까지 만능' },
  { id: 'p_onegai_shimasu', kana: 'おねがいします', kanji: 'お願いします', korean: '부탁드립니다', register: 'both' },
  { id: 'p_chotto', kana: 'ちょっと', korean: '잠깐 / 조금', register: 'both' },
  { id: 'p_oishii', kana: 'おいしい', korean: '맛있어요', register: 'productive' },
  { id: 'p_kore', kana: 'これ', korean: '이거', register: 'both' },
  { id: 'p_are', kana: 'あれ', korean: '저거', register: 'both' },
  { id: 'p_arigatou_gozaimasu', kana: 'ありがとうございます', kanji: 'ありがとうございます', korean: '감사합니다 (정중)', register: 'productive' },

  // ── Recovery 4종 마지막 = simplify ──
  { id: 'p_yasashii_nihongo', kana: 'やさしいにほんごでおねがいします', kanji: 'やさしい日本語でお願いします', displayKana: 'やさしいにほんごで、おねがいします', korean: '쉬운 일본어로 부탁드려요', register: 'productive', recoveryType: 'simplify' },

  // ── C1 편의점 두텁게 (결제·포인트·영수증·봉투·데우기) ──
  { id: 'p_shiharai_houhou', kana: 'おしはらいほうほうは', kanji: 'お支払い方法は', displayKana: 'おしはらいほうほうは？', korean: '결제 방법은요?', register: 'receptive' },
  { id: 'p_genkin_de', kana: 'げんきんで', kanji: '現金で', korean: '현금으로요', register: 'productive' },
  { id: 'p_card_de', kana: 'カードで', korean: '카드로요', register: 'productive' },
  { id: 'p_kore_de', kana: 'これでおねがいします', kanji: 'これでお願いします', korean: '이걸로 부탁드려요', register: 'productive' },
  { id: 'p_pointo_arimasu_ka', kana: 'ポイントカードはありますか', kanji: 'ポイントカードはありますか', displayKana: 'ポイントカードは、ありますか？', korean: '포인트카드 있으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_arimasu', kana: 'あります', korean: '있어요', register: 'both' },
  { id: 'p_arimasen', kana: 'ありません', korean: '없어요', register: 'both' },
  { id: 'p_reshiito_kudasai', kana: 'レシートをください', kanji: 'レシートをください', korean: '영수증 주세요', register: 'productive' },
  { id: 'p_fukuro_iranai', kana: 'ふくろはいりません', kanji: '袋は要りません', korean: '봉투는 필요 없어요', register: 'productive' },
  { id: 'p_atatamete', kana: 'あたためてください', kanji: '温めてください', korean: '데워 주세요', register: 'productive', speechPhoneme: 'アタタメテクダサイ' },

  // ── C안: B0/B1 narrow 보강 (친구 권고 — C1/C2가 끌어쓰는 답변 다양화) ──
  { id: 'p_wakarimasen', kana: 'わかりません', kanji: '分かりません', korean: '모르겠어요', register: 'productive', tip: '솔직한 의사표현이지만, 막혔을 때는 「ゆっくりお願いします」가 더 생산적' },
  { id: 'p_hoshii_desu', kana: 'ほしいです', korean: '원해요', register: 'productive' },
  { id: 'p_irimasen', kana: 'いりません', kanji: '要りません', korean: '필요 없어요', register: 'productive' },
  { id: 'p_chotto_matte', kana: 'ちょっとまってください', kanji: 'ちょっと待ってください', displayKana: 'ちょっと、まってください', korean: '잠깐만 기다려 주세요', register: 'productive' },
  { id: 'p_sou_desu', kana: 'そうです', korean: '그래요 / 맞아요', register: 'both' },
  { id: 'p_ikura_desu_ka', kana: 'いくらですか', displayKana: 'いくらですか？', korean: '얼마예요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_doko_desu_ka', kana: 'どこですか', displayKana: 'どこですか？', korean: '어디예요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_daijoubu_desu', kana: 'だいじょうぶです', kanji: '大丈夫です', korean: '괜찮습니다 (정중)', register: 'both' },

  // ── C3 전철 한 조각 (개찰구·환승·길찾기) ──
  { id: 'p_shinjuku_doko', kana: 'しんじゅくえきはどこですか', kanji: '新宿駅はどこですか', displayKana: 'しんじゅくえきは、どこですか？', korean: '신주쿠역은 어디예요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_michi_oshiete', kana: 'みちをおしえてください', kanji: '道を教えてください', korean: '길을 가르쳐 주세요', register: 'productive' },
  { id: 'p_eigo_de', kana: 'えいごでだいじょうぶですか', kanji: '英語で大丈夫ですか', displayKana: 'えいごで、だいじょうぶですか？', korean: '영어로 괜찮을까요?', register: 'productive', grammarRefs: ['g_masuka'], recoveryType: 'fallback' },
  { id: 'p_norikae_kudasai', kana: 'つぎのえきでのりかえてください', kanji: '次の駅で乗り換えてください', displayKana: 'つぎのえきで、のりかえてください', korean: '다음 역에서 갈아타세요', register: 'receptive' },
  { id: 'p_wakarimashita', kana: 'わかりました', kanji: '分かりました', korean: '알겠습니다', register: 'productive' },
  { id: 'p_dochira_desu_ka', kana: 'どちらですか', displayKana: 'どちらですか？', korean: '어느 쪽이에요?', register: 'productive', grammarRefs: ['g_masuka'] },

  // ── 전철·여행 기본 어휘 (인벤토리 — 미션 차차 사용) ──
  { id: 'p_eki', kana: 'えき', kanji: '駅', korean: '역', register: 'both' },
  { id: 'p_norikae', kana: 'のりかえ', kanji: '乗り換え', korean: '환승', register: 'both' },
  { id: 'p_kaisatsu', kana: 'かいさつ', kanji: '改札', korean: '개찰구', register: 'both' },
  { id: 'p_kippu', kana: 'きっぷ', kanji: '切符', korean: '표 / 티켓', register: 'both' },

  // ── C1 편의점 보강: 젓가락/그대로/스이카/따로 ──
  { id: 'p_hashi_irimasu_ka', kana: 'はしはいりますか', kanji: '箸は要りますか', displayKana: 'はしは、いりますか？', korean: '젓가락 필요하세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_hashi_kudasai', kana: 'はしをください', kanji: '箸をください', korean: '젓가락 주세요', register: 'productive' },
  { id: 'p_sono_mama_de', kana: 'そのままで', korean: '그대로 주세요', register: 'productive', tip: '"별다른 처리 없이 그대로"의 의미. 데우기·봉투 거절 모두 통용' },
  { id: 'p_betsubetsu_de', kana: 'べつべつで', kanji: '別々で', korean: '따로따로요', register: 'productive', tip: '계산을 나눠 낼 때 — 동행자가 있을 때 자주 씀' },
  { id: 'p_suica_de', kana: 'スイカで', korean: '스이카로요', register: 'productive', tip: 'Suica는 일본 교통카드. 편의점·식당 결제도 가능' },
  { id: 'p_mou_daijoubu_desu', kana: 'もうだいじょうぶです', kanji: 'もう大丈夫です', korean: '이제 괜찮습니다', register: 'productive', tip: '추가 권유를 부드럽게 거절할 때' },

  // ── C2 식당 보강: 개수/이거랑/매워요?/먹을게요 ──
  { id: 'p_hitotsu_kudasai', kana: 'ひとつください', kanji: '一つください', korean: '하나 주세요', register: 'productive' },
  { id: 'p_futatsu_kudasai', kana: 'ふたつください', kanji: '二つください', korean: '두 개 주세요', register: 'productive' },
  { id: 'p_kore_to_kore', kana: 'これとこれ', korean: '이거랑 이거', register: 'productive', tip: '메뉴를 가리키며 — 가장 안전한 주문법' },
  { id: 'p_karai_desu_ka', kana: 'からいですか', kanji: '辛いですか', displayKana: 'からいですか？', korean: '매워요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_tabemasu', kana: 'たべます', kanji: '食べます', korean: '먹을게요', register: 'productive' },

  // ── C3 전철 정식화: 표·IC충전·개찰구·플랫폼·내릴 역 ──
  { id: 'p_kippu_kudasai', kana: 'きっぷをください', kanji: '切符をください', korean: '표 주세요', register: 'productive' },
  { id: 'p_chaaji_onegai', kana: 'チャージおねがいします', kanji: 'チャージお願いします', displayKana: 'チャージ、おねがいします', korean: '충전 부탁해요', register: 'productive', tip: 'IC카드(Suica) 잔액 충전 — 「チャージ」 한 단어면 통해요' },
  { id: 'p_kaisatsu_doko', kana: 'かいさつはどこですか', kanji: '改札はどこですか', displayKana: 'かいさつは、どこですか？', korean: '개찰구 어디예요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_nanbansen', kana: 'なんばんせんですか', kanji: '何番線ですか', displayKana: 'なんばんせんですか？', korean: '몇 번 선이에요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '플랫폼 번호 묻기 — 「番線(ばんせん)」이 승강장 번호' },
  { id: 'p_tsugi_wa_shibuya', kana: 'つぎはしぶやですか', kanji: '次は渋谷ですか', displayKana: 'つぎは、しぶやですか？', korean: '다음은 시부야예요?', register: 'productive', grammarRefs: ['g_masuka'] },

  // ── C9 공항 입국심사 ──
  { id: 'p_mokuteki_wa', kana: 'もくてきは', displayKana: 'もくてきは？', korean: '방문 목적은?', register: 'receptive' },
  { id: 'p_kankou_desu', kana: 'かんこうです', kanji: '観光です', korean: '관광이에요', register: 'productive' },
  { id: 'p_shigoto_desu', kana: 'しごとです', kanji: '仕事です', korean: '일/출장이에요', register: 'productive' },
  { id: 'p_taizai_wa', kana: 'たいざいは', displayKana: 'たいざいは？', korean: '얼마나 머무세요?', register: 'receptive' },
  { id: 'p_isshuukan', kana: 'いっしゅうかんです', kanji: '一週間です', korean: '일주일이요', register: 'productive' },
  { id: 'p_mikka', kana: 'みっかです', kanji: '三日です', korean: '3일이요', register: 'productive' },
  { id: 'p_doko_tomaru', kana: 'どこにとまりますか', kanji: 'どこに泊まりますか', displayKana: 'どこに、とまりますか？', korean: '어디 묵으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_hoteru_desu', kana: 'ホテルです', korean: '호텔이에요', register: 'productive' },

  // ── C10 환전 ──
  { id: 'p_ryougae', kana: 'りょうがえおねがいします', kanji: '両替お願いします', displayKana: 'りょうがえ、おねがいします', korean: '환전해 주세요', register: 'productive' },
  { id: 'p_komakaku', kana: 'こまかくしてください', kanji: '細かくしてください', korean: '잔돈으로 해 주세요', register: 'productive', tip: '큰 지폐를 동전·작은 지폐로 바꿀 때' },

  // ── C11 코인로커 ──
  { id: 'p_koinrokkaa', kana: 'コインロッカーはどこですか', displayKana: 'コインロッカーは、どこですか？', korean: '코인로커 어디예요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_tsukaikata', kana: 'つかいかたをおしえてください', kanji: '使い方を教えてください', korean: '사용법 알려 주세요', register: 'productive' },
  { id: 'p_kono_botan_oshite', kana: 'このボタンをおしてください', kanji: 'このボタンを押してください', displayKana: 'このボタンを、おしてください', korean: '이 버튼을 눌러 주세요', register: 'receptive' },

  // ── C12 편의점 택배(택큐빈) ──
  { id: 'p_okuritai', kana: 'これをおくりたいです', kanji: 'これを送りたいです', displayKana: 'これを、おくりたいです', korean: '이거 보내고 싶어요', register: 'productive' },
  { id: 'p_takkyubin', kana: 'たっきゅうびんおねがいします', kanji: '宅急便お願いします', displayKana: 'たっきゅうびん、おねがいします', korean: '택배 부탁해요', register: 'productive' },
  { id: 'p_reshiito_irimasu_ka', kana: 'レシートはいりますか', displayKana: 'レシートは、いりますか？', korean: '영수증 필요하세요?', register: 'receptive', grammarRefs: ['g_masuka'] },

  // ── C13 라멘 식권기 ──
  { id: 'p_kenbaiki', kana: 'けんばいきはどこですか', kanji: '券売機はどこですか', displayKana: 'けんばいきは、どこですか？', korean: '식권기 어디예요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_oomori', kana: 'おおもりできますか', kanji: '大盛りできますか', displayKana: 'おおもり、できますか？', korean: '곱빼기 되나요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_kaedama', kana: 'かえだまおねがいします', kanji: '替え玉お願いします', displayKana: 'かえだま、おねがいします', korean: '면 추가요', register: 'productive', tip: 'かえだま=라멘 면 사리 추가. 도쿄·하카타 라멘집 필수' },

  // ── C6 약국 (증상·약) ──
  { id: 'p_dou_shimashita', kana: 'どうしましたか', displayKana: 'どうしましたか？', korean: '어디가 안 좋으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_atama_itai', kana: 'あたまがいたいです', kanji: '頭が痛いです', displayKana: 'あたまが、いたいです', korean: '머리가 아파요', register: 'productive' },
  { id: 'p_onaka_itai', kana: 'おなかがいたいです', kanji: 'お腹が痛いです', displayKana: 'おなかが、いたいです', korean: '배가 아파요', register: 'productive' },
  { id: 'p_kaze_desu', kana: 'かぜです', kanji: '風邪です', korean: '감기예요', register: 'productive' },
  { id: 'p_kusuri_kudasai', kana: 'くすりをください', kanji: '薬をください', korean: '약 주세요', register: 'productive' },
  { id: 'p_kono_kusuri', kana: 'このくすりはなんですか', kanji: 'この薬は何ですか', displayKana: 'このくすりは、なんですか？', korean: '이 약은 뭐예요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_shokugo_nonde', kana: 'しょくごにのんでください', kanji: '食後に飲んでください', displayKana: 'しょくごに、のんでください', korean: '식후에 드세요', register: 'receptive' },

  // ── C7 쇼핑·면세 ──
  { id: 'p_kore_ikura', kana: 'これはいくらですか', kanji: 'これはいくらですか', displayKana: 'これは、いくらですか？', korean: '이거 얼마예요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_shichaku', kana: 'しちゃくしてもいいですか', kanji: '試着してもいいですか', displayKana: 'しちゃく、してもいいですか？', korean: '입어 봐도 돼요?', register: 'productive' },
  { id: 'p_menzei_dekimasu_ka', kana: 'めんぜいできますか', kanji: '免税できますか', displayKana: 'めんぜい、できますか？', korean: '면세 되나요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_kore_kudasai_shop', kana: 'これにします', kanji: 'これにします', korean: '이걸로 할게요', register: 'productive' },
  { id: 'p_card_tsukaemasu_ka', kana: 'カードはつかえますか', kanji: 'カードは使えますか', displayKana: 'カードは、つかえますか？', korean: '카드 돼요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_pasupooto_arimasu', kana: 'パスポートはこちらです', displayKana: 'パスポートは、こちらです', korean: '여권 여기 있어요', register: 'productive' },

  // ── C8 택시 ──
  { id: 'p_takushi_onegai', kana: 'タクシーおねがいします', kanji: 'タクシーお願いします', displayKana: 'タクシー、おねがいします', korean: '택시 불러주세요', register: 'productive' },
  { id: 'p_made_onegai', kana: 'までおねがいします', kanji: 'までお願いします', korean: '~까지 가주세요', register: 'productive', tip: '행선지 뒤에 붙여요: 「しぶやまでおねがいします」' },
  { id: 'p_koko_de_tomete', kana: 'ここでとめてください', kanji: 'ここで止めてください', displayKana: 'ここで、とめてください', korean: '여기서 세워 주세요', register: 'productive' },
  { id: 'p_doko_made', kana: 'どこまでですか', displayKana: 'どこまでですか？', korean: '어디까지 가세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_ryoushuusho', kana: 'りょうしゅうしょをください', kanji: '領収書をください', korean: '영수증 주세요', register: 'productive' },

  // ── 식당 안전·실용 (알레르기·빼달라기) ──
  { id: 'p_arerugi', kana: 'アレルギーがあります', displayKana: 'アレルギーが、あります', korean: '알레르기가 있어요', register: 'productive', tip: '주문 전에 먼저 알리면 점원이 재료를 챙겨줘요' },
  { id: 'p_kore_nuite', kana: 'これをぬいてください', kanji: 'これを抜いてください', korean: '이거 빼 주세요', register: 'productive' },

  // ── C5 거리·긴급 한마디 (여행 실전 — 화장실·사진·도움) ──
  { id: 'p_toire_doko', kana: 'トイレはどこですか', displayKana: 'トイレは、どこですか？', korean: '화장실 어디예요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_shashin_ii', kana: 'しゃしんとってもいいですか', kanji: '写真撮ってもいいですか', displayKana: 'しゃしん、とってもいいですか？', korean: '사진 찍어도 돼요?', register: 'productive' },
  { id: 'p_shashin_onegai', kana: 'しゃしんおねがいします', kanji: '写真お願いします', displayKana: 'しゃしん、おねがいします', korean: '사진 부탁드려요', register: 'productive' },
  { id: 'p_tasukete', kana: 'たすけてください', kanji: '助けてください', korean: '도와주세요', register: 'productive', tip: '급할 땐 たすけて만 외쳐도 통합니다' },

  // ── 금액·숫자 듣기 (계산대에서 귀로 알아듣기) ──
  { id: 'p_num_hyakuen', kana: 'ひゃくえん', kanji: '百円', korean: '100엔', register: 'receptive' },
  { id: 'p_num_gohyakuen', kana: 'ごひゃくえん', kanji: '五百円', korean: '500엔', register: 'receptive' },
  { id: 'p_num_senen', kana: 'せんえん', kanji: '千円', korean: '1000엔', register: 'receptive' },
  { id: 'p_num_nisenen', kana: 'にせんえん', kanji: '二千円', korean: '2000엔', register: 'receptive' },
  { id: 'p_num_gosenen', kana: 'ごせんえん', kanji: '五千円', korean: '5000엔', register: 'receptive' },
  { id: 'p_num_ichimanen', kana: 'いちまんえん', kanji: '一万円', korean: '10000엔', register: 'receptive' },

  // ── 응답 다양성 보강 ──
  { id: 'p_wakarimashita_arigatou', kana: 'わかりましたありがとうございます', kanji: '分かりました、ありがとうございます', displayKana: 'わかりました、ありがとうございます', korean: '알겠습니다, 감사합니다', register: 'productive', tip: '이해+감사를 한 번에 — 안내를 받은 뒤 자연스러운 마무리' },

  // ── C1 편의점 실사용 보강: 데우기 ──
  { id: 'p_atatamemasu_ka', kana: 'あたためますか', kanji: '温めますか', displayKana: 'あたためますか？', korean: '데워드릴까요?', register: 'receptive', grammarRefs: ['g_masuka'] },

  // ── C2 식당 실사용 보강: 자리 안내 + 계산 마무리 ──
  { id: 'p_nanmeisama', kana: 'なんめいさまですか', kanji: '何名様ですか', displayKana: 'なんめいさまですか？', korean: '몇 분이세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_hitori_desu', kana: 'ひとりです', kanji: '一人です', korean: '한 명이요', register: 'productive' },
  { id: 'p_futari_desu', kana: 'ふたりです', kanji: '二人です', korean: '두 명이요', register: 'productive' },
  { id: 'p_gochisousama', kana: 'ごちそうさまでした', korean: '잘 먹었습니다', register: 'productive', tip: '식사 후 인사 — 계산할 때 자연스럽게 곁들이면 좋아요' },

  // ── C4 호텔 체크인 ──
  { id: 'p_checkin_onegai', kana: 'チェックインおねがいします', kanji: 'チェックインお願いします', displayKana: 'チェックイン、おねがいします', korean: '체크인 부탁드립니다', register: 'productive' },
  { id: 'p_yoyaku_shiteimasu', kana: 'よやくしています', kanji: '予約しています', korean: '예약했습니다', register: 'productive' },
  { id: 'p_onamae_wa', kana: 'おなまえは', kanji: 'お名前は', displayKana: 'おなまえは？', korean: '성함은요?', register: 'receptive' },
  { id: 'p_passport_onegai', kana: 'パスポートおねがいします', kanji: 'パスポートお願いします', displayKana: 'パスポート、おねがいします', korean: '여권 부탁드립니다', register: 'receptive' },
  { id: 'p_kagi_desu', kana: 'かぎです', kanji: '鍵です', korean: '키입니다', register: 'receptive' },
  { id: 'p_heya_doko', kana: 'へやはどこですか', kanji: '部屋はどこですか', displayKana: 'へやは、どこですか？', korean: '방은 어디예요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_wifi_arimasu_ka', kana: 'ワイファイはありますか', kanji: 'Wi-Fiはありますか', displayKana: 'ワイファイは、ありますか？', korean: '와이파이는 있나요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_choushoku_wa', kana: 'ちょうしょくは', kanji: '朝食は', displayKana: 'ちょうしょくは？', korean: '조식은요?', register: 'productive' },

  // ── C14~C30 장면별 상대 대사 + 범용 응답 ──
  { id: 'p_kochira_de_meshiagarimasu_ka', kana: 'こちらでめしあがりますか', kanji: 'こちらで召し上がりますか', displayKana: 'こちらで、めしあがりますか？', korean: '매장에서 드시나요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_saizu_wa_dou_shimasu_ka', kana: 'サイズはどうしますか', kanji: 'サイズはどうしますか', displayKana: 'サイズは、どうしますか？', korean: '사이즈는 어떻게 하시겠어요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_oatame_shimasu_ka', kana: 'おあたためしますか', kanji: 'お温めしますか', displayKana: 'おあたためしますか？', korean: '데워 드릴까요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_dore_ni_shimasu_ka', kana: 'どれにしますか', kanji: 'どれにしますか', displayKana: 'どれにしますか？', korean: '어느 것으로 하시겠어요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_fukuro_otsuke_shimasu_ka', kana: 'ふくろおつけしますか', kanji: '袋お付けしますか', displayKana: 'ふくろ、おつけしますか？', korean: '봉투 넣어 드릴까요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_okaikei_wa_sennihyakuen_desu', kana: 'おかいけいはせんにひゃくえんです', kanji: 'お会計は千二百円です', displayKana: 'おかいけいは、せんにひゃくえんです。', korean: '계산은 1200엔입니다', register: 'receptive' },
  { id: 'p_yoyaku_wa_arimasu_ka', kana: 'よやくはありますか', kanji: '予約はありますか', displayKana: 'よやくは、ありますか？', korean: '예약하셨나요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_nomimono_wa_dou_shimasu_ka', kana: 'おのみものはどうしますか', kanji: 'お飲み物はどうしますか', displayKana: 'おのみものは、どうしますか？', korean: '음료는 어떻게 하시겠어요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_rasuto_ooda_desu', kana: 'ラストオーダーです', kanji: 'ラストオーダーです', korean: '마지막 주문입니다', register: 'receptive' },
  { id: 'p_kauntaa_de_yoroshii_desu_ka', kana: 'カウンターでよろしいですか', kanji: 'カウンターでよろしいですか', displayKana: 'カウンターで、よろしいですか？', korean: '카운터석 괜찮으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_nigate_na_mono_arimasu_ka', kana: 'にがてなものはありますか', kanji: '苦手なものはありますか', displayKana: 'にがてなものは、ありますか？', korean: '못 드시는 것이 있나요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_sabi_wa_daijoubu_desu_ka', kana: 'さびはだいじょうぶですか', kanji: 'さびは大丈夫ですか', displayKana: 'さびは、だいじょうぶですか？', korean: '와사비 괜찮으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_nanika_osagashi_desu_ka', kana: 'なにかおさがしですか', kanji: '何かお探しですか', displayKana: 'なにか、おさがしですか？', korean: '무엇을 찾고 계세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_chiketto_wa_kochira_desu', kana: 'チケットはこちらです', kanji: 'チケットはこちらです', korean: '티켓은 이쪽입니다', register: 'receptive' },
  { id: 'p_chizu_wa_irimasu_ka', kana: 'ちずはいりますか', kanji: '地図は要りますか', displayKana: 'ちずは、いりますか？', korean: '지도 필요하세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_dou_nasaimashita_ka', kana: 'どうなさいましたか', kanji: 'どうなさいましたか', displayKana: 'どうなさいましたか？', korean: '무슨 일이세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_shashin_wa_daijoubu_desu', kana: 'しゃしんはだいじょうぶです', kanji: '写真は大丈夫です', displayKana: 'しゃしんは、だいじょうぶです。', korean: '사진은 괜찮습니다', register: 'receptive' },
  { id: 'p_omamori_wa_kochira_desu', kana: 'おまもりはこちらです', kanji: 'お守りはこちらです', korean: '부적은 이쪽입니다', register: 'receptive' },
  { id: 'p_nyuuyokuryou_wa_happyakuen_desu', kana: 'にゅうよくりょうははっぴゃくえんです', kanji: '入浴料は八百円です', displayKana: 'にゅうよくりょうは、はっぴゃくえんです。', korean: '입욕료는 800엔입니다', register: 'receptive' },
  { id: 'p_taoru_wa_irimasu_ka', kana: 'タオルはいりますか', kanji: 'タオルは要りますか', displayKana: 'タオルは、いりますか？', korean: '수건 필요하세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_karada_o_aratte_kudasai', kana: 'からだをあらってください', kanji: '体を洗ってください', displayKana: 'からだを、あらってください。', korean: '몸을 씻고 들어가 주세요', register: 'receptive' },
  { id: 'p_yuushoku_wa_nanji_ni_shimasu_ka', kana: 'ゆうしょくはなんじにしますか', kanji: '夕食は何時にしますか', displayKana: 'ゆうしょくは、なんじにしますか？', korean: '저녁 식사는 몇 시로 하시겠어요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_ofuro_wa_ichikai_desu', kana: 'おふろはいっかいです', kanji: 'お風呂は一階です', displayKana: 'おふろは、いっかいです。', korean: '목욕탕은 1층입니다', register: 'receptive' },
  { id: 'p_dochira_made_ikimasu_ka', kana: 'どちらまでいきますか', kanji: 'どちらまで行きますか', displayKana: 'どちらまで、いきますか？', korean: '어디까지 가시나요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_ic_kaado_tsukaemasu', kana: 'アイシーカードつかえます', kanji: 'ICカード使えます', displayKana: 'アイシーカード、つかえます。', korean: 'IC카드 사용할 수 있습니다', register: 'receptive' },
  { id: 'p_tsugi_de_orite_kudasai', kana: 'つぎでおりてください', kanji: '次で降りてください', displayKana: 'つぎで、おりてください。', korean: '다음에서 내리세요', register: 'receptive' },
  { id: 'p_jiyuuseki_desu_ka', kana: 'じゆうせきですか', kanji: '自由席ですか', displayKana: 'じゆうせきですか？', korean: '자유석인가요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_noriba_wa_jyuunibansen_desu', kana: 'のりばはじゅうにばんせんです', kanji: '乗り場は十二番線です', displayKana: 'のりばは、じゅうにばんせんです。', korean: '승강장은 12번선입니다', register: 'receptive' },
  { id: 'p_jikan_ni_gochuui_kudasai', kana: 'じかんにごちゅういください', kanji: '時間にご注意ください', displayKana: 'じかんに、ごちゅういください。', korean: '시간에 주의해 주세요', register: 'receptive' },
  { id: 'p_menkyo_shou_onegai_shimasu', kana: 'めんきょしょうおねがいします', kanji: '免許証お願いします', displayKana: 'めんきょしょう、おねがいします。', korean: '운전면허증 부탁드립니다', register: 'receptive' },
  { id: 'p_henkyaku_basho_wa_kochira_desu', kana: 'へんきゃくばしょはこちらです', kanji: '返却場所はこちらです', korean: '반납 장소는 이쪽입니다', register: 'receptive' },
  { id: 'p_gasorin_mantan_de_onegai_shimasu', kana: 'ガソリンまんたんでおねがいします', kanji: 'ガソリン満タンでお願いします', displayKana: 'ガソリンまんたんで、おねがいします。', korean: '기름은 가득 채워 주세요', register: 'receptive' },
  { id: 'p_shoujou_o_oshiete_kudasai', kana: 'しょうじょうをおしえてください', kanji: '症状を教えてください', displayKana: 'しょうじょうを、おしえてください。', korean: '증상을 알려 주세요', register: 'receptive' },
  { id: 'p_hokenshou_wa_arimasu_ka', kana: 'ほけんしょうはありますか', kanji: '保険証はありますか', displayKana: 'ほけんしょうは、ありますか？', korean: '보험증이 있나요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_sensei_ga_setsumei_shimasu', kana: 'せんせいがせつめいします', kanji: '先生が説明します', korean: '의사가 설명할 겁니다', register: 'receptive' },
  { id: 'p_nani_o_nakushimashita_ka', kana: 'なにをなくしましたか', kanji: '何をなくしましたか', displayKana: 'なにを、なくしましたか？', korean: '무엇을 잃어버리셨나요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_itsu_nakushimashita_ka', kana: 'いつなくしましたか', kanji: 'いつなくしましたか', displayKana: 'いつ、なくしましたか？', korean: '언제 잃어버리셨나요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_renrakusaki_o_kaite_kudasai', kana: 'れんらくさきをかいてください', kanji: '連絡先を書いてください', displayKana: 'れんらくさきを、かいてください。', korean: '연락처를 적어 주세요', register: 'receptive' },
  { id: 'p_daijoubu_desu_ka', kana: 'だいじょうぶですか', kanji: '大丈夫ですか', displayKana: 'だいじょうぶですか？', korean: '괜찮으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_kyuukyuusha_o_yobimasu', kana: 'きゅうきゅうしゃをよびます', kanji: '救急車を呼びます', korean: '구급차를 부르겠습니다', register: 'receptive' },
  { id: 'p_basho_o_oshiete_kudasai', kana: 'ばしょをおしえてください', kanji: '場所を教えてください', displayKana: 'ばしょを、おしえてください。', korean: '장소를 알려 주세요', register: 'receptive' },
  { id: 'p_dono_puran_ni_shimasu_ka', kana: 'どのプランにしますか', kanji: 'どのプランにしますか', displayKana: 'どのプランにしますか？', korean: '어떤 요금제로 하시겠어요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_pasupooto_kakunin_shimasu', kana: 'パスポートをかくにんします', kanji: 'パスポートを確認します', korean: '여권을 확인하겠습니다', register: 'receptive' },
  { id: 'p_settei_o_tetsudaimasu', kana: 'せっていをてつだいます', kanji: '設定を手伝います', korean: '설정을 도와드리겠습니다', register: 'receptive' },
  { id: 'p_senntakuki_wa_kochira_desu', kana: 'せんたくきはこちらです', kanji: '洗濯機はこちらです', korean: '세탁기는 이쪽입니다', register: 'receptive' },
  { id: 'p_senzai_wa_jidou_desu', kana: 'せんざいはじどうです', kanji: '洗剤は自動です', korean: '세제는 자동 투입입니다', register: 'receptive' },
  { id: 'p_kanryou_made_sanjuppun_desu', kana: 'かんりょうまでさんじゅっぷんです', kanji: '完了まで三十分です', displayKana: 'かんりょうまで、さんじゅっぷんです。', korean: '완료까지 30분입니다', register: 'receptive' },
  { id: 'p_nanmai_desu_ka', kana: 'なんまいですか', kanji: '何枚ですか', displayKana: 'なんまいですか？', korean: '몇 장인가요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_kore_hitotsu_de_yoroshii_desu_ka', kana: 'これひとつでよろしいですか', kanji: 'これ一つでよろしいですか', displayKana: 'これひとつで、よろしいですか？', korean: '이거 하나로 괜찮으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_iriguchi_wa_migi_desu', kana: 'いりぐちはみぎです', kanji: '入口は右です', korean: '입구는 오른쪽입니다', register: 'receptive' },
  { id: 'p_tennai_de', kana: 'てんないで', kanji: '店内で', korean: '매장에서요', register: 'productive' },
  { id: 'p_mochikaeri_de', kana: 'もちかえりで', kanji: '持ち帰りで', korean: '포장으로요', register: 'productive' },
  { id: 'p_esu_saizu_de', kana: 'エスサイズで', kanji: 'Sサイズで', korean: 'S 사이즈로요', register: 'productive' },
  { id: 'p_emu_saizu_de', kana: 'エムサイズで', kanji: 'Mサイズで', korean: 'M 사이즈로요', register: 'productive' },
  { id: 'p_nihon_go_muzukashii', kana: 'にほんごがむずかしいです', kanji: '日本語が難しいです', korean: '일본어가 어려워요', register: 'productive' },
  { id: 'p_kippu_nimai_kudasai', kana: 'きっぷをにまいください', kanji: '切符を二枚ください', korean: '표 두 장 주세요', register: 'productive' },
  { id: 'p_sumimasen_koko_doko', kana: 'すみませんここはどこですか', kanji: 'すみません、ここはどこですか', displayKana: 'すみません、ここはどこですか？', korean: '실례합니다, 여기가 어디예요?', register: 'productive', grammarRefs: ['g_masuka'] },
  { id: 'p_nihongo_sukoshi_dake', kana: 'にほんごはすこしだけです', kanji: '日本語は少しだけです', korean: '일본어는 조금만 할 수 있어요', register: 'productive' },
];
