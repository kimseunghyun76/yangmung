// 미션 묶음 — 미션별 파일을 합쳐 단일 배열로 노출 (순서 = 학습 진행 순서).
import type { Mission, MissionStep } from '../types';
import { c0 } from './c0-tutorial';
import { c1 } from './c1-conbini';
import { c2 } from './c2-restaurant';
import { c3 } from './c3-train';
import { c4 } from './c4-hotel';
import { c5 } from './c5-street';
import { c6 } from './c6-pharmacy';
import { c7 } from './c7-shopping';
import { c8 } from './c8-taxi';
import { c9 } from './c9-immigration';
import { c10 } from './c10-exchange';
import { c11 } from './c11-locker';
import { c12 } from './c12-delivery';
import { c13 } from './c13-ramen';
import { moreMissions } from './c14-c30-more';
import { frictionMissions } from './c31-c40-travel-friction';

const rawMissions: Mission[] = [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, ...moreMissions, ...frictionMissions];

type BackfillStep = {
  situationKo: string;
  recapPromptJa: string;
  recapPromptKo: string;
  correct: string;
  wrong: string;
};

const backfillByMission: Partial<Record<string, BackfillStep[]>> = {
  C5: [
    { situationKo: '길 안내를 들은 뒤 다음 행동', recapPromptJa: '信号を渡ってまっすぐ行きます', recapPromptKo: '신호등을 건너 곧장 갑니다', correct: '신호등을 건너 곧장 간다', wrong: '반대편 골목으로 들어간다' },
    { situationKo: '지도가 필요할 때', recapPromptJa: '地図を見せて場所を確認します', recapPromptKo: '지도를 보여 주고 위치를 확인합니다', correct: '지도를 보여 주며 현재 위치를 확인한다', wrong: '일단 무작정 걷는다' },
  ],
  C6: [
    { situationKo: '약 복용 안내를 들은 뒤', recapPromptJa: '食後に薬を飲みます', recapPromptKo: '식후에 약을 먹습니다', correct: '식후 복용인지 확인하고 메모한다', wrong: '복용 횟수를 확인하지 않는다' },
    { situationKo: '알레르기가 있을 때', recapPromptJa: 'アレルギーを先に伝えます', recapPromptKo: '알레르기를 먼저 말합니다', correct: '알레르기를 먼저 말한다', wrong: '아무 약이나 바로 산다' },
  ],
  C7: [
    { situationKo: '시착실 안내를 받았을 때', recapPromptJa: '試着室でサイズを確認します', recapPromptKo: '피팅룸에서 사이즈를 확인합니다', correct: '피팅룸에서 사이즈를 확인한다', wrong: '매장 밖에서 옷을 갈아입는다' },
    { situationKo: '면세 가능 여부 확인 후', recapPromptJa: 'パスポートを出して免税を確認します', recapPromptKo: '여권을 내고 면세를 확인합니다', correct: '여권을 준비해 면세 조건을 확인한다', wrong: '영수증 없이 매장을 나간다' },
  ],
  C8: [
    { situationKo: '택시 목적지를 확인받았을 때', recapPromptJa: '住所を見せて目的地を確認します', recapPromptKo: '주소를 보여 주고 목적지를 확인합니다', correct: '주소 화면을 보여 주고 목적지를 확인한다', wrong: '목적지를 말하지 않고 탄다' },
    { situationKo: '내릴 위치가 가까워질 때', recapPromptJa: 'この辺りで止めてもらいます', recapPromptKo: '이 근처에서 세워 달라고 합니다', correct: '이 근처에서 세워 달라고 한다', wrong: '말없이 지나칠 때까지 기다린다' },
  ],
  C9: [
    { situationKo: '입국 목적을 물었을 때', recapPromptJa: '観光ですと答えます', recapPromptKo: '관광이라고 답합니다', correct: '관광이라고 짧게 답한다', wrong: '불필요하게 긴 설명을 시작한다' },
    { situationKo: '체류지를 확인받을 때', recapPromptJa: 'ホテルの予約を見せます', recapPromptKo: '호텔 예약을 보여 줍니다', correct: '호텔 예약 화면을 보여 준다', wrong: '체류지를 모른다고만 한다' },
  ],
  C10: [
    { situationKo: '환율과 수수료를 확인한 뒤', recapPromptJa: 'レートと手数料を確認します', recapPromptKo: '환율과 수수료를 확인합니다', correct: '환율과 수수료를 확인하고 진행한다', wrong: '금액 확인 없이 바로 서명한다' },
    { situationKo: '소액권이 필요할 때', recapPromptJa: '千円札を多めにお願いします', recapPromptKo: '천엔권을 많이 부탁합니다', correct: '천엔권을 많이 달라고 요청한다', wrong: '큰 지폐만 받고 바로 떠난다' },
  ],
  C11: [
    { situationKo: '코인로커 사용 전', recapPromptJa: '空いているロッカーを確認します', recapPromptKo: '빈 로커를 확인합니다', correct: '빈 로커와 크기를 먼저 확인한다', wrong: '짐을 아무 문 앞에 둔다' },
    { situationKo: '짐을 꺼낼 때', recapPromptJa: 'カードを使ってロッカーを開けます', recapPromptKo: '카드를 사용해 로커를 엽니다', correct: '사용한 카드나 열쇠로 다시 연다', wrong: '직원 없이 억지로 문을 연다' },
  ],
  C12: [
    { situationKo: '택배 접수 전', recapPromptJa: '住所と電話番号を書きます', recapPromptKo: '주소와 전화번호를 적습니다', correct: '주소와 전화번호를 정확히 적는다', wrong: '받는 곳을 대충 적는다' },
    { situationKo: '깨지기 쉬운 짐일 때', recapPromptJa: '割れ物シールを貼ってもらいます', recapPromptKo: '파손주의 스티커를 붙여 달라고 합니다', correct: '파손주의 표시를 요청한다', wrong: '깨지는 물건이라고 말하지 않는다' },
  ],
  C13: [
    { situationKo: '식권을 산 뒤', recapPromptJa: '食券をスタッフに渡します', recapPromptKo: '식권을 직원에게 건넵니다', correct: '식권을 직원에게 건넨다', wrong: '식권을 테이블에 두고 나간다' },
    { situationKo: '토핑을 추가하고 싶을 때', recapPromptJa: 'トッピングを追加します', recapPromptKo: '토핑을 추가합니다', correct: '원하는 토핑을 추가로 말한다', wrong: '메뉴판을 보지 않고 아무 버튼을 누른다' },
  ],
  C14: [
    { situationKo: '음료 온도를 고를 때', recapPromptJa: 'アイスかホットを選びます', recapPromptKo: '아이스나 핫을 고릅니다', correct: '아이스인지 핫인지 말한다', wrong: '사이즈만 말하고 온도는 무시한다' },
    { situationKo: '주문이 준비되면', recapPromptJa: '名前を呼ばれたら受け取ります', recapPromptKo: '이름이 불리면 받습니다', correct: '이름이 불리면 픽업대로 간다', wrong: '다른 사람 음료를 가져간다' },
  ],
  C15: [
    { situationKo: '빵을 고를 때', recapPromptJa: 'トングとトレーを使います', recapPromptKo: '집게와 쟁반을 사용합니다', correct: '집게와 쟁반을 사용한다', wrong: '손으로 빵을 집는다' },
    { situationKo: '계산대로 갈 때', recapPromptJa: 'トレーをレジへ持って行きます', recapPromptKo: '쟁반을 계산대로 가져갑니다', correct: '쟁반을 계산대로 가져간다', wrong: '빵만 들고 계산대로 간다' },
  ],
  C16: [
    { situationKo: '처음 주문할 때', recapPromptJa: 'まず飲み物を注文します', recapPromptKo: '먼저 음료를 주문합니다', correct: '먼저 음료를 주문한다', wrong: '주문 없이 오래 앉아 있는다' },
    { situationKo: '마지막 주문 안내를 들었을 때', recapPromptJa: '最後の注文を決めます', recapPromptKo: '마지막 주문을 정합니다', correct: '추가 주문 여부를 바로 정한다', wrong: '마감 시간을 듣고도 천천히 메뉴를 고른다' },
  ],
  C17: [
    { situationKo: '못 먹는 재료가 있을 때', recapPromptJa: '苦手なネタを先に伝えます', recapPromptKo: '못 먹는 재료를 먼저 말합니다', correct: '못 먹는 재료를 먼저 말한다', wrong: '나온 뒤에 전부 못 먹는다고 한다' },
    { situationKo: '와사비가 걱정될 때', recapPromptJa: 'わさび抜きでお願いします', recapPromptKo: '와사비 빼고 부탁합니다', correct: '와사비 빼고 달라고 한다', wrong: '말하지 않고 억지로 먹는다' },
  ],
  C18: [
    { situationKo: '관광안내소에서 첫 질문', recapPromptJa: '地図とパンフレットをもらいます', recapPromptKo: '지도와 팸플릿을 받습니다', correct: '지도와 팸플릿을 요청한다', wrong: '길을 묻지 않고 돌아다닌다' },
    { situationKo: '운영 시간이 궁금할 때', recapPromptJa: '営業時間を確認します', recapPromptKo: '영업시간을 확인합니다', correct: '운영 시간을 확인한다', wrong: '닫힌 뒤에 매표소로 간다' },
  ],
  C19: [
    { situationKo: '신사 예절이 걱정될 때', recapPromptJa: '参拝の仕方を聞きます', recapPromptKo: '참배 방법을 묻습니다', correct: '참배 방법을 조용히 묻는다', wrong: '큰 소리로 장난친다' },
    { situationKo: '사진 촬영 전에', recapPromptJa: '写真を撮っていいか確認します', recapPromptKo: '사진을 찍어도 되는지 확인합니다', correct: '촬영 가능 여부를 확인한다', wrong: '금지 구역에서 바로 촬영한다' },
  ],
  C20: [
    { situationKo: '온천에 들어가기 전', recapPromptJa: '体を洗ってから入ります', recapPromptKo: '몸을 씻고 들어갑니다', correct: '몸을 먼저 씻고 탕에 들어간다', wrong: '씻지 않고 바로 들어간다' },
    { situationKo: '탕 안에서 수건 처리', recapPromptJa: 'タオルを湯船に入れません', recapPromptKo: '수건을 욕조에 넣지 않습니다', correct: '수건은 탕 밖에 둔다', wrong: '수건을 탕 안에 넣는다' },
  ],
  C21: [
    { situationKo: '료칸 방 안내를 받을 때', recapPromptJa: '浴衣とお風呂の場所を確認します', recapPromptKo: '유카타와 목욕탕 위치를 확인합니다', correct: '유카타와 목욕탕 위치를 확인한다', wrong: '안내를 듣지 않고 바로 나간다' },
    { situationKo: '저녁 식사 시간을 정할 때', recapPromptJa: '夕食の時間を決めます', recapPromptKo: '저녁 식사 시간을 정합니다', correct: '가능한 식사 시간을 고른다', wrong: '아무 시간에나 식당으로 간다' },
  ],
  C22: [
    { situationKo: '버스에 탈 때', recapPromptJa: '整理券を取ります', recapPromptKo: '정리권을 뽑습니다', correct: '정리권이나 IC카드 사용법을 확인한다', wrong: '요금 확인 없이 뒷문으로 내린다' },
    { situationKo: '내릴 정류장이 가까울 때', recapPromptJa: '降車ボタンを押します', recapPromptKo: '하차 버튼을 누릅니다', correct: '하차 버튼을 누른다', wrong: '버스가 멈추기 전 문을 연다' },
  ],
  C23: [
    { situationKo: '신칸센 표를 살 때', recapPromptJa: '自由席か指定席を選びます', recapPromptKo: '자유석이나 지정석을 고릅니다', correct: '자유석인지 지정석인지 고른다', wrong: '좌석 종류를 확인하지 않는다' },
    { situationKo: '승강장으로 가기 전', recapPromptJa: '号車とホームを確認します', recapPromptKo: '호차와 승강장을 확인합니다', correct: '호차와 승강장을 확인한다', wrong: '아무 열차에 바로 탄다' },
  ],
  C24: [
    { situationKo: '렌터카를 받기 전', recapPromptJa: '傷を一緒に確認します', recapPromptKo: '흠집을 함께 확인합니다', correct: '차량 흠집을 함께 확인한다', wrong: '확인 없이 바로 출발한다' },
    { situationKo: '반납 전에', recapPromptJa: 'ガソリンを満タンにします', recapPromptKo: '기름을 가득 채웁니다', correct: '주유 조건을 확인하고 반납한다', wrong: '연료 상태를 보지 않고 반납한다' },
  ],
  C25: [
    { situationKo: '병원 접수 시', recapPromptJa: '症状を短く伝えます', recapPromptKo: '증상을 짧게 말합니다', correct: '증상을 짧고 구체적으로 말한다', wrong: '아픈 곳을 말하지 않는다' },
    { situationKo: '문진표를 받을 때', recapPromptJa: '問診票に症状を書きます', recapPromptKo: '문진표에 증상을 적습니다', correct: '문진표에 증상과 알레르기를 적는다', wrong: '빈칸으로 제출한다' },
  ],
  C26: [
    { situationKo: '분실물을 신고할 때', recapPromptJa: '最後に見た場所を伝えます', recapPromptKo: '마지막으로 본 장소를 말합니다', correct: '마지막으로 본 장소와 특징을 말한다', wrong: '물건 특징을 말하지 않는다' },
    { situationKo: '연락처를 남길 때', recapPromptJa: '連絡先を書きます', recapPromptKo: '연락처를 적습니다', correct: '호텔이나 전화번호를 남긴다', wrong: '연락처 없이 나간다' },
  ],
  C27: [
    { situationKo: '긴급 상황에서 첫 행동', recapPromptJa: '助けを呼びます', recapPromptKo: '도움을 요청합니다', correct: '주변 사람에게 도움을 요청한다', wrong: '아무에게도 말하지 않는다' },
    { situationKo: '몸이 아픈 곳을 설명할 때', recapPromptJa: '痛い場所を指します', recapPromptKo: '아픈 곳을 가리킵니다', correct: '아픈 곳을 가리키며 설명한다', wrong: '괜찮다고만 반복한다' },
  ],
  C28: [
    { situationKo: '유심 요금제를 고를 때', recapPromptJa: '日数とギガ数を確認します', recapPromptKo: '일수와 데이터 용량을 확인합니다', correct: '사용 기간과 데이터 용량을 확인한다', wrong: '스마트폰 호환을 확인하지 않는다' },
    { situationKo: '개통이 안 될 때', recapPromptJa: '設定を手伝ってもらいます', recapPromptKo: '설정을 도와 달라고 합니다', correct: 'APN 설정 도움을 요청한다', wrong: '작동 확인 없이 매장을 나온다' },
  ],
  C29: [
    { situationKo: '세탁기 사용 전', recapPromptJa: '空いている洗濯機を確認します', recapPromptKo: '비어 있는 세탁기를 확인합니다', correct: '빈 세탁기와 요금을 확인한다', wrong: '남의 세탁물을 꺼낸다' },
    { situationKo: '세탁이 끝났을 때', recapPromptJa: '洗濯物をすぐ取り出します', recapPromptKo: '세탁물을 바로 꺼냅니다', correct: '세탁물을 바로 꺼낸다', wrong: '오래 방치한다' },
  ],
  C30: [
    { situationKo: '축제장에 도착했을 때', recapPromptJa: '入口とチケットを確認します', recapPromptKo: '입구와 티켓을 확인합니다', correct: '입구와 티켓 위치를 확인한다', wrong: '출구로 먼저 들어간다' },
    { situationKo: '노점에서 주문할 때', recapPromptJa: '屋台で一つ注文します', recapPromptKo: '노점에서 하나 주문합니다', correct: '원하는 음식을 하나씩 주문한다', wrong: '줄을 무시하고 앞으로 간다' },
  ],
  C31: [
    { situationKo: '회전초밥 주문 전', recapPromptJa: 'タッチパネルの使い方を確認します', recapPromptKo: '터치패널 사용법을 확인합니다', correct: '터치패널 사용법을 확인한다', wrong: '다른 테이블 주문을 가져간다' },
    { situationKo: '계산할 때', recapPromptJa: '会計ボタンを押します', recapPromptKo: '계산 버튼을 누릅니다', correct: '계산 버튼을 누르고 기다린다', wrong: '접시를 숨긴다' },
  ],
  C32: [
    { situationKo: '피팅룸에 들어가기 전', recapPromptJa: '試着できる点数を確認します', recapPromptKo: '입어 볼 수 있는 벌 수를 확인합니다', correct: '시착 가능 개수를 확인한다', wrong: '말없이 여러 벌을 들고 들어간다' },
    { situationKo: '다른 사이즈가 필요할 때', recapPromptJa: '別のサイズをお願いします', recapPromptKo: '다른 사이즈를 부탁합니다', correct: '직원에게 다른 사이즈를 요청한다', wrong: '아무 옷이나 계산한다' },
  ],
  C33: [
    { situationKo: '호텔에서 우산을 빌릴 때', recapPromptJa: '傘を借りられるか聞きます', recapPromptKo: '우산을 빌릴 수 있는지 묻습니다', correct: '우산 대여 가능 여부를 묻는다', wrong: '로비 우산을 말없이 가져간다' },
    { situationKo: '우산을 반납할 때', recapPromptJa: 'フロントに傘を返します', recapPromptKo: '프런트에 우산을 반납합니다', correct: '프런트에 우산을 반납한다', wrong: '방에 젖은 우산을 그대로 둔다' },
  ],
  C34: [
    { situationKo: '방에 문제가 있을 때', recapPromptJa: '部屋のにおいを伝えます', recapPromptKo: '방 냄새 문제를 말합니다', correct: '방 문제를 구체적으로 말한다', wrong: '이유 없이 방만 바꿔 달라고 한다' },
    { situationKo: '방 변경 조건을 들을 때', recapPromptJa: '追加料金を確認します', recapPromptKo: '추가 요금을 확인합니다', correct: '추가 요금과 방 타입을 확인한다', wrong: '조건 확인 없이 동의한다' },
  ],
  C35: [
    { situationKo: '오픈티켓을 교환할 때', recapPromptJa: '希望の列車を選びます', recapPromptKo: '원하는 열차를 고릅니다', correct: '원하는 열차 시간과 좌석을 고른다', wrong: '날짜가 다른 표를 그대로 쓴다' },
    { situationKo: '창구 안내를 받은 뒤', recapPromptJa: '窓口でチケットを交換します', recapPromptKo: '창구에서 티켓을 교환합니다', correct: '창구에서 티켓을 교환한다', wrong: '교환 없이 개찰구로 간다' },
  ],
  C36: [
    { situationKo: '수하물 무게 초과 시', recapPromptJa: '荷物を詰め直します', recapPromptKo: '짐을 다시 쌉니다', correct: '무게를 줄이도록 짐을 다시 싼다', wrong: '규정을 무시하고 맡긴다' },
    { situationKo: '기내수하물로 옮길 때', recapPromptJa: '機内に持てるか確認します', recapPromptKo: '기내 반입 가능한지 확인합니다', correct: '기내 반입 가능 여부를 확인한다', wrong: '금지 물품을 손가방에 넣는다' },
  ],
  C37: [
    { situationKo: '뷔페 음식이 떨어졌을 때', recapPromptJa: '補充をお願いします', recapPromptKo: '보충을 부탁합니다', correct: '직원에게 보충을 정중히 요청한다', wrong: '주방에 직접 들어간다' },
    { situationKo: '알레르기 표시가 필요할 때', recapPromptJa: 'アレルギー表示を確認します', recapPromptKo: '알레르기 표시를 확인합니다', correct: '알레르기 표시를 확인한다', wrong: '성분 확인 없이 먹는다' },
  ],
  C38: [
    { situationKo: '스시를 추가 주문할 때', recapPromptJa: '魚の名前を聞いて注文します', recapPromptKo: '생선 이름을 묻고 주문합니다', correct: '생선 이름을 확인하고 주문한다', wrong: '모르는 생선을 여러 개 시킨다' },
    { situationKo: '맥주를 한 잔 더 마실 때', recapPromptJa: 'ビールをもう一杯頼みます', recapPromptKo: '맥주 한 잔 더 주문합니다', correct: '맥주 한 잔 더 달라고 한다', wrong: '빈 잔만 흔든다' },
  ],
  C39: [
    { situationKo: '파스타 옵션을 고를 때', recapPromptJa: 'ソースと硬さを選びます', recapPromptKo: '소스와 익힘을 고릅니다', correct: '소스와 면 익힘을 고른다', wrong: '원하지 않는 옵션을 모두 고른다' },
    { situationKo: '재료를 빼고 싶을 때', recapPromptJa: '苦手な材料を抜いてもらいます', recapPromptKo: '못 먹는 재료를 빼 달라고 합니다', correct: '못 먹는 재료를 빼 달라고 한다', wrong: '먹지 못하는 재료를 말하지 않는다' },
  ],
  C40: [
    { situationKo: '편집샵 계산 시', recapPromptJa: '免税できるか確認します', recapPromptKo: '면세 가능 여부를 확인합니다', correct: '면세 조건과 여권을 확인한다', wrong: '여권 없이 면세를 요구한다' },
    { situationKo: '선물 포장을 원할 때', recapPromptJa: 'ギフトラッピングをお願いします', recapPromptKo: '선물 포장을 부탁합니다', correct: '선물 포장을 요청한다', wrong: '포장 여부를 말하지 않고 나간다' },
  ],
};

