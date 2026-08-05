# 마스코트 재생성 프롬프트 — 3D 플러시 → 애니 작화

> 2026-08-06 작성. [`docs/ART_DIRECTION.md`](../ART_DIRECTION.md)에서 정한 "애니 작화로 통일"
> 방침의 1순위 작업. 마스코트 9장은 장수는 적지만 브랜드 인상을 가장 크게 좌우한다.
>
> 아래 프롬프트는 영어로 그대로 복사해 쓰면 된다. 각 프롬프트는 **공통 스타일 블록 + 캐릭터
> 시트 + 개별 지시**로 구성돼 있으므로, 세 덩어리를 순서대로 이어 붙여 한 번에 입력한다.

---

## 0. 작업 전 반드시 확인할 기술 제약

| 항목 | 값 | 왜 |
|---|---|---|
| 크기 | **1254 × 1254 정사각** | 기존 9장 전부 이 크기. 코드가 정사각 가정으로 렌더 |
| 배경 | **완전 투명 (알파 채널 필수)** | 9장 모두 알파 있음. 배경이 있으면 카드·말풍선 위에서 사각형이 그대로 보인다 |
| 포맷 | WebP (투명 유지) | 기존과 동일 |
| 여백 | 캐릭터가 캔버스에 꽉 차지 않게 상하좌우 5~8% 여백 | 코드가 `objectFit: contain`으로 축소 렌더하므로 |

### `yangmung-duo-logo.webp`만 추가 제약 — **실루엣이 그대로 마스크가 된다**

`src/styles/app.css`의 `.ym-mback-mascot`이 이 파일을 **CSS mask**로 쓴다. 즉 색은 전부 버려지고
**알파 채널(실루엣)만** 남아 그라데이션으로 채워진다.

```css
-webkit-mask: url('/mascots/yangmung-duo-logo.webp') center / contain no-repeat;
```

따라서 이 한 장은:
- 두 캐릭터 실루엣이 **서로 겹치거나 붙어서 하나의 덩어리로 읽혀야** 한다(떨어져 있으면 마스크가 두 조각으로 쪼개져 보인다).
- 실루엣 내부에 **투명한 구멍이 생기지 않게** 한다(팔과 몸 사이 빈 공간 등 — 작은 구멍은 축소 시 지저분해진다).
- 가는 선(수염·목줄 끈)은 **최소화**한다. 마스크에서는 얇은 선이 끊겨 보인다.

---

## 1. 공통 스타일 블록 (모든 프롬프트 앞에 붙인다)

```
Style: 2D Japanese cel-shaded anime illustration. Clean confident line art with
slightly varied line weight, flat color fills, soft cel shadows with hard edges.
Modern anime production quality — think a polished TV anime key visual, not a
children's sticker.

Absolutely avoid: 3D rendering, plush/felt/fabric texture, glossy specular
highlights, plastic or vinyl material, blob-like toy proportions, oversized
glittering doll eyes, candy-color pastel palette, airbrush gradients on fur.

Color: muted, natural palette. Warm but not oversaturated. Shadows use a slightly
cooler hue rather than pure grey.

Background: fully transparent. No ground shadow, no backdrop, no frame.
Canvas: 1254 x 1254 square, character centered with 5-8% margin on all sides.
```

---

## 2. 캐릭터 시트 (모든 프롬프트에 붙인다 — 두 캐릭터의 동일성 유지가 핵심)

```
CHARACTER SHEET — keep these traits identical across every image.

YANG (양) — female calico cat, the precise/explanatory coach.
- Calico coat: white face and chest, orange and dark-charcoal patches over the
  head and ears, orange-and-charcoal ringed tail.
- Large teal-blue eyes with visible upper lashes. Small pink nose.
- Accessories (YANG ONLY): pale blue flower hairpin with a small pearl on the
  LEFT side of her head; pale blue sakura-pattern neckerchief tied at the side;
  cream-and-pale-blue crossbody satchel with a small gold flower clasp.
- Motifs reserved for Yang: flowers, sakura, pearl, soft blue.

MUNG (뭉) — MALE shiba inu, the encouraging/recovery coach.
- Shiba coat: orange-tan back and head, cream muzzle, chest, and inner legs,
  two small cream spots above the eyes, curled cream-tipped tail.
- Round dark-brown eyes. Black nose. Open friendly smile.
- Accessories (MUNG ONLY): sage-green neckerchief with a subtle seigaiha
  (wave) pattern, secured by a brown leather ring, with a small wooden paw-print
  tag hanging from it.
- Motifs reserved for Mung: waves/seigaiha, leather, wood, sage green.

CRITICAL — Mung is male. Never give Mung floral patterns, ribbons, pearls, hair
accessories, skirts, or apron dresses. Yang and Mung must be immediately
distinguishable by outfit alone, not just by species.

Proportions: chibi-leaning but not blob-like — roughly 2.5 heads tall, standing
upright on hind legs, with visible neck and defined limbs.
```

