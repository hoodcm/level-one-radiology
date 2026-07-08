# Plan: Migrate hosting from GitHub Pages to Cloudflare (Workers static assets)

## Context and why

leveloneradiology.com is a fully static Astro 5 site currently deployed by
`.github/workflows/deploy.yml` → GitHub Pages, with DNS at GoDaddy
(nameservers `ns15/ns16.domaincontrol.com`, apex A records → GitHub Pages IPs
`185.199.108–111.153`, `www` CNAME → `hoodcm.github.io`). The newsletter form
(`src/components/shared/NewsletterSignup.tsx`) POSTs directly to Buttondown's
public embed-subscribe endpoint from the browser — **no server code and no
secrets exist anywhere in the build**. Confirmed 2026-07-08: no source file
references `BUTTONDOWN_API_KEY` or `PUBLIC_PLAUSIBLE_DOMAIN`; no Plausible
script is installed yet.

Migration goals (what GitHub Pages cannot do):
1. **Custom HTTP headers** — long-cache/immutable headers for `/fonts` and
   hashed assets, security headers (HSTS etc.).
2. **Server-side redirects** (301s) instead of meta-refresh hacks.
3. **Preview deploys** per branch/PR and **instant rollbacks**.
4. **No soft bandwidth/usage caps** (GH Pages: 100 GB/mo soft limit,
   non-commercial-use ToS; Cloudflare free tier: unlimited static asset
   requests/bandwidth).
5. **A path to backend features later** (search API, gated content, image
   optimization, newsletter proxy) in the same deployment — Workers code can
   be added beside the static assets without re-platforming.

Target: **Cloudflare Workers with static assets**, git-connected via Workers
Builds. This is Cloudflare's recommended path for new projects as of 2026
(Pages is maintenance-mode). The site stays 100% static — **no
`@astrojs/cloudflare` adapter**; Astro pre-renders everything and Cloudflare
serves `dist/` from its CDN. Content stays as Markdown in git; no CMS is part
of this plan (the custom remark directives — `::case`, callouts, footnote
popovers — would fight any rich-text CMS editor; revisit only if
browser-based authoring is ever wanted).

Cost: $0 (Cloudflare free plan throughout).

## Read first (onboarding for a fresh session)

- `/Users/michael/GitHub/level-one-radiology/.github/workflows/deploy.yml` — current deploy + the lint gate that must survive
- `/Users/michael/GitHub/level-one-radiology/astro.config.mjs` — build hooks (case-viewer validation runs at `astro:build:start`)
- `/Users/michael/GitHub/level-one-radiology/package.json` — scripts: `lint`, `test`, `build`
- `/Users/michael/GitHub/level-one-radiology/public/CNAME` — GH Pages custom-domain file (removed in Phase 5)
- Cloudflare docs: https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/ and https://developers.cloudflare.com/workers/static-assets/

## Phase 1 — Repo prep (no behavior change; deployable to GH Pages before and after)

1. Add `wrangler.jsonc` at repo root:

   ```jsonc
   {
     "$schema": "node_modules/wrangler/config-schema.json",
     "name": "level-one-radiology",
     "compatibility_date": "2026-07-08",
     "assets": {
       "directory": "./dist",
       "html_handling": "auto-trailing-slash",
       "not_found_handling": "404-page"
     }
   }
   ```

   `not_found_handling: "404-page"` serves `dist/404.html` (built from
   `src/pages/404.astro`) with a real 404 status — same behavior GH Pages
   gives today.
   → verify: `npx wrangler dev` (after `npm run build`) serves the site
   locally from `dist/`; an unknown URL returns the styled 404 page with
   HTTP status 404. (`wrangler` runs via npx; add as devDependency only if
   the Workers Builds setup requires it.)

2. Add `.github/workflows/ci.yml` — lint + test on push/PR. Today the token
   lint gate lives only inside `deploy.yml`; when that file is deleted in
   Phase 5, the CI gate must already exist independently:

   ```yaml
   name: CI
   on:
     push:
       branches: [main]
     pull_request:
   jobs:
     check:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: 20, cache: npm }
         - run: npm ci
         - run: npm run lint
         - run: npm test
         - run: npm run build
   ```

   → verify: workflow green on next push.
   `Contracts:` CI gate = `npm run lint && npm test && npm run build` on every push to main and every PR.

3. Commit both. GH Pages deploy continues working unchanged (parallel-safe).

## Phase 2 — Create the Cloudflare project (user-gated: requires Michael's Cloudflare account, browser dashboard)

1. Sign up / log in at dash.cloudflare.com (free plan).
2. Workers & Pages → Create → **Workers** → Import a repository → connect
   GitHub account → select `hoodcm/level-one-radiology`.
3. Build settings: build command `npm run build`; deploy command
   `npx wrangler deploy` (it reads `wrangler.jsonc`). No environment
   variables needed — confirmed nothing in the build consumes any.
4. First build runs → project gets a `*.workers.dev` preview URL.
   → verify: build log shows the `astro:build:start` case-viewer validation
   ran and the build succeeded.

## Phase 3 — QA on the preview URL (user-gated: includes one real newsletter test-subscribe)

Walk the `*.workers.dev` URL against this checklist. Failure-mode shapes this
covers: path handling (trailing slashes, nested routes), binary/static asset
serving (fonts, images), non-HTML routes (RSS/sitemap), client-side JS
islands (React, custom elements), and third-party POST (CORS) — each can
break independently in a host move even when the homepage looks fine.

