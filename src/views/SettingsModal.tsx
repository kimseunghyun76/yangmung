// 설정 — 글래스 하단 시트. 학습 모드·발음 보조·듣기 속도·자동 진행·백업·초기화.
import { useRef } from 'react';
import { MODE_PRESETS, LISTEN_RATES, type ChoiceMode, type LearnMode, type ReadingAidMode, type Settings } from '../learn/settings';
import { downloadBackup, parseBackup, applyBackup } from '../learn/backup';
import { mirrorSnapshot } from '../learn/idbMirror';
import { GLASS_BTN, SECTION_HEAD, glassSeg, glassToggle } from '../ui/styles';
import { CORE_LEVEL_LABEL, nextLevel, type CoreLevel } from '../learn/progression';
import { speak, setListenRate } from '../tts';
import { Modal } from './Modal';
import { Icon } from '../ui/Icon';

interface Props {
  settings: Settings;
  onChange: (s: Settings) => void;
  onSelectMode: (m: LearnMode) => void;
  onMarkKanaKnown: () => void;
  onReset: () => void;
  onResetUnlocks: () => void;
  onFillDevCards: () => void;
  onPlacement: () => void;
  onStartPromotion: (level: CoreLevel) => void;
  onClose: () => void;
}

const AID_OPTIONS: { v: ReadingAidMode; label: string }[] = [
  { v: 'auto', label: '자동' },
  { v: 'always', label: '항상' },
  { v: 'off', label: '끄기' },
];
const MODE_ORDER: LearnMode[] = ['beginner', 'default', 'express', 'advanced', 'review', 'kana'];
const CHOICE_OPTIONS: { v: ChoiceMode; label: string }[] = [
  { v: 'kana_ko', label: '일본어+한글' },
  { v: 'kana', label: '일본어만' },
  { v: 'kanji', label: '한자' },
];

// 공용 프리미티브(src/ui/styles.ts)의 로컬 별칭 — 이 파일의 기존 사용처 이름 유지
const gbtn = GLASS_BTN;
const head = SECTION_HEAD;
const toggle = glassToggle;

