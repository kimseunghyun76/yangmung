// 상태·라우팅 허브 — 화면 렌더링은 src/views/* 에 위임.
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildCards, type Card, type Choice, type DiscoverCard } from './learn/cards';
import { CONTENT } from './content';
import {
  classifyCard, clearProgress, isKanaFamiliar, loadDiscovered, loadProgress, loadSeenKana, loadSession,
  markKanaKnown, markKanaSeen, missionsFromCards, nextSessionId, plannedSessionSize, recordAttempt, recordKnown,
  saveDiscovered, saveProgress, saveSeenKana, saveSession, selectDictationCards, selectMissionCards, selectScriptKanaCards, selectSessionCards, selectSignCards,
  type SeenKana, type SessionLogEntry,
} from './learn/progress';
import { extractKanaChars } from './learn/kanaReading';
import { loadSettings, MODE_PRESETS, saveSettings, type Settings } from './learn/settings';
import { sessionGoalText } from './views/goal';
import { speak } from './tts';
import { WRAP } from './ui/styles';
import { Home } from './views/Home';
import { Intro } from './views/Intro';
import { Session } from './views/Session';
import { Done } from './views/Done';
import { Map } from './views/Map';
import { Review } from './views/Review';
import { Guide } from './views/Guide';
import { SettingsModal } from './views/SettingsModal';

type View = 'home' | 'map' | 'review' | 'intro' | 'session' | 'done';

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
  const [seenKana, setSeenKana] = useState<SeenKana>(() => loadSeenKana());
  const [discovered, setDiscovered] = useState<string[]>(() => loadDiscovered());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const cardStartRef = useRef<number>(Date.now());     // 현재 카드 표시 시각 (빠른 정답 판정)
  const advanceTimerRef = useRef<number | null>(null);  // 정답 자동 넘김 타이머
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
    updateSettings({ ...settings, mode, readingAid: p.readingAid, slowListening: p.slowListening });
  }
  const sessionConfig = { quotas: MODE_PRESETS[settings.mode].quotas, minFresh: MODE_PRESETS[settings.mode].minFresh };

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
    else if (card.kind === 'introduce' || card.kind === 'speak' || card.kind === 'discover' || card.kind === 'dictation') ja = card.ja;
    if (!ja) return;
    const t = window.setTimeout(() => speak(ja, { rate: settings.slowListening ? 0.6 : 0.95 }), 120);
    return () => clearTimeout(t);
  }, [i, view, card, settings.slowListening]);

  // 주간/야간 테마를 <html data-theme>에 반영
  useEffect(() => { document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);

  // 카드가 바뀌면 표시 시각 리셋 + 이전 자동넘김 타이머 정리
  useEffect(() => {
    cardStartRef.current = Date.now();
    return () => { if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; } };
  }, [i, view]);

  // 세션 중 카드 소진되면 done으로 (render 중 setState 금지)
  useEffect(() => {
    if (view === 'session' && sessionCards.length > 0 && i >= sessionCards.length) {
      const ns = { lastCompletedSessionId: sessionId };
      setSession(ns); saveSession(ns); setView('done');
    }
  }, [view, sessionCards.length, i, sessionId]);

  // ── 액션 ─────────────────────────────────────────
  // showIntro: 새 "한 판"이면 인트로부터(목표↔첫 카드 정렬), 약점 재출제는 바로 세션.
  function beginSession(id: number, cards: Card[], showIntro: boolean) {
    setSessionId(id);
    setSessionCards(cards);
    setI(0); setPicked(null); setScore(0); setQuizSeen(0); setSessionLog([]);
    setView(showIntro ? 'intro' : 'session');
  }
  // 발견 카드: 배운 가나로만 된(2자 이상) 아직 축하 안 한 표현 1개 → 세션 끝 보상으로
  function pickDiscovery(): DiscoverCard | null {
    for (const p of CONTENT.phrases) {
      if (discovered.includes(p.id)) continue;
      const chars = extractKanaChars(p.kana);
      if (chars.length < 2) continue;
      if (chars.every((ch) => isKanaFamiliar(ch, seenKana))) {
        return { kind: 'discover', id: `discover:${p.id}`, tag: '✨ 발견', ja: p.kanji ?? p.displayKana ?? p.kana, kana: p.kana, korean: p.korean };
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
  function startSceneSession(missionId: string) {
    const cards = selectMissionCards(allCards, missionId);
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true);
  }
  // 히라가나/가타카나 직접 연습 — 현재 모드와 무관하게 그 스크립트 가나만
  function startKanaSession(script: 'hiragana' | 'katakana') {
    const ids = new Set(CONTENT.kana.filter((k) => k.script === script).map((k) => k.id));
    const cards = selectScriptKanaCards(allCards, progress, nextSessionId(session), ids);
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
  function retryWeakSession() {
    const weakIds = new Set(sessionLog.filter((r) => r.result !== 'correct').map((r) => r.id));
    const weak = sessionCards.filter((c) => c.kind === 'quiz' && weakIds.has(c.id));
    if (weak.length === 0) return;
    beginSession(nextSessionId(session), weak, false);
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
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
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
    if (c.ja) speak(c.ja);
    if (card.kind !== 'quiz') return;
    creditKana(card);
    recordCardResult(card.id, c.correct, !!c.recovery, fast);
    // 정답(복구·오답 아님)이면 자동으로 다음 카드 — 반복 진행 시간 단축
    if (c.correct && !c.recovery && settings.fastForward) {
      advanceTimerRef.current = window.setTimeout(() => { advanceTimerRef.current = null; next(); }, 1000);
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
      return <Map nav={{ ...nav, current: 'map' }} allCards={allCards} progress={progress} onPracticeScene={startSceneSession} onBack={() => setView('home')} />;
    }
    if (view === 'review') {
      return <Review nav={{ ...nav, current: 'review' }} allCards={allCards} progress={progress} seenKana={seenKana} onBack={() => setView('home')} />;
    }
    if (view === 'intro') {
      const missions = missionsFromCards(sessionCards, progress, sessionId);
      const hasKana = sessionCards.some((c) => c.kind === 'quiz' && c.reviewTarget?.type === 'kana');
      return <Intro cards={sessionCards} goal={sessionGoalText(missions, hasKana)} onStart={() => setView('session')} onBack={() => setView('home')} />;
    }
    if (view === 'done') {
      const canContinue = plannedSessionSize(allCards, progress, nextSessionId(session), sessionConfig) > 0;
      return (
        <Done
          sessionId={sessionId} score={score} quizSeen={quizSeen} sessionLog={sessionLog}
          progress={progress} canContinue={canContinue}
          speakCount={sessionCards.filter((c) => c.kind === 'speak').length}
          onRetryWeak={retryWeakSession} onContinue={startSession} onHome={() => setView('home')}
        />
      );
    }
    if (view === 'session') {
      if (!card) return <main style={WRAP}><p>로딩…</p></main>;
      return (
        <Session
          card={card}
          index={i}
          total={sessionCards.length}
          picked={picked}
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
        modeLabel={MODE_PRESETS[settings.mode].label}
        onStart={startSession} onReset={resetAll} onPracticeScene={startSceneSession} onPracticeKana={startKanaSession} onPracticeSigns={startSignSession} onPracticeDictation={startDictationSession}
      />
    );
  }

  return (
    <>
      {renderView()}
      {showGuide && <Guide onClose={() => setShowGuide(false)} />}
      {showSettings && (
        <SettingsModal settings={settings} onChange={updateSettings} onSelectMode={selectMode} onMarkKanaKnown={markAllKanaKnown} onReset={resetAll} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
