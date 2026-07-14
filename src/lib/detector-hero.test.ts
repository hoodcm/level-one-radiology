// Contract test for the detector-hero generator's exported surface
// (detector-hero plan step 1). DetectorHero.astro consumes these in BOTH its
// frontmatter (build-time static SVGs) and its client script (responsive
// rebuild + motion) — a renamed or reshaped export breaks one path silently.
// Assertions are the generic geometric promises, not today's exact numbers.
import { describe, expect, it } from 'vitest';
import {
  DESKTOP,
  DESKTOP_MEDIA,
  SETTINGS,
  fitTransform,
  mobileComp,
  occluderRect,
  sigmaOf,
  slabPath,
  stackPaths,
  vaneDepth,
  vaneFrontD,
  vaneList,
  vanePullOffset,
  vaneRest,
  vanesFor,
} from './detector-hero.mjs';

const PATH_RE = /^M [\d.\- ]+ L [\d.\- ]+/; // an SVG path of absolute segments

describe('detector-hero generator contract', () => {
  const comps = [DESKTOP, mobileComp()];

  it('exposes the two compositions with derived spans', () => {
    for (const C of comps) {
      expect(C.halfSpan).toBeGreaterThan(0);
      expect(C.slabH).toBeGreaterThan(0);
      expect(C.stackH).toBeGreaterThan(0);
      expect(['cover', 'contain']).toContain(C.fit);
    }
    // the portrait recomposition centers the DRAWN CONTENT CORE (stack top →
    // fan bottom) in its canvas, so cover-fit crops only empty margin
    const M = mobileComp();
    const drawnTop = M.stackTop;
    const drawnBottom = M.slab.bot + M.slabH * SETTINGS.gridLen;
    expect((drawnTop + drawnBottom) / 2).toBeCloseTo(M.SH / 2, 6);
  });

  it('emits one stack path per locked layer, deepest first', () => {
    for (const C of comps) {
      const stack = stackPaths(C);
      expect(stack).toHaveLength(SETTINGS.layers);
      stack.forEach((l, i) => {
        expect(l.d).toMatch(PATH_RE);
        expect(l.order).toBe(i);
      });
      // parallax fraction decreases monotonically toward the slab (deeper = more)
      const fracs = stack.map((l) => l.frac);
      expect(fracs[0]).toBe(1);
      expect([...fracs].sort((a, b) => b - a)).toEqual(fracs);
    }
  });

  it('emits a closed slab outline and an occluder inset inside it', () => {
    for (const C of comps) {
      expect(slabPath(C).trim().endsWith('Z')).toBe(true);
      const o = occluderRect(C);
      expect(o.x).toBeGreaterThan(C.slab.x0);
      expect(o.y).toBeGreaterThan(C.slab.top);
      expect(o.x + o.width).toBeLessThan(C.slab.x1);
      expect(o.y + o.height).toBeLessThan(C.slab.bot);
    }
  });

  it('emits 2·vN+1 fan plates whose depth edges stay order-preserving', () => {
    for (const C of comps) {
      const vN = vanesFor(C);
      const list = vaneList(C);
      expect(list).toHaveLength(2 * vN + 1);
      for (const v of list) {
        expect(v.top).toBeGreaterThan(C.slab.bot); // fan hangs below the slab
        expect(vaneFrontD(C, v)).toMatch(PATH_RE);
        expect(vaneDepth(C, v, 0)).toContain('M ');
      }
      // rest geometry via vaneRest matches the list entries
      const mid = vaneRest(C, C.CX);
      expect(mid.drop).toBeGreaterThan(0);
    }
  });

  it('touch pull: rigid pane along its plane, top edge stretching from the pinned slab anchor', () => {
    const nums = (d: string) => (d.match(/-?[\d.]+/g) ?? []).map(Number);
    for (const C of comps) {
      const list = vaneList(C);
      // center, mid, and outermost plates exercise all three dxEnd caps
      for (const v of [list[0], list[Math.floor(list.length / 4)], list[Math.floor(list.length / 2)]]) {
        for (const sigma of [0, sigmaOf(C, 200)]) {
          const t = SETTINGS.touchPull * C.slabH * SETTINGS.gridLen;
          const { dx, dy } = vanePullOffset(C, v, sigma, t);
          // along-plane: downward, magnitude t, and zero at rest
          expect(dy).toBeGreaterThan(0);
          expect(Math.hypot(dx, dy)).toBeCloseTo(t, 6);
          const rest = vanePullOffset(C, v, sigma, 0);
          expect(Math.hypot(rest.dx, rest.dy)).toBe(0);
          expect(vaneDepth(C, v, sigma, 0)).toBe(vaneDepth(C, v, sigma));
          const [rx1, ry1, rx2, ry2, rx3, ry3, rx4, ry4] = nums(vaneDepth(C, v, sigma));
          const [px1, py1, px2, py2, px3, py3, px4, py4] = nums(vaneDepth(C, v, sigma, t));
          // top edge: front rides the pane, rear stays pinned ON the slab —
          // and a slab-capped edge stretches colinearly with its rest line
          // (run-capped near-center edges are degenerate-vertical; their pull
          // direction carries the max(|run|, 0.5) clamp's sub-pixel lateral,
          // so colinearity is only the slab-capped contract)
          expect([px1, py1]).toEqual([rx1 + dx, ry1 + dy]);
          expect([px2, py2]).toEqual([rx2, ry2]);
          expect(ry2).toBe(C.slab.bot);
          const run = C.CX + (v.x - C.CX) * 0.433 + sigma - v.x;
          const m = (v.drop * SETTINGS.fan) / Math.max(Math.abs(run), 0.5);
          if ((v.top - C.slab.bot) / m < Math.abs(run)) {
            const cross = (px1 - rx2) * (ry1 - ry2) - (py1 - ry2) * (rx1 - rx2);
            expect(Math.abs(cross)).toBeLessThan(1e-6 * Math.hypot(rx1 - rx2, ry1 - ry2) ** 2 + 1e-6);
          }
          // bottom edge: front rides the pane; the rear tip is an occlusion
          // boundary — pinned by default, and riding the kissed neighbor's
          // shift ONLY when the neighbor (pitch) cap binds
          expect([px3, py3]).toEqual([rx3 + dx, ry3 + dy]);
          expect([px4, py4]).toEqual([rx4, ry4]);
          const bot = C.slab.bot + C.slabH * SETTINGS.gridLen;
          const pitch = C.halfSpan / vanesFor(C);
          const dxEnd = Math.min(Math.abs(run), pitch, (bot - C.slab.bot) / m);
          const shifted = nums(vaneDepth(C, v, sigma, t, SETTINGS, { dx: 5, dy: 9 }));
          if (dxEnd === pitch) {
            expect([shifted[6], shifted[7]]).toEqual([rx4 + 5, ry4 + 9]);
            // a tip that would rise above the neighbor's front-top corner
            // clamps onto it (minY)
            const clamped = nums(vaneDepth(C, v, sigma, t, SETTINGS, { dx: 5, dy: 9, minY: ry4 + 109 }));
            expect(clamped[7]).toBe(ry4 + 109);
          } else {
            expect([shifted[6], shifted[7]]).toEqual([rx4, ry4]);
          }
        }
      }
    }
  });

  it('saturates sigma inside 0.8 of one plate pitch, odd-symmetric', () => {
    for (const C of comps) {
      const sigMax = (0.8 * C.halfSpan) / vanesFor(C);
      for (const dfx of [1, 50, 500, 5000, 1e6]) {
        const s = sigmaOf(C, dfx);
        expect(Math.abs(s)).toBeLessThanOrEqual(sigMax);
        expect(sigmaOf(C, -dfx)).toBeCloseTo(-s, 9);
      }
      expect(sigmaOf(C, 0)).toBe(0);
    }
  });

  it('fitTransform: cover fit over the fit span, clamped so the drawn core keeps its padding', () => {
    // cover math × scale over the composition's fitSpan (full canvas when
    // absent), then the INHERENT PADDING GUARANTEE: k is clamped so the core
    // (stack top → fan bottom) fits with corePad × H clear above and below —
    // on short heroes the clamp binds and the drawing shrinks inside the
    // width (the copy's horizontal seat handles the text there)
    for (const [W, H] of [[1440, 900], [390, 844], [768, 1024], [1398, 377]]) {
      for (const C of [DESKTOP, mobileComp()]) {
        const { k } = fitTransform(C, W, H);
        const spanW = C.fitSpan ? C.fitSpan.x1 - C.fitSpan.x0 : C.SW;
        const cover = Math.max(W / spanW, H / C.SH) * SETTINGS.scale;
        const clamp = (H * (1 - 2 * SETTINGS.corePad)) / (C.coreBot - C.coreTop);
        expect(k).toBeCloseTo(Math.min(cover, clamp), 9);
        expect((C.coreBot - C.coreTop) * k).toBeLessThanOrEqual(H * (1 - 2 * SETTINGS.corePad) + 1e-9);
      }
    }
  });

  it('fitTransform seats the mobile slab on the page margins (insetX)', () => {
    // the content-box fit: at a width-bound k the slab's edges land exactly
    // on the grid margins, like every other element on the page
    const M = mobileComp();
    for (const [W, H, m] of [[390, 384, 32], [430, 420, 32], [820, 573, 40]]) {
      const { k, tx } = fitTransform(M, W, H, SETTINGS, m);
      const widthBound = ((W - 2 * m) / (M.slab.x1 - M.slab.x0)) * SETTINGS.scale;
      const clamp = (H * (1 - 2 * SETTINGS.corePad)) / (M.coreBot - M.coreTop);
      if (widthBound <= clamp) {
        expect(M.slab.x0 * k + tx).toBeCloseTo(m, 6);
        expect(M.slab.x1 * k + tx).toBeCloseTo(W - m, 6);
      } else {
        // clamp binds: the slab sits centered INSIDE the margins, never past
        expect(M.slab.x0 * k + tx).toBeGreaterThanOrEqual(m - 1e-6);
        expect(M.slab.x1 * k + tx).toBeLessThanOrEqual(W - m + 1e-6);
      }
    }
  });

  it('publishes the shared composition predicate as a media-query string', () => {
    // consumed verbatim by matchMedia and mirrored by the CSS media queries —
    // the one viewport condition both the drawing and the copy switch on
    expect(DESKTOP_MEDIA).toContain('min-width');
    expect(DESKTOP_MEDIA).toContain('min-aspect-ratio');
  });
});
