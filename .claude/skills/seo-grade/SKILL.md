---
name: seo-grade
run-log: required
description: Grade one article, a set, or the whole corpus against the Google Search Central probes via an external Codex reviewer — the pre-publish gate for search-facing copy, also usable as a periodic corpus screen. Read-only over article prose; it reports findings and never edits.
---

# /seo-grade [slug ...]

Grade finalized article prose against the standard it was written to: the voice skill's
`google-search-central-seo` lens, using its own grading protocol
(`~/.claude/skills/voice/lenses/google-search-central-seo/probes.md` — Part A: verdicts per
principle, mandatory quote-evidence, soundness pass, roll-up). The grading runs through
`/codex-second-opinion` so an *independent engine* reads the copy — the model that drafted
prose is anchored on it; the external reader is the point, not a convenience.

Timing: this is the **pre-publish gate** — run it on finalized prose, after Michael's edit
pass and before the `draft` flip. Never grade a stub scaffold (most probes fail vacuously)
or a first draft that's about to be edited anyway. It also works as a periodic screen over
already-published articles — e.g. after the lens itself is updated.

## 1 — Resolve the article set

- Slugs given → those files under `src/content/articles/`.
- No argument → list the corpus with draft status (frontmatter `draft`) and let Michael pick:
  publish-pending drafts are the usual gate targets; "all published" is the periodic-screen
  option. Exclude `style-gallery` (draft-only specimen, never publishes).

## 2 — Grade each article (external)

Per article, invoke `/codex-second-opinion` with:

- the probes file: `~/.claude/skills/voice/lenses/google-search-central-seo/probes.md`
- the article file
- scoping instructions — this is what keeps the grade signal instead of noise:
  - Run the Part A protocol (A0–A4) over the **article copy only**.
  - Principles owned by templates and site config — canonical URLs, mobile parity,
    structured-data lifecycle, Search Console evidence, crawl/index mechanics — are **n/a**
    unless the article copy itself proposes something in that domain
    (build-side ownership: `.claude/rules/seo-structure.md`).
  - Context the grader needs: this is **educational and commentary content in a medical
    domain, written for clinicians — not consumer health guidance**. Say so explicitly, and
    tell the grader not to apply a YMYL consumer-health bar (Michael, 2026-08-08). Left
    unsaid, graders read "radiology" and reach for the YMYL probe, which inflates every
    sourcing finding into a trust violation. The site is single-author and the byline
    apparatus is template-emitted, so judge authorship by what the copy claims, not by the
    absence of a byline in the markdown.
  - Findings in the probes' mandatory format: verbatim quote + principle + one-line fix.
    No quote, no finding.

Batch runs: grade sequentially and collect per-article roll-ups; don't interleave findings
across articles.

## 3 — Adjudicate and report

Findings are hypotheses, not verdicts. Present per article: the A4 roll-up (craft +
soundness), then each adverse finding with its quote. Michael adjudicates — apply what holds
(small fixes directly; substantive rewrites go back through the article's own edit loop),
record what's rejected and why. A clean or adjudicated grade is the exit criterion; for a
pre-publish run, the article then proceeds to the rest of the publish checklist (the
`case-article` skill's ending block owns that list).

## Run record (MANDATORY — gate-enforced)

Append one completion line at the end of the run (schema:
`~/.claude/observability/README.md`). Best-effort — a failed append never
changes the outcome you report — but not optional: this skill carries
`run-log: required`, and the end-session gate blocks until a record exists for
every invocation. An aborted run still writes its record, with
`outcome: "partial"`.

```bash
echo '{"kind":"skill-run","skill":"seo-grade","sessionId":"'"$CLAUDE_CODE_SESSION_ID"'","workspace":"'"$PWD"'",
"outcome":"success|partial|failure",
"failureMode":null,
"deliverables":[{"claim":"<what this run delivered>","pointer":"<artifact path, or null>"}],
"notes":"<the skill's own counters / scope, one line>"}' \
  | node ~/.claude/observability/log.mjs
```
