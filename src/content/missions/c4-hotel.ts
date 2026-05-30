import type { Mission } from '../types';

// C4 — 호텔 체크인. 프런트에서 예약 확인 → 여권 → 키 수령 → 방/조식/Wi-Fi 확인.
export const c4: Mission = {
  id: 'C4',
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
        { text: '체크인 부탁드립니다', phraseId: 'p_checkin_onegai', correct: true },
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: true },
        { text: '저기요', phraseId: 'p_sumimasen', correct: true, feedback: '먼저 부르는 말로는 자연스럽지만, 바로 체크인을 말하면 더 빠릅니다' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '직원이 이름을 묻는다',
      speaker: '프런트',
      promptPhraseId: 'p_onamae_wa',
      choices: [
        { text: '예약했습니다', phraseId: 'p_yoyaku_shiteimasu', correct: true },
        { text: '네', phraseId: 'p_hai', correct: true, feedback: '짧게 반응한 뒤 예약자 이름을 보여주면 됩니다' },
        { text: '잘 모르겠어요', phraseId: 'p_wakarimasen', correct: false, feedback: '이름 확인 단계라 예약자 이름이나 예약 화면을 보여주는 편이 자연스럽습니다' },
        { text: '다시 한 번 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '직원이 여권을 요청한다',
      speaker: '프런트',
      promptPhraseId: 'p_passport_onegai',
      choices: [
        { text: '네', phraseId: 'p_hai', correct: true },
        { text: '여권을 건넨다', actionText: '여권 제시', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '조식은요?', phraseId: 'p_choushoku_wa', correct: false, feedback: '아직 체크인 확인 단계라 여권부터 처리하는 편이 자연스럽습니다' },
      ],
    },
    {
      situationKo: '직원이 객실 키를 건넨다',
      speaker: '프런트',
      promptPhraseId: 'p_kagi_desu',
      choices: [
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true },
        { text: '방은 어디예요?', phraseId: 'p_heya_doko', correct: true },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: false, feedback: '호텔 체크인에서는 전철 표현이라 문맥이 맞지 않습니다' },
      ],
    },
    {
      situationKo: '객실 정보는 알았고, 필요한 편의 정보를 확인한다',
      speaker: '나',
      choices: [
        { text: '와이파이는 있나요?', phraseId: 'p_wifi_arimasu_ka', correct: true },
        { text: '조식은요?', phraseId: 'p_choushoku_wa', correct: true },
        { text: '방은 어디예요?', phraseId: 'p_heya_doko', correct: true },
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: false, feedback: '물건을 사는 상황이 아니라 호텔 정보 확인 단계입니다' },
      ],
    },
  ],
};
