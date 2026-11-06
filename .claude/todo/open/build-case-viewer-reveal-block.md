---
id: build-case-viewer-reveal-block
title: Build the case viewer's unknown-case reveal block
band: someday
first_surfaced: 2026-11-06
last_touched: 2026-11-06
depends_on: []
links: [docs/design/components.md, src/components/case/]
worktype: build
workstream: case-viewer
---
Build the reveal block that `docs/design/components.md` lists under the case viewer's "Deferred by explicit choice": a way for an article to present a case as an unknown and reveal the answer on the reader's action. A case viewer embed can be a worked example or an unknown, and the author chooses per case, as the `teaching` skill's article node states, so an author who picks an unknown needs this block.

Done when an article can embed a case as an unknown with a reveal step the reader triggers, and `docs/design/components.md` moves the reveal block out of its deferred list.
