// 명장면 대화 학습 — 영화·드라마·만화 "스타일"의 짧은 명장면 대화.
// ⚠️ 실제 작품의 대사가 아니라, 저작권 안전을 위해 직접 쓴 오리지널 샘플입니다.
//    추후 라이선스가 있는 실제 대사로 교체할 수 있게 구조만 동일하게 둡니다.

export type DialogueGenre = 'romance' | 'school' | 'action' | 'slice' | 'fantasy';

export interface DialogueLine {
  speaker: string;  // 화자 라벨 (A/B 또는 역할)
  ja: string;       // 표기
  kana: string;     // 읽기/TTS (순수 가나)
  korean: string;   // 뜻
}

export interface DialogueScene {
  id: string;
  genre: DialogueGenre;
  title: string;     // 장면 제목(오리지널)
  setup: string;     // 상황 한 줄
  lines: DialogueLine[];
}

export const DIALOGUE_GENRES: { id: DialogueGenre; label: string; icon: string }[] = [
  { id: 'romance', label: '로맨스', icon: '💗' },
  { id: 'school', label: '학원물', icon: '🏫' },
  { id: 'action', label: '액션', icon: '⚔️' },
  { id: 'slice', label: '일상', icon: '☕' },
  { id: 'fantasy', label: '판타지', icon: '✨' },
];

export const DIALOGUE_SCENES: DialogueScene[] = [
  {
    id: 'd_romance_rain', genre: 'romance', title: '비 오는 날의 고백', setup: '버스 정류장, 우산 하나를 나눠 쓰며',
    lines: [
      { speaker: 'A', ja: 'ずっと、言いたかったことがあるんだ。', kana: 'ずっと、いいたかったことがあるんだ。', korean: '계속 하고 싶었던 말이 있어.' },
      { speaker: 'B', ja: '何？', kana: 'なに？', korean: '뭔데?' },
      { speaker: 'A', ja: '君のことが、好きだ。', kana: 'きみのことが、すきだ。', korean: '너를 좋아해.' },
      { speaker: 'B', ja: '…私も、同じ気持ちだよ。', kana: '…わたしも、おなじきもちだよ。', korean: '…나도, 같은 마음이야.' },
    ],
  },
  {
    id: 'd_school_roof', genre: 'school', title: '옥상의 약속', setup: '대회 전날, 학교 옥상에서 라이벌과',
    lines: [
      { speaker: 'A', ja: '次の試合、絶対に負けない。', kana: 'つぎのしあい、ぜったいにまけない。', korean: '다음 시합, 절대 안 져.' },
      { speaker: 'B', ja: '面白い。受けて立つよ。', kana: 'おもしろい。うけてたつよ。', korean: '재밌네. 받아주지.' },
      { speaker: 'A', ja: '全力で来い。手加減はいらない。', kana: 'ぜんりょくでこい。てかげんはいらない。', korean: '전력으로 와. 봐주기는 필요 없어.' },
    ],
  },
  {
    id: 'd_action_standoff', genre: 'action', title: '마지막 대치', setup: '무너진 다리 위, 마주 선 두 사람',
    lines: [
      { speaker: 'A', ja: 'ここから先は、行かせない。', kana: 'ここからさきは、いかせない。', korean: '여기서부터는 못 보내.' },
      { speaker: 'B', ja: 'どいてくれ。頼む。', kana: 'どいてくれ。たのむ。', korean: '비켜줘. 부탁이야.' },
      { speaker: 'A', ja: '断る。これだけは譲れない。', kana: 'ことわる。これだけはゆずれない。', korean: '거절한다. 이것만은 양보 못 해.' },
    ],
  },
  {
    id: 'd_slice_cafe', genre: 'slice', title: '오랜만의 재회', setup: '오래된 카페, 우연히 마주친 옛 친구',
    lines: [
      { speaker: 'A', ja: '久しぶり。元気だった？', kana: 'ひさしぶり。げんきだった？', korean: '오랜만이야. 잘 지냈어?' },
      { speaker: 'B', ja: 'うん、なんとかね。君は？', kana: 'うん、なんとかね。きみは？', korean: '응, 그럭저럭. 너는?' },
      { speaker: 'A', ja: '相変わらずだよ。座らない？', kana: 'あいかわらずだよ。すわらない？', korean: '여전하지. 안 앉을래?' },
    ],
  },
  {
    id: 'd_fantasy_star', genre: 'fantasy', title: '별빛 아래 작별', setup: '여행의 끝, 별이 쏟아지는 언덕에서',
    lines: [
      { speaker: 'A', ja: 'もう、行かなきゃ。', kana: 'もう、いかなきゃ。', korean: '이제 가야 해.' },
      { speaker: 'B', ja: 'また、会える？', kana: 'また、あえる？', korean: '또 만날 수 있을까?' },
      { speaker: 'A', ja: 'きっと。星が見えたら、思い出して。', kana: 'きっと。ほしがみえたら、おもいだして。', korean: '분명히. 별이 보이면, 떠올려줘.' },
    ],
  },
];
