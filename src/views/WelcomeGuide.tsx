// 첫 방문 환영 팝업 — 앱 개요를 짧게 보여주고 수준 진단으로 안내.
// Guide.tsx(탭형 상세 가이드)와 달리 1회성·요약형. "?" 버튼으로 언제든 Guide는 별도로 볼 수 있음.
import { Modal } from './Modal';
import { PrimaryAction } from './shell';
import { Icon, type IconName } from '../ui/Icon';

interface Step {
  icon: IconName;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  { icon: 'target', title: '1분 수준 진단', desc: '가나·듣기·상황 회화 몇 문제로 내 실력을 파악해요.' },
  { icon: 'nav-map', title: '맞춤 난이도로 학습', desc: '진단 결과에 맞춰 가나부터 여행 상황 미션까지 순서대로 안내해요.' },
  { icon: 'recovery', title: '자동 복습', desc: '틀린 것 위주로 다음 세션에 다시 나와요. 매일 짧게만 해도 충분해요.' },
];

export function WelcomeGuide({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <Modal title="여행 일본어에 오신 걸 환영해요" onClose={onSkip}
      footer={(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryAction onClick={onStart}><Icon name="check" size={18} /> 수준 진단 시작하기 (1분)</PrimaryAction>
          <button className="ym-press" onClick={onSkip} style={ghostBtn}>건너뛰고 기본으로 시작</button>
          <p style={{ fontSize: 12, color: 'var(--ink-faint)', textAlign: 'center', margin: 0 }}>진단은 나중에 설정에서 언제든 다시 받을 수 있어요.</p>
        </div>
      )}
    >
      <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
        일본 여행에서 바로 쓰는 표현을 짧은 세션으로 익히는 앱이에요. 시작 전에 실력에 맞는 난이도를 먼저 정해드릴게요.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {STEPS.map((s, i) => (
          <div key={s.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{
              width: 30, height: 30, flexShrink: 0, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 800, fontSize: 13,
            }}>
              {i + 1}
            </span>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={s.icon} size={14} /> {s.title}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

const ghostBtn: React.CSSProperties = {
  width: '100%', padding: '14px 16px', borderRadius: 16, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 15, cursor: 'pointer',
};
