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
}

export function speak(text: string, opts: SpeakOpts = {}): void {
  if (!ttsSupported() || !text) return;
  // audioId 사전 mp3 경로는 후행 (지금은 항상 Web Speech 폴백)
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = opts.rate ?? 0.95;
  const v = pickVoice();
  if (v) u.voice = v;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