type RecapCue = {
  speaker: string;
  ja: string;
  ko: string;
};

const recapCueByStep: Record<string, Record<number, RecapCue>> = {
  C2: {
    4: { speaker: '점원', ja: 'ご注文は以上でよろしいですか', ko: '주문은 이상으로 괜찮으세요?' },
    5: { speaker: '점원', ja: '苦手なものやアレルギーはありますか', ko: '못 드시는 것이나 알레르기가 있나요?' },
  },
  C3: {
    1: { speaker: '역무원', ja: 'どちらまで行きたいですか', ko: '어디까지 가고 싶으세요?' },
    2: { speaker: '역무원', ja: '切符ですかチャージですか', ko: '표인가요, 충전인가요?' },
    3: { speaker: '역무원', ja: '改札はあちらです', ko: '개찰구는 저쪽입니다' },
    4: { speaker: '역무원', ja: '何番線か確認しますか', ko: '몇 번 선인지 확인할까요?' },
  },
  C4: {
    1: { speaker: '프런트', ja: 'チェックインですか', ko: '체크인이신가요?' },
    5: { speaker: '프런트', ja: 'ほかにご不明な点はありますか', ko: '그 밖에 궁금한 점이 있으신가요?' },
  },
  C5: {
    1: { speaker: '상대', ja: 'どうしましたか', ko: '무슨 일이세요?' },
    2: { speaker: '상대', ja: '写真ですか', ko: '사진인가요?' },
    3: { speaker: '상대', ja: '大丈夫ですか', ko: '괜찮으세요?' },
  },
  C6: {
    2: { speaker: '약사', ja: 'どんな薬をお探しですか', ko: '어떤 약을 찾고 계세요?' },
  },
  C7: {
    1: { speaker: '직원', ja: '何かお探しですか', ko: '무엇을 찾고 계세요?' },
    2: { speaker: '직원', ja: '免税をご利用ですか', ko: '면세를 이용하시나요?' },
    3: { speaker: '직원', ja: 'お支払いはどうしますか', ko: '결제는 어떻게 하시겠어요?' },
  },
  C8: {
    1: { speaker: '기사', ja: 'どちらまで行きますか', ko: '어디까지 가시나요?' },
    3: { speaker: '기사', ja: 'この辺りでよろしいですか', ko: '이 근처면 괜찮으세요?' },
  },
  C10: {
    1: { speaker: '직원', ja: 'いくら両替しますか', ko: '얼마를 환전하시겠어요?' },
    3: { speaker: '직원', ja: '細かいお札も必要ですか', ko: '잔돈 지폐도 필요하세요?' },
  },
  C11: {
    1: { speaker: '직원', ja: 'お荷物を預けますか', ko: '짐을 맡기시나요?' },
  },
  C12: {
    1: { speaker: '직원', ja: 'どちらまで送りますか', ko: '어디까지 보내시나요?' },
  },
  C13: {
    1: { speaker: '직원', ja: '食券を先に買ってください', ko: '식권을 먼저 사 주세요' },
    3: { speaker: '직원', ja: '麺の量はどうしますか', ko: '면 양은 어떻게 하시겠어요?' },
  },
};

