export type UnitKind = 'prep' | 'scene' | 'journey';

export type UnitCourse = 'starter' | 'foundation' | 'practice' | 'journey';

export type PracticeLevel = 'beginner' | 'intermediate' | 'advanced';

export type UnitStatus = 'locked' | 'ready' | 'active' | 'done';

export interface PracticeLevelPlan {
  level: PracticeLevel;
  label: string;
  title: string;
  focus: string;
  task: string;
}

export interface JourneyCheckpoint {
  id: string;
  title: string;
  place: string;
  linkedUnitIds: string[];
  goal: string;
  successCriteria: string;
}

export interface LearningUnit {
  id: string;
  kind: UnitKind;
  course: UnitCourse;
  title: string;
  subtitle: string;
  group: string;
  image: string;
  goal: string;
  requiredIds: string[];
  reward: string;
  blocks: string[];
  levelPlans?: PracticeLevelPlan[];
  journeyCheckpoints?: JourneyCheckpoint[];
}

const FLOW_BLOCKS = [
  '상황 미리보기',
  '핵심 표현',
  '직원이 하는 말',
  '기본 대화',
  '분기 대화',
  '자유 역할극',
  '듣기 평가',
];

export const prepUnits: LearningUnit[] = [
  {
    id: 'P1',
    kind: 'prep',
    course: 'starter',
    title: '일본어 발음과 듣기 기초',
    subtitle: '장음, 촉음, 억양, 빠른 직원 말 듣기',
    group: '선행 과정',
    image: '/scenes/quick-practice/pairs.webp',
    goal: '짧은 직원 질문의 끝 억양과 핵심 단어를 듣고 반응한다.',
    requiredIds: [],
    reward: '듣기 기초 배지',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P2',
    kind: 'prep',
    course: 'starter',
    title: '여행 가타카나',
    subtitle: '역, 호텔, 식당, 쇼핑에서 보는 외래어',
    group: '선행 과정',
    image: '/scenes/quick-practice/katakana.webp',
    goal: '현지 표지판과 메뉴에서 자주 보이는 가타카나를 읽는다.',
    requiredIds: ['P1'],
    reward: '가타카나 여행 카드',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P3',
    kind: 'prep',
    course: 'foundation',
    title: '일본어 문장 기본 순서',
    subtitle: '단어를 실제 문장으로 바꾸는 최소 문법',
    group: '선행 과정',
    image: '/scenes/quick-practice/compose.webp',
    goal: '원하는 것, 가능한 것, 위치를 짧은 문장으로 말한다.',
    requiredIds: ['P1'],
    reward: '문장 조립 노트',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P4',
    kind: 'prep',
    course: 'foundation',
    title: '의문사와 질문 만들기',
    subtitle: '무엇, 어디, 언제, 얼마, 어느 쪽',
    group: '선행 과정',
    image: '/scenes/quick-practice/greetings.webp',
    goal: '직원이 없을 때도 먼저 질문을 시작한다.',
    requiredIds: ['P3'],
    reward: '질문 시작권',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P5',
    kind: 'prep',
    course: 'foundation',
    title: '지시어와 위치 표현',
    subtitle: '이것, 저것, 여기, 저기, 방향',
    group: '선행 과정',
    image: '/scenes/quick-practice/signs.webp',
    goal: '눈앞의 사물과 위치를 정확히 가리킨다.',
    requiredIds: ['P3'],
    reward: '위치 표현 지도',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P6',
    kind: 'prep',
    course: 'starter',
    title: '시간·날짜·수량·금액',
    subtitle: '여행 중 가장 자주 듣는 숫자 반응',
    group: '선행 과정',
    image: '/scenes/quick-practice/basics.webp',
    goal: '시간, 인원, 개수, 금액을 듣고 바로 확인한다.',
    requiredIds: ['P1'],
    reward: '숫자 반응 코인',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P7',
    kind: 'prep',
    course: 'foundation',
    title: '요청·부탁·허락',
    subtitle: '부탁하고 가능한지 묻기',
    group: '선행 과정',
    image: '/scenes/quick-practice/vocab.webp',
    goal: '필요한 물건이나 행동을 정중하게 요청한다.',
    requiredIds: ['P3', 'P4'],
    reward: '부탁 표현 카드',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P8',
    kind: 'prep',
    course: 'foundation',
    title: '선택과 선호',
    subtitle: '자리, 음식, 옵션 고르기',
    group: '선행 과정',
    image: '/scenes/quick-practice/vocab-food.webp',
    goal: '여러 선택지 중 원하는 것을 말한다.',
    requiredIds: ['P4'],
    reward: '선택 표현 토큰',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P9',
    kind: 'prep',
    course: 'foundation',
    title: '긍정·부정·불가능',
    subtitle: '된다, 안 된다, 모르겠다',
    group: '선행 과정',
    image: '/scenes/quick-practice/retry-missed.webp',
    goal: '가능/불가능 안내를 듣고 오해 없이 대응한다.',
    requiredIds: ['P1', 'P3'],
    reward: '오해 방지 카드',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P10',
    kind: 'prep',
    course: 'foundation',
    title: '이유와 상태 설명',
    subtitle: '문제 상황을 짧게 설명하기',
    group: '선행 과정',
    image: '/scenes/quick-practice/vocab-adjectives.webp',
    goal: '아프다, 고장났다, 늦었다 같은 상태를 말한다.',
    requiredIds: ['P3'],
    reward: '상태 설명 메모',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P11',
    kind: 'prep',
    course: 'foundation',
    title: '사과와 정중 대응',
    subtitle: '실수했을 때 대화를 부드럽게 이어가기',
    group: '선행 과정',
    image: '/scenes/quick-practice/greetings.webp',
    goal: '실수, 도움, 거절 상황에서 정중하게 대응한다.',
    requiredIds: ['P7'],
    reward: '정중 대응 리본',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P12',
    kind: 'prep',
    course: 'foundation',
    title: '의사소통 복구',
    subtitle: '다시 말해달라고 요청하기',
    group: '선행 과정',
    image: '/scenes/quick-practice/retry-same.webp',
    goal: '못 알아들었을 때 대화를 멈추지 않고 복구한다.',
    requiredIds: ['P1', 'P11'],
    reward: '복구 표현 배지',
    blocks: FLOW_BLOCKS,
  },
  {
    id: 'P13',
    kind: 'prep',
    course: 'foundation',
    title: '직원에게 자주 듣는 표현',
    subtitle: '서비스 직원의 고정 질문 듣기',
    group: '선행 과정',
    image: '/scenes/quick-practice/dictation.webp',
    goal: '봉투, 포인트, 결제, 예약 질문을 빠르게 알아듣는다.',
    requiredIds: ['P1', 'P6', 'P12'],
    reward: '직원 질문 마스터 카드',
    blocks: FLOW_BLOCKS,
  },
];

