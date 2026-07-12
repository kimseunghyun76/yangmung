const STORAGE_KEY = 'mungyang:progress:v1';

export interface ProgressState {
  completedUnitIds: string[];
  seenExpressionIds: string[];
  wrongCardIds: string[];
  rewards: string[];
  reviewItems: Record<string, ReviewItem>;
  lastUnitId?: string;
  debugAccessUnlocked?: boolean;
}

export interface ReviewItem {
  id: string;
  unitId: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  cardId: string;
  title: string;
  prompt: string;
  attempts: number;
  correct: number;
  wrong: number;
  intervalDays: number;
  dueAt: number;
  lastAttemptAt: number;
  lastCorrect: boolean;
}

export const initialProgress: ProgressState = {
  completedUnitIds: [],
  seenExpressionIds: [],
  wrongCardIds: [],
  rewards: [],
  reviewItems: {},
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function loadProgress(): ProgressState {
  if (typeof localStorage === 'undefined') return initialProgress;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialProgress;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completedUnitIds: Array.isArray(parsed.completedUnitIds) ? parsed.completedUnitIds : [],
      seenExpressionIds: Array.isArray(parsed.seenExpressionIds) ? parsed.seenExpressionIds : [],
      wrongCardIds: Array.isArray(parsed.wrongCardIds) ? parsed.wrongCardIds : [],
      rewards: Array.isArray(parsed.rewards) ? parsed.rewards : [],
      reviewItems: parsed.reviewItems && typeof parsed.reviewItems === 'object' ? parsed.reviewItems as Record<string, ReviewItem> : {},
      lastUnitId: typeof parsed.lastUnitId === 'string' ? parsed.lastUnitId : undefined,
      debugAccessUnlocked: parsed.debugAccessUnlocked === true,
    };
  } catch {
    return initialProgress;
  }
}

export function saveProgress(progress: ProgressState): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // best effort
  }
}

export function markSeen(progress: ProgressState, expressionId: string): ProgressState {
  return {
    ...progress,
    seenExpressionIds: unique([...progress.seenExpressionIds, expressionId]),
  };
}

export function markWrong(progress: ProgressState, cardId: string): ProgressState {
  return {
    ...progress,
    wrongCardIds: unique([...progress.wrongCardIds, cardId]),
  };
}

export function clearWrong(progress: ProgressState, cardId: string): ProgressState {
  return {
    ...progress,
    wrongCardIds: progress.wrongCardIds.filter((id) => id !== cardId),
  };
}

export function completeUnit(progress: ProgressState, unitId: string, reward: string): ProgressState {
  return {
    ...progress,
    completedUnitIds: unique([...progress.completedUnitIds, unitId]),
    rewards: unique([...progress.rewards, reward]),
    lastUnitId: unitId,
  };
}

export function setDebugAccess(progress: ProgressState, enabled: boolean): ProgressState {
  return {
    ...progress,
    debugAccessUnlocked: enabled,
  };
}

export function reviewItemId(unitId: string, level: ReviewItem['level'], cardId: string): string {
  return `${unitId}:${level ?? 'base'}:${cardId}`;
}

export function recordReviewAttempt(
  progress: ProgressState,
  input: {
    unitId: string;
    level?: ReviewItem['level'];
    cardId: string;
    title: string;
    prompt: string;
    correct: boolean;
    now?: number;
  },
): ProgressState {
  const now = input.now ?? Date.now();
  const id = reviewItemId(input.unitId, input.level, input.cardId);
  const current = progress.reviewItems[id];
  const attempts = (current?.attempts ?? 0) + 1;
  const correct = (current?.correct ?? 0) + (input.correct ? 1 : 0);
  const wrong = (current?.wrong ?? 0) + (input.correct ? 0 : 1);
  const previousInterval = current?.intervalDays ?? 0;
  const intervalDays = input.correct
    ? previousInterval <= 0 ? 1 : Math.min(30, previousInterval * 2)
    : 0;
  const dueAt = input.correct ? now + intervalDays * 24 * 60 * 60 * 1000 : now;
  return {
    ...progress,
    reviewItems: {
      ...progress.reviewItems,
      [id]: {
        id,
        unitId: input.unitId,
        level: input.level,
        cardId: input.cardId,
        title: input.title,
        prompt: input.prompt,
        attempts,
        correct,
        wrong,
        intervalDays,
        dueAt,
        lastAttemptAt: now,
        lastCorrect: input.correct,
      },
    },
  };
}

export function dueReviewItems(progress: ProgressState, now = Date.now()): ReviewItem[] {
  return Object.values(progress.reviewItems)
    .filter((item) => item.dueAt <= now || item.wrong > item.correct)
    .sort((a, b) => a.dueAt - b.dueAt || b.wrong - a.wrong || a.unitId.localeCompare(b.unitId));
}
