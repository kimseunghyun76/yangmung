// 세션 시작 전 "오늘 한 판" 인트로 — 목표와 첫 행동을 정렬.
// goal은 App에서 planSession 기반으로 계산해 전달(복습 뉘앙스 포함).
import type { Card } from '../learn/cards';
import { itemMastery, type ProgressMap } from '../learn/progress';
import { CONTENT } from '../content';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { isMangaSceneImage, quickPracticeBackdrop, sceneVisualByMission } from './scene';
import { PrimaryAction, hexA } from './shell';
import { MascotBubble, MascotFace, MascotLine } from './mascot';

interface IntroProps {
  cards: Card[];
  allCards: Card[];
  progress: ProgressMap;
  goal: string;
  onStart: () => void;
  onBack: () => void;
}

function missionIdOf(card: Card): string | undefined {
  if (!('reviewTarget' in card)) return undefined;
  return card.reviewTarget?.type === 'mission' ? String(card.reviewTarget.id) : undefined;
}

function cardBrief(card: Card): { ja?: string; ko: string } | undefined {
  if (card.kind === 'introduce') return { ja: card.ja, ko: card.korean };
  if (card.kind === 'quiz') return { ja: card.promptPhrase?.kana ?? card.bannerJa, ko: card.promptPhrase?.korean ?? card.banner };
  if (card.kind === 'speak') return { ja: card.kana, ko: card.korean };
  if (card.kind === 'dictation') return { ja: card.ja, ko: card.korean };
  if (card.kind === 'order') return { ko: card.items.slice(0, 3).map((x) => x.label).join(' → ') };
  return undefined;
}

function introMissionStats(allCards: Card[], progress: ProgressMap, missionId?: string) {
  if (!missionId) return { attempts: 0, seen: 0, weak: [] as Array<{ card: Card; attempts: number; mastery: number }> };
  const missionCards = allCards.filter((card) => missionIdOf(card) === missionId);
  const withProgress = missionCards.map((card) => ({ card, progress: progress[card.id] })).filter((x) => x.progress?.attempts);
  const attempts = withProgress.reduce((sum, x) => sum + (x.progress?.attempts ?? 0), 0);
  const weak = withProgress
    .map((x) => ({ card: x.card, attempts: x.progress!.attempts, mastery: itemMastery(x.progress) }))
    .sort((a, b) => {
      const weakDelta = a.mastery - b.mastery;
      if (Math.abs(weakDelta) > 0.01) return weakDelta;
      return b.attempts - a.attempts;
    })
    .slice(0, 2);
  return { attempts, seen: withProgress.length, weak };
}

function memoryPoints(mission: typeof CONTENT.missions[number] | undefined, weak: Array<{ card: Card; attempts: number; mastery: number }>, attempts: number): string[] {
  const points: string[] = [];
  for (const item of weak) {
    const brief = cardBrief(item.card);
    if (!brief?.ko) continue;
    const ja = brief.ja ? `${brief.ja} · ` : '';
    points.push(`${ja}${brief.ko}`);
  }
  if (mission?.sequence?.length) {
    points.push(`흐름: ${mission.sequence.slice(0, 4).join(' → ')}${mission.sequence.length > 4 ? ' → 마무리' : ''}`);
  }
  if (mission?.steps?.length) {
    const recovery = mission.steps.flatMap((step) => step.choices).find((choice) => choice.recoveryType);
    if (recovery) points.push(`막히면: ${recovery.text}`);
  }
  if (!points.length) {
    points.push(attempts > 0 ? '지난번에 막혔던 질문을 먼저 듣고, 답은 짧게 말해도 됩니다.' : '처음에는 질문의 흐름만 잡고, 답은 짧은 표현부터 시작하세요.');
  }
  return [...new Set(points)].slice(0, 3);
}

