import type { ContentBundle } from './types';
import { kana } from './kana';
import { phrases } from './phrases';
import { grammar } from './grammar';
import { n5 } from './n5';
import { units } from './units';
import { missions } from './missions';

export const CONTENT: ContentBundle = { kana, phrases, grammar, n5, units, missions };

export * from './types';
