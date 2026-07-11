---
id: pull-then-install-before-dev
status: open
tags: [pattern-only]
first_seen: 2026-07-07
last_seen: 2026-07-07
recurrence: 1
related: []
assessed: 2026-07-11
---

## Description

After pulling the other machine's work (which added @astrojs/sitemap to package.json), `npm run dev` failed with `Cannot find module '@astrojs/sitemap'` — stale node_modules on this Mac. Cost one failed background server + diagnosis before `npm install`.

## Notes

2026-07-07 — Pattern for the two-Mac workflow: after any cross-machine pull that touches package.json, run npm install before starting the dev server.