function quickPracticePoints(cards: Card[]): string[] {
  const ids = cards.map((card) => card.id);
  const kinds = new Set(cards.map((card) => card.kind));
  if (ids.some((id) => id.startsWith('basic:'))) {
    return ['숫자·순서·요일·시간은 여행 중 바로 쓰는 기본 도구예요.', '헷갈리는 단위는 다음 복습에서 다시 앞쪽에 나옵니다.', '양과 멍이 짧은 카드 단위로 흐름을 잡아줘요.'];
  }
  if (ids.some((id) => id.startsWith('sign:'))) {
    return ['간판·메뉴판은 한 글자보다 덩어리로 읽는 연습이 중요해요.', '낯선 표기는 먼저 뜻을 고르고, 다음에 소리를 확인합니다.', '실전에서 바로 찾을 수 있게 짧은 표지부터 시작해요.'];
  }
  if (kinds.has('dictation')) {
    return ['먼저 듣고, 들린 가나 조각을 순서대로 놓아봅니다.', '틀린 조각은 소리와 모양을 같이 다시 기억합니다.', '짧은 표현부터 성공감을 만들고 다음 문장으로 넘어가요.'];
  }
  if (ids.some((id) => id.startsWith('pair:'))) {
    return ['비슷하게 들리는 소리를 한 쌍씩 비교합니다.', '장음·촉음·청탁은 의미가 달라지는 핵심 포인트예요.', '헷갈리면 빠르게 넘기지 말고 한 번 더 들어보세요.'];
  }
  if (cards.some((card) => 'reviewTarget' in card && card.reviewTarget?.type === 'kana')) {
    return ['글자 모양과 소리를 한 번에 연결합니다.', '익숙한 글자는 보조가 줄고, 헷갈린 글자는 다시 나옵니다.', '양과 멍이 짧은 라운드로 리듬을 만들어줘요.'];
  }
  return ['오늘 필요한 표현만 짧게 모아 연습합니다.', '이미 본 카드는 더 빠르게, 약한 카드는 더 앞쪽에서 다시 만나요.', '끝까지 마치면 다음 여행 보상 흐름으로 이어집니다.'];
}

function quickPracticeKind(cards: Card[]): string {
  const ids = cards.map((card) => card.id);
  if (ids.some((id) => id.startsWith('basic:'))) return 'basics';
  if (ids.some((id) => id.startsWith('sign:'))) return 'signs';
  if (cards.some((card) => card.kind === 'dictation' && card.promptKind === 'korean')) return 'compose';
  if (cards.some((card) => card.kind === 'dictation')) return 'dictation';
  if (ids.some((id) => id.startsWith('pair:'))) return 'pairs';
  if (ids.some((id) => id.startsWith('vocab:greetings:'))) return 'greetings';
  if (ids.some((id) => id.startsWith('vocab:'))) return 'vocab';
  const kanaIds = cards
    .map((card) => ('reviewTarget' in card && card.reviewTarget?.type === 'kana') ? String(card.reviewTarget.id) : '')
    .filter(Boolean);
  if (kanaIds.length) {
    const scripts = new Set(kanaIds.map((id) => CONTENT.kana.find((k) => k.id === id)?.script).filter(Boolean));
    if (scripts.size === 1 && scripts.has('katakana')) return 'katakana';
    return 'hiragana';
  }
  return 'flash';
}

