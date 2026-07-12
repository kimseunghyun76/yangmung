# mungyang

일본 여행 회화 학습 앱 재설계 버전입니다. `yangmung`의 기존 이미지, 마스코트, 도감, 오디오 리소스를 재사용하면서 `준비 → 기초 → 실전 → 통합 → 복습 → 도감` 흐름으로 다시 구성했습니다.

## Run

```bash
npm run dev -- --port 5175
```

현재 확인 URL은 `http://127.0.0.1:5175/`입니다.

## Checks

```bash
npm run check
npm test
npm run build
```

`npm run check`는 콘텐츠, 자산, 오디오 연결 현황을 점검합니다.

`npm run build`는 production build 후 `scripts/prune-dist-audio.ts`를 실행해 실제 세션에서 쓰는 음성만 `dist/audio`에 복사합니다.

## Current Coverage

| Area | Status |
| --- | --- |
| Units | 61/61 lesson 연결 |
| 실전 난이도 | S1-S43 입문, 중급, 고급 분기 |
| 통합 미션 | J1-J5 체크포인트와 미션 드릴 |
| 라우팅 | `#/prep`, `#/review`, `#/settings` 해시 딥링크 |
| SRS 복습 | 퀴즈 결과 기반 예약 복습 큐 |
| 도감 보상 | 61개 보상, 이미지 누락 0, 중복 0 |
| 음성 연결 | 209개 필요 문장 중 209개 연결 |
| 테스트 | 2개 파일, 6개 테스트 |
| 남은 음성 생성 | 0개 |
| Build size | `dist` 약 16MB |

## Debug

상단 `설정` 메뉴의 `접근 제한 해제`를 켜면 선행 단원 완료 없이 모든 단원을 열 수 있습니다. 실제 학습 순서는 그대로 유지되고, 제작 확인용 로컬 상태에만 저장됩니다.

## Reports

- `docs/content-qa.md`: 카드 흐름, 퀴즈 선행 학습, 역할 혼선 검사
- `docs/assets-qa.md`: 단원 이미지, 빠른 연습 이미지, 도감 이미지 누락/중복 검사
- `docs/resource-links.md`: 개발 중 재사용하는 `yangmung` 리소스 링크 상태
- `docs/audio-missing.md`: 음성 연결 현황
- `docs/audio-missing.json`: TTS 작업용 누락 음성 JSON, 현재 누락 0개
- `docs/build-asset-report.md`: 배포 자산 중량 개선 결과
