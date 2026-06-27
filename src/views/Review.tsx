// 복습장 — 4구획 라이브러리: 가나 / 표현 / 장면별 / 약점. (퀴즈 없이 다시 보기)
import { useMemo, useState } from 'react';
import { CONTENT } from '../content';
import type { KanaItem, Phrase } from '../content';
import type { Card } from '../learn/cards';
import { countSeenKana, isKanaReadStable, type ProgressMap, type SeenKana } from '../learn/progress';
import { isSceneOpen } from '../learn/unlocks';
import { diagnose } from '../learn/adaptive';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead, SceneImageThumb } from './ui';
import { GlassPanel, hexA } from './shell';
import { sceneVisualByPlace } from './scene';
import { phraseIdsByPlace } from './scene';
import { MascotEmpty } from './mascot';

interface Props {
  nav: NavBarProps;
  allCards: Card[];
  progress: ProgressMap;
  seenKana: SeenKana;
  openMissions: string[];
  devUnlockAll: boolean;
  onStartReview?: () => void;
  onPracticeScene?: (missionId: string) => void;
  onBack: () => void;
}

type Tab = '가나' | '표현' | '장면별' | '약점';
const TABS: Tab[] = ['가나', '표현', '장면별', '약점'];
const kicker: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 };

export function Review({ nav, allCards, progress, seenKana, openMissions, devUnlockAll, onStartReview, onPracticeScene }: Props) {
  const [tab, setTab] = useState<Tab>('가나');
  const phraseSeen = useMemo(() => collectSeenPhraseIds(allCards, progress), [allCards, progress]);
  const lastSeen = useMemo(() => phraseLastSeenMap(allCards, progress), [allCards, progress]);
  const places = useMemo(() => phraseIdsByPlace(), []);
  const byId = useMemo(() => Object.fromEntries(CONTENT.phrases.map((p) => [p.id, p])), []);
  const diag = useMemo(() => diagnose(allCards, progress, 0), [allCards, progress]);

  const hira = useMemo(() => CONTENT.kana.filter((k) => k.script === 'hiragana' && !!(progress[`kana:${k.id}:read`] || progress[`kana:${k.id}:listen`] || progress[`kana:${k.id}:confuse`])), [progress]);
  const kata = useMemo(() => CONTENT.kana.filter((k) => (k.script === 'katakana' || k.script === 'common') && !!(progress[`kana:${k.id}:read`] || progress[`kana:${k.id}:listen`] || progress[`kana:${k.id}:confuse`])), [progress]);
  // 진도 나간 표현만. 검색/필터는 PhraseTab에서.
  const allSorted = useMemo(() => [...CONTENT.phrases].sort((a, b) => {
    const sa = phraseSeen.has(a.id), sb = phraseSeen.has(b.id);
    if (sa !== sb) return sa ? -1 : 1;
    return (lastSeen[b.id] ?? '') < (lastSeen[a.id] ?? '') ? -1 : 1;
  }), [phraseSeen, lastSeen]);

  return (
    <main style={WRAP}>
      <NavBar {...nav} />
      <PageHead title="복습장" sub={<>퀴즈 없이 다시 보는 곳 · 지금까지 본 가나 <strong style={{ color: 'var(--accent)' }}>{countSeenKana(seenKana)}자</strong></>} />

      {/* 4구획 세그먼트 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {TABS.map((t) => {
          const on = tab === t;
          return (
            <button key={t} className="ym-press" onClick={() => setTab(t)}
              style={{ flex: 1, padding: '10px 4px', borderRadius: 12, border: `1px solid ${on ? 'transparent' : 'var(--glass-border)'}`, background: on ? 'var(--accent)' : 'var(--glass-bg-strong)', color: on ? 'var(--accent-ink)' : 'var(--ink-soft)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {t}
            </button>
          );
        })}
      </div>

      {tab === '가나' && (
        hira.length === 0 && kata.length === 0 ? (
          <GlassPanel><Empty>아직 학습한 가나가 없어요. 학습을 시작하면 여기에 나타나요.</Empty></GlassPanel>
        ) : (
          <>
            {hira.length > 0 && <GlassPanel style={{ marginBottom: 14 }}><p style={{ ...kicker, marginBottom: 8 }}>히라가나 ({hira.length}자 학습)</p><KanaGrid items={hira} progress={progress} /></GlassPanel>}
            {kata.length > 0 && <GlassPanel><p style={{ ...kicker, marginBottom: 8 }}>가타카나 · 특수 ({kata.length}자 학습)</p><KanaGrid items={kata} progress={progress} /></GlassPanel>}
          </>
        )
      )}

      {tab === '표현' && <PhraseTab phrases={allSorted} phraseSeen={phraseSeen} />}

      {tab === '장면별' && <SceneSheets places={places} byId={byId} phraseSeen={phraseSeen} openMissions={openMissions} devUnlockAll={devUnlockAll} />}

      {tab === '약점' && (
        <GlassPanel>
          <p style={{ ...kicker, marginBottom: 12 }}>다시 다질 약점</p>
          {diag.weakKana.length === 0 && diag.weakScenes.length === 0 ? (
            <Empty>아직 뚜렷한 약점이 없어요. 잘하고 있어요!</Empty>
          ) : (
            <>
              {diag.weakKana.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', margin: '0 0 8px' }}>약한 글자</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {diag.weakKana.map((w) => (
                      <button key={w.key} className="ym-press" onClick={() => speak(w.label)} disabled={!ttsSupported()}
                        style={{ width: 52, height: 52, borderRadius: 13, border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 24, fontWeight: 700, cursor: 'pointer' }}>{w.label}</button>
                    ))}
                  </div>
                </div>
              )}
              {diag.weakScenes.length > 0 && (
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)', margin: '0 0 8px' }}>약한 장면</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {diag.weakScenes.map((w) => {
                      const sv = sceneVisualByPlace(w.label);
                      return (
                        <button key={w.key} className="ym-press" onClick={() => onPracticeScene?.(w.key)} disabled={!onPracticeScene}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 999, border: '1px solid var(--glass-border)', background: hexA(sv.accent, 0.12), color: 'var(--ink)', fontSize: 14, fontWeight: 600, cursor: onPracticeScene ? 'pointer' : 'default' }}>
                          <span style={{ color: sv.accent, display: 'inline-flex' }}><Icon name={sv.icon} size={16} /></span>{w.label}
                          {onPracticeScene && <Icon name="flow" size={14} style={{ color: 'var(--ink-faint)' }} />}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--ink-faint)' }}>장면을 누르면 그 장면을 바로 연습해요.</p>
                </div>
              )}
              {onStartReview && (
                <button className="ym-press" onClick={onStartReview}
                  style={{ width: '100%', marginTop: 16, padding: '14px 16px', borderRadius: 16, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Icon name="recovery" size={18} /> 약점 복습 한 판 시작
                </button>
              )}
            </>
          )}
        </GlassPanel>
      )}
    </main>
  );
}

// 표현 탭 — 검색만. 제공된(본 적 있음) 표현 전체에서 검색하며, 예정/미제공 표현은 결과에서 제외.
function PhraseTab({ phrases, phraseSeen }: { phrases: Phrase[]; phraseSeen: Set<string> }) {
  const [q, setQ] = useState('');
  const nq = q.trim().toLowerCase();
  const list = phrases.filter((p) => {
    // 예정·아직 제공 안 된 표현은 검색 결과에서 제외
    if (!phraseSeen.has(p.id)) return false;
    if (nq) {
      const hay = `${p.kanji ?? ''} ${p.displayKana ?? ''} ${p.kana} ${p.korean} ${p.romaji ?? ''}`.toLowerCase();
      if (!hay.includes(nq)) return false;
    }
    return true;
  });
  return (
    <GlassPanel>
      {/* 검색 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', marginBottom: 12 }}>
        <Icon name="discover" size={16} style={{ color: 'var(--ink-faint)' }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="표현·뜻·로마자 검색"
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--ink)', fontSize: 15, fontFamily: 'inherit' }}
        />
        {q && <button onClick={() => setQ('')} aria-label="지우기" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-faint)', fontSize: 16, padding: 2, minHeight: 0 }}>✕</button>}
      </div>
      <p style={{ ...kicker, marginBottom: 10 }}>표현 {list.length}</p>
      {list.length === 0
        ? <Empty>{nq ? '검색 결과가 없어요.' : '해당 표현이 없어요.'}</Empty>
        : <PhraseList phrases={list} phraseSeen={phraseSeen} />}
    </GlassPanel>
  );
}

function SceneSheets({ places, byId, phraseSeen, openMissions, devUnlockAll }: {
  places: { id: string; place: string; tier: number; phraseIds: string[] }[];
  byId: Record<string, Phrase>;
  phraseSeen: Set<string>;
  openMissions: string[];
  devUnlockAll: boolean;
}) {
  const isOpen = (id: string) => isSceneOpen(id, openMissions, devUnlockAll);
  const firstOpen = places.find((p) => isOpen(p.id))?.id;
  const [sel, setSel] = useState(firstOpen ?? places[0]?.id ?? '');
  if (places.length === 0) {
    return <GlassPanel><Empty>아직 장면이 없어요.</Empty></GlassPanel>;
  }
  const cur = places.find((p) => p.id === sel) ?? places[0];
  const curOpen = isOpen(cur.id);
  const openCount = places.filter((p) => isOpen(p.id)).length;

  return (
    <>
      {/* 셀렉트박스 — 장소 선택 (잠긴 곳은 ??? 신비 처리) */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ ...kicker, display: 'block', marginBottom: 8 }}>장면 선택 · {openCount}/{places.length} 개방</label>
        <div style={{ position: 'relative' }}>
          <select value={sel} onChange={(e) => setSel(e.target.value)}
            style={{ width: '100%', appearance: 'none', WebkitAppearance: 'none', padding: '13px 40px 13px 14px', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>
            {places.map((p, i) => {
              const open = isOpen(p.id);
              const seenCount = p.phraseIds.filter((id) => phraseSeen.has(id)).length;
              return <option key={p.id} value={p.id}>{open ? `${p.place} (${seenCount}/${p.phraseIds.length})` : `🔒 미개방 ${i + 1}`}</option>;
            })}
          </select>
          <Icon name="flow" size={18} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* 열린 장면: 표현 패널 / 잠긴 장면: 카드 해제 패널 */}
      {curOpen ? (() => {
        const sv = sceneVisualByPlace(cur.place);
        const seenCount = cur.phraseIds.filter((id) => phraseSeen.has(id)).length;
        const total = cur.phraseIds.length;
        const pct = total ? Math.round((seenCount / total) * 100) : 0;
        const seenPhrases = cur.phraseIds.filter((id) => phraseSeen.has(id)).map((id) => byId[id]).filter(Boolean);
        return (
          <GlassPanel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <SceneImageThumb src={sv.backdrop ?? sv.thumb} icon={sv.icon} accent={sv.accent} size={52} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ ...kicker, marginBottom: 3 }}>{cur.place}</p>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>{seenCount}/{total} 완료 · {pct}%</p>
                <div style={{ marginTop: 6, height: 4, borderRadius: 99, background: 'var(--glass-border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, background: sv.accent, width: `${pct}%` }} />
                </div>
              </div>
            </div>
            {seenPhrases.length
              ? <PhraseList phrases={seenPhrases} phraseSeen={phraseSeen} />
              : <Empty>이 장면은 열렸지만 아직 학습한 표현이 없어요. 지도에서 연습해보세요.</Empty>}
          </GlassPanel>
        );
      })() : (
        <GlassPanel>
          <div style={{ textAlign: 'center', padding: '14px 6px' }}>
            <div style={{ fontSize: 42 }}>🔒</div>
            <p style={{ margin: '10px 0 0', fontWeight: 800, fontSize: 16 }}>아직 열리지 않은 장면</p>
            <p style={{ margin: '6px 0 0', color: 'var(--ink-soft)', fontSize: 13, lineHeight: 1.5 }}>지금 열린 미션을 더 학습하면<br />다음 장면이 무작위로 열려요.</p>
          </div>
        </GlassPanel>
      )}
    </>
  );
}

