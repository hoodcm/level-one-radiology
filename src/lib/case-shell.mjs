/**
 * case-shell.mjs — the single source for the <case-viewer> static shell.
 *
 * remarkCaseViewer (markdown-plugins.mjs) calls this at build time to expand
 * a ::case directive into the full static HTML (decision 4: zero CLS by
 * construction, no runtime JSON fetch — the manifest is inlined); the dev
 * gesture-spike page renders the same shell so emulation exercises the real
 * DOM contract. case-viewer.ts upgrades the shell in place (light DOM, so
 * the design tokens cascade in).
 *
 * Shell contract (what case-viewer.ts binds to): data-cv-* hooks —
 * manifest (JSON script) · stage · canvas · poster · counter · series-label ·
 * window-label · slider · close · fullscreen · windows/window · series/serie.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The ::case embed, as authored in markdown. Single source for every
 *  scanner (build validation in astro.config.mjs, the case-aware loader).
 *  remarkCaseViewer's parsed-directive match is the authority this regex only
 *  approximates: the [caption] is optional and the id may be double- OR
 *  single-quoted (both are valid remark-directive attribute syntax), so a
 *  caption-less `::case{id='x'}` stays visible to the scanners. Capture
 *  group 1 is the id for BOTH quote styles (the quote is a non-capturing
 *  char class, never a group). `g` (matchAll in every consumer) and `m`
 *  (`^` line-anchoring) are load-bearing — don't drop them. */
export const CASE_DIRECTIVE_RE = /^::case(?:\[[^\]]*\])?\{[^}]*id=["']([^"']+)["']/gm;

/** Frame-filename contract: `{nnn}` in a manifest pattern is the 1-based
 *  frame number zero-padded to 3 digits (the runtime viewer resolves the
 *  same contract inline — it cannot import this node-bound module). */
export const nnn = (n) => String(n).padStart(3, '0');

/** Current manifest rev for a case id; null when the manifest is missing
 *  or unreadable (a state change worth invalidating on, same as a bump). */
export function caseManifestRev(id) {
  try {
    return JSON.parse(
      readFileSync(path.resolve('public/cases', id, 'manifest.json'), 'utf8')
    ).rev ?? 0;
  } catch {
    return null;
  }
}

/**
 * Validate a case's on-disk assets and return its manifest — the whole
 * validation list, by design (it exists so a published stack can never stall
 * on a 404, not to police content): manifest present, every referenced frame
 * present, poster present. Throws a build-failing error otherwise.
 *
 * Called from two places: remarkCaseViewer at render time, and the
 * caseViewerValidation integration at every build start (the content layer
 * caches rendered articles, so render-time validation alone would miss a
 * case deleted after the article was last touched).
 *
 * @param {string} id     case id (public/cases/<id>/)
 * @param {string} where  context for the error message (article path)
 */