const sceneTitles = [
  ['S1', '직원에게 말 걸기', '생존 회화와 대화 시작', '/scenes/quick-practice/greetings.webp'],
  ['S2', '알아듣지 못했을 때', '생존 회화와 대화 시작', '/scenes/quick-practice/retry-same.webp'],
  ['S3', '위치와 길 묻기', '생존 회화와 대화 시작', '/scenes/quick-practice/signs.webp'],
  ['S4', '시간·금액·수량 확인하기', '생존 회화와 대화 시작', '/scenes/quick-practice/basics.webp'],
  ['S5', '부탁과 허락', '생존 회화와 대화 시작', '/scenes/quick-practice/vocab.webp'],
  ['S6', '실수와 문제 설명하기', '생존 회화와 대화 시작', '/scenes/quick-practice/retry-missed.webp'],
  ['S7', '입국심사', '공항 도착과 기본 이동', '/scenes/quick-practice/basics.webp'],
  ['S8', '수하물과 세관', '공항 도착과 기본 이동', '/scenes/quick-practice/vocab.webp'],
  ['S9', '공항에서 교통편 찾기', '공항 도착과 기본 이동', '/scenes/quick-practice/vocab-transport.webp'],
  ['S10', '교통카드와 승차권', '공항 도착과 기본 이동', '/scenes/quick-practice/vocab-transport.webp'],
  ['S11', '개찰구와 승강장', '공항 도착과 기본 이동', '/scenes/quick-practice/signs.webp'],
  ['S12', '환승과 안내방송', '공항 도착과 기본 이동', '/scenes/quick-practice/dictation.webp'],
  ['S13', '택시 이용', '공항 도착과 기본 이동', '/scenes/quick-practice/vocab-transport.webp'],
  ['S14', '호텔 체크인', '숙박·식사·일상생활', '/scenes/quick-practice/basics.webp'],
  ['S15', '셀프 체크인', '숙박·식사·일상생활', '/scenes/quick-practice/signs.webp'],
  ['S16', '객실 문제 해결', '숙박·식사·일상생활', '/scenes/quick-practice/retry-missed.webp'],
  ['S17', '호텔 서비스와 체크아웃', '숙박·식사·일상생활', '/scenes/quick-practice/vocab.webp'],
  ['S18', '식당 입장과 대기', '숙박·식사·일상생활', '/scenes/quick-practice/vocab-food.webp'],
  ['S19', '메뉴 확인과 기본 주문', '숙박·식사·일상생활', '/scenes/quick-practice/vocab-food.webp'],
  ['S20', '취향과 식사 제한', '숙박·식사·일상생활', '/scenes/quick-practice/vocab-food.webp'],
  ['S21', '음식점 유형별 주문', '숙박·식사·일상생활', '/scenes/quick-practice/vocab-food.webp'],
  ['S22', '계산과 결제', '숙박·식사·일상생활', '/scenes/quick-practice/basics.webp'],
  ['S23', '편의점과 셀프 계산대', '숙박·식사·일상생활', '/scenes/quick-practice/vocab.webp'],
  ['S24', '신칸센 이용', '장거리 이동·쇼핑·관광', '/scenes/quick-practice/vocab-transport.webp'],
  ['S25', '버스와 노면전차', '장거리 이동·쇼핑·관광', '/scenes/quick-practice/vocab-transport.webp'],
  ['S26', '렌터카', '장거리 이동·쇼핑·관광', '/scenes/quick-practice/vocab-transport.webp'],
  ['S27', '의류와 신발 쇼핑', '장거리 이동·쇼핑·관광', '/scenes/quick-practice/vocab-colors.webp'],
  ['S28', '드럭스토어와 전자제품', '장거리 이동·쇼핑·관광', '/scenes/quick-practice/vocab.webp'],
  ['S29', '면세 쇼핑', '장거리 이동·쇼핑·관광', '/scenes/quick-practice/basics.webp'],
  ['S30', '관광지와 입장권', '장거리 이동·쇼핑·관광', '/scenes/quick-practice/signs.webp'],
  ['S31', '신사와 사찰', '장거리 이동·쇼핑·관광', '/scenes/quick-practice/signs.webp'],
  ['S32', '료칸과 온천', '장거리 이동·쇼핑·관광', '/scenes/quick-practice/vocab-body.webp'],
  ['S33', '체험과 대여', '장거리 이동·쇼핑·관광', '/scenes/quick-practice/vocab.webp'],
  ['S34', '예약 변경과 취소', '문제 해결과 안전', '/scenes/quick-practice/retry-same.webp'],
  ['S35', '분실물', '문제 해결과 안전', '/scenes/quick-practice/retry-missed.webp'],
  ['S36', '약국', '문제 해결과 안전', '/scenes/quick-practice/vocab-body.webp'],
  ['S37', '병원과 응급상황', '문제 해결과 안전', '/scenes/quick-practice/vocab-body.webp'],
  ['S38', '문화 에티켓과 지적받는 상황', '문제 해결과 안전', '/scenes/quick-practice/greetings.webp'],
  ['S39', '지방과 소도시 여행', '문제 해결과 안전', '/scenes/quick-practice/vocab-places.webp'],
  ['S40', '기상과 교통 장애', '문제 해결과 안전', '/scenes/quick-practice/vocab-weather.webp'],
  ['S41', '공항으로 이동', '출국', '/scenes/quick-practice/vocab-transport.webp'],
  ['S42', '항공사 체크인', '출국', '/scenes/quick-practice/basics.webp'],
  ['S43', '보안검색과 탑승', '출국', '/scenes/quick-practice/signs.webp'],
] as const;

