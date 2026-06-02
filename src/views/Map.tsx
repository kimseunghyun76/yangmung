// 학습 지도 — 일본 여행 루트형 노드 UI. 공항→전철→편의점… 진행/잠김/완료.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import { isMissionUnlocked, kanaReadMastery, missionProgress, type ProgressMap } from '../learn/progress';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { sceneVisualByPlace } from './scene';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead } from './ui';
import { GlassPanel, PrimaryAction, hexA } from './shell';

const RECOVERY = [
  { ja: 'もう一度お願いします', ko: '다시 말해 주세요' },
  { ja: 'ゆっくりお願いします', ko: '천천히 말해 주세요' },
  { ja: 'やさしい日本語で', ko: '쉬운 일본어로' },
  { ja: '英語で大丈夫ですか', ko: '영어로 괜찮을까요' },
];

interface Props {
  nav: NavBarProps;
  allCards: Card[];
  progress: ProgressMap;
  onPracticeScene: (missionId: string) => void;
  onBack: () => void;
}

const kicker: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 };

export function Map({ nav, allCards, progress, onPracticeScene, onBack }: Props) {
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0');
  const hiraIds = CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id);
  const kataIds = CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id);
  const hira = kanaReadMastery(progress, hiraIds);
  const kata = kanaReadMastery(progress, kataIds);

  return (
    <main style={WRAP}>
      <NavBar {...nav} />
      <PageHead title="학습 지도" sub="공항에서 출발해 장면을 하나씩 열어가요" />

      {/* 가나 */}
      <GlassPanel style={{ marginBottom: 18 }}>
        <p style={{ ...kicker, marginBottom: 10 }}>가나 · 읽기 기준</p>
        <Bar label="히라가나" m={hira} />
        <Bar label="가타카나" m={kata} />
      </GlassPanel>

      {/* 여행 루트 */}
      <p style={{ ...kicker, margin: '0 0 14px 2px' }}>여행 루트</p>
      <div>
        {scenes.map((m, i) => {
          const unlocked = isMissionUnlocked(m.id, progress);
          const sv = sceneVisualByPlace(m.place);
          const p = missionProgress(allCards, progress, m.id);
          const done = unlocked && p.total > 0 && p.mastered === p.total;
          const status = !unlocked ? '잠김' : done ? '완료' : p.started ? `진행 중 ${p.mastered}/${p.total}` : `시작 전 0/${p.total}`;
          const nodeColor = done ? 'var(--ok)' : unlocked ? sv.accent : 'var(--ink-faint)';
          return (
            <div key={m.id} style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
              {/* 레일 + 노드 */}
              <div style={{ position: 'relative', width: 44, flex: '0 0 44px', display: 'flex', justifyContent: 'center' }}>
                <span style={{ position: 'absolute', left: 21, width: 2, top: i === 0 ? '28px' : 0, bottom: i === scenes.length - 1 ? 'calc(100% - 28px)' : 0, background: 'var(--glass-border)' }} />
                <span style={{
                  position: 'relative', zIndex: 1, marginTop: 6, width: 44, height: 44, borderRadius: 13, alignSelf: 'flex-start',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: unlocked ? hexA(sv.accent, 0.16) : 'var(--glass-bg)',
                  border: `1.5px solid ${done ? 'var(--ok)' : 'var(--glass-border)'}`,
                  color: nodeColor, opacity: unlocked ? 1 : 0.6,
                }}>
                  <Icon name={done ? 'check' : sv.icon} size={done ? 22 : 24} />
                </span>
              </div>
              {/* 카드 */}
              <button
                className={unlocked ? 'ym-glass ym-press' : undefined}
                onClick={() => unlocked && onPracticeScene(m.id)}
                disabled={!unlocked}
                style={{
                  flex: 1, marginBottom: 12, padding: '14px 16px', textAlign: 'left', cursor: unlocked ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink)',
                  borderRadius: 16, border: unlocked ? undefined : '1px dashed var(--glass-border)',
                  background: unlocked ? undefined : 'var(--glass-bg)', opacity: unlocked ? 1 : 0.65,
                }}
              >
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 700 }}>{m.place ?? m.scenario}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 500, marginTop: 1 }}>{m.scenario}</span>
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: done ? 'var(--ok)' : unlocked ? 'var(--ink-soft)' : 'var(--ink-faint)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {!unlocked && <Icon name="recovery" size={13} style={{ opacity: 0 }} />}{status}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* 복구 도구 */}
      <GlassPanel style={{ marginTop: 8 }}>
        <p style={{ ...kicker, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="recovery" size={16} /> 막혔을 때</p>
        {RECOVERY.map((r) => (
          <button key={r.ja} className="ym-press" onClick={() => speak(r.ja)} disabled={!ttsSupported()}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 10, padding: '8px 0', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ color: 'var(--ink)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="listen" size={15} style={{ color: 'var(--accent)' }} />{r.ja}</span>
            <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>{r.ko}</span>
          </button>
        ))}
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 6 }}>틀려도 미션은 이어집니다 — 막히면 이 표현으로 넘어가세요.</p>
      </GlassPanel>

      <PrimaryAction onClick={onBack} style={{ marginTop: 20 }}>홈으로</PrimaryAction>
    </main>
  );
}

function Bar({ label, m }: { label: string; m: { mastered: number; total: number } }) {
  const SEG = 18;
  const filled = Math.round((m.mastered / Math.max(1, m.total)) * SEG);
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
        <span>{label}</span><span style={{ color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}><strong style={{ color: 'var(--ink)' }}>{m.mastered}</strong>/{m.total}</span>
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 7 }}>
        {Array.from({ length: SEG }, (_, i) => (
          <span key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i < filled ? 'var(--accent)' : 'var(--glass-border)' }} />
        ))}
      </div>
    </div>
  );
}
