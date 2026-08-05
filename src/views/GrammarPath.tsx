// 문법 학습 — "문장의 핵심(문법)부터 배우고, 점차 완성된 문장·응용 문장으로 확장하고 싶다"는
// 사용자 요청으로 신설. 기존 세션은 장면(미션) 중심이라 문법은 사이사이 짧은 팁으로만 스쳐갔는데,
// 이 화면은 반대로 문법 규칙을 먼저 보여준 뒤, 그 문법을 실제로 쓰는 표현들을(phrases.grammarRefs로
// 이미 연결돼 있던 것) 짧은 문장 → 긴 문장 순으로 늘어놓아 "핵심 → 확장 → 응용" 흐름을 만든다.
// 새 문장을 짓지 않고 기존 grammar.ts·phrases.ts 데이터만 재구성한다.
//
// 2026-08-01 개편: 처음엔 전 단계가 항상 다 열려 있는 자유 열람 목록이었는데, "학습 전체가
// 순차적으로 이어지게 구성해달라"는 요청으로 학습 지도(Practice)의 레벨 잠금과 같은 방식을
// 그대로 가져왔다 — 문법 단계(1~5)를 레벨(입문~고급)에 대응시켜, 지금 레벨에서 아직 안 열린
// 단계는 미션 지도의 잠금 그리드처럼 압축 표시하고, 열린 단계 안에서는 본 것/다음 것을 배지로
// 표시한다. 이렇게 하면 문법 학습도 "학습 지도 → 문법 학습 → 미션 지도"가 같은 하나의 레벨
// 진행을 공유하는 것처럼 느껴진다(각자 따로 노는 별도 메뉴가 아니라).
import { useMemo, useState } from 'react';
import { CONTENT } from '../content';
import { grammarLevel } from '../content/grammar';
import type { GrammarPoint, Phrase } from '../content/types';
import { CORE_LEVELS, CORE_LEVEL_LABEL, LEVEL_STAGES, stageKey, type CoreLevel } from '../learn/progression';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { GlassPanel } from './shell';
import { Modal } from './Modal';
import { Furigana } from './Furigana';

interface Props {
  nav: NavBarProps;
  coreLevel: CoreLevel;
  devUnlockAll: boolean;
  onBack: () => void;
  // 학습 지도의 "문법" 단계(progression.ts LEVEL_STAGES)와 완료 상태를 공유한다 — 이 단계가
  // 다루는 문법(grammarTiers)을 전부 한 번씩 보면 다른 단계처럼 완료 처리되어 다음 단계가 열린다.
  onStagePass: (key: string) => void;
}

type Tier = 1 | 2 | 3 | 4 | 5;

const TIER_LABEL: Record<Tier, string> = {
  1: '기초', 2: '기본', 3: '실전', 4: '응용', 5: '심화',
};
// 문법 난이도(1~5)를 학습 지도의 레벨(입문~고급)에 대응 — 같은 하나의 레벨 사다리를 공유한다.
const TIER_REQUIRES: Record<Tier, CoreLevel> = {
  1: 'beginner', 2: 'default', 3: 'express', 4: 'advanced', 5: 'advanced',
};

const label: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase',
};

const SEEN_KEY = 'yangmung:grammarSeen:v1';
function loadSeen(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch { return new Set(); }
}
function saveSeen(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(SEEN_KEY, JSON.stringify([...ids])); } catch { /* noop */ }
}

// 이 문법을 실제로 쓰는 표현들 — 이미 있는 phrases.grammarRefs 연결을 그대로 쓴다(신규 문장 없음).
// 길이(가나 기준)로 정렬해 "짧고 단순한 문장 → 길고 복잡한 문장" 순서를 만든다.
function relatedPhrases(g: GrammarPoint): Phrase[] {
  return CONTENT.phrases
    .filter((p) => p.grammarRefs?.includes(g.id))
    .sort((a, b) => a.kana.length - b.kana.length);
}

