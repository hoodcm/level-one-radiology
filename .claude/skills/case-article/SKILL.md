---
name: case-article
run-log: required
description: Turn a prepared case from ../prepare-radiology-cases into a started article — build + validate the viewer payload, teaching-angle interview, scaffolded draft live in dev, optional voice-loaded first draft.
disable-model-invocation: true
---

# /case-article <case-id>

Take a prepared, de-identified case from the sibling repo and start the article that teaches
it: assemble the viewer payload, interview Michael for the teaching angle, scaffold a
schema-valid draft, and leave it rendering in dev. The pixels were curated and redacted
upstream in prepare-radiology-cases — that gate is the last authority over image content, so
never re-audit images here (site CLAUDE.md); this skill's job is everything *after* the images
are trusted.

Run from this repo's root. Publishing is never this skill's job: the article stays
`draft: true`, and the flip (real publishDate, lastReviewed, the on-device iPhone judgment
pass, /push) remains Michael's manual checklist.

## 0 — Preflight

- **No argument, or no such case?** List what's startable: prepared cases are the directories
  in `../prepare-radiology-cases/cases/`; cases already embedded in an article are the ids
  matched by `CASE_DIRECTIVE_RE` (src/lib/case-shell.mjs) across `src/content/articles/*.md`.
  Present the difference and let Michael pick.
- **Integrity sentinel** — the prepared case must have passed its human gate:
  `../prepare-radiology-cases/cases-src/<id>/selection.json` has `confirmed: true` and its
  `builtRev` equals `../prepare-radiology-cases/cases/<id>/case.json` `rev`. These two revs
  live in the same repo and are the *only* comparable pair (the site manifest's `rev` is a
  local build counter — never compare it to the prepared rev). If the sentinel fails, stop and
  point at the annotator gate: `npm run case:review` in the prepare repo.
- **Existing article?** If an article already embeds this case id, or the chosen slug's file
  exists, offer to continue that draft instead of scaffolding a duplicate.
- **Dev server**: Michael watches localhost:4321 live. If something is already listening
  there, use it; only start `npm run dev` (background) if nothing is — a second instance
  binds :4322 and races the first's file watcher.

## 1 — Build the payload (always)

Always rebuild — `case:build` is wholesale and idempotent (it clears the output dir), frames
are few, and there is no valid staleness check (see the rev note above). A rebuild bumps the
manifest rev, which is exactly what tells the content loader to re-render any embedding
article.

- If `case.json` carries **both** `views[]` and `stacks[]`, the plain invocation dies by
  design: the site represents one kind per case id. Ask Michael which kind this article
  embeds, pass `--kind views|stack`.

```bash
npm run case:build -- --id <id> --in ../prepare-radiology-cases/cases/<id> [--kind views|stack]
npm test
node -e "import('./src/lib/case-shell.mjs').then(m => m.validateCaseAssets('<id>'))"
```

All three green before any article work — never scaffold against a broken payload. Then
commit the payload path-scoped (`git add public/cases/<id>` — confirm with
`git diff --cached --name-only` before committing; a bad pathspec stages nothing).

## 2 — The teaching-angle interview

The diagnosis and the teaching point are Michael's — he read the study; the data carries no
findings label, and key frames can be small. Never present your own image read as the angle.

**Card A** (AskUserQuestion): what should this article teach? Offer generic angle *shapes* so
one tap can steer — a search-pattern piece, an injury-pattern deep-dive, the finding that
changes management, the pitfall/near-miss — but the substance comes from Michael: invite the
diagnosis and the one-sentence teaching point via Other or option notes.

Then ground yourself before proposing words: read the built key frames — for each series in
`public/cases/<id>/manifest.json`, `start` + the first window's `pattern` give
`<series>/<window>/<nnn(start)>.jpg` — plus `case.json` `meta`. Use what you see to phrase,
not to diagnose.

**Card B** (AskUserQuestion): propose, prefilled for confirm/adjust:

