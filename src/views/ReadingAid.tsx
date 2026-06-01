// 발음 보조 — 가나 문장을 보여주되, 아직 안 익숙한 글자 위에만 작은 로마자를 띄움.
// 익숙해질수록 보조가 자연히 사라져 "그림 외우기"가 아닌 글자 인식으로 넘어가게.
import { toReadingUnits } from '../learn/kanaReading';

interface Props {
  text: string;                         // 표시할 가나(또는 displayKana)
  isFamiliar: (char: string) => boolean;
  fontSize?: number;
}

export function ReadingAid({ text, isFamiliar, fontSize = 28 }: Props) {
  const units = toReadingUnits(text);
  const rubySize = Math.max(10, Math.round(fontSize * 0.42));
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center', gap: 1 }}>
      {units.map((u, i) => {
        // 보조 표시: 로마자가 있고(=가나), 구성 글자 중 하나라도 아직 안 익숙할 때
        const showAid = u.romaji !== '' && u.romaji !== 'ー' && u.chars.some((c) => !isFamiliar(c));
        return (
          <span key={i} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
            <span style={{ fontSize: rubySize, color: '#c8453a', height: rubySize + 2, fontWeight: 700 }}>
              {showAid ? u.romaji : ' '}
            </span>
            <span style={{ fontSize }}>{u.text}</span>
          </span>
        );
      })}
    </span>
  );
}
