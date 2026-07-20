// 문화·여행 팁 라이브러리 — 세션 사이사이 짧게만 스쳐가던 문법·문화·발음·여행·회화법·장면 팁을
// 언어 학습 / 여행 실전 / 문화·재미 3개 그룹, 11개 세부 카테고리로 모아 언제든 찾아보고,
// 상세 화면에서 더 길고 풍성한 설명을 읽을 수 있게 한다. (독립 뷰; App/Practice에서 연결)
import { useState } from 'react';
import { CONTENT } from '../content';
import type { GrammarPoint } from '../content/types';
import { speak, ttsSupported } from '../tts';
import { WRAP } from '../ui/styles';
import { Icon } from '../ui/Icon';
import { NavBar, type NavBarProps } from './NavBar';
import { GlassPanel } from './shell';
import { Modal } from './Modal';

interface Props {
  nav: NavBarProps;
  onBack: () => void;
}

const GROUPS = ['언어 학습', '여행 실전', '문화·재미'] as const;
type Group = (typeof GROUPS)[number];

const GROUP_DESC: Record<Group, string> = {
  '언어 학습': '문형·발음·회화 요령 — 일본어 자체를 더 잘 다루기 위한 팁',
  '여행 실전': '떠나기 전부터 현지에서까지, 상황별로 바로 쓰는 여행 요령',
  '문화·재미': '매너·관습부터 가벼운 잡학·도시전설까지, 알아두면 재밌는 이야기',
};

const CATEGORIES = ['문법', '발음', '회화법', '학습법', '여행', '장면', '마트·쇼핑', '요즘 일본', '일정별 팁', '문화', '재미·잡학'] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_GROUP: Record<Category, Group> = {
  문법: '언어 학습', 발음: '언어 학습', 회화법: '언어 학습', 학습법: '언어 학습',
  여행: '여행 실전', 장면: '여행 실전', '마트·쇼핑': '여행 실전', '요즘 일본': '여행 실전', '일정별 팁': '여행 실전',
  문화: '문화·재미', '재미·잡학': '문화·재미',
};

const CATEGORY_COLOR: Record<Category, string> = {
  문법: '#4c6ef5', 발음: '#0ca678', 회화법: '#6741d9', 학습법: '#228be6',
  여행: '#b9382e', 장면: '#1971c2', '마트·쇼핑': '#f08c00', '요즘 일본': '#e64980', '일정별 팁': '#0c8599',
  문화: '#e67700', '재미·잡학': '#9c36b5',
};
const CATEGORY_DESC: Record<Category, string> = {
  문법: '여행 회화에서 바로 쓰는 핵심 문형',
  발음: '헷갈리기 쉬운 소리와 리듬',
  회화법: '더 자연스럽게 대화를 이어가는 요령',
  학습법: '일본어를 더 효율적으로 익히는 공부 요령',
  여행: '실전에서 자주 마주치는 상황별 준비물·요령',
  장면: '미션 장면(편의점·온천·신칸센 등)별 실전 팁',
  '마트·쇼핑': '슈퍼·드럭스토어·편의점에서 바로 쓰는 쇼핑 요령',
  '요즘 일본': '최근 일본 여행에서 달라진 것·유행하는 것',
  '일정별 팁': '당일치기부터 한달살기까지, 일정 길이별로 다른 준비물·요령',
  문화: '알아두면 실수를 줄이는 매너와 관습',
  '재미·잡학': '가볍게 읽는 도시전설·잡학·재밌는 뒷이야기',
};

const GROUP_ICON: Record<Group, string> = { '언어 학습': '📖', '여행 실전': '🧳', '문화·재미': '✨' };

