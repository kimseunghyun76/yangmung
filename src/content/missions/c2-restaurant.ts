import type { Mission } from '../types';

// C2 — 식당 한 사이클. 스텝은 입장 동선 순서:
// 인원수 → 주문 받기 → 음료(일본 식당은 음료를 먼저) → 개수 → 계산 마무리.
export const c2: Mission = {
  id: 'C2',
  tier: 1,
  scenario: '식당에서 주문 (한 조각)',
  place: '식당',
  sequence: ['인원수', '주문', '음료', '개수', '알레르기 알리기', '계산'],
  speakPhraseIds: ['p_hitori_desu', 'p_kore_kudasai', 'p_okaikei'],
  canDo: '사용자는 식당에서 인원수를 답하고, 메뉴를 가리키거나 추천을 묻고, 음료와 개수를 요청하고, 식사 후 계산을 마무리할 수 있다',
  unlockAfter: ['C1'],
  steps: [
    {
      situationKo: '식당에 들어서자 점원이 인원수를 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nanmeisama',
      choices: [
        { text: '한 명이요', phraseId: 'p_hitori_desu', correct: true, feedback: '「一人(ひとり)です」— 혼자 식사를 뜻하는 말. 일본은 혼밥 문화가 발달해 있어요. おひとりさまで도 같은 뜻으로 씁니다' },
        { text: '두 명이요', phraseId: 'p_futari_desu', correct: true, feedback: '「二人(ふたり)です」— 인원 표현은 ひとり・ふたり로 불규칙해요. 세 명은 さんにん, 네 명은 よにん으로 돌아와요' },
        { text: '저기요 (주의 끌기)', phraseId: 'p_sumimasen', correct: false, feedback: '인원수 질문에는 「ひとりです / ふたりです」처럼 숫자로 답해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '자리에 앉자 점원이 주문을 받으러 온다',
      speaker: '점원',
      promptPhraseId: 'p_gochuumon',
      choices: [
        { text: '이거 주세요 (메뉴를 가리키며)', phraseId: 'p_kore_kudasai', correct: true, feedback: '「これをください」— 사진 메뉴를 가리키는 것만으로도 완벽한 주문. 일본 식당 메뉴는 대부분 사진이 있어요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 오늘의 인기 메뉴·제철 요리를 물어봐요. 현지인이 선택한 메뉴가 대개 최선이에요' },
        { text: '메뉴 좀 보여 주세요', phraseId: 'p_menu_misete', correct: true, feedback: '「メニューを見(み)せてください」— 메뉴판을 요청할 때. 사진 메뉴가 없으면 「写真(しゃしん)のメニューはありますか」도 써봐요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
        { text: '잠깐만 기다려 주세요 (메뉴 보는 중)', phraseId: 'p_chotto_matte', correct: true, feedback: '「ちょっと待ってください」— 아직 메뉴를 정하는 중일 때. 점원이 조용히 기다려줘요' },
      ],
    },
    {
      situationKo: '주문을 받은 점원이 먼저 음료를 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nomimono',
      choices: [
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true, feedback: '「お水(みず)ください」— 일본 식당 물은 대부분 무료. お水とセルフサービスがある場合は셀프로 가져가면 돼요' },
        { text: '아니요, 괜찮습니다 (음료 사양)', phraseId: 'p_iie_kekkou', correct: true, feedback: 'いいえ、結構です — 정중하게 거절할 때 가장 자연스러운 표현' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '(메뉴 사진 가리키기)', actionText: '메뉴 사진을 가리킨다', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
        { text: '아니요, 필요 없어요', phraseId: 'p_iie_irimasen', correct: true, feedback: '「いいえ、いりません」— 음료가 필요 없을 때 명확하게 거절. いいえ、結構(けっこう)です도 더 부드러운 대안이에요' },
      ],
    },
    {
      situationKo: '이어서 몇 개 시킬지 말한다',
      speaker: '나',
      choices: [
        { text: '하나 주세요', phraseId: 'p_hitotsu_kudasai', correct: true, feedback: '「一(ひと)つください」— 개수를 말할 때. ひとつ(1)·ふたつ(2)·みっつ(3)·よっつ(4) 패턴으로 10개까지 가능해요' },
        { text: '두 개 주세요', phraseId: 'p_futatsu_kudasai', correct: true, feedback: '「二(ふた)つください」— ふたつ = 두 개. 이 때도 손가락으로 2를 표시하면 더 확실하게 전달돼요' },
        { text: '이거랑 이거', phraseId: 'p_kore_to_kore', correct: true, feedback: '메뉴를 가리키며 — 발음에 자신이 없을 때 가장 안전한 주문법' },
        { text: '매워요?', phraseId: 'p_karai_desu_ka', correct: false, feedback: '확인 질문은 자연스럽지만 "주문 개수 정하기" 단계는 아니에요' },
      ],
    },
    {
      situationKo: '먹을 수 없는 재료가 있다 — 빼 달라고 부탁',
      speaker: '나',
      choices: [
        { text: '알레르기가 있어요', phraseId: 'p_arerugi', correct: true, feedback: '안전 직결 — 주문할 때 먼저 알리는 게 좋아요' },
        { text: '이거 빼 주세요', phraseId: 'p_kore_nuite', correct: true, feedback: '「これを抜(ぬ)いてください」— 특정 재료를 빼 달라는 표현. 손가락으로 가리키면 더 정확하게 전달돼요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
        { text: '계산 부탁합니다', phraseId: 'p_okaikei', correct: false, feedback: '아직 식사 전 — 계산은 마지막에' },
      ],
    },
    {
      situationKo: '식사를 마치고 계산대로 향한다',
      speaker: '나',
      choices: [
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: true, feedback: '「お会計(かいけい)お願いします」— 일본 식당은 자리에서 결제하거나 계산대로 가는 방식이 있어요. 직원을 부르거나 계산대로 가서 말해요' },
        { text: '따로따로요 (각자 계산)', phraseId: 'p_betsubetsu_de', correct: true, feedback: '동행자와 나눠 낼 때 — 계산대에서 미리 말하면 매끄러워요' },
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: true, feedback: '계산하며 곁들이면 인상이 좋아지는 마무리 인사' },
        { text: '메뉴 좀 보여 주세요', phraseId: 'p_menu_misete', correct: false, feedback: '식사를 마친 단계라 메뉴 요청은 흐름에 안 맞아요' },
      ],
    },
  ],
};
