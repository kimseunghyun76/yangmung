import type { Mission } from '../types';

// C13 — 라멘집 식권기. 도쿄 라멘집 = 입구 식권기 + 替え玉(면 추가) 문화.
export const c13: Mission = {
  id: 'C13',
  tier: 2,
  scenario: '라멘집 식권기에서 주문',
  place: '라멘',
  canDo: '사용자는 식권기 위치·사용법을 묻고, 곱빼기·면 추가를 요청하며, 막히면 다시·천천히·영어를 청할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['식권기 찾기', '음료 확인', '면 추가·곱빼기'],
  speakPhraseIds: ['p_kenbaiki', 'p_oomori', 'p_kaedama'],
  steps: [
    {
      situationKo: '입구 식권기 앞에서 막혔다',
      speaker: '나',
      choices: [
        { text: '식권기 어디예요?', phraseId: 'p_kenbaiki', correct: true, feedback: '券売機(けんばいき)는どこですか — 라멘집·소바집은 입구 식권기가 기본. 먼저 표를 뽑고 자리에 앉는 게 순서예요' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true, feedback: '「使い方を教えてください」— 기계가 낯설면 주저 없이 물어봐요. 일본 점원은 친절하게 직접 눌러줄 만큼 적극적이에요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何ですか」— 현지 맛집 베스트 메뉴를 물어보는 표현. 인기 라멘집은 간판 메뉴가 있으니 꼭 물어봐요' },
        { text: '표 주세요', phraseId: 'p_kippu_kudasai', correct: false, feedback: '역에서 쓰는 말이에요 — 라멘집은 식권기(券売機)예요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '자리에 앉자 직원이 음료를 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nomimono',
      choices: [
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true, feedback: '「お水(みず)ください」— 일본 식당 물은 대부분 무료(셀프). セルフサービス(셀프서비스) 표시가 있으면 직접 가져다 먹어요' },
        { text: '괜찮습니다', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 필요 없을 때 정중하게 거절하는 표현. 고개를 살짝 가로저으면 더 명확하게 전달돼요' },
        { text: '환전해 주세요', phraseId: 'p_ryougae', correct: false, feedback: '여긴 라멘집이에요 — 환전소 표현이에요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '자리에 앉아 양을 정한다',
      speaker: '나',
      choices: [
        { text: '곱빼기 되나요?', phraseId: 'p_oomori', correct: true, feedback: '大盛り(おおもり)できますか — 가게마다 무료·유료가 달라요. 식권기에 ボタン(버튼)이 있는 경우도 많으니 미리 확인해요' },
        { text: '면 추가요', phraseId: 'p_kaedama', correct: true, feedback: '替え玉(かえだま)는 라멘 면 사리 추가 — 도쿄·하카타 필수' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};
