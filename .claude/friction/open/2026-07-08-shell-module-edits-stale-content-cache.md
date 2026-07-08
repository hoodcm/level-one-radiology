---
id: shell-module-edits-stale-content-cache
status: open
tags: [needs-design]
first_seen: 2026-07-08
last_seen: 2026-07-08
recurrence: 1
related: []
assessed: 2026-07-08
---

## Description

Editing the build-time case-viewer shell (src/lib/case-shell.mjs, src/lib/case-icons.mjs) did not surface in the running dev server: the content-layer cache kept serving the previously-rendered article, so icon/markup changes stayed invisible until `rm -rf node_modules/.astro .astro` + dev restart. Happened ~4x this session.

## Notes

2026-07-08 — case-loader.ts rev-invalidates on manifest rev but nothing invalidates on shell-module source edits. Consider watching case-shell.mjs / case-icons.mjs and busting the content cache on their mtime, or documenting the clear+restart step.
