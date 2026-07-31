// 학습 지도 — 추천 / 열린 장면 / 곧 열릴 여행지 3구획. (정보 밀도 정리)
import { CONTENT } from '../content';
import { ROUTES } from '../content/routes';
import type { Card } from '../learn/cards';
import { missionProgress, type ProgressMap } from '../learn/progress';
import { isSceneOpen } from '../learn/unlocks';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { sceneVisualByMission, type SceneVisual } from './scene';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead } from './ui';
import { GlassPanel, PrimaryAction, hexA } from './shell';
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
  missionsLocked: boolean;
  devUnlockAll: boolean;
  preferredRouteLabel?: string;      // undefined=자동, 'random'=무작위 명시 유지, 그 외=선택한 루트 라벨
  autoSuggestedLabels: string[];     // 출국일 임박으로 자동 추천 중인 루트 라벨(선택 안 했을 때만 채워짐)
  onSetPreferredRoute: (label: string | undefined) => void;
  onPracticeScene: (missionId: string) => void;
  onBack: () => void;
}

const kicker: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 };

// 오픈은 우선 루트가 있으면 그 루트 우선, 없으면 순수 랜덤 — 지금 열린 미션을 충분히 학습하면 다음 장면이 열린다.
function lockHint(hasPreferred: boolean): string {
  return hasPreferred ? '열린 미션을 더 학습하면 우선 카테고리에서 다음 장면이 열려요' : '열린 미션을 더 학습하면 다음 장면이 무작위로 열려요';
}

interface SceneItem { m: typeof CONTENT.missions[number]; sv: SceneVisual; unlocked: boolean; done: boolean; started: boolean; mastered: number; total: number }

