// 학습 지도 — 추천 / 열린 장면 / 곧 열릴 여행지 3구획. (정보 밀도 정리)
import { CONTENT } from '../content';
import type { Card } from '../learn/cards';
import { kanaReadMastery, missionProgress, type ProgressMap } from '../learn/progress';
import { isSceneOpen } from '../learn/unlocks';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { sceneVisualByMission, type SceneVisual } from './scene';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead, SceneImageThumb } from './ui';
import { GlassPanel, PrimaryAction, hexA } from './shell';
import { DeckButton } from './Gacha';
import { MascotBubble } from './mascot';

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
  openMissions: string[];
  devUnlockAll: boolean;
  onPracticeScene: (missionId: string) => void;
  onBack: () => void;
}

const kicker: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 };

// 오픈은 랜덤 순차 — 지금 열린 미션을 충분히 학습하면 다음 장면이 무작위로 열린다.
function lockHint(): string {
  return '열린 미션을 더 학습하면 다음 장면이 무작위로 열려요';
}

interface SceneItem { m: typeof CONTENT.missions[number]; sv: SceneVisual; unlocked: boolean; done: boolean; started: boolean; mastered: number; total: number }

export function Map({ nav, allCards, progress, openMissions, devUnlockAll, onPracticeScene, onBack }: Props) {
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0');
  const hira = kanaReadMastery(progress, CONTENT.kana.filter((k) => k.script === 'hiragana').map((k) => k.id));
  const kata = kanaReadMastery(progress, CONTENT.kana.filter((k) => k.script === 'katakana').map((k) => k.id));

  const items: SceneItem[] = scenes.map((m) => {
    const unlocked = isSceneOpen(m.id, openMissions, devUnlockAll);
    const p = missionProgress(allCards, progress, m.id);
    return { m, sv: sceneVisualByMission(m.id), unlocked, done: unlocked && p.total > 0 && p.mastered === p.total, started: p.started, mastered: p.mastered, total: p.total };
  });
  const open = items.filter((x) => x.unlocked);
  const locked = items.filter((x) => !x.unlocked);
  // 열린 장면 정렬: 진행 중 → 시작 전 → 완료
  const rank = (x: SceneItem) => (x.done ? 2 : x.started ? 0 : 1);
  const openSorted = [...open].sort((a, b) => rank(a) - rank(b));
  // 추천: 진행 중(미완료) 우선 → 시작 전 → (없으면) 첫 열린 장면
  const recommended = open.find((x) => x.started && !x.done) ?? open.find((x) => !x.started) ?? open[0];

  return (
    <main style={WRAP}>
      <NavBar {...nav} />
      <PageHead title="학습 지도" sub="열린 장면을 골라 연습하고, 학습할수록 새 장면이 무작위로 열려요" />
      <div style={{ position: 'relative', overflow: 'hidden', height: 150, borderRadius: 20, marginBottom: 12, border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
        <img src="/map/travel-routes.webp" alt="Yang과 Mung이 안내하는 일본 여행 루트" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 45%, rgba(10,12,18,0.48))' }} />
        <strong style={{ position: 'absolute', left: 14, bottom: 12, color: '#fff', fontSize: 16, textShadow: '0 2px 10px rgba(0,0,0,.5)' }}>열린 장면을 골라 연습해요</strong>
      </div>
      <p style={{ margin: '-4px 0 14px', color: 'var(--ink-soft)', fontSize: 13, fontWeight: 700 }}>열린 장면 {open.length} · 잠긴 장면 {locked.length} (전체 {scenes.length})</p>
      <MascotBubble who="duo" size={44} style={{ marginBottom: 14 }}>지금 열린 장면을 충분히 학습하면 다음 장면이 무작위로 열려요.</MascotBubble>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14, marginTop: -8 }}>
        <DeckButton />
      </div>

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

      {/* 열린 장면 — 진행 중 → 시작 전 → 완료 순 */}
      <section style={{ marginBottom: 18 }}>
        <p style={{ ...kicker, marginBottom: 10 }}>열린 장면 · {open.length}</p>
        <GlassPanel style={{ padding: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            {openSorted.map((x) => {
              const place = x.m.place ?? x.m.scenario ?? '이 장면';
              return (
                <button key={x.m.id} className="ym-press" onClick={() => onPracticeScene(x.m.id)}
                  style={{ minWidth: 0, padding: '10px 6px', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', cursor: 'pointer' }}>
                  <SceneImageThumb src={x.sv.backdrop ?? x.sv.thumb} icon={x.sv.icon} accent={x.sv.accent} size={42} />
                  <span style={{ display: 'block', marginTop: 6, fontSize: 12.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{place}</span>
                  <span style={{ display: 'block', marginTop: 3, fontSize: 10.5, color: x.done ? 'var(--ok)' : !x.started ? x.sv.accent : 'var(--ink-faint)', fontWeight: 700 }}>{x.done ? '완료' : !x.started ? '아직 안 함' : `${x.mastered}/${x.total}`}</span>
                </button>
              );
            })}
          </div>
        </GlassPanel>
      </section>

      {/* 아직 안 열린 장면 — 무작위로 열림. 미스터리 카드로만 표시 */}
      {locked.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <p style={{ ...kicker, marginBottom: 10 }}>아직 안 열린 장면 · {locked.length}</p>
          <GlassPanel style={{ padding: 12 }}>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '0 0 10px', fontWeight: 700 }}>열린 장면을 충분히 학습하면, 이 중 하나가 <b style={{ color: 'var(--accent)' }}>무작위로</b> 열려요.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 8 }}>
              {locked.map((x) => (
                <div key={x.m.id} aria-hidden title={lockHint()}
                  style={{ minWidth: 0, aspectRatio: '1', borderRadius: 12, border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--ink-faint)', opacity: 0.6 }}>🔒</div>
              ))}
            </div>
          </GlassPanel>
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
