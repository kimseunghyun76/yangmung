import { useEffect, useMemo, useState } from 'react';
import {
  allUnits,
  foundationUnits,
  integratedUnits,
  quickPracticeTools,
  practiceUnits,
  starterUnits,
  type LearningUnit,
  type PracticeLevel,
  type UnitCourse,
  type UnitStatus,
} from './data/curriculum';
import { lessonForUnit, type LessonCard, type QuizCard, type RoleplayCard } from './data/lessons';
import { audioPathForText, buildAudioIndex, type AudioIndex, type AudioManifest } from './data/audio';
import {
  clearWrong,
  completeUnit,
  loadProgress,
  markSeen,
  markWrong,
  dueReviewItems,
  recordReviewAttempt,
  saveProgress,
  setDebugAccess,
  type ReviewItem,
  type ProgressState,
} from './data/progress';
import { allRewards, collectionStats, isRewardUnlocked, rarityLabel, rewardForUnit, type UnitReward } from './data/rewards';
import { useHashView, type Navigate, type View } from './app/routing';

interface SessionState {
  unit: LearningUnit;
  index: number;
  level?: PracticeLevel;
  selectedOptionId?: string;
  lastCorrect?: boolean;
  roleplayText?: string;
  roleplayEvaluation?: RoleplayEvaluation;
}

type RoleplayEvaluationStatus = 'pass' | 'partial' | 'retry';

interface RoleplayEvaluation {
  status: RoleplayEvaluationStatus;
  title: string;
  message: string;
  matched: string[];
}

const NAV_ITEMS: { view: View; label: string }[] = [
  { view: 'home', label: '홈' },
  { view: 'prep', label: '준비' },
  { view: 'foundation', label: '기초' },
  { view: 'scenes', label: '실전' },
  { view: 'journey', label: '통합' },
  { view: 'review', label: '복습' },
  { view: 'gacha', label: '도감' },
  { view: 'settings', label: '설정' },
];

const GROUP_ORDER = [
  '생존 회화와 대화 시작',
  '공항 도착과 기본 이동',
  '숙박·식사·일상생활',
  '장거리 이동·쇼핑·관광',
  '문제 해결과 안전',
  '출국',
];

function prerequisitesMet(unit: LearningUnit, progress: ProgressState): boolean {
  return unit.requiredIds.every((id) => progress.completedUnitIds.includes(id));
}

function statusFor(unit: LearningUnit, progress: ProgressState): UnitStatus {
  if (progress.completedUnitIds.includes(unit.id)) return 'done';
  if (progress.debugAccessUnlocked && lessonForUnit(unit.id)) return 'ready';
  const next = nextUnit(progress);
  if (unit.id === next.id) return 'active';
  if (prerequisitesMet(unit, progress)) return 'ready';
  return 'locked';
}

function statusLabel(status: UnitStatus): string {
  if (status === 'done') return '완료';
  if (status === 'active') return '진행';
  if (status === 'ready') return '대기';
  return '잠김';
}

function statusTone(status: UnitStatus): string {
  if (status === 'done') return 'done';
  if (status === 'active') return 'active';
  if (status === 'ready') return 'ready';
  return 'locked';
}

function nextUnit(progress: ProgressState): LearningUnit {
  return (
    allUnits.find((unit) => !progress.completedUnitIds.includes(unit.id) && prerequisitesMet(unit, progress) && lessonForUnit(unit.id))
    ?? allUnits.find((unit) => !progress.completedUnitIds.includes(unit.id) && prerequisitesMet(unit, progress))
    ?? starterUnits[0]
  );
}

function viewForUnit(unit: LearningUnit): View {
  if (unit.course === 'starter') return 'prep';
  if (unit.course === 'foundation') return 'foundation';
  if (unit.course === 'practice') return 'scenes';
  return 'journey';
}

function levelLabelFor(unit: LearningUnit, level?: PracticeLevel): string | undefined {
  if (!level) return undefined;
  return unit.levelPlans?.find((plan) => plan.level === level)?.label;
}

function courseLabel(course: UnitCourse): string {
  if (course === 'starter') return '준비 과정';
  if (course === 'foundation') return '기초 과정';
  if (course === 'practice') return '실전 과정';
  return '통합 과정';
}

function lessonScopesFor(unit: LearningUnit): { label: string; level?: PracticeLevel; cards: LessonCard[] }[] {
  if (unit.levelPlans) {
    return unit.levelPlans
      .map((plan) => {
        const lesson = lessonForUnit(unit.id, plan.level);
        return lesson ? { label: plan.label, level: plan.level, cards: lesson.cards } : undefined;
      })
      .filter((scope): scope is { label: string; level: PracticeLevel; cards: LessonCard[] } => Boolean(scope));
  }
  const lesson = lessonForUnit(unit.id);
  return lesson ? [{ label: courseLabel(unit.course), cards: lesson.cards }] : [];
}

