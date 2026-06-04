# C14~C30 장면 대화 재작성 명세 (Codex용)

> 문제: C14~C30(17개) 미션이 자동 생성 템플릿으로 찍혀 **17개 전부 같은 점원 대사**를 공유.
> `ごようけんはなんですか`(무엇을 도와드릴까요) / `ほかになにかありますか`(그 밖에 필요한 것이) 가
> 신사·병원·경찰서·긴급상황·온천·축제에까지 나와 "엉뚱한 대화"가 됨(특히 대화 복습 화면).
> 목표: **C1~C13 수준의 손작성 대화**로 재작성 — 장면마다 진짜 상대 대사 + 의미 있는 선택지 + 오답 피드백.

---

## 0. 한 줄 요약
`src/content/missions/c14-c30-more.ts`의 자동 생성(`scene()` 템플릿)을 버리고, **17개 장면을 각각
손으로 작성한 `Mission`** 으로 교체한다. 각 스텝은 **`promptPhraseId`(장면에 맞는 실제 상대 대사)** 를
쓰고 `recapPromptJa`(제네릭 대사)는 쓰지 않는다. 필요한 새 상대 대사는 `phrases.ts`에 추가한다.

---

## 1. 산출물
- **수정:** `src/content/missions/c14-c30-more.ts` — `seeds`/`scene()` 템플릿 제거, 17개 `Mission` 직접 작성
  후 `export const moreMissions: Mission[] = [c14, c15, … c30]`.
- **수정(필요 시):** `src/content/phrases.ts` — 장면별 상대 대사/사용자 표현 중 **없는 것만** 추가.
- 기존 `phrases.ts`의 적절한 phrase는 **재사용 우선**(아래 §6).

---

## 2. 데이터 구조 (정확히 준수 — `src/content/types.ts`)
```ts
interface Mission {
  id: CLevel;                 // 'C14'…'C30'
  scenario: string;           // 한국어 장면 설명
  place?: string;             // 짧은 장소 라벨(신사·병원·카페…)
  sequence?: string[];        // 장면 진행 순서(짧은 한국어 라벨) — '순서 맞추기' 카드 + 복습 대화 구성
  speakPhraseIds?: string[];  // 장면 끝 '따라 말하기'로 꺼낼 핵심 사용자 문장 2~3개
  canDo: string;
  unlockAfter: string[];      // 예: ['C5'] (기존 seed의 unlockAfter 유지)
  steps: MissionStep[];       // 2~4개 권장
}
interface MissionStep {
  situationKo: string;        // 이 순간 무슨 상황인지(한국어 1줄)
  speaker?: string;           // 말하는 상대 역할(점원·직원·역무원·경찰관·안내…) — 장면에 맞게!
  promptPhraseId: string;     // ★ 상대가 하는 실제 일본어 대사(phrase id). recapPromptJa 쓰지 말 것
  choices: Choice[];          // 3~4개
}
interface Choice {
  text: string;               // 선택지 라벨(한국어, 구체적으로 — '네 필요해요'처럼)
  correct: boolean;
  phraseId?: string;          // 이 선택의 일본어 대사(사용자 발화)
  recoveryType?: RecoveryType;
  recoveryOutcome?: 'full' | 'partial';
  feedback?: string;          // 특히 오답·헷갈림에 '왜 어색한지' 1줄
}
```

---

## 3. 스텝 작성 규칙 (C1~C13와 동일 품질)
각 미션 = **steps 2~4개**, 각 step:
1. **`promptPhraseId` 필수** — 그 장면의 상대가 실제로 할 법한 대사. (제네릭 "무엇을 도와드릴까요" 금지)
2. **`situationKo`** — 그 순간 상황 1줄.
3. **`speaker`** — 장면에 맞는 화자(§4). 신사·경찰·긴급은 "점원"이 아님.
4. **`choices` 3~4개**, 다음을 포함:
   - **정답 1~2개**(`correct:true`) — 자연스러운 사용자 응답(phraseId).
   - **오답 최소 1개**(`correct:false`) + **`feedback`**(왜 이 상황에 어색한지 한국어 1줄). ← C14~C30에 지금 없는 핵심.
   - **복구 1개** — `phraseId:'p_mou_ichido'` 또는 `'p_eigo_de'` 등 + `recoveryType`/`recoveryOutcome`.
5. **선택지 라벨(`text`)은 구체적 한국어**("필요한 것을 말하기" 같은 추상 라벨 금지 → "표 한 장 주세요"처럼).
6. **`sequence`/`speakPhraseIds`** 채우기(기존 seed 값 참고·개선).

---

## 4. 17개 장면 + 화자 주의 (★ = 점원 아님 — 대사 틀 주의)
| id | place | 상대(화자) | 대화 톤 |
|---|---|---|---|
| C14 | 카페 | 점원 | 주문·추천·물·계산 |
| C15 | 빵집 | 점원 | 상품·개수·봉투·결제 |
| C16 | 이자카야 | 점원 | 인원·추천·추가·계산 |
| C17 | 스시집 | 점원 | 추천·알레르기·제외 재료 |
| C18 | 관광안내소 | 안내 직원 | 표·가격·위치·촬영 |
| C19 ★ | 신사 | 신사 직원/안내(점원 아님) | 장소 묻기·촬영 가능 여부·조용한 도움 요청 |
| C20 | 온천 | 접수 직원 | 요금·위치·이용법 |
| C21 | 료칸 | 프런트 직원 | 예약·방·조식·시설 |
| C22 | 버스 | 운전사/안내 | 목적지·요금·하차 |
| C23 | 신칸센 | 역무원 | 표·승강장·방향 |
| C24 | 렌터카 | 카운터 직원 | 예약·결제·반납·영수증 |
| C25 ★ | 병원 | 접수/의료진 | 증상·쉬운 설명 요청 |
| C26 ★ | 경찰서 | 경찰관 | 분실·도움·위치·다음 행동 |
| C27 ★ | 긴급상황 | 행인/구급 | 즉시 도움·아픈 곳·위치 |
| C28 | 통신매장 | 점원 | 상품·가격·사용법·결제 |
| C29 | 코인세탁 | (무인/안내) 직원·행인 | 사용법·요금·기계 위치 |
| C30 ★ | 축제 | 노점 점원/안내 | 표·먹거리·사진·이동 |
> ★ 장면은 "いらっしゃいませ/무엇을 도와드릴까요" 같은 **상점 멘트 금지**. 그 장소다운 대사로.

