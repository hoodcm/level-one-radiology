---
id: check-existing-install-before-adding-mcp
status: resolved
tags: [pattern-only]
first_seen: 2026-06-28
last_seen: 2026-06-28
recurrence: 1
related: []
---

## Description
Asked to "install context7 for this project," I created a project `.mcp.json` — without first checking that context7 was already installed as a **user-scope plugin** (`context7@claude-plugins-official`), available in every project. The user caught it: "I just realized Context 7 was already installed as a plug-in. Is this duplicative?" It was (and there was also a stale local entry in `~/.claude.json`). Removed the redundant `.mcp.json`.

## Notes
2026-06-28 — Before adding any MCP server / tool config, check the installed plugin list (`~/.claude/plugins/installed_plugins.json`) and existing scopes (`~/.claude.json`) for an existing registration first. CLAUDE.md now documents that context7 is a user-scope plugin and must not be re-added to a project `.mcp.json` — so the specific case is covered; the general "check before adding infra" lesson is what generalizes.

resolved 2026-06-28 — shipped in CHANGELOG [Unreleased]: "CLAUDE.md guidance: ... a context7 section (it's a user-scope plugin — don't re-add via `.mcp.json`)". Verified at CLAUDE.md:45. The captured context7 case is now demonstrably covered; the general "check installed scopes before adding infra" lesson is recurrence-1 and re-surfaces as a fresh capture if it bites in another shape.
