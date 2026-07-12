import { allUnits, type PracticeLevel } from './curriculum';
import { generatedLessons } from './generatedLessons';

export type LessonCardKind = 'preview' | 'checkpoint' | 'missionDrill' | 'expression' | 'staffLine' | 'dialogue' | 'branch' | 'roleplay' | 'quiz' | 'listen' | 'done';

export interface ExpressionCard {
  kind: 'expression';
  id: string;
  title: string;
  japanese: string;
  reading: string;
  meaning: string;
  note: string;
}

export interface StaffLineCard {
  kind: 'staffLine';
  id: string;
  title: string;
  japanese: string;
  reading: string;
  meaning: string;
  cue: string;
}

export interface QuizOption {
  id: string;
  japanese: string;
  reading: string;
  meaning: string;
}

export interface QuizCard {
  kind: 'quiz';
  id: string;
  title: string;
  prompt: string;
  requiredExpressionIds: string[];
  options: QuizOption[];
  answerId: string;
  explanation: string;
}

export interface ListenCard {
  kind: 'listen';
  id: string;
  title: string;
  prompt: string;
  japanese: string;
  reading: string;
  meaning: string;
  focus: string;
}

export interface DialogueTurn {
  speaker: 'traveler' | 'staff';
  japanese: string;
  reading: string;
  meaning: string;
}

export interface DialogueCard {
  kind: 'dialogue';
  id: string;
  title: string;
  setup: string;
  turns: DialogueTurn[];
}

export interface BranchChoice {
  label: string;
  japanese: string;
  reading: string;
  meaning: string;
  outcome: string;
}

export interface BranchCard {
  kind: 'branch';
  id: string;
  title: string;
  situation: string;
  choices: BranchChoice[];
}

export interface RoleplayCard {
  kind: 'roleplay';
  id: string;
  title: string;
  mission: string;
  checklist: string[];
  starter: string;
}

export interface CheckpointCard {
  kind: 'checkpoint';
  id: string;
  title: string;
  place: string;
  linkedUnitIds: string[];
  goal: string;
  successCriteria: string;
}

export interface MissionDrillLine {
  unitId: string;
  action: string;
  japanese: string;
  reading: string;
  meaning: string;
}

export interface MissionDrillCard {
  kind: 'missionDrill';
  id: string;
  title: string;
  place: string;
  prompt: string;
  lines: MissionDrillLine[];
}

export type LessonCard =
  | {
      kind: 'preview';
      id: string;
      title: string;
      text: string;
      bullets: string[];
      image: string;
    }
  | ExpressionCard
  | StaffLineCard
  | DialogueCard
  | BranchCard
  | RoleplayCard
  | CheckpointCard
  | MissionDrillCard
  | QuizCard
  | ListenCard
  | {
      kind: 'done';
      id: string;
      title: string;
      text: string;
    };

export interface Lesson {
  unitId: string;
  cards: LessonCard[];
}

