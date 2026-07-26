import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

interface SignAsset {
  id: string;
  scene: string;
  path: string;
}

interface SignAssetManifest {
  sign: SignAsset[];
}

const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'docs/generated-image-manifests/vocab-body-and-sign-art.json'), 'utf8'),
) as SignAssetManifest;

describe('generated sign artwork', () => {
  it('contains a unique, non-empty WebP asset for every manifest entry', () => {
    expect(manifest.sign).toHaveLength(114);
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
});