export function Intro({ cards, allCards, progress, goal, onStart, onBack }: IntroProps) {
  let expressionCount = 0, missionCount = 0;
  let firstMissionId: string | undefined;
  for (const card of cards) {
    if (card.kind === 'tip' || card.kind === 'discover') continue;
    if (card.kind === 'dictation') { expressionCount++; continue; }
    if (card.kind === 'order' || card.kind === 'speak') {
      missionCount++;
      if (!firstMissionId && card.reviewTarget?.type === 'mission' && String(card.reviewTarget.id) !== 'C0') firstMissionId = String(card.reviewTarget.id);
      continue;
    }
    const t = card.reviewTarget?.type;
    if (t === 'phrase') expressionCount++;
    else if (t === 'mission') {
      missionCount++;
      const id = String(card.reviewTarget!.id);
      if (!firstMissionId && id !== 'C0') firstMissionId = id;
    }
  }
  const sv = sceneVisualByMission(firstMissionId);
  const backdrop = firstMissionId ? (sv.backdrop ?? sv.hero) : quickPracticeBackdrop(quickPracticeKind(cards));
  const showFullBackdrop = isMangaSceneImage(backdrop);
  const quickBackdrop = !firstMissionId;
  const mission = firstMissionId ? CONTENT.missions.find((m) => m.id === firstMissionId) : undefined;
  const place = mission?.place;
  const { attempts, seen, weak } = introMissionStats(allCards, progress, firstMissionId);
  const points = mission ? memoryPoints(mission, weak, attempts) : quickPracticePoints(cards);
  const sessionKind = missionCount > 0 ? `${missionCount}개 상황 카드` : `${expressionCount || cards.length}개 표현 카드`;

  return (
    <main style={{ ...WRAP, minHeight: '100dvh', display: 'flex', flexDirection: 'column', paddingBottom: 24 }}>
      <button onClick={onBack} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--ink-faint)', padding: '4px 0', marginBottom: 8, alignSelf: 'flex-start' }}>← 홈으로</button>
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 28,
        minHeight: quickBackdrop ? 'clamp(680px, 118vw, 780px)' : 570,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: backdrop ? '1px solid rgba(255,255,255,0.22)' : '1.5px solid var(--border)',
        background: backdrop ? `linear-gradient(165deg, ${hexA(sv.accent, 0.22)}, ${hexA(sv.accent, 0.38)})` : 'var(--surface-2)',
        boxShadow: 'var(--glass-shadow)',
        color: backdrop ? '#fff' : 'var(--ink)',
      }}>
        {backdrop && showFullBackdrop && <img src={backdrop} alt="" aria-hidden style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: quickBackdrop ? 'clamp(300px, 76vw, 520px)' : '100%',
          objectFit: 'contain',
          objectPosition: 'center top',
          opacity: 0.34,
          filter: 'blur(16px) saturate(.82) contrast(.96) brightness(1.08)',
        }} />}
        {backdrop && <img src={backdrop} alt="" aria-hidden style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: quickBackdrop ? 'clamp(300px, 76vw, 520px)' : '100%',
          objectFit: showFullBackdrop ? 'contain' : 'cover',
          objectPosition: quickBackdrop ? 'center top' : 'center',
          filter: 'saturate(.82) contrast(.96) brightness(1.08)',
        }} />}
        {backdrop && <div aria-hidden style={{
          position: 'absolute',
          inset: 0,
          background: quickBackdrop
            ? 'linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.2) 38%, rgba(8,12,22,0.88) 64%, rgba(8,12,22,0.97))'
            : 'linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.34) 42%, rgba(0,0,0,0.78))',
        }} />}
        {!backdrop && (
          <div aria-hidden style={{ position: 'absolute', right: -18, top: 18, width: 170, height: 170, borderRadius: 42, background: `radial-gradient(circle at 44% 38%, ${hexA(sv.accent, 0.22)}, transparent 64%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(5deg)' }}>
            <MascotFace who="duo" size={112} style={{ filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.18))' }} />
          </div>
        )}
        <div style={{ position: 'relative', maxWidth: 760 }}>
          <span style={{
            width: 62,
            height: 62,
            borderRadius: 20,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: backdrop ? 'rgba(255,255,255,0.18)' : hexA(sv.accent, 0.14),
            color: backdrop ? '#fff' : sv.accent,
            border: backdrop ? '1px solid rgba(255,255,255,0.2)' : `1px solid ${hexA(sv.accent, 0.22)}`,
            backdropFilter: 'blur(10px)',
          }}>
            <Icon name={sv.icon} size={34} />
          </span>
          <p style={{ color: backdrop ? 'rgba(255,255,255,0.78)' : 'var(--ink-faint)', fontSize: 13, margin: '18px 0 0', fontWeight: 800, letterSpacing: '0.08em' }}>{place ? `${place} 미션` : '오늘의 연습'}</p>
          <h1 style={{ margin: '7px 0 0', lineHeight: 1.22 }}>{goal}</h1>
          <p style={{ color: backdrop ? 'rgba(255,255,255,0.84)' : 'var(--ink-soft)', fontSize: 15, lineHeight: 1.65, marginTop: 14, maxWidth: 640 }}>
            배경 상황을 떠올리고 바로 시작합니다. 이전에 본 표현은 아래 포인트만 다시 확인하면 됩니다.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            <span style={{ borderRadius: 999, padding: '8px 12px', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.24)', color: '#fff', fontSize: 13, fontWeight: 800, backdropFilter: 'blur(10px)' }}>
              누적 시도 {attempts}회
            </span>
            <span style={{ borderRadius: 999, padding: '8px 12px', background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: 13, fontWeight: 750, backdropFilter: 'blur(10px)' }}>
              기억한 카드 {seen}개
            </span>
            <span style={{ borderRadius: 999, padding: '8px 12px', background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontSize: 13, fontWeight: 750, backdropFilter: 'blur(10px)' }}>
              이번 연습 {sessionKind}
            </span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <section aria-label="기억할 포인트" style={{
            borderRadius: 24,
            padding: 16,
            background: backdrop ? 'rgba(5, 10, 24, 0.48)' : 'var(--surface)',
            border: backdrop ? '1px solid rgba(255,255,255,0.18)' : '1px solid var(--border)',
            boxShadow: backdrop ? '0 20px 42px rgba(0,0,0,0.22)' : 'var(--shadow-soft)',
            backdropFilter: 'blur(18px)',
          }}>
            <p style={{ margin: 0, color: backdrop ? 'rgba(255,255,255,0.72)' : 'var(--ink-faint)', fontSize: 12, fontWeight: 850, letterSpacing: '0.08em' }}>기억할 포인트</p>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {points.map((point, idx) => (
                <div key={`${point}-${idx}`} style={{ display: 'grid', gridTemplateColumns: '34px minmax(0,1fr)', gap: 10, alignItems: 'center' }}>
                  <span style={{
                    width: 34,
                    height: 34,
                    borderRadius: 13,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: hexA(sv.accent, backdrop ? 0.52 : 0.12),
                    border: backdrop ? '1px solid rgba(255,255,255,0.18)' : `1px solid ${hexA(sv.accent, 0.24)}`,
                    color: backdrop ? '#fff' : sv.accent,
                    fontWeight: 900,
                    flex: '0 0 auto',
                  }}>{idx + 1}</span>
                  <p style={{ margin: 0, color: backdrop ? 'rgba(255,255,255,0.9)' : 'var(--ink)', fontSize: 14, lineHeight: 1.5, fontWeight: 720, overflowWrap: 'anywhere' }}>{point}</p>
                </div>
              ))}
            </div>
          </section>
          {place && (
            <MascotLine key={firstMissionId} copyKey="introYang" place={place} size={38} style={{ marginTop: 16 }} />
          )}
          {!place && (
            <MascotBubble who="duo" mood="correct" size={38} style={{ marginTop: 16 }}>
              빠른 연습도 한 판의 작은 미션처럼 준비했어요. 짧게 끝내고 바로 다음 카드로 이어가요.
            </MascotBubble>
          )}
          <PrimaryAction onClick={onStart} style={{ marginTop: 16, width: '100%', fontSize: 17 }}>
            시작
          </PrimaryAction>
        </div>
      </div>
    </main>
  );
}
