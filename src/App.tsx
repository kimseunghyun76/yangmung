// 상태·라우팅 허브 — 화면 렌더링은 src/views/* 에 위임.
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { buildCards, materializeQuizCard, type Card, type Choice, type DiscoverCard } from './learn/cards';
import { CONTENT } from './content';
import {
  classifyCard, clearProgress, isKanaFamiliar, isMissionUnlocked, loadDiscovered, loadProgress, loadSeenKana, loadSession,
  markKanaKnown, markKanaSeen, missionsFromCards, nextSessionId, planSession, plannedSessionSize, recordAttempt, recordKnown,
  saveDiscovered, saveProgress, saveSeenKana, saveSession, selectComposeCards, selectDictationCards, selectFlashCards, selectMissionCards, selectScriptKanaCards, selectSessionCards, selectSignCards,
  type SeenKana, type SessionLogEntry,
} from './learn/progress';
import { adaptSessionConfig, diagnose } from './learn/adaptive';
import { extractKanaChars } from './learn/kanaReading';
import { loadSettings, MODE_PRESETS, saveSettings, type Settings } from './learn/settings';
import { sessionGoalText } from './views/goal';
import { speak, stopSpeaking, ttsSupported } from './tts';
import { WRAP } from './ui/styles';
import type { PickMap } from './views/OrderCard';
import type { KanaItem } from './content/types';
import { MascotEmpty } from './views/mascot';

type View = 'home' | 'map' | 'review' | 'intro' | 'session' | 'done' | 'flash' | 'write' | 'placement';

const Home = lazy(() => import('./views/Home').then((m) => ({ default: m.Home })));
const Intro = lazy(() => import('./views/Intro').then((m) => ({ default: m.Intro })));
const Session = lazy(() => import('./views/Session').then((m) => ({ default: m.Session })));
const Done = lazy(() => import('./views/Done').then((m) => ({ default: m.Done })));
const MapView = lazy(() => import('./views/Map').then((m) => ({ default: m.Map })));
const Flash = lazy(() => import('./views/Flash').then((m) => ({ default: m.Flash })));
const KanaWrite = lazy(() => import('./views/KanaWrite').then((m) => ({ default: m.KanaWrite })));
const Placement = lazy(() => import('./views/Placement').then((m) => ({ default: m.Placement })));
const Review = lazy(() => import('./views/Review').then((m) => ({ default: m.Review })));
const Guide = lazy(() => import('./views/Guide').then((m) => ({ default: m.Guide })));
const SettingsModal = lazy(() => import('./views/SettingsModal').then((m) => ({ default: m.SettingsModal })));

function AppFallback() {
  return <main style={WRAP}><MascotEmpty who="yang" mood="loading" title="화면을 준비하고 있어요">잠시만 기다려 주세요.</MascotEmpty></main>;
}

