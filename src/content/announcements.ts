// 공공 방송 메시지 — 일본에서 전철·역·공항·버스·엘리베이터·매장에서 늘 듣게 되는 안내 방송.
// 모두 기능적·관용적 표현(저작물 아님)을 원작 학습용으로 정리. 듣고 익히는 데 초점.
// kana = TTS·읽기용 순수 가나(일본어 문장부호 허용), ja = 화면 표기(한자+가나).

export type AnnouncementCategory = 'train' | 'station' | 'airport' | 'bus' | 'elevator' | 'store';

export interface Announcement {
  id: string;
  category: AnnouncementCategory;
  ja: string;       // 표기 (한자+가나)
  kana: string;     // 읽기/TTS (순수 가나)
  korean: string;   // 뜻
  context: string;  // 언제 들리는지
  tip?: string;     // 짧은 학습 팁
}

export const ANNOUNCEMENT_CATEGORIES: { id: AnnouncementCategory; label: string; icon: string; sub: string }[] = [
  { id: 'train', label: '전철·지하철', icon: '🚃', sub: '도착·문·다음 역 안내' },
  { id: 'station', label: '역', icon: '🚉', sub: '승강장·표·우선석 안내' },
  { id: 'airport', label: '공항·비행기', icon: '✈️', sub: '탑승·안전·착륙 안내' },
  { id: 'bus', label: '버스', icon: '🚌', sub: '정차·하차·요금 안내' },
  { id: 'elevator', label: '엘리베이터', icon: '🛗', sub: '방향·층·문 안내' },
  { id: 'store', label: '백화점·매장', icon: '🏬', sub: '환영·폐점·안내 방송' },
];

