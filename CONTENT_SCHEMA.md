# yangmung — CONTENT_SCHEMA (콘텐츠 뼈대 SSOT)

> 버전: **v1.0-draft** · 작성일 2026-05-23
> 위상: **이 문서가 콘텐츠 타입·검증 규칙의 단일 소스(SSOT).** PRD.md와 충돌 시 이 문서가 우선.
> 목적: "좋은 아이디어는 많은데 콘텐츠 뼈대가 흔들리는" 실패 모드를, **타입 + 빌드 타임 검증**으로 구조적으로 차단.

---

## 0. 설계 원칙 (불변식)

1. **원자는 참조만 된다.** `KanaItem`/`Phrase`는 어디에도 *포함*되지 않고 id로 *참조*된다 → 여러 Unit/Mission이 공유.
2. **N5/Grammar는 전역 인덱스.** 어떤 트랙/미션의 하위가 아니다 → 전체 콘텐츠 대상 커버리지 집계 가능.
3. **텍스트로 100% 동작.** `audioId`/이미지 필드는 비워도 앱이 완전히 돌아간다(오디오는 후행).
4. **신규/복습 분리.** 나선형 재등장(ありがとう 등)은 정상 — `newPhraseIds`만 분량 예산에 카운트.
5. **충돌은 빌드 실패로.** 깨진 참조·필수 누락·표기 위반은 경고가 아니라 빌드 차단(§7).

---

## 1. 공통 타입 & 리터럴

```ts
export type KLevel =
  | 'K1'|'K2'|'K3'|'K4'|'K5'|'K6'|'K7'|'K8'|'K9'|'K10'|'K11';
export type BLevel = 'B0'|'B1'|'B2'|'B3'|'B4'|'B5';
export type CLevel = 'C1'|'C2'|'C3'|'C4'|'C5'|'C6'|'C7';

export type Track = 'kana' | 'lang' | 'mission';

export type EvalMode =
  | 'drill'      // K: 속도 인식 / 가나 입력·조립 (텍스트 1차)
  | 'match'      // 짝맞추기
  | 'cloze'      // 빈칸·잇기
  | 'reaction'   // 소리/문맥 반응 선택
  | 'action'     // 상황 행동
  | 'recovery'   // 복구 스킬
  | 'branch';    // 미션 분기

export type RecoveryType = 'repeat' | 'slow' | 'simplify' | 'fallback';
export type Register = 'receptive' | 'productive' | 'both';
// receptive: 이해만 하면 됨(NPC 대사 등). SRS가 "생산"을 요구하지 않음.
// productive: 학습자가 직접 말할 수 있어야 함. SRS 생산 드릴 대상.
// both: 양방향 핵심 표현(はい·いいえ·ありがとう·すみません·大丈夫です·お願いします 등). 양쪽 통과.
```

---

## 2. 원자 1 — KanaItem (Track K 전용)

> **최대 분해(~220):** 청음 + 탁음/반탁음 + 요음 + 확장 가타카나 + 특수표기를 **전부 개별 원자**로 둔다. 학습자가 인식해야 하는 모든 읽기 단위가 원자여야 confusables·SRS가 정밀해진다.

```ts
export type KanaKind =
  | 'sei'       // 청음 (あ, カ …)
  | 'daku'      // 탁음 (が, ザ …)
  | 'handaku'   // 반탁음 (ぱ, パ …)
  | 'yoon'      // 요음 (きゃ, シュ …)
  | 'extended'  // 확장 가타카나 (ファ, ヴ, ティ, チェ …)
  | 'special';  // 촉음 っ/ッ, 장음 ー

export interface KanaItem {
  id: string;              // 'k_hira_a', 'k_kata_shu' … (§6 규약)
  char: string;            // 'あ' | 'きゃ' | 'ー'
  script: 'hiragana' | 'katakana' | 'common';  // ー(장음)은 'common'. っ='hiragana', ッ='katakana'
  kind: KanaKind;
  romaji: string;          // 'a' | 'kya'
  koreanSound: string;     // '아' | '캬' (한국 학습자용, romaji보다 직관적)
  level: KLevel;
  group: string;           // 'あ행' | 'か행 拗音' 등
  components?: string[];   // 요음/확장만: ['き','ゃ'] (조립·분해 드릴용)
  confusables?: string[];  // 변별 훈련 핵심: 'し'↔'つ', 'シ'↔'ツ', 'ソ'↔'ン', 'ぬ'↔'め'
  examples?: string[];     // 예시 단어 = 경량 원시 문자열 ['あめ','あおい']. ★Phrase 참조 아님.
  n5Refs?: string[];       // 드물게 가나 자체가 N5 항목과 연결될 때
}
```