function collectSeenPhraseIds(allCards: Card[], progress: ProgressMap): Set<string> {
  const out = new Set<string>();
  for (const c of allCards) {
    if (!progress[c.id]) continue;
    if (c.kind === 'introduce') out.add(c.phraseId);
    if (c.kind === 'speak') { const pid = c.id.split(':').slice(2).join(':'); if (pid) out.add(pid); }
    if (c.kind === 'quiz' && c.id.startsWith('listen:')) { const pid = c.id.slice('listen:'.length); if (pid) out.add(pid); }
    if (c.kind === 'quiz') {
      if (c.promptPhrase?.id) out.add(c.promptPhrase.id);
      for (const choice of c.choices) if (choice.phrase?.id) out.add(choice.phrase.id);
    }
  }
  return out;
}

function phraseLastSeenMap(allCards: Card[], progress: ProgressMap): Record<string, string> {
  const out: Record<string, string> = {};
  const bump = (pid: string, t?: string) => { if (t && (out[pid] ?? '') < t) out[pid] = t; };
  for (const c of allCards) {
    const p = progress[c.id]; if (!p) continue;
    if (c.kind === 'introduce') bump(c.phraseId, p.lastSeenAt);
    else if (c.kind === 'speak') bump(c.id.split(':').slice(2).join(':'), p.lastSeenAt);
    else if (c.kind === 'quiz') {
      if (c.id.startsWith('listen:')) bump(c.id.slice(7), p.lastSeenAt);
      if (c.promptPhrase?.id) bump(c.promptPhrase.id, p.lastSeenAt);
      for (const ch of c.choices) if (ch.phrase?.id) bump(ch.phrase.id, p.lastSeenAt);
    } else if (c.kind === 'dictation') bump(c.id.slice('dictation:'.length), p.lastSeenAt);
  }
  return out;
}