export const lessons: Record<string, Lesson> = {
  P1: {
    unitId: 'P1',
    cards: [
      {
        kind: 'preview',
        id: 'p1-preview',
        title: '짧은 직원 질문을 먼저 알아듣는 연습',
        text: '여행 회화에서는 내가 말하는 것보다 직원이 빠르게 묻는 말을 알아듣는 것이 더 어렵습니다. P1은 장음, 촉음, 질문 억양을 듣고 반응하는 준비 과정입니다.',
        image: '/scenes/quick-practice/pairs.webp',
        bullets: [
          '문장 끝이 올라가면 질문으로 듣기',
          '장음과 촉음 때문에 의미가 바뀌는 말 구분',
          '모르는 문장이 나와도 핵심 단어만 먼저 잡기',
        ],
      },
      {
        kind: 'staffLine',
        id: 'p1-staff-yoroshii',
        title: '확인 질문의 끝 억양',
        japanese: 'こちらでよろしいですか。',
        reading: 'こちらで よろしいですか。',
        meaning: '이쪽으로 괜찮으세요?',
        cue: '마지막 ですか가 올라가면 확인 질문입니다. 식당, 계산대, 호텔에서 자주 듣습니다.',
      },
      {
        kind: 'staffLine',
        id: 'p1-staff-mochikaeri',
        title: '빠르게 붙어서 들리는 말',
        japanese: 'お持ち帰りですか。',
        reading: 'おもちかえりですか。',
        meaning: '포장이세요?',
        cue: '식당이나 카페에서 매우 빠르게 들릴 수 있습니다. おもちかえり 전체를 하나의 소리 덩어리로 기억합니다.',
      },
      {
        kind: 'staffLine',
        id: 'p1-staff-fukuro',
        title: '핵심 명사만 먼저 잡기',
        japanese: '袋はご利用ですか。',
        reading: 'ふくろは ごりようですか。',
        meaning: '봉투 이용하시겠어요?',
        cue: '문장을 다 못 들어도 袋만 들리면 봉투 질문이라는 것을 추측할 수 있습니다.',
      },
      {
        kind: 'expression',
        id: 'p1-exp-hai-onegai',
        title: '긍정으로 답하기',
        japanese: 'お願いします。',
        reading: 'おねがいします。',
        meaning: '부탁드립니다.',
        note: '포장, 봉투, 선택 확인처럼 직원 질문에 긍정으로 답할 때 가장 넓게 쓰는 반응입니다.',
      },
      {
        kind: 'expression',
        id: 'p1-exp-daijoubu',
        title: '거절로 답하기',
        japanese: '大丈夫です。',
        reading: 'だいじょうぶです。',
        meaning: '괜찮습니다.',
        note: '봉투나 영수증처럼 필요 없는 것을 정중하게 거절할 때 씁니다.',
      },
      {
        kind: 'staffLine',
        id: 'p1-staff-reservation',
        title: '직원이 하는 말',
        japanese: 'ご予約はされていますか。',
        reading: 'ごよやくは されていますか。',
        meaning: '예약하셨나요?',
        cue: '호텔, 식당, 체험 예약에서 자주 듣는 질문입니다. ご予約가 들리면 예약 여부를 묻는 상황입니다.',
      },
      {
        kind: 'dialogue',
        id: 'p1-dialogue-basic',
        title: '직원 질문에 짧게 답하기',
        setup: '직원이 빠르게 묻는 말을 듣고, 여행자는 짧은 반응으로 답합니다.',
        turns: [
          { speaker: 'staff', japanese: 'お持ち帰りですか。', reading: 'おもちかえりですか。', meaning: '포장이세요?' },
          { speaker: 'traveler', japanese: 'お願いします。', reading: 'おねがいします。', meaning: '부탁드립니다.' },
          { speaker: 'staff', japanese: '袋はご利用ですか。', reading: 'ふくろは ごりようですか。', meaning: '봉투 이용하시겠어요?' },
          { speaker: 'traveler', japanese: '大丈夫です。', reading: 'だいじょうぶです。', meaning: '괜찮습니다.' },
        ],
      },
      {
        kind: 'branch',
        id: 'p1-branch',
        title: '직원 질문별 반응',
        situation: '직원이 포장, 봉투, 예약 여부를 묻습니다. 먼저 핵심 단어를 듣고 짧게 답합니다.',
        choices: [
          {
            label: '포장 원함',
            japanese: 'お願いします。',
            reading: 'おねがいします。',
            meaning: '부탁드립니다.',
            outcome: 'お持ち帰り가 들렸고 포장을 원하면 짧게 긍정합니다.',
          },
          {
            label: '봉투 불필요',
            japanese: '大丈夫です。',
            reading: 'だいじょうぶです。',
            meaning: '괜찮습니다.',
            outcome: '袋가 들렸고 필요 없으면 정중하게 거절합니다.',
          },
          {
            label: '예약 있음',
            japanese: 'はい、予約しています。',
            reading: 'はい、よやくしています。',
            meaning: '네, 예약했습니다.',
            outcome: 'ご予約가 들리면 예약 여부를 먼저 답합니다.',
          },
        ],
      },
      {
        kind: 'roleplay',
        id: 'p1-roleplay',
        title: '듣고 반응하기',
        mission: '직원이 묻는다고 생각하고, 필요한지 아닌지 짧게 답해 봅니다.',
        starter: 'お願いします。',
        checklist: ['필요하면 お願いします로 답하기', '필요 없으면 大丈夫です로 답하기', '예약 질문에는 予約しています로 답하기'],
      },
      {
        kind: 'quiz',
        id: 'p1-quiz-1',
        title: '뜻 고르기',
        prompt: '직원이 “お持ち帰りですか。”라고 물었습니다. 어떤 뜻일까요?',
        requiredExpressionIds: ['p1-staff-mochikaeri'],
        answerId: 'takeout',
        options: [
          { id: 'bag', japanese: '袋はご利用ですか。', reading: 'ふくろは ごりようですか。', meaning: '봉투 이용하시겠어요?' },
          { id: 'takeout', japanese: 'お持ち帰りですか。', reading: 'おもちかえりですか。', meaning: '포장이세요?' },
          { id: 'reservation', japanese: 'ご予約はされていますか。', reading: 'ごよやくは されていますか。', meaning: '예약하셨나요?' },
          { id: 'payment', japanese: 'お支払いはどうされますか。', reading: 'おしはらいは どうされますか。', meaning: '결제는 어떻게 하시겠어요?' },
        ],
        explanation: 'お持ち帰り는 포장해서 가져가는 것을 뜻합니다. 퀴즈에서는 정답을 고른 뒤에만 각 선택지의 해석을 보여줍니다.',
      },
      {
        kind: 'listen',
        id: 'p1-listen-1',
        title: '듣기 평가',
        prompt: '아래 문장을 듣는다고 가정하고, 먼저 잡아야 할 핵심 단어를 확인하세요.',
        japanese: 'お支払いはどうされますか。',
        reading: 'おしはらいは どうされますか。',
        meaning: '결제는 어떻게 하시겠어요?',
        focus: 'お支払い가 들리면 결제 방법 질문입니다. 카드, 현금, QR 결제로 이어질 수 있습니다.',
      },
      {
        kind: 'done',
        id: 'p1-done',
        title: 'P1 학습 완료',
        text: '이제 짧은 직원 질문을 질문으로 알아차리고, 핵심 명사를 먼저 잡는 흐름을 시작할 수 있습니다.',
      },
    ],
  },
  P2: {
    unitId: 'P2',
    cards: [
      {
        kind: 'preview',
        id: 'p2-preview',
        title: '여행에서 바로 마주치는 가타카나',
        text: '일본 여행에서는 한자보다 가타카나가 먼저 눈에 들어오는 순간이 많습니다. 역, 호텔, 식당, 쇼핑에서 자주 보는 단어를 소리와 뜻으로 묶어 익힙니다.',
        image: '/scenes/quick-practice/katakana.webp',
        bullets: [
          '한국어식 외래어 발음과 일본어식 발음 차이 확인',
          '간판과 안내판에서 핵심 단어만 빠르게 찾기',
          '직원이 가타카나 단어를 말했을 때 의미 추측',
        ],
      },
      {
        kind: 'expression',
        id: 'p2-exp-ticket',
        title: '교통에서 자주 보는 단어',
        japanese: 'チケット',
        reading: 'チケット',
        meaning: '티켓, 승차권',
        note: '공항, 역, 관광지에서 모두 나옵니다. 한국어 티켓보다 ッ에서 잠깐 멈추는 느낌을 기억합니다.',
      },
      {
        kind: 'expression',
        id: 'p2-exp-counter',
        title: '식당과 좌석에서 듣는 단어',
        japanese: 'カウンター',
        reading: 'カウンター',
        meaning: '카운터석',
        note: '라멘집, 스시집, 카페에서 자주 듣습니다. 자리 종류를 고를 때 쓰입니다.',
      },
      {
        kind: 'expression',
        id: 'p2-exp-receipt',
        title: '쇼핑과 계산에서 보는 단어',
        japanese: 'レシート',
        reading: 'レシート',
        meaning: '영수증',
        note: '계산대에서 レシート가 들리면 영수증이 필요한지 묻는 상황일 수 있습니다.',
      },
      {
        kind: 'staffLine',
        id: 'p2-staff-card',
        title: '직원이 하는 말',
        japanese: 'カードでよろしいですか。',
        reading: 'カードで よろしいですか。',
        meaning: '카드로 괜찮으세요?',
        cue: 'カード는 결제 수단 질문에서 자주 나옵니다. 뒤의 で는 수단을 나타냅니다.',
      },
      {
        kind: 'quiz',
        id: 'p2-quiz-1',
        title: '가타카나 뜻 고르기',
        prompt: '식당에서 “カウンター”라고 안내했습니다. 어떤 뜻일까요?',
        requiredExpressionIds: ['p2-exp-counter'],
        answerId: 'counter',
        options: [
          { id: 'ticket', japanese: 'チケット', reading: 'チケット', meaning: '티켓, 승차권' },
          { id: 'counter', japanese: 'カウンター', reading: 'カウンター', meaning: '카운터석' },
          { id: 'receipt', japanese: 'レシート', reading: 'レシート', meaning: '영수증' },
          { id: 'hotel', japanese: 'ホテル', reading: 'ホテル', meaning: '호텔' },
        ],
        explanation: 'カウンター는 카운터석입니다. 라멘집이나 스시집에서 테이블석과 구분해서 안내받을 수 있습니다.',
      },
      {
        kind: 'listen',
        id: 'p2-listen-1',
        title: '듣기 평가',
        prompt: '가타카나는 문장 속에서 빠르게 지나갑니다. 핵심 단어가 들리면 먼저 상황을 잡습니다.',
        japanese: 'レシートはご利用ですか。',
        reading: 'レシートは ごりようですか。',
        meaning: '영수증 이용하시겠어요?',
        focus: 'レシート가 들리면 계산이 끝난 뒤의 영수증 질문입니다.',
      },
      {
        kind: 'done',
        id: 'p2-done',
        title: 'P2 학습 완료',
        text: '이제 역, 식당, 쇼핑에서 자주 보이는 가타카나 단어를 소리와 뜻으로 연결할 수 있습니다.',
      },
    ],
  },
  S1: {
    unitId: 'S1',
    cards: [
      {
        kind: 'preview',
        id: 's1-preview',
        title: '직원에게 먼저 말 걸기',
        text: '실전 첫 단원은 가게, 역, 호텔에서 직원에게 대화를 시작하는 장면입니다. 긴 문장보다 짧고 정중한 첫마디가 중요합니다.',
        image: '/scenes/quick-practice/greetings.webp',
        bullets: [
          '대화를 시작할 때는 すみません으로 부르기',
          '원하는 행동을 짧게 붙이기',
          '직원의 확인 질문에 はい / いいえ로 먼저 반응하기',
        ],
      },
      {
        kind: 'expression',
        id: 's1-exp-sumimasen',
        title: '대화 시작',
        japanese: 'すみません。',
        reading: 'すみません。',
        meaning: '실례합니다. / 저기요.',
        note: '직원을 부르거나 길을 물을 때 가장 먼저 쓰는 표현입니다. 사과뿐 아니라 대화 시작에도 씁니다.',
      },
      {
        kind: 'expression',
        id: 's1-exp-onegaishimasu',
        title: '요청 마무리',
        japanese: 'お願いします。',
        reading: 'おねがいします。',
        meaning: '부탁드립니다.',
        note: '이것을 주세요, 이쪽으로 해주세요 같은 요청 뒤에 붙이면 자연스럽습니다.',
      },
      {
        kind: 'expression',
        id: 's1-exp-kore',
        title: '눈앞의 것을 가리키기',
        japanese: 'これをお願いします。',
        reading: 'これを おねがいします。',
        meaning: '이걸로 부탁드립니다.',
        note: '메뉴판, 티켓, 상품을 손가락으로 가리키며 말할 수 있는 기본 실전 문장입니다.',
      },
      {
        kind: 'staffLine',
        id: 's1-staff-confirm',
        title: '직원이 하는 말',
        japanese: 'こちらでよろしいですか。',
        reading: 'こちらで よろしいですか。',
        meaning: '이쪽으로 괜찮으세요?',
        cue: '직원이 선택을 다시 확인할 때 자주 쓰는 말입니다. こちら가 들리면 선택한 방향이나 물건을 확인하는 상황입니다.',
      },
      {
        kind: 'quiz',
        id: 's1-quiz-1',
        title: '첫마디 고르기',
        prompt: '직원에게 말을 걸고 싶습니다. 가장 자연스러운 첫마디는 무엇일까요?',
        requiredExpressionIds: ['s1-exp-sumimasen'],
        answerId: 'sumimasen',
        options: [
          { id: 'sumimasen', japanese: 'すみません。', reading: 'すみません。', meaning: '실례합니다. / 저기요.' },
          { id: 'kore', japanese: 'これをお願いします。', reading: 'これを おねがいします。', meaning: '이걸로 부탁드립니다.' },
          { id: 'reservation', japanese: '予約しています。', reading: 'よやくしています。', meaning: '예약했습니다.' },
          { id: 'thanks', japanese: 'ありがとうございます。', reading: 'ありがとうございます。', meaning: '감사합니다.' },
        ],
        explanation: '직원을 부르거나 말을 시작할 때는 すみません。이 가장 넓게 쓰입니다. 그 다음에 원하는 행동을 붙이면 됩니다.',
      },
      {
        kind: 'listen',
        id: 's1-listen-1',
        title: '듣기 평가',
        prompt: '직원이 선택을 확인할 때 어떤 단어를 먼저 잡아야 하는지 확인합니다.',
        japanese: 'こちらでよろしいですか。',
        reading: 'こちらで よろしいですか。',
        meaning: '이쪽으로 괜찮으세요?',
        focus: 'こちら가 들리면 직원이 방금 선택한 물건, 자리, 방향을 확인하는 상황입니다.',
      },
      {
        kind: 'done',
        id: 's1-done',
        title: 'S1 학습 완료',
        text: '이제 직원에게 먼저 말을 걸고, 선택 확인 질문에 반응하는 실전 첫 단계를 시작할 수 있습니다.',
      },
    ],
  },
  P3: {
    unitId: 'P3',
    cards: [
      {
        kind: 'preview',
        id: 'p3-preview',
        title: '단어를 여행 문장으로 바꾸기',
        text: '단어만 알아서는 실제 상황에서 반응하기 어렵습니다. P3은 목적지, 원하는 것, 가능한 일을 짧은 문장으로 조립하는 과정입니다.',
        image: '/scenes/quick-practice/compose.webp',
        bullets: ['AはBです로 설명하기', 'Aをお願いします로 요청하기', 'Aできますか로 가능한지 묻기'],
      },
      {
        kind: 'expression',
        id: 'p3-exp-wa-desu',
        title: '주제 설명',
        japanese: '予約は三時です。',
        reading: 'よやくは さんじです。',
        meaning: '예약은 3시입니다.',
        note: 'は는 지금 말하려는 주제를 세웁니다. 예약, 목적지, 시간처럼 확인해야 하는 말을 앞에 둡니다.',
      },
      {
        kind: 'expression',
        id: 'p3-exp-wo-onegai',
        title: '원하는 것 요청',
        japanese: 'これをお願いします。',
        reading: 'これを おねがいします。',
        meaning: '이걸로 부탁드립니다.',
        note: 'を는 행동의 대상을 표시합니다. 메뉴, 티켓, 상품을 가리키며 바로 쓸 수 있습니다.',
      },
      {
        kind: 'expression',
        id: 'p3-exp-dekimasu',
        title: '가능 여부 묻기',
        japanese: 'カードで払えますか。',
        reading: 'カードで はらえますか。',
        meaning: '카드로 결제할 수 있나요?',
        note: 'できますか / 払えますか는 가능한지 묻는 핵심 형태입니다.',
      },
      {
        kind: 'staffLine',
        id: 'p3-staff-confirm',
        title: '직원이 하는 말',
        japanese: '現金のみです。',
        reading: 'げんきんのみです。',
        meaning: '현금만 가능합니다.',
        cue: 'のみ는 “~만”이라는 뜻입니다. 결제, 입장, 이용 조건에서 자주 듣습니다.',
      },
      {
        kind: 'quiz',
        id: 'p3-quiz-1',
        title: '문장 기능 고르기',
        prompt: '“カードで払えますか。”는 어떤 기능의 문장일까요?',
        requiredExpressionIds: ['p3-exp-dekimasu'],
        answerId: 'possible',
        options: [
          { id: 'topic', japanese: '予約は三時です。', reading: 'よやくは さんじです。', meaning: '예약은 3시입니다.' },
          { id: 'request', japanese: 'これをお願いします。', reading: 'これを おねがいします。', meaning: '이걸로 부탁드립니다.' },
          { id: 'possible', japanese: 'カードで払えますか。', reading: 'カードで はらえますか。', meaning: '카드로 결제할 수 있나요?' },
          { id: 'location', japanese: 'トイレはどこですか。', reading: 'トイレは どこですか。', meaning: '화장실은 어디인가요?' },
        ],
        explanation: '払えますか는 결제가 가능한지 묻는 말입니다. で는 결제 수단을 나타냅니다.',
      },
      {
        kind: 'listen',
        id: 'p3-listen-1',
        title: '듣기 평가',
        prompt: '직원이 조건을 말할 때 제한 표현을 먼저 잡습니다.',
        japanese: '現金のみです。',
        reading: 'げんきんのみです。',
        meaning: '현금만 가능합니다.',
        focus: 'のみ가 들리면 선택지가 제한된 상황입니다.',
      },
      {
        kind: 'done',
        id: 'p3-done',
        title: 'P3 학습 완료',
        text: '이제 단어를 주제 설명, 요청, 가능 여부 질문으로 바꿀 수 있습니다.',
      },
    ],
  },
  P4: {
    unitId: 'P4',
    cards: [
      {
        kind: 'preview',
        id: 'p4-preview',
        title: '직접 질문을 시작하기',
        text: '여행에서는 직원이 먼저 물어보지 않는 상황도 많습니다. P4는 어디, 얼마, 언제, 어느 쪽처럼 먼저 묻는 표현을 익힙니다.',
        image: '/scenes/quick-practice/greetings.webp',
        bullets: ['どこ로 위치 묻기', 'いくら로 금액 묻기', 'どちら로 방향과 선택 묻기'],
      },
      {
        kind: 'expression',
        id: 'p4-exp-doko',
        title: '위치 묻기',
        japanese: 'トイレはどこですか。',
        reading: 'トイレは どこですか。',
        meaning: '화장실은 어디인가요?',
        note: '장소 이름만 바꾸면 역, 호텔, 식당에서 바로 쓸 수 있습니다.',
      },
      {
        kind: 'expression',
        id: 'p4-exp-ikura',
        title: '금액 묻기',
        japanese: 'いくらですか。',
        reading: 'いくらですか。',
        meaning: '얼마인가요?',
        note: '가격표가 없거나 추가 요금이 궁금할 때 쓰는 가장 짧은 질문입니다.',
      },
      {
        kind: 'expression',
        id: 'p4-exp-dochira',
        title: '방향 묻기',
        japanese: '駅はどちらですか。',
        reading: 'えきは どちらですか。',
        meaning: '역은 어느 쪽인가요?',
        note: 'どちら는 어느 쪽이라는 뜻입니다. 방향 안내에서 자주 쓰입니다.',
      },
      {
        kind: 'staffLine',
        id: 'p4-staff-counter',
        title: '직원이 하는 말',
        japanese: 'どちらになさいますか。',
        reading: 'どちらに なさいますか。',
        meaning: '어느 쪽으로 하시겠어요?',
        cue: '선택지를 놓고 묻는 정중한 질문입니다. 좌석, 결제, 옵션에서 자주 나옵니다.',
      },
      {
        kind: 'quiz',
        id: 'p4-quiz-1',
        title: '질문 고르기',
        prompt: '역 위치를 묻고 싶습니다. 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['p4-exp-dochira'],
        answerId: 'station',
        options: [
          { id: 'price', japanese: 'いくらですか。', reading: 'いくらですか。', meaning: '얼마인가요?' },
          { id: 'station', japanese: '駅はどちらですか。', reading: 'えきは どちらですか。', meaning: '역은 어느 쪽인가요?' },
          { id: 'bag', japanese: '袋はご利用ですか。', reading: 'ふくろは ごりようですか。', meaning: '봉투 이용하시겠어요?' },
          { id: 'cash', japanese: '現金のみです。', reading: 'げんきんのみです。', meaning: '현금만 가능합니다.' },
        ],
        explanation: '駅はどちらですか는 방향을 묻는 문장입니다. どこ보다 조금 더 방향 안내에 가깝습니다.',
      },
      {
        kind: 'listen',
        id: 'p4-listen-1',
        title: '듣기 평가',
        prompt: '선택 질문에서 どちら를 먼저 잡습니다.',
        japanese: 'どちらになさいますか。',
        reading: 'どちらに なさいますか。',
        meaning: '어느 쪽으로 하시겠어요?',
        focus: 'どちら가 들리면 선택지를 고르라는 질문입니다.',
      },
      {
        kind: 'done',
        id: 'p4-done',
        title: 'P4 학습 완료',
        text: '이제 위치, 금액, 방향, 선택을 직접 질문할 수 있습니다.',
      },
    ],
  },
  P5: {
    unitId: 'P5',
    cards: [
      {
        kind: 'preview',
        id: 'p5-preview',
        title: '눈앞의 것과 방향을 정확히 가리키기',
        text: '말이 길어지면 오히려 어려워집니다. P5는 이것, 여기, 저쪽, 오른쪽처럼 손짓과 함께 쓰는 표현을 익힙니다.',
        image: '/scenes/quick-practice/signs.webp',
        bullets: ['これ / それ / あれ 구분', 'ここ / そこ / あそこ 구분', '右 / 左 / まっすぐ 듣기'],
      },
      {
        kind: 'expression',
        id: 'p5-exp-kore',
        title: '눈앞의 이것',
        japanese: 'これは何ですか。',
        reading: 'これは なんですか。',
        meaning: '이것은 무엇인가요?',
        note: '상품, 메뉴, 표지판을 가리키며 물을 때 씁니다.',
      },
      {
        kind: 'expression',
        id: 'p5-exp-koko',
        title: '현재 위치',
        japanese: 'ここで待てばいいですか。',
        reading: 'ここで まてばいいですか。',
        meaning: '여기서 기다리면 되나요?',
        note: '줄, 대기 장소, 승강장에서 확인할 때 유용합니다.',
      },
      {
        kind: 'expression',
        id: 'p5-exp-migi',
        title: '방향 재확인',
        japanese: '右に曲がればいいですか。',
        reading: 'みぎに まがればいいですか。',
        meaning: '오른쪽으로 돌면 되나요?',
        note: '안내를 들은 뒤 내가 가야 할 방향을 재확인할 때 씁니다.',
      },
      {
        kind: 'staffLine',
        id: 'p5-staff-massugu',
        title: '직원이 하는 말',
        japanese: 'まっすぐ行って、左です。',
        reading: 'まっすぐ いって、ひだりです。',
        meaning: '쭉 가서 왼쪽입니다.',
        cue: 'まっすぐ가 들리면 직진, 左가 들리면 왼쪽입니다.',
      },
      {
        kind: 'quiz',
        id: 'p5-quiz-1',
        title: '위치 확인 고르기',
        prompt: '여기서 기다리면 되는지 확인하고 싶습니다. 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['p5-exp-koko'],
        answerId: 'wait',
        options: [
          { id: 'what', japanese: 'これは何ですか。', reading: 'これは なんですか。', meaning: '이것은 무엇인가요?' },
          { id: 'wait', japanese: 'ここで待てばいいですか。', reading: 'ここで まてばいいですか。', meaning: '여기서 기다리면 되나요?' },
          { id: 'right', japanese: '右に曲がればいいですか。', reading: 'みぎに まがればいいですか。', meaning: '오른쪽으로 돌면 되나요?' },
          { id: 'price', japanese: 'いくらですか。', reading: 'いくらですか。', meaning: '얼마인가요?' },
        ],
        explanation: 'ここで待てばいいですか는 현재 위치에서 기다리면 되는지 재확인하는 문장입니다.',
      },
      {
        kind: 'listen',
        id: 'p5-listen-1',
        title: '듣기 평가',
        prompt: '길 안내는 모든 단어를 듣기보다 방향 단어를 먼저 잡습니다.',
        japanese: 'まっすぐ行って、左です。',
        reading: 'まっすぐ いって、ひだりです。',
        meaning: '쭉 가서 왼쪽입니다.',
        focus: 'まっすぐ와 左만 잡아도 이동 방향을 이해할 수 있습니다.',
      },
      {
        kind: 'done',
        id: 'p5-done',
        title: 'P5 학습 완료',
        text: '이제 눈앞의 사물과 현재 위치, 방향 안내를 짧게 확인할 수 있습니다.',
      },
    ],
  },
  P6: {
    unitId: 'P6',
    cards: [
      {
        kind: 'preview',
        id: 'p6-preview',
        title: '시간, 수량, 금액에 바로 반응하기',
        text: '여행 중 숫자는 결제, 예약, 인원, 시간에서 계속 나옵니다. P6은 숫자를 문장 안에서 듣고 확인하는 과정입니다.',
        image: '/scenes/quick-practice/basics.webp',
        bullets: ['몇 시인지 확인', '몇 명인지 말하기', '금액과 추가 요금 듣기'],
      },
      {
        kind: 'expression',
        id: 'p6-exp-time',
        title: '시간 확인',
        japanese: '何時ですか。',
        reading: 'なんじですか。',
        meaning: '몇 시인가요?',
        note: '영업시간, 출발시간, 예약시간을 확인할 때 씁니다.',
      },
      {
        kind: 'expression',
        id: 'p6-exp-people',
        title: '인원 말하기',
        japanese: '二人です。',
        reading: 'ふたりです。',
        meaning: '두 명입니다.',
        note: '식당 입장, 호텔, 티켓 구매에서 가장 자주 쓰는 인원 표현입니다.',
      },
      {
        kind: 'expression',
        id: 'p6-exp-money',
        title: '금액 확인',
        japanese: '追加料金はかかりますか。',
        reading: 'ついかりょうきんは かかりますか。',
        meaning: '추가 요금이 드나요?',
        note: '수하물, 호텔, 예약 변경, 좌석 변경에서 매우 중요합니다.',
      },
      {
        kind: 'staffLine',
        id: 'p6-staff-total',
        title: '직원이 하는 말',
        japanese: '合計で三千円です。',
        reading: 'ごうけいで さんぜんえんです。',
        meaning: '합계 3,000엔입니다.',
        cue: '合計와 円이 들리면 총액 안내입니다.',
      },
      {
        kind: 'quiz',
        id: 'p6-quiz-1',
        title: '추가 요금 질문',
        prompt: '추가 요금이 있는지 묻고 싶습니다. 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['p6-exp-money'],
        answerId: 'extra',
        options: [
          { id: 'time', japanese: '何時ですか。', reading: 'なんじですか。', meaning: '몇 시인가요?' },
          { id: 'people', japanese: '二人です。', reading: 'ふたりです。', meaning: '두 명입니다.' },
          { id: 'extra', japanese: '追加料金はかかりますか。', reading: 'ついかりょうきんは かかりますか。', meaning: '추가 요금이 드나요?' },
          { id: 'total', japanese: '合計で三千円です。', reading: 'ごうけいで さんぜんえんです。', meaning: '합계 3,000엔입니다.' },
        ],
        explanation: '追加料金은 추가 요금입니다. かかりますか는 비용이 드는지 묻는 형태입니다.',
      },
      {
        kind: 'listen',
        id: 'p6-listen-1',
        title: '듣기 평가',
        prompt: '금액 안내에서는 合計와 円을 먼저 잡습니다.',
        japanese: '合計で三千円です。',
        reading: 'ごうけいで さんぜんえんです。',
        meaning: '합계 3,000엔입니다.',
        focus: '合計가 들리면 전체 금액, 円이 들리면 지불 금액입니다.',
      },
      {
        kind: 'done',
        id: 'p6-done',
        title: 'P6 학습 완료',
        text: '이제 시간, 인원, 금액, 추가 요금 질문에 반응할 준비가 되었습니다.',
      },
    ],
  },
  S2: {
    unitId: 'S2',
    cards: [
      {
        kind: 'preview',
        id: 's2-preview',
        title: '알아듣지 못했을 때 대화 복구',
        text: '실제 여행에서 한 번에 다 알아듣는 것은 어렵습니다. S2는 못 들었을 때 다시 듣고, 천천히 말해달라고 요청하는 실전 단원입니다.',
        image: '/scenes/quick-practice/retry-same.webp',
        bullets: ['다시 말해달라고 요청', '천천히 말해달라고 요청', '화면이나 손짓으로 확인 요청'],
      },
      {
        kind: 'expression',
        id: 's2-exp-mouichido',
        title: '다시 듣기',
        japanese: 'もう一度お願いします。',
        reading: 'もういちど おねがいします。',
        meaning: '다시 한 번 부탁드립니다.',
        note: '어떤 상황에서도 쓸 수 있는 가장 안전한 복구 표현입니다.',
      },
      {
        kind: 'expression',
        id: 's2-exp-yukkuri',
        title: '천천히 요청',
        japanese: 'ゆっくりお願いします。',
        reading: 'ゆっくり おねがいします。',
        meaning: '천천히 부탁드립니다.',
        note: '상대가 너무 빨리 말할 때 씁니다.',
      },
      {
        kind: 'expression',
        id: 's2-exp-misete',
        title: '보여달라고 요청',
        japanese: '画面を見せてください。',
        reading: 'がめんを みせてください。',
        meaning: '화면을 보여 주세요.',
        note: '듣기만으로 어렵다면 화면, 메뉴, 영수증처럼 확인할 대상을 짚어서 보여달라고 요청합니다.',
      },
      {
        kind: 'staffLine',
        id: 's2-staff-ok',
        title: '직원이 하는 말',
        japanese: 'はい、少々お待ちください。',
        reading: 'はい、しょうしょう おまちください。',
        meaning: '네, 잠시 기다려 주세요.',
        cue: '少々お待ちください는 잠시 기다리라는 매우 흔한 안내입니다.',
      },
      {
        kind: 'quiz',
        id: 's2-quiz-1',
        title: '복구 표현 고르기',
        prompt: '상대가 너무 빨리 말했습니다. 어떤 표현이 가장 알맞을까요?',
        requiredExpressionIds: ['s2-exp-yukkuri'],
        answerId: 'slow',
        options: [
          { id: 'again', japanese: 'もう一度お願いします。', reading: 'もういちど おねがいします。', meaning: '다시 한 번 부탁드립니다.' },
          { id: 'slow', japanese: 'ゆっくりお願いします。', reading: 'ゆっくり おねがいします。', meaning: '천천히 부탁드립니다.' },
          { id: 'show', japanese: '画面を見せてください。', reading: 'がめんを みせてください。', meaning: '화면을 보여 주세요.' },
          { id: 'wait', japanese: '少々お待ちください。', reading: 'しょうしょう おまちください。', meaning: '잠시 기다려 주세요.' },
        ],
        explanation: 'ゆっくりお願いします는 속도를 늦춰달라는 요청입니다. 못 알아들었을 때 대화를 멈추지 않는 핵심 표현입니다.',
      },
      {
        kind: 'listen',
        id: 's2-listen-1',
        title: '듣기 평가',
        prompt: '직원의 대기 안내를 알아듣습니다.',
        japanese: '少々お待ちください。',
        reading: 'しょうしょう おまちください。',
        meaning: '잠시 기다려 주세요.',
        focus: '少々와 お待ちください가 들리면 기다리라는 안내입니다.',
      },
      {
        kind: 'done',
        id: 's2-done',
        title: 'S2 학습 완료',
        text: '이제 못 알아들었을 때 다시 듣기, 천천히 요청, 보여달라고 요청하는 복구 흐름을 사용할 수 있습니다.',
      },
    ],
  },
  S3: {
    unitId: 'S3',
    cards: [
      {
        kind: 'preview',
        id: 's3-preview',
        title: '위치와 길 묻기',
        text: '길을 잃었을 때는 긴 문장보다 목적지와 방향 단어가 중요합니다. S3는 역, 화장실, 출구 같은 위치를 묻고 안내를 듣는 단원입니다.',
        image: '/scenes/quick-practice/signs.webp',
        bullets: ['목적지 + はどこですか', '방향 안내에서 右 / 左 / まっすぐ 듣기', '이 길이 맞는지 재확인'],
      },
      {
        kind: 'expression',
        id: 's3-exp-exit',
        title: '출구 묻기',
        japanese: '出口はどこですか。',
        reading: 'でぐちは どこですか。',
        meaning: '출구는 어디인가요?',
        note: '역, 백화점, 관광지에서 가장 자주 쓰는 위치 질문입니다.',
      },
      {
        kind: 'expression',
        id: 's3-exp-station',
        title: '역 방향 묻기',
        japanese: '駅はどちらですか。',
        reading: 'えきは どちらですか。',
        meaning: '역은 어느 쪽인가요?',
        note: 'どちら는 방향을 묻는 표현입니다.',
      },
      {
        kind: 'expression',
        id: 's3-exp-atteimasu',
        title: '맞는지 재확인',
        japanese: 'この道で合っていますか。',
        reading: 'このみちで あっていますか。',
        meaning: '이 길이 맞나요?',
        note: '지도 앱을 보면서 현지인에게 확인할 때 유용합니다.',
      },
      {
        kind: 'staffLine',
        id: 's3-staff-left',
        title: '직원이 하는 말',
        japanese: 'この先を左です。',
        reading: 'このさきを ひだりです。',
        meaning: '이 앞에서 왼쪽입니다.',
        cue: 'この先은 이 앞, 左는 왼쪽입니다. 안내 문장에서 방향 단어를 먼저 잡습니다.',
      },
      {
        kind: 'quiz',
        id: 's3-quiz-1',
        title: '길 재확인 표현',
        prompt: '이 길이 맞는지 확인하고 싶습니다. 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['s3-exp-atteimasu'],
        answerId: 'rightway',
        options: [
          { id: 'exit', japanese: '出口はどこですか。', reading: 'でぐちは どこですか。', meaning: '출구는 어디인가요?' },
          { id: 'station', japanese: '駅はどちらですか。', reading: 'えきは どちらですか。', meaning: '역은 어느 쪽인가요?' },
          { id: 'rightway', japanese: 'この道で合っていますか。', reading: 'このみちで あっていますか。', meaning: '이 길이 맞나요?' },
          { id: 'left', japanese: 'この先を左です。', reading: 'このさきを ひだりです。', meaning: '이 앞에서 왼쪽입니다.' },
        ],
        explanation: 'この道で合っていますか는 지금 가는 길이 맞는지 재확인하는 표현입니다.',
      },
      {
        kind: 'listen',
        id: 's3-listen-1',
        title: '듣기 평가',
        prompt: '길 안내에서 위치와 방향 단어를 먼저 확인합니다.',
        japanese: 'この先を左です。',
        reading: 'このさきを ひだりです。',
        meaning: '이 앞에서 왼쪽입니다.',
        focus: 'この先과 左가 들리면 “앞으로 가서 왼쪽”이라는 이동 흐름입니다.',
      },
      {
        kind: 'done',
        id: 's3-done',
        title: 'S3 학습 완료',
        text: '이제 목적지 위치를 묻고, 방향 안내를 듣고, 현재 길이 맞는지 확인할 수 있습니다.',
      },
    ],
  },
  P7: {
    unitId: 'P7',
    cards: [
      {
        kind: 'preview',
        id: 'p7-preview',
        title: '요청하고 허락 구하기',
        text: '여행에서는 물건을 달라고 하거나, 사진 촬영·짐 보관·자리 이용이 가능한지 물어야 합니다. P7은 정중하게 요청하고 가능 여부를 확인하는 과정입니다.',
        image: '/scenes/quick-practice/vocab.webp',
        bullets: ['물건 요청하기', '행동 가능 여부 묻기', '허락을 구하고 답변 듣기'],
      },
      {
        kind: 'expression',
        id: 'p7-exp-kudasai',
        title: '물건 요청',
        japanese: '水をください。',
        reading: 'みずを ください。',
        meaning: '물을 주세요.',
        note: 'ください는 물건을 요청할 때 가장 기본이 되는 표현입니다.',
      },
      {
        kind: 'expression',
        id: 'p7-exp-azukeru',
        title: '서비스 가능 여부',
        japanese: '荷物を預けられますか。',
        reading: 'にもつを あずけられますか。',
        meaning: '짐을 맡길 수 있나요?',
        note: '호텔, 역, 코인로커, 관광지에서 자주 쓰는 요청입니다.',
      },
      {
        kind: 'expression',
        id: 'p7-exp-photo',
        title: '허락 구하기',
        japanese: '写真を撮ってもいいですか。',
        reading: 'しゃしんを とってもいいですか。',
        meaning: '사진을 찍어도 되나요?',
        note: '촬영 가능 여부는 일본 관광지와 매장에서 꼭 확인해야 하는 표현입니다.',
      },
      {
        kind: 'staffLine',
        id: 'p7-staff-dekimasu',
        title: '직원이 하는 말',
        japanese: 'こちらでお預かりできます。',
        reading: 'こちらで おあずかりできます。',
        meaning: '이쪽에서 맡아드릴 수 있습니다.',
        cue: 'できます가 들리면 가능하다는 안내입니다.',
      },
      {
        kind: 'quiz',
        id: 'p7-quiz-1',
        title: '허락 표현 고르기',
        prompt: '사진을 찍어도 되는지 묻고 싶습니다. 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['p7-exp-photo'],
        answerId: 'photo',
        options: [
          { id: 'water', japanese: '水をください。', reading: 'みずを ください。', meaning: '물을 주세요.' },
          { id: 'bag', japanese: '荷物を預けられますか。', reading: 'にもつを あずけられますか。', meaning: '짐을 맡길 수 있나요?' },
          { id: 'photo', japanese: '写真を撮ってもいいですか。', reading: 'しゃしんを とってもいいですか。', meaning: '사진을 찍어도 되나요?' },
          { id: 'wait', japanese: '少々お待ちください。', reading: 'しょうしょう おまちください。', meaning: '잠시 기다려 주세요.' },
        ],
        explanation: 'てもいいですか는 허락을 구하는 형태입니다. 사진, 좌석, 이용 가능 여부에서 자주 씁니다.',
      },
      {
        kind: 'listen',
        id: 'p7-listen-1',
        title: '듣기 평가',
        prompt: '가능 안내에서는 できます를 먼저 잡습니다.',
        japanese: 'こちらでお預かりできます。',
        reading: 'こちらで おあずかりできます。',
        meaning: '이쪽에서 맡아드릴 수 있습니다.',
        focus: 'お預かり는 맡아드림, できます는 가능하다는 뜻입니다.',
      },
      {
        kind: 'done',
        id: 'p7-done',
        title: 'P7 학습 완료',
        text: '이제 물건 요청, 서비스 가능 여부, 촬영 허락을 정중하게 말할 수 있습니다.',
      },
    ],
  },
  P8: {
    unitId: 'P8',
    cards: [
      {
        kind: 'preview',
        id: 'p8-preview',
        title: '선택지 중 원하는 것 고르기',
        text: '식당, 좌석, 색상, 결제 방식처럼 여행 중에는 계속 선택해야 합니다. P8은 여러 선택지 중 원하는 것을 말하는 과정입니다.',
        image: '/scenes/quick-practice/vocab-food.webp',
        bullets: ['이쪽/저쪽 고르기', 'A보다 B 선호하기', '자리와 음식 옵션 선택하기'],
      },
      {
        kind: 'expression',
        id: 'p8-exp-kochira',
        title: '이쪽 선택',
        japanese: 'こちらでお願いします。',
        reading: 'こちらで おねがいします。',
        meaning: '이쪽으로 부탁드립니다.',
        note: '두 선택지 중 눈앞의 것을 고를 때 쓰기 좋습니다.',
      },
      {
        kind: 'expression',
        id: 'p8-exp-window',
        title: '자리 선택',
        japanese: '窓側の席をお願いします。',
        reading: 'まどがわの せきを おねがいします。',
        meaning: '창가 자리로 부탁드립니다.',
        note: '항공기, 카페, 식당에서 자리 요청으로 확장할 수 있습니다.',
      },
      {
        kind: 'expression',
        id: 'p8-exp-less-spicy',
        title: '취향 선택',
        japanese: '辛くないものがいいです。',
        reading: 'からくないものが いいです。',
        meaning: '맵지 않은 것이 좋습니다.',
        note: '음식 취향과 제한을 말할 때 유용합니다.',
      },
      {
        kind: 'staffLine',
        id: 'p8-staff-seat',
        title: '직원이 하는 말',
        japanese: 'テーブル席とカウンター席、どちらになさいますか。',
        reading: 'テーブルせきと カウンターせき、どちらに なさいますか。',
        meaning: '테이블석과 카운터석, 어느 쪽으로 하시겠어요?',
        cue: 'どちら가 들리면 선택 질문입니다.',
      },
      {
        kind: 'quiz',
        id: 'p8-quiz-1',
        title: '자리 선택 표현',
        prompt: '창가 자리로 부탁하고 싶습니다. 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['p8-exp-window'],
        answerId: 'window',
        options: [
          { id: 'this', japanese: 'こちらでお願いします。', reading: 'こちらで おねがいします。', meaning: '이쪽으로 부탁드립니다.' },
          { id: 'window', japanese: '窓側の席をお願いします。', reading: 'まどがわの せきを おねがいします。', meaning: '창가 자리로 부탁드립니다.' },
          { id: 'spicy', japanese: '辛くないものがいいです。', reading: 'からくないものが いいです。', meaning: '맵지 않은 것이 좋습니다.' },
          { id: 'counter', japanese: 'カウンター席でお願いします。', reading: 'カウンターせきで おねがいします。', meaning: '카운터석으로 부탁드립니다.' },
        ],
        explanation: '窓側の席은 창가 자리입니다. 席을 바꾸면 다른 자리 요청에도 응용할 수 있습니다.',
      },
      {
        kind: 'listen',
        id: 'p8-listen-1',
        title: '듣기 평가',
        prompt: '직원의 선택 질문에서 선택지를 먼저 잡습니다.',
        japanese: 'テーブル席とカウンター席、どちらになさいますか。',
        reading: 'テーブルせきと カウンターせき、どちらに なさいますか。',
        meaning: '테이블석과 카운터석, 어느 쪽으로 하시겠어요?',
        focus: 'AとB가 들리면 두 선택지 중 고르는 질문입니다.',
      },
      {
        kind: 'done',
        id: 'p8-done',
        title: 'P8 학습 완료',
        text: '이제 자리, 음식, 옵션 선택 상황에서 원하는 것을 말할 수 있습니다.',
      },
    ],
  },
  P9: {
    unitId: 'P9',
    cards: [
      {
        kind: 'preview',
        id: 'p9-preview',
        title: '된다, 안 된다, 어렵다를 구분하기',
        text: '서비스 가능 여부를 오해하면 여행 동선이 꼬입니다. P9는 긍정, 부정, 불가능, 모름의 표현을 빠르게 구분합니다.',
        image: '/scenes/quick-practice/retry-missed.webp',
        bullets: ['가능 안내 듣기', '불가능 안내 듣기', '모르거나 결정하지 못했을 때 말하기'],
      },
      {
        kind: 'expression',
        id: 'p9-exp-daijoubu',
        title: '괜찮음 말하기',
        japanese: '大丈夫です。',
        reading: 'だいじょうぶです。',
        meaning: '괜찮습니다.',
        note: '필요 없거나 문제 없을 때 모두 쓸 수 있습니다.',
      },
      {
        kind: 'expression',
        id: 'p9-exp-dekimasen',
        title: '불가능 안내',
        japanese: 'できません。',
        reading: 'できません。',
        meaning: '할 수 없습니다. / 불가능합니다.',
        note: '서비스가 안 된다는 짧은 안내입니다.',
      },
      {
        kind: 'expression',
        id: 'p9-exp-wakarimasen',
        title: '모르겠다고 말하기',
        japanese: 'よく分かりません。',
        reading: 'よく わかりません。',
        meaning: '잘 모르겠습니다.',
        note: '대화를 복구하기 전에 현재 이해하지 못했다는 신호로 쓸 수 있습니다.',
      },
      {
        kind: 'staffLine',
        id: 'p9-staff-not-available',
        title: '직원이 하는 말',
        japanese: '本日はご利用いただけません。',
        reading: 'ほんじつは ごりよういただけません。',
        meaning: '오늘은 이용하실 수 없습니다.',
        cue: 'いただけません은 정중한 불가능 안내입니다.',
      },
      {
        kind: 'quiz',
        id: 'p9-quiz-1',
        title: '불가능 표현 고르기',
        prompt: '오늘 이용할 수 없다는 안내는 무엇일까요?',
        requiredExpressionIds: ['p9-staff-not-available'],
        answerId: 'unavailable',
        options: [
          { id: 'ok', japanese: '大丈夫です。', reading: 'だいじょうぶです。', meaning: '괜찮습니다.' },
          { id: 'noidea', japanese: 'よく分かりません。', reading: 'よく わかりません。', meaning: '잘 모르겠습니다.' },
          { id: 'unavailable', japanese: '本日はご利用いただけません。', reading: 'ほんじつは ごりよういただけません。', meaning: '오늘은 이용하실 수 없습니다.' },
          { id: 'possible', japanese: 'こちらでご利用できます。', reading: 'こちらで ごりようできます。', meaning: '이쪽에서 이용하실 수 있습니다.' },
        ],
        explanation: 'ご利用いただけません은 이용할 수 없다는 정중한 부정 표현입니다.',
      },
      {
        kind: 'listen',
        id: 'p9-listen-1',
        title: '듣기 평가',
        prompt: '정중한 불가능 안내에서 ません을 잡습니다.',
        japanese: '本日はご利用いただけません。',
        reading: 'ほんじつは ごりよういただけません。',
        meaning: '오늘은 이용하실 수 없습니다.',
        focus: '本日は는 오늘, いただけません은 불가능 안내입니다.',
      },
      {
        kind: 'done',
        id: 'p9-done',
        title: 'P9 학습 완료',
        text: '이제 가능, 불가능, 모름 표현을 구분하고 오해 없이 반응할 수 있습니다.',
      },
    ],
  },
  P10: {
    unitId: 'P10',
    cards: [
      {
        kind: 'preview',
        id: 'p10-preview',
        title: '상태와 이유를 짧게 설명하기',
        text: '문제가 생겼을 때는 길게 말하려고 하지 말고 상태와 이유를 짧게 전달해야 합니다. P10은 아픔, 고장, 지연 같은 상태 설명을 익힙니다.',
        image: '/scenes/quick-practice/vocab-adjectives.webp',
        bullets: ['아픈 부위 말하기', '고장이나 문제 말하기', '늦거나 취소된 이유 설명하기'],
      },
      {
        kind: 'expression',
        id: 'p10-exp-hurts',
        title: '아픔 설명',
        japanese: 'お腹が痛いです。',
        reading: 'おなかが いたいです。',
        meaning: '배가 아픕니다.',
        note: '病院, 薬局에서 증상을 설명하는 기본 문장입니다.',
      },
      {
        kind: 'expression',
        id: 'p10-exp-broken',
        title: '고장 설명',
        japanese: 'エアコンが動きません。',
        reading: 'エアコンが うごきません。',
        meaning: '에어컨이 작동하지 않습니다.',
        note: '호텔 객실 문제를 말할 때 쓰기 좋습니다.',
      },
      {
        kind: 'expression',
        id: 'p10-exp-late',
        title: '지연 설명',
        japanese: '電車が遅れています。',
        reading: 'でんしゃが おくれています。',
        meaning: '전철이 지연되고 있습니다.',
        note: '교통 장애를 설명하거나 직원 안내를 이해할 때 중요합니다.',
      },
      {
        kind: 'staffLine',
        id: 'p10-staff-reason',
        title: '직원이 하는 말',
        japanese: '確認いたしますので、少々お待ちください。',
        reading: 'かくにんいたしますので、しょうしょう おまちください。',
        meaning: '확인하겠습니다, 잠시 기다려 주세요.',
        cue: 'ので는 이유를 붙이는 말입니다. 확인하므로 기다려 달라는 흐름입니다.',
      },
      {
        kind: 'quiz',
        id: 'p10-quiz-1',
        title: '상태 설명 고르기',
        prompt: '에어컨이 작동하지 않는다고 말하고 싶습니다. 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['p10-exp-broken'],
        answerId: 'aircon',
        options: [
          { id: 'stomach', japanese: 'お腹が痛いです。', reading: 'おなかが いたいです。', meaning: '배가 아픕니다.' },
          { id: 'aircon', japanese: 'エアコンが動きません。', reading: 'エアコンが うごきません。', meaning: '에어컨이 작동하지 않습니다.' },
          { id: 'train', japanese: '電車が遅れています。', reading: 'でんしゃが おくれています。', meaning: '전철이 지연되고 있습니다.' },
          { id: 'check', japanese: '確認いたします。', reading: 'かくにんいたします。', meaning: '확인하겠습니다.' },
        ],
        explanation: '動きません은 작동하지 않는다는 뜻입니다. 객실 설비 문제에 바로 쓸 수 있습니다.',
      },
      {
        kind: 'listen',
        id: 'p10-listen-1',
        title: '듣기 평가',
        prompt: '직원이 이유와 조치를 말할 때 흐름을 잡습니다.',
        japanese: '確認いたしますので、少々お待ちください。',
        reading: 'かくにんいたしますので、しょうしょう おまちください。',
        meaning: '확인하겠습니다, 잠시 기다려 주세요.',
        focus: '確認いたします가 들리면 직원이 확인 절차로 넘어간다는 뜻입니다.',
      },
      {
        kind: 'done',
        id: 'p10-done',
        title: 'P10 학습 완료',
        text: '이제 아픔, 고장, 지연 같은 상태를 짧게 설명할 수 있습니다.',
      },
    ],
  },
  P11: {
    unitId: 'P11',
    cards: [
      {
        kind: 'preview',
        id: 'p11-preview',
        title: '사과와 정중한 대응',
        text: '실수했을 때 정중하게 대응하면 대화가 훨씬 부드럽게 이어집니다. P11은 실수, 거절, 도움 받은 뒤의 표현을 다룹니다.',
        image: '/scenes/quick-practice/greetings.webp',
        bullets: ['실수했을 때 사과', '괜찮다고 답하기', '도움 받은 뒤 감사 표현'],
      },
      {
        kind: 'expression',
        id: 'p11-exp-gomen',
        title: '정중한 사과',
        japanese: '申し訳ありません。',
        reading: 'もうしわけありません。',
        meaning: '죄송합니다.',
        note: '호텔, 식당, 공항처럼 서비스 상황에서 정중하게 사과할 때 씁니다.',
      },
      {
        kind: 'expression',
        id: 'p11-exp-kekko',
        title: '괜찮다고 거절',
        japanese: '大丈夫です。',
        reading: 'だいじょうぶです。',
        meaning: '괜찮습니다.',
        note: '봉투, 영수증, 포인트카드처럼 필요 없다고 할 때도 씁니다.',
      },
      {
        kind: 'expression',
        id: 'p11-exp-tasukari',
        title: '도움에 감사',
        japanese: '助かりました。',
        reading: 'たすかりました。',
        meaning: '덕분에 살았습니다. / 도움이 되었습니다.',
        note: '분실물, 길 안내, 문제 해결 후 자연스럽게 쓸 수 있습니다.',
      },
      {
        kind: 'staffLine',
        id: 'p11-staff-no-problem',
        title: '직원이 하는 말',
        japanese: '大丈夫ですよ。',
        reading: 'だいじょうぶですよ。',
        meaning: '괜찮습니다.',
        cue: '상대가 괜찮다고 말할 때 よ가 붙어 부드럽게 들릴 수 있습니다.',
      },
      {
        kind: 'quiz',
        id: 'p11-quiz-1',
        title: '정중한 사과 고르기',
        prompt: '실수해서 정중하게 사과하고 싶습니다. 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['p11-exp-gomen'],
        answerId: 'sorry',
        options: [
          { id: 'sorry', japanese: '申し訳ありません。', reading: 'もうしわけありません。', meaning: '죄송합니다.' },
          { id: 'ok', japanese: '大丈夫です。', reading: 'だいじょうぶです。', meaning: '괜찮습니다.' },
          { id: 'helped', japanese: '助かりました。', reading: 'たすかりました。', meaning: '도움이 되었습니다.' },
          { id: 'please', japanese: 'お願いします。', reading: 'おねがいします。', meaning: '부탁드립니다.' },
        ],
        explanation: '申し訳ありません은 서비스 상황에서 쓰기 좋은 정중한 사과 표현입니다.',
      },
      {
        kind: 'listen',
        id: 'p11-listen-1',
        title: '듣기 평가',
        prompt: '상대의 부드러운 괜찮다는 반응을 듣습니다.',
        japanese: '大丈夫ですよ。',
        reading: 'だいじょうぶですよ。',
        meaning: '괜찮습니다.',
        focus: '大丈夫가 들리면 문제 없다는 반응입니다.',
      },
      {
        kind: 'done',
        id: 'p11-done',
        title: 'P11 학습 완료',
        text: '이제 사과, 거절, 감사 표현으로 대화를 부드럽게 이어갈 수 있습니다.',
      },
    ],
  },
  P12: {
    unitId: 'P12',
    cards: [
      {
        kind: 'preview',
        id: 'p12-preview',
        title: '의사소통 복구 표현',
        text: '못 알아들었을 때 침묵하면 대화가 끊깁니다. P12는 다시 듣기, 쉽게 말해달라고 하기, 보여달라고 하기 같은 복구 표현을 정리합니다.',
        image: '/scenes/quick-practice/retry-same.webp',
        bullets: ['다시 듣기', '쉬운 일본어 요청', '화면이나 종이로 확인'],
      },
      {
        kind: 'expression',
        id: 'p12-exp-onemore',
        title: '다시 말해달라고 요청',
        japanese: 'もう一度言ってください。',
        reading: 'もういちど いってください。',
        meaning: '다시 한 번 말해 주세요.',
        note: '정확히 한 번 더 듣고 싶을 때 씁니다.',
      },
      {
        kind: 'expression',
        id: 'p12-exp-easy',
        title: '쉽게 말해달라고 요청',
        japanese: 'やさしい日本語でお願いします。',
        reading: 'やさしい にほんごで おねがいします。',
        meaning: '쉬운 일본어로 부탁드립니다.',
        note: '긴 설명이 어려울 때 실제로 도움이 되는 표현입니다.',
      },
      {
        kind: 'expression',
        id: 'p12-exp-write',
        title: '써달라고 요청',
        japanese: '書いてもらえますか。',
        reading: 'かいて もらえますか。',
        meaning: '써 주실 수 있나요?',
        note: '주소, 금액, 시간, 플랫폼 번호를 확인할 때 좋습니다.',
      },
      {
        kind: 'staffLine',
        id: 'p12-staff-show',
        title: '직원이 하는 말',
        japanese: 'こちらをご確認ください。',
        reading: 'こちらを ごかくにんください。',
        meaning: '이쪽을 확인해 주세요.',
        cue: '확인하라는 말이 나오면 화면, 서류, 표지판을 함께 봐야 합니다.',
      },
      {
        kind: 'quiz',
        id: 'p12-quiz-1',
        title: '써달라는 요청',
        prompt: '주소를 듣기 어렵습니다. 써달라고 요청하려면 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['p12-exp-write'],
        answerId: 'write',
        options: [
          { id: 'again', japanese: 'もう一度言ってください。', reading: 'もういちど いってください。', meaning: '다시 한 번 말해 주세요.' },
          { id: 'easy', japanese: 'やさしい日本語でお願いします。', reading: 'やさしい にほんごで おねがいします。', meaning: '쉬운 일본어로 부탁드립니다.' },
          { id: 'write', japanese: '書いてもらえますか。', reading: 'かいて もらえますか。', meaning: '써 주실 수 있나요?' },
          { id: 'confirm', japanese: 'こちらをご確認ください。', reading: 'こちらを ごかくにんください。', meaning: '이쪽을 확인해 주세요.' },
        ],
        explanation: '書いてもらえますか는 써달라는 정중한 요청입니다. 듣기가 어려울 때 매우 실용적입니다.',
      },
      {
        kind: 'listen',
        id: 'p12-listen-1',
        title: '듣기 평가',
        prompt: '확인하라는 안내를 듣고 화면이나 종이를 보도록 반응합니다.',
        japanese: 'こちらをご確認ください。',
        reading: 'こちらを ごかくにんください。',
        meaning: '이쪽을 확인해 주세요.',
        focus: 'ご確認ください가 들리면 무언가를 확인하라는 요청입니다.',
      },
      {
        kind: 'done',
        id: 'p12-done',
        title: 'P12 학습 완료',
        text: '이제 못 알아들었을 때 대화를 끊지 않고 다시 듣기, 쉽게 듣기, 써달라고 요청할 수 있습니다.',
      },
    ],
  },
  P13: {
    unitId: 'P13',
    cards: [
      {
        kind: 'preview',
        id: 'p13-preview',
        title: '서비스 직원에게 자주 듣는 고정 질문',
        text: '계산대, 호텔, 식당에서는 비슷한 질문이 반복됩니다. P13은 직원의 고정 질문을 듣고 바로 반응하는 마지막 준비 과정입니다.',
        image: '/scenes/quick-practice/dictation.webp',
        bullets: ['소지 여부 질문', '결제 방법 질문', '옵션 선택 질문'],
      },
      {
        kind: 'expression',
        id: 'p13-exp-point',
        title: '포인트카드 질문',
        japanese: 'ポイントカードはお持ちですか。',
        reading: 'ポイントカードは おもちですか。',
        meaning: '포인트카드 있으신가요?',
        note: '여행자라면 大丈夫です 또는 ありません으로 짧게 답하면 됩니다.',
      },
      {
        kind: 'expression',
        id: 'p13-exp-payment',
        title: '결제 방법 질문',
        japanese: 'お支払いはどうされますか。',
        reading: 'おしはらいは どうされますか。',
        meaning: '결제는 어떻게 하시겠어요?',
        note: '현금, 카드, QR 결제 중 선택을 묻는 말입니다.',
      },
      {
        kind: 'expression',
        id: 'p13-exp-bag',
        title: '봉투 질문',
        japanese: '袋はご利用ですか。',
        reading: 'ふくろは ごりようですか。',
        meaning: '봉투 이용하시겠어요?',
        note: '편의점과 쇼핑에서 자주 듣습니다. 必要です / 大丈夫です로 답합니다.',
      },
      {
        kind: 'staffLine',
        id: 'p13-staff-last',
        title: '직원이 하는 말',
        japanese: '温めますか。',
        reading: 'あたためますか。',
        meaning: '데워 드릴까요?',
        cue: '편의점 도시락, 빵, 음료에서 자주 듣는 질문입니다.',
      },
      {
        kind: 'quiz',
        id: 'p13-quiz-1',
        title: '결제 질문 고르기',
        prompt: '직원이 결제 방법을 물었습니다. 어떤 문장이 그 뜻일까요?',
        requiredExpressionIds: ['p13-exp-payment'],
        answerId: 'payment',
        options: [
          { id: 'point', japanese: 'ポイントカードはお持ちですか。', reading: 'ポイントカードは おもちですか。', meaning: '포인트카드 있으신가요?' },
          { id: 'payment', japanese: 'お支払いはどうされますか。', reading: 'おしはらいは どうされますか。', meaning: '결제는 어떻게 하시겠어요?' },
          { id: 'bag', japanese: '袋はご利用ですか。', reading: 'ふくろは ごりようですか。', meaning: '봉투 이용하시겠어요?' },
          { id: 'warm', japanese: '温めますか。', reading: 'あたためますか。', meaning: '데워 드릴까요?' },
        ],
        explanation: 'お支払い는 결제입니다. どうされますか는 어떻게 하겠는지 묻는 정중한 질문입니다.',
      },
      {
        kind: 'listen',
        id: 'p13-listen-1',
        title: '듣기 평가',
        prompt: '편의점에서 자주 듣는 짧은 질문을 확인합니다.',
        japanese: '温めますか。',
        reading: 'あたためますか。',
        meaning: '데워 드릴까요?',
        focus: '温めますか가 들리면 도시락이나 음식을 데울지 묻는 말입니다.',
      },
      {
        kind: 'done',
        id: 'p13-done',
        title: 'P13 학습 완료',
        text: '이제 서비스 직원의 반복 질문을 듣고 짧게 대응할 준비가 되었습니다.',
      },
    ],
  },
  S4: {
    unitId: 'S4',
    cards: [
      {
        kind: 'preview',
        id: 's4-preview',
        title: '시간, 금액, 수량 확인하기',
        text: '실전에서는 숫자를 잘못 들으면 예약, 결제, 이동이 바로 틀어집니다. S4는 숫자 정보를 다시 확인하는 단원입니다.',
        image: '/scenes/quick-practice/basics.webp',
        bullets: ['예약 시간 재확인', '금액 재확인', '인원과 개수 확인'],
      },
      {
        kind: 'expression',
        id: 's4-exp-time-confirm',
        title: '시간 재확인',
        japanese: '三時で合っていますか。',
        reading: 'さんじで あっていますか。',
        meaning: '3시가 맞나요?',
        note: '예약, 출발, 입장 시간을 다시 확인할 때 씁니다.',
      },
      {
        kind: 'expression',
        id: 's4-exp-total',
        title: '금액 재확인',
        japanese: '全部でいくらですか。',
        reading: 'ぜんぶで いくらですか。',
        meaning: '전부 얼마인가요?',
        note: '계산 전후 총액을 확인할 수 있습니다.',
      },
      {
        kind: 'expression',
        id: 's4-exp-two',
        title: '개수 말하기',
        japanese: '二つお願いします。',
        reading: 'ふたつ おねがいします。',
        meaning: '두 개 부탁드립니다.',
        note: '티켓, 음식, 상품 수량을 말할 때 쓰는 기본 표현입니다.',
      },
      {
        kind: 'staffLine',
        id: 's4-staff-number',
        title: '직원이 하는 말',
        japanese: '全部で二千五百円です。',
        reading: 'ぜんぶで にせんごひゃくえんです。',
        meaning: '전부 2,500엔입니다.',
        cue: '全部で가 들리면 전체 금액 안내입니다.',
      },
      {
        kind: 'quiz',
        id: 's4-quiz-1',
        title: '수량 요청 고르기',
        prompt: '두 개 달라고 말하고 싶습니다. 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['s4-exp-two'],
        answerId: 'two',
        options: [
          { id: 'time', japanese: '三時で合っていますか。', reading: 'さんじで あっていますか。', meaning: '3시가 맞나요?' },
          { id: 'total', japanese: '全部でいくらですか。', reading: 'ぜんぶで いくらですか。', meaning: '전부 얼마인가요?' },
          { id: 'two', japanese: '二つお願いします。', reading: 'ふたつ おねがいします。', meaning: '두 개 부탁드립니다.' },
          { id: 'all', japanese: '全部で二千五百円です。', reading: 'ぜんぶで にせんごひゃくえんです。', meaning: '전부 2,500엔입니다.' },
        ],
        explanation: '二つお願いします는 물건이나 티켓을 두 개 요청하는 표현입니다.',
      },
      {
        kind: 'listen',
        id: 's4-listen-1',
        title: '듣기 평가',
        prompt: '금액 안내에서 전체 금액을 잡습니다.',
        japanese: '全部で二千五百円です。',
        reading: 'ぜんぶで にせんごひゃくえんです。',
        meaning: '전부 2,500엔입니다.',
        focus: '全部で와 円이 들리면 총액 안내입니다.',
      },
      {
        kind: 'done',
        id: 's4-done',
        title: 'S4 학습 완료',
        text: '이제 시간, 금액, 수량을 다시 확인하며 실수를 줄일 수 있습니다.',
      },
    ],
  },
  S5: {
    unitId: 'S5',
    cards: [
      {
        kind: 'preview',
        id: 's5-preview',
        title: '부탁과 허락을 실전에서 쓰기',
        text: 'S5는 요청 표현을 실제 장소에서 쓰는 단원입니다. 짐 맡기기, 사진 촬영, 좌석 변경처럼 여행자가 자주 겪는 상황을 다룹니다.',
        image: '/scenes/quick-practice/vocab.webp',
        bullets: ['짐 맡기기', '사진 촬영 허락', '가능하면 부탁하기'],
      },
      {
        kind: 'expression',
        id: 's5-exp-luggage',
        title: '짐 맡기기',
        japanese: '荷物を預けたいです。',
        reading: 'にもつを あずけたいです。',
        meaning: '짐을 맡기고 싶습니다.',
        note: '호텔 체크인 전, 체크아웃 후, 관광지 보관소에서 유용합니다.',
      },
      {
        kind: 'expression',
        id: 's5-exp-if-possible',
        title: '가능하면 변경 요청',
        japanese: 'できれば席を変えたいです。',
        reading: 'できれば せきを かえたいです。',
        meaning: '가능하면 자리를 바꾸고 싶습니다.',
        note: '요청이 부담스러울 수 있을 때 원하는 행동을 함께 말합니다.',
      },
      {
        kind: 'expression',
        id: 's5-exp-change',
        title: '변경 요청',
        japanese: '席を変えられますか。',
        reading: 'せきを かえられますか。',
        meaning: '자리를 바꿀 수 있나요?',
        note: '식당, 기차, 항공기 좌석에서 쓸 수 있습니다.',
      },
      {
        kind: 'staffLine',
        id: 's5-staff-difficult',
        title: '직원이 하는 말',
        japanese: '少し難しいです。',
        reading: 'すこし むずかしいです。',
        meaning: '조금 어렵습니다.',
        cue: '難しいです는 직접적인 거절보다 완곡하게 어렵다는 뜻입니다.',
      },
      {
        kind: 'quiz',
        id: 's5-quiz-1',
        title: '변경 요청 고르기',
        prompt: '자리를 바꿀 수 있는지 묻고 싶습니다. 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['s5-exp-change'],
        answerId: 'seat',
        options: [
          { id: 'bag', japanese: '荷物を預けたいです。', reading: 'にもつを あずけたいです。', meaning: '짐을 맡기고 싶습니다.' },
          { id: 'possible', japanese: 'できれば席を変えたいです。', reading: 'できれば せきを かえたいです。', meaning: '가능하면 자리를 바꾸고 싶습니다.' },
          { id: 'seat', japanese: '席を変えられますか。', reading: 'せきを かえられますか。', meaning: '자리를 바꿀 수 있나요?' },
          { id: 'difficult', japanese: '少し難しいです。', reading: 'すこし むずかしいです。', meaning: '조금 어렵습니다.' },
        ],
        explanation: '席を変えられますか는 좌석 변경 가능 여부를 묻는 표현입니다.',
      },
      {
        kind: 'listen',
        id: 's5-listen-1',
        title: '듣기 평가',
        prompt: '완곡한 거절 표현을 이해합니다.',
        japanese: '少し難しいです。',
        reading: 'すこし むずかしいです。',
        meaning: '조금 어렵습니다.',
        focus: '難しいです가 들리면 요청이 어렵거나 불가능할 수 있다는 뜻입니다.',
      },
      {
        kind: 'done',
        id: 's5-done',
        title: 'S5 학습 완료',
        text: '이제 요청, 허락, 변경 가능 여부를 실전 상황에서 말할 수 있습니다.',
      },
    ],
  },
  S6: {
    unitId: 'S6',
    cards: [
      {
        kind: 'preview',
        id: 's6-preview',
        title: '실수와 문제 설명하기',
        text: '여행 중 실수나 문제가 생겼을 때는 무엇이 잘못됐는지 짧게 설명해야 합니다. S6는 분실, 오류, 잘못된 결제 같은 상황을 다룹니다.',
        image: '/scenes/quick-practice/retry-missed.webp',
        bullets: ['실수했다고 말하기', '문제가 있다고 말하기', '도움을 요청하기'],
      },
      {
        kind: 'expression',
        id: 's6-exp-mistake',
        title: '실수 설명',
        japanese: '間違えました。',
        reading: 'まちがえました。',
        meaning: '실수했습니다. / 잘못했습니다.',
        note: '주문, 결제, 방향 선택을 잘못했을 때 씁니다.',
      },
      {
        kind: 'expression',
        id: 's6-exp-problem',
        title: '문제 있음',
        japanese: 'ちょっと問題があります。',
        reading: 'ちょっと もんだいが あります。',
        meaning: '조금 문제가 있습니다.',
        note: '구체적 설명 전에 문제 상황을 알리는 첫 문장입니다.',
      },
      {
        kind: 'expression',
        id: 's6-exp-help',
        title: '도움 요청',
        japanese: '手伝っていただけますか。',
        reading: 'てつだって いただけますか。',
        meaning: '도와주실 수 있나요?',
        note: '분실, 기계 오류, 길 찾기에서 넓게 쓸 수 있습니다.',
      },
      {
        kind: 'staffLine',
        id: 's6-staff-check',
        title: '직원이 하는 말',
        japanese: '状況を確認します。',
        reading: 'じょうきょうを かくにんします。',
        meaning: '상황을 확인하겠습니다.',
        cue: '状況은 상황, 確認します는 확인하겠다는 뜻입니다.',
      },
      {
        kind: 'quiz',
        id: 's6-quiz-1',
        title: '도움 요청 고르기',
        prompt: '기계가 잘 안 되어 도움을 요청하고 싶습니다. 어떤 문장이 맞을까요?',
        requiredExpressionIds: ['s6-exp-help'],
        answerId: 'help',
        options: [
          { id: 'mistake', japanese: '間違えました。', reading: 'まちがえました。', meaning: '실수했습니다.' },
          { id: 'problem', japanese: 'ちょっと問題があります。', reading: 'ちょっと もんだいが あります。', meaning: '조금 문제가 있습니다.' },
          { id: 'help', japanese: '手伝っていただけますか。', reading: 'てつだって いただけますか。', meaning: '도와주실 수 있나요?' },
          { id: 'check', japanese: '状況を確認します。', reading: 'じょうきょうを かくにんします。', meaning: '상황을 확인하겠습니다.' },
        ],
        explanation: '手伝っていただけますか는 도움을 요청하는 더 정중한 표현입니다.',
      },
      {
        kind: 'listen',
        id: 's6-listen-1',
        title: '듣기 평가',
        prompt: '직원이 문제를 확인하겠다는 말을 이해합니다.',
        japanese: '状況を確認します。',
        reading: 'じょうきょうを かくにんします。',
        meaning: '상황을 확인하겠습니다.',
        focus: '確認します가 들리면 직원이 확인 절차를 진행한다는 뜻입니다.',
      },
      {
        kind: 'done',
        id: 's6-done',
        title: 'S6 학습 완료',
        text: '이제 실수와 문제를 짧게 설명하고 도움을 요청할 수 있습니다.',
      },
    ],
  },
  ...generatedLessons,
};

