---
id: confirm-gold-shade-onscreen
title: Judge this session's visual tuning on screen
band: now
first_surfaced: 2026-06-28
last_touched: 2026-07-07
depends_on: []
links: [src/styles/tokens/colors.css, src/styles/tokens/typography.css, src/styles/components/apparatus/ordinal-tick.css, src/styles/main.css]
worktype: decide
assessed: 2026-07-07
---
One on-screen judgment pass over this session's headless-verified visual knobs
— his eyes are the gate on all of these:

- Deepened gold shade (`--color-signal-yellow` → #D8A82C, via `--color-primary`)
  now owns much more surface than before: CTAs, nav/mobile Subscribe, newsletter
  buttons, pull-quote stripe, links, focus rings, selection, progress hairline,
  subscribe accents, and the caution role (shared token).
- Hero blueprint grid (`--color-grid-line` alpha 0.04, `--grid-texture-cell`
  48px).
- Desktop prose leading (`--lh-reading` 1.44).
- De-striped apparatus cards.
- HUD corner hover.
- Title view-transition morph (click card → article in Chrome/Safari).
- Print stylesheet (⌘P on an article).
- Ordinal tick-in keep/cut: demo-gated element at
  `src/styles/components/apparatus/ordinal-tick.css` (import marked
  DEMO-GATED in `src/styles/main.css`). Scroll any article in `npm run dev`;
  plan's default expectation is CUT (a second motion grammar beside
  `[data-reveal]`). If cut: delete the file + import line, record in
  CHANGELOG.
- On-screen pass over the 8 shipped article-apparatus elements: section
  break mark, arrival wash, mobile INDEX, serial exit strip, footnote
  popover cards, figure accession cells, readout chips, cite line.

Done: each knob above is confirmed acceptable on screen (or re-tuned), and
the ordinal tick-in keep/cut call is made.

## Notes
2026-07-07 broadened from "confirm gold shade" to cover this session's full
set of visual tuning knobs (gold now site-wide action color raises the stakes;
folding in the other headless-only knobs from the same session avoids a
scatter of near-duplicate on-screen-judgment items). Re-banded next→now.
2026-07-07 folded in the article-apparatus Phase 1+2 on-screen judgment
(ordinal tick-in keep/cut + the 8 shipped elements) rather than splitting a
sibling decision item — same "his eyes are the gate" shape, same session.
