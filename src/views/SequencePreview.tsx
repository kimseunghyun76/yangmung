// 학습 전 "전체 미리듣기" — 명장면 대화·노래 가사·간판·방송 메뉴에서 항목을 고르면
// 예전엔 Intro(오늘의 연습 › 오늘 한 판) 화면을 거쳤지만, 이 메뉴들은 이미 사용자가
// 무엇을 배울지 직접 골랐으므로 그 안내가 불필요하다. 대신 배울 문장 전체를 쭉 보여주고
// 한 번에 듣게 한 뒤, 곧바로 기존 단락별 학습+퀴즈 세션으로 들어간다.
// 2026-07-09: 다른 모든 학습 메뉴처럼 배너 이미지 + 오버레이 타이틀을 넣고, 누적 학습/퀴즈/평균 점수
// 배지를 얹었다. 학습형 콘텐츠(간판·방송·어휘·인사)는 "바로 퀴즈 풀기"와 "전체 학습하기"를 나눠
// 전체 학습을 먼저 끝내고 싶은 사람도 배려한다.
import { useEffect, useRef, useState } from 'react';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { GlassPanel, PrimaryAction } from './shell';
import { speak, stopSpeaking } from '../tts';
import { quickPracticeBackdrop } from './scene';

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

export interface PreviewStats {
  studied: number;
  quizzes: number;
  avgScore: number; // 0~100
}

interface Props {
  title: string;
  subtitle?: string;
  lines: PreviewLine[];
  onStart: () => void;
  onBack: () => void;
  countControl?: CountControl;
  /** 배너 이미지 종류(quickPracticeBackdrop에 넘길 kind). 없으면 배너를 생략. */
  backdropKind?: string;
  stats?: PreviewStats;
  /** 있으면 "바로 퀴즈 풀기"/"전체 학습하기" 두 갈래로 나눠 보여준다(학습형 콘텐츠 전용). */
  onStudyAll?: () => void;
}

export function SequencePreview({ title, subtitle, lines, onStart, onBack, countControl, backdropKind, stats, onStudyAll }: Props) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const tokenRef = useRef(0);
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => stopSpeaking, []); // 화면 이탈 시 재생 중지

  // 전체 듣기 중엔 재생 중인 항목이 화면 안에 보이도록 따라 스크롤.
  useEffect(() => {
    if (playingIndex === null) return;
    lineRefs.current[playingIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [playingIndex]);

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

      {backdropKind && (
        <div style={{
          position: 'relative', width: '100%', margin: '0 0 16px', borderRadius: 22, overflow: 'hidden',
          boxShadow: '0 14px 32px rgba(20,24,34,0.14)', border: '1px solid rgba(255,255,255,0.3)',
        }}>
          <img src={quickPracticeBackdrop(backdropKind)} alt="" aria-hidden style={{
            width: '100%', height: 'auto', display: 'block',
            filter: 'saturate(.9) contrast(.98) brightness(1.04)',
          }} />
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, padding: '36px 16px 14px',
            background: 'linear-gradient(to top, rgba(18,14,10,.84), rgba(18,14,10,.4) 58%, transparent)',
            color: '#fff',
          }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, lineHeight: 1.18, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,.55)' }}>{title}</p>
            {stats && (
              <div style={{ display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' }}>
                <StatPill label="누적 학습" value={`${stats.studied}회`} />
                <StatPill label="누적 퀴즈" value={`${stats.quizzes}회`} />
                <StatPill label="평균 점수" value={`${stats.avgScore}점`} />
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        {!backdropKind && <h1 style={{ margin: '0 0 4px', fontSize: 23, fontWeight: 900, letterSpacing: '-0.03em' }}>{title}</h1>}
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
                <button key={i} ref={(el) => { lineRefs.current[i] = el; }} className="ym-press" onClick={() => playOne(i)} style={{
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
        <PrimaryAction onClick={onStart}>{onStudyAll ? '바로 퀴즈 풀기' : '학습 시작'}</PrimaryAction>
        {onStudyAll && (
          <button className="ym-press" onClick={onStudyAll} style={{
            width: '100%', padding: '13px 16px', borderRadius: 14, cursor: 'pointer', fontWeight: 800, fontSize: 14.5,
            border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)',
          }}>전체 학습하기</button>
        )}
      </div>
    </main>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'baseline', gap: 4, padding: '4px 10px', borderRadius: 999,
      background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.3)', backdropFilter: 'blur(6px)',
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.86)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{value}</span>
    </span>
  );
}
