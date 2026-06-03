// 학습 지도 — 추천 / 열린 장면 / 곧 열릴 여행지 3구획. (정보 밀도 정리)
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import { isMissionUnlocked, kanaReadMastery, missionProgress, type ProgressMap } from '../learn/progress';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { sceneVisualByPlace, type SceneVisual } from './scene';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead, SceneImageThumb } from './ui';
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

function lockHint(missionId: string): string {
  if (missionId === 'C3') return '편의점·식당을 더 익히면 열려요';
  if (missionId === 'C4') return '전철을 더 익히면 열려요';
  return '앞 장면을 더 익히면 열려요';
}

interface SceneItem { m: typeof CONTENT.missions[number]; sv: SceneVisual; unlocked: boolean; done: boolean; started: boolean; mastered: number; total: number }

export function Map({ nav, allCards, progress, onPracticeScene, onBack }: Props) {
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0');
  const hira = kanaReadMastery(progress, CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id));
  const kata = kanaReadMastery(progress, CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id));

  const items: SceneItem[] = scenes.map((m) => {
    const unlocked = isMissionUnlocked(m.id, progress);
    const p = missionProgress(allCards, progress, m.id);
    return { m, sv: sceneVisualByPlace(m.place), unlocked, done: unlocked && p.total > 0 && p.mastered === p.total, started: p.started, mastered: p.mastered, total: p.total };
  });
  const open = items.filter((x) => x.unlocked);
  const locked = items.filter((x) => !x.unlocked);
  // 추천: 진행 중(미완료) 우선 → 시작 전 → (없으면) 첫 열린 장면
  const recommended = open.find((x) => x.started && !x.done) ?? open.find((x) => !x.started) ?? open[0];
  const rest = open.filter((x) => x.m.id !== recommended?.m.id);

  return (
    <main style={WRAP}>
      <NavBar {...nav} />
      <PageHead title="학습 지도" sub="공항에서 출발해 장면을 하나씩 열어가요" />

      <GlassPanel style={{ marginBottom: 18 }}>
        <p style={{ ...kicker, marginBottom: 10 }}>가나 · 읽기 기준</p>
        <Bar label="히라가나" m={hira} />
        <Bar label="가타카나" m={kata} />
      </GlassPanel>

      {/* 추천 */}
      {recommended && (
        <section style={{ marginBottom: 18 }}>
          <p style={{ ...kicker, marginBottom: 12 }}>오늘의 추천</p>
          <button className="ym-glass ym-press" onClick={() => onPracticeScene(recommended.m.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: 14, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)', borderRadius: 20, border: `1.5px solid ${hexA(recommended.sv.accent, 0.5)}` }}>
            <SceneImageThumb src={recommended.sv.backdrop ?? recommended.sv.thumb} icon={recommended.sv.icon} accent={recommended.sv.accent} size={64} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>{recommended.m.place ?? recommended.m.scenario}</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 600, marginTop: 2 }}>{recommended.m.scenario}</span>
              <span style={{ display: 'inline-block', marginTop: 6, fontSize: 12, fontWeight: 800, color: recommended.sv.accent }}>
                {recommended.started ? `이어서 · ${recommended.mastered}/${recommended.total}` : '바로 시작'}
              </span>
            </span>
            <Icon name="flow" size={20} style={{ color: 'var(--ink-faint)' }} />
          </button>
        </section>
      )}

      {/* 열린 장면 */}
      {rest.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <p style={{ ...kicker, marginBottom: 12 }}>열린 장면</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rest.map((x) => (
              <button key={x.m.id} className="ym-glass ym-press" onClick={() => onPracticeScene(x.m.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 14px', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)', borderRadius: 16 }}>
                <SceneImageThumb src={x.sv.backdrop ?? x.sv.thumb} icon={x.sv.icon} accent={x.sv.accent} size={44} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{x.m.place ?? x.m.scenario}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 500, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.m.scenario}</span>
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: x.done ? 'var(--ok)' : 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>
                  {x.done ? '완료' : `${x.mastered}/${x.total}`}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 곧 열릴 여행지 */}
      {locked.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <p style={{ ...kicker, marginBottom: 12 }}>곧 열릴 여행지</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {locked.map((x) => (
              <div key={x.m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 16, border: '1px dashed var(--glass-border)', background: 'var(--glass-bg)', opacity: 0.75 }}>
                <SceneImageThumb src={x.sv.backdrop ?? x.sv.thumb} icon={x.sv.icon} accent={x.sv.accent} size={44} muted />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: 'var(--ink-soft)' }}>{x.m.place ?? x.m.scenario}</span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 500, marginTop: 1 }}>{lockHint(x.m.id)}</span>
                </span>
                <span style={{ fontSize: 16, color: 'var(--ink-faint)' }}>🔒</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 복구 도구 */}
      <GlassPanel>
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
