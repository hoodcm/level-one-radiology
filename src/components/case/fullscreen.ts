/**
 * fullscreen.ts — the fullscreen viewer overlay (plan M4, decisions 7/8/9).
 *
 * iPhone Safari cannot element-fullscreen (Apple WONTFIX), so fullscreen is
 * a position:fixed overlay sized off visualViewport (correct even when the
 * page itself is pinch-zoomed at entry), safe-area padded, with a fixed-body
 * scroll lock — on EVERY platform. The native Fullscreen API is deliberately
 * unused: element fullscreen escalates to the host window in embedded
 * browsers (VS Code preview), and one code path beats two.
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
 * W/L adjust (the contrast chip): drag maps to CSS filters (order pinned
 * contrast() brightness(), floors keep the image from ever reading as a dead
 * uniform field). The readout is a live W/L pad — a dot on an X-Y plane that
 * mirrors the drag (right = wider window, up = brighter), no numbers. RESET
 * chip when non-neutral, double-tap resets while adjusting, resets on close.
 */
import { iconSvg } from '../../lib/case-icons.mjs';
import { clampFrame, frameForDrag } from './mapping';
import { counterText, drawContain, fitCanvas, railReveal } from './render';

export interface FullscreenController {
  title: string;
  metaText: string;
  frames: number;
  frame: number;
  ppf: number;
  el: HTMLElement; // the <case-viewer>: cv:decoded source + focus return
  /** Views kind: labeled thumbnails replace the slider (the inline rail,
   *  reused); a frame index is a 1-based view index. */
  views?: { key: string; label: string; thumb: string }[];
  /** Views kind: live meta-strip text for the shown view. */
  metaFor?(i: number): string;
  bitmap(i: number): ImageBitmap | undefined;
  target(i: number, dir: 1 | -1): void;
  /** Mirror the overlay's frame back onto the inline viewer NOW (close is
   *  beginning; the collapse must never reveal a stale inline frame). */
  sync(frame: number): void;
  onClose(finalFrame: number): void;
}

// Switch-off hold: close defers until the CRT collapse lands — the designed
// 150ms off-beat (tokens/case-viewer.css --cv-crt-off; keep in step) plus a
// couple of frames so the cut never clips the line.
const CRT_OFF_MS = 180;

const ZOOM_MAX = 4;
const DOUBLE_TAP_ZOOM = 2;
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_SLOP_PX = 24;
const WHEEL_STEP_CAP = 3; // per animation frame — keep in step with case-viewer.ts
// TUNE mapping — prototype math (case-viewer-loading-hud.html), floors from
// the plan: contrast 0.3–3, brightness 0.4–2.5. Never zero: a uniform gray/
// black void reads as breakage, not adjustment.
const TUNE_CONTRAST_PER_PX = -0.002;
const TUNE_BRIGHTNESS_PER_PX = 0.008;
const TUNE_CONTRAST_RANGE = [0.3, 3] as const;
const TUNE_BRIGHTNESS_RANGE = [0.4, 2.5] as const;
// W/L pad geometry (viewBox units; CSS renders it 1:1 via --cv-wl-pad-*).
// The dot keeps its radius clear of the frame at the clamp extremes.
const WL_PAD_W = 64;
const WL_PAD_H = 44;
const WL_DOT_R = 3;

