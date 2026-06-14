import type { Mission } from '../types';

// C8 — 택시. 행선지 말하기 → 도착·세우기·영수증. 도쿄 늦은 밤·짐 많을 때.
export const c8: Mission = {
  id: 'C8',
  tier: 1,
  scenario: '택시 타기',
  place: '택시',
  canDo: '사용자는 택시에서 행선지를 말하고, 원하는 곳에서 세워 달라고 하고, 영수증을 받을 수 있다',
  unlockAfter: ['C3'],
  sequence: ['행선지 말하기', '이동 중', '내리기'],
  speakPhraseIds: ['p_made_onegai', 'p_koko_de_tomete', 'p_ryoushuusho'],
  steps: [
    {
      situationKo: '택시를 타며 행선지를 말한다',
      speaker: '나',
      choices: [
        { text: '시부야까지 가주세요', phraseId: 'p_made_onegai', correct: true, feedback: '「渋谷(しぶや)までお願(ねが)いします」— 목적지 뒤에 まで를 붙이면 어디든 전달 가능. 일본 택시는 자동문이라 직접 열지 않아도 되고, 주소 메모나 지도 화면을 보여주면 더 정확해요' },
        { text: '택시 불러주세요', phraseId: 'p_takushi_onegai', correct: false, feedback: '이미 택시에 탔어요. 부르는 표현은 호텔 프런트에서 써요' },
        { text: '신주쿠역은 어디예요?', phraseId: 'p_shinjuku_doko', correct: false, feedback: '기사에게는 길을 묻는 게 아니라 행선지를 말해요. 「〇〇までお願いします」' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '기사가 행선지를 되묻는다',
      speaker: '기사',
      promptPhraseId: 'p_doko_made',
      choices: [
        { text: '시부야까지 가주세요', phraseId: 'p_made_onegai', correct: true, feedback: '기사가 못 알아들었을 때 또렷이 한 번 더. 지명을 한자로 쓴 쪽지를 보여줘도 효과적이에요' },
        { text: '(지도를 보여준다)', actionText: '지도 화면을 보여준다', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '여기서 세워 주세요', phraseId: 'p_koko_de_tomete', correct: false, feedback: '아직 출발 단계 — 행선지를 먼저 확인해요' },
      ],
    },
    {
      situationKo: '목적지에 가까워졌다 — 내릴 준비',
      speaker: '나',
      choices: [
        { text: '여기서 세워 주세요', phraseId: 'p_koko_de_tomete', correct: true, feedback: '「ここで止(と)めてください」— 정확한 위치에서 내리려면 「その角で」(그 모퉁이에서) 등과 함께 써요' },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: true, feedback: '「領収書(りょうしゅうしょ)ください」— 출장 경비 청구나 분실물 신고 시 필요해요. 미터기 요금도 함께 확인하세요' },
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true, feedback: '내릴 때 ありがとうございます 한 마디 — 도쿄 택시 기사는 서비스에 자부심이 강해요. 인사는 꼭 해요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '미터기가 있지만 요금판이 헷갈리면 직접 물어봐도 괜찮아요. 심야(22시 이후)는 할증이 붙어요' },
      ],
    },
  ],
};