function wrongReviewRows(progress: ProgressState): { id: string; unit: LearningUnit; level?: PracticeLevel; levelLabel: string; title: string; prompt: string }[] {
  const wrong = new Set(progress.wrongCardIds);
  const rows: { id: string; unit: LearningUnit; level?: PracticeLevel; levelLabel: string; title: string; prompt: string }[] = [];
  const seen = new Set<string>();
  for (const unit of allUnits) {
    for (const scope of lessonScopesFor(unit)) {
      for (const card of scope.cards) {
        if (card.kind !== 'quiz' || !wrong.has(card.id)) continue;
        const key = `${unit.id}:${scope.level ?? 'base'}:${card.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({
          id: key,
          unit,
          level: scope.level,
          levelLabel: scope.label,
          title: card.title,
          prompt: card.prompt,
        });
      }
    }
  }
  return rows;
}

function scheduledReviewRows(progress: ProgressState): { item: ReviewItem; unit: LearningUnit; levelLabel: string; dueLabel: string }[] {
  const now = Date.now();
  return dueReviewItems(progress, now).map((item) => {
    const unit = allUnits.find((candidate) => candidate.id === item.unitId) ?? starterUnits[0];
    const levelLabel = levelLabelFor(unit, item.level) ?? courseLabel(unit.course);
    const dueLabel = item.dueAt <= now ? '지금 복습' : `${Math.ceil((item.dueAt - now) / (24 * 60 * 60 * 1000))}일 후`;
    return { item, unit, levelLabel, dueLabel };
  });
}

function normalizeRoleplayText(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/[\s　]/g, '')
    .replace(/[。．.、,!！?？「」『』（）()［］\[\]〜~]/g, '')
    .trim();
}

function hasJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(text);
}

function hasPoliteEnding(text: string): boolean {
  return /(です|ます|ください|お願いします|ません|できます|あります|たいです|でしょうか)/.test(text);
}

function roleplayTokens(expression: string): string[] {
  const normalized = normalizeRoleplayText(expression)
    .replace(/お願いします|ください|できますか|ありますか|したいです|たいです|ですか|です|ます|ません/g, '')
    .replace(/[はをがにでへともかの]/g, ' ');
  return Array.from(new Set(normalized.split(/\s+/).filter((token) => token.length >= 2)));
}

function evaluateRoleplayInput(card: RoleplayCard, input: string): RoleplayEvaluation {
  const answer = normalizeRoleplayText(input);
  const starter = normalizeRoleplayText(card.starter);
  if (answer.length < 4) {
    return {
      status: 'retry',
      title: '문장이 너무 짧습니다',
      message: '역할극에서는 실제로 말할 일본어 문장을 한 문장 이상 입력해야 합니다.',
      matched: [],
    };
  }
  if (!hasJapanese(answer)) {
    return {
      status: 'retry',
      title: '일본어 문장을 입력해 주세요',
      message: '한국어 설명이 아니라 현장에서 말할 일본어 문장으로 연습해야 합니다.',
      matched: [],
    };
  }
  if (answer.includes(starter)) {
    return {
      status: 'pass',
      title: '핵심 표현을 정확히 사용했습니다',
      message: '제시된 시작 문장이 포함되어 있어 이 상황에서 바로 사용할 수 있습니다.',
      matched: [card.starter],
    };
  }

  const matched = roleplayTokens(card.starter).filter((token) => answer.includes(token));
  if (matched.length > 0 && hasPoliteEnding(answer)) {
    return {
      status: 'pass',
      title: '대체 표현으로 사용할 수 있습니다',
      message: '핵심 단어와 정중한 문장 끝이 함께 들어가 있어 현장 대응 표현으로 볼 수 있습니다.',
      matched,
    };
  }
  if (matched.length > 0) {
    return {
      status: 'partial',
      title: '핵심 단어는 맞지만 문장 끝을 다듬어야 합니다',
      message: '상황의 핵심 단어는 들어갔습니다. 실제 현장에서는 です, ます, ください 같은 정중한 끝맺음을 붙이는 편이 좋습니다.',
      matched,
    };
  }
  if (hasPoliteEnding(answer)) {
    return {
      status: 'partial',
      title: '정중한 표현은 좋지만 핵심 단어가 부족합니다',
      message: `문장 형태는 괜찮습니다. 다만 “${card.starter}”의 핵심 단어를 함께 넣어야 상황 대응이 더 분명해집니다.`,
      matched: [],
    };
  }
  return {
    status: 'retry',
    title: '핵심 표현을 다시 확인해 주세요',
    message: `이 역할극에서는 “${card.starter}” 또는 그 핵심 단어가 들어간 표현을 연습해야 합니다.`,
    matched: [],
  };
}

function countByCourse(course: UnitCourse, progress: ProgressState): { total: number; done: number; active: number } {
  const units = allUnits.filter((unit) => unit.course === course);
  return {
    total: units.length,
    done: units.filter((unit) => statusFor(unit, progress) === 'done').length,
    active: units.filter((unit) => statusFor(unit, progress) === 'active').length,
  };
}

function navView(view: View): View {
  return view === 'session' || view === 'done' ? 'prep' : view;
}

function Header({ view, setView }: { view: View; setView: Navigate }) {
  const current = navView(view);
  return (
    <header className="topbar">
      <button className="brand" onClick={() => setView('home')} aria-label="홈으로 이동">
        <img src="/mascots/yangmung-duo-logo.webp" alt="" />
        <span>mungyang</span>
      </button>
      <nav className="nav" aria-label="주요 메뉴">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            className={item.view === current ? 'nav-item active' : 'nav-item'}
            onClick={() => setView(item.view)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

function Hero({ progress, onStartUnit, setView }: { progress: ProgressState; onStartUnit: (unit: LearningUnit) => void; setView: Navigate }) {
  const unit = nextUnit(progress);
  return (
    <section className="hero">
      <img className="hero-art" src={unit.image} alt="" />
      <div className="hero-copy">
        <div className="eyebrow">다음 학습</div>
        <h1>{unit.title}</h1>
        <p>{unit.goal}</p>
        <div className="hero-actions">
          <button className="primary" onClick={() => onStartUnit(unit)}>
            이어서 학습
          </button>
          <button className="secondary" onClick={() => setView('review')}>
            약점 복습
          </button>
        </div>
      </div>
    </section>
  );
}

function ProgressRail({ progress, setView }: { progress: ProgressState; setView: Navigate }) {
  const rows = [
    { label: '준비', view: 'prep' as View, count: countByCourse('starter', progress) },
    { label: '기초', view: 'foundation' as View, count: countByCourse('foundation', progress) },
    { label: '실전', view: 'scenes' as View, count: countByCourse('practice', progress) },
    { label: '통합', view: 'journey' as View, count: countByCourse('journey', progress) },
  ];
  return (
    <section className="progress-rail" aria-label="학습 진행률">
      {rows.map((row) => (
        <button className="progress-tile" key={row.label} onClick={() => setView(row.view)}>
          <span>{row.label}</span>
          <strong>{row.count.done}/{row.count.total}</strong>
          <small>{row.count.active ? '진행 중인 단원이 있어요' : '다음 단원을 준비 중'}</small>
        </button>
      ))}
    </section>
  );
}

function HomeView({ progress, onStartUnit, setView }: { progress: ProgressState; onStartUnit: (unit: LearningUnit) => void; setView: Navigate }) {
  const dueCount = dueReviewItems(progress).length;
  return (
    <>
      <Hero progress={progress} onStartUnit={onStartUnit} setView={setView} />
      <ProgressRail progress={progress} setView={setView} />
      <section className="split">
        <article className="panel">
          <h2>오늘의 기준</h2>
          <p>퀴즈는 새 표현을 먼저 본 뒤에만 열립니다. 듣기 평가도 직원 표현을 한 번 학습한 뒤 진행합니다.</p>
        </article>
        <article className="panel reward-panel">
          <h2>완료 후 추천</h2>
          <p>오답만 다시 잡기, 예약 복습, 같은 단원 다시 학습, 다음 단원, 도감 확인 순서로 정리합니다.</p>
          <button className="panel-link" onClick={() => setView('review')}>{dueCount}개 복습 확인</button>
        </article>
      </section>
    </>
  );
}

function UnitCard({ unit, progress, onSelect }: { unit: LearningUnit; progress: ProgressState; onSelect: (unit: LearningUnit) => void }) {
  const status = statusFor(unit, progress);
  return (
    <button className={`unit-card ${statusTone(status)}`} onClick={() => onSelect(unit)}>
      <div className="unit-image">
        <img src={unit.image} alt="" loading="lazy" />
      </div>
      <div className="unit-body">
        <div className="unit-meta">
          <span>{unit.id}</span>
          <em>{statusLabel(status)}</em>
        </div>
        <h3>{unit.title}</h3>
        <p>{unit.subtitle}</p>
        {unit.levelPlans && (
          <div className="level-chips" aria-label="난이도">
            {unit.levelPlans.map((plan) => (
              <span key={plan.level}>{plan.label}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

function UnitDrawer({
  unit,
  progress,
  onClose,
  onStart,
}: {
  unit: LearningUnit;
  progress: ProgressState;
  onClose: () => void;
  onStart: (unit: LearningUnit, level?: PracticeLevel) => void;
}) {
  const lesson = lessonForUnit(unit.id);
  const status = statusFor(unit, progress);
  const locked = status === 'locked';
  return (
    <aside className="drawer" aria-label="단원 상세">
      <button className="drawer-close" onClick={onClose}>닫기</button>
      <img className="drawer-image" src={unit.image} alt="" />
      <div className="drawer-id">{unit.id} · {unit.group}</div>
      <h2>{unit.title}</h2>
      <p>{unit.goal}</p>
      <div className="drawer-section">
        <h3>학습 흐름</h3>
        <ol>
          {unit.blocks.map((block) => (
            <li key={block}>{block}</li>
          ))}
        </ol>
      </div>
      {unit.levelPlans && (
        <div className="drawer-section">
          <h3>난이도 흐름</h3>
          <div className="drawer-levels">
            {unit.levelPlans.map((plan) => (
              <article key={plan.level}>
                <span>{plan.label}</span>
                <strong>{plan.title}</strong>
                <p>{plan.focus}</p>
                <small>{plan.task}</small>
              </article>
            ))}
          </div>
        </div>
      )}
      {unit.journeyCheckpoints && (
        <div className="drawer-section">
          <h3>여행 체크포인트</h3>
          <div className="drawer-checkpoints">
            {unit.journeyCheckpoints.map((checkpoint, index) => (
              <article key={checkpoint.id}>
                <span>{index + 1}</span>
                <div>
                  <strong>{checkpoint.title}</strong>
                  <p>{checkpoint.place}</p>
                  <small>{checkpoint.linkedUnitIds.join(', ')}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
      <div className="drawer-section">
        <h3>잠금 기준</h3>
        <p>{unit.requiredIds.length ? unit.requiredIds.join(', ') : '바로 시작 가능'}</p>
      </div>
      <div className="drawer-section">
        <h3>보상</h3>
        <p>{unit.reward}</p>
      </div>
      <div className="drawer-actions">
        {unit.levelPlans ? (
          <div className="level-start-grid">
            {unit.levelPlans.map((plan) => (
              <button className="primary" key={plan.level} disabled={!lesson || locked} onClick={() => onStart(unit, plan.level)}>
                {plan.label} 시작
              </button>
            ))}
          </div>
        ) : (
          <button className="primary" disabled={!lesson || locked} onClick={() => onStart(unit)}>
            {lesson ? '학습 시작' : '콘텐츠 준비 중'}
          </button>
        )}
      </div>
    </aside>
  );
}

function PrepView({ progress, onSelect }: { progress: ProgressState; onSelect: (unit: LearningUnit) => void }) {
  return (
    <>
      <SectionHeader
        label="준비 과정"
        title="문자와 소리를 처음 배우는 과정"
        text="히라가나, 가타카나, 발음, 숫자처럼 일본어를 전혀 몰라도 여행 회화로 들어갈 수 있게 만드는 입구입니다."
      />
      <div className="unit-grid">
        {starterUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} progress={progress} onSelect={onSelect} />
        ))}
      </div>
      <section className="tool-section">
        <h2>문자와 소리 연습</h2>
        <div className="tool-grid">
          {quickPracticeTools.filter((tool) => ['문자', '문자 훈련', '발음 훈련', '듣기 기초'].includes(tool.section)).map((tool) => (
            <article className="tool-card" key={tool.title}>
              <img src={tool.image} alt="" loading="lazy" />
              <div>
                <small>{tool.section}</small>
                <strong>{tool.title}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function FoundationView({ progress, onSelect }: { progress: ProgressState; onSelect: (unit: LearningUnit) => void }) {
  return (
    <>
      <SectionHeader
        label="기초 과정"
        title="여행 회화에 필요한 단어와 문법을 조립하는 과정"
        text="질문하기, 요청하기, 위치 말하기, 문제 설명하기처럼 실제 상황 전에 필요한 표현 부품을 먼저 만듭니다."
      />
      <div className="unit-grid">
        {foundationUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} progress={progress} onSelect={onSelect} />
        ))}
      </div>
      <section className="tool-section">
        <h2>단어와 문장 조립</h2>
        <div className="tool-grid">
          {quickPracticeTools.filter((tool) => ['단어', '문장 만들기', '여행 표지'].includes(tool.section)).map((tool) => (
            <article className="tool-card" key={tool.title}>
              <img src={tool.image} alt="" loading="lazy" />
              <div>
                <small>{tool.section}</small>
                <strong>{tool.title}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function SceneView({ progress, onSelect }: { progress: ProgressState; onSelect: (unit: LearningUnit) => void }) {
  return (
    <>
      <SectionHeader
        label="실전 과정"
        title="동일한 여행 상황을 입문·중급·고급 난이도로 학습"
        text="공항, 교통, 호텔, 식당, 쇼핑처럼 같은 장소를 쉬운 대응부터 문제 해결까지 단계적으로 확장합니다."
      />
      <section className="level-legend" aria-label="실전 난이도 기준">
        <article>
          <span>입문</span>
          <strong>짧게 요청하고 답하기</strong>
          <p>한 문장으로 말하고 직원의 짧은 확인 질문에 바로 반응합니다.</p>
        </article>
        <article>
          <span>중급</span>
          <strong>조건과 선택지 처리하기</strong>
          <p>시간, 수량, 위치, 옵션을 확인하고 원하는 조건을 말합니다.</p>
        </article>
        <article>
          <span>고급</span>
          <strong>예외 상황 복구하기</strong>
          <p>문제 발생, 오해, 대체안 요청까지 역할극으로 이어갑니다.</p>
        </article>
      </section>
      {GROUP_ORDER.map((group) => (
        <section className="group-section" key={group}>
          <h2>{group}</h2>
          <div className="unit-grid compact">
            {practiceUnits.filter((unit) => unit.group === group).map((unit) => (
              <UnitCard key={unit.id} unit={unit} progress={progress} onSelect={onSelect} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function JourneyView({ progress, onSelect }: { progress: ProgressState; onSelect: (unit: LearningUnit) => void }) {
  return (
    <>
      <SectionHeader
        label="통합 과정"
        title="여러 상황을 실제 여행처럼 연속 수행"
        text="입국부터 숙박, 이동, 식사, 문제 해결, 출국까지 끊어진 단원이 아니라 하루 여행 흐름으로 연결합니다."
      />
      <section className="journey-flow">
        <article>
          <span>1</span>
          <strong>동선 확인</strong>
          <p>미션 안의 장소 순서를 먼저 확인합니다.</p>
        </article>
        <article>
          <span>2</span>
          <strong>상황 연결</strong>
          <p>관련 실전 단원 표현을 하나의 흐름으로 묶습니다.</p>
        </article>
        <article>
          <span>3</span>
          <strong>완주 판정</strong>
          <p>각 체크포인트의 성공 기준을 만족하며 진행합니다.</p>
        </article>
      </section>
      <div className="journey-grid">
        {integratedUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} progress={progress} onSelect={onSelect} />
        ))}
      </div>
    </>
  );
}

function ReviewView({
  progress,
  onSelectUnit,
  onStartUnit,
}: {
  progress: ProgressState;
  onSelectUnit: (unit: LearningUnit) => void;
  onStartUnit: (unit: LearningUnit, level?: PracticeLevel) => void;
}) {
  const wrongRows = wrongReviewRows(progress);
  const scheduledRows = scheduledReviewRows(progress);
  const reviewRows = [
    ['오답만 다시 잡기', `${progress.wrongCardIds.length}개의 오답 선택지가 있습니다.`, '/scenes/quick-practice/retry-missed.webp'],
    ['예약 복습', `${scheduledRows.length}개의 표현이 복습 대기 중입니다.`, '/scenes/quick-practice/retry-same.webp'],
    ['직원 질문 다시 듣기', '빠르게 들리는 고정 질문을 다시 듣습니다.', '/scenes/quick-practice/dictation.webp'],
  ];
  return (
    <>
      <SectionHeader
        label="복습"
        title="틀린 문제보다 실제 대응 실패를 먼저 고칩니다"
        text="복습은 단순 오답 노트가 아니라 듣기 실패, 분기 실패, 말하기 실패를 다시 묶는 곳입니다."
      />
      <div className="tool-grid large">
        {reviewRows.map(([title, text, image]) => (
          <article className="review-card" key={title}>
            <img src={image} alt="" />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <section className="review-detail">
        <h2>예약 복습</h2>
        {scheduledRows.length ? (
          <div className="wrong-list">
            {scheduledRows.map(({ item, unit, levelLabel, dueLabel }) => (
              <article key={item.id}>
                <img src={unit.image} alt="" />
                <div>
                  <span>{unit.id} · {levelLabel} · {dueLabel}</span>
                  <strong>{item.title}</strong>
                  <p>{item.prompt}</p>
                  <small>시도 {item.attempts}회 · 정답 {item.correct}회 · 오답 {item.wrong}회</small>
                </div>
                <div className="wrong-actions">
                  <button className="secondary" onClick={() => onSelectUnit(unit)}>단원 보기</button>
                  <button className="primary" onClick={() => onStartUnit(unit, item.level)}>다시 학습</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-review">
            <strong>오늘 복습할 항목이 없습니다.</strong>
            <p>퀴즈를 풀면 정답 간격은 늘어나고, 틀린 문항은 바로 다시 복습 대기열로 돌아옵니다.</p>
          </div>
        )}
      </section>
      <section className="review-detail">
        <h2>오답 단원</h2>
        {wrongRows.length ? (
          <div className="wrong-list">
            {wrongRows.map((row) => (
              <article key={row.id}>
                <img src={row.unit.image} alt="" />
                <div>
                  <span>{row.unit.id} · {row.levelLabel}</span>
                  <strong>{row.title}</strong>
                  <p>{row.prompt}</p>
                </div>
                <div className="wrong-actions">
                  <button className="secondary" onClick={() => onSelectUnit(row.unit)}>단원 보기</button>
                  <button className="primary" onClick={() => onStartUnit(row.unit, row.level)}>다시 학습</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-review">
            <strong>아직 기록된 오답이 없습니다.</strong>
            <p>퀴즈를 틀리면 이곳에 단원과 문제 유형이 쌓이고 바로 재학습할 수 있습니다.</p>
          </div>
        )}
      </section>
    </>
  );
}

function GachaView({ progress, onSelectUnit }: { progress: ProgressState; onSelectUnit: (unit: LearningUnit) => void }) {
  const rewards = allRewards();
  const stats = collectionStats(progress);
  const groups: { label: string; rewards: UnitReward[] }[] = [
    { label: '준비 보상', rewards: rewards.filter((reward) => reward.unitId.startsWith('P')) },
    { label: '실전 아이템', rewards: rewards.filter((reward) => reward.unitId.startsWith('S')) },
    { label: '통합 미션 세트', rewards: rewards.filter((reward) => reward.unitId.startsWith('J')) },
  ];
  return (
    <>
      <SectionHeader
        label="도감"
        title={`${stats.unlocked}/${stats.total} 보상 수집`}
        text="모든 보상은 P/S/J 단원 완료와 직접 연결됩니다. 잠긴 카드는 해당 단원을 완료하면 열립니다."
      />
      <section className="collection-summary">
        {Object.entries(stats.byRarity).map(([rarity, row]) => (
          <article key={rarity}>
            <span>{rarityLabel(rarity as UnitReward['rarity'])}</span>
            <strong>{row.unlocked}/{row.total}</strong>
          </article>
        ))}
      </section>
      {groups.map((group) => (
        <section className="group-section" key={group.label}>
          <h2>{group.label}</h2>
          <div className="collection-board">
            {group.rewards.map((reward) => {
              const unlocked = isRewardUnlocked(progress, reward);
              const unit = allUnits.find((candidate) => candidate.id === reward.unitId);
              return (
                <article className={`collection-card ${reward.rarity} ${unlocked ? 'unlocked' : 'locked'}`} key={reward.id}>
                  <div className="collection-rarity">{reward.unitId} · {rarityLabel(reward.rarity)}</div>
                  <img src={reward.image} alt="" />
                  <h3>{unlocked ? reward.title : '잠긴 보상'}</h3>
                  <p>{unlocked ? reward.description : `${reward.subtitle} 단원을 완료하면 공개됩니다.`}</p>
                  {unit && (
                    <button className="collection-link" onClick={() => onSelectUnit(unit)}>
                      단원 보기
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

function SettingsView({
  progress,
  onToggleDebugAccess,
}: {
  progress: ProgressState;
  onToggleDebugAccess: (enabled: boolean) => void;
}) {
  const dueCount = dueReviewItems(progress).length;
  return (
    <>
      <SectionHeader
        label="설정"
        title="학습 진행과 디버깅 옵션"
        text="실제 학습자는 잠금 순서를 따르고, 제작 중에는 접근 제한 해제로 모든 단원의 화면과 콘텐츠를 빠르게 확인합니다."
      />
      <section className="settings-grid">
        <article className="setting-card">
          <div>
            <span>디버그</span>
            <strong>접근 제한 해제</strong>
            <p>켜면 선행 단원을 완료하지 않아도 준비, 기초, 실전, 통합 단원을 바로 열 수 있습니다.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={progress.debugAccessUnlocked === true}
              onChange={(event) => onToggleDebugAccess(event.target.checked)}
            />
            <span />
          </label>
        </article>
        <article className="setting-card stats">
          <span>진행 상태</span>
          <strong>{progress.completedUnitIds.length}/{allUnits.length}</strong>
          <p>완료 단원 수</p>
        </article>
        <article className="setting-card stats">
          <span>복습</span>
          <strong>{dueCount}</strong>
          <p>오늘 다시 볼 표현 수</p>
        </article>
        <article className="setting-card stats">
          <span>도감</span>
          <strong>{progress.rewards.length}</strong>
          <p>획득한 보상 수</p>
        </article>
      </section>
    </>
  );
}

function QuizOptions({
  card,
  selectedOptionId,
  onAnswer,
}: {
  card: QuizCard;
  selectedOptionId?: string;
  onAnswer: (optionId: string) => void;
}) {
  const answered = Boolean(selectedOptionId);
  return (
    <div className="answer-grid">
      {card.options.map((option, index) => {
        const isSelected = selectedOptionId === option.id;
        const isAnswer = answered && option.id === card.answerId;
        return (
          <button
            key={option.id}
            className={`answer-option ${isSelected ? 'selected' : ''} ${isAnswer ? 'correct' : ''}`}
            onClick={() => onAnswer(option.id)}
            disabled={answered}
          >
            <span>{index + 1}</span>
            <strong>{option.japanese}</strong>
            <em>{option.reading}</em>
            {answered && <small>{option.meaning}</small>}
          </button>
        );
      })}
    </div>
  );
}

function AudioButton({
  text,
  audioIndex,
  onPlayAudio,
  compact = false,
}: {
  text: string;
  audioIndex: AudioIndex;
  onPlayAudio: (text: string) => void;
  compact?: boolean;
}) {
  const hasAudio = Boolean(audioPathForText(audioIndex, text));
  return (
    <button
      className={compact ? 'audio-chip compact' : 'audio-chip'}
      onClick={(event) => {
        event.stopPropagation();
        if (hasAudio) onPlayAudio(text);
      }}
      disabled={!hasAudio}
      type="button"
    >
      {hasAudio ? '듣기' : '음성 없음'}
    </button>
  );
}

function SessionView({
  session,
  progress,
  onAnswer,
  onRoleplayInput,
  onEvaluateRoleplay,
  onNext,
  onExit,
  audioIndex,
  onPlayAudio,
}: {
  session: SessionState;
  progress: ProgressState;
  onAnswer: (card: QuizCard, optionId: string) => void;
  onRoleplayInput: (text: string) => void;
  onEvaluateRoleplay: (card: RoleplayCard) => void;
  onNext: () => void;
  onExit: () => void;
  audioIndex: AudioIndex;
  onPlayAudio: (text: string) => void;
}) {
  const lesson = lessonForUnit(session.unit.id, session.level);
  const card = lesson?.cards[session.index];
  if (!lesson || !card) return null;
  const step = session.index + 1;
  const total = lesson.cards.length;
  const quizLocked = card.kind === 'quiz' && card.requiredExpressionIds.some((id) => !progress.seenExpressionIds.includes(id));
  const roleplayReady = card.kind !== 'roleplay' || (session.roleplayEvaluation && session.roleplayEvaluation.status !== 'retry');
  const canContinue = (card.kind !== 'quiz' || Boolean(session.selectedOptionId) || quizLocked) && roleplayReady;

  return (
    <section className="session-shell">
      <div className="session-top">
        <button className="secondary" onClick={onExit}>나가기</button>
        <div>
          <strong>{session.unit.id}</strong>
          {session.level && <span>{levelLabelFor(session.unit, session.level)}</span>}
          <span>{step}/{total}</span>
        </div>
      </div>
      <div className="session-card">
        {card.kind === 'preview' && (
          <>
            <img className="session-hero" src={card.image} alt="" />
            <div className="session-content">
              <div className="eyebrow">상황 미리보기</div>
              <h1>{card.title}</h1>
              <p>{card.text}</p>
              <ul className="focus-list">
                {card.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            </div>
          </>
        )}
        {card.kind === 'expression' && (
          <div className="session-content centered">
            <div className="eyebrow">핵심 표현</div>
            <h1>{card.title}</h1>
            <div className="phrase-block">
              <strong>{card.japanese}</strong>
              <span>{card.reading}</span>
              <em>{card.meaning}</em>
              <AudioButton text={card.japanese} audioIndex={audioIndex} onPlayAudio={onPlayAudio} />
            </div>
            <p>{card.note}</p>
          </div>
        )}
        {card.kind === 'checkpoint' && (
          <div className="session-content centered">
            <div className="eyebrow">여행 체크포인트</div>
            <h1>{card.title}</h1>
            <div className="checkpoint-card">
              <span>{card.place}</span>
              <p>{card.goal}</p>
              <strong>{card.successCriteria}</strong>
              <div>
                {card.linkedUnitIds.map((id) => (
                  <em key={id}>{id}</em>
                ))}
              </div>
            </div>
          </div>
        )}
        {card.kind === 'missionDrill' && (
          <div className="session-content">
            <div className="eyebrow">미션 표현 드릴</div>
            <h1>{card.title}</h1>
            <p>{card.prompt}</p>
            <div className="mission-drill">
              <span>{card.place}</span>
              {card.lines.map((line) => (
                <article key={`${card.id}-${line.unitId}`}>
                  <em>{line.unitId}</em>
                  <div>
                    <small>{line.action}</small>
                    <strong>{line.japanese}</strong>
                    <p>{line.reading}</p>
                    <b>{line.meaning}</b>
                  </div>
                  <AudioButton text={line.japanese} audioIndex={audioIndex} onPlayAudio={onPlayAudio} compact />
                </article>
              ))}
            </div>
          </div>
        )}
        {card.kind === 'staffLine' && (
          <div className="session-content centered">
            <div className="eyebrow">직원이 하는 말</div>
            <h1>{card.title}</h1>
            <div className="phrase-block staff">
              <strong>{card.japanese}</strong>
              <span>{card.reading}</span>
              <em>{card.meaning}</em>
              <AudioButton text={card.japanese} audioIndex={audioIndex} onPlayAudio={onPlayAudio} />
            </div>
            <p>{card.cue}</p>
          </div>
        )}
        {card.kind === 'dialogue' && (
          <div className="session-content">
            <div className="eyebrow">기본 대화</div>
            <h1>{card.title}</h1>
            <p>{card.setup}</p>
            <div className="dialogue-list">
              {card.turns.map((turn, index) => (
                <div className={`dialogue-turn ${turn.speaker}`} key={`${turn.speaker}-${index}`}>
                  <span>{turn.speaker === 'traveler' ? '나' : '직원'}</span>
                  <strong>{turn.japanese}</strong>
                  <em>{turn.reading}</em>
                  <small>{turn.meaning}</small>
                  <AudioButton text={turn.japanese} audioIndex={audioIndex} onPlayAudio={onPlayAudio} compact />
                </div>
              ))}
            </div>
          </div>
        )}
        {card.kind === 'branch' && (
          <div className="session-content">
            <div className="eyebrow">분기 대화</div>
            <h1>{card.title}</h1>
            <p>{card.situation}</p>
            <div className="branch-grid">
              {card.choices.map((choice) => (
                <article className="branch-card" key={choice.label}>
                  <span>{choice.label}</span>
                  <strong>{choice.japanese}</strong>
                  <em>{choice.reading}</em>
                  <small>{choice.meaning}</small>
                  <p>{choice.outcome}</p>
                </article>
              ))}
            </div>
          </div>
        )}
        {card.kind === 'roleplay' && (
          <div className="session-content centered">
            <div className="eyebrow">자유 역할극</div>
            <h1>{card.title}</h1>
            <p>{card.mission}</p>
            <div className="roleplay-card">
              <span>시작 문장</span>
              <strong>{card.starter}</strong>
              <AudioButton text={card.starter} audioIndex={audioIndex} onPlayAudio={onPlayAudio} />
              <ul>
                {card.checklist.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <label className="roleplay-input">
                <span>내가 말할 문장</span>
                <textarea
                  value={session.roleplayText ?? ''}
                  onChange={(event) => onRoleplayInput(event.target.value)}
                  placeholder="예: すみません。これをお願いします。"
                  rows={4}
                />
              </label>
              <div className="roleplay-actions">
                <button className="secondary" type="button" onClick={() => onEvaluateRoleplay(card)}>
                  입력 확인
                </button>
              </div>
              {session.roleplayEvaluation ? (
                <div className={`roleplay-feedback ${session.roleplayEvaluation.status}`}>
                  <strong>{session.roleplayEvaluation.title}</strong>
                  <p>{session.roleplayEvaluation.message}</p>
                  {session.roleplayEvaluation.matched.length > 0 && (
                    <small>확인된 핵심: {session.roleplayEvaluation.matched.join(', ')}</small>
                  )}
                </div>
              ) : (
                <p className="roleplay-hint">입력 후 확인을 눌러야 다음 단계로 넘어갑니다.</p>
              )}
            </div>
          </div>
        )}
        {card.kind === 'quiz' && (
          <div className="session-content">
            <div className="eyebrow">퀴즈</div>
            <h1>{card.title}</h1>
            <p>{card.prompt}</p>
            {quizLocked ? (
              <div className="lock-note">이 표현은 아직 새 표현 학습을 거치지 않았습니다. 퀴즈를 열 수 없습니다.</div>
            ) : (
              <QuizOptions card={card} selectedOptionId={session.selectedOptionId} onAnswer={(id) => onAnswer(card, id)} />
            )}
            {session.selectedOptionId && (
              <div className={session.lastCorrect ? 'feedback correct' : 'feedback wrong'}>
                <strong>{session.lastCorrect ? '정답입니다' : '다시 확인이 필요합니다'}</strong>
                <p>{card.explanation}</p>
              </div>
            )}
          </div>
        )}
        {card.kind === 'listen' && (
          <div className="session-content centered">
            <div className="eyebrow">듣기 평가</div>
            <h1>{card.title}</h1>
            <p>{card.prompt}</p>
            <div className="phrase-block listen">
              <strong>{card.japanese}</strong>
              <span>{card.reading}</span>
              <em>{card.meaning}</em>
              <AudioButton text={card.japanese} audioIndex={audioIndex} onPlayAudio={onPlayAudio} />
            </div>
            <p>{card.focus}</p>
          </div>
        )}
        {card.kind === 'done' && (
          <div className="session-content centered">
            <div className="eyebrow">완료</div>
            <h1>{card.title}</h1>
            <p>{card.text}</p>
            <div className="reward-pill">{session.unit.reward}</div>
          </div>
        )}
      </div>
      <div className="session-actions">
        <button className="primary" onClick={onNext} disabled={!canContinue}>
          {step === total ? '완료하기' : '계속'}
        </button>
      </div>
    </section>
  );
}

function DoneView({
  unit,
  level,
  progress,
  onRestart,
  onNext,
  setView,
}: {
  unit: LearningUnit;
  level?: PracticeLevel;
  progress: ProgressState;
  onRestart: () => void;
  onNext: () => void;
  setView: Navigate;
}) {
  const next = nextUnit(progress);
  const reward = rewardForUnit(unit);
  const nextLabel = `${courseLabel(next.course)} · ${next.id}`;
  const dueCount = dueReviewItems(progress).length;
  return (
    <section className="done-page">
      <img src={unit.image} alt="" />
      <div className="done-copy">
        <div className="eyebrow">세션 완료</div>
        <h1>{unit.title}</h1>
        <p>
          {levelLabelFor(unit, level) ? `${levelLabelFor(unit, level)} 단계를 완료했습니다. ` : ''}
          {reward.title} 보상을 획득했습니다. 다음 행동은 학습 흐름에 맞춰 정리했습니다.
        </p>
      </div>
      <section className={`reward-reveal ${reward.rarity}`}>
        <div>
          <span>{rarityLabel(reward.rarity)}</span>
          <h2>{reward.title}</h2>
          <p>{reward.subtitle}</p>
        </div>
        <img src={reward.image} alt="" />
      </section>
      <div className="next-actions">
        {progress.wrongCardIds.length > 0 && (
          <button className="action-card" onClick={() => setView('review')}>
            <img src="/scenes/quick-practice/retry-missed.webp" alt="" />
            <strong>오답만 다시 잡기</strong>
            <span>{progress.wrongCardIds.length}개 오답을 먼저 복습합니다.</span>
          </button>
        )}
        {dueCount > 0 && (
          <button className="action-card" onClick={() => setView('review')}>
            <img src="/scenes/quick-practice/dictation.webp" alt="" />
            <strong>예약 복습</strong>
            <span>{dueCount}개 표현을 SRS 순서로 다시 확인합니다.</span>
          </button>
        )}
        <button className="action-card" onClick={onRestart}>
          <img src="/scenes/quick-practice/retry-same.webp" alt="" />
          <strong>다시 한번 학습</strong>
          <span>같은 단원의 표현과 듣기를 다시 봅니다.</span>
        </button>
        <button className="action-card" onClick={onNext}>
          <img src={next.image} alt="" />
          <strong>다음 단원</strong>
          <span>{nextLabel}로 이어서 이동합니다.</span>
        </button>
        <button className="action-card" onClick={() => setView('gacha')}>
          <img src={reward.image} alt="" />
          <strong>도감 확인</strong>
          <span>{progress.rewards.length}개의 보상이 기록되어 있습니다.</span>
        </button>
      </div>
    </section>
  );
}

function SectionHeader({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <section className="section-header">
      <div className="eyebrow">{label}</div>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}

export function App() {
  const [view, setView] = useHashView();
  const [selectedUnit, setSelectedUnit] = useState<LearningUnit | null>(null);
  const [progress, setProgressState] = useState<ProgressState>(() => loadProgress());
  const [session, setSession] = useState<SessionState | null>(null);
  const [doneUnit, setDoneUnit] = useState<LearningUnit | null>(null);
  const [doneLevel, setDoneLevel] = useState<PracticeLevel | undefined>(undefined);
  const [audioIndex, setAudioIndex] = useState<AudioIndex>(() => new Map());

  useEffect(() => {
    let cancelled = false;
    fetch('/audio/manifest.json')
      .then((response) => response.json() as Promise<AudioManifest>)
      .then((manifest) => {
        if (!cancelled) setAudioIndex(buildAudioIndex(manifest, '/audio'));
      })
      .catch(() => {
        if (!cancelled) setAudioIndex(new Map());
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setProgress = (next: ProgressState) => {
    setProgressState(next);
    saveProgress(next);
  };

  const playAudio = (text: string) => {
    const path = audioPathForText(audioIndex, text);
    if (!path) return;
    const audio = new Audio(path);
    audio.play().catch(() => undefined);
  };

  const startUnit = (unit: LearningUnit, level?: PracticeLevel) => {
    if (statusFor(unit, progress) === 'locked' && !progress.debugAccessUnlocked) {
      setSelectedUnit(unit);
      return;
    }
    const lesson = lessonForUnit(unit.id, level);
    if (!lesson) {
      setSelectedUnit(unit);
      return;
    }
    setSelectedUnit(null);
    setDoneUnit(null);
    setDoneLevel(undefined);
    setSession({ unit, index: 0, level });
    setView('session');
  };

  const finishSession = (unit: LearningUnit, level?: PracticeLevel) => {
    const nextProgress = completeUnit(progress, unit.id, rewardForUnit(unit).title);
    setProgress(nextProgress);
    setSession(null);
    setDoneUnit(unit);
    setDoneLevel(level);
    setView('done', { replace: true });
  };

  const advanceSession = () => {
    if (!session) return;
    const lesson = lessonForUnit(session.unit.id, session.level);
    const card = lesson?.cards[session.index];
    if (!lesson || !card) return;

    let nextProgress = progress;
    if (card.kind === 'expression' || card.kind === 'staffLine') {
      nextProgress = markSeen(nextProgress, card.id);
      setProgress(nextProgress);
    }

    if (session.index >= lesson.cards.length - 1) {
      finishSession(session.unit, session.level);
      return;
    }

    setSession({ unit: session.unit, index: session.index + 1, level: session.level });
  };

  const answerQuiz = (card: QuizCard, optionId: string) => {
    if (!session?.unit) return;
    const correct = optionId === card.answerId;
    const wrongProgress = correct ? clearWrong(progress, card.id) : markWrong(progress, card.id);
    const nextProgress = recordReviewAttempt(wrongProgress, {
      unitId: session.unit.id,
      level: session.level,
      cardId: card.id,
      title: card.title,
      prompt: card.prompt,
      correct,
    });
    setProgress(nextProgress);
    setSession({ ...session, selectedOptionId: optionId, lastCorrect: correct });
  };

  const updateRoleplayInput = (text: string) => {
    if (!session) return;
    setSession({ ...session, roleplayText: text, roleplayEvaluation: undefined });
  };

  const evaluateCurrentRoleplay = (card: RoleplayCard) => {
    if (!session) return;
    setSession({
      ...session,
      roleplayEvaluation: evaluateRoleplayInput(card, session.roleplayText ?? ''),
    });
  };

  const restartDoneUnit = () => {
    if (doneUnit) startUnit(doneUnit, doneLevel);
  };

  const startNextUnit = () => {
    const unit = nextUnit(progress);
    startUnit(unit);
    if (!lessonForUnit(unit.id)) {
      setView(viewForUnit(unit));
    }
  };

  const toggleDebugAccess = (enabled: boolean) => {
    setProgress(setDebugAccess(progress, enabled));
  };

  const content = useMemo(() => {
    if (view === 'session' && session) {
      return (
        <SessionView
          session={session}
          progress={progress}
          onAnswer={answerQuiz}
          onRoleplayInput={updateRoleplayInput}
          onEvaluateRoleplay={evaluateCurrentRoleplay}
          onNext={advanceSession}
          onExit={() => {
            setSession(null);
            setView(viewForUnit(session.unit), { replace: true });
          }}
          audioIndex={audioIndex}
          onPlayAudio={playAudio}
        />
      );
    }
    if (view === 'done' && doneUnit) {
      return (
        <DoneView
          unit={doneUnit}
          level={doneLevel}
          progress={progress}
          onRestart={restartDoneUnit}
          onNext={startNextUnit}
          setView={setView}
        />
      );
    }
    if (view === 'home') return <HomeView progress={progress} onStartUnit={startUnit} setView={setView} />;
    if (view === 'prep') return <PrepView progress={progress} onSelect={setSelectedUnit} />;
    if (view === 'foundation') return <FoundationView progress={progress} onSelect={setSelectedUnit} />;
    if (view === 'scenes') return <SceneView progress={progress} onSelect={setSelectedUnit} />;
    if (view === 'journey') return <JourneyView progress={progress} onSelect={setSelectedUnit} />;
    if (view === 'review') return <ReviewView progress={progress} onSelectUnit={setSelectedUnit} onStartUnit={startUnit} />;
    if (view === 'gacha') return <GachaView progress={progress} onSelectUnit={setSelectedUnit} />;
    if (view === 'session' || view === 'done') return <HomeView progress={progress} onStartUnit={startUnit} setView={setView} />;
    return <SettingsView progress={progress} onToggleDebugAccess={toggleDebugAccess} />;
  }, [view, session, progress, doneUnit, doneLevel, audioIndex]);

  return (
    <div className="app">
      <Header view={view} setView={setView} />
      <main>{content}</main>
      {selectedUnit && (
        <UnitDrawer
          unit={selectedUnit}
          progress={progress}
          onClose={() => setSelectedUnit(null)}
          onStart={startUnit}
        />
      )}
    </div>
  );
}