규칙:
- `kind:'yoon'|'extended'`이면 `components` 권장(가나 조립 드릴 가능).
- `examples`는 **반드시 원시 문자열**(가나 드릴은 경량 유지). 학습 Phrase가 필요하면 Track B에서 별도 Phrase로.
- `confusables`는 같은 `script` 내 헷갈림쌍 위주(교차 script 변별은 별도 K6+ 유닛에서 다룸).
- **`script:'common'`은 `kind:'special'`일 때만 허용**(현재 ー 한정). っ/ッ은 각각 hiragana/katakana (§9 V10).

---

## 3. 원자 2 — Phrase (Track B/C)

```ts
export interface Phrase {
  id: string;              // 'p_arigatou', 'p_kore_kudasai' (§8 규약)
  kana: string;            // ★필수, 순수 읽기(가나+ー+っ/ッ+요음). 문장부호·공백·한자 불가 (§9 V2): 'もういちどおねがいします'
  kanji?: string;          // 선택, 한자 포함 표기: 'もう一度お願いします'
  displayKana?: string;    // 선택, 문장부호 포함 전(全)가나 표시: 'もういちど、おねがいします'
  romaji?: string;
  korean: string;          // ★필수
  english?: string;
  tip?: string;
  pos?: string;            // 품사
  register: Register;      // ★필수: receptive | productive
  grammarRefs?: string[];  // → GrammarPoint.id (태그)
  n5Refs?: string[];       // → N5Entry.id (전역 태그)
  recoveryType?: RecoveryType; // 복구 스킬 Phrase면 종류 명시
  audioId?: string;        // ★ 지금은 비움. 후행 연결
}
```

규칙:
- `kana`는 **순수 읽기 문자열** — 허용: 히라가나·가타카나 + 장음 ー + 촉음 っ/ッ + 요음 소문자. **한자·로마자·한글·문장부호(、。？！)·공백 불가**(§9 V2).
- 자연스러운 문장이 필요하면: 한자형은 `kanji`, 문장부호 포함 전(全)가나형은 `displayKana`.
- 표시 우선순위(기본): `kanji ?? displayKana ?? kana`. 초보자 가나 모드: `displayKana ?? kana`. (상세 후리가나 토글은 PRD §15.)
- `displayKana`는 **v1 작성 의무 아님**(선택). 있으면 가나 + 허용 문장부호(、。！？·공백·ー)만(V2 확장 린트). 없으면 UI는 `kana` 그대로 표시.
- `recoveryType`이 있으면 그 Phrase는 복구 스킬로 분류(§5 Recovery).

---

## 4. 묶음 — Unit

```ts
export interface Unit {
  id: string;                  // 'u_k3_seion', 'u_b1_food' (§6 규약)
  track: 'kana' | 'lang';
  stage: KLevel | BLevel;
  ageMotif?: string;           // 'B1 = 1–2세' 참고용 (학습 목표 아님)
  canDo: string;               // §8 작성 규칙 준수 (PRD §8)
  mode: EvalMode;

  // Track K 일 때:
  kanaIds?: string[];          // KanaItem 참조

  // Track B 일 때 (신규/복습 분리):
  newPhraseIds?: string[];     // 이 Unit에서 처음 도입 (분량 예산 카운트 대상)
  reviewPhraseIds?: string[];  // 이전 Unit에서 도입된 것의 나선형 복습 (카운트 X)
}
```

규칙:
- `track:'kana'` → `kanaIds` 필수, `new/reviewPhraseIds` 비움, **`stage`는 반드시 KLevel** (V6).
- `track:'lang'` → `newPhraseIds` 필수(최소 1), `reviewPhraseIds` 선택; `kanaIds` 비움, **`stage`는 반드시 BLevel** (V6).
- 한 Phrase는 정확히 한 Unit의 `newPhraseIds`에만 등장(도입은 1회). 이후엔 `reviewPhraseIds`로만 (V4).
- `reviewPhraseIds`의 Phrase는 **반드시 어떤 Unit의 `newPhraseIds`로 먼저 도입**돼야 함 — 유령 복습 금지 (V18).
- `canDo`는 비어 있으면 실패(V11), §8 규칙 준수.

---

## 5. 응용 — Mission (Track C, C1~C7)

