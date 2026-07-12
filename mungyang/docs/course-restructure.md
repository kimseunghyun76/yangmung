# Course Restructure Plan

## Goal

`newbie.md`의 방향을 앱 구조에 반영한다. 난이도를 한 줄로 나열하지 않고, 학습 목적에 따라 네 과정으로 나눈다.

## New Top-Level Courses

| Course | App Menu | Purpose | Current Units |
| --- | --- | --- | --- |
| 준비 과정 | 준비 | 문자와 소리를 처음 배우는 과정 | P1, P2, P6 |
| 기초 과정 | 기초 | 여행 회화에 필요한 단어와 문법을 조립하는 과정 | P3, P4, P5, P7, P8, P9, P10, P11, P12, P13 |
| 실전 과정 | 실전 | 동일한 여행 상황을 입문, 중급, 고급 난이도로 학습 | S1-S43 |
| 통합 과정 | 통합 | 여러 상황을 실제 여행처럼 연속 수행 | J1-J5 |

## Current Implementation

- `LearningUnit.course`를 추가했다.
- 기존 `kind`는 보상, 콘텐츠 호환성을 위해 유지한다.
- 메인 메뉴는 `홈 / 준비 / 기초 / 실전 / 통합 / 복습 / 도감 / 설정`으로 변경한다.
- 준비 과정은 문자, 발음, 숫자 중심 빠른 연습만 보여준다.
- 기초 과정은 단어, 문장 만들기, 간판 읽기 연습을 보여준다.
- 실전 과정은 기존 장소 그룹을 유지하되, 각 상황에 `입문 / 중급 / 고급` 난이도 메타데이터를 붙인다.
- 단원 카드와 상세 패널에서 난이도 흐름을 보여준다.

## Next Content Change

현재 `S1-S43`은 장소/상황 단원 43개로 구성되어 있고, 각 단원은 다음 난이도 축을 가진다.

| Difficulty | Learning Focus | Example |
| --- | --- | --- |
| 입문 | 한 문장으로 요청하고 직원의 짧은 질문에 답하기 | 메뉴 주세요, 두 명입니다 |
| 중급 | 선택지, 조건, 변경 요청을 처리하기 | 맵지 않은 것으로 부탁합니다 |
| 고급 | 문제 상황, 예외, 대체안을 협상하기 | 예약이 없다고 나올 때 확인 요청 |

## Recommended Data Model Later

현재는 `S18 식당 입장과 대기`처럼 단원 하나가 난이도 계획을 포함한다. 고도화 단계에서는 실제 lesson 콘텐츠를 다음 중 하나로 확장한다.

1. `S18-B`, `S18-I`, `S18-A`처럼 난이도별 단원을 분리한다.
2. `LearningUnit.levels` 안에 입문, 중급, 고급 lesson을 넣는다.

초기 구현은 1번이 빠르지만 단원 수가 크게 늘어난다. 장기적으로는 2번이 더 낫다.

## Current Practice Level Model

`LearningUnit.levelPlans`는 실전 과정에만 붙는다.

| Field | Meaning |
| --- | --- |
| `level` | `beginner`, `intermediate`, `advanced` |
| `label` | 화면 표시 이름 |
| `title` | 해당 난이도의 학습 목표 |
| `focus` | 해당 상황에서 무엇을 할 수 있어야 하는지 |
| `task` | lesson 생성 시 포함해야 할 수행 과제 |

## Next Implementation Step

실제 lesson을 난이도별로 분기했다.

1. 입문 lesson: 핵심 표현 1개, 직원 질문 1개, 기본 대화, 뜻 고르기
2. 중급 lesson: 선택지, 조건, 수량/시간/위치 확인, 분기 대화
3. 고급 lesson: 문제 설명, 대안 요청, 자유 입력 역할극, 듣기 평가

## Implemented Practice Lesson Split

| Level | Cards | Count |
| --- | --- | --- |
| 입문 | preview, expression, staffLine, dialogue, quiz, listen, done | 7 |
| 중급 | preview, expression, expression, staffLine, dialogue, branch, quiz, listen, done | 9 |
| 고급 | preview, expression, expression, expression, staffLine, dialogue, branch, roleplay, quiz, listen, done | 11 |

퀴즈는 각 난이도에서 먼저 본 expression만 `requiredExpressionIds`로 사용한다. 따라서 기존 룰인 “새 표현을 먼저 보고 난 뒤 퀴즈”가 난이도 분기 후에도 유지된다.

## Remaining Course Work

현재 구조, 음성, 자산, 기본 테스트는 통과 상태다. 다음 고도화 후보는 콘텐츠 품질 확장이다.

1. 실전 단원별 대체 표현과 허용 표현 사전을 늘린다.
2. 역할극 평가는 현재 규칙 기반이므로 의미 유사도나 음성 인식 평가로 확장한다.
3. 상품 출시 전에는 `mungyang`을 독립 git 저장소 또는 `yangmung` 내부 앱 패키지로 정리한다.

## Implemented Roleplay Evaluation

고급 lesson의 자유 역할극은 입력 확인을 통과해야 다음 단계로 넘어간다.

| Check | Rule |
| --- | --- |
| 일본어 입력 | 히라가나, 가타카나, 한자 중 하나가 있어야 한다 |
| 핵심 표현 | 시작 문장 전체가 들어가면 통과 |
| 대체 표현 | 시작 문장의 핵심 토큰과 정중 표현 끝맺음이 있으면 통과 |
| 부분 통과 | 핵심 토큰만 있거나 정중 표현만 있으면 부분 통과 |
| 재시도 | 너무 짧거나 일본어가 없거나 핵심 단서가 전혀 없으면 재시도 |

