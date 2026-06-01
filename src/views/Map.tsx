// 학습 지도 — 가나 트랙 · 여행 장면 · 복구 도구를 한눈에. 장면은 눌러서 바로 연습.
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import {
  isMissionUnlocked, kanaReadMastery, missionProgress, type ProgressMap,
} from '../learn/progress';
import { BTN, CARD, COLORS, PRIMARY, WRAP } from '../ui/styles';
import { sceneVisualByPlace } from './scene';
import { NavBar, type NavBarProps } from './NavBar';

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
      <h1 style={{ marginBottom: 4 }}>🗺 학습 지도</h1>
      <p style={{ color: COLORS.inkSoft, marginTop: 0, fontSize: 13 }}>내가 어디까지 왔는지 한눈에</p>

      <Section title="가나 (읽기 기준)">
        {(() => { const m = kanaReadMastery(progress, hiraIds); return <Bar label="히라가나" value={m.mastered} total={m.total} />; })()}
        {(() => { const m = kanaReadMastery(progress, kataIds); return <Bar label="가타카나" value={m.mastered} total={m.total} />; })()}
      </Section>

      <Section title="여행 장면">
        {scenes.map((m) => {
          const unlocked = isMissionUnlocked(m.id, progress);
          const p = missionProgress(allCards, progress, m.id);
          const done = unlocked && p.total > 0 && p.mastered === p.total;
          const status = !unlocked ? '🔒 잠김' : done ? '✅ 완료' : p.started ? `▶ 진행 중 ${p.mastered}/${p.total}` : `시작 전 0/${p.total}`;
          return (
            <button
              key={m.id}
              onClick={() => unlocked && onPracticeScene(m.id)}
              disabled={!unlocked}
              style={{
                ...BTN, width: '100%', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                opacity: unlocked ? 1 : 0.55, cursor: unlocked ? 'pointer' : 'default',
              }}
            >
              <span><strong>{sceneVisualByPlace(m.place).emoji} {m.place ?? m.scenario}</strong> <span style={{ color: 'var(--ink-faint)', fontSize: 13 }}>{m.scenario}</span></span>
              <span style={{ fontSize: 13, color: done ? 'var(--ok)' : 'var(--ink-soft)' }}>{status}</span>
            </button>
          );
        })}
        <p style={{ fontSize: 12, color: COLORS.inkFaint, marginTop: 8 }}>잠긴 장면은 앞 장면을 더 익히면 열려요.</p>
      </Section>

      <Section title="복구 도구 (막혔을 때)">
        {RECOVERY.map((r) => (
          <div key={r.ja} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0' }}>
            <span style={{ color: 'var(--ink-soft)' }}>🛟 {r.ja}</span>
            <span style={{ color: 'var(--ink-faint)' }}>{r.ko}</span>
          </div>
        ))}
        <p style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 6 }}>틀려도 미션은 이어집니다 — 막히면 이 표현으로 넘어가세요.</p>
      </Section>

      <button style={{ ...PRIMARY, marginTop: 20, width: '100%' }} onClick={onBack}>홈으로</button>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...CARD, marginTop: 14 }}>
      <p style={{ margin: '0 0 4px', fontSize: 13, color: COLORS.inkSoft, fontWeight: 700 }}>{title}</p>
      {children}
    </div>
  );
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: COLORS.inkSoft }}>
        <span>{label}</span><span><strong style={{ color: COLORS.indigo }}>{value}</strong>/{total}</span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
        <div style={{ width: `${(value / Math.max(1, total)) * 100}%`, height: '100%', background: COLORS.indigo }} />
      </div>
    </div>
  );
}
