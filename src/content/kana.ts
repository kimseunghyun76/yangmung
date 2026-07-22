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

// 탁음·반탁음 — 청음 다음 단계. (kind: daku/handaku) 히라 K21~K25, 가타 K26~K30.
const DAKU_ROWS: { groupKo: string; level: KLevel; kataLevel: KLevel; kind: 'daku' | 'handaku'; hira: string[]; kata: string[]; romaji: string[]; korean: string[] }[] = [
  { groupKo: 'が행(탁음)', level: 'K21', kataLevel: 'K26', kind: 'daku', hira: ['が','ぎ','ぐ','げ','ご'], kata: ['ガ','ギ','グ','ゲ','ゴ'], romaji: ['ga','gi','gu','ge','go'], korean: ['가','기','구','게','고'] },
  { groupKo: 'ざ행(탁음)', level: 'K22', kataLevel: 'K27', kind: 'daku', hira: ['ざ','じ','ず','ぜ','ぞ'], kata: ['ザ','ジ','ズ','ゼ','ゾ'], romaji: ['za','ji','zu','ze','zo'], korean: ['자','지','즈','제','조'] },
  // ぢ/づ는 현대 일본어에서 じ/ず와 발음이 같지만(koreanSound 참고), id·표기 충돌을 피하기 위해
  // 가나표 관용 표기인 di/du를 romaji로 사용(연속 청음 구분용 표기이며 실제 발음 표기가 아님).
  { groupKo: 'だ행(탁음)', level: 'K23', kataLevel: 'K28', kind: 'daku', hira: ['だ','ぢ','づ','で','ど'], kata: ['ダ','ヂ','ヅ','デ','ド'], romaji: ['da','di','du','de','do'], korean: ['다','지','즈','데','도'] },
  { groupKo: 'ば행(탁음)', level: 'K24', kataLevel: 'K29', kind: 'daku', hira: ['ば','び','ぶ','べ','ぼ'], kata: ['バ','ビ','ブ','ベ','ボ'], romaji: ['ba','bi','bu','be','bo'], korean: ['바','비','부','베','보'] },
  { groupKo: 'ぱ행(반탁음)', level: 'K25', kataLevel: 'K30', kind: 'handaku', hira: ['ぱ','ぴ','ぷ','ぺ','ぽ'], kata: ['パ','ピ','プ','ペ','ポ'], romaji: ['pa','pi','pu','pe','po'], korean: ['파','피','푸','페','포'] },
];

// 헷갈리기 쉬운 글자쌍 (char → 비슷한 char들)
const CONFUSABLES: Record<string, string[]> = {
  あ: ['お'], お: ['あ'], き: ['さ'], さ: ['き', 'ち'], ち: ['さ', 'ら'], ら: ['ち'],
  ぬ: ['め'], め: ['ぬ'], れ: ['わ', 'ね'], わ: ['れ', 'ね'], ね: ['れ', 'わ'],
  る: ['ろ'], ろ: ['る'], は: ['ほ'], ほ: ['は'], し: ['つ'], つ: ['し', 'う'], う: ['つ'],
  シ: ['ツ', 'ソ', 'ン'], ツ: ['シ', 'ソ'], ソ: ['ン', 'シ'], ン: ['ソ', 'シ'],
  ク: ['ケ', 'タ'], ケ: ['ク'], コ: ['ユ'],
};

