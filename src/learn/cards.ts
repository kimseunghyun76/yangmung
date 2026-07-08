// 학습 카드 생성기 — Unit/Mission 데이터에서 Card[] 생성.
// 친구 4차 권고: App.tsx 하드코딩 분리, SRS 도입 전제 조건.
import { CONTENT } from '../content';
import type { CLevel, KanaItem, ReviewTarget, Phrase, MissionStep } from '../content/types';
import { signs } from '../content/signs';
import { grammarLevel } from '../content/grammar';
import { minimalPairs } from '../content/minimalPairs';
import { VOCAB_GROUPS, type VocabItem } from '../content/thematicVocab';
import { BASIC_LIFE_ITEMS, BASIC_GROUP_LABEL, type BasicLifeItem } from '../content/basicLife';
import { GREETING_RESPONSES, greetingResponseFor } from '../content/greetingResponses';
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

// 작문(한→일) 전용 큐레이션 — 받아쓰기(위 DICTATION_IDS + 전체 자동편입)와 분리.
// 기준: ① 앱 미션에서 실제 학습자 답변으로 가장 자주 등장(promotionPool 분석) ② はい/すみません 등
// 일본인이 일상에서 아주 흔하게 쓰는 both 표현 ③ 미션에 나오는 짧고 쉬운 점원 질문(답변과 짝지어
// 나중에 미션 학습에 바로 도움이 되도록). 무작위 전체 자동편입은 여전히 안 한다 — 이 배열에 없는
// 표현이 섞이면 "가장 흔한 문장" 취지가 흐려지기 때문. 대신 2026-07-05에 사용자 요청으로 큐레이션
// 기준(미션 실사용 ≥1회 + productive/both 또는 짧은 점원 질문)은 유지한 채 70→265개(약 3.8배)로 확장.
const COMPOSE_IDS = [
  // 핵심 상시 표현(register: both) — 가장 흔한 인사·응답
  'p_hai', 'p_iie', 'p_arigatou', 'p_daijoubu', 'p_konnichiwa', 'p_sumimasen',
  'p_onegai_shimasu', 'p_kore', 'p_arimasu', 'p_arimasen', 'p_sou_desu',
  'p_daijoubu_desu', 'p_kippu',
  // 여행 실전 필수 표현
  'p_oishii', 'p_genkin_de', 'p_card_de', 'p_mizu_kudasai', 'p_kore_kudasai',
  'p_wakarimashita', 'p_eki', 'p_irasshai', 'p_fukuro', 'p_doko_made',
  'p_nomimono', 'p_gochuumon', 'p_onamae_wa', 'p_nanmeisama', 'p_norikae_kudasai',
  'p_kagi_desu', 'p_yukkuri', 'p_mou_ichido', 'p_eigo_de', 'p_yasashii_nihongo',
  'p_chotto_matte', 'p_wakarimasen', 'p_ikura_desu_ka', 'p_osusume_wa',
  // 미션 최다빈출 답변(3회 이상 등장) — 미션 학습 시 바로 도움
  'p_oboete_okimasu', 'p_hitotsu_kudasai', 'p_sou_shimasu', 'p_itte_mimasu',
  'p_kakunin_shimashita', 'p_tasukarimashita', 'p_iie_arimasen', 'p_kore_to_kore',
  'p_dochira_desu_ka', 'p_hai_wakarimashita', 'p_hai_arimasu', 'p_yoyaku_shiteimasu',
  'p_tasukete', 'p_kore_kudasai_shop', 'p_kore_nani', 'p_tanoshimi_desu',
  'p_futari_desu', 'p_itadakimasu', 'p_iie_irimasen', 'p_futatsu_kudasai',
  'p_betsubetsu_de', 'p_mochikaeri_de', 'p_suica_de', 'p_ki_o_tsukemasu',
  'p_heya_doko', 'p_choushoku_wa', 'p_mata_kimasu', 'p_doko_desu_ka',
  // 미션에 자주 나오는 짧은 점원 질문 — 답변(위 항목)과 짝을 이뤄 미션 회화 감각을 미리 익힘
  'p_atatamemasu_ka', 'p_hashi_irimasu_ka', 'p_yoyaku_wa_arimasu_ka',
  'p_dou_nasaimashita_ka', 'p_nanika_osagashi_desu_ka',
  // ── 4배 확장(2026-07-05) — 미션 실사용 빈도순 답변(register productive/both) ──
  'p_hai_onegai', 'p_okaikei', 'p_pasupooto_arimasu', 'p_tsukaikata', 'p_card_tsukaemasu_ka',
  'p_ryoushuusho', 'p_reshiito_kudasai', 'p_michi_oshiete', 'p_kore_de', 'p_wakarimashita_arigatou',
  'p_gochisousama', 'p_yoroshiku_onegai', 'p_kippu_kudasai', 'p_nanbansen', 'p_komakaku',
  'p_kore_ikura', 'p_arerugi', 'p_kore_nuite', 'p_toire_doko', 'p_shashin_ii',
  'p_sorede_onegai', 'p_fukuro_iranai', 'p_shinjuku_doko', 'p_tsugi_wa_shibuya', 'p_mikka',
  'p_kono_botan_oshite', 'p_oomori', 'p_atama_itai', 'p_onaka_itai', 'p_kaze_desu',
  'p_kusuri_kudasai', 'p_kono_kusuri', 'p_basho_o_oshiete_kudasai', 'p_sagashite_mimasu', 'p_iie_kekkou',
  'p_hai_sou_desu', 'p_iie_nanimoarimasen', 'p_menu_misete', 'p_arigatou_gozaimasu', 'p_atatamete',
  'p_irimasen', 'p_sono_mama_de', 'p_ichiman_de', 'p_isshuukan', 'p_hoteru_desu',
  'p_shichaku', 'p_made_onegai', 'p_koko_de_tomete', 'p_aruite_nanpun', 'p_ookii_no_de',
  'p_shashin_onegai', 'p_hitori_desu', 'p_checkin_onegai', 'p_wifi_arimasu_ka', 'p_tennai_de',
  'p_esu_saizu_de', 'p_emu_saizu_de', 'p_hotto_de', 'p_aisu_de', 'p_kippu_nimai_kudasai',
  'p_sumimasen_koko_doko', 'p_nihongo_sukoshi_dake', 'p_shokugo_kakunin', 'p_mou_juubun', 'p_aruite_mimasu',
  'p_matte_imasu', 'p_koko_de_orimasu', 'p_hai_atatamete', 'p_are', 'p_eki_wa_doko',
  'p_hashi_kudasai', 'p_oden_hitotsu', 'p_karaage_kudasai', 'p_ijou_desu', 'p_hatachi_ijou_desu',
  'p_ookii_fukuro', 'p_supuun_kudasai', 'p_card_de_onegai', 'p_suica_de_onegai', 'p_sen_en_chaaji',
  'p_karai_desu_ka', 'p_chaaji_onegai', 'p_kaisatsu_doko', 'p_kankou_desu', 'p_shigoto_desu',
  'p_ryougae', 'p_koinrokkaa', 'p_okuritai', 'p_takkyubin', 'p_kenbaiki',
  'p_kaedama', 'p_men_katame', 'p_ajitama_tsuika', 'p_chaashuu_tsuika', 'p_menzei_dekimasu_ka',
  'p_takushi_onegai', 'p_chikai_desu_ka', 'p_hidari_migi', 'p_netsu_arimasu', 'p_seki_ga_demasu',
  'p_ninshin_chuu', 'p_ippan_michi_de', 'p_kaishain_desu', 'p_gakusei_desu', 'p_ichiman_ryougae',
  'p_zenbu_de', 'p_chiisai_no_de', 'p_nanji_made', 'p_maebarai_de', 'p_chakubarai_de',
  'p_nan_gousha', 'p_tsugi_de_orimasu', 'p_saifu_nakushita', 'p_ugokemasen', 'p_kusuri_nondeimasu',
  'p_sentaku_de', 'p_kansou_de', 'p_chiketto_wa_kochira_desu', 'p_shotto_tsuika', 'p_nihon_go_muzukashii',
  'p_kado_de_ii_desu_ka', 'p_otsuri_daijoubu', 'p_yubi_okimasu', 'p_kingaku_kakunin', 'p_tsukaikata_wakatta',
  'p_bangou_memo', 'p_counter_de_ii', 'p_renraku_kudasai', 'p_isoide_kudasai', 'p_tadaima',
  'p_koukan_shitai', 'p_henkin_de', 'p_nigate_na_mono_arimasu_ka', 'p_kore_hitotsu_de_yoroshii_desu_ka', 'p_hot_ice_dochira',
  'p_pointo_arimasu_ka', 'p_ijou_de_yoroshii', 'p_doko_tomaru', 'p_reshiito_irimasu_ka', 'p_topping_ikaga',
  'p_netsu_arimasu_ka', 'p_saizu_ikaga', 'p_ikaga_desu_ka', 'p_otsutsumi_shimasu_ka', 'p_nimotsu_arimasu_ka',
  'p_kousoku_tsukaimasu_ka', 'p_oshigoto_wa', 'p_kaeri_koukuuken', 'p_ikura_ryougae', 'p_sen_en_satsu',
  'p_locker_size', 'p_yokujitsu_de_ii', 'p_chakubarai_ka', 'p_oryouri_ikaga', 'p_tattoo_arimasu_ka',
  'p_yukata_size', 'p_ekiben', 'p_hoken_dou', 'p_funshitsu_todoke', 'p_ugokemasu_ka',
  'p_jibyou', 'p_data_youryou', 'p_nannichikan', 'p_sentaku_kansou', 'p_kingyo_sukui',
  'p_nanbon_kasa', 'p_jiyuuseki_shitei', 'p_size_dou', 'p_fukuro_iru', 'p_reshiito_omochi',
  'p_meisai', 'p_nanbu', 'p_ryoumen', 'p_megaphone', 'p_hokenshou_omochi',
  'p_generic', 'p_omakase_course', 'p_aruku_densha',
  // ── 4배 확장 — 짧은 점원 질문(register receptive, ですか/ますか 형) ──
  'p_kochira_de_meshiagarimasu_ka', 'p_saizu_wa_dou_shimasu_ka', 'p_dore_ni_shimasu_ka',
  'p_fukuro_otsuke_shimasu_ka', 'p_betsubetsu_tsutsumi', 'p_nomimono_wa_dou_shimasu_ka',
  'p_kauntaa_de_yoroshii_desu_ka', 'p_sabi_wa_daijoubu_desu_ka', 'p_chizu_wa_irimasu_ka',
  'p_taoru_wa_irimasu_ka', 'p_dochira_made_ikimasu_ka', 'p_jiyuuseki_desu_ka',
  'p_hokenshou_wa_arimasu_ka', 'p_daijoubu_desu_ka', 'p_dono_puran_ni_shimasu_ka',
  'p_nanmai_desu_ka', 'p_custom_arimasu',
];

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
  /** 이 퀴즈의 정답으로 학습돼야 하는 표현 ids — 새 표현 학습 전엔 퀴즈를 내지 않기 위한 게이트. */
  answerPhraseIds?: string[];
  reviewTarget?: ReviewTarget; // SRS 대상 (없으면 추적 X)
}

