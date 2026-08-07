---
id: push-time-seo-sweep
title: Wire a site-wide SEO sweep into /push for meaningful diffs
band: next
first_surfaced: 2026-07-14
last_touched: 2026-07-14
assessed: 2026-08-07
depends_on: []
links: [.claude/rules/seo-structure.md, .claude/skills/seo-grade/SKILL.md]
worktype: decide
---
Michael (2026-07-14): when /push runs in this repo with meaningful diffs, it
should also do an SEO sweep that checks the rest of the website is idealized
to Google's standards. Wiring deliberately deferred ("we can figure out how
to wire that into push"). His framing: this is a writing/structure exercise
against Google's standards, nothing to do with medicine or biology. The sweep
checks copy and site conformance (titles, descriptions, legibility,
structure), never clinical content.

Design space to settle (route through /brainstorm or /hook-design):

- What the sweep checks: the build-side checklist in
  `.claude/rules/seo-structure.md` (rendered-HTML legibility, head validity,
  title/description uniqueness, truthful JSON-LD, sitemap/lastmod, status
  codes) — structural conformance over `dist/`, distinct from the per-article
  copy grade `/seo-grade` owns.
- Trigger: which diffs count as "meaningful" (templates/layout/config/content
  vs docs-only).
- Wiring mechanism: /push is a global skill — options are a project rule the
  push flow reads, a project /seo-sweep skill /push offers when in this repo,
  or a PreToolUse/pre-push hook. Global-skill edits vs project-owned step is
  the real fork.

Done: a designed, wired sweep — /push in this repo triggers (or offers) the
structural SEO check on meaningful diffs, with the checker itself implemented
and its scope documented.
