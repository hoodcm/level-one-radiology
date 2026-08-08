# Token Maturity Audit — claude.com-Informed Redesign

**Status**: **IMPLEMENTED 2026-08-08** — all 10 steps landed and verified; archived record.
**Date**: 2026-08-07 (written) · 2026-08-08 (implemented)

**What shipped.** All ten steps, in order, each verified against its own verify line. Gate at close:
`npm run lint`, `npm run check`, `npm run build` all exit 0; vitest 186 passing across 10 files
(baseline was 48 across 7 — this run added 3 contract-test files). The retired-token sweep returns
**zero** hits in shipped `src/`, with the `docs/archive/` positive control at 32.

**What the verification caught** (both real, both invisible to the build):
- `.cv-fs__close`'s alpha overlay border silently lost to `.cv-fs__chip`'s `border` shorthand — equal
  specificity, later source order. Found by measuring the element, not by reading the edit.
- A left-behind `variant=` prop on the two `<Tag>` call sites in `[slug].astro`, caught by
  `npm run check` exactly as step 3's verify line predicted.

**Deviations**: four, recorded in full below — one user-directed (the brand-gold token split) and three
mechanical.

**Post-implementation review changed three plan decisions.** A deep review (2 scouts + a senior-read
seat + one verifier) confirmed 23 findings; Michael took all four fix groups. Three of them revise
what this plan specified, so the plan's design section above is no longer the shipped truth on:

1. **`--color-border-subtle` is `--gray-30`, not `--gray-22`.** The plan had subtle share the
   secondary swatch ("same step, two roles"). That makes a subtle border on a bg-secondary surface
   1.00:1 — the mobile INDEX separators rendered invisible. An alpha hairline held one perceptual
   weight on every ground; an opaque one cannot, so the step must be picked for the grounds it lands
   on.
2. **Red ships in two weights.** `--color-signal-red-text` (`#E05A75`, the value Branch B priced)
   carries small red text; the saturated red is large-text-only. The plan retired the red *chip* for
   failing AA at 11px but did not sweep the two surviving small-red-text sites, so it shipped
   violating its own stated rule.
3. **The imaging carve-out covers two elements, not three.** `.cv-fs__close` is absolutely positioned
   over the stage but is a `.cv-fs__chip`, whose opaque background paints under its own border — so
   its alpha never met slice pixels. Position was the wrong test; what sits *under* the border is the
   right one.

Also post-review: print pins every fluid token (vw resolves against the page box, so saved PDFs were
silently growing), the lint gate and its hook no longer report clean on paths they did not check, and
the token test dropped `fs.globSync` (Node 22 only; CI pins Node 20).

**Still open — Michael's call, deliberately not self-approved**: step 10's on-screen sign-off that the
raised-surface muddiness is resolved. Everything measurable was measured; the calibrated-display
judgment is his. Screenshots in `~/Downloads/tm-final-*.png`.

## Context & why

Level One's token system is directionally right (warm dark ramp, role tokens, single-source
discipline) but less mature than the reference system scraped in
[docs/design/claude-com-reference.md](../design/claude-com-reference.md): six signal hues where
the reference spends one accent, alpha borders disconnected from the surface ramp, breakpoint-stepped
type where the reference interpolates fluidly, and a body-text dimming that used the wrong lever for
reading strain. Michael also flagged the raised surfaces (callout cards, article cards) as
"muddy" — diagnosed as fills doing definition work borders should do, compounded by a constant
warm spread that is proportionally strongest exactly in the mid-dark zone.

This is a **redesign toward a target architecture**, not a conversion preserving current rendered
appearance. Mid-viewport sizes, border weights, and surface fills are *expected* to change; the
verify steps check the new system reads well, not that it matches the old render.

All color values below were chosen interactively by Michael in a live tuning artifact
(2026-08-07 session) — they are decisions, not proposals.

## Locked decisions

1. **Surface ramp re-derived at warm spread +2** (R = G+1, B = G−1), replacing the +3 formula
   (R = G+1, B = G−2). Darks neutralize slightly; systemic warmth remains in the text ramp, whose
   wider spread (R−B ≈ 10–20, documented in colors.css) is deliberate and unchanged.
2. **Raised-fill lift drops +16 → +8**: `--color-bg-raised` sits one notch above ground
   (`#1B1A19`); plane definition transfers to borders. Chosen anti-mud lever.
3. **Borders become opaque ramp steps**: subtle `#171615`, default `#252423`, strong `#373635`.
   Values are designed for the new look, not converted from the old alpha composites.
   **Carve-out**: borders compositing over CT imaging pixels in the case viewer stay
   component-local alpha (an overlay on an image is a different job) — scoped in
   `src/styles/tokens/case-viewer.css`, documented there.
4. **Signal palette reduces to gold + cyan/teal + red.** `--color-signal-orange/violet/magenta`
   are deleted (not deprecated). Tags become neutral chips; red keeps critical/clinical meaning only.
5. **Cyan splits into two voices, one hue family**: instrument cyan `#2ACEC2` (case viewer only,
   unchanged) and apparatus teal `#58B7AF` (key points, note callouts, editorial apparatus).
6. **Gold gains a large-area form**: `--color-gold-soft: #E1C274` (gold mixed 40% toward ivory)
   for selection background and band washes. Saturated gold `#D8A82C` stays for small dense marks
   (CTA, focus, progress). **Links stay gold** — Michael's explicit call, rejecting the
   reference's text-colored-link practice.
7. **`.prose` reading color reverts to `--color-text-primary`** (~14.4:1 on bg-primary, before and
   after the ramp re-derivation). The lowered peak
   whites (anti-halation) stand — no 17:1 chase. Strain relief now comes from quieter borders,
   lower fills, and fewer hues.
