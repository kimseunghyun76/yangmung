import type { Mission } from '../types';

// C6 — 약국. 증상 말하기 → 약 받기. 도쿄 드러그스토어 어디나.
export const c6: Mission = {
  id: 'C6',
  tier: 1,
  scenario: '약국에서 약 사기',
  place: '약국',
  canDo: '사용자는 약국에서 증상(머리·배·감기)을 말하고 약을 요청하며, 약 설명을 못 알아들으면 다시·천천히·영어를 청할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['증상 말하기', '약 요청', '복용 확인'],
  speakPhraseIds: ['p_atama_itai', 'p_kusuri_kudasai', 'p_kono_kusuri'],
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
      situationKo: '약을 받고 싶다',
      speaker: '나',
      choices: [
        { text: '약 주세요', phraseId: 'p_kusuri_kudasai', correct: true, feedback: '「薬(くすり)ください」— 직접 약을 요청하는 표현. 어떤 증상인지 미리 말한 다음에 쓰는 게 자연스러워요' },
        { text: '이 약은 뭐예요?', phraseId: 'p_kono_kusuri', correct: true, feedback: '「この薬は何ですか」— 처방받은 약의 성분·용도를 모를 때 확인하는 표현. 알레르기가 있으면 꼭 물어보세요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '약사가 빠르게 복용법을 설명한다 — 잘 안 들린다',
      speaker: '약사',
      promptPhraseId: 'p_shokugo_nonde',
      choices: [
        { text: '알겠습니다', phraseId: 'p_wakarimashita', correct: true, feedback: '복용법을 이해했다는 신호. 「食後(しょくご)に」=식후에, 「一日三回(いちにちさんかい)」=하루 3회 정도는 외워두면 좋아요' },
        { text: '감사합니다', phraseId: 'p_arigatou_gozaimasu', correct: true, feedback: '약국에서 나갈 때 꼭 인사해요 — 일본 약사는 설명에 많은 신경을 써요. 그 노력에 감사를 전하는 게 예의' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '다시 한 번 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'partial' },
      ],
    },
  ],
};
