---
id: astro-frontmatter-regex-compiler-break
status: open
tags: [pattern-only]
first_seen: 2026-07-07
last_seen: 2026-07-07
recurrence: 1
related: []
assessed: 2026-07-08
---

## Description

A regex literal containing escaped slashes (`/^https?:\/\//`) in [slug].astro frontmatter broke the Astro/esbuild config compile with `Unexpected "export"` pointing at an unrelated frontmatter line, while the IDE language server emitted a rolling series of misleading diagnostics (implicit-any, 'Digit expected') elsewhere in the file. Rewriting without the regex (URL.host + pathname) fixed it instantly. Lesson: in .astro frontmatter avoid regex literals with `\/\/` sequences; and treat single-file IDE diagnostics in .astro files as unreliable — adjudicate with `npm run build`.

## Notes
