# 장면별 학습 문장 생성 명세 (Codex용)

> 목적: **가챠로 뽑아 모으는** 장면별 일본어 학습 문장을 **장면당 30개씩** 생성.
> 사용처: 보석함 개봉 시 그 장면의 문장 카드를 1~N개 획득 → 도감/복습에서 모아 보기.
> ⚠️ 기존 `phrases.ts`/SRS/유닛은 **건드리지 말 것**. 아래 **신규 파일**에만 추가한다.

---

## 0. 한 줄 요약
14개 여행 장면(C1~C13) 각각에 대해, 여행자가 실제로 듣고/말하는 **자연스러운 일본어 문장 30개**를
`src/content/sceneSentences.ts`에 만든다. 점원 대사(받기)와 내가 하는 말(말하기)을 **섞어** 한 장면이
대화로 굴러가게 한다.

---

## 1. 산출물 — 파일 & 타입
**신규 파일:** `src/content/sceneSentences.ts`

```ts
import type { CLevel, Register } from './types';

export interface SceneSentence {
  id: string;            // ss_<scene>_<2자리>  예: 'ss_c1_01'  (ASCII·소문자·유일, 한자 금지)
  kana: string;          // 순수 읽기: 히라가나/가타카나 + ー + っ/ッ + 요음(ゃゅょ)만. 한자·문장부호 금지
  kanji?: string;        // 자연 표기(한자 포함 가능). 표시·TTS용
  displayKana?: string;  // 선택: 가나 + 문장부호(、。？！) 허용
  romaji: string;        // 헵번식 로마자(공백으로 단어 구분)
  korean: string;        // 자연스러운 한국어 뜻
  register: Register;    // 'receptive'(점원·상대 발화) | 'productive'(내가 말함) | 'both'
  speaker: 'clerk' | 'me'; // 화자(대화 구성을 위해)
  tier?: 1 | 2 | 3;      // 난이도/희귀도(1 기본·자주 → 3 심화). 없으면 1
  tip?: string;          // 짧은 한국어 팁(선택, ≤40자)
}

export const SCENE_SENTENCES: Record<CLevel, SceneSentence[]> = {
  C0: [],
  C1: [ /* 30개 */ ],
  C2: [ /* 30개 */ ],
  // … C13까지
  // (C0은 비움)
};
```

---

## 2. 장면 목록 (CLevel · 장소 · 상황)
| id | 장소 | 상황(이 장면에서 자주 쓰는 말) |
|---|---|---|
| C1 | 편의점 | 계산·봉투·데우기·젓가락·포인트카드·결제수단 |
| C2 | 식당 | 입장·인원·주문·추천·계산·포장 |
| C3 | 전철 | 표·노선·환승·플랫폼·지연·하차역 |
| C4 | 호텔 | 체크인/아웃·예약·조식·와이파이·짐 보관 |
| C5 | 거리 | 길 묻기·방향·소요시간·도움 요청 |
| C6 | 약국 | 증상 설명·약 구입·복용법·알레르기 |
| C7 | 쇼핑 | 사이즈·색·시착·가격·면세·계산 |
| C8 | 택시 | 목적지·요금·경유·세워주세요·영수증 |
| C9 | 공항 | 입국심사·목적·체류·수하물·환승 |
| C10 | 환전 | 환전·환율·지폐 단위·수수료 |
| C11 | 코인로커 | 사용법·요금·시간·분실 |
| C12 | 택배 | 발송·요금·도착일·주소 |
| C13 | 라멘 | 식권기·면 굵기·맛 농도·추가(替え玉)·토핑 |

---

## 3. 문장 구성 가이드 (장면당 30개)
- **개수:** 정확히 30개/장면 (C1~C13). C0은 비움.
- **화자 비율:** 점원/상대(`clerk`, receptive) ≈ 12개 + 내가 하는 말(`me`, productive) ≈ 18개.
  → 점원 질문 ↔ 내 대답이 **짝을 이루도록** 구성(둘 다 일본어).
- **난이도 분포:** tier1 ≈ 15, tier2 ≈ 10, tier3 ≈ 5 (기본→심화).
- **정중체 기본:** です/ます체. 반말·과한 경어 지양(여행자 실사용 톤).
- **다양성(한 장면 안에서):** 인사/확인(はい·大丈夫), 요청(〜ください·〜お願いします), 질문(〜ますか·どこ/いくら/何),
  수량·숫자, 문제해결/복구(もう一度·ゆっくり·英語), 리액션까지 골고루.
- **자기완결:** 각 문장은 한 줄로 그 자체로 의미가 통해야 함(맥락 없이도 학습 가능).
- **중복 금지:** 장면 내 중복 X. 기존 `phrases.ts`와 **완전 동일 문장은 지양**(겹쳐도 되지만 새 표현 우선).

---

