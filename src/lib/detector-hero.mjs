/**
 * detector-hero.mjs — parametric generator for the homepage hero backdrop:
 * a scintillator-grid detector in cross-section (en-face plate stack above,
 * detector slab, perpendicular plate fan below; every fan plate's far end
 * anchored on the posterior slab).
 *
 * Single source for BOTH render paths (case-shell.mjs precedent):
 *   build time — DetectorHero.astro frontmatter emits the two static SVGs
 *   client     — DetectorHero.astro <script> rebuilds responsively + motion
 *
 * Pure functions, no DOM. Geometry ported verbatim from the approved lab
 * (design-assets/references/detector-hero-lab.html); the lab's globals
 * (C, P, vN) became explicit parameters. All *style* values (ink, opacity,
 * stroke, durations) are CSS tokens (src/styles/tokens/detector-hero.css) —
 * this module owns only geometry and the locked numeric settings.
 */

/* ================= locked settings (Michael's Copy-settings JSON, 2026-07-11) ================= */
export const SETTINGS = {
  scale: 1.0,
  yoff: 2, // vertical shift, % of hero height
  vanes: 16, // plates per side (desktop)
  fan: 1.0, // fan steepness
  gridLen: 1.0, // grid height, × slab height
  layers: 10, // en-face stack layers
  fanMode: 'derived', // 'measured' retained only as an A/B reference
  mVanes: 9, // plates per side (mobile) — was 10 at lock; dropped one when the
  // mobile fit narrowed to the page grid margins so the on-screen plate pitch
  // stays at the approved density (Michael OK'd 1–2 fewer, 2026-07-13)
  mSlab: 0.6, // slab boxiness (mobile) — raised from the locked 0.5: too tight around the wordmark on device
  driftAmt: 0.2, // focal drift amount
  stackPar: 0.3, // stack parallax
  beamW: 1800, // beam sweep width (desktop canvas units)
  corePad: 0.04, // min clear space above AND below the drawn core, × hero height
  // Post-lock additions (not in the Copy-settings JSON): geometry scalars for
  // the touch response and the copy's horizontal seat. Ink/ramp knobs live in
  // tokens/detector-hero.css with the other style values.
  touchRadius: 2.5, // touch-response reach, × plate pitch
  touchPull: 0.12, // touch plate pull-out depth, × grid height
  touchRearBlend: 0.35, // rear-tip neighbor-ride ramp band, × plate pitch (smooths the cap handoff)
  copyInsetX: 0.025, // hero-copy horizontal seat inset, × slab width
};

/** The COMPOSITION predicate — which drawing renders — shared verbatim by
 *  the client matchMedia and the CSS gating the static SVG pair and the hero
 *  stage height. Desktop = landscape at least 640px wide AND viewport aspect
 *  ≥ 0.9 (the lab's `W / H < 0.9 || W < 640` mobile branch, inverted, read on
 *  the VIEWPORT — never element dimensions: the shallow hero's element aspect
 *  diverges from the viewport's). The subtext's SEAT switches on a stricter
 *  fit predicate — 48em + the same aspect — documented at its rules in
 *  homepage.css (the slab row only fits where the slab is tall enough). */
export const DESKTOP_MEDIA = '(min-width: 640px) and (min-aspect-ratio: 9/10)';

/* ================= model constants ================= */
export const S_BACK = 0.433; // posterior slab width / slab width
// The hidden rear edge sits 1.294 × the grid's height above its bottom
// (measured: 780 / 603) — anchored to HEIGHT, so the fan re-derives naturally
// when the grid height changes, and the rear ends always stay hidden behind
// the slab (drop > grid height ⇒ no premature edge stops, and provably no
// edge crossings).
export const DROP_PER_GRID_H = 780 / 603;
const MEASURED_NORM = 1782.5 / 603; // measured-mode drops, per unit grid height
const GAP_REF_SLAB_H = 603; // gap law was measured at this slab height
const STACK_GROW_TO = 0.902; // top-of-stack width fraction the layers grow to

