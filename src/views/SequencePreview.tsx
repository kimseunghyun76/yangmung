// 학습 전 "전체 미리듣기" — 명장면 대화·노래 가사·간판·방송 메뉴에서 항목을 고르면
// 예전엔 Intro(오늘의 연습 › 오늘 한 판) 화면을 거쳤지만, 이 메뉴들은 이미 사용자가
// 무엇을 배울지 직접 골랐으므로 그 안내가 불필요하다. 대신 배울 문장 전체를 쭉 보여주고
// 한 번에 듣게 한 뒤, 곧바로 기존 단락별 학습+퀴즈 세션으로 들어간다.
import { useEffect, useRef, useState } from 'react';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { GlassPanel, PrimaryAction } from './shell';
import { speak, stopSpeaking } from '../tts';

export interface PreviewLine {
  ja: string;
  kana: string;
  korean: string;
  speaker?: string;
}

// 퀴즈 개수 선택 — 있으면 프리뷰 상단에 세그먼트로 노출, 고르면 목록·개수가 다시 계산돼 렌더링됨.
export interface CountControl {
  value: number;
  options: number[];
  onChange: (n: number) => void;
}

interface Props {
  title: string;
  subtitle?: string;
  lines: PreviewLine[];
  onStart: () => void;
  onBack: () => void;
  countControl?: CountControl;
}

export function SequencePreview({ title, subtitle, lines, onStart, onBack, countControl }: Props) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const tokenRef = useRef(0);

  useEffect(() => stopSpeaking, []); // 화면 이탈 시 재생 중지

  function playAll() {
    stopSpeaking();
    const token = ++tokenRef.current;
    let i = 0;
    const next = () => {
      if (token !== tokenRef.current) return; // 다른 재생 요청이 끼어들면 중단
      if (i >= lines.length) { setPlayingIndex(null); return; }
      setPlayingIndex(i);
      speak(lines[i++].ja, { onEnd: next });
    };
    next();
  }

  function playOne(i: number) {
    stopSpeaking();
    tokenRef.current++; // 진행 중이던 전체 재생을 취소
    setPlayingIndex(i);
    speak(lines[i].ja, { onEnd: () => setPlayingIndex((p) => (p === i ? null : p)) });
  }

  return (
    <main style={WRAP}>
      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '4px 0', marginBottom: 12,
      }}>← 목록으로</button>

      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase' }}>{lines.length > 0 ? '전체 미리듣기' : '연습 준비'}</p>
        <h1 style={{ margin: '8px 0 4px', fontSize: 23, fontWeight: 900, letterSpacing: '-0.03em' }}>{title}</h1>
        {subtitle && <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{subtitle}</p>}
        {lines.length > 0 && <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--ink-faint)' }}>먼저 전체를 한 번 들어본 뒤, 문장별로 학습하고 퀴즈를 풀어요.</p>}
      </div>

      {countControl && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }}>퀴즈 개수</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {countControl.options.map((n) => {
              const active = n === countControl.value;
              return (
                <button key={n} className="ym-press" onClick={() => countControl.onChange(n)} style={{
                  flex: 1, padding: '10px 6px', borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                  fontWeight: 800, fontSize: 14,
                  border: `1px solid ${active ? 'var(--ink)' : 'var(--glass-border)'}`,
                  background: active ? 'var(--accent)' : 'var(--glass-bg-strong)',
                  color: active ? 'var(--accent-ink)' : 'var(--ink-soft)',
                }}>{n}개</button>
              );
            })}
          </div>
        </div>
      )}

      {lines.length > 0 && (
        <GlassPanel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lines.map((l, i) => {
              const active = playingIndex === i;
              return (
                <button key={i} className="ym-press" onClick={() => playOne(i)} style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '11px 12px', borderRadius: 12, cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--glass-border)'}`,
                  background: active ? 'var(--accent-soft)' : 'var(--glass-bg)',
                  color: 'var(--ink)',
                }}>
                  {l.speaker && (
                    <span style={{
                      flex: '0 0 auto', fontSize: 11, fontWeight: 800, color: 'var(--accent)',
                      border: '1px solid var(--accent)', borderRadius: 999, padding: '1px 7px', marginTop: 2,
                    }}>{l.speaker}</span>
                  )}
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{l.ja}</span>
                    <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{l.korean}</span>
                  </span>
                  <Icon name="listen" size={16} style={{ flex: '0 0 16px', marginTop: 3, color: active ? 'var(--accent)' : 'var(--ink-faint)' }} />
                </button>
              );
            })}
          </div>
        </GlassPanel>
      )}

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lines.length > 0 && (
          <button className="ym-press" onClick={playAll} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '13px 16px', borderRadius: 14, cursor: 'pointer', fontWeight: 800, fontSize: 14.5,
            border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)',
          }}>
            <Icon name="listen" size={18} /> 전체 듣기 ({lines.length}문장)
          </button>
        )}
        <PrimaryAction onClick={onStart}>학습 시작</PrimaryAction>
      </div>
    </main>
  );
}
