// 런타임 듣기 레이어.
// 정책(kana-master 계승): audioId 있으면 사전 mp3, 없으면 브라우저 Web Speech 폴백.
// MVP는 mp3 자산 0 → Web Speech(ja-JP)만으로 듣기 루프 확보.

let jaVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (jaVoice) return jaVoice;
  const voices = window.speechSynthesis.getVoices();
  jaVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ja')) ?? null;
  return jaVoice;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // 음성 목록은 비동기 로드될 수 있음
  window.speechSynthesis.onvoiceschanged = () => {
    jaVoice = null;
    pickVoice();
  };
}

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export interface SpeakOpts {
  audioId?: string; // 있으면 mp3 우선 (MVP에선 미사용)
  rate?: number;    // 느린 청해용
  onEnd?: () => void; // 읽기 종료(또는 오류) 시 1회 호출 — "다 읽고 넘어가기"용
}

export function speak(text: string, opts: SpeakOpts = {}): void {
  if (!ttsSupported() || !text) return;
  // audioId 사전 mp3 경로는 후행 (지금은 항상 Web Speech 폴백)
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = opts.rate ?? 0.95;
  const v = pickVoice();
  if (v) u.voice = v;
  if (opts.onEnd) {
    let fired = false;
    const done = () => { if (fired) return; fired = true; opts.onEnd!(); };
    u.onend = done;
    u.onerror = (ev) => {
      const err = 'error' in ev ? String(ev.error) : '';
      if (err === 'canceled' || err === 'interrupted') return;
      done();
    };
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

// 여러 문장을 순서대로 이어 읽기 (대화 리캡 "전체 듣기"용). 한 번만 취소 후 큐에 쌓는다.
export function speakSequence(texts: string[], opts: SpeakOpts = {}): void {
  if (!ttsSupported()) return;
  window.speechSynthesis.cancel();
  const v = pickVoice();
  for (const text of texts) {
    if (!text) continue;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    u.rate = opts.rate ?? 0.95;
    if (v) u.voice = v;
    window.speechSynthesis.speak(u); // 네이티브 큐에 순차 적재
  }
}

// 재생 중지 (화면 이탈·다시 듣기 전)
export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
