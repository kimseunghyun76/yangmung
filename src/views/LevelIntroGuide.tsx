// 레벨 소개 가이드 — 승급 직후 또는 설정에서 레벨을 직접 바꿨을 때, 새 레벨에서 뭘 배우고
// 어떻게 학습하면 좋을지 안내한다. WelcomeGuide.tsx(최초 방문 전용)와 같은 시각 패턴을 재사용.
import { Modal } from './Modal';
import { PrimaryAction } from './shell';
import { Icon } from '../ui/Icon';
import { CORE_LEVEL_LABEL, LEVEL_STAGES, type CoreLevel } from '../learn/progression';
import { MODE_PRESETS } from '../learn/settings';

const STUDY_TIP: Record<CoreLevel, string> = {
  beginner: '가나부터 차근차근 — 매일 짧게 여러 번이 한 번에 오래보다 효과적이에요.',
  default: '간판·메뉴 읽기로 실생활 표기에 익숙해지는 단계예요. 발음 보조는 모르는 가나만 도와줘요.',
  express: '이제부터 실제 여행 미션이 시작돼요. 상황 속에서 표현을 써보며 감을 익혀보세요.',
  advanced: '한자와 문법 심화까지 — 발음 보조 없이 스스로 읽고 답하는 연습이에요.',
};

export function LevelIntroGuide({ level, onStart, onClose }: { level: CoreLevel; onStart: () => void; onClose: () => void }) {
  const label = CORE_LEVEL_LABEL[level];
  const stages = LEVEL_STAGES[level];
  return (
    <Modal title={`${label} 레벨을 시작해요`} onClose={onClose}
      footer={(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryAction onClick={onStart}><Icon name="flow" size={18} /> {label} 학습 시작하기</PrimaryAction>
          <p style={{ fontSize: 12, color: 'var(--ink-faint)', textAlign: 'center', margin: 0 }}>이 안내는 설정의 학습 모드를 바꿀 때마다 다시 볼 수 있어요.</p>
        </div>
      )}
    >
      <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{MODE_PRESETS[level].desc}</p>

      {stages.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {stages.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{
                width: 30, height: 30, flexShrink: 0, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 800, fontSize: 13,
              }}>
                {i + 1}
              </span>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{s.label}</p>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)' }}>
        <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.55, display: 'flex', gap: 8 }}>
          <Icon name="tip" size={15} style={{ flex: '0 0 auto', marginTop: 1, color: 'var(--accent)' }} />
          <span>{STUDY_TIP[level]}</span>
        </p>
      </div>
    </Modal>
  );
}
