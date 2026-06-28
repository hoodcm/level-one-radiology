---
id: use-thin-gutters-fullbleed-images
title: Consider thin Scrib3-style gutters for full-bleed image spans
band: someday
first_surfaced: 2026-06-23
last_touched: 2026-06-26
depends_on: []
links: [src/components/shared/FeatureBand.astro]
assessed: 2026-06-28
---
Possibly introduce thin Scrib3-style gutters specifically for full-bleed image
spans (e.g. inside FeatureBand / full-bleed article media) rather than letting
them run edge-to-edge. Surfaced as a soft future consideration during the
design-polish session and deferred — not committed, revisit when real full-bleed
imagery exists to evaluate against.

Done: a deliberate decision is made on full-bleed gutter treatment (adopt or
drop), informed by real image content.

## Notes
2026-06-26 related: the new grid system (src/components/layout/) now defines a
`--grid-gutter` token (spacing.css) — evaluate this gutter treatment against
that token rather than introducing a parallel one. No merge; distinct work.
