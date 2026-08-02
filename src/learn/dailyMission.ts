// 데일리 미션 — "매일매일 와서, 틈나는 대로 한 번만 해도 보상"(사용자 요청). 새 저장 구조를
// 따로 만들지 않고, 이미 answer마다 갱신되는 progress의 lastSeenAt(각 카드의 마지막 학습 시각)을
// 오늘 날짜로 걸러 세는 것만으로 "오늘 몇 개 익혔는지"를 정확히 셀 수 있다.
import type { ProgressMap } from './progress';

// 부담 없이 "틈날 때 한 판"만으로 채울 수 있는 낮은 문턱 — 정식 세션(9~15장)보다 작게 잡았다.
export const DAILY_MISSION_TARGET = 5;

const CLAIM_KEY = 'yangmung:dailyMission:v1';

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

interface ClaimState { date: string; claimed: boolean }

function loadClaim(): ClaimState {
  const today = todayKey();
  if (typeof window === 'undefined') return { date: today, claimed: false };
  try {
    const raw = window.localStorage.getItem(CLAIM_KEY);
    if (!raw) return { date: today, claimed: false };
    const parsed = JSON.parse(raw) as Partial<ClaimState>;
    if (parsed.date !== today) return { date: today, claimed: false };
    return { date: today, claimed: !!parsed.claimed };
  } catch { return { date: today, claimed: false }; }
}

export function isDailyMissionClaimed(): boolean {
  return loadClaim().claimed;
}

export function markDailyMissionClaimed(): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(CLAIM_KEY, JSON.stringify({ date: todayKey(), claimed: true })); } catch { /* noop */ }
}

// 가챠 세션ID 네임스페이스 — GachaPage의 daily-free(날짜+순번)와 겹치지 않도록 앞에 9를 붙인다.
export function dailyMissionSessionId(): number {
  return -Number(`9${todayKey().replace(/-/g, '')}`);
}
