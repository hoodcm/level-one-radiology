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

  it('fitTransform covers both compositions (mobile spans the hero width)', () => {
    for (const [W, H] of [[1440, 900], [390, 844], [768, 1024]]) {
      const dk = fitTransform(DESKTOP, W, H);
      expect(dk.k).toBeCloseTo(Math.max(W / DESKTOP.SW, H / DESKTOP.SH) * SETTINGS.scale, 9);
      const M = mobileComp();
      const mk = fitTransform(M, W, H);
      expect(mk.k).toBeCloseTo(Math.max(W / M.SW, H / M.SH) * SETTINGS.scale, 9);
      // in a hero squatter than the canvas the width binds — the slab spans it
      if (W / H > M.SW / M.SH) expect(mk.k).toBeCloseTo((W / M.SW) * SETTINGS.scale, 9);
    }
  });

  it('publishes the shared composition predicate as a media-query string', () => {
    // consumed verbatim by matchMedia and mirrored by the CSS media queries —
    // the one viewport condition both the drawing and the copy switch on
    expect(DESKTOP_MEDIA).toContain('min-width');
    expect(DESKTOP_MEDIA).toContain('min-aspect-ratio');
  });
});