export interface TipCard {
  kind: 'tip';
  id: string;
  tag: string;
  label: string;
  tipKo: string;
  tier?: 1 | 2 | 3 | 4 | 5; // 팁 난이도 — 세션 레벨(미션 티어 범위)에 맞춰 필터링
  missionIds?: string[]; // 이 팁과 특히 관련 있는 미션 id들 — 미션 진입 시 우선 노출
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
  altAnswers?: { ja: string; kana: string; korean: string }[];     // 같은 질문에 가능한 다른 정답들
  reviewTarget?: ReviewTarget;
  /** 격식 — 인사말 등에서 친한 사이/정중한 사이 구분 표시용(있을 때만 배지 노출). */
  register?: 'casual' | 'formal' | 'both';
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
function makeStudyCard(opts: { id: string; tag: string; ja: string; kana: string; korean: string; tip?: string; register?: 'casual' | 'formal' | 'both' }): IntroduceCard {
  return {
    kind: 'introduce',
    id: opts.id,
    tag: opts.tag,
    phraseId: opts.id,
    ja: opts.ja,
    kana: opts.kana,
    korean: opts.korean,
    tip: opts.tip,
    register: opts.register,
    note: '소리를 듣고, 일본어와 뜻을 함께 읽어보세요.',
    // reviewTarget 없음 — 소개 카드는 채점하지 않는다.
  };
}

// "듣고 일본어 찾기" 퀴즈 — 소리(kana)를 듣고 알맞은 일본어 표기를 고른다.
function makeHearToJaCard(opts: {
  id: string; tag: string; reviewId: string;
  item: { ja: string; kana: string; korean: string; tip?: string };
  distract: { ja: string; kana: string; korean: string; tip?: string }[];
}): QuizCard {
  const phrase = (item: { ja: string; kana: string; korean: string; tip?: string }) => ({ kana: item.kana, kanji: item.ja, korean: item.korean, tip: item.tip });
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
      { label: opts.item.ja, correct: true, ja: opts.item.kana, phrase: phrase(opts.item) },
      ...opts.distract.map((d) => ({ label: d.ja, correct: false, ja: d.kana, phrase: phrase(d) })),
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

// 퀴즈 난이도 라벨 — 모든 퀴즈/받아쓰기 카드에 입문·기본·중급·고급 표기.
// 미션은 tier(1~5)로, 빠른 연습은 콘텐츠 종류(가나/어휘/작문…)로 매핑.
export type DifficultyLabel = '입문' | '기본' | '중급' | '고급';
const TIER_TO_DIFF: DifficultyLabel[] = ['입문', '기본', '중급', '고급', '고급'];
export function cardDifficulty(card: Card): DifficultyLabel | null {
  if (card.kind === 'quiz' && card.reviewTarget?.type === 'mission') {
    return TIER_TO_DIFF[(card.tier ?? 1) - 1] ?? '입문';
  }
  if (card.kind === 'dictation') {
    return card.promptKind === 'korean' ? '입문' : '고급'; // 한→일 작문=입문, 받아쓰기=고급
  }
  if (card.kind === 'quiz') {
    const id = card.id;
    if (id.startsWith('kana:') || id.startsWith('pair:')) return '입문';
    if (id.startsWith('vocab:') || id.startsWith('sign:') || id.startsWith('basic:')) return '기본';
    if (card.tier) return TIER_TO_DIFF[card.tier - 1] ?? '기본';
    return '기본';
  }
  return null;
}

const fallbackRecoveryIds = ['p_mou_ichido', 'p_yukkuri', 'p_yasashii_nihongo', 'p_eigo_de'];


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
    cards.push(makeStudyCard({ id: `basic:study:${item.id}`, tag: `숫자 학습 · ${group}`, ja: item.ja, kana: item.kana, korean: item.korean }));
    cards.push(makeHearToJaCard({ id: `basic:hear2ja:${item.id}`, tag: `숫자 학습 · ${group}`, reviewId: `basic:${item.id}`, item, distract }));
    cards.push({
      kind: 'quiz',
      id: `basic:read:${item.id}`,
      tag: `숫자 학습 · ${group}`,
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
      tag: `숫자 학습 · ${group}`,
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
      tag: `숫자 학습 · ${group}`,
      banner: item.korean,
      sub: `뜻에 맞는 ${group} 일본어를 고르세요`,
      reviewTarget: { type: 'phrase', id: `basic:${item.id}` },
      choices: shuffle([
        { label: item.ja, correct: true, ja: item.kana, phrase: phrase(item) },
        ...distract.map((d) => ({ label: d.ja, correct: false, ja: d.kana, phrase: phrase(d) })),
      ]),
    });
  }
  return cards;
}

