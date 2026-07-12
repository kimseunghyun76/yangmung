import { allUnits, type LearningUnit, type UnitKind } from './curriculum';
import { rewardImageForUnit } from './rewardImages';
import type { ProgressState } from './progress';

export type RewardRarity = 'basic' | 'bronze' | 'silver' | 'gold' | 'diamond' | 'xur';

export interface UnitReward {
  id: string;
  unitId: string;
  title: string;
  subtitle: string;
  rarity: RewardRarity;
  image: string;
  description: string;
}

const RARITY_LABEL: Record<RewardRarity, string> = {
  basic: 'BASIC',
  bronze: 'BRONZE',
  silver: 'SILVER',
  gold: 'GOLD',
  diamond: 'DIAMOND',
  xur: 'XUR',
};

const PREP_REWARD_TITLES: Record<string, string> = {
  P1: '직원 질문 청음 배지',
  P2: '여행 가타카나 카드',
  P3: '문장 조립 노트',
  P4: '질문 시작 카드',
  P5: '방향 확인 지도',
  P6: '엔화 계산 코인',
  P7: '부탁 표현 티켓',
  P8: '선택 표현 메뉴',
  P9: '오해 방지 태그',
  P10: '상태 설명 메모',
  P11: '정중 대응 리본',
  P12: '대화 복구 카드',
  P13: '직원 질문 마스터 북',
};

const SCENE_REWARD_TITLES: Record<string, string> = {
  S1: '스미마센 호출 벨',
  S2: '다시 듣기 카드',
  S3: '출구 방향 표지',
  S4: '2,500엔 계산표',
  S5: '짐 보관 태그',
  S6: '문제 해결 접수표',
  S7: '입국심사 스탬프',
  S8: '수하물 태그',
  S9: '공항 교통 안내권',
  S10: 'IC 교통카드',
  S11: '3번 홈 안내판',
  S12: '환승 안내표',
  S13: '택시 목적지 카드',
  S14: '호텔 키카드',
  S15: '셀프 체크인 QR',
  S16: '객실 문제 요청표',
  S17: '체크아웃 영수증',
  S18: '식당 대기표',
  S19: '추천 메뉴판',
  S20: '알레르기 확인 카드',
  S21: '식권기 티켓',
  S22: '결제 영수증',
  S23: '편의점 도시락 스티커',
  S24: '신칸센 지정석권',
  S25: '버스 정리권',
  S26: '렌터카 키',
  S27: '피팅룸 번호표',
  S28: '드럭스토어 면세 봉투',
  S29: '면세 봉인 쇼핑백',
  S30: '관광지 입장권',
  S31: '오마모리와 고슈인',
  S32: '료칸 유카타 안내패',
  S33: '체험 예약 팔찌',
  S34: '예약 변경 확인서',
  S35: '분실물 접수표',
  S36: '약국 복약 봉투',
  S37: '병원 문진표',
  S38: '에티켓 안내 카드',
  S39: '지방 버스 시간표',
  S40: '운행 장애 안내판',
  S41: '공항행 택시 카드',
  S42: '항공사 탑승권',
  S43: '탑승구 안내표',
};

const JOURNEY_REWARD_TITLES: Record<string, string> = {
  J1: '일본 도착일 세트',
  J2: '관광과 식사 세트',
  J3: '지방도시 여행 세트',
  J4: '문제 발생일 복구 세트',
  J5: '출국일 완주 세트',
};

const IMAGE_BY_KIND: Record<UnitKind, string> = {
  prep: '/scenes/quick-practice/basics.webp',
  scene: '/scenes/quick-practice/vocab.webp',
  journey: '/scenes/quick-practice/signs.webp',
};

export function rarityLabel(rarity: RewardRarity): string {
  return RARITY_LABEL[rarity];
}

export function rewardRarity(unit: LearningUnit): RewardRarity {
  if (unit.kind === 'journey') return 'xur';
  if (unit.kind === 'prep') {
    const n = Number(unit.id.slice(1));
    if (n >= 11) return 'silver';
    if (n >= 7) return 'bronze';
    return 'basic';
  }
  const n = Number(unit.id.slice(1));
  if (n >= 41) return 'diamond';
  if (n >= 34) return 'gold';
  if (n >= 24) return 'silver';
  if (n >= 7) return 'bronze';
  return 'basic';
}

export function rewardForUnit(unit: LearningUnit): UnitReward {
  const rarity = rewardRarity(unit);
  const title =
    PREP_REWARD_TITLES[unit.id]
    ?? SCENE_REWARD_TITLES[unit.id]
    ?? JOURNEY_REWARD_TITLES[unit.id]
    ?? unit.reward;
  return {
    id: `reward-${unit.id.toLowerCase()}`,
    unitId: unit.id,
    title,
    subtitle: unit.title,
    rarity,
    image: rewardImageForUnit(unit, rarity) || IMAGE_BY_KIND[unit.kind],
    description: `${unit.title} 단원을 완료하면 획득하는 여행 실전 보상입니다.`,
  };
}

export function allRewards(): UnitReward[] {
  return allUnits.map(rewardForUnit);
}

export function isRewardUnlocked(progress: ProgressState, reward: UnitReward): boolean {
  return progress.completedUnitIds.includes(reward.unitId) || progress.rewards.includes(reward.title);
}

export function collectionStats(progress: ProgressState): { total: number; unlocked: number; byRarity: Record<RewardRarity, { total: number; unlocked: number }> } {
  const rewards = allRewards();
  const base: Record<RewardRarity, { total: number; unlocked: number }> = {
    basic: { total: 0, unlocked: 0 },
    bronze: { total: 0, unlocked: 0 },
    silver: { total: 0, unlocked: 0 },
    gold: { total: 0, unlocked: 0 },
    diamond: { total: 0, unlocked: 0 },
    xur: { total: 0, unlocked: 0 },
  };
  for (const reward of rewards) {
    base[reward.rarity].total++;
    if (isRewardUnlocked(progress, reward)) base[reward.rarity].unlocked++;
  }
  return {
    total: rewards.length,
    unlocked: rewards.filter((reward) => isRewardUnlocked(progress, reward)).length,
    byRarity: base,
  };
}
