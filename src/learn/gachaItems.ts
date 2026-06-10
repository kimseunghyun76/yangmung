import type { Rarity } from './collection';

export type ItemMotif = 'food' | 'drink' | 'ticket' | 'stay' | 'shopping' | 'service' | 'safety' | 'festival';

export interface GachaItemArt {
  title: string;
  sub: string;
  motif: ItemMotif;
}

const GENERIC: Record<Rarity, GachaItemArt> = {
  basic: { title: '여행 메모', sub: '기본', motif: 'service' },
  bronze: { title: '실전 쿠폰', sub: '동', motif: 'ticket' },
  silver: { title: '로컬 패스', sub: '은', motif: 'ticket' },
  gold: { title: '마스터 키트', sub: '금', motif: 'service' },
  diamond: { title: '명예 배지', sub: '다이아', motif: 'festival' },
};

const BY_PLACE: Record<string, Partial<Record<Rarity, GachaItemArt>>> = {
  편의점: {
    basic: { title: '삼각김밥', sub: '입문', motif: 'food' },
    bronze: { title: '핫스낵', sub: '계산대', motif: 'food' },
    silver: { title: '도시락 세트', sub: '데우기', motif: 'food' },
    gold: { title: '프리미엄 벤토', sub: '완벽 주문', motif: 'food' },
    diamond: { title: '심야 콤보', sub: '로컬 고수', motif: 'food' },
  },
  식당: {
    basic: { title: '물컵', sub: '착석', motif: 'drink' },
    bronze: { title: '정식 메뉴', sub: '주문', motif: 'food' },
    silver: { title: '추천 세트', sub: '응대', motif: 'food' },
    gold: { title: '셰프 플레이트', sub: '자연 주문', motif: 'food' },
    diamond: { title: '오마카세 코스', sub: '완전 적응', motif: 'food' },
  },
  전철: {
    basic: { title: '승차권', sub: '기본', motif: 'ticket' },
    bronze: { title: '교통카드', sub: '개찰', motif: 'ticket' },
    silver: { title: '급행 패스', sub: '환승', motif: 'ticket' },
    gold: { title: '지정석권', sub: '정확 이동', motif: 'ticket' },
    diamond: { title: '여행 레일패스', sub: '마스터', motif: 'ticket' },
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
    basic: { title: '컵라멘', sub: '기본', motif: 'food' },
    bronze: { title: '쇼유라멘', sub: '동', motif: 'food' },
    silver: { title: '미소버터라멘', sub: '은', motif: 'food' },
    gold: { title: '돈코츠 차슈라멘', sub: '금', motif: 'food' },
    diamond: { title: '특상 해산물라멘', sub: '다이아', motif: 'food' },
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

export function gachaItemForPlace(place: string | undefined, rarity: Rarity): GachaItemArt {
  const key = place && (BY_PLACE[place] ? place : PLACE_ALIAS[place]);
  return (key && BY_PLACE[key]?.[rarity]) || GENERIC[rarity];
}
