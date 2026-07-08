---
title: "Style Gallery: Every Prose Element on One Page"
publishDate: "2026-07-07"
serial: "L1-0000"
lastReviewed: "2026-07-07"
description: "A design-system specimen page. Every markdown element the article pipeline can render, in one place, for visual regression and iteration. Never ships: draft stays true."
tags: ["meta", "design-system"]
primaryTag: "Neuro"
contentType: "educational"
featured: false
draft: true
keyPoints:
  - "This page exists to exercise the full markdown pipeline in dev"
  - "If an element looks wrong here, it looks wrong in every article"
  - "Drafts render in the dev server only and never build to production"
---

The first paragraph carries the opening weight. It should read comfortably at the reading measure, with the serif voice doing narrative work. Inline elements live here too: **bold for scanning**, *italic for emphasis*, `inline code` in the violet mono voice, and a [link to another article](/articles/closed-loop-obstruction) plus an [external link](https://www.acr.org) that opens in a new tab.

A second paragraph confirms the paragraph gap. Sixteen pixels between paragraphs, per the Anthropic-measured cadence. Nothing else should separate two running paragraphs.

## A Second-Level Heading

Body text after an h2. Hover the heading to see its anchor link appear. The heading owns its bottom margin and binds tighter to this paragraph than to the section above it.

### A Third-Level Heading

Lists hold at 15px with a hanging indent:

- The first item in an unordered list
- A second item, long enough to wrap onto a second line so the hanging indent and the internal line-height are visible in review
- A third item with `inline code` inside it

1. Ordered lists share the same metrics
2. Two transition points, not one
3. Numbering alignment matters at double digits

## Callouts, Three Ways

:::note[The mechanism]
The note callout is the default apparatus voice. Cyan label, quiet panel, sans body. Authored in markdown with directive syntax, no raw HTML.
:::

:::caution[Where people miss it]
The caution callout carries the gold signal. Use it for pitfalls and common errors, not for decoration.
:::

:::critical[Do not wait]
The critical callout is for surgical-emergency-grade points. Red signal, used sparingly so it keeps its meaning.
:::

## Tables Scroll, Pages Do Not

| Feature | Simple obstruction | Closed-loop | Strangulated closed-loop | Practical read |
|---|---|---|---|---|
| Transition points | One | Two, along one segment | Two, plus vascular signs | Count them on coronals |
| Mesenteric vessels | Normal course | Converge (whirl or beak) | Converge with haziness | Follow the vessels |
| Wall enhancement | Preserved | Preserved early | Reduced or absent | Compare to normal loops |
| Urgency | Often expectant | Surgical consult | Time-critical | Call, then report |

This table is wide on purpose. On a phone it should pan inside its own container while the page stays fixed.

## Code Blocks

```python
# Window/level presets as a dict: the token mapping test
PRESETS = {
    "brain": {"ww": 80, "wl": 40},
    "subdural": {"ww": 200, "wl": 80},
    "bone": {"ww": 2800, "wl": 600},
}

def apply_window(hu: int, ww: int, wl: int) -> float:
    """Map a Hounsfield value to display gray, clamped to [0, 1]."""
    lo, hi = wl - ww / 2, wl + ww / 2
    return min(1.0, max(0.0, (hu - lo) / (hi - lo)))
```

## Figures and the Console Strip

Every clinical image carries a metadata strip in the console voice: modality, plane, window, phase. The caption below it stays quiet sans. Figures with a strip are accessioned automatically: a `FIG NN` cell leads the strip, counted in document order, and decorative images without a strip stay unnumbered. In-text references are authored by hand as [Fig. 1](#fig-1) against an `id="fig-1"` anchor on the figure. The numbering does not self-heal: reordering figures means updating both the anchors and the references.

<figure id="fig-1">
<img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%231B1A18'/><text x='8' y='4.9' font-family='monospace' font-size='0.9' fill='%236D655B' text-anchor='middle'>CLINICAL IMAGE PLACEHOLDER</text></svg>" alt="Placeholder panel standing in for a clinical image" />
<div class="figure-meta"><span>CT</span><span>Axial</span><span>W400 L40</span><span>Portal venous</span></div>
<figcaption>Converging mesenteric vessels at the transition point. The strip above this caption is the house pattern for all case imagery.</figcaption>
</figure>

## The Case Viewer

The showstopper module. Scroll through the exam the way a radiologist does: drag across the image to scrub, tap the image to hold the page and scrub on either axis, switch windows without losing your slice.

::case[Synthetic test stack. Drag across the image to scrub through the exam.]{id="dev-synthetic"}

## Quotes, Rules, and Notes

Footnotes are tap-first: the superscript number is a button that opens the note in a popover card,[^1] and the full plate still renders at the end of the article for reference and for browsers without popover support.[^2]

> A blockquote takes the secondary ink with the gold stripe. Long-form pull quotes read in this voice, one thought per quote.

A horizontal rule separates major movements:

---

## Definition Lists and Keys

<dl>
<dt>Beak sign</dt>
<dd>The single point where the segment is pinched off, tapering like a bird's beak.</dd>
<dt>Whirl sign</dt>
<dd>Mesenteric vessels rotating around the point of torsion.</dd>
</dl>

Press <kbd>W</kbd> then drag to window. Highlighted text uses <mark>the gold wash</mark> sparingly. Measurement values ride inline as readout chips, muted mono in a hairline: <span class="readout">W80 L40</span>, <span class="readout">65 HU</span>. They are deliberately not the violet of `inline code`.

## The Lead Paragraph Class

<p class="lead">A lead paragraph, opted in with the lead class, sits a step larger and brighter than body text. Use it once, at the top, or not at all.</p>

And a closing paragraph at normal weight to compare against the lead above. The reader should never finish a section wondering what to do with this page: if an element looks wrong here, fix its token or its prose rule, then recheck.

[^1]: The card is a build-time copy of this note. Tapping outside it, or the button again, closes it.

[^2]: A second note proves the numbering, the plate ordering, and the backref arrows below.
