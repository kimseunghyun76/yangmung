// 콘텐츠 오버라이드 — /admin에서 편집한 표시 문자열을 localStorage에 저장하고 런타임에 반영.
// 정적 앱이라 소스 영구반영은 admin의 '내보내기(JSON)'로. 구조(phraseId·스텝수)는 건드리지 않음.
import { CONTENT } from './index';
import { SCENE_SENTENCES } from './sceneSentences';

const KEY = 'yangmung:admin:v1';

export interface Overrides {
  missions?: Record<string, {
    scenario?: string;
    canDo?: string;
    steps?: Record<number, { situationKo?: string; choices?: Record<number, { text?: string; feedback?: string }> }>;
  }>;
  sentences?: Record<string, { kanji?: string; korean?: string }>;
}

export function loadOverrides(): Overrides {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function saveOverrides(o: Overrides): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(o));
}

export function clearOverrides(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}

// CONTENT.missions / SCENE_SENTENCES의 표시 문자열을 오버라이드로 덮어씀(in-place). buildCards 전에 호출.
export function applyOverrides(o: Overrides = loadOverrides()): void {
  if (o.missions) {
    for (const m of CONTENT.missions) {
      const mo = o.missions[m.id];
      if (!mo) continue;
      if (mo.scenario != null) m.scenario = mo.scenario;
      if (mo.canDo != null) m.canDo = mo.canDo;
      if (mo.steps) {
        for (const [i, so] of Object.entries(mo.steps)) {
          const step = m.steps[Number(i)];
          if (!step) continue;
          if (so.situationKo != null) step.situationKo = so.situationKo;
          if (so.choices) {
            for (const [ci, co] of Object.entries(so.choices)) {
              const ch = step.choices[Number(ci)];
              if (!ch) continue;
              if (co.text != null) ch.text = co.text;
              if (co.feedback != null) ch.feedback = co.feedback;
            }
          }
        }
      }
    }
  }
  if (o.sentences) {
    for (const arr of Object.values(SCENE_SENTENCES)) {
      for (const row of arr) {
        const so = o.sentences[row.id];
        if (!so) continue;
        if (so.kanji != null) row.kanji = so.kanji;
        if (so.korean != null) row.korean = so.korean;
      }
    }
  }
}
