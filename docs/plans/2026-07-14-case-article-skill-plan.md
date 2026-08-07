# /case-article — prepared case → started article (plan)

## Context & why

Two sibling repos: **prepare-radiology-cases** (private; DICOM → human redaction/annotation
gate → prepared de-identified case under `cases/<id>/` with a `case.json` sidecar) and
**level-one-radiology** (this repo; Astro site whose articles embed cases via
`::case[caption]{id="…"}`). After a case is prepared, everything between "prepared case" and
"started article" is manual, undocumented knowledge: `case:build` + validation, frontmatter with
a sequential serial, the tag taxonomy, embed placement, house writing doctrine. ingest-case's
step 5 (in the prepare repo) hands back an embed snippet and stops.

This plan adds the first project skill to this repo — **`/case-article <case-id>`** — the
invocable handoff, and collapses ingest-case step 5 to a pointer at it. Acceptance is a live,
user-attended run on `ct-face` (prepared, annotated, currently unbuilt).

## Locked decisions

1. **Skill lives here** (level-one-radiology), not in the prepare repo and not globally —
   article work needs this repo's rules, docs, and dev-server convention; ingest-case points at it.
2. **`disable-model-invocation: true`** — it commits; description is one human-facing line.
3. **Endpoint**: teaching-angle interview → scaffolded draft live in dev → fork: *draft prose
   now* (voice-loaded) or *stop* with a continuation prompt. The fork stays by explicit user
   choice over the context-pollution objection (raised twice; mitigations below).
4. **The skill always rebuilds the payload.** No rev-staleness check: manifest `rev` is a
   site-local build counter (`scripts/build-case.mjs:94-108`), not comparable to the prepared
   case.json `rev` (xr-ankle: case.json rev 1 vs manifest rev 2). `case:build` is wholesale and
   idempotent (`rm -rf` outDir, line 100), so always-build is both correct and simpler.
5. **Expert-first interview**: Michael states the diagnosis and the one teaching point; Claude
   reads the built key frames only afterward, to *phrase* title/description/keyPoints/caption —
   never to originate the angle (no findings label exists in the data; frames can be ≤351px).
6. **No PHI re-audit in this repo** — site CLAUDE.md non-negotiable; de-identification is solved
   upstream. The redaction spot-check does not migrate here and is removed from ingest-case
   step 5 (a pure downscale cannot un-redact an opaque box).
7. **Editorial slug**, chosen at interview — not the case id; article URLs are permanent.
8. **Serial at write time**: max existing `L1-\d{4}` + 1, derived when the file is written (not
   at interview time). Serial order may diverge from publish order for drafts published
   out of order — sanctioned by the schema comment ("assigned once at authoring, never reused").
9. **Runtime derivation, never restatement**: enums from `src/lib/tags.ts`, schema fields from
   `src/content.config.ts`, writing conventions from `docs/writing.md` — read at skill runtime so
   the skill cannot drift when the taxonomy or doctrine moves.
