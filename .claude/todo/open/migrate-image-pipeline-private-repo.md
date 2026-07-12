---
id: migrate-image-pipeline-private-repo
title: Migrate the case image-processing pipeline to a separate private repo
band: next
first_surfaced: 2026-07-11
last_touched: 2026-07-11
depends_on: []
links: [scripts/dicom-to-frames.py, scripts/case-review-server.mjs, .claude/skills/ingest-case/SKILL.md, .gitignore]
worktype: build
---

The DICOM-ingestion tooling (dicom-to-frames.py converter, case-review-server.mjs + case-review-page.html curation tool, the ingest-case skill) is gitignored/withheld from this public repo as of 0.9.3 to avoid exposing the raw-medical-image processing pipeline. Move it to a dedicated private repo; this repo keeps only the de-identified built output under public/cases/ and the case-viewer display code.

## Notes

2026-07-11 — Michael 2026-07-11: near-future migration; once moved there's no exposure concern. build-case.mjs + case-shell.mjs are already public (build/display half) — decide whether they move too or stay.
