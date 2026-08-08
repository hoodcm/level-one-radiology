---
id: go-live-cloudflare
title: Go live on Cloudflare (hosting + DNS + registrar + analytics)
band: next
first_surfaced: 2026-06-23
last_touched: 2026-07-13
depends_on: []
links: [docs/plans/hosting-migration-cloudflare.md, is-domain-dns-configured]
worktype: build
workstream: cloudflare-migration
assessed: 2026-08-08
---
Supersedes the prior "configure GitHub Pages DNS" task (decided 2026-07-13).
**Corrected 2026-08-08: the site IS live on GitHub Pages** (200 from
`server: GitHub.com`, serving v0.11.0, GH Pages A records, verified custom
domain + approved cert). This is a **cutover of a live site**, not a first
go-live, so Phase 4 takes the zero-downtime overlap path and GH Pages is
decommissioned only after Cloudflare is confirmed serving. Execute the migration
plan `docs/plans/hosting-migration-cloudflare.md`: repo prep (wrangler.jsonc,
ci.yml) → create the Cloudflare Workers project → QA the `*.workers.dev`
preview → point the domain's nameservers at Cloudflare → transfer the registrar
GoDaddy → Cloudflare → decommission the GH Pages deploy path → hardening
(analytics beacon, cache headers, redirects).

Two things now drive the timing:

- **Taking the repo private requires this migration first.** GitHub Pages
  publishes from private repos only on GitHub Pro or above; Cloudflare Workers
  Builds has no such gate on its free plan. Going private before Cloudflare is
  serving takes the site down. Michael intends to go private, so the ordering is
  binding.
- **The registrar transfer wants to happen before mid-September 2026.** Domain
  expiry is 2026-10-02 and an inbound transfer adds a year, replacing the
  GoDaddy renewal rather than paying it.

Most phases are USER-GATED (Cloudflare account, GoDaddy dashboard, one real
test-subscribe, outward DNS + registrar changes). The domain question is
resolved (registrar GoDaddy, created 2024-10-02, past the ICANN lock).

Done: leveloneradiology.com serves over HTTPS from Cloudflare, DNS + registrar
on Cloudflare, GH Pages deploy path removed, Cloudflare Web Analytics live.
