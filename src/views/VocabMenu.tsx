// 어휘 커리큘럼 메뉴 — 주제별 그룹 선택 화면.
import type { Card } from '../learn/cards';
import type { ProgressMap } from '../learn/progress';
import { VOCAB_GROUPS } from '../content/thematicVocab';
import { GlassPanel, PrimaryAction } from './shell';
import { NavBar, type NavBarProps } from './NavBar';
import { WRAP } from '../ui/styles';

interface Props {
  nav: NavBarProps;
  allCards: Card[];
  progress: ProgressMap;
  onSelectGroup: (groupId: string) => void;
  onBack: () => void;
}

const label: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
  color: 'var(--accent)', textTransform: 'uppercase',
};

export function VocabMenu({ nav, allCards, progress, onSelectGroup, onBack }: Props) {
  // 각 그룹별 진행률 계산
  const groupStats = VOCAB_GROUPS.map((group) => {
    const prefix = `vocab:${group.id}:read:`;
    let total = 0, mastered = 0;
    for (const c of allCards) {
      if (!c.id.startsWith(prefix)) continue;
      total++;
      const p = progress[c.id];
      if (p && p.consecutiveCorrect >= 2) mastered++;
    }
    return { group, total, mastered };
  });

  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: 'var(--ink-soft)',
          fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '4px 0', marginBottom: 12,
        }}
      >
        ← 홈으로
      </button>

      <div style={{ marginBottom: 18 }}>
        <p style={{ margin: 0, ...label }}>어휘 커리큘럼</p>
        <h1 style={{ margin: '8px 0 4px', fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em' }}>
          반드시 외울 단어
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          주제별로 체계적으로 익혀요. 읽기·듣기·뜻→일본어 3단계 반복.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {groupStats.map(({ group, total, mastered }) => {
          const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
          const done = pct === 100;
          return (
            <button
              key={group.id}
              className="ym-press"
              onClick={() => onSelectGroup(group.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                padding: '14px 16px', borderRadius: 18, cursor: 'pointer',
                border: `1px solid ${done ? 'var(--ok)' : 'var(--glass-border)'}`,
                background: done ? 'rgba(52,199,89,0.06)' : 'var(--glass-bg-strong)',
                color: 'var(--ink)',
              }}
            >
              <span style={{
                width: 48, height: 48, flex: '0 0 48px', borderRadius: 14,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--glass-bg)', fontSize: 26,
              }}>
                {group.icon}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 15.5, fontWeight: 800 }}>{group.label}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', marginTop: 2, lineHeight: 1.4 }}>
                  {group.description} · {group.items.length}단어
                </span>
                {total > 0 && (
                  <div style={{ marginTop: 7 }}>
                    <div style={{
                      height: 4, borderRadius: 99, background: 'var(--glass-border)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: 99,
                        background: done ? 'var(--ok)' : 'var(--accent)',
                        width: `${pct}%`,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                    <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: done ? 'var(--ok)' : 'var(--ink-faint)', fontWeight: 750 }}>
                      {done ? '완료 ✓' : `${mastered} / ${total}`}
                    </span>
                  </div>
                )}
              </span>
              <span style={{ color: 'var(--ink-faint)', fontSize: 18 }}>›</span>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <GlassPanel>
          <p style={{ margin: 0, ...label }}>전체 연습</p>
          <p style={{ margin: '6px 0 12px', fontSize: 13, color: 'var(--ink-soft)' }}>
            모든 그룹을 섞어 SRS 방식으로 복습합니다.
          </p>
          <PrimaryAction onClick={() => onSelectGroup('all')}>
            전체 어휘 세션 시작
          </PrimaryAction>
        </GlassPanel>
      </div>
    </main>
  );
}