// The artist's measured per-plate slopes — retained only as the measured-mode
// A/B reference (the site ships derived mode).
const SLOPE_TAB = [
  [0.1, 6.75], [0.2, 2.975], [0.3, 2.15], [0.4, 1.744], [0.5, 1.6],
  [0.6, 1.419], [0.7, 1.169], [0.8, 1.069], [0.9, 0.944], [1.0, 0.881],
];
function slopeAt(d) {
  d = Math.max(d, 0.03);
  if (d <= 0.1) return 6.75 * (0.1 / d);
  for (let i = 1; i < SLOPE_TAB.length; i++) {
    const [d0, m0] = SLOPE_TAB[i - 1];
    const [d1, m1] = SLOPE_TAB[i];
    if (d <= d1) {
      const t = (d - d0) / (d1 - d0);
      return Math.exp(Math.log(m0) * (1 - t) + Math.log(m1) * t);
    }
  }
  return SLOPE_TAB[SLOPE_TAB.length - 1][1];
}
const gapAt = (dxc) => 43 - 33 * Math.exp(-dxc / 0.09);

/* ================= compositions ================= */
export function makeComp(c, settings = SETTINGS) {
  c.halfSpan = (c.slab.x1 - c.slab.x0) / 2;
  c.slabH = c.slab.bot - c.slab.top;
  c.stackH = c.slab.top - c.stackTop;
  c.gapScale = c.slabH / GAP_REF_SLAB_H;
  c.beamScale = c.SW / 3840;
  // Drawn content core (stack top → fan bottom) — fitTransform guarantees
  // this whole span stays on screen with corePad clear above and below.
  // The touch pull's excursion below the fan is deliberately NOT reserved
  // here: inflating the core shrinks every clamp-bound render (Michael
  // rejected the ~5% desktop shrink, 2026-07-14). The mobile composition
  // reserves it in the width-derived hero floor instead (--dh-core-fit,
  // tokens/detector-hero.css), which grows the HERO rather than shrinking
  // the drawing.
  c.coreTop = c.stackTop;
  c.coreBot = c.slab.bot + c.slabH * settings.gridLen;
  return c;
}

/** The locked landscape object, measured from the image-board drawing. */
export const DESKTOP = makeComp({
  name: 'desktop', SW: 3840, SH: 2160, CX: 1920,
  slab: { x0: 137, x1: 3702, top: 557, bot: 1160 },
  stackTop: 347, fit: 'cover',
});

// Portrait canvas. The stack keeps the source's proportion — its height is
// 0.35 × the slab's (as in the measured drawing), so the layers stay tight
// overlapping lips rather than spreading into a ziggurat.
const MOBILE_BASE = { SW: 1080, SH: 1560, CX: 540, slabX0: 38, slabH0: 520, stackRatio: 0.35 };

/** The portrait recomposition — same grammar, boxier slab, fewer plates.
 *  Cover-fit (deviation, Michael 2026-07-11): the site hero is squatter than
 *  the portrait canvas, so cover makes the WIDTH bind — and the vertical crop
 *  consumes only the canvas's empty margins (contain-fit height-bound there
 *  and shrank the object). The width the drawing fits is the CONTENT BOX, not
 *  the hero: fitSpan (the slab's span) lands on the page grid margins like
 *  every other element (Michael 2026-07-13 — the drawing previously bled
 *  ~18px past them; nothing draws outside the slab's x-range, so the span is
 *  the drawing's true width). The DRAWN CONTENT CORE (stack top → fan
 *  bottom), not the slab, centers in the canvas: the fan hangs a full grid
 *  height below the slab while the stack rises only 0.35 slab heights above
 *  it, so slab-centering biased the drawing low and cover-cropped the fan's
 *  bottom on real phones/tablets. The title still seats exactly on the slab
 *  (seatCopy / the nudge tokens). */
