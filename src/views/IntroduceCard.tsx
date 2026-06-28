// 새 표현 소개 카드 — 퀴즈 전에 의미·소리·쪼개보기를 먼저 제공.
import { useState, type CSSProperties } from 'react';
import type { IntroduceCard } from '../learn/cards';
import { VOCAB_GROUPS } from '../content/thematicVocab';
import { speak, ttsSupported } from '../tts';
import { PRIMARY } from '../ui/styles';
import { ReadingAid } from './ReadingAid';
import { Icon } from '../ui/Icon';
import { WordArt, hasWordArt, wordArtAssetSrcForId } from './WordArt';

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

  if (preferImageArt) {
    return (
      <div>
        <QuickPracticeWordScene card={card} />
        <WordLearningPanel card={card} isKanaFamiliar={isKanaFamiliar} />
        <VocabMiniContext card={card} />

        {card.answersQuestion && (
          <div style={{ marginTop: 8, padding: 10, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.03em' }}>질문</p>
            <button onClick={() => speak(card.answersQuestion!.ja)} disabled={!ttsSupported()}
              style={{ display: 'block', width: '100%', marginTop: 4, padding: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
              <span lang="ja" style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{card.answersQuestion.kana}</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{card.answersQuestion.korean}</span>
            </button>
          </div>
        )}

        {card.altAnswers && card.altAnswers.length > 0 && (
          <div style={{ marginTop: 8, padding: 10, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.03em' }}>다른 답</p>
            {card.altAnswers.map((a, i) => (
              <button key={i} onClick={() => speak(a.ja)} disabled={!ttsSupported()}
                style={{ display: 'block', width: '100%', marginTop: i ? 6 : 0, padding: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
                <span lang="ja" style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>{a.kana}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{a.korean}</span>
              </button>
            ))}
          </div>
        )}

        <button style={{ ...PRIMARY, width: '100%', marginTop: 10 }} onClick={next}>알겠어요</button>
      </div>
    );
  }

  return (
    <div>
      {!headerInScene && <h2 style={{ marginTop: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="discover" size={22} /> 새 표현</h2>}
      {preferImageArt ? (
        <QuickPracticeWordScene card={card} />
      ) : (
        hasWordArt(card.id) && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 8px' }}>
            <span style={{ display: 'inline-flex', padding: 8, borderRadius: 20, background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)', boxShadow: '0 6px 16px rgba(0,0,0,.08)' }}>
              <WordArt id={card.id} korean={card.korean} kana={card.kana} ja={card.ja} size={104} />
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

      {hasWrittenFormHint(card) && <WrittenFormHint card={card} />}

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

      <button style={{ ...PRIMARY, width: '100%', marginTop: 10 }} onClick={next}>알겠어요</button>
    </div>
  );
}

function WordLearningPanel({ card, isKanaFamiliar }: { card: IntroduceCard; isKanaFamiliar: (char: string) => boolean }) {
  const showWritten = hasWrittenFormHint(card);
  return (
    <button
      onClick={() => speak(card.ja)}
      disabled={!ttsSupported()}
      style={{
        width: '100%',
        position: 'relative',
        display: 'grid',
        gap: 8,
        alignItems: 'stretch',
        marginTop: 10,
        padding: '14px 16px',
        border: '1px solid rgba(185,56,46,.18)',
        borderRadius: 18,
        background: 'var(--accent-soft)',
        color: 'var(--ink)',
        boxShadow: '0 10px 24px rgba(185,56,46,.1)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{ display: 'grid', gap: 4, minWidth: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 850, color: 'var(--ink-soft)', lineHeight: 1 }}>읽기</span>
        <span lang="ja" style={{ display: 'block', fontWeight: 950, lineHeight: 1.05, color: 'var(--ink)', overflowWrap: 'anywhere' }}>
          <ReadingAid text={card.kana} isFamiliar={isKanaFamiliar} fontSize={40} />
        </span>
      </span>

      <span style={{ display: 'grid', gap: 4, minWidth: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 850, color: 'var(--ink-soft)', lineHeight: 1 }}>뜻</span>
        <span style={{ display: 'block', fontSize: 19, lineHeight: 1.22, fontWeight: 900, color: 'var(--ink)', overflowWrap: 'anywhere' }}>{card.korean}</span>
      </span>

      {showWritten && (
        <span style={{
          display: 'grid',
          gap: 4,
          minWidth: 0,
          paddingTop: 8,
          borderTop: '1px solid rgba(185,56,46,.18)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 850, color: 'var(--ink-soft)', lineHeight: 1 }}>표기</span>
          <span lang="ja" style={{ display: 'block', fontSize: 31, lineHeight: 1.08, fontWeight: 950, color: 'var(--ink)', letterSpacing: 0, overflowWrap: 'anywhere' }}>{card.ja}</span>
        </span>
      )}

      <Icon name="listen" size={20} style={{ position: 'absolute', right: 12, top: 11, color: 'var(--accent)', opacity: 0.82 }} />
    </button>
  );
}

function VocabMiniContext({ card }: { card: IntroduceCard }) {
  const response = vocabResponseForCard(card);
  if (!response) return null;
  return (
    <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
      <button onClick={() => speak(response.ja)} disabled={!ttsSupported()} style={miniContextStyle}>
        <span style={miniLabelStyle}>반응</span>
        <span lang="ja" style={miniJaStyle}>{response.ja}</span>
        <span style={miniKoStyle}>{response.korean}</span>
      </button>
    </div>
  );
}

const miniContextStyle: CSSProperties = {
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '42px 1fr',
  gap: '2px 9px',
  alignItems: 'baseline',
  padding: '8px 10px',
  borderRadius: 12,
  border: '1px solid rgba(52, 199, 89, .34)',
  background: 'linear-gradient(135deg, rgba(52, 199, 89, .16), rgba(76, 175, 120, .08))',
  color: 'var(--ink)',
  textAlign: 'left',
  cursor: 'pointer',
};
const miniLabelStyle: CSSProperties = { gridRow: '1 / span 2', alignSelf: 'center', fontSize: 11, fontWeight: 900, color: 'var(--ok)' };
const miniJaStyle: CSSProperties = { fontSize: 13.5, lineHeight: 1.25, fontWeight: 850, overflowWrap: 'anywhere' };
const miniKoStyle: CSSProperties = { fontSize: 12, lineHeight: 1.25, fontWeight: 700, color: 'var(--ink-soft)', overflowWrap: 'anywhere' };

function vocabResponseForCard(card: IntroduceCard): { ja: string; korean: string } | null {
  const m = /^vocab:([^:]+):study:([^:]+)$/.exec(card.id);
  if (!m || m[2].startsWith('ex')) return null;
  const group = VOCAB_GROUPS.find((g) => g.id === m[1]);
  const item = group?.items.find((x) => x.id === m[2]);
  if (!group || !item) return null;
  return greetingResponseFor(item.id) ?? null;
}

function greetingResponseFor(id: string): { ja: string; korean: string } | undefined {
  const responses: Record<string, { ja: string; korean: string }> = {
    g_ohayou: { ja: 'おはようございます。', korean: '안녕하세요(아침)라고 답해요.' },
    g_konnichiwa: { ja: 'こんにちは。', korean: '안녕하세요(낮)라고 답해요.' },
    g_konbanwa: { ja: 'こんばんは。', korean: '안녕하세요(저녁)라고 답해요.' },
    g_arigatou: { ja: 'どういたしまして。', korean: '천만에요.' },
    g_sumimasen: { ja: '大丈夫です。', korean: '괜찮아요.' },
    g_gomen: { ja: '大丈夫です。', korean: '괜찮아요.' },
    g_ittekimasu: { ja: '行ってらっしゃい。', korean: '잘 다녀오세요.' },
    g_itterasshai: { ja: '行ってきます。', korean: '다녀오겠습니다.' },
    g_tadaima: { ja: 'おかえりなさい。', korean: '어서 와요.' },
    g_okaerinasai: { ja: 'ただいま。', korean: '다녀왔습니다.' },
    g_hajimemashite: { ja: 'よろしくお願いします。', korean: '잘 부탁드립니다.' },
    g_yoroshiku: { ja: 'こちらこそ、よろしくお願いします。', korean: '저야말로 잘 부탁드립니다.' },
  };
  return responses[id];
}

function hasWrittenFormHint(card: IntroduceCard): boolean {
  return compactText(card.ja) !== compactText(card.kana);
}

function hasKanji(text: string): boolean {
  return /[\u4E00-\u9FFF]/.test(text);
}

function WrittenFormHint({ card }: { card: IntroduceCard }) {
  const label = hasKanji(card.ja) ? '한자 표기' : '표기';
  return (
    <div style={{
      marginTop: 8,
      padding: '10px 12px',
      borderRadius: 12,
      border: '1px solid var(--glass-border)',
      background: 'var(--surface-2)',
    }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 850, color: 'var(--ink-faint)', letterSpacing: '.03em' }}>표기 힌트</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(44px, auto) 1fr', gap: '5px 10px', alignItems: 'baseline', marginTop: 7 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)' }}>읽기</span>
        <span lang="ja" style={{ fontSize: 17, fontWeight: 850, color: 'var(--ink)' }}>{card.kana}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)' }}>{label}</span>
        <span lang="ja" style={{ fontSize: 22, fontWeight: 900, color: 'var(--ink)', letterSpacing: 0 }}>{card.ja}</span>
      </div>
      {card.tip && <p style={{ margin: '5px 0 0', fontSize: 12, lineHeight: 1.45, color: 'var(--ink-faint)', fontWeight: 650 }}>{card.tip}</p>}
    </div>
  );
}

function quickPracticeGroup(id: string): string {
  if (!id.startsWith('vocab:')) return '';
  return id.split(':')[1] ?? '';
}

function quickPracticeArtForCard(card: IntroduceCard): string {
  const group = quickPracticeGroup(card.id);
  if (group === 'greetings') return 'greetings';
  if (group === 'food') return 'vocab';
  if (group === 'transport') return 'signs';
  if (group === 'places') return 'signs';
  if (group === 'feelings') return 'vocab';
  if (card.id.startsWith('basic:')) return 'basics';
  if (card.id.startsWith('sign:')) return 'signs';
  return 'vocab';
}

function compactText(text?: string): string {
  return (text ?? '').replace(/[\s。、,.!?！？()（）[\]{}·・/]/g, '').toLowerCase();
}

function wordArtSrcForCard(card: IntroduceCard): string | null {
  const direct = wordArtAssetSrcForId(card.id);
  if (direct) return direct;

  const sentenceMatch = /^vocab:([^:]+):study:ex\d+$/.exec(card.id);
  if (!sentenceMatch) return null;

  const group = VOCAB_GROUPS.find((g) => g.id === sentenceMatch[1]);
  if (!group) return null;

  const jaText = compactText(card.ja);
  const kanaText = compactText(card.kana);
  const koreanText = compactText(card.korean);
  const items = [...group.items].sort((a, b) => Math.max(b.ja.length, b.kana.length, b.korean.length) - Math.max(a.ja.length, a.kana.length, a.korean.length));

  const matched = items.find((item) => {
    const ja = compactText(item.ja);
    const kana = compactText(item.kana);
    const koreanCandidates = item.korean
      .split(/[()/·・]/)
      .map((part) => compactText(part))
      .filter(Boolean);

    return (ja.length > 0 && jaText.includes(ja)) ||
      (kana.length > 1 && kanaText.includes(kana)) ||
      koreanCandidates.some((ko) => ko.length > 0 && koreanText.includes(ko));
  });

  return matched ? `/vocab/word-art/${group.id}/${matched.id}.png` : null;
}

function ImageCornerOverlay({ card }: { card: IntroduceCard }) {
  const group = card.tag.replace(/^어휘 ·\s*/, '').replace(/\s*·.*$/, '');
  return (
    <>
      <span style={{
        position: 'absolute',
        left: 10,
        top: 10,
        zIndex: 2,
        padding: '5px 10px',
        borderRadius: 999,
        background: 'rgba(255,255,255,.82)',
        color: 'var(--accent)',
        fontSize: 12,
        fontWeight: 900,
        boxShadow: '0 8px 18px rgba(40,24,10,.12)',
        backdropFilter: 'blur(8px)',
      }}>{group}</span>
      <button
        onClick={() => speak(card.ja)}
        disabled={!ttsSupported()}
        aria-label="듣기"
        style={{
          position: 'absolute',
          right: 10,
          top: 10,
          zIndex: 2,
          width: 36,
          height: 36,
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,.68)',
          background: 'rgba(255,255,255,.84)',
          color: 'var(--accent)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 18px rgba(40,24,10,.12)',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Icon name="listen" size={18} />
      </button>
    </>
  );
}

function QuickPracticeWordScene({ card }: { card: IntroduceCard }) {
  const art = quickPracticeArtForCard(card);
  const imageSrc = card.id.startsWith('sign:') ? null : wordArtSrcForCard(card);
  const [imageFailed, setImageFailed] = useState(false);
  if (imageSrc && !imageFailed) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '-2px -4px 14px' }}>
        <div style={{
          position: 'relative',
          width: 'min(75%, 520px)',
          aspectRatio: '1 / 1',
          overflow: 'hidden',
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,.58)',
          background: 'rgba(255,255,255,.32)',
          boxShadow: '0 10px 22px rgba(54,38,20,.09)',
        }}>
          <img
            src={imageSrc}
            alt={`${card.korean} 이미지`}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
              filter: 'saturate(1.02) contrast(1.01)',
            }}
          />
          <ImageCornerOverlay card={card} />
        </div>
      </div>
    );
  }

  if (hasWordArt(card.id)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '-2px -4px 14px' }}>
        <div style={{
          position: 'relative',
          width: 'min(75%, 520px)',
          aspectRatio: '1 / 1',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          borderRadius: 22,
          border: '1px solid rgba(255,255,255,.58)',
          background: 'rgba(255,255,255,.32)',
          boxShadow: '0 10px 22px rgba(54,38,20,.09)',
        }}>
          <WordArt id={card.id} korean={card.korean} kana={card.kana} ja={card.ja} size={240} style={{ width: '100%', height: '100%' }} />
          <ImageCornerOverlay card={card} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '-2px -4px 14px' }}>
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: 'min(54vh, 430px)',
        overflow: 'hidden',
        borderRadius: 24,
        border: '1px solid var(--glass-border)',
        background: 'var(--surface-2)',
        boxShadow: '0 12px 28px rgba(54,38,20,.12)',
      }}>
        <img
          src={`/scenes/quick-practice/${art}.webp`}
          alt={`${card.korean} 연습 장면`}
          loading="lazy"
          decoding="async"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 1,
            filter: 'saturate(1.04) contrast(1.02)',
          }}
        />
        <span aria-hidden style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(18,14,10,.04), transparent 48%, rgba(18,14,10,.18))',
        }} />
        <ImageCornerOverlay card={card} />
      </div>
    </div>
  );
}