// 획순 가이드 — 청음 46+46(히라·가타)만 직접 기술. 탁음·반탁음·요음은 base 글자 획순에서 파생(build 참고).
const STROKE_HIRA: Record<string, string> = {
  あ: '①가로 한 획 ②세로로 내려와 왼쪽 삐침 ③오른쪽에 작은 원',
  い: '①왼쪽 짧은 삐침 ②오른쪽 긴 삐침',
  う: '①위에서 짧게 삐침 ②아래로 둥글게 감아 내림',
  え: '①위에서 가로로 짧게 ②S자로 굽이쳐 내림',
  お: '①세로 ②가로를 지나 오른쪽 위로 삐침 ③작은 삐침',
  か: '①세로 ②가로로 꺾어 오른쪽 삐침 ③오른쪽에 짧은 점',
  き: '①②가로 두 줄 ③세로로 내려긋기 ④왼쪽 아래 삐침',
  く: '꺾쇠 모양으로 한 번에',
  け: '①세로 ②가로 ③오른쪽 세로(꼬리 길게)',
  こ: '①위 가로 ②아래 가로(왼쪽에서 길게)',
  さ: '①가로 ②세로로 내려 삐침 ③오른쪽 위 짧은 삐침',
  し: '위에서 아래로 내려와 왼쪽으로 살짝 굽이침',
  す: '①가로에서 삐침 ②세로로 내려와 동그랗게 감기',
  せ: '①짧은 세로 ②가로 ③세로로 내려와 갈고리',
  そ: '지그재그로 내려긋다 끝에서 삐침',
  た: '①가로 ②세로 삐침 ③④오른쪽에 짧은 획 두 개',
  ち: '①가로 ②세로로 내려와 왼쪽으로 둥글게',
  つ: '왼쪽에서 오른쪽으로 부드럽게 휘어지는 곡선',
  て: '가로로 가다가 꺾어 아래로 삐침',
  と: '①세로 삐침 ②오른쪽 아래로 굽는 획',
  な: '①가로 ②세로 ③④오른쪽에 교차하는 짧은 획',
  に: '①짧은 세로 ②세로 ③가로로 받침',
  ぬ: '①가로에서 세로 ②고리 모양으로 감아 매듭짓기',
  ね: '①가로에서 세로 ②고리(ぬ와 비슷하되 꼬리가 위로)',
  の: '나선형으로 한 번에 돌려 그리기',
  は: '①왼쪽 세로 ②오른쪽 세로 ③가로로 잇기',
  ひ: '왼쪽 위에서 오른쪽 아래로 곡선, 끝에 작은 갈고리',
  ふ: '①②③짧은 삐침 세 개 겹치듯 ④아래로 둥글게 마무리',
  へ: '지붕 모양으로 한 번에(꺾임 한 번)',
  ほ: '①세로 ②③가로 두 줄 ④오른쪽 세로 삐침',
  ま: '①가로 ②세로 ③고리로 마무리',
  み: '①짧은 삐침 ②나선형으로 감기',
  む: '①가로 삐침 ②세로 꺾기 ③고리로 마무리',
  め: '①삐침 ②교차하며 고리 짓기',
  も: '①짧은 세로 ②가로 ③세로로 길게 내려긋기',
  や: '①삐침 ②세로 ③오른쪽 짧은 획',
  ゆ: '①세로로 내려와 왼쪽 삐침 ②고리로 마무리',
  よ: '①가로 삐침 ②세로로 내려와 갈고리',
  ら: '①가로 삐침 ②세로로 내려와 오른쪽으로 둥글게',
  り: '①짧은 삐침 ②긴 세로 삐침',
  る: '세로로 내려와 크게 고리 지으며 마무리',
  れ: '①세로 삐침 ②오른쪽으로 굽어 갈고리',
  ろ: '세로로 내려와 작게 고리 지으며 마무리(る보다 작게)',
  わ: '①가로 삐침 ②세로로 내려와 오른쪽으로 둥글게(고리 없이)',
  を: '①가로 ②세로 삐침 ③오른쪽 아래 짧은 획',
  ん: 'S자 곡선 한 번에',
};
const STROKE_KATA: Record<string, string> = {
  ア: '①왼쪽 위에서 삐침 ②가로+세로로 꺾어 내림',
  イ: '①삐침 ②오른쪽 아래로 삐침',
  ウ: '①점 ②가로 ③세로로 내려 삐침',
  エ: '①②가로 두 줄 ③세로로 잇기(한자 工과 비슷)',
  オ: '①가로 ②세로 ③왼쪽 아래 삐침',
  カ: '①가로에서 세로로 꺾기 ②오른쪽 아래 삐침',
  キ: '①②가로 두 줄 ③세로 지나 삐침',
  ク: '①삐침 ②오른쪽 아래로 꺾기',
  ケ: '①세로 삐침 ②가로 ③오른쪽 아래 삐침',
  コ: '①가로 ②ㄷ자로 감싸기',
  サ: '①세로 ②가로 ③오른쪽 삐침',
  シ: '①②짧은 점 두 개 ③아래에서 위로 삐침',
  ス: '①가로에서 삐침 ②아래로 굽어 내림',
  セ: '①가로 ②세로로 꺾어 내려 삐침',
  ソ: '①②짧은 삐침 두 개(위→아래 방향)',
  タ: '①삐침 ②가로 ③세로로 내려 삐침',
  チ: '①②가로 두 줄 ③세로로 내려 삐침',
  ツ: '①②짧은 삐침 두 개 ③아래에서 위로 삐침(ソ와 방향 반대)',
  テ: '①점 ②가로 ③세로로 내려 삐침',
  ト: '①세로 삐침 ②오른쪽 짧은 삐침',
  ナ: '①가로 ②세로 삐침(한자 十과 비슷)',
  ニ: '①②가로 두 줄',
  ヌ: '①삐침 ②오른쪽 아래로 교차하며 삐침',
  ネ: '①점 ②가로 ③세로 ④좌우 삐침',
  ノ: '오른쪽 위에서 왼쪽 아래로 삐침 한 번',
  ハ: '①왼쪽 삐침 ②오른쪽 삐침(사람 인人과 비슷)',
  ヒ: '①가로 ②세로에서 갈고리',
  フ: '가로에서 꺾어 아래로 삐침 한 번',
  ヘ: '지붕 모양(히라가나 へ와 동일)',
  ホ: '①세로 ②가로 ③④좌우 삐침',
  マ: '①가로에서 꺾기 ②세로 삐침',
  ミ: '①②③짧은 삐침 세 개(물결처럼)',
  ム: '①삐침 ②반대 방향 삐침(교차)',
  メ: '①삐침 ②반대로 교차하는 삐침(X자)',
  モ: '①②가로 두 줄 ③세로로 내려긋기',
  ヤ: '①삐침 ②세로 삐침',
  ユ: '①세로 ②가로로 감싸듯 삐침',
  ヨ: '①②③가로 세 줄(왼쪽 세로로 이어짐)',
  ラ: '①가로에서 삐침 ②오른쪽 아래 삐침',
  リ: '①짧은 세로 삐침 ②긴 세로 삐침',
  ル: '①짧은 삐침 ②길게 오른쪽 아래로 삐침',
  レ: '세로로 내려와 오른쪽 위로 삐침(체크 모양)',
  ロ: '네모(한자 口)를 세 획으로',
  ワ: '①가로에서 삐침 ②오른쪽 아래 삐침',
  ヲ: '①가로 ②세로 삐침 ③오른쪽 짧은 획',
  ン: '①왼쪽 위 삐침 ②오른쪽 아래로 삐침(교차)',
};

