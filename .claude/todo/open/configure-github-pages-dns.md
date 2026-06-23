---
id: configure-github-pages-dns
title: Configure GitHub Pages DNS
band: next
first_surfaced: 2026-06-23
last_touched: 2026-06-23
depends_on: []
assessed: 2026-06-23
---
Configure DNS so leveloneradiology.com resolves to GitHub Pages (A/AAAA +
CNAME records at the registrar; enable Pages custom domain + HTTPS).
`public/CNAME` already holds `leveloneradiology.com` and the deploy workflow
exists — the remaining work is the registrar-side DNS, an external/infra step.
Stated priority #2. Related open question: whether the domain is registered yet
(see is-domain-dns-configured).

Done: leveloneradiology.com serves the deployed site over HTTPS.
