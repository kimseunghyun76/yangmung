// 듣기 — 이동 중(화면을 안 봐도) 학습한 표현을 이어서 반복 재생해 귀에 익히는 화면.
// 2026-07-29 신규, 2026-08-01 확장: 예전 "복습장"의 표현·장면별·약점 탭을 이 화면에 통합했다
// (가나 탭은 제외 — 학습 탭에서 계속 다룬다). 복습을 별도 화면으로 두기보다, 이미 배운 표현을
// "다시 듣는" 한 가지 동작으로 모으는 편이 더 자주 쓰인다는 판단.
import { useEffect, useMemo, useRef, useState } from 'react';
import { CONTENT } from '../content';
import type { Phrase } from '../content';
import type { Card } from '../learn/cards';
import { isAmbiguousReply } from '../learn/cards';
import { collectSeenPhraseIds, type ProgressMap } from '../learn/progress';
import { diagnose } from '../learn/adaptive';
import { patternForPhrase } from '../content/patterns';
import { phraseIdsByPlace, sceneVisualByPlace } from './scene';
import { speak, stopSpeaking, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead } from './ui';
import { GlassPanel, hexA } from './shell';
import { MascotEmpty } from './mascot';
import { BigTextOverlay, ZoomButton } from './BigText';
import { Furigana } from './Furigana';

// 한국어 번역문의 부정 표지로 긍정/부정을 나눈다(일본어 형태소 분석 없이, 이미 있는 번역
// 텍스트만으로 안전하게 판별) — "긍정·부정 답변을 함께 보여달라"는 요청 대응.
function isNegativeKo(korean: string): boolean {
  return /(안\s|않|없|아니|못\s|말아|마세요|말고)/.test(korean);
}

// 지금 표현의 "응용 표현"(같은 문형·같은 문법을 쓰는 다른 표현) — 하나만 달랑 보여주지 말고
// 문형 그룹(PATTERNS)이 있으면 그걸, 없으면 문법 태그(grammarRefs)가 겹치는 표현으로 폭넓게
// 찾는다(신규 문장 없이 기존 phrases.grammarRefs 연결만 재사용).
function relatedPhrasesFor(current: Phrase, byId: Record<string, Phrase>, seen: Set<string>): Phrase[] {
  const pattern = patternForPhrase(current.id);
  if (pattern) {
    return pattern.phraseIds
      .filter((id) => id !== current.id && seen.has(id))
      .map((id) => byId[id])
      .filter((p): p is Phrase => !!p && !isAmbiguousReply(p));
  }
  if (current.grammarRefs?.length) {
    return CONTENT.phrases.filter((p) =>
      p.id !== current.id && seen.has(p.id) && !isAmbiguousReply(p)
      && p.grammarRefs?.some((g) => current.grammarRefs!.includes(g)),
    ).slice(0, 6);
  }
  return [];
}

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
const WEAK_SCOPE = '__weak__';
const kicker: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 };

