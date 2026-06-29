// 가나 표 학습 — 히라가나/가타카나 전체를 한 화면에. 셀을 누르면 상세 팝업에서
// 한 글자에 대해 읽기·듣기·쓰기·말하기를 한 장에 모두 익힌다.
import { useEffect, useRef, useState } from 'react';
import { CONTENT } from '../content';
import type { KanaItem, KanaKind } from '../content/types';
import type { ProgressMap } from '../learn/progress';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { GlassPanel, PrimaryAction } from './shell';
import { Modal } from './Modal';
import { TraceCanvas } from './KanaWrite';

interface Props {
  nav: NavBarProps;
  progress: ProgressMap;
  script: 'hiragana' | 'katakana';
  onScriptChange: (script: 'hiragana' | 'katakana') => void;
  onQuiz: () => void;
  onBack: () => void;
  onKanaWritten?: (char: string) => void; // 쓰기 합격 시 '본 가나'로 기록
}

const label: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
  color: 'var(--accent)', textTransform: 'uppercase',
};

// 셀 상태 — 읽기 안정(2회 연속 정답)=익힘, 시도 흔적 있으면=본 적 있음.
function cellState(progress: ProgressMap, id: string): 'mastered' | 'seen' | 'new' {
  const read = progress[`kana:${id}:read`];
  if (read && read.consecutiveCorrect >= 2) return 'mastered';
  for (const suf of ['read', 'listen', 'confuse']) {
    if (progress[`kana:${id}:${suf}`]) return 'seen';
  }
  return 'new';
}

// 표 섹션 — 청음 / 탁음·반탁음 / 요음. 같은 결로 행(group) 단위 렌더.
const SECTIONS: { key: string; title: string; sub: string; kinds: KanaKind[] }[] = [
  { key: 'sei', title: '청음', sub: '오십음도 기본', kinds: ['sei'] },
  { key: 'daku', title: '탁음 · 반탁음', sub: '゛ ゜가 붙은 소리', kinds: ['daku', 'handaku'] },
  { key: 'yoon', title: '요음', sub: '작은 ゃ ゅ ょ 조합', kinds: ['yoon'] },
];

// 한 섹션의 아이템을 group(행) 순서를 보존하며 묶는다.
function groupRows(items: KanaItem[]): { group: string; cells: KanaItem[] }[] {
  const order: string[] = [];
  const map = new Map<string, KanaItem[]>();
  for (const it of items) {
    if (!map.has(it.group)) { map.set(it.group, []); order.push(it.group); }
    map.get(it.group)!.push(it);
  }
  return order.map((g) => ({ group: g, cells: map.get(g)! }));
}

