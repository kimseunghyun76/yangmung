// 받아쓰기 카드 — 듣고 화면 가나 키패드로 직접 입력. (작문=한국어 보고 가나 타일 조립은 기존 유지)
// 진입 자동재생은 App에서 일원화.
import { useState } from 'react';
import type { DictationCard } from '../learn/cards';
import type { SegPos } from '../learn/jaSegment';
import { speak, ttsSupported } from '../tts';
import { BTN, PRIMARY } from '../ui/styles';
import { Icon } from '../ui/Icon';

interface Props {
  card: DictationCard;
  onResult: (correct: boolean) => void;
  onNext: () => void;
}

// ── 가나 키패드 데이터 (히라가나 기준, 가타카나·탁점은 코드 오프셋으로 파생) ──
const GOJUON: string[][] = [
  ['あ', 'い', 'う', 'え', 'お'],
  ['か', 'き', 'く', 'け', 'こ'],
  ['さ', 'し', 'す', 'せ', 'そ'],
  ['た', 'ち', 'つ', 'て', 'と'],
  ['な', 'に', 'ぬ', 'ね', 'の'],
  ['は', 'ひ', 'ふ', 'へ', 'ほ'],
  ['ま', 'み', 'む', 'め', 'も'],
  ['や', '', 'ゆ', '', 'よ'],
  ['ら', 'り', 'る', 'れ', 'ろ'],
  ['わ', '', 'を', '', 'ん'],
];
const DAKUTEN: Record<string, string> = {
  か: 'が', き: 'ぎ', く: 'ぐ', け: 'げ', こ: 'ご', さ: 'ざ', し: 'じ', す: 'ず', せ: 'ぜ', そ: 'ぞ',
  た: 'だ', ち: 'ぢ', つ: 'づ', て: 'で', と: 'ど', は: 'ば', ひ: 'び', ふ: 'ぶ', へ: 'べ', ほ: 'ぼ', う: 'ゔ',
};
const HANDAKUTEN: Record<string, string> = { は: 'ぱ', ひ: 'ぴ', ふ: 'ぷ', へ: 'ぺ', ほ: 'ぽ' };
const SMALL: Record<string, string> = { あ: 'ぁ', い: 'ぃ', う: 'ぅ', え: 'ぇ', お: 'ぉ', つ: 'っ', や: 'ゃ', ゆ: 'ゅ', よ: 'ょ', わ: 'ゎ' };

const isKata = (ch: string) => ch >= 'ァ' && ch <= 'ヶ';
const toKata = (ch: string) => (ch >= 'ぁ' && ch <= 'ゖ' ? String.fromCharCode(ch.charCodeAt(0) + 0x60) : ch);
const toHira = (ch: string) => (isKata(ch) ? String.fromCharCode(ch.charCodeAt(0) - 0x60) : ch);
// 마지막 글자에 탁점/반탁점/작은글자 적용 (스크립트 유지)
function applyMod(ch: string, map: Record<string, string>): string | null {
  const h = toHira(ch);
  const r = map[h];
  if (!r) return null;
  return isKata(ch) ? toKata(r) : r;
}