export function SettingsModal({ settings, onChange, onSelectMode, onMarkKanaKnown, onReset, onResetUnlocks, onFillDevCards, onPlacement, onStartPromotion, onClose }: Props) {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  // 백업 파일 복원 — 검증 → 확인 → 덮어쓰기 → 미러 갱신 → 새로고침(모든 상태 재로드)
  async function handleImportFile(file: File) {
    const text = await file.text();
    const parsed = parseBackup(text);
    if (!parsed.ok) { alert(`복원할 수 없어요 — ${parsed.error}`); return; }
    const when = new Date(parsed.file.exportedAt);
    const label = Number.isNaN(when.getTime()) ? '' : `\n(${when.getFullYear()}.${when.getMonth() + 1}.${when.getDate()} 내보낸 파일)`;
    if (!confirm(`백업 ${parsed.count}개 항목으로 복원할까요?${label}\n지금 기기의 학습 기록을 백업 내용으로 덮어씁니다.`)) return;
    const n = applyBackup(parsed.file);
    if (n === 0) { alert('복원에 실패했어요. 파일을 다시 확인해 주세요.'); return; }
    await mirrorSnapshot(); // 복원본을 미러에도 반영
    alert(`${n}개 항목을 복원했어요. 앱을 새로 불러옵니다.`);
    window.location.reload();
  }
  const seg = glassSeg;
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

      {/* 시험 · 진단 — 통합 레벨 진단 + 단계별 승급 시험 */}
      <p style={{ ...head, marginTop: 18 }}><Icon name="target" size={16} /> 시험 · 진단</p>
      <button className="ym-press" style={{ ...gbtn, width: '100%', textAlign: 'center', color: 'var(--accent)', fontWeight: 800 }}
        onClick={() => { onPlacement(); onClose(); }}>
        🎯 통합 수준 진단 다시 보기
      </button>
      <p style={{ margin: '6px 2px 8px', fontSize: 11.5, color: 'var(--ink-faint)' }}>지금 내 레벨을 다시 측정해 학습 순서를 맞춰줘요.</p>
      <div style={{ display: 'grid', gap: 8 }}>
        {(['beginner', 'default', 'express'] as CoreLevel[]).map((lv) => {
          const nx = nextLevel(lv);
          return (
            <button key={lv} className="ym-press" style={{ ...gbtn, width: '100%', textAlign: 'center' }}
              onClick={() => { onStartPromotion(lv); onClose(); }}>
              {CORE_LEVEL_LABEL[lv]} → {nx ? CORE_LEVEL_LABEL[nx] : ''} 승급 시험 <span style={{ color: 'var(--ink-faint)', fontWeight: 600 }}>· 20문항·90%</span>
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

      <p style={{ ...head, marginTop: 18 }}><Icon name="listen" size={16} /> 듣기 속도</p>
      <div style={{ display: 'flex', gap: 6 }}>
        {LISTEN_RATES.map((r) => (
          <button key={r} className="ym-press" style={seg(settings.listenRate === r)}
            onClick={() => { setListenRate(r); onChange({ ...settings, listenRate: r }); speak('ありがとうございます'); }}>
            ×{r}
          </button>
        ))}
      </div>
      <p style={{ margin: '6px 2px 0', fontSize: 11.5, color: 'var(--ink-faint)' }}>일본어 문장은 이 속도로 들려요. 누르면 바로 미리 들어볼 수 있어요.</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 }}>
        <span style={head}><Icon name="fast" size={16} /> 정답이면 자동으로 다음</span>
        <button className="ym-press" style={toggle(settings.fastForward)} onClick={() => onChange({ ...settings, fastForward: !settings.fastForward })}>{settings.fastForward ? '켜짐' : '꺼짐'}</button>
      </div>

      {/* ── 데이터 백업 — 기기·브라우저를 옮기거나 만일의 소실에 대비 ── */}
      <p style={{ ...head, marginTop: 18 }}><Icon name="chart" size={16} /> 데이터 백업</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="ym-press" style={{ ...gbtn, flex: 1, textAlign: 'center' }} onClick={() => downloadBackup()}>
          💾 내보내기
        </button>
        <button className="ym-press" style={{ ...gbtn, flex: 1, textAlign: 'center' }} onClick={() => importInputRef.current?.click()}>
          📂 파일에서 복원
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = ''; // 같은 파일 재선택 허용
            if (f) void handleImportFile(f);
          }}
        />
      </div>
      <p style={{ margin: '6px 2px 0', fontSize: 11.5, color: 'var(--ink-faint)', lineHeight: 1.45 }}>
        학습 기록 전체를 파일 하나로 저장해요. 다른 기기·브라우저에서 복원하면 이어서 학습할 수 있어요.
      </p>

      <button className="ym-press" style={{ ...gbtn, width: '100%', marginTop: 18, textAlign: 'center' }}
        onClick={() => { if (confirm('히라가나·가타카나를 모두 안다고 표시할까요? (가나 드릴을 건너뛰고 발음 보조도 꺼집니다)')) { onMarkKanaKnown(); onClose(); } }}>
        가나는 이미 알아요 (건너뛰기)
      </button>
      <button className="ym-press" style={{ ...gbtn, width: '100%', marginTop: 10, textAlign: 'center', color: 'var(--accent)' }}
        onClick={() => { if (confirm('진척을 모두 지울까요? (가나·표현·세션 기록 + 장면 해제 초기화)')) { onReset(); onClose(); } }}>
        진척 모두 초기화
      </button>

      {/* ── 개발자 도구 (테스트용) ── */}
      <p style={{ ...head, marginTop: 22, color: 'var(--ink-faint)' }}>🛠 개발자 도구</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)' }}>접근 제한 해제</span>
        <button className="ym-press" style={toggle(!!settings.devUnlockAll)} onClick={() => onChange({ ...settings, devUnlockAll: !settings.devUnlockAll })}>{settings.devUnlockAll ? '켜짐' : '꺼짐'}</button>
      </div>
      <p style={{ margin: '6px 2px 0', fontSize: 11.5, color: 'var(--ink-faint)', lineHeight: 1.45 }}>장면과 연습 메뉴의 잠금을 임시로 무시합니다.</p>
      <button className="ym-press" style={{ ...gbtn, width: '100%', marginTop: 10, textAlign: 'center' }}
        onClick={() => { onFillDevCards(); onClose(); }}>
        가챠 카드 미션별 30장 채우기
      </button>
      <button className="ym-press" style={{ ...gbtn, width: '100%', marginTop: 10, textAlign: 'center', color: 'var(--ink-soft)' }}
        onClick={() => { if (confirm('카드로 해제한 장면 lock을 초기화할까요? (진척은 유지)')) { onResetUnlocks(); } }}>
        장면 lock만 초기화
      </button>
    </Modal>
  );
}
