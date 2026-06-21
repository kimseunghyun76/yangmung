// 생활 기초 — 숫자·셈 단위·순서·요일·달·달력·시간·금액.
// 열거형(1~10, 1~12월, 시각 등)이라 "표(grid)로 한 번에" 학습하기에 적합하다.
// (예전엔 어휘 커리큘럼의 months/time_expr/numbers 그룹과 중복됐다 → 이쪽을 단일 출처로 통일)

export type BasicGroup = 'number' | 'counter' | 'order' | 'weekday' | 'month' | 'calendar' | 'time' | 'money';

export interface BasicLifeItem {
  id: string;
  group: BasicGroup;
  ja: string;
  kana: string;
  korean: string;
}

// 표에서 보여줄 순서 + 라벨 + 열 수(한 줄에 몇 칸).
export const BASIC_GROUPS: { group: BasicGroup; label: string; sub: string; cols: number }[] = [
  { group: 'number', label: '숫자', sub: '0 ~ 10000', cols: 3 },
  { group: 'counter', label: '셈 단위', sub: '장·개·명 …', cols: 2 },
  { group: 'order', label: '순서', sub: '첫째·다음·마지막', cols: 3 },
  { group: 'weekday', label: '요일', sub: '월 ~ 일 + 주말', cols: 4 },
  { group: 'month', label: '달·월', sub: '1월 ~ 12월', cols: 4 },
  { group: 'calendar', label: '날짜·때', sub: '오늘·내일·오전 …', cols: 3 },
  { group: 'time', label: '시간', sub: '1시 ~ 12시 + 분', cols: 4 },
  { group: 'money', label: '금액', sub: '엔화·세금', cols: 3 },
];

export const BASIC_GROUP_LABEL: Record<BasicGroup, string> = Object.fromEntries(
  BASIC_GROUPS.map((g) => [g.group, g.label]),
) as Record<BasicGroup, string>;

