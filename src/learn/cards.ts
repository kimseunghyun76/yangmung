// 학습 카드 생성기 — Unit/Mission 데이터에서 Card[] 생성.
// 친구 4차 권고: App.tsx 하드코딩 분리, SRS 도입 전제 조건.
import { CONTENT } from '../content';
import type { CLevel, KanaItem, ReviewTarget, Phrase, MissionStep } from '../content/types';
import { signs } from '../content/signs';
import { minimalPairs } from '../content/minimalPairs';
import { VOCAB_GROUPS, type VocabItem } from '../content/thematicVocab';
import { toReadingUnits } from './kanaReading';
import { segmentJa, type SegPos } from './jaSegment';

// 받아쓰기 대상 — 짧고 순수 가나인 표현 (초보자 듣기+쓰기 입문)
const DICTATION_IDS = [
  'p_hai', 'p_iie', 'p_kore', 'p_arigatou', 'p_sumimasen',
  // 여행 실전 짧은 표현
  'p_konnichiwa', 'p_oishii', 'p_genkin_de', 'p_card_de', 'p_mizu_kudasai',
  'p_kore_kudasai', 'p_daijoubu', 'p_wakarimashita', 'p_eki', 'p_kippu',
  // 인사·기초 표현 추가
  'p_irasshai', 'p_fukuro', 'p_doko_made', 'p_nomimono', 'p_gochuumon',
  'p_onamae_wa', 'p_nanmeisama', 'p_norikae_kudasai', 'p_kagi_desu',
  // 여행 확장 표현
  'p_yukkuri', 'p_mou_ichido', 'p_eigo_de', 'p_yasashii_nihongo',
  'p_chotto_matte', 'p_wakarimasen', 'p_ikura_desu_ka', 'p_osusume_wa',
];
const DICTATION_DISTRACTORS = ['つ', 'ん', 'を', 'ぬ', 'ふ', 'ね', 'ろ', 'む'];

export interface ChoicePhrase {
  id?: string;
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
  promptPhrase?: ChoicePhrase;
  choices: Choice[];
  choicePools?: {
    correct: Choice[];
    wrong: Choice[];
    recovery: Choice[];
  };
  /** 반전 퀴즈 — "이 상황에 어색한(맞지 않는) 답"을 고른다. 정답 보기 여럿 + 오답 1개. */
  inverted?: boolean;
  listen?: boolean;
  /** 레벨(난이도) 태그 — 미션 티어에서 유도. 세션 레벨 필터용. 없으면 모든 레벨에 노출. */
  tier?: 1 | 2 | 3 | 4 | 5;
  reviewTarget?: ReviewTarget; // SRS 대상 (없으면 추적 X)
}

export interface TipCard {
  kind: 'tip';
  id: string;
  tag: string;
  label: string;
  tipKo: string;
}

// 새 표현 소개 카드 — 퀴즈 전에 의미·소리·쪼개보기를 먼저 제공.
export interface IntroduceCard {
  kind: 'introduce';
  id: string;
  tag: string;
  scenario?: string;
  phraseId: string;
  ja: string;
  kana: string;
  korean: string;
  tip?: string;
  note: string;
  answersQuestion?: { ja: string; kana: string; korean: string }; // 이 표현이 답하는 질문(점원 대사)
  reviewTarget?: ReviewTarget;
}

// 장면 흐름 카드 — 정답 채점이 아니라 "흔한 흐름"을 보여주는 정보 카드.
export interface OrderItem { id: string; label: string }
export interface OrderCard {
  kind: 'order';
  id: string;
  tag: string;
  scenario?: string;
  title: string;
  prompt: string;
  items: OrderItem[];
  reviewTarget?: ReviewTarget;
}

// 발견 카드 — 익숙해진 가나로만 된 표현이 "이제 읽힌다"는 성취 순간 (동적 생성, 채점 X).
export interface DiscoverCard {
  kind: 'discover';
  id: string;
  tag: string;
  ja: string;
  kana: string;
  korean: string;
}

// 따라 말하기 카드 — 음성 인식 없이 "입으로 꺼내기" 연습(채점 X, practiced만 기록).
export interface SpeakCard {
  kind: 'speak';
  id: string;
  tag: string;
  scenario?: string;
  ja: string;        // 자연 표기 (TTS·표시)
  kana: string;      // 읽기
  korean: string;
  tip?: string;
  reviewTarget?: ReviewTarget;
}

// 받아쓰기 카드 — 듣고 가나 타일을 순서대로 골라 문장 완성 (듣기+쓰기 입문).
export interface DictationCard {
  kind: 'dictation';
  id: string;
  tag: string;
  scenario?: string;
  ja: string;            // TTS용
  answer: string[];      // 정답 가나 단위 순서
  korean: string;
  tiles: string[];       // 섞인 타일(정답 + 방해)
  tilePos?: SegPos[];    // 작문(품사 묶음) — tiles와 같은 순서의 품사 태그(단어·조사·동사). 있으면 품사 레인 UI.
  promptKind?: 'listen' | 'korean'; // listen: 듣고 쓰기(기본) · korean: 한국어 보고 작문(산출)
  /** 레벨(난이도) 태그 — 미션 티어/표현 길이에서 유도. 세션 레벨 필터용. */
  tier?: 1 | 2 | 3 | 4 | 5;
  reviewTarget?: ReviewTarget;
}

export type Card = QuizCard | TipCard | IntroduceCard | OrderCard | SpeakCard | DictationCard | DiscoverCard;

// 학습 카드 TTS는 화면에 보이는 가나와 맞춘다.
// 한자를 먼저 읽으면 초보자에게 "표시와 음성이 다르다"는 체감이 생긴다.
const ttsText = (p?: { kanji?: string; displayKana?: string; kana: string }) =>
  p ? (p.displayKana ?? p.kana) : undefined;

const phraseInfo = (p?: { id?: string; kana: string; kanji?: string; korean: string; tip?: string }): ChoicePhrase | undefined =>
  p ? { id: p.id, kana: p.kana, kanji: p.kanji, korean: p.korean, tip: p.tip } : undefined;

const phraseDisplay = (p: { kanji?: string; displayKana?: string; kana: string }) =>
  p.kanji ?? p.displayKana ?? p.kana;

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// 학습형(설명·듣기·읽기) 카드 — 채점 없이 항목을 익히는 introduce 카드.
function makeStudyCard(opts: { id: string; tag: string; ja: string; kana: string; korean: string; tip?: string }): IntroduceCard {
  return {
    kind: 'introduce',
    id: opts.id,
    tag: opts.tag,
    phraseId: opts.id,
    ja: opts.ja,
    kana: opts.kana,
    korean: opts.korean,
    tip: opts.tip,
    note: '소리를 듣고, 일본어와 뜻을 함께 읽어보세요.',
    // reviewTarget 없음 — 소개 카드는 채점하지 않는다.
  };
}

