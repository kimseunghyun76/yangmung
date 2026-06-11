# yangmung Visual Asset Workflow

> 목적: 지금까지 진행한 **장면 배경 이미지**, **마스코트**, **가챠 박스/카드/이펙트**, **스피드 퀴즈 이펙트** 작업의 의도와 구현 방식을 남긴다.
> 후속 작업자는 이 문서를 기준으로 에셋을 추가·교체하되, 오래된 브리프와 현재 구현이 다를 수 있음을 주의한다.

---

## 1. 관련 문서 상태

이미 있는 문서:

- `SCENE_PHOTO_REGEN_BRIEF.md`
  - 현재 기준으로 유효하다.
  - C1~C40 장면 배경 생성 기준이다.
- `GACHA_DECKS_DESIGN.md`
  - 가챠 시스템의 큰 설계와 윤리 기준은 유효하다.
  - 다만 “14장면” 같은 초안 표현은 현재 40장면으로 확장되었으므로 숫자는 코드 기준을 따른다.
- `GACHA_ASSETS_BRIEF.md`
  - 초기 에셋 명세다.
  - 현재 최종 방향과 일부 다르다. 특히 “절제·네온 금지·보석함 느낌”에서, 이후 사용자 피드백으로 **일본 만화책 같은 2D 게임 감성의 유메박스** 쪽으로 바뀌었다.
- `ASSETS_BRIEF.md`
  - 일반 앱 에셋 명세로 참고 가능.
- `MASCOT_DIRECTION.md`
  - yang/mung 캐릭터 역할과 등장 위치 기준으로 유효하다.

이 문서가 정리하는 최종 기준:

- 장면 배경: **실사 느낌 + 파스텔 색보정 + 일본 현지 대화 상황 + 사람이 등장**
- 마스코트: **파스텔 톤의 귀여운 고양이 yang / 시바견 mung**
- 가챠: **2D 일본 만화책/게임 감성, 중국풍 금상자 금지, 카드게임식 뒤집기와 희귀도 연출**
- 스피드 퀴즈: **화면을 시원하게 쓰는 콤보/히트 이펙트**

---

## 2. 장면 배경 이미지

### 현재 산출물

경로:

```text
public/scenes/generated/c1-conbini-bg.webp
...
public/scenes/generated/c40-fashion-checkout-bg.webp
```

총 40개 장면 배경이 있다. 모든 장면은 기존 파일명을 유지한다. 코드에서는 `src/views/scene.ts`의 scene visual 매핑을 통해 사용된다.

### 최종 의도

배경은 “예쁜 풍경”이 아니라 **일본어를 실제로 쓰는 상황**을 보여줘야 한다.

좋은 예:

- 편의점 계산대에서 점원과 여행자가 대화
- 식당에서 직원이 주문을 받는 순간
- 호텔 프런트에서 체크인/우산/방 변경을 상담
- 공항 카운터에서 수하물 문제를 설명
- 회전초밥집에서 직원이 터치패널 사용법을 설명

피해야 할 것:

- 사람이 없는 빈 실내
- 관광 사진처럼 대화 상황이 없는 풍경
- 애니/일러스트/3D 렌더처럼 보이는 이미지
- 중국풍 장식, 과한 붉은 금장식
- 읽을 수 있는 실제 브랜드 로고
- 의미 없는 깨진 텍스트가 크게 보이는 간판
- 너무 어둡거나 UI 텍스트가 안 보이는 배경

### 생성 프롬프트 기준

`SCENE_PHOTO_REGEN_BRIEF.md`의 템플릿을 따른다.

핵심 문장:

```text
Photorealistic Japanese travel conversation scene for a mobile language learning app.
Show Japanese staff/local and a Korean adult traveler/customer having a natural short conversation.
Soft pastel color grading over realistic photography.
Leave lower third slightly darker and uncluttered for UI text overlay.
No logos, no readable brand names, no illustration, no anime, no 3D render, no Chinese-style decor.
```