export function lessonForUnit(unitId: string, level?: PracticeLevel): Lesson | undefined {
  const lesson = lessons[unitId];
  if (!lesson) return undefined;
  const enhanced = enhanceLesson(lesson);
  return level ? lessonForPracticeLevel(enhanced, level) : enhanced;
}

function lessonForPracticeLevel(lesson: Lesson, level: PracticeLevel): Lesson {
  const unit = allUnits.find((candidate) => candidate.id === lesson.unitId);
  if (unit?.course !== 'practice') return lesson;

  const preview = lesson.cards.find((card): card is Extract<LessonCard, { kind: 'preview' }> => card.kind === 'preview');
  const expressions = lesson.cards.filter((card): card is ExpressionCard => card.kind === 'expression');
  const staff = lesson.cards.find((card): card is StaffLineCard => card.kind === 'staffLine');
  const dialogue = lesson.cards.find((card): card is DialogueCard => card.kind === 'dialogue');
  const branch = lesson.cards.find((card): card is BranchCard => card.kind === 'branch');
  const roleplay = lesson.cards.find((card): card is RoleplayCard => card.kind === 'roleplay');
  const listen = lesson.cards.find((card): card is ListenCard => card.kind === 'listen');
  const done = lesson.cards.find((card): card is Extract<LessonCard, { kind: 'done' }> => card.kind === 'done');
  if (!preview || expressions.length === 0 || !staff || !listen || !done) return lesson;

  const plan = unit.levelPlans?.find((candidate) => candidate.level === level);
  const targetExpression =
    level === 'beginner' ? expressions[0]
    : level === 'intermediate' ? expressions[1] ?? expressions[0]
    : expressions[2] ?? expressions[1] ?? expressions[0];

  const cards: LessonCard[] = [
    {
      ...preview,
      id: `${preview.id}-${level}`,
      title: `${unit.title} · ${plan?.label ?? '실전'}`,
      text: plan?.focus ?? preview.text,
      bullets: plan ? [plan.title, plan.task, '퀴즈는 이 난이도에서 먼저 학습한 표현만 기준으로 출제됩니다.'] : preview.bullets,
    },
    expressions[0],
  ];

  if (level === 'intermediate' || level === 'advanced') {
    cards.push(expressions[1] ?? expressions[0]);
  }
  if (level === 'advanced') {
    cards.push(expressions[2] ?? expressions[1] ?? expressions[0]);
  }

  cards.push(staff);
  if (dialogue) cards.push(dialogue);
  if ((level === 'intermediate' || level === 'advanced') && branch) cards.push(branch);
  if (level === 'advanced' && roleplay) cards.push(roleplay);
  cards.push(buildLevelQuiz(lesson.unitId, level, targetExpression, expressions, staff, plan?.label ?? '실전'));
  cards.push(listen);
  cards.push({
    ...done,
    id: `${done.id}-${level}`,
    title: `${unit.title} · ${plan?.label ?? '실전'} 완료`,
    text: plan ? `${plan.title} 단계를 완료했습니다. 다음 난이도에서는 ${plan.task}를 더 정확하게 처리합니다.` : done.text,
  });

  return { unitId: lesson.unitId, cards };
}