// "듣고 일본어 찾기" 퀴즈 — 소리(kana)를 듣고 알맞은 일본어 표기를 고른다.
function makeHearToJaCard(opts: {
  id: string; tag: string; reviewId: string;
  item: { ja: string; kana: string };
  distract: { ja: string; kana: string }[];
}): QuizCard {
  return {
    kind: 'quiz',
    id: opts.id,
    tag: opts.tag,
    banner: '듣기',
    bannerJa: opts.item.kana,
    sub: '듣고 알맞은 일본어를 고르세요',
    listen: true,
    reviewTarget: { type: 'phrase', id: opts.reviewId },
    choices: shuffle([
      { label: opts.item.ja, correct: true, ja: opts.item.kana },
      ...opts.distract.map((d) => ({ label: d.ja, correct: false, ja: d.kana })),
    ]),
  };
}

function materializeChoicePools(pools: NonNullable<QuizCard['choicePools']>, inverted = false): Choice[] {
  if (inverted) {
    // 반전: 자연스러운 답 여러 개(고를 대상 아님 → correct:false) + 어색한 답 1개(고를 대상 → correct:true).
    const valid = shuffle(pools.correct).slice(0, 3).map((c) => ({ ...c, correct: false }));
    const target = shuffle(pools.wrong).slice(0, 1).map((c) => ({ ...c, correct: true, recovery: false }));
    return shuffle([...valid, ...target]);
  }
  const correct = shuffle(pools.correct).slice(0, 1);
  const wrong = shuffle(pools.wrong).slice(0, 3);
  return shuffle([...correct, ...wrong].map((c) => ({ ...c })));
}

export function materializeQuizCard(card: Card): Card {
  if (card.kind !== 'quiz' || !card.choicePools) return card;
  return { ...card, choices: materializeChoicePools(card.choicePools, card.inverted) };
}

const fallbackRecoveryIds = ['p_mou_ichido', 'p_yukkuri', 'p_yasashii_nihongo', 'p_eigo_de'];

interface BasicLifeItem {
  id: string;
  group: 'number' | 'order' | 'weekday' | 'calendar' | 'time' | 'money' | 'month' | 'counter';
  ja: string;
  kana: string;
  korean: string;
}