export function Map({ nav, allCards, progress, openMissions, missionsLocked, devUnlockAll, preferredRouteLabel, autoSuggestedLabels, onSetPreferredRoute, onPracticeScene, onBack }: Props) {
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0');

  // 여행 미션은 입문·기본에서는 절대 노출하지 않는다(요청) — 장면 그리드 대신 명확한 안내로 대체.
  if (missionsLocked && !devUnlockAll) {
    return (
      <main style={WRAP}>
        <NavBar {...nav} />
        <PageHead title="미션 지도" sub="열린 장면을 골라 연습하고, 학습할수록 새 장면이 무작위로 열려요" />
        <GlassPanel style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span aria-hidden style={{ fontSize: 28 }}>🔒</span>
            <div>
              <p style={{ ...kicker, margin: 0 }}>여행 미션</p>
              <strong style={{ display: 'block', marginTop: 3, fontSize: 17 }}>미션은 중급부터 열려요</strong>
            </div>
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.65 }}>
            입문·기본 단계에서는 가나와 기본 단어를 먼저 다져요. 학습 탭의 <strong style={{ color: 'var(--ink)' }}>레벨 진도</strong>를
            모두 통과하고 중급으로 승급하면 편의점·식당 같은 실전 여행 장면이 이 화면에 열려요.
          </p>
          <button className="ym-press" onClick={onBack} style={{
            width: '100%', marginTop: 14, padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
            border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 750, fontSize: 14,
          }}>← 학습 탭으로 돌아가기</button>
        </GlassPanel>
      </main>
    );
  }

  const hasPreferred = (!!preferredRouteLabel && preferredRouteLabel !== 'random') || autoSuggestedLabels.length > 0;
  const items: SceneItem[] = scenes.map((m) => {
    const unlocked = isSceneOpen(m.id, openMissions, devUnlockAll);
    const p = missionProgress(allCards, progress, m.id);
    return { m, sv: sceneVisualByMission(m.id), unlocked, done: unlocked && p.total > 0 && p.mastered === p.total, started: p.started, mastered: p.mastered, total: p.total };
  });
  const open = items.filter((x) => x.unlocked);
  const locked = items.filter((x) => !x.unlocked);

  // 우선 학습 카테고리가 있으면(선택했거나 출국 임박 자동 추천) 그 카테고리 소속 장면만 추천·목록에 먼저 보여준다.
  // 아직 그 카테고리 안에 열린 장면이 하나도 없으면(막 골랐을 때 흔함) 전체 열린 장면으로 자연스럽게 대체한다.
  const activeLabels = preferredRouteLabel && preferredRouteLabel !== 'random'
    ? [preferredRouteLabel]
    : preferredRouteLabel === undefined ? autoSuggestedLabels : [];
  const activeMissionIds = activeLabels.length > 0
    ? new Set(ROUTES.filter((r) => activeLabels.includes(r.label)).flatMap((r) => r.ids))
    : null;
  const categoryOpen = activeMissionIds ? open.filter((x) => activeMissionIds.has(x.m.id)) : open;
  const isCategoryFiltered = activeMissionIds !== null && categoryOpen.length > 0;
  const openForDisplay = isCategoryFiltered ? categoryOpen : open;

  // 열린 장면 정렬: 진행 중 → 시작 전 → 완료
  const rank = (x: SceneItem) => (x.done ? 2 : x.started ? 0 : 1);
  const openSorted = [...openForDisplay].sort((a, b) => rank(a) - rank(b));
  // 추천: 진행 중(미완료) 우선 → 시작 전 → (없으면) 첫 열린 장면
  const recommended = openForDisplay.find((x) => x.started && !x.done) ?? openForDisplay.find((x) => !x.started) ?? openForDisplay[0];

  return (
    <main style={WRAP}>
      <NavBar {...nav} />
      <PageHead title="미션 지도" sub="열린 장면을 골라 연습하고, 학습할수록 새 장면이 무작위로 열려요" />
      <div style={{ position: 'relative', overflow: 'hidden', height: 150, borderRadius: 20, marginBottom: 12, border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)' }}>
        <img src="/map/travel-routes.webp" alt="Yang과 Mung이 안내하는 일본 여행 루트" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 45%, rgba(10,12,18,0.48))' }} />
        <strong style={{ position: 'absolute', left: 14, bottom: 12, color: '#fff', fontSize: 16, textShadow: '0 2px 10px rgba(0,0,0,.5)' }}>열린 장면을 골라 연습해요</strong>
      </div>
      <p style={{ margin: '-4px 0 14px', color: 'var(--ink-soft)', fontSize: 13, fontWeight: 700 }}>열린 장면 {open.length} · 잠긴 장면 {locked.length} (전체 {scenes.length})</p>
      <MascotBubble who="duo" size={44} style={{ marginBottom: 14 }}>
        {preferredRouteLabel && preferredRouteLabel !== 'random'
          ? `"${preferredRouteLabel}"을(를) 우선으로 다음 장면이 열려요.`
          : autoSuggestedLabels.length > 0
          ? '출국이 임박해 생존 표현부터 우선 열리도록 자동으로 맞췄어요.'
          : '지금 열린 장면을 충분히 학습하면 다음 장면이 무작위로 열려요.'}
      </MascotBubble>

      <RoutePreference preferredRouteLabel={preferredRouteLabel} autoSuggestedLabels={autoSuggestedLabels} onSetPreferredRoute={onSetPreferredRoute} />

      {/* 추천 */}
      {recommended && (
        <section style={{ marginBottom: 18 }}>
          <p style={{ ...kicker, marginBottom: 12 }}>오늘의 추천</p>
          <RouteSceneCard item={recommended} featured onPracticeScene={onPracticeScene} />
        </section>
      )}

      {/* 열린 장면 — 진행 중 → 시작 전 → 완료 순. 우선 카테고리가 있고 그 안에 열린 장면이 있으면 그것만 먼저 보여준다. */}
      <section style={{ marginBottom: 18 }}>
        <p style={{ ...kicker, marginBottom: 10 }}>
          열린 장면 · {openForDisplay.length}{isCategoryFiltered ? ` · ${activeLabels.join(' · ')}` : ''}
        </p>
        <GlassPanel style={{ padding: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: openSorted.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap: 10 }}>
            {openSorted.map((x) => (
              <RouteSceneCard key={x.m.id} item={x} compact={openSorted.length > 1} onPracticeScene={onPracticeScene} />
            ))}
          </div>
        </GlassPanel>
      </section>

      {/* 아직 안 열린 장면 — 우선 루트가 있으면 그 안에서, 없으면 무작위로 열림. 미스터리 카드로만 표시 */}
      {locked.length > 0 && (
        <section style={{ marginBottom: 18 }}>
          <p style={{ ...kicker, marginBottom: 10 }}>아직 안 열린 장면 · {locked.length}</p>
          <GlassPanel style={{ padding: 12 }}>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '0 0 10px', fontWeight: 700 }}>
              열린 장면을 충분히 학습하면, 이 중 하나가 {hasPreferred ? <><b style={{ color: 'var(--accent)' }}>우선 카테고리에서</b> 먼저</> : <><b style={{ color: 'var(--accent)' }}>무작위로</b></>} 열려요.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 8 }}>
              {locked.map((x) => (
                <div key={x.m.id} aria-hidden title={lockHint(hasPreferred)}
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

function RouteSceneCard({ item, onPracticeScene, featured = false, compact = false }: { item: SceneItem; onPracticeScene: (missionId: string) => void; featured?: boolean; compact?: boolean }) {
  const src = item.sv.backdrop ?? item.sv.thumb;
  const place = item.m.place ?? item.m.scenario ?? '이 장면';
  const statusText = item.done ? '완료' : !item.started ? '바로 시작' : `이어서 · ${item.mastered}/${item.total}`;
  const statusBg = item.done ? 'rgba(35,134,82,.94)' : item.started ? 'rgba(185,56,46,.96)' : 'rgba(255,255,255,.94)';
  const statusColor = item.done || item.started ? '#fff' : 'var(--accent)';
  return (
    <button className="ym-press" onClick={() => onPracticeScene(item.m.id)} style={{
      position: 'relative',
      minWidth: 0,
      overflow: 'hidden',
      width: '100%',
      border: featured ? `1.5px solid ${hexA(item.sv.accent, 0.5)}` : '1px solid var(--glass-border)',
      background: 'var(--glass-bg-strong)',
      color: '#fff',
      borderRadius: featured ? 22 : compact ? 16 : 18,
      padding: 0,
      cursor: 'pointer',
      textAlign: 'left',
      aspectRatio: featured ? '16 / 10' : compact ? '4 / 3' : '16 / 9',
      boxShadow: featured ? '0 14px 32px rgba(89,58,28,.14)' : '0 10px 22px rgba(89,58,28,.09)',
    }}>
      {src ? (
        <img src={src} alt="" loading="lazy" decoding="async" style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          filter: 'saturate(.94) contrast(1.02)',
        }} />
      ) : (
        <span aria-hidden style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${hexA(item.sv.accent, 0.18)}, var(--glass-bg-strong))`,
          color: item.sv.accent,
        }}>
          <Icon name={item.sv.icon} size={48} />
        </span>
      )}
      <span aria-hidden style={{
        position: 'absolute',
        inset: 0,
        background: featured
          ? 'linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.32) 46%, rgba(0,0,0,.78))'
          : 'linear-gradient(180deg, rgba(0,0,0,.06), rgba(0,0,0,.34) 50%, rgba(0,0,0,.74))',
      }} />
      <span style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: featured ? 16 : compact ? 10 : 14,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: compact ? 6 : 10 }}>
          <span style={{
            display: compact ? 'none' : 'inline-flex',
            alignItems: 'center',
            gap: 6,
            minWidth: 0,
            padding: '6px 9px',
            borderRadius: 999,
            background: 'rgba(255,255,255,.18)',
            border: '1px solid rgba(255,255,255,.22)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 850,
          }}>
            <Icon name={item.sv.icon} size={14} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.m.scenario}</span>
          </span>
          <span style={{
            flex: '0 0 auto',
            padding: compact ? '5px 7px' : '6px 9px',
            borderRadius: 999,
            background: statusBg,
            color: statusColor,
            border: item.done || item.started ? '1px solid rgba(255,255,255,.24)' : '1px solid rgba(255,255,255,.9)',
            boxShadow: '0 4px 14px rgba(0,0,0,.22)',
            fontSize: compact ? 11 : 12,
            fontWeight: 900,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            textShadow: item.done || item.started ? '0 1px 4px rgba(0,0,0,.22)' : 'none',
          }}>{statusText}</span>
        </span>
        <span style={{
          display: 'block',
          marginTop: compact ? 7 : featured ? 10 : 9,
          fontSize: featured ? 25 : compact ? 17 : 22,
          lineHeight: 1.12,
          fontWeight: 900,
          letterSpacing: '-0.02em',
          textShadow: '0 2px 14px rgba(0,0,0,.38)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{place}</span>
        <span style={{
          display: '-webkit-box',
          marginTop: 4,
          color: 'rgba(255,255,255,.86)',
          fontSize: featured ? 13.5 : compact ? 11.5 : 12.5,
          fontWeight: 750,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          WebkitLineClamp: compact ? 2 : 1,
          WebkitBoxOrient: 'vertical',
        }}>{item.m.canDo}</span>
      </span>
    </button>
  );
}

// 우선 학습 카테고리 선택 — 무작위 순차 오픈에 "이 루트부터" 선호를 얹는다(난이도 게이팅은 그대로 유지).
function RoutePreference({ preferredRouteLabel, autoSuggestedLabels, onSetPreferredRoute }: {
  preferredRouteLabel?: string; autoSuggestedLabels: string[]; onSetPreferredRoute: (label: string | undefined) => void;
}) {
  const isRandomActive = preferredRouteLabel === 'random' || (preferredRouteLabel === undefined && autoSuggestedLabels.length === 0);
  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 750, cursor: 'pointer',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
    background: active ? 'var(--accent-soft)' : 'var(--glass-bg-strong)',
    color: active ? 'var(--accent)' : 'var(--ink-soft)', whiteSpace: 'nowrap',
  });
  {/* 설명 문단은 바로 위 마스코트 말풍선이 같은 내용을 이미 전달해 중복이었다(사용자 지적:
      화면이 어수선함) — 카테고리 제목 + 칩만 남겨 한 단락 분량을 줄였다. */}
  return (
    <GlassPanel style={{ marginBottom: 14 }}>
      <p style={{ ...kicker, marginBottom: 10 }}>우선 학습 카테고리</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="ym-press" onClick={() => onSetPreferredRoute('random')} style={chipStyle(isRandomActive)}>🎲 무작위(기본)</button>
        {ROUTES.map((r) => {
          const active = preferredRouteLabel === r.label || (preferredRouteLabel === undefined && autoSuggestedLabels.includes(r.label));
          const isAutoOnly = active && preferredRouteLabel === undefined;
          return (
            <button key={r.label} className="ym-press" onClick={() => onSetPreferredRoute(r.label)} style={chipStyle(active)}>
              {r.label}{isAutoOnly ? ' · 출국 임박 추천' : ''}
            </button>
          );
        })}
      </div>
    </GlassPanel>
  );
}