기존 seed(`c14-c30-more.ts`)의 `first`/`second` phrase는 **사용자 응답 후보로 재사용 가능**(장면에 맞음).
단, 상대 대사(promptPhraseId)와 오답·피드백은 새로 작성.

---

## 5. 새 phrase 작성 규칙 (`phrases.ts` — validate.ts 미러)
없는 상대 대사/표현만 추가. 각 Phrase:
- **`id`**: `p_<영문소문자_언더스코어>`, 유일, 한자 금지. (예: `p_otesuki_desu_ka`)
- **`kana`(순수 읽기)**: 히라가나/가타카나 + 장음 `ー` + 촉음 `っ/ッ` + 요음만. **한자·문장부호 금지.**
- **`kanji`**: 자연 표기(한자·문장부호 OK).
- **`displayKana?`**: 가나 + 문장부호(、。？！)만.
- **`romaji?`**, **`korean`**(필수, 자연스러운 뜻).
- **`register`**: `receptive`(상대 발화=promptPhrase) / `productive`(사용자 발화) / `both`.
- 상대 대사는 보통 `receptive`, 사용자 응답은 `productive`.
- 정중체(です/ます) 기본. N5~N4 여행 수준. 원어민 자연스러움.

---

## 6. 기존 phrase 재사용 (먼저 확인)
이미 있는 것 예: `p_sumimasen, p_arigatou_gozaimasu, p_ikura_desu_ka, p_doko_desu_ka, p_kore_kudasai,
p_mou_ichido, p_eigo_de, p_yasashii_nihongo, p_michi_oshiete, p_shashin_ii, p_tasukete, p_osusume_wa…`
→ 맞으면 그대로 phraseId로 사용. **중복 phrase 새로 만들지 말 것.**

---

## 7. 골드 스탠다드 예시 (C1 — 이 구조를 따른다)
```ts
{
  situationKo: '계산대에 물건을 올리자 점원이 봉투가 필요한지 묻는다',
  speaker: '점원',
  promptPhraseId: 'p_fukuro',                       // 상대 실제 대사 = 봉투 필요하세요?
  choices: [
    { text: '네 (필요해요)', phraseId: 'p_hai', correct: true },
    { text: '아니요 (괜찮아요)', phraseId: 'p_iie', correct: true },
    { text: '봉투는 필요 없어요', phraseId: 'p_fukuro_iranai', correct: true },
    { text: '다시 말해 주세요', phraseId: 'p_mou_ichido', correct: true, recoveryType: 'repeat', recoveryOutcome: 'full' },
  ],
},
```
### 신규 장면 완성 예 (C19 신사 — 점원 멘트 금지)
```ts
{
  situationKo: '경내에서 길을 몰라 직원에게 손씻는 곳(手水舎) 위치를 묻는다',
  speaker: '신사 직원',
  promptPhraseId: 'p_dou_shimashita',               // 상대: 무슨 일이세요?(어떻게 오셨어요)
  choices: [
    { text: '실례합니다, 여기가 어디예요?', phraseId: 'p_sumimasen_koko_doko', correct: true },
    { text: '손씻는 곳은 어디예요?', phraseId: 'p_temizu_doko', correct: true },
    { text: '봉투 주세요', phraseId: 'p_fukuro_iranai', correct: false, feedback: '여긴 가게가 아니에요 — 신사에선 어색해요' },
    { text: '영어로 괜찮을까요?', phraseId: 'p_eigo_de', correct: true, recoveryType: 'fallback', recoveryOutcome: 'partial' },
  ],
},
// (필요하면 p_sumimasen_koko_doko, p_temizu_doko 등을 phrases.ts에 §5 규칙대로 추가)
```

---

## 8. 품질 / 금지
- 장면마다 **상대 대사가 달라야** 함(17개 동일 대사 절대 금지).
- ★ 장면은 상점 멘트 금지 — 장소에 맞는 화자·대사.
- 오답 선택지는 **그 장면에서 진짜 헷갈릴 법한 것** + 왜 어색한지 feedback.
- 기계 번역투 금지, 정중체, 원어민 자연스러움.

---

## 9. 검증 (반드시 통과)
- `npm run build` (tsc)
- `npm run lint:content`
- `npm run test:content` (17/17 유지)
- 새 phrase는 kana 순수읽기 규칙 위반 0.

---

## 10. 인수 체크리스트
- [ ] C14~C30 17개가 `scene()` 템플릿 없이 손작성 `Mission`으로 교체
- [ ] 각 스텝 `promptPhraseId` 사용(=장면별 실제 상대 대사), `recapPromptJa` 제거
- [ ] ★ 장면(신사·병원·경찰·긴급·축제) 상점 멘트 없음, 화자·대사가 장소에 맞음
- [ ] 각 스텝 오답 1개+이상 + feedback, 복구 1개 포함
- [ ] 선택지 라벨이 구체적 한국어(추상 라벨 제거)
- [ ] 새 phrase는 §5 규칙 준수·중복 없음, 참조 누락 0
- [ ] build·lint:content·test:content(17/17) 통과
