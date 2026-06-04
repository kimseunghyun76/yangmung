// 학습 카드 생성기 — Unit/Mission 데이터에서 Card[] 생성.
// 친구 4차 권고: App.tsx 하드코딩 분리, SRS 도입 전제 조건.
import { CONTENT } from '../content';
import type { CLevel, KanaItem, ReviewTarget } from '../content/types';
import { signs } from '../content/signs';
import { toReadingUnits } from './kanaReading';

// 받아쓰기 대상 — 짧고 순수 가나인 표현 (초보자 듣기+쓰기 입문)
const DICTATION_IDS = [
  'p_hai', 'p_iie', 'p_kore', 'p_arigatou', 'p_sumimasen',
  // 여행 실전 짧은 표현
  'p_konnichiwa', 'p_oishii', 'p_genkin_de', 'p_card_de', 'p_mizu_kudasai',
  'p_kore_kudasai', 'p_daijoubu', 'p_wakarimashita', 'p_eki', 'p_kippu',
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
  promptKind?: 'listen' | 'korean'; // listen: 듣고 쓰기(기본) · korean: 한국어 보고 작문(산출)
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
    const distract = shuffle(lk.kana.filter((x) => x.id !== id && x.koreanSound !== k.koreanSound)).slice(0, 2);
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
    const distract = shuffle(lk.kana.filter((x) => x.id !== id && x.char !== k.char && x.script === k.script)).slice(0, 2);
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
    const distract = k.confusables.slice(0, 2).map((ch) => {
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

export function buildCards(): Card[] {
  const { kana, phrases, grammar, missions, units } = CONTENT;
  const byKana = (id: string) => kana.find((k) => k.id === id)!;
  const byKanaChar = (ch: string) => kana.find((k) => k.char === ch);
  const byPhrase = (id: string) => phrases.find((p) => p.id === id)!;
  const cards: Card[] = [];

  // 가나 드릴 — Unit 기반 자동 생성, 글자당 3종 (읽기 / 듣기 / 구분)
  // 단계(K1, K2, …) 드릴 Unit을 순서대로 처리. 각 Unit 안에서는
  // read 전체 → listen 전체 → confuse 전체 순 (한 글자에 3종이 몰리지 않게).
  const drillUnits = units.filter((u) => u.track === 'kana' && u.mode === 'drill');
  for (const unit of drillUnits) {
    cards.push(...buildKanaCards(unit.stage, unit.kanaIds ?? [], { byKana, byKanaChar, kana }));
  }

  // 듣기 — 듣고 의미 고르기. 여행에서 실제로 듣게 될 점원·역무원 대사(receptive) 중심.
  const LISTEN_IDS = [
    'p_arigatou', 'p_hai',
    // 점원·역무원이 말하는 것 → 귀로 알아듣고 반응
    'p_irasshai', 'p_fukuro', 'p_atatamemasu_ka', 'p_hashi_irimasu_ka', 'p_shiharai_houhou',
    'p_pointo_arimasu_ka', 'p_gochuumon', 'p_nomimono', 'p_nanmeisama', 'p_norikae_kudasai',
    'p_onamae_wa', 'p_passport_onegai', 'p_dou_shimashita', 'p_doko_made',
    'p_price', 'p_mokuteki_wa', 'p_taizai_wa', 'p_doko_tomaru', 'p_kagi_desu',
  ];
  for (const id of LISTEN_IDS) {
    const p = phrases.find((x) => x.id === id);
    if (!p) continue;
    // 헷갈리게 — 같은 점원 대사끼리 묶어 의미를 진짜 들어야 구분되게 (없으면 일반 표현)
    const pool = phrases.filter((x) => x.id !== id && x.korean !== p.korean && LISTEN_IDS.includes(x.id));
    const distractPhrases = shuffle(pool.length >= 2 ? pool : phrases.filter((x) => x.id !== id && x.korean !== p.korean)).slice(0, 2);
    cards.push({
      kind: 'quiz', id: `listen:${id}`, tag: '듣기',
      banner: '듣기', bannerJa: ttsText(p), sub: '듣고 의미를 고르세요',
      listen: true,
      reviewTarget: { type: 'phrase', id },
      choices: shuffle([
        { label: p.korean, correct: true, ja: ttsText(p), phrase: phraseInfo(p) },
        ...distractPhrases.map((d) => ({ label: d.korean, correct: false, ja: ttsText(d), phrase: phraseInfo(d) })),
      ]),
    });
  }

  // 금액·숫자 듣기 — 듣고 금액 고르기 (계산대 실전). 오답도 금액이라 진짜 들어야 함.
  const PRICE_IDS = ['p_num_hyakuen', 'p_num_gohyakuen', 'p_num_senen', 'p_num_nisenen', 'p_num_gosenen', 'p_num_ichimanen'];
  for (const id of PRICE_IDS) {
    const p = phrases.find((x) => x.id === id);
    if (!p) continue;
    const distract = shuffle(phrases.filter((x) => PRICE_IDS.includes(x.id) && x.id !== id)).slice(0, 3);
    cards.push({
      kind: 'quiz', id: `listen:${id}`, tag: '금액 듣기',
      banner: '듣기', bannerJa: ttsText(p), sub: '듣고 금액을 고르세요',
      listen: true,
      reviewTarget: { type: 'phrase', id },
      choices: shuffle([
        { label: p.korean, correct: true, ja: ttsText(p), phrase: phraseInfo(p) },
        ...distract.map((d) => ({ label: d.korean, correct: false, ja: ttsText(d), phrase: phraseInfo(d) })),
      ]),
    });
  }

  // 미션 — 콘텐츠에 정의된 순서대로 전부 (새 장면 추가 시 자동 포함)
  for (const m of missions) {
    const introduced = new Set<string>();
    const addIntroduce = (phraseId: string, note: string) => {
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
        reviewTarget: { type: 'mission', id: m.id as CLevel },
      });
    };

    for (const pid of m.speakPhraseIds ?? []) {
      addIntroduce(pid, '장면 끝에서 직접 말해볼 핵심 표현입니다. 먼저 의미와 소리를 익혀둡니다.');
    }

    m.steps.forEach((step, idx) => {
      const prompt = step.promptPhraseId ? byPhrase(step.promptPhraseId) : undefined;
      cards.push({
        kind: 'quiz', id: `mission:${m.id}:${idx}`, tag: `${m.id} 미션`,
        scenario: m.scenario,
        banner: step.situationKo,
        bannerJa: ttsText(prompt),
        // prompt이 있으면 kana는 promptPhrase로 분리(발음 보조 렌더). sub엔 화자만.
        sub: step.speaker ?? '',
        promptPhrase: phraseInfo(prompt),
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

  // 받아쓰기 카드 (듣고 가나 타일로 문장 완성)
  for (const id of DICTATION_IDS) {
    const p = phrases.find((x) => x.id === id);
    if (!p) continue;
    const answer = toReadingUnits(p.kana).map((u) => u.text).filter((t) => t.trim());
    const distractors = shuffle(DICTATION_DISTRACTORS.filter((d) => !answer.includes(d))).slice(0, 3);
    cards.push({
      kind: 'dictation', id: `dictation:${id}`, tag: '받아쓰기',
      ja: ttsText(p) ?? p.kana, answer, korean: p.korean,
      tiles: shuffle([...answer, ...distractors]),
      reviewTarget: { type: 'phrase', id },
    });
  }

  // 한→일 작문 카드 (한국어 뜻 보고 가나 타일로 일본어 조립) — 산출 강화. dictation UI 재사용.
  for (const id of DICTATION_IDS) {
    const p = phrases.find((x) => x.id === id);
    if (!p) continue;
    const answer = toReadingUnits(p.kana).map((u) => u.text).filter((t) => t.trim());
    const distractors = shuffle(DICTATION_DISTRACTORS.filter((d) => !answer.includes(d))).slice(0, 3);
    cards.push({
      kind: 'dictation', id: `compose:${id}`, tag: '작문', promptKind: 'korean',
      ja: ttsText(p) ?? p.kana, answer, korean: p.korean,
      tiles: shuffle([...answer, ...distractors]),
      reviewTarget: { type: 'phrase', id },
    });
  }

  // 거리 읽기 — 간판·메뉴·안내·교통 표기 보고 뜻 맞히기 (실제 일본에서 눈에 띄는 것)
  for (const sg of signs) {
    const pool = signs.filter((x) => x.category === sg.category && x.korean !== sg.korean);
    const distract = shuffle(pool.length >= 2 ? pool : signs.filter((x) => x.korean !== sg.korean)).slice(0, 3);
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
