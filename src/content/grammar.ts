import type { GrammarPoint } from './types';

// 여행 팁 — 세션 끝에 1개씩 회전(안 본 것 우선). 문법·문화·발음·여행 매너 골고루.
export const grammar: GrammarPoint[] = [
  // ── 문법 ──
  { id: 'g_masuka', category: '문법', label: '〜ますか (정중 의문)', tipKo: '문장 끝 ますか는 정중한 질문. 한국어 "~합니까?"처럼 끝만 올리면 됩니다.', exampleJa: 'カードは使えますか', exampleKo: '카드 사용할 수 있나요?', commonMistake: '질문인데 끝 억양을 너무 낮추면 확인보다 단정처럼 들려요.', action: '마지막 か를 살짝 올려 한 번 말해 보세요.', n5Refs: ['n5_g_masu'] },
  { id: 'g_kudasai', category: '문법', label: '〜ください (주세요)', tipKo: '명사 + ください는 "~ 주세요". 동사 て형 + ください면 "~해 주세요"가 됩니다.', exampleJa: 'これを見せてください', exampleKo: '이것을 보여 주세요.', commonMistake: '동사 기본형 뒤에 바로 ください를 붙이지 않아요.', action: 'これください와 みせてください를 소리 내어 비교해 보세요.' },
  { id: 'g_wo', category: '문법', label: '조사 を (목적어)', tipKo: '"~을/를". みずをください(물을 주세요). 회화에선 자주 생략 — みず、ください만 해도 통합니다.', exampleJa: 'みずをください', exampleKo: '물을 주세요.', commonMistake: 'を를 「お」로 발음해요 — 단, 회화에서는 생략하거나 약하게 말해도 자연스러워요.', action: 'みずをください와 みず、ください를 둘 다 소리 내어 비교해 보세요.' },
  { id: 'g_desu', category: '문법', label: '〜です (정중한 ~입니다)', tipKo: '명사·형용사 뒤 정중체. ひとりです(한 명입니다), だいじょうぶです(괜찮습니다). 끝에 です만 붙이면 공손해져요.', exampleJa: 'ひとりです', exampleKo: '혼자입니다.', commonMistake: '정중한 자리에서 です를 빠뜨리면 반말처럼 들릴 수 있어요.', action: '인원수나 상황을 말하고 뒤에 です를 붙이는 연습을 해 보세요.' },
  { id: 'g_counting', category: '문법', label: '개수 ひとつ・ふたつ', tipKo: '물건 셀 때 ひとつ(하나)・ふたつ(둘)・みっつ(셋). これ、ひとつください처럼 그대로 쓰면 됩니다.', exampleJa: 'これをひとつください', exampleKo: '이거 하나 주세요.', action: 'ひとつ·ふたつ·みっつ를 손가락과 함께 세면서 말해 보세요.' },
  { id: 'g_onegai', category: '문법', label: '〜おねがいします (부탁)', tipKo: '명사·부사 뒤에 붙이는 요청 만능 표현입니다.', exampleJa: 'ゆっくりお願いします', exampleKo: '천천히 부탁합니다.', commonMistake: '친절하지만 너무 작게 말하면 요청인지 알아듣기 어려워요.', action: '필요한 단어를 먼저 말하고 おねがいします로 마무리하세요.' },
  { id: 'g_kosoado', category: '문법', label: 'これ・それ・あれ', tipKo: '이거(これ, 내 가까이)·그거(それ, 상대 가까이)·저거(あれ, 둘 다 멀리). 가리키며 これください면 안전.', exampleJa: 'それをください', exampleKo: '그거 주세요.', action: 'これ·それ·あれ를 가리키면서 순서대로 말해 보세요.' },
  { id: 'g_intonation', category: '문법', label: '억양만으로 질문', tipKo: 'か 없이 끝을 올리기만 해도 질문이 됩니다. これ?(이거요?) 처럼 — 회화에서 아주 흔해요.', exampleJa: 'これ、いくらですか', exampleKo: '이거 얼마예요?', action: '문장 끝 억양을 올리며 これ？를 짧게 말해 보세요.' },

  // ── 문화·매너 ──
  { id: 'g_no_tip', category: '문화', label: '팁 문화 없음', tipKo: '일본은 팁이 없어요. 거스름돈을 두고 나오면 오히려 점원이 쫓아옵니다. 계산한 만큼만 내면 됩니다.', commonMistake: '거스름돈을 테이블에 남겨 두면 직원이 쫓아와 돌려줍니다.', action: '계산 후 거스름돈을 꼭 챙기고 ありがとうございました 한마디를 남기세요.' },
  { id: 'g_bow', category: '문화', label: '가벼운 목례(おじぎ)', tipKo: '인사·감사·사과에 가볍게 고개를 숙이면 자연스러워요. 손님은 말 없이 목례만 해도 충분합니다.', exampleJa: 'ありがとうございます', exampleKo: '감사합니다.', action: 'ありがとうございます를 말하면서 15도 정도 가볍게 고개를 숙여 보세요.' },
  { id: 'g_quiet_train', category: '문화', label: '전철에선 통화 자제', tipKo: '전철·버스 안 통화는 민폐로 봐요. 진동으로 바꾸고 대화도 작게. 「マナーモード」(매너 모드).', commonMistake: '이어폰 없이 영상 소리를 틀면 민폐로 봐요 — 반드시 이어폰을 사용하세요.', action: '탑승 전 스마트폰을 진동(マナーモード)으로 전환하는 습관을 들이세요.' },
  { id: 'g_queue', category: '문화', label: '줄서기·에스컬레이터', tipKo: '승강장 표시선에 줄 서고, 에스컬레이터에서는 걷지 않는 것이 현재 권장 원칙입니다.', commonMistake: '지역별 관행만 믿고 급하게 걷다가 충돌하기 쉬워요.', action: '바닥 표시와 현장 안내를 우선 확인하세요.' },
  { id: 'g_cash', category: '문화', label: '현금도 챙기기', tipKo: '카드·IC가 늘었지만 작은 가게·식권기는 현금만인 곳도. 동전·천엔권을 조금 준비하면 편해요.', exampleJa: 'ATMはどこですか', exampleKo: 'ATM은 어디에 있나요?', action: '편의점 ATM에서 소액 인출하면 수수료가 낮을 수 있어요.' },
  { id: 'g_shoes', category: '문화', label: '신발 벗는 곳', tipKo: '다다미방·일부 식당·숙소는 신발을 벗어요. 입구에 단차나 신발장이 있으면 벗으라는 신호.', exampleJa: '靴を脱ぎますか', exampleKo: '신발을 벗어야 하나요?', action: '입구에 단차나 신발장이 보이면 신발을 벗고 뒤꿈치를 문 쪽으로 가지런히 놓으세요.' },
  { id: 'g_itadakimasu', category: '문화', label: 'いただきます / ごちそうさま', tipKo: '먹기 전 いただきます, 다 먹고 ごちそうさま(でした). 식당 나설 때 한마디면 인상이 좋아져요.', exampleJa: 'ごちそうさまでした', exampleKo: '잘 먹었습니다.', action: '식사 전후 소리 내어 いただきます / ごちそうさまでした를 말해 보세요.' },
  { id: 'g_oshibori', category: '문화', label: 'おしぼり(물수건)', tipKo: '식당에서 주는 물수건은 손을 닦는 용도예요. 얼굴·테이블을 닦는 건 매너가 아니에요.', commonMistake: '얼굴이나 테이블을 닦으면 실례로 볼 수 있어요.', action: '오시보리는 손만 닦은 뒤 접어서 받침 위에 올려두세요.' },

  // ── 발음 ──
  { id: 'g_long_vowel', category: '발음', label: '장음(길게)', tipKo: '일본어는 모음 길이로 뜻이 달라질 수 있습니다.', exampleJa: 'ビル / ビール', exampleKo: '빌딩 / 맥주', commonMistake: '한국어처럼 길이를 줄이면 다른 단어로 들릴 수 있어요.', action: 'ビール의 イ 뒤를 한 박 더 유지해 보세요.' },
  { id: 'g_sokuon', category: '발음', label: '촉음 っ (짧게 멈춤)', tipKo: '작은 っ는 다음 자음 전에 한 박 멈추는 표시입니다.', exampleJa: 'きって', exampleKo: '우표', commonMistake: 'きて처럼 멈춤 없이 읽으면 "와서"로 들릴 수 있어요.', action: 'き・(멈춤)・て 세 박으로 말해 보세요.' },
  { id: 'g_r_sound', category: '발음', label: 'ら행 (r/l 중간)', tipKo: 'ら·り·る·れ·ろ는 한국어 ㄹ에 가깝게 살짝 튕기듯. 영어 R처럼 굴리지 않아요.', exampleJa: 'ありがとうございます', exampleKo: '감사합니다.', commonMistake: '영어 R처럼 혀를 굴리면 원어민에게 어색하게 들려요.', action: 'ありがとう를 세 번 말하면서 り 소리를 혀끝으로 한 번만 가볍게 튕겨 보세요.' },
  { id: 'g_fu', category: '발음', label: 'ふ 발음', tipKo: 'ふ는 영어 f와 한국어 ㅎ의 중간 — 입술을 살짝 모으되 물지 않고 바람을 내요. "후"에 가깝게.', exampleJa: 'ふたつ', exampleKo: '둘 (개수)', commonMistake: '영어 f처럼 아랫입술을 윗니에 대면 일본어 발음과 달라져요.', action: 'ふたつ를 소리 내어 말하며 입술이 이에 닿지 않는지 거울로 확인해 보세요.' },

  // ── 여행 실전 ──
  { id: 'g_konbini', category: '여행', label: '편의점 만능', tipKo: '편의점에서 ATM 출금·택배(택큐빈)·티켓·복사·공과금까지 돼요. 막히면 일단 편의점.', exampleJa: 'コピー機はありますか', exampleKo: '복사기가 있나요?', action: '편의점에서 ATM·택배·티켓 발권·복사·스캔·공과금 납부까지 할 수 있어요.' },
  { id: 'g_menzei', category: '여행', label: '면세는 여권 필수', tipKo: '면세(免税)는 여권이 있어야 해요. 보통 한 점포 5,000엔 이상. 개봉 금지 봉투로 포장해 줍니다.', exampleJa: '免税できますか', exampleKo: '면세 되나요?', action: '계산대에서 여권을 바로 꺼낼 수 있게 미리 손에 들고 계세요.' },
  { id: 'g_ic_card', category: '여행', label: 'IC카드(Suica) 한 장', tipKo: '전철·버스·편의점·자판기까지 탭 한 번. 충전은 「チャージ」. 모바일 Suica도 편해요.', exampleJa: 'チャージしてください', exampleKo: '충전해 주세요.', action: '역 자동발매기에서 「チャージ」 버튼을 찾아 원하는 금액으로 충전하세요.' },
  { id: 'g_translate', category: '여행', label: '막히면 번역앱 카메라', tipKo: '메뉴·간판이 안 읽히면 번역앱 카메라로 비추면 돼요. 그래도 인사·숫자는 입으로 해보는 게 빨라요.', exampleJa: 'これは何ですか', exampleKo: '이게 뭔가요?', action: '번역앱 카메라로 메뉴를 비추고, 먹고 싶은 걸 가리키며 これをください라고 말해 보세요.' },
  { id: 'g_toilet', category: '여행', label: '화장실은 깨끗하고 많아요', tipKo: '편의점·역·백화점 화장실이 깨끗해요. 비데 버튼은 おしり(엉덩이)·とめる(정지). 급하면 トイレはどこですか.', exampleJa: 'トイレはどこですか', exampleKo: '화장실은 어디에 있나요?', action: '비데 패널에서 おしり(세정)·止める(정지) 버튼 위치를 먼저 확인하세요.' },

  // ── 회화 학습법 ──
  { id: 'g_conversation_shadowing', category: '회화법', label: '듣고 바로 따라 말하기', tipKo: '회화는 눈으로 아는 문장을 입으로 꺼내는 훈련이 핵심입니다. 원음을 듣고 1초 안에 같은 속도로 따라 말하세요.', action: '세션의 듣기 버튼을 누른 뒤 화면을 보지 않고 한 번 더 따라 말해 보세요.' },
  { id: 'g_conversation_chunk', category: '회화법', label: '단어보다 덩어리로 외우기', tipKo: '실전에서는 문법을 조립할 시간이 없습니다. 「〜お願いします」「〜ありますか」처럼 바로 붙여 쓰는 덩어리로 저장하세요.', exampleJa: 'Mサイズはありますか', exampleKo: 'M 사이즈 있나요?', action: '명사만 바꿔 같은 틀로 세 번 말해 보세요.' },
  { id: 'g_conversation_roleplay', category: '회화법', label: '혼잣말보다 역할극', tipKo: '혼자 문장을 읽는 것보다 상대 질문을 듣고 바로 답하는 연습이 회화에 더 가깝습니다.', commonMistake: '내가 말할 문장만 외우면 실제 질문을 못 알아듣고 멈추기 쉬워요.', action: '대화 다시보기에서 상대 일본어 질문까지 소리 내어 읽어 보세요.' },
  { id: 'g_conversation_recovery', category: '회화법', label: '막히면 복구문부터', tipKo: '잘하는 사람도 못 알아듣는 순간이 있습니다. 중요한 건 멈추지 않고 다시 말하기·천천히·쉬운 일본어로 우회하는 것입니다.', exampleJa: 'ゆっくりお願いします', exampleKo: '천천히 부탁합니다.', action: '문제 하단의 복구 액션을 눌러 표현을 확인하고 입으로 다시 말하세요.' },
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
  { id: 'g_kaiten_sushi_panel', category: '장면', label: '회전초밥은 패널부터', tipKo: '회전초밥집은 터치패널 주문, 접시 색상별 가격, 마지막 계산 버튼을 차례로 확인하면 덜 당황합니다.', exampleJa: '使い方を教えてください', exampleKo: '사용법을 알려 주세요.', action: '입장하면 먼저 언어 설정과 계산 버튼 위치를 봐 두세요.' },
  { id: 'g_fitting_room', category: '장면', label: '피팅룸은 한마디 먼저', tipKo: '일본 옷가게는 피팅룸 전용 안내가 있을 수 있어요. 입어보기 전 試着してもいいですか 한마디가 안전합니다.', exampleJa: '試着してもいいですか', exampleKo: '입어 봐도 돼요?', action: '직원에게 사이즈와 색상을 함께 물어보세요.' },
  { id: 'g_hotel_umbrella', category: '장면', label: '호텔 우산은 프런트에', tipKo: '비 오는 날 호텔 프런트에서 우산을 빌릴 수 있는 경우가 많습니다. 반납 위치와 시간만 확인하면 됩니다.', exampleJa: '傘を借りられますか', exampleKo: '우산을 빌릴 수 있나요?', action: '외출 전 프런트에서 傘ありますか라고 물어보세요.' },
  { id: 'g_room_change', category: '장면', label: '객실 변경은 이유를 짧게', tipKo: '냄새·소음·침대 타입 문제는 길게 설명하지 말고 이유와 원하는 방을 짧게 말하면 처리하기 쉽습니다.', exampleJa: '部屋を変えられますか', exampleKo: '방을 바꿀 수 있나요?', action: '담배 냄새, 큰 방, 트윈 침대처럼 핵심 단어를 먼저 말하세요.' },
  { id: 'g_narita_ticket', category: '장면', label: '공항역 표 교환은 창구로', tipKo: '오픈 티켓이나 교환권은 자동발매기보다 창구에서 날짜·시간·좌석을 함께 확인하는 편이 안전합니다.', exampleJa: 'このチケットを使いたいです', exampleKo: '이 티켓을 사용하고 싶어요.', action: '목적지와 원하는 출발 시간을 화면에 보여주세요.' },
  { id: 'g_baggage_weight', category: '장면', label: '수하물 초과는 무게부터', tipKo: '공항에서 무게 초과가 나오면 추가요금, 짐 재정리, 기내 반입 가능 여부를 순서대로 확인하세요.', exampleJa: '荷物を出してもいいですか', exampleKo: '짐을 꺼내도 되나요?', action: '카운터 옆에서 정리해도 되는지 먼저 물어보세요.' },
  { id: 'g_buffet_refill', category: '장면', label: '뷔페 리필 요청은 구체적으로', tipKo: '조식 뷔페에서 음식이 떨어졌을 때는 음식 이름이나 손짓으로 가리키며 ありますか라고 물으면 자연스럽습니다.', exampleJa: 'これ、もうありますか', exampleKo: '이거 더 있나요?', action: '빈 트레이를 가리키며 직원에게 짧게 물어보세요.' },
  { id: 'g_pasta_options', category: '장면', label: '파스타 옵션은 하나씩 확인', tipKo: '소스·면 종류·세트·음료처럼 선택지가 많을 때는 한 번에 다 이해하려 하지 말고 하나씩 확인하세요.', exampleJa: 'おすすめはどれですか', exampleKo: '추천은 어느 건가요?', action: '못 들은 옵션은 もう一度お願いします로 다시 끊어 물어보세요.' },
  { id: 'g_tax_free_checkout', category: '장면', label: '편집샵 계산은 면세 조건 확인', tipKo: '의류 매장 면세는 여권, 금액 조건, 개봉 금지 안내가 따라올 수 있습니다. 계산 전에 면세 가능 여부를 먼저 물어보세요.', exampleJa: '免税できますか', exampleKo: '면세 되나요?', action: '여권을 바로 꺼낼 수 있게 준비해 두세요.' },

  // ── 추가 문법 팁 ──
  { id: 'g_te_kudasai', category: '문법', label: '〜てください (행동 요청)', tipKo: '동사 て형 + ください는 "~해 주세요". みせてください(보여 주세요), かいてください(써 주세요). 요청의 기본 틀이에요.', exampleJa: 'ゆっくりはなしてください', exampleKo: '천천히 말해 주세요.', commonMistake: '동사 기본형(ます형이 아닌)에 바로 ください를 붙이지 않아요.', action: '동사 て형 + ください 패턴으로 세 가지 요청을 만들어 보세요.' },
  { id: 'g_mo_ii', category: '문법', label: '〜てもいいですか (허가 요청)', tipKo: '동사 て형 + もいいですか로 "~해도 돼요?". 사진 촬영·착석·시식 등 허가를 구할 때 쓰는 핵심 표현입니다.', exampleJa: 'すわってもいいですか', exampleKo: '앉아도 될까요?', commonMistake: '끝 억양이 낮으면 질문이 아니라 진술처럼 들려요. 반드시 억양을 올리세요.', action: '사진 찍어도 되나요? = 写真を撮ってもいいですか를 소리 내어 말해 보세요.' },
  { id: 'g_ga_arimasu', category: '문법', label: '〜がありますか (있는지 묻기)', tipKo: '명사 + がありますか로 "~가 있나요?". ATMはありますか, Wi-Fiはありますか처럼 여행 중 어디서든 쓸 수 있는 만능 패턴입니다.', exampleJa: 'えいごのメニューはありますか', exampleKo: '영어 메뉴가 있나요?', action: '필요한 것을 생각하고 〜はありますか 문장을 두 개 만들어 보세요.' },
  { id: 'g_dono_kurai', category: '문법', label: 'どのくらい (얼마나)', tipKo: '시간·거리·기간을 물을 때 どのくらいですか 한 문장으로 해결됩니다. どのくらいかかりますか(얼마나 걸려요?)처럼 かかります와 짝을 이루면 더 자연스러워요.', exampleJa: 'どのくらいかかりますか', exampleKo: '얼마나 걸려요?', action: '걷는 시간, 이동 거리를 물을 때 どのくらい를 활용해 보세요.' },
  { id: 'g_nai_desu', category: '문법', label: '〜ないでください (삼가 요청)', tipKo: '동사 ない형 + でください는 "~하지 말아 주세요". 触らないでください(만지지 마세요), 写真は撮らないでください(사진 촬영 금지)처럼 안내 표시에도 많이 나옵니다.', exampleJa: 'さわらないでください', exampleKo: '만지지 마세요.', action: '신사나 미술관 안내 표지에서 〜ないでください 표현을 찾아보세요.' },
  { id: 'g_to_omoimasu', category: '문법', label: '〜と思います (생각·의견)', tipKo: '문장 + と思います로 "~라고 생각합니다". 단정하지 않고 완곡하게 의견을 말할 때 쓰며, 회화에서 부드러운 인상을 줍니다.', exampleJa: 'おいしいと思います', exampleKo: '맛있을 것 같아요.', action: '음식 감상이나 날씨 예상을 と思います로 표현해 보세요.' },

  // ── 추가 문화 팁 ──
  { id: 'g_omotenashi', category: '문화', label: '오모테나시 — 일본의 환대', tipKo: '일본 서비스는 손님이 요구하기 전에 미리 배려하는 おもてなし 정신을 기반으로 합니다. 불편을 말하면 최대한 해결하려 노력하니, 불편함은 망설이지 말고 전달하세요.', exampleJa: 'すみません、ちょっとよろしいですか', exampleKo: '저기요, 잠깐 괜찮으신가요?', action: '불편한 점이 있으면 すみません 한마디로 직원을 부르세요.' },
  { id: 'g_garbage', category: '문화', label: '일본 쓰레기 분리수거', tipKo: '일본은 쓰레기 분리가 엄격합니다. 도시에서 쓰레기통이 거의 없으니 편의점 쓰레기통을 이용하거나, 숙소로 가져가는 것이 예의입니다.', commonMistake: '음식 쓰레기를 길거리에 버리거나 전용 수거함에 넣지 않으면 문제가 될 수 있어요.', action: '편의점 봉지는 편의점 쓰레기통에 버릴 수 있어요. 분리 표시를 확인하세요.' },
  { id: 'g_chopstick_manners', category: '문화', label: '젓가락 매너', tipKo: '젓가락을 밥에 꽂거나, 음식을 젓가락에서 젓가락으로 건네는 것은 장례 문화와 연관되어 금기로 여겨집니다. 음식을 나눌 때는 접시를 사용하세요.', commonMistake: '젓가락을 밥에 세워 꽂는 행동은 절대 하지 않도록 조심하세요.', action: '젓가락 위에 사용 후 割り箸(와리바시) 봉투를 올려두면 사용 완료 신호예요.' },
  { id: 'g_sound_bath', category: '문화', label: '소음에 민감한 일본 문화', tipKo: '일본에서는 공공장소에서의 소음 억제가 강한 사회 규범입니다. 음식을 먹을 때 라면 국물 소리 정도는 허용되지만, 전화·음악은 이어폰 없이 틀지 않아요.', commonMistake: '스피커로 음악을 크게 틀거나 통화를 하면 주위의 시선이 집중됩니다.', action: '전철이나 식당에서 이어폰을 착용하는 습관이 현지 에티켓에 맞아요.' },
  { id: 'g_department_store', category: '문화', label: '백화점 계단·엘리베이터 예절', tipKo: '고급 백화점에서는 직원이 엘리베이터 안에서 층별 안내를 하는 경우가 있습니다. 들어갈 때와 나갈 때 가벼운 목례만 해도 충분해요.', action: '지하 식품관(デパ地下)은 시식이 가능한 경우가 많아요 — 구매 부담 없이 맛볼 수 있어요.' },

  // ── 추가 발음 팁 ──
  { id: 'g_pitch_accent', category: '발음', label: '음고(피치) 악센트', tipKo: '일본어는 음의 높낮이로 뜻이 달라집니다. 예를 들어 はし는 억양에 따라 箸(젓가락)·橋(다리)·端(끝)이 될 수 있어요. 회화에서 문맥이 도와주지만, 음고 의식을 갖는 것이 좋습니다.', exampleJa: 'はし', exampleKo: '젓가락 / 다리 / 끝 (억양에 따라 달라짐)', action: '단어를 외울 때 발음과 함께 억양 패턴도 함께 들어두세요.' },
  { id: 'g_small_tsu', category: '발음', label: '작은 つ(촉음)와 박자', tipKo: '일본어는 박자 언어입니다. っ 하나가 한 박의 무음(정지)입니다. きって(우표)를 き·(정지)·て·로 세 박으로 발음하는 것이 핵심입니다.', exampleJa: 'ざっし', exampleKo: '잡지 (雑誌)', commonMistake: '촉음을 건너뛰면 전혀 다른 단어로 들릴 수 있어요.', action: 'き·(멈춤)·て를 손가락으로 박자를 세며 말해 보세요.' },
  { id: 'g_n_sound', category: '발음', label: 'ん (독립 비음)', tipKo: 'ん은 혼자 한 박을 차지하는 독립 음절입니다. さんえん(3엔)은 さ·ん·え·ん — 네 박입니다. 한국어 ㄴ보다 길게, 코 울림을 의식하세요.', exampleJa: 'さんえん', exampleKo: '3엔', action: 'さんえん와 さんべん을 비교하며 ん 발음을 연습해 보세요.' },
  { id: 'g_vowel_length', category: '발음', label: '모음 길이로 의미가 바뀐다', tipKo: 'おじさん(아저씨)과 おじいさん(할아버지), ビル(빌딩)과 ビール(맥주)처럼 모음 하나의 길이가 의미를 바꿉니다. 각 박을 균등하게 유지하는 것이 핵심입니다.', exampleJa: 'おじさん / おじいさん', exampleKo: '아저씨 / 할아버지', action: 'ビル과 ビール을 각각 2박·3박으로 세면서 말해 보세요.' },

  // ── 추가 여행 팁 ──
  { id: 'g_shinkansen_seat', category: '여행', label: '신칸센 자유석·지정석 구분', tipKo: '신칸센 자유석(自由席)은 좌석 번호 없이 비어 있는 자리에 앉아요. 지정석(指定席)은 표에 적힌 칸·좌석에만 앉아야 합니다. 자유석 칸 번호는 탑승 전 확인하세요.', exampleJa: 'じゆうせきはどこですか', exampleKo: '자유석은 어디예요?', action: '플랫폼 안내판에서 自由席 구간 번호를 찾아 그 위치에 줄을 서세요.' },
  { id: 'g_taximeter', category: '여행', label: '택시 미터와 가산 요금', tipKo: '일본 택시는 야간(심야)과 고속도로 이용 시 가산 요금이 붙습니다. 목적지를 지도나 메모로 보여주면 의사소통이 훨씬 쉬워요.', exampleJa: 'このじゅうしょまでおねがいします', exampleKo: '이 주소로 부탁합니다.', action: '지도 앱 목적지 화면을 택시 기사에게 보여주는 것이 가장 확실한 방법이에요.' },
  { id: 'g_passport_carry', category: '여행', label: '여권은 상시 휴대', tipKo: '일본에서 외국인은 여권이나 그에 준하는 신분증을 상시 소지해야 하는 법적 의무가 있습니다. 면세 쇼핑·호텔 체크인·ATM 이용에도 여권이 필요한 경우가 많아요.', commonMistake: '여권을 숙소에 두고 나오면 면세 혜택을 받지 못하거나 신분 확인에 문제가 생길 수 있어요.', action: '여권은 여행 내내 몸에 지니고, 복사본을 숙소에도 한 부 남겨두세요.' },
  { id: 'g_train_door', category: '여행', label: '전철 문과 승강 예절', tipKo: '전철 문은 자동이지만 승강장 표시선 안에 서서 내리는 사람 먼저 기다렸다 타야 합니다. 문이 닫히기 시작하면 무리하게 타지 않는 것이 안전 에티켓입니다.', action: '承車(승차)·降車(하차) 표시와 문 색깔(줄)을 확인하고 지시선 안에 대기하세요.' },
  { id: 'g_vending_machine', category: '여행', label: '자판기는 편의점만큼 다양', tipKo: '일본 자판기는 음료부터 우산·과자·라멘·어묵까지 팔아요. 동전과 천엔권을 넣으면 대부분 작동하고, IC카드 결제가 되는 기기도 많습니다.', exampleJa: 'これはいくらですか', exampleKo: '이건 얼마예요?', action: '가격 표시를 보고 IC카드 마크가 있으면 탭 결제를 시도해 보세요.' },

  // ── 추가 회화법 팁 ──
  { id: 'g_echo_technique', category: '회화법', label: '에코 기법 — 상대 말 되풀이', tipKo: '상대의 말 끝부분을 반문하듯 따라 말하면 이해를 확인하고 대화를 이어가는 데 효과적입니다. 「〜ですか？」처럼 끝을 올리면 자연스러운 되물음이 돼요.', exampleJa: 'みぎ、ですか？', exampleKo: '오른쪽이요?', action: '길 안내를 들을 때 핵심 단어를 끝에 의문형으로 따라 말해 보세요.' },
  { id: 'g_simple_japanese', category: '회화법', label: '쉬운 일본어 요청 전략', tipKo: 'やさしいにほんごでおねがいします — 어려운 한자어를 피하고 쉬운 말로 바꿔 말해 달라고 요청하는 표현입니다. 「もっとかんたんに」도 같은 의미로 쓸 수 있어요.', exampleJa: 'やさしいにほんごでおねがいします', exampleKo: '쉬운 일본어로 부탁합니다.', action: '알아듣기 어려울 때 이 표현 하나면 대화를 이어갈 수 있어요. 소리 내어 외워 두세요.' },
  { id: 'g_body_language', category: '회화법', label: '몸짓이 반, 말이 반', tipKo: '여행 일본어는 100% 말로 해결할 필요가 없어요. 가리키기·손짓·지도 보여주기·번역앱을 조합하면 말이 짧아도 충분히 소통됩니다. 몸짓 언어를 적극 활용하세요.', action: '지도 앱, 번역앱, 메모 앱 세 가지를 여행 전에 준비해 두면 말문이 막혀도 안심이에요.' },
  { id: 'g_sumimasen_uses', category: '회화법', label: 'すみません의 세 가지 용법', tipKo: 'すみません은 "저기요(주의 끌기)", "죄송합니다(사과)", "감사합니다(감사)"의 세 가지로 쓰입니다. 길을 묻거나 지나갈 때, 서비스를 받고 감사할 때 모두 사용할 수 있는 핵심 만능 표현입니다.', exampleJa: 'すみません、ちかてつはどこですか', exampleKo: '저기요, 지하철은 어디예요?', action: 'すみません을 상황 세 가지에 각각 사용하는 연습을 해 보세요.' },

  // ── 추가 장면 팁 ──
  { id: 'g_food_court', category: '장면', label: '푸드코트 식권기 순서', tipKo: '푸드코트·라멘 가게는 입구 식권기(食券機)에서 먼저 표를 사고 자리에 앉는 방식이 많아요. 현금이 필요한 곳이 많으니 동전을 준비하세요.', exampleJa: 'つかいかたをおしえてください', exampleKo: '사용법을 알려 주세요.', action: '식권기에서 원하는 메뉴 버튼을 누르고 돈을 넣은 뒤 표를 받아 직원에게 주세요.' },
  { id: 'g_izakaya_order', category: '장면', label: '이자카야 첫 음료는 빠르게', tipKo: '이자카야에서는 자리에 앉자마자 음료 주문을 먼저 받으러 옵니다. とりあえずビール(일단 맥주)가 대표 첫 주문이며, 못 마시면 ノンアルコールでお願いします라고 하면 무알콜을 주문할 수 있어요.', exampleJa: 'ノンアルコールでおねがいします', exampleKo: '무알콜로 부탁합니다.', action: '음료를 못 마신다면 ノンアルコール이라는 단어를 미리 외워두세요.' },
  { id: 'g_cherry_blossom', category: '장면', label: '벚꽃 명소는 자리 경쟁', tipKo: '봄 벚꽃 시즌(오다이)(3~4월)에는 인기 공원에 이른 아침부터 돗자리로 자리를 맡아 두는 문화(場所取り)가 있습니다. 늦게 도착하면 좋은 자리를 구하기 어렵고 쓰레기는 직접 가져가세요.', action: '벚꽃 명소 방문 시 봉투와 비닐 시트를 준비하고 쓰레기는 직접 수거하세요.' },
  { id: 'g_pharmacy_otc', category: '장면', label: '약국 일반의약품 구매', tipKo: '편의점에도 기본 상비약이 있지만 종류는 적어요. 드럭스토어(薬局·ドラッグストア)에서 감기약·진통제·위장약·반창고 등을 구매할 수 있습니다.', exampleJa: 'かぜぐすりはありますか', exampleKo: '감기약 있나요?', action: '약 봉투의 用法用量(용법용량)을 번역앱으로 찍어 확인하세요.' },

  // ── N5 공백 보강 (report:n5 미커버분) ──
  { id: 'g_mashita', category: '문법', label: '〜ました (과거)', tipKo: 'ます의 과거형. "~했습니다". わかりました(알겠습니다)는 여행 회화 최다 빈출 — 이해했다는 과거형 대답이에요.', exampleJa: 'きのう、きょうとにいきました', exampleKo: '어제 교토에 갔습니다.', commonMistake: 'ます 그대로 두고 きのう만 붙이면 시제가 어긋나요.', action: 'いきます→いきました처럼 ます를 ました로 바꾸는 연습을 해 보세요.', n5Refs: ['n5_g_mashita'] },
  { id: 'g_masenka', category: '문법', label: '〜ませんか (권유)', tipKo: '부정 의문형이지만 뜻은 "같이 ~하지 않을래요?"라는 부드러운 권유. 거절할 여지를 주는 정중한 초대예요.', exampleJa: 'いっしょにたべませんか', exampleKo: '같이 먹지 않을래요?', commonMistake: '"안 먹습니까?"라는 추궁으로 오해하기 쉬워요 — 권유입니다.', action: '~ましょう(합시다)와 ~ませんか(할래요?)의 어감 차이를 비교해 보세요.', n5Refs: ['n5_g_masenka'] },
  { id: 'g_mashou', category: '문법', label: '〜ましょう (합시다)', tipKo: '"같이 ~합시다"라는 적극 제안. 상대 대답에 いいですね(좋네요)로 호응하면 자연스러워요.', exampleJa: 'えきまであるきましょう', exampleKo: '역까지 걸어갑시다.', commonMistake: '윗사람에게 지시하듯 쓰면 무례할 수 있어요 — ませんか가 더 정중해요.', action: 'ましょう(제안)와 ませんか(권유)를 상황 바꿔 말해 보세요.', n5Refs: ['n5_g_mashou'] },
  { id: 'g_ja_arimasen', category: '문법', label: '〜じゃありません (아닙니다)', tipKo: '명사·な형용사의 정중 부정. "~이/가 아닙니다". 더 격식 있게는 ではありません.', exampleJa: 'これはわたしのじゃありません', exampleKo: '이건 제 것이 아니에요.', commonMistake: 'ないです만 쓰면 캐주얼 — 점원·직원에게는 じゃありません이 안전해요.', action: '내 것이 아닌 물건을 가리키며 わたしのじゃありません을 말해 보세요.', n5Refs: ['n5_g_ja_arimasen'] },
  { id: 'g_te_imasu', category: '문법', label: '〜ています (진행·상태)', tipKo: '"~하고 있어요(진행)" 또는 "~해 있어요(상태)". 가게가 열려 있다(あいています), 줄 서 있다(ならんでいます) 등 여행에서 상태 표현으로 자주 만나요.', exampleJa: 'みせはあいていますか', exampleKo: '가게 열려 있나요?', commonMistake: 'ます만 쓰면 "(앞으로) 연다"는 뜻이 되기 쉬워요 — 지금 상태는 ています.', action: 'あいていますか(열려 있나요?)를 통째로 외워 두세요.', n5Refs: ['n5_g_te_imasu'] },
  { id: 'g_he', category: '문법', label: '조사 へ (방향)', tipKo: '"~(쪽)으로". 방향을 나타낼 때 쓰고 「え」로 발음합니다. に와 비슷하지만 へ는 방향감이 강조돼요.', exampleJa: 'とうきょうへいきます', exampleKo: '도쿄로 갑니다.', commonMistake: '표기 그대로 「헤」로 읽어요 — 조사일 때는 반드시 「에」.', action: '행선지를 넣어 〜へいきます를 말해 보세요.', n5Refs: ['n5_g_he'] },
  { id: 'g_kara_made', category: '문법', label: 'から〜まで (부터~까지)', tipKo: 'から는 시작점, まで는 끝점. 시간(9じから5じまで)과 장소(えきからホテルまで) 모두에 씁니다. 영업시간 안내에서 매일 만나는 짝이에요.', exampleJa: 'えきからホテルまであるきます', exampleKo: '역에서 호텔까지 걷습니다.', commonMistake: 'から를 "~니까(이유)"로만 알면 시간표를 못 읽어요 — 출발점 뜻이 기본.', action: '오늘 일정을 〜から〜まで로 한 문장 만들어 보세요.', n5Refs: ['n5_g_kara', 'n5_g_made'] },
  { id: 'g_nani', category: '문법', label: 'なに/なん (무엇)', tipKo: '"무엇". 뒤에 오는 소리에 따라 なん으로 변해요 — なんですか(뭐예요?), なんじ(몇 시), なんめいさま(몇 분). 점원의 질문에도 자주 들어 있어요.', exampleJa: 'これはなんですか', exampleKo: '이건 뭐예요?', commonMistake: 'なにですか라고 하면 어색해요 — です 앞에서는 なん.', action: '메뉴판을 가리키며 これはなんですか를 말해 보세요.', n5Refs: ['n5_g_nani'] },
  { id: 'g_itsu', category: '문법', label: 'いつ (언제)', tipKo: '"언제". いつですか 하나로 출발 시간·체크인·영업 시작을 모두 물을 수 있어요.', exampleJa: 'チェックインはいつですか', exampleKo: '체크인은 언제예요?', commonMistake: 'なんじ(몇 시)와 혼동 — いつ는 날짜·시점 전반, なんじ는 시각.', action: '예약 확인할 때 いつですか를 붙여 물어보세요.', n5Refs: ['n5_g_itsu'] },
  { id: 'g_dare', category: '문법', label: 'だれ (누구)', tipKo: '"누구". 정중하게는 どなた. 분실물 확인이나 예약자 확인에서 だれの〜(누구의 ~)로 자주 등장해요.', exampleJa: 'これはだれのかばんですか', exampleKo: '이건 누구 가방이에요?', commonMistake: '점원이 손님에게는 どなた를 써요 — 들었을 때 같은 뜻으로 이해하세요.', action: 'だれの〜ですか 패턴으로 소지품을 물어보는 연습을 해 보세요.', n5Refs: ['n5_g_dare'] },
  { id: 'g_dou', category: '문법', label: 'どう (어떻게·어때요)', tipKo: '"어떻게/어때요". どうですか(어때요?), どうやって(어떻게 해서)로 확장됩니다. 점원의 いかがですか는 どうですか의 정중 버전이에요.', exampleJa: 'あじはどうですか', exampleKo: '맛은 어때요?', commonMistake: 'いかがですか를 다른 단어로 알아 못 알아듣는 경우가 많아요 — 같은 뜻.', action: 'どうですか에 いいです/ちょっと…로 답하는 연습을 해 보세요.', n5Refs: ['n5_g_dou'] },
  { id: 'g_josuushi', category: '문법', label: '조수사 〜枚・〜本・〜人', tipKo: '세는 말이 물건마다 달라요 — 표·티켓은 〜まい(枚), 병·우산은 〜ほん(本), 사람은 〜にん(人, 단 1명 ひとり·2명 ふたり). 매표소·식당에서 바로 쓰입니다.', exampleJa: 'きっぷをにまいください', exampleKo: '표를 두 장 주세요.', commonMistake: '전부 〜つ로 세도 통하긴 하지만, 티켓을 ふたつ라고 하면 어색해요.', action: 'きっぷをにまい, ビールをいっぽん처럼 물건+조수사로 주문해 보세요.', n5Refs: ['n5_g_josuushi', 'n5_g_counter_tsu'] },
];

