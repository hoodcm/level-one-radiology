# Plan: Go live on Cloudflare + consolidate site services

## Context and why

leveloneradiology.com is a fully static Astro 5 site currently built by
`.github/workflows/deploy.yml` → GitHub Pages, with the domain at GoDaddy. The
newsletter form (`src/components/shared/NewsletterSignup.tsx`) POSTs directly to
the email provider's public embed-subscribe endpoint from the browser — **no
server code and no secrets exist anywhere in the build**. Confirmed 2026-07-08:
no source file references `BUTTONDOWN_API_KEY` or `PUBLIC_PLAUSIBLE_DOMAIN`; no
analytics script is installed yet.

**The site is not yet confirmed live** (open item `is-domain-dns-configured`:
DNS resolution to GitHub Pages was never verified). That makes this migration
the site's **first go-live** — so DNS is pointed **straight at Cloudflare and
never at GitHub Pages.** The prior "configure GitHub Pages DNS" task is
superseded by this plan. (If it turns out the domain *is* already resolving to
GH Pages, Phase 4 notes the zero-downtime overlap variant; the default path
assumes not-yet-live.)

This plan does two things at once:

1. **Go live on Cloudflare** — Cloudflare Workers (static assets) as the host,
   for the capabilities GH Pages lacks.
2. **Consolidate services** onto that one platform where it's free and doesn't
   cost independence — analytics, DNS, and the registrar, and eliminating the
   last would-be secrets from the build.

Go-live goals (what GitHub Pages cannot do):
1. **Custom HTTP headers** — long-cache/immutable headers for `/fonts` and
   hashed assets, security headers (HSTS etc.).
2. **Server-side redirects** (301s) instead of meta-refresh hacks.
3. **Preview deploys** per branch/PR and **instant rollbacks**.
4. **No soft bandwidth/usage caps** (GH Pages: 100 GB/mo soft limit,
   non-commercial-use ToS; Cloudflare free tier: unlimited static asset
   requests/bandwidth).
5. **A path to backend features later** (search API, gated content, image
   optimization) in the same deployment — Workers code can be added beside the
   static assets without re-platforming.

Consolidation goals (decided 2026-07-13):
6. **Analytics folds into Cloudflare Web Analytics** (free, cookieless, no
   banner) — the never-installed Plausible plan is dropped, not migrated. One
   fewer vendor, one fewer $9/mo line, and it lives in the platform being
   adopted.
