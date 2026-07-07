// 수준 진단(배치) 테스트 — 3축(읽기·듣기·상황) 12문항 적응형 진단.
// 결과: 스킬별 점수 바 + 약점 강조 + 맞춤 시작 난이도 추천.
// SRS/진척에 기록하지 않는 1회성 진단.
import { useEffect, useState } from 'react';
import type { Card, Choice } from '../learn/cards';
import { saveSkillProfile, type LearnMode, type ReadingAidMode } from '../learn/settings';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { PrimaryAction } from './shell';

interface Props {
  cards: Card[];
  onDone: (mode: LearnMode, markKanaKnown: boolean, overrides?: { readingAid?: ReadingAidMode }) => void;
  onSkip: () => void;
}

// 3축: 읽기(가나 6문) / 듣기(표현 5문) / 상황(장면 5문) = 총 16문항.
// 상황 선택지는 일본어(가나)로 표시 — 한글 선택지 금지.
type SkillAxis = 'read' | 'listen' | 'situation';

const AXIS_LABEL: Record<SkillAxis, string> = {
  read: '읽기 (가나)',
  listen: '듣기 (표현)',
  situation: '상황 회화',
};
const AXIS_ICON: Record<SkillAxis, React.ComponentProps<typeof Icon>['name']> = {
  read: 'kana',
  listen: 'listen',
  situation: 'target',
};

function axisOf(c: Card): SkillAxis {
  if (c.kind !== 'quiz') return 'read';
  if (c.reviewTarget?.type === 'mission') return 'situation';
  if (c.listen) return 'listen';
  return 'read';
}

interface Reco {
  mode: LearnMode;
  markKana: boolean;
  readingAid?: ReadingAidMode;
  profile: string;
  badge: string;      // 이모지 뱃지
  title: string;
  desc: string;
  tips: string[];     // 축별 약점 맞춤 팁 1~2개
}

// 3축 점수로 프로필·모드 판정
export function recommend(read: number, listen: number, situation: number): Reco {
  const avg = (read + listen + situation) / 3;
  const readStrong = read >= 0.7, listenStrong = listen >= 0.7, situStrong = situation >= 0.7;
  const readWeak = read < 0.5, listenWeak = listen < 0.5, situWeak = situation < 0.5;

  const tips: string[] = [];

  // 맞춤 팁 생성
  if (readWeak) tips.push('가나 읽기 트랙으로 히라가나·가타카나를 먼저 다져요.');
  if (listenWeak) tips.push('듣기 세션으로 점원 표현 듣기를 매일 조금씩 훈련해요.');
  if (situWeak) tips.push('편의점(C1)·식당(C2) 미션부터 차근차근 장면을 경험해요.');
  if (tips.length === 0) {
    if (avg >= 0.85) tips.push('어려운 장면(약국·ATM·오마카세) 도전을 추천해요.');
    else tips.push('꾸준히 복습해 익숙해진 표현을 늘려가요.');
  }

  // 애니·드라마파 — 귀는 트였지만 읽기가 약
  if (listenStrong && readWeak) {
    return {
      mode: 'express', markKana: false, readingAid: 'auto',
      profile: '귀가 먼저 트인 여행자', badge: '🎧',
      title: '중급 (읽기 보조 켬)',
      desc: '애니·드라마로 귀가 트인 타입! 듣기·말하기는 빠르게, 가나 읽기는 보조와 함께 따라잡아요.',
      tips,
    };
  }
  // 독학파 — 읽기 강하지만 듣기가 약
  if (readStrong && listenWeak) {
    return {
      mode: 'default', markKana: true,
      profile: '눈이 빠른 여행자', badge: '👁',
      title: '기본 (듣기 집중)',
      desc: '읽기는 탄탄한데 귀가 낯설어요. 가나는 건너뛰고, 듣기 문항을 많이 만나며 귀를 틔워요.',
      tips,
    };
  }
  // 장면 경험 풍부 — 읽기·듣기 강하고 상황도 안정
  if (readStrong && listenStrong && situStrong) {
    return {
      mode: 'advanced', markKana: true,
      profile: '준비된 여행자', badge: '🏆',
      title: '고급',
      desc: '세 가지 모두 아주 좋아요! 한자 보기·보조 끔으로 실전처럼 빠르게 진행해요.',
      tips,
    };
  }
  // 균형형 중급
  if (avg >= 0.65) {
    return {
      mode: 'express', markKana: true,
      profile: '든든한 여행자', badge: '💪',
      title: '중급',
      desc: '기본기가 탄탄해요! 가나는 익힌 것으로 두고, 일본어(가나) 보기·장면 위주로 달려요.',
      tips,
    };
  }
  // 균형형 기본
  if (avg >= 0.4) {
    return {
      mode: 'default', markKana: false,
      profile: '균형 잡힌 여행자', badge: '🎯',
      title: '기본',
      desc: '읽기·듣기를 고르게 키워요. 모르는 가나만 보조하며 장면 학습을 균형 있게 진행해요.',
      tips,
    };
  }
  return {
    mode: 'beginner', markKana: false,
    profile: '설레는 첫 여행자', badge: '🌱',
    title: '입문',
    desc: '처음이라도 괜찮아요! 가나와 기초 표현부터 천천히 — 발음 보조 항상, 일본어+한글 보기로 시작해요.',
    tips,
  };
}

