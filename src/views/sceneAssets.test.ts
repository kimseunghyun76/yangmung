import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { sceneBackdropForCard } from './scene';

const NEW_MISSION_IDS = ['C51', 'C52', 'C53', 'C54'];
const EXPECTED_FILES = ['solo-street-03.webp', 'ff-street-03.webp', 'mf-street-03.webp'];

describe('C51-C54 session artwork', () => {
  it.each(NEW_MISSION_IDS)('%s rotates through three dedicated scene variants', (missionId) => {
    const paths = [0, 1, 2].map((cardIndex) => sceneBackdropForCard(missionId, cardIndex));

    expect(paths.every(Boolean)).toBe(true);
    expect(new Set(paths.map((assetPath) => path.basename(assetPath!)))).toEqual(new Set(EXPECTED_FILES));
    for (const assetPath of paths) {
      expect(fs.existsSync(path.join(process.cwd(), 'public', assetPath!))).toBe(true);
    }
  });
});
