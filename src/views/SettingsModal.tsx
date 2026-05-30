// 설정 팝업 — 발음 보조 모드·자동 재생·진척 초기화.
import { MODE_PRESETS, type LearnMode, type ReadingAidMode, type Settings } from '../learn/settings';
import { Modal } from './Modal';
import { BTN } from '../ui/styles';

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  onSelectMode: (m: LearnMode) => void;
  onReset: () => void;
  onClose: () => void;
}

const AID_OPTIONS: { v: ReadingAidMode; label: string }[] = [
  { v: 'auto', label: '자동 (익히면 사라짐)' },
  { v: 'always', label: '항상 보기' },
  { v: 'off', label: '끄기' },
];
const MODE_ORDER: LearnMode[] = ['beginner', 'default', 'express', 'review'];

export function SettingsModal({ settings, onChange, onSelectMode, onReset, onClose }: Props) {
  const seg = (active: boolean): React.CSSProperties => ({
    ...BTN, flex: 1, textAlign: 'center', fontSize: 13, padding: '8px 6px',
    background: active ? '#4f46e5' : '#fff', color: active ? '#fff' : '#444',
  });
  return (
    <Modal title="⚙️ 설정" onClose={onClose}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 14 }}>🎚 학습 모드</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {MODE_ORDER.map((m) => {
          const p = MODE_PRESETS[m];
          const active = settings.mode === m;
          return (
            <button
              key={m}
              onClick={() => onSelectMode(m)}
              style={{ ...BTN, textAlign: 'left', padding: '10px 12px', background: active ? '#eef2ff' : '#fff', borderColor: active ? '#4f46e5' : '#d0d0d8' }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: active ? '#4f46e5' : '#333' }}>{active ? '✓ ' : ''}{p.label}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{p.desc}</div>
            </button>
          );
        })}
      </div>

      <p style={{ margin: '18px 0 6px', fontWeight: 700, fontSize: 14 }}>👀 발음 보조 (로마자)</p>
      <div style={{ display: 'flex', gap: 8 }}>
        {AID_OPTIONS.map((o) => (
          <button key={o.v} style={seg(settings.readingAid === o.v)} onClick={() => onChange({ ...settings, readingAid: o.v })}>
            {o.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>🔊 자동 음성 재생</span>
        <button
          style={{ ...BTN, padding: '6px 14px', background: settings.autoPlay ? '#4f46e5' : '#fff', color: settings.autoPlay ? '#fff' : '#444' }}
          onClick={() => onChange({ ...settings, autoPlay: !settings.autoPlay })}
        >
          {settings.autoPlay ? '켜짐' : '꺼짐'}
        </button>
      </div>

      <button
        style={{ ...BTN, width: '100%', marginTop: 20, textAlign: 'center', color: '#dc2626', borderColor: '#fecaca' }}
        onClick={() => { if (confirm('진척을 모두 지울까요? (가나·표현·세션 기록 초기화)')) { onReset(); onClose(); } }}
      >
        진척 모두 초기화
      </button>
    </Modal>
  );
}
