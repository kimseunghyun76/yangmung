// /admin — 콘텐츠 검수·편집 페이지. 세션(장면)별로 채워진 내용을 보고, 표시 문자열을 수정.
// 편집은 localStorage 오버라이드로 즉시 반영(이 기기). 소스 영구반영은 '내보내기(JSON)'로.
import { useMemo, useState } from 'react';
import { CONTENT } from '../content';
import { SCENE_SENTENCES } from '../content/sceneSentences';
import { loadOverrides, saveOverrides, clearOverrides, applyOverrides, type Overrides } from '../content/overrides';

const phraseById = Object.fromEntries(CONTENT.phrases.map((p) => [p.id, p]));
const ja = (id?: string) => (id ? (phraseById[id]?.kanji ?? phraseById[id]?.displayKana ?? phraseById[id]?.kana ?? `?${id}`) : '');
const ko = (id?: string) => (id ? (phraseById[id]?.korean ?? '') : '');

type Mission = typeof CONTENT.missions[number];

function flagsFor(m: Mission): string[] {
  const f: string[] = [];
  if (m.steps.length < 3) f.push(`스텝 ${m.steps.length}개(<3)`);
  const clerkNoPrompt = m.steps.filter((s) => s.speaker && s.speaker !== '나' && !s.promptPhraseId && !s.recapPromptJa).length;
  if (clerkNoPrompt) f.push(`상대 대사 없음 ×${clerkNoPrompt}`);
  const fb = m.steps.reduce((a, s) => a + s.choices.filter((c) => c.feedback).length, 0);
  if (fb === 0) f.push('오답 피드백 0');
  const broken = m.steps.flatMap((s) => [s.promptPhraseId, ...s.choices.map((c) => c.phraseId)]).filter((id) => id && !phraseById[id!]);
  if (broken.length) f.push(`깨진 참조 ${broken.length}`);
  return f; // 문장 도감 개수·중복은 상단 대시보드에서 점검
}

// 문장 도감 전역 점검 — 장면 간 중복(같은 kana가 2개 장면+) + 장면별 개수
function sentenceAudit() {
  const kanaToScenes = new Map<string, Set<string>>();
  const counts: Record<string, number> = {};
  let total = 0;
  for (const [scene, arr] of Object.entries(SCENE_SENTENCES)) {
    if (scene === 'C0') continue;
    const a = arr as { kana: string }[];
    counts[scene] = a.length;
    total += a.length;
    for (const s of a) {
      if (!kanaToScenes.has(s.kana)) kanaToScenes.set(s.kana, new Set());
      kanaToScenes.get(s.kana)!.add(scene);
    }
  }
  const dups = [...kanaToScenes.entries()]
    .filter(([, set]) => set.size > 1)
    .map(([kana, set]) => ({ kana, scenes: [...set] }));
  const max = Math.max(0, ...Object.values(counts));
  return { total, counts, dups, max };
}

