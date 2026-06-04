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
};

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
  가게: { emoji: '店', icon: 'scene-store', bg: '#fdf2f8', accent: '#db2777' },
};

const DEFAULT: SceneVisual = { emoji: '旅', icon: 'scene-store', bg: '#f6e4df', accent: '#c8453a' };

export function sceneVisualByPlace(place?: string): SceneVisual {
  const base = (place && BY_PLACE[place]) || DEFAULT;
  const mission = place ? CONTENT.missions.find((m) => m.place === place && BACKDROPS[m.id]) : undefined;
  if (!mission) return base;
  const key = mission.id.toLowerCase();
  return {
    ...base,
    thumb: `/scenes/${key}-thumb.svg`,
    hero: `/scenes/${key}-hero.svg`,
    backdrop: BACKDROPS[mission.id],
  };
}

// 미션의 visual 슬롯이 있으면 우선 적용(이미지/영상 갈아끼우기 지점), 없으면 장소 기본값.
export function sceneVisualByMission(missionId?: string): SceneVisual {
  const m = CONTENT.missions.find((x) => x.id === missionId);
  const base = sceneVisualByPlace(m?.place);
  const v = m?.visual;
  const key = missionId?.toLowerCase();
  const hasGeneratedAsset = missionId === 'C0' || !!BACKDROPS[missionId ?? ''];
  const generated = key && hasGeneratedAsset ? {
    thumb: `/scenes/${key}-thumb.svg`,
    hero: `/scenes/${key}-hero.svg`,
    backdrop: BACKDROPS[missionId ?? ''],
  } : {};
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