export function mobileComp(settings = SETTINGS) {
  const b = MOBILE_BASE;
  const slabH = b.slabH0 * settings.mSlab;
  const stackH = slabH * b.stackRatio;
  const gridH = slabH * settings.gridLen;
  // (slabTop − stackH + slabTop + slabH + gridH) / 2 = SH / 2, solved:
  const slabTop = (b.SH - slabH - gridH + stackH) / 2;
  return makeComp({
    name: 'mobile', SW: b.SW, SH: b.SH, CX: b.CX,
    slab: { x0: b.slabX0, x1: b.SW - b.slabX0, top: slabTop, bot: slabTop + slabH },
    fitSpan: { x0: b.slabX0, x1: b.SW - b.slabX0 },
    stackTop: slabTop - stackH, fit: 'cover',
  });
}

/** Plates per side for a composition. */
export const vanesFor = (C, settings = SETTINGS) =>
  C.name === 'mobile' ? settings.mVanes : settings.vanes;

/* ================= fan geometry =================
   Each fan plate's far end sits ON the posterior slab (lateral position
   mapped by the stack's contraction, at the hidden rear height). The
   viewpoint shifts the back plane by sigma; the depth edges follow. As
   run→0 they collapse onto the front vertical — continuous everywhere. */
export function vaneRest(C, x, settings = SETTINGS) {
  const dxc = Math.max(Math.abs(x - C.CX) / C.halfSpan, 0.004);
  const gridH = C.slabH * settings.gridLen;
  return {
    x,
    top: C.slab.bot + gapAt(dxc) * C.gapScale,
    drop: settings.fanMode === 'derived'
      ? DROP_PER_GRID_H * gridH
      : slopeAt(Math.min(dxc, 1)) * (1 - S_BACK) * dxc * MEASURED_NORM * gridH,
  };
}

export function vaneFrontD(C, v, settings = SETTINGS) {
  return `M ${v.x} ${v.top} L ${v.x} ${C.slab.bot + C.slabH * settings.gridLen}`;
}

/** Touch pull displacement for one plate: `pull` canvas units ALONG the
 *  plate's own depth axis (the depth edges' direction), continuing rear →
 *  front — the pane slides out of its slot toward the viewer. A straight-
 *  down displacement sheared the implied rectangle ("pulling it more down
 *  than towards the screen" — Michael, 2026-07-14); along-plane motion
 *  keeps the depth edges on their own line (slope preserved, rectangle
 *  rigid): near-center plates still travel almost vertically (their depth
 *  axis is vertical), flank plates drift outward as they come. */
export function vanePullOffset(C, v, sigma, pull, settings = SETTINGS) {
  const run = (C.CX + (v.x - C.CX) * S_BACK + sigma) - v.x;
  const s = run >= 0 ? 1 : -1;
  const m = (v.drop * settings.fan) / Math.max(Math.abs(run), 0.5);
  const hyp = Math.hypot(1, m);
  return { dx: (-s * pull) / hyp, dy: (m * pull) / hyp };
}

/** pull = touch pull-out along the plate plane (see vanePullOffset). FRONT
 *  endpoints ride the pulled pane; each REAR endpoint stays seated on
 *  whatever bounds its visibility, because every rear point is an anchor or
 *  an occlusion boundary, not part of the moving pane:
 *    - top edge rear: pinned ON the slab (the pane's connection) — the edge
 *      stretches colinearly, more of it emerging as the pane comes out;
 *    - bottom edge rear, slab- or |run|-capped: pinned (slab underside /
 *      the anchored rear corner hidden behind the slab face);
 *    - bottom edge rear, pitch-capped: rides the NEIGHBOR pane it kisses
 *      (rearShift = that neighbor's own pull offset), so differential pull
 *      neither floats the tip in vacated space nor pokes it through the
 *      neighbor's displaced front line (both seen 2026-07-14). A tip whose
 *      rest seat was the neighbor's TOP HOOK (the comb-gap band) would
 *      drift off the hook as it stretches — rearShift.minY (the neighbor's
 *      displaced front-top corner) clamps the tip onto that corner, the one
 *      point always on the neighbor's visible boundary.
 *  The rearShift contribution RAMPS in over touchRearBlend × pitch of
 *  pitch-cap dominance rather than switching at the exact cap handoff: at
 *  rest the handoff hides behind the slab face, but under pull the minY
 *  clamp holds a riding tip down on the neighbor's visible hook, so a hard
 *  on/off snapped near-center tips between anchor points as focal drift
 *  moved the caps across each other (Michael 2026-07-14). The weight is 0
 *  wherever the old boolean was false, so rest geometry is untouched.
 *  @param {{ dx: number, dy: number, minY?: number } | null} [rearShift] */
