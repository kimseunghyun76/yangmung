// 런타임 듣기 레이어.
// 정책: 사전 생성 mp3(Nanami) 우선 → 없거나 재생 실패 시 Web Speech(ja-JP) 폴백.

interface AudioManifestItem {
  text: string;
  path: string;
  voice: string;
  source?: string;
  sourceId?: string;
}

interface AudioManifest {
  generatedAt: string | null;
  voices: Record<string, { name: string; lang: string; label: string; gender: string }>;
  items: Record<string, AudioManifestItem>;
  textIndex: Record<string, string>;
}

let jaVoice: SpeechSynthesisVoice | null = null;
let manifestPromise: Promise<AudioManifest | null> | null = null;
let currentAudio: HTMLAudioElement | null = null;
let speakToken = 0;

function normalizeText(text: string): string {
  return String(text || '').replace(/[〜~]/g, '').replace(/\s+/g, ' ').trim();
}

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

function audioElementSupported(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined';
}

function webSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function ttsSupported(): boolean {
  return audioElementSupported() || webSpeechSupported();
}

function loadManifest(): Promise<AudioManifest | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!manifestPromise) {
    manifestPromise = fetch('/audio/manifest.json', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() as Promise<AudioManifest> : null))
      .catch(() => null);
  }
  return manifestPromise;
}

void loadManifest();

function stopAudioOnly(): void {
  if (!currentAudio) return;
  currentAudio.onended = null;
  currentAudio.onerror = null;
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
}

function speakWeb(text: string, opts: SpeakOpts = {}, token = speakToken): void {
  if (!webSpeechSupported() || !text) {
    opts.onEnd?.();
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = opts.rate ?? 0.95;
  const v = pickVoice();
  if (v) u.voice = v;
  if (opts.onEnd) {
    let fired = false;
    const done = () => {
      if (fired || token !== speakToken) return;
      fired = true;
      opts.onEnd!();
    };
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

export interface SpeakOpts {
  audioId?: string;
  rate?: number;    // 느린 청해용. mp3는 playbackRate, Web Speech는 utterance.rate.
  onEnd?: () => void;
}

export function speak(text: string, opts: SpeakOpts = {}): void {
  const clean = normalizeText(text);
  if (!ttsSupported() || !clean) return;
  const token = ++speakToken;
  stopAudioOnly();
  if (webSpeechSupported()) window.speechSynthesis.cancel();

  void loadManifest().then((manifest) => {
    if (token !== speakToken) return;
    const id = opts.audioId ?? manifest?.textIndex[clean];
    const item = id ? manifest?.items[id] : undefined;
    if (!item?.path || !audioElementSupported()) {
      speakWeb(clean, opts, token);
      return;
    }

    const audio = new Audio(item.path);
    currentAudio = audio;
    audio.playbackRate = opts.rate ?? 1;
    let done = false;
    const finish = () => {
      if (done || token !== speakToken) return;
      done = true;
      if (currentAudio === audio) currentAudio = null;
      opts.onEnd?.();
    };
    audio.onended = finish;
    audio.onerror = () => {
      if (token !== speakToken) return;
      if (currentAudio === audio) currentAudio = null;
      speakWeb(clean, opts, token);
    };
    audio.play().catch(() => {
      if (token !== speakToken) return;
      if (currentAudio === audio) currentAudio = null;
      speakWeb(clean, opts, token);
    });
  });
}

// 여러 문장을 순서대로 이어 읽기. 각 문장마다 mp3 우선 → Web Speech 폴백.
export function speakSequence(texts: string[], opts: SpeakOpts = {}): void {
  const seq = texts.map(normalizeText).filter(Boolean);
  if (!ttsSupported() || seq.length === 0) return;
  stopSpeaking();
  let i = 0;
  const next = () => {
    if (i >= seq.length) {
      opts.onEnd?.();
      return;
    }
    speak(seq[i++], { ...opts, onEnd: next });
  };
  next();
}

// 재생 중지 (화면 이탈·다시 듣기 전)
export function stopSpeaking(): void {
  speakToken++;
  stopAudioOnly();
  if (webSpeechSupported()) window.speechSynthesis.cancel();
}
