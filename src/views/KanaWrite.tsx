// 가나 쓰기 A(따라쓰기) — 흐린 글자 위에 덧쓰고, 글자 영역과 잉크 겹침률로 채점(온디바이스).
// Phase A MVP: 획순 데이터 없이 캔버스 픽셀 비교만. 추후 Phase B(빈 칸 직접 쓰기)로 확장.
import { useEffect, useRef, useState } from 'react';
import type { KanaItem } from '../content/types';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { PrimaryAction } from './shell';

interface Props {
  items: KanaItem[];
  onExit: () => void;
  onReplay: () => void;
  onKanaWritten?: (item: KanaItem, score: number) => void; // 합격 시 '본 가나'로 기록(인식 강화)
}

const SIZE = 300;        // 캔버스 내부 해상도
const PASS = 55;         // 합격 커버리지(%)
const INK_WIDTH = 26;    // 펜 굵기
const DILATE_R = 11;     // 채점 시 잉크를 부풀리는 반경(px) — 가는 펜으로 두꺼운 글자를 따라가도 공정하게

export function KanaWrite({ items, onExit, onReplay, onKanaWritten }: Props) {
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [done, setDone] = useState(items.length === 0);
  const item = items[idx];

  function complete(score: number) {
    if (item) onKanaWritten?.(item, score);
    setScores((s) => [...s, score]);
    if (idx + 1 >= items.length) setDone(true); else setIdx((i) => i + 1);
  }

  if (done) {
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const passed = scores.filter((s) => s >= PASS).length;
    return (
      <main style={WRAP}>
        <div className="ym-rise" style={{ textAlign: 'center', paddingTop: 20 }}>
          <div className="ym-burst" style={{ width: 76, height: 76, margin: '0 auto', borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="dictation" size={36} />
          </div>
          <h1 style={{ margin: '16px 0 0', fontSize: 26 }}>쓰기 시험 끝!</h1>
          <p style={{ margin: '10px 0 0', fontSize: 40, fontWeight: 900, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{passed}<span style={{ fontSize: 20, color: 'var(--ink-faint)' }}> / {scores.length}</span></p>
          <p style={{ margin: '6px 0 0', color: 'var(--ink-soft)', fontWeight: 700 }}>합격 {passed}자 · 평균 정확도 {avg}%</p>
        </div>
        <div className="ym-rise" style={{ animationDelay: '.08s', marginTop: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryAction onClick={onReplay}><Icon name="dictation" size={18} /> 다시 시험</PrimaryAction>
          <button className="ym-press" onClick={onExit} style={homeBtn}><Icon name="nav-home" size={18} /> 홈으로</button>
        </div>
      </main>
    );
  }

  if (!item) return <main style={WRAP}><p style={{ textAlign: 'center', marginTop: 40, color: 'var(--ink-soft)' }}>준비된 글자가 없어요.</p></main>;

  return (
    <main style={WRAP}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <button onClick={onExit} className="ym-press" style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', fontWeight: 800, cursor: 'pointer', padding: 4 }}>← 그만</button>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums' }}>{idx + 1} / {items.length}</span>
        <button onClick={() => speak(item.char)} disabled={!ttsSupported()} className="ym-press" style={{ border: 0, background: 'transparent', color: 'var(--accent)', cursor: 'pointer', padding: 4, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 13 }}><Icon name="listen" size={16} /> 듣기</button>
      </div>

      <p style={{ textAlign: 'center', margin: '14px 0 2px', fontSize: 14, color: 'var(--ink-soft)', fontWeight: 700 }}>
        <strong style={{ color: 'var(--ink)', fontSize: 16 }}>{item.romaji}</strong> · {item.koreanSound} — 흐린 글자를 따라 써보세요
      </p>

      <TraceCanvas key={item.id} char={item.char} onComplete={complete} />
    </main>
  );
}

const homeBtn: React.CSSProperties = {
  width: '100%', padding: '15px 16px', borderRadius: 16, border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 650, fontSize: 16, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
};

// 글자 수에 맞춰 폰트 크기 — 요음(きゃ 등 2자)은 작게 해 쓰기 영역을 벗어나지 않게.
function glyphPx(char: string): number {
  const n = Array.from(char).length;
  if (n >= 2) return Math.round(SIZE * 0.42);
  return Math.round(SIZE * 0.72);
}
function setGlyphFont(ctx: CanvasRenderingContext2D, char: string) {
  ctx.font = `700 ${glyphPx(char)}px "Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}

// 글자 마스크: core=글자 자체 픽셀, band=살짝 부풀린 허용 영역(잉크 삐져나감 판정용)
function buildMask(char: string): { core: Uint8Array; band: Uint8Array; coreCount: number } {
  const c = document.createElement('canvas'); c.width = SIZE; c.height = SIZE;
  const ctx = c.getContext('2d')!;
  setGlyphFont(ctx, char);
  ctx.fillStyle = '#000';
  ctx.fillText(char, SIZE / 2, SIZE / 2);
  const coreImg = ctx.getImageData(0, 0, SIZE, SIZE).data;

  ctx.clearRect(0, 0, SIZE, SIZE);
  setGlyphFont(ctx, char);
  ctx.lineJoin = 'round'; ctx.lineWidth = 30; ctx.strokeStyle = '#000'; ctx.fillStyle = '#000';
  ctx.strokeText(char, SIZE / 2, SIZE / 2);
  ctx.fillText(char, SIZE / 2, SIZE / 2);
  const bandImg = ctx.getImageData(0, 0, SIZE, SIZE).data;

  const core = new Uint8Array(SIZE * SIZE), band = new Uint8Array(SIZE * SIZE);
  let coreCount = 0;
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (coreImg[i * 4 + 3] > 40) { core[i] = 1; coreCount++; }
    if (bandImg[i * 4 + 3] > 40) band[i] = 1;
  }
  return { core, band, coreCount };
}

export function TraceCanvas({ char, onComplete, nextLabel = '다음' }: { char: string; onComplete: (score: number) => void; nextLabel?: string }) {
  const viewRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement | null>(null);
  const maskRef = useRef<ReturnType<typeof buildMask> | null>(null);
  const drawingRef = useRef(false);
  // 잉크 유무는 state로 — ref면 그려도 리렌더가 안 돼 '채점' 버튼이 계속 disabled로 남는다.
  const [hasInk, setHasInk] = useState(false);
  const [checked, setChecked] = useState<number | null>(null);

  useEffect(() => {
    const view = viewRef.current!;
    view.width = SIZE; view.height = SIZE;
    const ink = document.createElement('canvas'); ink.width = SIZE; ink.height = SIZE;
    inkRef.current = ink;
    maskRef.current = buildMask(char);
    setHasInk(false);
    setChecked(null);
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char]);

  function redraw() {
    const ctx = viewRef.current?.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    setGlyphFont(ctx, char);
    ctx.fillStyle = 'rgba(125,130,160,0.22)';
    ctx.fillText(char, SIZE / 2, SIZE / 2);
    if (inkRef.current) ctx.drawImage(inkRef.current, 0, 0);
  }

  function pos(e: React.PointerEvent) {
    const r = viewRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
  }
  function down(e: React.PointerEvent) {
    if (checked !== null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const ink = inkRef.current!.getContext('2d')!;
    const p = pos(e);
    ink.lineWidth = INK_WIDTH; ink.lineCap = 'round'; ink.lineJoin = 'round'; ink.strokeStyle = '#b9382e';
    ink.beginPath(); ink.moveTo(p.x, p.y); ink.lineTo(p.x + 0.1, p.y + 0.1); ink.stroke();
    setHasInk(true);
    redraw();
  }
  function move(e: React.PointerEvent) {
    if (!drawingRef.current || checked !== null) return;
    const ink = inkRef.current!.getContext('2d')!;
    const p = pos(e);
    ink.lineTo(p.x, p.y); ink.stroke();
    ink.beginPath(); ink.moveTo(p.x, p.y);
    redraw();
  }
  function up() { drawingRef.current = false; }

  function clear() {
    const ink = inkRef.current?.getContext('2d'); if (!ink) return;
    ink.clearRect(0, 0, SIZE, SIZE);
    setHasInk(false);
    setChecked(null);
    redraw();
  }

  function check() {
    const mask = maskRef.current, inkCanvas = inkRef.current;
    if (!mask || !inkCanvas) return;
    const inkData = inkCanvas.getContext('2d')!.getImageData(0, 0, SIZE, SIZE).data;

    // 펜은 가늘고 글자(core)는 두껍다 → 잉크를 펜 굵기만큼 부풀려(dilate) "지나간 영역"으로
    // 글자 커버리지를 잰다. 중심선만 또박또박 따라가도 글자를 덮은 것으로 인정.
    const dil = document.createElement('canvas'); dil.width = SIZE; dil.height = SIZE;
    const dctx = dil.getContext('2d')!;
    for (let a = 0; a < 16; a++) dctx.drawImage(inkCanvas, Math.cos((a / 16) * Math.PI * 2) * DILATE_R, Math.sin((a / 16) * Math.PI * 2) * DILATE_R);
    dctx.drawImage(inkCanvas, 0, 0);
    const dilData = dctx.getImageData(0, 0, SIZE, SIZE).data;

    let coreCovered = 0, inkCount = 0, inkOnBand = 0;
    for (let i = 0; i < SIZE * SIZE; i += 2) { // 2px 간격 샘플(속도)
      if (inkData[i * 4 + 3] > 30) { inkCount++; if (mask.band[i]) inkOnBand++; }
      if (mask.core[i] && dilData[i * 4 + 3] > 30) coreCovered++;
    }
    const coreSampled = Math.max(1, mask.coreCount / 2);
    const coverage = Math.min(1, coreCovered / coreSampled);          // 글자를 따라간 정도(공정)
    const overflow = inkCount ? (inkCount - inkOnBand) / inkCount : 1; // 글자 밖으로 삐져나간 비율
    // 정확도 = 커버리지에서 삐져나간 비율만큼 감점
    const score = Math.max(0, Math.round(coverage * 100 - overflow * 30));
    setChecked(score);
  }

  const pass = checked !== null && checked >= PASS;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 12 }}>
      <canvas
        ref={viewRef}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        style={{ width: 'min(86vw, 300px)', height: 'min(86vw, 300px)', borderRadius: 24, border: '1.5px solid var(--glass-border)', background: 'var(--glass-bg-strong)', touchAction: 'none', cursor: 'crosshair' }}
      />

      {checked === null ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 14, width: 'min(86vw, 300px)' }}>
          <button className="ym-press" onClick={clear} style={{ flex: 1, padding: '13px', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 700, cursor: 'pointer' }}>⌫ 지우기</button>
          <button className="ym-press" onClick={check} disabled={!hasInk} style={{ flex: 2, padding: '13px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 800, fontSize: 16, cursor: hasInk ? 'pointer' : 'default', opacity: hasInk ? 1 : 0.5 }}>채점</button>
        </div>
      ) : (
        <div className="ym-reveal" style={{ marginTop: 14, width: 'min(86vw, 300px)' }}>
          <p style={{ margin: 0, padding: 12, borderRadius: 12, fontWeight: 800, textAlign: 'center', background: pass ? 'var(--ok-soft)' : 'var(--warn-soft)', color: pass ? 'var(--ok)' : 'var(--warn)' }}>
            {pass ? `좋아요! 정확도 ${checked}%` : `정확도 ${checked}% — 다시 한 번 또박또박`}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="ym-press" onClick={clear} style={{ flex: 1, padding: '13px', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 700, cursor: 'pointer' }}>다시 쓰기</button>
            <button className="ym-press" onClick={() => onComplete(checked)} style={{ flex: 2, padding: '13px', borderRadius: 14, border: 'none', background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>{nextLabel}</button>
          </div>
        </div>
      )}
    </div>
  );
}