export function Admin() {
  const [version, setVersion] = useState(0);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const overrides = useMemo<Overrides>(() => loadOverrides(), [version]);
  const scenes = CONTENT.missions.filter((m) => m.id !== 'C0');
  const editedCount = useMemo(() => JSON.stringify(overrides).length > 2 ? Object.keys(overrides.missions ?? {}).length + Object.keys(overrides.sentences ?? {}).length : 0, [overrides]);

  // 오버라이드 경로에 값 기록 → 저장 → 런타임 반영 → 리렌더
  function edit(path: (o: Overrides) => void) {
    const o = loadOverrides();
    path(o);
    saveOverrides(o);
    applyOverrides(o);
    setVersion((v) => v + 1);
  }
  function setMission(id: string, key: 'scenario' | 'canDo', val: string) {
    edit((o) => { (o.missions ??= {})[id] ??= {}; o.missions[id][key] = val; });
  }
  function setStep(id: string, si: number, val: string) {
    edit((o) => { (o.missions ??= {})[id] ??= {}; (o.missions[id].steps ??= {})[si] ??= {}; o.missions[id].steps![si].situationKo = val; });
  }
  function setChoice(id: string, si: number, ci: number, key: 'text' | 'feedback', val: string) {
    edit((o) => {
      (o.missions ??= {})[id] ??= {}; (o.missions[id].steps ??= {})[si] ??= {};
      ((o.missions[id].steps![si].choices ??= {})[ci] ??= {})[key] = val;
    });
  }
  function setSentence(sid: string, key: 'kanji' | 'korean', val: string) {
    edit((o) => { (o.sentences ??= {})[sid] ??= {}; o.sentences[sid][key] = val; });
  }

  // 무료 한→일 번역 — 구글(비공식·CORS 허용) 우선, 실패 시 MyMemory 폴백. 키·서버 불필요.
  async function translateText(ko: string): Promise<string | null> {
    try {
      const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=ja&dt=t&q=${encodeURIComponent(ko)}`);
      if (r.ok) {
        const d = await r.json() as [Array<[string]>];
        const t = (d?.[0] ?? []).map((s) => s?.[0] ?? '').join('').trim();
        if (t) return t;
      }
    } catch { /* 폴백으로 */ }
    try {
      const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(ko)}&langpair=ko|ja`);
      const d = await r.json();
      const t: string | undefined = d?.responseData?.translatedText;
      if (t && !/MYMEMORY WARNING|INVALID|NO QUERY/i.test(t)) return t.trim();
    } catch { /* noop */ }
    return null;
  }
  // 행의 한국어를 번역해 일본어 칸을 채움(prompt 없이 — iPhone 호환). 한국어 칸을 먼저 수정해 두면 됨.
  async function onTranslate(sid: string, ko: string) {
    if (!ko.trim()) { alert('먼저 한국어 칸을 채운 뒤 번역하세요.'); return; }
    setBusy(sid);
    const jaText = await translateText(ko);
    setBusy(null);
    if (!jaText) { alert('번역 실패 — 네트워크 또는 일일 한도일 수 있어요. 잠시 후 다시 시도해 주세요.'); return; }
    edit((o) => { (o.sentences ??= {})[sid] ??= {}; o.sentences[sid].kanji = jaText; });
  }

  function exportJson() {
    const text = JSON.stringify(loadOverrides(), null, 2);
    navigator.clipboard?.writeText(text).then(
      () => alert('편집 내용(JSON)을 클립보드에 복사했어요. 소스 영구반영 시 사용하세요.'),
      () => window.prompt('편집 내용(JSON) — 복사하세요:', text),
    );
  }
  function reset() {
    if (!confirm('이 기기의 모든 편집 오버라이드를 지울까요? (소스는 그대로)')) return;
    clearOverrides();
    location.reload();
  }

  const filtered = scenes.filter((m) => !q || m.id.toLowerCase().includes(q.toLowerCase()) || (m.place ?? '').includes(q) || m.scenario.includes(q));
  const totalFlags = scenes.reduce((a, m) => a + flagsFor(m).length, 0);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 16px 80px', fontFamily: 'system-ui, sans-serif', color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 22, margin: 0 }}>콘텐츠 검수 · 편집 <span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>/admin</span></h1>
      <p style={{ fontSize: 13, color: '#666', margin: '6px 0 14px' }}>
        장면 {scenes.length}개 · 검증 경고 {totalFlags}건 · 편집 항목 {editedCount}개 ·
        편집은 이 기기에 즉시 반영(localStorage), 소스 영구반영은 <b>내보내기</b>.
        문장 도감의 <b>🌐 한→일</b>: 한국어 칸을 고친 뒤 누르면 무료로 일본어 번역(구글·MyMemory, 키 불필요).
      </p>

      {/* 문장 도감 검증 대시보드 — 장면 간 중복·개수 한눈에 */}
      {(() => {
        const a = sentenceAudit();
        const short = Object.entries(a.counts).filter(([, n]) => n < a.max);
        return (
          <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: '12px 14px', marginBottom: 16, background: a.dups.length ? '#fff7f6' : '#f4faf6' }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 14 }}>
              문장 도감 점검 — 총 {a.total}개 · 장면 간 중복 <b style={{ color: a.dups.length ? '#b9382e' : '#1a8f4c' }}>{a.dups.length}건</b> · 개수 미달 {short.length}개 장면
            </p>
            {a.dups.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 12.5 }}>
                <span style={{ color: '#b9382e', fontWeight: 700 }}>⚠️ 장면 간 중복(다른 세션끼리 같은 문장):</span>
                <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                  {a.dups.slice(0, 20).map((d) => (
                    <li key={d.kana} lang="ja">{d.kana} <span style={{ color: '#888' }}>— {d.scenes.join(', ')}</span></li>
                  ))}
                  {a.dups.length > 20 && <li style={{ color: '#888' }}>…외 {a.dups.length - 20}건</li>}
                </ul>
              </div>
            )}
            {short.length > 0 && (
              <p style={{ margin: '8px 0 0', fontSize: 12.5, color: '#a06000' }}>
                개수 미달({a.max}개 기준): {short.map(([id, n]) => `${id}(${n})`).join(', ')}
              </p>
            )}
          </div>
        );
      })()}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="장면 검색 (id·장소)" style={inp} />
        <button onClick={exportJson} style={btn}>편집 내보내기(JSON)</button>
        <button onClick={reset} style={{ ...btn, color: '#b9382e', borderColor: '#b9382e' }}>편집 초기화</button>
        <a href="/" style={{ ...btn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>← 앱으로</a>
      </div>

      {filtered.map((m) => {
        const flags = flagsFor(m);
        const sentences = (SCENE_SENTENCES as Record<string, { id: string; kana: string; kanji?: string; korean: string; speaker?: string }[]>)[m.id] ?? [];
        return (
          <details key={m.id} style={{ border: '1px solid #ddd', borderRadius: 10, marginBottom: 10, background: '#fff' }}>
            <summary style={{ cursor: 'pointer', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, listStyle: 'none' }}>
              <b style={{ fontSize: 15 }}>{m.id}</b>
              <span style={{ fontWeight: 700 }}>{m.place ?? m.scenario}</span>
              <span style={{ fontSize: 12, color: '#999' }}>{m.steps.length}스텝 · 문장 {sentences.length}</span>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {flags.length === 0
                  ? <span style={{ ...badge, background: '#e6f6ec', color: '#1a8f4c' }}>OK</span>
                  : flags.map((f) => <span key={f} style={{ ...badge, background: '#fdecea', color: '#b9382e' }}>{f}</span>)}
              </span>
            </summary>

            <div style={{ padding: '4px 14px 16px', borderTop: '1px solid #eee' }}>
              <Field label="장면명(scenario)" value={m.scenario} onSave={(v) => setMission(m.id, 'scenario', v)} />
              <Field label="목표(canDo)" value={m.canDo} onSave={(v) => setMission(m.id, 'canDo', v)} multiline />

              <h3 style={h3}>스텝 ({m.steps.length})</h3>
              {m.steps.map((s, si) => (
                <div key={si} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                    스텝 {si + 1} · 화자: <b>{s.speaker ?? '—'}</b>
                    {s.promptPhraseId
                      ? <> · 상대 대사: <span lang="ja">{ja(s.promptPhraseId)}</span> <span style={{ color: '#aaa' }}>({ko(s.promptPhraseId)})</span></>
                      : s.recapPromptJa
                        ? <> · 상대 대사: <span lang="ja">{s.recapPromptJa}</span> <span style={{ color: '#aaa' }}>({s.recapPromptKo ?? s.situationKo})</span></>
                        : (s.speaker && s.speaker !== '나' ? <span style={{ color: '#b9382e' }}> · ⚠️ 상대 대사 없음(복습 시 기본 문구로 대체)</span> : <span style={{ color: '#bbb' }}> · (사용자 주도)</span>)}
                  </div>
                  <Field label="상황(situationKo)" value={s.situationKo} onSave={(v) => setStep(m.id, si, v)} />
                  <div style={{ marginTop: 6 }}>
                    {s.choices.map((c, ci) => (
                      <div key={ci} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '4px 0', borderTop: ci ? '1px dashed #f0f0f0' : 'none' }}>
                        <span style={{ ...badge, flex: '0 0 auto', background: c.recoveryType ? '#eef2ff' : c.correct ? '#e6f6ec' : '#fdecea', color: c.recoveryType ? '#4456c7' : c.correct ? '#1a8f4c' : '#b9382e' }}>
                          {c.recoveryType ? '복구' : c.correct ? '정답' : '오답'}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Field label={`보기 ${ci + 1} 라벨`} value={c.text} onSave={(v) => setChoice(m.id, si, ci, 'text', v)} small />
                          {c.phraseId && <div style={{ fontSize: 11, color: '#999' }} lang="ja">→ {ja(c.phraseId)} <span style={{ color: '#bbb' }}>({ko(c.phraseId)})</span></div>}
                          <Field label="피드백" value={c.feedback ?? ''} onSave={(v) => setChoice(m.id, si, ci, 'feedback', v)} small placeholder="(오답·헷갈림 설명)" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <details style={{ marginTop: 6 }}>
                <summary style={{ cursor: 'pointer', ...h3, listStyle: 'revert' }}>문장 도감 ({sentences.length})</summary>
                {sentences.map((row) => (
                  <div key={row.id} style={{ display: 'flex', gap: 8, padding: '4px 0', borderTop: '1px dashed #f0f0f0', fontSize: 13 }}>
                    <span style={{ flex: '0 0 70px', color: '#aaa', fontSize: 11 }}>{row.speaker ?? ''}</span>
                    <div style={{ flex: 1 }}>
                      <Field label="일본어" value={row.kanji ?? row.kana} onSave={(v) => setSentence(row.id, 'kanji', v)} small />
                      <Field label="한국어" value={row.korean} onSave={(v) => setSentence(row.id, 'korean', v)} small />
                    </div>
                    <button onClick={() => onTranslate(row.id, row.korean)} disabled={busy === row.id} title="한국어 칸을 일본어로 자동 번역" style={{ flex: '0 0 auto', alignSelf: 'center', border: '1px solid #4456c7', color: busy === row.id ? '#aaa' : '#4456c7', background: '#eef2ff', borderRadius: 6, padding: '4px 7px', fontSize: 11, fontWeight: 700, cursor: busy === row.id ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>{busy === row.id ? '번역 중…' : '🌐 한→일'}</button>
                  </div>
                ))}
              </details>
            </div>
          </details>
        );
      })}
    </div>
  );
}

// onBlur 시 변경분만 저장하는 비제어 입력. version 변경 시 defaultValue 재설정 위해 key 사용은 상위에서.
function Field({ label, value, onSave, multiline, small, placeholder }: {
  label: string; value: string; onSave: (v: string) => void; multiline?: boolean; small?: boolean; placeholder?: string;
}) {
  const common = {
    defaultValue: value,
    placeholder,
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { if (e.target.value !== value) onSave(e.target.value); },
    style: { width: '100%', boxSizing: 'border-box' as const, border: '1px solid #ddd', borderRadius: 6, padding: small ? '5px 7px' : '7px 9px', fontSize: small ? 12.5 : 13, fontFamily: 'inherit', marginTop: 2 },
  };
  return (
    <label style={{ display: 'block', marginTop: small ? 3 : 8 }}>
      <span style={{ fontSize: 10.5, color: '#aaa', fontWeight: 700 }}>{label}</span>
      {multiline ? <textarea {...common} rows={2} key={value} /> : <input {...common} key={value} />}
    </label>
  );
}

const inp: React.CSSProperties = { flex: 1, minWidth: 160, border: '1px solid #ccc', borderRadius: 8, padding: '8px 10px', fontSize: 14 };
const btn: React.CSSProperties = { border: '1px solid #ccc', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 700, background: '#fff', color: '#333', cursor: 'pointer' };
const badge: React.CSSProperties = { fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '2px 7px' };
const h3: React.CSSProperties = { fontSize: 13, fontWeight: 800, color: '#555', margin: '12px 0 6px' };
