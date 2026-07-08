/**
 * case-icons.mjs — the case viewer's button glyphs, single source.
 *
 * Lucide outline icons (lucide-react is the project's icon library); the
 * viewer is a React-free custom element, so the SVG node data is inlined
 * verbatim from the installed package rather than rendered as components.
 * Imported by case-shell.mjs (build-time shell) AND fullscreen.ts (client
 * overlay) — keep this module free of node imports.
 *
 * Semantic key → Lucide icon: power → square-power · x → minimize ·
 * maximize → scan-eye · contrast → contrast.
 */
const ICONS = {
  power: '<path d="M12 7v4"/><path d="M7.998 9.003a5 5 0 1 0 8-.005"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
  x: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>',
  maximize:
    '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="1"/><path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0"/>',
  contrast: '<circle cx="12" cy="12" r="10"/><path d="M12 18a6 6 0 0 0 0-12v12z"/>',
};

/** Lucide's default SVG contract: 24px grid, stroke 2, round caps/joins. */
export const iconSvg = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
