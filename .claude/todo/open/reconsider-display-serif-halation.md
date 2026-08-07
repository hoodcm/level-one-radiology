---
id: reconsider-display-serif-halation
title: Reconsider display/body serif if text halation persists
band: someday
first_surfaced: 2026-06-23
last_touched: 2026-08-07
depends_on: []
links: [src/styles/tokens/typography.css, src/styles/components/prose.css]
worktype: decide
workstream: fonts
assessed: 2026-08-07
---
Possibly switch the display/body serif to a lower-contrast face if text
halation (high-contrast stroke shimmer on the dark-first background) persists
after the applied dimming mitigations. Parked as a soft consideration — the
user was unsure whether the dimming already resolves it; this is an
observation-window item, not a committed change.

Done: confirm halation is resolved by the dimming mitigations (no change), or
replace the serif with a lower-contrast face.

## Notes
2026-08-07 doc-drift fix: the display/body serif is now Newsreader (OFL,
retire-legacy-font-payload's swap superseded the original Utopia Std
mention) — this item now concerns Newsreader, not Utopia Std. Also: this
session added a second halation mitigation, body text color stepped down one
ramp step (`--color-text-primary` → `--color-text-secondary`, prose.css) on
top of the original line-height/luminance dimming. Still an open observation
— no confirmation either way that halation is resolved.