- [ ] Homepage renders; fonts load (check DevTools network for `/fonts/ofl/*.woff2` 200s)
- [ ] An article page with a `::case` embed: case viewer scrolls frames, fullscreen works
- [ ] Footnote popovers, callouts, table scroll on an article that uses them
- [ ] `/articles/` index, tag rendering
- [ ] `/rss.xml` returns XML; `/sitemap-index.xml` returns XML
- [ ] `/about`, and a garbage URL → styled 404 with HTTP status 404
- [ ] Newsletter signup with a test email → success state, confirmation email arrives (Buttondown accepts the cross-origin POST — origin changes from leveloneradiology.com only after cutover, so also re-test once live)
- [ ] OG tags point at `https://leveloneradiology.com` absolute URLs (they derive from `site` in astro.config.mjs, so preview-URL pages will correctly still reference the real domain)

## Phase 4 — DNS cutover (user-gated: outward-facing, propagation window; done at GoDaddy + Cloudflare dashboards)

Zero-downtime by design: GH Pages keeps serving until the nameserver change
propagates, and both hosts serve identical content during the overlap.

1. Cloudflare dashboard → Add a domain → `leveloneradiology.com`. Cloudflare
   scans and imports existing GoDaddy DNS records — review the import,
   especially any **MX/TXT records** (email deliverability must not break;
   Buttondown sending domain verification TXT records, if any, ride along).
2. Cloudflare assigns two nameservers. At GoDaddy → domain → Nameservers →
   change from `ns15/ns16.domaincontrol.com` to the assigned pair.
   **Do not delete the old A/CNAME records yet** — they keep GH Pages live
   during propagation (minutes to 48 h).
3. Once the zone is active on Cloudflare: Workers project → Settings →
   Domains & Routes → add custom domains `leveloneradiology.com` **and**
   `www.leveloneradiology.com` (Cloudflare replaces the imported GH Pages
   A/CNAME records for those two names and provisions certs).
4. SSL/TLS mode: Full (strict).
   → verify: `dig +short A leveloneradiology.com` no longer returns
   `185.199.*` addresses; `curl -sI https://leveloneradiology.com | grep -i server`
   shows `cloudflare`; https on apex and www both serve the site;
   `https://www.leveloneradiology.com` resolves (decide redirect-to-apex in
   Phase 6 or keep both serving).

## Phase 5 — Decommission GitHub Pages (only after Phase 4 verified live)

1. Delete `.github/workflows/deploy.yml` (CI gate now lives in `ci.yml`).
2. Delete `public/CNAME` (GH-Pages-only artifact; harmless on Cloudflare but dead weight).
3. GitHub repo → Settings → Pages → disable (user-gated: repo settings UI).
4. Update docs in the same commit — single-source-of-truth sweep:
   - `CLAUDE.md`: Tech Stack table `Hosting | GitHub Pages` → `Cloudflare Workers (static assets)`; Architecture tree line for `public/CNAME`; Environment Variables table (drop `BUTTONDOWN_API_KEY` — nothing consumes it; keep/annotate `PUBLIC_PLAUSIBLE_DOMAIN` only if Plausible install is still planned)
   - `docs/engineering.md`: any deploy-pipeline description
   - `CHANGELOG.md` `[Unreleased]`: the migration entry
   → verify: `grep -rn "GitHub Pages\|github.io\|CNAME" CLAUDE.md CONTEXT.md docs/ README.md` returns only historical/CHANGELOG/archive mentions.

## Phase 6 — Post-migration hardening (each item optional and independent; do in follow-up sessions)

- **Cache headers**: `public/_headers` — `immutable, max-age=31536000` for
  `/fonts/*` and `/_astro/*` (content-hashed). `Contracts:` HTTP response
  headers on font/asset routes.
- **Redirects**: `public/_redirects` — decide `www` → apex 301 (or reverse).
- **Security headers**: HSTS at minimum; CSP is a bigger project (inline
  scripts from islands need auditing) — separate plan if wanted.
- **Plausible analytics**: currently documented in CLAUDE.md but **not
  actually installed** — a `<script>` in `src/layouts/Layout.astro` plus the
  Plausible account. Separate small task; surfaced here because the migration
  audit discovered the gap.
- **Future backend**: when a real need appears (search endpoint, gated
  content, Buttondown API proxy), add a Worker entry point beside `assets` in
  `wrangler.jsonc` — no re-platforming. SSR would additionally need
  `@astrojs/cloudflare`.
- **Media growth trigger — case stacks to R2**: a case ≈ 2 MB / ~125 files
  (measured on `public/cases/dev-synthetic/`: 121 JPEGs, 2.0 MB). The Workers
  **free plan caps a deploy at 20,000 files** → ~150 cases. At that point
  either upgrade to Workers paid ($5/mo, 100,000 files) or — better — point
  `scripts/build-case.mjs` at an R2 bucket (free egress; 10 GB free, then
  ~$0.015/GB-mo) served from `media.leveloneradiology.com`, and switch case
  manifest frame URLs to that base. Video never goes in the repo — R2 or
  Cloudflare Stream from day one.

## Rollback

Before Phase 5, rollback = revert nameservers at GoDaddy to
`ns15/ns16.domaincontrol.com` (GH Pages deploy is still intact and serving).
After Phase 5, rollback = re-enable Pages in repo settings + restore
`deploy.yml` and `public/CNAME` from git history.
