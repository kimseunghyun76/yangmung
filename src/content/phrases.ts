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
  { id: 'p_atatamete', kana: 'あたためてください', kanji: '温めてください', korean: '데워 주세요', register: 'productive' },

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

  // ── 응답 다양성 보강 ──
  { id: 'p_wakarimashita_arigatou', kana: 'わかりましたありがとうございます', kanji: '分かりました、ありがとうございます', displayKana: 'わかりました、ありがとうございます', korean: '알겠습니다, 감사합니다', register: 'productive', tip: '이해+감사를 한 번에 — 안내를 받은 뒤 자연스러운 마무리' },
];
