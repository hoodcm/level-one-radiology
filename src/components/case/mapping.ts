/**
 * mapping.ts — pure scrub-position math for the case viewer. DOM-free.
 *
 * The gesture contract (plan decision 6, frontier clamp retired 2026-07-11):
 *   - direct 1:1 px→frame mapping, integer snap, zero momentum
 *   - pxPerFrame = clamp(containerWidth / frameCount, PPF_MIN, PPF_MAX)
 *   - the scrub position follows input exactly — it is never held back by
 *     decode. The canvas shows the scrubbed frame when resident and holds
 *     the last decoded one (stall glyph on) while decode catches up; the
 *     old decoded-frontier clamp made the thumb visibly lag the finger on
 *     iPhone, which read as breakage, not weight.
 */

export const PPF_MIN = 8;
export const PPF_MAX = 24;

/** Pixels of drag per frame step — the primary feel-tuning knob. */
export function pxPerFrame(containerWidth: number, frameCount: number): number {
  return Math.min(PPF_MAX, Math.max(PPF_MIN, containerWidth / frameCount));
}

/** Integer-snap a frame position into the stack's 1..frames range. */
export function clampFrame(frame: number, frames: number): number {
  return Math.max(1, Math.min(frames, Math.round(frame)));
}

/** Raw (unclamped) scrub target for a drag of deltaPx from startFrame. */
export function scrubTarget(startFrame: number, deltaPx: number, ppf: number): number {
  return startFrame + deltaPx / ppf;
}

/** Full pipeline: drag delta → frame index, 1:1 with the finger. */
export function frameForDrag(startFrame: number, deltaPx: number, ppf: number, frames: number): number {
  return clampFrame(scrubTarget(startFrame, deltaPx, ppf), frames);
}