중요한 해석:

- “파스텔 톤”은 일러스트풍이 아니라 **실사 사진에 파스텔 컬러 그레이딩을 얹는 것**이다.
- 사람은 장식이 아니라 **대화의 증거**다. 최소 일본 현지 직원/로컬 1명 + 여행자/고객 1명이 자연스럽게 상호작용해야 한다.
- 하단에는 세션/홈 UI가 올라오므로 너무 복잡한 물체를 두지 않는다.

### 검수 방식

교체 후 반드시 전체 contact sheet를 만들어 확인한다.

검수 기준:

- C1~C40 전체가 보이는가
- 모든 이미지에 사람이 있는가
- 대화/서비스 상황이 보이는가
- 실사 느낌인가
- 앱 하단 글래스 시트와 충돌하지 않는가
- 라이트/다크에서 너무 튀지 않는가

---

## 3. 마스코트 이미지

### 캐릭터 정의

- `yang`: 일본 고양이. 설명, 힌트, 정확성 코치.
- `mung`: 시바견. 응원, 복구, 정답/오답 반응.
- `duo`: 둘이 함께 있는 로고/완료/특별 보상용.

### 현재 산출물

경로:

```text
public/mascots/yang-cat-face.webp
public/mascots/yang-tip.webp
public/mascots/yang-loading.webp
public/mascots/mung-shiba-face.webp
public/mascots/mung-correct.webp
public/mascots/mung-wrong.webp
public/mascots/mung-recovery.webp
public/mascots/yangmung-duo-logo.webp
public/mascots/yangmung-duo-done.webp
```

연동:

- `src/views/mascot.tsx`

### 최종 톤

- 너무 유아용 캐릭터처럼 가지 않는다.
- 하지만 작은 영역에서는 즉시 귀엽게 보여야 하므로 얼굴 중심 구도.
- 파스텔 톤, 둥근 앱 아이콘 느낌, 부드러운 3D-soft illustration.
- yang은 반드시 고양이처럼 보여야 한다. 이전에 yang이 강아지처럼 생성된 문제가 있었으므로 귀/수염/코/얼굴형을 확인한다.
- mung은 시바견으로 명확해야 한다.

### 생성 프롬프트 기준

yang:

```text
Very cute pastel realistic 3D-soft illustration of a Japanese cat mascot named yang.
Close-up face, triangular ears, whiskers, big glossy eyes, tiny pink nose.
Clearly a cat, not a dog, not a Shiba Inu.
Rounded mobile app icon composition, no text, no logo.
```

mung:

```text
Very cute pastel realistic 3D-soft illustration of a Shiba Inu dog mascot named mung.
Close-up face, warm tan fur, round eyes, friendly smile.
Clearly a Shiba Inu dog, not a cat.
Rounded mobile app icon composition, no text, no logo.
```

duo:

```text
Pastel app logo illustration with the Japanese cat yang and Shiba Inu mung together.
Both faces visible, close-up, cute but clean for adult language learners.
No text, no watermark.
```

---

## 4. 가챠 시스템 이미지와 애니메이션

### 현재 구현 위치

핵심 파일:

```text
src/views/Gacha.tsx
src/learn/collection.ts
src/learn/gachaItems.ts
index.html
```

현재 실제 에셋:

```text
public/gacha/box/yumebox-closed-manga.webp
public/gacha/box/yumebox-manga.webp
public/gacha/fx/merge-burst.png
public/gacha/item/scene-shard.webp
public/gacha/item/new-expression-card.webp
public/gacha/item/level-up-token.webp
public/gacha/items/ramen-rarity-reference.png
```

주의:

- `public/gacha/item/*.webp`는 초기 보상 아이템 계열이다.
- 현재 카드 안의 등급별 아이템 비주얼은 대부분 별도 이미지가 아니라 `index.html`의 CSS shape와 `src/learn/gachaItems.ts`의 메타데이터로 만든다.
- `ramen-rarity-reference.png`는 “등급별 아이템 컨셉” 참고용 이미지다. 런타임 핵심 에셋은 아니다.

