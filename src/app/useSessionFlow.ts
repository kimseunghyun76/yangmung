// 세션 카드 상태머신 — 카드 진행(i)·채점·자동넘김 타이머·TTS 자동재생·완료 판정을 한곳에.
// App.tsx에서 분리: App은 "무엇을 배울지"(세션 구성·라우팅), 여기는 "카드 한 장을 어떻게 진행할지".
import { useEffect, useRef, useState } from 'react';
import { materializeQuizCard, type Card, type Choice } from '../learn/cards';
import {
  recordAttempt, recordKnown, nextSessionId,
  type ProgressMap, type SessionLogEntry, type SessionState,
} from '../learn/progress';
import { PROMO_PASS, STAGE_PASS, type CoreLevel } from '../learn/progression';
import { extractKanaChars } from '../learn/kanaReading';
import { resetMangaBackdrops } from '../views/scene';
import { speak, stopSpeaking, ttsSupported } from '../tts';
import type { PickMap } from '../views/OrderCard';
import type { Navigate, View } from './routing';

const FAST_MS = 4000;

export interface BeginSessionOpts {
  intro?: boolean;              // 인트로부터 시작 (기본 true)
  gacha?: boolean;              // 보석함 대상 세션인지 (기본 true)
  practice?: boolean;           // 빠른 연습(미션 X) 표시 구분 (기본 false)
  stage?: string | null;        // 통과 시 완료 처리할 진도 단계 키
  promotion?: CoreLevel | null; // 승급 시험이면 대상 레벨
}

export interface SessionFlowDeps {
  view: View;
  navigate: Navigate;
  progress: ProgressMap;
  commitProgress: (p: ProgressMap) => void;  // 상태 반영 + 저장
  session: SessionState;
  commitSession: (s: SessionState) => void;  // 상태 반영 + 저장
  creditKanaSeen: (chars: string[]) => void;   // 카드에서 마주친 가나 적립
  creditKanaKnown: (chars: string[]) => void;  // "이미 알아요" 즉시 익숙 처리
  onStagePass: (stageKey: string) => void;         // 단계 통과(정답률 ≥80%)
  onPromotionPass: (level: CoreLevel) => void;     // 승급 통과(정답률 ≥90%)
}

// 카드에서 "본 가나"로 적립할 가나 문자 — 깔끔한 가나 필드가 있는 카드만.
function cardKanaChars(c: Card): string[] {
  let text = '';
  if (c.kind === 'introduce' || c.kind === 'speak') text = c.kana;
  else if (c.kind === 'dictation') text = c.answer.join('');
  else if (c.kind === 'quiz' && c.reviewTarget?.type === 'kana') text = c.bannerJa ?? '';
  else if (c.kind === 'quiz' && c.promptPhrase) text = c.promptPhrase.kana;
  return text ? extractKanaChars(text) : [];
}

