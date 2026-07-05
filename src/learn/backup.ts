// 학습 데이터 백업 — 모든 yangmung:* localStorage 키를 JSON 파일로 내보내고 복원.
// 진척이 LocalStorage에만 있어 브라우저 데이터 삭제 = 기록 전소였던 문제의 사용자 안전망.
import { discardPendingStorage } from './progress';

export const YM_PREFIX = 'yangmung:';

export interface BackupFile {
  app: 'yangmung';
  version: 1;
  exportedAt: string;             // ISO
  data: Record<string, string>;   // localStorage 원문 그대로 (파싱하지 않음 — 앞뒤 호환)
}

// 현재 저장된 모든 yangmung:* 키 수집
export function collectBackup(): BackupFile {
  const data: Record<string, string> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(YM_PREFIX)) continue;
      const v = window.localStorage.getItem(key);
      if (v !== null) data[key] = v;
    }
  } catch { /* noop — 접근 불가면 빈 백업 */ }
  return { app: 'yangmung', version: 1, exportedAt: new Date().toISOString(), data };
}

export function backupFilename(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `yangmung-backup-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.json`;
}

// 백업 파일 다운로드 (Blob → a[download])
export function downloadBackup(): void {
  const file = collectBackup();
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = backupFilename();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5_000);
}

export type ParseResult =
  | { ok: true; file: BackupFile; count: number }
  | { ok: false; error: string };

// 업로드된 텍스트 검증 — 형식이 맞고 yangmung:* 키만 담겨 있어야 통과
export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { return { ok: false, error: 'JSON 형식이 아니에요.' }; }
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: '백업 파일 구조가 아니에요.' };
  const f = raw as Partial<BackupFile>;
  if (f.app !== 'yangmung' || f.version !== 1 || typeof f.data !== 'object' || f.data === null) {
    return { ok: false, error: 'yangmung 백업 파일이 아니거나 지원하지 않는 버전이에요.' };
  }
  const entries = Object.entries(f.data);
  for (const [k, v] of entries) {
    if (!k.startsWith(YM_PREFIX) || typeof v !== 'string') {
      return { ok: false, error: `백업에 알 수 없는 항목이 있어요: ${k}` };
    }
  }
  if (entries.length === 0) return { ok: false, error: '백업 파일이 비어 있어요.' };
  return { ok: true, file: f as BackupFile, count: entries.length };
}

// 전체 초기화 — 모든 yangmung:* localStorage 키를 삭제(처음 접속 상태로). 대기 중 지연 저장도 폐기.
// 주의: IndexedDB 미러는 별도로 지워야 재부팅 시 복원되지 않는다(idbMirror.clearMirror). 호출 후 새로고침 권장.
export function clearAllYangmung(): number {
  discardPendingStorage();
  let n = 0;
  try {
    const stale: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(YM_PREFIX)) stale.push(key);
    }
    for (const k of stale) { window.localStorage.removeItem(k); n++; }
  } catch { /* noop */ }
  return n;
}

// 복원 — 기존 yangmung:* 키를 지우고 백업 내용으로 교체. 호출 후 반드시 새로고침.
export function applyBackup(file: BackupFile): number {
  discardPendingStorage(); // 대기 중인 지연 저장이 복원본을 덮어쓰지 않게 먼저 폐기
  try {
    const stale: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(YM_PREFIX)) stale.push(key);
    }
    for (const k of stale) window.localStorage.removeItem(k);
    let n = 0;
    for (const [k, v] of Object.entries(file.data)) {
      window.localStorage.setItem(k, v);
      n++;
    }
    return n;
  } catch {
    return 0;
  }
}
