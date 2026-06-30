import type { Rarity } from './collection';

export type ItemMotif = 'food' | 'drink' | 'ticket' | 'stay' | 'shopping' | 'service' | 'safety' | 'festival';

export interface GachaItemArt {
  title: string;
  jaTitle?: string;
  sub: string;
  motif: ItemMotif;
  image?: string;
  fallbackImage?: string;
}

const JA_TITLE: Record<string, string> = {
  여행메모: '旅メモ',
  실전쿠폰: '実戦クーポン',
  로컬패스: 'ローカルパス',
  마스터키트: 'マスターキット',
  명예배지: '名誉バッジ',
  삼각김밥: 'おにぎり',
  핫스낵: 'ホットスナック',
  도시락세트: '弁当セット',
  프리미엄벤토: '特製弁当',
  심야콤보: '深夜セット',
  물컵: '水グラス',
  정식메뉴: '定食メニュー',
  추천세트: 'おすすめセット',
  셰프플레이트: 'シェフ皿',
  오마카세코스: 'おまかせコース',
  승차권: '乗車券',
  교통카드: '交通カード',
  급행패스: '急行パス',
  지정석권: '指定席券',
  여행레일패스: '旅レールパス',
  룸키: 'ルームキー',
  어메니티: 'アメニティ',
  조식권: '朝食券',
  스위트키: 'スイートキー',
  컨시어지패스: 'コンシェルジュパス',
  지도조각: '地図のかけら',
  골목표지: '路地サイン',
  동네지도: '町の地図',
  로컬루트: 'ローカルルート',
  도시탐험가: '街の探検家',
  마스크: 'マスク',
  목캔디: 'のど飴',
  상비약: '常備薬',
  약사추천세트: '薬剤師セット',
  안심키트: '安心キット',
  쇼핑백: 'ショッピングバッグ',
  사이즈태그: 'サイズタグ',
  피팅티켓: '試着チケット',
  셀렉트재킷: 'セレクトジャケット',
  한정판코디: '限定コーデ',
  컵라멘: 'カップラーメン',
  쇼유라멘: '醤油ラーメン',
  미소버터라멘: '味噌バターラーメン',
  돈코츠차슈라멘: '豚骨チャーシューメン',
  특상해산물라멘: '特上海鮮ラーメン',
  아이스커피: 'アイスコーヒー',
  라떼: 'ラテ',
  말차라떼: '抹茶ラテ',
  스페셜블렌드: 'スペシャルブレンド',
  바리스타시그니처: 'バリスタシグネチャー',
  단팥빵: 'あんパン',
  멜론빵: 'メロンパン',
  카레빵: 'カレーパン',
  갓구운식빵: '焼きたて食パン',
  파티시에박스: 'パティシエボックス',
  오토시: 'お通し',
  생맥주: '生ビール',
  야키토리: '焼き鳥',
  사시미모둠: '刺身盛り',
  대장추천코스: '大将おすすめコース',
  계란초밥: '玉子寿司',
  참치초밥: 'まぐろ寿司',
  연어뱃살: 'サーモン腹身',
  오토로: '大トロ',
  장인오마카세: '職人おまかせ',
  접시토큰: '皿トークン',
  레일초밥: 'レーン寿司',
  터치패널세트: 'タッチパネルセット',
  특선네타: '特選ネタ',
  대어플레이트: '大漁プレート',
  토마토파스타: 'トマトパスタ',
  크림파스타: 'クリームパスタ',
  해산물파스타: '海鮮パスタ',
  트러플파스타: 'トリュフパスタ',
  셰프스페셜파스타: 'シェフ特製パスタ',
};

function compactTitle(title: string): string {
  return title.replace(/\s+/g, '');
}

function withJa(item: GachaItemArt): GachaItemArt {
  return { ...item, jaTitle: item.jaTitle ?? JA_TITLE[compactTitle(item.title)] ?? item.title };
}

