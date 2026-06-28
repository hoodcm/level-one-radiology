---
id: widen-body-serif-reading
title: Resolve the body-serif widening (opsz vs wider OFL serif)
band: now
first_surfaced: 2026-06-28
last_touched: 2026-06-28
depends_on: []
links: [src/styles/tokens/typography.css, src/styles/components/prose.css]
assessed: 2026-06-28
---
The body reading serif (Newsreader) is being widened for a sturdier text column.
An `opsz` experiment is live via `--reading-opsz` (typography.css; consumed by
prose.css `font-variation-settings: "opsz"`) and awaits the user's on-screen
judgment. Newsreader has no `wdth` axis, so widening is only available through
optical size. Next step is either lower the opsz further or evaluate a
wider / more-geometric OFL body serif. Stated priority Now/Next.

Done: a deliberate body-serif width direction is chosen — a settled `--reading-opsz`
value or a swapped wider OFL body serif.
