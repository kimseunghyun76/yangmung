// 세션 목표 카피 — 홈 히어로와 인트로 카드가 공유.
// 실제 세션의 미션 구성에 맞춰: 한 장면이면 그 장면, 여러 장면이면 장소 조합.
import { CONTENT } from '../content';
import type { SessionMission } from '../learn/progress';

const PLACE: Record<string, string> = Object.fromEntries(
  CONTENT.missions.map((m) => [m.id, m.place ?? stripParen(m.scenario)]),
);

function stripParen(s: string): string {
  return s.replace(/\s*\(.*?\)\s*$/, '');
}

// 한국어 와/과 — 받침 유무로.
function gwa(word: string): string {
  const last = word.charCodeAt(word.length - 1);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  const hasBatchim = isHangul && (last - 0xac00) % 28 !== 0;
  return hasBatchim ? '과' : '와';
}

function joinPlaces(places: string[]): string {
  if (places.length <= 1) return places[0] ?? '';
  if (places.length === 2) return `${places[0]}${gwa(places[0])} ${places[1]}`;
  return places.join('·'); // 3개 이상이면 가운뎃점 (조사 회피)
}

export function sessionGoalText(missions: SessionMission[], hasKana: boolean): string {
  // 튜토리얼(C0)은 장면 카피에서 제외 — 가게 인사는 편의점 등의 도입부로 흡수.
  const scenes = missions.filter((m) => m.id !== 'C0');
  if (scenes.length === 0) {
    if (missions.length > 0) return `${stripParen(missions[0].scenario)}까지 해보기`;
    return hasKana ? '히라가나부터 차근차근 시작하기' : '오늘 한 판 가볍게';
  }
  if (scenes.length === 1) return `${stripParen(scenes[0].scenario)}까지 해보기`;
  const places = scenes.map((m) => PLACE[m.id] ?? stripParen(m.scenario));
  return `${joinPlaces(places)} 표현 익히기`;
}
