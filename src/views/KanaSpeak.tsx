// 가나 말하기 — 히라가나/가타카나 표의 "듣기·말하기"를 분리해 만든 전용 연습.
// 낱글자가 아니라 실제 짧은 단어를 가나 개수 1개→2개→3개…로 점점 늘려가며 듣기→녹음→비교를
// 연달아 진행한다(2026-07-06 최초 구현, 2026-07-07 단어 사다리로 개편).
import { useEffect, useRef, useState } from 'react';
import type { SpeakWord } from '../learn/kanaSpeakWords';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { PrimaryAction } from './shell';

interface Props {
  items: SpeakWord[];
  onExit: () => void;
  onReplay: () => void;
}

const recSupported = typeof navigator !== 'undefined'
  && !!navigator.mediaDevices?.getUserMedia
  && typeof window !== 'undefined'
  && typeof window.MediaRecorder !== 'undefined';

export function KanaSpeak({ items, onExit, onReplay }: Props) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(items.length === 0);
  const item = items[idx];

  function advance() {
    if (idx + 1 >= items.length) setDone(true); else setIdx((i) => i + 1);
  }

  if (done) {
    return (
      <main style={WRAP}>
        <div className="ym-rise" style={{ textAlign: 'center', paddingTop: 20 }}>
          <div className="ym-burst" style={{ width: 76, height: 76, margin: '0 auto', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="speak" size={36} />
          </div>
          <h1 style={{ margin: '16px 0 0', fontSize: 26 }}>말하기 연습 끝!</h1>
          <p style={{ margin: '10px 0 0', color: 'var(--ink-soft)', fontWeight: 700 }}>{items.length}개 단어를 1글자부터 {items[items.length - 1]?.len ?? '?'}글자까지 듣고 따라 말해봤어요.</p>
        </div>
        <div className="ym-rise" style={{ animationDelay: '.08s', marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryAction onClick={onReplay}><Icon name="speak" size={18} /> 다시 연습</PrimaryAction>
          <button className="ym-press" onClick={onExit} style={homeBtn}><Icon name="nav-home" size={18} /> 홈으로</button>
        </div>
      </main>
    );
  }

  if (!item) return <main style={WRAP}><p style={{ textAlign: 'center', marginTop: 40, color: 'var(--ink-soft)' }}>준비된 단어가 없어요.</p></main>;

  return (
    <main style={WRAP}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={onExit} className="ym-press" style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, cursor: 'pointer', padding: 4 }}>← 그만</button>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {items.length}</span>
        <span style={{ width: 44 }} aria-hidden />
      </div>

      <div key={`disp:${item.id}`} className="ym-rise" style={{ textAlign: 'center', marginTop: 18 }}>
        <span style={{
          display: 'inline-block', padding: '3px 10px', borderRadius: 99, background: 'var(--accent-soft)',
          color: 'var(--accent)', fontSize: 12, fontWeight: 800,
        }}>{item.len}글자 단어</span>
        <div lang="ja" style={{ margin: '10px 0 0', fontSize: wordFontSize(item.kana), fontWeight: 900, lineHeight: 1.15, color: 'var(--ink)', wordBreak: 'keep-all' }}>{item.kana}</div>
        <p style={{ margin: '10px 0 0', fontSize: 16, color: 'var(--ink-soft)', fontWeight: 700 }}>{item.korean}</p>
      </div>

      <KanaSpeakRecorder key={`rec:${item.id}`} text={item.kana} onNext={advance} />
    </main>
  );
}

// 최대 11글자(よろしくおねがいします)까지 나올 수 있어 글자 수에 맞춰 크기를 줄인다.
function wordFontSize(kana: string): number {
  const n = Array.from(kana).length;
  if (n <= 2) return 64;
  if (n <= 4) return 46;
  if (n <= 6) return 36;
  if (n <= 8) return 28;
  return 22;
}

const homeBtn: React.CSSProperties = {
  width: '100%', padding: '15px 16px', borderRadius: 16, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};

// 원음 듣고 → 녹음 → 내 발음/원음 번갈아 비교 (채점 없음, iOS 인식 불안정 대비).
function KanaSpeakRecorder({ text, onNext }: { text: string; onNext: () => void }) {
  const [recording, setRecording] = useState(false);
  const [hasRec, setHasRec] = useState(false);
  const [recErr, setRecErr] = useState(false);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);
  const playbackRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 카드가 바뀌면(=다음 글자) 자동으로 원음을 한 번 들려주고 녹음 상태를 초기화.
    setHasRec(false); setRecErr(false); setRecording(false);
    const t = window.setTimeout(() => { if (ttsSupported()) speak(text); }, 150);
    return () => window.clearTimeout(t);
  }, [text]);

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
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="ym-press" onClick={() => speak(text)} disabled={!ttsSupported()} style={{
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
        <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 700, textAlign: 'center' }}>
          소리 내어 따라 말해보세요{recErr ? ' (마이크를 쓸 수 없어 녹음 없이 진행)' : ''}.
        </p>
      )}
      {hasRec && !recording && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="ym-press" onClick={playMine} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 750, cursor: 'pointer' }}>▶ 내 발음</button>
          <button className="ym-press" onClick={() => speak(text)} disabled={!ttsSupported()} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 750, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icon name="listen" size={15} /> 원음</button>
        </div>
      )}
      <PrimaryAction onClick={onNext} style={{ marginTop: 14 }}>다음 →</PrimaryAction>
    </div>
  );
}
