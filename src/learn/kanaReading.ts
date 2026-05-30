// 가나 → 로마자 발음 보조. 콘텐츠(KanaItem)와 무관하게 모든 표현을 커버하는 정적 맵.
// 가타카나는 코드포인트 시프트로 히라가나로 정규화해 동일 표를 재사용.

// 히라가나 읽기 단위 → 로마자 (기본 + 탁음 + 반탁음)
const HIRA: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', を: 'o', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
};

const SMALL_Y: Record<string, 'a' | 'u' | 'o'> = { ゃ: 'a', ゅ: 'u', ょ: 'o' };

// 요음 결합: 자음부 + 모음. しゃ=sha, ちゃ=cha, じゃ=ja, 그 외 きゃ=kya.
function yoon(base: string, smallVowel: 'a' | 'u' | 'o'): string {
  const b = HIRA[base];
  if (!b) return '';
  if (b === 'shi') return 'sh' + smallVowel;       // しゃ sha
  if (b === 'chi') return 'ch' + smallVowel;       // ちゃ cha
  if (b === 'ji') return 'j' + smallVowel;         // じゃ ja
  return b.slice(0, -1) + 'y' + smallVowel;        // きゃ kya
}

// 가타카나 → 히라가나 (코드포인트 -0x60). 범위 밖이면 원문 유지.
function toHira(ch: string): string {
  const cp = ch.codePointAt(0)!;
  if (cp >= 0x30a1 && cp <= 0x30f6) return String.fromCodePoint(cp - 0x60);
  return ch;
}

const isSmallY = (ch: string) => ch === 'ゃ' || ch === 'ゅ' || ch === 'ょ' || ch === 'ャ' || ch === 'ュ' || ch === 'ョ';
const isSokuon = (ch: string) => ch === 'っ' || ch === 'ッ';
const isLong = (ch: string) => ch === 'ー';

export interface ReadingUnit { text: string; romaji: string; chars: string[] }

// 표시는 원문 그대로, 로마자는 정규화로 계산. 가나가 아닌 문자는 romaji '' (보조 없음).
export function toReadingUnits(s: string): ReadingUnit[] {
  const out: ReadingUnit[] = [];
  const chars = [...s];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];
    if (next && isSmallY(next)) {
      const base = toHira(ch);
      const small = toHira(next) as keyof typeof SMALL_Y;
      out.push({ text: ch + next, romaji: yoon(base, SMALL_Y[small]), chars: [ch, next] });
      i++;
      continue;
    }
    if (isLong(ch)) { out.push({ text: ch, romaji: 'ー', chars: [] }); continue; }
    if (isSokuon(ch)) { out.push({ text: ch, romaji: '', chars: [] }); continue; }
    const romaji = HIRA[toHira(ch)] ?? '';
    out.push({ text: ch, romaji, chars: romaji ? [ch] : [] });
  }
  return out;
}

// 문자열에서 실제 가나 문자만 추출 (seenKana 기록용 — 문장부호·공백 제외)
export function extractKanaChars(s: string): string[] {
  const out: string[] = [];
  for (const u of toReadingUnits(s)) out.push(...u.chars);
  return out;
}
