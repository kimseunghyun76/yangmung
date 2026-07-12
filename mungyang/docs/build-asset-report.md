# Build Asset Report

## Current Build

`npm run build` runs TypeScript, Vite production build, dist audio pruning, exact audio subset audit, and this size report.

## Size Summary

| Area | Files | Bytes | Human |
| --- | ---: | ---: | ---: |
| `dist` | 351 | 15168492 | 14.5 MB |
| `dist/assets` | 3 | 312308 | 305.0 KB |
| `dist/audio` | 210 | 3557481 | 3.39 MB |
| `dist/audio/nanami` | 209 | 3425472 | 3.27 MB |
| `dist/gacha` | 102 | 2089220 | 1.99 MB |
| `dist/mascots` | 9 | 2750582 | 2.62 MB |
| `dist/scenes` | 26 | 6458374 | 6.16 MB |

## Audio Subset

| Metric | Count |
| --- | ---: |
| Required unique session texts | 209 |
| Expected mp3 files | 209 |
| Actual mp3 files | 209 |
| Missing files | 0 |
| Extra files | 0 |
| Actual mp3 bytes | 3425472 |
| Status | PASS |

## Guardrail

The production build publishes only audio referenced by the current learning sessions. The subset audit fails the build if any required mp3 is missing or if unreferenced mp3 files remain in `dist/audio`.
