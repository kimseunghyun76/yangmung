// 데일리 미션 — "매일매일 와서, 틈나는 대로 한 번만 해도 보상"(사용자 요청). 새 저장 구조를
// 따로 만들지 않고, 이미 answer마다 갱신되는 progress의 lastSeenAt(각 카드의 마지막 학습 시각)을
// 오늘 날짜로 걸러 세는 것만으로 "오늘 몇 개 익혔는지"를 정확히 셀 수 있다.
// 실제 보상(무료 카드) 클레임은 GachaPage의 "오늘의 무료 뽑기"가 담당한다 — 여기선 진행률만 계산.
import type { ProgressMap } from './progress';

// 부담 없이 "틈날 때 한 판"만으로 채울 수 있는 낮은 문턱 — 정식 세션(9~15장)보다 작게 잡았다.
export const DAILY_MISSION_TARGET = 5;

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 오늘 하루 동안 답한(맞았든 틀렸든) 서로 다른 카드 개수.
export function todayLearnedCount(progress: ProgressMap): number {
  const today = todayKey();
  let n = 0;
  for (const p of Object.values(progress)) {
    if (p.lastSeenAt && p.lastSeenAt.slice(0, 10) === today) n += 1;
  }
  return n;
}
