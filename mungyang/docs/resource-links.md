# Resource Link Report

`mungyang/public` intentionally reuses selected `yangmung/public` assets through symlinks during development.

- Top-level links: 3
- Gacha item links: 102
- Broken links: 0

## Top-Level Links

| Link | Target | Status |
| --- | --- | --- |
| public/audio | ../../public/audio | ok |
| public/mascots | ../../public/mascots | ok |
| public/scenes/quick-practice | ../../../public/scenes/quick-practice | ok |

## Guardrail

`npm run build` still prunes audio after Vite copies symlinked assets, so production output contains only audio referenced by current learning sessions.
