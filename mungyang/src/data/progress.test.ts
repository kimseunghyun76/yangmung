import { describe, expect, it } from 'vitest';
import {
  clearWrong,
  dueReviewItems,
  initialProgress,
  markWrong,
  recordReviewAttempt,
  reviewItemId,
  setDebugAccess,
} from './progress';

describe('progress review scheduling', () => {
  it('keeps wrong answers due immediately', () => {
    const now = Date.UTC(2026, 0, 1);
    const progress = recordReviewAttempt(initialProgress, {
      unitId: 'S1',
      level: 'beginner',
      cardId: 's1-quiz',
      title: '표현 고르기',
      prompt: '정답을 고르세요',
      correct: false,
      now,
    });
    const id = reviewItemId('S1', 'beginner', 's1-quiz');
    expect(progress.reviewItems[id].wrong).toBe(1);
    expect(progress.reviewItems[id].dueAt).toBe(now);
    expect(dueReviewItems(progress, now)).toHaveLength(1);
  });

  it('extends interval after repeated correct answers', () => {
    const now = Date.UTC(2026, 0, 1);
    const first = recordReviewAttempt(initialProgress, {
      unitId: 'S1',
      level: 'advanced',
      cardId: 's1-quiz',
      title: '표현 고르기',
      prompt: '정답을 고르세요',
      correct: true,
      now,
    });
    const second = recordReviewAttempt(first, {
      unitId: 'S1',
      level: 'advanced',
      cardId: 's1-quiz',
      title: '표현 고르기',
      prompt: '정답을 고르세요',
      correct: true,
      now: now + 24 * 60 * 60 * 1000,
    });
    const id = reviewItemId('S1', 'advanced', 's1-quiz');
    expect(first.reviewItems[id].intervalDays).toBe(1);
    expect(second.reviewItems[id].intervalDays).toBe(2);
    expect(dueReviewItems(second, now + 24 * 60 * 60 * 1000)).toHaveLength(0);
  });

  it('preserves legacy wrong list helpers and debug setting', () => {
    const wrong = markWrong(initialProgress, 'quiz-1');
    expect(wrong.wrongCardIds).toEqual(['quiz-1']);
    expect(clearWrong(wrong, 'quiz-1').wrongCardIds).toEqual([]);
    expect(setDebugAccess(initialProgress, true).debugAccessUnlocked).toBe(true);
  });
});
