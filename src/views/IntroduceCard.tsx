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
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 8px' }}>
          <span style={{ display: 'inline-flex', padding: 8, borderRadius: 20, background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', boxShadow: '0 6px 16px rgba(0,0,0,.08)' }}>
            <WordArt id={card.id} korean={card.korean} kana={card.kana} size={104} preferAsset={preferImageArt} />
          </span>
        </div>
      )}
      {!headerInScene && <p style={{ color: 'var(--ink-soft)', marginTop: 0, lineHeight: 1.5 }}>{card.note}</p>}

      {card.answersQuestion && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.03em' }}>이런 질문에 답할 때</p>
          <button onClick={() => speak(card.answersQuestion!.ja)} disabled={!ttsSupported()}
            style={{ display: 'block', width: '100%', marginTop: 6, padding: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
            <span lang="ja" style={{ display: 'block', fontSize: 16, fontWeight: 700 }}>{card.answersQuestion.kana}</span>
            <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600 }}>{card.answersQuestion.korean}</span>
          </button>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', fontWeight: 700 }}>↓ 이렇게 답해요</p>
        </div>
      )}

      {/* 일본어 블록 — 탭하면 듣기 */}
      <button onClick={() => speak(card.ja)} disabled={!ttsSupported()}
        style={{ display: 'block', width: '100%', background: 'var(--accent-soft)', padding: 16, borderRadius: 10, marginTop: 14, textAlign: 'center', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
        <ReadingAid text={card.kana} isFamiliar={isKanaFamiliar} fontSize={30} />
        <p style={{ margin: '8px 0 0', color: 'var(--ink-soft)' }}>{card.korean}</p>
      </button>

      {card.altAnswers && card.altAnswers.length > 0 && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
          <p style={{ margin: '0 0 8px', fontSize: 11.5, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.03em' }}>이렇게도 답할 수 있어요</p>
          {card.altAnswers.map((a, i) => (
            <button key={i} onClick={() => speak(a.ja)} disabled={!ttsSupported()}
              style={{ display: 'block', width: '100%', marginTop: i ? 8 : 0, padding: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
              <span lang="ja" style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{a.kana}</span>
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600 }}>{a.korean}</span>
            </button>
          ))}
        </div>
      )}

      {/* 고양이 말풍선 — 팁이 있으면 팁을, 없으면 짧은 안내 */}
      <MascotBubble who="yang" mood="tip" key={`${card.id}:tip`} style={{ marginTop: 14 }}>
        {card.tip ?? '소리와 뜻을 같이 익혀요.'}
      </MascotBubble>
      <button style={{ ...PRIMARY, width: '100%', marginTop: 14 }} onClick={next}>알겠어요</button>
    </div>
  );
}
