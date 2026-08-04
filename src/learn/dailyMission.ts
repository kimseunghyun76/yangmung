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

// ── 오늘의 단어 ────────────────────────────────────────────────────────────
// "단어도 매일매일 어느 정도 외우도록 했으면 좋겠다"(2026-08-04). 위의 표현 중심 데일리 미션과
// 별개로, 어휘(vocab:*) 카드만 따로 세어 어휘 학습이 빠진 날을 사용자가 알아챌 수 있게 한다.
// 표현만 계속 풀면 어휘 진도는 그대로인데 데일리는 채워지는 상황을 막는 게 목적.
export const DAILY_WORD_TARGET = 5;

/** 오늘 학습한 어휘(vocab:*·basic:*) 카드 개수 — 표현·미션 카드는 세지 않는다. */
export function todayWordCount(progress: ProgressMap): number {
  const today = todayKey();
  let n = 0;
  for (const [id, p] of Object.entries(progress)) {
    if (!id.startsWith('vocab:') && !id.startsWith('basic:')) continue;
    if (p.lastSeenAt && p.lastSeenAt.slice(0, 10) === today) n += 1;
  }
  return n;
}
