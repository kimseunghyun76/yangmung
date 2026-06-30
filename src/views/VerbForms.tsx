// 동사 형태 메뉴 — ます형·～ながら·～たい. 보기(레퍼런스) + 연습(퀴즈) 두 모드.
import { useState } from 'react';
import { VERB_FORMS, VERB_FORM_INFO, VERB_FORM_KEYS, type VerbConj, type VerbEntry, type VerbFormKey } from '../content/verbForms';
import { itemMastery, type ProgressMap } from '../learn/progress';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { PrimaryAction } from './shell';

type Focus = 'all' | VerbFormKey;
const FOCUS_TABS: { v: Focus; label: string }[] = [
  { v: 'all', label: '전체' },
  { v: 'masu', label: 'ます형' },
  { v: 'nagara', label: '～ながら' },
  { v: 'tai', label: '～たい' },
];
const GROUP_LABEL: Record<VerbEntry['group'], string> = { godan: '5단', ichidan: '1단', irregular: '불규칙' };

const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const rand = (n: number) => Math.floor(Math.random() * n);

export function VerbForms({ onExit, progress, onAnswer }: {
  onExit: () => void;
  progress?: ProgressMap;
  onAnswer?: (id: string, correct: boolean) => void;
}) {
  const [mode, setMode] = useState<'browse' | 'quiz'>('browse');

  return (
    <main style={WRAP}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={onExit} className="ym-press" style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, cursor: 'pointer', padding: 4 }}>← 그만</button>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)' }}>동사 {VERB_FORMS.length}개</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '10px 0 2px' }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>동사 형태</h1>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 850, background: 'var(--warn-soft)', color: 'var(--warn)', border: '1px solid var(--warn)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--warn)' }} />난이도 중급
        </span>
      </div>
      <p style={{ margin: '0 0 14px', color: 'var(--ink-soft)', fontSize: 13, fontWeight: 600 }}>여행 빈출 동사를 정중형·동시동작·희망표현으로</p>

      <div style={{ overflow: 'hidden', width: '100%', aspectRatio: '4 / 3', marginBottom: 16, borderRadius: 18, background: 'var(--surface-2)', border: '1px solid var(--glass-border)' }}>
        <img src="/scenes/quick-practice/verbs.webp" alt="" aria-hidden style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>

      {/* 모드 전환 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['browse', 'quiz'] as const).map((m) => {
          const on = mode === m;
          return (
            <button key={m} className="ym-press" onClick={() => setMode(m)}
              style={{ flex: 1, padding: '11px 4px', borderRadius: 12, border: `1px solid ${on ? 'transparent' : 'var(--glass-border)'}`, background: on ? 'var(--accent)' : 'var(--glass-bg-strong)', color: on ? 'var(--accent-ink)' : 'var(--ink-soft)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
              {m === 'browse' ? '보기' : '연습'}
            </button>
          );
        })}
      </div>

      {mode === 'browse' ? <Browse /> : <Quiz progress={progress} onAnswer={onAnswer} />}

      <PrimaryAction onClick={onExit} style={{ marginTop: 20 }}>홈으로</PrimaryAction>
    </main>
  );
}

function Browse() {
  const [focus, setFocus] = useState<Focus>('all');
  const keys: VerbFormKey[] = focus === 'all' ? [...VERB_FORM_KEYS] : [focus];
  return (
    <>
      {/* 형태 설명 */}
      <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
        {VERB_FORM_KEYS.map((k) => (
          <div key={k} style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)' }}>
            <span lang="ja" style={{ fontWeight: 900, color: 'var(--accent)' }}>{VERB_FORM_INFO[k].label}</span>
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 800, color: 'var(--ink-faint)' }}>{VERB_FORM_INFO[k].sub}</span>
            <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.45 }}>{VERB_FORM_INFO[k].desc}</p>
          </div>
        ))}
      </div>

      {/* 형태 필터 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {FOCUS_TABS.map((t) => {
          const on = focus === t.v;
          return (
            <button key={t.v} className="ym-press" onClick={() => setFocus(t.v)}
              style={{ flex: 1, padding: '9px 4px', borderRadius: 12, border: `1px solid ${on ? 'transparent' : 'var(--glass-border)'}`, background: on ? 'var(--accent)' : 'var(--glass-bg-strong)', color: on ? 'var(--accent-ink)' : 'var(--ink-soft)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }} lang="ja">
              {t.label}
            </button>
          );
        })}
      </div>

      {/* 동사 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {VERB_FORMS.map((v) => (
          <div key={v.id} style={{ padding: 14, borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
                <span lang="ja" style={{ fontSize: 20, fontWeight: 800 }}>{v.dict.ja}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 700 }}>{v.ko}</span>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-faint)', border: '1px solid var(--glass-border)', borderRadius: 999, padding: '2px 7px', flex: '0 0 auto' }}>{GROUP_LABEL[v.group]}</span>
            </div>
            <div style={{ display: 'grid', gap: 7, marginTop: 10 }}>
              {keys.map((k) => {
                const f = v[k];
                return (
                  <button key={k} className="ym-press" onClick={() => speak(f.kana)} disabled={!ttsSupported()}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '9px 11px', borderRadius: 11, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink)', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--accent)' }} lang="ja">{VERB_FORM_INFO[k].label}</span>
                      <span lang="ja" style={{ display: 'block', fontSize: 16, fontWeight: 700, marginTop: 1 }}>{f.ja}</span>
                      <span style={{ display: 'block', fontSize: 11.5, color: 'var(--ink-faint)' }} lang="ja">{f.kana}</span>
                    </span>
                    <Icon name="listen" size={17} style={{ color: 'var(--accent)', flex: '0 0 auto' }} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

interface Question { verb: VerbEntry; formKey: VerbFormKey; choices: VerbConj[]; answer: VerbConj }

const verbCardId = (verbId: string, formKey: VerbFormKey) => `verb:${verbId}:${formKey}`;

function makeQuestion(progress?: ProgressMap): Question {
  let verb = VERB_FORMS[rand(VERB_FORMS.length)];
  let formKey = VERB_FORM_KEYS[rand(VERB_FORM_KEYS.length)];
  if (progress) {
    // SRS 연동 — (동사×형태) 조합 중 약한(숙련도 낮은) 것 우선, 가장 약한 8개에서 무작위.
    const combos = VERB_FORMS.flatMap((v) => VERB_FORM_KEYS.map((k) => ({ v, k, m: itemMastery(progress[verbCardId(v.id, k)]) })));
    combos.sort((a, b) => a.m - b.m);
    const pick = combos[rand(Math.min(8, combos.length))];
    verb = pick.v; formKey = pick.k;
  }
  const answer = verb[formKey];
  const pool: VerbConj[] = [];
  for (const k of VERB_FORM_KEYS) if (k !== formKey) pool.push(verb[k]); // 같은 동사 다른 형태
  for (const v of shuffle(VERB_FORMS)) if (v.id !== verb.id) pool.push(v[formKey]); // 다른 동사 같은 형태
  const seen = new Set([answer.ja]);
  const distractors: VerbConj[] = [];
  for (const c of pool) { if (distractors.length >= 3) break; if (!seen.has(c.ja)) { seen.add(c.ja); distractors.push(c); } }
  return { verb, formKey, choices: shuffle([answer, ...distractors]), answer };
}

function Quiz({ progress, onAnswer }: { progress?: ProgressMap; onAnswer?: (id: string, correct: boolean) => void }) {
  const [q, setQ] = useState<Question>(() => makeQuestion(progress));
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const info = VERB_FORM_INFO[q.formKey];
  const reveal = picked !== null;

  function choose(c: VerbConj) {
    if (reveal) return;
    const correct = c.ja === q.answer.ja;
    setPicked(c.ja);
    setScore((s) => ({ ok: s.ok + (correct ? 1 : 0), total: s.total + 1 }));
    onAnswer?.(verbCardId(q.verb.id, q.formKey), correct);
  }
  function next() { setPicked(null); setQ(makeQuestion(progress)); }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{score.ok} / {score.total}</span>
      </div>

      {/* 문제 */}
      <div style={{ padding: 18, borderRadius: 18, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', textAlign: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)' }} lang="ja">{info.label} <span style={{ color: 'var(--ink-faint)' }}>{info.sub}</span></span>
        <p style={{ margin: '8px 0 0' }}>
          <span lang="ja" style={{ fontSize: 26, fontWeight: 800 }}>{q.verb.dict.ja}</span>
          <span style={{ fontSize: 15, color: 'var(--ink-soft)', fontWeight: 700, marginLeft: 8 }}>{q.verb.ko}</span>
        </p>
        <p style={{ margin: '4px 0 0', color: 'var(--ink-faint)', fontSize: 13 }} lang="ja">{q.verb.dict.kana}</p>
        <button className="ym-press" onClick={() => speak(q.verb.dict.kana)} disabled={!ttsSupported()}
          style={{ marginTop: 8, padding: '6px 14px', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--accent)', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="listen" size={15} /> 기본형 듣기
        </button>
        <p style={{ margin: '12px 0 0', fontSize: 14, fontWeight: 700, color: 'var(--ink-soft)' }}>이 동사의 <strong lang="ja" style={{ color: 'var(--accent)' }}>{info.label}</strong>형은?</p>
      </div>

      {/* 보기 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
        {q.choices.map((c) => {
          const isAnswer = c.ja === q.answer.ja;
          const isPicked = c.ja === picked;
          const bg = !reveal ? 'var(--glass-bg-strong)' : isAnswer ? 'var(--ok-soft)' : isPicked ? 'var(--accent-soft)' : 'var(--glass-bg)';
          const bd = !reveal ? 'var(--glass-border)' : isAnswer ? 'var(--ok)' : isPicked ? 'var(--accent)' : 'var(--glass-border)';
          return (
            <button key={c.ja} className="ym-press" disabled={reveal} onClick={() => choose(c)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 14px', borderRadius: 14, border: `1px solid ${bd}`, background: bg, color: 'var(--ink)', cursor: reveal ? 'default' : 'pointer', textAlign: 'left' }}>
              <span style={{ minWidth: 0 }}>
                <span lang="ja" style={{ display: 'block', fontSize: 17, fontWeight: 700 }}>{c.ja}</span>
                <span lang="ja" style={{ display: 'block', fontSize: 12, color: 'var(--ink-faint)' }}>{c.kana}</span>
              </span>
              {reveal && isAnswer && <Icon name="check" size={18} style={{ color: 'var(--ok)', flex: '0 0 auto' }} />}
            </button>
          );
        })}
      </div>

      {reveal && (
        <div className="ym-reveal" style={{ marginTop: 12 }}>
          <p style={{ margin: 0, padding: 12, borderRadius: 12, fontWeight: 800, textAlign: 'center', background: picked === q.answer.ja ? 'var(--ok-soft)' : 'var(--warn-soft)', color: picked === q.answer.ja ? 'var(--ok)' : 'var(--warn)' }}>
            {picked === q.answer.ja ? '정답!' : '아쉬워요'} <span lang="ja" style={{ fontWeight: 900 }}>{q.answer.ja}</span> <span style={{ fontWeight: 600 }}>({q.verb.ko} — {info.sub})</span>
          </p>
          <PrimaryAction onClick={next} style={{ marginTop: 10 }}>다음 문제</PrimaryAction>
        </div>
      )}
    </div>
  );
}