현재 평가는 로컬 규칙 기반이다. 향후 고도화에서는 의미 유사도, 허용 표현 사전, 음성 인식 결과까지 함께 평가한다.

## Implemented SRS Review

퀴즈 결과는 단순 오답 목록뿐 아니라 `reviewItems`에 기록된다.

| Result | Schedule |
| --- | --- |
| 오답 | 즉시 복습 대기 |
| 첫 정답 | 1일 후 |
| 반복 정답 | 기존 간격의 2배, 최대 30일 |

복습 화면은 오답 단원과 예약 복습을 분리해서 보여준다. 설정 화면은 오늘 다시 볼 표현 수를 표시한다.

## Implemented Hash Routing

해시 기반 라우팅을 추가했다. 새로고침이나 직접 URL 진입 시에도 주요 화면으로 바로 들어갈 수 있다.

| View | Hash |
| --- | --- |
| 홈 | `#/` |
| 준비 | `#/prep` |
| 기초 | `#/foundation` |
| 실전 | `#/scenes` |
| 통합 | `#/journey` |
| 복습 | `#/review` |
| 도감 | `#/gacha` |
| 설정 | `#/settings` |

## Implemented Journey Checkpoints

통합 과정 `J1-J5`는 실제 여행 동선을 체크포인트로 가진다. 각 체크포인트는 장소, 연결 실전 단원, 수행 목표, 성공 기준을 포함한다.

| Journey | Checkpoints | Linked Practice Units |
| --- | --- | --- |
| J1 일본 도착일 | 4 | S7, S8, S9, S10, S14 |
| J2 관광과 식사 | 4 | S3, S18, S19, S22, S30 |
| J3 지방도시 여행 | 4 | S24, S25, S32, S39 |
| J4 문제 발생일 | 4 | S34, S35, S36, S37, S40 |
| J5 출국일 | 4 | S17, S41, S42, S43 |

통합 lesson은 preview 다음에 checkpoint 카드와 mission drill 카드를 보여준 뒤 핵심 표현, 기본 대화, 분기, 역할극, 퀴즈, 듣기로 이어진다.

## Implemented Mission Drills

각 체크포인트는 연결된 실전 단원의 핵심 표현을 드릴 카드로 가진다.

예: `J1 일본 도착일`

1. 입국심사 통과: S7 `観光です。`
2. 짐과 세관 확인: S8 `荷物が出てきません。`
3. 공항에서 이동 시작: S9 `電車の乗り場はどこですか。`, S10 `ICカードを買いたいです。`
4. 호텔 체크인: S14 `チェックインをお願いします。`

이로써 통합 미션은 단순 안내가 아니라 실제 여행 순서대로 말할 문장을 복습하는 구조가 된다.

## Implemented QA

`scripts/audit-content.ts`로 전체 콘텐츠를 자동 점검한다.

| Check | Scope |
| --- | --- |
| 선행 학습 규칙 | quiz의 `requiredExpressionIds`가 같은 세션에서 먼저 등장하는지 확인 |
| 카드 흐름 | 준비/기초 11장, 입문 7장, 중급 9장, 고급 11장 기준 확인 |
| 통합 미션 순서 | checkpoint와 missionDrill이 쌍으로 반복되는지 확인 |
| 빈 드릴 | missionDrill에 연결 표현이 없는지 확인 |
| 역할 혼선 | 여행자 표현에 직원 안내식 문장이 섞였는지 간단 패턴으로 확인 |

현재 결과는 `docs/content-qa.md`에 저장된다.

`scripts/audit-assets.ts`는 단원 이미지, 빠른 연습 이미지, 도감 보상 이미지의 누락과 도감 이미지 중복을 확인한다. 현재 결과는 `docs/assets-qa.md`에 저장된다.

`scripts/audit-resources.ts`는 `mungyang/public`의 리소스 배치 방식이 실제 파일이든 개발용 링크든 상관없이, 런타임에 필요한 public 리소스가 읽히는지 확인한다. 현재 결과는 `docs/resource-links.md`에 저장된다.

`scripts/audit-audio.ts`는 현재 세션 문장 기준으로 음성 연결과 누락 음성 수를 계산한다. 현재 결과는 `docs/audio-missing.md`와 `docs/audio-missing.json`에 저장된다.

`npm test`는 SRS 진행 상태와 해시 라우팅의 핵심 순수 함수를 검증한다.

## Implemented Build Pruning

`public/audio`는 기존 앱의 전체 음성 폴더를 가리키지만, production build에서는 실제 세션에 연결된 음성만 `dist/audio`로 복사한다.

현재 빌드 결과:

| Area | Result |
| --- | ---: |
| Required session texts | 209 |
| Connected audio | 209 |
| Missing audio | 0 |
| `dist/audio` after pruning | 3.8MB |
| Full `dist` | 16MB |

## Implemented Debug Setting

상단 `설정` 메뉴에 `접근 제한 해제`를 추가했다. 이 옵션을 켜면 제작 확인 중 선행 단원 완료 없이 모든 단원 상세와 세션을 열 수 있다. 실제 학습 진행 데이터와 보상 획득은 기존 완료 흐름을 따른다.

## Implemented Audio Generation

`docs/audio-missing.json` 기준으로 누락 음성 147개를 Azure Speech `ja-JP-NanamiNeural`로 생성했다. 생성 결과 전체 세션 문장 209개가 모두 `/audio/manifest.json`에 연결된다.

새 누락 음성이 생기면 다음 순서로 처리한다.

1. `npm run check`로 `docs/audio-missing.json`을 갱신한다.
2. `npm run audio:missing`으로 누락 음성을 생성한다.
3. `npm run check`와 `npm run build`로 연결과 배포 중량을 확인한다.
