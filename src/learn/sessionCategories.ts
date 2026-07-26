// 세션 로그를 카테고리(가나·문법·미션·표현)별로 묶어 정오답 통계를 낸다 — 승급 시험 결과 화면과
// 일반 세션 완료 화면이 함께 쓰는 로직(둘 다 "어떤 부분을 다시 학습해야 하는지" 보여줘야 한다).
import { CONTENT } from '../content';
import type { Card } from './cards';
import type { SessionLogEntry } from './progress';

// 2026-07-26: 승급 시험 결과의 "약점" 안내가 전부 "표현"으로 뭉뚱그려져 있어 무엇을 다시 봐야 할지
// 알 수 없었다(사용자 리포트) — dictation 세부종류(작문/받아쓰기)와 phrase id 접두어(pair:/vocab:greetings:
// 등)로 실제 학습 단계 이름까지 구분해 정확히 안내한다. promotionPool()의 카드 출처와 1:1로 맞춰뒀다.
export function categoryLabel(card: Card | undefined): string {
  if (!card) return '기타';
  if (card.kind === 'dictation') return card.promptKind === 'korean' ? '작문' : '받아쓰기';
  if (!('reviewTarget' in card) || !card.reviewTarget) return '기타';
  const rt = card.reviewTarget;
  if (rt.type === 'kana') return '가나 읽기';
  if (rt.type === 'grammar') return '문법';
  if (rt.type === 'mission') {
    const m = CONTENT.missions.find((x) => x.id === rt.id);
    return m ? `미션 · ${m.place ?? m.scenario}` : '미션';
  }
  const id = String(rt.id);
  if (id.startsWith('pair:')) return '발음 구분';
  if (id.startsWith('vocab:greetings:')) return '기본 인사';
  if (id.startsWith('basic:')) return '숫자·기본 어휘';
  if (id.startsWith('vocab:')) return '어휘';
  if (id.startsWith('sign:')) return '간판·표지';
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