export function Placement({ cards, onDone, onSkip }: Props) {
  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState<Record<SkillAxis, { ok: number; total: number }>>({
    read: { ok: 0, total: 0 },
    listen: { ok: 0, total: 0 },
    situation: { ok: 0, total: 0 },
  });
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(cards.length === 0);
  const card = cards[idx];

  // 듣기·상황 문항은 화면에 뜨면 소리가 바로 나오게
  useEffect(() => {
    if (done) return;
    const c = cards[idx];
    if (c?.kind === 'quiz' && c.listen && c.bannerJa) {
      const t = window.setTimeout(() => speak(c.bannerJa!), 200);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done]);

  // 정답 여부와 무관하게 자동으로 넘어가지 않는다 — 정답 설명을 보여준 뒤 "다음"을 눌러야 진행된다.
  function pick(i: number, c: Choice) {
    if (picked !== null || !card) return;
    setPicked(i);
    const ok = c.correct && !c.recovery;
    const axis = axisOf(card);
    setHits((h) => ({ ...h, [axis]: { ok: h[axis].ok + (ok ? 1 : 0), total: h[axis].total + 1 } }));
    if (c.ja) speak(c.ja);
  }
  // 모르는 문제 패스 — 오답(미숙)으로 집계하되, 정답을 보여주고 "다음"을 눌러야 넘어간다.
  function passQuestion() {
    if (picked !== null || !card || card.kind !== 'quiz') return;
    setPicked(-1); // 정답만 강조(고른 오답 없음)
    const axis = axisOf(card);
    setHits((h) => ({ ...h, [axis]: { ok: h[axis].ok, total: h[axis].total + 1 } }));
    const correct = card.choices.find((x) => x.correct && !x.recovery);
    if (correct?.ja) speak(correct.ja);
  }
  function next() {
    setPicked(null);
    if (idx + 1 >= cards.length) setDone(true); else setIdx((n) => n + 1);
  }

  if (done) {
    const pct = (a: SkillAxis) => (hits[a].total ? hits[a].ok / hits[a].total : 0);
    const read = pct('read'), listen = pct('listen'), situation = pct('situation');
    const r = recommend(read, listen, situation);
    const totalOk = hits.read.ok + hits.listen.ok + hits.situation.ok;
    const totalN = hits.read.total + hits.listen.total + hits.situation.total;

    function apply() {
      saveSkillProfile({ read, listen, at: new Date().toISOString() });
      onDone(r.mode, r.markKana, r.readingAid ? { readingAid: r.readingAid } : undefined);
    }

    return (
      <main style={WRAP}>
        <div className="ym-rise" style={{ textAlign: 'center', paddingTop: 24 }}>
          {/* 결과 뱃지 */}
          <div className="ym-burst" style={{ width: 80, height: 80, margin: '0 auto', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
            {r.badge}
          </div>
          <h1 style={{ margin: '16px 0 0', fontSize: 24 }}>진단 결과</h1>
          <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>{r.profile}</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-faint)', fontWeight: 700 }}>{totalOk} / {totalN} 정답</p>

          {/* 3축 스킬 바 */}
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            {(['read', 'listen', 'situation'] as SkillAxis[]).map((ax) => (
              <SkillBar key={ax} label={AXIS_LABEL[ax]} icon={AXIS_ICON[ax]} pct={pct(ax)} n={hits[ax].total} />
            ))}
          </div>

          {/* 추천 난이도 */}
          <div style={{ marginTop: 18, padding: 18, borderRadius: 18, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.05em' }}>추천 시작 난이도</p>
            <p style={{ margin: '6px 0 0', fontSize: 19, fontWeight: 800 }}>{r.title}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{r.desc}</p>
          </div>

          {/* 맞춤 팁 */}
          {r.tips.length > 0 && (
            <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 14, background: 'var(--accent-soft)', textAlign: 'left' }}>
              <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 800, color: 'var(--accent)' }}>💡 학습 팁</p>
              {r.tips.map((tip, i) => (
                <p key={i} style={{ margin: i > 0 ? '4px 0 0' : 0, fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>• {tip}</p>
              ))}
            </div>
          )}
        </div>

        <div className="ym-rise" style={{ animationDelay: '.08s', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryAction onClick={apply}><Icon name="check" size={18} /> 이 난이도로 시작</PrimaryAction>
          <button className="ym-press" onClick={onSkip} style={ghostBtn}>나중에 / 직접 고르기</button>
          <p style={{ fontSize: 12, color: 'var(--ink-faint)', textAlign: 'center', margin: '2px 0 0' }}>난이도는 설정에서 언제든 바꿀 수 있어요.</p>
        </div>
      </main>
    );
  }

  if (!card || card.kind !== 'quiz') return (
    <main style={WRAP}><p style={{ textAlign: 'center', marginTop: 40, color: 'var(--ink-soft)' }}>진단 문항을 준비하고 있어요.</p></main>
  );

  // 현재 축 표시 — 어떤 스킬을 재는지 알려줌
  const axis = axisOf(card);
  const axisLabel = AXIS_LABEL[axis];
  const promptBig = card.tag.startsWith('K') || /^kana:/.test(card.id);

  // 진행 그룹 표시 — 가나·표현·상황 3단계
  const readCount = cards.filter((c) => axisOf(c) === 'read').length;
  const listenCount = cards.filter((c) => axisOf(c) === 'listen').length;
  const phase = axis === 'read' ? 1 : axis === 'listen' ? 2 : 3;

  return (
    <main style={WRAP}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={onSkip} className="ym-press" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '4px 0',
        }}>← 뒤로</button>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {cards.length}</span>
      </div>

      {/* 단계 표시 바 */}
      <div style={{ display: 'flex', gap: 4, margin: '8px 0 0' }}>
        {[
          { label: '읽기', n: readCount },
          { label: '듣기', n: listenCount },
          { label: '상황', n: cards.length - readCount - listenCount },
        ].map(({ label, n }, i) => {
          const active = phase === i + 1;
          return (
            <div key={label} style={{ flex: n, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ height: 4, borderRadius: 99, background: active ? 'var(--accent)' : 'var(--glass-border)' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: active ? 'var(--accent)' : 'var(--ink-faint)', textAlign: 'center' }}>{label}</span>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', margin: '10px 0 0', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>
        수준 진단 · {axisLabel}
      </p>

      <div style={{ textAlign: 'center', padding: '22px 16px', marginTop: 12, borderRadius: 20, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)' }}>
        {card.listen ? (
          <button className="ym-press" onClick={() => card.bannerJa && speak(card.bannerJa)} disabled={!ttsSupported()}
            style={{ width: 80, height: 80, borderRadius: 99, border: '1px solid var(--glass-border)', background: 'var(--accent-soft)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="listen" size={38} />
          </button>
        ) : (
          <>
            {/* 일본어 자극(가나·한자·음성) — 메인 표시 */}
            {card.bannerJa ? (
              <div lang="ja" style={{ fontSize: promptBig ? 60 : 24, fontWeight: 900, lineHeight: 1.2, color: 'var(--ink)' }}>
                {card.bannerJa}
              </div>
            ) : null}
            {/* 상황 한글 컨텍스트 — bannerJa 없으면 메인, 있으면 서브 */}
            {card.banner && (
              <p style={{
                margin: card.bannerJa ? '8px 0 0' : '0',
                fontSize: card.bannerJa ? 12 : 18,
                fontWeight: card.bannerJa ? 600 : 800,
                color: card.bannerJa ? 'var(--ink-faint)' : 'var(--ink)',
                lineHeight: 1.5,
              }}>
                {card.banner}
              </p>
            )}
          </>
        )}
        {/* 상황 축: 선택지가 일본어임을 안내 */}
        {axis === 'situation' && (
          <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600 }}>
            알맞은 일본어 표현을 고르세요
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
        {card.choices.map((c, i) => {
          const reveal = picked !== null;
          const right = c.correct && !c.recovery;
          let border = 'var(--glass-border)', bg = 'var(--glass-bg-strong)', color = 'var(--ink)';
          if (reveal && right) { border = 'var(--ok)'; bg = 'var(--ok-soft)'; color = 'var(--ok)'; }
          else if (reveal && picked === i && !right) { border = 'var(--accent)'; bg = 'var(--accent-soft)'; color = 'var(--accent)'; }
          // 상황 축 선택지는 일본어(가나) — 작은 폰트로 읽기 편하게
          const isJaChoice = axis === 'situation';
          return (
            <button key={i} className="ym-press" onClick={() => pick(i, c)} disabled={picked !== null}
              style={{ padding: '14px 10px', borderRadius: 16, border: `1.5px solid ${border}`, background: bg, color, fontSize: isJaChoice ? 13 : 15, fontWeight: 750, cursor: picked === null ? 'pointer' : 'default', minHeight: 58, lineHeight: 1.4 }}
              lang={isJaChoice ? 'ja' : undefined}>
              {c.label}
            </button>
          );
        })}
      </div>

      {picked === null ? (
        /* 이 문제 패스 — 모르는 질문은 넘어가도 돼요 */
        <button className="ym-press" onClick={passQuestion}
          style={{ width: '100%', marginTop: 12, padding: '12px', borderRadius: 14, border: '1px dashed var(--glass-border)', background: 'transparent', color: 'var(--ink-soft)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
          모르겠어요 · 이 문제 패스 →
        </button>
      ) : (
        <AnswerExplanation card={card} picked={picked} onNext={next} />
      )}
    </main>
  );
}

// 정답 설명 — 맞았든 틀렸든(패스 포함) 정답과 이유를 보여준 뒤 "다음"을 눌러야 넘어간다.
function AnswerExplanation({ card, picked, onNext }: { card: Extract<Card, { kind: 'quiz' }>; picked: number; onNext: () => void }) {
  const pickedChoice = picked >= 0 ? card.choices[picked] : undefined;
  const isCorrect = !!pickedChoice && pickedChoice.correct && !pickedChoice.recovery;
  const correct = card.choices.find((x) => x.correct && !x.recovery) ?? card.choices.find((x) => x.correct);
  const ja = correct?.phrase ? (correct.phrase.kanji ?? correct.phrase.kana) : correct?.ja;
  const korean = correct?.phrase?.korean ?? correct?.label;
  const heading = isCorrect ? '정답이에요' : picked === -1 ? '패스했어요 — 정답은 이거예요' : '아쉬워요 — 정답은 이거예요';
  const tone = isCorrect ? 'var(--ok)' : 'var(--accent)';
  const toneSoft = isCorrect ? 'var(--ok-soft)' : 'var(--accent-soft)';
  return (
    <div className="ym-reveal" style={{ marginTop: 14 }}>
      <div style={{ background: toneSoft, padding: 14, borderRadius: 14 }}>
        <p style={{ margin: 0, color: tone, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
          {isCorrect && <Icon name="check" size={18} />} {heading}
        </p>
        {ja && (
          <p style={{ margin: '8px 0 0', fontSize: 18 }}>
            <strong lang="ja">{ja}</strong>
            {korean && <span style={{ color: 'var(--ink-soft)', fontSize: 15 }}> — {korean}</span>}
          </p>
        )}
        {correct?.feedback && <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{correct.feedback}</p>}
      </div>
      <PrimaryAction onClick={onNext} style={{ marginTop: 12 }}>다음</PrimaryAction>
    </div>
  );
}

function SkillBar({ label, icon, pct, n }: { label: string; icon: React.ComponentProps<typeof Icon>['name']; pct: number; n: number }) {
  const color = pct >= 0.7 ? 'var(--ok)' : pct >= 0.4 ? 'var(--warn)' : 'var(--accent)';
  const tag = n === 0 ? '미응시' : pct >= 0.7 ? '강점 ✓' : pct >= 0.4 ? '보통' : '약점 ↑';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 30, height: 30, flex: '0 0 30px', borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', color }}>
        <Icon name={icon} size={16} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 750, color: 'var(--ink-soft)' }}>
          <span>{label}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color }}>
            {n === 0 ? '—' : `${Math.round(pct * 100)}%`}
            <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--ink-faint)' }}>{tag}</span>
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'var(--glass-border)', overflow: 'hidden', marginTop: 4 }}>
          <div style={{ width: `${Math.round(pct * 100)}%`, height: '100%', borderRadius: 99, background: color, transition: 'width .6s cubic-bezier(.2,.8,.2,1)' }} />
        </div>
      </div>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 15, cursor: 'pointer',
};