function buildLevelQuiz(
  unitId: string,
  level: PracticeLevel,
  answer: ExpressionCard,
  expressions: ExpressionCard[],
  staff: StaffLineCard,
  label: string,
): QuizCard {
  const options = [
    answer,
    ...expressions.filter((expression) => expression.id !== answer.id),
    {
      id: staff.id,
      japanese: staff.japanese,
      reading: staff.reading,
      meaning: staff.meaning,
    },
  ]
    .slice(0, 4)
    .map((option) => ({
      id: option.id,
      japanese: option.japanese,
      reading: option.reading,
      meaning: option.meaning,
    }));

  return {
    kind: 'quiz',
    id: `${unitId.toLowerCase()}-${level}-quiz`,
    title: `${label} 표현 고르기`,
    prompt: `“${answer.meaning}”라고 말해야 합니다. 어떤 표현이 맞을까요?`,
    requiredExpressionIds: [answer.id],
    answerId: answer.id,
    options,
    explanation: `${answer.japanese}는 ${label} 단계에서 먼저 쓸 표현입니다. 선택 후 각 보기의 해석을 확인하고 구분합니다.`,
  };
}

function enhanceLesson(lesson: Lesson): Lesson {
  if (lesson.cards.some((card) => card.kind === 'dialogue' || card.kind === 'branch' || card.kind === 'roleplay')) {
    return lesson;
  }
  const unit = allUnits.find((candidate) => candidate.id === lesson.unitId);
  const expressions = lesson.cards.filter((card): card is ExpressionCard => card.kind === 'expression');
  const staff = lesson.cards.find((card): card is StaffLineCard => card.kind === 'staffLine');
  if (!unit || expressions.length === 0 || !staff) return lesson;

  const primary = expressions[0];
  const support = expressions[1] ?? primary;
  const recovery = expressions[2] ?? support;
  const insertAt = Math.max(lesson.cards.findIndex((card) => card.kind === 'quiz'), 0);
  const enhancedCards: LessonCard[] = [
    ...lesson.cards.slice(0, insertAt),
    buildDialogueCard(unit, primary, staff, support),
    buildBranchCard(unit, primary, support, recovery),
    buildRoleplayCard(unit, primary, support, recovery),
    ...lesson.cards.slice(insertAt),
  ];
  return { ...lesson, cards: enhancedCards };
}

