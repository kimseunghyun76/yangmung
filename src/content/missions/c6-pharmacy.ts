import type { Mission } from '../types';

// C6 — 약국. 증상 말하기 → 약 받기. 도쿄 드러그스토어 어디나.
export const c6: Mission = {
  id: 'C6',
  tier: 1,
  scenario: '약국에서 약 사기',
  place: '약국',
  canDo: '사용자는 약국에서 증상·열·기침을 말하고, 알레르기/임신 여부를 전하며, 약과 복용법을 확인하고 결제할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['증상 말하기', '증상 부연', '약 요청', '안전 확인', '복용 확인', '결제'],
  speakPhraseIds: ['p_atama_itai', 'p_netsu_arimasu', 'p_kono_kusuri'],
  steps: [
    {
      situationKo: '약사가 어디가 안 좋은지 묻는다',
      speaker: '약사',
      promptPhraseId: 'p_dou_shimashita',
      choices: [
        { text: '머리가 아파요', phraseId: 'p_atama_itai', correct: true, feedback: '「頭(あたま)が痛いです」— 痛い(いたい)는 아프다는 뜻. 〇〇が痛いです 패턴으로 어느 부위든 말할 수 있어요' },
        { text: '배가 아파요', phraseId: 'p_onaka_itai', correct: true, feedback: '「お腹(なか)が痛いです」— お腹는 복부의 정중한 표현. 설사·구역질은 「下痢(げり)」「吐き気(はきけ)」도 알아두면 좋아요' },
        { text: '감기예요', phraseId: 'p_kaze_desu', correct: true, feedback: '「風邪(かぜ)です」— 감기라는 뜻. 열이 있으면 「熱(ねつ)があります」를 함께 말하면 약사가 더 정확한 약을 줘요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '약사가 열이나 기침이 있는지 자세히 묻는다',
      speaker: '약사',
      promptPhraseId: 'p_netsu_arimasu_ka',
      choices: [
        { text: '열이 있어요', phraseId: 'p_netsu_arimasu', correct: true, feedback: '「熱(ねつ)があります」— 체온 증상을 전해요. 몇 도인지 말하려면 「38度(さんじゅうはちど)あります」처럼 〇〇度를 붙여요' },
        { text: '기침이 나요', phraseId: 'p_seki_ga_demasu', correct: true, feedback: '「咳(せき)が出(で)ます」— 기침 증상. 콧물은 鼻水(はなみず)、목 아픔은 のどが痛いです로 응용해요' },
        { text: '아니요, 없어요', phraseId: 'p_iie_arimasen', correct: true, feedback: '「いいえ、ありません」— 열·기침이 없으면 그렇게 답해요. 증상을 정확히 전할수록 맞는 약을 받아요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '증상을 들은 약사에게 약을 받고 싶다',
      speaker: '나',
      choices: [
        { text: '약 주세요', phraseId: 'p_kusuri_kudasai', correct: true, feedback: '「薬(くすり)ください」— 증상을 말한 다음 약을 요청하면 자연스러워요. 市販薬(しはんやく, 일반약)는 약사 상담 후 구매해요' },
        { text: '이 약은 뭐예요?', phraseId: 'p_kono_kusuri', correct: true, feedback: '「この薬(くすり)は何(なん)ですか」— 약의 성분·용도를 확인. 잘 듣는 약일수록 졸음 등 부작용도 물어보면 좋아요' },
        { text: '추천이 뭐예요?', phraseId: 'p_osusume_wa', correct: true, feedback: '「おすすめは何(なん)ですか」— 증상에 맞는 약을 약사에게 추천받아요. 일본 드러그스토어는 약사 상담이 친절해요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '약사가 알레르기나 임신 여부를 확인한다',
      speaker: '약사',
      promptPhraseId: 'p_arerugi_ninshin',
      choices: [
        { text: '메밀·땅콩 알레르기가 있어요', phraseId: 'p_arerugi', correct: true, feedback: '「そばとピーナッツアレルギーがあります」— 약에도 알레르기 유발 성분이 있을 수 있어요. 구체적으로 전하면 안전한 약을 골라줘요' },
        { text: '임신 중이에요', phraseId: 'p_ninshin_chuu', correct: true, feedback: '「妊娠中(にんしんちゅう)です」— 임신 중엔 복용 가능한 약이 제한돼요. 반드시 약사에게 알려야 안전해요' },
        { text: '아니요, 아무것도 없어요', phraseId: 'p_iie_nanimoarimasen', correct: true, feedback: '「いいえ、何(なに)もありません」— 알레르기·임신 모두 해당 없을 때. 솔직하게 답하면 약사가 적합한 약을 줘요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '약사가 빠르게 복용법을 설명한다 — 잘 안 들린다',
      speaker: '약사',
      promptPhraseId: 'p_shokugo_nonde',
      choices: [
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '복용법을 이해했다는 신호. 「食後(しょくご)に」=식후에, 「一日三回(いちにちさんかい)」=하루 3회 정도는 외워두면 좋아요' },
        { text: '식후에 먹으면 되나요?', phraseId: 'p_shokugo_kakunin', correct: true, feedback: '「食後(しょくご)に飲(の)めばいいですか」— 복용법을 들었으면 핵심을 되물어 확인. 약을 안전하게 먹는 데는 감사보다 이 확인이 훨씬 중요해요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '다시 한 번 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '계산대에서 약값을 지불한다',
      speaker: '나',
      choices: [
        { text: '카드로요', phraseId: 'p_card_de', correct: true, feedback: '「カードで」— 드러그스토어는 대부분 카드·IC카드를 받아요. 일반약(市販薬)은 처방전 없이 바로 살 수 있어요' },
        { text: '현금으로요', phraseId: 'p_genkin_de', correct: true, feedback: '「現金(げんきん)で」— 현금 결제. 약값은 일반약이라 보험 적용 없이 정가로 내요' },
        { text: '카드로도 되나요?', phraseId: 'p_kado_de_ii_desu_ka', correct: true, feedback: '「カードでもいいですか」— 결제 전에 카드가 되는지 확인. 드러그스토어는 대부분 되지만 미리 물어보면 깔끔해요' },
        { text: '쉬운 일본어로 부탁드려요', phraseId: 'p_yasashii_nihongo', correct: true, recoveryType: 'simplify', recoveryOutcome: 'partial' },
      ],
    },
  ],
};