function practiceLevelPlans(title: string): PracticeLevelPlan[] {
  return [
    {
      level: 'beginner',
      label: '입문',
      title: '짧게 요청하고 답하기',
      focus: `${title}에서 가장 기본이 되는 한 문장과 직원의 짧은 확인 질문을 처리합니다.`,
      task: '핵심 표현 1개, 직원 질문 1개, 바로 답하기',
    },
    {
      level: 'intermediate',
      label: '중급',
      title: '조건과 선택지 처리하기',
      focus: `${title}에서 시간, 수량, 위치, 옵션처럼 여행자가 자주 바꾸거나 확인하는 조건을 말합니다.`,
      task: '선택 표현, 추가 질문, 조건 확인',
    },
    {
      level: 'advanced',
      label: '고급',
      title: '예외 상황 복구하기',
      focus: `${title}에서 예약 불일치, 결제 실패, 안내 이해 실패 같은 문제를 설명하고 대안을 요청합니다.`,
      task: '문제 설명, 대안 요청, 역할극 입력',
    },
  ];
}

export const sceneUnits: LearningUnit[] = sceneTitles.map(([id, title, group, image], index) => ({
  id,
  kind: 'scene',
  course: 'practice',
  title,
  subtitle: group,
  group,
  image,
  goal: `${title} 상황에서 먼저 말하고, 직원 질문을 듣고, 문제 상황까지 대응한다.`,
  requiredIds:
    id === 'S1' ? ['P1']
    : id === 'S2' ? ['P1']
    : id === 'S3' ? ['P1', 'P5']
    : index < 6 ? ['P1', 'P3', 'P12']
    : ['P1', 'P6', 'P7', 'P12', 'P13'],
  reward: `${title} 실전 아이템`,
  blocks: FLOW_BLOCKS,
  levelPlans: practiceLevelPlans(title),
}));