export function KanaTable({ nav, progress, script, onScriptChange, onQuiz, onBack, onKanaWritten }: Props) {
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const items = CONTENT.kana.filter((k) => k.script === script);
  const scriptKo = script === 'hiragana' ? '히라가나' : '가타카나';

  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '4px 0', marginBottom: 12,
      }}>← 홈으로</button>

      <div style={{ marginBottom: 14 }}>
        <p style={{ margin: 0, ...label }}>가나 · 표 학습</p>
        <h1 style={{ margin: '8px 0 4px', fontSize: 25, fontWeight: 900, letterSpacing: '-0.03em' }}>{scriptKo} 한눈에</h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          글자를 누르면 <strong style={{ color: 'var(--ink)' }}>읽기·듣기·쓰기·말하기</strong>를 한 장에서 익혀요.
        </p>
      </div>

      {/* 히라/가타 토글 */}
      <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 14, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', marginBottom: 16 }}>
        {(['hiragana', 'katakana'] as const).map((s) => {
          const active = s === script;
          return (
            <button key={s} className="ym-press" onClick={() => onScriptChange(s)} style={{
              flex: 1, padding: '10px', borderRadius: 11, border: 'none', cursor: 'pointer',
              background: active ? 'var(--accent)' : 'transparent', color: active ? 'var(--accent-ink)' : 'var(--ink-soft)',
              fontWeight: 800, fontSize: 14,
            }}>{s === 'hiragana' ? '히라가나' : '가타카나'}</button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SECTIONS.map((sec) => {
          const secItems = items.filter((it) => sec.kinds.includes(it.kind));
          if (secItems.length === 0) return null;
          const rows = groupRows(secItems);
          return (
            <GlassPanel key={sec.key}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>{sec.title}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-faint)' }}>{sec.sub}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {rows.map((row) => (
                  <div key={row.group} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                    {row.cells.map((it) => {
                      const st = cellState(progress, it.id);
                      const border = st === 'mastered' ? 'var(--ok)' : st === 'seen' ? 'var(--accent)' : 'var(--glass-border)';
                      const bg = st === 'mastered' ? 'var(--ok-soft)' : st === 'seen' ? 'var(--accent-soft)' : 'var(--glass-bg-strong)';
                      return (
                        <button key={it.id} className="ym-press" onClick={() => setDetailIdx(items.indexOf(it))}
                          title={st === 'mastered' ? '익힘' : st === 'seen' ? '본 적 있음' : '아직'}
                          style={{ padding: '8px 3px', borderRadius: 11, cursor: 'pointer', textAlign: 'center', border: `1px solid ${border}`, background: bg, color: 'var(--ink)', minWidth: 0 }}>
                          <div lang="ja" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{it.char}</div>
                          <div style={{ fontSize: 10, color: 'var(--ink-faint)', fontWeight: 700, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.romaji}</div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </GlassPanel>
          );
        })}
      </div>

      <div style={{ marginTop: 18 }}>
        <PrimaryAction onClick={onQuiz}>
          <Icon name="fast" size={18} /> 표 다 봤어요 — 퀴즈로 확인
        </PrimaryAction>
      </div>

      {detailIdx !== null && items[detailIdx] && (
        <KanaDetail
          key={items[detailIdx].id}
          item={items[detailIdx]}
          prev={items[detailIdx - 1] ?? null}
          next={items[detailIdx + 1] ?? null}
          onPrev={() => setDetailIdx((i) => (i !== null && i > 0 ? i - 1 : i))}
          onNext={() => setDetailIdx((i) => (i !== null && i < items.length - 1 ? i + 1 : i))}
          onClose={() => setDetailIdx(null)}
          onKanaWritten={onKanaWritten}
        />
      )}
    </main>
  );
}

// ── 상세 팝업 — 한 글자의 읽기·듣기·쓰기·말하기를 한 장에 ──────────────
function KanaDetail({ item, prev, next, onPrev, onNext, onClose, onKanaWritten }: {
  item: KanaItem;
  prev: KanaItem | null;
  next: KanaItem | null;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onKanaWritten?: (char: string) => void;
}) {
  const [written, setWritten] = useState(false);
  const confus = (item.confusables ?? []).filter((c) => c !== item.char);
  // 팝업이 뜨면(=글자가 바뀌면) 바로 소리를 들려준다.
  useEffect(() => {
    if (!ttsSupported()) return;
    const t = window.setTimeout(() => speak(item.char), 150);
    return () => window.clearTimeout(t);
  }, [item.char]);

  const navBtn = (disabled: boolean): React.CSSProperties => ({
    flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '13px 12px', borderRadius: 14, fontWeight: 800, fontSize: 15,
    border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)',
    color: disabled ? 'var(--ink-faint)' : 'var(--ink)', cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  });
  const footer = (
    <div style={{ display: 'flex', gap: 8 }}>
      <button className="ym-press" onClick={onPrev} disabled={!prev} style={navBtn(!prev)}>
        ← 이전{prev && <span lang="ja" style={{ fontWeight: 900, color: 'var(--accent)' }}>{prev.char}</span>}
      </button>
      <button className="ym-press" onClick={onNext} disabled={!next} style={navBtn(!next)}>
        {next && <span lang="ja" style={{ fontWeight: 900, color: 'var(--accent)' }}>{next.char}</span>}다음 →
      </button>
    </div>
  );

  return (
    <Modal title={`${item.char} · ${item.romaji}`} onClose={onClose} footer={footer}>
      {/* ① 읽기 · 쓰기 — 보고 읽고, 바로 따라 써본다 */}
      <Section icon="kana" title="읽기 · 쓰기">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div lang="ja" style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, color: 'var(--ink)' }}>{item.char}</div>
          <div>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{item.romaji}</p>
            <p style={{ margin: '2px 0 0', fontSize: 15, color: 'var(--ink-soft)', fontWeight: 700 }}>한글 소리 「{item.koreanSound}」</p>
          </div>
        </div>
        {confus.length > 0 && (
          <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--ink-faint)', fontWeight: 700 }}>
            ⚠️ 비슷한 글자: <span lang="ja" style={{ color: 'var(--accent)', fontWeight: 800 }}>{confus.join(' · ')}</span>
          </p>
        )}
        <p style={{ margin: '12px 0 4px', fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700 }}>흐린 글자를 따라 써보세요.</p>
        <TraceCanvas
          char={item.char}
          nextLabel="기록하기"
          onComplete={(score) => { if (score >= 55) { onKanaWritten?.(item.char); setWritten(true); } }}
        />
        {written && <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 12.5, color: 'var(--ok)', fontWeight: 800 }}>✓ 익힌 가나로 기록했어요</p>}
      </Section>

      {/* ② 듣기 · 말하기 — 다시 듣기 + 녹음/비교를 한 줄에 */}
      <Section icon="listen" title="듣기 · 말하기">
        <KanaSpeak char={item.char} />
      </Section>
    </Modal>
  );
}

