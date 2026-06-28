---
id: npm-cache-eacces-use-custom-cache-dir
status: resolved
tags: [pattern-only]
first_seen: 2026-06-28
last_seen: 2026-06-28
recurrence: 2
related: []
---

## Description
`npm install` (and `npx astro add`) failed twice this session with `EACCES` / `EEXIST` writing to `~/.npm/_cacache` — a permission-corrupted npm cache on this machine. `astro add sitemap` aborted its config edit as a result, and the package had to be installed manually.

## Notes
2026-06-28 — Workaround that worked: `npm install <pkg> --cache <writable-tmpdir>` (used the session scratch dir). When an npm/npx command dies on a `~/.npm/_cacache` EACCES, retry with `--cache` pointed at a writable dir rather than chasing the install error. Root fix (unaddressed) would be repairing `~/.npm` ownership/permissions.

2026-06-28 — Recurred + root cause confirmed: `~/.npm` held 82 root-owned files (a past `sudo npm`). Permanent fix applied (no sudo): `npm config set cache ~/.npm-cache`. This also unblocked the context7 plugin's MCP server, which launches `@upstash/context7-mcp` via npx (same cache) — so it was silently dead until this fix. Captured in memory `package-install-setup`. Likely resolved; /friction-review to confirm-and-close.

closed on inference 2026-06-28 — permanent fix verified in place (`npm config get cache` → `/Users/michael/.npm-cache`); the EACCES mechanism (writes to root-owned `~/.npm/_cacache`) can no longer fire. recurrence 2, no CHANGELOG line (machine-config change, not a repo change), so closed on inference rather than demonstrable-archive. Reversible — recurrence re-surfaces if the cache redirect is ever lost.