const BASIC_LIFE_ITEMS: BasicLifeItem[] = [
  // ── 숫자 1~20 ──
  { id: 'number:1', group: 'number', ja: '一', kana: 'いち', korean: '1' },
  { id: 'number:2', group: 'number', ja: '二', kana: 'に', korean: '2' },
  { id: 'number:3', group: 'number', ja: '三', kana: 'さん', korean: '3' },
  { id: 'number:4', group: 'number', ja: '四', kana: 'よん', korean: '4' },
  { id: 'number:5', group: 'number', ja: '五', kana: 'ご', korean: '5' },
  { id: 'number:6', group: 'number', ja: '六', kana: 'ろく', korean: '6' },
  { id: 'number:7', group: 'number', ja: '七', kana: 'なな', korean: '7' },
  { id: 'number:8', group: 'number', ja: '八', kana: 'はち', korean: '8' },
  { id: 'number:9', group: 'number', ja: '九', kana: 'きゅう', korean: '9' },
  { id: 'number:10', group: 'number', ja: '十', kana: 'じゅう', korean: '10' },
  { id: 'number:11', group: 'number', ja: '十一', kana: 'じゅういち', korean: '11' },
  { id: 'number:12', group: 'number', ja: '十二', kana: 'じゅうに', korean: '12' },
  { id: 'number:20', group: 'number', ja: '二十', kana: 'にじゅう', korean: '20' },
  { id: 'number:30', group: 'number', ja: '三十', kana: 'さんじゅう', korean: '30' },
  { id: 'number:100', group: 'number', ja: '百', kana: 'ひゃく', korean: '100' },
  { id: 'number:1000', group: 'number', ja: '千', kana: 'せん', korean: '1000' },
  { id: 'number:10000', group: 'number', ja: '一万', kana: 'いちまん', korean: '10000' },

  // ── 셈 단위(카운터) ──
  { id: 'counter:mai', group: 'counter', ja: '〜枚', kana: 'まい', korean: '~장 (얇은 것)' },
  { id: 'counter:hon', group: 'counter', ja: '〜本', kana: 'ほん', korean: '~자루/개 (긴 것)' },
  { id: 'counter:ko', group: 'counter', ja: '〜個', kana: 'こ', korean: '~개 (작고 둥근 것)' },
  { id: 'counter:hitori', group: 'counter', ja: '一人', kana: 'ひとり', korean: '1명' },
  { id: 'counter:futari', group: 'counter', ja: '二人', kana: 'ふたり', korean: '2명' },
  { id: 'counter:sannin', group: 'counter', ja: '三人', kana: 'さんにん', korean: '3명' },

  // ── 순서 ──
  { id: 'order:1', group: 'order', ja: '一番目', kana: 'いちばんめ', korean: '첫 번째' },
  { id: 'order:2', group: 'order', ja: '二番目', kana: 'にばんめ', korean: '두 번째' },
  { id: 'order:3', group: 'order', ja: '三番目', kana: 'さんばんめ', korean: '세 번째' },
  { id: 'order:next', group: 'order', ja: '次', kana: 'つぎ', korean: '다음' },
  { id: 'order:before', group: 'order', ja: '前', kana: 'まえ', korean: '앞/전' },
  { id: 'order:last', group: 'order', ja: '最後', kana: 'さいご', korean: '마지막' },

  // ── 요일 ──
  { id: 'weekday:mon', group: 'weekday', ja: '月曜日', kana: 'げつようび', korean: '월요일' },
  { id: 'weekday:tue', group: 'weekday', ja: '火曜日', kana: 'かようび', korean: '화요일' },
  { id: 'weekday:wed', group: 'weekday', ja: '水曜日', kana: 'すいようび', korean: '수요일' },
  { id: 'weekday:thu', group: 'weekday', ja: '木曜日', kana: 'もくようび', korean: '목요일' },
  { id: 'weekday:fri', group: 'weekday', ja: '金曜日', kana: 'きんようび', korean: '금요일' },
  { id: 'weekday:sat', group: 'weekday', ja: '土曜日', kana: 'どようび', korean: '토요일' },
  { id: 'weekday:sun', group: 'weekday', ja: '日曜日', kana: 'にちようび', korean: '일요일' },
  { id: 'weekday:weekend', group: 'weekday', ja: '週末', kana: 'しゅうまつ', korean: '주말' },

  // ── 달·월 ──
  { id: 'month:1', group: 'month', ja: '一月', kana: 'いちがつ', korean: '1월' },
  { id: 'month:2', group: 'month', ja: '二月', kana: 'にがつ', korean: '2월' },
  { id: 'month:3', group: 'month', ja: '三月', kana: 'さんがつ', korean: '3월' },
  { id: 'month:4', group: 'month', ja: '四月', kana: 'しがつ', korean: '4월' },
  { id: 'month:5', group: 'month', ja: '五月', kana: 'ごがつ', korean: '5월' },
  { id: 'month:6', group: 'month', ja: '六月', kana: 'ろくがつ', korean: '6월' },
  { id: 'month:7', group: 'month', ja: '七月', kana: 'しちがつ', korean: '7월' },
  { id: 'month:8', group: 'month', ja: '八月', kana: 'はちがつ', korean: '8월' },
  { id: 'month:9', group: 'month', ja: '九月', kana: 'くがつ', korean: '9월' },
  { id: 'month:10', group: 'month', ja: '十月', kana: 'じゅうがつ', korean: '10월' },
  { id: 'month:11', group: 'month', ja: '十一月', kana: 'じゅういちがつ', korean: '11월' },
  { id: 'month:12', group: 'month', ja: '十二月', kana: 'じゅうにがつ', korean: '12월' },

  // ── 달력·날짜 표현 ──
  { id: 'calendar:today', group: 'calendar', ja: '今日', kana: 'きょう', korean: '오늘' },
  { id: 'calendar:tomorrow', group: 'calendar', ja: '明日', kana: 'あした', korean: '내일' },
  { id: 'calendar:yesterday', group: 'calendar', ja: '昨日', kana: 'きのう', korean: '어제' },
  { id: 'calendar:dayafter', group: 'calendar', ja: '明後日', kana: 'あさって', korean: '모레' },
  { id: 'calendar:morning', group: 'calendar', ja: '午前', kana: 'ごぜん', korean: '오전' },
  { id: 'calendar:afternoon', group: 'calendar', ja: '午後', kana: 'ごご', korean: '오후' },
  { id: 'calendar:thisweek', group: 'calendar', ja: '今週', kana: 'こんしゅう', korean: '이번 주' },
  { id: 'calendar:nextweek', group: 'calendar', ja: '来週', kana: 'らいしゅう', korean: '다음 주' },

  // ── 시간 ──
  { id: 'time:1', group: 'time', ja: '一時', kana: 'いちじ', korean: '1시' },
  { id: 'time:2', group: 'time', ja: '二時', kana: 'にじ', korean: '2시' },
  { id: 'time:3', group: 'time', ja: '三時', kana: 'さんじ', korean: '3시' },
  { id: 'time:4', group: 'time', ja: '四時', kana: 'よじ', korean: '4시' },
  { id: 'time:6', group: 'time', ja: '六時', kana: 'ろくじ', korean: '6시' },
  { id: 'time:9', group: 'time', ja: '九時', kana: 'くじ', korean: '9시' },
  { id: 'time:12', group: 'time', ja: '十二時', kana: 'じゅうにじ', korean: '12시' },
  { id: 'time:half', group: 'time', ja: '三十分', kana: 'さんじゅっぷん', korean: '30분' },
  { id: 'time:10min', group: 'time', ja: '十分', kana: 'じゅっぷん', korean: '10분' },
  { id: 'time:now', group: 'time', ja: '今', kana: 'いま', korean: '지금' },

  // ── 금액 ──
  { id: 'money:100', group: 'money', ja: '百円', kana: 'ひゃくえん', korean: '100엔' },
  { id: 'money:500', group: 'money', ja: '五百円', kana: 'ごひゃくえん', korean: '500엔' },
  { id: 'money:1000', group: 'money', ja: '千円', kana: 'せんえん', korean: '1000엔' },
  { id: 'money:2000', group: 'money', ja: '二千円', kana: 'にせんえん', korean: '2000엔' },
  { id: 'money:3000', group: 'money', ja: '三千円', kana: 'さんぜんえん', korean: '3000엔' },
  { id: 'money:5000', group: 'money', ja: '五千円', kana: 'ごせんえん', korean: '5000엔' },
  { id: 'money:10000', group: 'money', ja: '一万円', kana: 'いちまんえん', korean: '10000엔' },
  { id: 'money:tax', group: 'money', ja: '税込', kana: 'ぜいこみ', korean: '세금 포함' },
];

const BASIC_GROUP_LABEL: Record<BasicLifeItem['group'], string> = {
  number: '숫자',
  counter: '셈 단위',
  order: '순서',
  weekday: '요일',
  month: '달·월',
  calendar: '달력',
  time: '시간',
  money: '금액',
};

function buildBasicLifeCards(): Card[] {
  const cards: Card[] = [];
  const byGroup = new Map<BasicLifeItem['group'], BasicLifeItem[]>();
  for (const item of BASIC_LIFE_ITEMS) {
    const arr = byGroup.get(item.group);
    if (arr) arr.push(item); else byGroup.set(item.group, [item]);
  }
  const distractorsFor = (item: BasicLifeItem) => {
    const same = byGroup.get(item.group) ?? [];
    const pool = same.length >= 4 ? same : BASIC_LIFE_ITEMS;
    return shuffle(pool.filter((x) => x.id !== item.id && x.korean !== item.korean)).slice(0, 3);
  };
  const phrase = (item: BasicLifeItem) => ({ kana: item.kana, kanji: item.ja, korean: item.korean });
  for (const item of BASIC_LIFE_ITEMS) {
    const group = BASIC_GROUP_LABEL[item.group];
    const distract = distractorsFor(item);
    // 학습형 — 설명·듣기·읽기 + 듣고 일본어 찾기
    cards.push(makeStudyCard({ id: `basic:study:${item.id}`, tag: `생활 기초 · ${group}`, ja: item.ja, kana: item.kana, korean: item.korean }));
    cards.push(makeHearToJaCard({ id: `basic:hear2ja:${item.id}`, tag: `생활 기초 · ${group}`, reviewId: `basic:${item.id}`, item, distract }));
    cards.push({
      kind: 'quiz',
      id: `basic:read:${item.id}`,
      tag: `생활 기초 · ${group}`,
      banner: item.ja,
      bannerJa: item.kana,
      sub: `${group} 표현을 보고 뜻을 고르세요`,
      reviewTarget: { type: 'phrase', id: `basic:${item.id}` },
      choices: shuffle([
        { label: item.korean, correct: true, ja: item.kana, phrase: phrase(item) },
        ...distract.map((d) => ({ label: d.korean, correct: false, ja: d.kana, phrase: phrase(d) })),
      ]),
    });
    cards.push({
      kind: 'quiz',
      id: `basic:listen:${item.id}`,
      tag: `생활 기초 · ${group}`,
      banner: '듣기',
      bannerJa: item.kana,
      sub: `듣고 ${group}을 고르세요`,
      listen: true,
      reviewTarget: { type: 'phrase', id: `basic:${item.id}` },
      choices: shuffle([
        { label: item.korean, correct: true, ja: item.kana, phrase: phrase(item) },
        ...distract.map((d) => ({ label: d.korean, correct: false, ja: d.kana, phrase: phrase(d) })),
      ]),
    });
    cards.push({
      kind: 'quiz',
      id: `basic:ko2ja:${item.id}`,
      tag: `생활 기초 · ${group}`,
      banner: item.korean,
      sub: `뜻에 맞는 ${group} 일본어를 고르세요`,
      reviewTarget: { type: 'phrase', id: `basic:${item.id}` },
      choices: shuffle([
        { label: item.ja, correct: true, ja: item.kana },
        ...distract.map((d) => ({ label: d.ja, correct: false, ja: d.kana })),
      ]),
    });
  }
  return cards;
}