function Section({ icon, title, children }: { icon: React.ComponentProps<typeof Icon>['name']; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--glass-border)' }}>
      <p style={{ margin: '0 0 9px', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, color: 'var(--accent)' }}>
        <Icon name={icon} size={16} /> {title}
      </p>
      {children}
    </div>
  );
}

// 말하기 — 원음 듣고 → 녹음 → 내 발음/원음 번갈아 비교 (채점 없음, iOS 인식 불안정 대비).
const recSupported = typeof navigator !== 'undefined'
  && !!navigator.mediaDevices?.getUserMedia
  && typeof window !== 'undefined'
  && typeof window.MediaRecorder !== 'undefined';

function KanaSpeak({ char }: { char: string }) {
  const [recording, setRecording] = useState(false);
  const [hasRec, setHasRec] = useState(false);
  const [recErr, setRecErr] = useState(false);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);
  const playbackRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    playbackRef.current?.pause();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    mrRef.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  async function startRec() {
    setRecErr(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(blob);
        setHasRec(true);
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
      };
      mrRef.current = mr;
      mr.start();
      setRecording(true);
    } catch { setRecErr(true); setRecording(false); }
  }
  function playMine() {
    if (!urlRef.current) return;
    playbackRef.current?.pause();
    const audio = new Audio(urlRef.current);
    playbackRef.current = audio;
    audio.play().catch(() => {});
  }

  const canRec = recSupported && !recErr;
  return (
    <div>
      {/* 다시 듣기 + 녹음/비교 — 한 줄 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="ym-press" onClick={() => speak(char)} disabled={!ttsSupported()} style={{
          flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          padding: '13px 10px', borderRadius: 14, cursor: 'pointer', fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap',
          border: '1px solid var(--glass-border)', background: 'var(--accent-soft)', color: 'var(--accent)',
        }}>
          <Icon name="listen" size={17} /> 다시 듣기
        </button>
        {canRec && (
          <button className="ym-press" onClick={recording ? () => mrRef.current?.stop() : startRec} style={{
            flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '13px 10px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap',
            background: 'var(--accent)', color: 'var(--accent-ink)',
          }}>
            {recording
              ? (<><span style={{ width: 10, height: 10, borderRadius: 99, background: '#fff' }} /> 멈추기</>)
              : (<><Icon name="speak" size={17} /> {hasRec ? '다시 녹음' : '녹음하고 비교'}</>)}
          </button>
        )}
      </div>
      {!canRec && (
        <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700 }}>
          소리 내어 따라 말해보세요{recErr ? ' (마이크를 쓸 수 없어 녹음 없이 진행)' : ''}.
        </p>
      )}
      {hasRec && !recording && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="ym-press" onClick={playMine} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 750, cursor: 'pointer' }}>▶ 내 발음</button>
          <button className="ym-press" onClick={() => speak(char)} disabled={!ttsSupported()} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 750, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="listen" size={15} /> 원음</button>
        </div>
      )}
    </div>
  );
}
