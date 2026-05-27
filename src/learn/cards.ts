// 학습 카드 생성기 — Unit/Mission 데이터에서 Card[] 생성.
// 친구 4차 권고: App.tsx 하드코딩 분리, SRS 도입 전제 조건.
import { CONTENT } from '../content';
import type { CLevel, ReviewTarget } from '../content/types';

export interface ChoicePhrase {
  kana: string;
  kanji?: string;
  korean: string;
  tip?: string;
}

export interface Choice {
  label: string;
  correct: boolean;
  ja?: string;
  recovery?: boolean;
  feedback?: string;
  phrase?: ChoicePhrase;  // 있으면 결과 화면에 일본어·뜻·팁 표시
}

export interface QuizCard {
  kind: 'quiz';
  id: string;                  // 안정 id (진척 추적용)
  tag: string;
  scenario?: string;
  banner: string;
  bannerJa?: string;
  sub: string;
  choices: Choice[];
  listen?: boolean;
  reviewTarget?: ReviewTarget; // SRS 대상 (없으면 추적 X)
}

export interface TipCard {
  kind: 'tip';
  id: string;
  tag: string;
  label: string;
  tipKo: string;
}

export type Card = QuizCard | TipCard;

// TTS는 자연 표기 우선 (문장부호 prosody)
const ttsText = (p?: { kanji?: string; displayKana?: string; kana: string }) =>
  p ? (p.kanji ?? p.displayKana ?? p.kana) : undefined;

const phraseInfo = (p?: { kana: string; kanji?: string; korean: string; tip?: string }): ChoicePhrase | undefined =>
  p ? { kana: p.kana, kanji: p.kanji, korean: p.korean, tip: p.tip } : undefined;

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function buildCards(): Card[] {
  const { kana, phrases, grammar, missions, units } = CONTENT;
  const byKana = (id: string) => kana.find((k) => k.id === id)!;
  const byKanaChar = (ch: string) => kana.find((k) => k.char === ch);
  const byPhrase = (id: string) => phrases.find((p) => p.id === id)!;
  const cards: Card[] = [];

  // K1 가나 — Unit 기반 자동 생성, 3종 카드 (글자→소리 / 소리→글자 / 비슷한 글자 구분)
  // 순서: 전체 글자 read → 전체 글자 listen → 전체 글자 confuse
  // (첫 세션이 자연스럽게 あいうえお 위주가 되도록 — 한 글자에 3종이 몰리지 않게)
  const k1 = units.find((u) => u.id === 'u_k1_seion');
  const k1Ids = k1?.kanaIds ?? [];

  // (A) 글자 → 소리
  for (const id of k1Ids) {
    const k = byKana(id);
    const pool = kana.filter((x) => x.id !== id && x.koreanSound !== k.koreanSound);
    const distract = shuffle(pool).slice(0, 2);
    cards.push({
      kind: 'quiz', id: `kana:${id}:read`, tag: 'K1 가나 · 읽기',
      banner: k.char, bannerJa: k.char, sub: '이 글자의 소리는?',
      reviewTarget: { type: 'kana', id },
      choices: shuffle([
        { label: k.koreanSound, correct: true, ja: k.char, phrase: { kana: k.char, korean: k.koreanSound } },
        ...distract.map((d) => ({ label: d.koreanSound, correct: false, ja: d.char, phrase: { kana: d.char, korean: d.koreanSound } })),
      ]),
    });
  }

  // (B) 소리 → 글자
  for (const id of k1Ids) {
    const k = byKana(id);
    const pool = kana.filter((x) => x.id !== id && x.char !== k.char && x.script === k.script);
    const distract = shuffle(pool).slice(0, 2);
    cards.push({
      kind: 'quiz', id: `kana:${id}:listen`, tag: 'K1 가나 · 듣기',
      banner: '🎧', bannerJa: k.char, sub: '🔊 듣고 글자를 고르세요',
      listen: true,
      reviewTarget: { type: 'kana', id },
      choices: shuffle([
        { label: k.char, correct: true, ja: k.char, phrase: { kana: k.char, korean: k.koreanSound } },
        ...distract.map((d) => ({ label: d.char, correct: false, ja: d.char, phrase: { kana: d.char, korean: d.koreanSound } })),
      ]),
    });
  }

  // (C) 비슷한 글자 구분 — confusables 있을 때만
  for (const id of k1Ids) {
    const k = byKana(id);
    if (!k.confusables || k.confusables.length === 0) continue;
    const distract = k.confusables.slice(0, 2).map((ch) => {
      const found = byKanaChar(ch);
      return { label: ch, correct: false, ja: ch, phrase: { kana: ch, korean: found?.koreanSound ?? '?' } };
    });
    cards.push({
      kind: 'quiz', id: `kana:${id}:confuse`, tag: 'K1 가나 · 구분',
      banner: '🎧', bannerJa: k.char, sub: '🔊 듣고 비슷한 글자 중 고르세요',
      listen: true,
      reviewTarget: { type: 'kana', id },
      choices: shuffle([
        { label: k.char, correct: true, ja: k.char, phrase: { kana: k.char, korean: k.koreanSound } },
        ...distract,
      ]),
    });
  }

  // B0 듣기: 🔊 → 한국어 의미 (사용자 1차 약점 처방)
  for (const id of ['p_arigatou', 'p_hai']) {
    const p = byPhrase(id);
    const distractPhrases = shuffle(phrases.filter((x) => x.id !== id && x.register !== 'receptive')).slice(0, 2);
    cards.push({
      kind: 'quiz', id: `listen:${id}`, tag: 'B0 듣기',
      banner: '🎧', bannerJa: ttsText(p), sub: '🔊 듣고 의미를 고르세요',
      listen: true,
      reviewTarget: { type: 'phrase', id },
      choices: shuffle([
        { label: p.korean, correct: true, ja: ttsText(p), phrase: phraseInfo(p) },
        ...distractPhrases.map((d) => ({ label: d.korean, correct: false, ja: ttsText(d), phrase: phraseInfo(d) })),
      ]),
    });
  }

  // 미션 (C0~C3)
  for (const id of ['C0', 'C1', 'C2', 'C3'] as const) {
    const m = missions.find((mm) => mm.id === id);
    if (!m) continue;
    m.steps.forEach((step, idx) => {
      const prompt = step.promptPhraseId ? byPhrase(step.promptPhraseId) : undefined;
      cards.push({
        kind: 'quiz', id: `mission:${m.id}:${idx}`, tag: `${m.id} 미션`,
        scenario: m.scenario,
        banner: step.situationKo,
        bannerJa: ttsText(prompt),
        sub: prompt ? `${step.speaker ?? ''} 「${prompt.kana}」(${prompt.korean})` : (step.speaker ?? ''),
        reviewTarget: { type: 'mission', id: m.id as CLevel },
        choices: step.choices.map((c) => ({
          label: c.text, correct: c.correct,
          ja: c.phraseId ? ttsText(byPhrase(c.phraseId)) : undefined,
          recovery: !!c.recoveryType,
          feedback: c.feedback,
          phrase: c.phraseId ? phraseInfo(byPhrase(c.phraseId)) : undefined,
        })),
      });
    });
  }

  // 정확성 팁 (디브리프)
  const g = grammar[0];
  if (g?.tipKo) {
    cards.push({
      kind: 'tip', id: `tip:${g.id}`, tag: '정확성 팁',
      label: g.label, tipKo: g.tipKo,
    });
  }

  return cards;
}
