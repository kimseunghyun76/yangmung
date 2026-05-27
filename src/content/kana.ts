import type { KanaItem } from './types';

export const kana: KanaItem[] = [
  { id: 'k_hira_a',   char: 'あ',   script: 'hiragana', kind: 'sei',     romaji: 'a',   koreanSound: '아',   level: 'K1',  group: 'あ행',       confusables: ['お'] },
  { id: 'k_hira_o',   char: 'お',   script: 'hiragana', kind: 'sei',     romaji: 'o',   koreanSound: '오',   level: 'K1',  group: 'あ행',       confusables: ['あ'] },
  { id: 'k_hira_shi', char: 'し',   script: 'hiragana', kind: 'sei',     romaji: 'shi', koreanSound: '시',   level: 'K1',  group: 'さ행',       confusables: ['つ'] },
  { id: 'k_hira_tsu', char: 'つ',   script: 'hiragana', kind: 'sei',     romaji: 'tsu', koreanSound: '츠',   level: 'K1',  group: 'た행',       confusables: ['し'] },
  { id: 'k_hira_kya', char: 'きゃ', script: 'hiragana', kind: 'yoon',    romaji: 'kya', koreanSound: '캬',   level: 'K5',  group: 'か행 拗音', components: ['き', 'ゃ'] },
  { id: 'k_kata_shi', char: 'シ',   script: 'katakana', kind: 'sei',     romaji: 'shi', koreanSound: '시',   level: 'K6',  group: 'サ행',       confusables: ['ツ', 'ソ', 'ン'] },
  { id: 'k_kata_tsu', char: 'ツ',   script: 'katakana', kind: 'sei',     romaji: 'tsu', koreanSound: '츠',   level: 'K6',  group: 'タ행',       confusables: ['シ'] },
  { id: 'k_long',     char: 'ー',   script: 'common',   kind: 'special', romaji: '-',   koreanSound: '장음', level: 'K10', group: '특수표기' },
];