function checkpoint(
  id: string,
  title: string,
  place: string,
  linkedUnitIds: string[],
  goal: string,
  successCriteria: string,
): JourneyCheckpoint {
  return { id, title, place, linkedUnitIds, goal, successCriteria };
}

export const journeyUnits: LearningUnit[] = [
  {
    id: 'J1',
    kind: 'journey',
    course: 'journey',
    title: '일본 도착일',
    subtitle: '입국부터 호텔 체크인까지',
    group: '통합 여행 미션',
    image: '/scenes/quick-practice/basics.webp',
    goal: '입국, 교통카드, 전철, 호텔 체크인을 하나의 흐름으로 진행한다.',
    requiredIds: ['S1', 'S2', 'S7', 'S10', 'S14'],
    reward: '도착일 여행 세트',
    blocks: FLOW_BLOCKS,
    journeyCheckpoints: [
      checkpoint('j1-cp1', '입국심사 통과', '공항 입국심사대', ['S7'], '체류 목적과 기간을 짧게 답한다.', '관광, 체류 기간, 숙소 정보를 순서대로 말할 수 있다.'),
      checkpoint('j1-cp2', '짐과 세관 확인', '수하물 벨트와 세관', ['S8'], '짐이 나오지 않거나 세관 질문을 받는 상황에 대응한다.', '신고 여부와 캐리어 설명을 일본어로 말할 수 있다.'),
      checkpoint('j1-cp3', '공항에서 이동 시작', '공항 철도/버스 안내소', ['S9', 'S10'], '교통카드나 승차권을 구매하고 목적지 방향을 확인한다.', '교통수단, 승차권, 목적지를 한 흐름으로 말할 수 있다.'),
      checkpoint('j1-cp4', '호텔 체크인', '호텔 프런트', ['S14'], '예약자 이름과 여권을 제시하고 체크인을 마친다.', '체크인 요청, 예약 확인, 여권 제시를 이어서 말할 수 있다.'),
    ],
  },
  {
    id: 'J2',
    kind: 'journey',
    course: 'journey',
    title: '관광과 식사',
    subtitle: '길 찾기, 입장권, 식당, 계산',
    group: '통합 여행 미션',
    image: '/scenes/quick-practice/vocab-food.webp',
    goal: '관광지에서 이동하고 식당에서 주문과 계산까지 완료한다.',
    requiredIds: ['S3', 'S18', 'S19', 'S22', 'S30'],
    reward: '관광 식사 세트',
    blocks: FLOW_BLOCKS,
    journeyCheckpoints: [
      checkpoint('j2-cp1', '관광지로 이동', '역 출구와 길거리', ['S3'], '목적지 방향과 도보 가능 여부를 묻는다.', '출구, 방향, 소요 시간을 확인할 수 있다.'),
      checkpoint('j2-cp2', '입장권 구매', '관광지 매표소', ['S30'], '입장권 수량과 촬영 가능 여부를 확인한다.', '입장권 구매와 금지 안내를 구분할 수 있다.'),
      checkpoint('j2-cp3', '식당 입장', '식당 입구', ['S18'], '인원수와 예약 여부를 말하고 대기 안내를 이해한다.', '인원, 예약 없음, 대기 시간을 자연스럽게 말할 수 있다.'),
      checkpoint('j2-cp4', '주문과 계산', '식당 테이블과 계산대', ['S19', 'S22'], '추천 메뉴를 묻고 주문한 뒤 결제를 요청한다.', '주문, 추가 요청, 결제 방식을 순서대로 처리할 수 있다.'),
    ],
  },
  {
    id: 'J3',
    kind: 'journey',
    course: 'journey',
    title: '지방도시 여행',
    subtitle: '신칸센, 버스, 료칸, 온천',
    group: '통합 여행 미션',
    image: '/scenes/quick-practice/vocab-transport.webp',
    goal: '장거리 이동과 일본식 숙박 상황을 이어서 해결한다.',
    requiredIds: ['S24', 'S25', 'S32', 'S39'],
    reward: '지방 여행 세트',
    blocks: FLOW_BLOCKS,
    journeyCheckpoints: [
      checkpoint('j3-cp1', '장거리 열차 탑승', '신칸센 매표소와 승강장', ['S24'], '지정석과 출발 시간을 확인한다.', '좌석 종류와 목적지, 열차 시간을 말할 수 있다.'),
      checkpoint('j3-cp2', '지방 교통 환승', '버스 정류장', ['S25', 'S39'], '버스 노선과 다음 배차 시간을 확인한다.', '정리권, 하차 위치, 배차 간격 안내를 이해할 수 있다.'),
      checkpoint('j3-cp3', '료칸 도착', '료칸 프런트', ['S32'], '식사 시간과 온천 이용 시간을 확인한다.', '저녁 시간, 유카타, 대욕장 이용 조건을 말할 수 있다.'),
      checkpoint('j3-cp4', '지역 식당 찾기', '소도시 거리', ['S39'], '근처 식당과 이동 가능 여부를 묻는다.', '주변 시설, 도보 가능 여부, 다음 버스를 확인할 수 있다.'),
    ],
  },
  {
    id: 'J4',
    kind: 'journey',
    course: 'journey',
    title: '문제 발생일',
    subtitle: '분실, 병원, 예약 변경, 교통 장애',
    group: '통합 여행 미션',
    image: '/scenes/quick-practice/retry-missed.webp',
    goal: '여행 중 예상치 못한 문제를 설명하고 도움을 요청한다.',
    requiredIds: ['S34', 'S35', 'S36', 'S37', 'S40'],
    reward: '문제 해결 세트',
    blocks: FLOW_BLOCKS,
    journeyCheckpoints: [
      checkpoint('j4-cp1', '예약 문제 복구', '호텔/체험 접수처', ['S34'], '예약 변경이나 취소 가능 여부를 확인한다.', '변경 요청, 취소 수수료, 대체 시간을 말할 수 있다.'),
      checkpoint('j4-cp2', '분실물 신고', '역 분실물 센터', ['S35'], '잃어버린 물건의 색과 특징을 설명한다.', '분실 장소, 물건 특징, 연락 방법을 말할 수 있다.'),
      checkpoint('j4-cp3', '몸 상태 설명', '약국 또는 병원', ['S36', 'S37'], '증상과 복용 방법을 묻고 응급 상황을 설명한다.', '증상, 약 복용 횟수, 도움 요청을 구분할 수 있다.'),
      checkpoint('j4-cp4', '교통 장애 대응', '역 안내 창구', ['S40'], '운행 중단과 대체 이동 방법을 확인한다.', '지연 이유, 대체 경로, 출발 가능 시간을 확인할 수 있다.'),
    ],
  },
  {
    id: 'J5',
    kind: 'journey',
    course: 'journey',
    title: '출국일',
    subtitle: '공항 이동, 체크인, 보안검색, 탑승',
    group: '통합 여행 미션',
    image: '/scenes/quick-practice/signs.webp',
    goal: '호텔에서 공항까지 이동하고 탑승까지 마친다.',
    requiredIds: ['S41', 'S42', 'S43'],
    reward: '출국 완료 세트',
    blocks: FLOW_BLOCKS,
    journeyCheckpoints: [
      checkpoint('j5-cp1', '호텔에서 나가기', '호텔 프런트', ['S17'], '체크아웃과 짐 보관 가능 여부를 확인한다.', '체크아웃, 영수증, 짐 보관을 이어서 말할 수 있다.'),
      checkpoint('j5-cp2', '공항 이동', '택시/공항버스 승강장', ['S41'], '공항 터미널과 출발 시간을 확인한다.', '국제선 터미널, 도로 혼잡, 출발 시간을 말할 수 있다.'),
      checkpoint('j5-cp3', '항공사 체크인', '항공사 카운터', ['S42'], '짐을 부치고 좌석 요청을 한다.', '수하물, 좌석, 탑승권 수령 안내를 이해할 수 있다.'),
      checkpoint('j5-cp4', '보안검색과 탑승', '보안검색대와 탑승구', ['S43'], '액체류 확인과 탑승구 안내를 이해한다.', '탑승구, 탑승 시작 시간, 보안 질문에 대응할 수 있다.'),
    ],
  },
];

