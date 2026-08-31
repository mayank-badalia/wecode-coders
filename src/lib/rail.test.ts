import { describe, expect, it } from "vitest";
import { railMetrics } from "./rail";

const vp = { width: 1440, height: 900 };
const FALLOFF = vp.width * 0.6;

describe("railMetrics", () => {
  it("fills the viewport at dead centre", () => {
    const m = railMetrics(0, vp);
    expect(m.width).toBeCloseTo(1440, 0);
    expect(m.height).toBeCloseTo(900, 0);
    expect(m.radius).toBeCloseTo(0, 5);
    expect(m.interactive).toBe(true);
  });

  it("rests small at the falloff edge", () => {
    const m = railMetrics(FALLOFF, vp);
    expect(m.width).toBeCloseTo(vp.width * 0.46, 0);
    expect(m.height).toBeCloseTo(vp.height * 0.62, 0);
    expect(m.interactive).toBe(false);
    expect(m.wash).toBe(0);
  });

  it("is symmetric about the centre", () => {
    expect(railMetrics(300, vp)).toEqual(railMetrics(-300, vp));
  });

  it("shrinks monotonically as the card leaves the centre", () => {
    let prev = Infinity;
    for (let dx = 0; dx <= FALLOFF; dx += 60) {
      const w = railMetrics(dx, vp).width;
      expect(w).toBeLessThanOrEqual(prev + 0.001);
      prev = w;
    }
  });

  it("clamps beyond the falloff instead of inverting", () => {
    expect(railMetrics(FALLOFF * 4, vp)).toEqual(railMetrics(FALLOFF, vp));
  });

  it("only becomes interactive once it is nearly full-bleed", () => {
    expect(railMetrics(0, vp).interactive).toBe(true);
    expect(railMetrics(FALLOFF * 0.5, vp).interactive).toBe(false);
  });

  it("fades the wash and detail in together over the last tenth", () => {
    const m = railMetrics(0, vp);
    expect(m.wash).toBeCloseTo(1, 5);
    expect(m.detail).toBeCloseTo(1, 5);
  });

  it("never produces a card larger than the viewport", () => {
    for (let dx = -2000; dx <= 2000; dx += 25) {
      const m = railMetrics(dx, vp);
      expect(m.width).toBeLessThanOrEqual(vp.width + 0.001);
      expect(m.height).toBeLessThanOrEqual(vp.height + 0.001);
    }
  });

  it("keeps saturation and opacities in range", () => {
    for (let dx = -2000; dx <= 2000; dx += 25) {
      const m = railMetrics(dx, vp);
      for (const v of [m.progress, m.saturation, m.wash, m.detail]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });

  it("survives a zero-width viewport during first paint", () => {
    const m = railMetrics(0, { width: 0, height: 0 });
    expect(Number.isFinite(m.width)).toBe(true);
    expect(Number.isFinite(m.progress)).toBe(true);
  });
});