function KanaKeypad({ onInput, onMod, onBack, onClear }: {
  onInput: (ch: string) => void; onMod: (map: Record<string, string>) => void; onBack: () => void; onClear: () => void;
}) {
  const [kata, setKata] = useState(false);
  const key: React.CSSProperties = { height: 38, borderRadius: 9, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontSize: 19, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 };
  const mod: React.CSSProperties = { ...key, fontSize: 14, fontWeight: 800, background: 'var(--surface-2)' };
  const disp = (ch: string) => (kata ? toKata(ch) : ch);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        <button className="ym-press" onClick={() => setKata(false)} style={{ ...mod, flex: 1, background: !kata ? 'var(--accent)' : 'var(--surface-2)', color: !kata ? 'var(--accent-ink)' : 'var(--ink-soft)' }} lang="ja">かな</button>
        <button className="ym-press" onClick={() => setKata(true)} style={{ ...mod, flex: 1, background: kata ? 'var(--accent)' : 'var(--surface-2)', color: kata ? 'var(--accent-ink)' : 'var(--ink-soft)' }} lang="ja">カナ</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
        {GOJUON.flat().map((ch, i) => (
          ch
            ? <button key={i} className="ym-press" onClick={() => onInput(disp(ch))} style={key} lang="ja">{disp(ch)}</button>
            : <span key={i} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, marginTop: 5 }}>
        <button className="ym-press" onClick={() => onMod(DAKUTEN)} style={mod} lang="ja" aria-label="탁점">゛</button>
        <button className="ym-press" onClick={() => onMod(HANDAKUTEN)} style={mod} lang="ja" aria-label="반탁점">゜</button>
        <button className="ym-press" onClick={() => onMod(SMALL)} style={mod} aria-label="작은 글자">小</button>
        <button className="ym-press" onClick={() => onInput('ー')} style={{ ...key, fontSize: 16 }} lang="ja" aria-label="장음">ー</button>
        <button className="ym-press" onClick={onBack} style={mod} aria-label="지우기">⌫</button>
      </div>
      <button className="ym-press" onClick={onClear} style={{ ...mod, width: '100%', marginTop: 5, height: 32, fontSize: 12 }}>전체 지우기</button>
    </div>
  );
}

export function DictationCardView({ card, onResult, onNext }: Props) {
  const compose = card.promptKind === 'korean'; // 한→일 작문: 한국어 보고 일본어 조립(타일 유지)
  return compose ? <ComposeBody card={card} onResult={onResult} onNext={onNext} /> : <DictationTyping card={card} onResult={onResult} onNext={onNext} />;
}

