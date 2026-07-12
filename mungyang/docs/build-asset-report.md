# Build Asset Report

## 2026-07-11

배포 빌드에서 `public/audio` 심볼릭 링크가 전체 음성 파일을 따라 복사해 `dist/audio`가 과도하게 커지는 문제를 줄였다.

## Current Build

`npm run build`는 다음 순서로 실행된다.

1. TypeScript 검사
2. Vite production build
3. `scripts/prune-dist-audio.ts`로 실제 세션에서 사용하는 음성만 `dist/audio`에 복사

## Latest Result

| Area | Before | After |
| --- | ---: | ---: |
| `dist/audio` copied audio bytes | 46,872,185 bytes | 3,537,801 bytes |
| `dist/audio` directory | 49MB | 3.8MB |
| Full `dist` directory | about 61MB | 16MB |
| Copied audio files | full source set | 209 mp3 files + manifest |

## Audio Coverage

| Metric | Count |
| --- | ---: |
| Required unique session texts | 209 |
| Connected audio | 209 |
| Missing audio | 0 |
| Coverage | 100.0% |

Audio status details are kept in `docs/audio-missing.md`.

## Guardrail

New audio generated later can stay in the source audio folder. The production build will still publish only audio that is referenced by the current learning sessions, keeping mobile download and cache pressure lower.
