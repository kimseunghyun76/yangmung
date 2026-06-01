# yangmung 에셋 생성 명세 (Codex용)

이 문서는 yangmung(일본어 여행 학습 앱)의 **커스텀 아이콘 세트 + 장면 일러스트**를
생성하기 위한 작업 명세다. 현재 앱은 시스템 이모지(🏪🍜🎧 등)를 쓰는데, 플랫폼마다
모양이 달라 디자인 톤이 깨진다. 아래 톤에 맞춰 **일관된 자체 아이콘/일러스트**로 교체한다.

---

## 0. 디자인 톤 (반드시 준수)

- 컨셉: **뉴트로 일본 + 절제된 럭셔리**. 차분하고 고급스럽게. 만화풍·유아틱 금지.
- 라인: 가는~중간 두께의 모노라인(선) 아이콘. 과한 디테일·그라데이션 지양.
- 모서리: 둥근 라인 캡/조인(rounded). 코너 반경은 부드럽게.
- 팔레트 (CSS 변수와 동일해야 함):
  - 먹빛 ink: `#16171c` (라이트) / `#f1f2f5` (다크)
  - 액센트(토리이 레드) accent: `#b23b32` (라이트) / `#e2655a` (다크)
  - 보조 표면: `#f6f6f4`(라이트 bg) / `#0e0f13`(다크 bg), 카드 `#ffffff` / `#17181e`
  - 성공 ok: `#2e8b57`, 경고 warn: `#b5791f`
- **아이콘은 단색 currentColor 기반**으로 그려서, 코드에서 색을 주입해 주/야간·액센트에
  자동 대응하게 한다. (즉 SVG 내부에 색 하드코딩 금지, `fill="currentColor"`/`stroke="currentColor"`)
- 일러스트(장면 hero)는 위 팔레트 안에서 2~3색 제한 플랫 일러스트. 배경 투명.

---

## 1. 산출물 A — 커스텀 아이콘 세트 (SVG, 단색 currentColor)

형식: **SVG, 24×24 viewBox, stroke 기반(권장 stroke-width 1.75), `stroke="currentColor"` 또는
`fill="currentColor"`**. 배경 투명. 여백(트림) 24그리드 안에서 1.5~2px.
출력 경로: `public/icons/<name>.svg`

### 1-1. 네비게이션/시스템
| name | 대체 이모지 | 개념 |
|---|---|---|
| `nav-home` | 🏠 | 집 |
| `nav-map` | 🗺 | 지도(접힌 종이지도) |
| `nav-review` | 📚 | 책/복습 |
| `nav-guide` | ❓ | 물음표 원 |
| `nav-settings` | ⚙️ | 톱니 |
| `theme-day` | ☀️ | 해 |
| `theme-night` | 🌙 | 달 |
| `back` | ← | 왼쪽 화살표 |

### 1-2. 학습/카드 타입
| name | 대체 | 개념 |
|---|---|---|
| `target` | 🎯 | 과녁(오늘 목표) |
| `kana` | 🔤 | 가나 글자(あ 모티브) |
| `sign` | 🏯 | 간판/표지판 |
| `dictation` | ✏️ | 연필/쓰기 |
| `listen` | 🎧 | 헤드폰 |
| `speak` | 🗣 | 말풍선+입 |
| `discover` | 👀✨ | 반짝이는 눈/발견 |
| `tip` | 💡 | 전구 |
| `flow` | 🧭 | 나침반/흐름 |
| `recovery` | 🛟 | 구명튜브(막혔을 때) |

### 1-3. 상태
| name | 개념 | 권장 색(코드에서 주입하되 의미색 허용) |
|---|---|---|
| `check` | 정답 체크 | ok |
| `cross` | 오답 X | accent |
| `star` | 별점 | warn |
| `trophy` | 완료 트로피 | warn |

### 1-4. 장면 미니 아이콘 (홈 "장면별 연습"·지도·복습 칩에서 24px로)
아래 14개. 라인 모노 아이콘.
| name | 장소 | 개념 |
|---|---|---|
| `scene-store` | 가게(튜토리얼) | 쇼핑백 |
| `scene-conbini` | 편의점 | 편의점 건물/계산대 |
| `scene-restaurant` | 식당 | 라멘 그릇/젓가락 |
| `scene-train` | 전철 | 전철 정면 |
| `scene-hotel` | 호텔 | 호텔/벨 |
| `scene-street` | 거리 | 나침반/표지 |
| `scene-pharmacy` | 약국 | 십자/약 |
| `scene-shopping` | 쇼핑·면세 | 태그/가격표 |
| `scene-taxi` | 택시 | 택시 정면 |
| `scene-airport` | 공항 | 비행기 |
| `scene-exchange` | 환전 | 엔화/동전 |
| `scene-locker` | 코인로커 | 자물쇠/로커 |
| `scene-delivery` | 택배 | 상자 |
| `scene-ramen` | 라멘 | 라멘 그릇(어묵 무늬) |

