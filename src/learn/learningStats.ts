// 학습 현황 공용 통계 — 홈(내 학습 현황)과 도감(가챠)에서 함께 쓰는 계급·학습일·정답률 계산.
// 원래 Gacha.tsx 안에만 있던 걸 분리해서 홈 화면과 병합할 수 있게 함.
import { useMemo } from 'react';
import { honorTrophyCount, totalItems, type Collection } from './collection';
import { loadProgress } from './progress';

// 여행/일본어 학습 테마 등급 — 군대 계급 대신 여행자가 성장해 가는 이름으로(2026-07-06).
export const RANKS = [
  '여행 준비생', '첫걸음 여행자', '가나 탐험가', '초보 배낭러', '편의점 단골',
  '골목 탐방러', '로컬 맛집러', '길찾기 고수', '회화 새내기', '여행 능숙자',
  '일본어 애호가', '현지인 친구', '통역 없이 척척', '미식 여행가', '일본 통',
  '문화 마니아', '원어민 친구', '여행 고수', '일본어 마스터',
];

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
