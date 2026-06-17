// 동사 형태 메뉴 — ます형·～ながら·～たい를 여행 빈출 동사로 학습(보기 + 듣기).
import { useState } from 'react';
import { VERB_FORMS, VERB_FORM_INFO, VERB_FORM_KEYS, type VerbEntry, type VerbFormKey } from '../content/verbForms';
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

export function VerbForms({ onExit }: { onExit: () => void }) {
  const [focus, setFocus] = useState<Focus>('all');
  const keys: VerbFormKey[] = focus === 'all' ? [...VERB_FORM_KEYS] : [focus];

  return (
    <main style={WRAP}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={onExit} className="ym-press" style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, cursor: 'pointer', padding: 4 }}>← 그만</button>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)' }}>동사 {VERB_FORMS.length}개</span>
      </div>

      <h1 style={{ margin: '10px 0 2px', fontSize: 24 }}>동사 형태</h1>
      <p style={{ margin: '0 0 14px', color: 'var(--ink-soft)', fontSize: 13, fontWeight: 600 }}>여행 빈출 동사를 정중형·동시동작·희망표현으로</p>

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

      <PrimaryAction onClick={onExit} style={{ marginTop: 20 }}>홈으로</PrimaryAction>
    </main>
  );
}