// 오답(distractor)이 "헷갈리는 단답"이 되지 않게 거른다.
// 네/예/아니요/알겠습니다/감사합니다 같은 짧은 반응은 거의 모든 질문에 어중간하게 들어맞아
// 정답처럼 보인다 → 완전히 다른 '문장형' 표현만 오답 후보로 써서 오해를 없앤다.
const cleanLen = (s: string) => s.replace(/[\s,.!?·~()]/g, '').length;
const isAmbiguousReply = (p: Phrase): boolean => {
  const ko = p.korean.trim();
  if (cleanLen(ko) <= 5) return true; // 단답형
  return /^(네|예|응|아니|아뇨|알겠|감사|고마|고맙|괜찮|그래|맞아|좋아|싫|있어요|없어요|부탁(합니다|해요|드려요|드립니다)$)/.test(ko);
};

// 미션 스텝 → 퀴즈 선택지 풀.
// 정책: 정답 후보 중 1개만 노출 + 오답 3개. 복구 표현은 보기로 섞지 않고 하단 액션으로만 보여준다.
// 세션 시작 때마다 다시 뽑아 새 문제처럼 보이게 한다.
function buildStepChoicePools(stepChoices: MissionStep['choices'], byPhrase: (id: string) => Phrase, allPhrases: Phrase[], promptPhraseId?: string, preferred?: Phrase[], missionId?: string, phraseOwnerMissions?: Map<string, Set<string>>): NonNullable<QuizCard['choicePools']> {
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
  // 질문(점원 대사) 자체가 오답 보기로 새지 않게 제외 — 같은 문장이 질문이자 답이 되면 안 됨.
  if (promptPhraseId) {
    usedPhraseIds.add(promptPhraseId);
    const pp = byPhrase(promptPhraseId);
    if (pp) { usedLabels.add(pp.korean); }
  }
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
    const eligible = (p: Phrase) =>
      !usedPhraseIds.has(p.id)
      && !usedLabels.has(p.korean)
      && p.korean.length <= 18
      && !fallbackRecoveryIds.includes(p.id)
      && !isAmbiguousReply(p); // 헷갈리는 단답·반응어 제외
    // 다른 장면 하나에만 강하게 묶인 표현(예: 료칸 전용 "유카타 사이즈는…")은 주제가 어긋나 보이므로 최후순위로 미룬다.
    const otherOwnerCount = (p: Phrase): number => {
      if (!missionId || !phraseOwnerMissions) return 0;
      const owners = phraseOwnerMissions.get(p.id);
      if (!owners || owners.has(missionId)) return 0; // 이 미션 소유거나 무소속(범용) → 교차 아님
      return owners.size;
    };
    const ownedByOtherMission = (p: Phrase): boolean => otherOwnerCount(p) > 0;
    // 교차 미션 표현은 "여러 장면에 두루 쓰이는(=범용적)" 것을 먼저, "특정 한 장면 전용(=엉뚱)"을 최후로.
    // 예: 약국 오답으로 코인세탁 전용 "완료까지 30분입니다"(1곳 소유)보다, 여러 가게에서 쓰는 표현을 우선.
    const crossMission = shuffle(allPhrases.filter((p) => eligible(p) && ownedByOtherMission(p)))
      .sort((a, b) => otherOwnerCount(b) - otherOwnerCount(a));
    // 우선순위: ①같은 장면(미션) 표현 → ②특정 장면에 안 묶인 범용 표현 → ③교차(범용적인 것부터, 전용은 최후).
    const pool: Phrase[] = [
      ...shuffle((preferred ?? []).filter(eligible)),
      ...shuffle(allPhrases.filter((p) => eligible(p) && !ownedByOtherMission(p))),
      ...crossMission,
    ];
    const taken = new Set<string>();
    for (const p of pool) {
      if (wrong.length >= 3) break;
      if (taken.has(p.id) || usedPhraseIds.has(p.id) || usedLabels.has(p.korean)) continue;
      taken.add(p.id);
      wrong.push({
        label: p.korean,
        correct: false,
        ja: ttsText(p),
        phrase: phraseInfo(p),
        feedback: '지금 질문에 대한 답은 아니에요.',
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
      cards.push(makeStudyCard({ id: `vocab:${group.id}:study:${item.id}`, tag: `어휘 · ${group.label}`, ja: item.ja, kana: item.kana, korean: item.korean, tip: item.tip, register: item.register }));
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

      // (D) 인사 전용 — 이 인사에 자연스러운 반응 고르기(학습 카드의 "반응" 미니 컨텍스트와 짝).
      if (group.id === 'greetings') {
        const response = greetingResponseFor(item.id);
        if (response) {
          const otherResponses = group.items
            .filter((x) => x.id !== item.id && GREETING_RESPONSES[x.id] && GREETING_RESPONSES[x.id]!.ja !== response.ja)
            .map((x) => ({ id: x.id, ...GREETING_RESPONSES[x.id]! }));
          const distractResponses = shuffle(otherResponses).slice(0, 3);
          if (distractResponses.length >= 2) {
            cards.push({
              kind: 'quiz',
              id: `vocab:${group.id}:response:${item.id}`,
              tag: `어휘 · ${group.label}`,
              banner: item.ja,
              bannerJa: item.kana,
              sub: '이 인사에 자연스러운 반응은?',
              reviewTarget: { type: 'phrase', id: `vocab:${group.id}:${item.id}` },
              choices: shuffle([
                { label: response.ja, correct: true, ja: response.ja, phrase: { kana: response.ja, kanji: response.ja, korean: response.korean } },
                ...distractResponses.map((d) => ({ label: d.ja, correct: false, ja: d.ja, phrase: { kana: d.ja, kanji: d.ja, korean: d.korean } })),
              ]),
            });
          }
        }
      }
    }

    // 그룹 대표 예문 — 단어를 익힌 뒤 문장 속에서 보는 학습 카드(채점 없음).
    (group.examples ?? []).forEach((ex, i) => {
      cards.push({
        kind: 'introduce',
        id: `vocab:${group.id}:study:ex${i}`,
        tag: `어휘 · ${group.label} · 예문`,
        phraseId: `vocab:${group.id}:ex${i}`,
        ja: ex.ja,
        kana: ex.kana,
        korean: ex.korean,
        note: '배운 단어가 문장에서 어떻게 쓰이는지 듣고 읽어보세요.',
      });
    });
  }

  return cards;
}

// difficulty(1~4) — 레벨(모드)에 맞춰 작문 방해 타일·받아쓰기 방해 수를 조절한다.
export function buildCards(difficulty: 1 | 2 | 3 | 4 = 2): Card[] {
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

  // ── 표현 → 소유 미션 집합 — 오답 보기가 "다른 장면 전용" 표현을 끌어와 주제가 어긋나는 것을 막는 데 사용. ──
  // 특정 미션 1곳에만 묶인 표현(예: 료칸의 "유카타 사이즈는 어떠세요?")은 다른 장면 오답으로 쓰면 엉뚱해진다.
  const phraseOwnerMissions = new Map<string, Set<string>>();
  {
    const addOwner = (pid: string | undefined, missionId: string) => {
      if (!pid) return;
      if (!phraseOwnerMissions.has(pid)) phraseOwnerMissions.set(pid, new Set());
      phraseOwnerMissions.get(pid)!.add(missionId);
    };
    for (const m of missions) {
      for (const pid of m.speakPhraseIds ?? []) addOwner(pid, m.id);
      for (const step of m.steps) {
        addOwner(step.promptPhraseId, m.id);
        for (const ch of step.choices ?? []) addOwner(ch.phraseId, m.id);
      }
    }
  }

  // 가나 드릴 — Unit 기반 자동 생성, 글자당 3종 (읽기 / 듣기 / 구분)
  // 단계(K1, K2, …) 드릴 Unit을 순서대로 처리. 각 Unit 안에서는
  // read 전체 → listen 전체 → confuse 전체 순 (한 글자에 3종이 몰리지 않게).
  const drillUnits = units.filter((u) => u.track === 'kana' && u.mode === 'drill');
  for (const unit of drillUnits) {
    cards.push(...buildKanaCards(unit.stage, unit.kanaIds ?? [], { byKana, byKanaChar, kana }));
  }

  // 최소 페어 구분 — 헷갈리는 음을 듣고 4지선다로 고르기 (발음 변별, LEARNING_METHODS_PLAN §2).
  // 쌍마다 a·b 각각 정답인 카드 2장 생성. 보기 순서는 shuffle로 매번 달라진다.
  // 2지선다(자기 쌍만)는 너무 쉽게 찍을 수 있어, 다른 쌍의 표현 2개를 오답으로 더해 4지선다로 확장.
  const allPairSides = minimalPairs.flatMap((p) => [
    { kana: p.a.kana, korean: p.a.korean, tier: p.tier },
    { kana: p.b.kana, korean: p.b.korean, tier: p.tier },
  ]);
  for (const mp of minimalPairs) {
    const sides = [
      { key: 'a' as const, self: mp.a, other: mp.b },
      { key: 'b' as const, self: mp.b, other: mp.a },
    ];
    for (const { key, self, other } of sides) {
      // 오답 2개 추가 — 같은 쌍(self·other)은 제외, 같은 tier(비슷한 난이도)를 우선.
      const excludeKana = new Set([self.kana, other.kana]);
      const pool = allPairSides.filter((s) => !excludeKana.has(s.kana));
      const sameTier = shuffle(pool.filter((s) => (s.tier ?? 1) === (mp.tier ?? 1)));
      const otherTier = shuffle(pool.filter((s) => (s.tier ?? 1) !== (mp.tier ?? 1)));
      const extra: typeof pool = [];
      const takenKana = new Set<string>();
      for (const cand of [...sameTier, ...otherTier]) {
        if (extra.length >= 2) break;
        if (takenKana.has(cand.kana)) continue;
        takenKana.add(cand.kana);
        extra.push(cand);
      }
      cards.push({
        kind: 'quiz', id: `pair:${mp.id}:${key}`, tag: '발음 구분',
        banner: '듣기', bannerJa: self.kana, sub: '듣고 들린 쪽을 고르세요',
        listen: true,
        tier: mp.tier ?? 1,
        reviewTarget: { type: 'phrase', id: `pair:${mp.id}:${key}` },
        choices: shuffle([
          { label: self.kana, correct: true, ja: self.kana, phrase: { kana: self.kana, korean: self.korean, tip: mp.focus } },
          { label: other.kana, correct: false, ja: other.kana, phrase: { kana: other.kana, korean: other.korean, tip: mp.focus } },
          ...extra.map((e) => ({ label: e.kana, correct: false, ja: e.kana, phrase: { kana: e.kana, korean: e.korean } })),
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
  // 각 미션에서 쓰이는 표현은 그 미션 안에서 반드시 먼저 소개한다.
  // 같은 표현이 여러 미션에 나오더라도, 해당 장면 퀴즈 전에 다시 학습 카드로 노출한다.
  for (const m of missions) {
    const introduced = new Set<string>();
    // 구체적인 상황(scenario)을 우선 — 「편의점 계산대」에서 쓸 수 있는 표현들을 익혀봅시다.
    const sceneLabel = (m.scenario ?? m.place) as string;
    const sceneNote = `「${sceneLabel}」에서 쓸 수 있는 표현들을 익혀봅시다.`;
    const addIntroduce = (phraseId: string, note: string, question?: IntroduceCard['answersQuestion'], altAnswers?: IntroduceCard['altAnswers']) => {
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
        altAnswers: altAnswers && altAnswers.length ? altAnswers : undefined,
        reviewTarget: { type: 'mission', id: m.id as CLevel },
      });
    };

    for (const pid of m.speakPhraseIds ?? []) {
      addIntroduce(pid, sceneNote);
    }

    // 같은 장면(미션)에서 쓰이는 표현들 — 자동 오답을 이 안에서 우선 뽑아 "현실 대화"에 맞춘다.
    // (다른 장면 문장이 보기로 튀어나오는 어색함 제거. 이번 질문엔 안 맞지만 같은 가게에서 할 법한 말.)
    const missionChoicePhrases: Phrase[] = (() => {
      const ids = new Set<string>();
      for (const s of m.steps) for (const ch of s.choices) if (ch.phraseId) ids.add(ch.phraseId);
      return [...ids].map((id) => byPhrase(id)).filter((p): p is Phrase => !!p);
    })();

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
      if (step.promptPhraseId) {
        addIntroduce(step.promptPhraseId, sceneNote);
      }
      // 같은 질문에 대한 정답(productive·correct·복구 아님)들 — 답변이 둘 이상이면 함께 보여준다.
      const isAns = (c: typeof step.choices[number]) =>
        !!c.phraseId && c.correct && !c.recoveryType && ['productive', 'both'].includes(byPhrase(c.phraseId).register);
      const correctAnswers = step.choices.filter(isAns);
      for (const ch of step.choices) {
        if (!ch.phraseId) continue;
        const alts = isAns(ch)
          ? correctAnswers.filter((o) => o.phraseId !== ch.phraseId).map((o) => { const ap = byPhrase(o.phraseId!); return { ja: ttsText(ap) ?? ap.kana, kana: ap.displayKana ?? ap.kana, korean: ap.korean }; })
          : undefined;
        // 오답(ch.correct===false) 보기는 "이 질문엔 이렇게 답해요" 틀로 소개하면 안 됨 —
        // 정답이 아닌 걸 정답처럼 가르치는 꼴이 된다. qInfo는 correct인 보기에만 붙인다.
        addIntroduce(ch.phraseId, sceneNote, ch.correct ? qInfo : undefined, alts);
      }
      const choicePools = buildStepChoicePools(step.choices, byPhrase, phrases, step.promptPhraseId, missionChoicePhrases, m.id, phraseOwnerMissions);
      // 미션 퀴즈 = "맞는 답 고르기"로 통일 (반전 퀴즈 제거).
      cards.push({
        kind: 'quiz', id: `mission:${m.id}:${idx}`, tag: `${m.id} 미션`,
        scenario: m.scenario,
        tier: (m.tier ?? 1) as 1 | 2 | 3 | 4 | 5, // 난이도 배지(미션 tier → 입문~고급)
        banner: step.situationKo,
        bannerJa: ttsText(prompt) ?? step.recapPromptJa,
        // prompt이 있으면 kana는 promptPhrase로 분리(발음 보조 렌더). sub엔 화자만.
        sub: step.speaker ?? '',
        promptPhrase: phraseInfo(prompt) ?? recapPrompt,
        reviewTarget: { type: 'mission', id: m.id as CLevel },
        // 이 스텝 정답(productive)들 — 새 표현 학습 전엔 이 퀴즈를 내지 않기 위한 게이트
        answerPhraseIds: correctAnswers.map((c) => c.phraseId!).filter(Boolean),
        choicePools,
        choices: materializeChoicePools(choicePools, false),
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
  // 작문 대상 — 받아쓰기와 달리 전체 자동편입 없이 COMPOSE_IDS 큐레이션만 사용.
  // "가장 흔하게 쓰이는 문장" 취지를 지키기 위해 풀을 넓히지 않는다.
  const composeTargetIds: string[] = COMPOSE_IDS.filter((id) => phrases.some((p) => p.id === id));

  // 받아쓰기 레벨 — 미션에 쓰이는 표현이면 그 미션 티어, 아니면 길이로 추정(짧으면 입문).
  const dictTier = (id: string, units: number): 1 | 2 | 3 | 4 | 5 => {
    const mt = phraseTier.get(id);
    if (mt) return mt;
    // 미션에 안 쓰인 표현은 길이로 레벨 추정 — 길수록 높은 레벨(받아쓰기 난이도↑)
    return units <= 3 ? 1 : units <= 5 ? 2 : units <= 7 ? 3 : units <= 9 ? 4 : 5;
  };
  // 작문 방해 타일 풀 — 모든 작문 대상 문장을 분절해 품사별 토큰을 모은다.
  // (작문이 "정답 조각만 배열"이 되지 않도록, 같은 품사의 그럴듯한 오답을 섞기 위함)
  const composePool: Record<SegPos, string[]> = { word: [], particle: [], verb: [] };
  {
    const seen: Record<SegPos, Set<string>> = { word: new Set(), particle: new Set(), verb: new Set() };
    for (const id of dictationTargetIds) {
      const p = phrases.find((x) => x.id === id);
      if (!p) continue;
      const seg = segmentJa(p.kana);
      if (!seg.confident) continue;
      for (const s of seg.segments) {
        if (!seen[s.pos].has(s.text)) { seen[s.pos].add(s.text); composePool[s.pos].push(s.text); }
      }
    }
  }
  // 정답 조각 + 같은 품사 방해 타일(품사당 최대 2, 합계 최대 4)을 섞어 작문 보기를 만든다.
  // 레벨에 맞춘 방해 타일 수: 입문 적게 → 고급 많게.
  const perLane = difficulty <= 1 ? 1 : 2;
  const decoyCap = [2, 3, 4, 6][difficulty - 1];
  const composeTiles = (segs: { text: string; pos: SegPos }[]): { tiles: string[]; tilePos: SegPos[] } => {
    const used = new Set(segs.map((s) => s.text));
    const posInAnswer = new Set(segs.map((s) => s.pos));
    const decoys: { text: string; pos: SegPos }[] = [];
    for (const pos of ['word', 'particle', 'verb'] as SegPos[]) {
      if (!posInAnswer.has(pos)) continue;
      for (const t of shuffle(composePool[pos].filter((x) => !used.has(x))).slice(0, perLane)) {
        decoys.push({ text: t, pos }); used.add(t);
      }
    }
    const combined = shuffle([...segs.map((s) => ({ text: s.text, pos: s.pos })), ...shuffle(decoys).slice(0, decoyCap)]);
    return { tiles: combined.map((c) => c.text), tilePos: combined.map((c) => c.pos) };
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
        const { tiles, tilePos } = composeTiles(seg.segments);
        cards.push({
          kind: 'dictation',
          id: `compose:${id}`,
          tag: '작문',
          promptKind: 'korean',
          ja: ttsText(p) ?? p.kana, answer, korean: p.korean,
          tiles,
          tilePos,
          tier: dictTier(id, answer.length),
          reviewTarget: { type: 'phrase', id },
        });
        return;
      }
      // 폴백: 가나 단위 타일 + 방해 타일
      const distractors = shuffle(DICTATION_DISTRACTORS.filter((d) => !units.includes(d))).slice(0, [2, 3, 4, 5][difficulty - 1]);
      cards.push({
        kind: 'dictation', id: `compose:${id}`, tag: '작문', promptKind: 'korean',
        ja: ttsText(p) ?? p.kana, answer: units, korean: p.korean,
        tiles: shuffle([...units, ...distractors]),
        tier: dictTier(id, units.length), reviewTarget: { type: 'phrase', id },
      });
      return;
    }

    // 받아쓰기 — 듣고 가나 키패드로 입력(타일 풀은 호환용으로만 유지)
    const distractors = shuffle(DICTATION_DISTRACTORS.filter((d) => !units.includes(d))).slice(0, [2, 3, 4, 5][difficulty - 1]);
    cards.push({
      kind: 'dictation', id: `dictation:${id}`, tag: '받아쓰기',
      ja: ttsText(p) ?? p.kana, answer: units, korean: p.korean,
      tiles: shuffle([...units, ...distractors]),
      tier: dictTier(id, units.length), reviewTarget: { type: 'phrase', id },
    });
  };

  // 받아쓰기(듣고 쓰기, 전체 풀) + 한→일 작문(뜻 보고 조립, 큐레이션 풀) — dictation UI 재사용
  for (const id of dictationTargetIds) pushTileCard(id, 'dictation');
  for (const id of composeTargetIds) pushTileCard(id, 'compose');

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
    cards.push(makeStudyCard({ id: `sign:study:${sg.id}`, tag: `${sg.category} 읽기`, ja: sg.ja, kana: sg.kana, korean: sg.korean, tip: sg.tip }));
    cards.push(makeHearToJaCard({ id: `sign:hear2ja:${sg.id}`, tag: `${sg.category} 읽기`, reviewId: `sign:${sg.id}`, item: sg, distract }));
    cards.push({
      kind: 'quiz', id: `sign:${sg.id}`, tag: `${sg.category} 읽기`,
      banner: sg.ja, bannerJa: sg.kana, sub: '이 표기는 무슨 뜻일까요?',
      reviewTarget: { type: 'phrase', id: `sign:${sg.id}` },
      choices: shuffle([
        { label: sg.korean, correct: true, ja: sg.kana, phrase: { kana: sg.kana, kanji: sg.ja, korean: sg.korean, tip: sg.tip } },
        ...distract.map((d) => ({ label: d.korean, correct: false, ja: d.kana, phrase: { kana: d.kana, kanji: d.ja, korean: d.korean, tip: d.tip } })),
      ]),
    });
  }

  // 정확성 팁 (디브리프) — 전체 풀 생성, 세션 선별에서 안 본 것 1개씩 회전
  for (const g of grammar) {
    if (!g.tipKo) continue;
    cards.push({ kind: 'tip', id: `tip:${g.id}`, tag: g.category ?? '팁', label: g.label, tipKo: g.tipKo, tier: grammarLevel(g), missionIds: g.missionIds });
  }

  return cards;
}
