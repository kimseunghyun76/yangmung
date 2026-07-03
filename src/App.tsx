// 상태·라우팅 허브 — 화면 렌더링은 src/views/*, 세션 카드 진행은 src/app/useSessionFlow,
// URL(해시) 라우팅은 src/app/routing 에 위임. 여기는 "어떤 세션을 어떻게 구성할지"만.
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { buildCards, type Card, type DiscoverCard, type IntroduceCard } from './learn/cards';
import { CONTENT } from './content';
import {
  classifyCard, clearProgress, isKanaFamiliar, loadDiscovered, loadProgress, loadSeenKana, loadSession,
  markKanaKnown, markKanaSeen, missionsFromCards, nextSessionId, planSession, plannedSessionSize, recordAttempt, recordKnown,
  saveDiscovered, saveProgress, saveSeenKana, saveSession, selectComposeCards, selectDictationCards,
  selectFlashCardsByMode, selectMissionCards, selectPairCards, selectScriptKanaCards, selectSessionCards, selectSignCards, selectStudyDeck,
  type FlashMode, type ProgressMap, type SeenKana, type SessionState,
} from './learn/progress';
import { loadCollection, saveCollection, fillDevCards } from './learn/collection';
import { loadOpenMissions, saveOpenMissions, resetOpenMissions, reconcileOpenMissions, isSceneOpen } from './learn/unlocks';
import { resetFlashBest } from './learn/flashScores';
import { adaptSessionConfig, diagnose } from './learn/adaptive';
import {
  coreLevelOf, loadProgression, markStageComplete, nextLevel, resetProgression,
  saveProgression, stageKey, PROMO_COUNT, STAGE_PASS, type CoreLevel, type ProgStage,
} from './learn/progression';
import { extractKanaChars } from './learn/kanaReading';
import { missionDifficultyWindow } from './learn/missionMix';
import { selectAnnouncementDeck } from './learn/announcementCards';
import { ANNOUNCEMENT_CATEGORIES, type AnnouncementCategory } from './content/announcements';
import { selectDialogueDeck, selectSongDeck } from './learn/entertainmentCards';
import { buildPlacementCards } from './learn/placementCards';
import { loadSettings, MODE_PRESETS, saveSettings, sceneSentenceLevelForMode, type Settings } from './learn/settings';
import { sessionGoalText } from './views/goal';
import { setListenRate } from './tts';
import { WRAP } from './ui/styles';
import type { KanaItem } from './content/types';
import { MascotEmpty } from './views/mascot';
import { useHashView } from './app/routing';
import { useSessionFlow } from './app/useSessionFlow';

const Home = lazy(() => import('./views/Home').then((m) => ({ default: m.Home })));
const Intro = lazy(() => import('./views/Intro').then((m) => ({ default: m.Intro })));
const Session = lazy(() => import('./views/Session').then((m) => ({ default: m.Session })));
const Done = lazy(() => import('./views/Done').then((m) => ({ default: m.Done })));
const MapView = lazy(() => import('./views/Map').then((m) => ({ default: m.Map })));
const Practice = lazy(() => import('./views/Practice').then((m) => ({ default: m.Practice })));
const GachaPage = lazy(() => import('./views/GachaPage').then((m) => ({ default: m.GachaPage })));
const Flash = lazy(() => import('./views/Flash').then((m) => ({ default: m.Flash })));
const KanaWrite = lazy(() => import('./views/KanaWrite').then((m) => ({ default: m.KanaWrite })));
const Placement = lazy(() => import('./views/Placement').then((m) => ({ default: m.Placement })));
const Review = lazy(() => import('./views/Review').then((m) => ({ default: m.Review })));
const Guide = lazy(() => import('./views/Guide').then((m) => ({ default: m.Guide })));
const SettingsModal = lazy(() => import('./views/SettingsModal').then((m) => ({ default: m.SettingsModal })));
const VocabMenu = lazy(() => import('./views/VocabMenu').then((m) => ({ default: m.VocabMenu })));
const VocabTable = lazy(() => import('./views/VocabTable').then((m) => ({ default: m.VocabTable })));
const VerbForms = lazy(() => import('./views/VerbForms').then((m) => ({ default: m.VerbForms })));
const KanaTable = lazy(() => import('./views/KanaTable').then((m) => ({ default: m.KanaTable })));
const PublicExpressions = lazy(() => import('./views/PublicExpressions').then((m) => ({ default: m.PublicExpressions })));
const EntertainmentLearning = lazy(() => import('./views/EntertainmentLearning').then((m) => ({ default: m.EntertainmentLearning })));
const SequencePreview = lazy(() => import('./views/SequencePreview').then((m) => ({ default: m.SequencePreview })));

function AppFallback() {
  return <main style={WRAP}><MascotEmpty who="yang" mood="loading" title="화면을 준비하고 있어요">잠시만 기다려 주세요.</MascotEmpty></main>;
}

