---
id: dereactify-newsletter-form
title: Replace the React newsletter island with a static form + vanilla JS
band: next
first_surfaced: 2026-07-08
last_touched: 2026-07-08
assessed: 2026-07-14
depends_on: []
links: [src/components/shared/NewsletterSignup.tsx]
worktype: build
workstream: newsletter
---
The newsletter form is the site's only React island — ~72KB gzipped plus
hydration cost, all to power one email field. Surfaced during the site-wide
sweep as the single highest-leverage perf win available: a static HTML form +
~20 lines of vanilla JS (POST to Buttondown, swap in a success/error message)
reproduces the same behavior and lets `@astrojs/react` be dropped from the
dependency tree entirely (no more React runtime anywhere on the site).

Touches the same component as `newsletter-buttondown-account-missing` —
sequence with that item in mind (fixing the account first makes the rewrite
testable end-to-end; either order is workable).

Done: `NewsletterSignup` is a plain Astro component with vanilla JS, no React
runtime ships to the client, and `@astrojs/react` is removed from
package.json.
