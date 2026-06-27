---
id: enforce-grid-primitive-hook
title: Enforce the grid primitive with a hook
band: later
first_surfaced: 2026-06-26
last_touched: 2026-06-26
depends_on: []
links: [src/components/layout/, docs/principles/layout-principles.md]
assessed: 2026-06-26
---
Design a hook (via /hook-design) that flags raw `grid-template-columns` or
re-declared `max-width + margin:auto + padding` container shells appearing
outside `src/components/layout/`. The deterministic-enforcement follow-up
explicitly deferred from the grid-system plan: the `<Container>`/`<Grid>`/`<Col>`
primitive (columns 5/10/15) now exists and the layout rule lives in CLAUDE.md +
docs/principles/layout-principles.md, but nothing yet prevents a new component
from hand-rolling its own grid/container shell.

Done: a hook flags raw grid-template-columns / re-declared container shells
outside src/components/layout/.
