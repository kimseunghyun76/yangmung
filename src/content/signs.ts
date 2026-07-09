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
  { id: 'deguchi', ja: '出口', kana: 'でぐち', korean: '출구', category: '표지', tip: "역이나 상업시설 곳곳의 화살표 안내판에서 항상 붙어 다니는 표지예요." },
  { id: 'iriguchi', ja: '入口', kana: 'いりぐち', korean: '입구', category: '표지', tip: "가게나 건물 문 앞, 지하철역 통로 안내판에서 出口(출구)와 짝을 이뤄 자주 보여요." },
  { id: 'osu', ja: '押', kana: 'おす', korean: '미세요', category: '표지', tip: "자동문이 아닌 문 손잡이 옆에 붙어서 미는 방향을 알려주는 표지예요." },
  { id: 'hiku', ja: '引', kana: 'ひく', korean: '당기세요', category: '표지', tip: "문에 붙어서 당겨야 열리는 문임을 알려주는 표지로, 押(미세요)와 세트로 자주 봐요." },
  { id: 'otearai', ja: 'お手洗い', kana: 'おてあらい', korean: '화장실', category: '표지', tip: "레스토랑이나 백화점처럼 정중한 분위기의 시설에서 화장실을 가리킬 때 자주 쓰는 표현이에요." },
  { id: 'kaisatsu', ja: '改札口', kana: 'かいさつぐち', korean: '개찰구', category: '표지', tip: "지하철이나 JR역에서 표를 찍고 통과하는 게이트 앞에 크게 붙어 있어요." },
  { id: 'hijouguchi', ja: '非常口', kana: 'ひじょうぐち', korean: '비상구', category: '표지', tip: "건물이나 지하철 객차 안 초록색 사람 아이콘과 함께 붙어 있는 안전 표지예요." },
  { id: 'uketsuke', ja: '受付', kana: 'うけつけ', korean: '접수처', category: '표지', tip: "병원, 회사, 호텔 로비에서 처음 방문했을 때 말을 걸어야 할 창구를 알려줘요." },
  { id: 'annai', ja: '案内', kana: 'あんない', korean: '안내', category: '표지', tip: "역이나 관광지의 종합 안내소, 안내판 앞에 붙어 있는 표지예요." },
  { id: 'eigyouchu', ja: '営業中', kana: 'えいぎょうちゅう', korean: '영업 중', category: '표지', tip: "가게 문 앞에 걸려 있어서 지금 들어가도 되는지 바로 알 수 있게 해줘요." },
  { id: 'junbichu', ja: '準備中', kana: 'じゅんびちゅう', korean: '준비 중', category: '표지', tip: "가게가 아직 문을 열 준비 중이라 손님을 받지 않는다는 뜻으로 문 앞에 걸려요." },
  { id: 'kinen', ja: '禁煙', kana: 'きんえん', korean: '금연', category: '표지', tip: "식당이나 공공장소 입구에 담배 그림과 함께 붙어 흡연이 금지된 구역임을 알려줘요." },
  { id: 'tachiiri', ja: '立入禁止', kana: 'たちいりきんし', korean: '출입 금지', category: '표지', tip: "공사장이나 관계자 전용 구역 앞에서 안으로 들어가면 안 된다는 뜻으로 자주 보여요." },
  { id: 'koshouchu', ja: '故障中', kana: 'こしょうちゅう', korean: '고장(사용 불가)', category: '표지', tip: "자판기나 화장실 칸, 엘리베이터 등 기기가 고장 나서 못 쓸 때 붙는 안내예요." },

  // ── 메뉴·음식 ──
  { id: 'teishoku', ja: '定食', kana: 'ていしょく', korean: '정식(세트)', category: '메뉴', tip: "밥과 국, 반찬이 함께 나오는 식당 메뉴판에서 흔히 보이는 표현이에요." },
  { id: 'oomori_menu', ja: '大盛り', kana: 'おおもり', korean: '곱빼기', category: '메뉴', tip: "라멘집이나 덮밥집 메뉴판에서 밥이나 면 양을 늘릴 때 붙는 표현이에요." },
  { id: 'osusume_menu', ja: 'おすすめ', kana: 'おすすめ', korean: '추천', category: '메뉴', tip: "식당 메뉴판이나 칠판 메뉴에서 가게가 자신 있게 권하는 요리 옆에 붙어요." },
  { id: 'honjitsu', ja: '本日', kana: 'ほんじつ', korean: '오늘', category: '메뉴', tip: "식당 벽이나 칠판에 붙는 오늘의 메뉴 안내에서 자주 보이는 표현이에요." },
  { id: 'lunch', ja: 'ランチ', kana: 'ランチ', korean: '런치(점심)', category: '메뉴', tip: "가타카나로만 쓰는 외래어라 표기와 읽기가 같아요. 낮 시간대 한정 세트 메뉴 앞에 붙어요." },
  { id: 'nomihoudai', ja: '飲み放題', kana: 'のみほうだい', korean: '음료 무한리필', category: '메뉴', tip: "이자카야나 회식 코스 메뉴판에서 정해진 시간 동안 음료를 마음껏 마실 수 있을 때 붙어요." },
  { id: 'tabehoudai', ja: '食べ放題', kana: 'たべほうだい', korean: '음식 무한리필', category: '메뉴', tip: "야키니쿠집이나 뷔페 메뉴판에서 정해진 시간 동안 음식을 마음껏 먹을 수 있을 때 붙어요." },
  { id: 'zeikomi', ja: '税込', kana: 'ぜいこみ', korean: '세금 포함', category: '결제', tip: '영수증이나 가격표에서 세금이 포함된 금액이라는 뜻으로 자주 보여요.' },
  { id: 'mochikaeri', ja: 'お持ち帰り', kana: 'おもちかえり', korean: '포장(테이크아웃)', category: '메뉴', tip: "패스트푸드점 카운터에서 매장에서 먹을지 포장할지 물어볼 때 나오는 표현이에요." },
  { id: 'urikire', ja: '売り切れ', kana: 'うりきれ', korean: '품절', category: '메뉴', tip: "빵집이나 도시락 매대에서 상품이 다 팔렸을 때 상품명 위에 붙는 표시예요." },
  { id: 'gentei_menu', ja: '数量限定', kana: 'すうりょうげんてい', korean: '수량 한정', category: '메뉴', tip: "편의점이나 카페 신메뉴 안내에서 하루 판매 개수가 정해져 있을 때 붙는 표현이에요." },

  // ── 안내·광고 ──
  { id: 'hangaku', ja: '半額', kana: 'はんがく', korean: '반값', category: '안내', tip: "슈퍼·백화점 세일 매대에서 가격표 옆에 큼직하게 붙는 표현이에요. 半(반)+額(액수)가 합쳐진 말이에요." },
  { id: 'waribiki', ja: '割引', kana: 'わりびき', korean: '할인', category: '안내', tip: "쿠폰이나 세일 팻말에서 몇 % 할인인지와 함께 자주 보이는 표현이에요." },
  { id: 'muryou', ja: '無料', kana: 'むりょう', korean: '무료', category: '안내', tip: "시식 코너나 샘플, 무료 서비스 안내판에서 자주 마주치는 표현이에요." },
  { id: 'sale', ja: 'セール', kana: 'セール', korean: '세일', category: '안내', tip: "옷가게·잡화점 쇼윈도에 계절 세일 시즌마다 크게 붙는 안내예요." },
  { id: 'shinhatsubai', ja: '新発売', kana: 'しんはつばい', korean: '신발매', category: '안내', tip: "편의점·마트 신상품 진열대에 붙는 팝업 문구로, 갓 나온 상품임을 알려요." },
  { id: 'kikan_gentei', ja: '期間限定', kana: 'きかんげんてい', korean: '기간 한정', category: '안내', tip: "한정판이나 계절 메뉴, 이벤트 상품에 자주 붙어 서두르게 만드는 문구예요." },
  { id: 'zenpin', ja: '全品', kana: 'ぜんぴん', korean: '전 품목', category: '안내', tip: "매장 전체 세일 안내판에서 '전 품목 30% 할인'처럼 할인율과 함께 쓰여요." },
  { id: 'tasuku', ja: '無料Wi-Fi', kana: 'むりょうWi-Fi', korean: '무료 와이파이', category: '안내', tip: "카페나 역, 공항에서 무료 인터넷 접속을 안내할 때 붙는 표시예요." },

  // ── 교통·길 ──
  { id: 'kakueki', ja: '各駅停車', kana: 'かくえきていしゃ', korean: '각역 정차(완행)', category: '교통', tip: "노선도나 전광판에서 모든 역에 서는 열차임을 급행·특급과 구분해 알려줘요." },
  { id: 'kyuukou', ja: '急行', kana: 'きゅうこう', korean: '급행', category: '교통', tip: "역 전광판이나 노선도에서 일부 역을 건너뛰는 열차 종류를 나타내는 말이에요." },
  { id: 'tokkyuu', ja: '特急', kana: 'とっきゅう', korean: '특급', category: '교통', tip: "특급열차 승차권이나 역 안내판에서 급행보다 더 빠른 열차임을 나타내요." },
  { id: 'noriba', ja: 'のりば', kana: 'のりば', korean: '타는 곳(승강장)', category: '교통', tip: "버스 정류장이나 택시 승강장 표지판에서 어디서 타는지를 알려주는 표현이에요." },
  { id: 'norikae_sign', ja: '乗り換え', kana: 'のりかえ', korean: '환승', category: '교통', tip: "지하철·JR역 통로 천장에 매달린 표지판에서 갈아타는 노선을 안내할 때 쓰여요." },
  { id: 'kitaguchi', ja: '北口', kana: 'きたぐち', korean: '북쪽 출구', category: '교통', tip: "역 출구 표지판에서 방향별 출구를 구분할 때 쓰는 표현이에요." },
  { id: 'minamiguchi', ja: '南口', kana: 'みなみぐち', korean: '남쪽 출구', category: '교통', tip: "역 출구 표지판에서 남쪽 방향 출구를 가리킬 때 쓰는 표현이에요." },
  { id: 'higashiguchi', ja: '東口', kana: 'ひがしぐち', korean: '동쪽 출구', category: '교통', tip: "역 출구 표지판에서 동쪽 방향 출구를 가리킬 때 쓰는 표현이에요." },
  { id: 'nishiguchi', ja: '西口', kana: 'にしぐち', korean: '서쪽 출구', category: '교통', tip: "역 출구 표지판에서 서쪽 방향 출구를 가리킬 때 쓰는 표현이에요." },

  // ── 결제·자판기·시설 ──
  { id: 'genkin_sign', ja: '現金', kana: 'げんきん', korean: '현금', category: '결제', tip: "계산대 근처에서 카드나 전자결제 대신 현금으로만 결제 가능함을 안내할 때 보여요." },
  { id: 'card_taiou', ja: 'カード対応', kana: 'カードたいおう', korean: '카드 가능', category: '결제', tip: "가게 입구나 계산대에 붙어 신용카드 결제가 가능하다는 걸 미리 알려줘요." },
  { id: 'koutsuukei', ja: '交通系IC', kana: 'こうつうけいアイシー', korean: '교통카드(Suica 등)', category: '결제', tip: "역 개찰구나 편의점 계산대에서 스이카 같은 교통카드로 결제 가능함을 안내할 때 보여요." },
  { id: 'tsurisen', ja: 'つり銭', kana: 'つりせん', korean: '거스름돈', category: '결제', tip: "자판기나 계산대 근처에서 거스름돈이 나오는 곳을 가리킬 때 쓰는 표현이에요." },
  { id: 'ryougae_sign', ja: '両替', kana: 'りょうがえ', korean: '환전/잔돈 교환', category: '결제', tip: "역이나 코인 세탁소 근처에서 지폐를 동전으로 바꿔주는 기계나 창구에 붙는 표현이에요." },
  { id: 'baiten', ja: '売店', kana: 'ばいてん', korean: '매점', category: '결제', tip: "역이나 병원, 숙박시설 안에 있는 작은 상점을 가리킬 때 쓰는 표현이에요." },
  { id: 'eigyoujikan', ja: '営業時間', kana: 'えいぎょうじかん', korean: '영업시간', category: '결제', tip: "가게 입구나 안내판에서 하루 중 문을 여는 시간을 알려줄 때 쓰는 표현이에요." },
  { id: 'teikyuubi', ja: '定休日', kana: 'ていきゅうび', korean: '정기 휴일', category: '안내', tip: '가게 입구에 붙은 휴무 안내에서 자주 보는 표기예요.' },
  { id: 'rinji_kyuugyou', ja: '臨時休業', kana: 'りんじきゅうぎょう', korean: '임시 휴업', category: '안내', tip: '가게가 예정에 없던 휴무일 때 입구 안내문에 붙는 표현이에요.' },
  { id: 'manshitsu', ja: '満室', kana: 'まんしつ', korean: '만실(방 없음)', category: '결제', tip: "호텔이나 숙박시설 안내판에서 빈방이 없을 때 뜨는 표시예요." },
  { id: 'kuushitsu', ja: '空室', kana: 'くうしつ', korean: '빈방 있음', category: '결제', tip: "호텔이나 숙박시설 안내판에서 예약 가능한 방이 있을 때 뜨는 표시예요." },

  // ── 주의·경고 ──
  { id: 'chuui', ja: '注意', kana: 'ちゅうい', korean: '주의', category: '주의', tip: "주의가 필요한 장소나 상황에서 단독으로, 또는 다른 경고 문구 앞에 붙어 쓰여요." },
  { id: 'kiken', ja: '危険', kana: 'きけん', korean: '위험', category: '주의', tip: "공사 현장이나 고압 설비 근처처럼 실제로 다칠 수 있는 곳에 붉은 글씨로 자주 쓰여요." },
  { id: 'ashimoto', ja: '足元注意', kana: 'あしもとちゅうい', korean: '발밑 주의', category: '주의', tip: "계단이나 턱이 있는 바닥, 공사 구간에서 발을 헛디디지 않도록 붙는 안내예요." },
  { id: 'koujichu', ja: '工事中', kana: 'こうじちゅう', korean: '공사 중', category: '주의', tip: "도로나 건물 보수 작업이 진행 중인 곳에 세워진 표지판에서 자주 봐요." },
  { id: 'satsuei_kinshi', ja: '撮影禁止', kana: 'さつえいきんし', korean: '촬영 금지', category: '주의', tip: "미술관, 공연장, 매장 안에서 사진이나 동영상 촬영이 금지된 구역에 붙어요." },
  { id: 'shizukani', ja: 'お静かに', kana: 'おしずかに', korean: '조용히', category: '주의', tip: "도서관이나 병원 대기실처럼 조용히 해야 하는 공간에 부드러운 어조로 붙는 안내예요." },
  { id: 'ichiji_teishi', ja: '一時停止', kana: 'いちじていし', korean: '일단 정지', category: '주의', tip: "도로 표지판이나 건널목 앞에서 자동차·자전거가 완전히 멈춰야 함을 알려줘요." },
  { id: 'tachiiri_kinshi2', ja: '関係者以外立入禁止', kana: 'かんけいしゃいがいたちいりきんし', korean: '관계자 외 출입 금지', category: '주의', tip: '공사장·직원 전용 구역 입구에서 자주 보는 경고문이에요. 関係者(관계자)+以外(외)+立入禁止(출입금지)가 합쳐진 표현이에요.' },

  // ── 메뉴 추가 ──
  { id: 'tanpin', ja: '単品', kana: 'たんぴん', korean: '단품', category: '메뉴', tip: "세트 메뉴 옆에 함께 적혀 있어, 사이드 없이 그 요리만 따로 주문할 때 골라요." },
  { id: 'set_menu', ja: 'セット', kana: 'セット', korean: '세트', category: '메뉴', tip: "가타카나로만 쓰는 외래어라 표기와 읽기가 같아요. 메뉴판에서 여러 음식을 묶어 파는 상품에 붙어요." },
  { id: 'karakuchi', ja: '辛口', kana: 'からくち', korean: '매운맛', category: '메뉴', tip: "카레집이나 라멘집 메뉴판에서 맵기 단계를 고를 때 보이는 표현이에요." },
  { id: 'amakuchi', ja: '甘口', kana: 'あまくち', korean: '순한맛', category: '메뉴', tip: "카레집이나 된장·간장 제품 포장에서 맵지 않고 순한 맛을 가리킬 때 쓰여요." },
  { id: 'tsumetai', ja: '冷たい', kana: 'つめたい', korean: '차가운', category: '메뉴', tip: "음료 자판기나 메뉴판에서 차가운 상태로 나오는 것을 고를 때 보이는 표현이에요." },
  { id: 'atatakai', ja: '温かい', kana: 'あたたかい', korean: '따뜻한', category: '메뉴', tip: "음료 자판기나 메뉴판에서 따뜻하게 데워서 나오는 것을 고를 때 보이는 표현이에요." },

  // ── 메뉴·음식 추가 ──
  { id: 'niku_menu', ja: '肉', kana: 'にく', korean: '고기', category: '메뉴', tip: "덮밥집이나 정식집 메뉴판에서 주재료가 고기임을 나타낼 때 쓰는 표현이에요." },
  { id: 'sakana_menu', ja: '魚', kana: 'さかな', korean: '생선', category: '메뉴', tip: "정식집이나 이자카야 메뉴판에서 주재료가 생선임을 나타낼 때 쓰는 표현이에요." },
  { id: 'yasai_menu', ja: '野菜', kana: 'やさい', korean: '채소', category: '메뉴', tip: "메뉴판이나 라멘 토핑 목록에서 채소가 들어간 항목을 가리킬 때 쓰는 표현이에요." },
  { id: 'nashi_menu', ja: 'なし', kana: 'なし', korean: '없음(재료 제외)', category: '메뉴', tip: "라멘집이나 샌드위치 가게에서 특정 재료를 빼고 주문할 때 재료명 뒤에 붙여 써요." },
  { id: 'allergy', ja: 'アレルギー', kana: 'アレルギー', korean: '알레르기', category: '메뉴', tip: '가타카나로만 쓰는 외래어라 표기와 읽기가 같아요. 메뉴판·포장지에서 알레르기 유발 성분을 표시할 때 자주 보여요.' },
  { id: 'vege', ja: 'ベジタリアン', kana: 'ベジタリアン', korean: '채식', category: '메뉴', tip: "가타카나로만 쓰는 외래어라 표기와 읽기가 같아요. 메뉴판에서 육류·생선이 없는 음식을 표시할 때 보여요." },
  { id: 'halal', ja: 'ハラール', kana: 'ハラール', korean: '할랄', category: '메뉴', tip: "가타카나로만 쓰는 외래어라 표기와 읽기가 같아요. 관광지 식당 메뉴판에서 이슬람 율법에 맞는 음식임을 표시할 때 보여요." },
  { id: 'refill', ja: 'おかわり自由', kana: 'おかわりじゆう', korean: '리필 자유', category: '메뉴', tip: "정식집이나 카레집 메뉴판에서 밥이나 반찬을 추가 요금 없이 더 받을 수 있을 때 붙는 표현이에요." },
  { id: 'last_order', ja: 'ラストオーダー', kana: 'ラストオーダー', korean: '라스트 오더', category: '메뉴', tip: "가타카나로만 쓰는 외래어라 표기와 읽기가 같아요. 영업 종료 전 마지막 주문 마감 시간을 안내할 때 쓰여요." },
  { id: 'tsugi_no_kata', ja: '次の方どうぞ', kana: 'つぎのかたどうぞ', korean: '다음 분 오세요', category: '메뉴', tip: '백화점·병원 등 번호표를 뽑고 기다리는 곳에서 직원이 다음 손님을 부를 때 쓰는 말이에요.' },

  // ── 표지·시설 추가 ──
  { id: 'men_toilet', ja: '男性', kana: 'だんせい', korean: '남성(화장실)', category: '표지', tip: "화장실 입구에서 男(남자) 성별 구분 표지로 쓰이는 한자예요." },
  { id: 'women_toilet', ja: '女性', kana: 'じょせい', korean: '여성(화장실)', category: '표지', tip: "화장실 입구에서 女(여자) 성별 구분 표지로 쓰이는 한자예요." },
  { id: 'danshi', ja: '男', kana: 'おとこ', korean: '남(남자)', category: '표지', tip: "화장실이나 탈의실 입구에서 男性보다 더 짧게 줄여 쓴 남성용 표기예요." },
  { id: 'josei', ja: '女', kana: 'おんな', korean: '여(여자)', category: '표지', tip: "화장실이나 탈의실 입구에서 女性보다 더 짧게 줄여 쓴 여성용 표기예요." },
  { id: 'shokuji', ja: '食事', kana: 'しょくじ', korean: '식사', category: '표지', tip: "식당가 안내판이나 휴게 공간에서 식사가 가능한 장소임을 알릴 때 쓰여요." },
  { id: 'kaigi', ja: '会議室', kana: 'かいぎしつ', korean: '회의실', category: '표지', tip: "사무실 건물 복도에서 문 옆에 붙어 회의 중인 방을 표시할 때 쓰여요." },
  { id: 'locker_sign', ja: 'コインロッカー', kana: 'コインロッカー', korean: '코인로커', category: '표지', tip: "역이나 관광지에서 짐을 맡길 수 있는 동전 보관함 위치를 알려주는 표지예요." },
  { id: 'kintsuen', ja: '喫煙所', kana: 'きつえんじょ', korean: '흡연 구역', category: '표지', tip: "금연 구역이 늘어난 요즘 건물 한쪽에 따로 마련된 흡연 전용 공간을 가리켜요." },
  { id: 'floor_sign', ja: '〜階', kana: 'かい', korean: '~층', category: '표지', tip: "엘리베이터 버튼이나 건물 층 안내판에서 숫자 뒤에 붙어 몇 층인지 나타내요." },
  { id: 'chikashitsu', ja: '地下', kana: 'ちか', korean: '지하', category: '표지', tip: "백화점이나 역 안내판에서 지상보다 아래층, 지하상가 등을 가리킬 때 쓰여요." },

  // ── 교통 추가 ──
  { id: 'terminal', ja: '終点', kana: 'しゅうてん', korean: '종착역', category: '교통', tip: "노선도나 열차 행선지 표시에서 그 열차가 더 가지 않는 마지막 역을 뜻해요." },
  { id: 'jikoku', ja: '時刻表', kana: 'じこくひょう', korean: '시각표', category: '교통', tip: "역 게시판이나 버스 정류장에 붙은 열차·버스 출발 시간표를 가리키는 말이에요." },
  { id: 'unchin', ja: '運賃', kana: 'うんちん', korean: '운임(교통 요금)', category: '교통', tip: "버스나 택시 요금표, 승차권 자동판매기에서 지불할 금액을 안내할 때 쓰여요." },
  { id: 'jiyuuseki', ja: '自由席', kana: 'じゆうせき', korean: '자유석', category: '교통', tip: "신칸센이나 특급열차 승차권에서 자리 지정 없이 빈자리에 앉는 칸을 뜻해요." },
  { id: 'shitei_seki', ja: '指定席', kana: 'していせき', korean: '지정석', category: '교통', tip: "신칸센이나 특급열차 승차권에서 자리 번호가 정해진 칸을 뜻해요." },
  { id: 'green_sha', ja: 'グリーン車', kana: 'グリーンしゃ', korean: '그린카(일등칸)', category: '교통', tip: "신칸센이나 특급열차에서 추가 요금을 내고 타는 좌석이 넓은 고급 칸이에요." },
  { id: 'kinkyu_teishi', ja: '緊急停止', kana: 'きんきゅうていし', korean: '긴급 정지', category: '교통', tip: "열차 비상정지 버튼이나 안내방송에서 위급 상황에 즉시 멈춘다는 뜻으로 쓰여요." },
  { id: 'chien', ja: '遅延', kana: 'ちえん', korean: '지연', category: '교통', tip: "역 전광판이나 안내방송에서 열차가 예정보다 늦게 운행될 때 쓰이는 표현이에요." },
  { id: 'untenkeshi', ja: '運転見合わせ', kana: 'うんてんみあわせ', korean: '운행 중단', category: '교통', tip: "사고나 악천후로 열차 운행이 아예 멈췄을 때 역 전광판·방송에서 쓰이는 표현이에요." },

  // ── 결제·쇼핑 추가 ──
  { id: 'menzei', ja: '免税', kana: 'めんぜい', korean: '면세', category: '결제', tip: "공항이나 관광객이 많은 매장에서 외국인 대상으로 세금을 빼고 계산해줄 때 붙는 표현이에요." },
  { id: 'shohizei', ja: '消費税', kana: 'しょうひぜい', korean: '소비세(소비자 세금)', category: '결제', tip: "영수증이나 가격표에서 상품 가격에 더해지는 세금 항목을 가리킬 때 쓰는 표현이에요." },
  { id: 'pointcard', ja: 'ポイントカード', kana: 'ポイントカード', korean: '포인트 카드', category: '결제', tip: "가타카나로만 쓰는 외래어라 표기와 읽기가 같아요. 계산대에서 적립카드가 있는지 물어볼 때 자주 들려요." },
  { id: 'fukuro_yoru', ja: '袋', kana: 'ふくろ', korean: '봉투', category: '결제', tip: "편의점이나 슈퍼 계산대에서 봉투가 필요한지 물어볼 때 쓰는 표현이에요." },
  { id: 'receipt', ja: 'レシート', kana: 'レシート', korean: '영수증', category: '결제', tip: "가타카나로만 쓰는 외래어라 표기와 읽기가 같아요. 계산 후 점원이 건네주는 종이 영수증을 가리켜요." },
  { id: 'nouki', ja: 'お会計', kana: 'おかいけい', korean: '계산(식당에서)', category: '결제', tip: "식당에서 자리를 뜨기 전 점원에게 계산을 요청할 때 쓰는 표현이에요." },

  // ── 주의·경고 추가 ──
  { id: 'nohumi', ja: '踏まないでください', kana: 'ふまないでください', korean: '밟지 마세요', category: '주의', tip: "잔디밭이나 공사 자재, 수리 중인 바닥 앞에서 밟지 말라고 정중하게 부탁하는 표현이에요." },
  { id: 'nosmoke_area', ja: '禁煙エリア', kana: 'きんえんエリア', korean: '금연 구역', category: '주의', tip: "역 승강장이나 공원 등 구역 전체가 금연으로 지정된 곳의 경계 표지판에 쓰여요." },
  { id: 'setsubi', ja: '工事中につき', kana: 'こうじちゅうにつき', korean: '공사 중으로 인해(통행·이용 제한 안내)', category: '주의', tip: '공사장 앞 안내문에서 뒤에 “통행할 수 없습니다”, “우회해 주세요” 같은 이유 설명이 이어지는 시작 표현이에요.' },
  { id: 'kiken_takaatsu', ja: '高電圧危険', kana: 'こうでんあつきけん', korean: '고전압 위험', category: '주의', tip: "변전소나 전기 설비 근처 울타리에 붙어 감전 위험을 강하게 경고하는 표지예요." },
  { id: 'hizashi', ja: '日差しに注意', kana: 'ひざしにちゅうい', korean: '햇볕 주의', category: '주의', tip: "여름철 옥상이나 야외 대기 공간에서 햇볕이 강하니 조심하라고 알려주는 안내예요." },
  { id: 'kinshi_shinnyu', ja: '立入厳禁', kana: 'たちいりげんきん', korean: '출입 엄금', category: '주의', tip: "立入禁止보다 더 강한 어조로, 절대 들어가면 안 되는 위험 구역이나 공사장에 쓰여요." },

  // ── 안내 추가 ──
  { id: 'mannaka', ja: '中央', kana: 'ちゅうおう', korean: '중앙', category: '안내', tip: "쇼핑몰이나 건물 안내도에서 가운데 구역이나 통로를 가리킬 때 쓰는 표현이에요." },
  { id: 'kami', ja: '上', kana: 'うえ', korean: '위', category: '안내', tip: "엘리베이터나 에스컬레이터, 안내판에서 위층·위쪽 방향을 가리킬 때 쓰는 표현이에요." },
  { id: 'shita', ja: '下', kana: 'した', korean: '아래', category: '안내', tip: "엘리베이터나 에스컬레이터, 안내판에서 아래층·아래쪽 방향을 가리킬 때 쓰는 표현이에요." },
  { id: 'toiu_koto', ja: 'ただいま混雑中', kana: 'ただいまこんざつちゅう', korean: '지금 혼잡 중', category: '안내', tip: "역이나 매장 안내방송에서 지금 혼잡하니 주의하라고 알릴 때 쓰는 표현이에요." },
  { id: 'go_annai', ja: 'ご案内', kana: 'ごあんない', korean: '안내 드립니다', category: '안내', tip: '역이나 공항 전광판·방송 안내에서 공지 제목처럼 보이는 표현이에요.' },
];

