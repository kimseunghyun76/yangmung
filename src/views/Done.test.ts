import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Done } from './Done';

describe('Done result recommendations', () => {
  it('renders the dedicated level-test artwork after every default stage is complete', () => {
    const html = renderToStaticMarkup(createElement(Done, {
      sessionId: 1,
      score: 1,
      quizSeen: 1,
      sessionLog: [],
      sessionCards: [],
      progress: {},
      speakCount: 0,
      canContinue: false,
      clearedSceneIds: [],
      isQuickPractice: true,
      coreLevel: 'default',
      progression: { completed: ['default:greetings', 'default:signs'] },
      onStartPromotion: vi.fn(),
      onOpenVocabGroups: vi.fn(),
      onRetryWeak: vi.fn(),
      onContinue: vi.fn(),
      onHome: vi.fn(),
    }));

    expect(html).toContain('기본 레벨 테스트');
    expect(html).toContain('/scenes/quick-practice/level-test.webp');
    expect(html).toContain('어휘 주제 계속 학습하기');
    expect(html).toContain('/scenes/quick-practice/vocab.webp');
  });
});