function KanaGrid({ items, progress }: { items: KanaItem[]; progress: ProgressMap }) {
  const groups = groupBy(items, (k) => `${k.level} · ${k.group}`);
  return (
    <>
      {Object.entries(groups).map(([label, ks]) => (
        <div key={label} style={{ marginTop: 10 }}>
          <p style={{ margin: '0 0 6px', color: 'var(--ink-faint)', fontSize: 12, fontWeight: 600 }}>{label}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: 7 }}>
            {ks.map((k) => {
              const stable = isKanaReadStable(progress, k.id);
              const seen = !!(progress[`kana:${k.id}:read`] || progress[`kana:${k.id}:listen`] || progress[`kana:${k.id}:confuse`]);
              return (
                <button key={k.id} className="ym-press"
                  style={{ padding: '8px 4px', borderRadius: 12, cursor: 'pointer', border: `1px solid ${stable ? 'var(--ok)' : seen ? 'var(--accent)' : 'var(--glass-border)'}`, background: stable ? 'var(--ok-soft)' : seen ? 'var(--accent-soft)' : 'var(--glass-bg-strong)', color: 'var(--ink)' }}
                  onClick={() => speak(k.char)} disabled={!ttsSupported()} title={stable ? '읽기 안정' : seen ? '본 적 있음' : '아직'}>
                  <div style={{ fontSize: 24, lineHeight: 1.1 }}>{k.char}</div>
                  <div style={{ color: 'var(--ink-faint)', fontSize: 10 }}>{k.romaji}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function PhraseList({ phrases, phraseSeen }: { phrases: Phrase[]; phraseSeen: Set<string> }) {
  if (phrases.length === 0) return <Empty>표현이 없어요.</Empty>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {phrases.map((p) => {
        const seen = phraseSeen.has(p.id);
        return (
          <div key={p.id} style={{ background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{p.kanji ?? p.displayKana ?? p.kana}</p>
                <p style={{ margin: '3px 0 0', color: 'var(--ink-soft)', fontSize: 13 }}>{p.displayKana ?? p.kana} · {p.korean}</p>
              </div>
              <button className="ym-press" onClick={() => speak(p.displayKana ?? p.kana)} disabled={!ttsSupported()}
                style={{ width: 44, height: 44, flex: '0 0 44px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--accent-soft)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="listen" size={18} />
              </button>
            </div>
            {p.tip && <p style={{ margin: '8px 0 0', color: 'var(--ink-soft)', fontSize: 13, display: 'flex', gap: 6 }}><Icon name="tip" size={14} style={{ marginTop: 2, flex: '0 0 14px' }} /><span>{p.tip}</span></p>}
            <p style={{ margin: '8px 0 0', color: seen ? 'var(--ok)' : 'var(--ink-faint)', fontSize: 12, fontWeight: 600 }}>{seen ? '본 적 있음' : '예정 표현'}</p>
          </div>
        );
      })}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <MascotEmpty who="yang" title="아직 채울 공간이에요">{children}</MascotEmpty>;
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of items) { const k = key(item); (out[k] ??= []).push(item); }
  return out;
}
