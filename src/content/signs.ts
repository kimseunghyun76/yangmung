// 거리 읽기 — 일본에서 눈에 띄는 실제 표기(간판·메뉴·안내·광고). 보고 뜻을 아는 게 목표.
export interface Sign {
  id: string;
  ja: string;       // 실제 표기 (한자·가타카나 포함)
  kana: string;     // 읽기
  korean: string;   // 뜻
  category: '표지' | '메뉴' | '안내' | '교통' | '결제' | '주의';
  tip?: string;      // 어디서 자주 보는지, 표기 맥락
}

export type SignScene =
  | 'restroom'
  | 'mallEntrance'
  | 'stationWayfinding'
  | 'construction'
  | 'transitBoard'
  | 'shopNotice'
  | 'receipt'
  | 'restaurantMenu'
  | 'checkout'
  | 'storePromo';

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
  { id: 'zeikomi', ja: '税込', kana: 'ぜいこみ', korean: '세금 포함', category: '결제', tip: '영수증이나 가격표에서 세금이 포함된 금액이라는 뜻으로 자주 보여요.' },
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

  // ── 결제·자판기·시설 ──
  { id: 'genkin_sign', ja: '現金', kana: 'げんきん', korean: '현금', category: '결제' },
  { id: 'card_taiou', ja: 'カード対応', kana: 'カードたいおう', korean: '카드 가능', category: '결제' },
  { id: 'koutsuukei', ja: '交通系IC', kana: 'こうつうけいアイシー', korean: '교통카드(Suica 등)', category: '결제' },
  { id: 'tsurisen', ja: 'つり銭', kana: 'つりせん', korean: '거스름돈', category: '결제' },
  { id: 'ryougae_sign', ja: '両替', kana: 'りょうがえ', korean: '환전/잔돈 교환', category: '결제' },
  { id: 'baiten', ja: '売店', kana: 'ばいてん', korean: '매점', category: '결제' },
  { id: 'eigyoujikan', ja: '営業時間', kana: 'えいぎょうじかん', korean: '영업시간', category: '결제' },
  { id: 'teikyuubi', ja: '定休日', kana: 'ていきゅうび', korean: '정기 휴일', category: '안내', tip: '가게 입구에 붙은 휴무 안내에서 자주 보는 표기예요.' },
  { id: 'rinji_kyuugyou', ja: '臨時休業', kana: 'りんじきゅうぎょう', korean: '임시 휴업', category: '안내', tip: '가게가 예정에 없던 휴무일 때 입구 안내문에 붙는 표현이에요.' },
  { id: 'manshitsu', ja: '満室', kana: 'まんしつ', korean: '만실(방 없음)', category: '결제' },
  { id: 'kuushitsu', ja: '空室', kana: 'くうしつ', korean: '빈방 있음', category: '결제' },

  // ── 주의·경고 ──
  { id: 'chuui', ja: '注意', kana: 'ちゅうい', korean: '주의', category: '주의' },
  { id: 'kiken', ja: '危険', kana: 'きけん', korean: '위험', category: '주의' },
  { id: 'ashimoto', ja: '足元注意', kana: 'あしもとちゅうい', korean: '발밑 주의', category: '주의' },
  { id: 'koujichu', ja: '工事中', kana: 'こうじちゅう', korean: '공사 중', category: '주의' },
  { id: 'satsuei_kinshi', ja: '撮影禁止', kana: 'さつえいきんし', korean: '촬영 금지', category: '주의' },
  { id: 'shizukani', ja: 'お静かに', kana: 'おしずかに', korean: '조용히', category: '주의' },
  { id: 'ichiji_teishi', ja: '一時停止', kana: 'いちじていし', korean: '일단 정지', category: '주의' },
  { id: 'tachiiri_kinshi2', ja: '関係者以外立入禁止', kana: 'かんけいしゃいがいたちいりきんし', korean: '관계자 외 출입 금지', category: '주의' },

  // ── 메뉴 추가 ──
  { id: 'tanpin', ja: '単品', kana: 'たんぴん', korean: '단품', category: '메뉴' },
  { id: 'set_menu', ja: 'セット', kana: 'セット', korean: '세트', category: '메뉴' },
  { id: 'karakuchi', ja: '辛口', kana: 'からくち', korean: '매운맛', category: '메뉴' },
  { id: 'amakuchi', ja: '甘口', kana: 'あまくち', korean: '순한맛', category: '메뉴' },
  { id: 'tsumetai', ja: '冷たい', kana: 'つめたい', korean: '차가운', category: '메뉴' },
  { id: 'atatakai', ja: '温かい', kana: 'あたたかい', korean: '따뜻한', category: '메뉴' },

  // ── 메뉴·음식 추가 ──
  { id: 'niku_menu', ja: '肉', kana: 'にく', korean: '고기', category: '메뉴' },
  { id: 'sakana_menu', ja: '魚', kana: 'さかな', korean: '생선', category: '메뉴' },
  { id: 'yasai_menu', ja: '野菜', kana: 'やさい', korean: '채소', category: '메뉴' },
  { id: 'nashi_menu', ja: 'なし', kana: 'なし', korean: '없음(재료 제외)', category: '메뉴' },
  { id: 'allergy', ja: 'アレルギー', kana: 'アレルギー', korean: '알레르기', category: '메뉴' },
  { id: 'vege', ja: 'ベジタリアン', kana: 'ベジタリアン', korean: '채식', category: '메뉴' },
  { id: 'halal', ja: 'ハラール', kana: 'ハラール', korean: '할랄', category: '메뉴' },
  { id: 'refill', ja: 'おかわり自由', kana: 'おかわりじゆう', korean: '리필 자유', category: '메뉴' },
  { id: 'last_order', ja: 'ラストオーダー', kana: 'ラストオーダー', korean: '라스트 오더', category: '메뉴' },
  { id: 'tsugi_no_kata', ja: '次の方どうぞ', kana: 'つぎのかたどうぞ', korean: '다음 분 오세요', category: '안내' },

  // ── 표지·시설 추가 ──
  { id: 'men_toilet', ja: '男性', kana: 'だんせい', korean: '남성(화장실)', category: '표지' },
  { id: 'women_toilet', ja: '女性', kana: 'じょせい', korean: '여성(화장실)', category: '표지' },
  { id: 'danshi', ja: '男', kana: 'おとこ', korean: '남(남자)', category: '표지' },
  { id: 'josei', ja: '女', kana: 'おんな', korean: '여(여자)', category: '표지' },
  { id: 'shokuji', ja: '食事', kana: 'しょくじ', korean: '식사', category: '표지' },
  { id: 'kaigi', ja: '会議室', kana: 'かいぎしつ', korean: '회의실', category: '표지' },
  { id: 'locker_sign', ja: 'コインロッカー', kana: 'コインロッカー', korean: '코인로커', category: '표지' },
  { id: 'kintsuen', ja: '喫煙所', kana: 'きつえんじょ', korean: '흡연 구역', category: '표지' },
  { id: 'floor_sign', ja: '〜階', kana: 'かい', korean: '~층', category: '표지' },
  { id: 'chikashitsu', ja: '地下', kana: 'ちか', korean: '지하', category: '표지' },
  { id: 'exit_floor', ja: '出口', kana: 'でぐち', korean: '출구(층)', category: '표지' },

  // ── 교통 추가 ──
  { id: 'terminal', ja: '終点', kana: 'しゅうてん', korean: '종착역', category: '교통' },
  { id: 'jikoku', ja: '時刻表', kana: 'じこくひょう', korean: '시각표', category: '교통' },
  { id: 'unchin', ja: '運賃', kana: 'うんちん', korean: '운임(교통 요금)', category: '교통' },
  { id: 'jiyuuseki', ja: '自由席', kana: 'じゆうせき', korean: '자유석', category: '교통' },
  { id: 'shitei_seki', ja: '指定席', kana: 'していせき', korean: '지정석', category: '교통' },
  { id: 'green_sha', ja: 'グリーン車', kana: 'グリーンしゃ', korean: '그린카(일등칸)', category: '교통' },
  { id: 'kinkyu_teishi', ja: '緊急停止', kana: 'きんきゅうていし', korean: '긴급 정지', category: '교통' },
  { id: 'chien', ja: '遅延', kana: 'ちえん', korean: '지연', category: '교통' },
  { id: 'untenkeshi', ja: '運転見合わせ', kana: 'うんてんみあわせ', korean: '운행 중단', category: '교통' },

  // ── 결제·쇼핑 추가 ──
  { id: 'menzei', ja: '免税', kana: 'めんぜい', korean: '면세', category: '결제' },
  { id: 'shohizei', ja: '消費税', kana: 'しょうひぜい', korean: '소비세(소비자 세금)', category: '결제' },
  { id: 'pointcard', ja: 'ポイントカード', kana: 'ポイントカード', korean: '포인트 카드', category: '결제' },
  { id: 'fukuro_yoru', ja: '袋', kana: 'ふくろ', korean: '봉투', category: '결제' },
  { id: 'receipt', ja: 'レシート', kana: 'レシート', korean: '영수증', category: '결제' },
  { id: 'nouki', ja: 'お会計', kana: 'おかいけい', korean: '계산(식당에서)', category: '결제' },

  // ── 주의·경고 추가 ──
  { id: 'nohumi', ja: '踏まないでください', kana: 'ふまないでください', korean: '밟지 마세요', category: '주의' },
  { id: 'nosmoke_area', ja: '禁煙エリア', kana: 'きんえんエリア', korean: '금연 구역', category: '주의' },
  { id: 'setsubi', ja: '工事中につき', kana: 'こうじちゅうにつき', korean: '공사 중으로 인해(통행·이용 제한 안내)', category: '주의', tip: '공사장 앞 안내문에서 뒤에 “통행할 수 없습니다”, “우회해 주세요” 같은 이유 설명이 이어지는 시작 표현이에요.' },
  { id: 'kiken_takaatsu', ja: '高電圧危険', kana: 'こうでんあつきけん', korean: '고전압 위험', category: '주의' },
  { id: 'hizashi', ja: '日差しに注意', kana: 'ひざしにちゅうい', korean: '햇볕 주의', category: '주의' },
  { id: 'kinshi_shinnyu', ja: '立入厳禁', kana: 'たちいりげんきん', korean: '출입 엄금', category: '주의' },

  // ── 안내 추가 ──
  { id: 'mannaka', ja: '中央', kana: 'ちゅうおう', korean: '중앙', category: '안내' },
  { id: 'kami', ja: '上', kana: 'うえ', korean: '위', category: '안내' },
  { id: 'shita', ja: '下', kana: 'した', korean: '아래', category: '안내' },
  { id: 'toiu_koto', ja: 'ただいま混雑中', kana: 'ただいまこんざつちゅう', korean: '지금 혼잡 중', category: '안내' },
  { id: 'go_annai', ja: 'ご案内', kana: 'ごあんない', korean: '안내 드립니다', category: '안내', tip: '역이나 공항 전광판·방송 안내에서 공지 제목처럼 보이는 표현이에요.' },
];