// 빠르게 외우는 시각 연상 팁 — 짧고 구체적인 한 줄.
const MNEMONIC_HIRA: Record<string, string> = {
  あ: '안경 쓴 사람 옆모습', い: '나란히 선 젓가락 두 짝', う: '모자를 쓴 얼굴', え: '꿈틀대는 지렁이',
  お: '리본을 맨 머리', か: '낫처럼 구부러진 모양', き: '열쇠 구멍 모양', く: '입을 벌린 옆얼굴(く=구부러진 갈고리)',
  け: '깃발이 꽂힌 막대', こ: '누워있는 계단 두 칸', さ: '낚싯대를 든 팔', し: '낚싯바늘 모양',
  す: '소용돌이(수채 구멍)', せ: '접힌 부채', そ: '번개 치는 모양', た: '밭(田)에 지팡이 꽂은 모양',
  ち: '땅에서 자란 새싹', つ: '초승달 모양', て: '손을 들어 인사하는 모양', と: '깃발이 나부끼는 모양',
  な: '나무에 매듭 두 개', に: '숫자 2가 겹친 모양', ぬ: '실이 매듭지어진 모양(ぬ=묶다)', ね: '고양이 꼬리처럼 말린 모양',
  の: '소용돌이 하나', は: '사다리 두 개를 이은 모양', ひ: '웃는 눈썹 모양', ふ: '후지산 봉우리 세 개',
  へ: '지붕 모양(へ 그 자체가 지붕)', ほ: '깃발 두 개 꽂힌 기둥', ま: '동그란 매듭', み: '지렁이가 꼬인 모양',
  む: '벌레(虫)가 웅크린 모양', め: '눈을 가늘게 뜬 모양', も: '깃대에 깃발 하나', や: '화살(矢)이 날아가는 모양',
  ゆ: '온천 온수 마크(ゆ=온천)', よ: '낚싯대에 걸린 물고기', ら: '토끼(라비트)의 귀 모양', り: '두 다리로 선 사람',
  る: '동그랗게 만 두루마리', れ: '체크무늬처럼 꺾인 모양', ろ: '작게 만 종이 두루마리', わ: '갈고리 모양(반지 고리)',
  を: '깃발 든 팔 모양(거의 안 쓰는 조사 전용 글자)', ん: '구불구불한 뱀 한 마리',
};
const MNEMONIC_KATA: Record<string, string> = {
  ア: '지붕 아래 삐침(아파트 지붕)', イ: '사람 인(人)과 닮은 모양', ウ: '집 지붕에 우산 쓴 모양', エ: '공사장 자재(工)',
  オ: '나무(木)에서 가지 하나 뺀 모양', カ: '낫(카마) 모양', キ: '열쇠(키) 모양', ク: '갈고리 모양',
  ケ: '깃발 꽂은 모양', コ: 'ㄷ자 상자 모양', サ: '작살 모양', シ: '물방울 두 개 튀는 모양',
  ス: '스키 타는 모양', セ: '세모난 지붕', ソ: '빗방울 두 개(소나기)', タ: '저녁(タ=夕) 별 모양',
  チ: '干(방패 간)과 비슷한 모양', ツ: '물방울 두 개(ツ=쓰나미 물결)', テ: '테이블 모양', ト: '문(도어) 모양',
  ナ: '십자가(十) 모양', ニ: '숫자 2를 눕힌 모양', ヌ: '누비질하듯 교차한 모양', ネ: '제사상(示) 모양',
  ノ: '빗금 하나', ハ: '사람 인(人)이 벌어진 모양', ヒ: '갈고리 낚싯바늘', フ: '갈고리 하나(후크)',
  ヘ: '산 모양(지붕)', ホ: '별(호시) 모양 십자', マ: '갈고리에 걸린 모양', ミ: '물결 세 줄(미소짓는 파도)',
  ム: '뾰족한 산(무) 모양', メ: 'X자 교차(메뉴 X 표시)', モ: '나무(木)에서 가지 하나', ヤ: '화살(야리) 모양',
  ユ: '삽(유) 모양', ヨ: '갈퀴 세 갈래', ラ: '갈고리 하나(라디오 안테나)', リ: '나란한 막대 두 개',
  ル: '흐르는 물줄기(루트)', レ: '체크 표시 모양', ロ: '네모 상자(입 구口)', ワ: '갈고리 모양(와인잔)',
  ヲ: '깃발 든 팔 모양(거의 안 쓰는 조사 전용 글자)', ン: '교차하는 삐침 두 개',
};

