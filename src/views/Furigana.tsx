// 후리가나 — 한자 위에만 읽는 법을 작게 얹는다("한자 위에만 넣어달라"는 요청, 2026-08-04).
// Phrase 데이터엔 한자 문자열 전체(kanji)와 그 전체 읽기(kana)만 있고 한자 글자 하나하나에
// 대응하는 낱글자 읽기는 따로 없어서, 새 데이터를 지어내는 대신 kanji를 한자/비한자 덩어리로
// 쪼갠 뒤 비한자 덩어리(조사·오쿠리가나 등)를 kana 안에서 그대로 찾아 그 사이사이가 한자 덩어리의
// 읽기라고 역산한다. kana 필드는 문장에 따라 구두점(、？)이 있을 때도 없을 때도 있어(콘텐츠
// 관례가 두 가지라) 매칭 전에 구두점을 지워서 비교한다.
const KANJI_RE = /[一-龯㐀-䶿]/;
const PUNCT_RE = /[、。？！,.!?\s]/g;

const stripPunct = (s: string) => s.replace(PUNCT_RE, '');

interface Run { text: string; isKanji: boolean }

function splitRuns(kanji: string): Run[] {
  const runs: Run[] = [];
  let cur = '';
  let curIsKanji: boolean | null = null;
  for (const ch of kanji) {
    const isK = KANJI_RE.test(ch);
    if (curIsKanji === null || isK === curIsKanji) {
      cur += ch;
      curIsKanji = isK;
    } else {
      runs.push({ text: cur, isKanji: curIsKanji });
      cur = ch;
      curIsKanji = isK;
    }
  }
  if (cur) runs.push({ text: cur, isKanji: curIsKanji! });
  return runs;
}

interface Segment { text: string; reading?: string }

function buildSegments(kanji: string, kana: string): Segment[] {
  const runs = splitRuns(kanji);
  const strippedKana = stripPunct(kana);
  const segments: Segment[] = [];
  let pos = 0;
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i];
    if (!run.isKanji) {
      segments.push({ text: run.text });
      pos += stripPunct(run.text).length;
      continue;
    }
    // 한자 덩어리의 읽기 끝 지점 — 바로 다음 비한자 덩어리(구두점 제외 실제 글자가 있는 것)가
    // strippedKana 안에서 다시 나타나는 위치. 못 찾으면 문장 끝까지가 이 한자 덩어리의 읽기.
    let end = strippedKana.length;
    for (let j = i + 1; j < runs.length; j++) {
      if (runs[j].isKanji) break;
      const anchor = stripPunct(runs[j].text);
      if (!anchor) continue;
      const found = strippedKana.indexOf(anchor, pos);
      if (found >= pos) end = found;
      break;
    }
    const reading = strippedKana.slice(pos, end);
    segments.push({ text: run.text, reading: reading || undefined });
    pos = end;
  }
  return segments;
}

export function Furigana({ kanji, kana, style }: { kanji?: string; kana: string; style?: React.CSSProperties }) {
  if (!kanji || !KANJI_RE.test(kanji) || kanji === kana) {
    return <span lang="ja" style={style}>{kanji ?? kana}</span>;
  }
  // style(폰트 크기·굵기·줄간격 등)은 바깥 span에 걸고, <ruby>는 브라우저 기본 표시 방식을
  // 그대로 둔다 — ruby에 직접 display:block 등을 주면 rb/rt 정렬이 깨지는 걸 확인했다.
  const segments = buildSegments(kanji, kana);
  return (
    <span lang="ja" style={style}>
      {segments.map((seg, i) => seg.reading ? (
        <ruby key={i} style={{ rubyPosition: 'over' }}>
          {seg.text}
          <rp>(</rp>
          <rt style={{ fontSize: '0.5em', fontWeight: 700, color: 'var(--ink-soft)', userSelect: 'none' }}>{seg.reading}</rt>
          <rp>)</rp>
        </ruby>
      ) : (
        <span key={i}>{seg.text}</span>
      ))}
    </span>
  );
}
