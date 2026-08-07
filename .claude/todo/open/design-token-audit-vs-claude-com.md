---
id: design-token-audit-vs-claude-com
title: Audit/reconcile design tokens against the claude.com reference
band: next
first_surfaced: 2026-08-07
last_touched: 2026-08-07
assessed: 2026-08-07
depends_on: []
links: [docs/design/claude-com-reference.md, src/styles/tokens/]
worktype: think
---
2026-08-07 wrote a scraped reference of claude.com's design-token set
(`docs/design/claude-com-reference.md`) as inspiration for this site's own
tokens (not a source of truth — study copy only). Full audit/reconciliation
is future work, scoped in the session's own continuation notes: palette
reduction toward a 60/30/10 balance, reconsidering body-text color, moving to
fluid clamp()-based type/spacing scales, and a border-alpha-vs-opaque-ramp
strategy decision.

This is plan-shaped work — route through `/brainstorm` before implementation
per the continuation notes' own instruction, not a direct-to-code task.

Done: a deliberate set of token changes (or explicit no-changes) decided and
landed for each of the four areas above, each token still living in exactly
one place per the project's single-source-of-truth rule.
