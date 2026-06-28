---
id: split-cta-caution-tokens
title: Split primary-CTA gold from caution into distinct tokens if they conflict
band: someday
first_surfaced: 2026-06-28
last_touched: 2026-06-28
depends_on: []
links: [src/styles/tokens/colors.css]
assessed: 2026-06-28
---
The gold brand primary and the caution signal currently share one token
(`--color-signal-yellow`, → `--color-primary`). If the dual role ever conflicts —
a CTA gold and a caution gold wanting to diverge — split them into distinct
tokens. Soft future consideration surfaced when the gold swap landed; not
committed, revisit only if the shared token actually causes a conflict.

Done: a deliberate decision is made on whether to split the CTA gold from the
caution gold.
