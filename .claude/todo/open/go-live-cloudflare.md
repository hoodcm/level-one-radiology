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
assessed: 2026-07-14
---
Supersedes the prior "configure GitHub Pages DNS" task (decided 2026-07-13). The
site is not yet confirmed live, so its **first go-live goes straight to
Cloudflare** — DNS is pointed at Cloudflare, never at GitHub Pages. Execute the
migration plan `docs/plans/hosting-migration-cloudflare.md`: repo prep
(wrangler.jsonc, ci.yml) → create the Cloudflare Workers project → QA the
`*.workers.dev` preview → point the domain's nameservers at Cloudflare → transfer
the registrar GoDaddy → Cloudflare → decommission the GH Pages deploy path →
hardening (analytics beacon, cache headers, redirects).

Most phases are USER-GATED (Cloudflare account, GoDaddy dashboard, one real
test-subscribe, outward DNS + registrar changes). Blocked on the domain
confirmation (`is-domain-dns-configured`) for the registrar step.

Done: leveloneradiology.com serves over HTTPS from Cloudflare, DNS + registrar
on Cloudflare, GH Pages deploy path removed, Cloudflare Web Analytics live.
