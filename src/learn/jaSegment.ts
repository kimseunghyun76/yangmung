// 일본어 가나 문장의 휴리스틱 분절 — 한→일 작문 타일을 단어·조사·동사로 묶기 위함.
// 형태소 분석기(MeCab)가 없으므로, 태그가 붙은 사전(서술어·단어·조사)에 대한 최장 일치로 추정한다.
// 핵심 안전장치: 사전에 없는 잔여가 1글자라도 생기면 confident=false → 작문 화면은 기존 가나 타일로
// 폴백한다. 즉 "깔끔하게 분절되는 문장만" 품사 묶음을 보여주고, 애매하면 절대 엉터리로 끊지 않는다.
import { VOCAB_GROUPS } from '../content/thematicVocab';
import { signs } from '../content/signs';

export type SegPos = 'word' | 'particle' | 'verb';
export interface Segment { text: string; pos: SegPos }
export interface SegmentResult { segments: Segment[]; confident: boolean }

// 서술어(동사·형용사·です/ます체) — 통째로 한 토큰. 긴 것부터.
const PREDICATES = [
  'あたためてください', 'おねがいします', 'みせてください', 'まってください', 'ございます',
  'わかりました', 'わかりません', 'おきまりですか', 'いらっしゃいませ',
  'ください', 'あります', 'ありません', 'いります', 'いりません', 'ほしいです',
  'けっこうです', 'だいじょうぶ', 'そうです', 'おいしい', 'からい',
  'ですか', 'でした', 'でしょう', 'です',
  'ますか', 'ましたか', 'ました', 'ません', 'ましょう', 'ます',
];

// 닫힌 조사 집합(보수적). 긴 것부터. 잘못 끊을 위험 큰 단음(な·し·わ 등)은 제외.
const PARTICLES = [
  'までに', 'からは', 'では', 'には', 'とは', 'へは', 'でも', 'けど', 'けれど', 'ので', 'のに',
  'から', 'まで', 'より', 'など', 'だけ', 'しか', 'くらい', 'ぐらい', 'って',
  'は', 'が', 'を', 'に', 'へ', 'と', 'も', 'の', 'や', 'か', 'ね', 'よ', 'で',
];

// 자주 쓰는 단어(명사·부사·감탄·지시어). 1글자 단어는 조사와 충돌하므로 2글자 이상만.
const CURATED_WORDS = [
  'はい', 'いいえ', 'うん', 'いや', 'これ', 'それ', 'あれ', 'どれ', 'ここ', 'そこ', 'あそこ', 'どこ',
  'なに', 'なん', 'いくら', 'おすすめ', 'メニュー', 'レシート', 'みず', 'おみず', 'えき', 'きっぷ',
  'かぎ', 'ふくろ', 'おなまえ', 'なまえ', 'おのみもの', 'のみもの', 'ごちゅうもん', 'ちゅうもん',
  'おかいけい', 'かいけい', 'おしはらい', 'しはらい', 'ほうほう', 'げんきん', 'カード', 'クレジットカード',
  'ありがとう', 'すみません', 'こんにちは', 'こんばんは', 'おはよう', 'さようなら',
  'ちょっと', 'ゆっくり', 'もういちど', 'いちど', 'なにも', 'えいご', 'にほんご', 'やさしい',
  'つぎ', 'のりかえ', 'ごうけい', 'せんえん', 'なんめいさま', 'めいさま',
];

// 앱 어휘·간판에서 알려진 단어(가나, 2글자+).
const APP_LEXICON: string[] = (() => {
  const set = new Set<string>();
  for (const g of VOCAB_GROUPS) for (const it of g.items) if (it.kana && it.kana.length >= 2) set.add(it.kana);
  for (const s of signs) if (s.kana && s.kana.length >= 2) set.add(s.kana);
  return [...set];
})();

// 태그 사전 — 길이 내림차순. 동률이면 서술어 > 단어 > 조사 우선.
const RANK: Record<SegPos, number> = { verb: 0, word: 1, particle: 2 };
const DICT: { text: string; pos: SegPos }[] = (() => {
  const seen = new Set<string>();
  const out: { text: string; pos: SegPos }[] = [];
  const add = (text: string, pos: SegPos) => { const k = pos + ':' + text; if (!seen.has(k)) { seen.add(k); out.push({ text, pos }); } };
  for (const t of PREDICATES) add(t, 'verb');
  for (const t of CURATED_WORDS) add(t, 'word');
  for (const t of APP_LEXICON) add(t, 'word');
  for (const t of PARTICLES) add(t, 'particle');
  out.sort((a, b) => (b.text.length - a.text.length) || (RANK[a.pos] - RANK[b.pos]));
  return out;
})();

// 가나 문장을 분절. 항상 무손실(이어붙이면 원문). confident=false면 잔여(미상) 토큰이 있음.
export function segmentJa(kana: string): SegmentResult {
  const s = kana;
  const n = s.length;
  const segments: Segment[] = [];
  let confident = true;
  let buf = ''; // 사전에 안 잡힌 잔여(미상 단어)
  const flush = () => { if (buf) { segments.push({ text: buf, pos: 'word' }); buf = ''; confident = false; } };

  let i = 0;
  while (i < n) {
    let hit: { text: string; pos: SegPos } | null = null;
    for (const e of DICT) { if (s.startsWith(e.text, i)) { hit = e; break; } } // 길이 내림차순 → 첫 일치가 최장
    if (hit) { flush(); segments.push({ text: hit.text, pos: hit.pos }); i += hit.text.length; continue; }
    buf += s[i];
    i += 1;
  }
  flush();
  return { segments, confident };
}
