// 미션 묶음 — 미션별 파일을 합쳐 단일 배열로 노출 (순서 = 학습 진행 순서).
//
// 구조 (2026-06 개편):
// 1) 난이도 4단계 × 10미션 — tier 1(입문)~4(고급). C0 튜토리얼은 단계 없음.
// 2) 각 미션 5스텝 = 기본 1~3스텝(미션 파일) + 응용·종합 2스텝(data/advancedSteps.*.json).
//    한 상황 안에서 난이도가 점점 올라가는 구성. 모든 선택지는 일본어 표현 기반.
// 3) 과거의 "행동 퀴즈" 자동 필러(backfill)는 제거 — 일본어 없는 정답 배제.
import type { Mission, MissionStep } from '../types';
import { c0 } from './c0-tutorial';
import { c1 } from './c1-conbini';
import { c2 } from './c2-restaurant';
import { c3 } from './c3-train';
import { c4 } from './c4-hotel';
import { c5 } from './c5-street';
import { c6 } from './c6-pharmacy';
import { c7 } from './c7-shopping';
import { c8 } from './c8-taxi';
import { c9 } from './c9-immigration';
import { c10 } from './c10-exchange';
import { c11 } from './c11-locker';
import { c12 } from './c12-delivery';
import { c13 } from './c13-ramen';
import { moreMissions } from './c14-c30-more';
import { frictionMissions } from './c31-c40-travel-friction';
import { advancedMissions } from './c41-c50-advanced';
import advancedPart1 from '../data/advancedSteps.part1.json';
import advancedPart2 from '../data/advancedSteps.part2.json';
import advancedPart3 from '../data/advancedSteps.part3.json';
import advancedPart4 from '../data/advancedSteps.part4.json';
import advancedPart5 from '../data/advancedSteps.part5.json';

const rawMissions: Mission[] = [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, ...moreMissions, ...frictionMissions, ...advancedMissions];

// ── 난이도 단계 (tier) — 단계별 정확히 10미션 ─────────────────────────
// tier 1 입문: 생존 동선 (편의점·식당·전철·호텔·길·입국·라멘·카페·빵집·버스)
// tier 2 기본: 생활 확장 (약국·쇼핑·택시·환전·로커·택배·이자카야·안내소·세탁·축제)
// tier 3 응용: 문화·체험 (스시·신사·온천·료칸·신칸센·회전초밥·시착·우산·뷔페·파스타)
// tier 4 고급: 트러블·교섭 (렌터카·병원·분실·긴급·유심·방교체·티켓교환·수하물·스시추가·면세계산)
const TIER: Record<string, 1 | 2 | 3 | 4 | 5> = {
  C1: 1, C2: 1, C3: 1, C4: 1, C5: 1, C9: 1, C13: 1, C14: 1, C15: 1, C22: 1,
  C6: 2, C7: 2, C8: 2, C10: 2, C11: 2, C12: 2, C16: 2, C18: 2, C29: 2, C30: 2,
  C17: 3, C19: 3, C20: 3, C21: 3, C23: 3, C31: 3, C32: 3, C33: 3, C37: 3, C39: 3,
  C24: 4, C25: 4, C26: 4, C27: 4, C28: 4, C34: 4, C35: 4, C36: 4, C38: 4, C40: 4,
  // tier 5 고급심화: 마찰 교섭·복합 상황 (환불·자판기·ATM·복합기·픽업·스포츠·안내소·약국·오마카세·길잃음)
  C41: 5, C42: 5, C43: 5, C44: 5, C45: 5, C46: 5, C47: 5, C48: 5, C49: 5, C50: 5,
};

// ── 응용·종합 스텝 (4·5스텝) — JSON으로 관리되는 일본어 기반 콘텐츠 ────
const ADVANCED_STEPS: Record<string, MissionStep[]> = {
  ...(advancedPart1 as unknown as Record<string, MissionStep[]>),
  ...(advancedPart2 as unknown as Record<string, MissionStep[]>),
  ...(advancedPart3 as unknown as Record<string, MissionStep[]>),
  ...(advancedPart4 as unknown as Record<string, MissionStep[]>),
  ...(advancedPart5 as unknown as Record<string, MissionStep[]>),
};

