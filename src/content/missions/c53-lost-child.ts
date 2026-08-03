import type { Mission } from '../types';

// C53 — 미아(아이를 잃어버림). 도움 요청 → 나이·인상착의 설명 → 방송 요청 → 대기 안내 → 재회.
export const c53: Mission = {
  id: 'C53',
  tier: 5,
  scenario: '미아 찾기',
  place: '쇼핑몰·역',
  sequence: ['도움 요청', '나이·인상착의 설명', '방송 요청', '대기 안내', '재회'],
  speakPhraseIds: ['p_kodomo_wo_miushinaimashita', 'p_mitsukarimashita'],
  canDo: '아이를 잃어버렸을 때 도움을 요청하고, 나이·인상착의를 설명하고, 안내방송을 부탁할 수 있다',
  unlockAfter: ['C40'],
  steps: [
    {
      situationKo: '아이가 갑자기 안 보인다. 주변 직원에게 도움을 요청한다',
      speaker: '나',
      choices: [
        { text: '도와주세요', phraseId: 'p_tasukete', correct: true, feedback: '「助(たす)けてください」— 아이를 잃어버렸을 땐 큰 소리로 먼저 도움을 요청해요' },
        { text: '아이를 잃어버렸어요', phraseId: 'p_kodomo_wo_miushinaimashita', correct: true, feedback: '「子供(こども)を見失(みうしな)いました」— 무슨 일인지 구체적으로 바로 전해요' },
      ],
    },
    {
      situationKo: '직원이 아이의 나이와 특징을 묻는다',
      speaker: '직원',
      recapPromptJa: '何歳ですか。特徴を教えてください',
      recapPromptKo: '몇 살이에요? 특징을 알려주세요',
      choices: [
        { text: '다섯 살이에요', phraseId: 'p_gosai_desu', correct: true, feedback: '「五歳(ごさい)です」— 나이는 미아 방송에서 가장 먼저 쓰이는 정보예요' },
        { text: '빨간 옷을 입고 있어요', phraseId: 'p_akai_fuku_wo_kiteimasu', correct: true, feedback: '「赤(あか)い服(ふく)を着(き)ています」— 옷 색깔은 가장 빠른 단서가 돼요' },
      ],
    },
    {
      situationKo: '직원에게 안내방송으로 찾아달라고 부탁한다',
      speaker: '나',
      choices: [
        { text: '방송으로 찾아주실 수 있나요?', phraseId: 'p_housou_de_sagashite_moraemasu_ka', correct: true, feedback: '「放送(ほうそう)で探(さが)してもらえますか」— 매장·역의 미아 안내방송을 요청하는 표현이에요' },
        { text: '도와주세요', phraseId: 'p_tasukete', correct: true, feedback: '「助(たす)けてください」— 다시 한번 강하게 도움을 요청하며 방송을 부탁해도 돼요' },
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: false, feedback: '지금은 결제와 관련 없는 상황이에요 — 방송으로 찾아달라고 부탁해요' },
      ],
    },
    {
      situationKo: '직원이 안내데스크에서 기다리라고 안내한다',
      speaker: '직원',
      recapPromptJa: '案内デスクでお待ちください',
      recapPromptKo: '안내데스크에서 기다려 주세요',
      choices: [
        { text: '여기서 기다릴게요', phraseId: 'p_new_koko_de_machimasu', correct: true, feedback: '「ここで待(ま)っています」— 안내데스크에서 기다리겠다고 답해요' },
        { text: '기억해 둘게요', phraseId: 'p_oboete_okimasu', correct: true, feedback: '「覚(おぼ)えておきます」— 안내데스크 위치를 기억해 두는 응답' },
      ],
    },
    {
      situationKo: '직원이 아이를 데려온다. 아이를 찾았다',
      speaker: '나',
      choices: [
        { text: '찾았어요!', phraseId: 'p_mitsukarimashita', correct: true, feedback: '「見(み)つかりました」— 아이를 찾은 안도감을 전하는 한마디예요' },
        { text: '덕분에 도움이 됐어요', phraseId: 'p_tasukarimashita', correct: true, feedback: '「助(たす)かりました」— 도와준 직원에게 감사 인사로 마무리해요' },
      ],
    },
  ],
};