// ── 팁 난이도(레벨) — 1 입문 … 5 고급심화 ──
// 세션이 사용자 레벨(미션 티어 범위)에 맞는 문법·문화·실전 팁만 고르도록 각 팁에 난이도를 부여한다.
// 입문엔 기초 조사·정중체, 고급엔 て형·추량·트러블 장면 등 심화 내용이 나오게 한다.
const GRAMMAR_LEVEL: Record<string, 1 | 2 | 3 | 4 | 5> = {
  // N5 공백 보강 — 기초 시제·조사·의문사(1) → 권유·상태·조수사(2)
  g_mashita: 1, g_ja_arimasen: 1, g_he: 1, g_kara_made: 1, g_nani: 1, g_itsu: 1,
  g_masenka: 2, g_mashou: 2, g_te_imasu: 2, g_dare: 2, g_dou: 2, g_josuushi: 2,
  // 문법 — 기초 조사·정중체(1) → 억양·て형·있다(2) → 허가·정도(3) → 추량(4)
  g_masuka: 1, g_kudasai: 1, g_wo: 1, g_desu: 1, g_counting: 1, g_onegai: 1, g_kosoado: 1,
  g_intonation: 2, g_te_kudasai: 2, g_ga_arimasu: 2, g_nai_desu: 2,
  g_mo_ii: 3, g_dono_kurai: 3, g_to_omoimasu: 4,
  // 문화·매너
  g_no_tip: 1, g_bow: 1, g_quiet_train: 1, g_cash: 1, g_itadakimasu: 1,
  g_queue: 2, g_shoes: 2, g_oshibori: 2, g_garbage: 2, g_chopstick_manners: 2,
  g_omotenashi: 3, g_sound_bath: 3, g_department_store: 3,
  // 발음
  g_long_vowel: 1, g_vowel_length: 1,
  g_sokuon: 2, g_r_sound: 2, g_fu: 2, g_small_tsu: 2, g_n_sound: 2,
  g_pitch_accent: 3,
  // 여행 실전
  g_konbini: 1, g_translate: 1, g_toilet: 1, g_vending_machine: 1,
  g_ic_card: 2, g_passport_carry: 2, g_train_door: 2,
  g_menzei: 3, g_shinkansen_seat: 3, g_taximeter: 3,
  // 회화 학습법
  g_body_language: 1, g_sumimasen_uses: 1,
  g_conversation_shadowing: 2, g_conversation_chunk: 2, g_echo_technique: 2, g_simple_japanese: 2,
  g_conversation_roleplay: 3, g_conversation_recovery: 3, g_conversation_my_case: 3,
  // 확장 장면 — 기본 장면(1~2) → 문화·응용(3) → 트러블·복합(4)
  g_cafe: 1, g_bakery: 1,
  g_izakaya: 2, g_sushi: 2, g_tourist_info: 2, g_shrine: 2, g_bus: 2, g_shinkansen: 2,
  g_festival: 2, g_kaiten_sushi_panel: 2, g_hotel_umbrella: 2, g_narita_ticket: 2,
  g_buffet_refill: 2, g_food_court: 2, g_izakaya_order: 2, g_cherry_blossom: 2,
  g_onsen: 3, g_ryokan: 3, g_sim: 3, g_laundry: 3, g_fitting_room: 3,
  g_baggage_weight: 3, g_pasta_options: 3, g_tax_free_checkout: 3,
  g_rental: 4, g_hospital: 4, g_police: 4, g_emergency: 4, g_room_change: 4, g_pharmacy_otc: 4,
};

/** 팁 난이도(레벨). 매핑이 없으면 기본 2(생활)로 둔다 — 항상 안전한 폴백. */
export function grammarLevel(g: GrammarPoint): 1 | 2 | 3 | 4 | 5 {
  return GRAMMAR_LEVEL[g.id] ?? 2;
}