### 최종 가챠 방향

초기에는 보석함/프레임 중심이었지만, 피드백 후 방향이 바뀌었다.

현재 목표:

- 중국풍 보물상자 금지
- 서양 판타지 보물상자 금지
- 일본 만화책/게임 같은 2D 박스
- 포켓몬/드래곤볼식 “기분 좋은 카드 오픈” 감성은 참고하되 직접적인 IP 모방은 금지
- 실사 아이템보다 **게임 카드용 파스텔 일러스트/아이콘** 감성
- 은/금/다이아는 뒷면부터 번쩍거려야 한다
- 금/다이아는 단독 공개 시 더 길고 화려한 spotlight 연출
- 한번에 보기에서는 골드/다이아 spotlight를 먼저 보여준 뒤 나머지를 펼치는 흐름

### 박스 연출

구현:

- `GachaBox`
- `BoxArt`
- CSS class:
  - `.ym-gacha-stage`
  - `.ym-yumebox`
  - `.ym-gacha-box-hit`
  - `.ym-gacha-box-ready`
  - `.ym-gacha-shockwave`
  - `.ym-gacha-rays`
  - `.ym-gacha-runes`

동작:

1. 완료 화면에서 가챠 박스가 등장한다.
2. 사용자가 박스를 연속 탭할 수 있다.
3. 탭할 때마다 박스가 회전/흔들림.
4. 연속으로 많이 누르면 더 빠르게 열리는 느낌을 준다.
5. 5초가 지나면 자동으로 열린다.
6. 열린 뒤 카드 더미가 나온다.

의도:

- “탭해서 바로 받기”가 아니라, 상자를 때려서 열어내는 게임적 리듬.
- 짧아야 한다. 학습 흐름을 방해하면 안 된다.
- `prefers-reduced-motion`이면 즉시 공개로 폴백한다.

### 카드 공개 방식

구현:

- `DrawCard`
- `CardBack`
- `DeckCardFace`
- CSS class:
  - `.ym-gacha-draw-card`
  - `.ym-gacha-card-back`
  - `.ym-gacha-card-pile`
  - `.ym-gacha-pile-back`
  - `.ym-gacha-opened-strip`
  - `.ym-gacha-spotlight`
  - `.ym-gacha-draw-grid.is-bulk-opening`

동작:

1. 10장 카드가 카드 더미처럼 겹쳐 보인다.
2. 기본 흐름은 한 장씩 뒤집는다.
3. 한 장을 뒤집으면 다음 카드가 나온다.
4. 은/금/다이아는 카드 뒷면부터 반짝이는 효과가 있다.
5. 금/다이아는 spotlight로 크게 보여주는 시간이 더 길다.
6. `한번에 보기`는 나머지 카드를 한 번에 펼친다.
7. 다만 금/다이아가 남아 있으면 먼저 단독 spotlight를 보여준 뒤 나머지를 펼친다.
8. 모두 열면 “오늘 얻은 카드” 요약으로 넘어간다.

의도:

- 카드게임처럼 “뒤집는 맛”을 준다.
- 희귀카드가 보이면 열기 전부터 기대감이 있어야 한다.
- 전체 공개도 가능해야 반복 피로를 줄인다.

### 카드 아이템 디자인

구현:

- `src/learn/gachaItems.ts`
- `DeckCardFace`
- CSS class:
  - `.ym-game-item-face`
  - `.ym-gacha-item-illustration`

현재 방식:

- 장면명과 rarity를 받아 `gachaItemForPlace(place, rarity)`가 카드 아이템 메타를 반환한다.
- 카드 안의 그림은 CSS motif로 만든다.
- motif:
  - `food`
  - `drink`
  - `ticket`
  - `stay`
  - `shopping`
  - `service`
  - `safety`
  - `festival`