7. **DNS *and* the registrar both move to Cloudflare** — DNS in Phase 4
   (required by the host move), the registrar transfer GoDaddy → Cloudflare
   Registrar in Phase 5 (Michael's call, 2026-07-13: "move from GoDaddy to make
   the move clean"). One vendor owns domain + DNS + hosting + analytics.
8. **The build ends up secret-free** — `BUTTONDOWN_API_KEY` was never consumed
   (the form uses the public embed endpoint), and the analytics beacon token is
   public. Net: no environment variables required to deploy.

Target: **Cloudflare Workers with static assets**, git-connected via Workers
Builds. This is Cloudflare's recommended path for new projects as of 2026
(Pages is maintenance-mode). The site stays 100% static — **no
`@astrojs/cloudflare` adapter**; Astro pre-renders everything and Cloudflare
serves `dist/` from its CDN. Content stays as Markdown in git; no CMS is part
of this plan (the custom remark directives — `::case`, callouts, footnote
popovers — would fight any rich-text CMS editor; revisit only if
browser-based authoring is ever wanted).

Cost: $0 for hosting + DNS + analytics (Cloudflare free plan throughout). The
registrar transfer (Phase 5) is at wholesale cost (~$10/yr for `.com`, replacing
the GoDaddy renewal — a saving, not a new cost), and includes free WHOIS
privacy.

### Out of scope (named so it isn't silently dropped)

- **Newsletter provider choice (Kit vs Buttondown) stays open.** The form
  POSTs client-side to whichever provider's embed endpoint; switching is a
  one-URL edit in `NewsletterSignup.tsx` and is owned by the separate "replace
  the React newsletter island with a static form" TODO, not this migration.
  This plan is provider-agnostic — wherever it says "the email provider," it
  means whichever is live at cutover (Buttondown today). Email is deliberately
  **not** consolidated onto Cloudflare: bulk-send deliverability is a
  reputation business Cloudflare doesn't do, so it remains the one external
  SaaS. (Send from the domain via the provider's DKIM/SPF so reputation accrues
  to `leveloneradiology.com`, keeping the provider swappable.)
- **Comments (Giscus) and search (Pagefind)** add no vendor when they arrive
  (GitHub Discussions and a build-time index respectively) — tracked
  separately, not part of this migration.

## Target service topology (end state)

| Concern | Provider (end state) | Notes |
|---------|----------------------|-------|
| Source of truth + build | **GitHub** (repo + Actions CI) | unchanged; canonical |
| Static hosting + CDN | **Cloudflare Workers** (static assets) | Phase 2–4 |
| DNS | **Cloudflare** | Phase 4 |
| Registrar | **Cloudflare Registrar** | Phase 5 (from GoDaddy) |
| Analytics | **Cloudflare Web Analytics** | replaces never-installed Plausible |
| Bot/spam protection | **Cloudflare Turnstile** (only if a form needs it) | not needed today |
| Newsletter | **one external SaaS** (Kit *or* Buttondown — open) | client-side POST; not on Cloudflare |
| Comments (future) | **Giscus** (GitHub Discussions) | no new vendor |
| Search (future, 15+ articles) | **Pagefind** (static index) | no vendor |

Two accounts actively managed (Cloudflare + email), with GitHub underneath.

## Read first (onboarding for a fresh session)

- `/Users/michael/GitHub/level-one-radiology/.github/workflows/deploy.yml` — current build + the lint gate that must survive
- `/Users/michael/GitHub/level-one-radiology/astro.config.mjs` — build hooks (case-viewer validation runs at `astro:build:start`)
- `/Users/michael/GitHub/level-one-radiology/package.json` — scripts: `lint`, `test`, `build`
- `/Users/michael/GitHub/level-one-radiology/public/CNAME` — GH Pages custom-domain file (removed in Phase 6)
- `/Users/michael/GitHub/level-one-radiology/src/layouts/Layout.astro` — base `<head>`; the analytics beacon lands here (Phase 7)
- `/Users/michael/GitHub/level-one-radiology/src/components/shared/NewsletterSignup.tsx` — the email endpoint (provider-open; not changed here)
- Cloudflare docs: https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/ · https://developers.cloudflare.com/workers/static-assets/ · https://developers.cloudflare.com/web-analytics/ · https://developers.cloudflare.com/registrar/

## Phase 0 — Confirm the domain (resolves `is-domain-dns-configured`)

Before any Cloudflare work: confirm `leveloneradiology.com` **is registered at
GoDaddy** and note its **registration date**. Cloudflare Registrar (Phase 5)
requires the domain be **> 60 days** since registration or its last transfer
(ICANN lock); if it was registered recently, Phase 5 waits until the 60-day mark
while Phases 1–4 and 6–7 proceed regardless. If the domain is *not* registered
anywhere yet, register it — at Cloudflare directly if possible, which skips
Phase 5 entirely.
→ verify: GoDaddy dashboard shows the domain under Michael's account with a
known registration date.

## Phase 1 — Repo prep (no behavior change; the GH Pages build keeps working before and after)

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
   Phase 6, the CI gate must already exist independently:

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

3. Commit both. The GH Pages build continues working unchanged (parallel-safe).

## Phase 2 — Create the Cloudflare project (user-gated: requires Michael's Cloudflare account, browser dashboard)

1. Sign up / log in at dash.cloudflare.com (free plan). This account becomes
   the infra hub (hosting, DNS, registrar, analytics).
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
- [ ] Newsletter signup with a test email → success state, confirmation email arrives (the email provider accepts the cross-origin POST — origin changes to the real domain only after cutover, so also re-test once live)
- [ ] OG tags point at `https://leveloneradiology.com` absolute URLs (they derive from `site` in astro.config.mjs, so preview-URL pages will correctly still reference the real domain)

## Phase 4 — Point the domain at Cloudflare (user-gated: outward-facing, propagation window; GoDaddy + Cloudflare dashboards)

DNS goes **straight to Cloudflare — never to GitHub Pages.** Since the site
isn't live yet, there's no traffic to preserve; this is a clean first pointing.

1. Cloudflare dashboard → Add a domain → `leveloneradiology.com`. Cloudflare
   scans and imports any existing GoDaddy DNS records — review the import,
   especially any **MX/TXT records** (email deliverability must not break; the
   email provider's sending-domain verification TXT records, if any, ride
   along). Delete any stray GH Pages `A`/`CNAME` records that were imported —
   the site never points there.
2. Cloudflare assigns two nameservers. At GoDaddy → domain → Nameservers →
   change to the assigned pair. The zone goes active on Cloudflare (minutes to
   48 h). **This nameserver change is also the prerequisite for the Phase 5
   registrar transfer.**
3. Once the zone is active: Workers project → Settings → Domains & Routes → add
   custom domains `leveloneradiology.com` **and** `www.leveloneradiology.com`
   (Cloudflare creates the apex + www records pointing at the Worker and
   provisions certs).
4. SSL/TLS mode: Full (strict).
   → verify: `dig +short A leveloneradiology.com` returns Cloudflare addresses
   (no `185.199.*` GH Pages IPs); `curl -sI https://leveloneradiology.com | grep -i server`
   shows `cloudflare`; https on apex and www both serve the site;
   `https://www.leveloneradiology.com` resolves (decide redirect-to-apex in
   Phase 7 or keep both serving).

   **Overlap variant (only if the domain was already resolving to GH Pages):**
   keep the old GH Pages `A`/`CNAME` records in step 1 instead of deleting them,
   so both hosts serve identical content during propagation; delete them once
   step 4 verifies Cloudflare is live. The default (not-yet-live) path skips
   this.

## Phase 5 — Transfer the registrar GoDaddy → Cloudflare (user-gated: outward, async 1–5 days; runs in the background)

Requires the zone active on Cloudflare (Phase 4) and the domain > 60 days old
(Phase 0). Pure consolidation + saving; the site keeps resolving throughout
because DNS is already on Cloudflare — the transfer never touches resolution, so
this can run in the background while Phases 6–7 proceed.

1. GoDaddy → the domain → **unlock** it, **disable WHOIS privacy** temporarily,
   and copy the **EPP/authorization (transfer) code**. Confirm the admin email
   on file is reachable (the transfer approval goes there).
2. Cloudflare dashboard → Registrar → Transfer domains → select
   `leveloneradiology.com` → enter the auth code → pay the one-year at-cost fee
   (adds a year to the registration; includes free WHOIS privacy).
3. Approve the transfer from the confirmation email; **do not let the GoDaddy
   registration lapse** during the 1–5 day window.
   → verify: `whois leveloneradiology.com | grep -iE "registrar|registrar url"`
   shows Cloudflare; the site resolves and serves over HTTPS unbroken the whole
   time.

## Phase 6 — Decommission the GitHub Pages deploy path (only after Phase 4 verified live)

1. Delete `.github/workflows/deploy.yml` (CI gate now lives in `ci.yml`).
2. Delete `public/CNAME` (GH-Pages-only artifact; harmless on Cloudflare but dead weight).
3. GitHub repo → Settings → Pages → disable (user-gated: repo settings UI).
4. Update docs in the same commit — single-source-of-truth sweep:
   - `CLAUDE.md`: Tech Stack table `Hosting | GitHub Pages` → `Cloudflare Workers (static assets)`; Analytics row `Plausible` → `Cloudflare Web Analytics`; Architecture tree line for `public/CNAME`; **Environment Variables table — drop both rows** (`BUTTONDOWN_API_KEY`, nothing consumes it; `PUBLIC_PLAUSIBLE_DOMAIN`, Plausible is dropped — the build now needs no env vars)
   - `CONTEXT.md`: Architecture Overview ("Deployed to GitHub Pages… analytics via Plausible" → Cloudflare Workers + Cloudflare Web Analytics); Related Work list (`GitHub Pages` → Cloudflare; replace `Plausible` line)
   - `docs/engineering.md`: deploy-pipeline description; the Analytics section (`Plausible or Fathom` → Cloudflare Web Analytics as the chosen option)
   - `CHANGELOG.md` `[Unreleased]`: the migration + consolidation entry
   → verify: `grep -rn "GitHub Pages\|github.io\|CNAME\|Plausible\|PLAUSIBLE" CLAUDE.md CONTEXT.md docs/ README.md` returns only historical/CHANGELOG/archive mentions.

## Phase 7 — Post-migration consolidation & hardening (each item optional and independent; do in follow-up sessions)

- **Cloudflare Web Analytics** (replaces the never-installed Plausible):
  Cloudflare dashboard → Web Analytics → Add a site → `leveloneradiology.com`
  → copy the beacon **token** (public, not a secret). Add the beacon `<script>`
  to `src/layouts/Layout.astro`'s `<head>`, gated to production so dev traffic
  isn't counted (e.g. `{import.meta.env.PROD && <script defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon={`{"token":"…"}`} />}`). No cookie banner (cookieless by
  design). Alternative, snippet-free: enable **automatic** Web Analytics for
  the proxied zone in the dashboard — but the explicit beacon is deterministic
  and survives any proxy-setting change, so prefer it.
  `Contracts:` production `<head>` carries exactly one analytics beacon; dev/preview carry none.
