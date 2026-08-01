// 학습 로드맵 — "학습이 순차적으로 이어지는 걸 보여주는 하나의 길"을 만들어달라는 요청으로 신설.
// 예전엔 홈 화면에 "레벨 진도"(현재 레벨의 단계 그리드)와 "오늘의 미션"(장면 히어로)이 서로 다른
// 두 패널로 따로 있어서, 그 둘이 사실 하나의 이어지는 여정이라는 게 잘 안 보였다. 이 컴포넌트는
// 그 둘을 포함해 입문→기본→중급→고급 전체를 세로 타임라인 하나로 이어 붙인다.
// 지나온 레벨은 한 줄 요약(완료)로, 지금 레벨은 단계별로 펼쳐서, 앞으로 올 레벨은 잠금 요약으로 —
// "지금 여기"가 항상 화면 안 정확히 한 곳에만 있게 한다.
import { Fragment } from 'react';
import {
  CORE_LEVELS, CORE_LEVEL_LABEL, LEVEL_STAGES, isStageComplete, isStageUnlocked, levelAllComplete,
  nextLevel, type CoreLevel, type ProgStage, type ProgressionState,
} from '../learn/progression';
import { GlassPanel } from './shell';

interface Props {
  coreLevel: CoreLevel;
  progression: ProgressionState;
  devUnlockAll: boolean;
  missionsLocked: boolean;
  onStartStage: (stage: ProgStage) => void;
  onStartPromotion: () => void;
  onOpenMap: () => void;
}

const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase' };

type Status = 'done' | 'next' | 'locked' | 'open';

function Dot({ status }: { status: Status }) {
  const bg = status === 'done' ? 'var(--ok)' : status === 'next' ? 'var(--accent)' : status === 'open' ? 'var(--accent)' : 'var(--glass-border)';
  return (
    <span aria-hidden style={{
      width: 12, height: 12, borderRadius: 99, flex: '0 0 12px', background: bg,
      boxShadow: status === 'next' || status === 'open' ? `0 0 0 4px ${bg}33` : undefined,
    }} />
  );
}

function Row({ status, title, sub, onClick, isLast }: { status: Status; title: string; sub?: string; onClick?: () => void; isLast?: boolean }) {
  const clickable = !!onClick && status !== 'locked';
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
        <Dot status={status} />
        {!isLast && <span aria-hidden style={{ width: 2, flex: 1, minHeight: 18, background: status === 'done' ? 'var(--ok)' : 'var(--glass-border)', marginTop: 2 }} />}
      </div>
      <button
        className={clickable ? 'ym-press' : undefined}
        onClick={clickable ? onClick : undefined}
        disabled={!clickable}
        style={{
          flex: 1, minWidth: 0, textAlign: 'left', cursor: clickable ? 'pointer' : 'default',
          border: status === 'next' || status === 'open' ? '1.5px solid var(--accent)' : '1px solid var(--glass-border)',
          background: status === 'next' || status === 'open' ? 'var(--accent-soft)' : 'var(--glass-bg-strong)',
          borderRadius: 14, padding: '11px 13px', marginBottom: 10, opacity: status === 'locked' ? 0.6 : 1,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 14, color: 'var(--ink)' }}>{title}</strong>
          {status === 'done' && <span style={{ fontSize: 10.5, fontWeight: 900, color: 'var(--ok)' }}>완료 ✓</span>}
          {status === 'next' && <span style={{ padding: '2px 7px', borderRadius: 999, background: 'var(--accent)', color: 'var(--accent-ink)', fontSize: 10, fontWeight: 900 }}>지금 여기</span>}
          {status === 'locked' && <span aria-hidden style={{ fontSize: 11 }}>🔒</span>}
        </span>
        {sub && <span style={{ display: 'block', marginTop: 3, fontSize: 12, color: 'var(--ink-soft)' }}>{sub}</span>}
      </button>
    </div>
  );
}

export function LearningRoadmap({ coreLevel, progression, devUnlockAll, missionsLocked, onStartStage, onStartPromotion, onOpenMap }: Props) {
  const myRank = CORE_LEVELS.indexOf(coreLevel);
  const nx = nextLevel(coreLevel);
  const promoUnlocked = devUnlockAll || levelAllComplete(progression, coreLevel);
  const stages = LEVEL_STAGES[coreLevel];
  const nextStageIdx = stages.findIndex((st, idx) => !isStageComplete(progression, coreLevel, st.id) && (devUnlockAll || isStageUnlocked(progression, coreLevel, idx)));
  const showMissionRow = !missionsLocked; // express부터 — 지금 레벨의 여정 끝에 이어 붙인다

  return (
    <GlassPanel>
      <p style={{ ...label, marginBottom: 12 }}>학습 로드맵</p>

      {CORE_LEVELS.map((level) => {
        const rank = CORE_LEVELS.indexOf(level);
        if (rank < myRank) {
          // 지나온 레벨 — 개별 단계 대신 한 줄 요약. 이미 지나왔으므로 항상 완료로 취급.
          return <Row key={level} status="done" title={`${CORE_LEVEL_LABEL[level]} 완료`} />;
        }
        if (rank > myRank) {
          const count = LEVEL_STAGES[level].length;
          return (
            <Row key={level} status="locked"
              title={`${CORE_LEVEL_LABEL[level]}${count > 0 ? ` · ${count}단계` : ''}`}
              sub={`${CORE_LEVEL_LABEL[coreLevel]} 승급 시험을 통과하면 열려요`}
            />
          );
        }
        // 지금 레벨 — 단계별로 펼친다. 승급 시험은 반드시 이 레벨 바로 다음에 와야 하므로
        // (전체 목록 맨 끝이 아니라) 여기, 다음 레벨 잠금 요약보다 먼저 넣는다.
        return (
          <Fragment key={level}>
            {stages.map((st, idx) => {
              const done = isStageComplete(progression, coreLevel, st.id);
              const unlocked = devUnlockAll || isStageUnlocked(progression, coreLevel, idx);
              const status: Status = done ? 'done' : idx === nextStageIdx ? 'next' : unlocked ? 'open' : 'locked';
              return (
                <Row key={st.id} status={status} title={st.label} sub={st.sub}
                  onClick={unlocked ? () => onStartStage(st) : undefined} />
              );
            })}
            {showMissionRow && (
              <Row status="open" title="여행 미션" sub="열린 장면을 골라 자유롭게 연습해요" onClick={onOpenMap} />
            )}
            {nx && (
              <Row
                status={promoUnlocked ? 'next' : 'locked'}
                title={`${CORE_LEVEL_LABEL[nx]} 승급 시험`}
                sub={promoUnlocked ? '20문항 · 90% 이상' : `${CORE_LEVEL_LABEL[coreLevel]} 단계를 모두 통과하면 열려요`}
                onClick={promoUnlocked ? onStartPromotion : undefined}
              />
            )}
          </Fragment>
        );
      })}
    </GlassPanel>
  );
}
