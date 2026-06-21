// 생활 기초 표 학습 — 숫자·월·요일·시간 등 열거형을 표(grid)로 한 번에 보고 익힌다.
// 가나 표(KanaGrid)와 같은 결: 셀을 누르면 발음 재생, 진척에 따라 색이 달라진다.
import { BASIC_GROUPS, BASIC_LIFE_ITEMS } from '../content/basicLife';
import type { ProgressMap } from '../learn/progress';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { NavBar, type NavBarProps } from './NavBar';
import { GlassPanel, PrimaryAction } from './shell';
import { Icon } from '../ui/Icon';

interface Props {
  nav: NavBarProps;
  progress: ProgressMap;
  onQuiz: () => void;
  onBack: () => void;
}

const label: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
  color: 'var(--accent)', textTransform: 'uppercase',
};

// 같은 항목을 가리키는 basic 카드들의 진척으로 셀 상태 판정.
function cellState(progress: ProgressMap, id: string): 'mastered' | 'seen' | 'new' {
  const keys = [`basic:read:${id}`, `basic:listen:${id}`, `basic:ko2ja:${id}`, `basic:hear2ja:${id}`];
  let seen = false;
  for (const k of keys) {
    const p = progress[k];
    if (!p) continue;
    seen = true;
    if ((p.consecutiveCorrect ?? 0) >= 2) return 'mastered';
  }
  return seen ? 'seen' : 'new';
}

const speakable = (s: string) => s.split('/')[0].trim();

export function VocabTable({ nav, progress, onQuiz, onBack }: Props) {
  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '4px 0', marginBottom: 12,
      }}>← 어휘로</button>

      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, ...label }}>생활 기초 · 표 학습</p>
        <h1 style={{ margin: '8px 0 4px', fontSize: 25, fontWeight: 900, letterSpacing: '-0.03em' }}>숫자·월·시간 한눈에</h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          표의 칸을 누르면 발음을 들려줘요. 1~10, 1월~12월처럼 묶음으로 한 번에 익혀요.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {BASIC_GROUPS.map(({ group, label: gLabel, sub, cols }) => {
          const items = BASIC_LIFE_ITEMS.filter((it) => it.group === group);
          if (items.length === 0) return null;
          return (
            <GlassPanel key={group}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>{gLabel}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-faint)' }}>{sub}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 7 }}>
                {items.map((it) => {
                  const st = cellState(progress, it.id);
                  const border = st === 'mastered' ? 'var(--ok)' : st === 'seen' ? 'var(--accent)' : 'var(--glass-border)';
                  const bg = st === 'mastered' ? 'var(--ok-soft)' : st === 'seen' ? 'var(--accent-soft)' : 'var(--glass-bg-strong)';
                  return (
                    <button key={it.id} className="ym-press" onClick={() => speak(speakable(it.kana))} disabled={!ttsSupported()}
                      title={st === 'mastered' ? '익힘' : st === 'seen' ? '본 적 있음' : '아직'}
                      style={{ padding: '9px 5px', borderRadius: 12, cursor: 'pointer', textAlign: 'center', border: `1px solid ${border}`, background: bg, color: 'var(--ink)', minWidth: 0 }}>
                      <div lang="ja" style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.ja}</div>
                      <div lang="ja" style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.kana}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.korean}</div>
                    </button>
                  );
                })}
              </div>
            </GlassPanel>
          );
        })}
      </div>

      <div style={{ marginTop: 18 }}>
        <PrimaryAction onClick={onQuiz}>
          <Icon name="fast" size={18} /> 표 다 봤어요 — 퀴즈로 확인
        </PrimaryAction>
      </div>
    </main>
  );
}