export function validateCaseAssets(id, where = 'article') {
  const caseDir = path.resolve('public/cases', id);
  const manifestPath = path.join(caseDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error(
      `${where}: ::case{id="${id}"} — no manifest at public/cases/${id}/manifest.json ` +
        `(run: npm run case:build -- --in <frames> --id ${id})`
    );
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  for (const series of manifest.series) {
    for (const win of series.windows) {
      for (let i = 1; i <= series.frames; i++) {
        const frame = win.pattern.replace('{nnn}', nnn(i));
        if (!existsSync(path.join(caseDir, frame))) {
          throw new Error(
            `${where}: ::case{id="${id}"} — manifest references ${frame} but the file ` +
              `is missing on disk (re-run case:build for this series/window)`
          );
        }
      }
    }
    if (!existsSync(path.join(caseDir, series.poster))) {
      throw new Error(`${where}: ::case{id="${id}"} — poster ${series.poster} missing on disk`);
    }
  }
  return manifest;
}

/**
 * Boot-HUD reticle — geometry, stroke, and grouping VERBATIM from
 * design-assets/prototypes/case-viewer-loading-hud.html (its integration doc
 * pins them: "All keyframes … timings and delays — they're tuned"). Stroke
 * stays plain white by the prototype doc's mapping table — the HUD is an
 * overlay on imaging, not themed chrome. Animations live in
 * src/styles/components/case-viewer.css, keyed on .is-booting / .is-ready.
 */
function hudSvg() {
  return `<svg class="cv__hud" viewBox="0 0 1024 1024" fill="none" stroke="white" stroke-width="2" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
<g class="cv__hud-early">
<g class="cv-anim-grid"><line stroke-dasharray="60 40" stroke-dashoffset="18" x1="0" x2="1024" y1="512" y2="512"/><line stroke-dasharray="60 40" stroke-dashoffset="18" x1="512" x2="512" y1="0" y2="1024"/></g>
<rect class="cv-anim-center-1 cv__hud-el" height="130" width="80" x="472" y="372"/>
<rect class="cv-anim-center-2 cv__hud-el" height="130" width="80" x="472" y="522"/>
<g class="cv-anim-panels cv__hud-el"><rect height="190" width="110" x="312" y="260"/></g>
<g class="cv-anim-panels cv__hud-el"><rect height="190" width="110" x="602" y="260"/></g>
</g>
<g class="cv__hud-late">
<g class="cv-anim-bracket-tl cv__hud-el"><path d="M 140 240 L 140 80 L 230 80" stroke-linecap="square"/><path d="M 270 190 L 270 130 L 310 130" stroke-linecap="square"/></g>
<g class="cv-anim-bracket-tr cv__hud-el"><path d="M 884 240 L 884 80 L 794 80" stroke-linecap="square"/><path d="M 754 190 L 754 130 L 714 130" stroke-linecap="square"/></g>
<g class="cv-anim-bracket-bl cv__hud-el"><path d="M 140 784 L 140 944 L 230 944" stroke-linecap="square"/><path d="M 270 834 L 270 894 L 310 894" stroke-linecap="square"/></g>
<g class="cv-anim-bracket-br cv__hud-el"><path d="M 884 784 L 884 944 L 794 944" stroke-linecap="square"/><path d="M 754 834 L 754 894 L 714 894" stroke-linecap="square"/></g>
</g>
</svg>`;
}

/** @param {object} manifest  case manifest (see docs: manifest schema)
 *  @param {string} caption   figcaption text (directive label; may be '')
 *  @returns {string} static shell HTML */
export function caseShellHtml(manifest, caption = '') {
  const series = manifest.series[0];
  const win = series.windows[0];
  const posterUrl = manifest.base + series.poster;
  // Inline JSON: escape `<` so `</script>` inside strings can't break out.
  const json = JSON.stringify(manifest).replace(/</g, '\\u003c');

  const chips =
    series.windows.length > 1
      ? `<div class="cv__chips" role="radiogroup" aria-label="Window" data-cv-windows>${series.windows
          .map(
            (w, i) =>
              `<button type="button" role="radio" aria-checked="${i === 0}" data-cv-window="${esc(w.key)}">${esc(w.label)}</button>`
          )
          .join('')}</div>`
      : '';

  const tabs =
    manifest.series.length > 1
      ? `<div class="cv__tabs" role="radiogroup" aria-label="Series" data-cv-series>${manifest.series
          .map(
            (s, i) =>
              `<button type="button" role="radio" aria-checked="${i === 0}" data-cv-serie="${esc(s.key)}">${esc(s.label)}</button>`
          )
          .join('')}</div>`
      : '';

  return `<case-viewer data-case="${esc(manifest.id)}" data-rev="${esc(manifest.rev)}">
<script type="application/json" data-cv-manifest>${json}</script>
<figure class="cv">
<div class="cv__meta">${manifest.modality ? `<span>${esc(manifest.modality)}</span>` : ''}<span data-cv-series-label>${esc(series.label)}</span><span data-cv-window-label>${esc(win.label)}</span><span class="cv__counter" data-cv-counter>IM ${series.start}/${series.frames}</span></div>
<div class="cv__stage" data-cv-stage style="aspect-ratio: ${Number(series.width)} / ${Number(series.height)};">
<img class="cv__poster" data-cv-poster src="${esc(posterUrl)}" alt="${esc(manifest.title)}" width="${Number(series.width)}" height="${Number(series.height)}" loading="lazy" decoding="async" />
<canvas class="cv__canvas" data-cv-canvas></canvas>
${hudSvg()}
<div class="cv__brackets" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<button type="button" class="cv__close" data-cv-close aria-label="Exit scrub mode" hidden>✕</button>
</div>
<div class="cv__bar">
<input type="range" data-cv-slider min="1" max="${Number(series.frames)}" value="${Number(series.start)}" step="1" aria-label="Image position, ${esc(manifest.title)}" aria-valuetext="Image ${series.start} of ${series.frames}" />
<button type="button" class="cv__fs" data-cv-fullscreen aria-label="Open fullscreen viewer">⛶</button>
</div>
${chips}${tabs}${caption ? `<figcaption class="cv__caption">${esc(caption)}</figcaption>` : ''}
</figure>
</case-viewer>`;
}
