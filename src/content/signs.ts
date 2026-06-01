// 거리 읽기 — 일본에서 눈에 띄는 실제 표기(간판·메뉴·안내·광고). 보고 뜻을 아는 게 목표.
export interface Sign {
  id: string;
  ja: string;       // 실제 표기 (한자·가타카나 포함)
  kana: string;     // 읽기
  korean: string;   // 뜻
  category: '표지' | '메뉴' | '안내' | '교통';
}

export const signs: Sign[] = [
  // ── 표지·시설 ──
  { id: 'deguchi', ja: '出口', kana: 'でぐち', korean: '출구', category: '표지' },
  { id: 'iriguchi', ja: '入口', kana: 'いりぐち', korean: '입구', category: '표지' },
  { id: 'osu', ja: '押', kana: 'おす', korean: '미세요', category: '표지' },
  { id: 'hiku', ja: '引', kana: 'ひく', korean: '당기세요', category: '표지' },
  { id: 'otearai', ja: 'お手洗い', kana: 'おてあらい', korean: '화장실', category: '표지' },
  { id: 'kaisatsu', ja: '改札口', kana: 'かいさつぐち', korean: '개찰구', category: '표지' },
  { id: 'hijouguchi', ja: '非常口', kana: 'ひじょうぐち', korean: '비상구', category: '표지' },
  { id: 'uketsuke', ja: '受付', kana: 'うけつけ', korean: '접수처', category: '표지' },
  { id: 'annai', ja: '案内', kana: 'あんない', korean: '안내', category: '표지' },
  { id: 'eigyouchu', ja: '営業中', kana: 'えいぎょうちゅう', korean: '영업 중', category: '표지' },
  { id: 'junbichu', ja: '準備中', kana: 'じゅんびちゅう', korean: '준비 중', category: '표지' },
  { id: 'kinen', ja: '禁煙', kana: 'きんえん', korean: '금연', category: '표지' },
  { id: 'tachiiri', ja: '立入禁止', kana: 'たちいりきんし', korean: '출입 금지', category: '표지' },
  { id: 'koshouchu', ja: '故障中', kana: 'こしょうちゅう', korean: '고장(사용 불가)', category: '표지' },

  // ── 메뉴·음식 ──
  { id: 'teishoku', ja: '定食', kana: 'ていしょく', korean: '정식(세트)', category: '메뉴' },
  { id: 'oomori_menu', ja: '大盛り', kana: 'おおもり', korean: '곱빼기', category: '메뉴' },
  { id: 'osusume_menu', ja: 'おすすめ', kana: 'おすすめ', korean: '추천', category: '메뉴' },
  { id: 'honjitsu', ja: '本日', kana: 'ほんじつ', korean: '오늘', category: '메뉴' },
  { id: 'lunch', ja: 'ランチ', kana: 'ランチ', korean: '런치(점심)', category: '메뉴' },
  { id: 'nomihoudai', ja: '飲み放題', kana: 'のみほうだい', korean: '음료 무한리필', category: '메뉴' },
  { id: 'tabehoudai', ja: '食べ放題', kana: 'たべほうだい', korean: '음식 무한리필', category: '메뉴' },
  { id: 'zeikomi', ja: '税込', kana: 'ぜいこみ', korean: '세금 포함', category: '메뉴' },
  { id: 'mochikaeri', ja: 'お持ち帰り', kana: 'おもちかえり', korean: '포장(테이크아웃)', category: '메뉴' },
  { id: 'urikire', ja: '売り切れ', kana: 'うりきれ', korean: '품절', category: '메뉴' },
  { id: 'gentei_menu', ja: '数量限定', kana: 'すうりょうげんてい', korean: '수량 한정', category: '메뉴' },

  // ── 안내·광고 ──
  { id: 'hangaku', ja: '半額', kana: 'はんがく', korean: '반값', category: '안내' },
  { id: 'waribiki', ja: '割引', kana: 'わりびき', korean: '할인', category: '안내' },
  { id: 'muryou', ja: '無料', kana: 'むりょう', korean: '무료', category: '안내' },
  { id: 'sale', ja: 'セール', kana: 'セール', korean: '세일', category: '안내' },
  { id: 'shinhatsubai', ja: '新発売', kana: 'しんはつばい', korean: '신발매', category: '안내' },
  { id: 'kikan_gentei', ja: '期間限定', kana: 'きかんげんてい', korean: '기간 한정', category: '안내' },
  { id: 'zenpin', ja: '全品', kana: 'ぜんぴん', korean: '전 품목', category: '안내' },
  { id: 'tasuku', ja: '無料Wi-Fi', kana: 'むりょうWi-Fi', korean: '무료 와이파이', category: '안내' },

  // ── 교통·길 ──
  { id: 'kakueki', ja: '各駅停車', kana: 'かくえきていしゃ', korean: '각역 정차(완행)', category: '교통' },
  { id: 'kyuukou', ja: '急行', kana: 'きゅうこう', korean: '급행', category: '교통' },
  { id: 'tokkyuu', ja: '特急', kana: 'とっきゅう', korean: '특급', category: '교통' },
  { id: 'noriba', ja: 'のりば', kana: 'のりば', korean: '타는 곳(승강장)', category: '교통' },
  { id: 'norikae_sign', ja: '乗り換え', kana: 'のりかえ', korean: '환승', category: '교통' },
  { id: 'kitaguchi', ja: '北口', kana: 'きたぐち', korean: '북쪽 출구', category: '교통' },
  { id: 'minamiguchi', ja: '南口', kana: 'みなみぐち', korean: '남쪽 출구', category: '교통' },
  { id: 'higashiguchi', ja: '東口', kana: 'ひがしぐち', korean: '동쪽 출구', category: '교통' },
  { id: 'nishiguchi', ja: '西口', kana: 'にしぐち', korean: '서쪽 출구', category: '교통' },
];