```ts
export interface Mission {
  id: CLevel;                  // 'C3'
  scenario: string;            // '식당에서 주문하기'
  canDo: string;               // §8 상황형
  unlockAfter: string[];       // 선행 Unit/Mission id (해금 조건)
  steps: MissionStep[];
  meta?: {
    recoveryExemptReason?: string; // ≥10자. 있으면 Recovery 부족이 실패→경고로 강등 + exempt 리포트 (§9 V9). "침묵 예외"가 아닌 "리뷰 가능한 예외".
  };
}

export interface MissionStep {
  situationKo: string;         // 한국어 상황 설명 ('점원이 봉투가 필요한지 묻는다')
  speaker?: string;            // '점원' | '역무원' 등
  promptPhraseId?: string;     // 상대 일본어 발화 = Phrase 참조 (보통 register:'receptive')
  choices: Choice[];
}

export interface Choice {
  text: string;                // 선택지 표시 텍스트
  correct: boolean;
  phraseId?: string;           // phrase형 선택지 (학습자 발화)
  actionText?: string;         // 비언어 action형 (Fallback: '번역앱 보여주기' 등)
  recoveryType?: RecoveryType;
  recoveryOutcome?: 'full' | 'partial'; // 성공 복구 / 부분 성공 복구
  feedback?: string;
}
```

규칙(§9 검증과 연동):
- 각 MissionStep은 `choices` **≥2**, `correct:true` **≥1** (V8).
- step의 정답이 **전부 recovery면 경고**(V14) — 진짜 정답 선택지가 있어야 함.
- `promptPhraseId` Phrase는 기본 `register:'receptive'`(이해만), `choice.phraseId`(학습자 발화)는 기본 `register:'productive'` (불일치 시 경고 V13).
- 각 선택지는 `phraseId` **또는** `actionText` 중 정확히 하나(V7).
- Recovery 규칙(미션 단위, 강화):
  - **미션당 Recovery 선택지 ≥ 2** (스텝당 아님).
  - 그중 ≥1은 `recoveryOutcome:'full'`, ≥1은 `'partial'`.
  - **예외**: `meta.recoveryExemptReason`(≥10자) 있으면 위 부족이 **실패→경고**로 강등 + exempt 리포트(V9). 자기신고 불리언이 아니라 리뷰 가능한 사유.
  - Recovery 사용은 **실패가 아니라 별점만 하락**(점수 로직, §9 PRD).
  - 4종 중 ≥2종 분포 권장.

---

## 6. 전역 인덱스 — Grammar / N5

```ts
export interface GrammarPoint {
  id: string;                  // 'g_masu', 'g_te_kudasai'
  label: string;              // '〜ます (정중형)'
  n5Refs?: string[];
}

export interface N5Entry {
  id: string;                  // ★ASCII만: 'n5_v_taberu', 'n5_g_wa', 'n5_k_person' (한자 금지, 의미 slug)
  type: 'vocab' | 'grammar' | 'kanji';
  value: string;               // 실제 문자는 여기에: 'たべる' | 'は(주제)' | '人'
  source: 'unofficial';        // ★ JLPT 비공개 → 비공식 교재 기반 목록(JLPTsensei 등)
}
```

> N5Entry는 항상 `source:'unofficial'`. "공식 N5 목록"이라는 전제를 코드 레벨에서 금지(PRD §2.1).

---

## 7. SRS — ReviewTarget

```ts
export type ReviewTarget =
  | { type: 'kana';    id: string }   // KanaItem
  | { type: 'phrase';  id: string }   // Phrase (register:'productive'만 생산 드릴)
  | { type: 'grammar'; id: string }   // GrammarPoint
  | { type: 'mission'; id: CLevel };  // Mission 분기 재도전

export interface SrsCard {
  target: ReviewTarget;
  ease: number;        // 경량 SM-2/Leitner
  intervalDays: number;
  dueAt: string;       // ISO
  lapses: number;
}
```

규칙:
- `phrase`이고 `register:'receptive'`면 **재인식(고르기)**만, 생산(입력) 드릴 제외.
- `mission` 타겟은 정답 분기 재현 + Recovery 사용 여부로 ease 조정.

---

## 8. id 명명 규약

| 종류 | prefix | 예 |
|------|--------|-----|
| KanaItem | `k_<script>_<roma>` | `k_hira_a`, `k_kata_shu`, `k_hira_kya` |
| Phrase | `p_<slug>` | `p_arigatou`, `p_kore_kudasai` |
| Unit | `u_<stage>_<slug>` | `u_k3_seion`, `u_b1_food` |
| Mission | `<CLevel>` | `C3` |
| GrammarPoint | `g_<slug>` | `g_masu` |
| N5Entry(vocab/grammar) | `n5_<v\|g>_<slug>` | `n5_v_taberu`, `n5_g_wa` |
| N5Entry(kanji) | `n5_k_<meaningSlug>` | `n5_k_person`(人), `n5_k_water`(水), `n5_k_day_sun`(日) |

- 모든 id는 전역 유일.
- **id는 ASCII만**: 레벨코드(K1·C3 등 대문자) + slug(소문자·숫자·`_`). **한자·가나 금지** → 실제 문자는 `value`/`char`에 (V5).
- **한자 N5 id는 의미 slug 중심**(`n5_k_person`). 음/훈독은 다중이라 불안정 → 의미가 더 안정적. 의미 충돌 시에만 suffix(`n5_k_day_sun` 등).

