/**
 * case-icons.mjs — the case viewer's button glyphs, single source.
 *
 * Lucide outline icons (lucide-react is the project's icon library); the
 * viewer is a React-free custom element, so the SVG node data is inlined
 * verbatim from the installed package rather than rendered as components.
 * Imported by case-shell.mjs (build-time shell) AND fullscreen.ts (client
 * overlay) — keep this module free of node imports.
 *
 * Semantic key → Lucide icon: power → scan-eye · x → x ·
 * maximize → maximize-2 · contrast → contrast.
 *
 * Sub-glyph class hooks (cv-i-*) are ours, not Lucide's: case-viewer.css
 * choreographs per-icon hover micro-motion against them — the scan-eye's
 * corners (cv-i-tl/tr/br/bl) spread outward and its pupil (cv-i-pupil)
 * dilates; maximize-2's arrow pairs (cv-i-ne/sw) spread along their
 * diagonals; contrast's half-disk (cv-i-half) turns like a W/L dial.
 * Keep the hooks when refreshing icon path data.
 */
const ICONS = {
  power:
    '<path class="cv-i-tl" d="M3 7V5a2 2 0 0 1 2-2h2"/><path class="cv-i-tr" d="M17 3h2a2 2 0 0 1 2 2v2"/><path class="cv-i-br" d="M21 17v2a2 2 0 0 1-2 2h-2"/><path class="cv-i-bl" d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle class="cv-i-pupil" cx="12" cy="12" r="1"/><path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  maximize:
    '<path class="cv-i-ne" d="M15 3h6v6"/><path class="cv-i-ne" d="m21 3-7 7"/><path class="cv-i-sw" d="m3 21 7-7"/><path class="cv-i-sw" d="M9 21H3v-6"/>',
  contrast: '<circle cx="12" cy="12" r="10"/><path class="cv-i-half" d="M12 18a6 6 0 0 0 0-12v12z"/>',
};

/** Lucide's 24px grid + round caps/joins; stroke thinned from the Lucide
 *  default 2 to 1.5 — the glyphs render at 32px where 2 reads heavy. */
export const iconSvg = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