export const ANNOUNCEMENTS: Announcement[] = [
  // ── 전철·지하철 ──
  { id: 'a_train_arrive', category: 'train', ja: 'まもなく、電車がまいります。', kana: 'まもなく、でんしゃがまいります。', korean: '곧 전철이 들어옵니다.', context: '승강장에서 열차 도착 직전', tip: 'まいります는 来ます의 겸양·정중한 방송체.' },
  { id: 'a_train_line', category: 'train', ja: '黄色い線の内側まで お下がりください。', kana: 'きいろいせんのうちがわまで おさがりください。', korean: '노란 선 안쪽으로 물러나 주세요.', context: '열차 진입 시 안전 안내', tip: 'お下がりください = 「물러나 주세요」.' },
  { id: 'a_train_next', category: 'train', ja: '次は、東京、東京です。', kana: 'つぎは、とうきょう、とうきょうです。', korean: '다음은 도쿄, 도쿄입니다.', context: '다음 정차역 안내', tip: '역 이름은 보통 두 번 반복해요.' },
  { id: 'a_train_door', category: 'train', ja: 'ドアが閉まります。ご注意ください。', kana: 'どあがしまります。ごちゅういください。', korean: '문이 닫힙니다. 주의해 주세요.', context: '출발 직전 문 닫힘', tip: '閉まります(しまります) = 닫힙니다.' },
  { id: 'a_train_exit', category: 'train', ja: 'お出口は、左側です。', kana: 'おでぐちは、ひだりがわです。', korean: '내리는 곳은 왼쪽입니다.', context: '하차 문 방향 안내', tip: '右側(みぎがわ)=오른쪽 / 左側(ひだりがわ)=왼쪽.' },
  { id: 'a_train_transfer', category: 'train', ja: 'お乗り換えのお客様は、こちらです。', kana: 'おのりかえのおきゃくさまは、こちらです。', korean: '환승하실 손님은 이쪽입니다.', context: '환승역 안내', tip: '乗り換え(のりかえ) = 환승.' },
  { id: 'a_train_delay', category: 'train', ja: 'ただいま、人身事故の影響で、電車が遅れております。', kana: 'ただいま、じんしんじこのえいきょうで、でんしゃがおくれております。', korean: '현재 인명 사고의 영향으로 열차가 지연되고 있습니다.', context: '열차 지연 안내', tip: '遅れております(おくれております) = 지연되고 있습니다. 이유는 人身事故·車両点検(차량 점검) 등으로 자주 바뀌어요.' },
  { id: 'a_train_suspend', category: 'train', ja: 'この電車は、当駅で運転を見合わせます。', kana: 'このでんしゃは、とうえきでうんてんをみあわせます。', korean: '이 열차는 이번 역에서 운행을 중단합니다.', context: '운행 중단 안내', tip: '運転見合わせ(うんてんみあわせ) = 운행 중단·잠정 정지.' },

  // ── 역 ──
  { id: 'a_sta_ticket', category: 'station', ja: '切符を お持ちください。', kana: 'きっぷを おもちください。', korean: '표를 소지해 주세요.', context: '개찰·승차 안내', tip: '切符(きっぷ) = 표.' },
  { id: 'a_sta_local', category: 'station', ja: 'この電車は、各駅停車です。', kana: 'このでんしゃは、かくえきていしゃです。', korean: '이 전철은 각 역 정차입니다.', context: '열차 종류 안내', tip: '各駅停車(かくえきていしゃ) = 모든 역에 정차.' },
  { id: 'a_sta_priority', category: 'station', ja: '優先席付近では、携帯電話の電源を お切りください。', kana: 'ゆうせんせきふきんでは、けいたいでんわのでんげんを おきりください。', korean: '우선석 부근에서는 휴대전화 전원을 꺼 주세요.', context: '우선석 매너 안내', tip: '電源を切る(でんげんをきる) = 전원을 끄다.' },
  { id: 'a_sta_gap', category: 'station', ja: '足元に ご注意ください。', kana: 'あしもとに ごちゅういください。', korean: '발밑을 조심해 주세요.', context: '승강장 틈·계단 주의', tip: '足元(あしもと) = 발밑.' },
  { id: 'a_sta_earthquake', category: 'station', ja: 'ただいま、地震がありました。係員の指示に従ってください。', kana: 'ただいま、じしんがありました。かかりいんのしじにしたがってください。', korean: '방금 지진이 있었습니다. 직원의 지시에 따라 주세요.', context: '지진 발생 직후 역 구내 방송', tip: '指示に従う(しじにしたがう) = 지시를 따르다. 당황하지 말고 방송과 직원 안내를 먼저 들으세요.' },

  // ── 공항·비행기 ──
  { id: 'a_air_boarding', category: 'airport', ja: 'ただいまより、搭乗を開始いたします。', kana: 'ただいまより、とうじょうをかいしいたします。', korean: '지금부터 탑승을 시작하겠습니다.', context: '탑승 게이트', tip: '搭乗(とうじょう) = 탑승.' },
  { id: 'a_air_belt', category: 'airport', ja: 'シートベルトを お締めください。', kana: 'しーとべるとを おしめください。', korean: '안전벨트를 매 주세요.', context: '이착륙 전 기내', tip: '締める(しめる) = 매다·조이다.' },
  { id: 'a_air_landing', category: 'airport', ja: 'まもなく、着陸いたします。', kana: 'まもなく、ちゃくりくいたします。', korean: '곧 착륙하겠습니다.', context: '착륙 직전 기내', tip: '着陸(ちゃくりく) = 착륙.' },
  { id: 'a_air_restroom', category: 'airport', ja: 'お手洗いは、ご利用いただけません。', kana: 'おてあらいは、ごりよういただけません。', korean: '화장실은 이용하실 수 없습니다.', context: '이착륙 시 안내', tip: 'お手洗い(おてあらい) = 화장실.' },
  { id: 'a_air_final', category: 'airport', ja: '最終のご案内です。', kana: 'さいしゅうのごあんないです。', korean: '마지막 안내입니다.', context: '탑승 마감 방송', tip: '最終(さいしゅう) = 최종·마지막.' },

  // ── 버스 ──
  { id: 'a_bus_stop', category: 'bus', ja: '次、止まります。', kana: 'つぎ、とまります。', korean: '다음 정류장에 섭니다.', context: '하차 벨이 눌렸을 때', tip: '止まります(とまります) = 멈춥니다.' },
  { id: 'a_bus_button', category: 'bus', ja: 'お降りの方は、ボタンを押してください。', kana: 'おおりのかたは、ぼたんをおしてください。', korean: '내리실 분은 버튼을 눌러 주세요.', context: '하차 안내', tip: '降りる(おりる) = 내리다.' },
  { id: 'a_bus_change', category: 'bus', ja: '両替は、停車中に お願いします。', kana: 'りょうがえは、ていしゃちゅうに おねがいします。', korean: '환전(잔돈 교환)은 정차 중에 부탁드립니다.', context: '요금함 안내', tip: '両替(りょうがえ) = 잔돈 교환.' },
  { id: 'a_bus_caution', category: 'bus', ja: 'バスが停まるまで、お待ちください。', kana: 'ばすがとまるまで、おまちください。', korean: '버스가 멈출 때까지 기다려 주세요.', context: '주행 중 이동 자제', tip: '〜まで = 〜까지.' },

  // ── 엘리베이터 ──
  { id: 'a_elv_up', category: 'elevator', ja: '上へ まいります。', kana: 'うえへ まいります。', korean: '위로 올라갑니다.', context: '엘리베이터 출발', tip: '上(うえ)=위 / 下(した)=아래.' },
  { id: 'a_elv_down', category: 'elevator', ja: '下へ まいります。', kana: 'したへ まいります。', korean: '아래로 내려갑니다.', context: '엘리베이터 출발', tip: 'まいります = 정중한 「갑니다」.' },
  { id: 'a_elv_door', category: 'elevator', ja: 'ドアが 閉まります。', kana: 'どあが しまります。', korean: '문이 닫힙니다.', context: '문 닫힘 직전', tip: '開きます(ひらきます)=열립니다.' },
  { id: 'a_elv_floor', category: 'elevator', ja: '5階です。', kana: 'ごかいです。', korean: '5층입니다.', context: '도착 층 안내', tip: '〜階(かい/がい) = 〜층.' },

  // ── 백화점·매장 ──
  { id: 'a_store_welcome', category: 'store', ja: '本日は ご来店いただき、ありがとうございます。', kana: 'ほんじつは ごらいてんいただき、ありがとうございます。', korean: '오늘 방문해 주셔서 감사합니다.', context: '개점·환영 방송', tip: '本日(ほんじつ) = 오늘(정중).' },
  { id: 'a_store_close', category: 'store', ja: 'まもなく、閉店のお時間です。', kana: 'まもなく、へいてんのおじかんです。', korean: '곧 폐점 시간입니다.', context: '폐점 안내 방송', tip: '閉店(へいてん)=폐점 / 開店(かいてん)=개점.' },
  { id: 'a_store_lost', category: 'store', ja: '迷子の お知らせを いたします。', kana: 'まいごの おしらせを いたします。', korean: '미아 안내를 드립니다.', context: '미아 안내 방송', tip: '迷子(まいご) = 미아.' },
];
