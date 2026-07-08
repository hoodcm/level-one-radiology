---
id: enforce-grid-primitive-hook
title: Enforce the grid primitive with a hook
band: later
first_surfaced: 2026-06-26
last_touched: 2026-06-28
depends_on: []
links: [src/components/layout/, docs/design/reasoning/layout.md]
worktype: meta
assessed: 2026-07-08
---
Design a hook (via /hook-design) that flags raw `grid-template-columns` or
re-declared `max-width + margin:auto + padding` container shells appearing
outside `src/components/layout/`. The deterministic-enforcement follow-up
explicitly deferred from the grid-system plan: the `<Container>`/`<Grid>`/`<Col>`
primitive (columns 5/10/15) now exists and the layout rule lives in CLAUDE.md +
docs/design/reasoning/layout.md, but nothing yet prevents a new component
from hand-rolling its own grid/container shell.

Done: a hook flags raw grid-template-columns / re-declared container shells
outside src/components/layout/.

## Notes
2026-06-28 partial coverage shipped (not done): this session's token-enforcement
gate (.stylelintrc.json + .claude/hooks/check-tokens.sh + npm run lint, CI in
deploy.yml) requires `grid-template-columns` to be a `var(…)` token. That covers
the "raw values" half but NOT the item's intent — it does not detect a
re-declared `max-width + margin:auto + padding` container shell, and is not
scoped to "outside src/components/layout/". Remaining work: the container-shell
detection + layout-dir scoping.
