// 캐시(원) 지갑 — 가챠 비용·학습 보상·일일 출석. 학습/컬렉션과 분리된 경량 스토어.
const KEY = 'yangmung:wallet:v1';

export interface Wallet { cash: number; lastDaily: string }
const EMPTY: Wallet = { cash: 0, lastDaily: '' };

// 비용·보상 상수
export const COST_PER_DRAW = 100;     // 1장당 100원
export const REWARD_SESSION = 1000;   // 미션·퀴즈 완료
export const REWARD_PRACTICE = 300;   // 빠른 연습 완료
export const DAILY_BONUS = 5000;      // 일일 출석
export const DEBUG_TOPUP = 1000;      // 설정 디버그 적립

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadWallet(): Wallet {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw) as Partial<Wallet>;
    return { cash: Math.max(0, Math.floor(p.cash ?? 0)), lastDaily: p.lastDaily ?? '' };
  } catch { return { ...EMPTY }; }
}
export function saveWallet(w: Wallet): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(w)); } catch { /* noop */ }
}

export const getCash = (): number => loadWallet().cash;

// 적립 — 새 잔액 반환.
export function earn(n: number): number {
  const w = loadWallet();
  const nw = { ...w, cash: w.cash + Math.max(0, Math.floor(n)) };
  saveWallet(nw);
  return nw.cash;
}

// 사용 — 잔액 부족이면 null, 성공이면 새 잔액 반환.
export function spend(n: number): number | null {
  const w = loadWallet();
  const cost = Math.max(0, Math.floor(n));
  if (w.cash < cost) return null;
  const nw = { ...w, cash: w.cash - cost };
  saveWallet(nw);
  return nw.cash;
}

export const canClaimDaily = (): boolean => loadWallet().lastDaily !== todayStr();

// 일일 출석 — 오늘 미수령이면 적립하고 보너스 금액 반환, 이미 받았으면 null.
export function claimDaily(): number | null {
  const w = loadWallet();
  if (w.lastDaily === todayStr()) return null;
  saveWallet({ cash: w.cash + DAILY_BONUS, lastDaily: todayStr() });
  return DAILY_BONUS;
}

export const formatCash = (n: number): string => `${n.toLocaleString()}원`;
