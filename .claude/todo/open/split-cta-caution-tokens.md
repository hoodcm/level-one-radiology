---
id: split-cta-caution-tokens
title: Split primary-CTA gold from caution into distinct tokens if they conflict
band: later
first_surfaced: 2026-06-28
last_touched: 2026-08-08
depends_on: []
links: [src/styles/tokens/colors.css]
worktype: decide
assessed: 2026-08-08
---
The gold brand primary and the caution signal currently share one token
(`--color-signal-yellow`, → `--color-primary`). If the dual role ever conflicts —
a CTA gold and a caution gold wanting to diverge — split them into distinct
tokens. Soft future consideration surfaced when the gold swap landed; not
committed, revisit only if the shared token actually causes a conflict.

Done: a deliberate decision is made on whether to split the CTA gold from the
caution gold.

## Notes
2026-08-08 the gold family was restructured into a 3-rung ramp
(`--gold-100`/`-80`/`-60`: brand/action/wash) and `--color-link`/`-focus`/
`-progress` moved off the brand rung onto `--gold-80` (action) — action and
brand are now visibly distinct. Caution (`--color-signal-yellow`) still
resolves to `--gold-100`, the same rung as the brand CTA — this item's actual
question (CTA vs. caution) is untouched by that split; still no committed
decision.
2026-07-07 tension increased: gold now owns links/focus/selection/progress
hairline site-wide (not just CTAs) while caution callouts still share the same
token — more surface riding on one token than when this was first surfaced.
Re-banded someday→later; still no committed decision to split.
