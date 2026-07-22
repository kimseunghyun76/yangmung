// 레벨별 사용성·미션 도달성 회귀 테스트 — "레벨을 순차 진행하면 모든 미션을 적합하게 다 경험하는가".
// 무작위(미션 개방·오답 추첨)가 있으므로 각 시나리오를 여러 시드로 반복(10런+)해 합집합/누적으로 판정한다.
// 검증 항목:
//   ① tier 분류 — tier1~5 각 미션이 배정되고 누락(tier 미지정)이 없다.
//   ② 승급 여정(입문→기본→중급→고급) 10런 — 모든 미션이 어떤 여정에서든 도달 가능(합집합=50), 학습선행 위반 0.
//   ③ 레벨별 10런 스트레스 — 입문·기본은 미션이 절대 노출되지 않음(quotas.C=0), 중급·고급은 학습선행 위반 0 +
//      하한 미만 세션 노출 0 + 미션 퀴즈 실제 출제.
//   ④ 중급·고급은 자기 tier 범위(중급 tier1~5·고급 tier3~5)를 10런 합집합으로 전부 커버.
//   ⑤ 고급(floor 3) — 첫 개방이 tier3, 세션 창이 tier1~2로 안 내려감.
// 실행: npm run test:missioncoverage
import { CONTENT } from '../content';
import { buildCards, type QuizCard, type Card } from './cards';
import { selectSessionCards, type ProgressMap, type CardProgress, type SessionConfig } from './progress';
import { reconcileOpenMissions } from './unlocks';
import { missionDifficultyWindow } from './missionMix';
import { MODE_PRESETS, type LearnMode } from './settings';
import { check } from '../test/check';


const allCards = buildCards(2);
const POOL = CONTENT.missions.filter((m) => m.id !== 'C0').map((m) => m.id);
const tierMap = new Map(CONTENT.missions.map((m) => [m.id as string, m.tier ?? 1]));
const phraseIdOf = (id: string) => id.split(':').slice(2).join(':');
const missionIdOf = (c: Card): string | null =>
  'reviewTarget' in c && c.reviewTarget?.type === 'mission' ? String(c.reviewTarget.id) : null;

// 시드 RNG — 런마다 다른 무작위 궤적(결정적·재현 가능).
function makeRng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
function mkProg(prev: CardProgress | undefined, sid: number, ok: boolean): CardProgress {
  return {
    attempts: (prev?.attempts ?? 0) + 1,
    correct: (prev?.correct ?? 0) + (ok ? 1 : 0),
    consecutiveCorrect: ok ? (prev?.consecutiveCorrect ?? 0) + 1 : 0,
    lastResult: ok ? 'correct' : 'wrong',
    lastSeenAt: new Date(2026, 0, 1 + sid).toISOString(),
    lastSessionId: sid,
    usedRecoveryEver: false,
  };
}
const accOf = (mode: LearnMode) => mode === 'beginner' ? 0.8 : mode === 'default' ? 0.83 : mode === 'express' ? 0.87 : 0.9;

interface Metrics { reached: Set<string>; studyLeak: number; belowFloorSession: number; }

// 한 레벨을 sessions회 랜덤 플레이. progress/open을 이어받아(승급 여정용) 갱신하고 지표 누적.
function playLevel(mode: LearnMode, seed: number, sessions: number, startSid: number, progress: ProgressMap, open: string[], m: Metrics): { sid: number; open: string[] } {
  const preset = MODE_PRESETS[mode];
  const floor = preset.missionFloorTier;
  const rng = makeRng(seed);
  let sid = startSid;
  for (let k = 0; k < sessions; k++) {
    sid++;
    const window = missionDifficultyWindow(allCards, progress, floor);
    open = reconcileOpenMissions(open, progress, window, floor);
    const config: SessionConfig = {
      quotas: preset.quotas, minFresh: preset.minFresh,
      missionTierFilter: (mid) => { const t = tierMap.get(mid) ?? 1; return t >= window[0] && t <= window[1]; },
      cardTierRange: window, openMissions: open,
    };
    const cards = selectSessionCards(allCards, progress, sid, config);
    const learned = new Set(Object.keys(progress).filter((k2) => k2.startsWith('intro:')).map(phraseIdOf));
    for (const c of cards) {
      const mid = missionIdOf(c);
      if (c.kind === 'quiz' && mid) {
        m.reached.add(mid);
        if ((tierMap.get(mid) ?? 1) < floor) m.belowFloorSession++;
        for (const q of (c as QuizCard).answerPhraseIds ?? []) if (!learned.has(q)) m.studyLeak++;
      }
      if (c.kind === 'introduce') learned.add(phraseIdOf(c.id));
    }
    const next: ProgressMap = { ...progress };
    for (const c of cards) next[c.id] = mkProg(next[c.id], sid, rng() < accOf(mode));
    for (const k2 of Object.keys(next)) progress[k2] = next[k2];
  }
  return { sid, open };
}

