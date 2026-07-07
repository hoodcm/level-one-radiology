/**
 * fullscreen.ts — the fullscreen viewer overlay (plan M4, decisions 7/8/9).
 *
 * iPhone Safari cannot element-fullscreen (Apple WONTFIX), so the base is a
 * position:fixed overlay sized off visualViewport (correct even when the
 * page itself is pinch-zoomed at entry), safe-area padded, with a fixed-body
 * scroll lock. Where the real Fullscreen API exists (desktop/iPadOS) it is
 * layered on top of the same overlay.
 *
 * History machine: pushState on open; POPSTATE IS THE SINGLE CLOSE
 * AUTHORITY — ✕ and Esc call history.back(); teardown order is
 * close → unlock body → restore scrollY. A forward-swipe after close lands
 * on the dead state's entry without resurrecting the overlay (only an
 * explicit open builds one).
 *
 * Gestures: one finger scrubs (vertical = the PACS axis) at fit; pinch zooms
 * fit→4×; one finger pans when zoomed (the slider still scrubs at any zoom);
 * double-tap toggles fit↔2×; no swipe-down-dismiss (collides with scrub).
 * TUNE: drag maps to CSS filters (order pinned contrast() brightness(),
 * floors keep the image from ever reading as a dead uniform field), RESET
 * chip when non-neutral, double-tap resets while tuning, resets on close.
 */
import { clampFrame, clampToFrontier, frameForDrag } from './mapping';
import { drawContain, fitCanvas } from './render';

export interface FullscreenController {
  title: string;
  metaText: string;
  frames: number;
  frame: number;
  ppf: number;
  el: HTMLElement; // the <case-viewer>: cv:decoded source + focus return
  bitmap(i: number): ImageBitmap | undefined;
  target(i: number, dir: 1 | -1): void;
  frontier(from: number, dir: 1 | -1): number;
  onClose(finalFrame: number): void;
}

const ZOOM_MAX = 4;
const DOUBLE_TAP_ZOOM = 2;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP_PX = 24;
// TUNE mapping — prototype math (case-viewer-loading-hud.html), floors from
// the plan: contrast 0.3–3, brightness 0.4–2.5. Never zero: a uniform gray/
// black void reads as breakage, not adjustment.
const TUNE_CONTRAST_PER_PX = -0.002;
const TUNE_BRIGHTNESS_PER_PX = 0.008;
const TUNE_CONTRAST_RANGE = [0.3, 3] as const;
const TUNE_BRIGHTNESS_RANGE = [0.4, 2.5] as const;

export class CaseFullscreen {
  #c: FullscreenController;
  #root: HTMLDivElement;
  #stage!: HTMLElement;
  #pan!: HTMLElement;
  #canvas!: HTMLCanvasElement;
  #counter!: HTMLElement;
  #slider!: HTMLInputElement;
  #tuneBtn!: HTMLButtonElement;
  #resetBtn!: HTMLButtonElement;
  #tuneReadout!: HTMLElement;

  #frame: number;
  #scale = 1;
  #tx = 0;
  #ty = 0;
  #tuning = false;
  #contrast = 1;
  #brightness = 1;

  #open = false;
  #closing = false;
  #scrollY = 0;
  #abort = new AbortController();

  #pointers = new Map<number, { x: number; y: number }>();
  #pinchDist = 0;
  #dragStartFrame = 1;
  #dragPx = 0;
  #moveTotal = 0;
  #lastTapTime = 0;
  #lastTapX = 0;
  #lastTapY = 0;

  constructor(controller: FullscreenController) {
    this.#c = controller;
    this.#frame = controller.frame;
    this.#root = this.#build();
  }

  get isOpen(): boolean {
    return this.#open;
  }

