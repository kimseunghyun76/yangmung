// 상태·라우팅 허브 — 화면 렌더링은 src/views/* 에 위임.
import { useEffect, useMemo, useState } from 'react';
import { buildCards, type Card, type Choice } from './learn/cards';
import {
  classifyCard, clearProgress, loadProgress, loadSession, missionsFromCards, nextSessionId,
  plannedSessionSize, recordAttempt, saveProgress, saveSession, selectMissionCards, selectSessionCards,
  type SessionLogEntry,
} from './learn/progress';
import { sessionGoalText } from './views/goal';
import { speak } from './tts';
import { WRAP } from './ui/styles';
import { Home } from './views/Home';
import { Intro } from './views/Intro';
import { Session } from './views/Session';
import { Done } from './views/Done';
import { Map } from './views/Map';

type View = 'home' | 'map' | 'intro' | 'session' | 'done';

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

  const card: Card | undefined = view === 'session' ? sessionCards[i] : undefined;

  // 듣기 카드 자동 재생
  useEffect(() => {
    if (view !== 'session' || !card) return;
    if (card.kind === 'quiz' && card.listen && card.bannerJa) speak(card.bannerJa);
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
  function beginSession(id: number, cards: Card[], showIntro: boolean) {
    setSessionId(id);
    setSessionCards(cards);
    setI(0); setPicked(null); setScore(0); setQuizSeen(0); setSessionLog([]);
    setView(showIntro ? 'intro' : 'session');
  }
  function startSession() {
    const id = nextSessionId(session);
    const cards = selectSessionCards(allCards, progress, id);
    if (cards.length === 0) return;
    beginSession(id, cards, true);
  }
  function startSceneSession(missionId: string) {
    const cards = selectMissionCards(allCards, missionId);
    if (cards.length === 0) return;
    beginSession(nextSessionId(session), cards, true);
  }
  function retryWeakSession() {
    const weakIds = new Set(sessionLog.filter((r) => r.result !== 'correct').map((r) => r.id));
    const weak = sessionCards.filter((c) => c.kind === 'quiz' && weakIds.has(c.id));
    if (weak.length === 0) return;
    beginSession(nextSessionId(session), weak, false);
  }
  function next() {
    setPicked(null);
    setI((n) => n + 1);
  }
  // 카드 1장 결과 기록 (퀴즈·순서 카드 공용)
  function recordCardResult(cardId: string, correct: boolean, recovery: boolean) {
    setQuizSeen((n) => n + 1);
    if (correct && !recovery) setScore((sc) => sc + 1);
    const result: SessionLogEntry['result'] = recovery ? 'recovery' : correct ? 'correct' : 'wrong';
    setSessionLog((log) => [...log, { id: cardId, result }]);
    const updated = recordAttempt(progress, cardId, { correct, usedRecovery: recovery, sessionId });
    setProgress(updated);
    saveProgress(updated);
  }
  function choose(idx: number, c: Choice) {
    if (!card || picked !== null) return;
    setPicked(idx);
    if (c.ja) speak(c.ja);
    if (card.kind !== 'quiz') return;
    recordCardResult(card.id, c.correct, !!c.recovery);
  }
  function orderResult(correct: boolean) {
    if (!card || card.kind !== 'order') return;
    recordCardResult(card.id, correct, false);
  }
  function resetAll() {
    clearProgress();
    setProgress({});
    setSession({ lastCompletedSessionId: 0 });
  }

  // ── 라우팅 ───────────────────────────────────────
  if (view === 'home') {
    return (
      <Home
        allCards={allCards} progress={progress} session={session}
        onStart={startSession} onReset={resetAll}
        onOpenMap={() => setView('map')} onPracticeScene={startSceneSession}
      />
    );
  }
  if (view === 'map') {
    return <Map allCards={allCards} progress={progress} onPracticeScene={startSceneSession} onBack={() => setView('home')} />;
  }
  if (view === 'intro') {
    const missions = missionsFromCards(sessionCards, progress, sessionId);
    const hasKana = sessionCards.some((c) => c.kind === 'quiz' && c.reviewTarget?.type === 'kana');
    const goal = sessionGoalText(missions, hasKana);
    return <Intro cards={sessionCards} goal={goal} onStart={() => setView('session')} />;
  }
  if (view === 'done') {
    const canContinue = plannedSessionSize(allCards, progress, nextSessionId(session)) > 0;
    return (
      <Done
        sessionId={sessionId} score={score} quizSeen={quizSeen} sessionLog={sessionLog}
        progress={progress} canContinue={canContinue}
        onRetryWeak={retryWeakSession} onContinue={startSession} onHome={() => setView('home')}
      />
    );
  }
  if (!card) return <main style={WRAP}><p>로딩…</p></main>;
  return (
    <Session
      card={card}
      index={i}
      total={sessionCards.length}
      picked={picked}
      cardStatus={card.kind === 'tip' ? null : classifyCard(card, progress[card.id], sessionId)}
      onChoose={choose}
      onOrderResult={orderResult}
      onNext={next}
    />
  );
}