// 탁음·반탁음의 획순/연상은 base(청음) 글자에서 파생 — か→が처럼 탁점(゛)·반탁점(゜)만 추가되므로
// base 글자 하나하나를 다시 기술하지 않고 여기 매핑 하나로 재사용한다.
const DAKU_BASE: Record<string, string> = {
  が: 'か', ぎ: 'き', ぐ: 'く', げ: 'け', ご: 'こ',
  ざ: 'さ', じ: 'し', ず: 'す', ぜ: 'せ', ぞ: 'そ',
  だ: 'た', ぢ: 'ち', づ: 'つ', で: 'て', ど: 'と',
  ば: 'は', び: 'ひ', ぶ: 'ふ', べ: 'へ', ぼ: 'ほ',
  ぱ: 'は', ぴ: 'ひ', ぷ: 'ふ', ぺ: 'へ', ぽ: 'ほ',
  ガ: 'カ', ギ: 'キ', グ: 'ク', ゲ: 'ケ', ゴ: 'コ',
  ザ: 'サ', ジ: 'シ', ズ: 'ス', ゼ: 'セ', ゾ: 'ソ',
  ダ: 'タ', ヂ: 'チ', ヅ: 'ツ', デ: 'テ', ド: 'ト',
  バ: 'ハ', ビ: 'ヒ', ブ: 'フ', ベ: 'ヘ', ボ: 'ホ',
  パ: 'ハ', ピ: 'ヒ', プ: 'フ', ペ: 'ヘ', ポ: 'ホ',
};
function derivedStroke(ch: string, kind: 'daku' | 'handaku', isHira: boolean): string | undefined {
  const base = DAKU_BASE[ch];
  const baseGuide = base ? (isHira ? STROKE_HIRA[base] : STROKE_KATA[base]) : undefined;
  if (!baseGuide) return undefined;
  const mark = kind === 'daku' ? '탁점(゛) 추가' : '반탁점(゜) 추가';
  return `${baseGuide} + 오른쪽 위 ${mark}`;
}
function derivedMnemonic(ch: string, isHira: boolean): string | undefined {
  const base = DAKU_BASE[ch];
  const baseMnemo = base ? (isHira ? MNEMONIC_HIRA[base] : MNEMONIC_KATA[base]) : undefined;
  return baseMnemo ? `${baseMnemo} + 탁점/반탁점` : undefined;
}
// 요음(じゃ 등) 획순/연상 — 두 구성 글자(자음+작은 やゆよ)의 안내를 이어 붙여 파생.
// 첫 글자가 탁음(ぎ·じ·び·ぴ 등)이면 청음 테이블에 없으므로 탁음 파생 함수로 한 번 더 폴백.
function strokeOf(ch: string, kind: 'daku' | 'handaku', isHira: boolean): string | undefined {
  const direct = (isHira ? STROKE_HIRA : STROKE_KATA)[ch];
  return direct ?? derivedStroke(ch, kind, isHira);
}
function mnemonicOf(ch: string, isHira: boolean): string | undefined {
  const direct = (isHira ? MNEMONIC_HIRA : MNEMONIC_KATA)[ch];
  return direct ?? derivedMnemonic(ch, isHira);
}
function yoonStroke(first: string, small: string, isHira: boolean): string | undefined {
  const kind = first === 'ぱ' || first === 'ぴ' || first === 'ぷ' || first === 'ぺ' || first === 'ぽ'
    || first === 'パ' || first === 'ピ' || first === 'プ' || first === 'ペ' || first === 'ポ' ? 'handaku' : 'daku';
  const a = strokeOf(first, kind, isHira); const b = (isHira ? STROKE_HIRA : STROKE_KATA)[small];
  if (!a && !b) return undefined;
  return `${first}: ${a ?? '—'} / 작은 ${small}: ${b ?? '—'}`;
}
function yoonMnemonic(first: string, isHira: boolean): string | undefined {
  const m = mnemonicOf(first, isHira);
  return m ? `${m} + 작게 붙는 글자` : undefined;
}

