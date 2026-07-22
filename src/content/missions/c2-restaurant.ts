import type { Mission } from '../types';

// C2 — 식당 한 사이클. 스텝은 입장 동선 순서:
// 인원수 → 주문 받기 → 음료(일본 식당은 음료를 먼저) → 개수 → 계산 마무리.
export const c2: Mission = {
  id: 'C2',
  tier: 1,
  scenario: '식당에서 주문 (한 조각)',
  place: '식당',
  sequence: ['인원수', '주문', '음료', '개수', '알레르기 알리기', '계산'],
  speakPhraseIds: ['p_hitori_desu', 'p_hitotsu_kudasai', 'p_gochisousama'],
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
      ],
    },
    {
      situationKo: '자리에 앉자 점원이 주문을 받으러 온다',
      speaker: '점원',
      promptPhraseId: 'p_gochuumon',
      choices: [
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 오늘의 인기 메뉴·제철 요리를 물어봐요. 현지인이 선택한 메뉴가 대개 최선이에요' },
        { text: '메뉴 좀 보여 주세요', phraseId: 'p_menu_misete', correct: true, feedback: '「メニューを見(み)せてください」— 메뉴판을 요청할 때. 사진 메뉴가 없으면 「写真(しゃしん)のメニューはありますか」도 써봐요' },
        { text: '잠깐만 기다려 주세요', phraseId: 'p_chotto_matte', correct: true, feedback: '「ちょっと待ってください」— 아직 메뉴를 정하는 중일 때. 점원이 조용히 기다려줘요' },
      ],
    },
    {
      situationKo: '주문을 받은 점원이 먼저 음료를 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_nomimono',
      choices: [
        { text: '물 주세요', phraseId: 'p_mizu_kudasai', correct: true, feedback: '「お水(みず)ください」— 일본 식당 물은 대부분 무료. お水とセルフサービスがある場合は셀프로 가져가면 돼요' },
        { text: '아니요, 괜찮습니다 (정중하게 거절)', phraseId: 'p_iie_kekkou', correct: true, feedback: 'いいえ、結構です — 정중하게 거절할 때 가장 자연스러운 표현' },
        { text: '아니요, 필요 없어요', phraseId: 'p_iie_irimasen', correct: true, feedback: '「いいえ、いりません」— 음료가 필요 없을 때 명확하게 거절. いいえ、結構(けっこう)です도 더 부드러운 대안이에요' },
      ],
    },
    {
      situationKo: '점원이 몇 개로 할지 묻는다 — 개수를 말한다',
      speaker: '나',
      choices: [
        { text: '하나 주세요', phraseId: 'p_hitotsu_kudasai', correct: true, feedback: '「一(ひと)つください」— 메뉴 이름 뒤에 붙이면 개수 주문 완성. ひとつ(1)·ふたつ(2)·みっつ(3)·よっつ(4) 패턴으로 10개까지 가능해요' },
        { text: '두 개 주세요', phraseId: 'p_futatsu_kudasai', correct: true, feedback: '「二(ふた)つください」— 여러 개 주문할 때. 손가락으로 숫자를 함께 보여주면 더 확실하게 전달돼요' },
        { text: '이거랑 이거', phraseId: 'p_kore_to_kore', correct: true, feedback: '「これとこれ」— 사진 메뉴를 두 손가락으로 가리키면 말이 안 통해도 OK. 가장 안전한 주문법이에요' },
        { text: '매워요?', phraseId: 'p_karai_desu_ka', correct: false, feedback: '개수를 정하는 타이밍에는 맞지 않아요. 주문 전에 미리 물어보세요' },
      ],
    },
    {
      situationKo: '먹을 수 없는 재료가 있다 — 빼 달라고 부탁',
      speaker: '나',
      choices: [
        { text: '메밀·땅콩 알레르기가 있어요', phraseId: 'p_arerugi', correct: true, feedback: '「アレルギーがあります」— 주문 전에 반드시 전달. 메밀(そば)·땅콩(ピーナッツ)·새우(えび)는 일본 식당에서 특히 주의 식재료예요' },
        { text: '이거 빼 주세요', phraseId: 'p_kore_nuite', correct: true, feedback: '「これを抜(ぬ)いてください」— 특정 재료를 빼 달라는 표현. 손가락으로 가리키면 더 정확하게 전달돼요' },
      ],
    },
    {
      situationKo: '식사를 마치고 계산대로 향한다',
      speaker: '나',
      choices: [
        { text: '따로따로요', phraseId: 'p_betsubetsu_de', correct: true, feedback: '동행자와 나눠 낼 때 — 계산대에서 미리 말하면 매끄러워요' },
        { text: '잘 먹었습니다', phraseId: 'p_gochisousama', correct: true, feedback: '계산하며 곁들이면 인상이 좋아지는 마무리 인사' },
        { text: '메뉴 좀 보여 주세요', phraseId: 'p_menu_misete', correct: false, feedback: '식사를 마친 단계라 메뉴 요청은 흐름에 안 맞아요' },
      ],
    },
  ],
};
