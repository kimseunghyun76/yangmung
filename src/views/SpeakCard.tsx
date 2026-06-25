// 따라 말하기 카드 v2 — 녹음 셀프비교. 내 발음 녹음 → 원음과 나란히 듣고 비교.
// 채점 X(음성인식 iOS 불안정). MediaRecorder 미지원/권한거부 시 "말했어요" 폴백.
import { useEffect, useRef, useState } from 'react';
import type { SpeakCard } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { BTN, PRIMARY } from '../ui/styles';
import { ReadingAid } from './ReadingAid';
import { Icon } from '../ui/Icon';
import { MascotBubble } from './mascot';

interface Props {
  card: SpeakCard;
  isKanaFamiliar: (char: string) => boolean;
  onPracticed: () => void;
  onNext: () => void;
}

const recSupported = typeof navigator !== 'undefined'
  && !!navigator.mediaDevices?.getUserMedia
  && typeof window !== 'undefined'
  && typeof window.MediaRecorder !== 'undefined';

export function SpeakCardView({ card, isKanaFamiliar, onPracticed, onNext }: Props) {
  const [spoke, setSpoke] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recErr, setRecErr] = useState(false);
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const urlRef = useRef<string | null>(null);
  const playbackRef = useRef<HTMLAudioElement | null>(null);

  // 정리 — 스트림 정지 + objectURL 해제
  useEffect(() => () => {
    playbackRef.current?.pause();
    playbackRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  function practiced() { if (!spoke) { setSpoke(true); onPracticed(); } }

  async function startRec() {
    setRecErr(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setAudioUrl(url);
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        practiced();
      };
      mrRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setRecErr(true);
      setRecording(false);
    }
  }
  function stopRec() { mrRef.current?.stop(); }
  function playMine() {
    if (!urlRef.current) return;
    playbackRef.current?.pause();
    const audio = new Audio(urlRef.current);
    playbackRef.current = audio;
    audio.onended = () => { if (playbackRef.current === audio) playbackRef.current = null; };
    audio.onerror = () => { if (playbackRef.current === audio) playbackRef.current = null; };
    audio.play().catch(() => { if (playbackRef.current === audio) playbackRef.current = null; });
  }

  return (
    <div>
      <h2 style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="speak" size={22} /> 따라 말하기</h2>
      <div style={{ textAlign: 'center', margin: '18px 0 4px' }}>
        <ReadingAid text={card.kana} isFamiliar={isKanaFamiliar} fontSize={30} />
      </div>
      <p style={{ textAlign: 'center', color: 'var(--ink-soft)', marginTop: 4 }}>{card.korean}</p>

      {/* 원음 */}
      <div style={{ textAlign: 'center', marginTop: 14, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button style={{ ...BTN, padding: '10px 22px', fontSize: 18, background: 'var(--accent-soft)' }} onClick={() => speak(card.ja)} disabled={!ttsSupported()}><Icon name="listen" size={17} /> 듣기</button>
      </div>

      {/* 녹음 / 비교 */}
      {recSupported && !recErr ? (
        <div style={{ marginTop: 18 }}>
          {recording ? (
            <button className="ym-press ym-listening" onClick={stopRec}
              style={{ ...PRIMARY, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: '#fff' }} /> 녹음 중 — 탭해서 멈추기
            </button>
          ) : (
            <button className="ym-press" onClick={startRec}
              style={{ ...PRIMARY, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Icon name="speak" size={18} /> {audioUrl ? '다시 녹음' : '녹음하고 비교하기'}
            </button>
          )}

          {audioUrl && !recording && (
            <>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="ym-press" onClick={playMine} style={{ ...BTN, flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>▶ 내 발음</button>
                <button className="ym-press" onClick={() => speak(card.ja)} disabled={!ttsSupported()} style={{ ...BTN, flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'var(--accent-soft)' }}><Icon name="listen" size={16} /> 원음</button>
              </div>
              <p style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: 12, marginTop: 8 }}>두 소리를 번갈아 들으며 억양을 맞춰보세요.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: 14, marginTop: 16 }}>
            소리 내어 따라 말해보세요{ttsSupported() ? ' (듣고 → 따라서)' : ''}
          </p>
          {recErr && <p style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: 12, marginTop: 4 }}>마이크를 쓸 수 없어 녹음 없이 진행해요.</p>}
          {!spoke && <button style={{ ...PRIMARY, marginTop: 8, width: '100%' }} onClick={practiced}>말했어요</button>}
        </>
      )}

      {/* 완료 안내 + 다음 */}
      {spoke && (
        <div style={{ marginTop: 12 }}>
          <MascotBubble who="mung" size={38}>입으로 꺼낸 표현은 여행지에서 훨씬 빨리 나와요.</MascotBubble>
          <p style={{ background: 'var(--ok-soft)', padding: 12, borderRadius: 12, color: 'var(--ok)', fontWeight: 600, margin: 0 }}>
            <Icon name="check" size={16} style={{ marginRight: 6 }} />좋아요! 입으로 꺼내는 게 진짜 실력이에요
          </p>
          {card.tip && <p style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 12, fontSize: 14, color: 'var(--ink-soft)', marginTop: 8 }}><Icon name="tip" size={15} style={{ marginRight: 6 }} />{card.tip}</p>}
          <button style={{ ...PRIMARY, marginTop: 10, width: '100%' }} onClick={onNext}>다음</button>
        </div>
      )}
      {!spoke && recSupported && !recErr && (
        <button onClick={practiced} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-faint)', fontWeight: 600, marginTop: 12, width: '100%', textAlign: 'center' }}>녹음 없이 넘어가기</button>
      )}
    </div>
  );
}
