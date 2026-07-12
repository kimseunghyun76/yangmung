export interface AudioManifestItem {
  text?: string;
  synthText?: string;
  altTexts?: string[];
  path?: string;
  voice?: string;
  voices?: string[];
}

export interface AudioManifest {
  items?: Record<string, AudioManifestItem>;
  textIndex?: Record<string, string>;
  voices?: string[] | Record<string, unknown>;
}

export type AudioIndex = Map<string, string>;

export function normalizeAudioText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\s　]/g, '')
    .replace(/[。．.、,!！?？「」『』（）()［］\[\]〜~]/g, '')
    .trim();
}

export function buildAudioIndex(manifest: AudioManifest, basePath = '/audio'): AudioIndex {
  const index: AudioIndex = new Map();
  for (const item of Object.values(manifest.items ?? {})) {
    if (!item.path) continue;
    const variants = [item.text, item.synthText, ...(item.altTexts ?? [])].filter(Boolean) as string[];
    for (const variant of variants) {
      const key = normalizeAudioText(variant);
      if (key && !index.has(key)) index.set(key, item.path);
    }
  }
  const voices = Array.isArray(manifest.voices) ? manifest.voices : Object.keys(manifest.voices ?? {});
  const preferredVoice = voices.includes('nanami') ? 'nanami' : voices[0];
  if (preferredVoice) {
    for (const [text, fileId] of Object.entries(manifest.textIndex ?? {})) {
      const key = normalizeAudioText(text);
      if (key && !index.has(key)) index.set(key, `${basePath}/${preferredVoice}/${fileId}.mp3`);
    }
  }
  return index;
}

export function audioPathForText(index: AudioIndex, text: string): string | undefined {
  const key = normalizeAudioText(text);
  return key ? index.get(key) : undefined;
}
