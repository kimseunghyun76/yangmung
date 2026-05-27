import type { KanaItem } from './types';

// K1 정식: あいうえお + かきくけこ (10자 순차 — 처음 만나는 히라가나)
// K2+ 는 미션·확장용 인벤토리 (し·つ 등은 현재 미션에서 인용)
export const kana: KanaItem[] = [
  // ── K1 あ행 ──
  { id: 'k_hira_a', char: 'あ', script: 'hiragana', kind: 'sei', romaji: 'a', koreanSound: '아', level: 'K1', group: 'あ행', confusables: ['お'] },
  { id: 'k_hira_i', char: 'い', script: 'hiragana', kind: 'sei', romaji: 'i', koreanSound: '이', level: 'K1', group: 'あ행', confusables: ['り'] },
  { id: 'k_hira_u', char: 'う', script: 'hiragana', kind: 'sei', romaji: 'u', koreanSound: '우', level: 'K1', group: 'あ행', confusables: ['つ'] },
  { id: 'k_hira_e', char: 'え', script: 'hiragana', kind: 'sei', romaji: 'e', koreanSound: '에', level: 'K1', group: 'あ행', confusables: ['ん'] },
  { id: 'k_hira_o', char: 'お', script: 'hiragana', kind: 'sei', romaji: 'o', koreanSound: '오', level: 'K1', group: 'あ행', confusables: ['あ'] },
  // ── K1 か행 ──
  { id: 'k_hira_ka', char: 'か', script: 'hiragana', kind: 'sei', romaji: 'ka', koreanSound: '카', level: 'K1', group: 'か행' },
  { id: 'k_hira_ki', char: 'き', script: 'hiragana', kind: 'sei', romaji: 'ki', koreanSound: '키', level: 'K1', group: 'か행', confusables: ['さ'] },
  { id: 'k_hira_ku', char: 'く', script: 'hiragana', kind: 'sei', romaji: 'ku', koreanSound: '쿠', level: 'K1', group: 'か행', confusables: ['へ'] },
  { id: 'k_hira_ke', char: 'け', script: 'hiragana', kind: 'sei', romaji: 'ke', koreanSound: '케', level: 'K1', group: 'か행', confusables: ['は'] },
  { id: 'k_hira_ko', char: 'こ', script: 'hiragana', kind: 'sei', romaji: 'ko', koreanSound: '코', level: 'K1', group: 'か행', confusables: ['に'] },

  // ── K2+ 인벤토리 (현재 미션·향후 확장용) ──
  { id: 'k_hira_shi', char: 'し', script: 'hiragana', kind: 'sei', romaji: 'shi', koreanSound: '시', level: 'K2', group: 'さ행', confusables: ['つ'] },
  { id: 'k_hira_tsu', char: 'つ', script: 'hiragana', kind: 'sei', romaji: 'tsu', koreanSound: '츠', level: 'K2', group: 'た행', confusables: ['し', 'う'] },
  { id: 'k_hira_kya', char: 'きゃ', script: 'hiragana', kind: 'yoon', romaji: 'kya', koreanSound: '캬', level: 'K5', group: 'か행 拗音', components: ['き', 'ゃ'] },
  { id: 'k_kata_shi', char: 'シ', script: 'katakana', kind: 'sei', romaji: 'shi', koreanSound: '시', level: 'K6', group: 'サ행', confusables: ['ツ', 'ソ', 'ン'] },
  { id: 'k_kata_tsu', char: 'ツ', script: 'katakana', kind: 'sei', romaji: 'tsu', koreanSound: '츠', level: 'K6', group: 'タ행', confusables: ['シ'] },
  { id: 'k_long', char: 'ー', script: 'common', kind: 'special', romaji: '-', koreanSound: '장음', level: 'K10', group: '특수표기' },
];
