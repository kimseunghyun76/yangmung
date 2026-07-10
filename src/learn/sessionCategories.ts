// 세션 로그를 카테고리(가나·문법·미션·표현)별로 묶어 정오답 통계를 낸다 — 승급 시험 결과 화면과
// 일반 세션 완료 화면이 함께 쓰는 로직(둘 다 "어떤 부분을 다시 학습해야 하는지" 보여줘야 한다).
import { CONTENT } from '../content';
import type { Card } from './cards';
import type { SessionLogEntry } from './progress';

export function categoryLabel(card: Card | undefined): string {
  if (!card || !('reviewTarget' in card) || !card.reviewTarget) return '기타';
  const rt = card.reviewTarget;
  if (rt.type === 'kana') return '가나 읽기';
  if (rt.type === 'grammar') return '문법';
  if (rt.type === 'mission') {
    const m = CONTENT.missions.find((x) => x.id === rt.id);
    return m ? `미션 · ${m.place ?? m.scenario}` : '미션';
  }
  return '표현';
}

export interface CategoryStat {
  label: string;
  correct: number;
  total: number;
}

// 카테고리별 첫 시도 정답률 — 정답률이 낮은 카테고리가 앞에 오도록 정렬.
export function categoryBreakdown(sessionLog: SessionLogEntry[], sessionCards: Card[]): CategoryStat[] {
  const byId = new Map(sessionCards.map((c) => [c.id, c]));
  const stats = new Map<string, CategoryStat>();
  for (const entry of sessionLog) {
    const label = categoryLabel(byId.get(entry.id));
    const cur = stats.get(label) ?? { label, correct: 0, total: 0 };
    cur.total += 1;
    if (entry.result === 'correct') cur.correct += 1;
    stats.set(label, cur);
  }
  return [...stats.values()].sort((a, b) => a.correct / a.total - b.correct / b.total);
}