const label: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--accent)', textTransform: 'uppercase',
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function TipsLibrary({ nav, onBack }: Props) {
  const [group, setGroup] = useState<Group>('문화·재미');
  const [category, setCategory] = useState<Category>('문화');
  const [selected, setSelected] = useState<GrammarPoint | null>(null);
  const [query, setQuery] = useState('');
  const categoriesInGroup = CATEGORIES.filter((c) => CATEGORY_GROUP[c] === group);

  const q = normalize(query);
  const searching = q.length > 0;
  const items = searching
    ? CONTENT.grammar.filter((g) => {
        const hay = [g.label, g.tipKo, ...(g.tags ?? [])].join(' ');
        return normalize(hay).includes(q);
      })
    : CONTENT.grammar.filter((g) => g.category === category);

  function selectGroup(g: Group) {
    setGroup(g);
    const first = CATEGORIES.find((c) => CATEGORY_GROUP[c] === g);
    if (first) setCategory(first);
  }

  function pickTag(t: string) {
    setQuery(t);
  }

  return (
    <main style={WRAP}>
      <NavBar {...nav} />

      <button onClick={onBack} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: 'var(--ink-soft)', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: '4px 0', marginBottom: 12,
      }}>← 뒤로</button>

      <div style={{ marginBottom: 16 }}>
        <p style={{ margin: 0, ...label }}>문화·여행 팁</p>
        <h1 style={{ margin: '8px 0 4px', fontSize: 25, fontWeight: 900, letterSpacing: '-0.03em' }}>알아두면 든든한 이야기들</h1>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          언어 학습·여행 실전·문화 이야기 <strong style={{ color: 'var(--ink)' }}>{CONTENT.grammar.length}개</strong>를 언제든 모아서 찾아볼 수 있어요.
        </p>
      </div>

      {/* 검색 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 14, marginBottom: 14,
        border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)',
      }}>
        <Icon name="search" size={16} style={{ color: 'var(--ink-faint)', flex: '0 0 auto' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="태그·키워드로 찾기 (예: 신칸센, 환전, 온천)"
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontSize: 14, color: 'var(--ink)',
          }}
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="검색 지우기" title="검색 지우기" style={{
            border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ink-faint)', display: 'flex', padding: 2,
          }}>
            <Icon name="cross" size={16} />
          </button>
        )}
      </div>

      {!searching && (
        <>
          {/* 1단계 — 그룹 선택 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {GROUPS.map((g) => {
              const active = group === g;
              const count = CONTENT.grammar.filter((x) => CATEGORY_GROUP[x.category as Category] === g).length;
              return (
                <button key={g} className="ym-press" onClick={() => selectGroup(g)} style={{
                  flex: 1, padding: '12px 8px', borderRadius: 16, cursor: 'pointer', textAlign: 'center',
                  border: `1.5px solid ${active ? 'var(--ink)' : 'var(--glass-border)'}`,
                  background: active ? 'var(--glass-bg-strong)' : 'transparent',
                }}>
                  <span style={{ display: 'block', fontSize: 20 }}>{GROUP_ICON[g]}</span>
                  <strong style={{ display: 'block', marginTop: 2, fontSize: 13, color: active ? 'var(--ink)' : 'var(--ink-soft)' }}>{g}</strong>
                  <span style={{ display: 'block', fontSize: 10.5, color: 'var(--ink-faint)', fontWeight: 700 }}>{count}개</span>
                </button>
              );
            })}
          </div>
          <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--ink-soft)' }}>{GROUP_DESC[group]}</p>

          {/* 2단계 — 그룹 안 세부 카테고리 */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 2, scrollbarWidth: 'none' }}>
            {categoriesInGroup.map((c) => {
              const active = category === c;
              const count = CONTENT.grammar.filter((g) => g.category === c).length;
              return (
                <button key={c} className="ym-press" onClick={() => setCategory(c)} style={{
                  flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 999, cursor: 'pointer', fontWeight: 800, fontSize: 13,
                  border: `1px solid ${active ? 'var(--ink)' : 'var(--glass-border)'}`,
                  background: active ? CATEGORY_COLOR[c] : 'var(--glass-bg-strong)',
                  color: active ? '#fff' : 'var(--ink-soft)',
                }}>
                  {c}
                  <span style={{ fontSize: 11, opacity: 0.85 }}>{count}</span>
                </button>
              );
            })}
          </div>
          <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--ink-soft)' }}>{CATEGORY_DESC[category]}</p>
        </>
      )}

      {searching && (
        <p style={{ margin: '0 0 14px', fontSize: 12.5, color: 'var(--ink-soft)' }}>
          "<strong style={{ color: 'var(--ink)' }}>{query}</strong>" 검색 결과 <strong style={{ color: 'var(--ink)' }}>{items.length}개</strong>
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((g) => (
          <button key={g.id} className="ym-press" onClick={() => setSelected(g)} style={{
            width: '100%', textAlign: 'left', padding: '13px 14px', borderRadius: 14, cursor: 'pointer',
            border: '1px solid var(--glass-border)', background: 'var(--glass-bg-strong)', color: 'var(--ink)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 14.5 }}>{g.label}</strong>
                {searching && g.category && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 999, color: '#fff',
                    background: CATEGORY_COLOR[g.category as Category] ?? 'var(--accent)',
                  }}>{g.category}</span>
                )}
              </span>
              <span style={{ display: 'block', marginTop: 3, fontSize: 12.5, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.tipKo}</span>
              {!!g.tags?.length && (
                <span style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' }}>
                  {g.tags.map((t) => (
                    <span
                      key={t}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); pickTag(t); }}
                      style={{
                        fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 999, cursor: 'pointer',
                        color: 'var(--ink-soft)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                      }}
                    >#{t}</span>
                  ))}
                </span>
              )}
            </span>
            <Icon name="flow" size={14} style={{ color: 'var(--ink-faint)', flex: '0 0 auto' }} />
          </button>
        ))}
        {items.length === 0 && (
          <GlassPanel><p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)', textAlign: 'center' }}>일치하는 팁이 없어요. 다른 키워드로 찾아보세요.</p></GlassPanel>
        )}
      </div>

      {selected && <TipDetailModal g={selected} onClose={() => setSelected(null)} onTag={pickTag} />}
    </main>
  );
}

