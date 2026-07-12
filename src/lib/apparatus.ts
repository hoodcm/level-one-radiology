/**
 * Article apparatus feature flags — kill switches for the apparatus elements
 * that EMIT MARKUP, plus case-viewer behavior experiments. Templates and
 * astro.config.mjs consume the markup booleans, so flipping one to false
 * removes the markup entirely (never an orphaned, unstyled widget); the
 * case-viewer flags are read by the client element at upgrade time. CSS-only
 * elements are disabled the other way: comment out their import line in
 * src/styles/main.css ("Article apparatus" block).
 */
export const apparatus = {
  /** Mobile <details> INDEX emitted by TableOfContents.astro (<80em). */
  mobileToc: true,
  /** Footer More-articles block replacing the article back-link row. */
  readNext: true,
  /** GFM footnotes → tap popover cards (rehypeFootnotePopovers). */
  footnotePopovers: true,
  /** Case viewer requires an explicit engage tap before any scrub: the
   *  rest-state horizontal drag-scrub is disabled until the tap (a DRAG TO
   *  SCROLL chip names the gesture once engaged). Off restores the
   *  drag-scrubs-at-rest model. */
  caseTapToActivate: true,
  /** Case viewer holds inert and dimmed — no frame decode, no boot HUD — behind
   *  a centered ACTIVATE button until the reader taps it. Off restores the
   *  auto-boot-on-scroll model (boot + warm fire from the IntersectionObserver
   *  tiers as the viewer nears the viewport). */
  caseTapToBoot: true,
  /** Homepage detector hero — the scintillator-grid drawing behind the hero
   *  text plus the ENTIRE copy restructuring that seats on it (desktop
   *  wordmark/tagline row, the mobile statement moving into the FeatureBand
   *  card, the dual-instance h1). Off restores the pre-change text-only hero
   *  wholesale: single hero h1, tagline in the hero, FeatureBand untouched. */
  detectorHero: true,
} as const;
