// 대화 리캡 카드 — 장면 끝에서 "방금 나눈 대화"를 일본어로 한 번에 보여준다.
// 점원 대사 ↔ 내가 고른 응답을 순서대로(채팅 형태), 전체를 TTS로 이어 읽기.
import { useMemo } from 'react';
import { CONTENT } from '../content';
import type { OrderCard } from '../learn/cards';
import { speak, speakParts, ttsSupported, type SpeakOpts } from '../tts';
import { PRIMARY } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { ReadingAid } from './ReadingAid';
import { sceneVisualByMission } from './scene';
import { PrimaryAction } from './shell';

// 세션 중 내가 고른 답변 (App에서 기록 → 리캡에서 재현)
export interface PickInfo { label: string; ja?: string; kana?: string; korean?: string; recovery: boolean; hasPhrase: boolean }
export type PickMap = Record<string, PickInfo>;

interface Props {
  card: OrderCard;
  picks: PickMap;
  isKanaFamiliar: (char: string) => boolean;
  onNext: () => void;
}

interface Answer { ja?: string; kana?: string; korean?: string; label?: string; action: boolean; recovery: boolean; model: boolean }
interface RecapPrompt { ja: string; kana: string; korean: string }

function fallbackPrompt(situation: string): RecapPrompt {
  if (/결제|계산|요금|가격/.test(situation)) return { ja: 'おしはらいはどうしますか', kana: 'おしはらいはどうしますか', korean: '결제는 어떻게 하시겠어요?' };
  if (/주문|메뉴|음료|먹거리/.test(situation)) return { ja: 'ごちゅうもんはおきまりですか', kana: 'ごちゅうもんはおきまりですか', korean: '주문은 정하셨나요?' };
  if (/인원|자리|입장/.test(situation)) return { ja: 'なんめいさまですか', kana: 'なんめいさまですか', korean: '몇 분이세요?' };
  if (/예약|체크인|숙소|호텔|료칸/.test(situation)) return { ja: 'ごよやくはありますか', kana: 'ごよやくはありますか', korean: '예약하셨나요?' };
  if (/증상|아프|약|병원|긴급|도움/.test(situation)) return { ja: 'どうしましたか', kana: 'どうしましたか', korean: '무슨 일이 있으세요?' };
  if (/길|위치|방향|승강장|버스|열차|전철/.test(situation)) return { ja: 'どちらへいきますか', kana: 'どちらへいきますか', korean: '어디로 가시나요?' };
  if (/상품|빵|고르|면세|유심/.test(situation)) return { ja: 'なにをおさがしですか', kana: 'なにをおさがしですか', korean: '무엇을 찾으세요?' };
  if (/환전|잔돈|엔으로/.test(situation)) return { ja: 'りょうがえですね', kana: 'りょうがえですね', korean: '환전이시군요?' };
  if (/짐|로커|보관|맡/.test(situation)) return { ja: 'おにもつですか', kana: 'おにもつですか', korean: '짐 맡기실 건가요?' };
  if (/택배|발송|부치|보내/.test(situation)) return { ja: 'はっそうですね', kana: 'はっそうですね', korean: '발송이시군요?' };
  if (/사진|촬영/.test(situation)) return { ja: 'おとりしましょうか', kana: 'おとりしましょうか', korean: '제가 찍어 드릴까요?' };
  if (/사용법|충전|식권/.test(situation)) return { ja: 'ごあんないします', kana: 'ごあんないします', korean: '안내해 드릴게요' };
  return { ja: 'ごようけんはなんですか', kana: 'ごようけんはなんですか', korean: '무엇을 도와드릴까요?' };
}