---

## 2. 산출물 B — 장면 일러스트 (hero/thumb)

각 "장면(미션)"의 입장 화면(인트로)·홈/지도 썸네일에 쓸 플랫 일러스트.
- `hero`: 인트로 상단 가로 배너. **권장 1200×480 (2.5:1)**, PNG(투명 배경) 또는 SVG.
- `thumb`: 홈/지도 카드 좌측 썸네일. **권장 96×96**, 동일 톤.
- 2~3색 플랫, 위 팔레트. 인물 묘사는 단순 실루엣 수준(과한 캐릭터 금지).
- 출력: `public/scenes/<id>-hero.png`, `public/scenes/<id>-thumb.png`

대상 장면 id (14): `c0 가게`, `c1 편의점`, `c2 식당`, `c3 전철`, `c4 호텔`,
`c5 거리`, `c6 약국`, `c7 쇼핑`, `c8 택시`, `c9 공항`, `c10 환전`, `c11 코인로커`,
`c12 택배`, `c13 라멘`.

예시 컨셉:
- 편의점: 유리문 안 계산대 + 노렌, 차분한 야간 네온 한 점(액센트)
- 전철: 플랫폼에 들어오는 전철 정면 + 노란 점자블록
- 라멘: 김 나는 라멘 그릇 + 식권기 실루엣

---

## 3. 산출물 C — 앱 아이콘 / 완료 연출

- `app-icon`: iOS 홈 화면 아이콘. 1024×1024 PNG, 둥근사각은 OS가 처리하므로 **풀블리드**(여백 X).
  컨셉: 먹빛 바탕 + 朱 액센트의 「あ」 또는 도장(印) 모티브.
- `favicon`: 32×32, 180×180(apple-touch-icon).
- `celebrate`: 완료 화면 축하 일러스트(선택). 480×480 투명 PNG/SVG. 현재는 이모지+CSS 색종이로 대체 중.

---

## 4. 기술 규격 요약

- 아이콘: SVG, `viewBox="0 0 24 24"`, `currentColor`, stroke-width ~1.75, 배경 투명.
- 일러스트/썸네일: PNG(투명) 또는 SVG. 래스터면 @2x·@3x도 함께(`name@2x.png`).
- 파일명: 케밥케이스, 위 표의 `name` 그대로.
- 출력 디렉터리:
  - 아이콘 → `public/icons/`
  - 장면 일러스트 → `public/scenes/`
  - 앱 아이콘 → `public/` (app-icon.png, apple-touch-icon.png, favicon.ico)
- 색 하드코딩 금지(아이콘). 일러스트만 팔레트 내 색 허용.

---

## 5. 코드 연동 (생성 후 적용 지점)

1. **아이콘 레지스트리**: `src/ui/icons.tsx` 를 만들어 `<Icon name="nav-home" />` 형태로
   SVG를 인라인/`<img>`로 로드. `color`는 부모 `currentColor` 상속.
   - 교체 대상: `NavBar`(이모지→nav-*), `Home`/`Map`/`Review`의 이모지, 카드 타입 헤더,
     `scene.ts`의 `emoji` 필드 → 아이콘 name 매핑.
2. **장면 일러스트**: `src/content/missions/*.ts` 의 `mission.visual` 슬롯에 채운다.
   ```ts
   visual: { thumb: '/scenes/c1-thumb.png', hero: '/scenes/c1-hero.png' }
   ```
   - `src/views/scene.ts` 의 `sceneVisualByMission` 이 이미 `hero`/`thumb`를 읽도록 설계됨.
   - `Intro.tsx` 는 `sv.hero` 있으면 이미지 렌더(폴백: 이모지). `Home`/`Map` 썸네일은
     `sv.thumb` 사용하도록 소폭 수정 필요(현재 emoji 배지).
3. **앱 아이콘**: `index.html` 에 `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
   `<link rel="icon" href="/favicon.ico">` 추가.

---

## 6. 인수 체크리스트 (Codex 완료 기준)

- [ ] 1-1~1-4 아이콘 전부 `public/icons/` 에 SVG로, currentColor 단색, 24그리드
- [ ] 14개 장면 hero/thumb `public/scenes/` 에
- [ ] app-icon / apple-touch-icon / favicon
- [ ] 라이트/다크 양쪽에서 아이콘이 currentColor로 또렷이 보임(대비 확인)
- [ ] 톤 일관: 모노라인·럭셔리·팔레트 준수, 유아틱·과채도 없음
- [ ] (연동은 앱 코드 측에서 진행 — 이 문서 §5 참고)
