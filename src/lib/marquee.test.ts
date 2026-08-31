import { describe, expect, it } from "vitest";
import { advanceMarquee } from "./marquee";

const opts = {
  baseSpeed: 100,
  direction: 1 as const,
  trackWidth: 500,
  damping: 0.6,
};

describe("advanceMarquee", () => {
  it("moves at base speed with no scrolling", () => {
    const s = advanceMarquee({ x: 0, boost: 0 }, 1, 0, opts);
    expect(s.x).toBeCloseTo(-100, 5);
  });

  it("wraps within the track width so it never runs off", () => {
    const s = advanceMarquee({ x: -480, boost: 0 }, 1, 0, opts);
    expect(s.x).toBeGreaterThan(-500);
    expect(s.x).toBeLessThanOrEqual(0);
  });

  it("scroll velocity adds to speed", () => {
    const slow = advanceMarquee({ x: 0, boost: 0 }, 0.1, 0, opts).x;
    const fast = advanceMarquee({ x: 0, boost: 0 }, 0.1, 2000, opts).x;
    expect(Math.abs(fast)).toBeGreaterThan(Math.abs(slow));
  });

  it("boost decays back toward base when scrolling stops", () => {
    const spun = advanceMarquee({ x: 0, boost: 900 }, 0.1, 0, opts);
    expect(Math.abs(spun.boost)).toBeLessThan(900);

    let s = { x: 0, boost: 900 };
    for (let i = 0; i < 200; i++) s = advanceMarquee(s, 0.05, 0, opts);
    expect(Math.abs(s.boost)).toBeLessThan(1);
  });

  it("reverses direction when scroll velocity is strongly negative", () => {
    /*
      x is always normalised into (-trackWidth, 0], so its sign cannot show
      direction. A bar travelling forward from 0 lands a little below 0; a bar
      travelling backward from 0 wraps around to just above -trackWidth. So
      reversal shows up as reversed.x sitting below forward.x, and directly in
      the sign of the accumulated boost.
    */
    const wide = { ...opts, trackWidth: 1_000_000 };
    const forward = advanceMarquee({ x: 0, boost: 0 }, 0.1, 0, wide);
    const reversed = advanceMarquee({ x: 0, boost: 0 }, 0.1, -5000, wide);

    expect(reversed.boost).toBeLessThan(0);
    expect(reversed.boost).toBeLessThan(-opts.baseSpeed);
    expect(reversed.x).toBeLessThan(forward.x);
    expect(reversed.x).toBeGreaterThan(-wide.trackWidth);
  });

  it("is frame-rate independent", () => {
    let a = { x: 0, boost: 0 };
    for (let i = 0; i < 60; i++) a = advanceMarquee(a, 1 / 60, 0, opts);
    const b = advanceMarquee({ x: 0, boost: 0 }, 1, 0, opts);
    expect(a.x).toBeCloseTo(b.x, 1);
  });

  it("respects direction -1", () => {
    const s = advanceMarquee({ x: -250, boost: 0 }, 1, 0, { ...opts, direction: -1 });
    expect(s.x).toBeGreaterThan(-250);
  });

  it("does not divide by zero before the track has been measured", () => {
    const s = advanceMarquee({ x: 0, boost: 0 }, 0.1, 0, { ...opts, trackWidth: 0 });
    expect(Number.isFinite(s.x)).toBe(true);
  });
});