- **Title** and **slug** — editorial, drawn from the angle, not the case id (article URLs are
  permanent; the case id follows the prepare-repo slug convention,
  `<modality>-<body-part>-<type>-<diagnosis>`, and needn't match the article slug). The title is the article's H1
  and its search-result title link: make it unique, descriptive, and accurate enough that
  Google has no reason to replace it. The slug is readable hyphenated words.
- **tags** — required array; lowercase; seed from `case.json` `meta` (modality, anatomy) +
  angle words.
- **primaryTag** and **contentType** — read the current enums from `src/lib/tags.ts` first
  (never assume them; the taxonomy is the single source and it moves).

## 3 — Scaffold the draft

Write `src/content/articles/<slug>.md`:

- **Frontmatter** — every required field of the schema in `src/content.config.ts`, so the
  first dev render passes validation: title, serial, publishDate (today — a placeholder until
  publish), description (drafted, house-tight), tags, primaryTag, contentType,
  `draft: true`, keyPoints (2–3, drafted from the teaching point; complete sentences, terminal periods). Leave optional fields out;
  `lastReviewed` is set at publish.
- **Serial** — max existing `L1-\d{4}` across `src/content/articles/` plus one, derived *at
  write time* (parallel sessions are normal here; a stale interview-time value could collide).
- **Body skeleton**, shaped by the angle and the house structure (skim `docs/writing.md` —
  "Ground the Learner First" and the bottom-line convention — before writing the stubs):
  a grounded-opening stub, 2–4 section headings with a one-line `<!-- intent -->` note each,
  the case embed after the first orienting section (see
  `src/content/articles/xr-ankle-foot-trauma.md` for the shape), and a "The Bottom Line"
  closer. Stubs, not prose — the writing pass owns the words.
- **Embed** — `::case[<caption>]{id="<case-id>"}` with a factual caption derived from
  case.json (anatomy, planes, windows — e.g. "Facial CT, axial and coronal bone windows.").

**Search-facing defaults** — every article this skill starts is search-facing YMYL medical
content, so the voice skill's `google-search-central-seo` lens applies *by default*, not on
request (build-side counterpart: `.claude/rules/seo-structure.md`). The per-article moves the
scaffold exercises:

- **Description = the snippet.** The frontmatter description renders as the visible deck AND
  the meta/OG description — write it as the one- or two-sentence answer a searcher should see,
  unique to this article, mirroring what the page actually delivers.
- **Answer-shaped section headings.** Descriptive headings a passage-ranking system can lift
  ("What Entrapment Looks Like on CT", not "The Twist") — the case for cleverness is made in
  the prose, never at the expense of the heading's legibility.
- **Visible sourcing.** YMYL content earns trust through expertise made visible: cite real
  sources openly (house footnote apparatus), descriptive standalone anchor text on any link,
  Michael's authorship and first-hand read *are* the E-E-A-T route — never strip them out.
- **Depth on one page.** One comprehensive article per topic; never split an angle into stub
  variants. If the interview surfaces two genuinely different articles, say so and scaffold one.
- No AEO tricks — no chunking, no keyword engineering; the lens is explicit that the AI-search
  move is the classic move: helpful, legible, trusted.

Verify by rendering, not just type-checking: `astro check` never runs the markdown pipeline,
so it cannot exercise the embed. GET the draft's dev URL and assert the case-viewer shell is
in the HTML:

```bash
node -e "fetch('http://localhost:4321/articles/<slug>').then(r=>r.text()).then(t=>{if(!t.includes('case-viewer'))process.exit(1)})"
npm run check
```

Then commit the article path-scoped.

## 4 — Fork: draft now, or stop

Ask (AskUserQuestion): **draft the prose now**, or **stop at the scaffold**? Recommend
stopping when the piece outgrows a focused single-case read — a full teaching article
deserves a fresh, voice-loaded session with room to hold the doctrine and the corpus.

- **Draft now** — load the voice skill *with its `google-search-central-seo` lens*, read
  `docs/writing.md` and `docs/brand.md` in full, skim one or two published articles for
  cross-link candidates, then write the complete first draft into the scaffold. The
  search-facing defaults above bind the draft too. Leave it in dev for Michael's edit pass;
  it stays `draft: true`.
- **Stop** — print a continuation prompt for the writing session: article path, case id, the
  angle and teaching point in one line each, and the instruction to load voice + writing.md
  fresh.

Either way, end with:

- The dev URL (`http://localhost:4321/articles/<slug>`), file path, and serial.
- The manual publish checklist: `/seo-grade <slug>` on the finalized prose (external probes
  grade, adjudicated), flip `draft`, set real `publishDate` + `lastReviewed` (dates stay
  truthful — set at the actual event, never bumped without substantive change), the on-device
  iPhone judgment pass, then /push.

## Run record (MANDATORY — gate-enforced)

Append one completion line at the end of the run (schema:
`~/.claude/observability/README.md`). Best-effort — a failed append never
changes the outcome you report — but not optional: this skill carries
`run-log: required`, and the end-session gate blocks until a record exists for
every invocation. An aborted run still writes its record, with
`outcome: "partial"`.

```bash
echo '{"kind":"skill-run","skill":"case-article","sessionId":"'"$CLAUDE_CODE_SESSION_ID"'","workspace":"'"$PWD"'",
"outcome":"success|partial|failure",
"failureMode":null,
"deliverables":[{"claim":"<what this run delivered>","pointer":"<artifact path, or null>"}],
"notes":"<the skill's own counters / scope, one line>"}' \
  | node ~/.claude/observability/log.mjs
```
