// 한국어 → 일본어 번역 (Vercel 서버리스 함수 · AI Gateway).
// 필요: 배포 환경에 AI_GATEWAY_API_KEY 설정(AI Gateway 활성화). 없으면 503 + 안내.
// /admin에서 한국어로 입력하면 이 함수로 일본어를 받아 채운다.
import { generateText } from 'ai';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!process.env.AI_GATEWAY_API_KEY) {
    return json({ error: 'AI_GATEWAY_API_KEY 미설정 — Vercel 환경변수에 AI Gateway 키를 추가하세요' }, 503);
  }
  let ko = '';
  try { ko = (await req.json())?.ko ?? ''; } catch { /* noop */ }
  if (!ko || typeof ko !== 'string') return json({ error: 'ko(한국어) 필요' }, 400);

  try {
    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt:
        '다음 한국어를 일본어로 번역해 주세요. 여행 회화에 쓰는 자연스러운 정중체(です/ます)로, ' +
        '설명·따옴표 없이 일본어 문장만 한 줄로 출력하세요.\n\n한국어: ' + ko,
    });
    return json({ ja: text.trim() });
  } catch (e) {
    return json({ error: '번역 실패: ' + String(e) }, 500);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
