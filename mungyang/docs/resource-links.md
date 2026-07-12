# Resource Availability Report

`mungyang/public` is checked by required runtime assets, not by symlink shape. This passes whether assets are copied as real files or exposed through development links.

- Root resources checked: 4
- Required asset files checked: 82
- Missing or wrong type: 0
- Symlink-backed paths: 85
- Required asset bytes: 6209760

## Root Resources

| Scope | Path | Expected | Status |
| --- | --- | --- | --- |
| audio manifest | /audio/manifest.json | file | ok |
| mascot assets | /mascots | directory | ok |
| scene assets | /scenes/quick-practice | directory | ok |
| gacha item assets | /gacha/items/generated-v2 | directory | ok |

## Missing

No missing resources.

## Guardrail

This report intentionally does not require symbolic links. The production build separately prunes and audits `dist/audio` so copied source audio cannot bloat the deploy output.
