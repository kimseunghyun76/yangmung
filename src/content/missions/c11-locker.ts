import type { Mission } from '../types';

// C11 — 코인로커. 역·관광지에서 짐 맡기기.
export const c11: Mission = {
  id: 'C11',
  tier: 2,
  scenario: '코인로커에 짐 맡기기',
  place: '코인로커',
  canDo: '사용자는 코인로커 위치·크기·사용법·요금·이용 시간을 묻고, 안내를 못 알아들으면 다시·천천히·영어를 청할 수 있다',
  unlockAfter: ['C3'],
  sequence: ['로커 찾기', '크기 선택', '사용법 확인', '요금 확인', '이용 시간'],
  speakPhraseIds: ['p_koinrokkaa', 'p_ookii_no_de', 'p_tsukaikata'],
  steps: [
    {
      situationKo: '무거운 짐을 맡기고 싶다',
      speaker: '나',
      choices: [
        { text: '코인로커 어디예요?', phraseId: 'p_koinrokkaa', correct: true, feedback: 'コインロッカーはどこですか — 대형 역 로커는 매진되기 쉬워요. 개찰구 안팎 모두 확인해보세요' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: true, feedback: '「使い方(つかいかた)を教えてください」— 낯선 기계 앞에서 쓰는 만능 표현. 직원이 직접 눌러줄 만큼 친절해요' },
      ],
    },
    {
      situationKo: '안내원이 어떤 크기의 로커로 할지 묻는다',
      speaker: '안내 직원',
      promptPhraseId: 'p_locker_size',
      choices: [
        { text: '큰 걸로 부탁해요', phraseId: 'p_ookii_no_de', correct: true, feedback: '「大(おお)きいので」— 캐리어는 大型(おおがた) 로커. 小(しょう)·中(ちゅう)·大(だい) 순으로 요금이 올라가요' },
        { text: '작은 걸로 부탁해요', phraseId: 'p_chiisai_no_de', correct: true, feedback: '「小(ちい)さいので」— 가방 하나면 작은 로커로 충분해요. 가장 저렴해요' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: false, feedback: '먼저 크기를 정해요 — 사용법은 로커를 고른 뒤에 물어봐요' },
      ],
    },
    {
      situationKo: '직원이 빠르게 사용법을 설명한다',
      speaker: '직원',
      promptPhraseId: 'p_kono_botan_oshite',
      choices: [
        { text: '사용법 알겠어요', phraseId: 'p_tsukaikata_wakatta', correct: true, feedback: '「使(つか)い方(かた)が分(わ)かりました」— 설명을 듣고 이해했다는 신호. 정말 이해했을 때만 쓰고, 헷갈리면 もう一度를 청하는 게 좋아요' },
        { text: '코인로커 어디예요?', phraseId: 'p_koinrokkaa', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
    {
      situationKo: '이용 요금을 안내받는다',
      speaker: '직원',
      promptPhraseId: 'p_price',
      choices: [
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: false, feedback: '사용법은 이미 안내받았어요 — 지금은 요금 결제 수단을 말해요' },
        { text: '동전밖에 없는데, 괜찮아요?', phraseId: 'p_new_kozeni_shika_nai', correct: true, feedback: '「小銭(こぜに)しかないんですけど、大丈夫(だいじょうぶ)ですか」— 천 엔이라는 금액을 듣고 동전 결제 가능 여부를 되묻는 자연스러운 반응이에요. 코인로커 특성상 실제로 많이 쓰이는 표현입니다' },
      ],
    },
    {
      situationKo: '짐을 넣고 언제까지 쓸 수 있는지 확인한다',
      speaker: '나',
      choices: [
        { text: '몇 시까지 쓸 수 있어요?', phraseId: 'p_nanji_made', correct: true, feedback: '「何時(なんじ)まで使(つか)えますか」— 역 로커는 막차(終電) 전에 찾아야 하는 경우도 있어요. 며칠 보관 가능한 곳도 있어요' },
        { text: '번호 메모해 둘게요', phraseId: 'p_bangou_memo', correct: true, feedback: '「番号(ばんごう)をメモしておきます」— 로커 번호·비밀번호를 잊지 않게 적어두겠다는 표현. 찾을 때 헤매지 않도록 실용적인 마무리예요' },
      ],
    },
  ],
};
