// 후리가나 — 한자 표기 위에 읽는 법을 작게 얹어 보여준다("한자 위에 반드시 후리가나로
// 표시해달라"는 요청). Phrase 데이터엔 한자 문자열 전체(kanji)와 그 전체 읽기(kana)만 있고
// 한자 글자 하나하나에 대응하는 낱글자 읽기는 없어서(예: 新宿駅 ↔ しんじゅくえき를 글자
// 단위로 쪼갤 근거가 없음), 새 데이터를 지어내는 대신 문장 전체를 하나의 <ruby> 블록으로
// 묶어 "표기 전체 위에 읽기 전체"를 얹는다 — 정밀한 글자별 후리가나는 아니지만 신규 콘텐츠
// 없이 안전하게 구현 가능한 방식이다.
const KANJI_RE = /[一-龯㐀-䶿]/;

export function Furigana({ kanji, kana, style }: { kanji?: string; kana: string; style?: React.CSSProperties }) {
  if (!kanji || !KANJI_RE.test(kanji) || kanji === kana) {
    return <span lang="ja" style={style}>{kanji ?? kana}</span>;
  }
  // style(폰트 크기·굵기·줄간격 등)은 바깥 span에 걸고, <ruby>는 브라우저 기본 표시 방식을
  // 그대로 둔다 — ruby에 직접 display:block 등을 주면 rb/rt 정렬이 깨지는 걸 확인했다.
  return (
    <span lang="ja" style={style}>
      <ruby style={{ rubyPosition: 'over' }}>
        {kanji}
        <rp>(</rp>
        <rt style={{ fontSize: '0.5em', fontWeight: 700, color: 'var(--ink-soft)', userSelect: 'none' }}>{kana}</rt>
        <rp>)</rp>
      </ruby>
    </span>
  );
}