export function vaneDepth(C, v, sigma, pull = 0, settings = SETTINGS, rearShift = null) {
  const vN = vanesFor(C, settings);
  const pitch = C.halfSpan / vN;
  const bot = C.slab.bot + C.slabH * settings.gridLen;
  const run = (C.CX + (v.x - C.CX) * S_BACK + sigma) - v.x;
  const s = run >= 0 ? 1 : -1;
  const m = (v.drop * settings.fan) / Math.max(Math.abs(run), 0.5);
  const { dx: ex, dy: ey } = vanePullOffset(C, v, sigma, pull, settings);
  let d = `M ${v.x + ex} ${v.top + ey} L ${v.x + s * Math.min((v.top - C.slab.bot) / m, Math.abs(run))} ${C.slab.bot}`;
  // a depth edge ends at the EARLIEST of: its own rear endpoint (the plate
  // physically stops there), the neighboring plate, or the slab. Edges can
  // then touch but never cross — rear points preserve the plates' order.
  // The tip uses the TRUE slope, not the 0.5-clamped m above: under the
  // clamp the bottom-capped tip raced the full grid height across the
  // |run| < 0.5 band (m frozen while dxEnd kept shrinking) — invisible at
  // rest where the edge hides on the front line, but a pulled front line is
  // displaced off it, exposing the racing stub as a center flicker (Michael
  // 2026-07-14). Division-free per-cap forms so run = 0 needs no slope at
  // all: the slab cap lands the tip exactly ON the underside and it slides
  // continuously through center.
  const absRun = Math.abs(run);
  const rise = v.drop * settings.fan; // the edge's vertical drop over absRun
  const gridDx = (absRun * (bot - C.slab.bot)) / rise; // dx where the slab underside cuts the edge
  const dxOther = Math.min(absRun, gridDx);
  const dxEnd = Math.min(dxOther, pitch);
  let tipX = v.x + s * dxEnd;
  let tipY =
    dxEnd === gridDx
      ? C.slab.bot // slab cap (includes run = 0, where every cap collapses to 0)
      : dxEnd === pitch
        ? bot - (rise * pitch) / absRun // neighbor cap (absRun > pitch > 0 here)
        : bot - rise; // own rear endpoint
  // neighbor-ride weight: 0 unless the pitch cap binds, ramping to 1 as it
  // dominates the other caps (see the doc block above — the smooth ramp is
  // what keeps a pulled tip from snapping between anchor points)
  const w = rearShift ? Math.max(0, Math.min(1, (dxOther / pitch - 1) / settings.touchRearBlend)) : 0;
  if (w > 0) {
    let rideY = tipY + rearShift.dy;
    if (rearShift.minY !== undefined && rideY < rearShift.minY) rideY = rearShift.minY;
    tipX += w * rearShift.dx;
    tipY += w * (rideY - tipY);
  }
  d += ` M ${v.x + ex} ${bot + ey} L ${tipX} ${tipY}`;
  return d;
}

/** All fan plates at rest, with their draw-in order (center-out after the
 *  stack + slab). Both render paths iterate this one list. */
export function vaneList(C, settings = SETTINGS) {
  const vN = vanesFor(C, settings);
  const pitch = C.halfSpan / vN;
  const out = [];
  for (let i = -vN; i <= vN; i++) {
    const v = vaneRest(C, C.CX + i * pitch, settings);
    v.order = settings.layers + 1 + Math.abs(i);
    out.push(v);
  }
  return out;
}

/* The back plane may only shift within a fraction of one plate pitch —
   softly saturating — so near-center plates never swing drastically. */