export function App() {
  const allCards = useMemo<Card[]>(buildCards, []);
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
  const [flashCards, setFlashCards] = useState<Card[]>([]); // 속도전 플래시(세션 SRS와 분리)
  const [writeItems, setWriteItems] = useState<KanaItem[]>([]); // 가나 쓰기(따라쓰기)
  const [placementCards, setPlacementCards] = useState<Card[]>([]); // 수준 진단(배치) 문항
  const [seenKana, setSeenKana] = useState<SeenKana>(() => loadSeenKana());
  const [discovered, setDiscovered] = useState<string[]>(() => loadDiscovered());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
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
    updateSettings({ ...settings, mode, readingAid: p.readingAid, choiceMode: p.choiceMode, slowListening: p.slowListening });
  }
  // 적응형: 진척을 진단해 약점·난이도를 판단하고, 세션 신규/복습 비율을 동적으로 조정.
  // (복습 모드는 사용자가 명시적으로 고른 것이라 적응 조정 제외 — 의도 존중)
  const baseConfig = { quotas: MODE_PRESETS[settings.mode].quotas, minFresh: MODE_PRESETS[settings.mode].minFresh };
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
    const t = window.setTimeout(() => speak(ja, { rate: settings.slowListening ? 0.6 : 0.95 }), 120);
    return () => { clearTimeout(t); stopSpeaking(); };
  }, [i, view, card, settings.slowListening]);

  // 주간/야간 테마를 <html data-theme>에 반영
  useEffect(() => { document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);

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
      setSession(ns); saveSession(ns); setView('done');
    }
  }, [view, sessionCards.length, i, sessionId]);

  // ── 액션 ─────────────────────────────────────────
  // showIntro: 새 "한 판"이면 인트로부터(목표↔첫 카드 정렬), 약점 재출제는 바로 세션.
  function beginSession(id: number, cards: Card[], showIntro: boolean, gacha = true) {
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
      const chars = extractKanaChars(p.kana);
      if (chars.length < 2) continue;
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
    const cards = selectMissionCards(allCards, missionId);
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true);
  }
  // 히라가나/가타카나 직접 연습 — 현재 모드와 무관하게 그 스크립트 가나만
  function startKanaSession(script: 'hiragana' | 'katakana') {
    const ids = new Set(CONTENT.kana.filter((k) => k.script === script).map((k) => k.id));
    // 전체 학습: 스크립트 전체를 한 세션에(끊김 없이). limit 크게.
    const cards = selectScriptKanaCards(allCards, progress, nextSessionId(session), ids, 999);
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true);
  }
  // 거리 읽기 — 간판·메뉴·안내·교통 표기 읽기 연습
  function startSignSession() {
    const cards = selectSignCards(allCards, progress, nextSessionId(session));
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true);
  }
  // 받아쓰기 전용 — 듣고 가나 타일로 쓰기
  function startDictationSession() {
    const cards = selectDictationCards(allCards, progress, nextSessionId(session));
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true);
  }
  // 한→일 작문 전용 — 한국어 보고 일본어 조립(산출)
  function startComposeSession() {
    const cards = selectComposeCards(allCards, progress, nextSessionId(session));
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true);
  }
  // 속도전 플래시 — 제한시간 즉답 게임(세션/SRS와 분리). 매번 새로 섞음.
  function startFlashSession() {
    const cards = selectFlashCards(allCards, progress, 12);
    if (cards.length === 0) return;
    setFlashCards(cards);
    setView('flash');
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
  // 수준 진단(배치) — 가나 읽기 + 표현 듣기 혼합 10문항. 결과로 시작 난이도를 추천·적용.
  function startPlacement() {
    const spread = (arr: Card[], n: number): Card[] => {
      if (arr.length <= n) return arr;
      const out: Card[] = [];
      for (let k = 0; k < n; k++) out.push(arr[Math.round((k * (arr.length - 1)) / (n - 1))]);
      return [...new Set(out)];
    };
    const kana = allCards.filter((c) => c.kind === 'quiz' && /^kana:.*:read$/.test(c.id) && c.choices.length >= 2);
    const phrase = allCards.filter((c) => c.kind === 'quiz' && /^listen:/.test(c.id) && c.choices.length >= 2);
    const cards = [...spread(kana, 6), ...spread(phrase, 4)];
    if (cards.length === 0) return;
    setPlacementCards(cards);
    setView('placement');
  }
  function finishPlacement(mode: Settings['mode'], markKana: boolean) {
    selectMode(mode);
    if (markKana) markAllKanaKnown();
    try { localStorage.setItem('yangmung:placement:v1', '1'); } catch { /* noop */ }
    setView('home');
  }
  function retryWeakSession() {
    const weakIds = new Set(sessionLog.filter((r) => r.result !== 'correct').map((r) => r.id));
    const weak = sessionCards.filter((c) => c.kind === 'quiz' && weakIds.has(c.id));
    if (weak.length === 0) return;
    beginSession(nextSessionId(session), weak, false, false); // 약점 재도전 = 보석함 X
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
    // 미션 스텝이면 "내가 고른 답변" 기록 (대화 리캡용)
    if (card.reviewTarget?.type === 'mission') {
      setPicks((prev) => ({
        ...prev,
        [card.id]: { label: c.label, ja: c.ja, kana: c.phrase?.kana, korean: c.phrase?.korean, recovery: !!c.recovery, hasPhrase: !!c.phrase },
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
    const willAuto = c.correct && !c.recovery && settings.fastForward;
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
  }

  // ── 라우팅 ───────────────────────────────────────
  // 허브 화면(홈·지도·복습)엔 상단 네비게이션 — 자유 이동 + 가이드/설정.
  const nav = {
    onNavigate: (v: 'home' | 'map' | 'review') => setView(v),
    onOpenGuide: () => setShowGuide(true),
    onOpenSettings: () => setShowSettings(true),
    theme: settings.theme,
    onToggleTheme: toggleTheme,
  };

  function renderView() {
    if (view === 'map') {
      return <MapView nav={{ ...nav, current: 'map' }} allCards={allCards} progress={progress} onPracticeScene={startSceneSession} onBack={() => setView('home')} />;
    }
    if (view === 'review') {
      return <Review nav={{ ...nav, current: 'review' }} allCards={allCards} progress={progress} seenKana={seenKana} onStartReview={startReviewSession} onPracticeScene={startSceneSession} onBack={() => setView('home')} />;
    }
    if (view === 'flash') {
      const unlockedSceneIds = CONTENT.missions.filter((m) => m.id !== 'C0' && isMissionUnlocked(m.id, progress)).map((m) => m.id);
      return <Flash cards={flashCards} unlockedSceneIds={unlockedSceneIds} onExit={() => setView('home')} onReplay={startFlashSession} />;
    }
    if (view === 'placement') {
      return <Placement cards={placementCards} onDone={finishPlacement} onSkip={() => setView('home')} />;
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
      return <Intro cards={sessionCards} goal={sessionGoalText(missions, hasKana)} onStart={() => setView('session')} onBack={() => setView('home')} />;
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
      const unlockedForReward = CONTENT.missions.filter((m) => m.id !== 'C0' && isMissionUnlocked(m.id, progress)).map((m) => m.id);
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
          onRetryWeak={retryWeakSession} onContinue={startSession}
          onReview={startReviewSession} onDictation={startDictationSession} onCompose={startComposeSession} onSigns={startSignSession} onFlash={startFlashSession}
          onHome={() => setView('home')}
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
          onExit={() => setView('home')}
          onKnown={markKnown}
        />
      );
    }
    return (
      <Home
        nav={{ ...nav, current: 'home' }}
        allCards={allCards} progress={progress} session={session} sessionConfig={sessionConfig}
        diagnosis={diag}
        modeLabel={MODE_PRESETS[settings.mode].label}
        onStart={startSession} onPracticeScene={startSceneSession} onPracticeKana={startKanaSession} onPracticeSigns={startSignSession} onPracticeDictation={startDictationSession} onPracticeCompose={startComposeSession} onPracticeFlash={startFlashSession} onPracticeWrite={startKanaWrite} onPlacement={startPlacement} placementDone={typeof localStorage !== 'undefined' && !!localStorage.getItem('yangmung:placement:v1')}
      />
    );
  }

  return (
    <Suspense fallback={<AppFallback />}>
      {renderView()}
      {showGuide && <Guide onClose={() => setShowGuide(false)} />}
      {showSettings && (
        <SettingsModal settings={settings} onChange={updateSettings} onSelectMode={selectMode} onMarkKanaKnown={markAllKanaKnown} onReset={resetAll} onClose={() => setShowSettings(false)} />
      )}
    </Suspense>
  );
}
