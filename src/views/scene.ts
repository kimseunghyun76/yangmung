// 장면 시각 컨셉 — 장소별 마크·배경색·모노 아이콘(+ 향후 이미지/영상 슬롯). "상황 기억" 장치.
import { CONTENT } from '../content';
import type { IconName } from '../ui/Icon';

export interface SceneVisual { emoji: string; icon: IconName; bg: string; accent: string; thumb?: string; hero?: string; backdrop?: string; success?: string; loop?: string }

const BACKDROPS: Record<string, string> = {
  C1: '/scenes/generated/c1-conbini-bg.webp',
  C2: '/scenes/generated/c2-restaurant-bg.webp',
  C3: '/scenes/generated/c3-train-bg.webp',
  C4: '/scenes/generated/c4-hotel-bg.webp',
  C5: '/scenes/generated/c5-street-bg.webp',
  C6: '/scenes/generated/c6-pharmacy-bg.webp',
  C7: '/scenes/generated/c7-shopping-bg.webp',
  C8: '/scenes/generated/c8-taxi-bg.webp',
  C9: '/scenes/generated/c9-airport-bg.webp',
  C10: '/scenes/generated/c10-exchange-bg.webp',
  C11: '/scenes/generated/c11-locker-bg.webp',
  C12: '/scenes/generated/c12-delivery-bg.webp',
  C13: '/scenes/generated/c13-ramen-bg.webp',
  C14: '/scenes/generated/c14-cafe-bg.webp',
  C15: '/scenes/generated/c15-bakery-bg.webp',
  C16: '/scenes/generated/c16-izakaya-bg.webp',
  C17: '/scenes/generated/c17-sushi-bg.webp',
  C18: '/scenes/generated/c18-tourist-info-bg.webp',
  C19: '/scenes/generated/c19-shrine-bg.webp',
  C20: '/scenes/generated/c20-onsen-bg.webp',
  C21: '/scenes/generated/c21-ryokan-bg.webp',
  C22: '/scenes/generated/c22-bus-bg.webp',
  C23: '/scenes/generated/c23-shinkansen-bg.webp',
  C24: '/scenes/generated/c24-rental-car-bg.webp',
  C25: '/scenes/generated/c25-hospital-bg.webp',
  C26: '/scenes/generated/c26-police-bg.webp',
  C27: '/scenes/generated/c27-emergency-bg.webp',
  C28: '/scenes/generated/c28-telecom-bg.webp',
  C29: '/scenes/generated/c29-laundromat-bg.webp',
  C30: '/scenes/generated/c30-festival-bg.webp',
  C31: '/scenes/generated/c31-kaiten-sushi-bg.webp',
  C32: '/scenes/generated/c32-fashion-fitting-bg.webp',
  C33: '/scenes/generated/c33-hotel-umbrella-bg.webp',
  C34: '/scenes/generated/c34-hotel-room-change-bg.webp',
  C35: '/scenes/generated/c35-narita-ticket-bg.webp',
  C36: '/scenes/generated/c36-airport-baggage-bg.webp',
  C37: '/scenes/generated/c37-breakfast-buffet-bg.webp',
  C38: '/scenes/generated/c38-sushi-extra-bg.webp',
  C39: '/scenes/generated/c39-pasta-options-bg.webp',
  C40: '/scenes/generated/c40-fashion-checkout-bg.webp',
  C41: '/scenes/generated/c41-refund-exchange-bg.webp',
  C42: '/scenes/generated/c42-vending-machine-bg.webp',
  C43: '/scenes/generated/c43-atm-bg.webp',
  C44: '/scenes/generated/c44-copy-machine-bg.webp',
  C45: '/scenes/generated/c45-mobile-pickup-bg.webp',
  C46: '/scenes/generated/c46-stadium-bg.webp',
  C47: '/scenes/generated/c47-mall-info-bg.webp',
  C48: '/scenes/generated/c48-prescription-pharmacy-bg.webp',
  C49: '/scenes/generated/c49-omakase-sushi-bg.webp',
  C50: '/scenes/generated/c50-lost-street-bg.webp',
};
const LEGACY_SCENE_SVGS = new Set(['C0', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10', 'C11', 'C12', 'C13']);

const MANGA_BACKDROPS = {
  shop: [
    '/scenes/manga-variants/solo-shop-01.webp',
    '/scenes/manga-variants/ff-shop-01.webp',
    '/scenes/manga-variants/mf-shop-01.webp',
  ],
  restaurant: [
    '/scenes/manga-variants/solo-restaurant-02.webp',
    '/scenes/manga-variants/ff-restaurant-02.webp',
    '/scenes/manga-variants/mf-restaurant-02.webp',
  ],
  street: [
    '/scenes/manga-variants/solo-street-03.webp',
    '/scenes/manga-variants/ff-street-03.webp',
    '/scenes/manga-variants/mf-street-03.webp',
  ],
} as const;

const SESSION_MANGA_WEBP_IDS = new Set(['C1', 'C2', 'C3', 'C4']);
const SESSION_MANGA_IDS = new Set(Array.from({ length: 50 }, (_, i) => `C${i + 1}`));
const SESSION_MANGA_NAMES = [
  'solo-shop-01',
  'solo-restaurant-02',
  'solo-street-03',
  'ff-shop-01',
  'ff-restaurant-02',
  'ff-street-03',
  'mf-shop-01',
  'mf-restaurant-02',
  'mf-street-03',
];

export function isMangaSceneImage(src?: string): boolean {
  return !!src && (
    src.includes('/scenes/manga-variants/')
    || src.includes('/scenes/session-variants/')
    || src.includes('/scenes/quick-practice/')
  );
}

export function quickPracticeBackdrop(kind: string): string {
  return `/scenes/quick-practice/${kind}.svg`;
}

type MangaBackdropGroup = keyof typeof MANGA_BACKDROPS;

const SHOP_PLACES = new Set([
  '편의점', '쇼핑', '약국', '환전', '통신매장', '편집샵피팅', '편집샵계산',
  '쇼핑몰 서비스 데스크', '자판기', '편의점 ATM', '편의점 복합기', '복합쇼핑몰',
]);
const RESTAURANT_PLACES = new Set([
  '식당', '라멘', '카페', '빵집', '이자카야', '스시집', '회전초밥',
  '조식뷔페', '스시추가', '파스타', '스시 오마카세', '카페·레스토랑 픽업 카운터',
]);
const mangaBackdropCache = new Map<string, string>();

function mangaBackdropGroup(place?: string): MangaBackdropGroup {
  if (place && SHOP_PLACES.has(place)) return 'shop';
  if (place && RESTAURANT_PLACES.has(place)) return 'restaurant';
  return 'street';
}

function hashIndex(key: string, size: number): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return Math.abs(h) % size;
}

// 장면에 맞는 3컷(solo·ff·mf) 풀. C1~C3는 미션 전용 폴더, 그 외는 장소 그룹 공용.
function mangaBackdropPool(missionId: string, place?: string): readonly string[] {
  const group = mangaBackdropGroup(place);
  if (SESSION_MANGA_IDS.has(missionId)) {
    const ext = SESSION_MANGA_WEBP_IDS.has(missionId) ? 'webp' : 'svg';
    return SESSION_MANGA_NAMES
      .filter((name) => name.includes(`-${group}-`))
      .map((name) => `/scenes/session-variants/${missionId}/${name}.${ext}`);
  }
  return MANGA_BACKDROPS[group];
}

function mangaBackdropFor(missionId?: string, place?: string): string | undefined {
  if (!missionId) return undefined;
  const pool = mangaBackdropPool(missionId, place);
  if (!pool.length) return undefined;
  const key = `${missionId}:${mangaBackdropGroup(place)}`;
  const cached = mangaBackdropCache.get(key);
  if (cached) return cached;
  const idx = typeof window === 'undefined' ? hashIndex(key, pool.length) : Math.floor(Math.random() * pool.length);
  const picked = pool[idx];
  mangaBackdropCache.set(key, picked);
  return picked;
}

// 세션마다 바뀌는 랜덤 시작 오프셋. 카드 인덱스와 더해 컷을 "회전"시킨다.
let backdropSeed = Math.floor(Math.random() * 997);

// 세션 시작마다 호출 → 캐시를 비우고 시드를 새로 뽑아, 컷 순서를 매 세션 다르게 한다.
export function resetMangaBackdrops(): void {
  mangaBackdropCache.clear();
  backdropSeed = Math.floor(Math.random() * 997);
}

// 카드(화면) 전환마다 다른 컷을 노출. (시드+인덱스) 회전이라 연속 카드는 반드시 다른 컷이 되고,
// 같은 카드를 다시 그릴 때(정답 클릭 등)는 인덱스가 같아 깜빡이지 않는다.
export function sceneBackdropForCard(missionId?: string, cardIndex = 0): string | undefined {
  if (!missionId) return undefined;
  const m = CONTENT.missions.find((x) => x.id === missionId);
  const pool = mangaBackdropPool(missionId, m?.place);
  if (!pool.length) return BACKDROPS[missionId];
  return pool[(backdropSeed + cardIndex) % pool.length] ?? BACKDROPS[missionId];
}

const BY_PLACE: Record<string, SceneVisual> = {
  편의점: { emoji: '店', icon: 'scene-conbini', bg: '#eef6ff', accent: '#2563eb' },
  식당: { emoji: '食', icon: 'scene-restaurant', bg: '#fff4ec', accent: '#ea580c' },
  전철: { emoji: '電', icon: 'scene-train', bg: '#eefcf3', accent: '#16a34a' },
  호텔: { emoji: '宿', icon: 'scene-hotel', bg: '#f3f0ff', accent: '#7c3aed' },
  거리: { emoji: '道', icon: 'scene-street', bg: '#f0fdfa', accent: '#0d9488' },
  약국: { emoji: '薬', icon: 'scene-pharmacy', bg: '#fef2f2', accent: '#e11d48' },
  쇼핑: { emoji: '買', icon: 'scene-shopping', bg: '#fdf4ff', accent: '#c026d3' },
  택시: { emoji: '車', icon: 'scene-taxi', bg: '#fefce8', accent: '#ca8a04' },
  공항: { emoji: '空', icon: 'scene-airport', bg: '#eff6ff', accent: '#2563eb' },
  환전: { emoji: '円', icon: 'scene-exchange', bg: '#f7fee7', accent: '#65a30d' },
  코인로커: { emoji: '鍵', icon: 'scene-locker', bg: '#f1f5f9', accent: '#475569' },
  택배: { emoji: '箱', icon: 'scene-delivery', bg: '#fff7ed', accent: '#c2410c' },
  라멘: { emoji: '麺', icon: 'scene-ramen', bg: '#fff1f2', accent: '#e11d48' },
  카페: { emoji: '珈', icon: 'scene-restaurant', bg: '#fff7ed', accent: '#b45309' },
  빵집: { emoji: '麺', icon: 'scene-store', bg: '#fefce8', accent: '#ca8a04' },
  이자카야: { emoji: '酒', icon: 'scene-restaurant', bg: '#fff1f2', accent: '#be123c' },
  스시집: { emoji: '鮨', icon: 'scene-restaurant', bg: '#ecfeff', accent: '#0891b2' },
  관광안내소: { emoji: '旅', icon: 'scene-street', bg: '#eff6ff', accent: '#2563eb' },
  신사: { emoji: '社', icon: 'scene-street', bg: '#fff1f2', accent: '#dc2626' },
  온천: { emoji: '湯', icon: 'scene-hotel', bg: '#ecfeff', accent: '#0e7490' },
  료칸: { emoji: '宿', icon: 'scene-hotel', bg: '#faf5ff', accent: '#9333ea' },
  버스: { emoji: '車', icon: 'scene-train', bg: '#f0fdf4', accent: '#15803d' },
  신칸센: { emoji: '新', icon: 'scene-train', bg: '#eff6ff', accent: '#1d4ed8' },
  렌터카: { emoji: '車', icon: 'scene-taxi', bg: '#fefce8', accent: '#a16207' },
  병원: { emoji: '医', icon: 'scene-pharmacy', bg: '#fef2f2', accent: '#dc2626' },
  경찰서: { emoji: '交', icon: 'scene-street', bg: '#eff6ff', accent: '#1d4ed8' },
  긴급상황: { emoji: '助', icon: 'scene-pharmacy', bg: '#fff1f2', accent: '#e11d48' },
  통신매장: { emoji: '信', icon: 'scene-shopping', bg: '#f5f3ff', accent: '#7c3aed' },
  코인세탁: { emoji: '洗', icon: 'scene-store', bg: '#ecfeff', accent: '#0891b2' },
  축제: { emoji: '祭', icon: 'scene-street', bg: '#fff7ed', accent: '#ea580c' },
  회전초밥: { emoji: '鮨', icon: 'scene-restaurant', bg: '#ecfeff', accent: '#0891b2' },
  편집샵피팅: { emoji: '服', icon: 'scene-shopping', bg: '#fdf4ff', accent: '#c026d3' },
  호텔우산: { emoji: '傘', icon: 'scene-hotel', bg: '#eff6ff', accent: '#2563eb' },
  호텔방변경: { emoji: '室', icon: 'scene-hotel', bg: '#f3f0ff', accent: '#7c3aed' },
  나리타역: { emoji: '券', icon: 'scene-train', bg: '#eff6ff', accent: '#1d4ed8' },
  공항수하물: { emoji: '荷', icon: 'scene-airport', bg: '#f1f5f9', accent: '#475569' },
  조식뷔페: { emoji: '朝', icon: 'scene-restaurant', bg: '#fff7ed', accent: '#d97706' },
  스시추가: { emoji: '魚', icon: 'scene-restaurant', bg: '#ecfeff', accent: '#0e7490' },
  파스타: { emoji: '麺', icon: 'scene-restaurant', bg: '#fff4ec', accent: '#ea580c' },
  편집샵계산: { emoji: '税', icon: 'scene-shopping', bg: '#fdf4ff', accent: '#c026d3' },
  '쇼핑몰 서비스 데스크': { emoji: '換', icon: 'scene-shopping', bg: '#fdf4ff', accent: '#c026d3' },
  자판기: { emoji: '飲', icon: 'scene-store', bg: '#eff6ff', accent: '#2563eb' },
  '편의점 ATM': { emoji: '円', icon: 'scene-exchange', bg: '#f7fee7', accent: '#65a30d' },
  '편의점 복합기': { emoji: '印', icon: 'scene-store', bg: '#f1f5f9', accent: '#475569' },
  '카페·레스토랑 픽업 카운터': { emoji: '受', icon: 'scene-restaurant', bg: '#fff7ed', accent: '#b45309' },
  '야구장·스타디움': { emoji: '球', icon: 'scene-store', bg: '#eff6ff', accent: '#2563eb' },
  복합쇼핑몰: { emoji: '案', icon: 'scene-shopping', bg: '#fdf4ff', accent: '#c026d3' },
  '스시 오마카세': { emoji: '鮨', icon: 'scene-restaurant', bg: '#ecfeff', accent: '#0e7490' },
  길거리: { emoji: '道', icon: 'scene-street', bg: '#f0fdfa', accent: '#0d9488' },
  가게: { emoji: '店', icon: 'scene-store', bg: '#fdf2f8', accent: '#db2777' },
};

const DEFAULT: SceneVisual = { emoji: '旅', icon: 'scene-store', bg: '#f6e4df', accent: '#c8453a' };

export function sceneVisualByPlace(place?: string): SceneVisual {
  const base = (place && BY_PLACE[place]) || DEFAULT;
  const mission = place ? CONTENT.missions.find((m) => m.place === place && BACKDROPS[m.id]) : undefined;
  if (!mission) return base;
  const key = mission.id.toLowerCase();
  const legacy = LEGACY_SCENE_SVGS.has(mission.id) ? {
    thumb: `/scenes/${key}-thumb.svg`,
    hero: `/scenes/${key}-hero.svg`,
  } : {};
  return {
    ...base,
    ...legacy,
    backdrop: mangaBackdropFor(mission.id, mission.place) ?? BACKDROPS[mission.id],
  };
}

// 미션의 visual 슬롯이 있으면 우선 적용(이미지/영상 갈아끼우기 지점), 없으면 장소 기본값.
export function sceneVisualByMission(missionId?: string): SceneVisual {
  const m = CONTENT.missions.find((x) => x.id === missionId);
  const base = sceneVisualByPlace(m?.place);
  const v = m?.visual;
  const key = missionId?.toLowerCase();
  const hasLegacySvg = !!missionId && !!key && LEGACY_SCENE_SVGS.has(missionId);
  const generated = {
    ...(hasLegacySvg ? {
      thumb: `/scenes/${key}-thumb.svg`,
      hero: `/scenes/${key}-hero.svg`,
    } : {}),
    ...(missionId && BACKDROPS[missionId] ? { backdrop: mangaBackdropFor(missionId, m?.place) ?? BACKDROPS[missionId] } : {}),
  };
  if (!v) return { ...base, ...generated };
  return {
    emoji: v.emoji ?? base.emoji,
    icon: base.icon,
    bg: v.bg ?? base.bg,
    accent: base.accent,
    thumb: v.thumb ?? generated.thumb,
    hero: v.hero ?? generated.hero,
    backdrop: generated.backdrop,
    success: v.success,
    loop: v.loop,
  };
}

// 장면(장소)별로 그 미션이 쓰는 표현 id 모음 — 복습장 "장면별 필터"·여행 치트시트용.
export function phraseIdsByPlace(): { place: string; phraseIds: string[] }[] {
  const out: { place: string; phraseIds: string[] }[] = [];
  for (const m of CONTENT.missions) {
    if (!m.place || m.id === 'C0') continue; // 튜토리얼 제외
    const ids = new Set<string>();
    for (const step of m.steps) {
      if (step.promptPhraseId) ids.add(step.promptPhraseId);
      for (const c of step.choices) if (c.phraseId) ids.add(c.phraseId);
    }
    for (const pid of m.speakPhraseIds ?? []) ids.add(pid);
    out.push({ place: m.place, phraseIds: [...ids] });
  }
  return out;
}
