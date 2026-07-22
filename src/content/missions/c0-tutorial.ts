import type { Mission } from '../types';

// C0 — 생존 회화 기초 (튜토리얼). 어느 미션에서든 쓸 수 있는 범용 표현(복구·긍정 응답·
// 호출·결제·위치/가격 묻기)을 여기서만 가르친다 — 다른 미션(C1~C50)은 이 표현들을
// choices/promptPhraseId로 다시 쓰지 않는다(validate.ts V22가 강제). 항상 최우선 해금.
// 복구 표현 4종은 (엔진 설계상) 정답 풀에서 제외되고 별도 RecoverySkipAction으로만 노출되므로,
// 실콘텐츠 정답이 있는 스텝에 하나씩 곁들여 "정답이 전부 recovery"(퀴즈 정답 0개 버그)를 피한다.
export const c0: Mission = {
  id: 'C0',
  tier: 1,
  scenario: '가게에 들어가며 — 생존 회화 기초 (튜토리얼)',
  place: '가게',
  canDo: '사용자는 가게에서 인사·복구 요청·이해 확인·호출·결제 수단·가격/위치 묻기 등 어떤 장면에서나 쓰는 기본 회화를 할 수 있다',
  unlockAfter: ['u_b0_reaction'],
  steps: [
    {
      situationKo: '점원이 「어서 오세요」 하고 맞이해요 — 어떻게 인사할까요?',
      speaker: '점원',
      promptPhraseId: 'p_irasshai',
      choices: [
        { text: '안녕하세요', phraseId: 'p_konnichiwa', correct: true, feedback: '「こんにちは」— 낮 인사. 아침엔 おはようございます, 저녁엔 こんばんは. 가게에 들어서면 이렇게 인사해 봐요' },
        { text: '감사합니다 (정중)', phraseId: 'p_arigatou_gozaimasu', correct: false, feedback: '「ありがとうございます」는 고맙거나 나갈 때 인사예요. 막 들어와 맞이 인사를 받았을 땐 こんにちは가 자연스러워요' },
        { text: '다시 한 번 부탁합니다', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '점원이 안내를 마치고 이해했는지 확인한다',
      speaker: '점원',
      recapPromptJa: 'こちらの内容でよろしいですか',
      recapPromptKo: '이 내용으로 괜찮으실까요?',
      choices: [
        { text: '네', phraseId: 'p_hai', correct: true, feedback: '「はい」— 가장 기본적인 긍정 응답. 어떤 확인 질문에도 쓸 수 있어요' },
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '「分(わ)かりました」— 안내나 설명을 이해했을 때. はい보다 더 적극적인 이해 확인이에요' },
        { text: '네, 알겠습니다', phraseId: 'p_hai_wakarimashita', correct: true, feedback: '「はい、分(わ)かりました」— はい를 더해 더 성실하고 확실한 이해를 표현해요' },
        { text: '괜찮습니다 (정중)', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 상황에 따라 "괜찮습니다/됐습니다"로 두루 쓰이는 만능 확인 표현이에요' },
        { text: '천천히 부탁합니다', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '멀리 있는 점원에게 뭔가 물어보고 싶어서 불러야 한다',
      speaker: '나',
      choices: [
        { text: '저기요 / 죄송합니다', phraseId: 'p_sumimasen', correct: true, feedback: '「すみません」— 주의를 끌 때·사과할 때·가볍게 감사할 때까지 만능 표현. 점원을 부를 때 가장 먼저 쓰는 말이에요' },
        { text: '감사합니다 (정중)', phraseId: 'p_arigatou_gozaimasu', correct: false, feedback: '아직 인사할 때가 아니에요 — 점원을 부르고 싶을 땐 すみません이 자연스러워요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '다가온 점원이 봉투가 필요한지 묻는다',
      speaker: '점원',
      recapPromptJa: '袋はご利用になりますか',
      recapPromptKo: '봉투 필요하세요?',
      choices: [
        { text: '네, 부탁합니다', phraseId: 'p_hai_onegai', correct: true, feedback: '「はい、お願(ねが)いします」— 봉투·데우기·포인트카드 등 모든 YES 답변에 쓸 수 있어요' },
        { text: '괜찮습니다 (정중)', phraseId: 'p_daijoubu_desu', correct: true, feedback: '「大丈夫(だいじょうぶ)です」— 필요 없다는 정중한 거절로도 자연스럽게 쓰여요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '가게를 둘러보다가 필요한 걸 묻거나, 사고 싶은 걸 골랐다',
      speaker: '나',
      choices: [
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: true, feedback: '「これをください」— 메뉴나 상품을 가리키며 하는 가장 간단한 주문 표현이에요' },
        { text: '어디예요?', phraseId: 'p_doko_desu_ka', correct: true, feedback: '「どこですか」— 위치 확인 기본 패턴. すみません、○○はどこですか 형태로 어디서든 응용 가능해요' },
        { text: '얼마예요?', phraseId: 'p_ikura_desu_ka', correct: true, feedback: '「いくらですか」— 가격 확인 기본 표현. 가격표가 없는 곳에서 특히 유용해요' },
      ],
    },
    {
      situationKo: '다 골랐다. 계산하고 싶다',
      speaker: '나',
      choices: [
        { text: '계산 부탁드립니다', phraseId: 'p_okaikei', correct: true, feedback: '「お会計(かいけい)お願(ねが)いします」— 자리에서 직원을 부르거나 계산대로 가서 씁니다' },
        { text: '이거 주세요', phraseId: 'p_kore_kudasai', correct: false, feedback: '지금은 물건을 고르는 게 아니라 계산을 요청할 차례예요' },
      ],
    },
    {
      situationKo: '점원이 결제 방법을 묻는다',
      speaker: '점원',
      recapPromptJa: 'お支払いはどうされますか',
      recapPromptKo: '결제는 어떻게 하시겠어요?',
      choices: [
        { text: '카드로요', phraseId: 'p_card_de', correct: true, feedback: '「カードで」— 카드 결제 선택. 편의점·체인 식당은 대부분 카드 OK' },
        { text: '현금으로요', phraseId: 'p_genkin_de', correct: true, feedback: '「現金(げんきん)で」— 현금 결제 선택. で는 수단을 나타내는 조사예요' },
        { text: '이걸로 부탁드려요', phraseId: 'p_kore_de', correct: true, feedback: '「これでお願(ねが)いします」— 지갑·카드·IC카드를 보여주며 "이걸로 낼게요"라고 할 때 써요' },
      ],
    },
  ],
};
