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
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '코인로커는 크기에 따라 300~700엔 정도. 최근엔 Suica 결제 가능한 곳도 많아요. 동전보다 편리해요' },
        { text: '카드로요', phraseId: 'p_card_de', correct: false, feedback: '아직 로커를 찾는 중이에요 — 결제 수단은 요금을 확인한 뒤에 말해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
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
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '직원이 빠르게 사용법을 설명한다',
      speaker: '직원',
      promptPhraseId: 'p_kono_botan_oshite',
      choices: [
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '설명을 들은 후 「わかりました」로 이해 표시. 실제로 모르면 솔직히 다시 물어보는 게 나아요. 침묵은 상대를 당황하게 해요' },
        { text: '사용법 알겠어요', phraseId: 'p_tsukaikata_wakatta', correct: true, feedback: '「使(つか)い方(かた)が分(わ)かりました」— 설명을 듣고 이해했다는 신호. 정말 이해했을 때만 쓰고, 헷갈리면 もう一度를 청하는 게 좋아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '이용 요금을 안내받는다',
      speaker: '직원',
      promptPhraseId: 'p_price',
      choices: [
        { text: '카드로요', phraseId: 'p_card_de', correct: true, feedback: '「カードで」— IC카드(Suica·PASMO) 결제가 되는 로커가 늘고 있어요. 동전이 없을 때 특히 유용해요' },
        { text: '현금으로요', phraseId: 'p_genkin_de', correct: true, feedback: '「現金(げんきん)で」— 코인로커는 이름 그대로 동전 결제가 기본이에요. 소액 동전을 미리 준비해두면 편해요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: false, feedback: '방금 요금을 들었어요. 들은 뒤에는 결제 수단을 말해요' },
        { text: '사용법 알려 주세요', phraseId: 'p_tsukaikata', correct: false, feedback: '사용법은 이미 안내받았어요 — 지금은 요금 결제 수단을 말해요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '짐을 넣고 언제까지 쓸 수 있는지 확인한다',
      speaker: '나',
      choices: [
        { text: '몇 시까지 쓸 수 있어요?', phraseId: 'p_nanji_made', correct: true, feedback: '「何時(なんじ)まで使(つか)えますか」— 역 로커는 막차(終電) 전에 찾아야 하는 경우도 있어요. 며칠 보관 가능한 곳도 있어요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '「いくらですか」— 하루 초과 시 추가 요금이 붙는 로커도 있어요. 이용 시간과 요금을 함께 확인해요' },
        { text: '번호 메모해 둘게요', phraseId: 'p_bangou_memo', correct: true, feedback: '「番号(ばんごう)をメモしておきます」— 로커 번호·비밀번호를 잊지 않게 적어두겠다는 표현. 찾을 때 헤매지 않도록 실용적인 마무리예요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
  ],
};
