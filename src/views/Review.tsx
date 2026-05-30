// 복습장 — 진행 중 언제든 가나 표와 이미 만난 표현을 다시 확인.
import { CONTENT } from '../content';
import type { KanaItem, Phrase } from '../content';
import type { Card } from '../learn/cards';
import { isKanaReadStable, type ProgressMap } from '../learn/progress';
import { speak, ttsSupported } from '../tts';
import { BTN, PRIMARY, WRAP } from '../ui/styles';

interface Props {
  allCards: Card[];
  progress: ProgressMap;
  onBack: () => void;
}

export function Review({ allCards, progress, onBack }: Props) {
  const phraseSeen = collectSeenPhraseIds(allCards, progress);
  const hira = CONTENT.kana.filter((k) => k.script === 'hiragana');
  const kata = CONTENT.kana.filter((k) => k.script === 'katakana' || k.script === 'common');
  const phrases = CONTENT.phrases;
  const learned = phrases.filter((p) => phraseSeen.has(p.id));
  const next = phrases.filter((p) => !phraseSeen.has(p.id)).slice(0, 18);

  return (
    <main style={WRAP}>
      <h1 style={{ marginBottom: 4 }}>📚 복습장</h1>
      <p style={{ color: '#888', marginTop: 0, fontSize: 13 }}>배운 글자와 표현을 퀴즈 없이 다시 보는 곳</p>

      <Section title="히라가나">
        <KanaGrid items={hira} progress={progress} />
      </Section>

      <Section title="가타카나·특수 표기">
        <KanaGrid items={kata} progress={progress} />
      </Section>

      <Section title={`만난 표현 ${learned.length}개`}>
        {learned.length === 0 ? (
          <p style={{ color: '#888', fontSize: 14, margin: '6px 0 0' }}>아직 복습할 표현이 없어요. 첫 세션을 한 번 진행하면 여기에 쌓입니다.</p>
        ) : (
          <PhraseList phrases={learned} seen />
        )}
      </Section>

      <Section title="곧 만날 표현">
        <PhraseList phrases={next} />
      </Section>

      <button style={{ ...PRIMARY, marginTop: 20, width: '100%' }} onClick={onBack}>홈으로</button>
    </main>
  );
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

function PhraseList({ phrases, seen = false }: { phrases: Phrase[]; seen?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      {phrases.map((p) => (
        <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{p.kanji ?? p.displayKana ?? p.kana}</p>
              <p style={{ margin: '3px 0 0', color: '#666', fontSize: 13 }}>{p.displayKana ?? p.kana} · {p.korean}</p>
            </div>
            <button style={{ ...BTN, width: 44, flex: '0 0 44px' }} onClick={() => speak(p.kanji ?? p.displayKana ?? p.kana)} disabled={!ttsSupported()}>🔊</button>
          </div>
          {p.tip && <p style={{ margin: '8px 0 0', color: '#555', fontSize: 13 }}>💡 {p.tip}</p>}
          <p style={{ margin: '8px 0 0', color: seen ? '#16a34a' : '#999', fontSize: 12 }}>{seen ? '본 적 있음' : '예정 표현'}</p>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 18 }}>
      <p style={{ margin: '0 0 6px', fontSize: 13, color: '#666', fontWeight: 600 }}>{title}</p>
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
