# Content Handoff

## Current Status

- P0 content blockers are already fixed in the app code.
- `npm run check` passes with 0 errors and 0 warnings.
- The remaining content work should focus on S7-S43 curriculum/detail text, not on reapplying the P0 fixes.

## Already Fixed

| Area | Status |
| --- | --- |
| P1 staff-register questions | Fixed: staff questions are `staffLine`, traveler responses are separate `expression` cards. |
| J1 prerequisites | Fixed: `requiredIds` match the journey checkpoints (`S7`, `S8`, `S9`, `S10`, `S14`). |
| J5 prerequisites | Fixed: `S17` is included before the departure journey. |
| J3 cp4 drill | Fixed: the local restaurant checkpoint uses S39 support text, not the repeated bus-time line. |

## Safe Follow-Up Scope

The next content pass can proceed without changing app behavior first:

1. Keep all 43 scene unit IDs.
2. Replace scene subtitles that repeat the group name.
3. Replace generic generated notes/cues for S7-S43.
4. Redesign S7-S43 `requiredIds` as light gates instead of one repeated block.
5. Keep journey checkpoint `linkedUnitIds` and journey `requiredIds` aligned.

## Non-Blocking Structure Report

Run this when checking progress on the remaining content rewrite:

```bash
npm run content:structure
```

It writes:

- `docs/content-structure-report.md`
- `docs/content-structure-report.json`

This report is intentionally not wired into `npm run check` or `npm run build` yet. It should become blocking only after the S7-S43 rewrite lands.
