import { describe, expect, it } from 'vitest';
import { hashForView, viewFromLocation } from './routing';

describe('hash routing', () => {
  it('maps known hashes to views', () => {
    expect(viewFromLocation('#/')).toBe('home');
    expect(viewFromLocation('#/prep')).toBe('prep');
    expect(viewFromLocation('#/review')).toBe('review');
    expect(viewFromLocation('#/settings')).toBe('settings');
  });

  it('falls back to home for unknown hashes', () => {
    expect(viewFromLocation('#/missing')).toBe('home');
    expect(viewFromLocation('')).toBe('home');
  });

  it('generates stable hashes', () => {
    expect(hashForView('gacha')).toBe('#/gacha');
    expect(hashForView('journey')).toBe('#/journey');
  });
});
