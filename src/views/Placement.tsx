// 수준 진단(배치) 테스트 — 가나·표현 문항을 스킬(읽기/듣기)별로 따로 채점해
// "귀가 먼저 트인 여행자(애니·드라마파)" 같은 프로필을 판정하고, 거기에 맞는 시작 난이도를 추천·적용.
// SRS/진척에 기록하지 않는 1회성 진단. 프로필은 저장되어 이후 콘텐츠 선택 힌트로 쓰인다.
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

// 문항이 어느 스킬을 재는가 — 가나 읽기(read) / 듣고 이해(listen)
type SkillAxis = 'read' | 'listen';
const axisOf = (c: Card): SkillAxis => (c.kind === 'quiz' && c.listen ? 'listen' : 'read');

interface Reco {
  mode: LearnMode;
  markKana: boolean;
  readingAid?: ReadingAidMode; // 프리셋과 다르게 유지하고 싶을 때만
  profile: string;             // 재미있는 프로필 이름
  title: string;               // 추천 난이도 라벨
  desc: string;
}

// 스킬별 점수로 프로필·난이도 판정. 핵심: 듣기가 강해도 읽기가 약하면 가나를 건너뛰지 않고 보조를 유지.
export function recommend(read: number, listen: number): Reco {
  const avg = (read + listen) / 2;
  const listenStrong = listen >= 0.7, readStrong = read >= 0.7;
  const listenWeak = listen < 0.5, readWeak = read < 0.5;

  if (listenStrong && readWeak) {
    return {
      mode: 'express', markKana: false, readingAid: 'auto',
      profile: '귀가 먼저 트인 여행자',
      title: '중급 (읽기 보조 켬)',
      desc: '애니·드라마로 귀가 트인 타입이에요! 듣기·말하기는 빠르게, 가나 읽기는 보조와 함께 차근차근 따라잡아요.',
    };
  }
  if (readStrong && listenWeak) {
    return {
      mode: 'default', markKana: true,
      profile: '눈이 빠른 여행자',
      title: '기본 (듣기 집중)',
      desc: '읽기는 탄탄한데 귀가 아직 낯설어요. 가나는 건너뛰고, 듣기 문항을 많이 만나며 귀를 틔워요.',
    };
  }
  if (avg >= 0.85) {
    return {
      mode: 'advanced', markKana: true,
      profile: '준비된 여행자',
      title: '고급',
      desc: '읽기·듣기 모두 아주 좋아요! 한자 보기·보조 끔으로 실전처럼 빠르게 진행해요.',
    };
  }
  if (avg >= 0.65) {
    return {
      mode: 'express', markKana: true,
      profile: '든든한 여행자',
      title: '중급',
      desc: '기본기가 탄탄해요! 가나는 익힌 것으로 두고, 일본어(가나) 보기·장면 위주로 달려요.',
    };
  }
  if (avg >= 0.4) {
    return {
      mode: 'default', markKana: false,
      profile: '균형 잡힌 여행자',
      title: '기본',
      desc: '읽기·듣기를 고르게 키워요. 모르는 가나만 보조하며 장면 학습을 균형 있게 진행해요.',
    };
  }
  return {
    mode: 'beginner', markKana: false,
    profile: '설레는 첫 여행자',
    title: '입문',
    desc: '처음이라도 괜찮아요! 가나와 기초 표현부터 천천히 — 발음 보조 항상, 일본어+한글 보기로 시작해요.',
  };
}

