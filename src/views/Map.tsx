// 학습 지도 — 가나 트랙 · 여행 장면 · 복구 도구를 한눈에. 장면은 눌러서 바로 연습.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import {
  isMissionUnlocked, kanaReadMastery, missionProgress, type ProgressMap,
} from '../learn/progress';
import { BTN, CARD, PRIMARY, WRAP } from '../ui/styles';
import { sceneVisualByMission } from './scene';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead } from './ui';
import { Icon } from '../ui/Icon';

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

export function Map({ nav, allCards, progress, onPracticeScene, onBack }: Props) {
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0'); // 튜토리얼 제외
  const hiraIds = CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id);
  const kataIds = CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id);

  return (
    <main style={WRAP}>
      <NavBar {...nav} />
      <PageHead title="학습 지도" sub="내가 어디까지 왔는지 한눈에" />

      <Section title="가나 · 읽기 기준">
        {(() => { const m = kanaReadMastery(progress, hiraIds); return <Bar label="히라가나" value={m.mastered} total={m.total} />; })()}
        {(() => { const m = kanaReadMastery(progress, kataIds); return <Bar label="가타카나" value={m.mastered} total={m.total} />; })()}
      </Section>

      <Section title="여행 장면">
        {scenes.map((m) => {
          const unlocked = isMissionUnlocked(m.id, progress);
          const p = missionProgress(allCards, progress, m.id);
          const done = unlocked && p.total > 0 && p.mastered === p.total;
          const status = !unlocked ? '잠김' : done ? '완료' : p.started ? `진행 중 ${p.mastered}/${p.total}` : `시작 전 0/${p.total}`;
          const sv = sceneVisualByMission(m.id);
          return (
            <button
              key={m.id}
              className={unlocked ? 'ym-pop-sm' : undefined}
              onClick={() => unlocked && onPracticeScene(m.id)}
              disabled={!unlocked}
              style={{
                ...BTN, width: '100%', marginTop: 10, padding: 0, display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden',
                border: unlocked ? '1.5px solid var(--border)' : '1.5px dashed var(--line)',
                opacity: unlocked ? 1 : 0.6, cursor: unlocked ? 'pointer' : 'default',
              }}
            >
              <span style={{ alignSelf: 'stretch', width: 8, background: done ? 'var(--ok)' : unlocked ? sv.accent : 'var(--line)' }} />
              <SceneThumb sv={sv} muted={!unlocked} />
              <span style={{ flex: 1, textAlign: 'left', padding: '10px 0' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{m.place ?? m.scenario}</span>
                <span style={{ display: 'block', color: 'var(--ink-faint)', fontSize: 12, fontWeight: 500 }}>{m.scenario}</span>
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: done ? 'var(--ok)' : 'var(--ink-soft)', paddingRight: 14 }}>{status}</span>
            </button>
          );
        })}
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 10, fontWeight: 500 }}>잠긴 장면은 앞 장면을 더 익히면 열려요.</p>
      </Section>

      <Section title="복구 도구 (막혔을 때)">
        {RECOVERY.map((r) => (
          <div key={r.ja} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0' }}>
            <span style={{ color: 'var(--ink-soft)', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="recovery" size={16} />{r.ja}</span>
            <span style={{ color: 'var(--ink-faint)' }}>{r.ko}</span>
          </div>
        ))}
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 6 }}>틀려도 미션은 이어집니다 — 막히면 이 표현으로 넘어가세요.</p>
      </Section>

      <button style={{ ...PRIMARY, marginTop: 20, width: '100%' }} onClick={onBack}>홈으로</button>
    </main>
  );
}

function SceneThumb({ sv, muted = false }: { sv: { emoji: string; thumb?: string; bg: string }; muted?: boolean }) {
  if (sv.thumb) {
    return (
      <span style={{ width: 48, height: 48, marginLeft: 4, flex: '0 0 48px', borderRadius: 14, overflow: 'hidden', opacity: muted ? 0.45 : 1, background: sv.bg, border: '1.5px solid var(--border)' }}>
        <img src={sv.thumb} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </span>
    );
  }
  return <span style={{ fontSize: 19, paddingLeft: 4, opacity: muted ? 0.5 : 1 }}>{sv.emoji}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...CARD, marginTop: 16 }}>
      <p className="ym-kicker" style={{ margin: '0 0 6px' }}>{title}</p>
      {children}
    </div>
  );
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const SEG = 18;
  const filled = Math.round((value / Math.max(1, total)) * SEG);
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
        <span>{label}</span><span style={{ color: 'var(--ink-faint)', fontVariantNumeric: 'tabular-nums' }}><strong style={{ color: 'var(--ink)' }}>{value}</strong>/{total}</span>
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 7 }}>
        {Array.from({ length: SEG }, (_, i) => (
          <span key={i} style={{ flex: 1, height: 8, borderRadius: 2, background: i < filled ? 'var(--accent)' : 'var(--surface-2)' }} />
        ))}
      </div>
    </div>
  );
}