등급별 아이템 예:

- 라멘
  - basic: 컵라멘
  - bronze: 쇼유라멘
  - silver: 미소버터라멘
  - gold: 돈코츠 차슈라멘
  - diamond: 특상 해산물라멘
- 스시집
  - basic: 계란초밥
  - bronze: 참치초밥
  - silver: 연어뱃살
  - gold: 오토로
  - diamond: 장인 오마카세

후속 작업 방향:

- 지금은 CSS motif라 장면별 고급 일러스트가 부족하다.
- 다음 에셋 확장 시에는 `public/gacha/items/<scene>/<rarity>.webp` 같은 구조로 풀 이미지 세트를 만들 수 있다.
- 단, 모든 장면 40개 × 5등급 = 200개 이미지가 되므로 우선 핵심 장면부터 확장한다.

권장 우선순위:

1. 라멘, 회전초밥, 편의점, 식당, 호텔, 전철
2. 쇼핑/편집샵, 공항/수하물, 료칸/온천
3. 나머지 장면

---

## 5. 가챠 데이터/보상 규칙

구현:

- `src/learn/collection.ts`

현재 규칙:

- 세션 완료 시 해당 세션 장면의 카드가 나온다.
- 기본 10장 드롭.
- 등급 확률:
  - 기본 50
  - 동 30
  - 은 13
  - 금 7
  - 다이아 1
- 병합:
  - 기본 30개 → 동 1개
  - 동 30개 → 은 1개
  - 은 20개 → 금 1개
  - 금 10개 → 다이아 1개
  - 다이아 100개 → 명예 트로피 1개

문장 도감 연동:

- `SCENE_SENTENCES`의 문장도 가챠 보상으로 획득된다.
- 현재 학습 모드에 따라 선호 난이도가 바뀐다.
  - 입문/가나만: level 1
  - 기본/복습: level 2
  - 중급: level 3
  - 고급: level 4
- 카드 rarity도 보조 기준으로 작동한다.
- 즉 사용자는 자기 모드에 맞는 문장을 더 먼저 모으게 된다.

주의:

- 가챠는 학습 흐름의 보상이지 학습을 대체하면 안 된다.
- 현금으로 확률 뽑기를 팔면 안 된다.
- 추후 결제가 들어간다면 “확률 구매”가 아니라 “이미 얻은 학습 콘텐츠 해제권”으로 가야 한다.

---

## 6. 스피드 퀴즈 이펙트

구현:

- `src/views/Flash.tsx`
- `index.html`

주요 CSS:

- `.ym-flash-arena`
- `.ym-speed-lines`
- `.ym-speed-combo-row`
- `.ym-combo-badge`
- `.ym-speed-timer`
- `.ym-speed-card`
- `.ym-speed-callout`
- `.ym-speed-hitfx`

의도:

- 일반 퀴즈와 다르게, 화면 전체가 “게임 모드”처럼 느껴져야 한다.
- 콤보가 쌓이면 화면 배경과 카드가 더 뜨겁게 반응한다.
- 정답/퍼펙트/오답의 피드백은 화면 중앙에 작게만 뜨는 게 아니라, 화면 전체에 선/팝/스파크가 퍼지는 느낌이어야 한다.
- 단, 텍스트 가독성을 해치면 안 된다.

연출 기준:

- `combo >= 3`이면 hot 상태.
- 시간이 적게 남으면 low 상태.
- perfect/good/miss는 별도 callout과 hitfx를 사용.
- `prefers-reduced-motion`에서는 모든 주요 애니메이션이 꺼진다.

---

## 7. 파일 경로 기준

장면 배경:

```text
public/scenes/generated/*.webp
```

마스코트:

```text
public/mascots/*.webp
```

가챠 박스:

```text
public/gacha/box/yumebox-closed-manga.webp
public/gacha/box/yumebox-manga.webp
```