export function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const difficulty = sceneSentenceLevelForMode(settings.mode); // 1~4 — 레벨에 맞춘 난이도
  const allCards = useMemo<Card[]>(() => buildCards(difficulty), [difficulty]); // 모드 바뀌면 난이도 반영해 재생성
  const [view, navigate] = useHashView(); // URL(해시) ↔ 화면 동기화 — 뒤로가기/새로고침/딥링크 지원
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());
  const [session, setSession] = useState<SessionState>(() => loadSession());
  const [flashCards, setFlashCards] = useState<Card[]>([]); // 속도전 플래시(세션 SRS와 분리)
  const [writeItems, setWriteItems] = useState<KanaItem[]>([]); // 가나 쓰기(따라쓰기)
  const [placementCards, setPlacementCards] = useState<Card[]>([]); // 수준 진단(배치) 문항
  // 명장면 대화·노래 가사·간판·방송처럼 사용자가 항목을 직접 고른 학습 — Intro 대신
  // 배울 문장 전체를 한 번 듣고 시작. begin은 "학습 시작" 클릭 시 실행할 세션 진입 액션.
  const [preview, setPreview] = useState<{
    title: string; subtitle?: string; lines: { ja: string; kana: string; korean: string }[];
    returnView: 'ent' | 'public'; begin: () => void;
  } | null>(null);
  const [kanaScript, setKanaScript] = useState<'hiragana' | 'katakana'>('hiragana'); // 가나 표 학습 스크립트
  const [progression, setProgression] = useState(() => loadProgression()); // 레벨별 순차 진도
  const coreLevel = coreLevelOf(settings.mode);                            // 현재 진도 레벨(입문~고급)
  const verbsStageKeyRef = useRef<string | null>(null);                    // 동사 형태 단계 키
  const verbsScoreRef = useRef<{ ok: number; n: number }>({ ok: 0, n: 0 }); // 동사 형태 정답 누적
  const pendingMenuStageRef = useRef<string | null>(null);                  // 메뉴 경유(어휘) 단계 키
  const [seenKana, setSeenKana] = useState<SeenKana>(() => loadSeenKana());
  const [discovered, setDiscovered] = useState<string[]>(() => loadDiscovered());
  // 열린 미션(랜덤 순차 오픈) — 최초 1개 랜덤, 앞 미션 학습할수록 다음 미션 랜덤 추첨 오픈
  const [openMissions, setOpenMissions] = useState<string[]>(() => {
    const o = reconcileOpenMissions(loadOpenMissions(), loadProgress());
    saveOpenMissions(o);
    return o;
  });
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  function updateSettings(s: Settings) { setSettings(s); saveSettings(s); }
  function toggleTheme() { updateSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' }); }
  // 모드 선택 = 프리셋 적용(보조·속도) + 세션 구성 변경. readingAid/속도는 이후 개별 미세조정 가능.
  function selectMode(mode: Settings['mode']) {
    const p = MODE_PRESETS[mode];
    updateSettings({ ...settings, mode, readingAid: p.readingAid, choiceMode: p.choiceMode });
  }

  // ── 세션 카드 상태머신 (진행·채점·타이머·TTS) — src/app/useSessionFlow ──
  const flow = useSessionFlow({
    view,
    navigate,
    progress,
    commitProgress: (p) => { setProgress(p); saveProgress(p); },
    session,
    commitSession: (s) => { setSession(s); saveSession(s); },
    creditKanaSeen: (chars) => setSeenKana((prev) => { const nx = markKanaSeen(prev, chars); saveSeenKana(nx); return nx; }),
    creditKanaKnown: (chars) => setSeenKana((prev) => { const nx = markKanaKnown(prev, chars); saveSeenKana(nx); return nx; }),
    // 단계 통과(정답률 ≥80%) → 진도 기록
    onStagePass: (key) => setProgression((p) => { const np = markStageComplete(p, key); saveProgression(np); return np; }),
    // 승급 통과(정답률 ≥90%) → 다음 레벨 모드로
    onPromotionPass: (level) => { const nx = nextLevel(level); if (nx) selectMode(nx); },
  });
  const { card, sessionCards, sessionId } = flow;

  // 발음 보조: 설정에 따라 항상 보임(always)·안 보임(off)·자동(익히면 사라짐).
  const kanaFamiliar = (ch: string) =>
    settings.readingAid === 'off' ? true
    : settings.readingAid === 'always' ? false
    : isKanaFamiliar(ch, seenKana);

  // 적응형: 진척을 진단해 약점·난이도를 판단하고, 세션 신규/복습 비율을 동적으로 조정.
  // (복습 모드는 사용자가 명시적으로 고른 것이라 적응 조정 제외 — 의도 존중)
  // 미션 티어 기반 문법(팁) 쿼터 — 퀴즈 전에 레벨별로 더 풍부하게: 입문 3 → 고급심화 4~5개.
  const userMissionTier = useMemo(() => {
    const seenMissions = new Set<string>();
    for (const k of Object.keys(progress)) {
      const m = k.match(/^mission:(C\d+):/);
      if (m) seenMissions.add(m[1]);
    }
    let maxTier: 1 | 2 | 3 | 4 | 5 = 1;
    for (const m of CONTENT.missions) {
      if (m.tier && seenMissions.has(m.id) && m.tier > maxTier) maxTier = m.tier as 1 | 2 | 3 | 4 | 5;
    }
    return maxTier;
  }, [progress]);
  const tierTipQuota = userMissionTier <= 1 ? 3 : userMissionTier === 2 ? 3 : userMissionTier === 3 ? 4 : userMissionTier === 4 ? 4 : 5;
  // 미션 티어 맵 — 레벨 필터용 (CONTENT.missions의 tier 값 사용)
  const missionTierMap = useMemo<Map<string, number>>(
    () => new Map(CONTENT.missions.map((m) => [m.id as string, m.tier ?? 1])),
    [],
  );
  // 미션 난이도 이동 창 — 모드 고정 범위 대신 실력(미션 tier별 숙련도)으로 동적 산정.
  // 하위 tier를 익히면 빼고 상위 tier를 추가 → 인접 2단계를 섞어 복습+도전(학습 효과↑).
  const missionWindow = useMemo<[number, number]>(() => missionDifficultyWindow(allCards, progress), [allCards, progress]);
  const missionTierFilter = (mid: string) => {
    const t = missionTierMap.get(mid) ?? 1;
    return t >= missionWindow[0] && t <= missionWindow[1];
  };
  const baseConfig = { quotas: { ...MODE_PRESETS[settings.mode].quotas, tip: tierTipQuota }, minFresh: MODE_PRESETS[settings.mode].minFresh, missionTierFilter, cardTierRange: missionWindow, openMissions };
  // 복습 전용 구성(신규 0 · 틀린·오래된 것 우선) — Done 화면 "복습하기" 제안용. 현재 모드와 무관.
  const reviewConfig = { quotas: MODE_PRESETS.review.quotas, minFresh: MODE_PRESETS.review.minFresh };
  const diag = useMemo(
    () => diagnose(allCards, progress, session.lastCompletedSessionId),
    [allCards, progress, session.lastCompletedSessionId],
  );
  const sessionConfig = settings.mode === 'review' ? baseConfig : adaptSessionConfig(baseConfig, diag).config;

  // 최초 접속/초기화 → 통합 수준 진단을 강제로 시작(한 번만 권유). 건너뛰어도 설정에서 재응시 가능.
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    if (view !== 'home') return;
    const done = localStorage.getItem('yangmung:placement:v1');
    const prompted = localStorage.getItem('yangmung:placement:prompted');
    if (!done && !prompted) {
      try { localStorage.setItem('yangmung:placement:prompted', '1'); } catch { /* noop */ }
      startPlacement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 새로고침/딥링크로 세션 데이터 없이 흐름 화면에 진입하면 홈으로 (메모리 상태라 복원 불가)
  useEffect(() => {
    const empty =
      (view === 'flash' && flashCards.length === 0)
      || (view === 'write' && writeItems.length === 0)
      || (view === 'placement' && placementCards.length === 0)
      || (view === 'preview' && !preview)
      || ((view === 'intro' || view === 'session' || view === 'done') && sessionCards.length === 0);
    if (empty) navigate('home', { replace: true });
  }, [view, flashCards.length, writeItems.length, placementCards.length, preview, sessionCards.length, navigate]);

  // 주간/야간 테마를 <html data-theme>에 반영
  useEffect(() => { document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);
  // 듣기 속도 — 설정값을 tts 전역에 반영 (마운트 시 포함)
  useEffect(() => { setListenRate(settings.listenRate); }, [settings.listenRate]);
  // 미션 오픈 — 진척이 바뀔 때마다 보충(앞 미션을 충분히 학습하면 다음 미션을 랜덤 오픈)
  useEffect(() => {
    setOpenMissions((prev) => {
      const next = reconcileOpenMissions(prev, progress);
      if (next.length === prev.length) return prev;
      saveOpenMissions(next);
      return next;
    });
  }, [progress]);

  // ── 세션 시작 액션 ─────────────────────────────────
  // 발견 카드: 배운 가나로만 된(2자 이상) 아직 축하 안 한 표현 1개 → 세션 끝 보상으로
  function pickDiscovery(): DiscoverCard | null {
    for (const p of CONTENT.phrases) {
      if (discovered.includes(p.id)) continue;
      // 너무 간단한 문장은 제외 + 실제로 쓰는(말하는) 표현만 — 복습 차원에서 새 표현을 다시 제공.
      if (p.register !== 'productive' && p.register !== 'both') continue;
      const chars = extractKanaChars(p.kana);
      if (chars.length < 4) continue;
      if (chars.every((ch) => isKanaFamiliar(ch, seenKana))) {
        return { kind: 'discover', id: `discover:${p.id}`, tag: '발견', ja: p.displayKana ?? p.kana, kana: p.kana, korean: p.korean };
      }
    }
    return null;
  }
  function startSession() {
    const id = nextSessionId(session);
    const cards = selectSessionCards(allCards, progress, id, sessionConfig);
    if (cards.length === 0) return;
    // 발견 카드가 있으면 세션 끝(팁 앞)에 보상으로 삽입 + 축하 기록
    const disc = pickDiscovery();
    if (disc) {
      const tipIdx = cards.findIndex((c) => c.kind === 'tip');
      const at = tipIdx >= 0 ? tipIdx : cards.length;
      cards.splice(at, 0, disc);
      const pid = disc.id.slice('discover:'.length);
      const nx = [...discovered, pid]; setDiscovered(nx); saveDiscovered(nx);
    }
    flow.beginSession(id, cards, { intro: true });
  }
  // 복습 세션 — 신규 없이 틀린 것·오래 안 본 것 위주(현재 모드와 무관). Done의 "복습하기" 제안.
  function startReviewSession() {
    const id = nextSessionId(session);
    const cards = selectSessionCards(allCards, progress, id, reviewConfig);
    if (cards.length === 0) return;
    flow.beginSession(id, cards, { intro: true });
  }
  function startSceneSession(missionId: string) {
    const cards = selectMissionCards(allCards, missionId, progress);
    if (cards.length === 0) return;
    flow.beginSession(nextSessionId(session), cards, { intro: true }); // 미션 = 1000
  }
  // 가나 표 학습 — 전체 표를 한 화면에 보고, 글자를 누르면 읽기·듣기·쓰기·말하기 상세
  function openKanaTable(script: 'hiragana' | 'katakana') { setKanaScript(script); navigate('kana'); }

  // 사용자가 항목을 직접 골라 들어오는 학습(명장면 대화·노래 가사·간판·방송) 진입 —
  // Intro 화면 대신 전체 문장을 한 번 듣는 미리보기를 거친 뒤 곧장 세션으로.
  function beginWithPreview(title: string, subtitle: string | undefined, cards: Card[], returnView: 'ent' | 'public', opts: { practice?: boolean } = {}) {
    const id = nextSessionId(session);
    const lines = cards
      .filter((c): c is IntroduceCard => c.kind === 'introduce')
      .map((c) => ({ ja: c.ja, kana: c.kana, korean: c.korean }));
    setPreview({
      title, subtitle, lines, returnView,
      begin: () => flow.beginSession(id, cards, { intro: false, replace: true, ...opts }),
    });
    navigate('preview');
  }

  // ── 레벨 진도 ───────────────────────────────────────
  // 단계 진입 — 단계별 빠른 연습으로 라우팅(통과 시 해당 단계 완료 기록).
  function startStage(stage: ProgStage) {
    const key = stageKey(coreLevel, stage.id);
    switch (stage.practice) {
      case 'kana': openKanaTable(stage.script ?? 'hiragana'); break; // 표 → 퀴즈가 단계 통과
      case 'pairs': startPairSession(key); break;
      case 'dictation': startDictationSession(key); break;
      case 'greetings': startGreetingSession(key); break;
      case 'signs': startSignSession(key); break;
      case 'vocab': pendingMenuStageRef.current = key; navigate('vocab'); break;
      case 'compose': startComposeSession(key); break;
      case 'verbs': verbsStageKeyRef.current = key; verbsScoreRef.current = { ok: 0, n: 0 }; navigate('verbs'); break;
    }
  }
  // 승급 시험 — 현재 레벨 내용에서 20문항, ≥90% 통과 시 다음 레벨로.
  function promotionPool(level: typeof coreLevel): Card[] {
    if (level === 'beginner') return allCards.filter((c) =>
      (c.kind === 'quiz' && /^kana:.*:(read|listen)$/.test(c.id))
      || (c.kind === 'quiz' && c.id.startsWith('pair:'))
      || (c.kind === 'dictation' && c.promptKind === 'korean')); // 작문만 — 받아쓰기는 고급으로 이동
    if (level === 'default') return allCards.filter((c) =>
      c.kind === 'quiz' && (c.id.startsWith('vocab:') || c.id.startsWith('sign:') || c.id.startsWith('basic:')) && !c.id.includes(':study:'));
    // express는 이제 동사 형태(verbs)만 남았는데, verbs는 자체 퀴즈 시스템이라 세션 카드로 못 씀 —
    // 대신 이 레벨에서 실전 검증 의미가 통하는 초중급 미션 회화(tier 1~2)로 승급 시험을 구성.
    if (level === 'express') return allCards.filter((c) =>
      c.kind === 'quiz' && c.reviewTarget?.type === 'mission' && (c.tier ?? 1) <= 2);
    return [];
  }
  function startPromotionQuiz(level: CoreLevel = coreLevel) {
    const pool = promotionPool(level);
    if (pool.length === 0) return;
    const shuffled = [...pool];
    for (let k = shuffled.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [shuffled[k], shuffled[j]] = [shuffled[j], shuffled[k]]; }
    const cards = shuffled.slice(0, PROMO_COUNT);
    // 인트로 없이, 보석함 X, 승급 판정 대상
    flow.beginSession(nextSessionId(session), cards, { intro: false, gacha: false, practice: true, promotion: level });
  }
  // 히라가나/가타카나 직접 연습 — 현재 모드와 무관하게 그 스크립트 가나만.
  // limit = 퀴즈에 낼 글자 수(15·30·50·전체). 기본은 전체.
  function startKanaSession(script: 'hiragana' | 'katakana', limit = 999) {
    const ids = new Set(CONTENT.kana.filter((k) => k.script === script).map((k) => k.id));
    const cards = selectScriptKanaCards(allCards, progress, nextSessionId(session), ids, limit);
    if (cards.length === 0) return;
    // 입문 단계에서 친 가나 읽기 퀴즈는 해당 스크립트 단계를 통과시킨다.
    const stage = coreLevel === 'beginner' ? stageKey('beginner', script) : null;
    flow.beginSession(nextSessionId(session), cards, { intro: true, practice: true, stage });
  }
  // 발음 구분 — 최소 페어 듣고 둘 중 고르기 (つ/す·장음·촉음·청탁)
  function startPairSession(stage?: string | null) {
    const cards = selectPairCards(allCards, progress, nextSessionId(session), 18);
    if (cards.length === 0) return;
    flow.beginSession(nextSessionId(session), cards, { intro: true, practice: true, stage });
  }
  // 거리 읽기 — 간판·메뉴·안내·교통 표기 읽기 연습
  // stage 없이 호출(공공 표현 메뉴에서 직접 선택)되면 Intro 대신 전체 미리듣기로.
  // stage가 있으면(레벨 진도 단계 진입) 기존처럼 Intro를 거친다.
  function startSignSession(stage?: string | null) {
    // 학습형 — 간판을 모두 설명·듣기·읽기한 뒤, 다양한 변형 퀴즈(표기→뜻·듣고 일본어 등).
    const cards = selectStudyDeck(allCards, (id) => id.startsWith('sign:study:'), (id) => id.startsWith('sign:') && !id.startsWith('sign:study:'), { studyLimit: 24, quizCount: 6, progress });
    if (cards.length === 0) return;
    // typeof 체크: onClick={fn} 형태로 콜백을 넘기면 클릭 이벤트가 stage로 흘러들 수 있어(방어)
    if (typeof stage !== 'string') { beginWithPreview('간판·메뉴 읽기', undefined, cards, 'public', { practice: true }); return; }
    flow.beginSession(nextSessionId(session), cards, { intro: true, practice: true, stage });
  }
  // 받아쓰기 전용 — 듣고 가나 타일로 쓰기
  function startDictationSession(stage?: string | null) {
    const cards = selectDictationCards(allCards, progress, nextSessionId(session), 18);
    if (cards.length === 0) return;
    flow.beginSession(nextSessionId(session), cards, { intro: true, practice: true, stage });
  }
  // 한→일 작문 전용 — 한국어 보고 일본어 조립(산출)
  function startComposeSession(stage?: string | null) {
    const cards = selectComposeCards(allCards, progress, nextSessionId(session), 18);
    if (cards.length === 0) return;
    flow.beginSession(nextSessionId(session), cards, { intro: true, practice: true, stage });
  }
  // 속도전 플래시 — 모드별 카드 풀 선택 + 제한시간 즉답 게임(세션/SRS와 분리).
  function startFlashSession(mode: FlashMode = 'blitz', count = 15) {
    const cards = selectFlashCardsByMode(allCards, progress, mode, count);
    setFlashCards(cards);
    navigate('flash');
    return cards;
  }
  // 어휘 커리큘럼 — 그룹별 또는 전체. 생활 기초(basics)도 여기에 병합.
  // 모두 학습형: 설명·듣기·읽기 후 다양한 변형 퀴즈(일본어→뜻·뜻→일본어·듣고 일본어·듣고 뜻).
  const isVocabStudy = (id: string) => id.includes(':study:');
  function startVocabSession(groupId: string) {
    let cards: Card[];
    if (groupId === 'basics') {
      cards = selectStudyDeck(allCards, (id) => id.startsWith('basic:study:'), (id) => id.startsWith('basic:') && !isVocabStudy(id), { studyLimit: 36, quizCount: 8, progress });
    } else if (groupId === 'all') {
      cards = selectStudyDeck(allCards, (id) => id.startsWith('vocab:') && isVocabStudy(id), (id) => id.startsWith('vocab:') && !isVocabStudy(id), { studyLimit: 36, quizCount: 8, progress });
    } else {
      cards = selectStudyDeck(allCards, (id) => id.startsWith(`vocab:${groupId}:study:`), (id) => id.startsWith(`vocab:${groupId}:`) && !isVocabStudy(id), { studyLimit: 28, quizCount: 6, progress });
    }
    if (cards.length === 0) return;
    // 어휘 단계로 진입한 경우, 어휘 세션을 통과하면 단계 완료(메뉴 경유라 ref로 전달).
    const stage = pendingMenuStageRef.current;
    pendingMenuStageRef.current = null;
    flow.beginSession(nextSessionId(session), cards, { intro: true, practice: true, stage });
  }
  // 기본 인사 전용 세션 — 학습형
  function startGreetingSession(stage?: string | null) {
    const cards = selectStudyDeck(allCards, (id) => id.startsWith('vocab:greetings:study:'), (id) => id.startsWith('vocab:greetings:') && !isVocabStudy(id), { studyLimit: 24, quizCount: 6, progress });
    if (cards.length === 0) return;
    flow.beginSession(nextSessionId(session), cards, { intro: true, practice: true, stage });
  }
  // 방송 메시지 — 전철·공항·버스 등 공공 방송 듣고 학습(독립 콘텐츠 덱).
  function startAnnouncementSession(category?: AnnouncementCategory) {
    const cards = selectAnnouncementDeck(category);
    if (cards.length === 0) return;
    const title = category
      ? `방송 · ${ANNOUNCEMENT_CATEGORIES.find((c) => c.id === category)?.label ?? '방송'}`
      : '방송 메시지 모아 듣기';
    beginWithPreview(title, undefined, cards, 'public', { practice: true });
  }
  // 명장면 대화 / 노래 가사 — 오리지널 샘플 덱. cards[0].tag에 이미 "명장면 · 제목"이 담겨 있어 그대로 제목으로.
  function startDialogueSession(sceneId: string) {
    const cards = selectDialogueDeck(sceneId);
    if (cards.length === 0) return;
    beginWithPreview(cards[0].tag, undefined, cards, 'ent', { practice: true });
  }
  function startSongSession(songId: string) {
    const cards = selectSongDeck(songId);
    if (cards.length === 0) return;
    beginWithPreview(cards[0].tag, undefined, cards, 'ent', { practice: true });
  }
  // 가나 쓰기(따라쓰기) — 히라/가타 섞어 무작위 10자(유추 방지). 세션/SRS와 분리.
  function startKanaWrite() {
    const pool = CONTENT.kana.filter((k) => (k.script === 'hiragana' || k.script === 'katakana') && k.char.length === 1);
    const a = [...pool];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    const items = a.slice(0, 10);
    if (items.length === 0) return;
    setWriteItems(items);
    navigate('write');
  }
  // 수준 진단(배치) — 3축(읽기·듣기·상황) 16문항 무작위 난이도 분산 진단.
  function startPlacement() {
    const cards = buildPlacementCards(allCards);
    if (cards.length === 0) return;
    setPlacementCards(cards);
    navigate('placement');
  }
  function finishPlacement(mode: Settings['mode'], markKana: boolean, overrides?: { readingAid?: Settings['readingAid'] }) {
    // 프로필 차등: 듣기 강·읽기 약(애니파)은 중급이어도 발음 보조를 유지(프리셋 off를 덮어씀)
    const p = MODE_PRESETS[mode];
    updateSettings({ ...settings, mode, readingAid: overrides?.readingAid ?? p.readingAid, choiceMode: p.choiceMode });
    if (markKana) markAllKanaKnown();
    try { localStorage.setItem('yangmung:placement:v1', '1'); } catch { /* noop */ }
    navigate('home');
  }
  // 설정 일괄: 가나(히라+가타) 전부 안다고 표시 — 거주자가 가나 트랙 건너뛰기
  function markAllKanaKnown() {
    let prog = progress;
    const chars: string[] = [];
    for (const c of allCards) {
      if (c.kind === 'quiz' && c.reviewTarget?.type === 'kana') {
        prog = recordKnown(prog, c.id, sessionId);
        if (c.bannerJa) chars.push(...extractKanaChars(c.bannerJa));
      }
    }
    setProgress(prog); saveProgress(prog);
    setSeenKana((prev) => { const nx = markKanaKnown(prev, chars); saveSeenKana(nx); return nx; });
  }
  function resetAll() {
    clearProgress();
    setProgress({});
    setSession({ lastCompletedSessionId: 0 });
    setSeenKana({});
    setDiscovered([]);
    resetOpenMissions();
    setOpenMissions(reconcileOpenMissions([], {}));
    resetFlashBest();
    resetProgression();
    setProgression({ completed: [] });
    // 진단 플래그 초기화 후 통합 수준 진단을 다시 시작(초기화 = 처음 접속과 동일).
    try { localStorage.removeItem('yangmung:placement:v1'); localStorage.setItem('yangmung:placement:prompted', '1'); } catch { /* noop */ }
    startPlacement();
  }

  // 미션 오픈만 초기화(진척은 유지) — 설정의 개발 도구. 다시 랜덤 1개부터.
  function resetUnlocks() { resetOpenMissions(); setOpenMissions(reconcileOpenMissions([], progress)); }
  // 개발용: 모든 미션 장면에 가챠 카드 30장씩 채움(테스트 편의).
  function fillDevCardsAll() {
    const ids = CONTENT.missions.filter((m) => m.id !== 'C0').map((m) => m.id);
    saveCollection(fillDevCards(loadCollection(), ids));
  }

  // ── 라우팅 ───────────────────────────────────────
  // 허브 화면(홈·지도·복습)엔 상단 네비게이션 — 자유 이동 + 가이드/설정.
  const nav = {
    onNavigate: (v: 'home' | 'practice' | 'map' | 'review' | 'gacha') => navigate(v),
    onOpenGuide: () => setShowGuide(true),
    onOpenSettings: () => setShowSettings(true),
    theme: settings.theme,
    onToggleTheme: toggleTheme,
  };

  function renderView() {
    if (view === 'practice') {
      return (
        <Practice
          nav={{ ...nav, current: 'practice' }}
          coreLevel={coreLevel}
          progression={progression}
          devUnlockAll={!!settings.devUnlockAll}
          onStartStage={startStage}
          onPracticeWrite={startKanaWrite}
          onPracticeFlash={startFlashSession}
          onOpenBasics={() => navigate('vocabTable')}
          onOpenPublic={() => navigate('public')}
          onOpenEntertainment={() => navigate('ent')}
        />
      );
    }
    if (view === 'public') {
      return (
        <PublicExpressions
          nav={{ ...nav, current: 'practice' }}
          onBack={() => navigate('practice')}
          onStartSigns={startSignSession}
          onStartAnnouncements={startAnnouncementSession}
        />
      );
    }
    if (view === 'ent') {
      return (
        <EntertainmentLearning
          nav={{ ...nav, current: 'practice' }}
          onBack={() => navigate('practice')}
          onStartDialogue={startDialogueSession}
          onStartSong={startSongSession}
        />
      );
    }
    if (view === 'map') {
      return <MapView nav={{ ...nav, current: 'map' }} allCards={allCards} progress={progress} openMissions={openMissions} devUnlockAll={!!settings.devUnlockAll} onPracticeScene={startSceneSession} onBack={() => navigate('home')} />;
    }
    if (view === 'review') {
      return <Review nav={{ ...nav, current: 'review' }} allCards={allCards} progress={progress} seenKana={seenKana} openMissions={openMissions} devUnlockAll={!!settings.devUnlockAll} onStartReview={startReviewSession} onPracticeScene={startSceneSession} onBack={() => navigate('home')} />;
    }
    if (view === 'gacha') {
      return <GachaPage nav={{ ...nav, current: 'gacha' }} openMissions={openMissions} />;
    }
    if (view === 'flash') {
      const unlockedSceneIds = CONTENT.missions.filter((m) => m.id !== 'C0' && isSceneOpen(m.id, openMissions, !!settings.devUnlockAll)).map((m) => m.id);
      return <Flash cards={flashCards} unlockedSceneIds={unlockedSceneIds} onExit={() => navigate('home')} onReplay={(mode, count) => startFlashSession(mode, count)} />;
    }
    if (view === 'placement') {
      return <Placement cards={placementCards} onDone={finishPlacement} onSkip={() => navigate('home')} />;
    }
    if (view === 'kana') {
      return (
        <KanaTable
          nav={{ ...nav, current: 'practice' }}
          progress={progress}
          script={kanaScript}
          onScriptChange={setKanaScript}
          onQuiz={(count) => startKanaSession(kanaScript, count)}
          onBack={() => navigate('home')}
          onKanaWritten={(char) => setSeenKana((prev) => { const nx = markKanaSeen(prev, [char]); saveSeenKana(nx); return nx; })}
        />
      );
    }
    if (view === 'verbs') {
      return <VerbForms onExit={() => {
        // 동사 형태 단계 — 충분히 풀고(≥6) 정답률 ≥80%면 단계 완료.
        const { ok, n } = verbsScoreRef.current;
        const key = verbsStageKeyRef.current;
        if (key && n >= 6 && ok / n >= STAGE_PASS) {
          setProgression((p) => { const np = markStageComplete(p, key); saveProgression(np); return np; });
        }
        verbsStageKeyRef.current = null;
        navigate('home');
      }} progress={progress} onAnswer={(id, correct) => {
        verbsScoreRef.current = { ok: verbsScoreRef.current.ok + (correct ? 1 : 0), n: verbsScoreRef.current.n + 1 };
        setProgress((m) => { const np = recordAttempt(m, id, { correct, usedRecovery: false, sessionId }); saveProgress(np); return np; });
      }} />;
    }
    if (view === 'write') {
      return <KanaWrite items={writeItems} onExit={() => navigate('home')} onReplay={startKanaWrite}
        onKanaWritten={(item, score) => {
          if (score >= 55 && item.char) setSeenKana((prev) => { const nx = markKanaSeen(prev, [item.char]); saveSeenKana(nx); return nx; });
        }} />;
    }
    if (view === 'preview') {
      if (!preview) return <main style={WRAP}><MascotEmpty who="yang" mood="loading" title="화면을 준비하고 있어요">잠시만 기다려 주세요.</MascotEmpty></main>;
      return (
        <SequencePreview
          title={preview.title}
          subtitle={preview.subtitle}
          lines={preview.lines}
          onStart={preview.begin}
          onBack={() => navigate(preview.returnView)}
        />
      );
    }
    if (view === 'intro') {
      const missions = missionsFromCards(sessionCards, progress, sessionId);
      const hasKana = sessionCards.some((c) => c.kind === 'quiz' && c.reviewTarget?.type === 'kana');
      const hasBasics = sessionCards.some((c) => c.kind === 'quiz' && c.id.startsWith('basic:'));
      return <Intro cards={sessionCards} allCards={allCards} progress={progress} goal={sessionGoalText(missions, hasKana, hasBasics)} onStart={() => navigate('session', { replace: true })} onBack={() => navigate('home')} />;
    }
    if (view === 'done') {
      const nextId = nextSessionId(session);
      const canContinue = plannedSessionSize(allCards, progress, nextId, sessionConfig) > 0;
      // 표시용 파생(로직 불변): 이번 세션에 등장한 장면 / 다음 세션의 첫 장면
      const clearedSceneIds = [...new Set(
        missionsFromCards(sessionCards, progress, sessionId).filter((m) => m.id !== 'C0').map((m) => m.id),
      )];
      const nextSceneId = planSession(allCards, progress, nextId, sessionConfig)
        .missions.find((m) => m.id !== 'C0')?.id;
      // 연습 세션(장면 없음)용 보상 장면 — 해금 장면에서 세션 id로 결정적 선택(2개)
      const unlockedForReward = CONTENT.missions.filter((m) => m.id !== 'C0' && isSceneOpen(m.id, openMissions, !!settings.devUnlockAll)).map((m) => m.id);
      const fallbackSceneIds = unlockedForReward.length
        ? [...new Set([unlockedForReward[sessionId % unlockedForReward.length], unlockedForReward[(sessionId + 1) % unlockedForReward.length]])]
        : [];
      // 다음 단계 제안: 복습·받아쓰기·거리읽기 가용 개수(반복되는 "다음 장면" 대신 다른 선택지)
      const reviewCount = selectSessionCards(allCards, progress, nextId, reviewConfig).length;
      const dictationCount = selectDictationCards(allCards, progress, nextId).length;
      const composeCount = selectComposeCards(allCards, progress, nextId).length;
      const signCount = selectSignCards(allCards, progress, nextId).length;
      return (
        <Done
          sessionId={sessionId} score={flow.score} quizSeen={flow.quizSeen} sessionLog={flow.sessionLog}
          progress={progress} canContinue={canContinue}
          clearedSceneIds={clearedSceneIds} fallbackSceneIds={fallbackSceneIds} nextSceneId={nextSceneId} showGacha={flow.gachaEligible}
          reviewCount={reviewCount} dictationCount={dictationCount} composeCount={composeCount} signCount={signCount}
          speakCount={sessionCards.filter((c) => c.kind === 'speak').length}
          isQuickPractice={flow.isPractice}
          coreLevel={coreLevel} progression={progression} devUnlockAll={!!settings.devUnlockAll}
          onRetryWeak={flow.retryWeak} onContinue={startSession}
          onReview={startReviewSession} onDictation={startDictationSession} onCompose={startComposeSession} onSigns={startSignSession} onFlash={startFlashSession}
          onPracticeVocab={() => navigate('vocab')}
          onPracticeGreetings={startGreetingSession}
          onPracticeKanaHiragana={() => startKanaSession('hiragana')}
          onPracticeKanaKatakana={() => startKanaSession('katakana')}
          onPracticePairs={startPairSession}
          onPracticeWrite={startKanaWrite}
          onPracticeVerbs={() => navigate('verbs')}
          onHome={() => navigate('home')}
        />
      );
    }
    if (view === 'vocab') {
      return (
        <VocabMenu
          nav={{ ...nav, current: 'practice' }}
          allCards={allCards}
          progress={progress}
          onSelectGroup={(groupId) => { if (groupId === 'basics') navigate('vocabTable'); else startVocabSession(groupId); }}
          onBack={() => navigate('home')}
        />
      );
    }
    if (view === 'vocabTable') {
      return (
        <VocabTable
          nav={{ ...nav, current: 'practice' }}
          progress={progress}
          onQuiz={() => startVocabSession('basics')}
          onBack={() => navigate('vocab')}
        />
      );
    }
    if (view === 'session') {
      if (!card) return <main style={WRAP}><MascotEmpty who="yang" mood="loading" title="장면을 준비하고 있어요">잠시만 기다려 주세요.</MascotEmpty></main>;
      return (
        <Session
          card={card}
          index={flow.i}
          total={sessionCards.length}
          picked={flow.picked}
          picks={flow.picks}
          cardStatus={card.kind === 'tip' || card.kind === 'order' || card.kind === 'discover' ? null : classifyCard(card, progress[card.id], sessionId)}
          onChoose={flow.choose}
          onIntroduceSeen={flow.introduceSeen}
          onSpeakPracticed={flow.speakPracticed}
          onDictationResult={flow.dictationResult}
          isKanaFamiliar={kanaFamiliar}
          onNext={flow.next}
          onPrev={flow.prev}
          onExit={() => navigate('home')}
          onKnown={flow.markKnown}
          quickPractice={flow.isPractice}
        />
      );
    }
    return (
      <Home
        nav={{ ...nav, current: 'home' }}
        allCards={allCards} progress={progress} session={session} sessionConfig={sessionConfig}
        openMissions={openMissions}
        diagnosis={diag}
        modeLabel={MODE_PRESETS[settings.mode].label}
        onStart={startSession} onPracticeScene={startSceneSession} onPracticeFlash={startFlashSession} onPracticeWrite={startKanaWrite} onPlacement={startPlacement} placementDone={typeof localStorage !== 'undefined' && !!localStorage.getItem('yangmung:placement:v1')}
        coreLevel={coreLevel} progression={progression} devUnlockAll={!!settings.devUnlockAll} onStartStage={startStage} onStartPromotion={startPromotionQuiz}
      />
    );
  }

  return (
    <Suspense fallback={<AppFallback />}>
      {renderView()}
      {showGuide && <Guide onClose={() => setShowGuide(false)} />}
      {showSettings && (
        <SettingsModal settings={settings} onChange={updateSettings} onSelectMode={selectMode} onMarkKanaKnown={markAllKanaKnown} onReset={resetAll} onResetUnlocks={resetUnlocks} onFillDevCards={fillDevCardsAll} onPlacement={startPlacement} onStartPromotion={startPromotionQuiz} onClose={() => setShowSettings(false)} />
      )}
    </Suspense>
  );
}