// 미션 스텝 → 퀴즈 선택지 풀.
// 정책: 정답 후보 중 1개만 노출 + 오답 3개. 복구 표현은 보기로 섞지 않고 하단 액션으로만 보여준다.
// 세션 시작 때마다 다시 뽑아 새 문제처럼 보이게 한다.
function buildStepChoicePools(stepChoices: MissionStep['choices'], byPhrase: (id: string) => Phrase, allPhrases: Phrase[]): NonNullable<QuizCard['choicePools']> {
  const built: Choice[] = stepChoices.map((c) => ({
    label: c.text,
    correct: c.correct,
    ja: c.phraseId ? ttsText(byPhrase(c.phraseId)) : undefined,
    recovery: !!c.recoveryType,
    feedback: c.feedback,
    phrase: c.phraseId ? phraseInfo(byPhrase(c.phraseId)) : undefined,
  }));
  const usedPhraseIds = new Set(stepChoices.map((c) => c.phraseId).filter(Boolean));
  const usedLabels = new Set(built.map((c) => c.label));
  const correct = built.filter((c) => c.correct && !c.recovery);
  const recovery = built.filter((c) => c.recovery);
  const wrong = built.filter((c) => !c.correct && !c.recovery);

  // 작성 데이터가 아직 3개 정답 후보를 모두 갖추지 못한 장면도 있다.
  // 새 정답을 억지로 창작하면 맥락 오류가 생기므로, 검증된 기존 정답을 복제해 "3개 후보 중 1개 노출" 규칙만 보장한다.
  while (correct.length > 0 && correct.length < 3) {
    const src = correct[correct.length % Math.max(1, correct.length)];
    correct.push({ ...src });
  }

  if (recovery.length === 0) {
    const p = fallbackRecoveryIds.map((id) => allPhrases.find((x) => x.id === id)).find((x): x is Phrase => !!x && !usedPhraseIds.has(x.id));
    if (p) {
      recovery.push({
        label: p.korean,
        correct: true,
        recovery: true,
        ja: ttsText(p),
        phrase: phraseInfo(p),
        feedback: '못 알아들었을 때는 복구 표현으로 다시 요청하면 됩니다.',
      });
      usedPhraseIds.add(p.id);
      usedLabels.add(p.korean);
    }
  }

  if (wrong.length < 3) {
    const distractors = shuffle(allPhrases.filter((p) =>
      !usedPhraseIds.has(p.id)
      && !usedLabels.has(p.korean)
      && p.korean.length <= 18
      && !fallbackRecoveryIds.includes(p.id),
    ));
    for (const p of distractors) {
      if (wrong.length >= 3) break;
      wrong.push({
        label: p.korean,
        correct: false,
        ja: ttsText(p),
        phrase: phraseInfo(p),
        feedback: '이번 상황에서 요구된 답은 아니에요.',
      });
      usedPhraseIds.add(p.id);
      usedLabels.add(p.korean);
    }
  }

  return { correct, wrong, recovery };
}

// 한 드릴 Unit(예: K1, K2)의 가나 카드 3종 생성 — read 전체 → listen 전체 → confuse 전체.
interface KanaLookup {
  byKana: (id: string) => KanaItem;
  byKanaChar: (ch: string) => KanaItem | undefined;
  kana: KanaItem[];
}
function buildKanaCards(stage: string, kanaIds: string[], lk: KanaLookup): QuizCard[] {
  const out: QuizCard[] = [];
  const mk = (k: KanaItem) => ({ kana: k.char, korean: k.koreanSound });

  // (A) 글자 → 소리
  for (const id of kanaIds) {
    const k = lk.byKana(id);
    const distract = shuffle(lk.kana.filter((x) => x.id !== id && x.koreanSound !== k.koreanSound)).slice(0, 3);
    out.push({
      kind: 'quiz', id: `kana:${id}:read`, tag: `${stage} 가나 · 읽기`,
      banner: k.char, bannerJa: k.char, sub: '이 글자의 소리는?',
      reviewTarget: { type: 'kana', id },
      choices: shuffle([
        { label: k.koreanSound, correct: true, ja: k.char, phrase: mk(k) },
        ...distract.map((d) => ({ label: d.koreanSound, correct: false, ja: d.char, phrase: mk(d) })),
      ]),
    });
  }

  // (B) 소리 → 글자
  for (const id of kanaIds) {
    const k = lk.byKana(id);
    const distract = shuffle(lk.kana.filter((x) => x.id !== id && x.char !== k.char && x.script === k.script)).slice(0, 3);
    out.push({
      kind: 'quiz', id: `kana:${id}:listen`, tag: `${stage} 가나 · 듣기`,
      banner: '듣기', bannerJa: k.char, sub: '듣고 글자를 고르세요',
      listen: true,
      reviewTarget: { type: 'kana', id },
      choices: shuffle([
        { label: k.char, correct: true, ja: k.char, phrase: mk(k) },
        ...distract.map((d) => ({ label: d.char, correct: false, ja: d.char, phrase: mk(d) })),
      ]),
    });
  }

  // (C) 비슷한 글자 구분 — confusables 있을 때만
  for (const id of kanaIds) {
    const k = lk.byKana(id);
    if (!k.confusables || k.confusables.length === 0) continue;
    const distractChars = [...k.confusables];
    // 보기 4개(정답+3) 보장: confusables가 부족하면 같은 스크립트 가나로 채움
    for (const x of shuffle(lk.kana.filter((q) => q.char !== k.char && q.script === k.script))) {
      if (distractChars.length >= 3) break;
      if (!distractChars.includes(x.char)) distractChars.push(x.char);
    }
    const distract = distractChars.slice(0, 3).map((ch) => {
      const found = lk.byKanaChar(ch);
      return { label: ch, correct: false, ja: ch, phrase: { kana: ch, korean: found?.koreanSound ?? '?' } };
    });
    out.push({
      kind: 'quiz', id: `kana:${id}:confuse`, tag: `${stage} 가나 · 구분`,
      banner: '듣기', bannerJa: k.char, sub: '듣고 비슷한 글자 중 고르세요',
      listen: true,
      reviewTarget: { type: 'kana', id },
      choices: shuffle([
        { label: k.char, correct: true, ja: k.char, phrase: mk(k) },
        ...distract,
      ]),
    });
  }

  return out;
}

