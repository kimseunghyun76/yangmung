// 미션 난이도 이동 창 — 모드별 고정 tier 범위 대신, 보여준 실력(미션 tier별 숙련도)에 따라
// 포함할 난이도를 한 단계씩 끌어올린다. 하위 tier를 충분히 익히면 그 tier를 빼고 상위 tier를 추가
// → 복습+도전을 인접 2단계로 섞어 학습 효과 극대화. (입문/기본·중급/고급을 따로 두지 않는 단일 스케일)
import type { Card } from './cards';
import type { ProgressMap } from './progress';

export const TIER_MASTER_RATIO = 0.6; // 이 tier를 "익혔다"고 볼 숙련 비율

// 미션 tier별 숙련 비율 — 2연속 정답(consecutiveCorrect≥2)을 익힘으로. index 0=tier1 … 4=tier5.
export function missionTierRatios(allCards: Card[], progress: ProgressMap): number[] {
  const total = [0, 0, 0, 0, 0];
  const mastered = [0, 0, 0, 0, 0];
  for (const c of allCards) {
    if (c.kind !== 'quiz' || c.reviewTarget?.type !== 'mission') continue;
    const t = ((c.tier ?? 1) as number) - 1;
    if (t < 0 || t > 4) continue;
    total[t]++;
    const p = progress[c.id];
    if (p && p.consecutiveCorrect >= 2) mastered[t]++;
  }
  return total.map((n, i) => (n > 0 ? mastered[i] / n : 0));
}

// 숙련 비율 → 포함할 tier 창 [min, max] (1~5). 하위 숙련 tier는 빠지고 다음 tier가 들어온다.
export function missionTierWindow(ratios: number[]): [number, number] {
  // tier1부터 연속으로 익힌 단계 수
  let done = 0;
  while (done < ratios.length && (ratios[done] ?? 0) >= TIER_MASTER_RATIO) done++;
  // 아직 tier1도 거의 안 한 시작 단계 → 초급(tier1)만
  if (done === 0 && (ratios[0] ?? 0) < 0.35) return [1, 1];
  const base = Math.min(5, done + 1);          // 현재 주력 tier (첫 미숙련)
  return [base, Math.min(5, base + 1)];          // 주력 + 다음 단계(도전)
}

// 편의: 카드+진척에서 바로 창을 계산.
export function missionDifficultyWindow(allCards: Card[], progress: ProgressMap): [number, number] {
  return missionTierWindow(missionTierRatios(allCards, progress));
}
