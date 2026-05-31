import type { KanaItem, KLevel } from './types';

// 오십음도(청음) 전체 — 히라가나 46 + 가타카나 46. 행 단위 단계(K-level)로 점진 학습.
// 컴팩트 표에서 생성(유지보수·검증 안전). id = k_hira_<romaji> / k_kata_<romaji>.

// 행 정의: 히라가나/가타카나 글자 + 로마자 + 한글소리
const ROWS: { groupKo: string; level: KLevel; hira: string[]; kata: string[]; romaji: string[]; korean: string[] }[] = [
  { groupKo: 'あ행', level: 'K1', hira: ['あ','い','う','え','お'], kata: ['ア','イ','ウ','エ','オ'], romaji: ['a','i','u','e','o'], korean: ['아','이','우','에','오'] },
  { groupKo: 'か행', level: 'K1', hira: ['か','き','く','け','こ'], kata: ['カ','キ','ク','ケ','コ'], romaji: ['ka','ki','ku','ke','ko'], korean: ['카','키','쿠','케','코'] },
  { groupKo: 'さ행', level: 'K2', hira: ['さ','し','す','せ','そ'], kata: ['サ','シ','ス','セ','ソ'], romaji: ['sa','shi','su','se','so'], korean: ['사','시','스','세','소'] },
  { groupKo: 'た행', level: 'K3', hira: ['た','ち','つ','て','と'], kata: ['タ','チ','ツ','テ','ト'], romaji: ['ta','chi','tsu','te','to'], korean: ['타','치','츠','테','토'] },
  { groupKo: 'な행', level: 'K4', hira: ['な','に','ぬ','ね','の'], kata: ['ナ','ニ','ヌ','ネ','ノ'], romaji: ['na','ni','nu','ne','no'], korean: ['나','니','누','네','노'] },
  { groupKo: 'は행', level: 'K5', hira: ['は','ひ','ふ','へ','ほ'], kata: ['ハ','ヒ','フ','ヘ','ホ'], romaji: ['ha','hi','fu','he','ho'], korean: ['하','히','후','헤','호'] },
  { groupKo: 'ま행', level: 'K6', hira: ['ま','み','む','め','も'], kata: ['マ','ミ','ム','メ','モ'], romaji: ['ma','mi','mu','me','mo'], korean: ['마','미','무','메','모'] },
  { groupKo: 'や행', level: 'K7', hira: ['や','ゆ','よ'], kata: ['ヤ','ユ','ヨ'], romaji: ['ya','yu','yo'], korean: ['야','유','요'] },
  { groupKo: 'ら행', level: 'K8', hira: ['ら','り','る','れ','ろ'], kata: ['ラ','リ','ル','レ','ロ'], romaji: ['ra','ri','ru','re','ro'], korean: ['라','리','루','레','로'] },
  { groupKo: 'わ행', level: 'K9', hira: ['わ','を','ん'], kata: ['ワ','ヲ','ン'], romaji: ['wa','wo','n'], korean: ['와','오','응'] },
];

// 가타카나 단계 오프셋 (K1행→K11, … K9행→K19). 히라가나 행 level + 10.
const KATA_LEVEL: Record<string, KLevel> = {
  K1: 'K11', K2: 'K12', K3: 'K13', K4: 'K14', K5: 'K15', K6: 'K16', K7: 'K17', K8: 'K18', K9: 'K19',
};

// 헷갈리기 쉬운 글자쌍 (char → 비슷한 char들)
const CONFUSABLES: Record<string, string[]> = {
  あ: ['お'], お: ['あ'], き: ['さ'], さ: ['き', 'ち'], ち: ['さ', 'ら'], ら: ['ち'],
  ぬ: ['め'], め: ['ぬ'], れ: ['わ', 'ね'], わ: ['れ', 'ね'], ね: ['れ', 'わ'],
  る: ['ろ'], ろ: ['る'], は: ['ほ'], ほ: ['は'], し: ['つ'], つ: ['し', 'う'], う: ['つ'],
  シ: ['ツ', 'ソ', 'ン'], ツ: ['シ', 'ソ'], ソ: ['ン', 'シ'], ン: ['ソ', 'シ'],
  ク: ['ケ', 'タ'], ケ: ['ク'], コ: ['ユ'], カ: ['カ'],
};

function build(): KanaItem[] {
  const out: KanaItem[] = [];
  for (const row of ROWS) {
    row.hira.forEach((ch, i) => {
      out.push({
        id: `k_hira_${row.romaji[i]}`, char: ch, script: 'hiragana', kind: 'sei',
        romaji: row.romaji[i], koreanSound: row.korean[i], level: row.level, group: row.groupKo,
        confusables: CONFUSABLES[ch],
      });
    });
    row.kata.forEach((ch, i) => {
      out.push({
        id: `k_kata_${row.romaji[i]}`, char: ch, script: 'katakana', kind: 'sei',
        romaji: row.romaji[i], koreanSound: row.korean[i], level: KATA_LEVEL[row.level], group: `${row.groupKo}(カ)`,
        confusables: CONFUSABLES[ch],
      });
    });
  }
  // 장음 부호 (특수)
  out.push({ id: 'k_long', char: 'ー', script: 'common', kind: 'special', romaji: '-', koreanSound: '장음', level: 'K20', group: '특수표기' });
  return out;
}

export const kana: KanaItem[] = build();