console.log('=== ① tier 분류 무결성 ===');
{
  const perTier: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let untagged = 0;
  for (const m of CONTENT.missions) {
    if (m.id === 'C0') continue;
    if (m.tier === undefined) { untagged++; continue; }
    perTier[m.tier]++;
  }
  check('모든 미션(C0 제외)에 tier 배정', untagged === 0, `미지정 ${untagged}`);
  check('tier1~5 모두 미션 존재', [1, 2, 3, 4, 5].every((t) => perTier[t] > 0), JSON.stringify(perTier));
  check('총 미션 = tier별 합', POOL.length === Object.values(perTier).reduce((a, b) => a + b, 0));
}

const RUNS = 10;

console.log(`\n=== ② 승급 여정(입문→기본→중급→고급) ${RUNS}런 — 모든 미션 도달 가능 + 학습선행 0 ===`);
{
  const union = new Set<string>();
  let totalLeak = 0;
  const sizes: number[] = [];
  for (let r = 0; r < RUNS; r++) {
    const progress: ProgressMap = {};
    let open: string[] = [];
    let sid = 0;
    const m: Metrics = { reached: new Set(), studyLeak: 0, belowFloorSession: 0 };
    // 입문·기본은 이제 미션이 아예 없어(quotas.C=0) 짧게, 미션을 실제로 겪는 중급·고급에 세션을 더 배분
    // (2026-07-06 개편 전엔 4레벨이 고르게 미션에 기여했지만, 이제 두 레벨 몫까지 중급·고급이 떠안는다).
    const sessionsFor: Record<LearnMode, number> = { beginner: 40, default: 40, express: 120, advanced: 120, review: 0, kana: 0 };
    for (const mode of ['beginner', 'default', 'express', 'advanced'] as LearnMode[]) {
      const res = playLevel(mode, 3000 + r * 211 + mode.length, sessionsFor[mode], sid, progress, open, m);
      sid = res.sid; open = res.open;
    }
    for (const id of m.reached) union.add(id);
    totalLeak += m.studyLeak;
    sizes.push(m.reached.size);
  }
  const missed = POOL.filter((id) => !union.has(id));
  check(`${RUNS}런 합집합이 ${POOL.length}개 미션 전부 도달`, missed.length === 0, `누락 [${missed.join(',')}]`);
  check('승급 여정 학습선행 위반 0(모든 런)', totalLeak === 0, `${totalLeak}건`);
  // 임계값은 여유 있게 — reconcileOpenMissions의 pick()이 seed 없는 실제 Math.random()을 쓰기 때문에
  // buildCards() 안에서 shuffle 호출 횟수가 바뀌면(예: 콘텐츠 추가) 이 흐름의 난수 소비 지점도 밀려
  // 정상 범위 내에서도 런별 숫자가 달라질 수 있다. 여기선 "정체(stall, 과거 버그 시 ~10)"만 잡는다.
  check('각 여정도 정체 없이 진행(런별 최소 ≥ 30, 과거 stall 버그는 ~10)', Math.min(...sizes) >= 30, `런별 [${sizes.join(',')}]`);
}