// ── 주제별 어휘 카드 ─────────────────────────────────────────────────────────
// 그룹별 vocab:groupId:itemId 카드 3종 생성: ja→ko 읽기, kana 듣기, ko→ja 역방향.
function buildVocabCards(): Card[] {
  const cards: Card[] = [];

  for (const group of VOCAB_GROUPS) {
    const distractorsFor = (item: VocabItem): VocabItem[] => {
      const same = group.items.filter((x) => x.id !== item.id && x.korean !== item.korean);
      const pool = same.length >= 3 ? same : group.items.filter((x) => x.id !== item.id);
      return shuffle(pool).slice(0, 3);
    };
    const phrase = (item: VocabItem) => ({ kana: item.kana, kanji: item.ja, korean: item.korean, tip: item.tip });

    for (const item of group.items) {
      const distract = distractorsFor(item);

      // 학습형 — 설명·듣기·읽기 + 듣고 일본어 찾기
      cards.push(makeStudyCard({ id: `vocab:${group.id}:study:${item.id}`, tag: `어휘 · ${group.label}`, ja: item.ja, kana: item.kana, korean: item.korean, tip: item.tip }));
      cards.push(makeHearToJaCard({ id: `vocab:${group.id}:hear2ja:${item.id}`, tag: `어휘 · ${group.label}`, reviewId: `vocab:${group.id}:${item.id}`, item, distract }));

      // (A) ja 표기 → 뜻 (읽기)
      cards.push({
        kind: 'quiz',
        id: `vocab:${group.id}:read:${item.id}`,
        tag: `어휘 · ${group.label}`,
        banner: item.ja,
        bannerJa: item.kana,
        sub: `${group.label} — 뜻을 고르세요`,
        reviewTarget: { type: 'phrase', id: `vocab:${group.id}:${item.id}` },
        choices: shuffle([
          { label: item.korean, correct: true, ja: item.kana, phrase: phrase(item) },
          ...distract.map((d) => ({ label: d.korean, correct: false, ja: d.kana, phrase: phrase(d) })),
        ]),
      });

      // (B) kana 듣기 → 뜻
      cards.push({
        kind: 'quiz',
        id: `vocab:${group.id}:listen:${item.id}`,
        tag: `어휘 · ${group.label}`,
        banner: '듣기',
        bannerJa: item.kana,
        sub: `듣고 ${group.label} 뜻을 고르세요`,
        listen: true,
        reviewTarget: { type: 'phrase', id: `vocab:${group.id}:${item.id}` },
        choices: shuffle([
          { label: item.korean, correct: true, ja: item.kana, phrase: phrase(item) },
          ...distract.map((d) => ({ label: d.korean, correct: false, ja: d.kana, phrase: phrase(d) })),
        ]),
      });

      // (C) 뜻 → ja (역방향)
      cards.push({
        kind: 'quiz',
        id: `vocab:${group.id}:ko2ja:${item.id}`,
        tag: `어휘 · ${group.label}`,
        banner: item.korean,
        sub: `뜻에 맞는 일본어를 고르세요`,
        reviewTarget: { type: 'phrase', id: `vocab:${group.id}:${item.id}` },
        choices: shuffle([
          { label: item.ja, correct: true, ja: item.kana, phrase: phrase(item) },
          ...distract.map((d) => ({ label: d.ja, correct: false, ja: d.kana, phrase: phrase(d) })),
        ]),
      });
    }
  }

  return cards;
}

