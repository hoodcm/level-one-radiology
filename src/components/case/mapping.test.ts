import { describe, expect, it } from 'vitest';
import {
  PPF_MAX,
  PPF_MIN,
  PX_PER_VIEW,
  clampFrame,
  frameForDrag,
  pxPerFrame,
  scrubTarget,
} from './mapping';

describe('pxPerFrame', () => {
  it('stays inside [PPF_MIN, PPF_MAX] across the realistic input space', () => {
    for (let width = 0; width <= 3200; width += 37) {
      for (let frames = 1; frames <= 240; frames += 7) {
        const v = pxPerFrame(width, frames);
        expect(v).toBeGreaterThanOrEqual(PPF_MIN);
        expect(v).toBeLessThanOrEqual(PPF_MAX);
      }
    }
  });

  it('is width/frames when unclamped', () => {
    expect(pxPerFrame(480, 48)).toBe(10);
  });
});

describe('clampFrame', () => {
  it('integer-snaps into 1..frames for any input', () => {
    for (const f of [-100, 0, 0.4, 1, 23.5, 47.9, 48, 48.5, 1e6, NaN ? 0 : 3.14]) {
      const v = clampFrame(f, 48);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(48);
    }
  });
});

describe('frameForDrag', () => {
  it('always yields an integer frame inside the stack, for any drag', () => {
    const frames = 48;
    for (let start = 1; start <= frames; start += 5) {
      for (let delta = -900; delta <= 900; delta += 41) {
        const f = frameForDrag(start, delta, pxPerFrame(390, frames), frames);
        expect(f).toBeGreaterThanOrEqual(1);
        expect(f).toBeLessThanOrEqual(frames);
        expect(Number.isInteger(f)).toBe(true);
      }
    }
  });

  it('is 1:1 with zero momentum: same delta in, same frame out', () => {
    const ppf = 12;
    expect(frameForDrag(10, 5 * ppf, ppf, 48)).toBe(15);
    expect(frameForDrag(15, -5 * ppf, ppf, 48)).toBe(10);
    expect(scrubTarget(10, 6, ppf)).toBe(10.5);
  });
});

describe('views drag-flip (PX_PER_VIEW TUNE knob)', () => {
  it('is deliberately slower than any stack ppf the clamp can produce', () => {
    expect(PX_PER_VIEW).toBeGreaterThan(PPF_MAX);
  });

  it('flips exactly one view per PX_PER_VIEW of drag, clamped at the rail ends', () => {
    const views = 7;
    expect(frameForDrag(3, PX_PER_VIEW, PX_PER_VIEW, views)).toBe(4);
    expect(frameForDrag(3, -PX_PER_VIEW, PX_PER_VIEW, views)).toBe(2);
    // Sub-half-flip travel snaps back — no accidental view change.
    expect(frameForDrag(3, PX_PER_VIEW * 0.4, PX_PER_VIEW, views)).toBe(3);
    // Ends clamp: no wraparound off the rail.
    expect(frameForDrag(7, PX_PER_VIEW * 5, PX_PER_VIEW, views)).toBe(7);
    expect(frameForDrag(1, -PX_PER_VIEW * 5, PX_PER_VIEW, views)).toBe(1);
  });
});
