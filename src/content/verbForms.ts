// 동사 형태 학습 — ます형(정중)·～ながら(동시동작)·～たい(희망표현).
// 출처: 여행 빈출 동사 연속듣기 영상 스크립트에서 추린 동사. 활용형은 직접 검수해 기입.
// 세 형태는 모두 ます어간(masu-stem)에서 파생: 어간+ます / 어간+ながら / 어간+たい.

export interface VerbConj {
  ja: string;   // 한자 표기
  kana: string; // 읽기(순수 가나) — TTS·발음 보조용
}

export interface VerbEntry {
  id: string;
  group: 'godan' | 'ichidan' | 'irregular';
  ko: string;       // 동사 뜻(기본형 기준)
  dict: VerbConj;   // 기본형(사전형)
  masu: VerbConj;   // ます형 — 정중
  nagara: VerbConj; // ～ながら — 동시동작("~하면서")
  tai: VerbConj;    // ～たい — 희망("~하고 싶다")
}

// stemJa/stemKana = ます어간. (godan: 어미 i단 / ichidan: る 제거 / 来る→き, する→し)
const E = (id: string, group: VerbEntry['group'], ko: string, dictJa: string, dictKana: string, stemJa: string, stemKana: string): VerbEntry => ({
  id, group, ko,
  dict: { ja: dictJa, kana: dictKana },
  masu: { ja: `${stemJa}ます`, kana: `${stemKana}ます` },
  nagara: { ja: `${stemJa}ながら`, kana: `${stemKana}ながら` },
  tai: { ja: `${stemJa}たい`, kana: `${stemKana}たい` },
});

export const VERB_FORMS: VerbEntry[] = [
  E('v_iku', 'godan', '가다', '行く', 'いく', '行き', 'いき'),
  E('v_kuru', 'irregular', '오다', '来る', 'くる', '来', 'き'),
  E('v_suru', 'irregular', '하다', 'する', 'する', 'し', 'し'),
  E('v_toru', 'godan', '집다/취하다', '取る', 'とる', '取り', 'とり'),
  E('v_sagasu', 'godan', '찾다', '探す', 'さがす', '探し', 'さがし'),
  E('v_harau', 'godan', '(돈을) 내다', '払う', 'はらう', '払い', 'はらい'),
  E('v_okuru', 'godan', '보내다', '送る', 'おくる', '送り', 'おくり'),
  E('v_osu', 'godan', '누르다', '押す', 'おす', '押し', 'おし'),
  E('v_hiku', 'godan', '당기다', '引く', 'ひく', '引き', 'ひき'),
  E('v_suwaru', 'godan', '앉다', '座る', 'すわる', '座り', 'すわり'),
  E('v_arau', 'godan', '씻다', '洗う', 'あらう', '洗い', 'あらい'),
  E('v_magaru', 'godan', '돌다/꺾다', '曲がる', 'まがる', '曲がり', 'まがり'),
  E('v_naosu', 'godan', '고치다', '直す', 'なおす', '直し', 'なおし'),
  E('v_yoru', 'godan', '들르다', '寄る', 'よる', '寄り', 'より'),
  E('v_yobu', 'godan', '부르다', '呼ぶ', 'よぶ', '呼び', 'よび'),
  E('v_atatameru', 'ichidan', '데우다', '温める', 'あたためる', '温め', 'あたため'),
  E('v_miseru', 'ichidan', '보여주다', '見せる', 'みせる', '見せ', 'みせ'),
  E('v_kaeru', 'ichidan', '바꾸다', '変える', 'かえる', '変え', 'かえ'),
  E('v_shiraberu', 'ichidan', '알아보다', '調べる', 'しらべる', '調べ', 'しらべ'),
  E('v_tsuzukeru', 'ichidan', '계속하다', '続ける', 'つづける', '続け', 'つづけ'),
  // N5 커버리지 보강(2026-07-10) — 듣다/말하다/읽다, 여행 중 안내·회화에서도 자주 쓰는 기본 동사.
  E('v_kiku', 'godan', '듣다/묻다', '聞く', 'きく', '聞き', 'きき'),
  E('v_hanasu', 'godan', '말하다', '話す', 'はなす', '話し', 'はなし'),
  E('v_yomu', 'godan', '읽다', '読む', 'よむ', '読み', 'よみ'),
];

export const VERB_FORM_KEYS = ['masu', 'nagara', 'tai'] as const;
export type VerbFormKey = typeof VERB_FORM_KEYS[number];

export const VERB_FORM_INFO: Record<VerbFormKey, { label: string; sub: string; desc: string }> = {
  masu: { label: 'ます형', sub: '정중', desc: '정중하게 말할 때. 「기본형 어간 + ます」' },
  nagara: { label: '～ながら', sub: '동시동작', desc: '두 가지를 동시에 — "~하면서". 「어간 + ながら」' },
  tai: { label: '～たい', sub: '희망', desc: '하고 싶을 때 — "~하고 싶다". 「어간 + たい」' },
};