function buildDialogueCard(unit: { id: string; title: string }, primary: ExpressionCard, staff: StaffLineCard, support: ExpressionCard): DialogueCard {
  return {
    kind: 'dialogue',
    id: `${unit.id.toLowerCase()}-dialogue-basic`,
    title: '기본 대화',
    setup: `${unit.title} 장면에서 사용자가 먼저 말하고, 직원 안내를 듣고, 필요한 정보를 한 번 더 확인합니다.`,
    turns: [
      { speaker: 'traveler', japanese: primary.japanese, reading: primary.reading, meaning: primary.meaning },
      { speaker: 'staff', japanese: staff.japanese, reading: staff.reading, meaning: staff.meaning },
      { speaker: 'traveler', japanese: support.japanese, reading: support.reading, meaning: support.meaning },
    ],
  };
}

function buildBranchCard(unit: { id: string; title: string }, primary: ExpressionCard, support: ExpressionCard, recovery: ExpressionCard): BranchCard {
  return {
    kind: 'branch',
    id: `${unit.id.toLowerCase()}-branch`,
    title: '분기 대화',
    situation: `${unit.title} 중 예상과 다른 안내를 들었을 때 어떤 식으로 이어갈지 고릅니다.`,
    choices: [
      {
        label: '바로 진행',
        japanese: primary.japanese,
        reading: primary.reading,
        meaning: primary.meaning,
        outcome: '상황이 명확할 때는 핵심 표현으로 바로 진행합니다.',
      },
      {
        label: '한 번 더 확인',
        japanese: support.japanese,
        reading: support.reading,
        meaning: support.meaning,
        outcome: '시간, 금액, 장소, 조건이 애매하면 확인 표현을 먼저 사용합니다.',
      },
      {
        label: '대화 복구',
        japanese: recovery.japanese,
        reading: recovery.reading,
        meaning: recovery.meaning,
        outcome: '이해가 안 되거나 문제가 생기면 복구 표현으로 대화를 유지합니다.',
      },
    ],
  };
}