export class CaseFullscreen {
  #c: FullscreenController;
  #root: HTMLDivElement;
  #stage!: HTMLElement;
  #pan!: HTMLElement;
  #canvas!: HTMLCanvasElement;
  #counter!: HTMLElement;
  /** Absent on views kind — the rail owns selection there. */
  #slider: HTMLInputElement | null = null;
  #meta!: HTMLElement;
  #tuneBtn!: HTMLButtonElement;
  #resetBtn!: HTMLButtonElement;
  #tuneReadout!: HTMLElement;
  #wlDot!: SVGCircleElement;

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
  #lastPointerType = '';
  #wheelSteps = 0;
  #wheelArmed = false;
  // Stage rect, cached per viewport event so the per-frame path (#redraw,
  // pinch/pan clamps) never reads getBoundingClientRect after #syncFrame's
  // DOM writes — that read forced one synchronous reflow per scrub frame.
  #rect: { left: number; top: number; width: number; height: number } = {
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  };

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
    // Fixed-body scroll lock — the iOS-proof variant. The gutter pad holds
    // the page width steady where a classic scrollbar exists: fixing the body
    // collapses the document scrollbar and the page would reflow wider the
    // instant the overlay opens — visible movement under the CRT dwell.
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.#scrollY}px`;
    document.body.style.width = '100%';

    this.#sizeToViewport();
    visualViewport?.addEventListener('resize', this.#onViewport, { signal: this.#abort.signal });
    visualViewport?.addEventListener('scroll', this.#onViewport, { signal: this.#abort.signal });

    // Overlay-only, everywhere: the fixed visualViewport-sized overlay IS the
    // fullscreen experience. The native Fullscreen API is deliberately not
    // used — element fullscreen escalates to the host window in embedded
    // browsers (VS Code preview) and iPhone Safari never had it, so the
    // overlay is the one code path on every platform.
    this.#syncFrame(this.#c.frame);
    (this.#root.querySelector('[data-fs-close]') as HTMLButtonElement).focus();
    this.#c.el.addEventListener('cv:decoded', this.#onDecoded, { signal: this.#abort.signal });
  }

  /** The one close entry point users reach — routes through history, exactly
   *  once (#closing guards double-invocation, cleared in teardown). */
  requestClose(): void {
    if (!this.#open || this.#closing) return;
    this.#closing = true;
    // The inline viewer behind the scrim still shows the frame it froze on
    // at promote — repaint it to the overlay's frame BEFORE the collapse
    // starts, so the reveal is seamless (the back-gesture popstate path
    // needs no sync: teardown and onClose run in one task, one paint).
    this.#c.sync(this.#frame);
    // CRT switch-off beat before the real close (authored motion — reduced
    // motion closes immediately). A direct back-gesture popstate still tears
    // down instantly: system navigation is never animated against.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      history.back();
      return;
    }
    this.#root.classList.add('is-shutdown');
    setTimeout(() => history.back(), CRT_OFF_MS);
  }

  #onPop = (): void => {
    this.#teardown();
  };

  #teardown(): void {
    if (!this.#open) return;
    this.#open = false;
    this.#closing = false;
    this.#abort.abort(); // all listeners, incl. popstate
    this.#resetTune();
    this.#root.remove();
    // Order pinned by the plan: close → unlock body → restore scrollY.
    // behavior: 'instant' overrides the page's scroll-behavior: smooth —
    // restoration must be invisible, not a 2000px glide.
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.paddingRight = '';
    window.scrollTo({ top: this.#scrollY, left: 0, behavior: 'instant' });
    this.#c.onClose(this.#frame);
  }

  #onViewport = (): void => {
    this.#sizeToViewport();
    this.#redraw();
  };

  #sizeToViewport(): void {
    const vv = visualViewport;
    if (vv) {
      this.#root.style.width = `${vv.width}px`;
      this.#root.style.height = `${vv.height}px`;
      this.#root.style.transform = `translate(${vv.offsetLeft}px, ${vv.offsetTop}px)`;
    }
    // One deliberate layout read per viewport event, in place of one per frame.
    // offset* metrics, not getBoundingClientRect: the CRT morph scales the
    // root at entry/exit, and a mid-morph rect would bake that scale into the
    // cache (distorting the first fitCanvas). offset* reads the unscaled
    // layout box; the root is the offsetParent (position:fixed), so adding
    // its visualViewport translation back yields viewport coords for the
    // pinch/pan pointer math.
    this.#rect = {
      left: (vv?.offsetLeft ?? 0) + this.#stage.offsetLeft,
      top: (vv?.offsetTop ?? 0) + this.#stage.offsetTop,
      width: this.#stage.offsetWidth,
      height: this.#stage.offsetHeight,
    };
  }

  // --- DOM ---------------------------------------------------------------------
  #build(): HTMLDivElement {
    const root = document.createElement('div');
    root.className = 'cv-fs';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', `${this.#c.title} — fullscreen viewer`);
    // The __screen wrapper is the CRT rect: it morphs while the root stays
    // full-size — a scrim field over the page (masking any reflow behind the
    // animation) and the input surface from the first frame.
    // Views kind: the inline rail (same classes — the overlay is light DOM,
    // so component CSS applies) sits in the slider's slot.
    const scrubber = this.#c.views
      ? `<div class="cv__rail" role="radiogroup" aria-label="Views" data-fs-rail>${this.#c.views
          .map(
            (v, i) =>
              `<button type="button" role="radio" aria-checked="${i + 1 === this.#frame}" data-fs-view="${i + 1}"><img src="${v.thumb}" alt="" loading="lazy" decoding="async" /><span></span></button>`
          )
          .join('')}</div>`
      : `<input type="range" data-fs-slider min="1" max="${this.#c.frames}" step="1" />`;
    root.innerHTML = `
<div class="cv-fs__screen">
<div class="cv-fs__meta"><span data-fs-meta></span><span class="cv-fs__counter" data-fs-counter></span></div>
<div class="cv-fs__stage" data-fs-stage><div class="cv-fs__pan" data-fs-pan><canvas data-fs-canvas></canvas></div></div>
<button type="button" class="cv-fs__chip cv-fs__close" data-fs-close aria-label="Close fullscreen viewer">${iconSvg('x')}</button>
<div class="cv-fs__bar">
${scrubber}
<button type="button" class="cv-fs__chip" data-fs-reset hidden>RESET</button>
<button type="button" class="cv-fs__chip" data-fs-tune aria-pressed="false" aria-label="Adjust window and level">${iconSvg('contrast')}</button>
</div>
<div class="cv-fs__readout" data-fs-readout role="img" hidden>
<span class="cv-fs__readout-label">W/L</span>
<svg class="cv-fs__wl" viewBox="0 0 ${WL_PAD_W} ${WL_PAD_H}" aria-hidden="true"><line x1="${WL_PAD_W / 2}" y1="0" x2="${WL_PAD_W / 2}" y2="${WL_PAD_H}"/><line x1="0" y1="${WL_PAD_H / 2}" x2="${WL_PAD_W}" y2="${WL_PAD_H / 2}"/><circle data-fs-wl-dot cx="${WL_PAD_W / 2}" cy="${WL_PAD_H / 2}" r="${WL_DOT_R}"/></svg>
</div>
</div>`;

    this.#stage = root.querySelector('[data-fs-stage]')!;
    this.#pan = root.querySelector('[data-fs-pan]')!;
    this.#canvas = root.querySelector('[data-fs-canvas]')!;
    this.#counter = root.querySelector('[data-fs-counter]')!;
    this.#slider = root.querySelector('[data-fs-slider]');
    this.#meta = root.querySelector('[data-fs-meta]')!;
    this.#tuneBtn = root.querySelector('[data-fs-tune]')!;
    this.#resetBtn = root.querySelector('[data-fs-reset]')!;
    this.#tuneReadout = root.querySelector('[data-fs-readout]')!;
    this.#wlDot = root.querySelector('[data-fs-wl-dot]')!;
    this.#meta.textContent = this.#c.metaText;
    // Via setAttribute/textContent, never the innerHTML template: titles and
    // view labels are manifest prose and could break out of the markup.
    this.#slider?.setAttribute('aria-label', `Image position, ${this.#c.title}`);
    if (this.#c.views) {
      root.querySelectorAll<HTMLElement>('[data-fs-view]').forEach((b, i) => {
        b.querySelector('span')!.textContent = this.#c.views![i].label;
      });
    }

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

    this.#slider?.addEventListener('input', () => this.#setFrame(Number(this.#slider!.value)), { signal });
    // PageUp/Down = ±5, matching the inline slider.
    this.#slider?.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'PageUp' && e.key !== 'PageDown') return;
        e.preventDefault();
        this.#setFrame(this.#frame + (e.key === 'PageUp' ? 5 : -5));
      },
      { signal }
    );
    // Views rail: tap selects; arrows/Home/End move selection (the same
    // radio-pattern keyboard contract as the inline rail).
    const rail = root.querySelector<HTMLElement>('[data-fs-rail]');
    if (rail) {
      rail.addEventListener(
        'click',
        (e) => {
          const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-fs-view]');
          if (btn) this.#setFrame(Number(btn.dataset.fsView));
        },
        { signal }
      );
      rail.addEventListener(
        'keydown',
        (e) => {
          const n = this.#c.frames;
          let to: number;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (this.#frame % n) + 1;
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = ((this.#frame - 2 + n) % n) + 1;
          else if (e.key === 'Home') to = 1;
          else if (e.key === 'End') to = n;
          else return;
          e.preventDefault();
          this.#setFrame(to);
          rail.querySelector<HTMLElement>(`[data-fs-view="${to}"]`)?.focus();
        },
        { signal }
      );
    }
    this.#tuneBtn.addEventListener('click', () => this.#toggleTune(), { signal });
    this.#resetBtn.addEventListener('click', () => this.#resetTune(), { signal });

    this.#stage.addEventListener('pointerdown', (e) => this.#down(e), { signal });
    this.#stage.addEventListener('pointermove', (e) => this.#move(e), { signal });
    this.#stage.addEventListener('pointerup', (e) => this.#up(e), { signal });
    this.#stage.addEventListener('pointercancel', (e) => this.#up(e), { signal });
    // Wheel scrub, rAF-coalesced and step-capped — the inline element's
    // contract, so trackpad inertia can't skip slices faster in fullscreen.
    this.#stage.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.#wheelSteps += Math.sign(e.deltaY);
        if (this.#wheelArmed) return;
        this.#wheelArmed = true;
        requestAnimationFrame(() => {
          const step = Math.max(-WHEEL_STEP_CAP, Math.min(WHEEL_STEP_CAP, this.#wheelSteps));
          this.#wheelSteps = 0;
          this.#wheelArmed = false;
          if (step === 0 || !this.#open) return;
          this.#setFrame(this.#frame + step);
        });
      },
      { signal, passive: false }
    );
    // Mouse parity for double-tap: double-click toggles fit↔2× (or resets
    // TUNE) — touch stays on the #up path, which already handles taps.
    this.#stage.addEventListener(
      'dblclick',
      (e) => {
        if (this.#lastPointerType === 'touch') return;
        if (this.#tuning) this.#resetTune();
        else if (this.#scale > 1) this.#applyPanTransform(1, 0, 0);
        else this.#applyPinch(DOUBLE_TAP_ZOOM, e.clientX, e.clientY);
      },
      { signal }
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
    const n = this.#c.frames;
    if (this.#c.views) {
      // Views console: bare "N/M" + live view label + rail selection —
      // mirrors the inline element's views readout contract.
      this.#counter.textContent = counterText(frame, n);
      if (this.#c.metaFor) this.#meta.textContent = this.#c.metaFor(frame);
      const rail = this.#root.querySelector<HTMLElement>('[data-fs-rail]');
      this.#root.querySelectorAll<HTMLElement>('[data-fs-view]').forEach((b) => {
        const checked = Number(b.dataset.fsView) === frame;
        b.setAttribute('aria-checked', String(checked));
        b.tabIndex = checked ? 0 : -1;
        if (checked && rail) railReveal(rail, b);
      });
    } else {
      this.#counter.textContent = counterText(frame, n, 'Image ');
      this.#slider!.value = String(frame);
      this.#slider!.setAttribute('aria-valuetext', `Image ${frame} of ${n}`);
    }
    this.#redraw();
  }

  #redraw(): void {
    const bmp = this.#c.bitmap(this.#frame);
    if (!bmp) return;
    fitCanvas(this.#canvas, this.#rect.width, this.#rect.height);
    drawContain(this.#canvas, bmp);
  }

  // --- gestures -------------------------------------------------------------------
  #down(e: PointerEvent): void {
    try {
      this.#stage.setPointerCapture(e.pointerId); // synthetic pointers (tests) have none
    } catch {
      /* noop */
    }
    this.#lastPointerType = e.pointerType;
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
      this.#setFrame(frameForDrag(this.#dragStartFrame, this.#dragPx, this.#c.ppf, this.#c.frames));
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
    const r = this.#rect;
    const mx = cx - r.left;
    const my = cy - r.top;
    // Keep the pinch midpoint stationary while the scale changes around it.
    const k = next / this.#scale;
    this.#applyPanTransform(next, mx - (mx - this.#tx) * k, my - (my - this.#ty) * k);
  }

  #applyPanTransform(scale: number, tx: number, ty: number): void {
    const r = this.#rect;
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
    // Live W/L pad: the dot mirrors the drag — right = lower contrast (wider
    // window), up = brighter (lower level). Neutral (1,1) pins to the pad's
    // center; each half-axis normalizes to its own side of the clamp range
    // (the ranges are asymmetric around 1, and finger direction must always
    // match dot direction).
    const [cMin, cMax] = TUNE_CONTRAST_RANGE;
    const [bMin, bMax] = TUNE_BRIGHTNESS_RANGE;
    const xN =
      this.#contrast >= 1
        ? (1 - (this.#contrast - 1) / (cMax - 1)) * 0.5
        : 0.5 + ((1 - this.#contrast) / (1 - cMin)) * 0.5;
    const yN =
      this.#brightness >= 1
        ? (1 - (this.#brightness - 1) / (bMax - 1)) * 0.5
        : 0.5 + ((1 - this.#brightness) / (1 - bMin)) * 0.5;
    this.#wlDot.setAttribute('cx', (WL_DOT_R + xN * (WL_PAD_W - 2 * WL_DOT_R)).toFixed(1));
    this.#wlDot.setAttribute('cy', (WL_DOT_R + yN * (WL_PAD_H - 2 * WL_DOT_R)).toFixed(1));
    // AT parity for the visual pad — honest units (these are CSS filter
    // factors, not true DICOM W/L values).
    this.#tuneReadout.setAttribute(
      'aria-label',
      `Contrast ${this.#contrast.toFixed(1)}, brightness ${this.#brightness.toFixed(1)}`
    );
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
