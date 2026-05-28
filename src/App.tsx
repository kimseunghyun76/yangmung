// 상태·라우팅 허브 — 화면 렌더링은 src/views/* 에 위임.
import { useEffect, useMemo, useState } from 'react';
import { buildCards, type Card, type Choice } from './learn/cards';
import {
  classifyCard, clearProgress, loadProgress, loadSession, nextSessionId,
  plannedSessionSize, recordAttempt, saveProgress, saveSession, selectSessionCards,
  type SessionLogEntry,
} from './learn/progress';
import { speak } from './tts';
import { WRAP } from './ui/styles';
import { Home } from './views/Home';
import { Intro } from './views/Intro';
import { Session } from './views/Session';
import { Done } from './views/Done';

type View = 'home' | 'intro' | 'session' | 'done';

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
  function choose(idx: number, c: Choice) {
    if (!card || picked !== null) return;
    setPicked(idx);
    if (c.ja) speak(c.ja);
    if (card.kind !== 'quiz') return;
    setQuizSeen((n) => n + 1);
    if (c.correct && !c.recovery) setScore((sc) => sc + 1);
    const result = c.recovery ? 'recovery' : c.correct ? 'correct' : 'wrong';
    setSessionLog((log) => [...log, { id: card.id, result }]);
    const updated = recordAttempt(progress, card.id, { correct: c.correct, usedRecovery: !!c.recovery, sessionId });
    setProgress(updated);
    saveProgress(updated);
  }
  function resetAll() {
    clearProgress();
    setProgress({});
    setSession({ lastCompletedSessionId: 0 });
  }

  // ── 라우팅 ───────────────────────────────────────
  if (view === 'home') {
    return <Home allCards={allCards} progress={progress} session={session} onStart={startSession} onReset={resetAll} />;
  }
  if (view === 'intro') {
    return <Intro cards={sessionCards} onStart={() => setView('session')} />;
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
      cardStatus={card.kind === 'quiz' ? classifyCard(card, progress[card.id], sessionId) : null}
      onChoose={choose}
      onNext={next}
    />
  );
}
