---
id: repair-npm-cache-permissions
title: Repair ~/.npm cache permissions (EACCES)
band: someday
first_surfaced: 2026-06-28
last_touched: 2026-06-28
depends_on: []
friction: 2026-06-28-npm-cache-eacces-use-custom-cache-dir
assessed: 2026-06-28
---
The `~/.npm` cache hit EACCES permission errors twice this session. Repair the
cache directory ownership/permissions so npm stops failing on it. Optional infra
cleanup; environment-level, outside this repo.

Done: ~/.npm is owner-writable and npm install no longer hits EACCES.