function hasKoreanFinalConsonant(text: string): boolean {
  const match = /[가-힣](?!.*[가-힣])/.exec(text);
  if (!match) return false;
  return (match[0].charCodeAt(0) - 0xac00) % 28 !== 0;
}

function endsWithKoreanRieul(text: string): boolean {
  const match = /[가-힣](?!.*[가-힣])/.exec(text);
  if (!match) return false;
  return (match[0].charCodeAt(0) - 0xac00) % 28 === 8;
}

function quoteParticle(text: string): string {
  return hasKoreanFinalConsonant(text) ? '이라고' : '라고';
}

function meansParticle(text: string): string {
  if (!hasKoreanFinalConsonant(text) || endsWithKoreanRieul(text)) return '로';
  return '으로';
}

function buildRoleplayCard(unit: { id: string; title: string }, primary: ExpressionCard, support: ExpressionCard, recovery: ExpressionCard): RoleplayCard {
  return {
    kind: 'roleplay',
    id: `${unit.id.toLowerCase()}-roleplay`,
    title: '자유 역할극',
    mission: `${unit.title} 상황이라고 생각하고, 아래 세 가지 행동을 순서대로 말해 봅니다.`,
    starter: primary.japanese,
    checklist: [
      `${primary.meaning}${quoteParticle(primary.meaning)} 먼저 말하기`,
      `${support.meaning}${meansParticle(support.meaning)} 필요한 정보를 확인하기`,
      `${recovery.meaning}${meansParticle(recovery.meaning)} 문제가 생겼을 때 대응하기`,
    ],
  };
}
