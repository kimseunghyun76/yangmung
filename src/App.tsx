// 상태·라우팅 허브 — 화면 렌더링은 src/views/* 에 위임.
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { buildCards, materializeQuizCard, type Card, type Choice, type DiscoverCard } from './learn/cards';
import { CONTENT } from './content';
import {
  classifyCard, clearProgress, isKanaFamiliar, loadDiscovered, loadProgress, loadSeenKana, loadSession,
  markKanaKnown, markKanaSeen, missionsFromCards, nextSessionId, planSession, plannedSessionSize, recordAttempt, recordKnown,
  saveDiscovered, saveProgress, saveSeenKana, saveSession, selectComposeCards, selectDictationCards,
  selectFlashCardsByMode, selectMissionCards, selectPairCards, selectScriptKanaCards, selectSessionCards, selectSignCards, selectStudyDeck,
  type FlashMode, type SeenKana, type SessionLogEntry,
} from './learn/progress';
import { loadCollection, saveCollection, fillDevCards } from './learn/collection';
import { loadOpenMissions, saveOpenMissions, resetOpenMissions, reconcileOpenMissions, isSceneOpen } from './learn/unlocks';
import { resetFlashBest } from './learn/flashScores';
import { adaptSessionConfig, diagnose } from './learn/adaptive';
import {
  coreLevelOf, loadProgression, markStageComplete, nextLevel, resetProgression,
  saveProgression, stageKey, PROMO_COUNT, PROMO_PASS, STAGE_PASS, type CoreLevel, type ProgStage,
} from './learn/progression';
import { extractKanaChars } from './learn/kanaReading';
import { loadSettings, MODE_PRESETS, saveSettings, sceneSentenceLevelForMode, type Settings } from './learn/settings';
import { sessionGoalText } from './views/goal';
import { resetMangaBackdrops } from './views/scene';
import { speak, stopSpeaking, ttsSupported, setListenRate } from './tts';
import { WRAP } from './ui/styles';
import type { PickMap } from './views/OrderCard';
import type { KanaItem } from './content/types';
import { MascotEmpty } from './views/mascot';

type View = 'home' | 'map' | 'review' | 'gacha' | 'intro' | 'session' | 'done' | 'flash' | 'write' | 'placement' | 'vocab' | 'vocabTable' | 'verbs' | 'kana';

const Home = lazy(() => import('./views/Home').then((m) => ({ default: m.Home })));
const Intro = lazy(() => import('./views/Intro').then((m) => ({ default: m.Intro })));
const Session = lazy(() => import('./views/Session').then((m) => ({ default: m.Session })));
const Done = lazy(() => import('./views/Done').then((m) => ({ default: m.Done })));
const MapView = lazy(() => import('./views/Map').then((m) => ({ default: m.Map })));
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

function AppFallback() {
  return <main style={WRAP}><MascotEmpty who="yang" mood="loading" title="화면을 준비하고 있어요">잠시만 기다려 주세요.</MascotEmpty></main>;
}

