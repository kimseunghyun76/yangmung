import type { Mission } from '../types';

// C1 — 편의점 계산대. 스텝은 실제 계산 동선 순서:
// 봉투 담기 → 데우기 → 젓가락 → 포인트카드 → 합계 → 결제.
export const c1: Mission = {
  id: 'C1',
  scenario: '편의점 계산대',
  place: '편의점',
  canDo: '사용자는 편의점 계산대에서 봉투·결제 방법·포인트카드·젓가락·데우기 여부를 듣고, 필요/불필요와 결제 수단을 짧게 답할 수 있다',
  unlockAfter: ['u_b0_reaction', 'u_b4_recovery'],
  steps: [
    {
      situationKo: '계산대에 물건을 올리자 점원이 봉투가 필요한지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_fukuro',
      choices: [
        { text: '네 (필요해요)', phraseId: 'p_hai', correct: true },
        { text: '아니요 (괜찮아요)', phraseId: 'p_iie', correct: true },
        { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: true },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '도시락을 보고 점원이 데울지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_atatamemasu_ka',
      choices: [
        { text: '데워 주세요', phraseId: 'p_atatamete', correct: true },
        { text: '그대로 주세요 (괜찮아요)', phraseId: 'p_sono_mama_de', correct: true, feedback: '데우지 않을 때 가장 자연스러운 한마디' },
        { text: '네', phraseId: 'p_hai', correct: true, feedback: 'はい만으로도 "데워 달라"는 뜻이 전달돼요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '이어서 젓가락이 필요한지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_hashi_irimasu_ka',
      choices: [
        { text: '젓가락 주세요', phraseId: 'p_hashi_kudasai', correct: true },
        { text: '필요 없어요', phraseId: 'p_irimasen', correct: true },
        { text: '그대로 주세요', phraseId: 'p_sono_mama_de', correct: true, feedback: '데우지 말고 그대로 — 젓가락도 그대로(=불필요)로 통할 수 있어요' },
        { text: '스이카로요', phraseId: 'p_suica_de', correct: false, feedback: '결제 방법과 헷갈리지 마세요 — 지금은 젓가락 질문' },
      ],
    },
    {
      situationKo: '물건을 다 담은 뒤 포인트카드가 있는지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_pointo_arimasu_ka',
      choices: [
        { text: '없어요', phraseId: 'p_arimasen', correct: true },
        { text: '있어요', phraseId: 'p_arimasu', correct: true },
        { text: '영수증 주세요', phraseId: 'p_reshiito_kudasai', correct: false, feedback: '지금은 포인트카드 질문 — 영수증 요청은 흐름이 어긋나요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '그리고 합계 금액을 빠르게 말한다',
      speaker: '점원',
      promptPhraseId: 'p_price',
      choices: [
        { text: '(동전을 건넨다)', actionText: '동전을 건넨다', correct: true },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '(번역앱 보여주기)', actionText: '번역앱 화면을 보여준다', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '모르겠어요', phraseId: 'p_wakarimasen', correct: false, feedback: '솔직하지만, 막혔을 땐 ゆっくり 요청이 더 생산적' },
      ],
    },
    {
      situationKo: '마지막으로 점원이 결제 방법을 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_shiharai_houhou',
      choices: [
        { text: '현금으로요', phraseId: 'p_genkin_de', correct: true },
        { text: '카드로요', phraseId: 'p_card_de', correct: true },
        { text: '스이카로요', phraseId: 'p_suica_de', correct: true, feedback: '교통카드(Suica)로 편의점 결제도 OK — 「ピッ」 하면 끝' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
  ],
};
