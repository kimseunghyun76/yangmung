// 단어 일러스트 — 어휘 "새 표현" 카드에서 단어를 귀엽게 SVG로 그려 보여준다.
// 이미지로 더 잘 외우도록: 구체 단어는 전용 그림, 색은 색 스와치, 나머지는 그룹 테마 + 가나.
import type { CSSProperties } from 'react';

// 카드 id에서 그룹 추출: vocab:<group>:study:..., basic:study:..., sign:study:...
function groupOf(id: string): string {
  if (id.startsWith('vocab:')) return id.split(':')[1] ?? '';
  if (id.startsWith('basic:')) return 'basic';
  if (id.startsWith('sign:')) return 'sign';
  return '';
}

// 그룹 테마색(폴백 배경).
const GROUP_HUE: Record<string, string> = {
  greetings: '#f0a23a', body: '#e07a8a', sports: '#4f93d8', animals: '#caa14a', plants: '#5db87a',
  colors: '#b06bd8', food: '#e0794a', family: '#e08bb2', weather: '#5bb8e0', adjectives: '#7a8ad8',
  places: '#5d9ec4', transport: '#6e8e9a', feelings: '#e0a23a', basic: '#b9382e', sign: '#8a7ad8',
};

// 색 단어 → 실제 색(스와치로 그림).
const COLOR_HEX: Record<string, string> = {
  '빨간색': '#e0463c', '파란색': '#3a78d8', '파란색 / 초록색': '#2f9e8f', '노란색': '#f0c23a',
  '초록색': '#4faf6a', '흰색': '#f4efe6', '검은색': '#2a2620', '갈색': '#9c6f42', '보라색': '#9a6ad6',
  '주황색': '#e8843a', '분홍색': '#e88bb2', '회색': '#9aa3ad', '금색': '#d9a531', '하늘색': '#7cc4e8',
  '남색': '#34487a', '은색': '#b8c0c8',
};

const Face = ({ cx = 50, cy = 54, scale = 1, dark = false }: { cx?: number; cy?: number; scale?: number; dark?: boolean }) => {
  const c = dark ? '#fff' : '#3a2a1e';
  return (
    <g>
      <circle cx={cx - 9 * scale} cy={cy} r={2.6 * scale} fill={c} />
      <circle cx={cx + 9 * scale} cy={cy} r={2.6 * scale} fill={c} />
      <path d={`M${cx - 5 * scale} ${cy + 6 * scale} Q${cx} ${cy + 10 * scale} ${cx + 5 * scale} ${cy + 6 * scale}`} stroke={c} strokeWidth={1.6 * scale} fill="none" strokeLinecap="round" />
      <circle cx={cx - 15 * scale} cy={cy + 4 * scale} r={2.4 * scale} fill="#f0a0a0" opacity=".6" />
      <circle cx={cx + 15 * scale} cy={cy + 4 * scale} r={2.4 * scale} fill="#f0a0a0" opacity=".6" />
    </g>
  );
};