export const allUnits = [...prepUnits, ...sceneUnits, ...journeyUnits];

export const starterUnits = allUnits.filter((unit) => unit.course === 'starter');

export const foundationUnits = allUnits.filter((unit) => unit.course === 'foundation');

export const practiceUnits = allUnits.filter((unit) => unit.course === 'practice');

export const integratedUnits = allUnits.filter((unit) => unit.course === 'journey');

export const quickPracticeTools = [
  { title: '히라가나', image: '/scenes/quick-practice/hiragana.webp', section: '문자' },
  { title: '가타카나', image: '/scenes/quick-practice/katakana.webp', section: '문자' },
  { title: '가나 쓰기', image: '/scenes/quick-practice/kana-write.webp', section: '문자 훈련' },
  { title: '가나 말하기', image: '/scenes/quick-practice/basics.webp', section: '발음 훈련' },
  { title: '발음 구분', image: '/scenes/quick-practice/pairs.webp', section: '듣기 기초' },
  { title: '받아쓰기', image: '/scenes/quick-practice/dictation.webp', section: '듣기 기초' },
  { title: '어휘', image: '/scenes/quick-practice/vocab.webp', section: '단어' },
  { title: '동사 형태', image: '/scenes/quick-practice/verbs.webp', section: '문장 만들기' },
  { title: '간판 읽기', image: '/scenes/quick-practice/signs.webp', section: '여행 표지' },
];
