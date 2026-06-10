// 여행 루트 — 지도 구성 + 순차 잠금의 공통 정의.
// 각 루트의 첫 장면은 열려 있고, 루트 안에서 앞 장면을 익히면 다음 장면이 열린다.
export interface TravelRoute { label: string; ids: string[] }

export const ROUTES: TravelRoute[] = [
  { label: '첫 여행 생존', ids: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'] },
  { label: '먹고 즐기기', ids: ['C13', 'C14', 'C15', 'C16', 'C17', 'C30', 'C31', 'C37', 'C38', 'C39'] },
  { label: '이동과 관광', ids: ['C18', 'C19', 'C22', 'C23', 'C24', 'C35', 'C36'] },
  { label: '숙박과 생활', ids: ['C10', 'C11', 'C12', 'C20', 'C21', 'C28', 'C29', 'C33', 'C34'] },
  { label: '쇼핑·패션', ids: ['C32', 'C40'] },
  { label: '문제 해결', ids: ['C25', 'C26', 'C27'] },
];

// missionId가 속한 (루트, 인덱스). 못 찾으면 null.
export function routePosition(missionId: string): { route: TravelRoute; index: number } | null {
  for (const route of ROUTES) {
    const index = route.ids.indexOf(missionId);
    if (index >= 0) return { route, index };
  }
  return null;
}
