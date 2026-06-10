// 설정 — 글래스 하단 시트. 학습 모드·발음 보조·듣기 속도·자동 진행·초기화.
import type { CSSProperties } from 'react';
import { MODE_PRESETS, type ChoiceMode, type LearnMode, type ReadingAidMode, type Settings } from '../learn/settings';
import { Modal } from './Modal';
import { Icon } from '../ui/Icon';

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  onSelectMode: (m: LearnMode) => void;
  onMarkKanaKnown: () => void;
  onReset: () => void;
  onClose: () => void;
}

const AID_OPTIONS: { v: ReadingAidMode; label: string }[] = [
  { v: 'auto', label: '자동' },
  { v: 'always', label: '항상' },
  { v: 'off', label: '끄기' },
];
const MODE_ORDER: LearnMode[] = ['beginner', 'default', 'express', 'review', 'kana'];
const CHOICE_OPTIONS: { v: ChoiceMode; label: string }[] = [
  { v: 'kana_ko', label: '일본어+한글' },
  { v: 'kana', label: '일본어만' },
  { v: 'kanji', label: '한자' },
];

const gbtn: CSSProperties = { borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', cursor: 'pointer', fontWeight: 600, fontSize: 14, padding: '12px 14px', textAlign: 'left' };
const head: CSSProperties = { margin: '0 0 8px', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 };
const toggle = (on: boolean): CSSProperties => ({ ...gbtn, padding: '8px 16px', borderRadius: 999, background: on ? 'var(--accent)' : 'var(--glass-bg-strong)', color: on ? 'var(--accent-ink)' : 'var(--ink-soft)', border: `1px solid ${on ? 'var(--ink)' : 'var(--glass-border)'}` });

export function SettingsModal({ settings, onChange, onSelectMode, onMarkKanaKnown, onReset, onClose }: Props) {
  const seg = (active: boolean): CSSProperties => ({
    ...gbtn, flex: 1, textAlign: 'center', fontSize: 13, padding: '9px 6px',
    background: active ? 'var(--accent)' : 'var(--glass-bg-strong)', color: active ? 'var(--accent-ink)' : 'var(--ink-soft)',
    border: `1px solid ${active ? 'var(--ink)' : 'var(--glass-border)'}`,
  });
  return (
    <Modal title="설정" onClose={onClose}>
      <p style={head}><Icon name="mode" size={16} /> 학습 모드</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {MODE_ORDER.map((m) => {
          const p = MODE_PRESETS[m];
          const active = settings.mode === m;
          return (
            <button key={m} className="ym-press" onClick={() => onSelectMode(m)}
              style={{ ...gbtn, padding: '11px 13px', background: active ? 'var(--accent-soft)' : 'var(--glass-bg-strong)', border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}` }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: active ? 'var(--accent)' : 'var(--ink)' }}>{active ? '✓ ' : ''}{p.label}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>{p.desc}</div>
            </button>
          );
        })}
      </div>

      <p style={{ ...head, marginTop: 18 }}><Icon name="discover" size={16} /> 발음 보조 (로마자)</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {AID_OPTIONS.map((o) => (
          <button key={o.v} className="ym-press" style={seg(settings.readingAid === o.v)} onClick={() => onChange({ ...settings, readingAid: o.v })}>{o.label}</button>
        ))}
      </div>

      <p style={{ ...head, marginTop: 18 }}><Icon name="listen" size={16} /> 퀴즈 보기 표시</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {CHOICE_OPTIONS.map((o) => (
          <button key={o.v} className="ym-press" style={seg(settings.choiceMode === o.v)} onClick={() => onChange({ ...settings, choiceMode: o.v })}>{o.label}</button>
        ))}
      </div>
      <p style={{ margin: '6px 2px 0', fontSize: 11.5, color: 'var(--ink-faint)' }}>난이도가 오를수록 한글을 떼고(일본어만), 최고 난이도는 한자로 — 가나 퀴즈는 그대로예요.</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
        <span style={head}><Icon name="listen" size={16} /> 듣기 느리게 재생</span>
        <button className="ym-press" style={toggle(settings.slowListening)} onClick={() => onChange({ ...settings, slowListening: !settings.slowListening })}>{settings.slowListening ? '켜짐' : '꺼짐'}</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <span style={head}><Icon name="fast" size={16} /> 정답이면 자동으로 다음</span>
        <button className="ym-press" style={toggle(settings.fastForward)} onClick={() => onChange({ ...settings, fastForward: !settings.fastForward })}>{settings.fastForward ? '켜짐' : '꺼짐'}</button>
      </div>

      <button className="ym-press" style={{ ...gbtn, width: '100%', marginTop: 18, textAlign: 'center' }}
        onClick={() => { if (confirm('히라가나·가타카나를 모두 안다고 표시할까요? (가나 드릴을 건너뛰고 발음 보조도 꺼집니다)')) { onMarkKanaKnown(); onClose(); } }}>
        가나는 이미 알아요 (건너뛰기)
      </button>
      <button className="ym-press" style={{ ...gbtn, width: '100%', marginTop: 10, textAlign: 'center', color: 'var(--accent)' }}
        onClick={() => { if (confirm('진척을 모두 지울까요? (가나·표현·세션 기록 초기화)')) { onReset(); onClose(); } }}>
        진척 모두 초기화
      </button>
    </Modal>
  );
}
