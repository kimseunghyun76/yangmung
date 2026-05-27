# yangmung

> 성인용 발달식 일본어 학습 앱 — 일본 여행에서 얼어붙지 않게.

## 한 줄

한국어만 아는 성인이 **일본 여행의 일상 미션**(편의점·식당·전철 등)을 *얼어붙지 않고* 완수하게 만든다. JLPT N5는 덤.

## 왜 다른가

| 축 | 보통 앱 | yangmung |
|----|---------|----------|
| 입력 순서 | 알파벳·문법 우선 | **발달식**(고빈도·정서밀착·상황 우선) |
| 평가 모드 | 4지선다 매칭 | **상황 행동 + 복구(Recovery) 스킬** |
| 못 알아들었을 때 | 실패 | **복구 4종 = 보조 바퀴** (다시/천천히/쉽게/보여줘) |
| 정답 처리 | "맞음/틀림" | **첫시도 3★ / 복구 2★ / Fallback 1★** |
| 학습 누적 | 한 번 보고 끝 | **약점 자동 재출제 + 익숙 잠시 제외** (LocalStorage SRS) |

## 학습 구조 (3트랙 + 가로축 2)

- **Track K** 가나 자동화 (K1~K11)
- **Track B** 발달식 언어 입력 (B0~B5, 성인 Can-do)
- **Track C** 여행 응용 미션 (C0~C7, 편의점·식당·전철·…)
- *N5 Coverage* — 트랙이 아니라 가로지르는 측정 태그 (덤)
- *Recovery* — 트랙이 아니라 모든 미션에 짜이는 명시 스킬

## 현재 범위 (MVP)

- Phrase **55** / KanaItem **8** / Unit **8** / Mission **4** (C0 인사 · C1 편의점 · C2 식당 · C3 전철)
- 슬라이스 **14카드**: 가나 드릴 → 듣기 모드 → 미션 분기 → 정확성 팁
- 검증 하니스 **V1~V19** 동작 (콘텐츠 무결성 빌드 차단)
- SRS: 약점 우선 재출제, 익숙(2회 연속 첫시도 정답)은 2세션 잠시 제외, LocalStorage 누적

## 로컬 실행

```bash
npm install
npm run dev    # http://localhost:5173
```

## 검증 (콘텐츠 변경 시 권장)

```bash
npm run lint:content   # V1~V19 빌드 게이트 (실패 시 exit 1)
npm run test:content   # 위반 검출 17/17 케이스
npm run typecheck      # tsc --noEmit
npm run build          # 프로덕션 빌드 (tsc + vite)
```

## 배포 (Vercel)

```bash
npx vercel              # 첫 배포 (로그인 후 directory 확인)
npx vercel --prod       # 프로덕션
```

Vite SPA — 별도 설정 없이 동작. 환경변수 없음.

## 콘텐츠 추가

1. `src/content/phrases.ts` 또는 `missions.ts`에 항목 추가
2. `src/content/units.ts`의 적절한 Unit `newPhraseIds`에 등록 (V19 강제)
3. `npm run lint:content` 통과 확인
4. 필요 시 `src/content/validate.test.ts`에 새 케이스 추가

스키마 단일 소스는 [`CONTENT_SCHEMA.md`](./CONTENT_SCHEMA.md).

## 기술 스택

React 18 · Vite 6 · TypeScript 5 · LocalStorage SRS · Web Speech API (TTS 폴백)

오디오 자산은 후행 — 현재는 브라우저 TTS(ja-JP)로 듣기 루프 확보.

## 설계 문서

- [`PRD.md`](./PRD.md) — 방향·철학 (v0.4)
- [`PROPOSAL.md`](./PROPOSAL.md) — 빌드 제안서 (외부 토론용)
- [`CONTENT_SCHEMA.md`](./CONTENT_SCHEMA.md) — 타입·검증 SSOT

## 로드맵 (다음)

- [ ] TTS 핵심 표현 사전 mp3 (Azure 파이프라인, 음질 격상)
- [ ] 60→200 phrase 점진 확장 (author-time AI 가속)
- [ ] 새 미션 C4~C7 (호텔·길찾기·쇼핑·응급)
- [ ] AI 회화 파트너 (runtime LLM, 우리 미션 스키마가 가드레일)
