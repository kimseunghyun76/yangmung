import type { GrammarPoint } from './types';

// 여행 팁 — 세션 끝에 1개씩 회전(안 본 것 우선). 문법·문화·발음·여행 매너 골고루.
export const grammar: GrammarPoint[] = [
  // ── 문법 ──
  { id: 'g_masuka', category: '문법', label: '〜ますか (정중 의문)', tipKo: '문장 끝 ますか는 정중한 질문. 한국어 "~합니까?"처럼 끝만 올리면 됩니다.', exampleJa: 'カードは使えますか', exampleKo: '카드 사용할 수 있나요?', commonMistake: '질문인데 끝 억양을 너무 낮추면 확인보다 단정처럼 들려요.', action: '마지막 か를 살짝 올려 한 번 말해 보세요.', n5Refs: ['n5_g_masu'] },
  { id: 'g_kudasai', category: '문법', label: '〜ください (주세요)', tipKo: '명사 + ください는 "~ 주세요". 동사 て형 + ください면 "~해 주세요"가 됩니다.', exampleJa: 'これを見せてください', exampleKo: '이것을 보여 주세요.', commonMistake: '동사 기본형 뒤에 바로 ください를 붙이지 않아요.', action: 'これください와 みせてください를 소리 내어 비교해 보세요.' },
  { id: 'g_wo', category: '문법', label: '조사 を (목적어)', tipKo: '"~을/를". みずをください(물을 주세요). 회화에선 자주 생략 — みず、ください만 해도 통합니다.' },
  { id: 'g_desu', category: '문법', label: '〜です (정중한 ~입니다)', tipKo: '명사·형용사 뒤 정중체. ひとりです(한 명입니다), だいじょうぶです(괜찮습니다). 끝에 です만 붙이면 공손해져요.' },
  { id: 'g_counting', category: '문법', label: '개수 ひとつ・ふたつ', tipKo: '물건 셀 때 ひとつ(하나)・ふたつ(둘)・みっつ(셋). これ、ひとつください처럼 그대로 쓰면 됩니다.' },
  { id: 'g_onegai', category: '문법', label: '〜おねがいします (부탁)', tipKo: '명사·부사 뒤에 붙이는 요청 만능 표현입니다.', exampleJa: 'ゆっくりお願いします', exampleKo: '천천히 부탁합니다.', commonMistake: '친절하지만 너무 작게 말하면 요청인지 알아듣기 어려워요.', action: '필요한 단어를 먼저 말하고 おねがいします로 마무리하세요.' },
  { id: 'g_kosoado', category: '문법', label: 'これ・それ・あれ', tipKo: '이거(これ, 내 가까이)·그거(それ, 상대 가까이)·저거(あれ, 둘 다 멀리). 가리키며 これください면 안전.' },
  { id: 'g_intonation', category: '문법', label: '억양만으로 질문', tipKo: 'か 없이 끝을 올리기만 해도 질문이 됩니다. これ?(이거요?) 처럼 — 회화에서 아주 흔해요.' },

  // ── 문화·매너 ──
  { id: 'g_no_tip', category: '문화', label: '팁 문화 없음', tipKo: '일본은 팁이 없어요. 거스름돈을 두고 나오면 오히려 점원이 쫓아옵니다. 계산한 만큼만 내면 됩니다.' },
  { id: 'g_bow', category: '문화', label: '가벼운 목례(おじぎ)', tipKo: '인사·감사·사과에 가볍게 고개를 숙이면 자연스러워요. 손님은 말 없이 목례만 해도 충분합니다.' },
  { id: 'g_quiet_train', category: '문화', label: '전철에선 통화 자제', tipKo: '전철·버스 안 통화는 민폐로 봐요. 진동으로 바꾸고 대화도 작게. 「マナーモード」(매너 모드).' },
  { id: 'g_queue', category: '문화', label: '줄서기·에스컬레이터', tipKo: '승강장 표시선에 줄 서고, 에스컬레이터에서는 걷지 않는 것이 현재 권장 원칙입니다.', commonMistake: '지역별 관행만 믿고 급하게 걷다가 충돌하기 쉬워요.', action: '바닥 표시와 현장 안내를 우선 확인하세요.' },
  { id: 'g_cash', category: '문화', label: '현금도 챙기기', tipKo: '카드·IC가 늘었지만 작은 가게·식권기는 현금만인 곳도. 동전·천엔권을 조금 준비하면 편해요.' },
  { id: 'g_shoes', category: '문화', label: '신발 벗는 곳', tipKo: '다다미방·일부 식당·숙소는 신발을 벗어요. 입구에 단차나 신발장이 있으면 벗으라는 신호.' },
  { id: 'g_itadakimasu', category: '문화', label: 'いただきます / ごちそうさま', tipKo: '먹기 전 いただきます, 다 먹고 ごちそうさま(でした). 식당 나설 때 한마디면 인상이 좋아져요.' },
  { id: 'g_oshibori', category: '문화', label: 'おしぼり(물수건)', tipKo: '식당에서 주는 물수건은 손을 닦는 용도예요. 얼굴·테이블을 닦는 건 매너가 아니에요.' },

  // ── 발음 ──
  { id: 'g_long_vowel', category: '발음', label: '장음(길게)', tipKo: '일본어는 모음 길이로 뜻이 달라질 수 있습니다.', exampleJa: 'ビル / ビール', exampleKo: '빌딩 / 맥주', commonMistake: '한국어처럼 길이를 줄이면 다른 단어로 들릴 수 있어요.', action: 'ビール의 イ 뒤를 한 박 더 유지해 보세요.' },
  { id: 'g_sokuon', category: '발음', label: '촉음 っ (짧게 멈춤)', tipKo: '작은 っ는 다음 자음 전에 한 박 멈추는 표시입니다.', exampleJa: 'きって', exampleKo: '우표', commonMistake: 'きて처럼 멈춤 없이 읽으면 "와서"로 들릴 수 있어요.', action: 'き・(멈춤)・て 세 박으로 말해 보세요.' },
  { id: 'g_r_sound', category: '발음', label: 'ら행 (r/l 중간)', tipKo: 'ら·り·る·れ·ろ는 한국어 ㄹ에 가깝게 살짝 튕기듯. 영어 R처럼 굴리지 않아요.' },
  { id: 'g_fu', category: '발음', label: 'ふ 발음', tipKo: 'ふ는 영어 f와 한국어 ㅎ의 중간 — 입술을 살짝 모으되 물지 않고 바람을 내요. "후"에 가깝게.' },

  // ── 여행 실전 ──
  { id: 'g_konbini', category: '여행', label: '편의점 만능', tipKo: '편의점에서 ATM 출금·택배(택큐빈)·티켓·복사·공과금까지 돼요. 막히면 일단 편의점.' },
  { id: 'g_menzei', category: '여행', label: '면세는 여권 필수', tipKo: '면세(免税)는 여권이 있어야 해요. 보통 한 점포 5,000엔 이상. 개봉 금지 봉투로 포장해 줍니다.' },
  { id: 'g_ic_card', category: '여행', label: 'IC카드(Suica) 한 장', tipKo: '전철·버스·편의점·자판기까지 탭 한 번. 충전은 「チャージ」. 모바일 Suica도 편해요.' },
  { id: 'g_translate', category: '여행', label: '막히면 번역앱 카메라', tipKo: '메뉴·간판이 안 읽히면 번역앱 카메라로 비추면 돼요. 그래도 인사·숫자는 입으로 해보는 게 빨라요.' },
  { id: 'g_toilet', category: '여행', label: '화장실은 깨끗하고 많아요', tipKo: '편의점·역·백화점 화장실이 깨끗해요. 비데 버튼은 おしり(엉덩이)·とめる(정지). 급하면 トイレはどこですか.' },

  // ── 회화 학습법 ──
  { id: 'g_conversation_shadowing', category: '회화법', label: '듣고 바로 따라 말하기', tipKo: '회화는 눈으로 아는 문장을 입으로 꺼내는 훈련이 핵심입니다. 원음을 듣고 1초 안에 같은 속도로 따라 말하세요.', action: '세션의 듣기 버튼을 누른 뒤 화면을 보지 않고 한 번 더 따라 말해 보세요.' },
  { id: 'g_conversation_chunk', category: '회화법', label: '단어보다 덩어리로 외우기', tipKo: '실전에서는 문법을 조립할 시간이 없습니다. 「〜お願いします」「〜ありますか」처럼 바로 붙여 쓰는 덩어리로 저장하세요.', exampleJa: 'Mサイズはありますか', exampleKo: 'M 사이즈 있나요?', action: '명사만 바꿔 같은 틀로 세 번 말해 보세요.' },
  { id: 'g_conversation_roleplay', category: '회화법', label: '혼잣말보다 역할극', tipKo: '혼자 문장을 읽는 것보다 상대 질문을 듣고 바로 답하는 연습이 회화에 더 가깝습니다.', commonMistake: '내가 말할 문장만 외우면 실제 질문을 못 알아듣고 멈추기 쉬워요.', action: '대화 다시보기에서 상대 일본어 질문까지 소리 내어 읽어 보세요.' },
  { id: 'g_conversation_recovery', category: '회화법', label: '막히면 복구문부터', tipKo: '잘하는 사람도 못 알아듣는 순간이 있습니다. 중요한 건 멈추지 않고 다시 말하기·천천히·쉬운 일본어로 우회하는 것입니다.', exampleJa: 'ゆっくりお願いします', exampleKo: '천천히 부탁합니다.', action: '오답이 나와도 복구 선택지를 한 번 눌러 입으로 다시 말하세요.' },
  { id: 'g_conversation_my_case', category: '회화법', label: '내 여행 상황으로 바꾸기', tipKo: '회화 실력은 내 상황을 말할 때 늘어납니다. 앱 문장을 그대로 끝내지 말고 내 호텔·역·가게 이름으로 바꿔 보세요.', action: '오늘 실제로 갈 장소 하나를 넣어 「〜までお願いします」를 만들어 보세요.' },

  // ── 확장 장면 실전 팁 ──
  { id: 'g_cafe', category: '장면', label: '카페 주문은 크기부터', tipKo: '체인 카페에서는 음료 뒤에 크기와 뜨거움·차가움을 연달아 물을 수 있어요.', exampleJa: 'これを一つお願いします', exampleKo: '이거 하나 부탁합니다.', action: '못 들으면 질문마다 はい 또는 ゆっくりお願いします로 끊어 답하세요.' },
  { id: 'g_bakery', category: '장면', label: '빵집은 트레이와 집게', tipKo: '대부분 직접 담은 뒤 계산대로 가져갑니다.', exampleJa: 'これとこれをお願いします', exampleKo: '이거와 이거 부탁합니다.', action: '빵 이름을 몰라도 가리키며 개수를 말하면 충분해요.' },
  { id: 'g_izakaya', category: '장면', label: '이자카야의 お通し', tipKo: '주문하지 않은 작은 안주가 나오고 자리 요금처럼 계산되는 가게가 있어요.', commonMistake: '무료 서비스라고 생각하기 쉬워요.', action: '궁금하면 これは何ですか라고 물어보세요.' },
  { id: 'g_sushi', category: '장면', label: '스시 알레르기는 먼저', tipKo: '알레르기나 못 먹는 재료는 주문 전에 먼저 알리는 것이 안전합니다.', exampleJa: 'アレルギーがあります', exampleKo: '알레르기가 있습니다.', action: '재료 사진이나 번역 화면도 함께 보여주세요.' },
  { id: 'g_tourist_info', category: '장면', label: '관광안내소를 활용하기', tipKo: '지도·행사·교통 정보를 한 번에 얻기 좋은 장소입니다.', exampleJa: 'ここはどこですか', exampleKo: '여기는 어디예요?', action: '가고 싶은 장소 화면을 보여주며 길을 물어보세요.' },
  { id: 'g_shrine', category: '장면', label: '촬영 금지 표시 확인', tipKo: '신사·절 내부 일부 공간은 촬영이 금지될 수 있습니다.', exampleJa: '写真を撮ってもいいですか', exampleKo: '사진 찍어도 되나요?', action: '撮影禁止 표지가 보이면 카메라를 넣으세요.' },
  { id: 'g_onsen', category: '장면', label: '온천은 씻고 들어가기', tipKo: '탕에 들어가기 전에 몸을 씻고, 수건은 탕 안에 넣지 않습니다.', action: '시설별 문신·수영복 규칙은 입구 안내를 확인하세요.' },
  { id: 'g_ryokan', category: '장면', label: '료칸 식사 시간 확인', tipKo: '석식·조식 시간이 정해진 숙소가 많아 체크인 때 확인해야 합니다.', exampleJa: '朝食は何時ですか', exampleKo: '조식은 몇 시예요?', action: '도착이 늦으면 미리 숙소에 연락하세요.' },
  { id: 'g_bus', category: '장면', label: '버스 승하차 방식 확인', tipKo: '지역에 따라 앞문·뒷문 승차와 선불·후불 방식이 다릅니다.', action: '앞사람의 행동과 교통카드 단말 위치를 먼저 보세요.' },
  { id: 'g_shinkansen', category: '장면', label: '신칸센 표는 두 장일 수 있어요', tipKo: '승차권과 특급권이 따로 나오는 경우가 있습니다.', commonMistake: '개찰구에서 표 한 장을 빼먹기 쉬워요.', action: '개찰구에서 나온 표를 모두 다시 챙기세요.' },
  { id: 'g_rental', category: '장면', label: '렌터카 반납 전 주유', tipKo: '대부분 가득 주유해 반납하고 영수증을 확인받습니다.', action: '내비게이션 언어와 보험 범위를 출발 전에 확인하세요.' },
  { id: 'g_hospital', category: '장면', label: '병원에서는 증상을 짧게', tipKo: '아픈 위치·언제부터·알레르기 순서로 보여주면 전달이 빨라집니다.', exampleJa: 'お腹が痛いです', exampleKo: '배가 아파요.', action: '여권과 여행자 보험 정보를 준비하세요.' },
  { id: 'g_police', category: '장면', label: '분실물은 交番으로', tipKo: '작은 파출소인 交番에서 길 안내와 분실 신고 도움을 받을 수 있습니다.', exampleJa: '助けてください', exampleKo: '도와주세요.', action: '분실 장소와 시간을 지도에 표시해 보여주세요.' },
  { id: 'g_emergency', category: '장면', label: '긴급전화 110·119', tipKo: '경찰은 110, 구급·소방은 119입니다.', commonMistake: '긴급하지 않은 문의에 사용하면 대응을 방해합니다.', action: '위치와 상태를 먼저 말하고 통역을 요청하세요.' },
  { id: 'g_sim', category: '장면', label: '유심은 호환성 확인', tipKo: '구매 전에 휴대폰 잠금 해제 여부와 지원 주파수를 확인해야 합니다.', action: '개통 확인 후 매장을 나가세요.' },
  { id: 'g_laundry', category: '장면', label: '세제 자동 투입 확인', tipKo: '코인세탁기는 세제가 자동 투입되는 기계가 많습니다.', commonMistake: '세제를 중복으로 넣으면 거품이 과해질 수 있어요.', action: '洗剤自動投入 표시를 먼저 찾으세요.' },
  { id: 'g_festival', category: '장면', label: '축제는 현금이 편해요', tipKo: '노점은 현금만 받는 곳이 많고 쓰레기통이 적을 수 있습니다.', action: '동전과 작은 봉투를 준비하면 편해요.' },
];