8. **Fluid `clamp()` type/spacing for the editorial scale**: display/headline/title/deck sizes,
   prose heading sizes (tokenized first — they are raw literals today), section spacers, card
   padding. **Stays stepped**: body reading size (17px), `--lh-reading` (measure-driven),
   UI/meta/micro sizes, and the grid triple (`--grid-margin`/`--grid-gutter`/`--grid-columns` —
   one coupled system; a column-count jump is inherently discrete).
9. **Formal swatch layer** (`--gray-*` warm-gray steps) with existing role tokens re-pointed at
   it. Consumers use roles only; a new lint check enforces it. The ramp is *designed* (surfaces
   on the +2 formula, text steps on their own documented spread rule) — not a catalogue of
   today's accidents, and current hexes may shift a step toward coherence.

## Design

### Ramp + roles (`src/styles/tokens/colors.css`)

Swatch layer named by green-channel luminance (the formula's free variable), sparse — only steps
with consumers. Surfaces (spread +2): deepest G10 `#0B0A09`, primary G18 `#131211`,
secondary G22 `#171615` (re-derived midpoint; shares the border-subtle step), raised G26
`#1B1A19`, active G34 `#232221`, elevated G42 `#2B2A29`. Border steps: G22/G36/G54 (subtle
shares the secondary swatch — same step, two roles). Text swatches keep current hexes
(`#E5E1DB`, `#EFEAE0`, `#D7D1C7`, `#9D9489`, `#6D655B`) with their spread rule stated in the
comment. Role tokens keep their names and re-point; consumers untouched. Legacy aliases
(`--color-imaging-black` … `--color-burst-magenta`) deleted — verified zero consumers in `src/`
(only `docs/archive/`).

New tokens: `--color-gold-soft: #E1C274`, `--color-teal-apparatus: #58B7AF`.
`--color-selection-bg` re-points to gold-soft (`--color-selection-fg` stays `--color-on-primary`
= bg-deepest — 11.5:1 on gold-soft, no change needed). `--color-signal-cyan` remains the
instrument value `#2ACEC2`; apparatus consumers move to the teal token.

`--color-border-accent` (colors.css:59, `#232220` — the *old* raised step, so an orphan literal
off the new ramp) is deleted with the legacy aliases: verified zero consumers in `src/` (only its
own definition; `docs/archive/` aside). Its mention in `docs/design/tokens.md` goes in the docs
sweep.

**`<meta name="theme-color">` mirror**: `src/layouts/Layout.astro:67` hard-codes `#0B0A08` — the
one literal `check-inline-colors.mjs` blesses (script comment: "Its value must mirror
`--color-bg-deepest`"). It moves to `#0B0A09` with the swatch re-derivation, or the invariant
silently breaks.

### Palette reduction

**Chip hue scope — decided: Branch A.** Michael chose all-neutral chips (2026-08-07), the literal
reading of Locked decision 4: taxonomy-as-color is fully retired. **Execute Branch A; Branch B is
retained below as the rejected alternative only — do not re-open the choice.**

*Invariant Branch A must hold*: the `PRIMARY_TAGS` / `CONTENT_TYPES` **keys** are the source
of the content schema's enums (`PRIMARY_TAG_NAMES`/`CONTENT_TYPE_NAMES` → `z.enum` at
`src/content.config.ts:19-20`, typed as non-empty tuples). Both maps and every key stay; only the
*values* and the variant plumbing are in play. Deleting a map breaks article frontmatter
validation for the whole collection.

- **Branch A — all chips neutral — CHOSEN, execute this** (taxonomy-as-color fully retired; no new
  value; deletes code):
  - `src/lib/tags.ts`: every `PRIMARY_TAGS`/`CONTENT_TYPES` value → `'default'`; `TagVariant`
    reduces to the single member `'default'`. A one-member union makes `tagVariant()` /
    `contentTypeVariant()` (`:38-39`) constant, so delete both and the
    `satisfies Record<string, TagVariant>` guards; keep `contentTypeLabel`, both `*_NAMES` exports,
    and both maps' keys. Header comment rewritten: taxonomy-as-color is retired; adjacent chips
    (topic + content-type) render identically — accepted.
  - `src/components/shared/Tag.astro`: drop the `variant` prop and `variantClass` (`:4`, `:8`,
    `:10`, `:14`) — `<Tag>` renders `class="tag"` only.
  - Call sites: `src/components/shared/ArticleCard.astro:41-42` and
    `src/pages/articles/[slug].astro:77-78` drop `variant={…}`; drop the now-unused
    `tagVariant`/`contentTypeVariant` imports (`ArticleCard.astro:4-5`, `[slug].astro:8`).
  - `src/styles/components/homepage.css`: **all five** `.tag--signal-*` blocks deleted
    (`:328-352`); the base `.tag` rule (`:297`, muted text + `currentColor` border) is the only
    chip style left. `--color-signal-red` survives for callouts only — the contrast problem below
    disappears with the red chip.
- **Branch B — three taxonomy hues survive — REJECTED 2026-08-07, retained for the record only**
  (needs one new token). Two
  consequences are folded in below rather than left to the implementer, because Branch B without
  them leaves the plan self-contradictory: the red chip fails contrast, and a cyan chip would
  contradict Locked decision 5 (instrument cyan is case-viewer-only). **The teal variant's
  identifier is `teal-apparatus`** — one spelling, used in all four places, since `Tag.astro`
  derives the class as `` `tag--${variant}` `` and any mismatch between the union, the map values,
  and the CSS leaves those chips silently unstyled:
  - `src/lib/tags.ts`: `TagVariant` =
    `'default' | 'signal-red' | 'teal-apparatus' | 'signal-yellow'`;
    Chest/Neuro/AI & Policy/commentary/case-analysis → `'default'`; Trauma stays `'signal-red'`;
    Abdomen + educational → **`'teal-apparatus'`** (not `'signal-cyan'`); MSK stays
    `'signal-yellow'`.
  - `src/components/shared/Tag.astro:4`: variant union updated to the same four members.
  - `src/styles/components/homepage.css`: `.tag--signal-violet` (`:338`) and `.tag--signal-orange`
    (`:348`) blocks deleted; `.tag--signal-cyan` (`:333`) **renamed** to `.tag--teal-apparatus`,
    consuming `--color-teal-apparatus` (7.85:1 on bg-primary / 7.58:1 on bg-secondary);
    `default` chip = muted text + `--color-border-default` outline.
  - **Red chip contrast**: `#D03454` at 11px uppercase is 3.83:1 on bg-primary and 3.56:1 on
    bg-raised, both failing 4.5:1. The derivative `#E05A75` measures 5.25:1 and 4.87:1, passing on
    both grounds; it needs a real token — `--color-signal-red-text` in `colors.css`, consumed by
    `.tag--signal-red` only. The callout/critical red stays `--color-signal-red`, unchanged.
- `src/styles/components/prose.css` code colors: `--astro-code-token-keyword` (`:266`) and
  inline-code color (`:290`) move from violet to `--color-text-primary` (bright neutral — quiet
  code panel, no second accent in prose); string tokens (`:267`, `:268`) move from
  `--color-signal-cyan` to `--color-teal-apparatus`. Scheme comment at prose.css:259–262
  rewritten.
- Apparatus cyan → teal, full consumer list (grep `signal-cyan` in `src/`): `prose.css`
  `.key-points__label` (`:470`), `.callout` note tint (`:589`), `.callout__label` (`:609`);
  `homepage.css` `.newsletter-inline__status` (`:468` — a status message is editorial apparatus,
  not the instrument). Staying instrument cyan: everything in `case-viewer.css` (component +
  tokens, incl. `--cv-ring`) and the two dev-only harness pages
  (`src/pages/dev/[spike].astro:484`, `src/pages/dev/motion/[view].astro:253` — unshipped
  scaffolding, deliberately out of the sweep).
- `src/styles/main.css`: `@theme` re-exports of the three deleted tokens removed (verified: no
  Tailwind utility consumers).

### Borders

Role tokens become the opaque values above. Sweeps:
- `src/styles/tokens/wireframe-tunnel.css` — `--wt-ink` (`:11`, a raw `rgba(255,255,255,0.05)`
  literal) re-pointed to a border token. `--wt-ink-base` (`:12`) already reads
  `--color-border-default`, so it flips opaque for free — confirm the tunnel still reads at both
  ink weights rather than assuming it.
- Case-viewer carve-out, **two files**: the `--cv-border-overlay-*` alpha tokens are *defined* in
  `src/styles/tokens/case-viewer.css` (with the why-comment); the consumers are *re-pointed* in
  `src/styles/components/case-viewer.css`. Classify by **compositing context, not by proximity in
  the file** — the discriminator is "does this element's border sit on top of slice pixels":
  - **Overlay (alpha carve-out)** — absolutely positioned over `.cv__stage` / `.cv-fs__stage`:
    `.cv__activate` rest + hover borders (`:171`, `:187` — it sits on `--cv-scrim` at the stage's
    centre); `.cv-fs__wl` (`:937` — inside the absolutely-positioned `.cv-fs__readout`);
    `.cv-fs__close` (`:868-878` — an *absolutely positioned* `.cv-fs__chip`, so it floats over the
    stage while its in-bar siblings do not; needs its own border overrides rather than editing the
    shared `.cv-fs__chip` rules, and covers hover/`aria-pressed` too).
  - **Chrome (opaque roles)** — everything in a bar, because `.cv__bar` and `.cv-fs__bar` are flex
    siblings *below* the stage, never over it: the range track + thumb (`:562-588`, which use
    `--color-border-strong` as a **fill**, not a border — the new opaque `#373635` is within a
    channel of the old alpha composite on bg-primary, so the track should not visibly shift);
    `.cv__fs` (`:542`, `:550`); `.cv__chips`/`.cv__tabs` buttons; `.cv-fs__chip` in its in-bar
    position (`:895`, `:903`, `:908`); the views rail (`:652`, `:659`, `:671`, `:676`).
  - **The shared focus rule stays opaque.** `:193-199` groups five selectors — `.cv__activate`
    plus four non-overlay controls — so it cannot be re-pointed wholesale, and splitting a working
    rule to alpha-ize one border buys nothing: the focus cue over imaging is `--cv-ring` (the cyan
    `box-shadow`), not the 1px border. Leave the rule as one opaque declaration and say so in the
    carve-out comment, so a later reader doesn't "fix" it.
- `src/styles/components/homepage.css:953-978` — `.feature-band__surface` is the one consumer that
  derives a **transient alpha from** a border token: `color-mix(in srgb, var(--color-border-default)
  calc(100% * (1 - var(--fb-progress))), transparent)` melts the card's border as it inflates to
  full-bleed. **Keep the mechanism unchanged** — `color-mix` toward `transparent` produces the same
  0→100% alpha ramp whether the base is `rgba()` or opaque, so an opaque `#252423` base still melts
  correctly, and at rest it reads as a *more* definite hairline on the bg-deepest band, which is the
  point of the whole change. What does need doing: rewrite the now-wrong comment at `:962-963`
  ("identical alpha math to the old rgba literal") — the alpha is now derived from an opaque role,
  not inherited from one — and confirm the reduced-motion pin at `:975` still resolves to the same
  rest value. This is a deriving-a-fade consumer, not an alpha border token, so it is *not* a second
  carve-out.
- `src/styles/tokens/print.css` — keeps re-basing exactly the three border roles (`:26–28`) for
  print (its own opaque light values or existing black-alpha; print is a theme remap,
  mechanism-free to differ). It does **not** rebase `--color-border-accent`, so that deletion is
  print-neutral.
- `--cv-hud-glow` comment (`tokens/case-viewer.css:20–22` — cites the retired alpha-border idiom)
  rewritten, along with the four `imaging-black` comment mentions
  (`tokens/case-viewer.css:37,41`, `components/case-viewer.css:717,734`) now that the alias is
  gone.

### Reading hierarchy (`prose.css`)

`.prose` → `--color-text-primary`; comment rewritten to record the new reasoning (borders/fills
are the strain lever; do not re-dim). The rule: **reading surfaces go to primary, apparatus stays
secondary.** `prose.css` holds exactly nine `--color-text-secondary` selectors that are text tiers
(the two at `:271`/`:273` are Shiki `:root` code-token vars, not a tier — they are handled in the
code-colors pass instead). All nine, assigned:

| Selector | Line | Tier | Why |
|---|---|---|---|
| `.prose` (body) | `:109` | → **primary** | Locked decision 7 |
| `.prose tbody td` | `:573` | → **primary** | tables are read, not skimmed |
| `.key-points__list` | `:487` | → **primary** | reading surface inside the card |
| `.prose dd` | `:672` | → **primary** | definition bodies are prose in the reading flow |
| `.article__deck` | `:68` | stays secondary | large-size standfirst carries the dimmer step — accepted above primary body |
| `.prose blockquote` | `:218` | stays secondary | apparatus |
| `.callout` | `:593` | stays secondary | apparatus |
| `.reference-card p, li` | `:652` | stays secondary | apparatus |
| `.article__subscribe-subhead` | `:333` | stays secondary | apparatus (page furniture, not reading) |

Read-next also sits at secondary and stays there, but it lives in
`src/styles/components/apparatus/read-next.css:27` — a **different file**, so it is not one of the
nine and needs no edit.

### Fluid scale (`typography.css`, `spacing.css`, `prose.css`)

Every fluid token clamps over a **320→1280px** viewport window (max reached at 1280, not 1440 —
avoids shrinking the common laptop range). **Endpoints are not new values**: each is the token's
existing mobile literal and its existing widest-breakpoint literal, so the interpolation replaces
the step without moving either end. `--fz-wordmark-hero` (`typography.css:444`) is already a
`clamp()` and is the naming/derivation precedent — the mechanism is in use, not new.

**One reconciliation with Locked decision 8**, which lists "headline" among the fluid sizes: on
inspection `--fz-headline` has no ramp to interpolate — its 60em override sets the *same* `1.5rem`
(`typography.css:392` and `:456`). It therefore stays a fixed token and the redundant override is
deleted. This is a fact about the current file, not a reversal of the decision; the table below is
authoritative on which side each token lands.

`.article__title` and `.article__deck` are raw literals in `prose.css` today. Per the project's
single-source rule a `clamp()` written inline in a component file is still a literal, so both get
tokens — **`--fz-article-title`, `--fz-article-deck`** in `typography.css` — matching the treatment
the prose headings get.

**Retire the now-dead breakpoint overrides — this is load-bearing, not tidying.** A `@media` block
that still sets a token the `:root` rule now clamps *wins* above that breakpoint, so leaving one in
place silently un-fluidizes the token in exactly the desktop range this redesign targets. Retire
them **surgically**: every one of these blocks also carries declarations that must survive.

| File / block | Delete | Keep |
|---|---|---|
| `prose.css:60`, `:61`, `:72` | the whole lines (size-only overrides) | — |
| `prose.css:185-191` | the two `font-size` declarations | `margin-top: 2.5rem` (heading rhythm) |
| `typography.css:452-462` | `--fz-display-l`, `--fz-display`, `--fz-headline` | `--lh-reading: 1.44` + its comment (stepped by Locked decision 8) — the block stays |
| `spacing.css:106-112` (37.5em) | `--card-padding-lg` (`:110`) | `--grid-columns`, `--grid-margin` |
| `spacing.css:114-126` (60em) | `--card-padding-md` (`:118`), `--card-padding-lg` (`:119`), `--section-spacer` (`:120`), `--section-spacer-sm` (`:121`) | `--grid-columns`, `--grid-margin`, `--gap-lg`, `--nav-height`, `--logo-height` |

| Token (file) | Fluid? | 320px end | 1280px end | Today's stepping |
|---|---|---|---|---|
| `--fz-display-l` (typography) | yes | `2.25rem` | `3rem` | step at 60em |
| `--fz-display` (typography) | yes | `1.75rem` | `2rem` | step at 60em |
| `--fz-article-title` (**new**, typography ← `prose.css:52,60,61`) | yes | `2rem` | `3.25rem` | 3 steps (base/60em/80em) collapse into one interpolation |
| `--fz-article-deck` (**new**, typography ← `prose.css:66,72`) | yes | `1.375rem` | `1.5625rem` | step at 60em |
| `--fz-prose-h2` (**new**, typography ← `prose.css:133,189`) | yes | `1.25rem` | `1.5625rem` | step at 60em |
| `--fz-prose-h3` (**new**, typography ← `prose.css:134-135,190-191`) | yes | `1.0625rem` | `1.1875rem` | step at 60em |
| `--fz-prose-h4` (**new**) | yes | `1.0625rem` | `1.1875rem` | shares h3's values today — keep it a separate token so the two can diverge without touching consumers |
| `--section-spacer` (spacing) | yes | `var(--space-6)` | `var(--space-8)` | step at 60em |
| `--section-spacer-sm` (spacing) | yes | `var(--space-4)` | `var(--space-5)` | step at 60em |
| `--card-padding-md` (spacing) | yes | `1.5rem` | `2rem` | step at 60em |
| `--card-padding-lg` (spacing) | yes | `2rem` | `3rem` | 3 steps (base/37.5em/60em) collapse |
| `--fz-headline` (typography) | **no** | — | — | its 60em override is the *same* `1.5rem`, so there is no ramp to interpolate; delete the redundant override, leave the token fixed |
| `--card-padding-sm` (spacing) | **no** | — | — | single value, no breakpoint step today; stays fixed |
| `--gap-lg`, `--nav-height`, `--logo-height` (spacing) | **no** | — | — | chrome metrics, not the editorial scale; stay stepped |
| `--fb-card-h` (spacing) | **no** | — | — | switches on an **aspect-ratio** media query, not width — a width clamp cannot express it |
| body `17px`, `--lh-reading`, `--fz-ui`/`--fz-micro`/`--fz-plate`, `--grid-*` | **no** | — | — | stepped by Locked decision 8 |

Section-spacer and card-padding clamp endpoints stay `var(--space-*)` references (keeps the scale
linkage). Constraint documented in `spacing.css`: **no JS may read a fluid token via
`getPropertyValue`** (returns unresolved `clamp()`); `DetectorHero.astro`'s `token()` helper
(`:197`) gets a `Number.isNaN` guard. The two other computed-style readers are already safe and
need no change — `WireframeTunnel.astro:27` reads resolved `paddingLeft` (px, not a custom
property) and `DetectorHero.astro:268` deliberately measures a box instead of reading
`--grid-margin`; its comment already records why.

Two independent trunks; the docs sweep consumes both and runs last.

```
colors.css (swatches → roles)              typography.css + spacing.css (clamps)
   │                                          │
   ├─ main.css @theme cleanup                 ├─ prose.css title/deck/heading sizes
   ├─ Layout.astro theme-color mirror         │    + retire the dead @media overrides
   ├─ tags.ts → Tag.astro → homepage.css      └─ DetectorHero token() NaN guard
   │    (+ the two <Tag> call sites)
   ├─ prose.css code colors + apparatus teal
   ├─ prose.css reading-tier pass
   ├─ wireframe-tunnel.css / case-viewer.css (border sweep + imaging carve-out)
   ├─ homepage.css .feature-band__surface (comment only)
   └─ check-inline-colors.mjs (swatch guard)

                     └────────────► docs sweep (last) ◄────────────┘
```

## Design trade-offs / Non-goals

- **Light mode**: the swatch layer enables it; nothing is built. Downstream.
- **Text-colored links**: recommended (collapses gold to a true 10%), rejected by Michael —
  links stay gold. Do not re-propose.
- **Their exact values**: endpoints, hues, and faces stay ours throughout.
- **Tag discriminator replacement**: adjacent identical chips accepted; no new
  shape/casing/color discriminator (speculative scope).
- **Preserving current rendered appearance**: explicitly not a goal (see Context).
- **`--grid-margin` fluidization**: rejected — coupled to the stepped column count; also the
  JS-read hazard.
- **Alpha borders site-wide**: rejected in favor of opaque roles + imaging carve-out. The
  skeptic's preserve-alpha case (print, overlays) is answered by the carve-out and print's
  existing re-basing, not by keeping the mechanism globally.
- **Re-mechanising the feature-band border melt** (e.g. animating `border-width` to zero instead of
  `color-mix`-ing toward `transparent`): rejected. The existing melt is correct against an opaque
  base, while a width animation would snap rather than fade at the last pixel and would perturb the
  box that `:958-960`'s width/min-height math depends on. Deriving a fade from an opaque role token
  is not the alpha-border mechanism this plan retires.
- **ToS/Privacy pages**: separate open item, untouched.
- **Inventing a value to close a specification gap**: out of scope everywhere. Every endpoint in the
  fluid table is an existing repo literal; both chip branches use only values already approved.
  Consequence, accepted deliberately: `--fz-headline` and `--card-padding-sm` **stay fixed** rather
  than gaining a fluid maximum, because neither has a second endpoint today and inventing one is a
  taste call, not an executability fix. Same for `--gap-lg`/`--nav-height`/`--logo-height`.
- **Splitting the shared case-viewer focus rule** (`components/case-viewer.css:193-199`) so
  `.cv__activate`'s focus border could join the alpha carve-out: rejected. The rule groups five
  selectors, four of them not over imaging, and the focus cue over a slice is the cyan `--cv-ring`
  box-shadow, not the 1px border — splitting a working rule buys no visible fidelity.
- **Fluidizing the heading `margin-top` step or the `--fb-card-h` aspect-ratio switch**: out of
  scope. The first is rhythm, not the type scale; the second keys on aspect ratio, which a
  width clamp cannot express.

## Files to read first

1. `docs/design/claude-com-reference.md` — the reference system
2. `src/styles/tokens/colors.css`, `typography.css`, `spacing.css` — current tokens
3. `src/styles/components/prose.css` — reading surface, code colors, heading literals
4. `src/lib/tags.ts`, `src/components/shared/Tag.astro`, `src/styles/components/homepage.css` §tags
5. `src/styles/tokens/case-viewer.css` + `src/styles/components/case-viewer.css` — border/fill
   consumers over imaging
6. `src/styles/main.css` — the `@theme` re-export surface + the `@layer base` global
   `border-color` default
7. `src/layouts/Layout.astro` — the `theme-color` meta literal that mirrors bg-deepest
8. `docs/design/philosophy.md`, `docs/design/tokens.md`, `docs/design/components.md`,
   `docs/design/reasoning/accessibility.md` (the most stale of the set),
   `docs/design/reasoning/typography.md` — docs to sweep
9. `scripts/check-inline-colors.mjs`, `.stylelintrc.json` — the lint gate to extend

## Reuse

- Warmth formula + luminance stepping (colors.css header) — carried, re-parameterized.
- `scripts/check-inline-colors.mjs` — the swatch guard extends this script (stylelint's
  declaration-strict-value cannot see custom-property names).
- The tuning artifact's mix/derivation math (session artifact) — gold-soft and teal values are
  already final; no re-derivation needed.

## Steps

1. **Restructure `src/styles/tokens/colors.css`**: swatch layer + role re-pointing + new values
   per Locked decisions 1–6; delete the ten legacy aliases, `--color-border-accent`, and the
   three retired signal tokens. Same step: bump the `theme-color` literal in
   `src/layouts/Layout.astro:67` to the new bg-deepest.
   `Contracts:` the role-token surface (names unchanged, values changed); deleted token names.
   → verify: `npm run build` succeeds; `grep -rn "var(--color-\(imaging-black\|control-charcoal\|console-white\|textbook-ivory\|level-one-red\|sunset-orange\|chroma-yellow\|scanline-cyan\|cosmic-violet\|burst-magenta\|border-accent\))" src/` is empty (bare-word `imaging-black` also appears in four case-viewer *comments* — `tokens/case-viewer.css:37,41`, `components/case-viewer.css:717,734` — prose citing a retired token name, not consumers; renamed in step 5's comment pass); `grep -n "theme-color" src/layouts/Layout.astro` shows the new hex, and `npm run lint:markup` still passes.
   Cross-file greps for the three retired **signal** tokens cannot be clean until step 4 lands —
   they are checked at step 10, not here.
2. **`src/styles/main.css`**: remove `@theme` re-exports of the three deleted signal tokens
   (`:68`, `:71`, `:72`); global `border-color` default (`:105`) now resolves opaque.
   → verify: `npm run build` succeeds; `grep -n "signal-orange\|signal-violet\|signal-magenta" src/styles/main.css` is empty; the newsletter form (the `@theme` shadcn consumers at `:79–92`) still renders fully styled at localhost:4321.
3. **Tag system — Branch A** (decided; Design §Palette reduction). Execute Branch A's file list
   exactly: `tags.ts`, `Tag.astro`, `homepage.css`, and the two `<Tag>` call sites
   (`ArticleCard.astro`, `articles/[slug].astro`).
   `Contracts:` `TagVariant` union collapses to `'default'`; `<Tag>`'s `variant` prop is removed.
   → verify: `npm run check` clean (the union collapse propagates to both call sites — a
   left-behind `variant=` prop is exactly what this catches); `npm run build` succeeds **and** an
   article page renders its two chips, which is the real test that the schema enums survived the
   `PRIMARY_TAGS`/`CONTENT_TYPES` edit; the neutral chip's contrast at 11px computed ≥4.5:1 on
   bg-primary AND bg-raised (muted text: 6.27:1 / 5.82:1 — both grounds checked because chips
   appear on cards as well as page ground; the red-chip AA failure that motivated this branch
   choice, 3.83:1 / 3.56:1, is retired along with the hue).
4. **Code + apparatus colors — `prose.css` *and* `homepage.css`**: in `prose.css`,
   keyword/inline-code → text-primary, strings → teal-apparatus, key-points label + note-callout
   tint/label → teal-apparatus; in `homepage.css`, `.newsletter-inline__status` (`:468`) →
   teal-apparatus. Work the Design §Palette reduction consumer list, not this summary line.
   → verify: article page code block renders with distinct keyword/string colors; the newsletter
   inline status message renders teal, not instrument cyan; `grep -rn "signal-violet" src/` empty.
   **`--color-signal-cyan` survives, so a bare grep for it proves nothing** — instead assert the
   allowlist: every remaining `signal-cyan` hit in `src/` is in `case-viewer.css` (component or
   tokens) or one of the two named dev harness pages, and nothing else.
5. **Border sweep**: wireframe-tunnel re-point (`--wt-ink`); case-viewer carve-out tokens + the
   overlay/chrome split per Design (classify by compositing context — the file's grouped rules do
   not line up with it, and the shared focus rule stays opaque *on purpose*, recorded in the
   comment); `homepage.css` `.feature-band__surface` — mechanism unchanged, comment at `:962-963`
   rewritten; `--cv-hud-glow` + the four `imaging-black` comments; print.css checked (no change
   expected, confirm print preview).
   → verify (each named element, not "the viewer looks fine"): the feature-band card border reads
   at rest on the bg-deepest band and still melts smoothly to invisible as it inflates to
   full-bleed — check rest, mid-scroll, and full-bleed, plus once with reduced-motion forced (the
   `:975` pin);
   the three **overlay** borders
   still lighten over a bright slice — `.cv__activate` at rest and hover, `.cv-fs__wl`, and
   `.cv-fs__close` in fullscreen over a bright coronal (screenshot each); the **chrome** borders
   read unchanged against their opaque grounds — the range track/thumb in both the inline and
   fullscreen bars, `.cv__fs`, the in-bar `.cv-fs__chip`, the views rail; keyboard-focus every
   viewer control and confirm the shared cyan ring still reads (the rule stayed opaque
   deliberately); article-card border visible on raised ground; print preview borders intact.
6. **Reading hierarchy**: `.prose` revert + the tier pass, working the Design table selector by
   selector (four move to primary, five stay secondary; read-next is in another file and is not
   touched). → verify: rendered article — body brighter than callout bodies; tables and definition
   bodies read at body tier; deck still visibly dimmer than body despite being larger;
   `grep -c "color-text-secondary" src/styles/components/prose.css` returns **7** (nine minus the
   four moved, plus the two Shiki `:root` vars that are not tiers), so an off-by-one in the pass is
   visible rather than silent; the `.prose` comment rewritten (no stale dimming rationale).
7. **Fluid scale**: add the five new tokens; convert per the Design table; retire the dead
   overrides surgically (keep `margin-top: 2.5rem` in `prose.css:185-191` and `--lh-reading` in
   `typography.css:452-462`); document the JS constraint; guard `DetectorHero.astro` `token()`.
   `Contracts:` new `--fz-article-title`, `--fz-article-deck`, `--fz-prose-h2/h3/h4` tokens; fluid
   token values unreadable via `getPropertyValue`.
   → verify: `npm run lint` still clean — `prose.css` must now hold **no** raw `font-size` literal
   for title/deck/headings (that is the single-source check this step can actually fail);
   `grep -n "card-padding\|section-spacer" src/styles/tokens/spacing.css` shows those four tokens
   only in `:root`, never inside a `@media` block (the override-wins trap);
   **the no-longer-stepped check must measure a consumer, not the token** — `getComputedStyle`
   returns a custom property's `clamp()` unresolved (the very constraint this step documents), so
   read a card's resolved `paddingTop` in px at 940 and 980 viewport width and confirm it moves
   *continuously* rather than jumping at 960;
   screenshots at 320/375/768/1024/1440 (failure modes: shrink vs. today in the 960–1280 band —
   expected small and monotonic, no non-monotonic jumps; heading ladder preserved at every width —
   h2 > h3 = h4, and title > deck **≥** h2, where deck and h2 are *expected to tie* at 25px from
   1280px up because the table gives them the same maximum, as they already do above 960px today;
   the heading `margin-top` step at 960 survived; detector hero renders, no NaN geometry).
8. **Swatch guard**: extend `check-inline-colors.mjs` to flag `--gray-*` usage outside
   `src/styles/tokens/colors.css`. The script's `EXTS` today is `['.tsx','.jsx','.astro']` — the
   swatch check must additionally walk **`.css`** (the dominant consumer surface, and the whole
   reason stylelint can't do this job) plus `.mjs`/`.ts`; the hex check keeps its current
   extension set so CSS hex literals stay stylelint's job and aren't double-reported.
   `Contracts:` lint gate behavior — `check-inline-colors.mjs` file set + a second violation
   class. → verify: seeded `var(--gray-26)` in a scratch `src/styles/components/*.css` file
   fails the check *and* the same seed in a `.astro` file fails; clean tree passes
   (`npm run lint` exits 0); check fails (not passes) if its file list resolves empty.
9. **Docs sweep** — the stale facts, enumerated (each verified against the file).
   **Chip taxonomy (Branch A, as shipped)**: the docs record that taxonomy-as-color is retired and
   chips are uniformly neutral — no per-tag hue mapping survives to document, and
   `reasoning/accessibility.md`'s "color is never the only signal" obligation no longer applies to
   tags at all (chips now carry their meaning in text only, which satisfies it outright).
   - `docs/design/tokens.md`: `:31` signal meanings (drop violet = code / orange = warning; cyan
     → instrument vs. apparatus-teal split; gold's jobs); `:32` borders "alpha-on-white
     separators … plus an accent border" → opaque ramp steps + the imaging carve-out, accent
     border gone; `:34` warmth bias restates the **old formula** ("R+1 / B−2") → +2 spread;
     `:28` surface-role guidance (raised is now one notch above ground, so the
     "inputs → raised / hover → active" ladder needs re-checking); `:53` type scale "with a
     desktop step-up at the wide breakpoint" → fluid `clamp()` for the editorial scale, stepped
     for body/UI/grid; `:81–87` **contrast table** — it is the doc's declared canonical home for
     measured ratios, and the surfaces + `.prose` tier both move (re-measure, don't nudge).
     **Additions**, not just corrections: tokens.md is the declared token map, so Locked decision 9
     needs recording there — the `--gray-*` swatch layer → role token → consumer chain, that
     consumers reference **roles only**, and that the swatch guard in `npm run lint` enforces it.
     Without this the new layer ships undocumented in the one doc whose job is naming it.
   - `docs/design/philosophy.md`: `:52` stale "cyan = links, … violet = technical" list → gold's
     jobs, red, the cyan/teal split, and the chip wording for the chosen branch; `:67` restates the **old warmth
     formula** (`R = G + 1`, `B = G − 2`) and declares itself "the canonical explanation" → +2
     spread. Since tokens.md `:34` restates the same formula, pick philosophy.md as the single home
     (it already claims it) and have tokens.md point rather than repeat.
   - `docs/design/components.md`: `:324`/`:325` phantom `.callout--technical` (violet) and
     `.callout--warning` (orange) → the real note/caution/critical set (note is the *default*, with
     no `.callout--note` class — see `markdown-plugins.mjs:50`); `:283` "Technical Note — Signal
     Violet" in the callout-type list → gone with the variant; `:288`/`:299`/`:321` callout +
     key-point specs default to `--color-signal-cyan` → `--color-teal-apparatus`;
     **`:245` is NOT an apparatus consumer** — it is `.prose a { color: var(--color-signal-cyan) }`,
     i.e. the *link* spec, already stale against the shipped gold link. It becomes
     `--color-link`; teal-ing it would document teal links and contradict Locked decision 6;
     `:232-242` prose-heading spec (`--fz-headline` / `calc(var(--fz-body) * 1.125)`) matches
     neither today's literals nor the new tokens → re-point to `--fz-prose-h2/h3`;
     `:626` "Use Signal Cyan and Signal Violet for data series" (prose form, so the hyphenated
     greps miss it) → the surviving palette;
     `:506–508` `.tag--signal-cyan` block → the surviving chip set; `:604` readout chips
     "deliberately not code-violet" → code is neutral now, so the contrast the sentence draws is
     gone; `:657` case-viewer cyan is correct as-is (instrument).
   - `docs/design/reasoning/accessibility.md` — the **accessibility floor**, and the most stale doc
     of the set, so do not treat it as a pointer-only file: `:26-28` "Signal colors
     (red/orange/yellow/cyan/violet) carry meaning (red = critical/CTA, cyan = interactive, yellow
     = caution)" and "A link is not 'cyan'; it is a link that is also cyan" → the surviving palette
     with gold links; `:33` "visible focus indicator (2px outline, Signal Cyan per the tokens)" →
     focus is gold (`--color-focus` → `--color-primary`), already wrong today; `:18-21` correctly
     *points* at tokens.md's table (no values of its own) — leave as a pointer, just confirm it
     still resolves after the table is re-measured.
   - `docs/design/reasoning/typography.md`: no stale breakpoint-step language found (`:35`, `:42`
     only name the `--fz-*` scale generically) — read it to confirm, and add a line on where the
     ramp interpolates vs. stays stepped only if the generic wording now misleads. No edit assumed.
   - `claude-com-reference.md` and `docs/archive/**` untouched (study copy / history).
   → verify, two greps, because the token-form and prose-form references need different patterns:
   (a) `grep -rn "signal-violet\|signal-orange\|signal-magenta\|accent border\|alpha-on-white\|cyan = links\|B−2" docs/design/` clean — currently **5** hits (components.md `:324`,`:325`; philosophy.md `:52`; tokens.md `:32`,`:34`);
   (b) `grep -rin "signal violet\|signal orange\|signal magenta\|cosmic violet\|burst magenta\|sunset orange" docs/design/` clean — currently **2** hits (components.md `:283`,`:626`), which the hyphenated pattern in (a) cannot see.
   A run returning 0 on either grep *before* the edits means the grep itself broke, not that the
   docs are clean. Plus: every ratio in tokens.md's table recomputed against the new hexes, not
   carried forward; and `grep -n "gray-" docs/design/tokens.md` non-empty (the swatch layer is
   actually documented, not just the deletions done).
10. **Full gate**: `npm run lint && npm run check && npm run build`; the retired-token sweep step 1
    defers to here; dev-server visual pass with Michael at localhost:4321 (**user-gated** — his
    calibrated display is the final judge of the mud fix).
    → verify: all three commands exit 0. **The commands alone are not sufficient** — an unresolved
    `var(--color-signal-violet)` reference makes CSS silently fall back to nothing; stylelint
    doesn't resolve custom-property names, and neither `astro check` nor `astro build` errors on
    it. So the grep is the real gate for dead references:
    `grep -rn "signal-orange\|signal-violet\|signal-magenta\|border-accent\|imaging-black\|control-charcoal\|console-white\|textbook-ivory\|level-one-red\|sunset-orange\|chroma-yellow\|scanline-cyan\|cosmic-violet\|burst-magenta" src/` returns **zero** hits (comments included — step 5 renamed the four `imaging-black` mentions, so nothing legitimate survives). It must be run and shown empty, not assumed from a green build. Positive control so an empty result can't be a broken pattern: the same command pointed at `docs/archive/` must return hits (the archived design doc still names every legacy token).
    Then: Michael signs off on article + homepage.

## Success criteria

- Three signal hues + gold remain; the step-10 retired-token grep returns **zero** hits in `src/`
  (run and shown, with the `docs/archive/` positive control — a green build proves nothing here).
- Every chip/text color pair ≥4.5:1 (computed, not eyeballed), and the chosen chip branch is
  recorded in the plan so the doc matches what shipped.
- An article page still renders both chips — i.e. the content-schema enums survived the tag edit.
- Borders opaque site-wide except the documented case-viewer overlay carve-out (three named
  over-image elements, everything in a bar opaque); print intact.
- Editorial type scale fluid 320→1280 with stepped body/UI/grid; every token in the fluid table
  landed on its stated side; no raw `font-size` literal left in `prose.css` for title/deck/headings;
  no JS reads a fluid token raw.
- `.prose` at text-primary; apparatus tiers explicit; no dimming regression comment left stale.
- Swatch guard live in `npm run lint`, scanning `.css` as well as markup; fails closed.
- Both docs-sweep greps clean, and `--gray-*` is *documented* in tokens.md, not just enforced.
- Michael confirms the raised-surface muddiness is resolved on the live site.

## Implementation deviations

- **2026-08-08 — brand gold gets its own token, `--color-level-one-gold`.** Michael, mid-run:
  "I want the primary color to be clearly denoted as the brand color, level-one-gold, also not
  signal yellow." The plan left `--color-primary: var(--color-signal-yellow)` untouched, which
  denotes the brand identity in terms of a *functional signal*. Split: `--color-level-one-gold`
  is now the sole definition of the brand hue (`#d8a82c`), `--color-primary` points at it, and
  `--color-signal-yellow` — which independently carries the caution role (`.callout--caution`,
  `--astro-code-token-constant`) — points at the brand gold with a comment noting the two jobs
  may diverge. No rendered value changes; this is a naming/direction fix. It also partially
  answers the standing TODO "Split primary-CTA gold from caution into distinct tokens if they
  conflict" — the tokens are now distinct, the values still shared.

- **2026-08-08 — `--color-gold-soft` is derived, not a restated hex.** Following the brand-gold split
  above, gold-soft is written as `color-mix(in srgb, var(--color-level-one-gold) 60%, var(--gray-234))`
  rather than the plan's literal `#E1C274`. Verified at runtime to resolve to exactly `#E1C274`, so the
  locked value is honored; the change is mechanism only, and it makes "shades of the gold" structural
  rather than a comment that can drift.

- **2026-08-08 — step 10's retired-token grep excludes `*.test.*`.** The plan's sweep asserts zero
  bare-name hits in `src/`, comments included. Step 1's contract test (written after the plan) legitimately
  spells all fourteen retired names in the list it asserts are *absent* from the token layer. The sweep
  therefore runs `--exclude='*.test.*'` and prints the excluded hits separately, so the exception is shown
  rather than hidden. Shipped source is zero; the `docs/archive/` positive control returns 32.

- **2026-08-08 — `.cv-fs__close`'s overlay border had to move below `.cv-fs__chip`.** Declared in the
  positioning block (where the plan pointed), it silently lost: `.cv-fs__chip` sets the `border`
  shorthand at equal specificity and later source order, resetting `border-color`. Caught by measuring
  the element rather than trusting the edit. The override now sits after the chip rules with a comment
  saying why it must.

## Open questions

- None. The one operator decision — chip hue scope — was answered 2026-08-07: **Branch A, all
  chips neutral.** Its two dependents are settled in place: step 3's file list, and the
  chip-taxonomy wording in step 9's docs sweep. No other step branches.
- (Light mode and tag-discriminator ideas are recorded under Non-goals as deliberately downstream.)