const hasId = (sign: Sign, ids: string[]) => ids.includes(sign.id);

export function signSceneFor(sign: Sign): SignScene {
  if (hasId(sign, ['men_toilet', 'women_toilet', 'danshi', 'josei', 'otearai'])) return 'restroom';
  if (hasId(sign, ['deguchi', 'iriguchi', 'osu', 'hiku', 'eigyouchu', 'junbichu', 'koshouchu', 'uketsuke', 'shokuji', 'kaigi', 'locker_sign', 'kintsuen', 'floor_sign', 'chikashitsu', 'exit_floor'])) return 'mallEntrance';
  if (hasId(sign, ['kaisatsu', 'hijouguchi', 'annai', 'kinen', 'kakueki', 'kyuukou', 'tokkyuu', 'noriba', 'norikae_sign', 'kitaguchi', 'minamiguchi', 'higashiguchi', 'nishiguchi', 'terminal', 'jikoku', 'unchin', 'jiyuuseki', 'shitei_seki', 'green_sha', 'kinkyu_teishi', 'mannaka', 'kami', 'shita'])) return 'stationWayfinding';
  if (hasId(sign, ['tachiiri', 'chuui', 'kiken', 'ashimoto', 'koujichu', 'satsuei_kinshi', 'ichiji_teishi', 'tachiiri_kinshi2', 'nohumi', 'nosmoke_area', 'setsubi', 'kiken_takaatsu', 'hizashi', 'kinshi_shinnyu'])) return 'construction';
  if (hasId(sign, ['chien', 'untenkeshi', 'toiu_koto', 'go_annai'])) return 'transitBoard';
  if (hasId(sign, ['teikyuubi', 'rinji_kyuugyou', 'eigyoujikan', 'manshitsu', 'kuushitsu', 'baiten'])) return 'shopNotice';
  if (hasId(sign, ['zeikomi', 'shohizei', 'receipt'])) return 'receipt';
  if (hasId(sign, ['genkin_sign', 'card_taiou', 'koutsuukei', 'tsurisen', 'ryougae_sign', 'menzei', 'pointcard', 'fukuro_yoru', 'nouki'])) return 'checkout';
  if (sign.category === '메뉴') return 'restaurantMenu';
  return 'storePromo';
}