- **Cache headers**: `public/_headers` — `immutable, max-age=31536000` for
  `/fonts/*` and `/_astro/*` (content-hashed). `Contracts:` HTTP response
  headers on font/asset routes.
- **Redirects**: `public/_redirects` — decide `www` → apex 301 (or reverse).
- **Security headers**: HSTS at minimum; CSP is a bigger project (inline
  scripts from islands need auditing; the analytics beacon is one more allowed
  source to account for) — separate plan if wanted.
- **Future backend**: when a real need appears (search endpoint, gated
  content), add a Worker entry point beside `assets` in `wrangler.jsonc` — no
  re-platforming. SSR would additionally need `@astrojs/cloudflare`. The
  newsletter stays a client-side POST to the external provider — no proxy
  needed unless a provider ever requires a server-side key.
- **Media growth trigger — case stacks to R2**: a case ≈ 2 MB / ~125 files
  (measured on `public/cases/dev-synthetic/`: 121 JPEGs, 2.0 MB). The Workers
  **free plan caps a deploy at 20,000 files** → ~150 cases. At that point
  either upgrade to Workers paid ($5/mo, 100,000 files) or — better — point
  `scripts/build-case.mjs` at an R2 bucket (free egress; 10 GB free, then
  ~$0.015/GB-mo) served from `media.leveloneradiology.com`, and switch case
  manifest frame URLs to that base. Video never goes in the repo — R2 or
  Cloudflare Stream from day one.

## Rollback

Because the site isn't live on GH Pages, "rollback" before go-live is trivial:
the `*.workers.dev` preview and the GH Pages build both remain intact until
Phase 6 deletes the deploy workflow.

- Before Phase 4: nothing user-facing has changed; abandon by not switching
  nameservers.
- Before Phase 6: revert nameservers at GoDaddy to the GoDaddy defaults (the GH
  Pages build is still intact and can be re-pointed if ever wanted).
- After Phase 6: re-enable Pages in repo settings + restore `deploy.yml` and
  `public/CNAME` from git history.
- Phase 5 (registrar) is independently reversible after the 60-day post-transfer
  lock; Phase 7 items each revert on their own (remove the beacon, delete a
  `_headers` line). None is a one-way door for the site.
