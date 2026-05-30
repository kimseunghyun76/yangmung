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