export function useSessionFlow(deps: SessionFlowDeps) {
  const { view, navigate } = deps;
  const [sessionCards, setSessionCards] = useState<Card[]>([]);
  const [sessionId, setSessionId] = useState(0);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizSeen, setQuizSeen] = useState(0);
  const [sessionLog, setSessionLog] = useState<SessionLogEntry[]>([]);
  const [picks, setPicks] = useState<PickMap>({}); // 미션 스텝별 내가 고른 답변 (대화 리캡용)
  const [gachaEligible, setGachaEligible] = useState(true); // 약점 재도전 세션은 보석함 제외
  const practiceRef = useRef(false);                    // 이번 세션이 빠른 연습인지(미션 X)
  const stageKeyRef = useRef<string | null>(null);      // 이번 세션이 통과시킬 단계 키
  const promotionRef = useRef<CoreLevel | null>(null);  // 이번 세션이 승급 시험인지(대상 레벨)
  const cardStartRef = useRef<number>(Date.now());      // 현재 카드 표시 시각 (빠른 정답 판정)
  const advanceTimerRef = useRef<number | null>(null);  // 정답 자동 넘김 타이머
  const safetyTimerRef = useRef<number | null>(null);   // TTS onend 미발화 대비 안전망
  const currentCardKeyRef = useRef<string>('');         // 이전 카드 TTS 콜백 가드
  const pendingAdvanceKeyRef = useRef<string | null>(null);

  const card: Card | undefined = view === 'session' ? sessionCards[i] : undefined;

  function clearAdvanceTimers() {
    if (advanceTimerRef.current) { clearTimeout(advanceTimerRef.current); advanceTimerRef.current = null; }
    if (safetyTimerRef.current) { clearTimeout(safetyTimerRef.current); safetyTimerRef.current = null; }
    pendingAdvanceKeyRef.current = null;
  }

  function creditKana(c: Card) {
    const chars = cardKanaChars(c);
    if (chars.length === 0) return;
    deps.creditKanaSeen(chars);
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
      deps.commitSession({ lastCompletedSessionId: sessionId });
      // 단계/승급 통과 평가 — 정답률 기준(단계 ≥80%, 승급 ≥90%)
      const acc = quizSeen > 0 ? score / quizSeen : 0;
      const promo = promotionRef.current;
      const stage = stageKeyRef.current;
      if (promo) {
        if (acc >= PROMO_PASS) deps.onPromotionPass(promo);
        promotionRef.current = null;
      } else if (stage) {
        if (acc >= STAGE_PASS) deps.onStagePass(stage);
        stageKeyRef.current = null;
      }
      navigate('done', { replace: true }); // 자동 전환 — 뒤로가기로 세션에 재진입하지 않게
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, sessionCards.length, i, sessionId]);

  // ── 액션 ─────────────────────────────────────────
  // intro: 새 "한 판"이면 인트로부터(목표↔첫 카드 정렬), 약점 재출제는 바로 세션.
  function beginSession(id: number, cards: Card[], opts: BeginSessionOpts = {}) {
    resetMangaBackdrops(); // 세션마다 장면 배경을 3컷 중 새 랜덤으로
    practiceRef.current = opts.practice ?? false;
    stageKeyRef.current = opts.stage ?? null;
    promotionRef.current = opts.promotion ?? null;
    const materialized = cards.map(materializeQuizCard);
    setSessionId(id);
    setSessionCards(materialized);
    setI(0); setPicked(null); setScore(0); setQuizSeen(0); setSessionLog([]); setPicks({});
    setGachaEligible(opts.gacha ?? true);
    navigate((opts.intro ?? true) ? 'intro' : 'session');
  }

  function retryWeak() {
    const weakIds = new Set(sessionLog.filter((r) => r.result !== 'correct').map((r) => r.id));
    const weak = sessionCards.filter((c) => c.kind === 'quiz' && weakIds.has(c.id));
    if (weak.length === 0) return;
    // 약점 재도전 = 인트로 X · 보석함 X
    beginSession(nextSessionId(deps.session), weak, { intro: false, gacha: false });
  }

  function next() {
    clearAdvanceTimers();
    // 팁 카드는 점수 없이 "본 적 있음"만 기록 → 다음 세션엔 다른 팁이 회전해 나옴
    if (card?.kind === 'tip') {
      deps.commitProgress(recordAttempt(deps.progress, card.id, { correct: true, usedRecovery: false, sessionId }));
    }
    setPicked(null);
    setI((n) => n + 1);
  }

  function prev() {
    clearAdvanceTimers();
    setPicked(null);
    setI((n) => Math.max(0, n - 1));
  }

  // "이미 알아요": 현재 카드를 즉시 익숙 처리 + 가나 보조 끔 → 다음으로 (점수·약점 집계 X)
  function markKnown() {
    if (!card || card.kind === 'tip' || card.kind === 'discover' || card.kind === 'order') { next(); return; }
    const chars = cardKanaChars(card);
    if (chars.length) deps.creditKanaKnown(chars);
    if ('reviewTarget' in card && card.reviewTarget) {
      deps.commitProgress(recordKnown(deps.progress, card.id, sessionId));
    }
    next();
  }

  // 카드 1장 결과 기록 (퀴즈·순서 카드 공용)
  function recordCardResult(cardId: string, correct: boolean, recovery: boolean, fast: boolean) {
    setQuizSeen((n) => n + 1);
    if (correct && !recovery) setScore((sc) => sc + 1);
    const result: SessionLogEntry['result'] = recovery ? 'recovery' : correct ? 'correct' : 'wrong';
    setSessionLog((log) => [...log, { id: cardId, result }]);
    deps.commitProgress(recordAttempt(deps.progress, cardId, { correct, usedRecovery: recovery, sessionId, fast }));
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
    deps.commitProgress(recordAttempt(deps.progress, card.id, { correct: true, usedRecovery: false, sessionId }));
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
    deps.commitProgress(recordAttempt(deps.progress, card.id, { correct: true, usedRecovery: false, sessionId }));
  }

  return {
    // 상태
    card, i, sessionCards, sessionId, picked, score, quizSeen, sessionLog, picks, gachaEligible,
    isPractice: practiceRef.current,
    // 액션
    beginSession, retryWeak, next, prev, choose, markKnown,
    introduceSeen, dictationResult, speakPracticed,
  };
}
