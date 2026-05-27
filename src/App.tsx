import { useEffect, useMemo, useState } from 'react';
import { buildCards, type Card, type Choice } from './learn/cards';
import {
  classifyCard, clearProgress, loadProgress, loadSession, nextSessionId,
  recordAttempt, saveProgress, saveSession, selectSessionCards, sessionCounts, sessionResult, summarize,
} from './learn/progress';
import { speak, ttsSupported } from './tts';

const BTN: React.CSSProperties = { padding: '12px 16px', borderRadius: 10, border: '1px solid #d0d0d8', background: '#fff', cursor: 'pointer', fontSize: 16, textAlign: 'left' };
const PRIMARY: React.CSSProperties = { ...BTN, background: '#4f46e5', color: '#fff', textAlign: 'center' };

type View = 'home' | 'session' | 'done';

export function App() {
  // ── hooks (top-level, 일관 순서) ─────────────────────
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
  function startSession() {
    const id = nextSessionId(session);
    const cards = selectSessionCards(allCards, progress, id);
    if (cards.length === 0) return;
    setSessionId(id);
    setSessionCards(cards);
    setI(0); setPicked(null); setScore(0); setQuizSeen(0);
    setView('session');
  }
  function next() {
    setPicked(null);
    setI((n) => n + 1);
  }
  function choose(idx: number, c: Choice) {
    if (!card || picked !== null) return;
    setPicked(idx);
    if (c.ja) speak(c.ja);
    if (card.kind === 'quiz') {
      setQuizSeen((n) => n + 1);
      if (c.correct && !c.recovery) setScore((sc) => sc + 1);
      const updated = recordAttempt(progress, card.id, {
        correct: c.correct, usedRecovery: !!c.recovery, sessionId,
      });
      setProgress(updated);
      saveProgress(updated);
    }
  }
  function resetAll() {
    clearProgress();
    setProgress({});
    setSession({ lastCompletedSessionId: 0 });
  }

  const wrap: React.CSSProperties = { fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 560, margin: '0 auto' };

  // ── HOME ─────────────────────────────────────────
  if (view === 'home') {
    const upcomingId = nextSessionId(session);
    const counts = sessionCounts(allCards, progress, upcomingId);
    const s = summarize(progress);
    return (
      <main style={wrap}>
        <h1 style={{ marginBottom: 4 }}>yangmung</h1>
        <p style={{ color: '#888', marginTop: 0, fontSize: 13 }}>다음 세션 #{upcomingId}</p>

        {s.seen > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, background: '#eef2ff', padding: 10, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#666' }}>본 카드</div><div style={{ fontSize: 20, fontWeight: 600 }}>{s.seen}</div>
            </div>
            <div style={{ flex: 1, background: '#dcfce7', padding: 10, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#666' }}>익숙</div><div style={{ fontSize: 20, fontWeight: 600, color: '#16a34a' }}>{s.mastered}</div>
            </div>
            <div style={{ flex: 1, background: '#fee2e2', padding: 10, borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#666' }}>약점</div><div style={{ fontSize: 20, fontWeight: 600, color: '#dc2626' }}>{s.weak}</div>
            </div>
          </div>
        )}

        <div style={{ background: '#f5f5fb', padding: 16, borderRadius: 12, marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>🔁 오늘 복습</span><strong>{counts.due}개</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>🆕 새 학습</span><strong>{counts.fresh}개</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: 13 }}>
            <span>💤 잠시 제외(익숙)</span><span>{counts.cooldown}개</span>
          </div>
        </div>

        <button style={{ ...PRIMARY, marginTop: 16, width: '100%' }} onClick={startSession} disabled={counts.due + counts.fresh === 0}>
          {counts.due + counts.fresh === 0 ? '오늘 학습할 카드가 없어요' : `시작 (${counts.due + counts.fresh}카드)`}
        </button>

        {s.seen > 0 && (
          <button style={{ ...BTN, marginTop: 12, color: '#888', textAlign: 'center', width: '100%', fontSize: 13 }} onClick={() => { if (confirm('진척을 모두 지울까요?')) resetAll(); }}>
            처음부터 다시
          </button>
        )}

        {!ttsSupported() && <p style={{ color: '#b45309', fontSize: 13, marginTop: 16 }}>이 브라우저는 음성(TTS) 미지원 — 텍스트로만 진행됩니다.</p>}
      </main>
    );
  }

  // ── DONE ─────────────────────────────────────────
  if (view === 'done') {
    const stars = quizSeen ? Math.max(1, Math.round((score / quizSeen) * 3)) : 0;
    const s = summarize(progress);
    const sr = sessionResult(progress, sessionId);
    return (
      <main style={wrap}>
        <h1>세션 {sessionId} 완료 🎉</h1>
        <p style={{ fontSize: 22 }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
        <p>첫 시도 정답 {score} / 퀴즈 {quizSeen}</p>
        <p style={{ color: '#888', fontSize: 14 }}>복구(다시 말해 주세요) 사용은 별점에 안 들어갑니다 — 보조 바퀴.</p>

        <div style={{ marginTop: 16, padding: 14, background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a' }}>
          <p style={{ margin: 0, fontSize: 14, color: '#666' }}>🎯 이번 세션 결과</p>
          <p style={{ margin: '4px 0 0', fontSize: 16 }}>
            <span style={{ color: '#16a34a' }}>✅ 익숙 진입 {sr.masteredNow}개</span>
            {' · '}
            <span style={{ color: '#dc2626' }}>⚠️ 약점 {sr.weakNow}개</span>
          </p>
          {sr.masteredNow === 0 && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#888' }}>tip: 같은 카드를 *2회 연속 첫시도 정답*하면 익숙으로 진입(다음 세션 잠시 제외)</p>
          )}
        </div>

        <div style={{ marginTop: 12, padding: 14, background: '#f5f5fb', borderRadius: 10 }}>
          <p style={{ margin: 0, fontSize: 14, color: '#666' }}>📊 누적</p>
          <p style={{ margin: '4px 0 0', fontSize: 15 }}>본 카드 {s.seen} · 익숙 {s.mastered} · 약점 {s.weak}</p>
        </div>
        <button style={{ ...PRIMARY, marginTop: 16, width: '100%' }} onClick={() => setView('home')}>홈으로</button>
      </main>
    );
  }

  // ── SESSION ─────────────────────────────────────
  if (!card) return <main style={wrap}><p>로딩…</p></main>;

  const cardStatus = card.kind === 'quiz' ? classifyCard(card, progress[card.id], sessionId) : null;
  const badgeStyle: React.CSSProperties = { display: 'inline-block', padding: '3px 9px', borderRadius: 999, fontSize: 12, fontWeight: 600, marginLeft: 8 };
  const badge =
    cardStatus === 'due' ? <span style={{ ...badgeStyle, background: '#a78bfa', color: '#fff' }}>🔁 복습</span> :
    cardStatus === 'new' ? <span style={{ ...badgeStyle, background: '#60a5fa', color: '#fff' }}>🆕 신규</span> :
    null;

  return (
    <main style={wrap}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#888', fontSize: 13 }}>
        <span>{card.tag}{badge}</span>
        <span>{i + 1} / {sessionCards.length}</span>
      </div>
      {card.kind === 'quiz' && card.scenario && (
        <div style={{ color: '#a78bfa', fontSize: 14, marginTop: 2, fontWeight: 500 }}>📍 {card.scenario}</div>
      )}

      {card.kind === 'tip' ? (
        <>
          <h2 style={{ marginTop: 16 }}>💡 {card.label}</h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, background: '#f5f5fb', padding: 16, borderRadius: 10 }}>{card.tipKo}</p>
          <button style={{ ...PRIMARY, marginTop: 16 }} onClick={next}>다음</button>
        </>
      ) : (
        <>
          <div style={{ fontSize: card.listen || card.tag === 'K1 가나' ? 72 : 28, textAlign: 'center', margin: '20px 0 6px' }}>{card.banner}</div>
          {card.bannerJa && (
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <button
                style={{ ...BTN, padding: card.listen ? '10px 22px' : '6px 12px', fontSize: card.listen ? 18 : undefined, background: card.listen ? '#eef2ff' : undefined }}
                onClick={() => speak(card.bannerJa!)} disabled={!ttsSupported()}
              >🔊 듣기</button>
            </div>
          )}
          <p style={{ color: '#555' }}>{card.sub}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {card.choices.map((c, idx) => {
              const isPicked = picked === idx;
              const reveal = picked !== null;
              const bg = !reveal ? '#fff' : c.correct ? '#dcfce7' : isPicked ? '#fee2e2' : '#fff';
              return (
                <button key={idx} style={{ ...BTN, background: bg }} onClick={() => choose(idx, c)} disabled={reveal}>
                  {c.label}{reveal && c.recovery ? ' 🛟' : ''}{reveal && c.correct ? ' ✓' : ''}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div style={{ marginTop: 14 }}>
              <p style={{ color: card.choices[picked].correct ? '#16a34a' : '#dc2626' }}>
                {card.choices[picked].correct ? (card.choices[picked].recovery ? '복구로 넘어갔어요 (별점 ↓)' : '정답!') : '아쉬워요'}
              </p>
              {card.listen && card.bannerJa && (
                <p style={{ background: '#fef9c3', padding: 12, borderRadius: 8, fontSize: 16, color: '#444' }}>들린 표현: <strong>{card.bannerJa}</strong></p>
              )}
              {card.choices[picked].feedback && (
                <p style={{ background: '#f5f5fb', padding: 12, borderRadius: 8, fontSize: 14, color: '#444' }}>💬 {card.choices[picked].feedback}</p>
              )}
              <button style={{ ...PRIMARY }} onClick={next}>다음</button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
