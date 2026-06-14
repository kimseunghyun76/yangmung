import type { Mission } from '../types';

// C5 — 거리·긴급. 화장실 찾기 → 사진 부탁 → 길 잃음/도움. 여행에서 가장 자주 쓰는 실전 한마디.
export const c5: Mission = {
  id: 'C5',
  tier: 1,
  scenario: '길거리에서 도움 청하기',
  place: '거리',
  canDo: '사용자는 길에서 화장실·사진을 부탁하고, 길을 잃었을 때 도움을 청하고, 못 알아들으면 다시·천천히·영어를 요청할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['화장실 찾기', '사진 부탁', '도움 청하기'],
  speakPhraseIds: ['p_toire_doko', 'p_shashin_ii', 'p_tasukete'],
  steps: [
    {
      situationKo: '화장실이 급하다 — 점원에게 묻기',
      speaker: '나',
      choices: [
        { text: '저기요 (말 걸기)', phraseId: 'p_sumimasen', correct: true, feedback: '먼저 すみません으로 부르고 묻는 게 자연스러워요' },
        { text: '화장실 어디예요?', phraseId: 'p_toire_doko', correct: true, feedback: '「トイレはどこですか」— 가장 실용적인 여행 표현. 편의점은 화장실이 무료라 대피소로 활용해도 돼요' },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: true, feedback: '「どちらですか」는 どこより 공손한 방향 묻기예요. 손짓을 함께 하면 이해도가 훨씬 높아져요' },
        { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
      ],
    },
    {
      situationKo: '풍경이 멋지다 — 사진을 찍고 싶다',
      speaker: '나',
      choices: [
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: true, feedback: '「写真を撮ってもいいですか」— 허락을 먼저 구하는 게 일본 에티켓이에요. 신사·사찰은 촬영 금지 구역도 있어요' },
        { text: '사진 부탁드려요 (찍어 주세요)', phraseId: 'p_shashin_onegai', correct: true, feedback: '「写真をお願いします」— 자신이 찍혀야 할 때 쓰는 표현. カメラをどうぞ와 함께 건네면 더 명확해요' },
        { text: '화장실 어디예요?', phraseId: 'p_toire_doko', correct: false, feedback: '지금은 사진 상황 — 흐름이 어긋나요' },
        { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
      ],
    },
    {
      situationKo: '길을 잃었다 — 도움 청하기',
      speaker: '나',
      choices: [
        { text: '도와주세요', phraseId: 'p_tasukete', correct: true, feedback: '「助けて(たすけて)」— 긴급 SOS. 크게 외치면 일본인이 즉시 반응해요. 위험 시에는 주저 없이 써요' },
        { text: '여기 어디예요?', phraseId: 'p_doko_desu_ka', correct: true, feedback: '「ここはどこですか」— 길을 잃었을 때 현 위치 파악 우선. 지도 앱을 꺼내 함께 보여주면 더 빠르게 해결돼요' },
        { text: '천천히 말해 주세요', phraseId: 'p_yukkuri', correct: true, recoveryType: 'slow', recoveryOutcome: 'full' },
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: false, feedback: '급할 땐 たすけて·どこですか가 먼저예요' },
      ],
    },
  ],
};
