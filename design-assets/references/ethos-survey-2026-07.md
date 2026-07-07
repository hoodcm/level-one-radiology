# Design-Ethos Survey — Reference Sites

*Surveyed 2026-07-07. All sites verified live at survey time; palette and type
claims were measured from the live DOM (computed styles), not recalled. This is
a point-in-time reference study, kept alongside the anthropic/scrib3 asset
studies. Lessons marked ✦ have been adopted; see CHANGELOG for when.*

The target ethos, for calibration: dark-first warm-black editorial, serif
prose / sans apparatus / mono metadata, "tight not cramped" density, restrained
HUD-instrument character (tech editorial with X-ray-panel / old-school imaging
equipment grammar), Anthropic-school motion restraint.

---

## (A) Dark editorial / long-form reading

### Long Now Foundation — https://longnow.org
Essays on civilization-scale thinking. The closest whole-package match:
measured pure-black ground with EB Garamond prose over Barlow apparatus — the
serif/sans voice split on dark. Their five-digit years ("01996") turn one
metadata formatting rule into an identity system.
**Lesson ✦:** one strict house metadata format everywhere → identity. Adopted
as the `L1-nnnn` accession serial + mono meta line.

### NYT R&D — https://rd.nytimes.com
The Times' research division. Black ground; an editorial site wearing an
instrument dashboard — the logo is generative, driven by live team activity,
each stat labeled like a console readout, with a visible "Pause Animation"
control.
**Lesson:** live-data-as-ornament with an honest pause affordance. Candidate:
a small real feed (articles published, days since last case) as HUD telemetry.

### NTS Radio — https://www.nts.live
Independent radio platform. Measured `#000` with 10–14px uppercase labels —
the best live example of interface density on true black that never feels
crowded; mono timestamps as metadata; `theme-color` meta fused to the page
background.
**Lesson ✦:** label discipline at 10px; theme-color fusion (adopted).

### Gwern.net — https://gwern.net
Long-form research essays. Wrong aesthetic (light-first), right reading
*machinery*: sidenotes, link popups, and a per-essay epistemic-status block
(status / confidence / date range) as compact apparatus.
**Lesson ✦:** visible epistemic honesty as brand. Adopted as the
`lastReviewed` clinical-currency line.

---

## (B) Technical-instrument aesthetic

### U.S. Graphics Company — https://usgraphics.com
Berkeley Graphics (Berkeley Mono). Light-theme but the density bible: 12px
Univers body in engineering-document tables; stated philosophy — "Dense, not
sparse. Expose state and inner workings. Explicit is better than implicit."
**Lesson ✦:** engineering-plate character; adopted as the footer data plate
(`L1R v… · Built …`). Their philosophy list reads as our brief.

### Teenage Engineering — https://teenage.engineering
Hardware maker; the site is an extension of the instrument panels. Fully
fluid vw-scaled micro-type for chrome (measured ~6.4px computed), lowercase
compact nav, en-dash product nomenclature as typography.
**Lesson ✦ (partial):** fluid viewport-derived type for brand chrome — adopted
for the hero wordmark clamp. Nomenclature-as-typography pairs with the serial
system.

### Anduril — https://www.anduril.com
Defense tech; the mainstream benchmark for restrained HUD language. True black,
11.05px (clamp-scaled) uppercase domain labels ("SEA DOMAIN") over full-bleed
bands — corner-bracket vocabulary with corporate restraint, no sci-fi kitsch.
**Lesson:** domain-taxonomy nav (their Sea/Land/Air/Space ↔ our
Head/Chest/Abdomen/MSK) as an uppercase label system, when tag pages arrive.

### Departure Mono — https://departuremono.com
Typeface specimen microsite. Dark charcoal, 11px mono everything; terminal
artifacts (version-string masthead, box-drawing tables, ASCII departure board)
give instrument character at zero image weight.
**Lesson:** box-drawing/ASCII structures as real content — a mono
differential-diagnosis or protocol readout would carry the console feel with a
trivially perfect reduced-motion story.

---

## (C) Craft-motion reference

### Linear — https://linear.app
Origin of the dark bespoke product-marketing look. Measured `#08090a`
(cool-biased near-black; ours is `#0B0A08`, warm-biased — an instructive
one-hex-digit sibling), dark-first even under light preference, theme-color
fused.
**Lesson ✦:** every surface tint derived from one hue-biased base (already our
system); theme-color fusion (adopted).

### darkroom.engineering — https://darkroom.engineering
Authors of Lenis, the smooth-scroll library behind much of this school. Black,
all-mono, signal-red accents, numbered sections ("01."), registration-square
patterns.
**Lesson ✦ (partial):** numbered-section + registration-mark HUD grammar —
adopted as article h2 ordinals mirrored in the TOC rail. **Deliberately NOT
adopted:** Lenis/scroll-hijack — native scroll reads more instrument-honest.

### Rauno Freiberg — https://rauno.me
Vercel interaction designer. The /craft section isolates each motion idea as a
bounded demo with terse uppercase captions.
**Lesson:** prototype each motion idea in isolation before composing —
matches the house one-axis-per-round iteration discipline.

### Emil Kowalski — https://emilkowal.ski
Design engineer (Linear); essays on animation taste. Light-default; the
reference for *when* motion earns its place ("You Don't Need Animations").
**Lesson:** the editing checklist that separates console-precise from kitsch.
Motion must communicate state, not decorate.

---

## Near-misses (checked, excluded)

ming.watch (dark photography, light design system) · press.stripe.com (light,
object-led) · githubnext.com (excellent writeup structure, off-white) ·
basement.studio (true black + Geist, redundant with darkroom) · vercel.com/geist
(design-system doc, not an ethos site) · 032c / logicmag / emergencemagazine
(light-first).

## Cross-site patterns observed (July 2026)

1. **Fluid viewport-scaled micro-type for chrome** (clamp/vw), prose at fixed
   readable sizes. ✦ adopted for the wordmark.
2. **`theme-color` fused to the exact page background** so browser chrome
   melts into the canvas. ✦ adopted.
3. **Explicit theme architecture** — root `class="light|dark"` stamping beside
   `prefers-color-scheme` — the pattern for a future light-escape hatch.
4. **Metric-compatible fallback fonts** (`size-adjust`, "Geist Fallback"
   pattern) to kill layout shift. Open candidate for the self-hosted OFL set.
5. Motion, where present, is scroll-linked with visible pause/reduced-motion
   affordances — never autoplay spectacle.