// ── 프롬프트 보강 — 상대 발화가 없는 스텝에 자연스러운 일본어 큐 부여 ──
// 학습자가 먼저 말을 거는 스텝(speaker '나')은 큐 없이 상황 문구만 보여준다.
type RecapCue = {
  speaker: string;
  ja: string;
  ko: string;
};

const recapCueByStep: Record<string, Record<number, RecapCue>> = {
  C2: {
    4: { speaker: '점원', ja: 'ご注文は以上でよろしいですか', ko: '주문은 이상으로 괜찮으세요?' },
    5: { speaker: '점원', ja: '苦手なものやアレルギーはありますか', ko: '못 드시는 것이나 알레르기가 있나요?' },
  },
  C3: {
    2: { speaker: '역무원', ja: '切符ですかチャージですか', ko: '표인가요, 충전인가요?' },
  },
  C4: {
    1: { speaker: '프런트', ja: 'チェックインですか', ko: '체크인이신가요?' },
    5: { speaker: '프런트', ja: 'ほかにご不明な点はありますか', ko: '그 밖에 궁금한 점이 있으신가요?' },
  },
  C5: {
    1: { speaker: '상대', ja: 'どうしましたか', ko: '무슨 일이세요?' },
    2: { speaker: '상대', ja: '写真ですか', ko: '사진인가요?' },
    3: { speaker: '상대', ja: '大丈夫ですか', ko: '괜찮으세요?' },
  },
  C6: {
    2: { speaker: '약사', ja: 'どんな薬をお探しですか', ko: '어떤 약을 찾고 계세요?' },
  },
  C7: {
    1: { speaker: '직원', ja: '何かお探しですか', ko: '무엇을 찾고 계세요?' },
    2: { speaker: '직원', ja: '免税をご利用ですか', ko: '면세를 이용하시나요?' },
    3: { speaker: '직원', ja: 'お支払いはどうしますか', ko: '결제는 어떻게 하시겠어요?' },
  },
  C8: {
    1: { speaker: '기사', ja: 'どちらまで行きますか', ko: '어디까지 가시나요?' },
    3: { speaker: '기사', ja: 'この辺りでよろしいですか', ko: '이 근처면 괜찮으세요?' },
  },
  C10: {
    1: { speaker: '직원', ja: 'いくら両替しますか', ko: '얼마를 환전하시겠어요?' },
    3: { speaker: '직원', ja: '細かいお札も必要ですか', ko: '잔돈 지폐도 필요하세요?' },
  },
  C13: {
    1: { speaker: '직원', ja: '食券を先に買ってください', ko: '식권을 먼저 사 주세요' },
    3: { speaker: '직원', ja: '麺の量はどうしますか', ko: '면 양은 어떻게 하시겠어요?' },
  },
};

const normalizeMission = (mission: Mission): Mission => {
  if (mission.id === 'C0') return mission;
  // 기본 스텝(1~3) + 응용·종합 스텝(advancedSteps) — 한 상황의 난이도 점증 구성
  const steps = [...mission.steps, ...(ADVANCED_STEPS[mission.id] ?? [])];
  return {
    ...mission,
    tier: TIER[mission.id],
    steps: steps.map((step, i) => {
      if (step.promptPhraseId || step.recapPromptJa) return step;
      const cue = recapCueByStep[mission.id]?.[i + 1];
      if (!cue) return step;
      return {
        ...step,
        speaker: cue.speaker,
        recapPromptJa: cue.ja,
        recapPromptKo: cue.ko,
      };
    }),
  };
};

const normalized = rawMissions.map(normalizeMission);

// tier 순서대로 정렬 (C0 → tier1 → … → tier5, 같은 tier 안에서는 기존 순서 유지)
const tierOf = (m: Mission) => (m.id === 'C0' ? 0 : (TIER as Record<string, number>)[m.id] ?? 9);
export const missions: Mission[] = [...normalized].sort((a, b) => tierOf(a) - tierOf(b));
