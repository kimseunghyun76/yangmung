// 새 표현 소개 카드 — 퀴즈 전에 의미·소리·쪼개보기를 먼저 제공.
import type { IntroduceCard } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { PRIMARY } from '../ui/styles';
import { ReadingAid } from './ReadingAid';
import { Icon } from '../ui/Icon';
import { MascotBubble } from './mascot';
import { WordArt, hasWordArt } from './WordArt';

interface Props {
  card: IntroduceCard;
  isKanaFamiliar: (char: string) => boolean;
  onSeen: () => void;
  onNext: () => void;
  // 타이틀·설명을 배경 장면 하단에 얹는 경우 본문에서는 숨긴다.
  headerInScene?: boolean;
  preferImageArt?: boolean;
}

export function IntroduceCardView({ card, isKanaFamiliar, onSeen, onNext, headerInScene, preferImageArt }: Props) {
  function next() {
    onSeen();
    onNext();
  }

  return (
    <div>
      {!headerInScene && <h2 style={{ marginTop: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="discover" size={22} /> 새 표현</h2>}
      {hasWordArt(card.id) && (
        preferImageArt ? (
          <QuickPracticeWordScene card={card} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 8px' }}>
            <span style={{ display: 'inline-flex', padding: 8, borderRadius: 20, background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', boxShadow: '0 6px 16px rgba(0,0,0,.08)' }}>
              <WordArt id={card.id} korean={card.korean} kana={card.kana} size={104} />
            </span>
          </div>
        )
      )}
      {!headerInScene && <p style={{ color: 'var(--ink-soft)', marginTop: 0, lineHeight: 1.5 }}>{card.note}</p>}

      {card.answersQuestion && (
        <div style={{ marginTop: headerInScene ? 4 : 10, padding: 10, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.03em' }}>이런 질문에 답할 때</p>
          <button onClick={() => speak(card.answersQuestion!.ja)} disabled={!ttsSupported()}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
            <span lang="ja" style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{card.answersQuestion.kana}</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{card.answersQuestion.korean}</span>
          </button>
          <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', fontWeight: 700 }}>↓ 이렇게 답해요</p>
        </div>
      )}

      {/* 일본어 블록 — 핵심 새 표현. 크게 보여주고, 탭하면 듣기 */}
      <button onClick={() => speak(card.ja)} disabled={!ttsSupported()}
        style={{ display: 'block', width: '100%', background: 'var(--accent-soft)', padding: '14px 12px', borderRadius: 12, marginTop: 10, textAlign: 'center', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
        <ReadingAid text={card.kana} isFamiliar={isKanaFamiliar} fontSize={38} />
        <p style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 600, color: 'var(--ink-soft)' }}>{card.korean}</p>
      </button>

      {card.altAnswers && card.altAnswers.length > 0 && (
        <div style={{ marginTop: 8, padding: 10, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.03em' }}>이렇게도 답할 수 있어요</p>
          {card.altAnswers.map((a, i) => (
            <button key={i} onClick={() => speak(a.ja)} disabled={!ttsSupported()}
              style={{ display: 'block', width: '100%', marginTop: i ? 6 : 0, padding: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
              <span lang="ja" style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>{a.kana}</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{a.korean}</span>
            </button>
          ))}
        </div>
      )}

      {/* 고양이 말풍선 — 팁이 있으면 팁을, 없으면 짧은 안내 */}
      <MascotBubble who="yang" mood="tip" key={`${card.id}:tip`} style={{ marginTop: 8 }}>
        {card.tip ?? '소리와 뜻을 같이 익혀요.'}
      </MascotBubble>
      <button style={{ ...PRIMARY, width: '100%', marginTop: 10 }} onClick={next}>알겠어요</button>
    </div>
  );
}

function quickPracticeGroup(id: string): string {
  if (!id.startsWith('vocab:')) return '';
  return id.split(':')[1] ?? '';
}

function greetingCopy(card: IntroduceCard): { left: string; right: string } {
  const kana = card.kana;
  if (kana.includes('ありがとう')) return { left: 'ありがとう', right: 'どういたしまして' };
  if (kana.includes('おはよう')) return { left: 'おはよう', right: 'おはようございます' };
  if (kana.includes('こんばんは')) return { left: 'こんばんは', right: 'こんばんは' };
  if (kana.includes('さようなら') || kana.includes('また')) return { left: 'またね', right: 'さようなら' };
  if (kana.includes('ただいま') || kana.includes('おかえり')) return { left: 'ただいま', right: 'おかえりなさい' };
  if (kana.includes('すみません') || kana.includes('ごめん')) return { left: 'すみません', right: 'だいじょうぶ' };
  return { left: kana, right: 'よろしくね' };
}

function QuickPracticeWordScene({ card }: { card: IntroduceCard }) {
  const group = quickPracticeGroup(card.id);
  const greeting = group === 'greetings';
  const copy = greetingCopy(card);
  const accent = greeting ? '#e7a33e' : '#b9382e';
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 12px' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 360,
        minHeight: 204,
        overflow: 'hidden',
        borderRadius: 24,
        border: '1px solid var(--glass-border)',
        background: `linear-gradient(180deg, rgba(255,253,246,.95), rgba(255,247,235,.88)), radial-gradient(circle at 50% 18%, ${accent}33, transparent 54%)`,
        boxShadow: '0 12px 28px rgba(54,38,20,.12)',
      }}>
        <span aria-hidden style={{
          position: 'absolute', inset: 18, borderRadius: 22,
          border: '1px dashed rgba(120,84,42,.16)',
        }} />
        {greeting && (
          <>
            <SpeechBubble text={copy.left} side="left" />
            <SpeechBubble text={copy.right} side="right" />
          </>
        )}
        <div style={{ position: 'absolute', left: 18, bottom: 8, width: 86, height: 86, display: 'grid', placeItems: 'center' }}>
          <img src="/mascots/mung-shiba-face.webp" alt="" aria-hidden style={{ width: 78, height: 78, objectFit: 'contain', filter: 'drop-shadow(0 10px 12px rgba(60,38,14,.18))' }} />
        </div>
        <div style={{ position: 'absolute', right: 18, bottom: 8, width: 86, height: 86, display: 'grid', placeItems: 'center' }}>
          <img src="/mascots/yang-cat-face.webp" alt="" aria-hidden style={{ width: 78, height: 78, objectFit: 'contain', filter: 'drop-shadow(0 10px 12px rgba(60,38,14,.18))' }} />
        </div>
        <div style={{
          position: 'relative',
          zIndex: 1,
          minHeight: 188,
          padding: greeting ? '48px 84px 26px' : '22px 86px 20px',
          display: 'grid',
          placeItems: 'center',
        }}>
          <span style={{
            display: 'inline-flex',
            padding: 10,
            borderRadius: 28,
            background: 'rgba(255,255,255,.72)',
            border: '1px solid rgba(255,255,255,.78)',
            boxShadow: '0 10px 24px rgba(83,56,24,.12)',
          }}>
            <WordArt id={card.id} korean={card.korean} kana={card.kana} size={greeting ? 128 : 148} preferAsset />
          </span>
        </div>
      </div>
    </div>
  );
}

function SpeechBubble({ text, side }: { text: string; side: 'left' | 'right' }) {
  return (
    <span lang="ja" style={{
      position: 'absolute',
      top: 18,
      [side]: 18,
      zIndex: 2,
      maxWidth: 148,
      padding: '8px 11px',
      borderRadius: 16,
      background: '#fffdf6',
      border: '1px solid rgba(168,118,52,.18)',
      color: '#624126',
      fontSize: 13,
      fontWeight: 900,
      lineHeight: 1.2,
      textAlign: 'center',
      boxShadow: '0 8px 18px rgba(76,45,12,.1)',
      wordBreak: 'keep-all',
    }}>{text}</span>
  );
}
