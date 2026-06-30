// 명장면 대화 · 가사 학습 카드 — 줄(line) 단위로 학습 카드 + 변형 퀴즈를 만든다.
// cards.ts를 건드리지 않는 독립 모듈. 콘텐츠는 모두 오리지널 샘플(저작권 안전).
import type { Card, IntroduceCard, QuizCard } from './cards';
import { DIALOGUE_SCENES } from '../content/sceneDialogues';
import { SONGS } from '../content/songLyrics';

interface LineItem { id: string; ja: string; kana: string; korean: string }

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

function distractKorean(it: LineItem, pool: LineItem[]): LineItem[] {
  const cand = pool.filter((x) => x.id !== it.id && x.korean !== it.korean);
  return shuffle(cand).slice(0, 3);
}

function studyCard(prefix: string, tag: string, it: LineItem, note: string): IntroduceCard {
  return {
    kind: 'introduce', id: `${prefix}:study:${it.id}`, tag,
    phraseId: it.id, ja: it.ja, kana: it.kana, korean: it.korean,
    note,
  };
}
// 듣고 뜻 찾기
function listenQuiz(prefix: string, tag: string, it: LineItem, pool: LineItem[]): QuizCard {
  const d = distractKorean(it, pool);
  return {
    kind: 'quiz', id: `${prefix}:listen:${it.id}`, tag,
    banner: '듣기', bannerJa: it.kana, sub: '듣고 뜻을 고르세요', listen: true,
    reviewTarget: { type: 'phrase', id: `${prefix}:${it.id}` },
    choices: shuffle([
      { label: it.korean, correct: true, ja: it.kana, phrase: { kana: it.kana, kanji: it.ja, korean: it.korean } },
      ...d.map((x) => ({ label: x.korean, correct: false, ja: x.kana, phrase: { kana: x.kana, kanji: x.ja, korean: x.korean } })),
    ]),
  };
}
// 보고 뜻 찾기
function readQuiz(prefix: string, tag: string, it: LineItem, pool: LineItem[]): QuizCard {
  const d = distractKorean(it, pool);
  return {
    kind: 'quiz', id: `${prefix}:read:${it.id}`, tag,
    banner: it.ja, bannerJa: it.kana, sub: '이 대사·가사는 무슨 뜻일까요?',
    reviewTarget: { type: 'phrase', id: `${prefix}:${it.id}` },
    choices: shuffle([
      { label: it.korean, correct: true, ja: it.kana, phrase: { kana: it.kana, kanji: it.ja, korean: it.korean } },
      ...d.map((x) => ({ label: x.korean, correct: false, ja: x.kana, phrase: { kana: x.kana, kanji: x.ja, korean: x.korean } })),
    ]),
  };
}

function interleave(quizzes: Card[]): Card[] {
  const listen = quizzes.filter((c) => c.id.includes(':listen:'));
  const read = quizzes.filter((c) => c.id.includes(':read:'));
  const out: Card[] = [];
  for (let i = 0; i < Math.max(listen.length, read.length); i++) {
    if (listen[i]) out.push(listen[i]);
    if (read[i]) out.push(read[i]);
  }
  return out;
}

function buildDeck(prefix: string, tag: string, lines: LineItem[], pool: LineItem[], note: string, quizCount: number): Card[] {
  const study: Card[] = lines.map((it) => studyCard(prefix, tag, it, note));
  const quizzes: Card[] = [...lines.map((it) => listenQuiz(prefix, tag, it, pool)), ...lines.map((it) => readQuiz(prefix, tag, it, pool))];
  return [...study, ...interleave(shuffle(quizzes)).slice(0, quizCount)];
}

// 명장면 대화 덱 — 한 장면의 모든 줄을 순서대로 학습 후 변형 퀴즈.
export function selectDialogueDeck(sceneId: string, quizCount = 6): Card[] {
  const scene = DIALOGUE_SCENES.find((s) => s.id === sceneId);
  if (!scene) return [];
  const lines: LineItem[] = scene.lines.map((l, i) => ({ id: `${sceneId}:${i}`, ja: l.ja, kana: l.kana, korean: l.korean }));
  const pool: LineItem[] = DIALOGUE_SCENES.flatMap((s) => s.lines.map((l, i) => ({ id: `${s.id}:${i}`, ja: l.ja, kana: l.kana, korean: l.korean })));
  return buildDeck('dlg', `명장면 · ${scene.title}`, lines, pool, `${scene.setup} — 장면을 떠올리며 듣고 따라 읽어요.`, quizCount);
}

// 가사 덱 — 한 곡의 가사 줄을 학습 후 변형 퀴즈.
export function selectSongDeck(songId: string, quizCount = 6): Card[] {
  const song = SONGS.find((s) => s.id === songId);
  if (!song) return [];
  const lines: LineItem[] = song.lines.map((l, i) => ({ id: `${songId}:${i}`, ja: l.ja, kana: l.kana, korean: l.korean }));
  const pool: LineItem[] = SONGS.flatMap((s) => s.lines.map((l, i) => ({ id: `${s.id}:${i}`, ja: l.ja, kana: l.kana, korean: l.korean })));
  return buildDeck('song', `가사 · ${song.title}`, lines, pool, `${song.note} — 가사를 들으며 단어를 익혀요.`, quizCount);
}
