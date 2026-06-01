// 적응형 학습 엔진 (LLM 없음) — 진척을 "판단"해서 약점 진단 + 다음 세션 구성을 조정.
// 순수 함수만. 입력: 카드 전체 + 진척맵 + 마지막 완료 세션 id. 출력: 진단 + 적응형 세션 설정.
import type { Card } from './cards';
import { itemMastery, type ProgressMap, type SessionConfig } from './progress';

export type Skill = 'read' | 'listen' | 'dictation' | 'speak' | 'situation';
const SKILL_LABEL: Record<Skill, string> = {
  read: '읽기', listen: '듣기', dictation: '받아쓰기', speak: '따라 말하기', situation: '상황 회화',
};

// 카드 1장이 어떤 "기술"을 훈련하는지 — id/종류로 분류 (콘텐츠 의존 없이).
function skillOf(c: Card): Skill | null {
  if (c.kind === 'speak') return 'speak';
  if (c.kind === 'dictation') return 'dictation';
  if (c.kind === 'introduce' || c.kind === 'order' || c.kind === 'discover' || c.kind === 'tip') return null;
  // quiz
  const id = c.id;
  if (id.startsWith('sign:')) return 'read';
  if (id.startsWith('listen:') || id.endsWith(':listen')) return 'listen';
  if (id.endsWith(':read') || id.endsWith(':confuse')) return 'read';
  if (c.reviewTarget?.type === 'mission') return 'situation';
  return null;
}

export type Level = 'struggling' | 'steady' | 'cruising';
export const LEVEL_LABEL: Record<Level, string> = { struggling: '천천히 다지는 중', steady: '안정적으로 진행 중', cruising: '잘 나가는 중' };

export interface WeakItem { key: string; label: string; score: number }
export interface Diagnosis {
  seen: number;                       // 한 번이라도 시도한 카드 수
  recentAccuracy: number | null;      // 직전 완료 세션 정답률 (표본<4면 null)
  recentSample: number;
  level: Level | null;                // 표본 부족이면 null
  weakKana: WeakItem[];               // 약한 글자 (최대 5)
  weakScenes: WeakItem[];             // 약한 장면 (최대 3)
  weakSkill: { skill: Skill; label: string; score: number } | null;
  focus: string;                      // 오늘 집중 포인트 한 줄
  message: string;                    // 튜터 코멘트 한 줄
}

const SEEN = (p?: { attempts: number }) => !!p && p.attempts > 0;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

// 직전(가장 최근 완료) 세션에서 본 카드들의 결과로 정답률 추정.
function recentAccuracy(progress: ProgressMap, lastCompletedSessionId: number): { acc: number | null; n: number } {
  if (lastCompletedSessionId <= 0) return { acc: null, n: 0 };
  let sum = 0, n = 0;
  for (const p of Object.values(progress)) {
    if (p.lastSessionId !== lastCompletedSessionId) continue;
    n++;
    sum += p.lastResult === 'correct' ? 1 : p.lastResult === 'recovery' ? 0.5 : 0;
  }
  return { acc: n ? sum / n : null, n };
}

function levelOf(acc: number | null, n: number): Level | null {
  if (acc === null || n < 4) return null;     // 신호 부족이면 판단 보류
  if (acc < 0.62) return 'struggling';
  if (acc > 0.88) return 'cruising';
  return 'steady';
}

