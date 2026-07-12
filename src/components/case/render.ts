/**
 * render.ts — the one canvas-blit path, shared by the inline element and the
 * fullscreen overlay. Backing store = css size × devicePixelRatio (capped:
 * beyond 3 the blit cost rises with no visible gain on ≤1200px sources);
 * frames draw contain-fit (the stage can letterbox when a height cap bites).
 */

export const DPR_CAP = 3;

/** Size the canvas backing store to its css box; returns true if it changed
 *  (a resize clears the canvas, so the caller must redraw). */
export function fitCanvas(canvas: HTMLCanvasElement, cssW: number, cssH: number): boolean {
  const dpr = Math.min(devicePixelRatio || 1, DPR_CAP);
  const w = Math.round(cssW * dpr);
  const h = Math.round(cssH * dpr);
  if (canvas.width === w && canvas.height === h) return false;
  canvas.width = w;
  canvas.height = h;
  return true;
}

/** The "N/M" readout, N space-padded to M's width so the label stays anchored
 *  as the count crosses digit boundaries (the counter's monospace + white-
 *  space:pre hold it fixed). One contract for the inline element and the
 *  fullscreen overlay, both kinds. (case-shell.mjs emits the same shape at
 *  build time but cannot import this browser module — that copy is the one
 *  the node/browser boundary forces.) */
export function counterText(frame: number, frames: number, prefix = ''): string {
  return `${prefix}${String(frame).padStart(String(frames).length, ' ')}/${frames}`;
}

/** Keep the selected views-rail thumb visible by scrolling the RAIL only,
 *  horizontally. scrollIntoView is off-limits here: it scrolls every
 *  scrollable ancestor, so a rail tap could yank the whole page. Shared by
 *  the inline element and the fullscreen overlay. */
export function railReveal(rail: HTMLElement, btn: HTMLElement): void {
  const left = btn.offsetLeft - rail.offsetLeft;
  const right = left + btn.offsetWidth;
  if (left < rail.scrollLeft) rail.scrollLeft = left;
  else if (right > rail.scrollLeft + rail.clientWidth) rail.scrollLeft = right - rail.clientWidth;
}

export function drawContain(canvas: HTMLCanvasElement, bmp: ImageBitmap): void {
  const ctx = canvas.getContext('2d')!;
  const { width: cw, height: ch } = canvas;
  const scale = Math.min(cw / bmp.width, ch / bmp.height);
  const dw = bmp.width * scale;
  const dh = bmp.height * scale;
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(bmp, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}
