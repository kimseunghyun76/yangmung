// 긴급 도움 — 레벨·미션 잠금과 완전히 무관하게 항상 접근 가능한 화면.
// 사용성 테스트(persona-05)에서 안전·응급 콘텐츠가 최고 난이도(tier5)에 묶여 사실상 도달 불가능하다는
// S0 문제가 확인되어 신설. 잠금 로직(missionsLocked/openMissions/isSceneOpen)을 전혀 참조하지 않는다 —
// startSceneSession()이 애초에 openMissions를 확인하지 않으므로(선택 카드는 missionId로만 필터) 그대로 재사용 가능.
import { useState } from 'react';
import { CONTENT } from '../content';
import { Icon } from '../ui/Icon';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead } from './ui';
import { GlassPanel, hexA } from './shell';
import { sceneVisualByMission } from './scene';
import { BigTextOverlay, ZoomButton } from './BigText';
import { Furigana } from './Furigana';

interface Props {
  nav: NavBarProps;
  onPracticeScene: (missionId: string) => void;
  onBack: () => void;
}

// 표시 순서 — 가장 위급한 상황(미아·재난)을 먼저, 참고형(약국)은 뒤로.
const EMERGENCY_MISSION_IDS = ['C53', 'C51', 'C27', 'C26', 'C52', 'C25', 'C6'];

// 말이 안 나올 때 화면을 그대로 보여줄 수 있는 핵심 한 문장 — 각 긴급 미션의
// speakPhraseIds(기존 콘텐츠)에서 상황을 가장 잘 대표하는 것 하나씩만 골랐다(BL-02).
const SHOW_PHRASE_IDS = [
  'p_kodomo_wo_miushinaimashita', // C53 미아 찾기
  'p_hinan_subeki_desu_ka',       // C51 지진·재난
  'p_tasukete',                    // C27 긴급 도움 청하기
  'p_saifu_nakushita',             // C26 분실물·경찰
  'p_netsu_arimasu',                // C52 병원 접수
  'p_onaka_itai',                   // C25 병원 증상 설명
  'p_kono_kusuri',                  // C6 약국
];

