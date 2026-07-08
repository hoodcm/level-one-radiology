---
id: resolve-data-reveal-dead-code
title: Remove or gate the unused data-reveal motion system
band: later
first_surfaced: 2026-07-08
last_touched: 2026-07-08
depends_on: []
links: [src/styles/base/motion.css]
worktype: decide
---
Surfaced during the site-wide sweep: the `[data-reveal]` scroll-reveal motion
system exists in CSS but nothing in the codebase currently sets the attribute
— dead code. It also carries a latent no-JS blackout risk: if adopted without
care, an element gated on `[data-reveal]` before its reveal script runs (or
with scripts disabled) would render invisible with no `<noscript>` fallback,
the same failure class the FeatureBand `<noscript>` fix addressed this
session. Decide: delete the unused system now, or keep it and add the
no-JS/no-script safety net before anything is authored to use it.

Done: either the dead `[data-reveal]` CSS is removed, or it is adopted with a
no-JS fallback guaranteed before first use.