## 4. 필드 규칙 (검수 — 반드시 준수)
- **`kana`(순수 읽기):** 히라가나/가타카나 + 장음 `ー` + 촉음 `っ/ッ` + 요음 `ゃゅょ`만.
  **한자·문장부호(、。？！ 공백) 금지.** 예) `ふくろはいりますか`
- **`kanji`:** 자연 표기(한자/문장부호 OK). 예) `袋は要りますか`
- **`displayKana`(선택):** 가나 + 문장부호만. 예) `ふくろは、いりますか？`
- **`romaji`:** 헵번식, 단어 공백 구분. 예) `fukuro wa irimasu ka`
- **`id`:** `ss_c1_01` 형식, 소문자/숫자/언더스코어만, **유일**, 한자 금지.
- **`register`:** clerk 문장 → 보통 `receptive`, me 문장 → `productive`(둘 다 쓰면 `both`).
- 한자가 없는 문장은 `kanji` 생략 가능(그땐 `kana`가 곧 표기).

---

## 5. 예시 (편의점 C1 — 톤 참고용 6개)
```ts
{ id:'ss_c1_01', kana:'ふくろはいりますか', kanji:'袋は要りますか', displayKana:'ふくろは、いりますか？', romaji:'fukuro wa irimasu ka', korean:'봉투 필요하세요?', register:'receptive', speaker:'clerk', tier:1 },
{ id:'ss_c1_02', kana:'ふくろはけっこうです', kanji:'袋は結構です', romaji:'fukuro wa kekkou desu', korean:'봉투는 괜찮아요', register:'productive', speaker:'me', tier:1 },
{ id:'ss_c1_03', kana:'あたためますか', kanji:'温めますか', displayKana:'あたためますか？', romaji:'atatamemasu ka', korean:'데워 드릴까요?', register:'receptive', speaker:'clerk', tier:1 },
{ id:'ss_c1_04', kana:'あたためてください', kanji:'温めてください', romaji:'atatamete kudasai', korean:'데워 주세요', register:'productive', speaker:'me', tier:1 },
{ id:'ss_c1_05', kana:'カードでおねがいします', kanji:'カードでお願いします', romaji:'kaado de onegai shimasu', korean:'카드로 부탁합니다', register:'productive', speaker:'me', tier:1 },
{ id:'ss_c1_06', kana:'ポイントカードはありますか', kanji:'ポイントカードはありますか', displayKana:'ポイントカードは、ありますか？', romaji:'pointo kaado wa arimasu ka', korean:'포인트카드 있으세요?', register:'receptive', speaker:'clerk', tier:2 },
```

---

## 6. 품질 기준 / 금지
- **원어민 자연스러움 최우선.** 기계 번역투·교과서투 금지. 실제 점원/여행자가 쓰는 말.
- **여행 N5~N4 수준.** 너무 어려운 한자·경어 표현 회피.
- 문장당 너무 길지 않게(대체로 4~12 어절).
- 비속어·민감 표현 금지. 정확한 조사/활용.
- `korean`은 **의역이라도 자연스럽게**(직역투 금지).

---

## 7. 검증 & 오디오
- **타입체크:** `npm run build`(tsc) 통과해야 함(타입 정확히).
- (선택) 음성: 표현 mp3 파이프라인(`npm run audio`)에 이 문장들을 소스로 포함하는 연동은
  **앱 코드 측에서 추후 처리**(없어도 Web Speech로 읽힘). Codex는 텍스트만 정확히.

---

## 8. 코드 연동 (생성 후 — 앱 측에서 진행)
1. 가챠 보상: 보석함 개봉 시 해당 장면 `SCENE_SENTENCES[sceneId]`에서 **미보유 문장 1~N개**를 뽑아 컬렉션에 적립
   (tier로 희귀도 가중). 자체 localStorage(`yangmung:collection:v1`) 확장.
2. 도감/복습: 모은 문장을 장면별로 열람(듣기 포함). "질문↔답변" 짝으로 보여주기.
3. 오디오: 필요 시 `scripts/generate-audio.mjs` 소스에 `SCENE_SENTENCES` 추가.
> 위 1~3은 콘텐츠가 들어오면 내가(앱 코드) 처리. **Codex는 §1 파일/§4 규칙대로 30×13문장만.**

---

## 9. 인수 체크리스트
- [ ] `src/content/sceneSentences.ts` 생성, `SCENE_SENTENCES` export, `npm run build` 통과
- [ ] C1~C13 각 **정확히 30문장**(C0 빈 배열)
- [ ] 화자(clerk/me) 섞임 + 점원질문↔내답변 짝 구성, register 일치
- [ ] `kana` 순수 읽기 규칙 100% 준수(한자·문장부호 없음)
- [ ] id 유일·형식 준수, 난이도 tier 분포(대략 15/10/5)
- [ ] 원어민 자연스러움·정중체·여행 실사용 톤, 중복 없음
