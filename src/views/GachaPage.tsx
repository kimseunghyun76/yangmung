// 가챠 전용 페이지 — 학습 보상 가챠 + 여행 도감.
import { useMemo, useState } from 'react';
import { CONTENT } from '../content';
import { WRAP } from '../ui/styles';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead } from './ui';
import { GlassPanel } from './shell';
import { CollectionSummary, DeckBrowser, GachaBox } from './Gacha';
import { MascotBubble } from './mascot';
import { sceneVisualByMission } from './scene';

interface Props {
  nav: NavBarProps;
  openMissions: string[];
}

const DAILY_KEY = 'yangmung:gacha:daily:v1';
const DAILY_FREE_LIMIT = 100;

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dailySessionId(key: string, ordinal: number): number {
  return -Number(`${key.replace(/-/g, '')}${String(ordinal).padStart(3, '0')}`);
}

function loadDailyClaimCount(key: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(DAILY_KEY);
    if (!raw) return 0;
    if (raw === key) return 1;
    const parsed = JSON.parse(raw) as { date?: string; count?: number };
    if (parsed.date !== key) return 0;
    return Math.min(DAILY_FREE_LIMIT, Math.max(0, parsed.count ?? 0));
  } catch { return 0; }
}

function saveDailyClaimCount(key: string, count: number): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(DAILY_KEY, JSON.stringify({ date: key, count })); } catch { /* noop */ }
}

export function GachaPage({ nav, openMissions }: Props) {
  const key = todayKey();
  const [claimedCount, setClaimedCount] = useState(() => loadDailyClaimCount(key));
  const [dailyRun, setDailyRun] = useState(0);
  const [showLastDailyResult, setShowLastDailyResult] = useState(false);
  const [deckVersion, setDeckVersion] = useState(0);
  const remainingFree = Math.max(0, DAILY_FREE_LIMIT - claimedCount);
  const claimed = remainingFree <= 0 && !showLastDailyResult;
  const nextFreeOrdinal = Math.min(DAILY_FREE_LIMIT, claimedCount + 1);
  const unlockedSceneIds = useMemo(() => {
    const ids = CONTENT.missions
      .filter((m) => m.id !== 'C0' && openMissions.includes(m.id))
      .map((m) => m.id);
    return ids.length ? ids : ['C1'];
  }, [openMissions]);
  const previewScenes = unlockedSceneIds.slice(0, 4).map((id) => {
    const mission = CONTENT.missions.find((m) => m.id === id);
    return { id, label: mission?.place ?? mission?.scenario ?? id, visual: sceneVisualByMission(id) };
  });

  return (
    <main style={WRAP}>
      <NavBar {...nav} />
      <PageHead title="도감" sub="수업 보상으로 여행 카드를 모으고, 부족한 장면은 다시 연습해요" />

      <MascotBubble who="mung" mood="correct" size={46} style={{ marginBottom: 14 }}>
        카드 뽑기는 학습 보상이에요. 현금 뽑기 없이 하루 100회 무료와 수업 완료 보상만 있어요.
      </MascotBubble>

      <CollectionSummary key={deckVersion} />

      <GlassPanel strong style={{ position: 'relative', overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 0%, rgba(185,56,46,.18), transparent 44%)' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 900, letterSpacing: '0.06em', color: 'var(--accent)' }}>DAILY FREE</p>
          <h2 style={{ margin: 0, fontSize: 23, lineHeight: 1.18, color: 'var(--ink)' }}>오늘의 무료 카드 뽑기</h2>
          <p style={{ margin: '8px 0 14px', fontSize: 13, lineHeight: 1.55, color: 'var(--ink-soft)', fontWeight: 650 }}>
            현재 열린 장면에서만 카드가 나와요. 도감이 비어 있는 장면은 미션 지도에서 연습하면 보상이 더 잘 이어집니다.
          </p>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: claimed ? 0 : 4 }}>
            {previewScenes.map((s) => (
              <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 9px', borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink)', fontSize: 12, fontWeight: 800 }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: s.visual.accent, boxShadow: `0 0 10px ${s.visual.accent}` }} />
                {s.label}
              </span>
            ))}
            {unlockedSceneIds.length > previewScenes.length && (
              <span style={{ padding: '6px 9px', borderRadius: 999, background: 'var(--glass-bg)', color: 'var(--ink-faint)', fontSize: 12, fontWeight: 800 }}>+{unlockedSceneIds.length - previewScenes.length}</span>
            )}
          </div>
          <p style={{ margin: claimed ? '14px 0 0' : '14px 0 0', fontSize: 13, color: 'var(--ink)', fontWeight: 850 }}>
            오늘 남은 무료 뽑기 {remainingFree}/{DAILY_FREE_LIMIT}
          </p>
          {claimed ? (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink)' }}>
              <strong style={{ display: 'block', fontSize: 16 }}>오늘 무료 뽑기 100회를 모두 받았어요.</strong>
              <span style={{ display: 'block', marginTop: 5, fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700 }}>내일 다시 열리고, 수업 완료 보상은 계속 받을 수 있어요.</span>
            </div>
          ) : (
            <GachaBox
              key={dailyRun}
              sessionId={dailySessionId(key, nextFreeOrdinal)}
              sceneIds={unlockedSceneIds}
              grade="wood"
              label={`무료 뽑기 ${nextFreeOrdinal}/${DAILY_FREE_LIMIT}`}
              randomDrawCount
              afterRevealLabel={claimedCount < DAILY_FREE_LIMIT ? `다음 무료 뽑기 (${DAILY_FREE_LIMIT - claimedCount}회 남음)` : undefined}
              onAfterReveal={() => {
                setShowLastDailyResult(false);
                setDailyRun((n) => n + 1);
              }}
              onClaimed={(results) => {
                if (results.length > 0) {
                  setShowLastDailyResult(true);
                  setClaimedCount((prev) => {
                    const next = Math.min(DAILY_FREE_LIMIT, prev + 1);
                    saveDailyClaimCount(key, next);
                    return next;
                  });
                  setDeckVersion((n) => n + 1);
                }
              }}
            />
          )}
        </div>
      </GlassPanel>

      <GlassPanel strong>
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 900, letterSpacing: '0.06em', color: 'var(--accent)' }}>ALL SCENES</p>
        <DeckBrowser key={deckVersion} />
      </GlassPanel>
    </main>
  );
}
