# 나선형 난이도 설계 brief — 복습에 새 내용을 얹어 난이도가 자연히 오르는 구조

> 목표: 복습이 "같은 것 반복"이 아니라 **"아는 것 + 한 걸음"**이 되게 한다.
> 원칙: [학습 먼저 → 퀴즈 절대 룰](src/learn/studyFirst.test.ts)의 확장 — 선행을 익히기 전에는 후속이 등장하지 않는다.
> 이 문서는 구현 없이 설계만 담는다. 구현 시 아래 순서대로.

## 기존 자산 (재사용할 것, 새로 만들지 말 것)

- `CardProgress.consecutiveCorrect >= 2` = "익힘(mastered)" 판정 — [progress.ts](src/learn/progress.ts)
- 퀴즈 변형 세트가 이미 존재: `read`(ja→뜻) / `listen`(듣고 뜻) / `ko2ja`(뜻→ja) / `hear2ja`(듣고 ja) — [cards.ts](src/learn/cards.ts)
- `pickFreshestVariant`: 개념당 변형 1개 선택 (현재는 최근성 기준)
- 적응 엔진(struggling/cruising)과 미션 tier 이동 창 — 세션 단위 난이도는 이미 동적
- 검증 하니스 V1~V20 + 메타테스트 — [validate.ts](src/content/validate.ts)

## 설계 1 — 표현 확장 사슬 (buildsOn)

**스키마**: `Phrase.buildsOn?: string[]` — 이 표현의 선행 표현 id 목록. [types.ts](src/content/types.ts)

```
これをください  ←buildsOn─  これをふたつください  ←buildsOn─  ふくろもおねがいします
(기본 주문)                  (조수사 확장)                      (복합 요청)
```

**선택 로직** (selectSessionCards의 fresh 풀 필터에 추가):
- introduce/quiz 카드의 phrase에 `buildsOn`이 있으면, **모든 선행 phrase의 대표 카드가 mastered일 때만** fresh 풀에 들어간다(=해금).
- 선행 대표 카드 찾기: reviewTarget.id가 선행 phrase id인 카드들 중 아무거나 mastered면 인정.
- 미해금 표현은 세션·학습형 덱·플래시 어디에도 안 나옴 — studyFirst 룰과 동일한 강도.

**검증** (validate.ts V21):
- buildsOn 참조 무결성 (없는 id = fail)
- 사이클 금지 (A→B→A = fail)
- 자기 참조 금지

**테스트** (spiral.test.ts, studyFirst.test.ts 스타일):
- 선행 미숙련 → 후속 미출제 / 선행 mastered → 후속 fresh 등장 / 사슬 3단계 순차 해금

## 설계 2 — 변형 사다리 (같은 개념, 점점 어려운 변형)

`pickFreshestVariant`를 **숙련도 기반 사다리**로 교체:

| mastery | 출제 변형 | 방향 |
|---|---|---|
| 미학습~낮음 | `read` | 인지(쉬움) |
| 중간 | `listen`, `hear2ja` | 청해 |
| 높음(cc≥2) | `ko2ja`, compose | 산출(어려움) |

- `itemMastery(p)` (이미 존재, adaptive.ts에서 사용)로 단계 판정.
- 효과: 복습 세션이 자동으로 "아는 단어를 더 어려운 방식으로" 시험 → 콘텐츠 추가 없이도 나선 효과.
- 주의: 변형 사다리는 studyFirst 불변식과 충돌하지 않음(개념은 이미 학습됨).

## 설계 3 — 콘텐츠 저작 가이드

- 핵심 표현 50개(미션 tier 1~2의 productive 표현)부터 각 1~2개 확장 변형 저작.
- 확장 방향: ① 조수사/수량 추가 ② 조사·시제 변화(N5 문법 팁과 연결 — n5Refs) ③ 두 표현 결합.
- 확장 표현도 V19(사전 도입) 대상 — Unit newPhraseIds에 등록하거나 introduce 카드 자동 생성 경로 확인.
- N5 어휘 미커버 11개(お金·レストラン·朝/昼/晩ごはん·牛乳·近く·聞く·話す·読む·座る)를 확장 표현에 우선 포함 → `npm run report:n5`로 확인.

## 구현 순서 (각 단계마다 typecheck + test + lint:content)

1. 스키마 + V21 검증 + 메타테스트 (콘텐츠 없이도 green)
2. 설계 2 변형 사다리 (콘텐츠 무관, 즉시 체감) + 테스트
3. 설계 1 해금 로직 + spiral.test.ts
4. 콘텐츠 저작 10개 파일럿 → 세션에서 체감 확인 → 50개 확대

## 하지 말 것

- SM-2 도입 (친구 권고로 이미 배제 — 단순 SRS 유지)
- 새 진척 필드 추가 (기존 consecutiveCorrect/itemMastery로 충분)
- 전 표현 일괄 사슬화 (핵심 50개만 — YAGNI)
