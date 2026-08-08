---
id: confirm-gold-shade-onscreen
title: Judge this session's visual tuning on screen
band: now
first_surfaced: 2026-06-28
last_touched: 2026-08-08
depends_on: []
links: [src/styles/tokens/colors.css, src/styles/tokens/typography.css, src/styles/tokens/ornament.css, src/styles/components/ornament.css, src/styles/components/apparatus/ordinal-tick.css, src/styles/main.css, src/lib/wireframe-tunnel.mjs, src/components/shared/WireframeTunnel.astro, src/styles/components/wireframe-tunnel.css, src/lib/detector-hero.mjs, src/components/shared/DetectorHero.astro, src/styles/tokens/detector-hero.css, src/styles/components/prose.css, src/styles/components/homepage.css, src/pages/index.astro, src/components/shared/FeatureBand.astro, src/components/layout/Header.astro, src/styles/tokens/print.css]
worktype: decide
assessed: 2026-08-08
---
One on-screen judgment pass over this session's headless-verified visual knobs
— his eyes are the gate on all of these:

- Brand-primary gold, retuned twice more this session and now settled at
  `#dcac33` (`--color-level-one-gold`, via `--color-primary`), restructured
  into a 3-rung family — `--gold-100` brand (CTAs, the beam), `--gold-80`
  action (links, focus, the new `--color-progress` reading hairline), `--gold-60`
  wash (selection, band tints) — so brand and action read as visibly distinct
  colors for the first time. Confirm the split reads right at every surface it
  touches (nav/mobile Subscribe, newsletter buttons, pull-quote stripe, links,
  focus rings, selection, the caution role — still sharing `--gold-100` with
  the brand voice, see `split-cta-caution-tokens`).
- Top nav converted from its prior face to the body sans, with its own
  tracking rung (`--ls-caps-sans`) — headless-only so far.
- ~~Hero blueprint grid (`--color-grid-line` alpha 0.04, `--grid-texture-cell`
  48px)~~ — MOOT: the blueprint grid and both tokens were removed 2026-07-11,
  replaced by the detector-hero scintillator-grid drawing (see
  `detector-hero-device-pass`, a separate device-gated judgment item).
- Desktop prose leading (`--lh-reading` 1.44).
- De-striped apparatus cards.
- Card + callout detector-plate ornament (corner field-arcs + edge fiducials,
  replacing the old HUD corner brackets; card radius 8px→16px). New this
  session, headless-only so far — confirm the ornament geometry/ink reads
  right and the hover brighten feels right without the old bracket step-out.
- Title view-transition morph (click card → article in Chrome/Safari).
- Print stylesheet (⌘P on an article) — now rebased onto the swatch ramp as a
  role remap (no raw hex left in print.css).
- Homepage composition rework, headless-only so far: the "Latest" article-card
  grid equalized to full-height cards with pinned meta baselines; "Featured"
  rebuilt as a wide lead card + 3-up row (replacing a lopsided bento attempt);
  the empty ~68svh expanding hero card retired on desktop (kept mobile-only);
  a new "console strip" component (latest-entry ticker) seams the hero →
  Featured transition where that card used to sit. Michael has not yet seen
  this composition on screen.
- Footer reorganized: Navigate + Connect merged into one Index column,
  "Michael Hood MD" added to the copyright line, the build-version plate text
  replaced with "Est. 2026 — Boston, Mass."
- Ordinal tick-in keep/cut: demo-gated element at
  `src/styles/components/apparatus/ordinal-tick.css` (import marked
  DEMO-GATED in `src/styles/main.css`). Scroll any article in `npm run dev`;
  plan's default expectation is CUT (a second motion grammar beside
  `[data-reveal]`). If cut: delete the file + import line, record in
  CHANGELOG.
- On-screen pass over the 7 shipped article-apparatus elements (canonical
  roster: `docs/design/components.md` → Article apparatus): section break
  mark, arrival wash, mobile INDEX, More-articles footer block, footnote
  popover cards, figure accession cells, readout chips. (The cite-line
  element planned in the first pass was cut on review before shipping.)
- "wireframe-tunnel" title-region backdrop (`src/lib/wireframe-tunnel.mjs`,
  `src/components/shared/WireframeTunnel.astro`,
  `src/styles/tokens/wireframe-tunnel.css`,
  `src/styles/components/wireframe-tunnel.css`), mounted on the homepage hero
  and article headers. As of 2026-08-07 the homepage instance mounts on the
  whole hero FIELD (hero + feature band, frameless, converging on the
  wordmark center) and the detector-hero drawing was made opaque over it (new
  `.dh-occ` occlusion layer in `src/lib/detector-hero.mjs` /
  `src/styles/tokens/detector-hero.css`) — headless-only so far, confirm the
  composition reads right on screen. (Rides the same on-screen judgment as
  `detector-hero-device-pass`, which additionally covers the on-device
  device-class + touch-feel gate.)
- 2026-08-07 small UI-fix set, headless-verified only: header wordmark
  kerning matched to hero, Subscribe button vertical centering, section-ordinal
  number color dimmed to `--color-text-disabled`, body-text color stepped down
  to `--color-text-secondary` (halation reduction), callout/key-points bullet
  geometry redone with explicit gutter markers, footer switched from
  monospace to the body sans, article TOC rail repositioned to start beside
  the Key Points card instead of the title.

Done: each knob above is confirmed acceptable on screen (or re-tuned), and
the ordinal tick-in keep/cut call is made.

## Notes
2026-08-08 folded in this session's new headless-only visual work (the
brand/action gold-ramp split + settled #dcac33 value, nav face conversion,
the homepage composition rework including the new console strip, and the
footer reorg) rather than spinning siblings — same "his eyes are the gate"
shape, same accumulating scope. Gold bullet rewritten to replace the stale
#D8A82C value.
2026-08-07 folded in this session's new headless-only visual work
(wireframe-tunnel backdrop + the small UI-fix set) rather than spinning a
sibling item — same "his eyes are the gate" shape, same accumulating scope.
2026-07-11 blueprint-grid sub-item struck as moot (grid + its two tokens
removed, replaced by the detector-hero drawing); rest of this item's scope
(gold shade, prose leading, apparatus cards, ornament, view-transition,
print, ordinal tick-in, article-apparatus roster) still stands.
2026-07-07 broadened from "confirm gold shade" to cover this session's full
set of visual tuning knobs (gold now site-wide action color raises the stakes;
folding in the other headless-only knobs from the same session avoids a
scatter of near-duplicate on-screen-judgment items). Re-banded next→now.
2026-07-07 folded in the article-apparatus Phase 1+2 on-screen judgment
(ordinal tick-in keep/cut + the 8 shipped elements) rather than splitting a
sibling decision item — same "his eyes are the gate" shape, same session.
2026-07-08 corrected the apparatus roster to 7 elements (was 8; cite-line
never shipped) and folded in the new card/callout detector-plate ornament
(replaces the HUD corner brackets this item previously asked about — that
bullet is now moot and swapped out) — same "his eyes are the gate on a
headless CSS change" shape, matched rather than spun into a new item.