const fillerStep = (mission: Mission, index: number): MissionStep => ({
  situationKo: backfillByMission[mission.id]?.[index - 1]?.situationKo ?? `${mission.scenario} 마무리 확인 ${index}`,
  speaker: '상황',
  recapPromptJa: backfillByMission[mission.id]?.[index - 1]?.recapPromptJa ?? `${mission.place}で最後の確認をします`,
  recapPromptKo: backfillByMission[mission.id]?.[index - 1]?.recapPromptKo ?? `${mission.place}에서 마지막 확인을 합니다`,
  choices: [
    {
      actionText: `${mission.id} ${backfillByMission[mission.id]?.[index - 1]?.correct ?? '장면을 차분히 마무리한다'} ${index}`,
      text: backfillByMission[mission.id]?.[index - 1]?.correct ?? '장면을 차분히 마무리한다',
      correct: true,
    },
    {
      actionText: `${mission.id} ${backfillByMission[mission.id]?.[index - 1]?.wrong ?? '장면과 상관없는 행동을 한다'} ${index}`,
      text: backfillByMission[mission.id]?.[index - 1]?.wrong ?? '상관없는 행동을 한다',
      correct: false,
      feedback: '지금은 이 장면에서 해야 할 마지막 확인을 고르는 단계예요.',
    },
  ],
});

const normalizeMissionSteps = (mission: Mission): Mission => {
  if (mission.id === 'C0') return mission;
  const steps = mission.steps.slice(0, 5);
  while (steps.length < 5) steps.push(fillerStep(mission, steps.length - mission.steps.length + 1));
  return {
    ...mission,
    steps: steps.map((step, i) => {
      if (step.promptPhraseId || step.recapPromptJa) return step;
      const cue = recapCueByStep[mission.id]?.[i + 1];
      if (!cue) return step;
      return {
        ...step,
        speaker: cue.speaker,
        recapPromptJa: cue.ja,
        recapPromptKo: cue.ko,
      };
    }),
  };
};

export const missions: Mission[] = rawMissions.map(normalizeMissionSteps);
