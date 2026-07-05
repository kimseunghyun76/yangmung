// 작문 카드 하단 힌트 — 이 표현이 미션 대화에서 어떤 역할인지.
// 질문(점원 promptPhraseId)이면 실제로 쓰이는 답변 예시들을, 답변(학습자 choices)이면
// 어떤 질문에 대한 답인지 보여줘 — 미션 학습 전에 회화 흐름을 미리 익히도록.
import { CONTENT } from '../content';
import type { Phrase } from '../content/types';

export interface ComposeContext {
  role: 'question' | 'answer';
  related: Phrase[]; // question: 답변 예시(최대 3) / answer: 질문(최대 2 — 표현이 여러 질문에 답이 될 수 있음)
}

let cache: Map<string, ComposeContext> | null = null;

function buildIndex(): Map<string, ComposeContext> {
  const phraseById = new Map(CONTENT.phrases.map((p) => [p.id, p]));
  const questionToAnswers = new Map<string, Set<string>>();
  const answerToQuestions = new Map<string, Set<string>>();

  for (const m of CONTENT.missions) {
    for (const step of m.steps) {
      const qId = step.promptPhraseId;
      // 복구 표현("다시 말씀해주세요" 등)은 어느 질문에나 붙는 범용 응답이라 이 질문 전용 답변 예시로는 부적절 — 제외.
      const answerIds = step.choices.filter((c) => c.correct && c.phraseId && !c.recoveryType).map((c) => c.phraseId!);
      if (qId) {
        const set = questionToAnswers.get(qId) ?? new Set<string>();
        for (const a of answerIds) set.add(a);
        questionToAnswers.set(qId, set);
        for (const a of answerIds) {
          const qs = answerToQuestions.get(a) ?? new Set<string>();
          qs.add(qId);
          answerToQuestions.set(a, qs);
        }
      }
    }
  }

  const idx = new Map<string, ComposeContext>();
  // 질문 역할을 먼저 등록 — 한 표현이 질문·답변 둘 다로 쓰였으면 질문 쪽 정보가 더 유용.
  for (const [qId, answers] of questionToAnswers) {
    const related = [...answers].map((id) => phraseById.get(id)).filter((p): p is Phrase => !!p).slice(0, 3);
    if (related.length) idx.set(qId, { role: 'question', related });
  }
  for (const [aId, questions] of answerToQuestions) {
    if (idx.has(aId)) continue;
    const related = [...questions].map((id) => phraseById.get(id)).filter((p): p is Phrase => !!p).slice(0, 2);
    if (related.length) idx.set(aId, { role: 'answer', related });
  }
  return idx;
}

export function composeContextFor(phraseId: string): ComposeContext | null {
  if (!cache) cache = buildIndex();
  return cache.get(phraseId) ?? null;
}
