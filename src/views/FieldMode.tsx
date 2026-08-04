// 현장 모드 — 여행 중 실제로 쓰는 화면. 학습 모드와 목적이 정반대다.
// · 학습 모드: 이미지·진도·정답 채점 중심(외우는 게 목적)
// · 현장 모드: 텍스트 중심, 채점 없음. 상대 질문 하나에 대해 긍정/부정/응용/모르겠다/안 들린다
//   다섯 갈래 응답을 한 화면에 펼쳐, 지금 내 상황에 맞는 걸 골라 그대로 말하거나 보여주면 된다.
// 근거: "여행 다닐 때는 텍스트 위주여야 하고, 정답을 찾는 게 아니라 다양한 대답들을 제공해주는
// 것이 필요하다"(2026-08-04 사용자 요청).
import { useMemo, useState } from 'react';
import { CONTENT } from '../content';
import { FIELD_SCENES, REPLY_KIND_LABEL, REPLY_KIND_TONE, type FieldReply, type ReplyKind } from '../content/fieldReplies';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { PageHead } from './ui';
import { GlassPanel } from './shell';
import { Furigana } from './Furigana';
import { BigTextOverlay, ZoomButton } from './BigText';
import { sceneVisualByPlace } from './scene';

interface Props {
  nav: NavBarProps;
  onOpenEmergency: () => void;
}

const TONE_COLOR: Record<ReturnType<() => 'ok' | 'warn' | 'accent' | 'soft'>, { fg: string; bg: string }> = {
  ok: { fg: 'var(--ok)', bg: 'var(--ok-soft)' },
  warn: { fg: 'var(--warn)', bg: 'var(--warn-soft)' },
  accent: { fg: 'var(--accent)', bg: 'var(--accent-soft)' },
  soft: { fg: 'var(--ink-soft)', bg: 'var(--glass-bg)' },
};

export function FieldMode({ nav, onOpenEmergency }: Props) {
  const byId = useMemo(() => Object.fromEntries(CONTENT.phrases.map((p) => [p.id, p])), []);
  const [sceneId, setSceneId] = useState(FIELD_SCENES[0].id);
  const [zoom, setZoom] = useState<{ kanji?: string; kana: string; ko: string } | null>(null);
  const scene = FIELD_SCENES.find((s) => s.id === sceneId) ?? FIELD_SCENES[0];

  return (
    <main style={WRAP}>
      <NavBar {...nav} current="field" />
      <PageHead title="현장" sub="지금 상황을 고르면 바로 쓸 대답이 나와요 — 정답은 없어요, 내 상황에 맞는 걸 고르세요" />

      {/* 긴급은 현장에서 가장 급한 동선이라 최상단에 크게 */}
      <button className="ym-press" onClick={onOpenEmergency} style={{
        width: '100%', marginBottom: 16, padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
        border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)',
        fontWeight: 850, fontSize: 14.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <Icon name="emergency" size={18} /> 급할 때 — 긴급 도움
      </button>

      {/* 장면 선택 */}
      <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 3, marginBottom: 16 }}>
        {FIELD_SCENES.map((s) => {
          const active = s.id === sceneId;
          const sv = sceneVisualByPlace(s.place);
          return (
            <button key={s.id} className="ym-press" onClick={() => setSceneId(s.id)} style={{
              flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 13px', borderRadius: 999, cursor: 'pointer', fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap',
              border: `1px solid ${active ? 'var(--ink)' : 'var(--glass-border)'}`,
              background: active ? 'var(--accent)' : 'var(--glass-bg-strong)',
              color: active ? 'var(--accent-ink)' : 'var(--ink)',
            }}>
              <span style={{ color: active ? 'var(--accent-ink)' : sv.accent, display: 'inline-flex' }}><Icon name={sv.icon} size={15} /></span>
              {s.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {scene.situations.map((sit) => {
          const prompt = byId[sit.promptPhraseId];
          return (
            <GlassPanel key={sit.id} strong>
              {/* 상대 질문 */}
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 850, letterSpacing: '.05em', color: 'var(--ink-faint)' }}>
                {sit.situationKo}
              </p>
              {prompt && (
                <button className="ym-press" onClick={() => speak(prompt.displayKana ?? prompt.kana)} disabled={!ttsSupported()}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: 12, borderRadius: 12, cursor: 'pointer',
                    border: '1px solid var(--glass-border)', background: 'var(--surface-2)', color: 'var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 10.5, fontWeight: 850, color: 'var(--accent)', marginBottom: 2 }}>상대</span>
                    <Furigana kanji={prompt.kanji} kana={prompt.displayKana ?? prompt.kana} style={{ display: 'block', fontSize: 16, fontWeight: 800, lineHeight: 1.65 }} />
                    <span style={{ display: 'block', marginTop: 2, fontSize: 12.5, color: 'var(--ink-soft)' }}>{prompt.korean}</span>
                  </span>
                  <Icon name="listen" size={16} style={{ flex: '0 0 auto', color: 'var(--accent)' }} />
                </button>
              )}

              {/* 응답 갈래 — 채점 없이 전부 펼쳐 보여준다 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {sit.replies.map((r, i) => (
                  <ReplyRow key={`${r.kind}-${r.phraseId}-${i}`} reply={r} byId={byId} onZoom={setZoom} />
                ))}
              </div>
            </GlassPanel>
          );
        })}
      </div>

      {zoom && <BigTextOverlay kanji={zoom.kanji} kana={zoom.kana} sub={zoom.ko} onClose={() => setZoom(null)} />}
    </main>
  );
}

function ReplyRow({ reply, byId, onZoom }: {
  reply: FieldReply;
  byId: Record<string, { kanji?: string; kana: string; displayKana?: string; korean: string }>;
  onZoom: (z: { kanji?: string; kana: string; ko: string }) => void;
}) {
  const p = byId[reply.phraseId];
  if (!p) return null;
  const tone = TONE_COLOR[REPLY_KIND_TONE[reply.kind]];
  const kana = p.displayKana ?? p.kana;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 12,
      border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
    }}>
      <span style={{
        flex: '0 0 auto', alignSelf: 'flex-start', marginTop: 2, padding: '2px 8px', borderRadius: 999,
        fontSize: 10, fontWeight: 900, color: tone.fg, background: tone.bg, whiteSpace: 'nowrap',
      }}>{KIND_SHORT[reply.kind]}</span>
      <button className="ym-press" onClick={() => speak(kana)} disabled={!ttsSupported()}
        style={{ flex: 1, minWidth: 0, textAlign: 'left', border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--ink)' }}>
        <Furigana kanji={p.kanji} kana={kana} style={{ display: 'block', fontSize: 15, fontWeight: 750, lineHeight: 1.6 }} />
        <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 650 }}>{p.korean}</span>
        {reply.when && <span style={{ display: 'block', marginTop: 1, fontSize: 11, color: 'var(--ink-faint)' }}>{reply.when}</span>}
      </button>
      <ZoomButton size={32} onClick={() => onZoom({ kanji: p.kanji, kana, ko: p.korean })} />
    </div>
  );
}

// 배지는 좁은 화면에서도 한 줄에 들어가야 해서 짧게 — 전체 라벨은 REPLY_KIND_LABEL에 있다.
const KIND_SHORT: Record<ReplyKind, string> = {
  yes: '네', no: '아니요', apply: '응용', unknown: '모름', unheard: '못 들음',
};

export { REPLY_KIND_LABEL };
