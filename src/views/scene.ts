// 장면 시각 컨셉 — 장소별 이모지·배경색(+ 향후 이미지/영상 슬롯). "상황 기억" 장치.
import { CONTENT } from '../content';

export interface SceneVisual { emoji: string; bg: string; accent: string; thumb?: string; hero?: string; success?: string; loop?: string }

const BY_PLACE: Record<string, SceneVisual> = {
  편의점: { emoji: '🏪', bg: '#eef6ff', accent: '#2563eb' },
  식당: { emoji: '🍜', bg: '#fff4ec', accent: '#ea580c' },
  전철: { emoji: '🚃', bg: '#eefcf3', accent: '#16a34a' },
  호텔: { emoji: '🏨', bg: '#f3f0ff', accent: '#7c3aed' },
  거리: { emoji: '🧭', bg: '#f0fdfa', accent: '#0d9488' },
  약국: { emoji: '💊', bg: '#fef2f2', accent: '#e11d48' },
  쇼핑: { emoji: '🛍️', bg: '#fdf4ff', accent: '#c026d3' },
  택시: { emoji: '🚕', bg: '#fefce8', accent: '#ca8a04' },
  공항: { emoji: '✈️', bg: '#eff6ff', accent: '#2563eb' },
  환전: { emoji: '💴', bg: '#f7fee7', accent: '#65a30d' },
  코인로커: { emoji: '🔐', bg: '#f1f5f9', accent: '#475569' },
  택배: { emoji: '📦', bg: '#fff7ed', accent: '#c2410c' },
  라멘: { emoji: '🍥', bg: '#fff1f2', accent: '#e11d48' },
  가게: { emoji: '🛍️', bg: '#fdf2f8', accent: '#db2777' },
};

const DEFAULT: SceneVisual = { emoji: '🎒', bg: '#f6e4df', accent: '#c8453a' };

export function sceneVisualByPlace(place?: string): SceneVisual {
  return (place && BY_PLACE[place]) || DEFAULT;
}

// 미션의 visual 슬롯이 있으면 우선 적용(이미지/영상 갈아끼우기 지점), 없으면 장소 기본값.
export function sceneVisualByMission(missionId?: string): SceneVisual {
  const m = CONTENT.missions.find((x) => x.id === missionId);
  const base = sceneVisualByPlace(m?.place);
  const v = m?.visual;
  if (!v) return base;
  return {
    emoji: v.emoji ?? base.emoji,
    bg: v.bg ?? base.bg,
    accent: base.accent,
    thumb: v.thumb,
    hero: v.hero,
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
