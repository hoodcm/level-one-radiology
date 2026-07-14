---
id: is-domain-dns-configured
title: Confirm leveloneradiology.com registered at GoDaddy + transfer-eligible
band: question
first_surfaced: 2026-06-23
last_touched: 2026-07-13
depends_on: []
links: [go-live-cloudflare, docs/plans/hosting-migration-cloudflare.md]
assessed: 2026-07-13
---
Open question, reframed 2026-07-13 (DNS now goes straight to Cloudflare, not GH
Pages — see go-live-cloudflare): is leveloneradiology.com **registered at
GoDaddy**, and what is its **registration date**? `public/CNAME` declares the
domain but does not confirm registrar ownership. The date matters because
Cloudflare Registrar (migration plan Phase 5) requires the domain be > 60 days
since registration/last transfer; if registered recently, the registrar transfer
waits for the 60-day mark while the rest of the go-live proceeds. If it's not
registered anywhere yet, register it at Cloudflare directly and skip the transfer.

Answered when: registrar ownership + registration date are known (feeds
go-live-cloudflare Phase 0).