10. **Authoring follows skill-creator doctrine** (user directive): imperative voice, explain the
    why over all-caps MUSTs, well under 500 lines, progressive disclosure (no bundled references
    needed — this repo's own docs are the references).

## Design

### Phase flow

```
/case-article <case-id>
  0 preflight   sibling case.json parses; sentinel confirmed:true + builtRev == rev;
                dev server on :4321 detected or started; bad/no arg → list prepared
                cases and which already have articles
  1 build       both-kinds? → ask --kind (site represents ONE kind per case id);
                npm run case:build; npm test (vitest); validateCaseAssets;
                commit public/cases/<id> path-scoped
  2 interview   Card A: Michael states diagnosis + the one teaching point
                (options = generic angle shapes; Other prominent);
                Claude reads key frames (series.start → <series>/<window>/<nnn>.jpg)
                Card B: proposed title/slug/tags/primaryTag/contentType — confirm/adjust
  3 scaffold    src/content/articles/<slug>.md — full frontmatter (serial max+1,
                publishDate today placeholder, draft:true, drafted description +
                keyPoints, tags); skeleton: grounded-opening stub, 2–4 angle-shaped
                sections with <!-- intent --> notes, ::case embed after first
                orienting section, "The Bottom Line" closer;
                verify: HTTP GET the draft's dev URL + astro check; commit path-scoped
  4 fork        Draft now (load voice + docs/writing.md + docs/brand.md, skim 1–2
                published articles, write the full draft) — or Stop (print
                continuation prompt). Recommend Stop when bigger than a focused
                case-analysis. Either way: print URL/path/serial + manual publish
                checklist (flip draft, real publishDate/lastReviewed, iPhone
                judgment pass, /push).
```

### Frontmatter derivation (every required field routed)

| Field | Source |
|---|---|
| title, description, keyPoints | interview (Claude-drafted from Michael's angle, confirmed Card B) |
| serial | grep max `L1-\d{4}` across `src/content/articles/`, +1, at write time |
| publishDate | today (placeholder until publish) |
| tags (required array) | case.json `meta` (modality/anatomy, lowercased) + angle words, confirmed Card B |
| primaryTag, contentType | enums read from `src/lib/tags.ts`, confirmed Card B |
| draft | `true` always; flipping is manual, behind the iPhone gate |
| caseImages, ogImage, lastReviewed | omitted (optional; lastReviewed set at publish) |

### Failure modes the skill must handle

- Case missing / sentinel unconfirmed / builtRev ≠ rev → fail fast, print the remedial command
  (finish the annotator gate in the prepare repo).
- `case:build` or vitest or validateCaseAssets red → stop before any article work.
- case.json carries both views[] and stacks[] → surface the `--kind` choice (plain invocation
  `die`s: `scripts/build-case.mjs:84`).
- `<slug>.md` exists, or an article already embeds this case id (`grep ::case`) → offer
  continue-existing instead of scaffolding a duplicate.
- Dev server already listening on :4321 → reuse it; never start a second (it would bind :4322
  and race the first's watcher).
- `astro check` alone never exercises a `::case` embed (remarkCaseViewer runs at render; the
  build-start validation hook skips drafts) — the GET of the dev URL is the real embed check.

## Design trade-offs / Non-goals

- **Null option** (keep manual step 5) — rejected: serial/taxonomy/validation sequencing is
  exactly the error-prone knowledge worth codifying.
- **Extend ingest-case cross-repo** — rejected: article sessions belong in this repo's rule
  context; mixing two repos' commits in one flow.
- **Global skill** — rejected: bakes sibling paths globally; duplicates knowledge this repo owns.
- **npm scaffold script** — rejected: the deterministic core is one templated file write; a
  script is a second thing to maintain.
- **Auto-generated "case pages"** from case.json alone — rejected: the site's identity is
  authored teaching voice, not a case database.
- **Publishing automation** — out by design: draft flip, publishDate, iPhone pass, /push stay manual.
- **Dropping the "draft now" fork** — raised by devil's advocate and independently by the
  fresh-context skeptic; user kept it. Mitigations: voice + writing doctrine load only on that
  arm; the skill recommends Stop for bigger pieces.
- **skill-creator synthetic eval loop + description optimizer** — skipped: side-effect workflow
  against a real repo (the attended ct-face run is the eval); `disable-model-invocation` means
  the description is not a model trigger surface.
- **Multi-case articles** (a second case into an existing article) — manual today (the directive
  already supports N embeds); a `--into <slug>` mode is downstream if volume demands it.

## Files to read first (implementing session onboarding)

- `/Users/michael/GitHub/level-one-radiology/scripts/build-case.mjs` — kind resolution, die
  conditions, manifest shape, key-frame pattern
- `/Users/michael/GitHub/level-one-radiology/src/lib/case-shell.mjs` — `validateCaseAssets(id)`,
  `CASE_DIRECTIVE_RE`, `nnn()`
- `/Users/michael/GitHub/level-one-radiology/src/content.config.ts` + `src/lib/tags.ts` — schema
  + taxonomy (runtime sources)
- `/Users/michael/GitHub/level-one-radiology/src/content/articles/xr-ankle-foot-trauma.md` — the
  shape reference (real ::case-embedding article)
- `/Users/michael/GitHub/level-one-radiology/docs/writing.md`, `docs/brand.md` — house doctrine
- `/Users/michael/GitHub/prepare-radiology-cases/.claude/skills/ingest-case/SKILL.md` — step 5
  to rewrite
- `/Users/michael/GitHub/prepare-radiology-cases/cases/ct-face/{case.json}` +
  `cases-src/ct-face/selection.json` — the acceptance case

## Reuse

- `npm run case:build`, `npm test`, `validateCaseAssets` — existing build/validate contract.
- `CASE_DIRECTIVE_RE` (case-shell.mjs) — the grep pattern for "which cases already have articles."
- AskUserQuestion card conventions; voice skill + writing.md for the draft arm.
- xr-ankle-foot-trauma.md as the scaffold's structural precedent.

## Steps

1. **Author the skill** at
   `/Users/michael/GitHub/level-one-radiology/.claude/skills/case-article/SKILL.md` per the
   design above and skill-creator doctrine.
   `Contracts:` `/case-article <case-id>` invocation surface (arg optional → listing mode).
   → verify: frontmatter has `name`, one-line `description`, `disable-model-invocation: true`;
   body < 500 lines; `grep -E "'(Trauma|Abdomen|Chest|Neuro|MSK)'|educational|commentary|case-analysis"`
   over the SKILL.md finds no hardcoded enum values (runtime-derivation holds).
2. **Rewrite ingest-case step 5** in
   `/Users/michael/GitHub/prepare-radiology-cases/.claude/skills/ingest-case/SKILL.md` to a
   pointer: "in level-one-radiology run `/case-article <id>`" (drop the manual case:build block,
   validation lines, redaction spot-check, embed hand-back).
   → verify: grep that SKILL.md for `case:build`, `validateCaseAssets`, `spot-open` → no hits.
3. **Update prepare CLAUDE.md** "Website hand-off" section with the same pointer (keep the
   manual `case:build` command as the underlying mechanism note).
   → verify: section names `/case-article`.
4. **Add one-line skill mention to site CLAUDE.md** (first project skill).
   → verify: line present, points at the skill file, restates nothing.
5. **Commit both repos** path-scoped (site: skill + CLAUDE.md + this plan; prepare: ingest-case
   + CLAUDE.md).
   → verify: `git status` clean for the touched paths in both repos.
6. **Acceptance run — user-gated (interactive interview + commits):** `/case-article ct-face`.
   Failure shapes this run covers: unbuilt payload (build fires), stacks-only kind
   auto-resolution, sentinel pass (`confirmed:true`, `builtRev 1 == rev 1`), required-`tags`
   Zod validation at the dev render, embed resolution via GET (remarkCaseViewer +
   validateCaseAssets), serial assignment = L1-0009, path-scoped payload + article commits,
   fork exercised (either arm).
   → verify: draft article renders at `localhost:4321/articles/<slug>` with the ct-face viewer;
   `npm test` green; both commits present.

## Success criteria

- One invocation takes ct-face from prepared-but-unbuilt to a committed payload plus a
  Zod-valid draft article live in dev at the printed URL, serial L1-0009.
- The skill restates no volatile value (enum/schema/doctrine reads happen at runtime).
- ingest-case step 5 is a pointer; the mechanics live in exactly one place (this repo).
- Publishing remains manual; `draft: true` throughout; no PHI re-audit anywhere in this repo.

## Open questions

- None blocking. Downstream only: `--into <slug>` multi-case mode (see Non-goals) and whether
  serial↔publish-order divergence ever matters to a consumer (schema sanctions it today).
