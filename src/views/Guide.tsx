// 가이드 팝업 — 앱이 어떻게 굴러가는지 한눈에. (정적 콘텐츠)
import { Modal } from './Modal';
import { Icon, type IconName } from '../ui/Icon';

const SECTIONS: { icon: IconName; h: string; body: string }[] = [
  { icon: 'target', h: '오늘 한 판', body: '매 세션은 짧게 10~15장. 가나로 몸 풀고 → 실제 여행 장면(편의점·식당·전철·호텔)을 한 판으로 연습합니다.' },
  { icon: 'kana', h: '카드 종류', body: '읽기·듣기·구분(가나), 선택(롤플레이), 받아쓰기, 따라 말하기. 같은 표현도 복습마다 다른 형태로 나와요.' },
  { icon: 'discover', h: '발음 보조', body: '아직 안 익숙한 가나 위에 작은 로마자가 떠요. 여러 번 만나 익숙해지면 자동으로 사라집니다. (설정에서 항상/끄기 선택 가능)' },
  { icon: 'recovery', h: '막혔을 때', body: '「다시 말해 주세요」「천천히 부탁합니다」 같은 복구 표현으로 넘어갈 수 있어요. 틀린 게 아니라 전략 — 미션은 계속 이어집니다.' },
  { icon: 'listen', h: '천천히 듣기', body: '듣기 버튼 옆 천천히 버튼으로 더 느리게 들을 수 있어요. 빠른 발화가 안 들릴 때 쓰세요.' },
  { icon: 'nav-map', h: '지도 · 복습장', body: '지도에서 내 진척과 다음 장면을, 복습장에서 배운 가나·표현을 퀴즈 없이 다시 볼 수 있어요.' },
];

export function Guide({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="가이드" onClose={onClose}>
      {SECTIONS.map((s) => (
        <div key={s.h} style={{ marginBottom: 14 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 7 }}><Icon name={s.icon} size={16} /> {s.h}</p>
          <p style={{ margin: '4px 0 0', color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.55 }}>{s.body}</p>
        </div>
      ))}
    </Modal>
  );
}
