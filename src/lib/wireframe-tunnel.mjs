/**
 * wireframe-tunnel.mjs — parametric one-point-perspective wireframe tunnel,
 * the title-region backdrop. Same single-source pattern as detector-hero.mjs:
 * pure geometry, no DOM, shared by the build-time fallback render
 * (WireframeTunnel.astro frontmatter) and the client rebuild at the mount's
 * live aspect ratio. All ink/weight styling lives in CSS
 * (tokens/wireframe-tunnel.css) via currentColor — this module owns only
 * geometry.
 *
 * Model: the outer rect sits at depth z = 1, the vanishing rect at
 * z = 1/sMin. Depth rings are EQUAL-Z steps, so their projected scale
 * s = 1/z bunches toward center with true perspective — the wormhole pull.
 * Rays connect every outer-perimeter subdivision to its similar point on the
 * vanishing rect. Ray columns derive from the aspect ratio so the front-face
 * grid cells stay near-square at any mount shape.
 */

export const TUNNEL = {
  rows: 12, // subdivisions down each side; columns derive from aspect
  sMin: 0.14, // vanishing-rect scale (smaller = deeper)
  // First ring's horizontal inset from the side edges, px. The grid governs
  // this: callers pass 2/3 of the live --grid-margin (the component script
  // reads it from the container); this default only covers the no-JS
  // fallback. Ring COUNT is derived — the first ring fixes the tunnel's
  // depth step and rings repeat at that spacing until the vanishing rect.
  inset1: 21,
};

/** Full SVG markup for a W×H figure.
 *  opts beyond the TUNNEL knobs:
 *    frame   — draw the outer border rect (default true)
 *    base    — draw the bottom base line / meta-rule surrogate (default true)
 *    extendH — total mount height (default H). When taller than the figure,
 *              the mount's extra run sits BELOW it: rays extend outward past
 *              their perimeter points and extra floor rings step toward the
 *              viewer (z < 1) until they leave the mount — the figure keeps
 *              converging on its own center while its lines run on down the
 *              extended field.
 *    cy      — the convergence center's y (default H/2): the homepage anchors
 *              it on the wordmark container's center, which sits above the
 *              hero's midpoint on the desktop composition. */
export function tunnelSVG(W, H, opts = {}) {
  const { rows, sMin, inset1, frame = true, base = true, extendH = H, cy = H / 2 } = { ...TUNNEL, ...opts };
  const cols = Math.max(6, Math.round(rows * (W / H)));
  const cx = W / 2;
  const f = (n) => +n.toFixed(2);
  const toS = (x, y, s) => [f(cx + (x - cx) * s), f(cy + (y - cy) * s)];

  // rays: every outer-perimeter subdivision → its similar vanishing point.
  // Each ray's outer end extends past its perimeter point to the mount
  // bounds (0..W × 0..extendH) — a no-op at extendH = H, where every
  // perimeter point already sits on the bounds (t stays 1).
  let rays = '';
  const ray = (x, y) => {
    const [qx, qy] = toS(x, y, sMin);
    const dx = x - qx;
    const dy = y - qy;
    let t = Infinity;
    if (dx > 0) t = Math.min(t, (W - qx) / dx);
    else if (dx < 0) t = Math.min(t, -qx / dx);
    if (dy > 0) t = Math.min(t, (extendH - qy) / dy);
    else if (dy < 0) t = Math.min(t, -qy / dy);
    if (!Number.isFinite(t) || t < 1) t = 1;
    rays += `M${f(qx + dx * t)} ${f(qy + dy * t)}L${qx} ${qy}`;
  };
  for (let i = 0; i <= cols; i++) {
    ray((W * i) / cols, 0);
    ray((W * i) / cols, H);
  }
  for (let j = 1; j < rows; j++) {
    ray(0, (H * j) / rows);
    ray(W, (H * j) / rows);
  }

  // depth rings: physically EQUAL spacing down the tunnel (constant Δz), the
  // step set by the grid — the first ring sits half the page margin inside
  // the frame, and that same depth step repeats to the vanishing rect. So the
  // frame→ring1 gap is the LARGEST projected gap and every later gap shrinks
  // monotonically, bunching into the dense halo around the mouth (ring count
  // is derived, not a knob).
  const s1 = Math.max(sMin, 1 - (2 * inset1) / W);
  const dz = Math.max(1 / s1 - 1, 0.01);
  let ringsD = '';
  const ring = (s) => {
    const [x0, y0] = toS(0, 0, s);
    const [x1, y1] = toS(W, H, s);
    ringsD += `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
  };
  for (let z = 1 + dz; z < 1 / sMin; z += dz) ring(1 / z);
  // extended-mount continuation: the same equal-Δz steps IN FRONT of the
  // figure (z < 1) — only their bottom edges land in the mount (the rest
  // overflows the viewBox), reading as the floor grid running on toward the
  // viewer. Emitted while the bottom edge is still above the mount bottom;
  // at extendH = H the first candidate already falls outside, so the
  // default render is unchanged.
  for (let z = 1 - dz; z > 0; z -= dz) {
    const s = 1 / z;
    if (cy + (H - cy) * s >= extendH) break;
    ring(s);
  }

  const [ix0, iy0] = toS(0, 0, sMin);
  const [ix1, iy1] = toS(W, H, sMin);

  // outer border + vanishing rect drawn as their own path so the frame and
  // core read as edges of the same figure (inset half a stroke not needed:
  // non-scaling-stroke + overflow:hidden halves the border weight evenly).
  // frame: false keeps only the vanishing rect — an extended mount's rays
  // must run through the figure's edge unbroken, not stop at a border line.
  const frameD =
    (frame ? `M0 0H${f(W)}V${f(H)}H0Z ` : '') +
    `M${ix0} ${iy0}H${ix1}V${iy1}H${ix0}Z`;

  // base line: the figure's bottom edge doubles as the article meta rule —
  // inset half a stroke so it draws fully visible, flush with the bottom
  // (the centered frame stroke half-clips at the viewBox edge)
  const baseD = `M0 ${f(H - 0.5)}H${f(W)}`;

  const path = (d, cls) =>
    `<path d="${d}"${cls ? ` class="${cls}"` : ''} vector-effect="non-scaling-stroke"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(extendH)}" ` +
    `preserveAspectRatio="none" fill="none" stroke="currentColor">` +
    path(rays) + path(ringsD) + path(frameD) + (base ? path(baseD, 'wt-base') : '') +
    `</svg>`
  );
}