export function sigmaOf(C, dfx, settings = SETTINGS) {
  const sigMax = 0.8 * C.halfSpan / vanesFor(C, settings);
  return sigMax * Math.tanh((dfx * settings.stackPar) / sigMax);
}

/* ================= stack + slab ================= */
/** En-face stack: consecutively overlapping rectangles. Returns
 *  [{ d, order, frac }] — frac drives the stack-parallax translate
 *  (deeper layers move more). */
export function stackPaths(C, settings = SETTINGS) {
  const n = settings.layers;
  if (n <= 0) return [];
  const slabW = C.slab.x1 - C.slab.x0;
  const grow = n > 1 ? Math.pow(STACK_GROW_TO / S_BACK, 1 / (n - 1)) : 1;
  const hs = Array.from({ length: n }, (_, i) => 26 + 5 * (n === 1 ? 1 : i / (n - 1)));
  const hSum = hs.reduce((a, b) => a + b, 0);
  const out = [];
  let y = C.stackTop;
  for (let i = 0; i < n; i++) {
    const w = slabW * S_BACK * Math.pow(grow, i);
    const h = (hs[i] / hSum) * C.stackH;
    const x0 = C.CX - w / 2;
    const x1 = C.CX + w / 2;
    // the bottom layer's sides run on under the slab (occluder hides them)
    const yEnd = i === n - 1 ? y + h + C.slabH * 0.2 : y + h;
    out.push({
      d: `M ${x0} ${yEnd} L ${x0} ${y} L ${x1} ${y} L ${x1} ${yEnd}`,
      order: i,
      frac: (n - i) / n,
    });
    y += h;
  }
  return out;
}

/** Detector slab outline (drawn after the fan: its bg-filled face occludes
 *  the joins). Draw-in order = settings.layers. */
export function slabPath(C) {
  return `M ${C.slab.x0} ${C.slab.top} L ${C.slab.x1} ${C.slab.top} L ${C.slab.x1} ${C.slab.bot} L ${C.slab.x0} ${C.slab.bot} Z`;
}

/** Full-opacity occluder above the beam layer (invisible: bg on bg) —
 *  inset inside the slab face so the slab's own outline stays visible. */
export function occluderRect(C) {
  return {
    x: C.slab.x0 + 6,
    y: C.slab.top + 6,
    width: C.slab.x1 - C.slab.x0 - 12,
    height: C.slabH - 12,
  };
}

/** Client fit: cover/contain the composition in a W×H hero, plus the locked
 *  scale and vertical shift. Returns { k, tx, ty }.
 *  The width term fits the composition's fitSpan (the horizontal extent that
 *  must land on the available width; defaults to the full canvas) into
 *  W − 2·insetX — insetX is the page grid margin on the mobile composition
 *  (its slab aligns to the content box) and 0 on desktop (full-bleed cover).
 *  Both compositions are symmetric about CX, so centering the canvas centers
 *  the fitSpan: at a width-bound k the span's edges land exactly on the
 *  margins.
 *  INHERENT PADDING GUARANTEE: whatever the cover/contain math says, k is
 *  clamped so the drawn core (coreTop → coreBot) always fits vertically with
 *  corePad × H clear above and below — a cover crop may only ever eat the
 *  canvas's empty margins, never the drawing. Without this, every geometry
 *  retune that grows the core (taller slab, longer fan) silently re-clips the
 *  fan bottom on squat viewports. */
export function fitTransform(C, W, H, settings = SETTINGS, insetX = 0) {
  const spanW = C.fitSpan ? C.fitSpan.x1 - C.fitSpan.x0 : C.SW;
  const availW = W - 2 * insetX;
  let k = (C.fit === 'cover' ? Math.max(availW / spanW, H / C.SH) : Math.min(availW / spanW, H / C.SH)) * settings.scale;
  k = Math.min(k, (H * (1 - 2 * settings.corePad)) / (C.coreBot - C.coreTop));
  return {
    k,
    tx: W / 2 - C.CX * k,
    ty: (H - C.SH * k) / 2 + H * (settings.yoff / 100),
  };
}
