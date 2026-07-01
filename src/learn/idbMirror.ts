// IndexedDB 미러 — 주 저장소는 계속 localStorage(동기 API 유지), 이 모듈은 안전망.
// 모든 yangmung:* 키를 통째로 IndexedDB에 스냅숏해 두고,
// 부팅 시 localStorage가 비어 있는데 스냅숏이 있으면(=localStorage만 소실) 자동 복원한다.
// 정상 부팅 경로에서는 IndexedDB를 열지도 않으므로 시작 지연이 없다.
import { YM_PREFIX } from './backup';

const DB_NAME = 'yangmung-mirror';
const DB_VERSION = 1;
const STORE = 'kv';
const SNAPSHOT_KEY = 'snapshot:v1';

interface Snapshot {
  at: string;                    // ISO — 스냅숏 시각
  data: Record<string, string>;  // localStorage 원문
}

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') { resolve(null); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch { resolve(null); } // 프라이빗 모드 등 — 미러 없이 동작
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<unknown> {
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    } catch { resolve(undefined); }
  });
}

function idbSet(db: IDBDatabase, key: string, value: unknown): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch { resolve(false); }
  });
}

function collectLocal(): Record<string, string> {
  const data: Record<string, string> = {};
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(YM_PREFIX)) continue;
      const v = window.localStorage.getItem(key);
      if (v !== null) data[key] = v;
    }
  } catch { /* noop */ }
  return data;
}

function hasAnyLocal(): boolean {
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(YM_PREFIX)) return true;
    }
  } catch { /* noop */ }
  return false;
}

// 현재 localStorage 상태를 IndexedDB에 스냅숏 (best-effort)
export async function mirrorSnapshot(): Promise<void> {
  const data = collectLocal();
  if (Object.keys(data).length === 0) return; // 빈 상태로 스냅숏을 덮어쓰지 않음
  const db = await openDb();
  if (!db) return;
  const snap: Snapshot = { at: new Date().toISOString(), data };
  await idbSet(db, SNAPSHOT_KEY, snap);
  db.close();
}

// 부팅 시 복원 — localStorage에 yangmung:* 키가 하나도 없을 때만(소실/초기 상태) 시도.
// 반환: 복원했으면 true. React 마운트 전에 await 되어야 한다(useState 초기값이 localStorage를 읽으므로).
export async function restoreFromMirrorIfNeeded(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (hasAnyLocal()) return false; // 정상 경로 — IndexedDB를 열지 않음(부팅 지연 0)
  const db = await openDb();
  if (!db) return false;
  const raw = (await idbGet(db, SNAPSHOT_KEY)) as Snapshot | undefined;
  db.close();
  if (!raw || typeof raw !== 'object' || !raw.data) return false;
  const entries = Object.entries(raw.data).filter(([k, v]) => k.startsWith(YM_PREFIX) && typeof v === 'string');
  if (entries.length === 0) return false;
  try {
    for (const [k, v] of entries) window.localStorage.setItem(k, v);
    console.info(`[yangmung] 저장 데이터가 비어 있어 미러(IndexedDB)에서 ${entries.length}개 항목을 복원했어요 (${raw.at} 시점).`);
    return true;
  } catch { return false; }
}

// 미러 자동 갱신 시작 — 화면 이탈 시점 + 주기(60초) + 시작 직후 1회.
export function startMirror(): void {
  if (typeof window === 'undefined') return;
  const snapshot = () => { void mirrorSnapshot(); };
  window.addEventListener('pagehide', snapshot);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') snapshot();
  });
  window.setTimeout(snapshot, 3_000);      // 시작 직후 1회 (복원 직후 상태도 미러에 반영)
  window.setInterval(snapshot, 60_000);    // 학습 중 주기 백업
}

// 브라우저에 영구 저장 요청 — 저장 공간 정리 시 우선 보호 대상으로 (지원 브라우저 한정)
export function requestPersistentStorage(): void {
  try {
    void navigator.storage?.persist?.().then((granted) => {
      if (granted) console.info('[yangmung] 영구 저장소 승인 — 브라우저가 임의로 데이터를 정리하지 않아요.');
    });
  } catch { /* noop */ }
}
