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
 * window-label · slider · activate · fullscreen · windows/window · series/serie.
 * Views kind (manifest.kind === "views") replaces slider/chips/tabs with —
 * rail (radiogroup) · view (per-thumb button) · view-label (live meta text).
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { iconSvg } from './case-icons.mjs';

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
  if (manifest.kind === 'views') {
    if (!Array.isArray(manifest.views) || manifest.views.length === 0) {
      throw new Error(`${where}: ::case{id="${id}"} — views manifest has no views[]`);
    }
    for (const view of manifest.views) {
      for (const rel of [view.file, view.thumb]) {
        if (!existsSync(path.join(caseDir, rel))) {
          throw new Error(
            `${where}: ::case{id="${id}"} — manifest references ${rel} but the file ` +
              `is missing on disk (re-run case:build --kind views for this case)`
          );
        }
      }
    }
    if (!existsSync(path.join(caseDir, manifest.poster))) {
      throw new Error(`${where}: ::case{id="${id}"} — poster ${manifest.poster} missing on disk`);
    }
    return manifest;
  }
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

/** Views-kind shell: thumbnail rail in the slider's slot, canvas stage, HUD
 *  chrome — the same instrument as the stack, minus slider/chips/tabs — plus
 *  a real-`<img>` fallback block (print via base/print.css; no-JS via the
 *  emitted <noscript> style; both HTTP-cache-share the canvas frame URLs). */
function viewsShellHtml(manifest, caption) {
  const views = manifest.views;
  const start = Math.min(views.length, Math.max(1, Number(manifest.start) || 1));
  const active = views[start - 1];
  const posterUrl = manifest.base + manifest.poster;
  const json = JSON.stringify(manifest).replace(/</g, '\\u003c');

  const rail = `<div class="cv__rail" role="radiogroup" aria-label="Views" data-cv-rail>${views
    .map(
      (v, i) =>
        `<button type="button" role="radio" aria-checked="${i === start - 1}" data-cv-view="${esc(v.key)}"><img src="${esc(manifest.base + v.thumb)}" alt="" loading="lazy" decoding="async" /><span>${esc(v.label)}</span></button>`
    )
    .join('')}</div>`;

  const fallback = `<div class="cv__fallback">${views
    .map(
      (v) =>
        `<figure><img src="${esc(manifest.base + v.file)}" alt="${esc(v.label)} — ${esc(manifest.title)}" width="${Number(v.width)}" height="${Number(v.height)}" loading="lazy" decoding="async" /><figcaption>${esc(v.label)}</figcaption></figure>`
    )
    .join('')}</div><noscript><style>case-viewer .cv__fallback{display:grid}</style></noscript>`;

  const counter = `${String(start).padStart(String(views.length).length, ' ')}/${views.length}`;

  return `<case-viewer data-case="${esc(manifest.id)}" data-rev="${esc(manifest.rev)}" data-kind="views">
<script type="application/json" data-cv-manifest>${json}</script>
<figure class="cv cv--views">
<div class="cv__meta">${manifest.modality ? `<span>${esc(manifest.modality)}</span>` : ''}<span data-cv-view-label>${esc(active.label)}</span><span class="cv__counter" data-cv-counter>${counter}</span></div>
<div class="cv__stage" data-cv-stage style="aspect-ratio: ${Number(manifest.stage.width)} / ${Number(manifest.stage.height)};">
<img class="cv__poster" data-cv-poster src="${esc(posterUrl)}" alt="${esc(manifest.title)}" width="${Number(manifest.stage.width)}" height="${Number(manifest.stage.height)}" loading="lazy" decoding="async" />
<canvas class="cv__canvas" data-cv-canvas aria-hidden="true"></canvas>
${hudSvg()}
<div class="cv__brackets" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<button type="button" class="cv__activate" data-cv-activate aria-label="Activate case viewer">${iconSvg('power')}</button>
</div>
<div class="cv__bar">
${rail}
<button type="button" class="cv__fs" data-cv-fullscreen aria-label="Open fullscreen viewer">${iconSvg('maximize')}</button>
</div>
${fallback}${caption ? `<figcaption class="cv__caption">${esc(caption)}</figcaption>` : ''}
</figure>
</case-viewer>`;
}

/** @param {object} manifest  case manifest (see docs: manifest schema)
 *  @param {string} caption   figcaption text (directive label; may be '')
 *  @returns {string} static shell HTML */
export function caseShellHtml(manifest, caption = '') {
  if (manifest.kind === 'views') return viewsShellHtml(manifest, caption);
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
<div class="cv__meta">${manifest.modality ? `<span>${esc(manifest.modality)}</span>` : ''}<span data-cv-series-label>${esc(series.label)}</span><span data-cv-window-label>${esc(win.label)}</span><span class="cv__counter" data-cv-counter>Image ${String(series.start).padStart(String(series.frames).length, ' ')}/${series.frames}</span></div>
<div class="cv__stage" data-cv-stage style="aspect-ratio: ${Number(series.width)} / ${Number(series.height)};">
<img class="cv__poster" data-cv-poster src="${esc(posterUrl)}" alt="${esc(manifest.title)}" width="${Number(series.width)}" height="${Number(series.height)}" loading="lazy" decoding="async" />
<canvas class="cv__canvas" data-cv-canvas aria-hidden="true"></canvas>
${hudSvg()}
<div class="cv__brackets" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
<button type="button" class="cv__activate" data-cv-activate aria-label="Activate case viewer">${iconSvg('power')}</button>
</div>
<div class="cv__bar">
<input type="range" data-cv-slider min="1" max="${Number(series.frames)}" value="${Number(series.start)}" step="1" aria-label="Image position, ${esc(manifest.title)}" aria-valuetext="Image ${series.start} of ${series.frames}" />
<button type="button" class="cv__fs" data-cv-fullscreen aria-label="Open fullscreen viewer">${iconSvg('maximize')}</button>
</div>
${chips}${tabs}${caption ? `<figcaption class="cv__caption">${esc(caption)}</figcaption>` : ''}
</figure>
</case-viewer>`;
}
