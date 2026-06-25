// 학습 전략 가이드 — 탭형 풀페이지. 단순 FAQ가 아닌 "왜·어떻게" 학습 전략 중심.
import { useState } from 'react';
import { Modal } from './Modal';
import { Icon, type IconName } from '../ui/Icon';

// ── 탭 구조 ──────────────────────────────────────────────────────────────────
type TabId = 'system' | 'modes' | 'mission' | 'recovery' | 'tips';

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: 'system', label: '학습 구조', icon: 'target' },
  { id: 'modes', label: '모드·메뉴', icon: 'discover' },
  { id: 'mission', label: '장면 공략', icon: 'nav-map' },
  { id: 'recovery', label: '복구 전략', icon: 'recovery' },
  { id: 'tips', label: '효율 팁', icon: 'listen' },
];

// ── 섹션 블록 컴포넌트 ────────────────────────────────────────────────────────
function Section({ icon, title, children }: { icon: IconName; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--ink)' }}>
        <Icon name={icon} size={16} /> {title}
      </p>
      <div style={{ color: 'var(--ink-soft)', fontSize: 13.5, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 9px', borderRadius: 99, fontSize: 11.5, fontWeight: 800, background: `${color}20`, color, marginRight: 4, marginBottom: 4 }}>
      {children}
    </span>
  );
}

function ModeCard({ icon, title, sub, color, time }: { icon: string; title: string; sub: string; color: string; time?: string }) {
  return (
    <div style={{ padding: '12px 14px', borderRadius: 14, border: `1.5px solid ${color}30`, background: `${color}0d`, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontWeight: 800, fontSize: 14, color }}>{title}</span>
        {time && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)' }}>⏱ {time}</span>}
      </div>
      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{sub}</p>
    </div>
  );
}

function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
      <span style={{ width: 22, height: 22, borderRadius: 99, background: 'var(--accent)', color: 'var(--accent-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{n}</span>
      <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{label}</span>
    </div>
  );
}

// ── 탭 콘텐츠 ─────────────────────────────────────────────────────────────────
function TabSystem() {
  return (
    <>
      <Section icon="target" title="세션은 짧게, 매일 꾸준히">
        매 세션은 10~15장입니다. 한 번에 많이 하는 것보다 매일 10분이 효과가 훨씬 큽니다. 뇌는 수면 중에 기억을 굳히기 때문에, 잠들기 전 짧은 복습이 특히 좋습니다.
      </Section>

      <Section icon="kana" title="3트랙이 동시에 진행돼요">
        <StepBadge n={1} label="가나 트랙 — ひらがな · カタカナ 209자. 쓰는 원리를 알면 모든 일본어를 소리 낼 수 있어요." />
        <StepBadge n={2} label="표현 트랙 — 여행에서 쓰는 짧은 문장·어휘를 듣기·읽기·받아쓰기로 반복." />
        <StepBadge n={3} label="장면 트랙 — 편의점·식당·전철 등 실제 상황 미션(C1~C50). 골라서 말하는 훈련." />
        <p style={{ margin: '8px 0 0' }}>세 트랙이 자연스럽게 얽혀 나옵니다. 가나를 알면 표현이 읽히고, 표현을 알면 장면에서 선택할 수 있어요.</p>
      </Section>

      <Section icon="chart" title="SRS — 약점에 집중하는 반복">
        틀린 카드는 다음 세션 앞쪽에 다시 나옵니다. 2회 연속 정답이면 잠시 쉬어가고, 오래 안 본 카드는 자동으로 돌아옵니다. 별도 설정 없이 앱이 알아서 약점을 우선 출제합니다.
      </Section>

      <Section icon="discover" title="발견 카드 — 성취 순간">
        배운 가나로만 이루어진 새로운 단어를 처음 읽을 수 있게 되면 "발견 카드"가 등장합니다. 학습이 쌓일수록 자주 나타납니다.
      </Section>
    </>
  );
}

function TabModes() {
  return (
    <>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>홈 화면 퀵 메뉴에서 원하는 훈련을 골라 시작할 수 있어요.</p>

      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.05em' }}>집중 훈련</p>
      <ModeCard icon="あ" title="히라가나 / 가타카나" color="#3fb27f" sub="스크립트 전체를 한 세션에. 읽기·듣기·비슷한 글자 구분 3종 출제." />
      <ModeCard icon="✏️" title="가나 쓰기" color="#3fb27f" sub="화면에 표시된 가나를 따라 쓰는 필기 연습. 10자 무작위." />
      <ModeCard icon="🔊" title="받아쓰기" color="#3b9fe0" sub="듣고 가나 타일을 순서대로 조립. 듣기와 쓰기를 동시에." />
      <ModeCard icon="✍️" title="한→일 작문" color="#3b9fe0" sub="한국어 뜻을 보고 일본어 타일로 조립. 산출(output) 강화." />

      <p style={{ margin: '14px 0 8px', fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.05em' }}>어휘·읽기</p>
      <ModeCard icon="📚" title="어휘 커리큘럼" color="#9b59b6" sub="인사·월·시간·숫자·신체·스포츠·동물·식물·색·음식·가족·날씨 12그룹 × 184단어. 읽기·듣기·역방향 3종." />
      <ModeCard icon="🪧" title="거리 읽기" color="#e0a23a" sub="편의점 표지·역 안내·메뉴판·경고문 115개. 실전 간판 읽기 훈련." />
      <ModeCard icon="🔢" title="생활 기초" color="#3fb27f" sub="숫자·요일·달·시간·금액·셈 단위 72항목. 계산대·예약 필수 표현." />
      <ModeCard icon="🔤" title="발음 구분" color="#3b9fe0" sub="っ/ー·つ/す·장음 등 헷갈리는 소리 쌍을 듣고 구분." />

      <p style={{ margin: '14px 0 8px', fontSize: 12, fontWeight: 800, color: 'var(--accent)', letterSpacing: '.05em' }}>게임</p>
      <ModeCard icon="⚡" title="속도전 4모드" color="#e0564a" time="4~8초 제한"
        sub="가나 특훈(8초) → 표현 특훈(6초) → 상황 대화(5초) → 전체 블리츠(4초). 난이도별 제한시간·카드 풀이 다릅니다. 정답률 75% 이상이면 보석함 획득." />
    </>
  );
}

function TabMission() {
  return (
    <>
      <Section icon="nav-map" title="미션은 5스텝 점층 구조">
        각 장면(편의점·식당 등)은 5단계로 구성됩니다.
        <div style={{ marginTop: 8 }}>
          <StepBadge n={1} label="상황 진입 — 기본 상호작용(영수증 주세요·이거 주세요)" />
          <StepBadge n={2} label="응용 — 예상 밖 상황(품절·환전 거부 등)" />
          <StepBadge n={3} label="마무리 — 계산·인사 등 대화 끝맺음" />
          <StepBadge n={4} label="응용 심화 — 조건·선택 포함한 복합 상황" />
          <StepBadge n={5} label="종합 — 처음부터 끝까지 전략적 선택" />
        </div>
      </Section>

      <Section icon="target" title="canDo 목표 확인하기">
        각 미션 카드 상단의 "이걸 할 수 있다" 문장이 학습 목표입니다. 예: C1 — "편의점에서 계산하고 봉투 여부를 답할 수 있다." 목표를 읽고 시작하면 집중도가 올라갑니다.
      </Section>

      <Section icon="kana" title="5단계 티어 — 순서대로 열림">
        <div style={{ marginBottom: 6 }}>
          <Chip color="#3fb27f">티어1</Chip> 생존 동선 — 편의점·식당·전철·호텔·입국
        </div>
        <div style={{ marginBottom: 6 }}>
          <Chip color="#3b9fe0">티어2</Chip> 생활 확장 — 약국·쇼핑·택시·환전·로커
        </div>
        <div style={{ marginBottom: 6 }}>
          <Chip color="#9b59b6">티어3</Chip> 문화·체험 — 스시·온천·료칸·신칸센·회전초밥
        </div>
        <div style={{ marginBottom: 6 }}>
          <Chip color="#e0a23a">티어4</Chip> 트러블·교섭 — 렌터카·병원·분실·긴급·면세
        </div>
        <div>
          <Chip color="#e0564a">티어5</Chip> 고급심화 — 환불·ATM·약국처방·오마카세·길잃음
        </div>
        <p style={{ margin: '8px 0 0' }}>앞 장면을 3번 이상 경험하면 다음 장면이 열립니다. 건너뛸 수 없게 설계된 것은 기초 없이 고급이 나오는 혼란을 방지하기 위해서예요.</p>
      </Section>

      <Section icon="fast" title="약점 재도전 활용하기">
        세션이 끝난 뒤 "완료" 화면에서 틀린 카드만 모아 즉시 재도전할 수 있습니다. 한 세션에서 오답이 3개 이상이면 꼭 재도전해 그 자리에서 굳혀두는 게 효율적입니다.
      </Section>
    </>
  );
}

function TabRecovery() {
  return (
    <>
      <Section icon="recovery" title="복구 표현 = 실전 전략">
        모르면 틀린 게 아닙니다. 실제 일본어 대화에서 "모르겠다"고 표현하는 것 자체가 능력입니다. 문제 하단의 복구 액션은 대화를 멈추지 않게 해주는 우회 표현입니다.
        <div style={{ marginTop: 10, marginBottom: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: 'var(--ok-soft)', color: 'var(--ok)', marginRight: 8 }}>FULL</span>
          상대가 처음부터 다시 설명해줍니다. 정보를 완전히 재획득.
        </div>
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800, background: 'var(--warn-soft)', color: 'var(--warn)', marginRight: 8 }}>PARTIAL</span>
          상대가 천천히·단순하게 반복합니다. 핵심어만 건질 수 있는 상황.
        </div>
      </Section>

      <Section icon="listen" title="핵심 복구 4표현">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
          {[
            { ja: 'もう一度', kana: 'もういちど', ko: '다시 한 번', out: 'FULL' },
            { ja: 'ゆっくり', kana: 'ゆっくり', ko: '천천히', out: 'PARTIAL' },
            { ja: '日本語で', kana: 'にほんごで', ko: '일본어로', out: 'FULL' },
            { ja: '英語で', kana: 'えいごで', ko: '영어로', out: 'FULL' },
          ].map(({ ja, kana, ko, out }) => (
            <div key={ja} style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)' }}>
              <div lang="ja" style={{ fontSize: 18, fontWeight: 800 }}>{ja}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{kana}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{ko}</div>
              <span style={{ marginTop: 4, display: 'inline-block', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 99, background: out === 'FULL' ? 'var(--ok-soft)' : 'var(--warn-soft)', color: out === 'FULL' ? 'var(--ok)' : 'var(--warn)' }}>{out}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section icon="target" title="복구 선택의 원칙">
        <StepBadge n={1} label="중요한 정보(금액·시간·번호)가 필요하면 もう一度(FULL)를 선택해요." />
        <StepBadge n={2} label="방향·위치·일반 설명이라면 ゆっくり(PARTIAL)도 충분합니다." />
        <StepBadge n={3} label="복구 후 대화가 이어지면 그 내용을 최대한 집중해 들어요." />
        <p style={{ margin: '4px 0 0' }}>복구 표현을 자연스럽게 쓸 수 있으면 일본 여행에서 막힐 일이 크게 줄어듭니다.</p>
      </Section>
    </>
  );
}

function TabTips() {
  return (
    <>
      <Section icon="listen" title="듣기가 안 들릴 때">
        <StepBadge n={1} label="설정 → 듣기 속도를 ×0.8 이하로 낮추면 모든 듣기가 더 천천히 들려요." />
        <StepBadge n={2} label="받아쓰기 세션으로 자주 틀리는 소리를 집중 훈련하세요." />
        <StepBadge n={3} label="발음 구분 메뉴에서 っ·ー·つ/す 같은 헷갈리는 쌍을 반복하세요." />
      </Section>

      <Section icon="kana" title="가나가 안 외워질 때">
        <StepBadge n={1} label="'가나 특훈' 속도전(8초)으로 빠르게 읽는 반사 훈련을 매일 합니다." />
        <StepBadge n={2} label="가나 쓰기로 손으로 써보면 시각 기억이 강화됩니다." />
        <StepBadge n={3} label="발음 보조(설정 → 항상)를 켜면 가나 위에 읽는 소리가 항상 표시됩니다." />
        <p style={{ margin: '6px 0 0' }}>히라가나 → 카타카나 순서로 익히는 게 좋습니다. 히라가나를 완전히 굳힌 뒤 카타카나를 시작하세요.</p>
      </Section>

      <Section icon="chart" title="수준 진단 잘 활용하기">
        배치고사는 읽기·듣기·상황 3축으로 점수를 냅니다. 한 축이 현저히 낮으면 해당 전용 세션(받아쓰기·어휘·장면 미션)을 우선 공략해 균형을 맞추세요. 진단은 홈 상단 "진단" 버튼으로 언제든 다시 받을 수 있습니다.
      </Section>

      <Section icon="fast" title="속도전 활용법">
        정확하게 배운 뒤 속도전으로 "자동화"합니다. 새로 배운 카드는 메인 세션에서 먼저 익히고, 속도전은 이미 아는 카드를 반사 속도로 굳히는 용도로 쓰세요. 모드 순서: 가나 특훈 → 표현 특훈 → 상황 대화 → 전체 블리츠 순으로 올라가면 부담이 없습니다.
      </Section>

      <Section icon="target" title="하루 10분 루틴 예시">
        <div style={{ padding: '12px 14px', borderRadius: 14, border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)' }}>
          {[
            { time: '2분', label: '속도전 — 가나 특훈 10문항으로 워밍업' },
            { time: '6분', label: '메인 세션 — 오늘의 장면 한 판 (10~12카드)' },
            { time: '2분', label: '복습 or 받아쓰기 — 틀린 것 빠르게 마무리' },
          ].map(({ time, label }) => (
            <div key={time} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8, fontSize: 13 }}>
              <span style={{ flexShrink: 0, padding: '2px 8px', borderRadius: 99, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 11.5, fontWeight: 800 }}>{time}</span>
              <span style={{ lineHeight: 1.5 }}>{label}</span>
            </div>
          ))}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 12.5 }}>이 루틴을 2주 지속하면 기초 가나와 생존 표현 40여 개가 굳어집니다.</p>
      </Section>
    </>
  );
}

// ── 메인 가이드 컴포넌트 ──────────────────────────────────────────────────────
export function Guide({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabId>('system');

  return (
    <Modal title="학습 가이드" onClose={onClose}>
      {/* 탭 바 */}
      <div style={{
        display: 'flex', gap: 4, overflowX: 'auto', margin: '-4px -2px 16px',
        paddingBottom: 4, scrollbarWidth: 'none',
      }}>
        {TABS.map(({ id, label, icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 12px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 800,
              background: active ? 'var(--accent)' : 'var(--glass-bg-strong)',
              color: active ? 'var(--accent-ink)' : 'var(--ink-soft)',
              transition: 'background .12s, color .12s',
            }}>
              <Icon name={icon} size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      <div>
        {tab === 'system' && <TabSystem />}
        {tab === 'modes' && <TabModes />}
        {tab === 'mission' && <TabMission />}
        {tab === 'recovery' && <TabRecovery />}
        {tab === 'tips' && <TabTips />}
      </div>
    </Modal>
  );
}
