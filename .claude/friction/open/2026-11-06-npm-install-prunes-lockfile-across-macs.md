---
id: npm-install-prunes-lockfile-across-macs
status: open
tags: []
surface: ~/GitHub/level-one-radiology/package.json
first_seen: 2026-11-06
last_seen: 2026-11-06
recurrence: 1
related: []
---

## Description

Running `npm install` on the Mac Mini to restore a declared package missing from `node_modules` rewrote `package-lock.json`, dropping 494 lines of optional peer entries, because the Macs' npm versions resolve the lockfile differently.

## Notes

- 2026-11-06 `npm ci` passed on the pruned lockfile, so it was committed. Prefer `npm ci` to restore missing packages, and consider pinning the npm version in `package.json` engines or `packageManager`.
