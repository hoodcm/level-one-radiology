---
id: file-move-crashes-running-dev-server
status: open
tags: [pattern-only]
first_seen: 2026-06-28
last_seen: 2026-06-28
recurrence: 1
related: []
assessed: 2026-07-07
---

## Description
A bulk `git mv` of `docs/design-references/` out from under a running `npm run dev` crashed the dev server with `ENOENT … illustration-4.svg`. The codebase had no broken reference — a clean `astro build` passed and grep found zero source refs — the running Vite dev server was just holding the pre-move absolute path.

## Notes
2026-06-28 — After a large file/folder move (especially `git mv` of anything a dev server watches or serves), restart `npm run dev` rather than chasing it as a code bug. Confirm health with a clean `npm run build` (the ground truth), not the dev-server error overlay.