// 전용 그림 — korean(뜻)으로 매칭.
const SPECIFIC: Record<string, JSX.Element> = {
  '고양이': (<g><ellipse cx="50" cy="58" rx="30" ry="27" fill="#caa14a" /><path d="M26 40 L22 20 L40 34 Z" fill="#caa14a" /><path d="M74 40 L78 20 L60 34 Z" fill="#caa14a" /><path d="M28 38 L26 26 L36 35 Z" fill="#f0c8a0" /><path d="M72 38 L74 26 L64 35 Z" fill="#f0c8a0" /><Face cy={56} /><path d="M40 64 H30 M40 67 H31" stroke="#3a2a1e" strokeWidth="1.2" strokeLinecap="round" /><path d="M60 64 H70 M60 67 H69" stroke="#3a2a1e" strokeWidth="1.2" strokeLinecap="round" /></g>),
  '개': (<g><ellipse cx="50" cy="58" rx="30" ry="27" fill="#d9a35a" /><ellipse cx="26" cy="46" rx="9" ry="15" fill="#a9743b" /><ellipse cx="74" cy="46" rx="9" ry="15" fill="#a9743b" /><ellipse cx="50" cy="70" rx="13" ry="10" fill="#f0dcc0" /><circle cx="50" cy="66" r="4" fill="#3a2a1e" /><circle cx="40" cy="52" r="3" fill="#3a2a1e" /><circle cx="60" cy="52" r="3" fill="#3a2a1e" /></g>),
  '새': (<g><circle cx="50" cy="56" r="26" fill="#5bb8e0" /><circle cx="50" cy="74" r="16" fill="#8fd0ec" /><path d="M70 56 L84 52 L70 62 Z" fill="#f0a23a" /><Face cx={46} cy={52} /><path d="M40 80 L36 90 M52 80 L56 90" stroke="#f0a23a" strokeWidth="2.4" strokeLinecap="round" /></g>),
  '물고기': (<g><ellipse cx="46" cy="56" rx="28" ry="19" fill="#e0794a" /><path d="M74 56 L92 44 L92 68 Z" fill="#e0794a" /><circle cx="36" cy="52" r="3.4" fill="#fff" /><circle cx="35" cy="52" r="1.8" fill="#2a2620" /><path d="M48 50 Q56 56 48 62" stroke="#fff" strokeWidth="1.6" fill="none" opacity=".6" /><path d="M58 50 Q66 56 58 62" stroke="#fff" strokeWidth="1.6" fill="none" opacity=".6" /></g>),
  '토끼': (<g><ellipse cx="50" cy="62" rx="26" ry="24" fill="#f4efe6" /><ellipse cx="40" cy="30" rx="7" ry="20" fill="#f4efe6" /><ellipse cx="60" cy="30" rx="7" ry="20" fill="#f4efe6" /><ellipse cx="40" cy="32" rx="3.4" ry="13" fill="#f0b0b8" /><ellipse cx="60" cy="32" rx="3.4" ry="13" fill="#f0b0b8" /><Face cy={60} /></g>),
  '곰': (<g><circle cx="50" cy="58" r="28" fill="#a9743b" /><circle cx="28" cy="34" r="10" fill="#a9743b" /><circle cx="72" cy="34" r="10" fill="#a9743b" /><circle cx="28" cy="34" r="5" fill="#caa14a" /><circle cx="72" cy="34" r="5" fill="#caa14a" /><ellipse cx="50" cy="66" rx="12" ry="9" fill="#f0dcc0" /><circle cx="50" cy="62" r="3.4" fill="#3a2a1e" /><circle cx="41" cy="52" r="3" fill="#3a2a1e" /><circle cx="59" cy="52" r="3" fill="#3a2a1e" /></g>),
  '주먹밥': (<g><path d="M50 24 L80 78 H20 Z" fill="#f7f3e8" stroke="#e0d8c4" strokeWidth="2" strokeLinejoin="round" /><rect x="34" y="62" width="32" height="18" rx="2" fill="#3a4a3a" /><Face cy={52} /></g>),
  '빵': (<g><path d="M22 56 Q22 32 50 32 Q78 32 78 56 L74 80 H26 Z" fill="#d9a35a" /><path d="M30 56 Q30 42 50 42 Q70 42 70 56" fill="#f0c890" /><Face cy={62} /></g>),
  '달걀': (<g><ellipse cx="50" cy="58" rx="26" ry="32" fill="#f7f3e8" /><ellipse cx="50" cy="62" rx="14" ry="11" fill="#f0c23a" /><Face cy={50} dark /></g>),
  '커피': (<g><path d="M28 40 H68 V64 Q68 80 48 80 Q28 80 28 64 Z" fill="#6b4a30" /><path d="M68 46 H78 Q86 46 86 56 Q86 66 76 66 H68" fill="none" stroke="#6b4a30" strokeWidth="4" /><ellipse cx="48" cy="44" rx="18" ry="5" fill="#3a281c" /><path d="M40 24 Q44 30 40 36 M52 24 Q56 30 52 36" stroke="#caa14a" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".7" /></g>),
  '라멘': (<g><path d="M22 50 H78 L72 78 Q50 86 28 78 Z" fill="#e8e0d0" /><ellipse cx="50" cy="50" rx="28" ry="7" fill="#e0a050" /><path d="M34 46 Q40 36 46 46 M52 46 Q58 36 64 46" stroke="#f7f3e8" strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="40" cy="48" r="4" fill="#f0c23a" /><rect x="58" y="42" width="10" height="8" rx="1.5" fill="#d9a35a" /></g>),
  '사과': (<g><circle cx="50" cy="60" r="26" fill="#e0463c" /><path d="M50 36 Q48 26 56 22" stroke="#7d5631" strokeWidth="3" fill="none" strokeLinecap="round" /><ellipse cx="60" cy="30" rx="7" ry="4" fill="#5db87a" transform="rotate(-20 60 30)" /><Face cy={62} /><ellipse cx="42" cy="50" rx="6" ry="9" fill="#fff" opacity=".25" /></g>),
  '과일': (<g><circle cx="50" cy="60" r="26" fill="#e0463c" /><path d="M50 36 Q48 26 56 22" stroke="#7d5631" strokeWidth="3" fill="none" strokeLinecap="round" /><ellipse cx="60" cy="30" rx="7" ry="4" fill="#5db87a" transform="rotate(-20 60 30)" /><Face cy={62} /></g>),
  '맑음': (<g><circle cx="50" cy="54" r="20" fill="#f0c23a" /><g stroke="#f0c23a" strokeWidth="4" strokeLinecap="round">{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = a * Math.PI / 180; return <line key={a} x1={50 + 26 * Math.cos(r)} y1={54 + 26 * Math.sin(r)} x2={50 + 34 * Math.cos(r)} y2={54 + 34 * Math.sin(r)} />; })}</g><Face cy={54} /></g>),
  '비': (<g><path d="M30 50 Q26 36 42 36 Q46 24 62 30 Q78 30 76 46 Q86 48 82 58 H32 Q24 56 30 50Z" fill="#aab2be" /><g stroke="#5bb8e0" strokeWidth="3.4" strokeLinecap="round"><line x1="38" y1="66" x2="34" y2="80" /><line x1="52" y1="66" x2="48" y2="82" /><line x1="66" y1="66" x2="62" y2="80" /></g></g>),
  '눈': (<g><g stroke="#7cc4e8" strokeWidth="3" strokeLinecap="round">{[0, 60, 120].map((a) => { const r = a * Math.PI / 180; return <line key={a} x1={50 - 26 * Math.cos(r)} y1={54 - 26 * Math.sin(r)} x2={50 + 26 * Math.cos(r)} y2={54 + 26 * Math.sin(r)} />; })}</g><circle cx="50" cy="54" r="6" fill="#aee0f4" /></g>),
  '무지개': (<g fill="none" strokeWidth="6" strokeLinecap="round"><path d="M16 74 A34 34 0 0 1 84 74" stroke="#e0463c" /><path d="M24 74 A26 26 0 0 1 76 74" stroke="#f0c23a" /><path d="M32 74 A18 18 0 0 1 68 74" stroke="#5db87a" /><path d="M40 74 A10 10 0 0 1 60 74" stroke="#3a78d8" /></g>),
};