export function buildCards(): Card[] {
  const { kana, phrases, grammar, missions, units } = CONTENT;
  const byKana = (id: string) => kana.find((k) => k.id === id)!;
  const byKanaChar = (ch: string) => kana.find((k) => k.char === ch);
  const byPhrase = (id: string) => phrases.find((p) => p.id === id)!;
  const cards: Card[] = [];

  // ── 표현 → 레벨(티어) 맵 — 미션이 단일 출처. 한 표현이 여러 미션에 나오면 가장 낮은 티어로. ──
  // 듣기·받아쓰기 카드의 난이도 태그에 사용. 점원/역무원 발화·선택지·핵심표현 모두 스캔.
  const phraseTier = new Map<string, 1 | 2 | 3 | 4 | 5>();
  const noteTier = (pid: string | undefined, tier: 1 | 2 | 3 | 4 | 5) => {
    if (!pid) return;
    const cur = phraseTier.get(pid);
    if (cur === undefined || tier < cur) phraseTier.set(pid, tier);
  };
  for (const m of missions) {
    const t = (m.tier ?? 1) as 1 | 2 | 3 | 4 | 5;
    for (const pid of m.speakPhraseIds ?? []) noteTier(pid, t);
    for (const step of m.steps) {
      noteTier(step.promptPhraseId, t);
      for (const ch of step.choices ?? []) noteTier(ch.phraseId, t);
    }
  }

  // 가나 드릴 — Unit 기반 자동 생성, 글자당 3종 (읽기 / 듣기 / 구분)
  // 단계(K1, K2, …) 드릴 Unit을 순서대로 처리. 각 Unit 안에서는
  // read 전체 → listen 전체 → confuse 전체 순 (한 글자에 3종이 몰리지 않게).
  const drillUnits = units.filter((u) => u.track === 'kana' && u.mode === 'drill');
  for (const unit of drillUnits) {
    cards.push(...buildKanaCards(unit.stage, unit.kanaIds ?? [], { byKana, byKanaChar, kana }));
  }

  // 최소 페어 구분 — 헷갈리는 음을 듣고 둘 중 고르기 (발음 변별, LEARNING_METHODS_PLAN §2).
  // 쌍마다 a·b 각각 정답인 카드 2장 생성. 보기 순서는 shuffle로 매번 달라진다.
  for (const mp of minimalPairs) {
    const sides = [
      { key: 'a' as const, self: mp.a, other: mp.b },
      { key: 'b' as const, self: mp.b, other: mp.a },
    ];
    for (const { key, self, other } of sides) {
      cards.push({
        kind: 'quiz', id: `pair:${mp.id}:${key}`, tag: '발음 구분',
        banner: '듣기', bannerJa: self.kana, sub: '듣고 들린 쪽을 고르세요',
        listen: true,
        tier: mp.tier ?? 1,
        reviewTarget: { type: 'phrase', id: `pair:${mp.id}:${key}` },
        choices: shuffle([
          { label: self.kana, correct: true, ja: self.kana, phrase: { kana: self.kana, korean: self.korean, tip: mp.focus } },
          { label: other.kana, correct: false, ja: other.kana, phrase: { kana: other.kana, korean: other.korean, tip: mp.focus } },
        ]),
      });
    }
  }

  // ── 듣기(receptive) — 미션에서 실제로 듣게 될 점원·역무원 대사 중심, 레벨별 자동 수집 ──
  // 기존엔 하드코딩 ~22개로 모든 레벨이 같은 입문 표현만 반복("뺑뺑이")했다.
  // 이제 각 미션의 상대 발화(promptPhraseId)를 그 미션의 티어로 태그해 듣기 풀을 만든다.
  // → 세션에 포함된 내용과 일치 + 고급일수록 고급 대사를 듣게 됨.
  const listenTargets = new Map<string, { p: Phrase; tier: 1 | 2 | 3 | 4 | 5 }>();
  for (const m of missions) {
    const t = (m.tier ?? 1) as 1 | 2 | 3 | 4 | 5;
    for (const step of m.steps) {
      if (!step.promptPhraseId) continue;
      const p = phrases.find((x) => x.id === step.promptPhraseId);
      if (!p) continue;
      const cur = listenTargets.get(p.id);
      if (!cur || t < cur.tier) listenTargets.set(p.id, { p, tier: t });
    }
  }
  // 기초 인사는 입문 듣기로 항상 포함 (미션 프롬프트에 없어도)
  for (const id of ['p_arigatou', 'p_hai']) {
    const p = phrases.find((x) => x.id === id);
    if (p && !listenTargets.has(id)) listenTargets.set(id, { p, tier: 1 });
  }
  const listenArr = [...listenTargets.values()];
  for (const { p, tier } of listenArr) {
    // 같은 레벨의 다른 점원 대사를 오답으로 → 의미를 진짜 들어야 구분(부족하면 인접 레벨로 확장)
    const sameTier = listenArr.filter((x) => x.p.id !== p.id && x.p.korean !== p.korean && x.tier === tier);
    const pool = sameTier.length >= 3 ? sameTier : listenArr.filter((x) => x.p.id !== p.id && x.p.korean !== p.korean);
    const distract = shuffle(pool).slice(0, 3).map((x) => x.p);
    cards.push({
      kind: 'quiz', id: `listen:${p.id}`, tag: '듣기',
      banner: '듣기', bannerJa: ttsText(p), sub: '듣고 의미를 고르세요',
      listen: true,
      tier,
      reviewTarget: { type: 'phrase', id: p.id },
      choices: shuffle([
        { label: p.korean, correct: true, ja: ttsText(p), phrase: phraseInfo(p) },
        ...distract.map((d) => ({ label: d.korean, correct: false, ja: ttsText(d), phrase: phraseInfo(d) })),
      ]),
    });
  }

  // 고급 미션은 점원 대사를 recapPromptJa(원시 문장)로만 두는 경우가 많다 → 합성 듣기 카드로 편입.
  // (promptPhraseId가 없는 스텝의 상대 발화) — 고급 레벨 듣기 풀을 두텁게.
  type RecapListen = { mid: string; idx: number; ja: string; ko: string; tier: 1 | 2 | 3 | 4 | 5 };
  const recapListens: RecapListen[] = [];
  for (const m of missions) {
    const t = (m.tier ?? 1) as 1 | 2 | 3 | 4 | 5;
    m.steps.forEach((step, idx) => {
      if (step.promptPhraseId || !step.recapPromptJa || !step.recapPromptKo) return;
      recapListens.push({ mid: m.id, idx, ja: step.recapPromptJa, ko: step.recapPromptKo, tier: t });
    });
  }
  for (const r of recapListens) {
    const sameTier = recapListens.filter((x) => !(x.mid === r.mid && x.idx === r.idx) && x.ko !== r.ko && x.tier === r.tier);
    const pool = sameTier.length >= 3 ? sameTier : recapListens.filter((x) => !(x.mid === r.mid && x.idx === r.idx) && x.ko !== r.ko);
    const distract = shuffle(pool).slice(0, 3);
    cards.push({
      kind: 'quiz', id: `listen:recap:${r.mid}:${r.idx}`, tag: '듣기',
      banner: '듣기', bannerJa: r.ja, sub: '듣고 의미를 고르세요',
      listen: true,
      tier: r.tier,
      reviewTarget: { type: 'phrase', id: `recap:${r.mid}:${r.idx}` },
      choices: shuffle([
        { label: r.ko, correct: true, ja: r.ja },
        ...distract.map((d) => ({ label: d.ko, correct: false, ja: d.ja })),
      ]),
    });
  }

  // 금액·숫자 듣기 — 듣고 금액 고르기 (계산대 실전). 오답도 금액이라 진짜 들어야 함. (입문~기본 레벨)
  const PRICE_TIER: Record<string, 1 | 2> = {
    p_num_hyakuen: 1, p_num_gohyakuen: 1, p_num_senen: 1, p_num_nisenen: 2, p_num_gosenen: 2, p_num_ichimanen: 2,
  };
  const PRICE_IDS = Object.keys(PRICE_TIER);
  for (const id of PRICE_IDS) {
    const p = phrases.find((x) => x.id === id);
    if (!p) continue;
    const distract = shuffle(phrases.filter((x) => PRICE_IDS.includes(x.id) && x.id !== id)).slice(0, 3);
    cards.push({
      kind: 'quiz', id: `listen:${id}`, tag: '금액 듣기',
      banner: '듣기', bannerJa: ttsText(p), sub: '듣고 금액을 고르세요',
      listen: true,
      tier: PRICE_TIER[id],
      reviewTarget: { type: 'phrase', id },
      choices: shuffle([
        { label: p.korean, correct: true, ja: ttsText(p), phrase: phraseInfo(p) },
        ...distract.map((d) => ({ label: d.korean, correct: false, ja: ttsText(d), phrase: phraseInfo(d) })),
      ]),
    });
  }

  // 생활 기초 — 숫자·순서·요일·달력·시간·금액을 전용 메뉴에서 반복 학습.
  cards.push(...buildBasicLifeCards());

  // 미션 — 콘텐츠에 정의된 순서대로 전부 (새 장면 추가 시 자동 포함)
  // introduced는 미션 전체에 걸쳐 전역 — 한 표현은 "처음 등장하는 미션·스텝"에서 딱 한 번만 새 표현으로 소개.
  // (한번이라도 새 표현으로 본 문장은 다시 소개 카드로 나오지 않음)
  const introduced = new Set<string>();
  for (const m of missions) {
    const addIntroduce = (phraseId: string, note: string, question?: IntroduceCard['answersQuestion']) => {
      if (introduced.has(phraseId)) return;
      introduced.add(phraseId);
      const p = byPhrase(phraseId);
      cards.push({
        kind: 'introduce',
        id: `intro:${m.id}:${phraseId}`,
        tag: `${m.id} 표현 소개`,
        scenario: m.scenario,
        phraseId,
        ja: phraseDisplay(p),
        kana: p.displayKana ?? p.kana,
        korean: p.korean,
        tip: p.tip,
        note,
        answersQuestion: question,
        reviewTarget: { type: 'mission', id: m.id as CLevel },
      });
    };

    for (const pid of m.speakPhraseIds ?? []) {
      addIntroduce(pid, '장면 끝에서 직접 말해볼 핵심 표현입니다. 먼저 의미와 소리를 익혀둡니다.');
    }

    m.steps.forEach((step, idx) => {
      const prompt = step.promptPhraseId ? byPhrase(step.promptPhraseId) : undefined;
      const recapPrompt = !prompt && step.recapPromptJa
        ? { kana: step.recapPromptJa, kanji: step.recapPromptJa, korean: step.recapPromptKo ?? step.situationKo }
        : undefined;
      // 이 스텝에서 학습자가 고를 수 있는 표현(productive/both) 중 아직 소개 안 된 것을 먼저 새 표현으로.
      // → 모든 답변 문장이 퀴즈 전에 한 번은 의미·소리와 함께 소개됨.
      // 이 표현이 "어떤 질문(점원 대사)에 대한 답"인지 맥락도 같이 넘긴다.
      const qInfo = prompt
        ? { ja: ttsText(prompt) ?? prompt.kana, kana: prompt.displayKana ?? prompt.kana, korean: prompt.korean }
        : recapPrompt
          ? { ja: recapPrompt.kana, kana: recapPrompt.kana, korean: recapPrompt.korean }
          : undefined;
      for (const ch of step.choices) {
        if (!ch.phraseId) continue;
        const reg = byPhrase(ch.phraseId).register;
        if (reg === 'productive' || reg === 'both') {
          addIntroduce(ch.phraseId, '이 장면에서 쓸 수 있는 표현이에요. 의미와 소리를 먼저 익혀둡니다.', qInfo);
        }
      }
      const choicePools = buildStepChoicePools(step.choices, byPhrase, phrases);
      // 반전 퀴즈 — 정답(자연스러운 답)이 여럿이라 "하나 고르기"가 모호한 스텝은
      // "어색한 답 고르기"로 바꾼다. 작성자가 명시한 오답(상황에 안 맞는 보기)이 있는 스텝만.
      const authoredWrong = step.choices.some((ch) => ch.correct === false && !ch.recoveryType);
      const inverted = authoredWrong && choicePools.correct.length >= 1;
      cards.push({
        kind: 'quiz', id: `mission:${m.id}:${idx}`, tag: `${m.id} 미션`,
        scenario: m.scenario,
        banner: step.situationKo,
        bannerJa: ttsText(prompt) ?? step.recapPromptJa,
        // prompt이 있으면 kana는 promptPhrase로 분리(발음 보조 렌더). sub엔 화자만.
        sub: step.speaker ?? '',
        promptPhrase: phraseInfo(prompt) ?? recapPrompt,
        reviewTarget: { type: 'mission', id: m.id as CLevel },
        inverted,
        choicePools,
        choices: materializeChoicePools(choicePools, inverted),
      });
    });

    // 장면 마무리: 순서 맞추기 카드 (sequence가 있으면 — 스텝 카드 뒤에 capstone으로)
    if (m.sequence && m.sequence.length >= 2) {
      const ordered = m.sequence.map((label, i) => ({ id: String(i), label }));
      cards.push({
        kind: 'order', id: `flow:${m.id}`, tag: `${m.id} 흐름`,
        scenario: m.scenario,
        title: `${m.place ?? m.scenario}에서 흔한 흐름`,
        prompt: '정답을 맞히는 문제가 아니라, 여행 중 자주 만나는 흐름을 한 번 정리합니다.',
        items: ordered,
        reviewTarget: { type: 'mission', id: m.id as CLevel },
      });
    }

    // 장면 끝: 따라 말하기 카드 (핵심 문장을 입으로 꺼내보기)
    for (const pid of m.speakPhraseIds ?? []) {
      const p = byPhrase(pid);
      cards.push({
        kind: 'speak', id: `speak:${m.id}:${pid}`, tag: `${m.id} 말하기`,
        scenario: m.scenario,
        ja: ttsText(p) ?? p.kana, kana: p.kana, korean: p.korean, tip: p.tip,
        reviewTarget: { type: 'mission', id: m.id as CLevel },
      });
    }
  }

  // 받아쓰기/작문 대상 — 큐레이트 입문 표현(DICTATION_IDS)을 앞에, 그다음 읽기단위 2~12인 모든 표현을
  // 자동 편입. 상한을 12로 올려 긴 문장(점원·역무원 대사 등)도 받아쓰기·작문·한→일 풀에 포함 → 고급 레벨이 두꺼워짐.
  const dictationTargetIds: string[] = (() => {
    const fitLen = (p: typeof phrases[number]) => {
      const n = toReadingUnits(p.kana).map((u) => u.text).filter((t) => t.trim()).length;
      return n >= 2 && n <= 12;
    };
    const curated = DICTATION_IDS.filter((id) => phrases.some((p) => p.id === id));
    const seen = new Set(curated);
    const extra = phrases.filter((p) => p.kana && !seen.has(p.id) && fitLen(p)).map((p) => p.id);
    return [...curated, ...extra];
  })();

  // 받아쓰기 레벨 — 미션에 쓰이는 표현이면 그 미션 티어, 아니면 길이로 추정(짧으면 입문).
  const dictTier = (id: string, units: number): 1 | 2 | 3 | 4 | 5 => {
    const mt = phraseTier.get(id);
    if (mt) return mt;
    // 미션에 안 쓰인 표현은 길이로 레벨 추정 — 길수록 높은 레벨(받아쓰기 난이도↑)
    return units <= 3 ? 1 : units <= 5 ? 2 : units <= 7 ? 3 : units <= 9 ? 4 : 5;
  };
  const pushTileCard = (id: string, kind: 'dictation' | 'compose') => {
    const p = phrases.find((x) => x.id === id);
    if (!p) return;
    const units = toReadingUnits(p.kana).map((u) => u.text).filter((t) => t.trim());

    // 작문 — 깔끔하게 분절되면 단어·조사·동사 타일(품사 묶음), 아니면 가나 타일로 폴백.
    if (kind === 'compose') {
      const seg = segmentJa(p.kana);
      if (seg.confident && seg.segments.length >= 2) {
        const answer = seg.segments.map((s) => s.text);
        const shuffled = shuffle(seg.segments.map((s, idx) => ({ s, idx })));
        cards.push({
          kind: 'dictation',
          id: `compose:${id}`,
          tag: '작문',
          promptKind: 'korean',
          ja: ttsText(p) ?? p.kana, answer, korean: p.korean,
          tiles: shuffled.map(({ s }) => s.text),
          tilePos: shuffled.map(({ s }) => s.pos),
          tier: dictTier(id, answer.length),
          reviewTarget: { type: 'phrase', id },
        });
        return;
      }
      // 폴백: 가나 단위 타일 + 방해 타일
      const distractors = shuffle(DICTATION_DISTRACTORS.filter((d) => !units.includes(d))).slice(0, 3);
      cards.push({
        kind: 'dictation', id: `compose:${id}`, tag: '작문', promptKind: 'korean',
        ja: ttsText(p) ?? p.kana, answer: units, korean: p.korean,
        tiles: shuffle([...units, ...distractors]),
        tier: dictTier(id, units.length), reviewTarget: { type: 'phrase', id },
      });
      return;
    }

    // 받아쓰기 — 듣고 가나 키패드로 입력(타일 풀은 호환용으로만 유지)
    const distractors = shuffle(DICTATION_DISTRACTORS.filter((d) => !units.includes(d))).slice(0, 3);
    cards.push({
      kind: 'dictation', id: `dictation:${id}`, tag: '받아쓰기',
      ja: ttsText(p) ?? p.kana, answer: units, korean: p.korean,
      tiles: shuffle([...units, ...distractors]),
      tier: dictTier(id, units.length), reviewTarget: { type: 'phrase', id },
    });
  };

  // 받아쓰기(듣고 쓰기) + 한→일 작문(뜻 보고 조립) — 같은 풀, dictation UI 재사용
  for (const id of dictationTargetIds) pushTileCard(id, 'dictation');
  for (const id of dictationTargetIds) pushTileCard(id, 'compose');

  // 한→일 고르기 — 한국어 뜻을 보고 알맞은 일본어 보기를 고르기(역방향 인식). 표현 변형으로 회전 출제.
  const jaShort = (q: Phrase) => q.displayKana ?? q.kana;
  for (const id of dictationTargetIds) {
    const p = phrases.find((x) => x.id === id);
    if (!p) continue;
    const distract = shuffle(dictationTargetIds
      .filter((d) => d !== id)
      .map((d) => phrases.find((x) => x.id === d))
      .filter((x): x is Phrase => !!x && x.korean !== p.korean && jaShort(x) !== jaShort(p)))
      .slice(0, 3);
    cards.push({
      kind: 'quiz', id: `ko2ja:${id}`, tag: '한→일',
      banner: p.korean, sub: '뜻에 맞는 일본어를 고르세요',
      reviewTarget: { type: 'phrase', id },
      choices: shuffle([
        { label: jaShort(p), correct: true, ja: ttsText(p) },
        ...distract.map((d) => ({ label: jaShort(d), correct: false, ja: ttsText(d) })),
      ]),
    });
  }

  // 주제별 어휘 커리큘럼 — 인사·월·시간·숫자·신체·운동·동물·식물·색깔·음식·가족·날씨
  cards.push(...buildVocabCards());

  // 거리 읽기 — 간판·메뉴·안내·교통 표기 보고 뜻 맞히기 (실제 일본에서 눈에 띄는 것)
  for (const sg of signs) {
    const pool = signs.filter((x) => x.category === sg.category && x.korean !== sg.korean);
    const distract = shuffle(pool.length >= 2 ? pool : signs.filter((x) => x.korean !== sg.korean)).slice(0, 3);
    // 학습형 — 설명·듣기·읽기 + 듣고 일본어 찾기
    cards.push(makeStudyCard({ id: `sign:study:${sg.id}`, tag: `${sg.category} 읽기`, ja: sg.ja, kana: sg.kana, korean: sg.korean }));
    cards.push(makeHearToJaCard({ id: `sign:hear2ja:${sg.id}`, tag: `${sg.category} 읽기`, reviewId: `sign:${sg.id}`, item: sg, distract }));
    cards.push({
      kind: 'quiz', id: `sign:${sg.id}`, tag: `${sg.category} 읽기`,
      banner: sg.ja, bannerJa: sg.kana, sub: '이 표기는 무슨 뜻일까요?',
      reviewTarget: { type: 'phrase', id: `sign:${sg.id}` },
      choices: shuffle([
        { label: sg.korean, correct: true, ja: sg.kana, phrase: { kana: sg.kana, korean: sg.korean } },
        ...distract.map((d) => ({ label: d.korean, correct: false, ja: d.kana, phrase: { kana: d.kana, korean: d.korean } })),
      ]),
    });
  }

  // 정확성 팁 (디브리프) — 전체 풀 생성, 세션 선별에서 안 본 것 1개씩 회전
  for (const g of grammar) {
    if (!g.tipKo) continue;
    cards.push({ kind: 'tip', id: `tip:${g.id}`, tag: g.category ?? '팁', label: g.label, tipKo: g.tipKo });
  }

  return cards;
}
