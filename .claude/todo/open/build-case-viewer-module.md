---
id: build-case-viewer-module
title: Build Case Viewer showstopper module
band: later
first_surfaced: 2026-06-23
last_touched: 2026-06-23
depends_on: []
links: [src/components/case/, docs/COMPONENT-LIBRARY.md]
assessed: 2026-06-23
---
Build the Case Viewer — the "showstopper module," a PACS-like image viewer for
clinical cases embedded within articles. Custom-built React island, not shadcn
primitives (CONTEXT + CLAUDE.md). `src/components/case/` is currently empty.
MVP scope requires a functional case viewer in at least one article. Stated
priority #3. Can be built and demoed standalone before embedding.

Done: a working CaseViewer island renders a clinical case (image
pan/zoom/series per COMPONENT-LIBRARY.md).
