---
id: shell-module-edits-stale-content-cache
status: open
tags: [needs-design]
first_seen: 2026-07-08
last_seen: 2026-07-11
recurrence: 2
related: []
assessed: 2026-07-11
---

## Description

Editing the build-time case-viewer shell (src/lib/case-shell.mjs, src/lib/case-icons.mjs) did not surface in the running dev server: the content-layer cache kept serving the previously-rendered article, so icon/markup changes stayed invisible until `rm -rf node_modules/.astro .astro` + dev restart. Happened ~4x this session.

## Notes

2026-07-08 — case-loader.ts rev-invalidates on manifest rev but nothing invalidates on shell-module source edits. Consider watching case-shell.mjs / case-icons.mjs and busting the content cache on their mtime, or documenting the clear+restart step.

2026-07-11 — recurred hard 2026-07-09 — user hit it directly ("the icons don't appear to have changed?") after edits to case-icons.mjs/case-shell.mjs. Every icon/shell change this session needed rm -rf .astro/data-store.json node_modules/.astro + a dev-server restart before it surfaced; cost several restart cycles.

2026-07-11 — Janitor: re-assessed (scan flagged `changed_since_assessed` — last_seen moved past the prior 2026-07-08 assessed stamp). Recurrence now 2 with a hard hit; ready to design — this is not a new mechanism idea, the 2026-07-08 note already names the fix shape (watch the two shell-module source files, bust the content-layer cache on their mtime). Routed to the project menu as needs-design (implementation touches case-loader.ts, a behavior file — outside Janitor's write scope).
