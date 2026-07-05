// 학습 현황 공용 통계 — 홈(내 학습 현황)과 도감(가챠)에서 함께 쓰는 계급·학습일·정답률 계산.
// 원래 Gacha.tsx 안에만 있던 걸 분리해서 홈 화면과 병합할 수 있게 함.
import { useMemo } from 'react';
import { honorTrophyCount, totalItems, type Collection } from './collection';
import { loadProgress } from './progress';

export const RANKS = ['이등병', '일병', '상병', '병장', '하사', '중사', '상사', '원사', '소위', '중위', '대위', '소령', '중령', '대령', '준장', '소장', '중장', '대장', '원수'];

function totalItemsAll(c: Collection): number {
  return Object.values(c.cards).reduce((sum, card) => sum + totalItems(card), 0);
}

export interface LearningStats {
  attempts: number;
  correct: number;
  dates: string[];
  dayCounts: Record<string, number>;
  rank: string;
  rankScore: number;
  nextAt: number;
}

export function useLearningStats(collection: Collection): LearningStats {
  return useMemo(() => {
    const progress = loadProgress();
    const attempts = Object.values(progress).reduce((sum, p) => sum + p.attempts, 0);
    const correct = Object.values(progress).reduce((sum, p) => sum + p.correct, 0);
    const dayCounts = Object.values(progress).reduce<Record<string, number>>((acc, p) => {
      const d = p.lastSeenAt?.slice(0, 10);
      if (d) acc[d] = (acc[d] ?? 0) + p.attempts;
      return acc;
    }, {});
    const dates = Object.keys(dayCounts).sort();
    const rankScore = attempts + totalItemsAll(collection) * 4 + honorTrophyCount(collection) * 140;
    const rankIndex = Math.min(RANKS.length - 1, Math.floor(rankScore / 120));
    const nextAt = (rankIndex + 1) * 120;
    return { attempts, correct, dates, dayCounts, rank: RANKS[rankIndex], rankScore, nextAt };
  }, [collection]);
}