// 요음 — 자음 + 작은 ゃゅょ. 히라 K31 / 가타 K32 한 묶음씩. [hira, kata, romaji, korean]
const YOON: [string, string, string, string][] = [
  ['きゃ','キャ','kya','캬'],['きゅ','キュ','kyu','큐'],['きょ','キョ','kyo','쿄'],
  ['しゃ','シャ','sha','샤'],['しゅ','シュ','shu','슈'],['しょ','ショ','sho','쇼'],
  ['ちゃ','チャ','cha','차'],['ちゅ','チュ','chu','추'],['ちょ','チョ','cho','초'],
  ['にゃ','ニャ','nya','냐'],['にゅ','ニュ','nyu','뉴'],['にょ','ニョ','nyo','뇨'],
  ['ひゃ','ヒャ','hya','햐'],['ひゅ','ヒュ','hyu','휴'],['ひょ','ヒョ','hyo','효'],
  ['みゃ','ミャ','mya','먀'],['みゅ','ミュ','myu','뮤'],['みょ','ミョ','myo','묘'],
  ['りゃ','リャ','rya','랴'],['りゅ','リュ','ryu','류'],['りょ','リョ','ryo','료'],
  ['ぎゃ','ギャ','gya','갸'],['ぎゅ','ギュ','gyu','규'],['ぎょ','ギョ','gyo','교'],
  ['じゃ','ジャ','ja','자'],['じゅ','ジュ','ju','주'],['じょ','ジョ','jo','조'],
  ['びゃ','ビャ','bya','뱌'],['びゅ','ビュ','byu','뷰'],['びょ','ビョ','byo','뵤'],
  ['ぴゃ','ピャ','pya','퍄'],['ぴゅ','ピュ','pyu','퓨'],['ぴょ','ピョ','pyo','표'],
];

