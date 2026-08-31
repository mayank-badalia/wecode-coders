export type RailMetrics = {
  /** 0 at the falloff edge, 1 at dead centre. */
  progress: number;
  width: number;
  height: number;
  radius: number;
  saturation: number;
  /** Violet wash opacity. */
  wash: number;
  /** Detail block opacity. */
  detail: number;
  interactive: boolean;
};

const RESTING_W = 0.46; // of viewport width
const RESTING_H = 0.62; // of viewport height
const FALLOFF = 0.6; // of viewport width
const INTERACTIVE_AT = 0.9;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Card presentation as a continuous function of its distance from the
 * viewport centre.
 *
 * The centred card genuinely fills the screen and shrinks back as scrolling
 * continues — growth is not gated behind a click. Keeping this pure means a
 * misbehaving rail can be diagnosed as either bad arithmetic or bad wiring,
 * rather than the two being tangled together.
 *
 * @param dx        card centre minus viewport centre, in px (sign ignored)
 * @param viewport  current viewport size in px
 */
export function railMetrics(
  dx: number,
  viewport: { width: number; height: number },
): RailMetrics {
  // Guard the first paint, when the viewport can still measure zero.
  const falloff = viewport.width * FALLOFF;
  const d = falloff > 0 ? clamp01(Math.abs(dx) / falloff) : 1;

  const t = 1 - d;
  const progress = t * t * (3 - 2 * t); // smoothstep

  const tail = clamp01((progress - INTERACTIVE_AT) / (1 - INTERACTIVE_AT));

  return {
    progress,
    width: lerp(viewport.width * RESTING_W, viewport.width, progress),
    height: lerp(viewport.height * RESTING_H, viewport.height, progress),
    radius: lerp(18, 0, progress),
    saturation: lerp(0.35, 1, progress),
    wash: tail,
    detail: tail,
    interactive: progress >= INTERACTIVE_AT,
  };
}