---

## 3. 개별 프롬프트 9장

### 3-1. `yangmung-duo-logo.webp` — 로고 (마스크로도 쓰임, 가장 중요)

```
Yang and Mung standing side by side, both facing forward, full body, feet on the
same invisible line. Yang on the LEFT waving one front paw up; Mung on the RIGHT
standing confidently with one paw raised in a small wave. Both smiling warmly.

IMPORTANT SILHOUETTE REQUIREMENT: the two characters must touch or slightly
overlap so their combined outline reads as ONE connected shape. Do not leave a
gap between them. Avoid thin isolated details (loose straps, stray whiskers) and
avoid enclosed holes between arms and body — this artwork is also used as an
alpha mask where only the outline survives.
```

### 3-2. `yangmung-duo-done.webp` — 세션 완료·승급 축하

```
Yang and Mung celebrating a finished lesson together, full body, side by side.
Yang has both front paws raised in a cheerful cheer; Mung is mid-happy-hop with
his tail up. Both eyes bright and mouths open in a genuine laugh. Confident,
warm, congratulatory mood. No confetti, no text, no props — expression and pose
carry the celebration.
```

### 3-3. `yang-cat-face.webp` — 양 기본 얼굴 (설명 코치)

```
Yang alone, upper body only (head, chest, and one raised front paw), facing
slightly toward the viewer. Friendly attentive expression with a small open
smile, as if about to explain something. One paw raised in a light greeting.
Her neckerchief and the top of her satchel strap are visible. No props in hand.
```

### 3-4. `yang-tip.webp` — 양, 팁 알려주기

```
Yang alone, upper body, holding up ONE index-finger-like raised paw in a
"here's a tip" gesture, with a bright knowing smile and slightly tilted head.
Her other paw holds a plain blank cream card with a thin border (no text, no
symbol on it — the app overlays content). Teaching, helpful mood.
```

### 3-5. `yang-loading.webp` — 양, 준비 중

```
Yang alone, upper body, looking down at a small neat stack of plain blank cards
she is sorting with both paws — as if preparing today's lesson. Calm, focused,
slightly cheerful expression, eyes lowered toward the cards. Cards are plain
cream with a thin border, no text or symbols.
```

### 3-6. `mung-shiba-face.webp` — 뭉 기본 얼굴 (응원 코치)

```
Mung alone, upper body (head, chest, one front paw), facing slightly toward the
viewer with a big open friendly smile and tongue slightly showing. Relaxed,
encouraging, approachable. His sage-green neckerchief with the leather ring and
wooden paw tag is clearly visible. No props in hand.
```

### 3-7. `mung-correct.webp` — 뭉, 정답 축하

```
Mung alone, upper body, delighted — eyes happily curved, big open smile, one paw
thrown up in a triumphant cheer. His other paw holds a small cream card showing
a simple green circle mark (○). Proud, congratulatory energy, as if saying
"you got it!".
```

### 3-8. `mung-wrong.webp` — 뭉, 오답 위로

```
Mung alone, upper body, with a gentle apologetic expression — eyebrows angled up
in sympathy, small closed mouth, one paw raised near his cheek in a soft
"ah, close one" gesture. His other paw holds a small cream card showing a simple
muted red X mark. IMPORTANT: the mood is warm and reassuring, never scolding,
disappointed, or sad. He is comforting the learner, not judging them.
```

### 3-9. `mung-recovery.webp` — 뭉, 다시 해보기 권유

```
Mung alone, upper body, cheerful and motivating with an open encouraging smile.
One paw holds up a small round cream token showing a simple sage-green circular
"retry" arrow. The other paw holds a plain blank cream card. Mood: "let's try
that one again" — upbeat and supportive, forward-leaning posture.
```

---

## 4. 생성 후 체크리스트

- [ ] 9장 모두 1254×1254, 배경 완전 투명
- [ ] 뭉에게 꽃무늬·리본·진주·머리핀이 **하나도** 없는지
- [ ] 양·뭉을 나란히 놓았을 때 의상만으로 구분되는지
- [ ] 9장의 눈 크기·머리 비율·선 굵기가 서로 일치하는지 (한 캐릭터로 보이는지)
- [ ] `yangmung-duo-logo.webp`를 흑백 실루엣으로 변환했을 때 하나의 덩어리로 읽히는지
      — 이게 실제 마스크 결과다. 쪼개지거나 구멍이 뚫리면 다시 만든다
- [ ] 카드·토큰에 글자가 들어가지 않았는지 (앱이 내용을 얹으므로 빈 카드여야 함)
- [ ] 교체 후 브라우저에서 홈·세션·완료·승급 화면 육안 확인

## 5. 교체 방법

파일명을 그대로 유지해 `public/mascots/`에 덮어쓰면 코드 수정 없이 반영된다.