export function Placement({ cards, onDone, onSkip }: Props) {
  const [idx, setIdx] = useState(0);
  // 스킬별 분리 채점 — 단일 점수가 아니라 읽기/듣기 각각
  const [hits, setHits] = useState<Record<SkillAxis, { ok: number; total: number }>>({
    read: { ok: 0, total: 0 }, listen: { ok: 0, total: 0 },
  });
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(cards.length === 0);
  const card = cards[idx];

  // 듣기 문항은 화면에 뜨면 소리가 바로 나오게(진단도 본 세션과 동일 경험).
  useEffect(() => {
    if (done) return;
    const c = cards[idx];
    if (c?.kind === 'quiz' && c.listen && c.bannerJa) {
      const t = window.setTimeout(() => speak(c.bannerJa!), 200);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done]);

  function pick(i: number, c: Choice) {
    if (picked !== null || !card) return;
    setPicked(i);
    const ok = c.correct && !c.recovery;
    const axis = axisOf(card);
    setHits((h) => ({ ...h, [axis]: { ok: h[axis].ok + (ok ? 1 : 0), total: h[axis].total + 1 } }));
    if (c.ja) speak(c.ja);
    window.setTimeout(() => {
      setPicked(null);
      if (idx + 1 >= cards.length) setDone(true); else setIdx((n) => n + 1);
    }, 650);
  }

  if (done) {
    const pct = (a: SkillAxis) => (hits[a].total ? hits[a].ok / hits[a].total : 0);
    const read = pct('read'), listen = pct('listen');
    const r = recommend(read, listen);
    const totalOk = hits.read.ok + hits.listen.ok;
    const totalN = hits.read.total + hits.listen.total;

    function apply() {
      saveSkillProfile({ read, listen, at: new Date().toISOString() });
      onDone(r.mode, r.markKana, r.readingAid ? { readingAid: r.readingAid } : undefined);
    }

    return (
      <main style={WRAP}>
        <div className="ym-rise" style={{ textAlign: 'center', paddingTop: 24 }}>
          <div className="ym-burst" style={{ width: 76, height: 76, margin: '0 auto', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chart" size={36} />
          </div>
          <h1 style={{ margin: '16px 0 0', fontSize: 24 }}>진단 결과</h1>
          <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>{r.profile}</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-faint)', fontWeight: 700 }}>{totalOk} / {totalN} 정답</p>

          {/* 스킬별 점수 바 — 어디가 강하고 약한지 한눈에 */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
            <SkillBar label="읽기 (가나)" icon="kana" pct={read} n={hits.read.total} />
            <SkillBar label="듣기 (표현)" icon="listen" pct={listen} n={hits.listen.total} />
          </div>

          <div style={{ marginTop: 16, padding: 18, borderRadius: 18, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', textAlign: 'left' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.05em' }}>추천 시작 난이도</p>
            <p style={{ margin: '6px 0 0', fontSize: 19, fontWeight: 800 }}>{r.title}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{r.desc}</p>
          </div>
        </div>
        <div className="ym-rise" style={{ animationDelay: '.08s', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryAction onClick={apply}><Icon name="check" size={18} /> 이 난이도로 시작</PrimaryAction>
          <button className="ym-press" onClick={onSkip} style={ghostBtn}>나중에 / 직접 고르기</button>
          <p style={{ fontSize: 12, color: 'var(--ink-faint)', textAlign: 'center', margin: '2px 0 0' }}>난이도는 설정에서 언제든 바꿀 수 있어요.</p>
        </div>
      </main>
    );
  }

  if (!card || card.kind !== 'quiz') return <main style={WRAP}><p style={{ textAlign: 'center', marginTop: 40, color: 'var(--ink-soft)' }}>진단 문항을 준비하고 있어요.</p></main>;
  const promptBig = card.tag.startsWith('K') || /^kana:/.test(card.id);

  return (
    <main style={WRAP}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={onSkip} className="ym-press" style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, cursor: 'pointer', padding: 4 }}>건너뛰기</button>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {cards.length}</span>
      </div>
      <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>수준 진단 · {card.sub || '맞는 답을 골라요'}</p>

      <div style={{ textAlign: 'center', padding: '26px 16px', marginTop: 12, borderRadius: 20, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)' }}>
        {card.listen ? (
          <button className="ym-press" onClick={() => card.bannerJa && speak(card.bannerJa)} disabled={!ttsSupported()}
            style={{ width: 80, height: 80, borderRadius: 99, border: '1px solid var(--glass-border)', background: 'var(--accent-soft)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="listen" size={38} />
          </button>
        ) : (
          <div lang="ja" style={{ fontSize: promptBig ? 60 : 28, fontWeight: 900, lineHeight: 1.15, color: 'var(--ink)' }}>{card.bannerJa || card.banner}</div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
        {card.choices.map((c, i) => {
          const reveal = picked !== null;
          const right = c.correct && !c.recovery;
          let border = 'var(--glass-border)', bg = 'var(--glass-bg-strong)', color = 'var(--ink)';
          if (reveal && right) { border = 'var(--ok)'; bg = 'var(--ok-soft)'; color = 'var(--ok)'; }
          else if (reveal && picked === i && !right) { border = 'var(--accent)'; bg = 'var(--accent-soft)'; color = 'var(--accent)'; }
          return (
            <button key={i} className="ym-press" onClick={() => pick(i, c)} disabled={picked !== null}
              style={{ padding: '16px 12px', borderRadius: 16, border: `1.5px solid ${border}`, background: bg, color, fontSize: 16, fontWeight: 750, cursor: picked === null ? 'pointer' : 'default', minHeight: 58 }}>
              {c.label}
            </button>
          );
        })}
      </div>
    </main>
  );
}

// 스킬 점수 바 — 읽기/듣기 강·약을 시각화
function SkillBar({ label, icon, pct, n }: { label: string; icon: React.ComponentProps<typeof Icon>['name']; pct: number; n: number }) {
  const color = pct >= 0.7 ? 'var(--ok)' : pct >= 0.4 ? 'var(--warn)' : 'var(--accent)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 30, height: 30, flex: '0 0 30px', borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', color }}>
        <Icon name={icon} size={16} />
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 750, color: 'var(--ink-soft)' }}>
          <span>{label}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(pct * 100)}%{n ? '' : ' (미응시)'}</span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'var(--glass-border)', overflow: 'hidden', marginTop: 4 }}>
          <div style={{ width: `${Math.round(pct * 100)}%`, height: '100%', borderRadius: 99, background: color, transition: 'width .5s cubic-bezier(.2,.8,.2,1)' }} />
        </div>
      </div>
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 15, cursor: 'pointer',
};
