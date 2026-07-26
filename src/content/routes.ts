// 여행 루트 — 지도 구성 + 순차 잠금의 공통 정의.
// 각 루트의 첫 장면은 열려 있고, 루트 안에서 앞 장면을 익히면 다음 장면이 열린다.
//
// 의도적으로 tier1~4(C1~C40 중 tier4까지, C41, C51~C54)만 다룬다 — tier5(C42~C50, 고급심화)는
// 테마별 루트로 묶이는 성격이 아니라 tier 범위 게이팅(missionDifficultyWindow)만으로 노출되므로 여기 없는 게 맞다.
// (isMissionUnlocked의 "루트에 없으면 열림" 폴백과 맞물려, 새 tier5 미션을 추가할 때 실수로
// 여기 등록을 빠뜨린 것처럼 보일 수 있어 남겨두는 주석 — missionCoverage.test.ts가 이 경계를 검증한다.)
//
// C51~53(지진·재난/병원 접수/미아 찾기)은 2026-07-25 사용성 테스트 후 tier5→tier4로 재배정되어
// "문제 해결" 루트에 합류했다(안전 콘텐츠가 가장 늦게 열리는 tier에 있던 것이 원인이었던 S0 문제 해결).
// 이 세 미션은 잠금과 무관하게 src/views/Emergency.tsx에서도 항상 즉시 접근 가능하다.
// C41(환불·교환)도 같은 이유로 후속 조치(persona-04)로 tier4 재배정되어 같은 루트에 합류했다.
// C54(택배 재배달 신청)는 신규 제작 미션으로 처음부터 tier4·이 루트로 등록됐다(persona-06 후속).
export interface TravelRoute { label: string; ids: string[] }

export const ROUTES: TravelRoute[] = [
  { label: '첫 여행 생존', ids: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'] },
  { label: '먹고 즐기기', ids: ['C13', 'C14', 'C15', 'C16', 'C17', 'C30', 'C31', 'C37', 'C38', 'C39'] },
  { label: '이동과 관광', ids: ['C18', 'C19', 'C22', 'C23', 'C24', 'C35', 'C36'] },
  { label: '숙박과 생활', ids: ['C10', 'C11', 'C12', 'C20', 'C21', 'C28', 'C29', 'C33', 'C34'] },
  { label: '쇼핑·패션', ids: ['C32', 'C40'] },
  { label: '문제 해결', ids: ['C25', 'C26', 'C27', 'C41', 'C51', 'C52', 'C53', 'C54'] },
];

// missionId가 속한 (루트, 인덱스). 못 찾으면 null.
export function routePosition(missionId: string): { route: TravelRoute; index: number } | null {
  for (const route of ROUTES) {
    const index = route.ids.indexOf(missionId);
    if (index >= 0) return { route, index };
  }
  return null;
}