// ── 받아쓰기: 듣고 가나 키패드로 직접 입력 ──
function DictationTyping({ card, onResult, onNext }: Props) {
  const answer = card.answer.join('');
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState<null | boolean>(null);
  const chars = Array.from(typed);
  const ansChars = Array.from(answer);
  const slotCount = Math.max(ansChars.length, chars.length);

  const input = (ch: string) => { if (checked === null) setTyped((t) => t + ch); };
  const applyLast = (map: Record<string, string>) => {
    if (checked !== null || !chars.length) return;
    const last = chars[chars.length - 1];
    const r = applyMod(last, map);
    if (r) setTyped(chars.slice(0, -1).join('') + r);
  };
  const back = () => { if (checked === null) setTyped((t) => Array.from(t).slice(0, -1).join('')); };
  const clear = () => { if (checked === null) setTyped(''); };
  const check = () => { const ok = typed === answer; setChecked(ok); onResult(ok); };

  return (
    <div>
      <h2 style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="dictation" size={22} /> 받아쓰기</h2>
      <p style={{ color: 'var(--ink-soft)', margin: '4px 0 0' }}>듣고, 가나 키패드로 직접 입력해요</p>

      <div style={{ textAlign: 'center', marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button style={{ ...BTN, padding: '10px 22px', fontSize: 18, background: 'var(--accent-soft)' }} onClick={() => speak(card.ja)} disabled={!ttsSupported()}><Icon name="listen" size={17} /> 듣기</button>
      </div>

      {/* 입력 글자 슬롯 — 답 길이만큼 칸 + 진행감. 채점 후 글자별 정/오답 색. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', margin: '18px 0 6px', minHeight: 52 }}>
        {Array.from({ length: Math.max(1, slotCount) }, (_, i) => {
          const ch = chars[i];
          const caret = checked === null && i === chars.length && i < ansChars.length;
          let border = 'var(--glass-border)', bg = ch !== undefined ? 'var(--glass-bg-strong)' : 'transparent', color = 'var(--ink)';
          if (checked !== null) {
            const ok = ch !== undefined && ch === ansChars[i];
            if (ch !== undefined) { border = ok ? 'var(--ok)' : 'var(--accent)'; bg = ok ? 'var(--ok-soft)' : 'var(--accent-soft)'; color = ok ? 'var(--ink)' : 'var(--accent)'; }
          }
          return (
            <span key={i} lang="ja" style={{ width: 44, height: 52, borderRadius: 12, fontSize: 26, fontWeight: 700, color, border: `1.5px ${ch === undefined ? 'dashed' : 'solid'} ${caret ? 'var(--accent)' : border}`, background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{ch ?? ''}</span>
          );
        })}
      </div>

      {checked === null ? (
        <>
          <KanaKeypad onInput={input} onMod={applyLast} onBack={back} onClear={clear} />
          <button style={{ ...PRIMARY, width: '100%', marginTop: 14 }} onClick={check} disabled={!typed}>확인</button>
        </>
      ) : (
        <div className="ym-reveal" style={{ marginTop: 16 }}>
          {checked ? (
            <p style={{ background: 'var(--ok-soft)', padding: 12, borderRadius: 12, color: 'var(--ok)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={16} /> 정답! {answer} — {card.korean}
            </p>
          ) : (
            <p style={{ background: 'var(--accent-soft)', padding: 12, borderRadius: 12, color: 'var(--accent)', margin: 0 }}>
              아쉬워요. 정답은 <strong lang="ja">{answer}</strong> <span style={{ color: 'var(--ink-soft)' }}>— {card.korean}</span>
            </p>
          )}
          <button style={{ ...BTN, marginTop: 10, width: '100%' }} onClick={() => speak(card.ja)} disabled={!ttsSupported()}><Icon name="listen" size={16} /> 발음 듣기</button>
          <button style={{ ...PRIMARY, marginTop: 10, width: '100%' }} onClick={onNext}>다음</button>
        </div>
      )}
    </div>
  );
}

// ── 품사 레인 — 작문 타일을 단어·조사·동사로 묶어 색으로 구분 ──
const POS_META: Record<SegPos, { label: string; color: string; soft: string }> = {
  word: { label: '단어', color: 'var(--ink-soft)', soft: 'var(--glass-bg-strong)' },
  particle: { label: '조사', color: '#3a78d8', soft: 'rgba(58,120,216,0.12)' },
  verb: { label: '동사·서술어', color: 'var(--ok)', soft: 'var(--ok-soft)' },
};
function PosLanes({ tiles, tilePos, usable, locked, onTap }: {
  tiles: string[]; tilePos: SegPos[]; usable: boolean[]; locked: boolean; onTap: (i: number) => void;
}) {
  const order: SegPos[] = ['word', 'particle', 'verb'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
      {order.map((pos) => {
        const idxs = tiles.map((_, i) => i).filter((i) => tilePos[i] === pos);
        if (idxs.length === 0) return null;
        const meta = POS_META[pos];
        return (
          <div key={pos} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: '0 0 56px', fontSize: 11, fontWeight: 800, color: meta.color, textAlign: 'right' }}>{meta.label}</span>
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {idxs.map((i) => (
                <button key={i} className="ym-press" onClick={() => onTap(i)} disabled={!usable[i] || locked} lang="ja"
                  style={{ ...BTN, fontSize: 22, padding: '8px 14px', opacity: usable[i] ? 1 : 0.28, background: meta.soft, border: `1.5px solid ${meta.color}`, color: 'var(--ink)' }}>{tiles[i]}</button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 작문(한→일): 한국어 보고 타일 조립. 분절되면 품사 레인, 아니면 가나 타일. ──
function ComposeBody({ card, onResult, onNext }: Props) {
  const [built, setBuilt] = useState<number[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const usable = card.tiles.map((_, i) => !built.includes(i));
  const builtText = built.map((i) => card.tiles[i]);
  const slotCount = Math.max(card.answer.length, built.length);

  function tap(i: number) { if (checked === null && usable[i]) setBuilt((b) => [...b, i]); }
  function removeAt(slot: number) { if (checked === null && slot < built.length) setBuilt((b) => [...b.slice(0, slot), ...b.slice(slot + 1)]); }
  function undo() { if (checked === null) setBuilt((b) => b.slice(0, -1)); }
  function check() { const ok = builtText.length === card.answer.length && builtText.every((t, i) => t === card.answer[i]); setChecked(ok); onResult(ok); }

  return (
    <div>
      <h2 style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="dictation" size={22} /> 작문</h2>
      <p style={{ color: 'var(--ink-soft)', margin: '4px 0 0' }}>{card.tilePos ? '뜻을 보고, 단어·조사·동사를 골라 문장을 만들어요' : '뜻을 보고, 가나를 골라 일본어 문장을 만들어요'}</p>

      <div style={{ textAlign: 'center', marginTop: 14 }}>
        <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>{card.korean}</p>
        <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: '6px 0 0' }}>일본어로 만들어 보세요</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', margin: '18px 0 6px', minHeight: 52 }}>
        {Array.from({ length: slotCount }, (_, i) => {
          const ch = builtText[i];
          const caret = checked === null && i === built.length && i < card.answer.length;
          let border = 'var(--glass-border)', bg = ch !== undefined ? 'var(--glass-bg-strong)' : 'transparent', color = 'var(--ink)';
          if (checked !== null && ch !== undefined) { const ok = ch === card.answer[i]; border = ok ? 'var(--ok)' : 'var(--accent)'; bg = ok ? 'var(--ok-soft)' : 'var(--accent-soft)'; color = ok ? 'var(--ink)' : 'var(--accent)'; }
          // 품사 묶음(단어 타일)은 글자 수가 달라 가변 폭, 가나 단위는 고정 44px.
          const wide = !!card.tilePos;
          return (
            <button key={i} onClick={() => removeAt(i)} disabled={checked !== null || ch === undefined} lang="ja"
              style={{ ...(wide ? { minWidth: 44, padding: '0 12px' } : { width: 44 }), height: 52, borderRadius: 12, fontSize: wide ? 22 : 26, fontWeight: 700, color, border: `1.5px ${ch === undefined ? 'dashed' : 'solid'} ${caret ? 'var(--accent)' : border}`, background: bg, cursor: checked === null && ch !== undefined ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
              {ch ?? ''}
            </button>
          );
        })}
      </div>

      {card.tilePos ? (
        <PosLanes tiles={card.tiles} tilePos={card.tilePos} usable={usable} locked={checked !== null} onTap={tap} />
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 10 }}>
          {card.tiles.map((t, i) => (
            <button key={i} className="ym-press" onClick={() => tap(i)} disabled={!usable[i] || checked !== null} lang="ja"
              style={{ ...BTN, fontSize: 24, padding: '8px 16px', opacity: usable[i] ? 1 : 0.28, background: 'var(--glass-bg-strong)' }}>{t}</button>
          ))}
        </div>
      )}

      {checked === null ? (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button style={{ ...BTN, flex: 1, textAlign: 'center' }} onClick={undo} disabled={built.length === 0}>⌫ 지우기</button>
          <button style={{ ...PRIMARY, flex: 2 }} onClick={check} disabled={built.length === 0}>확인</button>
        </div>
      ) : (
        <div className="ym-reveal" style={{ marginTop: 16 }}>
          {checked ? (
            <p style={{ background: 'var(--ok-soft)', padding: 12, borderRadius: 12, color: 'var(--ok)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={16} /> 정답! {card.answer.join('')} — {card.korean}
            </p>
          ) : (
            <p style={{ background: 'var(--accent-soft)', padding: 12, borderRadius: 12, color: 'var(--accent)', margin: 0 }}>
              아쉬워요. 정답은 <strong lang="ja">{card.answer.join('')}</strong> <span style={{ color: 'var(--ink-soft)' }}>— {card.korean}</span>
            </p>
          )}
          <button style={{ ...BTN, marginTop: 10, width: '100%' }} onClick={() => speak(card.ja)} disabled={!ttsSupported()}><Icon name="listen" size={16} /> 발음 듣기</button>
          <button style={{ ...PRIMARY, marginTop: 10, width: '100%' }} onClick={onNext}>다음</button>
        </div>
      )}
    </div>
  );
}
