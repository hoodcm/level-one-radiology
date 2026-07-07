/**
 * mapping.ts — pure scrub-position math for the case viewer. DOM-free.
 *
 * The gesture contract (plan decisions 6 + locked spike knob):
 *   - direct 1:1 px→frame mapping, integer snap, zero momentum
 *   - pxPerFrame = clamp(containerWidth / frameCount, PPF_MIN, PPF_MAX)
 *   - scrub position clamps to the decoded frontier, so the counter can
 *     never assert a slice the screen isn't showing
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

/**
 * Clamp a scrub target to the decoded frontier in the direction of travel.
 * The frontier is measured from the CURRENT frame (which the store protects
 * from eviction), so scrub never outruns decode in either direction —
 * outrunning it holds at the last decoded frame ("slight weight") and motion
 * resumes as decode catches up. The counter can never assert a slice the
 * screen isn't showing.
 */
export function clampToFrontier(target: number, frontier: number, dir: 1 | -1): number {
  return dir === 1 ? Math.min(target, frontier) : Math.max(target, frontier);
}

/** Full pipeline: drag delta → renderable frame index. `frontier` resolves
 *  the store's contiguous-decoded reach from the current frame toward the
 *  travel direction (eviction-protected); it is queried once, after the
 *  direction of travel is known. */
export function frameForDrag(
  startFrame: number,
  deltaPx: number,
  ppf: number,
  frames: number,
  currentFrame: number,
  frontier: (frame: number, dir: 1 | -1) => number
): number {
  const raw = clampFrame(scrubTarget(startFrame, deltaPx, ppf), frames);
  const dir: 1 | -1 = raw >= currentFrame ? 1 : -1;
  return clampFrame(clampToFrontier(raw, frontier(currentFrame, dir), dir), frames);
}
