/**
 * Article apparatus feature flags — kill switches for the apparatus elements
 * that EMIT MARKUP. Templates and astro.config.mjs consume these booleans, so
 * flipping one to false removes the markup entirely (never an orphaned,
 * unstyled widget). CSS-only elements are disabled the other way: comment out
 * their import line in src/styles/main.css ("Article apparatus" block).
 */
export const apparatus = {
  /** Mobile <details> INDEX emitted by TableOfContents.astro (<80em). */
  mobileToc: true,
  /** Footer More-articles block replacing the article back-link row. */
  readNext: true,
  /** GFM footnotes → tap popover cards (rehypeFootnotePopovers). */
  footnotePopovers: true,
} as const;