function TipDetailModal({ g, onClose, onTag }: { g: GrammarPoint; onClose: () => void; onTag: (t: string) => void }) {
  const color = (g.category && CATEGORY_COLOR[g.category as Category]) ?? 'var(--accent)';
  return (
    <Modal title={g.label} onClose={onClose}>
      {g.category && (
        <span style={{ display: 'inline-block', marginBottom: 10, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: color, color: '#fff' }}>{g.category}</span>
      )}
      <p style={{ margin: '0 0 14px', fontSize: 14.5, lineHeight: 1.75, color: 'var(--ink)' }}>{g.detail ?? g.tipKo}</p>

      {!!g.tags?.length && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {g.tags.map((t) => (
            <button key={t} className="ym-press" onClick={() => { onTag(t); onClose(); }} style={{
              fontSize: 11.5, fontWeight: 700, padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
              color: 'var(--ink-soft)', background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)',
            }}>#{t}</button>
          ))}
        </div>
      )}

      {g.exampleJa && (
        <button className="ym-press" onClick={() => speak(g.exampleJa!)} disabled={!ttsSupported()} style={{
          width: '100%', padding: 14, borderRadius: 14, border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg-strong)', textAlign: 'left', cursor: 'pointer', marginBottom: 10, color: 'var(--ink)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)' }}>실전 예문 · 눌러서 듣기</span>
            <Icon name="listen" size={16} style={{ color: 'var(--accent)' }} />
          </span>
          <strong lang="ja" style={{ display: 'block', marginTop: 6, fontSize: 18 }}>{g.exampleJa}</strong>
          {g.exampleKo && <span style={{ display: 'block', marginTop: 3, fontSize: 13, color: 'var(--ink-soft)' }}>{g.exampleKo}</span>}
        </button>
      )}

      {g.commonMistake && (
        <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'var(--warn-soft)', border: '1px solid var(--warn)' }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 800, color: 'var(--warn)' }}>흔한 실수</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>{g.commonMistake}</p>
        </div>
      )}

      {g.action && (
        <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: 'var(--ok-soft)', border: '1px solid var(--ok)' }}>
          <p style={{ margin: 0, fontSize: 11.5, fontWeight: 800, color: 'var(--ok)' }}>바로 해보기</p>
          <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>{g.action}</p>
        </div>
      )}

      {!g.detail && !g.exampleJa && !g.commonMistake && !g.action && (
        <GlassPanel><p style={{ margin: 0, fontSize: 13, color: 'var(--ink-soft)' }}>{g.tipKo}</p></GlassPanel>
      )}
    </Modal>
  );
}
