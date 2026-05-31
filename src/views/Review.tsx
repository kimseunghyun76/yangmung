// 복습장 — 진행 중 언제든 가나 표와 만난 표현을 다시 확인. 장면별 필터(여행 치트시트).
import { useMemo, useState } from 'react';
import { CONTENT } from '../content';
import type { KanaItem, Phrase } from '../content';
import type { Card } from '../learn/cards';
import { countSeenKana, isKanaReadStable, type ProgressMap, type SeenKana } from '../learn/progress';
import { speak, ttsSupported } from '../tts';
import { BTN, CARD, COLORS, PRIMARY, WRAP } from '../ui/styles';
import { NavBar, type NavBarProps } from './NavBar';
import { phraseIdsByPlace } from './scene';

interface Props {
  nav: NavBarProps;
  allCards: Card[];
  progress: ProgressMap;
  seenKana: SeenKana;
  onBack: () => void;
}

type Filter = '전체' | '최근' | string; // string = place

export function Review({ nav, allCards, progress, seenKana, onBack }: Props) {
  const [filter, setFilter] = useState<Filter>('전체');
  const phraseSeen = useMemo(() => collectSeenPhraseIds(allCards, progress), [allCards, progress]);
  const lastSeen = useMemo(() => phraseLastSeenMap(allCards, progress), [allCards, progress]);
  const places = useMemo(() => phraseIdsByPlace(), []);
  const phrases = CONTENT.phrases;
  const byId = useMemo(() => Object.fromEntries(phrases.map((p) => [p.id, p])), [phrases]);

  const hira = CONTENT.kana.filter((k) => k.script === 'hiragana');
  const kata = CONTENT.kana.filter((k) => k.script === 'katakana' || k.script === 'common');
  const learned = phrases.filter((p) => phraseSeen.has(p.id));

  const chips: Filter[] = ['전체', ...places.map((p) => p.place), '최근'];

  return (
    <main style={WRAP}>
      <NavBar {...nav} />
      <h1 style={{ marginBottom: 4 }}>📚 복습장</h1>
      <p style={{ color: '#888', marginTop: 0, fontSize: 13 }}>배운 글자와 표현을 퀴즈 없이 다시 보는 곳 · 여행 중 빠른 참조</p>
      <p style={{ color: '#4f46e5', marginTop: 6, fontSize: 14, fontWeight: 600 }}>👀 지금까지 본 가나 {countSeenKana(seenKana)}자</p>

      {/* 필터 칩 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{ ...BTN, padding: '5px 12px', fontSize: 13, background: filter === c ? '#4f46e5' : '#fff', color: filter === c ? '#fff' : '#444' }}
          >
            {c}
          </button>
        ))}
      </div>

      {filter === '전체' ? (
        <>
          <Section title="히라가나"><KanaGrid items={hira} progress={progress} /></Section>
          <Section title="가타카나·특수 표기"><KanaGrid items={kata} progress={progress} /></Section>
          <Section title={`만난 표현 ${learned.length}개`}>
            {learned.length === 0
              ? <p style={{ color: '#888', fontSize: 14, margin: '6px 0 0' }}>아직 복습할 표현이 없어요. 첫 세션을 진행하면 여기에 쌓입니다.</p>
              : <PhraseList phrases={learned} phraseSeen={phraseSeen} />}
          </Section>
          <Section title="곧 만날 표현">
            <PhraseList phrases={phrases.filter((p) => !phraseSeen.has(p.id)).slice(0, 18)} phraseSeen={phraseSeen} />
          </Section>
        </>
      ) : filter === '최근' ? (
        <Section title="최근 본 표현">
          {(() => {
            const recent = learned.filter((p) => lastSeen[p.id]).sort((a, b) => (lastSeen[b.id] ?? '') < (lastSeen[a.id] ?? '') ? -1 : 1).slice(0, 20);
            return recent.length === 0
              ? <p style={{ color: '#888', fontSize: 14, margin: '6px 0 0' }}>아직 본 표현이 없어요.</p>
              : <PhraseList phrases={recent} phraseSeen={phraseSeen} />;
          })()}
        </Section>
      ) : (
        // 장면별 치트시트 — 그 장소에서 쓰는 모든 표현 (배운 것/예정 표시)
        <Section title={`${filter}에서 쓰는 표현`}>
          {(() => {
            const ids = places.find((p) => p.place === filter)?.phraseIds ?? [];
            const scenePhrases = ids.map((id) => byId[id]).filter(Boolean);
            return <PhraseList phrases={scenePhrases} phraseSeen={phraseSeen} />;
          })()}
        </Section>
      )}

      <button style={{ ...PRIMARY, marginTop: 20, width: '100%' }} onClick={onBack}>홈으로</button>
    </main>
  );
}

// 표현별 마지막으로 본 시각 (최근 필터용) — 관련 카드 progress의 lastSeenAt 최댓값.
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

function collectSeenPhraseIds(allCards: Card[], progress: ProgressMap): Set<string> {
  const out = new Set<string>();
  for (const c of allCards) {
    if (!progress[c.id]) continue;
    if (c.kind === 'introduce') out.add(c.phraseId);
    if (c.kind === 'speak') {
      const phraseId = c.id.split(':').slice(2).join(':');
      if (phraseId) out.add(phraseId);
    }
    if (c.kind === 'quiz' && c.id.startsWith('listen:')) {
      const phraseId = c.id.slice('listen:'.length);
      if (phraseId) out.add(phraseId);
    }
    if (c.kind === 'quiz') {
      if (c.promptPhrase?.id) out.add(c.promptPhrase.id);
      for (const choice of c.choices) {
        if (choice.phrase?.id) out.add(choice.phrase.id);
      }
    }
  }
  return out;
}

function KanaGrid({ items, progress }: { items: KanaItem[]; progress: ProgressMap }) {
  const groups = groupBy(items, (k) => `${k.level} · ${k.group}`);
  return (
    <>
      {Object.entries(groups).map(([label, ks]) => (
        <div key={label} style={{ marginTop: 10 }}>
          <p style={{ margin: '0 0 6px', color: '#777', fontSize: 12, fontWeight: 600 }}>{label}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 8 }}>
            {ks.map((k) => {
              const stable = isKanaReadStable(progress, k.id);
              const seen = !!(progress[`kana:${k.id}:read`] || progress[`kana:${k.id}:listen`] || progress[`kana:${k.id}:confuse`]);
              return (
                <button
                  key={k.id}
                  style={{
                    ...BTN,
                    padding: '8px 4px',
                    background: stable ? '#dcfce7' : seen ? '#eef2ff' : '#fff',
                    borderColor: stable ? '#86efac' : seen ? '#c7d2fe' : '#e5e7eb',
                  }}
                  onClick={() => speak(k.char)}
                  disabled={!ttsSupported()}
                  title={stable ? '읽기 안정' : seen ? '본 적 있음' : '아직'}
                >
                  <div style={{ fontSize: 26, lineHeight: 1.1 }}>{k.char}</div>
                  <div style={{ color: '#666', fontSize: 11 }}>{k.romaji} · {k.koreanSound}</div>
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
  if (phrases.length === 0) return <p style={{ color: '#888', fontSize: 14, margin: '6px 0 0' }}>표현이 없어요.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      {phrases.map((p) => {
        const seen = phraseSeen.has(p.id);
        return (
          <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{p.kanji ?? p.displayKana ?? p.kana}</p>
                <p style={{ margin: '3px 0 0', color: '#666', fontSize: 13 }}>{p.displayKana ?? p.kana} · {p.korean}</p>
              </div>
              <button style={{ ...BTN, width: 44, flex: '0 0 44px' }} onClick={() => speak(p.kanji ?? p.displayKana ?? p.kana)} disabled={!ttsSupported()}>🔊</button>
            </div>
            {p.tip && <p style={{ margin: '8px 0 0', color: '#555', fontSize: 13 }}>💡 {p.tip}</p>}
            <p style={{ margin: '8px 0 0', color: seen ? '#16a34a' : '#999', fontSize: 12 }}>{seen ? '✓ 본 적 있음' : '예정 표현'}</p>
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...CARD, marginTop: 14 }}>
      <p style={{ margin: '0 0 6px', fontSize: 13, color: COLORS.inkSoft, fontWeight: 700 }}>{title}</p>
      {children}
    </div>
  );
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const item of items) {
    const k = key(item);
    (out[k] ??= []).push(item);
  }
  return out;
}
