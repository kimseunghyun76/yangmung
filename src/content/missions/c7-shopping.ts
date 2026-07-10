import type { Mission } from '../types';

// C7 — 쇼핑·면세. 가격 묻기 → 입어보기 → 면세·결제. 도쿄 백화점·드러그스토어 면세 실전.
export const c7: Mission = {
  id: 'C7',
  tier: 1,
  scenario: '쇼핑하고 면세 받기',
  place: '쇼핑',
  canDo: '사용자는 가격·사이즈·색을 묻고 입어본 뒤 결정하며, 면세·결제·포장까지 실제 흐름대로 처리할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['가격 묻기', '사이즈·색', '입어본 뒤', '면세 확인', '결제', '포장'],
  speakPhraseIds: ['p_kore_ikura', 'p_menzei_dekimasu_ka', 'p_card_tsukaemasu_ka'],
  steps: [
    {
      situationKo: '마음에 드는 물건을 봤다 — 가격·착용 확인',
      speaker: '나',
      choices: [
        { text: '이거 얼마예요?', phraseId: 'p_kore_ikura', correct: true, feedback: '「これいくらですか」— 가장 기본적인 쇼핑 표현. これ(이것)를 あれ(저것)·それ(그것)로 바꾸면 어디서든 써요' },
        { text: '입어 봐도 돼요?', phraseId: 'p_shichaku', correct: true, feedback: '試着(しちゃく)してもいいですか — 일본 매장은 허락 없이 입어보면 실례예요. 한 마디만 해도 직원이 기뻐해요' },
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true, feedback: '「カードは使えますか」— 구매 전 미리 확인하면 현금 준비 여부를 결정할 수 있어요' },
      ],
    },
    {
      situationKo: '점원이 사이즈가 어떤지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_saizu_ikaga',
      choices: [
        { text: 'M 사이즈 있나요?', phraseId: 'p_emu_saizu_arimasu_ka', correct: true, feedback: '「Mサイズはありますか」— 일본 사이즈는 한국보다 작은 편이에요(일본 M ≒ 한국 S~M). 표기를 꼭 확인해요' },
        { text: '다른 색 있나요?', phraseId: 'p_hoka_no_iro_arimasu_ka', correct: true, feedback: '「他(ほか)の色(いろ)はありますか」— 색상 문의. 他の는 "다른"이라는 뜻으로 サイズ·デザイン에도 응용돼요' },
        { text: '입어 봐도 돼요?', phraseId: 'p_shichaku', correct: true, feedback: '「試着(しちゃく)してもいいですか」— 사이즈가 애매하면 직접 입어보는 게 확실해요. 보통 3벌 이내로 제한돼요' },
        { text: '면세 되나요?', phraseId: 'p_menzei_dekimasu_ka', correct: false, feedback: '아직 살지 정하기 전이에요 — 면세는 구매를 결정한 뒤에 물어봐요' },
      ],
    },
    {
      situationKo: '입어 본 뒤 점원이 어떤지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_ikaga_desu_ka',
      choices: [
        { text: '조금 작아요', phraseId: 'p_chotto_chiisai_desu', correct: true, feedback: '「ちょっと小(ちい)さいです」— ちょっと를 붙이면 부드럽게 전달돼요. 이어서 「Lサイズはありますか」로 연결하면 완벽해요' },
        { text: '이걸로 할게요', phraseId: 'p_kore_kudasai_shop', correct: true, feedback: '「これをください」— 마음에 들면 바로 구매 확정. 계산대로 들고 가거나 점원에게 건네요' },
        { text: '다른 색 있나요?', phraseId: 'p_hoka_no_iro_arimasu_ka', correct: true, feedback: '「他(ほか)の色(いろ)はありますか」— 사이즈는 맞는데 색이 아쉬우면 다른 색을 물어봐요' },
        { text: '영수증 주세요', phraseId: 'p_ryoushuusho', correct: false, feedback: '아직 계산 전이에요 — 영수증은 결제한 뒤에 받아요' },
      ],
    },
    {
      situationKo: '사기로 했다 — 면세가 되는지 묻는다',
      speaker: '나',
      choices: [
        { text: '면세 되나요?', phraseId: 'p_menzei_dekimasu_ka', correct: true, feedback: '免税(めんぜい)できますか — 5,000엔 이상 구매 시 소비세 10%를 돌려받아요. 총액 기준이므로 여러 매장은 합산 불가' },
        { text: '여권 여기 있어요', phraseId: 'p_pasupooto_arimasu', correct: true, feedback: '「パスポートあります」— 면세(免税) 처리에는 여권 원본이 필수. 복사본·사진은 불가예요. 여권 번호가 등록되므로 미리 꺼내두면 수속이 빠르게 진행돼요' },
        { text: '이걸로 할게요', phraseId: 'p_kore_kudasai_shop', correct: true, feedback: '「これをください」— 물건을 가리키며 간단하게 구매 의사를 전해요. 일본어를 못해도 손가락+이 표현이면 충분해요' },
      ],
    },
    {
      situationKo: '계산대에서 결제 방법을 정한다',
      speaker: '나',
      choices: [
        { text: '카드 돼요?', phraseId: 'p_card_tsukaemasu_ka', correct: true, feedback: '일본은 아직 현금 문화가 강한 편이에요. 특히 작은 가게·전통 시장은 현금만 받는 경우도 많아요' },
        { text: '이걸로 할게요', phraseId: 'p_kore_kudasai_shop', correct: true, feedback: '계산대에서 「これをください」로 최종 구매 확정. 점원이 금액을 알려주면 지불하면 돼요' },
      ],
    },
    {
      situationKo: '점원이 포장해 줄지 묻는다',
      speaker: '점원',
      promptPhraseId: 'p_otsutsumi_shimasu_ka',
      choices: [
        { text: '선물 포장 부탁합니다', phraseId: 'p_gift_wrapping_onegai', correct: true, feedback: '「ギフトラッピングお願(ねが)いします」— 일본 백화점·매장의 선물 포장은 수준이 높아요. 대부분 무료 또는 저렴해요' },
        { text: '이거 얼마예요?', phraseId: 'p_kore_ikura', correct: false, feedback: '지금 상황에 맞는 답은 아니에요.' },
      ],
    },
  ],
};
