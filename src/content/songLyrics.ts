// 추천 음악 가사 학습 — J-pop·애니 OST "스타일"의 짧은 가사로 단어·표현을 익힌다.
// ⚠️ 실제 곡의 가사가 아니라, 저작권 안전을 위해 직접 쓴 오리지널 샘플입니다.
//    추후 라이선스가 있는 실제 가사로 교체할 수 있게 구조만 동일하게 둡니다.

export type SongMood = 'ballad' | 'upbeat' | 'anime' | 'citypop';

export interface LyricLine {
  ja: string;       // 표기
  kana: string;     // 읽기/TTS (순수 가나)
  korean: string;   // 뜻
}

export interface Song {
  id: string;
  mood: SongMood;
  title: string;     // 곡 제목(오리지널)
  note: string;      // 분위기 한 줄
  lines: LyricLine[];
}

export const SONG_MOODS: { id: SongMood; label: string; icon: string }[] = [
  { id: 'ballad', label: '발라드', icon: '🎹' },
  { id: 'upbeat', label: '신나는 곡', icon: '🎉' },
  { id: 'anime', label: '애니 OST', icon: '📺' },
  { id: 'citypop', label: '시티팝', icon: '🌃' },
];

export const SONGS: Song[] = [
  {
    id: 's_ballad_kawaranai', mood: 'ballad', title: '변하지 않는 것', note: '잔잔한 피아노 발라드',
    lines: [
      { ja: '君がくれた優しさを', kana: 'きみがくれたやさしさを', korean: '네가 준 다정함을' },
      { ja: '今でも覚えている', kana: 'いまでもおぼえている', korean: '지금도 기억하고 있어' },
      { ja: '変わらないものがある', kana: 'かわらないものがある', korean: '변하지 않는 것이 있어' },
      { ja: 'この胸の中に', kana: 'このむねのなかに', korean: '이 가슴 속에' },
    ],
  },
  {
    id: 's_upbeat_hashiru', mood: 'upbeat', title: '달려가자', note: '아침에 듣기 좋은 업템포',
    lines: [
      { ja: '朝の光を浴びて', kana: 'あさのひかりをあびて', korean: '아침 햇살을 받으며' },
      { ja: '走り出すよ', kana: 'はしりだすよ', korean: '달려나가' },
      { ja: '明日はきっと晴れる', kana: 'あしたはきっとはれる', korean: '내일은 분명 맑을 거야' },
    ],
  },
  {
    id: 's_anime_yakusoku', mood: 'anime', title: '약속의 노래', note: '엔딩에 어울리는 애니 OST 풍',
    lines: [
      { ja: 'どんなに離れても', kana: 'どんなにはなれても', korean: '아무리 멀어져도' },
      { ja: '君を忘れない', kana: 'きみをわすれない', korean: '너를 잊지 않아' },
      { ja: '約束したから', kana: 'やくそくしたから', korean: '약속했으니까' },
      { ja: 'また会えるその日まで', kana: 'またあえるそのひまで', korean: '다시 만날 그날까지' },
    ],
  },
  {
    id: 's_citypop_drive', mood: 'citypop', title: '한밤의 드라이브', note: '네온빛 시티팝',
    lines: [
      { ja: 'ネオンが揺れる街を', kana: 'ねおんがゆれるまちを', korean: '네온이 흔들리는 거리를' },
      { ja: '二人で駆け抜けて', kana: 'ふたりでかけぬけて', korean: '둘이서 달려나가' },
      { ja: '夜が明けるまで', kana: 'よるがあけるまで', korean: '밤이 새도록' },
    ],
  },
];
