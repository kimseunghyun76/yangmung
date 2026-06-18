import type { Mission } from '../types';

// C4 — 호텔 체크인. 프런트에서 예약 확인 → 여권 → 키 수령 → 방/조식/Wi-Fi 확인.
export const c4: Mission = {
  id: 'C4',
  tier: 1,
  scenario: '호텔 체크인하기',
  place: '호텔',
  canDo: '사용자는 호텔 프런트에서 체크인을 요청하고, 예약자 확인·여권 요청·키 수령·방 위치·조식과 와이파이를 확인할 수 있다',
  unlockAfter: ['C3'],
  sequence: ['체크인 요청', '예약자 확인', '여권 제시', '키 받기', '방 위치 확인', '조식·와이파이 확인'],
  speakPhraseIds: ['p_checkin_onegai', 'p_yoyaku_shiteimasu', 'p_heya_doko', 'p_wifi_arimasu_ka'],
  steps: [
    {
      situationKo: '호텔 프런트에 도착했다 — 체크인을 시작한다',
      speaker: '나',
      choices: [
        { text: '체크인 부탁드립니다', phraseId: 'p_checkin_onegai', correct: true, feedback: '「チェックインお願いします」— 프런트에 도착하면 바로 이 표현으로 시작해요. 예약자 이름을 이어서 말하면 더 빨라요' },
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: true, feedback: '「予約(よやく)しています」— 예약 확인 시작. 「〇〇という名前(なまえ)で予約しています」처럼 이름을 덧붙이면 더 명확해요' },
        { text: '저기요', phraseId: 'p_sumimasen', correct: true, feedback: '먼저 부르는 말로는 자연스럽지만, 바로 체크인을 말하면 더 빠릅니다' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '직원이 이름을 묻는다',
      speaker: '프런트',
      promptPhraseId: 'p_onamae_wa',
      choices: [
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: true, feedback: '예약자 이름을 이어서 말하면 완벽해요. 「予約しています、キムです」' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true, feedback: '이름이 적힌 여권을 보여주는 것도 확실한 방법이에요' },
        { text: '네', phraseId: 'p_hai', correct: false, feedback: '이름을 묻는 질문에 네라고만 하면 대화가 멈춰요. 이름이나 예약 정보를 전달해요' },
        { text: '다시 한 번 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '직원이 여권을 요청한다',
      speaker: '프런트',
      promptPhraseId: 'p_passport_onegai',
      choices: [
        { text: '네, 알겠습니다 (여권 제시)', phraseId: 'p_hai_wakarimashita', correct: true, feedback: 'はい、わかりました — 안내를 이해하고 여권을 건네는 흐름이에요' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true, feedback: '건네면서 「パスポートはこちらです」라고 말하면 자연스러워요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '조식은요?', phraseId: 'p_choushoku_wa', correct: false, feedback: '아직 체크인 확인 단계라 여권부터 처리하는 편이 자연스럽습니다' },
      ],
    },
    {
      situationKo: '직원이 객실 키를 건넨다',
      speaker: '프런트',
      promptPhraseId: 'p_kagi_desu',
      choices: [
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true, feedback: '키를 받으며 감사 인사. 일본 호텔 직원은 정중한 응대에 보람을 느껴요 — 이 한 마디가 숙박 경험을 더 따뜻하게 해요' },
        { text: '방은 어디예요?', phraseId: 'p_heya_doko', correct: true, feedback: '「部屋(へや)はどこですか」— 키를 받고 바로 방 위치를 확인. 엘리베이터 위치도 함께 물어보면 편리해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '조식은요?', phraseId: 'p_choushoku_wa', correct: false, feedback: '키를 막 받은 참이에요 — 조식·와이파이는 바로 다음 단계에서 확인해요' },
      ],
    },
    {
      situationKo: '객실 정보는 알았고, 필요한 편의 정보를 확인한다',
      speaker: '나',
      choices: [
        { text: '와이파이는 있나요?', phraseId: 'p_wifi_arimasu_ka', correct: true, feedback: '「Wi-Fiはありますか」— 일본 호텔은 대부분 무료 Wi-Fi 제공. 비밀번호(パスワード)는 카드나 메모지에 적어줘요' },
        { text: '조식은요?', phraseId: 'p_choushoku_wa', correct: true, feedback: '「朝食(ちょうしょく)は？」— 조식 포함 여부·시간·장소를 확인해요. 일본 호텔 조식은 화식(和食)·양식(洋食) 선택 가능한 경우가 많아요' },
        { text: '방은 어디예요?', phraseId: 'p_heya_doko', correct: true, feedback: '「部屋はどこですか」— 키를 받은 후 방 위치와 함께 엘리베이터 방향도 확인하면 바로 올라갈 수 있어요' },
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: false, feedback: '물건을 사는 상황이 아니라 호텔 정보 확인 단계입니다' },
      ],
    },
  ],
};
