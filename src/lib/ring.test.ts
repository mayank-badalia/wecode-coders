import { describe, expect, it } from "vitest";
import { angularDistance, nearestSlot, slotAngle } from "./ring";

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