export function OrderCardView({ card, picks, isKanaFamiliar, onNext }: Props) {
  const missionId = card.reviewTarget?.id ? String(card.reviewTarget.id) : undefined;
  const mission = CONTENT.missions.find((m) => m.id === missionId);
  const byId = useMemo(() => Object.fromEntries(CONTENT.phrases.map((p) => [p.id, p])), []);
  const sv = sceneVisualByMission(missionId);

  const turns = useMemo(() => {
    if (!mission) return [];
    return mission.steps.map((step, idx) => {
      const prompt = step.promptPhraseId ? byId[step.promptPhraseId] : undefined;
      const recapPrompt: RecapPrompt = prompt
        ? { ja: prompt.displayKana ?? prompt.kana, kana: prompt.displayKana ?? prompt.kana, korean: prompt.korean }
        : step.recapPromptJa
          ? { ja: step.recapPromptJa, kana: step.recapPromptJa, korean: step.recapPromptKo ?? step.situationKo }
          : fallbackPrompt(step.situationKo);
      const pick = picks[`mission:${mission.id}:${idx}`];
      let answer: Answer | undefined;
      if (pick) {
        answer = pick.hasPhrase
          ? { ja: pick.ja, kana: pick.kana, korean: pick.korean, action: false, recovery: pick.recovery, model: false }
          : { label: pick.label, action: true, recovery: pick.recovery, model: false };
      } else {
        // 이번 세션에 안 고른 스텝 → 모범(자연스러운) 답변으로 폴백
        const model = step.choices.find((c) => c.correct && c.phraseId && !c.recoveryType);
        const mp = model?.phraseId ? byId[model.phraseId] : undefined;
        if (mp) answer = { ja: mp.displayKana ?? mp.kana, kana: mp.kana, korean: mp.korean, action: false, recovery: false, model: true };
        else if (model) answer = { label: model.text, action: true, recovery: false, model: true };
      }
      return { idx, step, recapPrompt, answer };
    });
  }, [mission, picks, byId]);

  // 전체 듣기 — 점원→나→점원… 순서대로 이어 읽기
  function playAll() {
    const seq: { text: string; voice?: SpeakOpts['voice'] }[] = [];
    for (const t of turns) {
      seq.push({ text: t.recapPrompt.ja, voice: 'keita' });
      if (t.answer && !t.answer.action && t.answer.ja) seq.push({ text: t.answer.ja });
    }
    speakParts(seq);
  }

  const place = mission?.place ?? mission?.scenario ?? '';

  return (
    <div>
      <h2 style={{ marginTop: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="flow" size={22} /> {place} 대화 다시보기
      </h2>
      <p style={{ color: 'var(--ink-soft)', margin: '0 0 14px', fontSize: 14, lineHeight: 1.5 }}>
        방금 나눈 대화예요. 내가 고른 답으로 전체를 한 번 읽어볼까요?
      </p>

      <PrimaryAction
        style={{ width: '100%', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        onClick={playAll}
        disabled={!ttsSupported()}
      >
        <Icon name="listen" size={18} /> 전체 듣기
      </PrimaryAction>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {turns.map((t) => (
          <div key={t.idx} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ margin: '2px 4px -3px', fontSize: 11.5, color: 'var(--ink-faint)', fontWeight: 650 }}>{t.step.situationKo}</p>
            <Bubble side="left" who={t.step.speaker && t.step.speaker !== '나' ? t.step.speaker : '상대'} accent={sv.accent} ja={t.recapPrompt.ja} kana={t.recapPrompt.kana} korean={t.recapPrompt.korean} isKanaFamiliar={isKanaFamiliar} voice="keita" />
            {t.answer && (
              t.answer.action
                ? <ActionLine label={t.answer.label ?? ''} model={t.answer.model} />
                : <Bubble side="right" who="나" accent="var(--accent)" ja={t.answer.ja ?? ''} kana={t.answer.kana ?? ''} korean={t.answer.korean ?? ''} isKanaFamiliar={isKanaFamiliar} tag={t.answer.recovery ? '복구' : t.answer.model ? '모범' : undefined} />
            )}
          </div>
        ))}
      </div>

      <button style={{ ...PRIMARY, marginTop: 18, width: '100%' }} onClick={onNext}>좋아요</button>
    </div>
  );
}

function Bubble({ side, who, accent, ja, kana, korean, isKanaFamiliar, tag, voice }: {
  side: 'left' | 'right'; who: string; accent: string; ja: string; kana: string; korean: string;
  isKanaFamiliar: (c: string) => boolean; tag?: string; voice?: SpeakOpts['voice'];
}) {
  const right = side === 'right';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: right ? 'flex-end' : 'flex-start' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', margin: '0 4px 4px' }}>
        {who}{tag ? <span style={{ color: accent }}> · {tag}</span> : null}
      </span>
      <div style={{
        maxWidth: '86%', padding: '10px 13px', borderRadius: 14,
        border: `1.5px solid ${right ? 'var(--ink)' : 'var(--border)'}`,
        background: right ? 'var(--accent-soft)' : 'var(--surface)',
        borderTopLeftRadius: right ? 14 : 4, borderTopRightRadius: right ? 4 : 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}><ReadingAid text={kana} isFamiliar={isKanaFamiliar} fontSize={19} /></div>
          <button
            onClick={() => speak(ja || kana, { voice })} disabled={!ttsSupported()}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: accent, padding: 2, minHeight: 0, flex: '0 0 auto' }}
            aria-label="듣기"
          ><Icon name="listen" size={17} /></button>
        </div>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-soft)' }}>{korean}</p>
      </div>
    </div>
  );
}

// 행동 응답 (동전 건네기 등 — 일본어 대사 없음)
function ActionLine({ label, model }: { label: string; model: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', margin: '0 4px 4px' }}>나{model ? ' · 모범' : ''}</span>
      <div style={{ maxWidth: '86%', padding: '9px 13px', borderRadius: 14, borderTopRightRadius: 4, border: '1.5px dashed var(--border)', color: 'var(--ink-soft)', fontSize: 14, fontStyle: 'italic' }}>
        {label.replace(/[()]/g, '')}
      </div>
    </div>
  );
}
