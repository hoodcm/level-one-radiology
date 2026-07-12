---
title: "Using the Case Viewer"
publishDate: "2026-07-09"
serial: "L1-0007"
lastReviewed: "2026-07-09"
description: "A quick guide to the interactive stack viewer. Tap to activate, drag to scroll the series, switch windows, and open fullscreen to pan, zoom, and tune."
tags: ["viewer", "technique", "meta"]
primaryTag: "Neuro"
contentType: "educational"
featured: true
---

Most teaching images are a single slice. Real cases are stacks, and you read them by scrolling. The viewer below behaves like a lightweight PACS, so try it before reading on.

::case[A synthetic test stack, not real anatomy, for trying the viewer. Tap the image to activate, then drag up and down to scroll the series.]{id="dev-synthetic"}

## Scroll the stack

Tap the image once to lock in. The corner brackets turn cyan and a DRAG TO SCROLL cue appears in the top corner. Now drag up and down to move through the series, the way you'd spin the wheel at the workstation. Tap the image again to let go, and the page scrolls normally.

On a desktop the mouse wheel scrolls the stack once you're locked in. The slider under the image does the same thing, and it's the accessible control: keyboard and screen reader users scrub with it.

## Switch the window

The chips below the slider switch display windows on the same slice. Your position in the stack is preserved when you switch, because the slice you're comparing is the whole point. Flip between the soft tissue and inverted windows to see how much the display setting changes what stands out. It's [window and level](/articles/window-and-level) made interactive.

## Go fullscreen

The gold button opens the exam fullscreen. There you can pinch or double tap to zoom, drag to pan when zoomed, and tap the contrast button to tune brightness and contrast with a drag. Tuning is a display adjustment only. It resets when you close, and it never alters the underlying image.

:::note[Why an interactive viewer]
A still image teaches you what a finding looks like. A stack teaches you how to find it. Every case on the site that ships with imagery uses this same viewer, so the reading motion matches the one you use every shift.
:::
