import type { ContentBundle } from './types';
import { kana } from './kana';
import { phrases } from './phrases';
import { extraTravelPhrases } from './extraTravelPhrases';
import { grammar } from './grammar';
import { n5 } from './n5';
import { units } from './units';
import { extraTravelUnits } from './extraTravelUnits';
import { missions } from './missions';

export const CONTENT: ContentBundle = { kana, phrases: [...phrases, ...extraTravelPhrases], grammar, n5, units: [...units, ...extraTravelUnits], missions };

export * from './types';
