// 듣기 모드 — 이동 중(화면을 안 봐도) 학습한 표현을 이어서 반복 재생해 귀에 익히는 화면.
// 2026-07-29 신규: "자주 들어야 익숙해진다"는 요청에 따라, 탭/클릭 없이 문장이 계속 이어지도록 구성.
import { useEffect, useMemo, useRef, useState } from 'react';
import { CONTENT } from '../content';
import type { Phrase } from '../content';
import type { Card } from '../learn/cards';
import type { ProgressMap } from '../learn/progress';
import { collectSeenPhraseIds } from './Review';
import { phraseIdsByPlace, sceneVisualByPlace } from './scene';
import { speak, stopSpeaking, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead } from './ui';
import { GlassPanel, hexA } from './shell';
import { MascotEmpty } from './mascot';

interface Props {
  nav: NavBarProps;
  allCards: Card[];
  progress: ProgressMap;
  onBack: () => void;
}

const RATE_OPTIONS = [0.8, 1, 1.25] as const;
const REPEAT_OPTIONS = [1, 2, 3] as const;
const GAP_MS = 900;       // 다음 문장으로 넘어가기 전 여백
const REPEAT_GAP_MS = 450; // 같은 문장 반복 사이 여백
const kicker: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 };

export function ListenMode({ nav, allCards, progress, onBack }: Props) {
  const phraseSeen = useMemo(() => collectSeenPhraseIds(allCards, progress), [allCards, progress]);
  const places = useMemo(() => phraseIdsByPlace(), []);
  const byId = useMemo(() => Object.fromEntries(CONTENT.phrases.map((p) => [p.id, p])), []);
  // 학습한 표현이 하나라도 있는 장면만 선택지로 노출 — 빈 장면을 골라 "표현이 없어요"를 보게 하지 않는다.
  const scenePlaces = useMemo(() => places.filter((p) => p.phraseIds.some((id) => phraseSeen.has(id))), [places, phraseSeen]);

  const [scope, setScope] = useState<string>('all'); // 'all' | place.id
  const list = useMemo<Phrase[]>(() => {
    const ids = scope === 'all'
      ? CONTENT.phrases.filter((p) => phraseSeen.has(p.id)).map((p) => p.id)
      : (places.find((p) => p.id === scope)?.phraseIds ?? []).filter((id) => phraseSeen.has(id));
    return ids.map((id) => byId[id]).filter((p): p is Phrase => Boolean(p));
  }, [scope, phraseSeen, places, byId]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loopAll, setLoopAll] = useState(true);
  const [repeatEach, setRepeatEach] = useState<number>(2);
  const [rate, setRate] = useState<number>(1);
  const [keepAwake, setKeepAwake] = useState(true);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => { setIndex(0); setPlaying(false); }, [scope]);
  useEffect(() => { if (index >= list.length) setIndex(0); }, [list, index]);

  // 재생 엔진 — 현재 문장을 repeatEach번 반복한 뒤 다음 문장으로. 목록 끝에서 loopAll이면 처음으로.
  useEffect(() => {
    if (!playing || list.length === 0) return;
    const phrase = list[index];
    if (!phrase) return;
    let cancelled = false;
    let left = repeatEach;
    const playOnce = () => {
      speak(phrase.displayKana ?? phrase.kana, {
        rate,
        onEnd: () => {
          if (cancelled) return;
          left -= 1;
          if (left > 0) {
            window.setTimeout(() => { if (!cancelled) playOnce(); }, REPEAT_GAP_MS);
            return;
          }
          window.setTimeout(() => {
            if (cancelled) return;
            if (index + 1 < list.length) { setIndex(index + 1); return; }
            if (loopAll) { setIndex(0); return; }
            setPlaying(false);
          }, GAP_MS);
        },
      });
    };
    playOnce();
    return () => { cancelled = true; stopSpeaking(); };
  }, [playing, index, list, repeatEach, rate, loopAll]);

  // 화면 유지 — 이동 중 화면이 잠겨 재생이 끊기지 않도록(지원 기기에서만, 실패해도 조용히 무시).
  useEffect(() => {
    if (!keepAwake || !playing || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    let released = false;
    navigator.wakeLock.request('screen').then((lock) => {
      if (released) { void lock.release(); return; }
      wakeLockRef.current = lock;
    }).catch(() => {});
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !wakeLockRef.current && !released) {
        navigator.wakeLock.request('screen').then((lock) => { if (!released) wakeLockRef.current = lock; else void lock.release(); }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisible);
      void wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [keepAwake, playing]);

  function goTo(i: number) { stopSpeaking(); setIndex(((i % list.length) + list.length) % list.length); }

  const current = list[index];
  const supported = ttsSupported();

  return (
    <main style={WRAP}>
      <NavBar {...nav} current="listen" />
      <PageHead title="듣기 모드" sub="화면을 안 봐도 학습한 표현이 계속 이어져요 — 이동하면서 자주 들으면 귀에 익어요" />

      {!supported && (
        <GlassPanel style={{ marginBottom: 16 }}><MascotEmpty who="yang" title="이 기기에서는 음성 재생을 지원하지 않아요">다른 기기나 브라우저에서 시도해보세요.</MascotEmpty></GlassPanel>
      )}

      {list.length === 0 ? (
        <GlassPanel>
          <MascotEmpty who="yang" title="아직 들을 표현이 없어요">학습을 먼저 진행하면 여기서 이어 들을 수 있어요.</MascotEmpty>
        </GlassPanel>
      ) : (
        <>
          {/* 범위 선택 */}
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 3, marginBottom: 14 }}>
            <button className="ym-press" onClick={() => setScope('all')} style={{
              flex: '0 0 auto', padding: '9px 13px', borderRadius: 999, cursor: 'pointer', fontWeight: 750, fontSize: 13.5, whiteSpace: 'nowrap',
              border: `1px solid ${scope === 'all' ? 'var(--ink)' : 'var(--glass-border)'}`,
              background: scope === 'all' ? 'var(--accent)' : 'var(--glass-bg-strong)',
              color: scope === 'all' ? 'var(--accent-ink)' : 'var(--ink)',
            }}>전체 · {CONTENT.phrases.filter((p) => phraseSeen.has(p.id)).length}</button>
            {scenePlaces.map((p) => {
              const active = scope === p.id;
              const sv = sceneVisualByPlace(p.place);
              const count = p.phraseIds.filter((id) => phraseSeen.has(id)).length;
              return (
                <button key={p.id} className="ym-press" onClick={() => setScope(p.id)} style={{
                  flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderRadius: 999, cursor: 'pointer', fontWeight: 750, fontSize: 13.5, whiteSpace: 'nowrap',
                  border: `1px solid ${active ? 'var(--ink)' : 'var(--glass-border)'}`,
                  background: active ? 'var(--accent)' : 'var(--glass-bg-strong)',
                  color: active ? 'var(--accent-ink)' : 'var(--ink)',
                }}>
                  <span style={{ color: active ? 'var(--accent-ink)' : sv.accent, display: 'inline-flex' }}><Icon name={sv.icon} size={15} /></span>
                  {p.place} · {count}
                </button>
              );
            })}
          </div>

          {/* 재생 카드 — 큼직하게, 한눈에 들어오도록 */}
          <GlassPanel strong style={{ position: 'relative', overflow: 'hidden', marginBottom: 16, textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 0%, rgba(185,56,46,.14), transparent 46%)' }} />
            <p style={{ ...kicker, position: 'relative', marginBottom: 14 }}>{index + 1} / {list.length}</p>
            {current && (
              <div style={{ position: 'relative' }}>
                <p lang="ja" style={{ margin: 0, fontSize: 30, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.35 }}>{current.kanji ?? current.displayKana ?? current.kana}</p>
                {current.kanji && <p lang="ja" style={{ margin: '8px 0 0', fontSize: 16, color: 'var(--ink-soft)', fontWeight: 650 }}>{current.displayKana ?? current.kana}</p>}
                <p style={{ margin: '10px 0 0', fontSize: 16, color: 'var(--accent)', fontWeight: 750 }}>{current.korean}</p>
              </div>
            )}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 26 }}>
              <button className="ym-press" onClick={() => goTo(index - 1)} aria-label="이전 문장"
                style={{ width: 46, height: 46, borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="back" size={18} />
              </button>
              <button className="ym-press" onClick={() => setPlaying((p) => !p)} disabled={!supported} aria-label={playing ? '일시정지' : '재생'}
                style={{ width: 72, height: 72, borderRadius: 999, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={playing ? 'cross' : 'listen'} size={30} />
              </button>
              <button className="ym-press" onClick={() => goTo(index + 1)} aria-label="다음 문장"
                style={{ width: 46, height: 46, borderRadius: 999, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: 'scaleX(-1)' }}>
                <Icon name="back" size={18} />
              </button>
            </div>
          </GlassPanel>

          {/* 재생 옵션 */}
          <GlassPanel>
            <OptionRow label="문장당 반복">
              {REPEAT_OPTIONS.map((n) => (
                <OptionChip key={n} active={repeatEach === n} onClick={() => setRepeatEach(n)}>{n}회</OptionChip>
              ))}
            </OptionRow>
            <OptionRow label="속도" style={{ marginTop: 12 }}>
              {RATE_OPTIONS.map((r) => (
                <OptionChip key={r} active={rate === r} onClick={() => setRate(r)}>{r}배속</OptionChip>
              ))}
            </OptionRow>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <ToggleChip active={loopAll} onClick={() => setLoopAll((v) => !v)} icon="recovery" label="전체 반복" />
              <ToggleChip active={keepAwake} onClick={() => setKeepAwake((v) => !v)} icon="theme-day" label="화면 유지" />
            </div>
          </GlassPanel>
        </>
      )}

      <button className="ym-press" onClick={onBack} style={{
        width: '100%', marginTop: 20, padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
        border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 750, fontSize: 14,
      }}>← 홈으로</button>
    </main>
  );
}

function OptionRow({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <p style={{ ...kicker, marginBottom: 8 }}>{label}</p>
      <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 12, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
        {children}
      </div>
    </div>
  );
}

function OptionChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="ym-press" onClick={onClick} style={{
      flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
      background: active ? 'var(--accent)' : 'transparent', color: active ? 'var(--accent-ink)' : 'var(--ink-soft)',
      fontWeight: 800, fontSize: 13,
    }}>{children}</button>
  );
}

function ToggleChip({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: Parameters<typeof Icon>[0]['name']; label: string }) {
  return (
    <button className="ym-press" onClick={onClick} style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 8px', borderRadius: 12, cursor: 'pointer',
      border: `1px solid ${active ? 'var(--ink)' : 'var(--glass-border)'}`,
      background: active ? hexA('#B9382E', 0.12) : 'var(--glass-bg-strong)',
      color: active ? 'var(--accent)' : 'var(--ink-soft)', fontWeight: 750, fontSize: 13.5,
    }}>
      <Icon name={icon} size={16} /> {label}{active ? ' · 켬' : ''}
    </button>
  );
}