export function App() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const difficulty = sceneSentenceLevelForMode(settings.mode); // 1~4 — 레벨에 맞춘 난이도
  const allCards = useMemo<Card[]>(() => buildCards(difficulty), [difficulty]); // 모드 바뀌면 난이도 반영해 재생성
  const [view, setView] = useState<View>('home');
  const [progress, setProgress] = useState(() => loadProgress());
  const [session, setSession] = useState(() => loadSession());
  const [sessionCards, setSessionCards] = useState<Card[]>([]);
  const [sessionId, setSessionId] = useState(0);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizSeen, setQuizSeen] = useState(0);
  const [sessionLog, setSessionLog] = useState<SessionLogEntry[]>([]);
  const [picks, setPicks] = useState<PickMap>({}); // 미션 스텝별 내가 고른 답변 (대화 리캡용)
  const [gachaEligible, setGachaEligible] = useState(true); // 약점 재도전 세션은 보석함 제외
  const practiceSessionRef = useRef(false);                 // 이번 세션이 빠른 연습인지(미션 X) — 표시 구분용
  const [flashCards, setFlashCards] = useState<Card[]>([]); // 속도전 플래시(세션 SRS와 분리)
  const [writeItems, setWriteItems] = useState<KanaItem[]>([]); // 가나 쓰기(따라쓰기)
  const [placementCards, setPlacementCards] = useState<Card[]>([]); // 수준 진단(배치) 문항
  const [kanaScript, setKanaScript] = useState<'hiragana' | 'katakana'>('hiragana'); // 가나 표 학습 스크립트
  const [progression, setProgression] = useState(() => loadProgression()); // 레벨별 순차 진도
  const coreLevel = coreLevelOf(settings.mode);                            // 현재 진도 레벨(입문~고급)
  const sessionStageKeyRef = useRef<string | null>(null);                  // 이번 세션이 통과시킬 단계 키
  const promotionRef = useRef<typeof coreLevel | null>(null);             // 이번 세션이 승급 시험인지(대상 레벨)
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
  const cardStartRef = useRef<number>(Date.now());     // 현재 카드 표시 시각 (빠른 정답 판정)
  const advanceTimerRef = useRef<number | null>(null);  // 정답 자동 넘김 타이머
  const safetyTimerRef = useRef<number | null>(null);   // TTS onend 미발화 대비 안전망
  const currentCardKeyRef = useRef<string>('');          // 이전 카드 TTS 콜백이 새 카드로 넘어오지 않게 하는 가드
  const pendingAdvanceKeyRef = useRef<string | null>(null);
  const FAST_MS = 4000;

  const card: Card | undefined = view === 'session' ? sessionCards[i] : undefined;
  // 발음 보조: 설정에 따라 항상 보임(always)·안 보임(off)·자동(익히면 사라짐).
  const kanaFamiliar = (ch: string) =>
    settings.readingAid === 'off' ? true
    : settings.readingAid === 'always' ? false
    : isKanaFamiliar(ch, seenKana);

  function updateSettings(s: Settings) { setSettings(s); saveSettings(s); }
  function toggleTheme() { updateSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' }); }
  // 모드 선택 = 프리셋 적용(보조·속도) + 세션 구성 변경. readingAid/속도는 이후 개별 미세조정 가능.
  function selectMode(mode: Settings['mode']) {
    const p = MODE_PRESETS[mode];
    updateSettings({ ...settings, mode, readingAid: p.readingAid, choiceMode: p.choiceMode });
  }
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
  // 현재 모드의 tierRange에 맞는 미션만 세션에 포함 (폴백: 해당 티어 미션 없으면 전체)
  const { tierRange } = MODE_PRESETS[settings.mode];
  const missionTierFilter = (mid: string) => {
    const t = missionTierMap.get(mid) ?? 1;
    return t >= tierRange[0] && t <= tierRange[1];
  };
  const baseConfig = { quotas: { ...MODE_PRESETS[settings.mode].quotas, tip: tierTipQuota }, minFresh: MODE_PRESETS[settings.mode].minFresh, missionTierFilter, cardTierRange: tierRange, openMissions };
  // 복습 전용 구성(신규 0 · 틀린·오래된 것 우선) — Done 화면 "복습하기" 제안용. 현재 모드와 무관.
  const reviewConfig = { quotas: MODE_PRESETS.review.quotas, minFresh: MODE_PRESETS.review.minFresh };
  const diag = useMemo(
    () => diagnose(allCards, progress, session.lastCompletedSessionId),
    [allCards, progress, session.lastCompletedSessionId],
  );
  const sessionConfig = settings.mode === 'review' ? baseConfig : adaptSessionConfig(baseConfig, diag).config;

  function clearAdvanceTimers() {
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    if (safetyTimerRef.current) { clearTimeout(safetyTimerRef.current); safetyTimerRef.current = null; }
    pendingAdvanceKeyRef.current = null;
  }

  // 카드에서 "본 가나"로 적립할 가나 문자 — 깔끔한 가나 필드가 있는 카드만.
  function creditKana(c: Card) {
    const chars = cardKanaChars(c);
    if (chars.length === 0) return;
    setSeenKana((prev) => { const nx = markKanaSeen(prev, chars); saveSeenKana(nx); return nx; });
  }
  function cardKanaChars(c: Card): string[] {
    let text = '';
    if (c.kind === 'introduce' || c.kind === 'speak') text = c.kana;
    else if (c.kind === 'dictation') text = c.answer.join('');
    else if (c.kind === 'quiz' && c.reviewTarget?.type === 'kana') text = c.bannerJa ?? '';
    else if (c.kind === 'quiz' && c.promptPhrase) text = c.promptPhrase.kana;
    return text ? extractKanaChars(text) : [];
  }

  // 카드 진입 시 자동 재생 — 소리가 먼저 나와야 하는 카드들(설정 무관). 추측 방지.
  // 듣기·미션 프롬프트(점원 발화)·새 표현·따라 말하기·받아쓰기·발견. (가나 읽기·간판은 제외 — 보고 푸는 문제)
  useEffect(() => {
    if (view !== 'session' || !card) return;
    let ja = '';
    if (card.kind === 'quiz' && (card.listen || card.promptPhrase)) ja = card.bannerJa ?? '';
    else if (card.kind === 'introduce' || card.kind === 'speak' || card.kind === 'discover') ja = card.ja;
    else if (card.kind === 'dictation' && card.promptKind !== 'korean') ja = card.ja; // 작문(한국어 프롬프트)은 자동재생 X
    if (!ja) return;
    const t = window.setTimeout(() => speak(ja), 120);
    return () => { clearTimeout(t); stopSpeaking(); };
  }, [i, view, card]);

  // 최초 접속/초기화 → 통합 수준 진단을 강제로 시작(한 번만 권유). 건너뛰어도 설정에서 재응시 가능.
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    const done = localStorage.getItem('yangmung:placement:v1');
    const prompted = localStorage.getItem('yangmung:placement:prompted');
    if (!done && !prompted) {
      try { localStorage.setItem('yangmung:placement:prompted', '1'); } catch { /* noop */ }
      startPlacement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // 카드가 바뀌면 표시 시각 리셋 + 이전 자동넘김 타이머 정리
  useEffect(() => {
    cardStartRef.current = Date.now();
    currentCardKeyRef.current = card ? `${i}:${card.id}` : '';
    clearAdvanceTimers();
    return clearAdvanceTimers;
  }, [i, view, card]);

  // 세션 중 카드 소진되면 done으로 (render 중 setState 금지)
  useEffect(() => {
    if (view === 'session' && sessionCards.length > 0 && i >= sessionCards.length) {
      const ns = { lastCompletedSessionId: sessionId };
      setSession(ns); saveSession(ns);
      // 단계/승급 통과 평가 — 정답률 기준(단계 ≥80%, 승급 ≥90%)
      const acc = quizSeen > 0 ? score / quizSeen : 0;
      const promo = promotionRef.current;
      const stage = sessionStageKeyRef.current;
      if (promo) {
        if (acc >= PROMO_PASS) { const nx = nextLevel(promo); if (nx) selectMode(nx); }
        promotionRef.current = null;
      } else if (stage) {
        if (acc >= STAGE_PASS) {
          setProgression((p) => { const np = markStageComplete(p, stage); saveProgression(np); return np; });
        }
        sessionStageKeyRef.current = null;
      }
      setView('done');
    }
  }, [view, sessionCards.length, i, sessionId]);

  // ── 액션 ─────────────────────────────────────────
  // showIntro: 새 "한 판"이면 인트로부터(목표↔첫 카드 정렬), 약점 재출제는 바로 세션.
  function beginSession(id: number, cards: Card[], showIntro: boolean, gacha = true, isPractice = false, stage?: string | null) {
    resetMangaBackdrops(); // 세션마다 장면 배경을 3컷 중 새 랜덤으로
    practiceSessionRef.current = isPractice;
    sessionStageKeyRef.current = stage ?? null;
    const materialized = cards.map(materializeQuizCard);
    setSessionId(id);
    setSessionCards(materialized);
    setI(0); setPicked(null); setScore(0); setQuizSeen(0); setSessionLog([]); setPicks({});
    setGachaEligible(gacha);
    setView(showIntro ? 'intro' : 'session');
  }
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
    beginSession(id, cards, true);
  }
  // 복습 세션 — 신규 없이 틀린 것·오래 안 본 것 위주(현재 모드와 무관). Done의 "복습하기" 제안.
  function startReviewSession() {
    const id = nextSessionId(session);
    const cards = selectSessionCards(allCards, progress, id, reviewConfig);
    if (cards.length === 0) return;
    beginSession(id, cards, true);
  }
  function startSceneSession(missionId: string) {
    const cards = selectMissionCards(allCards, missionId, progress);
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true); // 미션 = 1000
  }
  // 가나 표 학습 — 전체 표를 한 화면에 보고, 글자를 누르면 읽기·듣기·쓰기·말하기 상세
  function openKanaTable(script: 'hiragana' | 'katakana') { setKanaScript(script); setView('kana'); }

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
      case 'vocab': pendingMenuStageRef.current = key; setView('vocab'); break;
      case 'compose': startComposeSession(key); break;
      case 'verbs': verbsStageKeyRef.current = key; verbsScoreRef.current = { ok: 0, n: 0 }; setView('verbs'); break;
    }
  }
  // 승급 시험 — 현재 레벨 내용에서 20문항, ≥90% 통과 시 다음 레벨로.
  function promotionPool(level: typeof coreLevel): Card[] {
    if (level === 'beginner') return allCards.filter((c) =>
      (c.kind === 'quiz' && /^kana:.*:(read|listen)$/.test(c.id))
      || (c.kind === 'quiz' && c.id.startsWith('pair:'))
      || c.kind === 'dictation');
    if (level === 'default') return allCards.filter((c) =>
      c.kind === 'quiz' && (c.id.startsWith('vocab:') || c.id.startsWith('sign:') || c.id.startsWith('basic:')) && !c.id.includes(':study:'));
    if (level === 'express') return selectComposeCards(allCards, progress, nextSessionId(session), 40);
    return [];
  }
  function startPromotionQuiz(level: CoreLevel = coreLevel) {
    const pool = promotionPool(level);
    if (pool.length === 0) return;
    const shuffled = [...pool];
    for (let k = shuffled.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [shuffled[k], shuffled[j]] = [shuffled[j], shuffled[k]]; }
    const cards = shuffled.slice(0, PROMO_COUNT);
    promotionRef.current = level;
    beginSession(nextSessionId(session), cards, false, false, true, null); // 인트로 없이, 보석함 X
  }
  // 히라가나/가타카나 직접 연습 — 현재 모드와 무관하게 그 스크립트 가나만.
  // limit = 퀴즈에 낼 글자 수(15·30·50·전체). 기본은 전체.
  function startKanaSession(script: 'hiragana' | 'katakana', limit = 999) {
    const ids = new Set(CONTENT.kana.filter((k) => k.script === script).map((k) => k.id));
    const cards = selectScriptKanaCards(allCards, progress, nextSessionId(session), ids, limit);
    if (cards.length === 0) return;
    // 입문 단계에서 친 가나 읽기 퀴즈는 해당 스크립트 단계를 통과시킨다.
    const stage = coreLevel === 'beginner' ? stageKey('beginner', script) : null;
    beginSession(nextSessionId(session), cards, true, true, true, stage);
  }
  // 발음 구분 — 최소 페어 듣고 둘 중 고르기 (つ/す·장음·촉음·청탁)
  function startPairSession(stage?: string | null) {
    const cards = selectPairCards(allCards, progress, nextSessionId(session), 18);
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true, true, true, stage);
  }
  // 거리 읽기 — 간판·메뉴·안내·교통 표기 읽기 연습
  function startSignSession(stage?: string | null) {
    // 학습형 — 간판을 모두 설명·듣기·읽기한 뒤, 다양한 변형 퀴즈(표기→뜻·듣고 일본어 등).
    const cards = selectStudyDeck(allCards, (id) => id.startsWith('sign:study:'), (id) => id.startsWith('sign:') && !id.startsWith('sign:study:'), { studyLimit: 24, quizCount: 6 });
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true, true, true, stage);
  }
  // 받아쓰기 전용 — 듣고 가나 타일로 쓰기
  function startDictationSession(stage?: string | null) {
    const cards = selectDictationCards(allCards, progress, nextSessionId(session), 18);
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true, true, true, stage);
  }
  // 한→일 작문 전용 — 한국어 보고 일본어 조립(산출)
  function startComposeSession(stage?: string | null) {
    const cards = selectComposeCards(allCards, progress, nextSessionId(session), 18);
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true, true, true, stage);
  }
  // 속도전 플래시 — 모드별 카드 풀 선택 + 제한시간 즉답 게임(세션/SRS와 분리).
  function startFlashSession(mode: FlashMode = 'blitz', count = 15) {
    const cards = selectFlashCardsByMode(allCards, progress, mode, count);
    setFlashCards(cards);
    setView('flash');
    return cards;
  }
  // 어휘 커리큘럼 — 그룹별 또는 전체. 생활 기초(basics)도 여기에 병합.
  // 모두 학습형: 설명·듣기·읽기 후 다양한 변형 퀴즈(일본어→뜻·뜻→일본어·듣고 일본어·듣고 뜻).
  const isVocabStudy = (id: string) => id.includes(':study:');
  function startVocabSession(groupId: string) {
    let cards: Card[];
    if (groupId === 'basics') {
      cards = selectStudyDeck(allCards, (id) => id.startsWith('basic:study:'), (id) => id.startsWith('basic:') && !isVocabStudy(id), { studyLimit: 36, quizCount: 8 });
    } else if (groupId === 'all') {
      cards = selectStudyDeck(allCards, (id) => id.startsWith('vocab:') && isVocabStudy(id), (id) => id.startsWith('vocab:') && !isVocabStudy(id), { studyLimit: 36, quizCount: 8 });
    } else {
      cards = selectStudyDeck(allCards, (id) => id.startsWith(`vocab:${groupId}:study:`), (id) => id.startsWith(`vocab:${groupId}:`) && !isVocabStudy(id), { studyLimit: 28, quizCount: 6 });
    }
    if (cards.length === 0) return;
    // 어휘 단계로 진입한 경우, 어휘 세션을 통과하면 단계 완료(메뉴 경유라 ref로 전달).
    const stage = pendingMenuStageRef.current;
    pendingMenuStageRef.current = null;
    beginSession(nextSessionId(session), cards, true, true, true, stage);
  }
  // 기본 인사 전용 세션 — 학습형
  function startGreetingSession(stage?: string | null) {
    const cards = selectStudyDeck(allCards, (id) => id.startsWith('vocab:greetings:study:'), (id) => id.startsWith('vocab:greetings:') && !isVocabStudy(id), { studyLimit: 24, quizCount: 6 });
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true, true, true, stage);
  }
  // 가나 쓰기(따라쓰기) — 히라/가타 섞어 무작위 10자(유추 방지). 세션/SRS와 분리.
  function startKanaWrite() {
    const pool = CONTENT.kana.filter((k) => (k.script === 'hiragana' || k.script === 'katakana') && k.char.length === 1);
    const a = [...pool];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    const items = a.slice(0, 10);
    if (items.length === 0) return;
    setWriteItems(items);
    setView('write');
  }
  // 수준 진단(배치) — 3축(읽기·듣기·상황) 16문항 무작위 난이도 분산 진단.
  // ① 읽기 6문 / ② 듣기 5문 / ③ 상황 5문.
  // 상황 선택지는 한글 대신 일본어(가나)로 표시 — 실제 일본어 능력을 측정.
  function startPlacement() {
    // Fisher-Yates 셔플 (매 실행마다 무작위)
    function rng<T>(arr: T[]): T[] {
      const r = [...arr];
      for (let i = r.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [r[i], r[j]] = [r[j], r[i]];
      }
      return r;
    }
    // 난이도 구간별 무작위 선발 — 초급/중급/고급 각 1/3씩
    function pickTiered(pool: Card[], n: number): Card[] {
      if (pool.length === 0) return [];
      const third = Math.floor(pool.length / 3);
      const low = rng(pool.slice(0, Math.max(third, 1)));
      const mid = rng(pool.slice(third, Math.max(third * 2, third + 1)));
      const hi  = rng(pool.slice(third * 2));
      const each = Math.floor(n / 3);
      const rem  = n - each * 3;
      return [
        ...low.slice(0, each + (rem > 0 ? 1 : 0)),
        ...mid.slice(0, each + (rem > 1 ? 1 : 0)),
        ...hi.slice(0, each),
      ];
    }
    // 상황 카드: 선택지 레이블을 일본어(가나)로 교체 — 한글 선택지 금지
    function toJaLabels(card: Card): Card {
      if (card.kind !== 'quiz') return card;
      return {
        ...card,
        choices: card.choices.map((c) => ({
          ...c,
          label: c.ja ?? c.phrase?.kana ?? c.label,
        })),
      };
    }

    // ① 읽기 축 — 가나 글자 → 소리 (히라가나 먼저, 가타카나 나중)
    const kanaPool = allCards.filter((c) =>
      c.kind === 'quiz' && /^kana:.*:read$/.test(c.id) && c.choices.length >= 2,
    );

    // ② 듣기 축 — 일본어 음성 → 한국어 뜻 (표현·금액·기초 생활어)
    const listenPool = allCards.filter((c) =>
      c.kind === 'quiz' && /^listen:/.test(c.id) && c.choices.length >= 2,
    );

    // ③ 상황 축 — 미션 장면 (tier 1→5 순서 유지하며 무작위 선발)
    //   promptPhrase 있는 카드 포함: 점원 일본어 발화 있으면 더 실전적 진단
    //   c.ja가 있는 선택지만 포함 — 일본어로 변환 가능한 카드만 사용
    const situationPool = allCards.filter((c) =>
      c.kind === 'quiz' &&
      c.reviewTarget?.type === 'mission' &&
      c.choices.length >= 2 &&
      c.choices.some((ch) => ch.ja),
    );

    const kana      = pickTiered(kanaPool, 6);                      // 읽기 6문
    const listen    = pickTiered(listenPool, 5);                     // 듣기 5문
    const situation = pickTiered(situationPool, 5).map(toJaLabels);  // 상황 5문 (일본어 선택지)

    // 순서: 읽기 → 듣기 → 상황 (단계적 심화)
    const cards = [...kana, ...listen, ...situation];
    if (cards.length === 0) return;
    setPlacementCards(cards);
    setView('placement');
  }
  function finishPlacement(mode: Settings['mode'], markKana: boolean, overrides?: { readingAid?: Settings['readingAid'] }) {
    // 프로필 차등: 듣기 강·읽기 약(애니파)은 중급이어도 발음 보조를 유지(프리셋 off를 덮어씀)
    const p = MODE_PRESETS[mode];
    updateSettings({ ...settings, mode, readingAid: overrides?.readingAid ?? p.readingAid, choiceMode: p.choiceMode });
    if (markKana) markAllKanaKnown();
    try { localStorage.setItem('yangmung:placement:v1', '1'); } catch { /* noop */ }
    setView('home');
  }
  function retryWeakSession() {
    const weakIds = new Set(sessionLog.filter((r) => r.result !== 'correct').map((r) => r.id));
    const weak = sessionCards.filter((c) => c.kind === 'quiz' && weakIds.has(c.id));
    if (weak.length === 0) return;
    beginSession(nextSessionId(session), weak, false, false, false); // 약점 재도전 = 보석함 X
  }
  // "이미 알아요": 현재 카드를 즉시 익숙 처리 + 가나 보조 끔 → 다음으로 (점수·약점 집계 X)
  function markKnown() {
    if (!card || card.kind === 'tip' || card.kind === 'discover' || card.kind === 'order') { next(); return; }
    const chars = cardKanaChars(card);
    if (chars.length) setSeenKana((prev) => { const nx = markKanaKnown(prev, chars); saveSeenKana(nx); return nx; });
    if ('reviewTarget' in card && card.reviewTarget) {
      const updated = recordKnown(progress, card.id, sessionId);
      setProgress(updated); saveProgress(updated);
    }
    next();
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
  function next() {
    clearAdvanceTimers();
    // 팁 카드는 점수 없이 "본 적 있음"만 기록 → 다음 세션엔 다른 팁이 회전해 나옴
    if (card?.kind === 'tip') {
      const updated = recordAttempt(progress, card.id, { correct: true, usedRecovery: false, sessionId });
      setProgress(updated);
      saveProgress(updated);
    }
    setPicked(null);
    setI((n) => n + 1);
  }
  function prev() {
    clearAdvanceTimers();
    setPicked(null);
    setI((n) => Math.max(0, n - 1));
  }
  // 카드 1장 결과 기록 (퀴즈·순서 카드 공용)
  function recordCardResult(cardId: string, correct: boolean, recovery: boolean, fast: boolean) {
    setQuizSeen((n) => n + 1);
    if (correct && !recovery) setScore((sc) => sc + 1);
    const result: SessionLogEntry['result'] = recovery ? 'recovery' : correct ? 'correct' : 'wrong';
    setSessionLog((log) => [...log, { id: cardId, result }]);
    const updated = recordAttempt(progress, cardId, { correct, usedRecovery: recovery, sessionId, fast });
    setProgress(updated);
    saveProgress(updated);
  }
  function choose(idx: number, c: Choice) {
    if (!card || picked !== null) return;
    const fast = Date.now() - cardStartRef.current < FAST_MS;
    setPicked(idx);
    if (card.kind !== 'quiz') { if (c.ja) speak(c.ja); return; }
    // 미션 스텝이면 "내가 고른 답변" 기록 (대화 리캡용).
    // 반전 퀴즈는 어색한 답을 고른 것이라, 리캡엔 자연스러운 답(유효 보기)을 대신 기록.
    if (card.reviewTarget?.type === 'mission') {
      const recap = card.inverted ? (card.choices.find((x) => !x.correct && x.phrase) ?? c) : c;
      setPicks((prev) => ({
        ...prev,
        [card.id]: { label: recap.label, ja: recap.ja, kana: recap.phrase?.kana, korean: recap.phrase?.korean, recovery: !!recap.recovery, hasPhrase: !!recap.phrase },
      }));
    }
    creditKana(card);
    recordCardResult(card.id, c.correct, !!c.recovery, fast);

    // 자동 넘김 1회 예약(중복 방지)
    const advanceKey = `${i}:${card.id}`;
    const armNext = () => {
      if (pendingAdvanceKeyRef.current !== advanceKey || currentCardKeyRef.current !== advanceKey) return;
      if (advanceTimerRef.current !== null) return;
      advanceTimerRef.current = window.setTimeout(() => { advanceTimerRef.current = null; next(); }, 500);
    };
    const willAuto = false;
    pendingAdvanceKeyRef.current = willAuto ? advanceKey : null;
    // 정답을 고르면 그 정답의 음성을, 오답이면 올바른 정답의 음성을 들려준다(→ "다 읽은 뒤 0.5초"에 넘어감).
    const correctChoice = card.choices.find((x) => x.correct && !x.recovery);
    const feedbackJa = (c.correct && !c.recovery ? c.ja : correctChoice?.ja) ?? card.bannerJa ?? c.ja;
    if (feedbackJa && ttsSupported()) {
      speak(feedbackJa, willAuto ? { onEnd: armNext } : {});
      // 안전망: onend가 안 오는 브라우저 대비 (읽기 길이+여유)
      if (willAuto) safetyTimerRef.current = window.setTimeout(armNext, 8000);
    } else if (willAuto) {
      armNext(); // 읽을 음성이 없으면 그냥 0.5초 후
    }
  }
  // 소개 카드: 퀴즈 전 학습 노출. 점수에는 넣지 않고, 한 번 본 카드로만 기록.
  function introduceSeen() {
    if (!card || card.kind !== 'introduce') return;
    creditKana(card);
    const updated = recordAttempt(progress, card.id, { correct: true, usedRecovery: false, sessionId });
    setProgress(updated);
    saveProgress(updated);
  }
  // 받아쓰기: 채점 카드 (퀴즈처럼 점수·약점 집계)
  function dictationResult(correct: boolean) {
    if (!card || card.kind !== 'dictation') return;
    creditKana(card);
    recordCardResult(card.id, correct, false, false); // 받아쓰기는 조립 시간이 들어 fast 미적용
  }
  // 따라 말하기: 채점 없이 practiced만 기록 (SRS 쿨다운만 진행, 점수·약점 집계 제외)
  function speakPracticed() {
    if (!card || card.kind !== 'speak') return;
    creditKana(card);
    const updated = recordAttempt(progress, card.id, { correct: true, usedRecovery: false, sessionId });
    setProgress(updated);
    saveProgress(updated);
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
    onNavigate: (v: 'home' | 'map' | 'review' | 'gacha') => setView(v),
    onOpenGuide: () => setShowGuide(true),
    onOpenSettings: () => setShowSettings(true),
    theme: settings.theme,
    onToggleTheme: toggleTheme,
  };

  function renderView() {
    if (view === 'map') {
      return <MapView nav={{ ...nav, current: 'map' }} allCards={allCards} progress={progress} openMissions={openMissions} devUnlockAll={!!settings.devUnlockAll} onPracticeScene={startSceneSession} onBack={() => setView('home')} />;
    }
    if (view === 'review') {
      return <Review nav={{ ...nav, current: 'review' }} allCards={allCards} progress={progress} seenKana={seenKana} openMissions={openMissions} devUnlockAll={!!settings.devUnlockAll} onStartReview={startReviewSession} onPracticeScene={startSceneSession} onBack={() => setView('home')} />;
    }
    if (view === 'gacha') {
      return <GachaPage nav={{ ...nav, current: 'gacha' }} openMissions={openMissions} />;
    }
    if (view === 'flash') {
      const unlockedSceneIds = CONTENT.missions.filter((m) => m.id !== 'C0' && isSceneOpen(m.id, openMissions, !!settings.devUnlockAll)).map((m) => m.id);
      return <Flash cards={flashCards} unlockedSceneIds={unlockedSceneIds} onExit={() => setView('home')} onReplay={(mode, count) => startFlashSession(mode, count)} />;
    }
    if (view === 'placement') {
      return <Placement cards={placementCards} onDone={finishPlacement} onSkip={() => setView('home')} />;
    }
    if (view === 'kana') {
      return (
        <KanaTable
          nav={{ ...nav, current: 'home' }}
          progress={progress}
          script={kanaScript}
          onScriptChange={setKanaScript}
          onQuiz={(count) => startKanaSession(kanaScript, count)}
          onBack={() => setView('home')}
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
        setView('home');
      }} progress={progress} onAnswer={(id, correct) => {
        verbsScoreRef.current = { ok: verbsScoreRef.current.ok + (correct ? 1 : 0), n: verbsScoreRef.current.n + 1 };
        setProgress((m) => { const np = recordAttempt(m, id, { correct, usedRecovery: false, sessionId }); saveProgress(np); return np; });
      }} />;
    }
    if (view === 'write') {
      return <KanaWrite items={writeItems} onExit={() => setView('home')} onReplay={startKanaWrite}
        onKanaWritten={(item, score) => {
          if (score >= 55 && item.char) setSeenKana((prev) => { const nx = markKanaSeen(prev, [item.char]); saveSeenKana(nx); return nx; });
        }} />;
    }
    if (view === 'intro') {
      const missions = missionsFromCards(sessionCards, progress, sessionId);
      const hasKana = sessionCards.some((c) => c.kind === 'quiz' && c.reviewTarget?.type === 'kana');
      const hasBasics = sessionCards.some((c) => c.kind === 'quiz' && c.id.startsWith('basic:'));
      return <Intro cards={sessionCards} allCards={allCards} progress={progress} goal={sessionGoalText(missions, hasKana, hasBasics)} onStart={() => setView('session')} onBack={() => setView('home')} />;
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
          sessionId={sessionId} score={score} quizSeen={quizSeen} sessionLog={sessionLog}
          progress={progress} canContinue={canContinue}
          clearedSceneIds={clearedSceneIds} fallbackSceneIds={fallbackSceneIds} nextSceneId={nextSceneId} showGacha={gachaEligible}
          reviewCount={reviewCount} dictationCount={dictationCount} composeCount={composeCount} signCount={signCount}
          speakCount={sessionCards.filter((c) => c.kind === 'speak').length}
          isQuickPractice={practiceSessionRef.current}
          onRetryWeak={retryWeakSession} onContinue={startSession}
          onReview={startReviewSession} onDictation={startDictationSession} onCompose={startComposeSession} onSigns={startSignSession} onFlash={startFlashSession}
          onPracticeVocab={() => setView('vocab')}
          onPracticeGreetings={startGreetingSession}
          onPracticeKanaHiragana={() => startKanaSession('hiragana')}
          onPracticeKanaKatakana={() => startKanaSession('katakana')}
          onPracticePairs={startPairSession}
          onPracticeWrite={startKanaWrite}
          onPracticeVerbs={() => setView('verbs')}
          onHome={() => setView('home')}
        />
      );
    }
    if (view === 'vocab') {
      return (
        <VocabMenu
          nav={{ ...nav, current: 'home' }}
          allCards={allCards}
          progress={progress}
          onSelectGroup={(groupId) => { if (groupId === 'basics') setView('vocabTable'); else startVocabSession(groupId); }}
          onBack={() => setView('home')}
        />
      );
    }
    if (view === 'vocabTable') {
      return (
        <VocabTable
          nav={{ ...nav, current: 'home' }}
          progress={progress}
          onQuiz={() => startVocabSession('basics')}
          onBack={() => setView('vocab')}
        />
      );
    }
    if (view === 'session') {
      if (!card) return <main style={WRAP}><MascotEmpty who="yang" mood="loading" title="장면을 준비하고 있어요">잠시만 기다려 주세요.</MascotEmpty></main>;
      return (
        <Session
          card={card}
          index={i}
          total={sessionCards.length}
          picked={picked}
          picks={picks}
          cardStatus={card.kind === 'tip' || card.kind === 'order' || card.kind === 'discover' ? null : classifyCard(card, progress[card.id], sessionId)}
          onChoose={choose}
          onIntroduceSeen={introduceSeen}
          onSpeakPracticed={speakPracticed}
          onDictationResult={dictationResult}
          isKanaFamiliar={kanaFamiliar}
          onNext={next}
          onPrev={prev}
          onExit={() => setView('home')}
          onKnown={markKnown}
          quickPractice={practiceSessionRef.current}
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
        onStart={startSession} onPracticeScene={startSceneSession} onPracticeKana={startKanaSession} onPracticeDictation={startDictationSession} onPracticeFlash={startFlashSession} onPracticeWrite={startKanaWrite} onPlacement={startPlacement} placementDone={typeof localStorage !== 'undefined' && !!localStorage.getItem('yangmung:placement:v1')}
        coreLevel={coreLevel} progression={progression} onStartStage={startStage} onStartPromotion={startPromotionQuiz}
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
