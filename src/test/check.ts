// 기존 16개 테스트 파일이 공유하던 수동 pass/total 카운터 패턴을 vitest의
// it()/expect()로 그대로 연결하는 어댑터. 호출부 시그니처(check(name, cond))는
// 그대로 두고, 조건 평가 시점(각 check 호출 시 동기적으로 계산)도 그대로 유지한 채
// 리포팅만 vitest에 위임한다 — 실패한 assertion을 개별적으로 식별할 수 있게 된다.
import { expect, it } from 'vitest';

export function check(name: string, cond: boolean, detail = '') {
  it(name, () => {
    expect(cond, detail || undefined).toBe(true);
  });
}
