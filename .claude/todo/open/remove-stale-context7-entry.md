---
id: remove-stale-context7-entry
title: Remove the stale local context7 entry in ~/.claude.json
band: someday
first_surfaced: 2026-06-28
last_touched: 2026-06-28
depends_on: []
assessed: 2026-07-07
---
context7 is now a user-scope plugin (documented in CLAUDE.md this session; do not
re-add via .mcp.json). A stale local context7 entry remains in `~/.claude.json`
and should be removed so it is not defined in two places. Optional cleanup; a
`~/.claude.json` edit, outside this repo.

Done: the redundant local context7 entry is removed from ~/.claude.json.