가챠 단일 아이템/참고:

```text
public/gacha/item/*.webp
public/gacha/items/ramen-rarity-reference.png
```

가챠 이펙트:

```text
public/gacha/fx/merge-burst.png
```

가챠 코드:

```text
src/views/Gacha.tsx
src/learn/collection.ts
src/learn/gachaItems.ts
```

스피드 퀴즈 코드:

```text
src/views/Flash.tsx
index.html
```

장면 매핑:

```text
src/views/scene.ts
```

---

## 8. 이미지 생성 후 처리 방식

지금까지의 일반 흐름:

1. 이미지 생성 도구로 PNG 생성
2. 결과물을 눈으로 확인
3. `cwebp`로 WebP 변환
4. 기존 `public/...` 경로의 파일명에 맞춰 교체
5. contact sheet 또는 앱 화면으로 실제 렌더 확인
6. `npm run typecheck`
7. `npm run build`
8. 관련 콘텐츠 검증 실행
9. 커밋/푸시

WebP 변환 예:

```bash
/opt/homebrew/bin/cwebp -quiet -q 88 input.png -o public/scenes/generated/c31-kaiten-sushi-bg.webp
```

품질 기준:

- 배경: `q 88` 정도면 현재 앱 품질/용량 균형이 맞다.
- 마스코트: 얼굴 중심이라 512~1254px 원본을 WebP로 두면 충분하다.
- 가챠 박스: UI에서 크고 작게 모두 쓰이므로 512px 이상 권장.

---

## 9. 후속 작업자가 바꾸면 안 되는 것

- C1~C40 파일명. 코드 매핑이 이 이름을 기준으로 한다.
- 마스코트 역할.
  - yang = 설명/힌트
  - mung = 응원/복구
  - duo = 홈/완료/특별
- 가챠 보상 구조.
  - 학습으로만 획득
  - 확률 공개 가능해야 함
  - 현금 확률 뽑기 금지
- `prefers-reduced-motion` 폴백.
- 라이트/다크 양쪽에서 글래스 UI와 충돌하지 않는 대비.

---

## 10. 앞으로 남은 에셋 개선 후보

우선순위 높은 것:

1. 가챠 카드 아이템을 CSS motif에서 실제 장면별 파스텔 게임 일러스트로 확장
2. 금/다이아 전용 카드 전면 아트 강화
3. 병합 성공 이펙트 `merge-burst.png`를 현재 톤에 맞춰 더 가볍게 최적화
4. 스피드 퀴즈 perfect 콤보 전용 배경 이펙트 추가
5. 장면 배경의 일부 큰 글자/간판 깨짐이 보이면 해당 장면만 재생성

가챠 아이템 풀 이미지로 확장할 때 권장 경로:

```text
public/gacha/items/<scene-id>/<rarity>.webp
```

예:

```text
public/gacha/items/c13-ramen/basic.webp
public/gacha/items/c13-ramen/bronze.webp
public/gacha/items/c13-ramen/silver.webp
public/gacha/items/c13-ramen/gold.webp
public/gacha/items/c13-ramen/diamond.webp
```

단, 처음부터 200장을 만들지 말고 핵심 장면 5~8개에서 먼저 품질 기준을 잡는다.

---

## 11. 최종 의도 요약

yangmung의 비주얼은 “일본어 공부 앱”보다 **일본 여행 상황에 들어가는 느낌**이 우선이다.

- 배경은 실제 일본에서 사람과 부딪쳐 대화하는 순간.
- 캐릭터는 부담스럽지 않게 옆에서 도와주는 귀여운 코치.
- 가챠는 학습을 방해하지 않는 짧은 보상 의식.
- 카드와 이펙트는 수집욕을 주되, 학습 콘텐츠와 분리되지 않는다.
- 모든 시각 요소는 “일본 여행에서 실제로 말해볼 수 있겠다”는 감각으로 돌아와야 한다.
