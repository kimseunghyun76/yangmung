import type { Mission } from '../types';

// C7 — 쇼핑·면세. 가격 묻기 → 입어보기 → 면세·결제. 도쿄 백화점·드러그스토어 면세 실전.
export const c7: Mission = {
  id: 'C7',
  tier: 1,
  scenario: '쇼핑하고 면세 받기',
  place: '쇼핑',
  canDo: '사용자는 가격을 묻고, 입어봐도 되는지 확인하고, 면세·카드 결제를 요청하며 여권을 제시할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['가격 묻기', '입어보기', '면세 확인', '결제'],
  speakPhraseIds: ['p_kore_ikura', 'p_menzei_dekimasu_ka', 'p_card_tsukaemasu_ka'],
  steps: [
    {
      situationKo: '마음에 드는 물건을 봤다 — 가격·착용 확인',
      speaker: '나',
      choices: [
        { text: '이거 얼마예요?', phraseId: 'p_kore_ikura', correct: true, feedback: '「これいくらですか」— 가장 기본적인 쇼핑 표현. これ(이것)를 あれ(저것)·それ(그것)로 바꾸면 어디서든 써요' },
        { text: '입어 봐도 돼요?', phraseId: 'p_shichaku', correct: true, feedback: '試着(しちゃく)してもいいですか — 일본 매장은 허락 없이 입어보면 실례예요. 한 마디만 해도 직원이 기뻐해요' },
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true, feedback: '「カードは使えますか」— 구매 전 미리 확인하면 현금 준비 여부를 결정할 수 있어요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '사기로 했다 — 면세가 되는지 묻는다',
      speaker: '나',
      choices: [
        { text: '면세 되나요?', phraseId: 'p_menzei_dekimasu_ka', correct: true, feedback: '免税(めんぜい)できますか — 5,000엔 이상 구매 시 소비세 10%를 돌려받아요. 총액 기준이므로 여러 매장은 합산 불가' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true, feedback: '「パスポートあります」— 면세(免税) 처리에는 여권 원본이 필수. 복사본·사진은 불가예요. 여권 번호가 등록되므로 미리 꺼내두면 수속이 빠르게 진행돼요' },
        { text: '이걸로 할게요', phraseId: 'p_kore_kudasai_shop', correct: true, feedback: '「これをください」— 물건을 가리키며 간단하게 구매 의사를 전해요. 일본어를 못해도 손가락+이 표현이면 충분해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '계산대에서 결제 방법을 정한다',
      speaker: '나',
      choices: [
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true, feedback: '일본은 아직 현금 문화가 강한 편이에요. 특히 작은 가게·전통 시장은 현금만 받는 경우도 많아요' },
        { text: '이걸로 할게요', phraseId: 'p_kore_kudasai_shop', correct: true, feedback: '계산대에서 「これをください」로 최종 구매 확정. 점원이 금액을 알려주면 지불하면 돼요' },
        { text: '현금으로요', phraseId: 'p_genkin_de', correct: true, feedback: '「現金(げんきん)で」— 현금 결제 표현. 일본 여행엔 현금을 넉넉히 준비하는 게 여전히 안전해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'full' },
      ],
    },
  ],
};
