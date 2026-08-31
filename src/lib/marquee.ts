export type MarqueeState = { x: number; boost: number };

export type MarqueeOpts = {
  /** Pixels per second at rest. */
  baseSpeed: number;
  direction: 1 | -1;
  /** Width of ONE copy of the track. The track is rendered twice. */
  trackWidth: number;
  /** Seconds for an added boost to decay by ~63%. */
  damping: number;
};

/**
 * Integrates one frame of marquee motion.
 *
 * Pure, so the behaviour can be tested without a browser, and frame-rate
 * independent: the decay is exp(-dt/damping) rather than a per-frame
 * multiplier, so a 30fps phone and a 120fps laptop travel the same distance
 * in the same wall-clock time.
 *
 * The boost is deliberately unclamped. Scrolling hard enough to overcome
 * baseSpeed should reverse the bar — that reversal is the effect.
 */
export function advanceMarquee(
  state: MarqueeState,
  dt: number,
  scrollVelocity: number,
  opts: MarqueeOpts,
): MarqueeState {
  const boost =
    state.boost + (scrollVelocity - state.boost) * (1 - Math.exp(-dt / opts.damping));

  const speed = opts.baseSpeed * opts.direction + boost;
  let x = state.x - speed * dt;

  // Wrap into (-trackWidth, 0] so the duplicated copy always covers the view.
  if (opts.trackWidth > 0) {
    x = (((x % opts.trackWidth) + opts.trackWidth) % opts.trackWidth) - opts.trackWidth;
    if (x <= -opts.trackWidth) x += opts.trackWidth;
  }

  return { x, boost };
}
