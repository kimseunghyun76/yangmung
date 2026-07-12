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

function compactTitle(title: string): string {
  return title.replace(/\s+/g, '');
}

const GENERIC: Record<Rarity, GachaItemArt> = {
  basic: { title: '쇼핑 메모', jaTitle: '買い物メモ', sub: '기본', motif: 'service' },
  bronze: { title: '가격표 태그', jaTitle: '値札タグ', sub: '실전', motif: 'shopping' },
  silver: { title: '포인트 카드', jaTitle: 'ポイントカード', sub: '설명', motif: 'ticket' },
  gold: { title: '면세 영수증', jaTitle: '免税レシート', sub: '정중한 부탁', motif: 'ticket' },
  diamond: { title: '기프트 포장 리본', jaTitle: 'ギフト包装リボン', sub: '특별한 순간', motif: 'shopping' },
  xur: { title: '한정 교환권', jaTitle: '限定引換券', sub: '한정', motif: 'ticket' },
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
  return `/gacha/items/generated-v2/${gachaItemAssetSlug(title, rarity, motif)}.webp`;
}

export function gachaLuxuryItemAssetPath(title: string, rarity: Rarity, motif: ItemMotif): string {
  return gachaItemAssetPath(title, rarity, motif);
}

function withGeneratedImage(item: GachaItemArt, rarity: Rarity): GachaItemArt {
  return {
    ...item,
    image: gachaItemAssetPath(item.title, rarity, item.motif),
  };
}