const kicker: React.CSSProperties = { fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase', margin: 0 };

// 2026-07-25 사실 확인(웹 검색, 주일본 대한민국 대사관 공식 사이트 overseas.mofa.go.kr 및 외교부 영사콜센터 안내 기준).
// 배포 전 대사관 사이트에서 최신 번호를 다시 한번 확인할 것 — 공관 연락처는 개편될 수 있음.
interface ContactRow { label: string; number: string; note: string }
const CONTACTS: ContactRow[] = [
  { label: '경찰(도난·분실·범죄)', number: '110', note: '일본 전역 공통' },
  { label: '구급·화재(다침·응급환자)', number: '119', note: '일본 전역 공통, 구급차 무료' },
  { label: '주일본 대한민국 대사관 긴급연락처', number: '+81-70-2153-5454', note: '사건·사고 발생 시(야간·휴일 포함) — 일본 현지 번호' },
  { label: '외교부 영사콜센터', number: '+82-2-3210-0404', note: '24시간 연중무휴, 해외 로밍폰에서 무료 컬렉트콜 가능' },
];

export function Emergency({ nav, onPracticeScene, onBack }: Props) {
  const [zoom, setZoom] = useState<{ kanji?: string; kana: string; ko: string } | null>(null);
  const showPhrases = SHOW_PHRASE_IDS
    .map((id) => CONTENT.phrases.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <main style={WRAP}>
      <NavBar {...nav} current="emergency" />
      <PageHead title="긴급 도움" sub="레벨이나 진행 상황과 관계없이 지금 바로 연습하거나 참고할 수 있어요" />

      <GlassPanel style={{ marginBottom: 18 }}>
        <p style={{ ...kicker, marginBottom: 4 }}>말이 안 나올 때</p>
        <p style={{ margin: '0 0 10px', fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          화면을 그대로 상대방에게 보여주세요.
        </p>
        {showPhrases.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 4px', borderTop: '1px solid var(--glass-border)' }}>
            <div style={{ minWidth: 0 }}>
              <Furigana kanji={p.kanji} kana={p.displayKana ?? p.kana} style={{ display: 'block', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }} />
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--ink-faint)' }}>{p.korean}</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flex: '0 0 auto' }}>
              <ZoomButton size={38} onClick={() => setZoom({ kanji: p.kanji, kana: p.displayKana ?? p.kana, ko: p.korean })} />
              <button className="ym-press" onClick={() => speak(p.displayKana ?? p.kana)} disabled={!ttsSupported()}
                style={{ width: 38, height: 38, flex: '0 0 38px', borderRadius: 10, border: '1px solid var(--glass-border)', background: 'var(--accent-soft)', color: 'var(--accent)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="listen" size={16} />
              </button>
            </div>
          </div>
        ))}
      </GlassPanel>

      <GlassPanel style={{ marginBottom: 18, border: '1px solid var(--accent)' }}>
        <p style={{ ...kicker, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="emergency" size={16} /> 긴급연락처
        </p>
        {CONTACTS.map((c) => (
          <a key={c.number} href={`tel:${c.number.replace(/[^0-9+]/g, '')}`} className="ym-press" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            padding: '10px 4px', textDecoration: 'none', borderTop: '1px solid var(--glass-border)',
          }}>
            <span>
              <span style={{ display: 'block', color: 'var(--ink)', fontWeight: 700, fontSize: 14 }}>{c.label}</span>
              <span style={{ display: 'block', color: 'var(--ink-faint)', fontSize: 11.5, marginTop: 2 }}>{c.note}</span>
            </span>
            <span style={{ flex: '0 0 auto', color: 'var(--accent)', fontWeight: 900, fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>{c.number}</span>
          </a>
        ))}
        <p style={{ margin: '10px 4px 0', fontSize: 11, color: 'var(--ink-faint)', lineHeight: 1.5 }}>
          번호를 누르면 바로 전화 연결을 시도해요. 실제 상황에서는 주변 사람에게 도움을 먼저 요청하는 것도 좋아요.
        </p>
      </GlassPanel>

      <p style={{ ...kicker, marginBottom: 10 }}>바로 연습하기</p>
      <p style={{ margin: '-4px 0 12px', fontSize: 12.5, color: 'var(--ink-soft)' }}>
        아직 학습 진도가 안 열렸어도 아래 상황은 지금 바로 연습할 수 있어요.
      </p>
      <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
        {EMERGENCY_MISSION_IDS.map((id) => {
          const m = CONTENT.missions.find((mm) => mm.id === id);
          if (!m) return null;
          const sv = sceneVisualByMission(id);
          return (
            <button key={id} className="ym-press" onClick={() => onPracticeScene(id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
              padding: 14, borderRadius: 16, cursor: 'pointer',
              border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)',
            }}>
              <span aria-hidden style={{
                width: 44, height: 44, flex: '0 0 44px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: hexA(sv.accent, 0.16), color: sv.accent,
              }}>
                <Icon name={sv.icon} size={22} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>{m.scenario}</span>
                <span style={{ display: '-webkit-box', marginTop: 2, fontSize: 12.5, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{m.canDo}</span>
              </span>
              <Icon name="flow" size={16} style={{ color: 'var(--ink-faint)', flex: '0 0 auto' }} />
            </button>
          );
        })}
      </div>

      <button className="ym-press" onClick={onBack} style={{
        width: '100%', padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
        border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)', fontWeight: 750, fontSize: 14,
      }}>← 홈으로</button>

      {zoom && <BigTextOverlay kanji={zoom.kanji} kana={zoom.kana} sub={zoom.ko} onClose={() => setZoom(null)} />}
    </main>
  );
}