  // --- lifecycle --------------------------------------------------------------
  open(): void {
    if (this.#open) return;
    this.#open = true;
    this.#scrollY = window.scrollY;

    history.pushState({ cvFullscreen: this.#c.el.dataset.case }, '');
    window.addEventListener('popstate', this.#onPop, { signal: this.#abort.signal });

    document.body.appendChild(this.#root);
    // Fixed-body scroll lock — the iOS-proof variant.
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.#scrollY}px`;
    document.body.style.width = '100%';

    this.#sizeToViewport();
    visualViewport?.addEventListener('resize', this.#onViewport, { signal: this.#abort.signal });
    visualViewport?.addEventListener('scroll', this.#onViewport, { signal: this.#abort.signal });

    // Real Fullscreen API where it exists; the overlay is the fallback AND
    // the content either way. Exit via Esc/system chrome routes through
    // fullscreenchange → history.back() → popstate teardown.
    if (document.fullscreenEnabled) {
      this.#root.requestFullscreen().catch(() => {});
      document.addEventListener(
        'fullscreenchange',
        () => {
          if (!document.fullscreenElement) this.requestClose();
        },
        { signal: this.#abort.signal }
      );
    }

    this.#syncFrame(this.#c.frame);
    (this.#root.querySelector('[data-fs-close]') as HTMLButtonElement).focus();
    this.#c.el.addEventListener('cv:decoded', this.#onDecoded, { signal: this.#abort.signal });
  }

  /** The one close entry point users reach — routes through history, exactly
   *  once: Esc under native fullscreen races the fullscreenchange handler, so
   *  #closing collapses both into a single history.back() (cleared in teardown). */
  requestClose(): void {
    if (!this.#open || this.#closing) return;
    this.#closing = true;
    history.back();
  }

  #onPop = (): void => {
    this.#teardown();
  };

  #teardown(): void {
    if (!this.#open) return;
    this.#open = false;
    this.#closing = false;
    this.#abort.abort(); // all listeners, incl. popstate
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    this.#resetTune();
    this.#root.remove();
    // Order pinned by the plan: close → unlock body → restore scrollY.
    // behavior: 'instant' overrides the page's scroll-behavior: smooth —
    // restoration must be invisible, not a 2000px glide.
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo({ top: this.#scrollY, left: 0, behavior: 'instant' });
    this.#c.onClose(this.#frame);
  }

  #onViewport = (): void => {
    this.#sizeToViewport();
    this.#redraw();
  };

  #sizeToViewport(): void {
    const vv = visualViewport;
    if (!vv) return;
    this.#root.style.width = `${vv.width}px`;
    this.#root.style.height = `${vv.height}px`;
    this.#root.style.transform = `translate(${vv.offsetLeft}px, ${vv.offsetTop}px)`;
  }

  // --- DOM ---------------------------------------------------------------------
  #build(): HTMLDivElement {
    const root = document.createElement('div');
    root.className = 'cv-fs';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', `${this.#c.title} — fullscreen viewer`);
    root.innerHTML = `
<div class="cv-fs__meta"><span data-fs-meta></span><span class="cv-fs__counter" data-fs-counter></span></div>
<div class="cv-fs__stage" data-fs-stage><div class="cv-fs__pan" data-fs-pan><canvas data-fs-canvas></canvas></div></div>
<button type="button" class="cv-fs__close" data-fs-close aria-label="Close fullscreen viewer">✕</button>
<div class="cv-fs__bar">
<input type="range" data-fs-slider min="1" max="${this.#c.frames}" step="1" aria-label="Image position, ${this.#c.title}" />
<button type="button" class="cv-fs__chip" data-fs-tune aria-pressed="false">TUNE</button>
<button type="button" class="cv-fs__chip" data-fs-reset hidden>RESET</button>
</div>
<div class="cv-fs__readout" data-fs-readout hidden></div>`;

    this.#stage = root.querySelector('[data-fs-stage]')!;
    this.#pan = root.querySelector('[data-fs-pan]')!;
    this.#canvas = root.querySelector('[data-fs-canvas]')!;
    this.#counter = root.querySelector('[data-fs-counter]')!;
    this.#slider = root.querySelector('[data-fs-slider]')!;
    this.#tuneBtn = root.querySelector('[data-fs-tune]')!;
    this.#resetBtn = root.querySelector('[data-fs-reset]')!;
    this.#tuneReadout = root.querySelector('[data-fs-readout]')!;
    (root.querySelector('[data-fs-meta]') as HTMLElement).textContent = this.#c.metaText;

    const { signal } = this.#abort;
    root.querySelector('[data-fs-close]')!.addEventListener('click', () => this.requestClose(), { signal });
    document.addEventListener(
      'keydown',
      (e) => {
        if (!this.#open) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          this.requestClose();
        } else if (e.key === 'Tab') {
          this.#trapFocus(e);
        }
      },
      { signal }
    );

    this.#slider.addEventListener('input', () => this.#setFrame(Number(this.#slider.value)), { signal });
    this.#tuneBtn.addEventListener('click', () => this.#toggleTune(), { signal });
    this.#resetBtn.addEventListener('click', () => this.#resetTune(), { signal });

    this.#stage.addEventListener('pointerdown', (e) => this.#down(e), { signal });
    this.#stage.addEventListener('pointermove', (e) => this.#move(e), { signal });
    this.#stage.addEventListener('pointerup', (e) => this.#up(e), { signal });
    this.#stage.addEventListener('pointercancel', (e) => this.#up(e), { signal });
    this.#stage.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const dir = (Math.sign(e.deltaY) || 1) as 1 | -1;
        this.#setFrame(clampToFrontier(this.#frame + dir, this.#c.frontier(this.#frame, dir), dir));
      },
      { signal, passive: false }
    );
    return root;
  }

  #trapFocus(e: KeyboardEvent): void {
    const focusables = [
      ...this.#root.querySelectorAll<HTMLElement>('button:not([hidden]), input'),
    ];
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !this.#root.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !this.#root.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  }

  // --- frames -------------------------------------------------------------------
  #onDecoded = (e: Event): void => {
    if ((e as CustomEvent<{ index: number }>).detail.index === this.#frame) this.#redraw();
  };

  #setFrame(target: number): void {
    const clamped = clampFrame(target, this.#c.frames);
    const dir: 1 | -1 = clamped >= this.#frame ? 1 : -1;
    this.#frame = clamped;
    this.#c.target(clamped, dir);
    this.#syncFrame(clamped);
  }

  #syncFrame(frame: number): void {
    this.#frame = frame;
    this.#counter.textContent = `IM ${frame}/${this.#c.frames}`;
    this.#slider.value = String(frame);
    this.#slider.setAttribute('aria-valuetext', `Image ${frame} of ${this.#c.frames}`);
    this.#redraw();
  }

  #redraw(): void {
    const bmp = this.#c.bitmap(this.#frame);
    if (!bmp) return;
    const r = this.#stage.getBoundingClientRect();
    fitCanvas(this.#canvas, r.width, r.height);
    drawContain(this.#canvas, bmp);
  }

  // --- gestures -------------------------------------------------------------------
  #down(e: PointerEvent): void {
    try {
      this.#stage.setPointerCapture(e.pointerId); // synthetic pointers (tests) have none
    } catch {
      /* noop */
    }
    this.#pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.#pointers.size === 2) {
      const [a, b] = [...this.#pointers.values()];
      this.#pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      return;
    }
    this.#dragStartFrame = this.#frame;
    this.#dragPx = 0;
    this.#moveTotal = 0;
  }

  #move(e: PointerEvent): void {
    const prev = this.#pointers.get(e.pointerId);
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    this.#pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.#moveTotal += Math.abs(dx) + Math.abs(dy);

    if (this.#pointers.size === 2) {
      const [a, b] = [...this.#pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.#pinchDist > 0) {
        this.#applyPinch(dist / this.#pinchDist, (a.x + b.x) / 2, (a.y + b.y) / 2);
      }
      this.#pinchDist = dist;
      return;
    }

    if (this.#tuning) {
      this.#applyTuneDrag(dx, dy);
    } else if (this.#scale > 1) {
      this.#applyPanTransform(this.#scale, this.#tx + dx, this.#ty + dy);
    } else {
      // Fit: one finger scrubs. Vertical is the PACS axis; horizontal rides
      // along so the inline muscle memory transfers.
      this.#dragPx += dx + dy;
      this.#setFrame(
        frameForDrag(this.#dragStartFrame, this.#dragPx, this.#c.ppf, this.#c.frames, this.#frame, (f, d) =>
          this.#c.frontier(f, d)
        )
      );
    }
  }

  #up(e: PointerEvent): void {
    this.#pointers.delete(e.pointerId);
    this.#pinchDist = 0;
    // Double-tap: fit↔2× (anchored at the tap); while tuning it resets TUNE.
    const now = performance.now();
    const moved = this.#moveTotal > DOUBLE_TAP_SLOP_PX;
    if (!moved && this.#pointers.size === 0 && e.pointerType === 'touch') {
      if (
        now - this.#lastTapTime < DOUBLE_TAP_MS &&
        Math.hypot(e.clientX - this.#lastTapX, e.clientY - this.#lastTapY) < DOUBLE_TAP_SLOP_PX * 2
      ) {
        if (this.#tuning) this.#resetTune();
        else if (this.#scale > 1) this.#applyPanTransform(1, 0, 0);
        else this.#applyPinch(DOUBLE_TAP_ZOOM, e.clientX, e.clientY);
        this.#lastTapTime = 0;
        return;
      }
      this.#lastTapTime = now;
      this.#lastTapX = e.clientX;
      this.#lastTapY = e.clientY;
    }
  }

  // --- zoom / pan -------------------------------------------------------------------
  #applyPinch(ratio: number, cx: number, cy: number): void {
    const next = Math.min(ZOOM_MAX, Math.max(1, this.#scale * ratio));
    const r = this.#stage.getBoundingClientRect();
    const mx = cx - r.left;
    const my = cy - r.top;
    // Keep the pinch midpoint stationary while the scale changes around it.
    const k = next / this.#scale;
    this.#applyPanTransform(next, mx - (mx - this.#tx) * k, my - (my - this.#ty) * k);
  }

  #applyPanTransform(scale: number, tx: number, ty: number): void {
    const r = this.#stage.getBoundingClientRect();
    if (scale <= 1) {
      scale = 1;
      tx = 0;
      ty = 0;
    } else {
      // Content is the stage box scaled from origin 0,0: keep it covering.
      tx = Math.min(0, Math.max(r.width - r.width * scale, tx));
      ty = Math.min(0, Math.max(r.height - r.height * scale, ty));
    }
    this.#scale = scale;
    this.#tx = tx;
    this.#ty = ty;
    this.#pan.style.transformOrigin = '0 0';
    this.#pan.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    this.#root.dataset.zoom = scale === 1 ? 'fit' : String(Math.round(scale * 100) / 100);
  }

  // --- TUNE -------------------------------------------------------------------------
  #toggleTune(): void {
    this.#tuning = !this.#tuning;
    this.#tuneBtn.setAttribute('aria-pressed', String(this.#tuning));
    this.#tuneReadout.hidden = !this.#tuning;
    if (this.#tuning) this.#syncTune();
  }

  #applyTuneDrag(dx: number, dy: number): void {
    const [cMin, cMax] = TUNE_CONTRAST_RANGE;
    const [bMin, bMax] = TUNE_BRIGHTNESS_RANGE;
    this.#contrast = Math.min(cMax, Math.max(cMin, this.#contrast + dx * TUNE_CONTRAST_PER_PX));
    this.#brightness = Math.min(bMax, Math.max(bMin, this.#brightness - dy * TUNE_BRIGHTNESS_PER_PX));
    this.#syncTune();
  }

  #syncTune(): void {
    const neutral = this.#contrast === 1 && this.#brightness === 1;
    // Order pinned: contrast() then brightness() — reordering changes output.
    this.#canvas.style.filter = neutral
      ? ''
      : `contrast(${this.#contrast.toFixed(3)}) brightness(${this.#brightness.toFixed(3)})`;
    this.#resetBtn.hidden = !this.#tuning || neutral;
    this.#tuneReadout.textContent = `TUNE C ${this.#contrast.toFixed(1)} · B ${this.#brightness.toFixed(1)}`;
  }

  /** Honest render adjustment only — never persisted: resets on close. */
  #resetTune(): void {
    this.#contrast = 1;
    this.#brightness = 1;
    if (this.#tuning) {
      this.#tuning = false;
      this.#tuneBtn.setAttribute('aria-pressed', 'false');
      this.#tuneReadout.hidden = true;
    }
    this.#syncTune();
  }
}
