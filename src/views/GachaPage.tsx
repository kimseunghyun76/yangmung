// 가챠 전용 페이지 — 학습 보상 가챠 + 여행 도감.
import { useMemo, useState } from 'react';
import { CONTENT } from '../content';
import { WRAP } from '../ui/styles';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead } from './ui';
import { GlassPanel } from './shell';
import { DeckBrowser, GachaBox } from './Gacha';
import { MascotBubble } from './mascot';
import { sceneVisualByMission } from './scene';
import { DAILY_MISSION_TARGET, todayLearnedCount } from '../learn/dailyMission';
import type { ProgressMap } from '../learn/progress';

interface Props {
  nav: NavBarProps;
  openMissions: string[];
  progress: ProgressMap;
}

const DAILY_KEY = 'yangmung:gacha:daily:v1';
// 2026-07-29 사용성 개편: 학습과 느슨하게만 연결돼 있던 "하루 100회 무료"를 소량으로 줄이고,
// 대신 학습 세션을 완료할 때마다 카드 상자를 1개씩 주는 것으로 보상의 중심을 옮겼다(Done.tsx 참고).
// 이 소량 무료는 그날 학습을 아직 안 했어도 부담 없이 접속해 뭔가 받아볼 수 있게 하는 최소한의 몫이다.
const DAILY_FREE_LIMIT = 5;

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

export function GachaPage({ nav, openMissions, progress }: Props) {
  const key = todayKey();
  const [claimedCount, setClaimedCount] = useState(() => loadDailyClaimCount(key));
  const [showLastDailyResult, setShowLastDailyResult] = useState(false);
  const [deckVersion, setDeckVersion] = useState(0);
  // 오늘의 무료 뽑기는 이제 데일리 미션(오늘 표현 몇 개 학습)을 완료해야 열린다(2026-08-02, 사용자
  // 요청) — 접속만 해도 받던 것에서, 조금이라도 학습해야 받는 걸로 바꿔 학습 동기를 붙였다.
  const dailyDone = todayLearnedCount(progress);
  const missionComplete = dailyDone >= DAILY_MISSION_TARGET;
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
      <PageHead title="수집함" sub="수업 보상으로 여행 카드를 모으고, 부족한 장면은 다시 연습해요" />

      <MascotBubble who="mung" mood="correct" size={46} style={{ marginBottom: 14 }}>
        카드 뽑기는 학습 보상이에요. 현금 뽑기 없이, 학습 세션을 마칠 때마다 카드 상자를 받고 매일 소량의 무료 뽑기도 있어요.
      </MascotBubble>

      <GlassPanel strong style={{ position: 'relative', overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 0%, rgba(185,56,46,.18), transparent 44%)' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 900, letterSpacing: '0.06em', color: 'var(--accent)' }}>DAILY FREE</p>
          <h2 style={{ margin: 0, fontSize: 23, lineHeight: 1.18, color: 'var(--ink)' }}>오늘의 무료 카드 뽑기</h2>
          <p style={{ margin: '8px 0 14px', fontSize: 13, lineHeight: 1.55, color: 'var(--ink-soft)', fontWeight: 650 }}>
            현재 열린 장면에서만 카드가 나와요. 수집함이 비어 있는 장면은 미션 지도에서 연습하면 보상이 더 잘 이어집니다.
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
          {!missionComplete ? (
            <div style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 7, borderRadius: 99, background: 'var(--glass-bg)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, Math.round((dailyDone / DAILY_MISSION_TARGET) * 100))}%`, height: '100%', background: 'var(--accent)', borderRadius: 99, transition: 'width .4s ease' }} />
                </div>
                <span style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{Math.min(dailyDone, DAILY_MISSION_TARGET)}/{DAILY_MISSION_TARGET}</span>
              </div>
              <div style={{ marginTop: 12, padding: 14, borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink)' }}>
                <strong style={{ display: 'block', fontSize: 15 }}>오늘 표현 {DAILY_MISSION_TARGET}개를 학습하면 무료 카드를 받을 수 있어요.</strong>
                <button className="ym-press" onClick={() => nav.onNavigate('home')} style={{
                  width: '100%', marginTop: 10, padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
                  border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 750, fontSize: 13.5,
                }}>홈에서 학습하러 가기</button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ margin: '14px 0 0', fontSize: 13, color: 'var(--ink)', fontWeight: 850 }}>
                오늘 남은 무료 뽑기 {remainingFree}/{DAILY_FREE_LIMIT}
              </p>
              {claimed ? (
                <div style={{ marginTop: 16, padding: 14, borderRadius: 16, border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--ink)' }}>
                  <strong style={{ display: 'block', fontSize: 16 }}>오늘 무료 뽑기 {DAILY_FREE_LIMIT}회를 모두 받았어요.</strong>
                  <span style={{ display: 'block', marginTop: 5, fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700 }}>내일 다시 열리고, 수업 완료 보상은 계속 받을 수 있어요.</span>
                </div>
              ) : (
                <GachaBox
                  sessionId={dailySessionId(key, nextFreeOrdinal)}
                  sceneIds={unlockedSceneIds}
                  grade="wood"
                  label={`무료 뽑기 ${nextFreeOrdinal}/${DAILY_FREE_LIMIT}`}
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
            </>
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
