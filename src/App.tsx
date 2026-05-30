// 상태·라우팅 허브 — 화면 렌더링은 src/views/* 에 위임.
import { useEffect, useMemo, useState } from 'react';
import { buildCards, type Card, type Choice } from './learn/cards';
import {
  classifyCard, clearProgress, isKanaFamiliar, loadProgress, loadSeenKana, loadSession,
  markKanaSeen, missionsFromCards, nextSessionId, plannedSessionSize, recordAttempt,
  saveProgress, saveSeenKana, saveSession, selectMissionCards, selectSessionCards,
  type SeenKana, type SessionLogEntry,
} from './learn/progress';
import { extractKanaChars } from './learn/kanaReading';
import { loadSettings, saveSettings, type Settings } from './learn/settings';
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
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const card: Card | undefined = view === 'session' ? sessionCards[i] : undefined;
  // 발음 보조: 설정에 따라 항상 보임(always)·안 보임(off)·자동(익히면 사라짐).
  const kanaFamiliar = (ch: string) =>
    settings.readingAid === 'off' ? true
    : settings.readingAid === 'always' ? false
    : isKanaFamiliar(ch, seenKana);

  function updateSettings(s: Settings) { setSettings(s); saveSettings(s); }

  // 카드에서 "본 가나"로 적립할 가나 문자 — 깔끔한 가나 필드가 있는 카드만.
  function creditKana(c: Card) {
    let text = '';
    if (c.kind === 'introduce' || c.kind === 'speak') text = c.kana;
    else if (c.kind === 'dictation') text = c.answer.join('');
    else if (c.kind === 'quiz' && c.reviewTarget?.type === 'kana') text = c.bannerJa ?? '';
    else if (c.kind === 'quiz' && c.promptPhrase) text = c.promptPhrase.kana; // 미션 프롬프트(점원 발화)
    const chars = text ? extractKanaChars(text) : [];
    if (chars.length === 0) return;
    setSeenKana((prev) => { const nx = markKanaSeen(prev, chars); saveSeenKana(nx); return nx; });
  }

  // 듣기 카드 자동 재생 (설정에서 끌 수 있음)
  useEffect(() => {
    if (view !== 'session' || !card || !settings.autoPlay) return;
    if (card.kind === 'quiz' && card.listen && card.bannerJa) speak(card.bannerJa);
  }, [i, view, card, settings.autoPlay]);

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
    creditKana(card);
    recordCardResult(card.id, c.correct, !!c.recovery);
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
    recordCardResult(card.id, correct, false);
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
  }

  // ── 라우팅 ───────────────────────────────────────
  // 허브 화면(홈·지도·복습)엔 상단 네비게이션 — 자유 이동 + 가이드/설정.
  const nav = {
    onNavigate: (v: 'home' | 'map' | 'review') => setView(v),
    onOpenGuide: () => setShowGuide(true),
    onOpenSettings: () => setShowSettings(true),
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
      return <Intro cards={sessionCards} goal={sessionGoalText(missions, hasKana)} onStart={() => setView('session')} />;
    }
    if (view === 'done') {
      const canContinue = plannedSessionSize(allCards, progress, nextSessionId(session)) > 0;
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
          cardStatus={card.kind === 'tip' || card.kind === 'order' ? null : classifyCard(card, progress[card.id], sessionId)}
          onChoose={choose}
          onIntroduceSeen={introduceSeen}
          onSpeakPracticed={speakPracticed}
          onDictationResult={dictationResult}
          isKanaFamiliar={kanaFamiliar}
          onNext={next}
        />
      );
    }
    return (
      <Home
        nav={{ ...nav, current: 'home' }}
        allCards={allCards} progress={progress} session={session}
        onStart={startSession} onReset={resetAll}
        onOpenMap={() => setView('map')} onOpenReview={() => setView('review')} onPracticeScene={startSceneSession}
      />
    );
  }

  return (
    <>
      {renderView()}
      {showGuide && <Guide onClose={() => setShowGuide(false)} />}
      {showSettings && (
        <SettingsModal settings={settings} onChange={updateSettings} onReset={resetAll} onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