const hasId = (sign: Sign, ids: string[]) => ids.includes(sign.id);

export function signSceneFor(sign: Sign): SignScene {
  if (hasId(sign, ['men_toilet', 'women_toilet', 'danshi', 'josei', 'otearai'])) return 'restroom';
  if (hasId(sign, ['deguchi', 'iriguchi', 'osu', 'hiku', 'eigyouchu', 'junbichu', 'koshouchu', 'uketsuke', 'shokuji', 'kaigi', 'locker_sign', 'kintsuen', 'floor_sign', 'chikashitsu'])) return 'mallEntrance';
  if (hasId(sign, ['kaisatsu', 'hijouguchi', 'annai', 'kinen', 'kakueki', 'kyuukou', 'tokkyuu', 'noriba', 'norikae_sign', 'kitaguchi', 'minamiguchi', 'higashiguchi', 'nishiguchi', 'terminal', 'jikoku', 'unchin', 'jiyuuseki', 'shitei_seki', 'green_sha', 'kinkyu_teishi', 'mannaka', 'kami', 'shita'])) return 'stationWayfinding';
  if (hasId(sign, ['tachiiri', 'chuui', 'kiken', 'ashimoto', 'koujichu', 'satsuei_kinshi', 'ichiji_teishi', 'tachiiri_kinshi2', 'nohumi', 'nosmoke_area', 'setsubi', 'kiken_takaatsu', 'hizashi', 'kinshi_shinnyu'])) return 'construction';
  if (hasId(sign, ['chien', 'untenkeshi', 'toiu_koto', 'go_annai'])) return 'transitBoard';
  if (hasId(sign, ['teikyuubi', 'rinji_kyuugyou', 'eigyoujikan', 'manshitsu', 'kuushitsu', 'baiten'])) return 'shopNotice';
  if (hasId(sign, ['zeikomi', 'shohizei', 'receipt'])) return 'receipt';
  if (hasId(sign, ['genkin_sign', 'card_taiou', 'koutsuukei', 'tsurisen', 'ryougae_sign', 'menzei', 'pointcard', 'fukuro_yoru', 'nouki'])) return 'checkout';
  if (sign.category === '메뉴') return 'restaurantMenu';
  return 'storePromo';
}
