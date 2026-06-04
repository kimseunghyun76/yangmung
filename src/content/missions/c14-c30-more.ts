import type { CLevel, Mission } from '../types';

type SceneSeed = {
  id: Exclude<CLevel, 'C0' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9' | 'C10' | 'C11' | 'C12' | 'C13'>;
  place: string;
  scenario: string;
  canDo: string;
  unlockAfter: CLevel;
  sequence: [string, string];
  first: [string, string, string];
  second: [string, string, string];
};

const scene = ({ id, place, scenario, canDo, unlockAfter, sequence, first, second }: SceneSeed): Mission => ({
  id, place, scenario, canDo, unlockAfter: [unlockAfter], sequence,
  speakPhraseIds: [first[0], first[1], second[0]],
  steps: [
    {
      situationKo: sequence[0],
      speaker: '상대',
      recapPromptJa: 'ごようけんはなんですか',
      recapPromptKo: '무엇을 도와드릴까요?',
      choices: [
        { text: '가장 직접적으로 말하기', phraseId: first[0], correct: true },
        { text: '짧게 덧붙이기', phraseId: first[1], correct: true },
        { text: '상황을 확인하기', phraseId: first[2], correct: true },
        { text: '다시 말해 달라고 하기', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: sequence[1],
      speaker: '상대',
      recapPromptJa: 'ほかになにかありますか',
      recapPromptKo: '그 밖에 필요한 것이 있나요?',
      choices: [
        { text: '필요한 것을 말하기', phraseId: second[0], correct: true },
        { text: '추가로 확인하기', phraseId: second[1], correct: true },
        { text: '대화를 마무리하기', phraseId: second[2], correct: true },
        { text: '영어로 가능한지 묻기', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
});

const seeds: SceneSeed[] = [
  { id: 'C14', place: '카페', scenario: '카페에서 음료 주문', canDo: '사용자는 카페에서 메뉴를 고르고 추천·물·계산을 요청할 수 있다', unlockAfter: 'C2', sequence: ['메뉴를 보고 음료 고르기', '받은 뒤 계산 마무리'], first: ['p_kore_kudasai','p_osusume_wa','p_menu_misete'], second: ['p_mizu_kudasai','p_okaikei','p_arigatou_gozaimasu'] },
  { id: 'C15', place: '빵집', scenario: '빵집에서 빵 고르기', canDo: '사용자는 빵집에서 손가락으로 상품과 개수를 고르고 결제할 수 있다', unlockAfter: 'C1', sequence: ['빵과 개수 고르기', '봉투와 결제 정하기'], first: ['p_kore_to_kore','p_hitotsu_kudasai','p_kore_kudasai'], second: ['p_fukuro_iranai','p_card_de','p_arigatou_gozaimasu'] },
  { id: 'C16', place: '이자카야', scenario: '이자카야에서 주문', canDo: '사용자는 이자카야에서 인원·추천·추가 주문과 계산을 요청할 수 있다', unlockAfter: 'C2', sequence: ['자리와 첫 주문 정하기', '추가 주문과 계산하기'], first: ['p_futari_desu','p_osusume_wa','p_kore_kudasai'], second: ['p_kore_to_kore','p_okaikei','p_gochisousama'] },
  { id: 'C17', place: '스시집', scenario: '스시집에서 안전하게 주문', canDo: '사용자는 스시집에서 추천을 묻고 알레르기와 제외 재료를 전달할 수 있다', unlockAfter: 'C2', sequence: ['추천을 묻고 주문하기', '못 먹는 재료 알리기'], first: ['p_osusume_wa','p_kore_kudasai','p_hitotsu_kudasai'], second: ['p_arerugi','p_kore_nuite','p_gochisousama'] },
  { id: 'C18', place: '관광안내소', scenario: '관광안내소에서 표와 길 묻기', canDo: '사용자는 관광지에서 표·가격·위치를 묻고 사진 허용 여부를 확인할 수 있다', unlockAfter: 'C5', sequence: ['표와 위치 확인하기', '관람 중 규칙 확인하기'], first: ['p_kippu_kudasai','p_ikura_desu_ka','p_doko_desu_ka'], second: ['p_shashin_ii','p_michi_oshiete','p_arigatou_gozaimasu'] },
  { id: 'C19', place: '신사', scenario: '신사와 절에서 예절 지키기', canDo: '사용자는 신사와 절에서 장소와 촬영 가능 여부를 묻고 조용히 도움을 청할 수 있다', unlockAfter: 'C5', sequence: ['입구에서 필요한 장소 찾기', '촬영과 관람 규칙 묻기'], first: ['p_sumimasen','p_doko_desu_ka','p_michi_oshiete'], second: ['p_shashin_ii','p_daijoubu_desu','p_arigatou_gozaimasu'] },
  { id: 'C20', place: '온천', scenario: '온천 이용 방법 묻기', canDo: '사용자는 온천에서 위치·가격·사용법을 묻고 안내를 다시 요청할 수 있다', unlockAfter: 'C4', sequence: ['입장 전 요금과 위치 확인', '탈의실에서 사용법 확인'], first: ['p_ikura_desu_ka','p_doko_desu_ka','p_sumimasen'], second: ['p_tsukaikata','p_yasashii_nihongo','p_wakarimashita_arigatou'] },
  { id: 'C21', place: '료칸', scenario: '료칸에서 숙박', canDo: '사용자는 료칸에서 예약·방·조식과 시설 정보를 확인할 수 있다', unlockAfter: 'C4', sequence: ['예약 확인하고 방 찾기', '식사와 시설 확인하기'], first: ['p_yoyaku_shiteimasu','p_checkin_onegai','p_heya_doko'], second: ['p_choushoku_wa','p_wifi_arimasu_ka','p_arigatou_gozaimasu'] },
  { id: 'C22', place: '버스', scenario: '버스 타고 목적지 가기', canDo: '사용자는 버스에서 목적지·요금·하차 위치를 확인할 수 있다', unlockAfter: 'C3', sequence: ['탈 버스와 요금 확인', '내릴 곳 확인하기'], first: ['p_doko_desu_ka','p_ikura_desu_ka','p_michi_oshiete'], second: ['p_tsugi_wa_shibuya','p_dochira_desu_ka','p_arigatou_gozaimasu'] },
  { id: 'C23', place: '신칸센', scenario: '신칸센 표 사고 타기', canDo: '사용자는 신칸센 표·승강장·탑승 방향을 확인할 수 있다', unlockAfter: 'C3', sequence: ['표를 사고 승강장 찾기', '열차와 방향 확인하기'], first: ['p_kippu_kudasai','p_nanbansen','p_ikura_desu_ka'], second: ['p_dochira_desu_ka','p_tsugi_wa_shibuya','p_wakarimashita_arigatou'] },
  { id: 'C24', place: '렌터카', scenario: '렌터카 빌리고 반납', canDo: '사용자는 렌터카 카운터에서 결제·위치·영수증을 요청할 수 있다', unlockAfter: 'C8', sequence: ['예약과 결제 확인하기', '반납 위치와 영수증 확인'], first: ['p_yoyaku_shiteimasu','p_card_tsukaemasu_ka','p_card_de'], second: ['p_doko_desu_ka','p_ryoushuusho','p_arigatou_gozaimasu'] },
  { id: 'C25', place: '병원', scenario: '병원에서 증상 설명', canDo: '사용자는 병원에서 증상을 말하고 도움과 쉬운 설명을 요청할 수 있다', unlockAfter: 'C6', sequence: ['접수에서 증상 말하기', '진료 내용을 확인하기'], first: ['p_atama_itai','p_onaka_itai','p_tasukete'], second: ['p_arerugi','p_yasashii_nihongo','p_wakarimashita_arigatou'] },
  { id: 'C26', place: '경찰서', scenario: '분실물과 길 도움 요청', canDo: '사용자는 경찰서에서 도움을 요청하고 위치와 다음 행동을 확인할 수 있다', unlockAfter: 'C5', sequence: ['도움이 필요하다고 말하기', '상황과 다음 행동 확인하기'], first: ['p_tasukete','p_sumimasen','p_doko_desu_ka'], second: ['p_michi_oshiete','p_yasashii_nihongo','p_arigatou_gozaimasu'] },
  { id: 'C27', place: '긴급상황', scenario: '긴급상황에서 도움 청하기', canDo: '사용자는 긴급상황에서 도움을 요청하고 아픈 곳과 위치를 전달할 수 있다', unlockAfter: 'C26', sequence: ['즉시 도움 요청하기', '상태와 위치 설명하기'], first: ['p_tasukete','p_sumimasen','p_eigo_de'], second: ['p_atama_itai','p_onaka_itai','p_doko_desu_ka'] },
  { id: 'C28', place: '통신매장', scenario: '유심과 데이터 개통', canDo: '사용자는 통신매장에서 상품 가격·사용법·결제 가능 여부를 확인할 수 있다', unlockAfter: 'C7', sequence: ['상품과 가격 확인하기', '사용법과 결제 확인하기'], first: ['p_kore_ikura','p_kore_kudasai','p_osusume_wa'], second: ['p_tsukaikata','p_card_tsukaemasu_ka','p_card_de'] },
  { id: 'C29', place: '코인세탁', scenario: '코인세탁기 사용', canDo: '사용자는 코인세탁소에서 사용법·가격·기계 위치를 확인할 수 있다', unlockAfter: 'C4', sequence: ['기계와 요금 확인하기', '사용법 묻고 시작하기'], first: ['p_doko_desu_ka','p_ikura_desu_ka','p_sumimasen'], second: ['p_tsukaikata','p_yasashii_nihongo','p_wakarimashita_arigatou'] },
  { id: 'C30', place: '축제', scenario: '축제와 행사 즐기기', canDo: '사용자는 축제에서 표·먹거리·사진과 위치를 확인할 수 있다', unlockAfter: 'C18', sequence: ['입장과 먹거리 고르기', '사진과 이동 방향 확인하기'], first: ['p_kippu_kudasai','p_kore_kudasai','p_ikura_desu_ka'], second: ['p_shashin_ii','p_doko_desu_ka','p_arigatou_gozaimasu'] },
];

export const moreMissions = seeds.map(scene);