export const BASIC_LIFE_ITEMS: BasicLifeItem[] = [
  // ── 숫자 0~10000 ──
  { id: 'number:0', group: 'number', ja: '〇 / 零', kana: 'ゼロ / れい', korean: '0' },
  { id: 'number:1', group: 'number', ja: '一', kana: 'いち', korean: '1' },
  { id: 'number:2', group: 'number', ja: '二', kana: 'に', korean: '2' },
  { id: 'number:3', group: 'number', ja: '三', kana: 'さん', korean: '3' },
  { id: 'number:4', group: 'number', ja: '四', kana: 'よん', korean: '4' },
  { id: 'number:5', group: 'number', ja: '五', kana: 'ご', korean: '5' },
  { id: 'number:6', group: 'number', ja: '六', kana: 'ろく', korean: '6' },
  { id: 'number:7', group: 'number', ja: '七', kana: 'なな', korean: '7' },
  { id: 'number:8', group: 'number', ja: '八', kana: 'はち', korean: '8' },
  { id: 'number:9', group: 'number', ja: '九', kana: 'きゅう', korean: '9' },
  { id: 'number:10', group: 'number', ja: '十', kana: 'じゅう', korean: '10' },
  { id: 'number:11', group: 'number', ja: '十一', kana: 'じゅういち', korean: '11' },
  { id: 'number:12', group: 'number', ja: '十二', kana: 'じゅうに', korean: '12' },
  { id: 'number:20', group: 'number', ja: '二十', kana: 'にじゅう', korean: '20' },
  { id: 'number:30', group: 'number', ja: '三十', kana: 'さんじゅう', korean: '30' },
  { id: 'number:40', group: 'number', ja: '四十', kana: 'よんじゅう', korean: '40' },
  { id: 'number:50', group: 'number', ja: '五十', kana: 'ごじゅう', korean: '50' },
  { id: 'number:100', group: 'number', ja: '百', kana: 'ひゃく', korean: '100' },
  { id: 'number:1000', group: 'number', ja: '千', kana: 'せん', korean: '1000' },
  { id: 'number:10000', group: 'number', ja: '一万', kana: 'いちまん', korean: '10000' },

  // ── 셈 단위(카운터) ──
  { id: 'counter:mai', group: 'counter', ja: '〜枚', kana: 'まい', korean: '~장 (얇은 것)' },
  { id: 'counter:hon', group: 'counter', ja: '〜本', kana: 'ほん', korean: '~자루/개 (긴 것)' },
  { id: 'counter:ko', group: 'counter', ja: '〜個', kana: 'こ', korean: '~개 (작고 둥근 것)' },
  { id: 'counter:hai', group: 'counter', ja: '〜杯', kana: 'はい', korean: '~잔 (음료)' },
  { id: 'counter:satsu', group: 'counter', ja: '〜冊', kana: 'さつ', korean: '~권 (책)' },
  { id: 'counter:hitori', group: 'counter', ja: '一人', kana: 'ひとり', korean: '1명' },
  { id: 'counter:futari', group: 'counter', ja: '二人', kana: 'ふたり', korean: '2명' },
  { id: 'counter:sannin', group: 'counter', ja: '三人', kana: 'さんにん', korean: '3명' },

  // ── 순서 ──
  { id: 'order:1', group: 'order', ja: '一番目', kana: 'いちばんめ', korean: '첫 번째' },
  { id: 'order:2', group: 'order', ja: '二番目', kana: 'にばんめ', korean: '두 번째' },
  { id: 'order:3', group: 'order', ja: '三番目', kana: 'さんばんめ', korean: '세 번째' },
  { id: 'order:before', group: 'order', ja: '前', kana: 'まえ', korean: '앞/전' },
  { id: 'order:next', group: 'order', ja: '次', kana: 'つぎ', korean: '다음' },
  { id: 'order:last', group: 'order', ja: '最後', kana: 'さいご', korean: '마지막' },

  // ── 요일 ──
  { id: 'weekday:mon', group: 'weekday', ja: '月曜日', kana: 'げつようび', korean: '월요일' },
  { id: 'weekday:tue', group: 'weekday', ja: '火曜日', kana: 'かようび', korean: '화요일' },
  { id: 'weekday:wed', group: 'weekday', ja: '水曜日', kana: 'すいようび', korean: '수요일' },
  { id: 'weekday:thu', group: 'weekday', ja: '木曜日', kana: 'もくようび', korean: '목요일' },
  { id: 'weekday:fri', group: 'weekday', ja: '金曜日', kana: 'きんようび', korean: '금요일' },
  { id: 'weekday:sat', group: 'weekday', ja: '土曜日', kana: 'どようび', korean: '토요일' },
  { id: 'weekday:sun', group: 'weekday', ja: '日曜日', kana: 'にちようび', korean: '일요일' },
  { id: 'weekday:weekend', group: 'weekday', ja: '週末', kana: 'しゅうまつ', korean: '주말' },

  // ── 달·월 1~12 ──
  { id: 'month:1', group: 'month', ja: '一月', kana: 'いちがつ', korean: '1월' },
  { id: 'month:2', group: 'month', ja: '二月', kana: 'にがつ', korean: '2월' },
  { id: 'month:3', group: 'month', ja: '三月', kana: 'さんがつ', korean: '3월' },
  { id: 'month:4', group: 'month', ja: '四月', kana: 'しがつ', korean: '4월' },
  { id: 'month:5', group: 'month', ja: '五月', kana: 'ごがつ', korean: '5월' },
  { id: 'month:6', group: 'month', ja: '六月', kana: 'ろくがつ', korean: '6월' },
  { id: 'month:7', group: 'month', ja: '七月', kana: 'しちがつ', korean: '7월' },
  { id: 'month:8', group: 'month', ja: '八月', kana: 'はちがつ', korean: '8월' },
  { id: 'month:9', group: 'month', ja: '九月', kana: 'くがつ', korean: '9월' },
  { id: 'month:10', group: 'month', ja: '十月', kana: 'じゅうがつ', korean: '10월' },
  { id: 'month:11', group: 'month', ja: '十一月', kana: 'じゅういちがつ', korean: '11월' },
  { id: 'month:12', group: 'month', ja: '十二月', kana: 'じゅうにがつ', korean: '12월' },

  // ── 날짜·때 ──
  { id: 'calendar:today', group: 'calendar', ja: '今日', kana: 'きょう', korean: '오늘' },
  { id: 'calendar:tomorrow', group: 'calendar', ja: '明日', kana: 'あした', korean: '내일' },
  { id: 'calendar:yesterday', group: 'calendar', ja: '昨日', kana: 'きのう', korean: '어제' },
  { id: 'calendar:dayafter', group: 'calendar', ja: '明後日', kana: 'あさって', korean: '모레' },
  { id: 'calendar:morning', group: 'calendar', ja: '午前', kana: 'ごぜん', korean: '오전' },
  { id: 'calendar:afternoon', group: 'calendar', ja: '午後', kana: 'ごご', korean: '오후' },
  { id: 'calendar:thisweek', group: 'calendar', ja: '今週', kana: 'こんしゅう', korean: '이번 주' },
  { id: 'calendar:nextweek', group: 'calendar', ja: '来週', kana: 'らいしゅう', korean: '다음 주' },

  // ── 시간 1시~12시 + 분 ──
  { id: 'time:1', group: 'time', ja: '一時', kana: 'いちじ', korean: '1시' },
  { id: 'time:2', group: 'time', ja: '二時', kana: 'にじ', korean: '2시' },
  { id: 'time:3', group: 'time', ja: '三時', kana: 'さんじ', korean: '3시' },
  { id: 'time:4', group: 'time', ja: '四時', kana: 'よじ', korean: '4시' },
  { id: 'time:5', group: 'time', ja: '五時', kana: 'ごじ', korean: '5시' },
  { id: 'time:6', group: 'time', ja: '六時', kana: 'ろくじ', korean: '6시' },
  { id: 'time:7', group: 'time', ja: '七時', kana: 'しちじ', korean: '7시' },
  { id: 'time:8', group: 'time', ja: '八時', kana: 'はちじ', korean: '8시' },
  { id: 'time:9', group: 'time', ja: '九時', kana: 'くじ', korean: '9시' },
  { id: 'time:10', group: 'time', ja: '十時', kana: 'じゅうじ', korean: '10시' },
  { id: 'time:11', group: 'time', ja: '十一時', kana: 'じゅういちじ', korean: '11시' },
  { id: 'time:12', group: 'time', ja: '十二時', kana: 'じゅうにじ', korean: '12시' },
  { id: 'time:5min', group: 'time', ja: '五分', kana: 'ごふん', korean: '5분' },
  { id: 'time:10min', group: 'time', ja: '十分', kana: 'じゅっぷん', korean: '10분' },
  { id: 'time:15min', group: 'time', ja: '十五分', kana: 'じゅうごふん', korean: '15분' },
  { id: 'time:half', group: 'time', ja: '半 / 三十分', kana: 'はん / さんじゅっぷん', korean: '30분(반)' },
  { id: 'time:now', group: 'time', ja: '今', kana: 'いま', korean: '지금' },

  // ── 금액 ──
  { id: 'money:100', group: 'money', ja: '百円', kana: 'ひゃくえん', korean: '100엔' },
  { id: 'money:500', group: 'money', ja: '五百円', kana: 'ごひゃくえん', korean: '500엔' },
  { id: 'money:1000', group: 'money', ja: '千円', kana: 'せんえん', korean: '1000엔' },
  { id: 'money:2000', group: 'money', ja: '二千円', kana: 'にせんえん', korean: '2000엔' },
  { id: 'money:3000', group: 'money', ja: '三千円', kana: 'さんぜんえん', korean: '3000엔' },
  { id: 'money:5000', group: 'money', ja: '五千円', kana: 'ごせんえん', korean: '5000엔' },
  { id: 'money:10000', group: 'money', ja: '一万円', kana: 'いちまんえん', korean: '10000엔' },
  { id: 'money:tax', group: 'money', ja: '税込', kana: 'ぜいこみ', korean: '세금 포함' },
];