function build(): KanaItem[] {
  const out: KanaItem[] = [];
  for (const row of ROWS) {
    row.hira.forEach((ch, i) => {
      out.push({
        id: `k_hira_${row.romaji[i]}`, char: ch, script: 'hiragana', kind: 'sei',
        romaji: row.romaji[i], koreanSound: row.korean[i], level: row.level, group: row.groupKo,
        confusables: CONFUSABLES[ch], strokeGuide: STROKE_HIRA[ch], mnemonic: MNEMONIC_HIRA[ch],
      });
    });
    row.kata.forEach((ch, i) => {
      out.push({
        id: `k_kata_${row.romaji[i]}`, char: ch, script: 'katakana', kind: 'sei',
        romaji: row.romaji[i], koreanSound: row.korean[i], level: KATA_LEVEL[row.level], group: `${row.groupKo}(カ)`,
        confusables: CONFUSABLES[ch], strokeGuide: STROKE_KATA[ch], mnemonic: MNEMONIC_KATA[ch],
      });
    });
  }
  // 탁음·반탁음 — 획순/연상은 base(청음) 글자에서 파생
  for (const row of DAKU_ROWS) {
    row.hira.forEach((ch, i) => {
      out.push({
        id: `k_hira_${row.romaji[i]}`, char: ch, script: 'hiragana', kind: row.kind,
        romaji: row.romaji[i], koreanSound: row.korean[i], level: row.level, group: row.groupKo,
        confusables: CONFUSABLES[ch], strokeGuide: derivedStroke(ch, row.kind, true), mnemonic: derivedMnemonic(ch, true),
      });
    });
    row.kata.forEach((ch, i) => {
      out.push({
        id: `k_kata_${row.romaji[i]}`, char: ch, script: 'katakana', kind: row.kind,
        romaji: row.romaji[i], koreanSound: row.korean[i], level: row.kataLevel, group: `${row.groupKo}(カ)`,
        confusables: CONFUSABLES[ch], strokeGuide: derivedStroke(ch, row.kind, false), mnemonic: derivedMnemonic(ch, false),
      });
    });
  }
  // 요음 (히라 K31 / 가타 K32) — 획순/연상은 두 구성 글자에서 파생
  for (const [hira, kata, romaji, korean] of YOON) {
    out.push({
      id: `k_hira_${romaji}`, char: hira, script: 'hiragana', kind: 'yoon', romaji, koreanSound: korean, level: 'K31', group: '요음', components: [hira[0], hira[1]],
      strokeGuide: yoonStroke(hira[0], hira[1], true), mnemonic: yoonMnemonic(hira[0], true),
    });
    out.push({
      id: `k_kata_${romaji}`, char: kata, script: 'katakana', kind: 'yoon', romaji, koreanSound: korean, level: 'K32', group: '요음(カ)', components: [kata[0], kata[1]],
      strokeGuide: yoonStroke(kata[0], kata[1], false), mnemonic: yoonMnemonic(kata[0], false),
    });
  }
  // 장음 부호 (특수)
  out.push({ id: 'k_long', char: 'ー', script: 'common', kind: 'special', romaji: '-', koreanSound: '장음', level: 'K20', group: '특수표기', strokeGuide: '왼쪽에서 오른쪽으로 가로 한 획', mnemonic: '모음을 길게 늘이는 막대 표시' });
  return out;
}

export const kana: KanaItem[] = build();