const GENERIC: Record<Rarity, GachaItemArt> = {
  basic: { title: '여행 메모', sub: '기본', motif: 'service' },
  bronze: { title: '실전 쿠폰', sub: '동', motif: 'ticket' },
  silver: { title: '로컬 패스', sub: '은', motif: 'ticket' },
  gold: { title: '마스터 키트', sub: '금', motif: 'service' },
  diamond: { title: '명예 배지', sub: '다이아', motif: 'festival' },
  xur: { title: '비밀 초대장', sub: 'XUR', motif: 'festival' },
};

const MOTIF_IMAGE: Record<ItemMotif, string> = {
  food: '/gacha/items/motif/motif-food.webp',
  drink: '/gacha/items/motif/motif-drink.webp',
  ticket: '/gacha/items/motif/motif-ticket.webp',
  stay: '/gacha/items/motif/motif-stay.webp',
  shopping: '/gacha/items/motif/motif-shopping.webp',
  service: '/gacha/items/motif/motif-service.webp',
  safety: '/gacha/items/motif/motif-safety.webp',
  festival: '/gacha/items/motif/motif-festival.webp',
};

export function gachaItemAssetSlug(title: string, rarity: Rarity, motif: ItemMotif): string {
  const body = compactTitle(title)
    .split('')
    .map((ch) => ch.charCodeAt(0).toString(36))
    .join('-')
    .slice(0, 90);
  return `${rarity}-${motif}-${body || 'item'}`;
}

export function gachaItemAssetPath(title: string, rarity: Rarity, motif: ItemMotif): string {
  return `/gacha/items/generated-v2/${gachaItemAssetSlug(title, rarity, motif)}.png`;
}

export function gachaLuxuryItemAssetPath(title: string, rarity: Rarity, motif: ItemMotif): string {
  return `/gacha/items/luxury/${gachaItemAssetSlug(title, rarity, motif)}.png`;
}

function withLegacyImage(item: GachaItemArt): GachaItemArt {
  return {
    ...item,
    image: item.image || MOTIF_IMAGE[item.motif],
  };
}

function withLuxuryImage(item: GachaItemArt, rarity: Rarity): GachaItemArt {
  return {
    ...item,
    image: gachaLuxuryItemAssetPath(item.title, rarity, item.motif),
    fallbackImage: gachaItemAssetPath(item.title, rarity, item.motif),
  };
}

