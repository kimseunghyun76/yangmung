// 새 표현 소개 카드 — 퀴즈 전에 의미·소리·쪼개보기를 먼저 제공.
import type { IntroduceCard } from '../learn/cards';
import { speak, ttsSupported } from '../tts';
import { BTN, PRIMARY } from '../ui/styles';
import { ReadingAid } from './ReadingAid';
import { Icon } from '../ui/Icon';
import { MascotBubble } from './mascot';
import { WordArt, hasWordArt } from './WordArt';

interface Props {
  card: IntroduceCard;
  isKanaFamiliar: (char: string) => boolean;
  onSeen: () => void;
  onNext: () => void;
}

export function IntroduceCardView({ card, isKanaFamiliar, onSeen, onNext }: Props) {
  function next() {
    onSeen();
    onNext();
  }

  return (
    <div>
      <h2 style={{ marginTop: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="discover" size={22} /> 새 표현</h2>
      {hasWordArt(card.id) && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 8px' }}>
          <span style={{ display: 'inline-flex', padding: 8, borderRadius: 20, background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', boxShadow: '0 6px 16px rgba(0,0,0,.08)' }}>
            <WordArt id={card.id} korean={card.korean} kana={card.kana} size={104} />
          </span>
        </div>
      )}
      <p style={{ color: 'var(--ink-soft)', marginTop: 0, lineHeight: 1.5 }}>{card.note}</p>

      {card.answersQuestion && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.03em' }}>이런 질문에 답할 때</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 6 }}>
            <span style={{ minWidth: 0 }}>
              <span lang="ja" style={{ display: 'block', fontSize: 16, fontWeight: 700 }}>{card.answersQuestion.kana}</span>
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600 }}>{card.answersQuestion.korean}</span>
            </span>
            <button onClick={() => speak(card.answersQuestion!.ja)} disabled={!ttsSupported()} aria-label="질문 듣기"
              style={{ flex: '0 0 auto', width: 38, height: 38, borderRadius: 11, border: '1px solid var(--glass-border)', background: 'var(--surface)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="listen" size={16} />
            </button>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', fontWeight: 700 }}>↓ 이렇게 답해요</p>
        </div>
      )}

      {/* 일본어 블록 — 탭하면 듣기 */}
      <button onClick={() => speak(card.ja)} disabled={!ttsSupported()}
        style={{ display: 'block', width: '100%', background: 'var(--accent-soft)', padding: 16, borderRadius: 10, marginTop: 14, textAlign: 'center', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
        <ReadingAid text={card.kana} isFamiliar={isKanaFamiliar} fontSize={30} />
        <p style={{ margin: '8px 0 0', color: 'var(--ink-soft)' }}>{card.korean}</p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11.5, color: 'var(--accent)', fontWeight: 750 }}><Icon name="listen" size={13} /> 탭하면 들려요</span>
      </button>

      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <button style={{ ...BTN, padding: '9px 16px', fontSize: 14, background: 'var(--surface)' }}
          onClick={() => speak(card.ja, { rate: 0.6 })} disabled={!ttsSupported()}>
          <span style={{ fontSize: 16, marginRight: 5 }} aria-hidden>🐢</span> 천천히 듣기
        </button>
      </div>

      {card.altAnswers && card.altAnswers.length > 0 && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
          <p style={{ margin: '0 0 8px', fontSize: 11.5, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.03em' }}>이렇게도 답할 수 있어요</p>
          {card.altAnswers.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: i ? 8 : 0 }}>
              <span style={{ minWidth: 0 }}>
                <span lang="ja" style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{a.kana}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-soft)', fontWeight: 600 }}>{a.korean}</span>
              </span>
              <button onClick={() => speak(a.ja)} disabled={!ttsSupported()} aria-label="듣기"
                style={{ flex: '0 0 auto', width: 34, height: 34, borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--surface)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="listen" size={15} />
              </button>
            </div>
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