export function GrammarPath({ nav, coreLevel, devUnlockAll, onBack, onStagePass }: Props) {
  const [selected, setSelected] = useState<GrammarPoint | null>(null);
  const [seen, setSeen] = useState(() => loadSeen());
  const items = useMemo(() => CONTENT.grammar.filter((g) => g.category === '문법'), []);
  const byTier = useMemo(() => {
    const m = new Map<Tier, GrammarPoint[]>();
    for (const g of items) {
      const t = grammarLevel(g) as Tier;
      const arr = m.get(t);
      if (arr) arr.push(g); else m.set(t, [g]);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [items]);
  const myRank = CORE_LEVELS.indexOf(coreLevel);
  const unlockedAt = (tier: Tier) => devUnlockAll || CORE_LEVELS.indexOf(TIER_REQUIRES[tier]) <= myRank;
  // 열린 단계 중에서 아직 안 본 첫 항목 하나에만 "다음" 배지를 준다(학습 지도 StageTile과 동일 규칙).
  const nextId = useMemo(() => {
    for (const [tier, group] of byTier) {
      if (!(devUnlockAll || CORE_LEVELS.indexOf(TIER_REQUIRES[tier]) <= myRank)) continue;
      const next = group.find((g) => !seen.has(g.id));
      if (next) return next.id;
    }
    return undefined;
  }, [byTier, seen, myRank, devUnlockAll]);

  // 이 문법(tier)을 담당하는 학습 지도 단계를 찾아, 그 단계가 다루는 문법을 전부 봤으면
  // 다른 단계(퀴즈 점수 통과)와 똑같이 완료 처리한다 — 두 화면이 같은 진도 하나를 공유한다.
  function checkStagePass(tier: Tier, seenNow: Set<string>) {
    const level = TIER_REQUIRES[tier];
    const stage = LEVEL_STAGES[level].find((st) => st.practice === 'grammar' && st.grammarTiers?.includes(tier));
    if (!stage) return;
    const tierIds = items.filter((g) => stage.grammarTiers!.includes(grammarLevel(g))).map((g) => g.id);
    if (tierIds.length > 0 && tierIds.every((id) => seenNow.has(id))) {
      onStagePass(stageKey(level, stage.id));
    }
  }

  function select(g: GrammarPoint) {
    setSelected(g);
    setSeen((prev) => {
      if (prev.has(g.id)) return prev;
      const next = new Set(prev).add(g.id);
      saveSeen(next);
      checkStagePass(grammarLevel(g) as Tier, next);
      return next;
    });
  }

  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '4px 0', marginBottom: 12,
      }}>← 뒤로</button>

      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, ...label }}>문법 학습</p>
        <h1 style={{ margin: '8px 0 4px', fontSize: 25, fontWeight: 900, letterSpacing: '-0.03em' }}>핵심 문형부터 차근차근</h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          문법 규칙을 먼저 보고, 그 규칙을 쓰는 문장을 짧은 것부터 긴 것까지 순서대로 익혀요.
          학습 지도와 같은 레벨 순서로 열려요.
        </p>
      </div>

      {byTier.map(([tier, group]) => {
        const unlocked = unlockedAt(tier);
        if (!unlocked) {
          return (
            <section key={tier} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ ...label, margin: 0 }}>{TIER_LABEL[tier]}</p>
                <span style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 850 }}>잠김 · {group.length}개</span>
              </div>
              <GlassPanel style={{ padding: 12 }}>
                <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '0 0 10px', fontWeight: 700 }}>
                  {CORE_LEVEL_LABEL[TIER_REQUIRES[tier]]} 레벨로 승급하면 열려요.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8 }}>
                  {group.map((g) => (
                    <div key={g.id} aria-hidden style={{ aspectRatio: '1', borderRadius: 10, border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-faint)', opacity: 0.6 }}><Icon name="lock" size={13} /></div>
                  ))}
                </div>
              </GlassPanel>
            </section>
          );
        }
        return (
          <section key={tier} style={{ marginBottom: 18 }}>
            <p style={{ ...label, marginBottom: 10 }}>{TIER_LABEL[tier]} · {group.length}개</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.map((g) => {
                const related = relatedPhrases(g);
                const done = seen.has(g.id);
                const isNext = g.id === nextId;
                return (
                  <button key={g.id} className="ym-press" onClick={() => select(g)} style={{
                    width: '100%', textAlign: 'left', padding: '13px 14px', borderRadius: 14, cursor: 'pointer',
                    border: isNext ? '1.5px solid var(--accent)' : '1px solid var(--glass-border)',
                    background: 'var(--glass-bg-strong)', color: 'var(--ink)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 14.5 }}>{g.label}</strong>
                        {done && <span style={{ padding: '2px 7px', borderRadius: 999, background: 'var(--ok-soft)', color: 'var(--ok)', fontSize: 10.5, fontWeight: 900 }}>완료 ✓</span>}
                        {!done && isNext && <span style={{ padding: '2px 7px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 10.5, fontWeight: 900 }}>다음</span>}
                      </span>
                      <span style={{ display: 'block', marginTop: 3, fontSize: 12.5, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.tipKo}</span>
                      {related.length > 0 && (
                        <span style={{ display: 'block', marginTop: 5, fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700 }}>확장 문장 {related.length}개</span>
                      )}
                    </span>
                    <Icon name="chevron" size={14} style={{ color: 'var(--ink-faint)', flex: '0 0 auto' }} />
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {selected && <GrammarDetailModal g={selected} related={relatedPhrases(selected)} onClose={() => setSelected(null)} />}
    </main>
  );
}

function SpeakLine({ kanji, kana, korean }: { kanji?: string; kana: string; korean: string }) {
  return (
    <button className="ym-press" onClick={() => speak(kana)} disabled={!ttsSupported()} style={{
      width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--glass-border)',
      background: 'var(--glass-bg-strong)', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    }}>
      <span style={{ minWidth: 0 }}>
        <Furigana kanji={kanji} kana={kana} style={{ display: 'block', fontSize: 16, fontWeight: 700, lineHeight: 1.6 }} />
        <span lang="ko" style={{ display: 'block', marginTop: 2, fontSize: 12.5, color: 'var(--ink-soft)' }}>{korean}</span>
      </span>
      <Icon name="listen" size={16} style={{ color: 'var(--accent)', flex: '0 0 auto' }} />
    </button>
  );
}

function GrammarDetailModal({ g, related, onClose }: { g: GrammarPoint; related: Phrase[]; onClose: () => void }) {
  // 기본 예문(exampleJa)과 중복되는 표현은 "확장/응용"에서 뺀다(같은 문장이 두 번 나오지 않게).
  const compact = (s: string) => s.replace(/[\s。、,.!?！？()（）[\]{}·・/]/g, '');
  // 기본 예문은 한자 표기(exampleJa)라 phrase.kana와 직접 비교하면 절대 안 맞는다 —
  // 읽기(exampleKana)가 있으면 그걸 기준으로 비교해야 같은 문장이 두 번 나오지 않는다.
  const exampleReading = g.exampleKana ?? g.exampleJa;
  const extra = exampleReading ? related.filter((p) => compact(p.kana) !== compact(exampleReading)) : related;
  const expand = extra.slice(0, 2);
  const applied = extra.slice(2, 4);

  return (
    <Modal title={g.label} onClose={onClose}>
      <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.04em' }}>핵심 규칙</p>
      <p style={{ margin: '0 0 14px', fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink)' }}>{g.detail ?? g.tipKo}</p>

      {g.exampleJa && (
        <>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.04em' }}>기본 문장</p>
          <div style={{ marginBottom: 14 }}>
            <SpeakLine kanji={g.exampleKana ? g.exampleJa : undefined} kana={g.exampleKana ?? g.exampleJa} korean={g.exampleKo ?? ''} />
          </div>
        </>
      )}

      {expand.length > 0 && (
        <>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.04em' }}>확장 문장 — 조금 더 길게</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {expand.map((p) => <SpeakLine key={p.id} kanji={p.kanji} kana={p.displayKana ?? p.kana} korean={p.korean} />)}
          </div>
        </>
      )}

      {applied.length > 0 && (
        <>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.04em' }}>응용 문장 — 실전에서 이렇게도</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {applied.map((p) => <SpeakLine key={p.id} kanji={p.kanji} kana={p.displayKana ?? p.kana} korean={p.korean} />)}
          </div>
        </>
      )}

      {g.commonMistake && (
        <div style={{ marginTop: 4, marginBottom: 10, padding: 12, borderRadius: 12, background: 'var(--warn-soft)', border: '1px solid var(--warn)' }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 800, color: 'var(--warn)' }}>흔한 실수</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>{g.commonMistake}</p>
        </div>
      )}

      {g.action && (
        <div style={{ padding: 12, borderRadius: 12, background: 'var(--ok-soft)', border: '1px solid var(--ok)' }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 800, color: 'var(--ok)' }}>바로 해보기</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>{g.action}</p>
        </div>
      )}

      {!g.detail && !g.exampleJa && expand.length === 0 && (
        <GlassPanel><p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>{g.tipKo}</p></GlassPanel>
      )}
    </Modal>
  );
}
