// 런타임 듣기 레이어.
// 정책: 사전 생성 mp3(Nanami) 우선 → 없거나 재생 실패 시 Web Speech(ja-JP) 폴백.

interface AudioManifestItem {
  text: string;
  path: string;
  voice: string;
  source?: string;
  sourceId?: string;
  synthSignature?: string;
}

interface AudioManifest {
  generatedAt: string | null;
  voices: Record<string, { name: string; lang: string; label: string; gender: string }>;
  items: Record<string, AudioManifestItem>;
  textIndex: Record<string, string>;
  voiceTextIndex?: Record<string, Record<string, string>>;
}

// 전역 듣기 속도 — 설정에서 지정(x0.5~x2). speak() 호출에 rate 미지정 시 기본값.
let globalRate = 1;
export function setListenRate(rate: number): void {
  if (Number.isFinite(rate) && rate > 0) globalRate = rate;
}
export function getListenRate(): number { return globalRate; }

let jaVoice: SpeechSynthesisVoice | null = null;
let manifestPromise: Promise<AudioManifest | null> | null = null;
let cachedManifest: AudioManifest | null | undefined; // undefined = 아직 미로드
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
      .catch(() => null)
      .then((data) => { cachedManifest = data; return data; });
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
  u.rate = opts.rate ?? globalRate;
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
  voice?: 'nanami' | 'keita';
  rate?: number;    // 느린 청해용. mp3는 playbackRate, Web Speech는 utterance.rate.
  onEnd?: () => void;
}

export function speak(text: string, opts: SpeakOpts = {}): void {
  const clean = normalizeText(text);
  if (!ttsSupported() || !clean) return;
  const token = ++speakToken;
  stopAudioOnly();
  if (webSpeechSupported()) window.speechSynthesis.cancel();

  function withManifest(manifest: AudioManifest | null) {
    if (token !== speakToken) return;
    const voiceId = opts.voice ? manifest?.voiceTextIndex?.[opts.voice]?.[clean] : undefined;
    const id = opts.audioId ?? voiceId ?? manifest?.textIndex[clean];
    const item = id ? manifest?.items[id] : undefined;
    if (!item?.path || !audioElementSupported()) {
      speakWeb(clean, opts, token);
      return;
    }

    const version = item.synthSignature ? `?v=${encodeURIComponent(item.synthSignature)}` : '';
    const audio = new Audio(`${item.path}${version}`);
    currentAudio = audio;
    audio.playbackRate = opts.rate ?? globalRate;
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
  }

  // manifest 캐시가 준비됐으면 동기(synchronous) 처리 — iOS에서 user gesture context 유지
  // (async .then() 콜백에선 Web Speech API 가 blocked 되는 문제 해결)
  if (cachedManifest !== undefined) {
    withManifest(cachedManifest);
  } else {
    void loadManifest().then(withManifest);
  }
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

export interface SpeakPart {
  text: string;
  voice?: SpeakOpts['voice'];
}

// 화자별 음성을 유지하며 여러 문장을 순서대로 이어 읽기.
export function speakParts(parts: SpeakPart[], opts: SpeakOpts = {}): void {
  const seq = parts
    .map((part) => ({ ...part, text: normalizeText(part.text) }))
    .filter((part) => Boolean(part.text));
  if (!ttsSupported() || seq.length === 0) return;
  stopSpeaking();
  let i = 0;
  const next = () => {
    if (i >= seq.length) {
      opts.onEnd?.();
      return;
    }
    const part = seq[i++];
    speak(part.text, { ...opts, voice: part.voice, onEnd: next });
  };
  next();
}

// 재생 중지 (화면 이탈·다시 듣기 전)
export function stopSpeaking(): void {
  speakToken++;
  stopAudioOnly();
  if (webSpeechSupported()) window.speechSynthesis.cancel();
}
