---
id: wire-cloudflare-web-analytics
title: Wire Cloudflare Web Analytics (replaces Plausible)
band: next
first_surfaced: 2026-06-23
last_touched: 2026-07-13
depends_on: []
links: [src/layouts/Layout.astro, docs/plans/hosting-migration-cloudflare.md]
worktype: build
workstream: cloudflare-migration
assessed: 2026-07-14
---
Analytics provider decision changed 2026-07-13: **drop Plausible, use Cloudflare
Web Analytics** (free, cookieless, no banner) — it folds into the Cloudflare
platform the site is migrating to, dropping a vendor and a $9/mo line. Plausible
was never installed, so this is a re-point, not a migration. Privacy-respecting
analytics is the listed measurement tool; subscriber conversion is the keystone
metric.

Mechanics live in the migration plan (`docs/plans/hosting-migration-cloudflare.md`
Phase 6, "Cloudflare Web Analytics"): create the Web Analytics site in the
Cloudflare dashboard, then add the beacon `<script>` (public token, not a
secret) to `src/layouts/Layout.astro`'s `<head>`, gated to production. Best done
after the host is on Cloudflare (Phase 4), so the account exists — but the beacon
can be committed earlier; it just won't report until the site is live and the
Web Analytics site is created.

Done: the production `<head>` loads exactly one Cloudflare Web Analytics beacon
(none in dev/preview); the dashboard shows page views for leveloneradiology.com.
