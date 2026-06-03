// 복습장 — 4구획 라이브러리: 가나 / 표현 / 장면별 / 약점. (퀴즈 없이 다시 보기)
import { useMemo, useState } from 'react';
import { CONTENT } from '../content';
import type { KanaItem, Phrase } from '../content';
import type { Card } from '../learn/cards';
import { countSeenKana, isKanaReadStable, type ProgressMap, type SeenKana } from '../learn/progress';
import { diagnose } from '../learn/adaptive';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead, SceneImageThumb } from './ui';
import { GlassPanel, hexA } from './shell';
import { sceneVisualByPlace } from './scene';
import { phraseIdsByPlace } from './scene';

interface Props {
  nav: NavBarProps;
  allCards: Card[];
  progress: ProgressMap;
  seenKana: SeenKana;
  onBack: () => void;
}

type Tab = '가나' | '표현' | '장면별' | '약점';
const TABS: Tab[] = ['가나', '표현', '장면별', '약점'];
const kicker: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 };

export function Review({ nav, allCards, progress, seenKana }: Props) {
  const [tab, setTab] = useState<Tab>('가나');
  const phraseSeen = useMemo(() => collectSeenPhraseIds(allCards, progress), [allCards, progress]);
  const lastSeen = useMemo(() => phraseLastSeenMap(allCards, progress), [allCards, progress]);
  const places = useMemo(() => phraseIdsByPlace(), []);
  const byId = useMemo(() => Object.fromEntries(CONTENT.phrases.map((p) => [p.id, p])), []);
  const diag = useMemo(() => diagnose(allCards, progress, 0), [allCards, progress]);

  const hira = CONTENT.kana.filter((k) => k.script === 'hiragana');
  const kata = CONTENT.kana.filter((k) => k.script === 'katakana' || k.script === 'common');
  const learned = CONTENT.phrases.filter((p) => phraseSeen.has(p.id))
    .sort((a, b) => (lastSeen[b.id] ?? '') < (lastSeen[a.id] ?? '') ? -1 : 1);

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
        <>
          <GlassPanel style={{ marginBottom: 14 }}><p style={{ ...kicker, marginBottom: 8 }}>히라가나</p><KanaGrid items={hira} progress={progress} /></GlassPanel>
          <GlassPanel><p style={{ ...kicker, marginBottom: 8 }}>가타카나 · 특수</p><KanaGrid items={kata} progress={progress} /></GlassPanel>
        </>
      )}

      {tab === '표현' && (
        <GlassPanel>
          <p style={{ ...kicker, marginBottom: 10 }}>만난 표현 {learned.length}</p>
          {learned.length === 0
            ? <Empty>아직 복습할 표현이 없어요. 첫 세션을 진행하면 여기에 쌓입니다.</Empty>
            : <PhraseList phrases={learned} phraseSeen={phraseSeen} />}
        </GlassPanel>
      )}

      {tab === '장면별' && <SceneSheets places={places} byId={byId} phraseSeen={phraseSeen} />}

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
                        <span key={w.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 999, border: '1px solid var(--glass-border)', background: hexA(sv.accent, 0.12), color: 'var(--ink)', fontSize: 14, fontWeight: 600 }}>
                          <span style={{ color: sv.accent, display: 'inline-flex' }}><Icon name={sv.icon} size={16} /></span>{w.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              <p style={{ margin: '14px 0 0', fontSize: 12, color: 'var(--ink-faint)' }}>홈에서 시작하면 약점이 우선 출제돼요.</p>
            </>
          )}
        </GlassPanel>
      )}
    </main>
  );
}

function SceneSheets({ places, byId, phraseSeen }: { places: { place: string; phraseIds: string[] }[]; byId: Record<string, Phrase>; phraseSeen: Set<string> }) {
  const [sel, setSel] = useState(places[0]?.place ?? '');
  const cur = places.find((p) => p.place === sel);
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {places.map((p) => {
          const sv = sceneVisualByPlace(p.place); const on = sel === p.place;
          return (
            <button key={p.place} className="ym-press" onClick={() => setSel(p.place)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, border: `1px solid ${on ? 'var(--ink)' : 'var(--glass-border)'}`, background: on ? hexA(sv.accent, 0.9) : 'var(--glass-bg-strong)', color: on ? '#fff' : 'var(--ink)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              <span style={{ display: 'inline-flex', color: on ? '#fff' : sv.accent }}><Icon name={sv.icon} size={15} /></span>{p.place}
            </button>
          );
        })}
      </div>
      <GlassPanel>
        {(() => {
          const sv = sceneVisualByPlace(sel);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <SceneImageThumb src={sv.backdrop ?? sv.thumb} icon={sv.icon} accent={sv.accent} size={58} />
              <div>
                <p style={{ ...kicker, marginBottom: 4 }}>{sel}에서 쓰는 표현</p>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', fontWeight: 650 }}>장면을 떠올리면서 다시 들어보세요.</p>
              </div>
            </div>
          );
        })()}
        <PhraseList phrases={(cur?.phraseIds ?? []).map((id) => byId[id]).filter(Boolean)} phraseSeen={phraseSeen} />
      </GlassPanel>
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
              <button className="ym-press" onClick={() => speak(p.kanji ?? p.displayKana ?? p.kana)} disabled={!ttsSupported()}
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
  return <p style={{ color: 'var(--ink-faint)', fontSize: 14, margin: 0, textAlign: 'center', padding: '12px 0' }}>{children}</p>;
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of items) { const k = key(item); (out[k] ??= []).push(item); }
  return out;
}
