// 문법 학습 — "문장의 핵심(문법)부터 배우고, 점차 완성된 문장·응용 문장으로 확장하고 싶다"는
// 사용자 요청으로 신설. 기존 세션은 장면(미션) 중심이라 문법은 사이사이 짧은 팁으로만 스쳐갔는데,
// 이 화면은 반대로 문법 규칙을 먼저 보여준 뒤, 그 문법을 실제로 쓰는 표현들을(phrases.grammarRefs로
// 이미 연결돼 있던 것) 짧은 문장 → 긴 문장 순으로 늘어놓아 "핵심 → 확장 → 응용" 흐름을 만든다.
// 새 문장을 짓지 않고 기존 grammar.ts·phrases.ts 데이터만 재구성한다.
import { useMemo, useState } from 'react';
import { CONTENT } from '../content';
import { grammarLevel } from '../content/grammar';
import type { GrammarPoint, Phrase } from '../content/types';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { GlassPanel } from './shell';
import { Modal } from './Modal';

interface Props {
  nav: NavBarProps;
  onBack: () => void;
}

const TIER_LABEL: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '기초', 2: '기본', 3: '실전', 4: '응용', 5: '심화',
};

const label: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase',
};

// 이 문법을 실제로 쓰는 표현들 — 이미 있는 phrases.grammarRefs 연결을 그대로 쓴다(신규 문장 없음).
// 길이(가나 기준)로 정렬해 "짧고 단순한 문장 → 길고 복잡한 문장" 순서를 만든다.
function relatedPhrases(g: GrammarPoint): Phrase[] {
  return CONTENT.phrases
    .filter((p) => p.grammarRefs?.includes(g.id))
    .sort((a, b) => a.kana.length - b.kana.length);
}

export function GrammarPath({ nav, onBack }: Props) {
  const [selected, setSelected] = useState<GrammarPoint | null>(null);
  const items = useMemo(() => CONTENT.grammar.filter((g) => g.category === '문법'), []);
  const byTier = useMemo(() => {
    const m = new Map<number, GrammarPoint[]>();
    for (const g of items) {
      const t = grammarLevel(g);
      const arr = m.get(t);
      if (arr) arr.push(g); else m.set(t, [g]);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [items]);

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
        </p>
      </div>

      {byTier.map(([tier, group]) => (
        <section key={tier} style={{ marginBottom: 18 }}>
          <p style={{ ...label, marginBottom: 10 }}>{TIER_LABEL[tier as 1 | 2 | 3 | 4 | 5] ?? `${tier}단계`} · {group.length}개</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {group.map((g) => {
              const related = relatedPhrases(g);
              return (
                <button key={g.id} className="ym-press" onClick={() => setSelected(g)} style={{
                  width: '100%', textAlign: 'left', padding: '13px 14px', borderRadius: 14, cursor: 'pointer',
                  border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: 14.5 }}>{g.label}</strong>
                    <span style={{ display: 'block', marginTop: 3, fontSize: 12.5, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.tipKo}</span>
                    {related.length > 0 && (
                      <span style={{ display: 'block', marginTop: 5, fontSize: 11, color: 'var(--ink-faint)', fontWeight: 700 }}>확장 문장 {related.length}개</span>
                    )}
                  </span>
                  <Icon name="flow" size={14} style={{ color: 'var(--ink-faint)', flex: '0 0 auto' }} />
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {selected && <GrammarDetailModal g={selected} related={relatedPhrases(selected)} onClose={() => setSelected(null)} />}
    </main>
  );
}

function SpeakLine({ ja, korean }: { ja: string; korean: string }) {
  return (
    <button className="ym-press" onClick={() => speak(ja)} disabled={!ttsSupported()} style={{
      width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--glass-border)',
      background: 'var(--glass-bg-strong)', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    }}>
      <span style={{ minWidth: 0 }}>
        <strong lang="ja" style={{ display: 'block', fontSize: 16 }}>{ja}</strong>
        <span style={{ display: 'block', marginTop: 2, fontSize: 12.5, color: 'var(--ink-soft)' }}>{korean}</span>
      </span>
      <Icon name="listen" size={16} style={{ color: 'var(--accent)', flex: '0 0 auto' }} />
    </button>
  );
}

function GrammarDetailModal({ g, related, onClose }: { g: GrammarPoint; related: Phrase[]; onClose: () => void }) {
  // 기본 예문(exampleJa)과 중복되는 표현은 "확장/응용"에서 뺀다(같은 문장이 두 번 나오지 않게).
  const compact = (s: string) => s.replace(/[\s。、,.!?！？()（）[\]{}·・/]/g, '');
  const extra = g.exampleJa ? related.filter((p) => compact(p.kana) !== compact(g.exampleJa!)) : related;
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
            <SpeakLine ja={g.exampleJa} korean={g.exampleKo ?? ''} />
          </div>
        </>
      )}

      {expand.length > 0 && (
        <>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.04em' }}>확장 문장 — 조금 더 길게</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {expand.map((p) => <SpeakLine key={p.id} ja={p.kanji ?? p.displayKana ?? p.kana} korean={p.korean} />)}
          </div>
        </>
      )}

      {applied.length > 0 && (
        <>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.04em' }}>응용 문장 — 실전에서 이렇게도</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {applied.map((p) => <SpeakLine key={p.id} ja={p.kanji ?? p.displayKana ?? p.kana} korean={p.korean} />)}
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
