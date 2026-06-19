import type { Phrase } from './types';

export const phrases: Phrase[] = [
  { id: 'p_hai',  kana: 'はい',   korean: '네',    register: 'both' },
  { id: 'p_iie',  kana: 'いいえ', korean: '아니요', register: 'both' },

  // ── 완성 문장형 응답 — 단답형 はい/いいえ를 대체하는 정중 회화체 ──
  { id: 'p_hai_onegai', kana: 'はいおねがいします', kanji: 'はい、お願いします', displayKana: 'はい、おねがいします', korean: '네, 부탁합니다', register: 'productive', tip: '「はい、お願(ねが)いします」— 봉투·데우기·포인트카드 등 모든 YES 답변에 쓸 수 있어요. はい 하나보다 훨씬 자연스럽고 정중합니다' },
  { id: 'p_iie_kekkou', kana: 'いいえけっこうです', kanji: 'いいえ、結構です', displayKana: 'いいえ、けっこうです', korean: '아니요, 괜찮습니다 (정중하게 거절)', register: 'productive', tip: '「いいえ、結構(けっこう)です」— 가장 정중한 거절 표현. 봉투·영수증·포인트카드 권유를 거절할 때 써요. 「いりません」보다 부드러운 뉘앙스예요' },
  { id: 'p_hai_arimasu', kana: 'はいあります', displayKana: 'はい、あります', korean: '네, 있어요', register: 'productive', tip: '「はい、あります」— 포인트카드나 예약 여부 확인 질문에 YES로 답할 때. 간결하고 자연스러운 표현이에요' },
  { id: 'p_iie_arimasen', kana: 'いいえありません', displayKana: 'いいえ、ありません', korean: '아니요, 없어요', register: 'productive', tip: '「いいえ、ありません」— 포인트카드가 없거나 예약이 없을 때. 없으면 당황하지 말고 이 한 마디면 충분해요' },
  { id: 'p_iie_irimasen', kana: 'いいえいりません', kanji: 'いいえ、要りません', displayKana: 'いいえ、いりません', korean: '아니요, 필요 없어요', register: 'productive', tip: '「いいえ、要(い)りません」— 봉투나 영수증이 필요 없을 때. エコバッグ(장바구니) 사용도 늘어 봉투 거절이 자연스러운 분위기예요' },
  { id: 'p_hai_wakarimashita', kana: 'はいわかりました', kanji: 'はい、分かりました', displayKana: 'はい、わかりました', korean: '네, 알겠습니다', register: 'productive', tip: '「はい、分(わ)かりました」— はい를 더해 더 성실하고 확실한 이해를 표현해요. 직원 안내를 이해했다는 확실한 신호입니다' },
  { id: 'p_hai_sou_desu', kana: 'はいそうです', displayKana: 'はい、そうです', korean: '네, 그렇습니다', register: 'productive', tip: '「はい、そうです」— 이름·주문·내용 확인 질문에 YES. はい 단독보다 더 확실하게 동의하는 뉘앙스예요' },
  { id: 'p_hai_atatamete', kana: 'はいあたためてください', kanji: 'はい、温めてください', displayKana: 'はい、あたためてください', korean: '네, 데워 주세요', register: 'productive', tip: '「はい、温(あたた)めてください」— 도시락·롤·찐빵 등을 살 때. あたためて만 해도 통하지만 はい를 붙이면 더 자연스러워요' },
  { id: 'p_iie_nanimoarimasen', kana: 'いいえなにもありません', kanji: 'いいえ、何もありません', displayKana: 'いいえ、なにもありません', korean: '아니요, 아무것도 없어요', register: 'productive', tip: '「いいえ、何(なに)もありません」— 분실물·알레르기·특별 요청 유무를 물을 때 "아무것도 없어요"라고 답하는 표현이에요' },
  { id: 'p_un',   kana: 'うん',   korean: '응',    register: 'productive', tip: '「うん」— 친한 친구나 가족 사이의 캐주얼한 "응/맞아". 가게나 처음 만나는 사람에게는 반드시 はい를 쓰세요. 반말 상황을 구분하는 게 일본어 예절의 핵심이에요' },
  { id: 'p_iya',  kana: 'いや',   korean: '싫어',  register: 'productive', tip: '「いや」— 구어체 거절/부정. 친구끼리 "그렇지 않아", "싫어"라는 뉘앙스. 공식 자리에서는 いいえ를 쓰고, 부드럽게 거절할 때는 大丈夫です도 자연스러워요' },
  { id: 'p_arigatou', kana: 'ありがとう', korean: '고마워', register: 'both', tip: '「ありがとう」— 친구나 가까운 사이에 쓰는 캐주얼 감사. 가게에서는 ありがとうございます가 기본이에요. 상황에 따라 구분해서 씁시다' },
  { id: 'p_daijoubu', kana: 'だいじょうぶ', kanji: '大丈夫', korean: '괜찮아', register: 'both', n5Refs: ['n5_v_daijoubu'], tip: '「大丈夫(だいじょうぶ)」— "괜찮아"뿐만 아니라 "됐어/필요 없어"의 거절 뉘앙스로도 써요. 봉투를 권할 때 大丈夫です만 해도 거절이 됩니다' },
  { id: 'p_mou_ichido', kana: 'もういちどおねがいします', kanji: 'もう一度お願いします', displayKana: 'もういちど、おねがいします', korean: '다시 한 번 부탁합니다', register: 'productive', recoveryType: 'repeat', tip: '「もう一度(いちど)お願(ねが)いします」— 못 들었을 때 다시 말해달라는 표현. 부끄럽지 않아요 — 일본인도 친절하게 다시 말해줍니다. 뭔가 놓쳤을 때 당당하게 써요' },
  { id: 'p_yukkuri', kana: 'ゆっくりおねがいします', kanji: 'ゆっくりお願いします', displayKana: 'ゆっくり、おねがいします', korean: '천천히 부탁합니다', register: 'productive', recoveryType: 'slow', tip: '「ゆっくりお願(ねが)いします」— 말이 너무 빠를 때. 이 한 마디면 대부분의 일본인이 속도를 줄여줘요. もう一度와 함께 쓰면 더욱 효과적이에요' },
  { id: 'p_fukuro', kana: 'ふくろはいりますか', kanji: '袋は要りますか', displayKana: 'ふくろは、いりますか？', korean: '봉투 필요하세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_price', kana: 'ごうけいせんえんです', kanji: '合計千円です', displayKana: 'ごうけい、せんえんです。', korean: '합계 천엔입니다', register: 'receptive' },
  { id: 'p_konnichiwa', kana: 'こんにちは', korean: '안녕하세요', register: 'both', tip: '「こんにちは」— 낮 시간대(11시~18시) 인사. 아침엔 おはようございます, 저녁엔 こんばんは를 써요. 가게에 들어설 때 자연스럽게 인사하면 일본인에게 좋은 인상을 줍니다' },
  { id: 'p_irasshai', kana: 'いらっしゃいませ', korean: '어서 오세요', register: 'receptive' },

  // ── C2 식당 주문 한 조각 (NPC + 학습자 발화) ──
  { id: 'p_gochuumon', kana: 'ごちゅうもんはおきまりですか', kanji: 'ご注文はお決まりですか', displayKana: 'ごちゅうもんは、おきまりですか？', korean: '주문 정하셨어요?', register: 'receptive' },
  { id: 'p_kore_kudasai', kana: 'これください', kanji: 'これ下さい', korean: '이거 주세요', register: 'productive', tip: '「これください」— 메뉴나 상품을 가리키며 하는 가장 간단한 주문 표현. 일본어를 잘 몰라도 가리키며 이 한 마디로 주문 OK예요' },
  { id: 'p_osusume_wa', kana: 'おすすめはなんですか', kanji: 'お勧めは何ですか', displayKana: 'おすすめは、なんですか？', korean: '추천이 뭐예요?', register: 'productive', tip: '「お勧(すす)めは何(なに)ですか」— 메뉴 모를 때 이 한 마디면 점원이 인기 메뉴를 알려줘요. 일본어 메뉴판이 어려울 때 가장 유용한 표현 중 하나예요' },
  { id: 'p_menu_misete', kana: 'メニューをみせてください', kanji: 'メニューを見せてください', displayKana: 'メニューを、みせてください', korean: '메뉴 좀 보여 주세요', register: 'productive', tip: '「メニューを見(み)せてください」— 사진 메뉴가 있는 식당은 가리켜서 주문할 수 있어요. 영어 메뉴도 있냐고 묻고 싶으면 英語(えいご)のメニューはありますか라고 해봐요' },
  { id: 'p_nomimono', kana: 'おのみものは', kanji: 'お飲み物は', displayKana: 'おのみものは？', korean: '음료는요?', register: 'receptive' },
  { id: 'p_mizu_kudasai', kana: 'みずをください', kanji: '水をください', korean: '물 주세요', register: 'productive', tip: '「水(みず)をください」— 일본 식당은 물을 자동으로 안 주는 경우가 많아요. お水(みず)をください라고 해도 OK. 셀프 서비스인 곳도 많습니다' },
  { id: 'p_okaikei', kana: 'おかいけいおねがいします', kanji: 'お会計お願いします', displayKana: 'おかいけい、おねがいします', korean: '계산 부탁드립니다', register: 'productive', tip: '「お会計(かいけい)お願(ねが)いします」— 자리에서 직원을 부르거나 계산대로 가서 씁니다. 손을 X자로 교차하는 제스처도 일본에서 통해요' },

  // ── B0/B1 narrow: C 미션이 끌어쓰는 핵심 (발달식 thesis 전면 검증 X, MVP 한정) ──
  { id: 'p_sumimasen', kana: 'すみません', korean: '저기요 / 죄송합니다', register: 'both', tip: '「すみません」— 주의를 끌 때·사과할 때·가볍게 감사할 때까지 만능 표현. 가게에서 직원을 부를 때, 길을 물을 때, 자리를 지나칠 때 모두 써요' },
  { id: 'p_onegai_shimasu', kana: 'おねがいします', kanji: 'お願いします', korean: '부탁드립니다', register: 'both', tip: '「お願(ねが)いします」— 뭔가를 부탁할 때 뒤에 붙이는 만능 표현. 「○○お願いします」형태로 어디서든 통해요. 단어 하나 + お願いします로 웬만한 요청이 가능합니다' },
  { id: 'p_chotto', kana: 'ちょっと', korean: '잠깐 / 조금', register: 'both', tip: '「ちょっと」— "잠깐"과 "조금"을 모두 표현해요. ちょっとすみません(잠깐만요), ちょっと待(ま)って(잠깐만요)처럼 여러 상황에서 쓸 수 있는 유연한 단어예요' },
  { id: 'p_oishii', kana: 'おいしい', korean: '맛있어요', register: 'productive', tip: '「おいしい！」— 음식이 맛있을 때 바로 이 표현! 점원이나 요리사에게 말하면 크게 기뻐해요. 더 감탄하고 싶으면 最高(さいこう)！(최고!)도 통합니다' },
  { id: 'p_kore', kana: 'これ', korean: '이거', register: 'both' },
  { id: 'p_are', kana: 'あれ', korean: '저거', register: 'both' },
  { id: 'p_arigatou_gozaimasu', kana: 'ありがとうございます', kanji: 'ありがとうございます', korean: '감사합니다 (정중)', register: 'productive', tip: '「ありがとうございます」— 일본에서 가장 많이 쓰는 말 중 하나. 거스름돈을 받을 때, 안내를 받을 때, 배웅받을 때 자연스럽게 씁니다. 친구에게는 ありがとう로 줄여도 OK' },

  // ── Recovery 4종 마지막 = simplify ──
  { id: 'p_yasashii_nihongo', kana: 'やさしいにほんごでおねがいします', kanji: 'やさしい日本語でお願いします', displayKana: 'やさしいにほんごで、おねがいします', korean: '쉬운 일본어로 부탁드려요', register: 'productive', recoveryType: 'simplify', tip: '「やさしい日本語(にほんご)でお願(ねが)いします」— 어려운 표현 대신 쉽게 말해달라는 요청. 観光地(かんこうち)では外国人向けに簡単な日本語で対応してくれる방이 많아요' },

  // ── C1 편의점 두텁게 (결제·포인트·영수증·봉투·데우기) ──
  { id: 'p_shiharai_houhou', kana: 'おしはらいほうほうは', kanji: 'お支払い方法は', displayKana: 'おしはらいほうほうは？', korean: '결제 방법은요?', register: 'receptive' },
  { id: 'p_genkin_de', kana: 'げんきんで', kanji: '現金で', korean: '현금으로요', register: 'productive', tip: '「現金(げんきん)で」— 현금 결제 선택. で는 수단을 나타내는 조사예요. 일본은 현금 문화가 강해 소규모 가게에선 현금만 받는 곳도 있어요' },
  { id: 'p_card_de', kana: 'カードで', korean: '카드로요', register: 'productive', tip: '「カードで」— 카드 결제 선택. 편의점·체인 식당은 대부분 카드 OK. 但(ただ)し 일부 소형 가게는 현금만 받으니 미리 확인하세요' },
  { id: 'p_kore_de', kana: 'これでおねがいします', kanji: 'これでお願いします', korean: '이걸로 부탁드려요', register: 'productive', tip: '「これでお願(ねが)いします」— 지갑·카드·IC카드를 보여주며 "이걸로 낼게요"라고 할 때. 어떤 결제 수단이든 보여주며 쓸 수 있는 만능 표현이에요' },
  { id: 'p_pointo_arimasu_ka', kana: 'ポイントカードはありますか', kanji: 'ポイントカードはありますか', displayKana: 'ポイントカードは、ありますか？', korean: '포인트카드 있으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_arimasu', kana: 'あります', korean: '있어요', register: 'both', tip: '「あります」— 포인트카드·예약·재고 등 "있나요?" 질문에 YES로 답하는 짧고 자연스러운 표현. はい、あります라고 하면 더 정중해요' },
  { id: 'p_arimasen', kana: 'ありません', korean: '없어요', register: 'both', tip: '「ありません」— "없어요"라고 답하는 표현. 포인트카드가 없거나 예약이 없을 때. いいえ、ありません이 더 완전한 형태예요' },
  { id: 'p_reshiito_kudasai', kana: 'レシートをください', kanji: 'レシートをください', korean: '영수증 주세요', register: 'productive', tip: '「レシートをください」— 영수증을 요청하는 표현. レシート는 receipt의 카타카나 표기. 경비 처리나 환불 시 보관해두면 유용해요' },
  { id: 'p_fukuro_iranai', kana: 'ふくろはいりません', kanji: '袋は要りません', korean: '봉투는 필요 없어요', register: 'productive', tip: '「袋(ふくろ)はいりません」— 봉투를 거절하는 표현. 에코백을 가지고 다니는 문화가 자리잡혀 거절해도 전혀 어색하지 않아요' },
  { id: 'p_atatamete', kana: 'あたためてください', kanji: '温めてください', korean: '데워 주세요', register: 'productive', speechPhoneme: 'アタタメテクダサイ', tip: '「温(あたた)めてください」— 도시락·롤빵·만주 등 데울 음식에 쓰는 표현. 발음이 어려우면 「あたためて」만 해도 충분히 통해요' },

  // ── C안: B0/B1 narrow 보강 (친구 권고 — C1/C2가 끌어쓰는 답변 다양화) ──
  { id: 'p_wakarimasen', kana: 'わかりません', kanji: '分かりません', korean: '모르겠어요', register: 'productive', tip: '「分(わ)かりません」— 솔직한 의사표현이지만, 막혔을 때는 「ゆっくりお願いします」나 「やさしい日本語で」를 쓰는 게 더 생산적이에요. 함께 알아두면 좋아요' },
  { id: 'p_hoshii_desu', kana: 'ほしいです', korean: '원해요', register: 'productive', tip: '「ほしいです」— 원하다는 의사 표현. ○○がほしいです 형태로 써요. これがほしいです(이게 갖고 싶어요)처럼 상품을 가리키며 쓸 수 있어요' },
  { id: 'p_irimasen', kana: 'いりません', kanji: '要りません', korean: '필요 없어요', register: 'productive', tip: '「いりません」— 짧게 거절하는 표현. いいえ、いりません이 더 완전하고 정중한 형태예요. 봉투·포인트카드·영수증 등을 거절할 때 씁니다' },
  { id: 'p_chotto_matte', kana: 'ちょっとまってください', kanji: 'ちょっと待ってください', displayKana: 'ちょっと、まってください', korean: '잠깐만 기다려 주세요', register: 'productive', tip: '「ちょっと待(ま)ってください」— 주소를 찾거나 지갑을 꺼내는 동안 쓰는 표현. ちょっと待って만 해도 통해요. 급할 때 まって！로 줄일 수도 있어요' },
  { id: 'p_sou_desu', kana: 'そうです', korean: '그래요 / 맞아요', register: 'both', tip: '「そうです」— 동의·확인할 때 쓰는 표현. はい보다 더 적극적으로 "맞아요"를 표현해요. 주문이나 이름을 확인할 때 자주 씁니다' },
  { id: 'p_ikura_desu_ka', kana: 'いくらですか', displayKana: 'いくらですか？', korean: '얼마예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「いくらですか」— 가격 확인 기본 표현. すみません、これはいくらですか로 더 완전하게 쓸 수 있어요. 가격표가 없는 반찬가게·시장에서 특히 유용해요' },
  { id: 'p_doko_desu_ka', kana: 'どこですか', displayKana: 'どこですか？', korean: '어디예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「どこですか」— 위치 확인 기본 패턴. すみません、○○はどこですか 형태로 어디서든 응용 가능해요. 스마트폰 지도를 함께 보여주면 더 빠르게 안내받아요' },
  { id: 'p_daijoubu_desu', kana: 'だいじょうぶです', kanji: '大丈夫です', korean: '괜찮습니다 (정중)', register: 'both', tip: '「大丈夫(だいじょうぶ)です」— 상황에 따라 "괜찮습니다/됐습니다/필요 없어요" 등 여러 뉘앙스로 쓰여요. 봉투나 데우기를 거절할 때도 자연스럽게 씁니다' },

  // ── C3 전철 한 조각 (개찰구·환승·길찾기) ──
  { id: 'p_shinjuku_doko', kana: 'しんじゅくえきはどこですか', kanji: '新宿駅はどこですか', displayKana: 'しんじゅくえきは、どこですか？', korean: '신주쿠역은 어디예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「新宿駅(しんじゅくえき)はどこですか」— ○○駅はどこですか 패턴으로 어느 역이든 응용 가능해요. 역은 駅(えき)라는 한 단어만 기억하면 돼요' },
  { id: 'p_michi_oshiete', kana: 'みちをおしえてください', kanji: '道を教えてください', korean: '길을 가르쳐 주세요', register: 'productive', tip: '「道(みち)を教(おし)えてください」— 길 안내 요청. 지도를 보여주며 하면 더 명확하게 안내받을 수 있어요. 일본인은 대체로 친절하게 도와줍니다' },
  { id: 'p_eigo_de', kana: 'えいごでだいじょうぶですか', kanji: '英語で大丈夫ですか', displayKana: 'えいごで、だいじょうぶですか？', korean: '영어로 괜찮을까요?', register: 'productive', grammarRefs: ['g_masuka'], recoveryType: 'fallback', tip: '「英語(えいご)で大丈夫(だいじょうぶ)ですか」— 소통이 막혔을 때 쓰는 최후의 카드. 백화점·공항·대형 호텔에서는 영어 대응 가능한 경우가 많아요. 작은 가게에서는 스마트폰 번역앱을 함께 보여주면 더 효과적이에요' },
  { id: 'p_norikae_kudasai', kana: 'つぎのえきでのりかえてください', kanji: '次の駅で乗り換えてください', displayKana: 'つぎのえきで、のりかえてください', korean: '다음 역에서 갈아타세요', register: 'receptive' },
  { id: 'p_wakarimashita', kana: 'わかりました', kanji: '分かりました', korean: '알겠습니다', register: 'productive', tip: '「分(わ)かりました」— 직원의 안내나 설명을 이해했을 때. はい보다 더 적극적인 이해 확인이에요. ありがとうございます를 덧붙이면 더욱 자연스럽습니다' },
  { id: 'p_dochira_desu_ka', kana: 'どちらですか', displayKana: 'どちらですか？', korean: '어느 쪽이에요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「どちらですか」— どこ보다 정중한 표현으로 방향이나 장소를 물을 때 써요. 일본어에서 どちら는 どこ·どれの正中語(ていねいご)예요' },

  // ── 전철·여행 기본 어휘 (인벤토리 — 미션 차차 사용) ──
  { id: 'p_eki', kana: 'えき', kanji: '駅', korean: '역', register: 'both' },
  { id: 'p_norikae', kana: 'のりかえ', kanji: '乗り換え', korean: '환승', register: 'both' },
  { id: 'p_kaisatsu', kana: 'かいさつ', kanji: '改札', korean: '개찰구', register: 'both' },
  { id: 'p_kippu', kana: 'きっぷ', kanji: '切符', korean: '표 / 티켓', register: 'both' },

  // ── C1 편의점 보강: 젓가락/그대로/스이카/따로 ──
  { id: 'p_hashi_irimasu_ka', kana: 'はしはいりますか', kanji: '箸は要りますか', displayKana: 'はしは、いりますか？', korean: '젓가락 필요하세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_supuun_otsuke', kana: 'スプーンはおつけしますか', kanji: 'スプーンはお付けしますか', displayKana: 'スプーンは、おつけしますか？', korean: '스푼 드릴까요?', register: 'receptive' },
  { id: 'p_hashi_kudasai', kana: 'はしをください', kanji: '箸をください', korean: '젓가락 주세요', register: 'productive', tip: '「箸(はし)をください」— 편의점에서는 젓가락을 자동으로 안 주는 경우가 많아요. 필요하면 직접 말해야 해요. スプーン(숟가락)도 필요하면 함께 요청하세요' },
  { id: 'p_sono_mama_de', kana: 'そのままで', korean: '그대로 주세요', register: 'productive', tip: '"별다른 처리 없이 그대로"의 의미. 데우기·봉투 거절 모두 통용' },
  { id: 'p_betsubetsu_de', kana: 'べつべつで', kanji: '別々で', korean: '따로따로요', register: 'productive', tip: '「別々(べつべつ)で」— 동행자와 각자 계산할 때. 일본 레스토랑에서는 사전에 말하면 영수증을 나눠줘요. 반대로 一緒(いっしょ)に(같이요)도 쓸 수 있어요' },
  { id: 'p_suica_de', kana: 'スイカで', korean: '스이카로요', register: 'productive', tip: '「Suicaで」— Suica·Pasmo 등 IC카드 결제 선택. 편의점·식당·자판기에서도 사용 가능하고 현금보다 빠르고 편리해요' },
  { id: 'p_mou_daijoubu_desu', kana: 'もうだいじょうぶです', kanji: 'もう大丈夫です', korean: '이제 괜찮습니다', register: 'productive', tip: '「もう大丈夫(だいじょうぶ)です」— 추가 도움·권유를 부드럽게 거절할 때. もう(이제)가 붙어 "이미 충분해요"의 뉘앙스예요. 직접적이지 않아 일본 문화에 잘 맞는 거절법이에요' },

  // ── C1 편의점 실생활 확장: 추가 구매·성인 인증·봉투 사이즈·수저·큰 돈·IC 충전·거스름돈 ──
  // (NPC 발화 = receptive)
  { id: 'p_ijou_de_yoroshii', kana: 'いじょうでよろしいですか', kanji: '以上でよろしいですか', displayKana: 'いじょうで、よろしいですか？', korean: '이상으로 괜찮으세요?', register: 'receptive' },
  { id: 'p_nenrei_kakunin', kana: 'ねんれいかくにんのためがめんにタッチをおねがいします', kanji: '年齢確認のため画面にタッチをお願いします', displayKana: 'ねんれいかくにんのため、がめんにタッチをおねがいします', korean: '연령 확인을 위해 화면을 터치해 주세요', register: 'receptive' },
  { id: 'p_zandaka_tarimasen', kana: 'スイカのざんだかがたりません', kanji: 'Suicaの残高が足りません', displayKana: 'スイカのざんだかが、たりません', korean: '스이카 잔액이 부족합니다', register: 'receptive' },
  { id: 'p_otsuri_to_reshiito', kana: 'おつりですレシートはごりようですか', kanji: 'お釣りです。レシートはご利用ですか', displayKana: 'おつりです。レシートはごりようですか？', korean: '거스름돈입니다. 영수증 필요하세요?', register: 'receptive' },
  // (학습자 발화 = productive / both)
  { id: 'p_oden_hitotsu', kana: 'おでんをひとつください', kanji: 'おでんを一つください', korean: '어묵 하나 주세요', register: 'productive', tip: '「おでんを一(ひと)つください」— 계산대 옆 おでん(어묵)은 겨울 편의점의 명물. つゆ(국물) 양도 「つゆ多(おお)めで」(국물 많이)처럼 요청할 수 있어요' },
  { id: 'p_karaage_kudasai', kana: 'からあげをください', kanji: '唐揚げをください', korean: '닭튀김 주세요', register: 'productive', tip: '「唐揚(からあ)げをください」— 계산대 핫스낵(ホットスナック)은 가리키며 주문해요. ファミチキ·からあげクン처럼 체인마다 인기 메뉴 이름이 달라요' },
  { id: 'p_ijou_desu', kana: 'いじょうです', kanji: '以上です', korean: '이게 다예요', register: 'productive', tip: '「以上(いじょう)です」— "주문은 이걸로 끝"이라는 마무리 표현. 식당·편의점 어디서나 「以上で大丈夫(だいじょうぶ)です」형태로도 자주 써요' },
  { id: 'p_hatachi_ijou_desu', kana: 'はたちいじょうです', kanji: '二十歳以上です', korean: '스무 살 넘었어요', register: 'productive', tip: '「二十歳(はたち)以上(いじょう)です」— 주류·담배 구매 시 연령 확인. 보통은 화면의 「はい」를 누르면 끝나지만, 말로 확인할 때 쓰는 표현이에요. 二十歳는 はたち로 읽는 특별한 단어예요' },
  { id: 'p_ookii_fukuro', kana: 'おおきいふくろでおねがいします', kanji: '大きい袋でお願いします', displayKana: 'おおきいふくろで、おねがいします', korean: '큰 봉투로 부탁해요', register: 'productive', tip: '「大(おお)きい袋(ふくろ)でお願(ねが)いします」— 짐이 많을 때 큰 봉투를 요청. 반대로 작은 건 小(ちい)さい袋. 봉투는 보통 3~5엔 유료예요' },
  { id: 'p_supuun_kudasai', kana: 'スプーンをください', kanji: 'スプーンをください', korean: '숟가락 주세요', register: 'productive', tip: '「スプーンをください」— 디저트·카레·컵라면엔 숟가락. 포크는 フォーク, 빨대는 ストロー. 필요한 식기는 직접 말해야 챙겨줘요' },
  { id: 'p_card_de_onegai', kana: 'カードでおねがいします', kanji: 'カードでお願いします', displayKana: 'カードで、おねがいします', korean: '카드로 부탁드려요', register: 'productive', tip: '「カードでお願(ねが)いします」— 「カードで」보다 정중한 완성형. 점원이 「一括(いっかつ)でよろしいですか」(일시불로 할까요?)라고 물으면 「はい、一括で」라고 답해요' },
  { id: 'p_suica_de_onegai', kana: 'スイカでおねがいします', kanji: 'Suicaでお願いします', displayKana: 'スイカで、おねがいします', korean: '스이카로 부탁드려요', register: 'productive', tip: '「Suicaでお願(ねが)いします」— IC카드 결제의 정중한 완성형. 점원이 단말기를 가리키면 카드를 「ピッ」 터치하면 끝나요' },
  { id: 'p_ichiman_de', kana: 'いちまんえんでおねがいします', kanji: '一万円でお願いします', displayKana: 'いちまんえんで、おねがいします', korean: '만 엔으로 낼게요', register: 'productive', tip: '「一万円(いちまんえん)でお願(ねが)いします」— 큰 지폐로 낼 때. 점원이 「一万円(いちまんえん)お預(あず)かりします」(만 엔 받았습니다)라고 복창하고 거스름돈을 줘요' },
  { id: 'p_sen_en_chaaji', kana: 'せんえんチャージしてください', kanji: '千円チャージしてください', displayKana: 'せんえんチャージ、してください', korean: '천 엔 충전해 주세요', register: 'productive', tip: '「千円(せんえん)チャージしてください」— IC카드 충전 금액 지정. 편의점 계산대에서 현금으로 바로 충전할 수 있어요. 보통 1000엔 단위로 충전해요' },

  // ── C2 식당 보강: 개수/이거랑/매워요?/먹을게요 ──
  { id: 'p_hitotsu_kudasai', kana: 'ひとつください', kanji: '一つください', korean: '하나 주세요', register: 'productive', tip: '「一(ひと)つください」— 일본어 고유 수 세기: ひとつ(1), ふたつ(2), みっつ(3), よっつ(4). 二(ふた)つ、三(みっ)つ로 응용해요. 상품·음식 모두 통해요' },
  { id: 'p_futatsu_kudasai', kana: 'ふたつください', kanji: '二つください', korean: '두 개 주세요', register: 'productive', tip: '「二(ふた)つください」— 고유어 수 세기로 작은 물건을 셀 때. 3개는 みっつください, 4개는 よっつください로 이어서 쓸 수 있어요' },
  { id: 'p_kore_to_kore', kana: 'これとこれ', korean: '이거랑 이거', register: 'productive', tip: '메뉴를 가리키며 — 가장 안전한 주문법' },
  { id: 'p_karai_desu_ka', kana: 'からいですか', kanji: '辛いですか', displayKana: 'からいですか？', korean: '매워요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「辛(から)いですか」— 매운맛 여부 확인. 일본 음식은 한국보다 매운맛이 약한 편이지만, 唐辛子(とうがらし)・ワサビ 등은 주의가 필요해요' },
  { id: 'p_tabemasu', kana: 'たべます', kanji: '食べます', korean: '먹을게요', register: 'productive', tip: '「食(た)べます」— 주문을 결정했을 때. これを食べます(이걸 먹을게요)나 これにします(이걸로 할게요)로 응용할 수 있어요' },

  // ── C3 전철 정식화: 표·IC충전·개찰구·플랫폼·내릴 역 ──
  { id: 'p_kippu_kudasai', kana: 'きっぷをください', kanji: '切符をください', korean: '표 주세요', register: 'productive', tip: '「切符(きっぷ)をください」— 종이 티켓 구매 요청. 요즘은 Suica(スイカ)나 앱이 편하지만, 관광지 단거리나 일부 노선에선 종이 티켓도 씁니다' },
  { id: 'p_chaaji_onegai', kana: 'チャージおねがいします', kanji: 'チャージお願いします', displayKana: 'チャージ、おねがいします', korean: '충전 부탁해요', register: 'productive', tip: 'IC카드(Suica) 잔액 충전 — 「チャージ」 한 단어면 통해요' },
  { id: 'p_kaisatsu_doko', kana: 'かいさつはどこですか', kanji: '改札はどこですか', displayKana: 'かいさつは、どこですか？', korean: '개찰구 어디예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「改札(かいさつ)はどこですか」— 대형 역에서는 방향에 따라 北口(きたぐち)·南口(みなみぐち) 등 여러 개찰구가 있어요. 출구(出口/でぐち) 번호도 함께 확인하면 좋아요' },
  { id: 'p_nanbansen', kana: 'なんばんせんですか', kanji: '何番線ですか', displayKana: 'なんばんせんですか？', korean: '몇 번 선이에요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '플랫폼 번호 묻기 — 「番線(ばんせん)」이 승강장 번호' },
  { id: 'p_tsugi_wa_shibuya', kana: 'つぎはしぶやですか', kanji: '次は渋谷ですか', displayKana: 'つぎは、しぶやですか？', korean: '다음은 시부야예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「次(つぎ)は渋谷(しぶや)ですか」— 내릴 역을 확인할 때. 次(つぎ)は○○ですか 패턴으로 역명만 바꿔 어디서나 쓸 수 있어요. 앱 전파 안 될 때도 안심' },

  // ── C9 공항 입국심사 ──
  { id: 'p_mokuteki_wa', kana: 'もくてきは', displayKana: 'もくてきは？', korean: '방문 목적은?', register: 'receptive' },
  { id: 'p_kankou_desu', kana: 'かんこうです', kanji: '観光です', korean: '관광이에요', register: 'productive', tip: '「観光(かんこう)です」— 입국 심사에서 가장 많이 쓰는 답변. 입국 카드(入国カード)에도 観光으로 체크하세요. ビジネスや留学(りゅうがく)도 상황에 맞게 알아두면 유용해요' },
  { id: 'p_shigoto_desu', kana: 'しごとです', kanji: '仕事です', korean: '일/출장이에요', register: 'productive', tip: '「仕事(しごと)です」— 업무 출장 시 쓰는 답변. 입국 카드에는 商用(しょうよう)라고 표기해요. 회사 연락처나 체류 일정을 미리 준비해두면 좋아요' },
  { id: 'p_taizai_wa', kana: 'たいざいは', displayKana: 'たいざいは？', korean: '얼마나 머무세요?', register: 'receptive' },
  { id: 'p_isshuukan', kana: 'いっしゅうかんです', kanji: '一週間です', korean: '일주일이요', register: 'productive', tip: '「一週間(いっしゅうかん)です」— 체류 기간 답변. 二週間(にしゅうかん)·十日間(とおかかん)으로 응용할 수 있어요. 입국 심사는 간단한 일본어로 충분해요' },
  { id: 'p_mikka', kana: 'みっかです', kanji: '三日です', korean: '3일이요', register: 'productive', tip: '「三日(みっか)です」— 3일 체류 답변. 일본어는 날수를 고유어로 세요: 一日(ついたち), 二日(ふつか), 三日(みっか), 四日(よっか), 五日(いつか)…' },
  { id: 'p_doko_tomaru', kana: 'どこにとまりますか', kanji: 'どこに泊まりますか', displayKana: 'どこに、とまりますか？', korean: '어디 묵으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_hoteru_desu', kana: 'ホテルです', korean: '호텔이에요', register: 'productive', tip: '「ホテルです」— 숙소 유형 답변. 旅館(りょかん)・民泊(みんぱく)에 묵는 경우라면 住所(じゅうしょ)를 적어두거나 예약 화면을 보여주면 돼요' },

  // ── C10 환전 ──
  { id: 'p_ryougae', kana: 'りょうがえおねがいします', kanji: '両替お願いします', displayKana: 'りょうがえ、おねがいします', korean: '환전해 주세요', register: 'productive', tip: '「両替(りょうがえ)お願(ねが)いします」— 환전 요청. 공항·은행·우체국(ゆうちょ銀行)이 환율이 좋아요. 요즘은 7-Eleven ATM에서도 외국 카드로 현금 인출이 가능해요' },
  { id: 'p_komakaku', kana: 'こまかくしてください', kanji: '細かくしてください', korean: '잔돈으로 해 주세요', register: 'productive', tip: '큰 지폐를 동전·작은 지폐로 바꿀 때' },

  // ── C11 코인로커 ──
  { id: 'p_koinrokkaa', kana: 'コインロッカーはどこですか', displayKana: 'コインロッカーは、どこですか？', korean: '코인로커 어디예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「コインロッカーはどこですか」— 대형 역에는 S·M·L 다양한 크기의 로커가 있어요. 가방을 맡기고 싶을 때 荷物(にもつ)を預(あず)けたいです라고도 할 수 있어요' },
  { id: 'p_tsukaikata', kana: 'つかいかたをおしえてください', kanji: '使い方を教えてください', korean: '사용법 알려 주세요', register: 'productive', tip: '「使(つか)い方(かた)を教(おし)えてください」— 기계·기구 사용법을 모를 때. 코인로커·자동판매기·식권기 등 어디서나 쓸 수 있는 유용한 표현이에요' },
  { id: 'p_kono_botan_oshite', kana: 'このボタンをおしてください', kanji: 'このボタンを押してください', displayKana: 'このボタンを、おしてください', korean: '이 버튼을 눌러 주세요', register: 'both' },

  // ── C12 편의점 택배(택큐빈) ──
  { id: 'p_okuritai', kana: 'これをおくりたいです', kanji: 'これを送りたいです', displayKana: 'これを、おくりたいです', korean: '이거 보내고 싶어요', register: 'productive', tip: '「これを送(おく)りたいです」— 짐을 가리키며 말하면 OK. 호텔→공항 당일 배송 서비스(手荷物宅配/てにもつたくはい)도 있어요. 무거운 짐은 미리 보내는 게 편해요' },
  { id: 'p_takkyubin', kana: 'たっきゅうびんおねがいします', kanji: '宅急便お願いします', displayKana: 'たっきゅうびん、おねがいします', korean: '택배 부탁해요', register: 'productive', tip: '「宅急便(たっきゅうびん)」는 야마토 운수 브랜드명이 일반명사처럼 굳어진 표현. 전국 편의점 어디서나 접수 가능하고, 배송 추적도 앱으로 실시간 확인할 수 있어요' },
  { id: 'p_reshiito_irimasu_ka', kana: 'レシートはいりますか', displayKana: 'レシートは、いりますか？', korean: '영수증 필요하세요?', register: 'receptive', grammarRefs: ['g_masuka'] },

  // ── C13 라멘 식권기 ──
  { id: 'p_kenbaiki', kana: 'けんばいきはどこですか', kanji: '券売機はどこですか', displayKana: 'けんばいきは、どこですか？', korean: '식권기 어디예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「券売機(けんばいき)はどこですか」— 라멘·소바 가게 입구에 주로 있어요. 사진 메뉴 버튼을 고르면 돼요. 모르면 店員(てんいん)さんに聞(き)いて！' },
  { id: 'p_oomori', kana: 'おおもりできますか', kanji: '大盛りできますか', displayKana: 'おおもり、できますか？', korean: '곱빼기 되나요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「大盛(おおも)りできますか」— 라멘·덮밥류에서 양을 늘릴 때. 많은 가게에서 무료 또는 100엔 추가예요. 반대로 小盛(こも)り(소량)를 요청할 수도 있어요' },
  { id: 'p_kaedama', kana: 'かえだまおねがいします', kanji: '替え玉お願いします', displayKana: 'かえだま、おねがいします', korean: '면 추가요', register: 'productive', tip: 'かえだま=라멘 면 사리 추가. 도쿄·하카타 라멘집 필수' },
  // C13 라멘 실전 확장 — 자리·식권·면굳기·토핑
  { id: 'p_kauntaa_e_douzo', kana: 'カウンターせきへどうぞ', kanji: 'カウンター席へどうぞ', displayKana: 'カウンターせきへどうぞ', korean: '카운터석으로 오세요', register: 'receptive' },
  { id: 'p_shokken_douzo', kana: 'しょっけんをこちらへどうぞ', kanji: '食券をこちらへどうぞ', displayKana: 'しょっけんを、こちらへどうぞ', korean: '식권을 이쪽으로 주세요', register: 'receptive' },
  { id: 'p_topping_ikaga', kana: 'トッピングはいかがですか', kanji: 'トッピングはいかがですか', displayKana: 'トッピングは、いかがですか？', korean: '토핑은 어떠세요?', register: 'receptive' },
  { id: 'p_men_katame', kana: 'めんはかためでおねがいします', kanji: '麺は硬めでお願いします', displayKana: 'めんはかためで、おねがいします', korean: '면은 단단하게요', register: 'productive', tip: '「麺(めん)は硬(かた)めで」— 라멘 면 굳기 요청. バリカタ(아주 단단)〉硬(かた)め〉普通(ふつう)〉やわめ(부드럽게) 순. 하카타 돈코츠 라멘에서 특히 자주 물어봐요' },
  { id: 'p_ajitama_tsuika', kana: 'あじたまついかでおねがいします', kanji: '味玉追加でお願いします', displayKana: 'あじたまついかで、おねがいします', korean: '맛계란 추가요', register: 'productive', tip: '「味玉(あじたま)追加(ついか)で」— 간장에 절인 반숙 계란. 라멘 인기 토핑 1위예요. 「〇〇追加で」는 어떤 토핑에도 쓰는 추가 패턴이에요' },
  { id: 'p_chaashuu_tsuika', kana: 'チャーシューついかでおねがいします', kanji: 'チャーシュー追加でお願いします', displayKana: 'チャーシューついかで、おねがいします', korean: '차슈 추가요', register: 'productive', tip: '「チャーシュー追加(ついか)で」— 돼지고기 차슈 추가. のり(김)·メンマ(죽순)·ねぎ(파)도 같은 패턴으로 추가할 수 있어요' },

  // ── C6 약국 (증상·약) ──
  { id: 'p_dou_shimashita', kana: 'どうしましたか', displayKana: 'どうしましたか？', korean: '어디가 안 좋으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_atama_itai', kana: 'あたまがいたいです', kanji: '頭が痛いです', displayKana: 'あたまが、いたいです', korean: '머리가 아파요', register: 'productive', tip: '「頭(あたま)が痛(いた)いです」— 두통 표현. 薬局(やっきょく)에서 頭痛薬(ずつうやく)(두통약)を下さいと 함께 쓰면 돼요. ○○が痛いです 패턴으로 다른 부위도 응용 가능해요' },
  { id: 'p_onaka_itai', kana: 'おなかがいたいです', kanji: 'お腹が痛いです', displayKana: 'おなかが、いたいです', korean: '배가 아파요', register: 'productive', tip: '「お腹(なか)が痛(いた)いです」— 복통 표현. 胃腸薬(いちょうやく)·整腸剤(せいちょうざい)를 찾을 때 먼저 이 표현으로 증상을 설명하면 약사가 도와줘요' },
  { id: 'p_kaze_desu', kana: 'かぜです', kanji: '風邪です', korean: '감기예요', register: 'productive', tip: '「風邪(かぜ)です」— 감기 증상 전달. 일본 드럭스토어(ドラッグストア)에는 종합감기약(総合感冒薬/そうごうかんぼうやく)이 다양하게 있어요. 마스크(マスク)도 함께 구입하면 좋아요' },
  { id: 'p_kusuri_kudasai', kana: 'くすりをください', kanji: '薬をください', korean: '약 주세요', register: 'productive', tip: '「薬(くすり)をください」— 증상을 먼저 말한 뒤 쓰면 더 효과적. 처방전(処方箋/しょほうせん)이 필요한 약과 OTC(over-the-counter) 약이 구별되니 확인이 필요해요' },
  { id: 'p_kono_kusuri', kana: 'このくすりはなんですか', kanji: 'この薬は何ですか', displayKana: 'このくすりは、なんですか？', korean: '이 약은 뭐예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「この薬(くすり)は何(なに)ですか」— 약 성분이나 용도를 모를 때. 영어 표기가 없는 약이 많으니 반드시 점원에게 확인해요. 알레르기 성분도 함께 확인하면 안전해요' },
  { id: 'p_shokugo_nonde', kana: 'しょくごにのんでください', kanji: '食後に飲んでください', displayKana: 'しょくごに、のんでください', korean: '식후에 드세요', register: 'receptive' },

  // ── C7 쇼핑·면세 ──
  { id: 'p_kore_ikura', kana: 'これはいくらですか', kanji: 'これはいくらですか', displayKana: 'これは、いくらですか？', korean: '이거 얼마예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「これはいくらですか」— 가격표가 없거나 확인이 필요할 때. すみません을 앞에 붙이면 더 자연스러워요. 반찬가게·시장·노점에서 자주 쓰는 표현이에요' },
  { id: 'p_shichaku', kana: 'しちゃくしてもいいですか', kanji: '試着してもいいですか', displayKana: 'しちゃく、してもいいですか？', korean: '입어 봐도 돼요?', register: 'productive', tip: '「試着(しちゃく)してもいいですか」— 피팅룸 이용 전 반드시 확인해야 해요. 試着室(しちゃくしつ)はどこですかで위치도 함께 물어봐요' },
  { id: 'p_menzei_dekimasu_ka', kana: 'めんぜいできますか', kanji: '免税できますか', displayKana: 'めんぜい、できますか？', korean: '면세 되나요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「免税(めんぜい)できますか」— 외국인 여행자는 세금 환급 대상. 보통 1회 5,000엔 이상 구매 시 적용되며, 여권(パスポート)을 제시해야 해요' },
  { id: 'p_kore_kudasai_shop', kana: 'これにします', kanji: 'これにします', korean: '이걸로 할게요', register: 'productive', tip: '「これにします」— 상품을 결정했을 때. これください보다 조금 더 자연스럽고 세련된 표현이에요. どれにしますか(어느 것으로 하시겠어요?)라는 질문의 답변이기도 해요' },
  { id: 'p_card_tsukaemasu_ka', kana: 'カードはつかえますか', kanji: 'カードは使えますか', displayKana: 'カードは、つかえますか？', korean: '카드 돼요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「カードは使(つか)えますか」— 소규모 가게나 시장에서는 현금만 받는 곳도 있어요. 入店(にゅうてん)前에 확인하면 낭패를 피할 수 있어요' },
  { id: 'p_pasupooto_arimasu', kana: 'パスポートはこちらです', displayKana: 'パスポートは、こちらです', korean: '여권 여기 있어요', register: 'productive', tip: '「パスポートはこちらです」— 면세 처리나 체크인 시 여권 제시. こちら는 "이쪽" — 물건을 건네는 가장 정중한 표현이에요. 여권은 여행 중 항상 지참하세요' },

  // ── C8 택시 ──
  { id: 'p_takushi_onegai', kana: 'タクシーおねがいします', kanji: 'タクシーお願いします', displayKana: 'タクシー、おねがいします', korean: '택시 불러주세요', register: 'productive', tip: '「タクシーお願(ねが)いします」— 일본 택시는 자동문! 직접 열지 않아도 기사가 열어줘요. 목적지 주소나 지도를 보여주면 원활하게 소통할 수 있어요' },
  { id: 'p_made_onegai', kana: 'しぶやまでおねがいします', kanji: '渋谷までお願いします', displayKana: 'しぶや、までおねがいします', korean: '시부야까지 가주세요', register: 'productive', tip: '「渋谷(しぶや)までお願(ねが)いします」— 目的地(もくてきち)+まで+お願いします 패턴으로 어디든 응용 가능. 스마트폰 지도 화면을 기사에게 보여줘도 OK예요' },
  { id: 'p_koko_de_tomete', kana: 'ここでとめてください', kanji: 'ここで止めてください', displayKana: 'ここで、とめてください', korean: '여기서 세워 주세요', register: 'productive', tip: '「ここで止(と)めてください」— 목적지 근처에서 내릴 때. あそこで止めてください(저기서요)나 교차로를 가리켜도 OK. 정차 후 요금이 올라가는 경우가 있으니 미터를 확인해요' },
  { id: 'p_doko_made', kana: 'どこまでですか', displayKana: 'どこまでですか？', korean: '어디까지 가세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_ryoushuusho', kana: 'りょうしゅうしょをください', kanji: '領収書をください', korean: '영수증 주세요', register: 'productive', tip: '「領収書(りょうしゅうしょ)をください」— 택시 영수증은 경비 처리용 공식 영수증. 가게의 レシートとは違って 회사명·금액이 정식으로 기재돼요. 출장 시 필수예요' },

  // ── 식당 안전·실용 (알레르기·빼달라기) ──
  { id: 'p_arerugi', kana: 'そばとピーナッツアレルギーがあります', kanji: 'そばとピーナッツアレルギーがあります', displayKana: 'そばと、ピーナッツアレルギーが、あります', korean: '메밀·땅콩 알레르기가 있어요', register: 'productive', tip: '「アレルギーがあります」— 주문 전에 반드시 알리세요. 메밀(そば)·땅콩(ピーナッツ)·새우(えび)는 일본 식당에서 특히 주의 식재료예요. 중증 알레르기는 アレルギーカードを見せます라고 하면 점원이 더 신중하게 대응해요' },
  { id: 'p_kore_nuite', kana: 'これをぬいてください', kanji: 'これを抜いてください', korean: '이거 빼 주세요', register: 'productive', tip: '「これを抜(ぬ)いてください」— 특정 재료를 빼달라는 요청. 메뉴 사진에서 빼고 싶은 재료를 가리키며 쓰면 효과적이에요. 알레르기가 있을 때는 アレルギーがあります와 함께 써요' },

  // ── C5 거리·긴급 한마디 (여행 실전 — 화장실·사진·도움) ──
  { id: 'p_toire_doko', kana: 'トイレはどこですか', displayKana: 'トイレは、どこですか？', korean: '화장실 어디예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「トイレはどこですか」— お手洗(てあら)い라고도 해요. 일본의 역·백화점·편의점 화장실은 대부분 무료로 개방돼 있어요. 세계 최고 수준의 청결도를 자랑합니다!' },
  // C5 거리 실전 확장 — 목적지·방향·거리 묻기
  { id: 'p_chikai_desu_ka', kana: 'ここからちかいですか', kanji: 'ここから近いですか', displayKana: 'ここから、ちかいですか？', korean: '여기서 가까워요?', register: 'productive', tip: '「ここから近(ちか)いですか」— 목적지까지 거리를 가늠할 때. 멀면 遠(とお)いですか, 걸어갈 수 있냐고 물으면 歩(ある)いて行(い)けますか라고 해요' },
  { id: 'p_massugu_migi', kana: 'まっすぐいってふたつめのかどをみぎです', kanji: 'まっすぐ行って二つ目の角を右です', displayKana: 'まっすぐいって、ふたつめのかどをみぎです', korean: '쭉 가서 두 번째 모퉁이에서 오른쪽이에요', register: 'receptive' },
  { id: 'p_hidari_migi', kana: 'ひだりですかみぎですか', kanji: '左ですか、右ですか', displayKana: 'ひだりですか、みぎですか？', korean: '왼쪽이에요, 오른쪽이에요?', register: 'productive', tip: '「左(ひだり)ですか、右(みぎ)ですか」— 방향이 헷갈릴 때 확인. 손으로 방향을 가리키며 물으면 더 확실해요. まっすぐ=직진도 함께 기억하세요' },
  { id: 'p_aruite_nanpun', kana: 'あるいてなんぷんですか', kanji: '歩いて何分ですか', displayKana: 'あるいて、なんぷんですか？', korean: '걸어서 몇 분이에요?', register: 'productive', tip: '「歩(ある)いて何分(なんぷん)ですか」— 도보 소요 시간 확인. 멀면 電車(でんしゃ)とバス、どちらが早(はや)いですか로 교통편을 비교해봐요' },
  // C6 약국 실전 확장 — 증상 부연·알레르기/임신 확인
  { id: 'p_netsu_arimasu_ka', kana: 'ねつやせきはありますか', kanji: '熱や咳はありますか', displayKana: 'ねつや せきは、ありますか？', korean: '열이나 기침은 있으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_netsu_arimasu', kana: 'ねつがあります', kanji: '熱があります', korean: '열이 있어요', register: 'productive', tip: '「熱(ねつ)があります」— 체온 관련 증상. 몇 도인지 말하려면 「38度(さんじゅうはちど)あります」처럼 〇〇度(ど)を붙여요' },
  { id: 'p_seki_ga_demasu', kana: 'せきがでます', kanji: '咳が出ます', korean: '기침이 나요', register: 'productive', tip: '「咳(せき)が出(で)ます」— 기침 증상. 콧물은 「鼻水(はなみず)が出ます」, 목 아픔은 「のどが痛(いた)いです」로 응용해요' },
  { id: 'p_arerugi_ninshin', kana: 'アレルギーやにんしんはありませんか', kanji: 'アレルギーや妊娠はありませんか', displayKana: 'アレルギーや にんしんは、ありませんか？', korean: '알레르기나 임신 중은 아니세요?', register: 'receptive' },
  { id: 'p_ninshin_chuu', kana: 'にんしんちゅうです', kanji: '妊娠中です', korean: '임신 중이에요', register: 'productive', tip: '「妊娠中(にんしんちゅう)です」— 임신 중에는 복용 가능한 약이 제한돼요. 약사에게 반드시 알려야 안전한 약을 골라줘요' },
  // C7 쇼핑 실전 확장 — 사이즈/색·시착 후·포장
  { id: 'p_saizu_ikaga', kana: 'サイズはいかがですか', displayKana: 'サイズは、いかがですか？', korean: '사이즈는 어떠세요?', register: 'receptive' },
  { id: 'p_ikaga_desu_ka', kana: 'いかがですか', displayKana: 'いかがですか？', korean: '(입어보니) 어떠세요?', register: 'receptive' },
  { id: 'p_otsutsumi_shimasu_ka', kana: 'おつつみしますか', kanji: 'お包みしますか', displayKana: 'おつつみ、しますか？', korean: '포장해 드릴까요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  // C8 택시 실전 확장 — 짐·경로·요금
  { id: 'p_nimotsu_arimasu_ka', kana: 'おにもつはありますか', kanji: 'お荷物はありますか', displayKana: 'おにもつは、ありますか？', korean: '짐 있으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_kousoku_tsukaimasu_ka', kana: 'こうそくをつかってもいいですか', kanji: '高速を使ってもいいですか', displayKana: 'こうそくを、つかってもいいですか？', korean: '고속도로 이용해도 될까요?', register: 'receptive' },
  { id: 'p_ippan_michi_de', kana: 'いっぱんどうでおねがいします', kanji: '一般道でお願いします', displayKana: 'いっぱんどうで、おねがいします', korean: '일반도로로 가주세요', register: 'productive', tip: '「一般道(いっぱんどう)でお願(ねが)いします」— 고속도로 요금을 아끼려면 일반도로로. 급하면 반대로 「高速(こうそく)でお願いします」라고 해요' },
  { id: 'p_ryoukin_ni_narimasu', kana: 'せんはっぴゃくえんになります', kanji: '千八百円になります', displayKana: 'せんはっぴゃくえんに、なります', korean: '1800엔입니다', register: 'receptive' },
  { id: 'p_shashin_ii', kana: 'しゃしんとってもいいですか', kanji: '写真撮ってもいいですか', displayKana: 'しゃしん、とってもいいですか？', korean: '사진 찍어도 돼요?', register: 'productive', tip: '「写真(しゃしん)撮(と)ってもいいですか」— 촬영 전 허가 확인은 매너예요. 절·신사 내부는 撮影禁止(さつえいきんし) 구역이 있으니 주의하세요' },
  { id: 'p_shashin_onegai', kana: 'しゃしんおねがいします', kanji: '写真お願いします', displayKana: 'しゃしん、おねがいします', korean: '사진 부탁드려요', register: 'productive', tip: '「写真(しゃしん)お願(ねが)いします」— 스마트폰이나 카메라를 건네며 쓰면 OK. 일본인은 대체로 친절하게 찍어줘요. ありがとうございます로 감사 표시도 잊지 마세요' },
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
  { id: 'p_atatamemasu_ka', kana: 'あたためますか', kanji: '温めますか', displayKana: 'あたためますか？', korean: '데워드릴까요?', register: 'receptive', grammarRefs: ['g_masuka'], speechPhoneme: 'アタタメマスカ' },

  // ── C2 식당 실사용 보강: 자리 안내 + 계산 마무리 ──
  { id: 'p_nanmeisama', kana: 'なんめいさまですか', kanji: '何名様ですか', displayKana: 'なんめいさまですか？', korean: '몇 분이세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_hitori_desu', kana: 'ひとりです', kanji: '一人です', korean: '한 명이요', register: 'productive', tip: '「一人(ひとり)です」— 혼밥(一人飯/ひとりめし) 문화가 발달한 일본. 혼자 식당에 들어가도 전혀 어색하지 않아요. お一人様(おひとりさま)席도 따로 마련된 곳이 많아요' },
  { id: 'p_futari_desu', kana: 'ふたりです', kanji: '二人です', korean: '두 명이요', register: 'productive', tip: '「二人(ふたり)です」— 입구에서 인원을 물을 때 답하는 표현. 세 명이면 三人(さんにん), 네 명이면 四人(よにん)으로 응용할 수 있어요. 人数(にんずう)는 사람 수를 세는 단어예요' },
  { id: 'p_gochisousama', kana: 'ごちそうさまでした', korean: '잘 먹었습니다', register: 'productive', tip: '「ごちそうさまでした」— 식사 후 반드시 해야 하는 인사. 계산 시 자연스럽게 곁들이면 점원에게 좋은 인상을 줘요. 한국의 "잘 먹었습니다"와 문화적으로 동일한 표현이에요' },

  // ── C4 호텔 체크인 ──
  { id: 'p_checkin_onegai', kana: 'チェックインおねがいします', kanji: 'チェックインお願いします', displayKana: 'チェックイン、おねがいします', korean: '체크인 부탁드립니다', register: 'productive', tip: '「チェックインお願(ねが)いします」— 호텔에 도착하면 첫 마디. 영어 check-in을 그대로 외래어로 쓰는 표현이에요. 여권과 예약 확인서를 미리 준비해두면 빠르게 진행돼요' },
  { id: 'p_yoyaku_shiteimasu', kana: 'よやくしています', kanji: '予約しています', korean: '예약했습니다', register: 'productive', tip: '「予約(よやく)しています」— 예약했음을 알리는 한 마디. 이름을 말하거나 예약 확인 화면을 보여주면 더 빠르게 체크인이 돼요. 야국·레스토랑에서도 쓸 수 있어요' },
  { id: 'p_onamae_wa', kana: 'おなまえは', kanji: 'お名前は', displayKana: 'おなまえは？', korean: '성함은요?', register: 'receptive' },
  { id: 'p_passport_onegai', kana: 'パスポートおねがいします', kanji: 'パスポートお願いします', displayKana: 'パスポート、おねがいします', korean: '여권 부탁드립니다', register: 'receptive' },
  { id: 'p_kagi_desu', kana: 'かぎです', kanji: '鍵です', korean: '키입니다', register: 'receptive' },
  { id: 'p_heya_doko', kana: 'へやはどこですか', kanji: '部屋はどこですか', displayKana: 'へやは、どこですか？', korean: '방은 어디예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「部屋(へや)はどこですか」— 키(カードキー)를 받은 후 방 위치를 물을 때. エレベーター・○階(かい)・右(みぎ)/左(ひだり)와 함께 알아두면 안내를 따라가기 쉬워요' },
  { id: 'p_wifi_arimasu_ka', kana: 'ワイファイはありますか', kanji: 'Wi-Fiはありますか', displayKana: 'ワイファイは、ありますか？', korean: '와이파이는 있나요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「Wi-Fiはありますか」— 일본 호텔은 대부분 무료 Wi-Fi 제공. パスワード(ぱすわーど)はなんですか라고 비밀번호도 함께 물어봐요' },
  { id: 'p_choushoku_wa', kana: 'ちょうしょくは', kanji: '朝食は', displayKana: 'ちょうしょくは？', korean: '조식은요?', register: 'productive', tip: '「朝食(ちょうしょく)は？」— 조식 포함 여부와 시간을 확인할 때. 일본 호텔 조식 뷔페(バイキング)는 和食(わしょく)·洋食(ようしょく) 모두 제공하는 경우가 많아요' },

  // ── C14~C30 장면별 상대 대사 + 범용 응답 ──
  { id: 'p_kochira_de_meshiagarimasu_ka', kana: 'こちらでめしあがりますか', kanji: 'こちらで召し上がりますか', displayKana: 'こちらで、めしあがりますか？', korean: '매장에서 드시나요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_saizu_wa_dou_shimasu_ka', kana: 'サイズはどうしますか', kanji: 'サイズはどうしますか', displayKana: 'サイズは、どうしますか？', korean: '사이즈는 어떻게 하시겠어요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_oatame_shimasu_ka', kana: 'おあたためしますか', kanji: 'お温めしますか', displayKana: 'おあたためしますか？', korean: '데워 드릴까요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_dore_ni_shimasu_ka', kana: 'どれにしますか', kanji: 'どれにしますか', displayKana: 'どれにしますか？', korean: '어느 것으로 하시겠어요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_fukuro_otsuke_shimasu_ka', kana: 'ふくろおつけしますか', kanji: '袋お付けしますか', displayKana: 'ふくろ、おつけしますか？', korean: '봉투 넣어 드릴까요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  // C15 빵집 실전 확장 — 갓 구운 빵 추천·따로 포장
  { id: 'p_yakitate_desu', kana: 'こちらはやきたてですよ', kanji: 'こちらは焼きたてですよ', displayKana: 'こちらは、やきたてですよ', korean: '이건 갓 구운 거예요', register: 'receptive' },
  { id: 'p_betsubetsu_tsutsumi', kana: 'べつべつにつつみますか', kanji: '別々に包みますか', displayKana: 'べつべつに、つつみますか？', korean: '따로따로 포장해 드릴까요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_okaikei_wa_sennihyakuen_desu', kana: 'おかいけいはせんにひゃくえんです', kanji: 'お会計は千二百円です', displayKana: 'おかいけいは、せんにひゃくえんです。', korean: '계산은 1200엔입니다', register: 'receptive' },
  { id: 'p_yoyaku_wa_arimasu_ka', kana: 'よやくはありますか', kanji: '予約はありますか', displayKana: 'よやくは、ありますか？', korean: '예약하셨나요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_nomimono_wa_dou_shimasu_ka', kana: 'おのみものはどうしますか', kanji: 'お飲み物はどうしますか', displayKana: 'おのみものは、どうしますか？', korean: '음료는 어떻게 하시겠어요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_rasuto_ooda_desu', kana: 'ラストオーダーです', kanji: 'ラストオーダーです', korean: '마지막 주문입니다', register: 'receptive' },
  { id: 'p_kauntaa_de_yoroshii_desu_ka', kana: 'カウンターでよろしいですか', kanji: 'カウンターでよろしいですか', displayKana: 'カウンターで、よろしいですか？', korean: '카운터석 괜찮으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_nigate_na_mono_arimasu_ka', kana: 'にがてなものはありますか', kanji: '苦手なものはありますか', displayKana: 'にがてなものは、ありますか？', korean: '못 드시는 것이 있나요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_sabi_wa_daijoubu_desu_ka', kana: 'さびはだいじょうぶですか', kanji: 'さびは大丈夫ですか', displayKana: 'さびは、だいじょうぶですか？', korean: '와사비 괜찮으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_nanika_osagashi_desu_ka', kana: 'なにかおさがしですか', kanji: '何かお探しですか', displayKana: 'なにか、おさがしですか？', korean: '무엇을 찾고 계세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_chiketto_wa_kochira_desu', kana: 'チケットはこちらです', kanji: 'チケットはこちらです', korean: '티켓은 이쪽입니다', register: 'both' },
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
  { id: 'p_basho_o_oshiete_kudasai', kana: 'ばしょをおしえてください', kanji: '場所を教えてください', displayKana: 'ばしょを、おしえてください。', korean: '장소를 알려 주세요', register: 'both' },
  { id: 'p_dono_puran_ni_shimasu_ka', kana: 'どのプランにしますか', kanji: 'どのプランにしますか', displayKana: 'どのプランにしますか？', korean: '어떤 요금제로 하시겠어요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_pasupooto_kakunin_shimasu', kana: 'パスポートをかくにんします', kanji: 'パスポートを確認します', korean: '여권을 확인하겠습니다', register: 'receptive' },
  { id: 'p_settei_o_tetsudaimasu', kana: 'せっていをてつだいます', kanji: '設定を手伝います', korean: '설정을 도와드리겠습니다', register: 'receptive' },
  { id: 'p_senntakuki_wa_kochira_desu', kana: 'せんたくきはこちらです', kanji: '洗濯機はこちらです', korean: '세탁기는 이쪽입니다', register: 'receptive' },
  { id: 'p_senzai_wa_jidou_desu', kana: 'せんざいはじどうです', kanji: '洗剤は自動です', korean: '세제는 자동 투입입니다', register: 'receptive' },
  { id: 'p_kanryou_made_sanjuppun_desu', kana: 'かんりょうまでさんじゅっぷんです', kanji: '完了まで三十分です', displayKana: 'かんりょうまで、さんじゅっぷんです。', korean: '완료까지 30분입니다', register: 'receptive' },
  { id: 'p_nanmai_desu_ka', kana: 'なんまいですか', kanji: '何枚ですか', displayKana: 'なんまいですか？', korean: '몇 장인가요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_kore_hitotsu_de_yoroshii_desu_ka', kana: 'これひとつでよろしいですか', kanji: 'これ一つでよろしいですか', displayKana: 'これひとつで、よろしいですか？', korean: '이거 하나로 괜찮으세요?', register: 'receptive', grammarRefs: ['g_masuka'] },
  { id: 'p_iriguchi_wa_migi_desu', kana: 'いりぐちはみぎです', kanji: '入口は右です', korean: '입구는 오른쪽입니다', register: 'receptive' },
  { id: 'p_tennai_de', kana: 'てんないで', kanji: '店内で', korean: '매장에서요', register: 'productive', tip: '「店内(てんない)で」— 카페·식당에서 매장 이용을 선택할 때. 도자기 컵으로 서비스되는 경우가 많아 환경에도 좋고 분위기도 느낄 수 있어요' },
  { id: 'p_mochikaeri_de', kana: 'もちかえりで', kanji: '持ち帰りで', korean: '포장으로요', register: 'productive', tip: '「持(も)ち帰(かえ)りで」— 포장 주문 선택. テイクアウトで라고도 해요. 포장 시 종이컵이나 비닐 용기로 제공되며 가격이 다른 경우도 있어요' },
  { id: 'p_esu_saizu_de', kana: 'エスサイズで', kanji: 'Sサイズで', korean: 'S 사이즈로요', register: 'productive', tip: '「Sサイズで」— 사이즈 선택 표현. 일본 카페의 S 사이즈는 한국보다 작은 경우가 있어요. レギュラー·ラージ 등 가게마다 이름이 달라 메뉴판을 확인해요' },
  { id: 'p_emu_saizu_de', kana: 'エムサイズで', kanji: 'Mサイズで', korean: 'M 사이즈로요', register: 'productive', tip: '「Mサイズで」— 보통 사이즈 선택. 사이즈 차이를 물어보고 싶으면 違(ちが)いは何(なに)ですか라고 해봐요' },
  // C14 카페 실전 확장 — 따뜻/아이스·커스텀
  { id: 'p_hot_ice_dochira', kana: 'ホットとアイスどちらにしますか', kanji: 'ホットとアイス、どちらにしますか', displayKana: 'ホットとアイス、どちらにしますか？', korean: '따뜻한 것과 아이스 중 어느 걸로 하시겠어요?', register: 'receptive' },
  { id: 'p_hotto_de', kana: 'ホットで', korean: '따뜻한 걸로요', register: 'productive', tip: '「ホットで」— 따뜻한 음료 선택. hot의 일본식 표기예요. 반대는 アイス(아이스). 겨울엔 あたたかいの로도 통해요' },
  { id: 'p_aisu_de', kana: 'アイスで', korean: '차가운 걸로요', register: 'productive', tip: '「アイスで」— 차가운 음료 선택. ice의 일본식 표기. 얼음 적게는 氷(こおり)少(すく)なめで로 요청할 수 있어요' },
  { id: 'p_shotto_tsuika', kana: 'ショットついかでおねがいします', kanji: 'ショット追加でお願いします', displayKana: 'ショットついかで、おねがいします', korean: '샷 추가요', register: 'productive', tip: '「ショット追加(ついか)で」— 에스프레소 샷 추가. シロップ(시럽)·ミルク(우유) 변경도 「〇〇で」패턴으로 요청해요. 보통 50~100엔 추가예요' },
  { id: 'p_custom_arimasu', kana: 'カスタマイズはございますか', kanji: 'カスタマイズはございますか', displayKana: 'カスタマイズは、ございますか？', korean: '커스텀(변경) 있으세요?', register: 'receptive' },
  { id: 'p_nihon_go_muzukashii', kana: 'にほんごがむずかしいです', kanji: '日本語が難しいです', korean: '일본어가 어려워요', register: 'productive', tip: '「日本語(にほんご)が難(むずか)しいです」— 솔직하게 표현하면 상대방이 더 쉽게 말해줘요. でも、少(すこ)しずつ練習中(れんしゅうちゅう)です를 붙이면 훨씬 호감을 줘요!' },
  { id: 'p_kippu_nimai_kudasai', kana: 'きっぷをにまいください', kanji: '切符を二枚ください', korean: '표 두 장 주세요', register: 'productive', tip: '「切符(きっぷ)を二枚(にまい)ください」— 티켓·종이류는 枚(まい)로 셉니다. 一枚(いちまい), 二枚(にまい), 三枚(さんまい)로 응용해요. 매수는 数字+枚 기억!' },
  { id: 'p_sumimasen_koko_doko', kana: 'すみませんここはどこですか', kanji: 'すみません、ここはどこですか', displayKana: 'すみません、ここはどこですか？', korean: '실례합니다, 여기가 어디예요?', register: 'productive', grammarRefs: ['g_masuka'], tip: '「すみません、ここはどこですか」— 길을 잃었을 때 구조 요청. スマートフォンの地図(ちず)を一緒に見(み)せると 위치를 더 빠르게 확인할 수 있어요' },
  { id: 'p_nihongo_sukoshi_dake', kana: 'にほんごはすこしだけです', kanji: '日本語は少しだけです', korean: '일본어는 조금만 할 수 있어요', register: 'productive', tip: '「日本語(にほんご)は少(すこ)しだけです」— 솔직하게 실력을 알리면 상대방이 더 천천히, 쉽게 말해줘요. 일본인은 노력하는 외국인에게 친절하게 대해줘요' },
];
