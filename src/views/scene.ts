// 장면 시각 컨셉 — 장소별 이모지·배경색. 실사 이미지 전 단계의 가벼운 "상황 기억" 장치.
import { CONTENT } from '../content';

export interface SceneVisual { emoji: string; bg: string; accent: string }

const BY_PLACE: Record<string, SceneVisual> = {
  편의점: { emoji: '🏪', bg: '#eef6ff', accent: '#2563eb' },
  식당: { emoji: '🍜', bg: '#fff4ec', accent: '#ea580c' },
  전철: { emoji: '🚃', bg: '#eefcf3', accent: '#16a34a' },
  호텔: { emoji: '🏨', bg: '#f3f0ff', accent: '#7c3aed' },
  가게: { emoji: '🛍️', bg: '#fdf2f8', accent: '#db2777' },
};

const DEFAULT: SceneVisual = { emoji: '🎒', bg: '#eef2ff', accent: '#4f46e5' };

export function sceneVisualByPlace(place?: string): SceneVisual {
  return (place && BY_PLACE[place]) || DEFAULT;
}

export function sceneVisualByMission(missionId?: string): SceneVisual {
  const m = CONTENT.missions.find((x) => x.id === missionId);
  return sceneVisualByPlace(m?.place);
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
