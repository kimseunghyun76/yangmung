import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { signSceneFor, signs } from './signs';

interface SignAsset {
  id: string;
  scene: string;
  path: string;
}

interface SignAssetManifest {
  sign: SignAsset[];
}

interface AudioManifest {
  items: Record<string, { path: string }>;
  textIndex: Record<string, string>;
}

const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'docs/generated-image-manifests/vocab-body-and-sign-art.json'), 'utf8'),
) as SignAssetManifest;
const audioManifest = JSON.parse(
  fs.readFileSync(path.join(root, 'public/audio/manifest.json'), 'utf8'),
) as AudioManifest;
const normalizeAudioText = (text: string) => text.replace(/[〜~]/g, '').replace(/\s+/g, ' ').trim();

describe('generated sign artwork', () => {
  it('keeps the generated manifest synchronized with the current sign curriculum', () => {
    expect(manifest.sign).toHaveLength(signs.length);
    expect(manifest.sign.map(({ id }) => id)).toEqual(signs.map(({ id }) => id));
    expect(manifest.sign.map(({ scene }) => scene)).toEqual(signs.map((sign) => signSceneFor(sign)));
  });

  it('contains a unique, non-empty WebP asset for every current sign', () => {
    expect(new Set(manifest.sign.map(({ id }) => id)).size).toBe(manifest.sign.length);
    expect(new Set(manifest.sign.map(({ path: assetPath }) => assetPath)).size).toBe(manifest.sign.length);

    for (const sign of manifest.sign) {
      const assetPath = path.join(root, sign.path);
      expect(assetPath.endsWith('.webp')).toBe(true);
      expect(fs.existsSync(assetPath), `missing sign asset: ${sign.id}`).toBe(true);
      expect(fs.statSync(assetPath).size, `empty sign asset: ${sign.id}`).toBeGreaterThan(0);
    }
  });

  it('keeps one reusable source template for every scene type', () => {
    const scenes = new Set(manifest.sign.map(({ scene }) => scene));
    expect(scenes.size).toBe(10);

    for (const scene of scenes) {
      const templatePath = path.join(root, `scripts/assets/sign-art-templates/${scene}.webp`);
      expect(fs.existsSync(templatePath), `missing sign template: ${scene}`).toBe(true);
      expect(fs.statSync(templatePath).size, `empty sign template: ${scene}`).toBeGreaterThan(0);
    }
  });

  it('contains generated audio for every current sign reading', () => {
    for (const sign of signs) {
      for (const text of new Set([sign.ja, sign.kana])) {
        const audioId = audioManifest.textIndex[normalizeAudioText(text)];
        expect(audioId, `missing sign audio index: ${sign.id} (${text})`).toBeTruthy();

        const audioPath = audioManifest.items[audioId]?.path;
        expect(audioPath, `missing sign audio manifest item: ${sign.id} (${text})`).toBeTruthy();
        const filePath = path.join(root, 'public', audioPath.replace(/^\//, ''));
        expect(fs.existsSync(filePath), `missing sign audio file: ${sign.id} (${text})`).toBe(true);
        expect(fs.statSync(filePath).size, `empty sign audio file: ${sign.id} (${text})`).toBeGreaterThan(0);
      }
    }
  });
});