// 미션별 도감 아이템 — 일본 현지에서 실제로 보거나 살 수 있는 실물 위주.
// 등급 상승은 "더 비싼 것 / 더 고급 메뉴 / 더 큰·좋은 모형 / 더 희귀한 한정품"으로 표현하고,
// XUR은 diamond에 접두어를 붙이는 자동 생성이 아니라 미션별로 직접 지정한다.
// docs/gacha-item-redesign.md 참고.
const BY_MISSION: Record<string, Record<Rarity, GachaItemArt>> = {
  C1: {
    basic: { title: '막대과자', jaTitle: 'スティック菓子', sub: '기본', motif: 'food' },
    bronze: { title: '삼각김밥', jaTitle: 'おにぎり', sub: '실전', motif: 'food' },
    silver: { title: '편의점 치킨', jaTitle: 'コンビニチキン', sub: '설명', motif: 'food' },
    gold: { title: '편의점 도시락', jaTitle: 'コンビニ弁当', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '프리미엄 디저트', jaTitle: 'プレミアムスイーツ', sub: '특별한 순간', motif: 'food' },
    xur: { title: '한정 도시락 세트', jaTitle: '限定弁当セット', sub: '한정', motif: 'food' },
  },
  C2: {
    basic: { title: '규동', jaTitle: '牛丼', sub: '기본', motif: 'food' },
    bronze: { title: '카레라이스', jaTitle: 'カレーライス', sub: '실전', motif: 'food' },
    silver: { title: '돈카츠 정식', jaTitle: 'とんかつ定食', sub: '설명', motif: 'food' },
    gold: { title: '텐동', jaTitle: '天丼', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '장어덮밥', jaTitle: 'うな丼', sub: '특별한 순간', motif: 'food' },
    xur: { title: '와규 스키야키 정식', jaTitle: '和牛すき焼き定食', sub: '한정', motif: 'food' },
  },
  C3: {
    basic: { title: '단거리 승차권', jaTitle: '短距離乗車券', sub: '기본', motif: 'ticket' },
    bronze: { title: 'IC 교통카드', jaTitle: 'ICカード', sub: '실전', motif: 'ticket' },
    silver: { title: '1일 승차권', jaTitle: '一日乗車券', sub: '설명', motif: 'ticket' },
    gold: { title: '특급권', jaTitle: '特急券', sub: '정중한 부탁', motif: 'ticket' },
    diamond: { title: '지정석권', jaTitle: '指定席券', sub: '특별한 순간', motif: 'ticket' },
    xur: { title: '그린샤 승차권', jaTitle: 'グリーン車乗車券', sub: '한정', motif: 'ticket' },
  },
  C4: {
    basic: { title: '생수병', jaTitle: '水のボトル', sub: '기본', motif: 'stay' },
    bronze: { title: '일회용 칫솔', jaTitle: '使い捨て歯ブラシ', sub: '실전', motif: 'stay' },
    silver: { title: '어메니티 세트', jaTitle: 'アメニティセット', sub: '설명', motif: 'stay' },
    gold: { title: '조식권', jaTitle: '朝食券', sub: '정중한 부탁', motif: 'ticket' },
    diamond: { title: '객실 키카드', jaTitle: 'ルームキーカード', sub: '특별한 순간', motif: 'stay' },
    xur: { title: '스위트룸 키카드', jaTitle: 'スイートルームキーカード', sub: '한정', motif: 'stay' },
  },
  C5: {
    basic: { title: '역 앞 안내 지도', jaTitle: '駅前案内地図', sub: '기본', motif: 'service' },
    bronze: { title: '도로 표지판 미니어처', jaTitle: '道路標識のミニチュア', sub: '실전', motif: 'service' },
    silver: { title: '횡단보도 신호등 모형', jaTitle: '横断歩道信号機の模型', sub: '설명', motif: 'service' },
    gold: { title: '자판기 미니어처', jaTitle: '自動販売機のミニチュア', sub: '정중한 부탁', motif: 'service' },
    diamond: { title: '상점가 등롱', jaTitle: '商店街の提灯', sub: '특별한 순간', motif: 'service' },
    xur: { title: '도쿄 거리 디오라마', jaTitle: '東京の街ジオラマ', sub: '한정', motif: 'service' },
  },
  C6: {
    basic: { title: '부직포 마스크', jaTitle: '不織布マスク', sub: '기본', motif: 'safety' },
    bronze: { title: '목캔디', jaTitle: 'のど飴', sub: '실전', motif: 'safety' },
    silver: { title: '해열 시트', jaTitle: '冷却シート', sub: '설명', motif: 'safety' },
    gold: { title: '감기약 상자', jaTitle: '風邪薬の箱', sub: '정중한 부탁', motif: 'safety' },
    diamond: { title: '위장약 상자', jaTitle: '胃腸薬の箱', sub: '특별한 순간', motif: 'safety' },
    xur: { title: '여행용 상비약 파우치', jaTitle: '携帯用常備薬ポーチ', sub: '한정', motif: 'safety' },
  },
  C7: {
    basic: { title: '양말', jaTitle: '靴下', sub: '기본', motif: 'shopping' },
    bronze: { title: '티셔츠', jaTitle: 'Tシャツ', sub: '실전', motif: 'shopping' },
    silver: { title: '에코백', jaTitle: 'エコバッグ', sub: '설명', motif: 'shopping' },
    gold: { title: '셔츠', jaTitle: 'シャツ', sub: '정중한 부탁', motif: 'shopping' },
    diamond: { title: '재킷', jaTitle: 'ジャケット', sub: '특별한 순간', motif: 'shopping' },
    xur: { title: '백화점 고급 코트', jaTitle: '百貨店の高級コート', sub: '한정', motif: 'shopping' },
  },
  C8: {
    basic: { title: '택시 표시등 모형', jaTitle: 'タクシー行灯の模型', sub: '기본', motif: 'service' },
    bronze: { title: '소형 택시 모형', jaTitle: '小型タクシーの模型', sub: '실전', motif: 'service' },
    silver: { title: '중형 택시 모형', jaTitle: '中型タクシーの模型', sub: '설명', motif: 'service' },
    gold: { title: '재팬택시 모형', jaTitle: 'JapanTaxiの模型', sub: '정중한 부탁', motif: 'service' },
    diamond: { title: '공항 정액 택시 모형', jaTitle: '空港定額タクシーの模型', sub: '특별한 순간', motif: 'service' },
    xur: { title: '하이어 차량 모형', jaTitle: 'ハイヤー車両の模型', sub: '한정', motif: 'service' },
  },
  C9: {
    basic: { title: '국내선 티켓', jaTitle: '国内線チケット', sub: '기본', motif: 'ticket' },
    bronze: { title: '수하물 태그', jaTitle: '手荷物タグ', sub: '실전', motif: 'ticket' },
    silver: { title: '소형 여객기 모형', jaTitle: '小型旅客機の模型', sub: '설명', motif: 'ticket' },
    gold: { title: '중형 여객기 모형', jaTitle: '中型旅客機の模型', sub: '정중한 부탁', motif: 'ticket' },
    diamond: { title: '대형 여객기 모형', jaTitle: '大型旅客機の模型', sub: '특별한 순간', motif: 'ticket' },
    xur: { title: '국제선 여객기 모형', jaTitle: '国際線旅客機の模型', sub: '한정', motif: 'ticket' },
  },
  C10: {
    basic: { title: '10엔 동전', jaTitle: '10円硬貨', sub: '기본', motif: 'shopping' },
    bronze: { title: '100엔 동전', jaTitle: '100円硬貨', sub: '실전', motif: 'shopping' },
    silver: { title: '500엔 동전', jaTitle: '500円硬貨', sub: '설명', motif: 'shopping' },
    gold: { title: '1,000엔 지폐', jaTitle: '千円札', sub: '정중한 부탁', motif: 'shopping' },
    diamond: { title: '5,000엔 지폐', jaTitle: '五千円札', sub: '특별한 순간', motif: 'shopping' },
    xur: { title: '10,000엔 지폐', jaTitle: '一万円札', sub: '한정', motif: 'shopping' },
  },
  C11: {
    basic: { title: '로커 투입 동전', jaTitle: 'ロッカー投入硬貨', sub: '기본', motif: 'service' },
    bronze: { title: '소형 로커 모형', jaTitle: '小型ロッカーの模型', sub: '실전', motif: 'service' },
    silver: { title: '중형 로커 모형', jaTitle: '中型ロッカーの模型', sub: '설명', motif: 'service' },
    gold: { title: '대형 로커 모형', jaTitle: '大型ロッカーの模型', sub: '정중한 부탁', motif: 'service' },
    diamond: { title: 'IC 로커 모형', jaTitle: 'ICロッカーの模型', sub: '특별한 순간', motif: 'service' },
    xur: { title: '공항 대형 로커 모형', jaTitle: '空港大型ロッカーの模型', sub: '한정', motif: 'service' },
  },
  C12: {
    basic: { title: '택배 송장', jaTitle: '宅配伝票', sub: '기본', motif: 'service' },
    bronze: { title: '택배 봉투', jaTitle: '宅配用封筒', sub: '실전', motif: 'service' },
    silver: { title: '60사이즈 박스', jaTitle: '60サイズの箱', sub: '설명', motif: 'service' },
    gold: { title: '80사이즈 박스', jaTitle: '80サイズの箱', sub: '정중한 부탁', motif: 'service' },
    diamond: { title: '쿨택배 박스', jaTitle: 'クール宅急便の箱', sub: '특별한 순간', motif: 'service' },
    xur: { title: '국제택배 박스', jaTitle: '国際宅配便の箱', sub: '한정', motif: 'service' },
  },
  C13: {
    basic: { title: '쇼유라멘', jaTitle: '醤油ラーメン', sub: '기본', motif: 'food' },
    bronze: { title: '시오라멘', jaTitle: '塩ラーメン', sub: '실전', motif: 'food' },
    silver: { title: '미소라멘', jaTitle: '味噌ラーメン', sub: '설명', motif: 'food' },
    gold: { title: '돈코츠라멘', jaTitle: '豚骨ラーメン', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '차슈멘', jaTitle: 'チャーシュー麺', sub: '특별한 순간', motif: 'food' },
    xur: { title: '특제 전부노세 라멘', jaTitle: '特製全部乗せラーメン', sub: '한정', motif: 'food' },
  },
  C14: {
    basic: { title: '아이스커피', jaTitle: 'アイスコーヒー', sub: '기본', motif: 'drink' },
    bronze: { title: '블렌드 커피', jaTitle: 'ブレンドコーヒー', sub: '실전', motif: 'drink' },
    silver: { title: '카페라떼', jaTitle: 'カフェラテ', sub: '설명', motif: 'drink' },
    gold: { title: '말차라떼', jaTitle: '抹茶ラテ', sub: '정중한 부탁', motif: 'drink' },
    diamond: { title: '케이크 세트', jaTitle: 'ケーキセット', sub: '특별한 순간', motif: 'drink' },
    xur: { title: '계절 파르페', jaTitle: '季節のパフェ', sub: '한정', motif: 'drink' },
  },
  C15: {
    basic: { title: '단팥빵', jaTitle: 'あんパン', sub: '기본', motif: 'food' },
    bronze: { title: '멜론빵', jaTitle: 'メロンパン', sub: '실전', motif: 'food' },
    silver: { title: '카레빵', jaTitle: 'カレーパン', sub: '설명', motif: 'food' },
    gold: { title: '야키소바빵', jaTitle: '焼きそばパン', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '갓 구운 식빵', jaTitle: '焼きたて食パン', sub: '특별한 순간', motif: 'food' },
    xur: { title: '프리미엄 크루아상 세트', jaTitle: 'プレミアムクロワッサンセット', sub: '한정', motif: 'food' },
  },
  C16: {
    basic: { title: '에다마메', jaTitle: '枝豆', sub: '기본', motif: 'food' },
    bronze: { title: '오토시 접시', jaTitle: 'お通しの皿', sub: '실전', motif: 'food' },
    silver: { title: '생맥주 조키', jaTitle: '生ビールジョッキ', sub: '설명', motif: 'drink' },
    gold: { title: '야키토리 접시', jaTitle: '焼き鳥の皿', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '가라아게 접시', jaTitle: 'から揚げの皿', sub: '특별한 순간', motif: 'food' },
    xur: { title: '사시미 모리아와세', jaTitle: '刺身盛り合わせ', sub: '한정', motif: 'food' },
  },
  C17: {
    basic: { title: '타마고 니기리', jaTitle: '玉子握り', sub: '기본', motif: 'food' },
    bronze: { title: '이카 니기리', jaTitle: 'いか握り', sub: '실전', motif: 'food' },
    silver: { title: '마구로 니기리', jaTitle: 'まぐろ握り', sub: '설명', motif: 'food' },
    gold: { title: '아나고 니기리', jaTitle: '穴子握り', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '오토로 니기리', jaTitle: '大トロ握り', sub: '특별한 순간', motif: 'food' },
    xur: { title: '오마카세 니기리 세트', jaTitle: 'おまかせ握りセット', sub: '한정', motif: 'food' },
  },
  C18: {
    basic: { title: '관광 스탬프', jaTitle: '観光スタンプ', sub: '기본', motif: 'ticket' },
    bronze: { title: '관광 팸플릿', jaTitle: '観光パンフレット', sub: '실전', motif: 'ticket' },
    silver: { title: '지역 지도', jaTitle: '地域の地図', sub: '설명', motif: 'ticket' },
    gold: { title: '버스 1일권', jaTitle: 'バス一日券', sub: '정중한 부탁', motif: 'ticket' },
    diamond: { title: '지역 관광패스', jaTitle: '地域観光パス', sub: '특별한 순간', motif: 'ticket' },
    xur: { title: '스탬프 랠리 북', jaTitle: 'スタンプラリーブック', sub: '한정', motif: 'ticket' },
  },
  C19: {
    basic: { title: '5엔 동전', jaTitle: '五円硬貨', sub: '기본', motif: 'festival' },
    bronze: { title: '오미쿠지', jaTitle: 'おみくじ', sub: '실전', motif: 'festival' },
    silver: { title: '에마 목패', jaTitle: '絵馬', sub: '설명', motif: 'festival' },
    gold: { title: '오마모리', jaTitle: 'お守り', sub: '정중한 부탁', motif: 'festival' },
    diamond: { title: '고슈인장', jaTitle: '御朱印帳', sub: '특별한 순간', motif: 'festival' },
    xur: { title: '계절 한정 고슈인', jaTitle: '季節限定の御朱印', sub: '한정', motif: 'festival' },
  },
  C20: {
    basic: { title: '작은 온천 수건', jaTitle: '小さな温泉タオル', sub: '기본', motif: 'stay' },
    bronze: { title: '우유병', jaTitle: '牛乳瓶', sub: '실전', motif: 'stay' },
    silver: { title: '목욕 바구니', jaTitle: '湯かご', sub: '설명', motif: 'stay' },
    gold: { title: '유카타', jaTitle: '浴衣', sub: '정중한 부탁', motif: 'stay' },
    diamond: { title: '온천 입욕권', jaTitle: '温泉入浴券', sub: '특별한 순간', motif: 'stay' },
    xur: { title: '개인탕 열쇠', jaTitle: '貸切風呂の鍵', sub: '한정', motif: 'stay' },
  },
  C21: {
    basic: { title: '유카타 허리끈', jaTitle: '浴衣の帯', sub: '기본', motif: 'stay' },
    bronze: { title: '게타', jaTitle: '下駄', sub: '실전', motif: 'stay' },
    silver: { title: '객실 열쇠', jaTitle: '客室の鍵', sub: '설명', motif: 'stay' },
    gold: { title: '온천 만주', jaTitle: '温泉まんじゅう', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '가이세키 상', jaTitle: '会席膳', sub: '특별한 순간', motif: 'food' },
    xur: { title: '전통 문양 객실 열쇠', jaTitle: '伝統柄の客室キー', sub: '한정', motif: 'stay' },
  },
  C22: {
    basic: { title: '정리권', jaTitle: '整理券', sub: '기본', motif: 'ticket' },
    bronze: { title: '1회 승차권', jaTitle: '一回乗車券', sub: '실전', motif: 'ticket' },
    silver: { title: 'IC 충전 영수증', jaTitle: 'ICチャージのレシート', sub: '설명', motif: 'ticket' },
    gold: { title: '노선버스 1일 승차권', jaTitle: '路線バス一日乗車券', sub: '정중한 부탁', motif: 'ticket' },
    diamond: { title: '공항 리무진 티켓', jaTitle: '空港リムジンチケット', sub: '특별한 순간', motif: 'ticket' },
    xur: { title: '고속버스 티켓', jaTitle: '高速バスチケット', sub: '한정', motif: 'ticket' },
  },
  C23: {
    basic: { title: '자유석 특급권', jaTitle: '自由席特急券', sub: '기본', motif: 'ticket' },
    bronze: { title: '에키벤', jaTitle: '駅弁', sub: '실전', motif: 'food' },
    silver: { title: '지정석 특급권', jaTitle: '指定席特急券', sub: '설명', motif: 'ticket' },
    gold: { title: '그린샤권', jaTitle: 'グリーン車券', sub: '정중한 부탁', motif: 'ticket' },
    diamond: { title: '그란클라스권', jaTitle: 'グランクラス券', sub: '특별한 순간', motif: 'ticket' },
    xur: { title: '신칸센 모형', jaTitle: '新幹線の模型', sub: '한정', motif: 'ticket' },
  },
  C24: {
    basic: { title: '경차 모형', jaTitle: '軽自動車の模型', sub: '기본', motif: 'service' },
    bronze: { title: '소형차 모형', jaTitle: '小型車の模型', sub: '실전', motif: 'service' },
    silver: { title: '세단 모형', jaTitle: 'セダンの模型', sub: '설명', motif: 'service' },
    gold: { title: '미니밴 모형', jaTitle: 'ミニバンの模型', sub: '정중한 부탁', motif: 'service' },
    diamond: { title: 'SUV 모형', jaTitle: 'SUVの模型', sub: '특별한 순간', motif: 'service' },
    xur: { title: '스포츠카 모형', jaTitle: 'スポーツカーの模型', sub: '한정', motif: 'service' },
  },
  C25: {
    basic: { title: '접수 번호표', jaTitle: '受付番号札', sub: '기본', motif: 'safety' },
    bronze: { title: '문진표', jaTitle: '問診票', sub: '실전', motif: 'safety' },
    silver: { title: '진찰권', jaTitle: '診察券', sub: '설명', motif: 'safety' },
    gold: { title: '처방전', jaTitle: '処方箋', sub: '정중한 부탁', motif: 'safety' },
    diamond: { title: '약 봉투', jaTitle: '薬袋', sub: '특별한 순간', motif: 'safety' },
    xur: { title: '오쿠스리 수첩', jaTitle: 'お薬手帳', sub: '한정', motif: 'safety' },
  },
  C26: {
    basic: { title: '파출소 표지 미니어처', jaTitle: '交番標識のミニチュア', sub: '기본', motif: 'safety' },
    bronze: { title: '분실물 메모', jaTitle: '遺失物メモ', sub: '실전', motif: 'safety' },
    silver: { title: '분실 신고서', jaTitle: '遺失届', sub: '설명', motif: 'safety' },
    gold: { title: '접수증', jaTitle: '受付証', sub: '정중한 부탁', motif: 'safety' },
    diamond: { title: '교통안전 반사태그', jaTitle: '交通安全反射タグ', sub: '특별한 순간', motif: 'safety' },
    xur: { title: '경찰차 모형', jaTitle: 'パトカーの模型', sub: '한정', motif: 'safety' },
  },
  C27: {
    basic: { title: '비상 연락 카드', jaTitle: '緊急連絡カード', sub: '기본', motif: 'safety' },
    bronze: { title: '호루라기', jaTitle: '笛', sub: '실전', motif: 'safety' },
    silver: { title: '휴대용 손전등', jaTitle: '携帯用懐中電灯', sub: '설명', motif: 'safety' },
    gold: { title: '응급키트', jaTitle: '救急キット', sub: '정중한 부탁', motif: 'safety' },
    diamond: { title: '방수 파우치', jaTitle: '防水ポーチ', sub: '특별한 순간', motif: 'safety' },
    xur: { title: '비상 귀가 세트', jaTitle: '緊急帰宅セット', sub: '한정', motif: 'safety' },
  },
  C28: {
    basic: { title: 'SIM 핀', jaTitle: 'SIMピン', sub: '기본', motif: 'service' },
    bronze: { title: 'SIM 카드', jaTitle: 'SIMカード', sub: '실전', motif: 'service' },
    silver: { title: '데이터 플랜 카드', jaTitle: 'データプランカード', sub: '설명', motif: 'service' },
    gold: { title: '포켓 와이파이', jaTitle: 'ポケットWi-Fi', sub: '정중한 부탁', motif: 'service' },
    diamond: { title: '보조배터리', jaTitle: 'モバイルバッテリー', sub: '특별한 순간', motif: 'service' },
    xur: { title: '고급 로밍 라우터', jaTitle: '高級ローミングルーター', sub: '한정', motif: 'service' },
  },
  C29: {
    basic: { title: '100엔 세탁 코인', jaTitle: '100円の洗濯コイン', sub: '기본', motif: 'service' },
    bronze: { title: '세제 소포장', jaTitle: '洗剤の小分けパック', sub: '실전', motif: 'service' },
    silver: { title: '세탁망', jaTitle: '洗濯ネット', sub: '설명', motif: 'service' },
    gold: { title: '건조기 시트', jaTitle: '乾燥機シート', sub: '정중한 부탁', motif: 'service' },
    diamond: { title: '세탁 바구니', jaTitle: '洗濯かご', sub: '특별한 순간', motif: 'service' },
    xur: { title: '여행용 세탁 세트', jaTitle: 'トラベル用洗濯セット', sub: '한정', motif: 'service' },
  },
  C30: {
    basic: { title: '우치와', jaTitle: 'うちわ', sub: '기본', motif: 'festival' },
    bronze: { title: '타코야키', jaTitle: 'たこ焼き', sub: '실전', motif: 'festival' },
    silver: { title: '야키소바', jaTitle: '焼きそば', sub: '설명', motif: 'festival' },
    gold: { title: '금붕어 뜰채', jaTitle: '金魚すくいの網', sub: '정중한 부탁', motif: 'festival' },
    diamond: { title: '마츠리 수건', jaTitle: '祭りの手ぬぐい', sub: '특별한 순간', motif: 'festival' },
    xur: { title: '축제 등롱 미니어처', jaTitle: '祭り提灯のミニチュア', sub: '한정', motif: 'festival' },
  },
  C31: {
    basic: { title: '100엔 접시', jaTitle: '100円皿', sub: '기본', motif: 'food' },
    bronze: { title: '타마고 접시', jaTitle: '玉子の皿', sub: '실전', motif: 'food' },
    silver: { title: '마구로 접시', jaTitle: 'まぐろの皿', sub: '설명', motif: 'food' },
    gold: { title: '연어 접시', jaTitle: 'サーモンの皿', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '특선 접시', jaTitle: '特選皿', sub: '특별한 순간', motif: 'food' },
    xur: { title: '대토로 접시', jaTitle: '大トロの皿', sub: '한정', motif: 'food' },
  },
  C32: {
    basic: { title: 'S사이즈 티셔츠', jaTitle: 'Sサイズのシャツ', sub: '기본', motif: 'shopping' },
    bronze: { title: 'M사이즈 니트', jaTitle: 'Mサイズのニット', sub: '실전', motif: 'shopping' },
    silver: { title: 'L사이즈 셔츠', jaTitle: 'Lサイズのシャツ', sub: '설명', motif: 'shopping' },
    gold: { title: '데님 팬츠', jaTitle: 'デニムパンツ', sub: '정중한 부탁', motif: 'shopping' },
    diamond: { title: '셀렉트 재킷', jaTitle: 'セレクトジャケット', sub: '특별한 순간', motif: 'shopping' },
    xur: { title: '울 코트', jaTitle: 'ウールコート', sub: '한정', motif: 'shopping' },
  },
  C33: {
    basic: { title: '비닐우산', jaTitle: 'ビニール傘', sub: '기본', motif: 'stay' },
    bronze: { title: '접이식 우산', jaTitle: '折りたたみ傘', sub: '실전', motif: 'stay' },
    silver: { title: '프런트 우산', jaTitle: 'フロントの傘', sub: '설명', motif: 'stay' },
    gold: { title: '장우산', jaTitle: '長傘', sub: '정중한 부탁', motif: 'stay' },
    diamond: { title: '호텔 로고 우산', jaTitle: 'ホテルロゴ傘', sub: '특별한 순간', motif: 'stay' },
    xur: { title: '전통 무늬 우산', jaTitle: '伝統柄の傘', sub: '한정', motif: 'stay' },
  },
  C34: {
    basic: { title: '객실 요청 메모', jaTitle: '客室リクエストメモ', sub: '기본', motif: 'stay' },
    bronze: { title: '새 객실 키카드', jaTitle: '新しい客室キーカード', sub: '실전', motif: 'stay' },
    silver: { title: '트윈룸 키카드', jaTitle: 'ツインルームキーカード', sub: '설명', motif: 'stay' },
    gold: { title: '상층 객실 키카드', jaTitle: '上層階客室キーカード', sub: '정중한 부탁', motif: 'stay' },
    diamond: { title: '디럭스룸 키카드', jaTitle: 'デラックスルームキーカード', sub: '특별한 순간', motif: 'stay' },
    xur: { title: '스위트룸 웰컴 카드', jaTitle: 'スイートルームウェルカムカード', sub: '한정', motif: 'stay' },
  },
  C35: {
    basic: { title: '일반 승차권', jaTitle: '普通乗車券', sub: '기본', motif: 'ticket' },
    bronze: { title: '매표소 번호표', jaTitle: '切符売り場の番号札', sub: '실전', motif: 'ticket' },
    silver: { title: '스카이라이너권', jaTitle: 'スカイライナー券', sub: '설명', motif: 'ticket' },
    gold: { title: '나리타 익스프레스권', jaTitle: '成田エクスプレス券', sub: '정중한 부탁', motif: 'ticket' },
    diamond: { title: 'NEX 지정석권', jaTitle: 'NEX指定席券', sub: '특별한 순간', motif: 'ticket' },
    xur: { title: '특급열차 모형', jaTitle: '特急列車の模型', sub: '한정', motif: 'ticket' },
  },
  C36: {
    basic: { title: '캐리어 태그', jaTitle: 'キャリータグ', sub: '기본', motif: 'service' },
    bronze: { title: '수하물 저울표', jaTitle: '手荷物計量票', sub: '실전', motif: 'service' },
    silver: { title: '초과수하물 영수증', jaTitle: '超過手荷物レシート', sub: '설명', motif: 'service' },
    gold: { title: '압축 파우치', jaTitle: '圧縮ポーチ', sub: '정중한 부탁', motif: 'service' },
    diamond: { title: '수하물 배송 전표', jaTitle: '手荷物配送伝票', sub: '특별한 순간', motif: 'service' },
    xur: { title: '프리미엄 캐리어', jaTitle: 'プレミアムキャリーケース', sub: '한정', motif: 'service' },
  },
  C37: {
    basic: { title: '밥공기', jaTitle: 'ご飯茶碗', sub: '기본', motif: 'food' },
    bronze: { title: '미소시루 그릇', jaTitle: '味噌汁のお椀', sub: '실전', motif: 'food' },
    silver: { title: '낫토 소포장', jaTitle: '納豆の小分けパック', sub: '설명', motif: 'food' },
    gold: { title: '생선구이 정식', jaTitle: '焼き魚定食', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '오믈렛 접시', jaTitle: 'オムレツの皿', sub: '특별한 순간', motif: 'food' },
    xur: { title: '와쇼쿠 조식 찬합', jaTitle: '和食朝食の重箱', sub: '한정', motif: 'food' },
  },
  C38: {
    basic: { title: '네타 이름표', jaTitle: 'ネタの名前札', sub: '기본', motif: 'food' },
    bronze: { title: '아지 니기리', jaTitle: 'あじ握り', sub: '실전', motif: 'food' },
    silver: { title: '히라메 니기리', jaTitle: 'ひらめ握り', sub: '설명', motif: 'food' },
    gold: { title: '킨메다이 니기리', jaTitle: '金目鯛握り', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '우니 군함', jaTitle: 'うにの軍艦', sub: '특별한 순간', motif: 'food' },
    xur: { title: '계절 네타 모둠', jaTitle: '季節ネタの盛り合わせ', sub: '한정', motif: 'food' },
  },
  C39: {
    basic: { title: '나폴리탄', jaTitle: 'ナポリタン', sub: '기본', motif: 'food' },
    bronze: { title: '토마토 파스타', jaTitle: 'トマトパスタ', sub: '실전', motif: 'food' },
    silver: { title: '크림 파스타', jaTitle: 'クリームパスタ', sub: '설명', motif: 'food' },
    gold: { title: '멘타이코 파스타', jaTitle: '明太子パスタ', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '해산물 파스타', jaTitle: '海鮮パスタ', sub: '특별한 순간', motif: 'food' },
    xur: { title: '트러플 파스타', jaTitle: 'トリュフパスタ', sub: '한정', motif: 'food' },
  },
  C40: {
    basic: { title: '가격표 태그', jaTitle: '値札タグ', sub: '기본', motif: 'shopping' },
    bronze: { title: '쇼핑 영수증', jaTitle: '買い物レシート', sub: '실전', motif: 'shopping' },
    silver: { title: '포인트 카드', jaTitle: 'ポイントカード', sub: '설명', motif: 'shopping' },
    gold: { title: '면세 서류', jaTitle: '免税書類', sub: '정중한 부탁', motif: 'shopping' },
    diamond: { title: '선물 포장 상자', jaTitle: 'ギフト包装箱', sub: '특별한 순간', motif: 'shopping' },
    xur: { title: '백화점 상품권 봉투', jaTitle: '百貨店商品券の封筒', sub: '한정', motif: 'shopping' },
  },
  C41: {
    basic: { title: '번호표', jaTitle: '番号札', sub: '기본', motif: 'service' },
    bronze: { title: '층별 안내도', jaTitle: 'フロア案内図', sub: '실전', motif: 'service' },
    silver: { title: '교환 신청서', jaTitle: '交換申請書', sub: '설명', motif: 'service' },
    gold: { title: '환불 영수증', jaTitle: '返金レシート', sub: '정중한 부탁', motif: 'service' },
    diamond: { title: '고객센터 접수표', jaTitle: 'カスタマーセンター受付票', sub: '특별한 순간', motif: 'service' },
    xur: { title: '라운지 초대권', jaTitle: 'ラウンジ招待券', sub: '한정', motif: 'service' },
  },
  C42: {
    basic: { title: '자판기용 100엔 동전', jaTitle: '自販機用100円硬貨', sub: '기본', motif: 'drink' },
    bronze: { title: '물 페트병', jaTitle: '水のペットボトル', sub: '실전', motif: 'drink' },
    silver: { title: '녹차 페트병', jaTitle: '緑茶のペットボトル', sub: '설명', motif: 'drink' },
    gold: { title: '캔커피', jaTitle: '缶コーヒー', sub: '정중한 부탁', motif: 'drink' },
    diamond: { title: '에너지 드링크', jaTitle: 'エナジードリンク', sub: '특별한 순간', motif: 'drink' },
    xur: { title: '지역 한정 음료', jaTitle: 'ご当地限定ドリンク', sub: '한정', motif: 'drink' },
  },
  C43: {
    basic: { title: 'ATM 이용 명세표', jaTitle: 'ATM利用明細票', sub: '기본', motif: 'service' },
    bronze: { title: '출금 영수증', jaTitle: '引き出しレシート', sub: '실전', motif: 'service' },
    silver: { title: '현금 봉투', jaTitle: '現金封筒', sub: '설명', motif: 'service' },
    gold: { title: '1,000엔 지폐 묶음', jaTitle: '千円札の束', sub: '정중한 부탁', motif: 'service' },
    diamond: { title: '10,000엔 지폐 묶음', jaTitle: '一万円札の束', sub: '특별한 순간', motif: 'service' },
    xur: { title: '여행 예산 봉투 세트', jaTitle: '旅行予算封筒セット', sub: '한정', motif: 'service' },
  },
  C44: {
    basic: { title: '복사 영수증', jaTitle: 'コピーのレシート', sub: '기본', motif: 'service' },
    bronze: { title: '흑백 복사 출력물', jaTitle: '白黒コピーの出力紙', sub: '실전', motif: 'service' },
    silver: { title: '컬러 복사 출력물', jaTitle: 'カラーコピーの出力紙', sub: '설명', motif: 'service' },
    gold: { title: '사진 프린트', jaTitle: '写真プリント', sub: '정중한 부탁', motif: 'service' },
    diamond: { title: '프린트 예약번호', jaTitle: 'プリント予約番号', sub: '특별한 순간', motif: 'service' },
    xur: { title: '멀티프린트 파일', jaTitle: 'マルチプリントファイル', sub: '한정', motif: 'service' },
  },
  C45: {
    basic: { title: '픽업 번호표', jaTitle: '受け取り番号札', sub: '기본', motif: 'food' },
    bronze: { title: '컵홀더', jaTitle: 'カップホルダー', sub: '실전', motif: 'food' },
    silver: { title: '테이크아웃 컵', jaTitle: 'テイクアウトカップ', sub: '설명', motif: 'food' },
    gold: { title: '테이크아웃 봉투', jaTitle: 'テイクアウト袋', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '도시락 박스', jaTitle: '弁当箱', sub: '특별한 순간', motif: 'food' },
    xur: { title: '케이크 박스', jaTitle: 'ケーキ箱', sub: '한정', motif: 'food' },
  },
  C46: {
    basic: { title: '입장 티켓', jaTitle: '入場チケット', sub: '기본', motif: 'festival' },
    bronze: { title: '응원 타월', jaTitle: '応援タオル', sub: '실전', motif: 'festival' },
    silver: { title: '야구모자', jaTitle: '野球帽', sub: '설명', motif: 'festival' },
    gold: { title: '야구장 도시락', jaTitle: '球場弁当', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '유니폼', jaTitle: 'ユニフォーム', sub: '특별한 순간', motif: 'festival' },
    xur: { title: '한정 응원 굿즈 세트', jaTitle: '限定応援グッズセット', sub: '한정', motif: 'festival' },
  },
  C47: {
    basic: { title: '쇼핑몰 플로어맵', jaTitle: 'モールのフロアマップ', sub: '기본', motif: 'shopping' },
    bronze: { title: '쿠폰북', jaTitle: 'クーポンブック', sub: '실전', motif: 'shopping' },
    silver: { title: '기프트 카드', jaTitle: 'ギフトカード', sub: '설명', motif: 'shopping' },
    gold: { title: '상품권 봉투', jaTitle: '商品券の封筒', sub: '정중한 부탁', motif: 'shopping' },
    diamond: { title: '라운지 이용권', jaTitle: 'ラウンジ利用券', sub: '특별한 순간', motif: 'shopping' },
    xur: { title: '한정 노벨티 쇼핑백', jaTitle: '限定ノベルティショッピングバッグ', sub: '한정', motif: 'shopping' },
  },
  C48: {
    basic: { title: '조제 안내표', jaTitle: '調剤案内票', sub: '기본', motif: 'safety' },
    bronze: { title: '조제 번호표', jaTitle: '調剤番号札', sub: '실전', motif: 'safety' },
    silver: { title: '조제 약봉투', jaTitle: '調剤薬袋', sub: '설명', motif: 'safety' },
    gold: { title: '약병', jaTitle: '薬瓶', sub: '정중한 부탁', motif: 'safety' },
    diamond: { title: '오쿠스리 수첩 케이스', jaTitle: 'お薬手帳ケース', sub: '특별한 순간', motif: 'safety' },
    xur: { title: '조제약 파우치 세트', jaTitle: '調剤薬ポーチセット', sub: '한정', motif: 'safety' },
  },
  C49: {
    basic: { title: '코하다 니기리', jaTitle: 'こはだ握り', sub: '기본', motif: 'food' },
    bronze: { title: '아카미 니기리', jaTitle: '赤身握り', sub: '실전', motif: 'food' },
    silver: { title: '주토로 니기리', jaTitle: '中トロ握り', sub: '설명', motif: 'food' },
    gold: { title: '무라사키 우니 군함', jaTitle: '紫うにの軍艦', sub: '정중한 부탁', motif: 'food' },
    diamond: { title: '대토로 니기리', jaTitle: '大トロ握り', sub: '특별한 순간', motif: 'food' },
    xur: { title: '오마카세 6관 세트', jaTitle: 'おまかせ6貫セット', sub: '한정', motif: 'food' },
  },
  C50: {
    basic: { title: '스마트폰 지도 화면', jaTitle: 'スマホの地図画面', sub: '기본', motif: 'safety' },
    bronze: { title: '근처 역 메모', jaTitle: '近くの駅メモ', sub: '실전', motif: 'safety' },
    silver: { title: '골목 표지판 사진', jaTitle: '路地標識の写真', sub: '설명', motif: 'safety' },
    gold: { title: '우회 경로 메모', jaTitle: '迂回ルートメモ', sub: '정중한 부탁', motif: 'safety' },
    diamond: { title: '손그림 길찾기 메모', jaTitle: '手描きの道案内メモ', sub: '특별한 순간', motif: 'safety' },
    xur: { title: '비상 귀가 루트 카드', jaTitle: '緊急帰宅ルートカード', sub: '한정', motif: 'safety' },
  },
};

function itemForKey(missionId: string | undefined, rarity: Rarity): GachaItemArt {
  const row = missionId ? BY_MISSION[missionId] : undefined;
  return row?.[rarity] ?? GENERIC[rarity];
}

export function gachaItemForMission(missionId: string | undefined, rarity: Rarity): GachaItemArt {
  return withGeneratedImage(itemForKey(missionId, rarity), rarity);
}

export function gachaLabItemForMission(missionId: string | undefined, rarity: Rarity): GachaItemArt {
  return withGeneratedImage(itemForKey(missionId, rarity), rarity);
}
