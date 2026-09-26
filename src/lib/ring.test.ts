import { describe, expect, it } from "vitest";
import { angularDistance, nearestSlot, ringRadius, slotAngle } from "./ring";

const TAU = Math.PI * 2;

describe("ring maths", () => {
  it("spaces slots evenly around the circle", () => {
    expect(slotAngle(0, 8)).toBeCloseTo(0, 6);
    expect(slotAngle(2, 8)).toBeCloseTo(TAU / 4, 6);
    expect(slotAngle(8, 8)).toBeCloseTo(TAU, 6);
  });

  it("finds the nearest slot", () => {
    expect(nearestSlot(0.01, 8)).toBe(0);
    expect(nearestSlot(TAU / 8 + 0.01, 8)).toBe(1);
  });

  it("wraps when finding the nearest slot", () => {
    expect(nearestSlot(TAU - 0.01, 8)).toBe(0);
    expect(nearestSlot(TAU * 3 + 0.01, 8)).toBe(0);
  });

  it("handles negative rotations", () => {
    expect(nearestSlot(-0.01, 8)).toBe(0);
    expect(nearestSlot(-TAU / 8, 8)).toBe(7);
  });

  it("measures the short way round", () => {
    expect(angularDistance(0.1, TAU - 0.1)).toBeCloseTo(0.2, 6);
    expect(angularDistance(0, Math.PI)).toBeCloseTo(Math.PI, 6);
  });

  it("never returns a distance greater than half a turn", () => {
    for (let i = 0; i < 200; i++) {
      const a = Math.random() * TAU * 4;
      const b = Math.random() * TAU * 4;
      expect(angularDistance(a, b)).toBeLessThanOrEqual(Math.PI + 1e-9);
    }
  });

  it("always returns a slot inside the ring", () => {
    for (let i = 0; i < 200; i++) {
      const slot = nearestSlot((Math.random() - 0.5) * 200, 7);
      expect(slot).toBeGreaterThanOrEqual(0);
      expect(slot).toBeLessThan(7);
      expect(Number.isInteger(slot)).toBe(true);
    }
  });
});

describe("ringRadius", () => {
  const W = 2.15;
  const chord = (n: number, r: number) => 2 * r * Math.sin(Math.PI / n);

  it("reproduces the original ten-event ring", () => {
    // 3.4 was the hand-tuned constant. The formula has to land back on it, or
    // this change silently restyles the ring at its original count.
    expect(ringRadius(10, W)).toBeCloseTo(3.4, 2);
  });

  it("keeps the gap between neighbours constant as events are added", () => {
    const gaps = [6, 10, 16, 24, 40].map((n) => chord(n, ringRadius(n, W)));
    for (const g of gaps) expect(g).toBeCloseTo(gaps[0]!, 6);
  });

  it("never lets a panel overlap its neighbour by more than a hair", () => {
    for (const n of [3, 6, 10, 16, 24, 40, 100]) {
      // Overlap is what buried 38% of each poster at sixteen events.
      expect(chord(n, ringRadius(n, W)), `n=${n}`).toBeGreaterThan(W * 0.97);
    }
  });

  it("grows with the number of events", () => {
    const radii = [6, 10, 16, 24].map((n) => ringRadius(n, W));
    for (let i = 1; i < radii.length; i++) {
      expect(radii[i]!).toBeGreaterThan(radii[i - 1]!);
    }
  });

  it("stays finite for degenerate counts", () => {
    for (const n of [0, 1, 2]) expect(Number.isFinite(ringRadius(n, W))).toBe(true);
  });
});

