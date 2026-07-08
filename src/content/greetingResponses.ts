// 인사 표현별 자연스러운 반응 — 학습 카드(반응 미니 컨텍스트)와 "반응 고르기" 퀴즈가 함께 쓴다.
export interface GreetingResponse { ja: string; korean: string }

export const GREETING_RESPONSES: Record<string, GreetingResponse> = {
  g_ohayou: { ja: 'おはようございます。', korean: '안녕하세요(아침)라고 답해요.' },
  g_konnichiwa: { ja: 'こんにちは。', korean: '안녕하세요(낮)라고 답해요.' },
  g_konbanwa: { ja: 'こんばんは。', korean: '안녕하세요(저녁)라고 답해요.' },
  g_oyasumi: { ja: 'おやすみなさい。', korean: '똑같이 잘 자라고 답해요.' },
  g_arigatou: { ja: 'どういたしまして。', korean: '천만에요.' },
  g_sumimasen: { ja: '大丈夫です。', korean: '괜찮아요.' },
  g_gomen: { ja: '大丈夫です。', korean: '괜찮아요.' },
  g_douzo: { ja: 'どうも、ありがとうございます。', korean: '감사합니다라고 받아요.' },
  g_douitashimashite: { ja: 'いえいえ。', korean: '아니에요(가볍게 손사래).' },
  g_hajimemashite: { ja: 'よろしくお願いします。', korean: '잘 부탁드립니다.' },
  g_yoroshiku: { ja: 'こちらこそ、よろしくお願いします。', korean: '저야말로 잘 부탁드립니다.' },
  g_sayonara: { ja: '気をつけて。', korean: '조심히 가라고 답해요.' },
  g_mata_ne: { ja: 'うん、またね！', korean: '응, 또 봐요!' },
  g_ittekimasu: { ja: '行ってらっしゃい。', korean: '잘 다녀오세요.' },
  g_itterasshai: { ja: '行ってきます。', korean: '다녀오겠습니다.' },
  g_tadaima: { ja: 'おかえりなさい。', korean: '어서 와요.' },
  g_okaerinasai: { ja: 'ただいま。', korean: '다녀왔습니다.' },
  g_otsukaresama: { ja: 'お疲れ様でした。', korean: '똑같이 수고하셨다고 답해요.' },
};

export function greetingResponseFor(id: string): GreetingResponse | undefined {
  return GREETING_RESPONSES[id];
}
