// 어휘 그룹 대표 예문(VocabGroup.examples)이 실제로 쓰이는 상황 — 그 상황을 "질문"으로 놓고
// 예문 자체를 "답변"으로 보여준다(IntroduceCard.answersQuestion 재사용, 미션과 같은 렌더링 패턴).
// key = `${groupId}_${index}`(cards.ts의 `vocab:${group.id}:study:ex${i}` id와 대응).
export interface ExampleQuestion {
  ja: string;
  kana: string;
  korean: string;
}

export const VOCAB_EXAMPLE_QUESTIONS: Record<string, ExampleQuestion> = {
  greetings_0: { ja: '朝、同僚に会いました。', kana: 'あさ、どうりょうにあいました。', korean: '아침에 동료를 만났어요.' },
  greetings_1: { ja: '店員さんが手伝ってくれました。', kana: 'てんいんさんがてつだってくれました。', korean: '점원이 도와줬어요.' },
  greetings_2: { ja: '道で知らない人に話しかけたいです。', kana: 'みちでしらないひとにはなしかけたいです。', korean: '길에서 모르는 사람에게 말을 걸고 싶어요.' },
  body_0: { ja: 'どうしましたか。', kana: 'どうしましたか。', korean: '어디 아프세요?' },
  body_1: { ja: '食事の前に何をしますか。', kana: 'しょくじのまえになにをしますか。', korean: '식사 전에 뭘 해요?' },
  body_2: { ja: '友達の赤ちゃんを見ました。', kana: 'ともだちのあかちゃんをみました。', korean: '친구 아기를 봤어요.' },
  sports_0: { ja: '趣味は何ですか。', kana: 'しゅみはなんですか。', korean: '취미가 뭐예요?' },
  sports_1: { ja: '健康のために何をしますか。', kana: 'けんこうのためになにをしますか。', korean: '건강을 위해 뭘 해요?' },
  sports_2: { ja: '夏休みに何をしましょうか。', kana: 'なつやすみになにをしましょうか。', korean: '여름방학에 뭘 할까요?' },
  animals_0: { ja: 'ペットは好きですか。', kana: 'ペットはすきですか。', korean: '반려동물 좋아해요?' },
  animals_1: { ja: '家に何匹いますか。', kana: 'いえになんびきいますか。', korean: '집에 몇 마리 있어요?' },
  animals_2: { ja: '空を見てください。', kana: 'そらをみてください。', korean: '하늘을 봐 보세요.' },
  plants_0: { ja: '庭を見てください。', kana: 'にわをみてください。', korean: '정원을 봐 보세요.' },
  plants_1: { ja: 'あの木を見てください。', kana: 'あのきをみてください。', korean: '저 나무를 봐 보세요.' },
  colors_0: { ja: '誕生日に何がほしいですか。', kana: 'たんじょうびになにがほしいですか。', korean: '생일에 뭐 갖고 싶어요?' },
  colors_1: { ja: '店で服を見ています。', kana: 'みせでふくをみています。', korean: '가게에서 옷을 보고 있어요.' },
  colors_2: { ja: 'どの色になさいますか。', kana: 'どのいろになさいますか。', korean: '무슨 색으로 하시겠어요?' },
  food_0: { ja: '何が食べたいですか。', kana: 'なにがたべたいですか。', korean: '뭐 먹고 싶어요?' },
  food_1: { ja: 'レストランで店員を呼びました。', kana: 'レストランでてんいんをよびました。', korean: '식당에서 점원을 불렀어요.' },
  food_2: { ja: '味はどうですか。', kana: 'あじはどうですか。', korean: '맛이 어때요?' },
  family_0: { ja: '家族は何人ですか。', kana: 'かぞくはなんにんですか。', korean: '가족이 몇 명이에요?' },
  family_1: { ja: '兄弟はいますか。', kana: 'きょうだいはいますか。', korean: '형제 있어요?' },
  family_2: { ja: '兄弟について聞きたいです。', kana: 'きょうだいについてききたいです。', korean: '형제에 대해 물어보고 싶어요.' },
  weather_0: { ja: '今日の天気はどうですか。', kana: 'きょうのてんきはどうですか。', korean: '오늘 날씨 어때요?' },
  weather_1: { ja: '明日の天気はどうですか。', kana: 'あしたのてんきはどうですか。', korean: '내일 날씨 어때요?' },
  weather_2: { ja: '急に涼しいですね。', kana: 'きゅうにすずしいですね。', korean: '갑자기 시원해졌네요.' },
  adjectives_0: { ja: 'この時計はどうですか。', kana: 'このとけいはどうですか。', korean: '이 시계 어때요?' },
  adjectives_1: { ja: 'このかばんは高いです。', kana: 'このかばんはたかいです。', korean: '이 가방은 비싸요.' },
  adjectives_2: { ja: 'ホテルの部屋はどうですか。', kana: 'ホテルのへやはどうですか。', korean: '호텔 방은 어때요?' },
  places_0: { ja: 'すみません、道に迷いました。', kana: 'すみません、みちにまよいました。', korean: '저기요, 길을 잃었어요.' },
  places_1: { ja: '具合が悪いです。', kana: 'ぐあいがわるいです。', korean: '몸이 안 좋아요.' },
  places_2: { ja: 'お金を換えたいです。', kana: 'おかねをかえたいです。', korean: '환전하고 싶어요.' },
  transport_0: { ja: '会社まで何で行きますか。', kana: 'かいしゃまでなんでいきますか。', korean: '회사까지 뭘로 가요?' },
  transport_1: { ja: '荷物が重いです。', kana: 'にもつがおもいです。', korean: '짐이 무거워요.' },
  transport_2: { ja: 'バスに乗りたいです。', kana: 'バスにのりたいです。', korean: '버스를 타고 싶어요.' },
  feelings_0: { ja: 'プレゼントをもらいました。', kana: 'プレゼントをもらいました。', korean: '선물을 받았어요.' },
  feelings_1: { ja: '今日はどうでしたか。', kana: 'きょうはどうでしたか。', korean: '오늘 어땠어요?' },
  feelings_2: { ja: '朝から何も食べていません。', kana: 'あさからなにもたべていません。', korean: '아침부터 아무것도 안 먹었어요.' },
};

export function vocabExampleQuestionFor(groupId: string, index: number): ExampleQuestion | undefined {
  return VOCAB_EXAMPLE_QUESTIONS[`${groupId}_${index}`];
}
