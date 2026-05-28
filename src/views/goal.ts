// 세션 목표 카피 — 홈 히어로와 인트로 카드가 공유.
// 미션 시나리오가 있으면 그 장면을, 없으면 가나 중심으로. 보조 괄호는 떼어냄.
export function sessionGoalText(scenario?: string, hasKana = false): string {
  if (scenario) return `${scenario.replace(/\s*\(.*?\)\s*$/, '')}까지 해보기`;
  if (hasKana) return '히라가나부터 차근차근 시작하기';
  return '오늘 한 판 가볍게';
}