const BY_PLACE: Record<string, Partial<Record<Rarity, GachaItemArt>>> = {
  편의점: {
    basic: { title: '삼각김밥', sub: '입문', motif: 'food', image: '/gacha/items/generated/onigiri.png' },
    bronze: { title: '핫스낵', sub: '계산대', motif: 'food', image: '/gacha/items/generated/hot-snack.png' },
    silver: { title: '도시락 세트', sub: '데우기', motif: 'food', image: '/gacha/items/generated/bento-box.png' },
    gold: { title: '프리미엄 벤토', sub: '완벽 주문', motif: 'food', image: '/gacha/items/generated/premium-bento.png' },
    diamond: { title: '심야 콤보', sub: '로컬 고수', motif: 'food', image: '/gacha/items/generated/late-night-combo.png' },
  },
  식당: {
    basic: { title: '물컵', sub: '착석', motif: 'drink', image: '/gacha/items/generated/water-glass.png' },
    bronze: { title: '정식 메뉴', sub: '주문', motif: 'food', image: '/gacha/items/generated/teishoku-menu.png' },
    silver: { title: '추천 세트', sub: '응대', motif: 'food', image: '/gacha/items/generated/recommended-set.png' },
    gold: { title: '셰프 플레이트', sub: '자연 주문', motif: 'food', image: '/gacha/items/generated/chef-plate.png' },
    diamond: { title: '오마카세 코스', sub: '완전 적응', motif: 'food', image: '/gacha/items/generated/omakase-course.png' },
  },
  전철: {
    basic: { title: '승차권', sub: '기본', motif: 'ticket', image: '/gacha/items/generated/train-ticket.png' },
    bronze: { title: '교통카드', sub: '개찰', motif: 'ticket', image: '/gacha/items/generated/ic-card.png' },
    silver: { title: '급행 패스', sub: '환승', motif: 'ticket', image: '/gacha/items/generated/express-pass.png' },
    gold: { title: '지정석권', sub: '정확 이동', motif: 'ticket', image: '/gacha/items/generated/reserved-seat-ticket.png' },
    diamond: { title: '여행 레일패스', sub: '마스터', motif: 'ticket', image: '/gacha/items/generated/rail-pass.png' },
  },
  호텔: {
    basic: { title: '룸키', sub: '체크인', motif: 'stay' },
    bronze: { title: '어메니티', sub: '요청', motif: 'stay' },
    silver: { title: '조식권', sub: '안내', motif: 'ticket' },
    gold: { title: '스위트 키', sub: '방 변경', motif: 'stay' },
    diamond: { title: '컨시어지 패스', sub: '완벽 응대', motif: 'stay' },
  },
  거리: {
    basic: { title: '지도 조각', sub: '길묻기', motif: 'ticket' },
    bronze: { title: '골목 표지', sub: '방향', motif: 'service' },
    silver: { title: '동네 지도', sub: '확인', motif: 'ticket' },
    gold: { title: '로컬 루트', sub: '자연 질문', motif: 'ticket' },
    diamond: { title: '도시 탐험가', sub: '완전 적응', motif: 'festival' },
  },
  약국: {
    basic: { title: '마스크', sub: '기본', motif: 'safety' },
    bronze: { title: '목캔디', sub: '증상', motif: 'safety' },
    silver: { title: '상비약', sub: '상담', motif: 'safety' },
    gold: { title: '약사 추천 세트', sub: '정확 설명', motif: 'safety' },
    diamond: { title: '안심 키트', sub: '건강 마스터', motif: 'safety' },
  },
  쇼핑: {
    basic: { title: '쇼핑백', sub: '기본', motif: 'shopping' },
    bronze: { title: '사이즈 태그', sub: '질문', motif: 'shopping' },
    silver: { title: '피팅 티켓', sub: '시착', motif: 'ticket' },
    gold: { title: '셀렉트 재킷', sub: '취향 설명', motif: 'shopping' },
    diamond: { title: '한정판 코디', sub: '쇼핑 고수', motif: 'shopping' },
  },
  라멘: {
    basic: { title: '컵라멘', sub: '기본', motif: 'food', image: '/gacha/items/ramen/ramen-basic.webp' },
    bronze: { title: '쇼유라멘', sub: '동', motif: 'food', image: '/gacha/items/ramen/ramen-bronze.webp' },
    silver: { title: '미소버터라멘', sub: '은', motif: 'food', image: '/gacha/items/ramen/ramen-silver.webp' },
    gold: { title: '돈코츠 차슈라멘', sub: '금', motif: 'food', image: '/gacha/items/ramen/ramen-gold.webp' },
    diamond: { title: '특상 해산물라멘', sub: '다이아', motif: 'food', image: '/gacha/items/ramen/ramen-diamond.webp' },
  },
  카페: {
    basic: { title: '아이스커피', sub: '기본', motif: 'drink' },
    bronze: { title: '라떼', sub: '주문', motif: 'drink' },
    silver: { title: '말차라떼', sub: '옵션', motif: 'drink' },
    gold: { title: '스페셜 블렌드', sub: '취향', motif: 'drink' },
    diamond: { title: '바리스타 시그니처', sub: '카페 고수', motif: 'drink' },
  },
  빵집: {
    basic: { title: '단팥빵', sub: '기본', motif: 'food' },
    bronze: { title: '멜론빵', sub: '인기', motif: 'food' },
    silver: { title: '카레빵', sub: '추천', motif: 'food' },
    gold: { title: '갓구운 식빵', sub: '한정', motif: 'food' },
    diamond: { title: '파티시에 박스', sub: '명품', motif: 'food' },
  },
  이자카야: {
    basic: { title: '오토시', sub: '입장', motif: 'food' },
    bronze: { title: '생맥주', sub: '주문', motif: 'drink' },
    silver: { title: '야키토리', sub: '추가', motif: 'food' },
    gold: { title: '사시미 모둠', sub: '추천', motif: 'food' },
    diamond: { title: '대장 추천 코스', sub: '완전 적응', motif: 'food' },
  },
  스시집: {
    basic: { title: '계란초밥', sub: '기본', motif: 'food' },
    bronze: { title: '참치초밥', sub: '주문', motif: 'food' },
    silver: { title: '연어뱃살', sub: '추천', motif: 'food' },
    gold: { title: '오토로', sub: '희귀', motif: 'food' },
    diamond: { title: '장인 오마카세', sub: '명예', motif: 'food' },
  },
  회전초밥: {
    basic: { title: '접시 토큰', sub: '입장', motif: 'food' },
    bronze: { title: '레일 초밥', sub: '주문', motif: 'food' },
    silver: { title: '터치패널 세트', sub: '조작', motif: 'ticket' },
    gold: { title: '특선 네타', sub: '고급', motif: 'food' },
    diamond: { title: '대어 플레이트', sub: '마스터', motif: 'food' },
  },
  파스타: {
    basic: { title: '토마토 파스타', sub: '기본', motif: 'food' },
    bronze: { title: '크림 파스타', sub: '선택', motif: 'food' },
    silver: { title: '해산물 파스타', sub: '옵션', motif: 'food' },
    gold: { title: '트러플 파스타', sub: '희귀', motif: 'food' },
    diamond: { title: '셰프 스페셜 파스타', sub: '명예', motif: 'food' },
  },
  환전: {
    basic: { title: '환전 번호표', sub: '대기', motif: 'ticket' },
    bronze: { title: '엔화 봉투', sub: '수령', motif: 'service' },
    silver: { title: '환율 메모 카드', sub: '확인', motif: 'ticket' },
    gold: { title: '우대 환전 쿠폰', sub: '할인', motif: 'ticket' },
    diamond: { title: '여행 예산 지갑', sub: '완벽 준비', motif: 'shopping' },
  },
  코인로커: {
    basic: { title: '로커 동전', sub: '보관', motif: 'service' },
    bronze: { title: '로커 열쇠', sub: '찾기', motif: 'ticket' },
    silver: { title: '짐 보관 영수증', sub: '확인', motif: 'ticket' },
    gold: { title: '대형 캐리어 락커', sub: '여유 보관', motif: 'stay' },
    diamond: { title: '역 보관 마스터키', sub: '안심 이동', motif: 'service' },
  },
  택배: {
    basic: { title: '배송 라벨', sub: '작성', motif: 'service' },
    bronze: { title: '편의점 송장', sub: '접수', motif: 'ticket' },
    silver: { title: '포장 완충재', sub: '보호', motif: 'shopping' },
    gold: { title: '익일 배송 박스', sub: '빠른 발송', motif: 'service' },
    diamond: { title: '국제 배송 키트', sub: '완벽 발송', motif: 'service' },
  },
  관광안내소: {
    basic: { title: '안내 팸플릿', sub: '정보', motif: 'ticket' },
    bronze: { title: '관광 지도', sub: '길찾기', motif: 'ticket' },
    silver: { title: '추천 루트 카드', sub: '상담', motif: 'service' },
    gold: { title: '지역 패스 쿠폰', sub: '할인', motif: 'ticket' },
    diamond: { title: '시티 투어 플래너', sub: '여행 설계', motif: 'festival' },
  },
  신사: {
    basic: { title: '참배 동전', sub: '예절', motif: 'festival' },
    bronze: { title: '오미쿠지', sub: '운세', motif: 'ticket' },
    silver: { title: '에마 목패', sub: '소원', motif: 'festival' },
    gold: { title: '행운 오마모리', sub: '기념', motif: 'festival' },
    diamond: { title: '계절 고슈인', sub: '특별 기록', motif: 'festival' },
  },
  온천: {
    basic: { title: '온천 수건', sub: '입장', motif: 'stay' },
    bronze: { title: '탈의실 바구니', sub: '보관', motif: 'stay' },
    silver: { title: '노천탕 이용권', sub: '안내', motif: 'ticket' },
    gold: { title: '프라이빗 탕 키', sub: '예약', motif: 'stay' },
    diamond: { title: '온천 힐링 세트', sub: '완전 휴식', motif: 'stay' },
  },
  료칸: {
    basic: { title: '유카타 끈', sub: '객실', motif: 'stay' },
    bronze: { title: '다다미 객실키', sub: '안내', motif: 'stay' },
    silver: { title: '가이세키 식권', sub: '식사', motif: 'ticket' },
    gold: { title: '노천 객실 카드', sub: '업그레이드', motif: 'stay' },
    diamond: { title: '료칸 환대 세트', sub: '최고 숙박', motif: 'stay' },
  },
  버스: {
    basic: { title: '정류장 표지', sub: '확인', motif: 'ticket' },
    bronze: { title: '버스 정리권', sub: '승차', motif: 'ticket' },
    silver: { title: '교통 IC 충전권', sub: '결제', motif: 'ticket' },
    gold: { title: '공항 리무진 티켓', sub: '이동', motif: 'ticket' },
    diamond: { title: '지역 버스 패스', sub: '자유 이동', motif: 'ticket' },
  },
  택시: {
    basic: { title: '택시 승차 카드', sub: '승차', motif: 'ticket' },
    bronze: { title: '목적지 메모', sub: '전달', motif: 'service' },
    silver: { title: '택시 영수증', sub: '확인', motif: 'ticket' },
    gold: { title: '호텔 주소 카드', sub: '정확 이동', motif: 'service' },
    diamond: { title: '프리미엄 택시 패스', sub: '안심 귀가', motif: 'ticket' },
  },
  신칸센: {
    basic: { title: '자유석 티켓', sub: '탑승', motif: 'ticket' },
    bronze: { title: '플랫폼 안내표', sub: '확인', motif: 'ticket' },
    silver: { title: '지정석 티켓', sub: '예약', motif: 'ticket' },
    gold: { title: '그린샤 패스', sub: '고급 이동', motif: 'ticket' },
    diamond: { title: '전국 레일 패스', sub: '장거리 마스터', motif: 'ticket' },
  },
  렌터카: {
    basic: { title: '예약 확인서', sub: '접수', motif: 'ticket' },
    bronze: { title: '차량 키 태그', sub: '인수', motif: 'service' },
    silver: { title: 'ETC 카드', sub: '고속도로', motif: 'ticket' },
    gold: { title: '보험 옵션 서류', sub: '안심 운전', motif: 'service' },
    diamond: { title: '드라이브 플랜 키트', sub: '완벽 반납', motif: 'service' },
  },
  공항: {
    basic: { title: '입국 카드', sub: '작성', motif: 'ticket' },
    bronze: { title: '여권 스탬프', sub: '심사', motif: 'ticket' },
    silver: { title: '수하물 태그', sub: '확인', motif: 'service' },
    gold: { title: '패스트트랙 패스', sub: '빠른 입국', motif: 'ticket' },
    diamond: { title: '공항 컨시어지 카드', sub: '완벽 도착', motif: 'service' },
  },
  나리타역: {
    basic: { title: '오픈 티켓', sub: '교환', motif: 'ticket' },
    bronze: { title: '매표소 번호표', sub: '대기', motif: 'ticket' },
    silver: { title: '특급 열차권', sub: '예약', motif: 'ticket' },
    gold: { title: '공항철도 패스', sub: '환승', motif: 'ticket' },
    diamond: { title: '도쿄 도착 패키지', sub: '완벽 출발', motif: 'ticket' },
  },
  공항수하물: {
    basic: { title: '수하물 저울', sub: '측정', motif: 'service' },
    bronze: { title: '짐 정리 파우치', sub: '분리', motif: 'shopping' },
    silver: { title: '초과수하물 영수증', sub: '결제', motif: 'ticket' },
    gold: { title: '압축 패킹 큐브', sub: '감량', motif: 'shopping' },
    diamond: { title: '공항 짐관리 키트', sub: '완벽 정리', motif: 'service' },
  },
  병원: {
    basic: { title: '접수 번호표', sub: '대기', motif: 'ticket' },
    bronze: { title: '증상 메모', sub: '설명', motif: 'safety' },
    silver: { title: '진료 카드', sub: '문진', motif: 'safety' },
    gold: { title: '처방전 봉투', sub: '수령', motif: 'safety' },
    diamond: { title: '안심 진료 세트', sub: '건강 회복', motif: 'safety' },
  },
  경찰서: {
    basic: { title: '분실물 메모', sub: '신고', motif: 'service' },
    bronze: { title: '파출소 안내카드', sub: '문의', motif: 'safety' },
    silver: { title: '분실 신고서', sub: '작성', motif: 'ticket' },
    gold: { title: '임시 확인증', sub: '증명', motif: 'safety' },
    diamond: { title: '여행 안전 파일', sub: '완벽 대처', motif: 'safety' },
  },
  긴급상황: {
    basic: { title: '도움 요청 카드', sub: '호출', motif: 'safety' },
    bronze: { title: '긴급 연락 메모', sub: '연락', motif: 'safety' },
    silver: { title: '위치 공유 배지', sub: '전달', motif: 'safety' },
    gold: { title: '응급 안내 키트', sub: '대응', motif: 'safety' },
    diamond: { title: '세이프티 마스터팩', sub: '안전 확보', motif: 'safety' },
  },
  통신매장: {
    basic: { title: '유심 핀', sub: '개통', motif: 'service' },
    bronze: { title: '데이터 플랜 카드', sub: '선택', motif: 'ticket' },
    silver: { title: '포켓와이파이 태그', sub: '대여', motif: 'service' },
    gold: { title: '무제한 데이터 쿠폰', sub: '업그레이드', motif: 'ticket' },
    diamond: { title: '여행 통신 키트', sub: '완벽 연결', motif: 'service' },
  },
  코인세탁: {
    basic: { title: '세탁 코인', sub: '투입', motif: 'service' },
    bronze: { title: '세제 캡슐', sub: '세탁', motif: 'stay' },
    silver: { title: '건조기 토큰', sub: '건조', motif: 'service' },
    gold: { title: '세탁 코스 카드', sub: '선택', motif: 'ticket' },
    diamond: { title: '여행 세탁 세트', sub: '완벽 정리', motif: 'stay' },
  },
  축제: {
    basic: { title: '축제 부채', sub: '입장', motif: 'festival' },
    bronze: { title: '야타이 쿠폰', sub: '간식', motif: 'ticket' },
    silver: { title: '금붕어 뜰채', sub: '놀이', motif: 'festival' },
    gold: { title: '불꽃놀이 자리표', sub: '관람', motif: 'ticket' },
    diamond: { title: '마츠리 기념 세트', sub: '특별 추억', motif: 'festival' },
  },
  편집샵피팅: {
    basic: { title: '피팅 번호표', sub: '대기', motif: 'ticket' },
    bronze: { title: '사이즈 태그', sub: '확인', motif: 'shopping' },
    silver: { title: '피팅룸 카드', sub: '시착', motif: 'ticket' },
    gold: { title: '스타일링 메모', sub: '추천', motif: 'shopping' },
    diamond: { title: '퍼스널 코디 세트', sub: '완벽 선택', motif: 'shopping' },
  },
  편집샵계산: {
    basic: { title: '가격표 태그', sub: '확인', motif: 'shopping' },
    bronze: { title: '쇼핑 영수증', sub: '계산', motif: 'ticket' },
    silver: { title: '면세 서류', sub: '작성', motif: 'service' },
    gold: { title: '기프트 포장 리본', sub: '포장', motif: 'shopping' },
    diamond: { title: '부티크 쇼핑 패스', sub: '완벽 구매', motif: 'shopping' },
  },
  호텔우산: {
    basic: { title: '우산 대여표', sub: '요청', motif: 'ticket' },
    bronze: { title: '프런트 우산', sub: '대여', motif: 'stay' },
    silver: { title: '비 오는 날 지도', sub: '안내', motif: 'ticket' },
    gold: { title: '호텔 레인코트', sub: '배려', motif: 'stay' },
    diamond: { title: '레인 데이 서비스팩', sub: '완벽 외출', motif: 'stay' },
  },
  호텔방변경: {
    basic: { title: '객실 요청 메모', sub: '문의', motif: 'stay' },
    bronze: { title: '새 객실 키', sub: '변경', motif: 'stay' },
    silver: { title: '룸 타입 카드', sub: '확인', motif: 'ticket' },
    gold: { title: '업그레이드 바우처', sub: '배정', motif: 'ticket' },
    diamond: { title: '스위트 변경 패스', sub: '완벽 변경', motif: 'stay' },
  },
  조식뷔페: {
    basic: { title: '조식 접시', sub: '시작', motif: 'food' },
    bronze: { title: '미소국 그릇', sub: '보충', motif: 'food' },
    silver: { title: '샐러드 바 토큰', sub: '요청', motif: 'food' },
    gold: { title: '오믈렛 오더 카드', sub: '주문', motif: 'ticket' },
    diamond: { title: '호텔 조식 플래터', sub: '완벽 아침', motif: 'food' },
  },
  스시추가: {
    basic: { title: '생선 이름 카드', sub: '확인', motif: 'ticket' },
    bronze: { title: '아지 초밥', sub: '추가', motif: 'food' },
    silver: { title: '히라메 초밥', sub: '추천', motif: 'food' },
    gold: { title: '킨메다이 초밥', sub: '희귀', motif: 'food' },
    diamond: { title: '계절 네타 세트', sub: '완벽 주문', motif: 'food' },
  },
  '쇼핑몰 서비스 데스크': {
    basic: { title: '안내 데스크 번호표', sub: '대기', motif: 'ticket' },
    bronze: { title: '교환 신청서', sub: '접수', motif: 'service' },
    silver: { title: '환불 영수증', sub: '확인', motif: 'ticket' },
    gold: { title: '고객센터 바우처', sub: '처리', motif: 'service' },
    diamond: { title: '몰 컨시어지 패스', sub: '완벽 해결', motif: 'shopping' },
  },
  자판기: {
    basic: { title: '동전 토큰', sub: '투입', motif: 'drink' },
    bronze: { title: '녹차 캔', sub: '선택', motif: 'drink' },
    silver: { title: '핫커피 버튼', sub: '조작', motif: 'drink' },
    gold: { title: '한정 음료 쿠폰', sub: '특별 선택', motif: 'ticket' },
    diamond: { title: '자판기 마스터 캡슐', sub: '완벽 구매', motif: 'drink' },
  },
  '편의점 ATM': {
    basic: { title: 'ATM 카드', sub: '삽입', motif: 'service' },
    bronze: { title: '출금 영수증', sub: '확인', motif: 'ticket' },
    silver: { title: '엔화 현금 봉투', sub: '수령', motif: 'service' },
    gold: { title: '해외 카드 승인표', sub: '성공', motif: 'ticket' },
    diamond: { title: '현금 인출 안심팩', sub: '완벽 출금', motif: 'service' },
  },
  '편의점 복합기': {
    basic: { title: '복사 카드', sub: '시작', motif: 'service' },
    bronze: { title: '프린트 예약번호', sub: '입력', motif: 'ticket' },
    silver: { title: '스캔 파일 토큰', sub: '저장', motif: 'service' },
    gold: { title: '행정서류 출력권', sub: '출력', motif: 'ticket' },
    diamond: { title: '멀티프린트 마스터팩', sub: '완벽 처리', motif: 'service' },
  },
  '카페·레스토랑 픽업 카운터': {
    basic: { title: '픽업 번호표', sub: '확인', motif: 'ticket' },
    bronze: { title: '테이크아웃 봉투', sub: '수령', motif: 'food' },
    silver: { title: '예약 주문 카드', sub: '찾기', motif: 'ticket' },
    gold: { title: '따뜻한 픽업 세트', sub: '완성', motif: 'food' },
    diamond: { title: '프리오더 스페셜 박스', sub: '완벽 픽업', motif: 'food' },
  },
  '야구장·스타디움': {
    basic: { title: '입장 티켓', sub: '입장', motif: 'ticket' },
    bronze: { title: '응원 타월', sub: '응원', motif: 'festival' },
    silver: { title: '핫도그 세트', sub: '간식', motif: 'food' },
    gold: { title: '한정 굿즈 배지', sub: '기념', motif: 'festival' },
    diamond: { title: '스타디움 VIP 패스', sub: '완벽 관람', motif: 'ticket' },
  },
  복합쇼핑몰: {
    basic: { title: '층별 안내도', sub: '확인', motif: 'ticket' },
    bronze: { title: '매장 쿠폰북', sub: '혜택', motif: 'shopping' },
    silver: { title: '기프트 카드', sub: '구매', motif: 'shopping' },
    gold: { title: '라운지 이용권', sub: '휴식', motif: 'ticket' },
    diamond: { title: '쇼핑몰 VIP 패스', sub: '완벽 쇼핑', motif: 'shopping' },
  },
  '스시 오마카세': {
    basic: { title: '오마카세 예약표', sub: '예약', motif: 'ticket' },
    bronze: { title: '전채 한 접시', sub: '시작', motif: 'food' },
    silver: { title: '오늘의 네타 카드', sub: '설명', motif: 'ticket' },
    gold: { title: '셰프 추천 니기리', sub: '추천', motif: 'food' },
    diamond: { title: '카운터 오마카세 코스', sub: '최고 경험', motif: 'food' },
  },
  길거리: {
    basic: { title: '현재 위치 핀', sub: '확인', motif: 'ticket' },
    bronze: { title: '거리 표지판', sub: '방향', motif: 'service' },
    silver: { title: '공유 위치 카드', sub: '전달', motif: 'safety' },
    gold: { title: '근처 역 루트', sub: '안내', motif: 'ticket' },
    diamond: { title: '긴급 길찾기 키트', sub: '안심 복귀', motif: 'safety' },
  },
};

const PLACE_ALIAS: Record<string, string> = {
  '쇼핑몰 안내소': '쇼핑몰 서비스 데스크',
  '길 잃음': '길거리',
};

export const GACHA_ITEM_PLACES = Object.keys(BY_PLACE);

function itemForKey(key: string | undefined, rarity: Rarity): GachaItemArt {
  const row = key ? BY_PLACE[key] : undefined;
  const direct = row?.[rarity];
  if (direct) return direct;
  if (rarity === 'xur' && row?.diamond) {
    return {
      title: `${row.diamond.title} 초월 초대장`,
      sub: 'XUR',
      motif: row.diamond.motif,
    };
  }
  return GENERIC[rarity];
}

export function gachaItemForPlace(place: string | undefined, rarity: Rarity): GachaItemArt {
  const key = place && (BY_PLACE[place] ? place : PLACE_ALIAS[place]);
  return withJa(withLegacyImage(itemForKey(key, rarity)));
}

export function gachaLabItemForPlace(place: string | undefined, rarity: Rarity): GachaItemArt {
  const key = place && (BY_PLACE[place] ? place : PLACE_ALIAS[place]);
  return withJa(withLuxuryImage(itemForKey(key, rarity), rarity));
}
