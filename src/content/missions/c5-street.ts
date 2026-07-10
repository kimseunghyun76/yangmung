import type { Mission } from '../types';

// C5 — 거리·긴급. 화장실 찾기 → 사진 부탁 → 길 잃음/도움. 여행에서 가장 자주 쓰는 실전 한마디.
export const c5: Mission = {
  id: 'C5',
  tier: 1,
  scenario: '길거리에서 도움 청하기',
  place: '거리',
  canDo: '사용자는 길에서 목적지·방향·거리를 묻고 안내를 이해하며, 화장실·사진을 부탁하고 길을 잃으면 도움을 청할 수 있다',
  unlockAfter: ['C2'],
  sequence: ['목적지 묻기', '방향 안내', '거리 확인', '화장실 찾기', '사진 부탁', '도움 청하기'],
  speakPhraseIds: ['p_michi_oshiete', 'p_hidari_migi', 'p_tasukete'],
  steps: [
    {
      situationKo: '가고 싶은 곳이 있어 행인에게 길을 묻는다',
      speaker: '나',
      choices: [
        { text: '저기요, 길을 가르쳐 주세요', phraseId: 'p_michi_oshiete', correct: true, feedback: '「すみません、道(みち)を教(おし)えてください」— 먼저 すみません으로 부르고 길을 물어요. 지도 앱 화면을 보여주면 훨씬 정확하게 안내받아요' },
        { text: '여기서 가까워요?', phraseId: 'p_chikai_desu_ka', correct: true, feedback: '「ここから近(ちか)いですか」— 목적지까지 거리를 가늠할 때. 멀면 교통편을 고려해요' },
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: false, feedback: '지금은 길을 묻는 상황이에요 — 사진은 나중에 따로 부탁해요' },
      ],
    },
    {
      situationKo: '행인이 길을 알려준다 — 방향을 확인한다',
      speaker: '행인',
      promptPhraseId: 'p_massugu_migi',
      choices: [
        { text: '왼쪽이에요, 오른쪽이에요?', phraseId: 'p_hidari_migi', correct: true, feedback: '「左(ひだり)ですか、右(みぎ)ですか」— 방향이 헷갈리면 바로 확인. まっすぐ(직진)·角(かど, 모퉁이)도 함께 알아두면 좋아요' },
        { text: '덕분에 도움이 됐어요', phraseId: 'p_tasukarimashita', correct: true, feedback: '「助(たす)かりました」— 길을 알려준 사람에게 "덕분에 살았어요". 그냥 감사보다 도움이 됐다는 마음이 더 잘 전해져요' },
        { text: '도와주세요', phraseId: 'p_tasukete', correct: false, feedback: '지금은 길 안내를 받는 중이에요 — 이해했으면 확인이나 한마디로 답해요' },
      ],
    },
    {
      situationKo: '걸어갈 수 있는 거리인지 확인한다',
      speaker: '나',
      choices: [
        { text: '걸어서 몇 분이에요?', phraseId: 'p_aruite_nanpun', correct: true, feedback: '「歩(ある)いて何分(なんぷん)ですか」— 도보 소요 시간 확인. 멀면 「電車(でんしゃ)とバス、どちらが早(はや)いですか」로 교통편을 비교해요' },
        { text: '여기서 가까워요?', phraseId: 'p_chikai_desu_ka', correct: true, feedback: '「ここから近(ちか)いですか」— 거리감을 다시 확인. 멀다고 하면 무리하지 말고 교통편을 알아봐요' },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: true, feedback: '「どちらですか」— 방향을 한 번 더 공손하게 확인. 손짓과 함께 쓰면 더 명확해요' },
        { text: '사진 부탁드려요', phraseId: 'p_shashin_onegai', correct: false, feedback: '지금은 거리·시간을 확인하는 중이에요 — 사진 부탁은 다른 상황이에요' },
      ],
    },
    {
      situationKo: '화장실이 급하다 — 점원에게 묻기',
      speaker: '나',
      choices: [
        { text: '화장실 어디예요?', phraseId: 'p_toire_doko', correct: true, feedback: '「トイレはどこですか」— 가장 실용적인 여행 표현. 편의점은 화장실이 무료라 대피소로 활용해도 돼요' },
        { text: '어느 쪽이에요?', phraseId: 'p_dochira_desu_ka', correct: true, feedback: '「どちらですか」는 どこより 공손한 방향 묻기예요. 손짓을 함께 하면 이해도가 훨씬 높아져요' },
      ],
    },
    {
      situationKo: '풍경이 멋지다 — 사진을 찍고 싶다',
      speaker: '나',
      choices: [
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: true, feedback: '「写真を撮ってもいいですか」— 허락을 먼저 구하는 게 일본 에티켓이에요. 신사·사찰은 촬영 금지 구역도 있어요' },
        { text: '사진 부탁드려요 (찍어 주세요)', phraseId: 'p_shashin_onegai', correct: true, feedback: '「写真をお願いします」— 자신이 찍혀야 할 때 쓰는 표현. カメラをどうぞ와 함께 건네면 더 명확해요' },
        { text: '화장실 어디예요?', phraseId: 'p_toire_doko', correct: false, feedback: '지금은 사진 상황 — 흐름이 어긋나요' },
      ],
    },
    {
      situationKo: '길을 잃었다 — 도움 청하기',
      speaker: '나',
      choices: [
        { text: '도와주세요', phraseId: 'p_tasukete', correct: true, feedback: '「助けて(たすけて)」— 긴급 SOS. 크게 외치면 일본인이 즉시 반응해요. 위험 시에는 주저 없이 써요' },
        { text: '사진 찍어도 돼요?', phraseId: 'p_shashin_ii', correct: false, feedback: '급할 땐 たすけて·どこですか가 먼저예요' },
      ],
    },
  ],
};