export function ListenMode({ nav, allCards, progress, onBack }: Props) {
  const phraseSeen = useMemo(() => collectSeenPhraseIds(allCards, progress), [allCards, progress]);
  const places = useMemo(() => phraseIdsByPlace(), []);
  const byId = useMemo(() => Object.fromEntries(CONTENT.phrases.map((p) => [p.id, p])), []);
  const diag = useMemo(() => diagnose(allCards, progress, 0), [allCards, progress]);
  // 듣기에 실제로 올릴 후보 — 배운 표현 중 단답형(네/감사합니다류)은 빼고 문장 형태만
  // ("간단한 내용보다 문장으로, 단답형은 제외해달라"는 요청).
  const listenableIds = useMemo(() => {
    const s = new Set<string>();
    for (const id of phraseSeen) { const p = byId[id]; if (p && !isAmbiguousReply(p)) s.add(id); }
    return s;
  }, [phraseSeen, byId]);
  // 학습한 표현이 하나라도 있는 장면만 선택지로 노출 — 빈 장면을 골라 "표현이 없어요"를 보게 하지 않는다.
  const scenePlaces = useMemo(() => places.filter((p) => p.phraseIds.some((id) => listenableIds.has(id))), [places, listenableIds]);
  // 약점 장면(정답률 낮음)의 표현들 — "약점" 스코프 전용 후보 풀.
  const weakPhraseIds = useMemo(() => {
    const ids = new Set<string>();
    for (const w of diag.weakScenes) {
      const place = places.find((p) => p.id === w.key);
      if (place) for (const pid of place.phraseIds) if (listenableIds.has(pid)) ids.add(pid);
    }
    return ids;
  }, [diag.weakScenes, places, listenableIds]);

  const [scope, setScope] = useState<string>('all'); // 'all' | WEAK_SCOPE | place.id
  const list = useMemo<Phrase[]>(() => {
    const ids = scope === 'all'
      ? [...listenableIds]
      : scope === WEAK_SCOPE
      ? [...weakPhraseIds]
      : (places.find((p) => p.id === scope)?.phraseIds ?? []).filter((id) => listenableIds.has(id));
    return ids.map((id) => byId[id]).filter((p): p is Phrase => Boolean(p));
  }, [scope, listenableIds, places, byId, weakPhraseIds]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loopAll, setLoopAll] = useState(true);
  const [repeatEach, setRepeatEach] = useState<number>(2);
  const [rate, setRate] = useState<number>(1);
  const [keepAwake, setKeepAwake] = useState(true);
  const [zoom, setZoom] = useState(false);
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
  const pattern = current ? patternForPhrase(current.id) : undefined;
  const related = current ? relatedPhrasesFor(current, byId, listenableIds) : [];
  // "긍정과 부정 답변도 함께 제공해달라" — 응용 표현 안에서 부정형(한국어 번역 기준)이 있으면
  // 긍정/부정으로 나눠 보여준다. 부정형이 없는 표현이면 억지로 만들지 않고 있는 그대로 보여준다.
  const relatedNegative = related.filter((p) => isNegativeKo(p.korean));
  const relatedAffirmative = related.filter((p) => !isNegativeKo(p.korean));

  return (
    <main style={WRAP}>
      <NavBar {...nav} current="listen" />
      <PageHead title="듣기" sub="배운 표현·장면·약점을 골라 반복해서 들어요 — 화면을 안 봐도 괜찮아요" />

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
            }}>전체 · {listenableIds.size}</button>
            {weakPhraseIds.size > 0 && (
              <button className="ym-press" onClick={() => setScope(WEAK_SCOPE)} style={{
                flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6, padding: '9px 13px', borderRadius: 999, cursor: 'pointer', fontWeight: 750, fontSize: 13.5, whiteSpace: 'nowrap',
                border: `1px solid ${scope === WEAK_SCOPE ? 'var(--warn)' : 'var(--glass-border)'}`,
                background: scope === WEAK_SCOPE ? 'var(--warn)' : 'var(--glass-bg-strong)',
                color: scope === WEAK_SCOPE ? '#fff' : 'var(--warn)',
              }}>
                <Icon name="recovery" size={15} /> 약점 · {weakPhraseIds.size}
              </button>
            )}
            {scenePlaces.map((p) => {
              const active = scope === p.id;
              const sv = sceneVisualByPlace(p.place);
              const count = p.phraseIds.filter((id) => listenableIds.has(id)).length;
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
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ ...kicker, margin: 0 }}>{index + 1} / {list.length}</p>
              {current && <ZoomButton size={34} onClick={() => setZoom(true)} />}
            </div>
            {current && (
              <div style={{ position: 'relative', marginTop: 10 }}>
                <Furigana kanji={current.kanji} kana={current.displayKana ?? current.kana}
                  style={{ display: 'block', fontSize: 30, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.7 }} />
                <p style={{ margin: '10px 0 0', fontSize: 16, color: 'var(--accent)', fontWeight: 750 }}>{current.korean}</p>

                {/* 응용 표현 — 하나만 보여주지 않고 늘 함께 펼쳐 보여준다("응용 표현도 함께
                    제시해달라"는 요청 — 예전엔 눌러야만 보이는 토글이었다). 긍정/부정이 섞여
                    있으면 나눠서, 하나만 있으면 있는 대로 보여준다. */}
                {related.length > 0 && (
                  <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 12, background: 'var(--glass-bg)', border: '1px dashed var(--glass-border)', textAlign: 'left' }}>
                    <p style={{ margin: '0 0 8px', fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon name="flow" size={12} /> {pattern ? `같은 틀 · ${pattern.structure}` : '응용 표현'}
                    </p>
                    {relatedAffirmative.length > 0 && (
                      <RelatedGroup label={relatedNegative.length > 0 ? '긍정' : undefined} items={relatedAffirmative} />
                    )}
                    {relatedNegative.length > 0 && (
                      <RelatedGroup label="부정" items={relatedNegative} style={{ marginTop: relatedAffirmative.length > 0 ? 10 : 0 }} />
                    )}
                  </div>
                )}
              </div>
            )}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 22 }}>
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

          {zoom && current && (
            <BigTextOverlay ja={current.kanji ?? current.displayKana ?? current.kana} sub={current.korean} onClose={() => setZoom(false)} />
          )}
        </>
      )}

      <button className="ym-press" onClick={onBack} style={{
        width: '100%', marginTop: 20, padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
        border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 750, fontSize: 14,
      }}>← 홈으로</button>
    </main>
  );
}

// 응용 표현 한 묶음 — label이 있으면(긍정/부정 둘 다 있을 때) 작은 배지로, 없으면 라벨 없이.
function RelatedGroup({ label, items, style }: { label?: string; items: Phrase[]; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      {label && (
        <span style={{
          display: 'inline-block', marginBottom: 5, padding: '1px 7px', borderRadius: 999,
          fontSize: 10, fontWeight: 900, color: label === '부정' ? 'var(--warn)' : 'var(--ok)',
          background: label === '부정' ? 'var(--warn-soft)' : 'var(--ok-soft)',
        }}>{label}</span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((s) => (
          <p key={s.id} lang="ja" style={{ margin: 0, fontSize: 12.5, color: 'var(--ink)' }}>
            {s.kanji ?? s.displayKana ?? s.kana} <span lang="ko" style={{ color: 'var(--ink-faint)' }}>· {s.korean}</span>
          </p>
        ))}
      </div>
    </div>
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