export function diagnose(allCards: Card[], progress: ProgressMap, lastCompletedSessionId: number): Diagnosis {
  let seen = 0;
  const kanaScore = new Map<string, { score: number; char: string }>();
  const sceneScores = new Map<string, { scores: number[]; name: string }>();
  const skillScores = new Map<Skill, number[]>();

  for (const c of allCards) {
    const p = progress[c.id];
    if (SEEN(p)) seen++;
    const sk = skillOf(c);
    if (sk && SEEN(p)) {
      const arr = skillScores.get(sk); const m = itemMastery(p);
      if (arr) arr.push(m); else skillScores.set(sk, [m]);
    }
    // 글자: read 형태를 대표로 (가장 직접적인 읽기 숙련도)
    if (c.kind === 'quiz' && c.reviewTarget?.type === 'kana' && c.id.endsWith(':read') && SEEN(p)) {
      kanaScore.set(String(c.reviewTarget.id), { score: itemMastery(p), char: c.banner ?? '' });
    }
    // 장면: 미션 quiz 카드들의 평균
    if (c.kind === 'quiz' && c.reviewTarget?.type === 'mission' && SEEN(p)) {
      const id = String(c.reviewTarget.id);
      const e = sceneScores.get(id);
      if (e) e.scores.push(itemMastery(p));
      else sceneScores.set(id, { scores: [itemMastery(p)], name: c.scenario ?? id });
    }
  }

  const weakKana: WeakItem[] = [...kanaScore.entries()]
    .map(([key, v]) => ({ key, label: v.char || key, score: v.score }))
    .filter((w) => w.score < 0.6)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  const weakScenes: WeakItem[] = [...sceneScores.entries()]
    .map(([key, v]) => ({ key, label: v.name, score: avg(v.scores) }))
    .filter((w) => w.score < 0.62)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  // 약한 기술 — 표본 3개 이상 중 평균 최저
  let weakSkill: Diagnosis['weakSkill'] = null;
  for (const [skill, scores] of skillScores) {
    if (scores.length < 3) continue;
    const score = avg(scores);
    if (!weakSkill || score < weakSkill.score) weakSkill = { skill, label: SKILL_LABEL[skill], score };
  }
  if (weakSkill && weakSkill.score >= 0.7) weakSkill = null; // 충분히 잘하면 약점 아님

  const { acc, n } = recentAccuracy(progress, lastCompletedSessionId);
  const level = levelOf(acc, n);

  // 오늘 집중 포인트 — 우선순위: 장면 > 기술 > 글자 > 일반
  let focus: string;
  if (weakScenes.length) focus = `${weakScenes[0].label} 장면 다지기`;
  else if (weakSkill) focus = `${weakSkill.label}가 상대적으로 약해요`;
  else if (weakKana.length) focus = `글자 ${weakKana.slice(0, 3).map((w) => w.label).join('·')} 굳히기`;
  else if (seen === 0) focus = '오늘은 가나부터 가볍게 시작';
  else focus = '약점 복습 + 새 표현 확장';

  // 튜터 코멘트 — 최근 성과 기준
  let message: string;
  if (level === 'struggling') message = '최근 정답률이 낮아요. 새 항목을 줄이고 약점을 더 반복합니다.';
  else if (level === 'cruising') message = '아주 잘하고 있어요! 새 표현을 조금 더 넣어 속도를 올립니다.';
  else if (level === 'steady') message = '좋은 흐름이에요. 약점 위주로 균형 있게 진행합니다.';
  else message = '몇 판 풀면 학습 상태를 분석해 난이도를 맞춰드릴게요.';

  return { seen, recentAccuracy: acc, recentSample: n, level, weakKana, weakScenes, weakSkill, focus, message };
}

// 진단을 바탕으로 세션 구성(신규 유입량)을 조정 — "동적 난이도".
// 세션 길이(quota 합)는 유지하고 신규/복습 비율(minFresh)만 바꿔 부담을 일정하게.
export function adaptSessionConfig(base: SessionConfig, diag: Diagnosis): { config: SessionConfig; changed: boolean } {
  const minFresh = { ...base.minFresh };
  let changed = false;
  if (diag.level === 'struggling') {
    // 새 항목 줄이고 복습 강화 (다지기)
    minFresh.K = Math.max(0, base.minFresh.K - 1);
    minFresh.B = 0;
    minFresh.C = Math.max(1, base.minFresh.C - 1);
    changed = true;
  } else if (diag.level === 'cruising') {
    // 잘하면 새 항목 더 (확장)
    minFresh.K = base.minFresh.K + 1;
    minFresh.C = base.minFresh.C + 1;
    changed = true;
  }
  return { config: { quotas: base.quotas, minFresh }, changed };
}
