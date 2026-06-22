import type { Rarity } from './collection';

export type ItemMotif = 'food' | 'drink' | 'ticket' | 'stay' | 'shopping' | 'service' | 'safety' | 'festival';

export interface GachaItemArt {
  title: string;
  jaTitle?: string;
  sub: string;
  motif: ItemMotif;
  image?: string;
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

function withLegacyImage(item: GachaItemArt): GachaItemArt {
  return {
    ...item,
    image: item.image || MOTIF_IMAGE[item.motif],
  };
}

function withLabImage(item: GachaItemArt, rarity: Rarity): GachaItemArt {
  return {
    ...item,
    image: gachaItemAssetPath(item.title, rarity, item.motif),
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
};

const PLACE_ALIAS: Record<string, string> = {
  관광안내소: '거리',
  신사: '거리',
  온천: '호텔',
  료칸: '호텔',
  버스: '전철',
  신칸센: '전철',
  택시: '전철',
  렌터카: '전철',
  공항: '전철',
  나리타역: '전철',
  공항수하물: '전철',
  환전: '쇼핑',
  코인로커: '거리',
  택배: '편의점',
  병원: '약국',
  경찰서: '거리',
  긴급상황: '약국',
  통신매장: '쇼핑',
  코인세탁: '거리',
  축제: '거리',
  편집샵피팅: '쇼핑',
  편집샵계산: '쇼핑',
  호텔우산: '호텔',
  호텔방변경: '호텔',
  조식뷔페: '식당',
  스시추가: '스시집',
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
  return withJa(withLabImage(itemForKey(key, rarity), rarity));
}
