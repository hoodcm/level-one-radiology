---
id: newsletter-buttondown-account-missing
title: Create the Buttondown account (or fix the slug) — Subscribe is fully broken
band: now
first_surfaced: 2026-07-08
last_touched: 2026-07-08
assessed: 2026-07-14
depends_on: []
links: [src/components/shared/NewsletterSignup.tsx]
worktype: build
workstream: newsletter
---
Confirmed at runtime during the site-wide sweep: the newsletter form POSTs to
`buttondown.com/…/leveloneradiology`, which 404s — the Buttondown
account/newsletter does not exist. Every live Subscribe click on the deployed
site currently fails silently into the (now-visible) error state. Email
subscribers are the site's keystone metric (CONTEXT.md) and a working signup
is explicit MVP scope — this is the single most launch-blocking open item in
the store. USER-ACTION: either create the `leveloneradiology` Buttondown
account or correct the slug the form posts to; no code change needed once the
account/slug is right.

Done: a real Subscribe submission on the deployed site succeeds end-to-end.
