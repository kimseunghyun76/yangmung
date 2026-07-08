// 방송 메시지 학습 카드 — 기존 Session/Card 흐름을 그대로 쓰되, cards.ts를 건드리지 않는 독립 모듈.
// 항목마다 학습(소개) 카드 + 변형 퀴즈(듣고 일본어 / 일본어 보고 뜻)를 만든다.
import type { Card, IntroduceCard, QuizCard } from './cards';
import { ANNOUNCEMENTS, ANNOUNCEMENT_CATEGORIES, type Announcement, type AnnouncementCategory } from '../content/announcements';

const catLabel = (c: AnnouncementCategory) => ANNOUNCEMENT_CATEGORIES.find((x) => x.id === c)?.label ?? '방송';

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

function distractors(item: Announcement): Announcement[] {
  const same = ANNOUNCEMENTS.filter((x) => x.category === item.category && x.id !== item.id && x.korean !== item.korean);
  const pool = same.length >= 3 ? same : ANNOUNCEMENTS.filter((x) => x.id !== item.id && x.korean !== item.korean);
  return shuffle(pool).slice(0, 3);
}

function studyCard(item: Announcement): IntroduceCard {
  return {
    kind: 'introduce',
    id: `announce:study:${item.id}`,
    tag: `방송 · ${catLabel(item.category)}`,
    phraseId: item.id,
    ja: item.ja,
    kana: item.kana,
    korean: item.korean,
    tip: item.tip,
    note: `${item.context} — 소리를 듣고 일본어와 뜻을 함께 익혀요.`,
  };
}

// 듣고 알맞은 일본어 찾기
function hearToJa(item: Announcement): QuizCard {
  const d = distractors(item);
  return {
    kind: 'quiz',
    id: `announce:hear2ja:${item.id}`,
    tag: `방송 · ${catLabel(item.category)}`,
    banner: '듣기',
    bannerJa: item.kana,
    sub: '듣고 알맞은 방송을 고르세요',
    listen: true,
    reviewTarget: { type: 'phrase', id: `announce:${item.id}` },
    choices: shuffle([
      { label: item.ja, correct: true, ja: item.kana, phrase: { kana: item.kana, kanji: item.ja, korean: item.korean, tip: item.tip } },
      ...d.map((x) => ({ label: x.ja, correct: false, ja: x.kana, phrase: { kana: x.kana, kanji: x.ja, korean: x.korean, tip: x.tip } })),
    ]),
  };
}

// 일본어(방송) 보고 뜻 찾기
function jaToKo(item: Announcement): QuizCard {
  const d = distractors(item);
  return {
    kind: 'quiz',
    id: `announce:ja2ko:${item.id}`,
    tag: `방송 · ${catLabel(item.category)}`,
    banner: item.ja,
    bannerJa: item.kana,
    sub: '이 방송은 무슨 뜻일까요?',
    reviewTarget: { type: 'phrase', id: `announce:${item.id}` },
    choices: shuffle([
      { label: item.korean, correct: true, ja: item.kana, phrase: { kana: item.kana, kanji: item.ja, korean: item.korean, tip: item.tip } },
      ...d.map((x) => ({ label: x.korean, correct: false, ja: x.kana, phrase: { kana: x.kana, kanji: x.ja, korean: x.korean, tip: x.tip } })),
    ]),
  };
}

// 카테고리(없으면 전체) 학습 덱 — 학습 카드 먼저, 그 뒤 변형 퀴즈를 섞어서.
export function selectAnnouncementDeck(category?: AnnouncementCategory, quizCount = 6): Card[] {
  const items = category ? ANNOUNCEMENTS.filter((a) => a.category === category) : ANNOUNCEMENTS;
  if (items.length === 0) return [];
  const study: Card[] = shuffle(items).map(studyCard);
  // 변형 섞기: 항목별로 hear2ja/ja2ko 중 번갈아 뽑아 다양하게
  const quizzes: Card[] = [];
  const order = shuffle(items);
  for (const it of order) quizzes.push(hearToJa(it));
  for (const it of shuffle(items)) quizzes.push(jaToKo(it));
  const pickedQuiz = interleave(quizzes).slice(0, quizCount);
  return [...study, ...pickedQuiz];
}

// hear2ja와 ja2ko가 고르게 섞이도록 타입 라운드로빈
function interleave(quizzes: Card[]): Card[] {
  const hear = quizzes.filter((c) => c.id.includes(':hear2ja:'));
  const ja2ko = quizzes.filter((c) => c.id.includes(':ja2ko:'));
  const out: Card[] = [];
  const max = Math.max(hear.length, ja2ko.length);
  for (let i = 0; i < max; i++) {
    if (hear[i]) out.push(hear[i]);
    if (ja2ko[i]) out.push(ja2ko[i]);
  }
  return out;
}

// 카테고리별 항목 수(메뉴 표시용)
export function announcementCounts(): Record<AnnouncementCategory, number> {
  const out = {} as Record<AnnouncementCategory, number>;
  for (const c of ANNOUNCEMENT_CATEGORIES) out[c.id] = ANNOUNCEMENTS.filter((a) => a.category === c.id).length;
  return out;
}