console.log(`\n=== ③ 레벨별 ${RUNS}런 스트레스 — 학습선행 0 · 하한미만 세션노출 0 ===`);
// 2026-07-06: 입문·기본은 quotas.C=0으로 미션을 아예 세션에서 뽑지 않는다(요청: 미션은 중급부터).
// 그래서 이 두 레벨은 "미션 퀴즈가 절대 안 나옴"을 검증하고, 중급·고급만 "실제 출제됨"을 검증한다.
const MISSION_FREE_LEVELS: LearnMode[] = ['beginner', 'default'];
for (const mode of ['beginner', 'default', 'express', 'advanced'] as LearnMode[]) {
  let leak = 0, below = 0, sawQuiz = 0;
  for (let r = 0; r < RUNS; r++) {
    const progress: ProgressMap = {};
    const m: Metrics = { reached: new Set(), studyLeak: 0, belowFloorSession: 0 };
    playLevel(mode, 8000 + r * 97, 120, 0, progress, [], m);
    leak += m.studyLeak; below += m.belowFloorSession; sawQuiz += m.reached.size;
  }
  check(`[${MODE_PRESETS[mode].label}] 학습선행 위반 0 (${RUNS}런×120세션)`, leak === 0, `${leak}건`);
  check(`[${MODE_PRESETS[mode].label}] 하한 미만 미션 세션 노출 0`, below === 0, `${below}건`);
  if (MISSION_FREE_LEVELS.includes(mode)) {
    check(`[${MODE_PRESETS[mode].label}] 미션은 절대 노출되지 않음(요청: 미션은 중급부터)`, sawQuiz === 0, `${sawQuiz}건 노출됨`);
  } else {
    check(`[${MODE_PRESETS[mode].label}] 미션 퀴즈 실제 출제`, sawQuiz > 0);
  }
}

console.log(`\n=== ④ 각 레벨은 자기 tier 범위를 ${RUNS}런 합집합으로 전부 커버 ===`);
// 중급(floor1, 미션을 처음 만나는 레벨이라 tier1부터)·고급(floor3)은 자기 범위(floor~5)를 전부 도달해야 한다.
// 입문·기본은 이제 미션 자체가 없으므로(quotas.C=0) 이 커버리지 검사 대상에서 제외.
for (const mode of ['express', 'advanced'] as LearnMode[]) {
  const floor = MODE_PRESETS[mode].missionFloorTier;
  const expected = POOL.filter((id) => (tierMap.get(id) ?? 1) >= floor);
  const union = new Set<string>();
  for (let r = 0; r < RUNS; r++) {
    const progress: ProgressMap = {};
    const m: Metrics = { reached: new Set(), studyLeak: 0, belowFloorSession: 0 };
    playLevel(mode, 6000 + r * 131, 200, 0, progress, [], m);
    for (const id of m.reached) union.add(id);
  }
  const missed = expected.filter((id) => !union.has(id));
  check(`[${MODE_PRESETS[mode].label}] tier${floor}~5 (${expected.length}개) 10런 합집합 전부 커버`, missed.length === 0, `누락 [${missed.join(',')}]`);
}

console.log('\n=== ⑤ 고급(floor 3) — 상위 미션부터 시작·세션창 하한 준수 ===');
{
  const floor = MODE_PRESETS.advanced.missionFloorTier;
  let firstTierBad = 0, belowFloorSessionTotal = 0;
  for (let r = 0; r < RUNS; r++) {
    const progress: ProgressMap = {};
    const open = reconcileOpenMissions([], progress, missionDifficultyWindow(allCards, progress, floor), floor);
    const first = open.filter((id) => id !== 'C0')[0];
    if (first && (tierMap.get(first) ?? 1) !== 3) firstTierBad++;
    const m: Metrics = { reached: new Set(), studyLeak: 0, belowFloorSession: 0 };
    playLevel('advanced', 5000 + r * 71, 60, 0, progress, open, m);
    belowFloorSessionTotal += m.belowFloorSession;
  }
  check('고급 첫 개방이 항상 tier3(10런)', firstTierBad === 0, `tier3 아님 ${firstTierBad}런`);
  check('고급 세션에 tier1~2 미션 노출 0(10런)', belowFloorSessionTotal === 0, `${belowFloorSessionTotal}건`);
}