---

## 9. 검증 하니스 (빌드 타임)

| # | 규칙 | 위반 | 심각도 |
|---|------|------|--------|
| V1 | 필수 필드 | `Phrase.kana/korean/register`, `KanaItem.char/level/kind` 누락 | 실패 |
| V2 | kana 문자집합 | `Phrase.kana`에 히라가나·가타카나·ー·っ/ッ·요음소문자 외(한자/로마자/한글/문장부호/공백) 포함 | 실패 |
| V3 | 참조 무결성 | `kanaIds/new·reviewPhraseIds/unlockAfter/promptPhraseId/phraseId/grammarRefs/n5Refs` 깨진 id | 실패 |
| V4 | 도입 유일성 | 한 Phrase가 2개 이상 Unit의 `newPhraseIds`에 등장 | 실패 |
| V5 | id 유일성/형식 | 중복 id, 또는 id에 ASCII(레벨코드+소문자·숫자·`_`) 외 문자(한자/가나) | 실패 |
| V6 | Unit 트랙·스테이지 정합 | kana↔phraseIds / lang↔kanaIds 혼입·newPhraseIds 빔, 또는 kana인데 stage∉KLevel / lang인데 stage∉BLevel | 실패 |
| V7 | Choice 형태 | 한 Choice가 `phraseId`/`actionText`를 둘 다 갖거나 둘 다 없음 | 실패 |
| V8 | MissionStep 품질 | step의 `choices`<2, 또는 `correct:true`가 0개 | 실패 |
| V9 | Recovery 규칙 | 미션당 recovery <2, 또는 full+partial 미충족 | 실패† |
| V10 | KanaItem.script | `script:'common'`인데 `kind!=='special'` | 실패 |
| V11 | Can-do 필수 | `Unit.canDo`/`Mission.canDo` 빈값 | 실패 |
| V12 | N5 source | `N5Entry.source !== 'unofficial'` | 실패 |
| V13 | register 기본값 | `choice.phraseId`가 receptive / `promptPhraseId`가 productive (`'both'`은 통과) | 경고 |
| V14 | correct 전부 recovery | step의 정답이 모두 recovery | 경고 |
| V15 | Can-do 품질 | B/C canDo에 문법명(ます/てください/〜/조사명) 포함 / K canDo에 속도·정확도 기준 없음 | 경고 |
| V16 | 분량 예산 | 구간별 `newPhraseIds` 합/`KanaItem` 수가 PRD §11 범위 밖 | 경고/게이트 |
| V17 | N5 커버리지 | 비공식 N5 목록 대비 미커버 → N5_COVERAGE.md 생성 | 리포트 |
| V18 | 복습 도입 추적 | `reviewPhraseIds`의 Phrase가 어떤 Unit의 `newPhraseIds`로도 도입되지 않음(유령 복습) | 실패 |
| V19 | 미션 productive 사전 도입 | Mission `choice.phraseId` 중 register=`productive`/`both`가 어떤 Unit의 `newPhraseIds`로도 도입되지 않음 | 실패 |

> **하드 실패(V1~V12, V18, V19)** = 빌드 차단. **경고/게이트(V13~V16)**, **리포트(V17)**.
> † V9는 `meta.recoveryExemptReason`(≥10자) 있으면 실패→경고로 강등 + exempt 리포트.
> *(V18은 stress-test.mjs 작성 중 발견 — review-only 미도입 Phrase를 V1~V17이 못 잡았음.)*
> *(V19는 1차 사용자 테스트 후 외부 검토에서 발견 — "배운 표현이 미션에서 재사용되는 구조" 확립.)*

---

## 10. 파일 레이아웃 (React + Vite + TS)

```
src/content/
  kana/        *.ts   → KanaItem[]
  phrases/     *.ts   → Phrase[]
  units/       *.ts   → Unit[]
  missions/    *.ts   → Mission[]
  grammar/     *.ts   → GrammarPoint[]
  n5/          *.ts   → N5Entry[]
src/content/validate.ts   → V1~V19 (테스트 + 빌드 훅)
```

- 콘텐츠는 코드와 분리. 타입은 `src/content/types.ts`에 본 문서 그대로.
- `validate.ts`는 `npm run lint:content` + CI에서 실행.

---

## 11. 다음 단계
1. 본 스키마 동결 → `types.ts` + `validate.ts` 골격 구현.
2. **CURRICULUM.md**: Irodori Can-do 기반 K/B/C 단계·문법순서·미션 목록(§8 PRD 규칙 준수, 자료 직접 대조).
3. **N5_COVERAGE.md**: 비공식 N5 목록 ↔ 커리큘럼 매핑(V11 산출물).
