---
title: "Window and Level: What Radiologists Do With the Mouse"
publishDate: "2026-03-11"
serial: "L1-0004"
lastReviewed: "2026-03-11"
description: "What window width and window level actually control, why no single window can show everything, and which presets to reach for on a head CT and when."
tags: ["neuro", "ct", "technique", "physics"]
primaryTag: "Neuro"
contentType: "educational"
featured: false
keyPoints:
  - "Your monitor shows a few hundred grays and your eye resolves a few dozen. The Hounsfield scale spans thousands of values. Windowing decides which slice of it you see"
  - "Level picks the center of the visible slice. Width decides how many densities on either side of center get a gray of their own"
  - "Every window is a trade: contrast where you point it, blindness everywhere else. A head CT is read in at least three"
---

<p class="lead">You have probably sat next to a radiologist and watched them make small, twitchy drags with the mouse while the image flickers through a dozen versions of itself. Nobody narrates this part. The image just gets better and the reading continues. Those drags are windowing, and they are often the difference between an image that shows the answer and the same image hiding it.</p>

These controls are genuinely confusing when you first drive a PACS yourself, and it is understandably easiest to leave the presets alone and hope. So let's build the whole mechanism from the ground up, then come back to the presets and decode them.

## The Problem the Mouse Is Solving

A CT scanner measures how much each small block of tissue attenuates the X-ray beam. When we call something dense on CT, that is the claim we are making: this material knocks down the beam more effectively than its neighbors. The Hounsfield scale standardizes the measurement, anchored to water at 0 and air at -1000, and it runs past +2000 for cortical bone and higher for metal. Call it four thousand meaningfully different values inside a single head CT.

Now the constraint. Your monitor can display a few hundred shades of gray. Your eye can reliably tell apart a few dozen. Four thousand values, a few dozen usable grays. We cannot show everything at once, so something has to decide which densities get a gray of their own and which get lumped together.

That something is the window. Before defining it, it helps to know where the interesting tissues actually sit on the scale:

<dl>
<dt>Air</dt>
<dd>-1000 HU. Paranasal sinuses, mastoids, and any air that should not be there.</dd>
<dt>Fat</dt>
<dd>Around -100 HU. Orbital fat, scalp fat.</dd>
<dt>Water</dt>
<dd>0 HU by definition. CSF sits just above it.</dd>
<dt>Brain</dt>
<dd>White matter around 25 HU, gray matter around 35 to 40. A ten-unit stretch carries the entire gray-white interface.</dd>
<dt>Acute blood</dt>
<dd>50 to 100 HU. Clot is retracted, protein-packed plasma, so it out-attenuates the brain around it.</dd>
<dt>Bone</dt>
<dd>Several hundred to a few thousand HU depending on how cortical it is.</dd>
</dl>

Read the brain entry again. The finding you interrogate on every single head CT lives inside a ten-unit sliver of a four-thousand-unit scale. Displaying that sliver well is the entire game.

## Two Controls, One Window

Windowing is zoom, but for density instead of position. **Window level** is where you point: the HU value at the center of your display, rendered as middle gray. **Window width** is how far you zoom: the range of HU values spread across the full ramp from black to white. Anything below the bottom edge of the window renders pure black. Anything above the top edge renders pure white. No detail survives outside the window, no matter how large the density difference.

A narrow window spends all of your grays on a small stretch of the scale, so tiny density differences become visible contrast. A wide window spreads the same grays across a huge stretch, so nothing clips to black or white, but neighboring tissues converge toward the same shade.

## Watch the Trade-Off Happen

Put up a head CT in the standard brain window, width 80 and level 40. The window runs from 0 to 80 HU: CSF near black, white matter dark gray, gray matter lighter, acute blood approaching white. The ten-unit gray-white difference gets a real, visible share of the ramp. Meanwhile the calvarium, at many hundreds of units, slams into the top of the window and renders as a featureless white band.

Now drag the width open toward bone settings and watch two things happen at once. The skull develops texture: cortex, diploë, sutures, fracture lines. And the brain collapses toward a single flat gray, because its whole ten-unit interface now occupies a fraction of one displayed shade. Nothing about the data changed. You spent your grays somewhere else.

:::caution[One window, one miss]
A window optimized for one question is blind to the others. The classic casualty is the thin subdural hematoma: at brain settings, acute clot renders near-white directly against the near-white inner table, and the two merge. The hemorrhage is in the data and absent from the display. Never call a head CT done from a single window.
:::

If you like seeing the arithmetic, the whole mechanism fits in a few lines:

```python
def gray(hu: int, ww: int, wl: int) -> int:
    """Map a Hounsfield value to a display gray, 0-255."""
    lo = wl - ww / 2
    return round(255 * min(1.0, max(0.0, (hu - lo) / ww)))

# Acute subdural blood (65 HU) next to cortex (38 HU):
gray(65, 80, 40)     # brain window -> 207
gray(38, 80, 40)     # brain window -> 121   (86 grays apart: obvious)
gray(65, 2800, 600)  # bone window  -> 79
gray(38, 2800, 600)  # bone window  -> 76    (3 grays apart: invisible)
```

The same two voxels, 27 HU apart, are separated by 86 gray levels in one window and 3 in the other. That is the trade you are making with every drag.

::case[A synthetic test stack, not real anatomy, for trying the viewer. Drag across the image to scrub the series, and switch windows to compare the display.]{id="dev-synthetic"}

---

## The Presets, Decoded

Presets are not correct answers. They are named positions in the trade-off, each buying contrast for one question by giving it up for the others.

| Preset | Width / Level | What it buys | What it gives up |
|---|---|---|---|
| Brain | 80 / 40 | Gray-white interface, blood vs. brain | All bone detail, scalp |
| Subdural | 200 / 80 | Clot vs. the inner table it hugs | Some gray-white contrast |
| Stroke | 8 / 32 | Aggressive gray-white separation for early edema | Everything else, and noise amplifies with the signal |
| Bone | 2800 / 600 | Cortex, diploë, fracture lines | All soft tissue contrast |
| Soft tissue | 400 / 50 | Scalp, orbits, neck | Fine intracranial contrast |

The subdural preset is worth understanding rather than memorizing. It raises the level toward clot density and opens the width just enough that bone and blood stop sharing pure white, which is exactly the failure that hides the thin subdural at brain settings.

Every viewer puts these on hotkeys, usually the number row, and pairs them with a free drag: hold <kbd>W</kbd> (or the middle button, viewers disagree) and drag one axis for width, the other for level. Learning to hit the presets without looking is a real speed gain. Learning the free drag is better, because it lets you interrogate a specific pixel instead of hoping a preset covers it.

## Reading a Head CT With This

The practical sequence: brain window for the parenchyma, subdural window along the convexities and falx, bone window for the fractures, soft tissue for the scalp. The scalp hematoma tells you where the coup is, which tells you where to look hardest for the contrecoup.

And when a finding is equivocal at every preset, stop flipping windows and measure it. An ROI reads the data directly, with no gray ramp in the way. The window decides what you see, never what is there.