// 단어 카드(단일 단어 학습)에만 — 예문(:study:ex…)·미션 인트로는 제외.
export function hasWordArt(id: string): boolean {
  if (/:study:ex\d+$/.test(id)) return false;
  return (id.startsWith('vocab:') && id.includes(':study:')) || id.startsWith('basic:study:') || id.startsWith('sign:study:');
}

export function WordArt({ id, korean, kana, size = 96, style }: { id: string; korean: string; kana: string; size?: number; style?: CSSProperties }) {
  const group = groupOf(id);
  const hue = GROUP_HUE[group] ?? '#caa14a';
  let body: JSX.Element;

  const colorHex = COLOR_HEX[korean.trim()];
  const specific = SPECIFIC[korean.trim()];

  if (specific) {
    body = specific;
  } else if (group === 'colors' && colorHex) {
    const dark = ['#2a2620', '#34487a'].includes(colorHex);
    body = (
      <g>
        <rect x="22" y="24" width="56" height="56" rx="16" fill={colorHex} stroke="#3a2a1e" strokeWidth="2" />
        <ellipse cx="36" cy="40" rx="10" ry="7" fill="#fff" opacity=".22" />
        <Face cy={56} dark={dark || colorHex === '#9c6f42'} />
      </g>
    );
  } else {
    // 그룹 테마 폴백 — 둥근 배지 + 가나 + 살짝 얼굴.
    const initial = Array.from(kana)[0] ?? '?';
    body = (
      <g>
        <circle cx="50" cy="50" r="34" fill={hue} opacity=".18" />
        <circle cx="50" cy="50" r="26" fill={hue} />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="26" fontWeight="800" fill="#fff" lang="ja">{initial}</text>
        <circle cx="38" cy="36" r="6" fill="#fff" opacity=".25" />
      </g>
    );
  }

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={korean} style={style}>
      <ellipse cx="50" cy="88" rx="26" ry="5" fill="#000" opacity=".08" />
      {body}
    </svg>
  );
}
