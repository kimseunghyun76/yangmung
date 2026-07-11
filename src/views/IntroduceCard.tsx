// 새 표현 소개 카드 — 퀴즈 전에 의미·소리·쪼개보기를 먼저 제공.
import { useState, type CSSProperties } from 'react';
import type { IntroduceCard } from '../learn/cards';
import { VOCAB_GROUPS } from '../content/thematicVocab';
import { greetingResponseFor } from '../content/greetingResponses';
import { vocabExampleFor } from '../content/vocabExamples';
import { speak, ttsSupported } from '../tts';
import { PRIMARY } from '../ui/styles';
import { ReadingAid } from './ReadingAid';
import { toReadingUnits } from '../learn/kanaReading';
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

// 학습 카드 본문 — 표기 위주 이미지 카드든, 아이콘/무이미지 카드든 동일한 구조(표기 크게 → 읽기·뜻 작게 →
// 반응 → 다음)를 쓴다. 예전엔 preferImageArt에 따라 완전히 다른 레이아웃 두 벌을 유지했지만, "다음" 버튼
// 위치·표기 우선순위는 모든 학습에 똑같이 적용돼야 한다는 요청(2026-07-09)에 따라 하나로 합쳤다.
export function IntroduceCardView({ card, isKanaFamiliar, onSeen, onNext, headerInScene, preferImageArt }: Props) {
  function next() {
    onSeen();
    onNext();
  }

  return (
    <div>
      {!headerInScene && !preferImageArt && (
        <h2 style={{ marginTop: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="discover" size={22} /> 새 표현</h2>
      )}
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

      <WordLearningPanel card={card} isKanaFamiliar={isKanaFamiliar} japaneseOnImage={preferImageArt && hasSpecificWordImage(card)} />
      <VocabMiniContext card={card} />
      <VocabUsageExample card={card} />

      {card.answersQuestion && (
        <div style={{ marginTop: 8, padding: 10, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.03em' }}>이런 질문에 답할 때</p>
          <button onClick={() => speak(card.answersQuestion!.ja)} disabled={!ttsSupported()}
            style={{ display: 'block', width: '100%', marginTop: 4, padding: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
            <span lang="ja" style={{ display: 'block', fontSize: 15, fontWeight: 700 }}>{card.answersQuestion.kana}</span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{card.answersQuestion.korean}</span>
          </button>
          <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', fontWeight: 700 }}>↓ 이렇게 답해요</p>
        </div>
      )}

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

      {/* 다음 버튼 — 콘텐츠 길이와 무관하게 항상 같은 자리에서 이어지도록 하단에 고정 */}
      <button
        className="ym-press"
        style={{
          ...PRIMARY, width: '100%', marginTop: 12,
          position: 'sticky', bottom: 'max(6px, env(safe-area-inset-bottom))',
          boxShadow: '0 -6px 18px rgba(20,14,10,.14)',
        }}
        onClick={next}
      >알겠어요</button>
    </div>
  );
}

// 로마자 — 익숙도와 무관하게 항상 보여주는 보조 표기(ReadingAid는 익숙해지면 사라지는 학습용, 이건 참고용).
function toRomaji(kana: string): string {
  return toReadingUnits(kana).map((u) => (u.romaji === 'ー' ? '-' : u.romaji)).join('');
}

// 격식 배지 — 인사말처럼 상대에 따라 표현이 달라지는 항목에서 친한 사이/정중한 사이를 한눈에 구분.
function RegisterBadge({ register }: { register: 'casual' | 'formal' | 'both' }) {
  const label = register === 'casual' ? '친한 사이' : register === 'formal' ? '정중한 사이' : '두 사이 모두';
  const color = register === 'casual' ? 'var(--ok)' : register === 'formal' ? 'var(--accent)' : 'var(--ink-soft)';
  return (
    <span style={{
      fontSize: 10, fontWeight: 850, color, border: `1px solid ${color}`, borderRadius: 999,
      padding: '1px 7px', lineHeight: 1.5,
    }}>{label}</span>
  );
}

// japaneseOnImage: 이미지 위에 표기(+격식 배지)가 이미 오버레이됐으면 이 카드에서는 중복 표시를 뺀다
// (표기 텍스트, 격식 배지, 코너의 다시 듣기 아이콘 모두 이미지 쪽에만 남긴다).
function WordLearningPanel({ card, isKanaFamiliar, japaneseOnImage }: { card: IntroduceCard; isKanaFamiliar: (char: string) => boolean; japaneseOnImage?: boolean }) {
  const romaji = toRomaji(card.kana);
  return (
    <button
      onClick={() => speak(card.ja)}
      disabled={!ttsSupported()}
      style={{
        width: '100%',
        position: 'relative',
        display: 'grid',
        gap: 7,
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
      {/* 표기 — 가장 크게, 항상 표시(가타카나 전용 등 표기=읽기가 같아도 그대로 보여준다). 이미지에 이미 오버레이됐으면 생략 */}
      {!japaneseOnImage && (
        <span style={{ display: 'grid', gap: 4, minWidth: 0, paddingRight: 30 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 850, color: 'var(--ink-soft)', lineHeight: 1 }}>표기</span>
            {card.register && <RegisterBadge register={card.register} />}
          </span>
          <span lang="ja" style={{ display: 'block', fontSize: 34, lineHeight: 1.1, fontWeight: 950, color: 'var(--ink)', letterSpacing: 0, overflowWrap: 'anywhere' }}>{card.ja}</span>
        </span>
      )}

      {/* 읽기 + 로마자 — 작게 */}
      <span style={{ display: 'grid', gap: 3, minWidth: 0, paddingTop: japaneseOnImage ? 0 : 7, borderTop: japaneseOnImage ? 'none' : '1px solid rgba(185,56,46,.18)' }}>
        <span style={{ fontSize: 10.5, fontWeight: 850, color: 'var(--ink-soft)', lineHeight: 1 }}>읽기</span>
        <span lang="ja" style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 850, lineHeight: 1.15, color: 'var(--ink)', overflowWrap: 'anywhere' }}>
            <ReadingAid text={card.kana} isFamiliar={isKanaFamiliar} fontSize={17} />
          </span>
          {romaji && <span lang="" style={{ fontSize: 12, fontWeight: 650, color: 'var(--ink-faint)' }}>[{romaji}]</span>}
        </span>
      </span>

      {/* 뜻 — 작게, 팁이 있으면 바로 아래 이어서 */}
      <span style={{ display: 'grid', gap: 3, minWidth: 0 }}>
        <span style={{ fontSize: 10.5, fontWeight: 850, color: 'var(--ink-soft)', lineHeight: 1 }}>뜻</span>
        <span style={{ display: 'block', fontSize: 14.5, lineHeight: 1.3, fontWeight: 800, color: 'var(--ink)', overflowWrap: 'anywhere' }}>{card.korean}</span>
        {card.tip && <span style={{ display: 'block', fontSize: 12, lineHeight: 1.45, fontWeight: 600, color: 'var(--ink-soft)' }}>{card.tip}</span>}
      </span>

      {!japaneseOnImage && <Icon name="listen" size={20} style={{ position: 'absolute', right: 12, top: 11, color: 'var(--accent)', opacity: 0.82 }} />}
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

// 단어 사용 예제 — "단어만 외우지 말고 예제로" 요청에 따라, 그 단어를 쓰게 되는 질문↔답변을 함께 보여준다.
function vocabItemIdForCard(card: IntroduceCard): string | null {
  const m = /^vocab:([^:]+):study:([^:]+)$/.exec(card.id);
  if (!m || m[2].startsWith('ex')) return null;
  return m[2];
}

function VocabUsageExample({ card }: { card: IntroduceCard }) {
  const itemId = vocabItemIdForCard(card);
  const example = itemId ? vocabExampleFor(itemId) : undefined;
  if (!example) return null;
  return (
    <div style={{ marginTop: 8, padding: 10, borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--surface-2)' }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: 'var(--ink-faint)', letterSpacing: '.03em' }}>실전 예제 · 질문</p>
      <button onClick={() => speak(example.questionJa)} disabled={!ttsSupported()}
        style={{ display: 'block', width: '100%', marginTop: 4, padding: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
        <span lang="ja" style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>{example.questionKana}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{example.questionKorean}</span>
      </button>
      <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--ink-faint)', textAlign: 'center', fontWeight: 700 }}>↓ 답변</p>
      <button onClick={() => speak(example.answerJa)} disabled={!ttsSupported()}
        style={{ display: 'block', width: '100%', marginTop: 4, padding: 0, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
        <span lang="ja" style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>{example.answerKana}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 600 }}>{example.answerKorean}</span>
      </button>
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

  return matched ? `/vocab/word-art/${group.id}/${matched.id}.webp` : null;
}

// 이 카드의 이미지가 그 단어를 구체적으로 그려낸 전용 이미지(사진 아트 또는 WordArt 일러스트)인지 —
// 그런 경우에만 표기를 이미지 위에 오버레이하고 설명 카드 쪽 표기는 생략한다. 명장면/노래/방송처럼
// 이미지 자체가 없거나, 매칭되는 이미지가 없어 일반 배경 장면만 뜨는 경우는 표기를 설명 카드에 남긴다.
function hasSpecificWordImage(card: IntroduceCard): boolean {
  if (card.id.startsWith('dlg:') || card.id.startsWith('song:') || card.id.startsWith('announce:')) return false;
  if (card.id.startsWith('sign:') || card.id.startsWith('basic:')) return hasWordArt(card.id);
  return !!wordArtSrcForCard(card) || hasWordArt(card.id);
}

function ImageCornerOverlay({ card, showJapanese }: { card: IntroduceCard; showJapanese?: boolean }) {
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
      {showJapanese && (
        <span aria-hidden style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 1,
          padding: '28px 14px 12px',
          background: 'linear-gradient(to top, rgba(18,14,10,.78), rgba(18,14,10,.32) 60%, transparent)',
        }}>
          {card.register && (
            <span style={{ display: 'inline-block', marginBottom: 4 }}>
              <RegisterBadge register={card.register} />
            </span>
          )}
          <span lang="ja" style={{ display: 'block', fontSize: 26, lineHeight: 1.15, fontWeight: 950, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.5)', overflowWrap: 'anywhere' }}>{card.ja}</span>
        </span>
      )}
    </>
  );
}

function QuickPracticeWordScene({ card }: { card: IntroduceCard }) {
  // card.id 접두사에 따라 아래서 조기 반환하므로, 훅은 항상 그보다 앞에서 같은 순서로 호출한다(rules-of-hooks).
  const [imageFailed, setImageFailed] = useState(false);
  // 명장면 대화·노래 가사·방송 메시지는 매칭되는 이미지가 없어 항상 같은 일반 배경(vocab.webp)만
  // 뜨게 된다 — 내용과 무관한 의미 없는 이미지라 아예 표시하지 않는다.
  if (card.id.startsWith('dlg:') || card.id.startsWith('song:') || card.id.startsWith('announce:')) return null;

  const art = quickPracticeArtForCard(card);
  const imageSrc = card.id.startsWith('sign:') || card.id.startsWith('basic:') ? null : wordArtSrcForCard(card);
  if (imageSrc && !imageFailed) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '-2px -4px 14px' }}>
        <div style={{
          position: 'relative',
          width: '100%',
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
          <ImageCornerOverlay card={card} showJapanese />
        </div>
      </div>
    );
  }

  if (hasWordArt(card.id)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '-2px -4px 14px' }}>
        <div style={{
          position: 'relative',
          width: '100%',
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
          <ImageCornerOverlay card={card} showJapanese />
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
